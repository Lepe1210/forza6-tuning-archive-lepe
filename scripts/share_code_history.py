"""Keep tune-code lineage by stable archive ID AND vehicle identity.

Normal runs observe cars.json and the public exhibition feed. --backfill-git
recovers only confirmed historical cars.json bindings, never guesses by title.
"""
from __future__ import annotations
import argparse
from collections import Counter
import json
from pathlib import Path
import re
import subprocess
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
HISTORY_PATH = ROOT / 'data/share-code-history.json'


def normalize(value):
    return ' '.join(str(value or '').split()).casefold()


def code_of(value):
    code = re.sub(r'[\s-]', '', str(value or ''))
    return code if re.fullmatch(r'\d{9}', code) else ''


def key_of(car):
    return (str(car.get('id', '')).strip(), normalize(car.get('manufacturer')), normalize(car.get('carName')))


def read_history(path=HISTORY_PATH):
    if not path.exists():
        return {'schemaVersion': 1, 'entries': []}
    data = json.loads(path.read_text(encoding='utf-8'))
    if data.get('schemaVersion') != 1 or not isinstance(data.get('entries'), list):
        raise ValueError('Invalid code history; existing history was not replaced')
    seen = set()
    for entry in data['entries']:
        key = key_of(dict(entry, id=entry.get('carId')))
        if not all(key) or key in seen or not isinstance(entry.get('codes'), list):
            raise ValueError('Invalid or duplicate history binding')
        if not code_of(entry.get('currentCode')) or any(not code_of(c) for c in entry['codes']):
            raise ValueError('Invalid historical share code')
        if entry['currentCode'] not in entry['codes']:
            raise ValueError('Current code missing from history')
        seen.add(key)
    return data


def observe(history, cars):
    if not isinstance(cars, list):
        raise ValueError('Vehicle snapshot must be a list')
    counts = Counter(str(car.get('id', '')).strip() for car in cars)
    bindings = {key_of(dict(e, id=e['carId'])): e for e in history['entries']}
    for car in cars:
        key = key_of(car)
        code = code_of(car.get('shareCode'))
        if not all(key) or not code or counts[key[0]] != 1:
            continue  # Missing/reused IDs within one snapshot are not safe lineage.
        entry = bindings.get(key)
        if entry is None:
            entry = {'carId': key[0], 'manufacturer': str(car['manufacturer']).strip(),
                     'carName': str(car['carName']).strip(), 'currentCode': code, 'codes': []}
            history['entries'].append(entry)
            bindings[key] = entry
        if code not in entry['codes']:
            entry['codes'].append(code)
        entry['currentCode'] = code
    return history


def write_history(history, path=HISTORY_PATH):
    history['entries'].sort(key=lambda e: key_of(dict(e, id=e['carId'])))
    content = json.dumps(history, ensure_ascii=False, indent=2) + '\n'
    if not path.exists() or path.read_text(encoding='utf-8') != content:
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_suffix('.json.tmp')
        temporary.write_text(content, encoding='utf-8')
        temporary.replace(path)


def backfill_git(history):
    commits = subprocess.check_output(['git', 'log', '--reverse', '--format=%H', '--', 'data/cars.json'], cwd=ROOT, text=True).splitlines()
    for commit in commits:
        raw = subprocess.check_output(['git', 'show', commit + ':data/cars.json'], cwd=ROOT, text=True)
        observe(history, json.loads(raw))
    print('Recovered archive snapshots:', len(commits))


def exhibition_cars():
    source = (ROOT / 'exhibition-feed.js').read_text(encoding='utf-8')
    endpoint = re.search(r"const endpoint='([^']+)'", source)[1]
    request = urllib.request.Request(endpoint, headers={'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://lepe1210.github.io/forza6-tuning-archive-lepe/'})
    with urllib.request.urlopen(request, timeout=30) as response:
        data = json.load(response)
    if data.get('schemaVersion') != 1 or not isinstance(data.get('vehicles'), list):
        raise ValueError('Invalid exhibition feed')
    return [{'id': 'atlas:' + str(car.get('id', '')), 'manufacturer': '수도고 복각',
             'carName': car.get('name', ''), 'shareCode': car.get('shareCode', '')} for car in data['vehicles']]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--backfill-git', action='store_true')
    args = parser.parse_args()
    history = read_history()
    if args.backfill_git:
        backfill_git(history)
    observe(history, json.loads((ROOT / 'data/cars.json').read_text(encoding='utf-8')))
    try:
        observe(history, exhibition_cars())
    except Exception as error:
        # Never wipe exhibition history after a transient public-feed outage.
        print('::warning::Exhibition code history not refreshed:', type(error).__name__)
    write_history(history)
    print('Stored tune identities:', len(history['entries']), '| Identities with multiple codes:',
          sum(len(e['codes']) > 1 for e in history['entries']))


if __name__ == '__main__':
    main()
