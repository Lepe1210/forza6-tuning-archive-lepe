#!/usr/bin/env python3
"""Build the public English sidecar and detect changed/untranslated source text.

No translation service or secret is required. Exact source matching deliberately
invalidates translations after meaningful Korean edits. This does NOT translate
new text automatically. Run --local-sources DIR for an offline snapshot audit.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
import csv
import hashlib
import io
import json
from pathlib import Path
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
KOREAN = re.compile(r'[가-힣ㄱ-ㅎㅏ-ㅣ]')
FIELDS = ('concept', 'summary', 'tuneNotes')


def normalize(text):
    return ' '.join(str(text).split())


def translation_map(data):
    if data.get('schemaVersion') != 1 or data.get('language') != 'en':
        raise ValueError('Unsupported translation schema')
    result = {}
    for source, translation in data['translations'].items():
        if not isinstance(translation, str) or not translation.strip():
            raise ValueError('Translation must be nonempty text')
        key = normalize(source)
        if key in result and result[key] != translation:
            raise ValueError('Conflicting translations after whitespace normalization')
        result[key] = translation
    return result


def collect(name, data):
    """Return public, display-only text references. Never inspect admin data."""
    records = []
    if name in ('cars', 'weekly', 'past'):
        groups = [(data, FIELDS)]
    elif name == 'rivals':
        if data.get('ok') is not True:
            raise ValueError('Rivals response unsuccessful')
        groups = [(data['series'], ('title', 'subtitle', 'description')),
                  (data['entries'], ('role', 'exhibitText'))]
    elif name == 'atlas':
        if data.get('schemaVersion') != 1:
            raise ValueError('Unsupported exhibition schema')
        groups = [(data['vehicles'], ('name', 'character', 'intro', 'points', 'series'))]
    else:
        raise ValueError('Unknown source')
    for rows, fields in groups:
        if not isinstance(rows, list):
            raise ValueError('Source must contain a list')
        for index, row in enumerate(rows):
            for field in fields:
                values = row.get(field, '')
                if not isinstance(values, list):
                    values = [values]
                for value in values:
                    if isinstance(value, str) and KOREAN.search(value):
                        records.append({'id': str(row.get('id') or index), 'field': field, 'source': value.strip()})
    return records


def audit(source_data, translations, previous=None):
    previous = previous or {}
    sources, pending = [], []
    for name, data in source_data.items():
        if isinstance(data, Exception):
            # An unavailable source must never be reported as fully translated.
            sources.append({'name': name, 'state': 'unavailable'})
            pending.extend(item for item in previous.get('pending', []) if item['dataset'] == name)
            continue
        records = collect(name, data)
        missing = [dict(dataset=name, **row) for row in records if normalize(row['source']) not in translations]
        digest = hashlib.sha256(json.dumps(records, ensure_ascii=False, sort_keys=True).encode()).hexdigest()
        sources.append({'name': name, 'state': 'checked', 'textFields': len(records),
                        'sourceHash': digest, 'pendingCount': len(missing)})
        pending.extend(missing)
    return {'schemaVersion': 1, 'sources': sources, 'pending': pending}


def source_url(file, constant):
    return re.search(r'const ' + constant + r' =\s*"([^"]+)"', (ROOT / file).read_text())[1]


def fetch_source(name):
    urls = {
        'cars': 'https://raw.githubusercontent.com/Lepe1210/forza6-tuning-archive-lepe/main/data/cars.json',
        'weekly': source_url('script.js', 'WEEKLY_CSV_URL'),
        'past': source_url('archive.js', 'ARCHIVE_CSV_URL'),
        'rivals': source_url('rivals.js', 'RIVALS_API_URL') + '?action=rivalDataList',
        'atlas': re.search(r"const endpoint='([^']+)'", (ROOT / 'exhibition-feed.js').read_text())[1],
    }
    request = urllib.request.Request(urls[name], headers={
        'User-Agent': 'Mozilla/5.0 FH6ArchiveTranslationAudit',
        'Referer': 'https://lepe1210.github.io/forza6-tuning-archive-lepe/'})
    try:
        with urllib.request.urlopen(request, timeout=40) as response:
            raw = response.read().decode('utf-8-sig')
        if name in ('weekly', 'past'):
            rows = list(csv.DictReader(io.StringIO(raw)))
            if not rows or not all(key in rows[0] for key in FIELDS):
                raise ValueError('Unexpected spreadsheet format')
            return rows
        return json.loads(raw)
    except Exception as error:
        return error


def write_changed(path, content):
    if not path.exists() or path.read_text() != content:
        path.write_text(content)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--local-sources', type=Path)
    args = parser.parse_args()
    data = json.loads((ROOT / 'data/content-en.json').read_text())
    translations = translation_map(data)
    write_changed(ROOT / 'content-en.js', '/* Generated by scripts/check_content_translations.py. Edit data/content-en.json. */\nwindow.ArchiveContentEnglish = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    names = ('cars', 'weekly', 'past', 'rivals', 'atlas')
    if args.local_sources:
        source_data = {name: json.loads((args.local_sources / (name + '.json')).read_text()) for name in names}
    else:
        with ThreadPoolExecutor(max_workers=5) as pool:
            source_data = dict(zip(names, pool.map(fetch_source, names)))
    status_path = ROOT / 'data/translation-status.json'
    previous = json.loads(status_path.read_text()) if status_path.exists() else None
    report = audit(source_data, translations, previous)
    write_changed(status_path, json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    for source in report['sources']:
        print(source['name'], source['state'], 'pending=' + str(source.get('pendingCount', 'unknown')))
    print('English entries:', len(translations), '| Pending fields:', len(report['pending']))
    if any(source['state'] != 'checked' for source in report['sources']):
        print('::warning::Some public sources were unavailable; their coverage is unverified.')


if __name__ == '__main__':
    main()
