import csv
import importlib
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
history_module = importlib.import_module('share_code_history')
mirror = importlib.import_module('mirror_archive')


def car(code='111111111', **changes):
    return dict({'id': 'car-A700', 'manufacturer': 'Toyota', 'carName': 'Example 2022', 'shareCode': code}, **changes)


class ShareCodeHistoryTests(unittest.TestCase):
    def test_remake_retains_both_codes_and_is_idempotent(self):
        history = {'schemaVersion': 1, 'entries': []}
        for code in ['111111111', '222222222', '333333333', '333333333']:
            history_module.observe(history, [car(code)])
        self.assertEqual(history['entries'][0]['codes'], ['111111111', '222222222', '333333333'])
        self.assertEqual(history['entries'][0]['currentCode'], '333333333')

    def test_reused_id_does_not_mix_different_cars(self):
        history = {'schemaVersion': 1, 'entries': []}
        history_module.observe(history, [car()])
        history_module.observe(history, [car('222222222', carName='Another car')])
        self.assertEqual(len(history['entries']), 2)
        self.assertEqual([e['codes'] for e in history['entries']], [['111111111'], ['222222222']])
        history_module.observe(history, [])
        self.assertEqual(len(history['entries']), 2)

    def test_names_alone_never_join_and_duplicate_ids_skip(self):
        history = {'schemaVersion': 1, 'entries': []}
        history_module.observe(history, [car(), car('222222222')])
        self.assertEqual(history['entries'], [])
        history_module.observe(history, [car(), car('222222222', id='different-id')])
        self.assertEqual(len(history['entries']), 2)

    def test_invalid_history_is_not_overwritten(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'history.json'
            path.write_text('{"schemaVersion":99,"entries":[]}')
            with self.assertRaises(ValueError):
                history_module.read_history(path)
            self.assertIn('99', path.read_text())

    def test_mirror_captures_old_code_before_overwrite_and_no_change(self):
        with tempfile.TemporaryDirectory() as directory:
            data = Path(directory)
            old = car()
            new = car('222222222')
            (data / 'cars.json').write_text(json.dumps([old]))
            stream = io.StringIO()
            writer = csv.DictWriter(stream, fieldnames=['eventTitle'] + mirror.CAR_FIELDS)
            writer.writeheader(); writer.writerow(new)
            csv_bytes = stream.getvalue().encode()
            history_path = data / 'share-code-history.json'
            with patch.multiple(mirror, DATA_DIR=data, CSV_PATH=data/'cars.csv', JSON_PATH=data/'cars.json', META_PATH=data/'archive-meta.json'), \
                 patch.object(mirror, 'download_csv', return_value=csv_bytes), \
                 patch.object(mirror, 'read_history', side_effect=lambda: history_module.read_history(history_path)), \
                 patch.object(mirror, 'write_history', side_effect=lambda h: history_module.write_history(h, history_path)):
                self.assertEqual(mirror.main(), 0)
                first = history_path.read_bytes()
                self.assertEqual(mirror.main(), 0)
                self.assertEqual(history_path.read_bytes(), first)
            history = history_module.read_history(history_path)
            self.assertEqual(history['entries'][0]['codes'], ['111111111', '222222222'])
            self.assertEqual(json.loads((data/'cars.json').read_text())[0]['shareCode'], '222222222')


if __name__ == '__main__':
    unittest.main()
