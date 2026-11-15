import importlib.util
import json
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("mirror_youtube", Path(__file__).resolve().parents[1] / "scripts/mirror_youtube.py")
mirror = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mirror)


class YouTubeMirrorTests(unittest.TestCase):
    def video(self, description):
        return {"videoDetails": {"videoId": "abcdefghijk", "channelId": mirror.CHANNEL_ID,
                "title": "FH6 [한/영 CC]", "shortDescription": description, "isCrawlable": True},
                "microformat": {"playerMicroformatRenderer": {"publishDate": "2026-11-14T19:00:00-08:00"}}}

    def test_tune_and_map_codes_are_separate(self):
        video = mirror.parse_video(self.video("차량: Jaguar XJ220\n튜닝 공유코드: 112 867 646\n이벤트맵 공유코드: 802 790 898"), "abcdefghijk")
        self.assertEqual(video["shareCodes"], ["112867646"])
        self.assertEqual(video["publishedAt"], "2026-11-15T03:00:00Z")
        self.assertTrue(video["hasBilingualCC"])

    def test_no_guessing_from_car_names_or_unlabelled_numbers(self):
        self.assertEqual(mirror.parse_video(self.video("Car: BMW M3\n156470517\n이벤트맵 공유코드: 802 790 898"), "abcdefghijk")["shareCodes"], [])

    def test_formats_and_invalid_length(self):
        self.assertEqual(mirror.parse_video(self.video("Tuning share code: 123-456-789\n튜닝 코드: 1234567890"), "abcdefghijk")["shareCodes"], ["123456789"])

    def test_other_channel_is_rejected(self):
        video = self.video("튜닝 공유코드: 112867646")
        video["videoDetails"]["channelId"] = "another-channel"
        with self.assertRaises(ValueError):
            mirror.parse_video(video, "abcdefghijk")

    def test_private_and_unavailable_video(self):
        data = self.video("")
        data["videoDetails"]["isPrivate"] = True
        self.assertIsNone(mirror.parse_video(data, "abcdefghijk"))
        with self.assertRaises(ValueError):
            mirror.parse_video({}, "abcdefghijk")

    def test_channel_layouts_and_deduplication(self):
        data = {"metadata": {"channelMetadataRenderer": {"externalId": mirror.CHANNEL_ID}},
                "contents": [{"lockupViewModel": {"contentId": "abcdefghijk", "metadata": {"lockupMetadataViewModel": {"title": {"content": "[Forza Horizon 6] Test"}}}}},
                             {"videoRenderer": {"videoId": "abcdefghijk", "title": {"runs": [{"text": "[Forza Horizon 6] Test"}]}}},
                             {"videoRenderer": {"videoId": "123456789ab", "title": {"runs": [{"text": "Another game"}]}}}]}
        self.assertEqual(mirror.channel_video_ids(data), ["abcdefghijk"])
        with self.assertRaises(ValueError):
            mirror.channel_video_ids({})

    def test_embedded_json_does_not_stop_at_nested_braces(self):
        self.assertEqual(mirror.extract_json('var ytInitialData = {"a":{"b":"};"}};</script>', "ytInitialData"), {"a": {"b": "};"}})

    def test_public_description_without_playback_metadata(self):
        page = {"contents": [
            {"videoPrimaryInfoRenderer": {"title": {"runs": [{"text": "FH6"}]}}},
            {"videoSecondaryInfoRenderer": {"owner": {"videoOwnerRenderer": {"navigationEndpoint": {"browseEndpoint": {"browseId": mirror.CHANNEL_ID}}}},
             "attributedDescription": {"content": "튜닝 공유코드: 112 867 646\n이벤트맵 공유코드: 802 790 898"}}}]}
        html = '<link rel="canonical" href="https://www.youtube.com/watch?v=abcdefghijk"><meta itemprop="datePublished" content="2026-11-14">'
        html += "var ytInitialData = " + json.dumps(page) + ";"
        self.assertEqual(mirror.parse_public_page(html, "abcdefghijk")["shareCodes"], ["112867646"])
        self.assertEqual(mirror.parse_public_page(html.replace("watch?v=abcdefghijk", "watch?v=abcdefghijk&amp;hl=en"), "abcdefghijk")["shareCodes"], ["112867646"])
        with self.assertRaises(ValueError):
            mirror.parse_public_page(html, "another1234")


if __name__ == "__main__":
    unittest.main()
