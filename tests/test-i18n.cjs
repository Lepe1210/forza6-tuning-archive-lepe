const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const i18n = require('../i18n.js');
const t = value => i18n.t(value, 'en');

assert.equal(t('클래식 머슬'), 'Classic Muscle');
assert.equal(t('레트로 머슬'), 'Retro Muscle');
assert.equal(t('모던 머슬'), 'Modern Muscle');
assert.equal(t('대중 국산차'), 'Eclectic Domestics');
assert.equal(t('4WD'), 'AWD');
assert.equal(t('희귀 클래식'), 'Rare Classics');
assert.equal(t('픽업 및 4*4'), "Pickups & 4x4's");
assert.equal(t('클래식 머슬 외 2개'), 'Classic Muscle +2 more');
assert.equal(t('차량 분류: 클래식 머슬, 레트로 머슬'), 'Car type: Classic Muscle, Retro Muscle');
assert.equal(t('연대: 60년대, 70년대'), 'Decade: 1960s, 1970s');
assert.equal(t('340대 중 31–60 표시'), 'Showing 31–60 of 340 tunes');
assert.equal(t('1위'), '#1');
assert.equal(t('평균 대비 -2.534%'), 'vs. average -2.534%');
assert.equal(t('S1 800 평균 · 96대'), 'S1 800 average · 96 cars');
assert.equal(t('공유 코드: 123456789'), 'Share code: 123456789');
assert.equal(t('5개 전시관 · 20대의 라이벌 차량을 전시 중입니다.'), '5 exhibitions · 20 rival cars on display.');
assert.equal(t('Jaguar XJ220S · S1 800 · 한·영 CC'), 'Jaguar XJ220S · S1 800 · Korean / English CC');
assert.equal(i18n.t('코드 복사', 'ko'), '코드 복사');
assert.equal(i18n.t('Copy code', 'ko'), '코드 복사');
assert.equal(t('112 867 646'), '112 867 646');
assert.equal(t('XJ220S TWR 1993'), 'XJ220S TWR 1993');
assert.equal(t('리어 안정성을 위해 다운포스를 높임'), '리어 안정성을 위해 다운포스를 높임');
assert.equal(t('<img src=x onerror=alert(1)>'), '<img src=x onerror=alert(1)>');
const car = {carType:'모던 머슬', category:'온로드', drive:'4WD', shareCode:'112867646'};
const before = JSON.stringify(car);
assert.match(i18n.searchTerms(car), /Modern Muscle Road AWD all-wheel drive/);
assert.equal(JSON.stringify(car), before);
const root = path.join(__dirname, '..');
for (const page of ['index','archive','gallery','rivals','guide','discord']) {
  const html = fs.readFileSync(path.join(root, page + '.html'), 'utf8');
  assert.ok(html.indexOf('src="i18n.js?') < html.indexOf('src="redesign.js?'), page);
  assert.equal((html.match(/data-cf-beacon=/g) || []).length, 1, page);
}
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(home, /value="클래식 머슬"/);
assert.match(home, /value="레트로 머슬"/);
assert.match(home, /value="모던 머슬"/);
console.log('PASS: English labels, exact categories, dynamic counts, reverse labels, original notes/data, search aliases and six-page wiring');

assert.equal(i18n.contentTranslation('그냥 좋음'), 'Just good.');
assert.equal(i18n.contentTranslation('그냥 좋음 / 새 원문'), undefined);
assert.match(i18n.searchTerms({concept:'그냥 좋음'}), /Just good/);
assert.match(t('엔진 고증에 대한 정확한 정보가 그 어디에도 찾을 수가 없어서 임의로 450마력 세팅\n싱글 터보 사양 반영완료'), /recreation choice, not a confirmed figure.*\nSingle-turbo/s);
for (const page of ['index','archive','gallery','rivals','guide','discord']) {
  const html = fs.readFileSync(path.join(root, page + '.html'), 'utf8');
  assert.ok(html.indexOf('src="content-en.js?') < html.indexOf('src="i18n.js?'), page);
}
console.log('PASS: content source matching, stale-source fallback, English note search and source uncertainty retained');
