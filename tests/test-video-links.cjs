const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../video-links.js'), 'utf8');
class Element {
  constructor(tag) { this.tag = tag; this.children = []; this.hidden = false; this.isConnected = true; }
  setAttribute(name, value) { (this.attributes ||= {})[name] = value; }
  append(...items) { this.children.push(...items); }
  replaceChildren(...items) { this.children = items; }
}
const catalogue = {schemaVersion: 1, channelId: 'UCKYhJ5TvLEwq-uDHBHflLgQ', videos: [
  {id: 'abcdefghijk', title: '<img onerror=alert(1)>', shareCodes: ['123456789'], carLabel: 'Car', hasBilingualCC: true},
  {id: '../bad-link', title: 'Invalid', shareCodes: ['123456789']},
  {id: '123456789ab', title: 'Other tune', shareCodes: ['987654321']}
]};
function environment(fetch) {
  const window = {};
  vm.runInNewContext(source, {window, fetch, AbortController, setTimeout, clearTimeout,
    console: {warn() {}}, document: {getElementById: () => null, createElement: tag => new Element(tag)}});
  return window.ArchiveVideos;
}
(async () => {
  let calls = 0;
  const api = environment(async () => { calls++; return {ok: true, json: async () => catalogue}; });
  const matching = new Element('div');
  await api.mount('123 456 789', matching);
  assert.equal(matching.hidden, false);
  const cards = matching.children[0].children[1].children;
  assert.equal(cards.length, 1);
  assert.equal(cards[0].href, 'https://www.youtube.com/watch?v=abcdefghijk');
  assert.equal(cards[0].children[1].children[0].textContent, '<img onerror=alert(1)>');
  const otherTune = new Element('div');
  await api.mount('111111111', otherTune);
  assert.equal(otherTune.hidden, true);
  assert.equal(otherTune.children.length, 0);
  await api.mount('', new Element('div'));
  assert.equal(calls, 1);
  let attempts = 0;
  const fallback = environment(async () => {
    attempts++;
    if (attempts === 1) throw new Error('raw unavailable');
    return {ok: true, json: async () => catalogue};
  });
  const offline = new Element('div');
  await fallback.mount('987654321', offline);
  assert.equal(attempts, 2);
  assert.equal(offline.hidden, false);
  let finish;
  const slow = environment(() => new Promise(resolve => { finish = resolve; }));
  const stale = new Element('div');
  const pending = slow.mount('123456789', stale);
  stale.isConnected = false;
  finish({ok: true, json: async () => catalogue});
  await pending;
  assert.equal(stale.children.length, 0);
  console.log('PASS: exact code, safe links/text, missing matches, shared fetch, fallback and closed-modal race');
})().catch(error => { console.error(error); process.exitCode = 1; });
