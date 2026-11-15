"""Mirror public FH6 videos; link tunes only by explicitly labelled tuning codes.

No API key, account cookies or private channel access is used. Failed reads keep
the previous entry. The channel's most recent 30 uploads are refreshed hourly;
older entries already collected remain in the catalogue.
"""
import concurrent.futures
import datetime as dt
import json
from pathlib import Path
import re
import urllib.request

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


def fetch_video(video_id):
    html = read_url("https://www.youtube.com/watch?v=" + video_id)
    return parse_video(extract_json(html, "ytInitialPlayerResponse"), video_id)


def main():
    previous = json.loads(OUTPUT.read_text()) if OUTPUT.exists() else {}
    ids = channel_video_ids(extract_json(read_url(CHANNEL_URL + "/videos"), "ytInitialData"))
    videos = {v["id"]: v for v in previous.get("videos", [])}
    succeeded = 0
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
