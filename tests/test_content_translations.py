import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('content_audit', ROOT / 'scripts/check_content_translations.py')
audit_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit_module)


class ContentTranslationTests(unittest.TestCase):
    def test_source_edit_invalidates_old_translation(self):
        old = '뒤쪽 미끄러짐은 엑셀 컨트롤로 잡아야함'
        translations = {old: 'Rear sliding needs throttle control.'}
        source = {'cars': [{'id': 'car', 'summary': old}]}
        self.assertEqual(audit_module.audit(source, translations)['pending'], [])
        source['cars'][0]['summary'] = old + ' / 젖은 노면 주의'
        pending = audit_module.audit(source, translations)['pending']
        self.assertEqual(len(pending), 1)
        self.assertEqual(pending[0]['id'], 'car')
        self.assertIn('젖은 노면', pending[0]['source'])

    def test_unavailable_source_is_not_clean(self):
        previous = {'pending': [{'dataset': 'atlas', 'id': 'a', 'field': 'intro', 'source': '새 설명'}]}
        result = audit_module.audit({'atlas': TimeoutError()}, {}, previous)
        self.assertEqual(result['sources'][0]['state'], 'unavailable')
        self.assertEqual(result['pending'], previous['pending'])

    def test_multiline_and_whitespace(self):
        data = {'schemaVersion': 1, 'language': 'en', 'translations': {'설명\n메모': 'A\nB'}}
        translations = audit_module.translation_map(data)
        self.assertEqual(translations['설명 메모'], 'A\nB')
        with self.assertRaises(ValueError):
            audit_module.translation_map(dict(data, translations={'설명\n메모':'A','설명 메모':'B'}))

    def test_current_cars_covered_and_unchanged(self):
        cars = json.loads((ROOT / 'data/cars.json').read_text())
        before = json.dumps(cars, ensure_ascii=False)
        translations = audit_module.translation_map(json.loads((ROOT / 'data/content-en.json').read_text()))
        self.assertEqual(audit_module.audit({'cars': cars}, translations)['pending'], [])
        self.assertEqual(json.dumps(cars, ensure_ascii=False), before)
        self.assertFalse(any(audit_module.KOREAN.search(v) for v in translations.values()))

    def test_exhibition_roles_and_names(self):
        records = audit_module.collect('atlas', {'schemaVersion': 1, 'vehicles': [
            {'id': 'a', 'name': '차량 이름', 'character': '캐릭터', 'intro': '설명', 'points': '메모',
             'series': ['완간 미드나이트', 'C1 러너'], 'shareCode': '123456789'}]})
        self.assertEqual(len(records), 6)
        self.assertNotIn('shareCode', {row['field'] for row in records})

    def test_nonempty_translation_required(self):
        with self.assertRaises(ValueError):
            audit_module.translation_map({'schemaVersion': 1, 'language': 'en', 'translations': {'원문': ''}})


if __name__ == '__main__':
    unittest.main()
