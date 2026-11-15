"""Mirror public FH6 videos; link tunes only by explicitly labelled tuning codes.

No API key, account cookies or private channel access is used. Failed reads keep
the previous entry. The channel's most recent 30 uploads are refreshed hourly;
older entries already collected remain in the catalogue.
"""
import concurrent.futures
import datetime as dt
import json
from html.parser import HTMLParser
from pathlib import Path
import re
import urllib.request
from urllib.parse import urlparse, parse_qs
import xml.etree.ElementTree as ET

CHANNEL_ID = "UCKYhJ5TvLEwq-uDHBHflLgQ"
CHANNEL_URL = "https://www.youtube.com/@ko_tbclan"
OUTPUT = Path(__file__).resolve().parents[1] / "data" / "videos.json"
VIDEO_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
TUNE_CODE = re.compile(
    r"(?:튜닝\s*(?:공유\s*)?코드|tuning\s*(?:share\s*)?code|tune\s*share\s*code)"
    r"\s*[:：#]?\s*(\d{3}[ \t-]?\d{3}[ \t-]?\d{3})(?!\d)", re.I
)


def read_url(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8")


def extract_json(html, variable):
    match = re.search(r"(?:var\s+)?" + re.escape(variable) + r"\s*=\s*", html)
    if not match:
        raise ValueError(f"Missing {variable}")
    return json.JSONDecoder().raw_decode(html[match.end():])[0]


def walk(value):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from walk(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk(child)


def channel_video_ids(data):
    meta = data.get("metadata", {}).get("channelMetadataRenderer", {})
    if meta.get("externalId") != CHANNEL_ID:
        raise ValueError("Unexpected YouTube channel; catalogue was not changed")
    result = []
    for node in walk(data):
        if "lockupViewModel" in node:
            view = node["lockupViewModel"]
            video_id = view.get("contentId", "")
            title = view.get("metadata", {}).get("lockupMetadataViewModel", {}).get("title", {}).get("content", "")
        elif "videoRenderer" in node:
            view = node["videoRenderer"]
            video_id = view.get("videoId", "")
            title = "".join(r.get("text", "") for r in view.get("title", {}).get("runs", []))
        else:
            continue
        if VIDEO_ID.fullmatch(video_id) and re.search(r"Forza\s*Horizon\s*6|포르자\s*호라이즌\s*6", title, re.I):
            if video_id not in result:
                result.append(video_id)
    if not result:
        raise ValueError("No public FH6 uploads found; previous catalogue kept")
    return result[:30]


def parse_video(data, video_id):
    details = data.get("videoDetails", {})
    if not details:
        raise ValueError("Public video details unavailable")
    if details.get("channelId") != CHANNEL_ID or details.get("videoId") != video_id:
        raise ValueError("Unexpected video owner or ID")
    if details.get("isPrivate") or not details.get("isCrawlable"):
        return None
    description = details.get("shortDescription", "")
    title = str(details.get("title", ""))[:500]
    codes = sorted({re.sub(r"\D", "", m.group(1)) for m in TUNE_CODE.finditer(description)})
    micro = data.get("microformat", {}).get("playerMicroformatRenderer", {})
    published = micro.get("publishDate", "")
    if not published:
        raise ValueError("Missing public publication date")
    # Normalize offsets so catalogue ordering stays chronological.
    published = dt.datetime.fromisoformat(published.replace("Z", "+00:00"))
    if published.tzinfo is None:
        published = published.replace(tzinfo=dt.timezone.utc)
    published = published.astimezone(dt.timezone.utc).isoformat().replace("+00:00", "Z")
    def label(pattern):
        match = re.search(pattern, description, re.M | re.I)
        return match.group(1).strip()[:200] if match else ""
    return {
        "id": video_id, "title": title, "publishedAt": published,
        "shareCodes": codes,
        "carLabel": label(r"^(?:차량|Car)\s*[:：]\s*(.+)$"),
        "classLabel": label(r"^(?:클래스|Class)\s*[:：]\s*(.+)$"),
        "hasBilingualCC": bool(re.search(r"한\s*/\s*영\s*CC", title)),
    }


class PublicMeta(HTMLParser):
    def __init__(self):
        super().__init__()
        self.values = {}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta":
            self.values[attrs.get("itemprop") or attrs.get("property") or attrs.get("name")] = attrs.get("content", "")
        elif tag == "link" and attrs.get("rel") == "canonical":
            self.values["canonical"] = attrs.get("href", "")


def parse_public_page(html, video_id):
    # Video playback can be unavailable on a server while the public title,
    # description and owner are still present in the normal watch-page HTML.
    page = extract_json(html, "ytInitialData")
    secondary = next((n["videoSecondaryInfoRenderer"] for n in walk(page) if "videoSecondaryInfoRenderer" in n), {})
    primary = next((n["videoPrimaryInfoRenderer"] for n in walk(page) if "videoPrimaryInfoRenderer" in n), {})
    owner = secondary.get("owner", {}).get("videoOwnerRenderer", {}).get("navigationEndpoint", {}).get("browseEndpoint", {}).get("browseId")
    description = secondary.get("attributedDescription", {}).get("content")
    if description is None:
        description = "".join(v.get("text", "") for v in secondary.get("description", {}).get("runs", []))
    if not primary or not secondary or owner != CHANNEL_ID:
        raise ValueError("Public watch-page metadata unavailable or owner mismatch")
    meta = PublicMeta()
    meta.feed(html)
    canonical = urlparse(meta.values.get("canonical", ""))
    if canonical.hostname != "www.youtube.com" or canonical.path != "/watch" or parse_qs(canonical.query).get("v") != [video_id]:
        raise ValueError(f"Public watch-page ID mismatch: requested {video_id}, canonical {meta.values.get('canonical', '')}")
    # A collapsed description may omit later tuning codes. Do not erase a
    # previously verified match using such a fragment.
    if description.rstrip().endswith(("...", "…")) and not TUNE_CODE.search(description):
        raise ValueError("Only a shortened description is available")
    title = "".join(v.get("text", "") for v in primary.get("title", {}).get("runs", []))
    data = {"videoDetails": {"videoId": video_id, "channelId": owner, "title": title,
            "shortDescription": description, "isCrawlable": True},
            "microformat": {"playerMicroformatRenderer": {"publishDate": meta.values.get("datePublished", "")}}}
    return parse_video(data, video_id)


def fetch_video(video_id):
    html = read_url("https://www.youtube.com/watch?v=" + video_id)
    try:
        player = extract_json(html, "ytInitialPlayerResponse")
    except ValueError:
        player = {}
    if player.get("videoDetails"):
        return parse_video(player, video_id)
    return parse_public_page(html, video_id)


def parse_feed(xml):
    ns = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015", "m": "http://search.yahoo.com/mrss/"}
    feed = ET.fromstring(xml)
    if feed.findtext("yt:channelId", namespaces=ns) != CHANNEL_ID:
        raise ValueError("Unexpected feed channel")
    entries = []
    for entry in feed.findall("a:entry", ns):
        title = entry.findtext("a:title", "", ns)
        video_id = entry.findtext("yt:videoId", "", ns)
        if not VIDEO_ID.fullmatch(video_id) or not re.search(r"Forza\s*Horizon\s*6|포르자\s*호라이즌\s*6", title, re.I):
            continue
        description = entry.findtext("m:group/m:description", None, ns)
        if description is None:
            raise ValueError("Feed descriptions unavailable")
        data = {"videoDetails": {"videoId": video_id, "channelId": CHANNEL_ID, "title": title,
                "shortDescription": description, "isCrawlable": True},
                "microformat": {"playerMicroformatRenderer": {"publishDate": entry.findtext("a:published", "", ns)}}}
        entries.append(parse_video(data, video_id))
    if not entries:
        raise ValueError("No public FH6 feed entries")
    return entries


def main():
    previous = json.loads(OUTPUT.read_text()) if OUTPUT.exists() else {}
    videos = {v["id"]: v for v in previous.get("videos", [])}
    succeeded = 0
    try:
        entries = parse_feed(read_url("https://www.youtube.com/feeds/videos.xml?channel_id=" + CHANNEL_ID))
        videos.update({v["id"]: v for v in entries})
        succeeded = len(entries)
        print(f"Read {succeeded} public FH6 entries from channel feed")
    except Exception as error:
        print(f"Channel feed unavailable ({error}); checking public channel page")
        ids = channel_video_ids(extract_json(read_url(CHANNEL_URL + "/videos"), "ytInitialData"))
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            jobs = {pool.submit(fetch_video, video_id): video_id for video_id in ids}
            for job in concurrent.futures.as_completed(jobs):
                video_id = jobs[job]
                try:
                    entry = job.result()
                    succeeded += 1
                    if entry is None:
                        videos.pop(video_id, None)
                    else:
                        videos[video_id] = entry
                except Exception as error:
                    print(f"Warning: {video_id}: {error}; previous entry kept")
    if not succeeded:
        raise RuntimeError("All YouTube reads failed; previous catalogue kept")
    ordered = sorted(videos.values(), key=lambda v: (v["publishedAt"], v["id"]), reverse=True)
    payload = {"schemaVersion": 1, "channelId": CHANNEL_ID, "channelUrl": CHANNEL_URL,
               "channelTitle": "KO_TB Clan", "videos": ordered}
    comparable = {k: v for k, v in previous.items() if k != "updatedAt"}
    if payload == comparable:
        print("Video catalogue unchanged")
        return
    payload["updatedAt"] = dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Saved {len(ordered)} FH6 videos; {sum(bool(v['shareCodes']) for v in ordered)} with tuning codes")


if __name__ == "__main__":
    main()
