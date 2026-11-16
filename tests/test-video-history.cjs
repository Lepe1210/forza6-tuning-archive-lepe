const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../video-links.js'), 'utf8');
class Element {
  constructor(tag) { this.tag = tag; this.children = []; this.hidden = false; this.isConnected = true; }
  append(...items) { this.children.push(...items); }
  replaceChildren(...items) { this.children = items; }
  setAttribute(name, value) { (this.attributes ||= {})[name] = value; }
}
const car = {id:'car-A700',manufacturer:'Toyota',carName:'Example 2022',shareCode:'222222222'};
const binding = {carId:car.id,manufacturer:car.manufacturer,carName:car.carName,currentCode:car.shareCode,codes:['111111111','222222222']};
const video = (id, shareCodes) => ({id,title:'Video '+id,shareCodes});
const catalogue = {schemaVersion:1,channelId:'UCKYhJ5TvLEwq-uDHBHflLgQ',videos:[video('current0001',['222222222']),video('previous001',['111111111']),video('unrelated01',['999999999'])]};
function environment(entries=[binding], options={}) {
  const window={}; const calls=[];
  vm.runInNewContext(source,{window,AbortController,setTimeout,clearTimeout,console:{warn(){}},
    document:{getElementById:()=>null,createElement:tag=>new Element(tag)},
    fetch:async url=>{calls.push(url);return {ok: !options.noHistory || !url.includes('share-code-history'),json:async()=>url.includes('share-code-history')?{schemaVersion:1,entries}:catalogue};}});
  return {api:window.ArchiveVideos,calls};
}
const text = el => [el.textContent||'',...el.children.map(text)].join(' ');
const links = el => [...(el.href?[el.href]:[]),...el.children.flatMap(links)];
(async()=>{
  const env=environment(), target=new Element('div');
  await env.api.mount(car,target);
  assert.deepEqual(links(target),['https://www.youtube.com/watch?v=current0001','https://www.youtube.com/watch?v=previous001']);
  assert.match(text(target),/리메이크 이전 튜닝 영상/);assert.match(text(target),/성능·거동과 다를 수/);
  // A second remake from live Sheets arrives before the history mirror update.
  const ahead=new Element('div');await env.api.mount({...car,shareCode:'333333333'},ahead);
  assert.equal(links(ahead).length,2);assert.match(text(ahead),/리메이크 이전/);
  // Past-season details must not mislabel a later tune as an older one.
  const archived=new Element('div');await env.api.mount({...car,shareCode:'111111111'},archived);
  assert.deepEqual(links(archived),['https://www.youtube.com/watch?v=previous001']);assert.doesNotMatch(text(archived),/리메이크 이전/);
  for(const mismatch of [{carName:'Different car'},{manufacturer:'Ford'},{id:'other-id'}]){
    const t=new Element('div');await env.api.mount({...car,...mismatch},t);
    assert.deepEqual(links(t),['https://www.youtube.com/watch?v=current0001']);
  }
  // Shared/ambiguous legacy code ownership is never inferred.
  const ambiguous=environment([binding,{...binding,carId:'other-id'}]);const a=new Element('div');await ambiguous.api.mount(car,a);
  assert.equal(links(a).length,1);
  // History outages retain exact-code video matches.
  const offline=environment([], {noHistory:true}), o=new Element('div');await offline.api.mount(car,o);assert.equal(links(o).length,1);
  // Both mounts share the same requests, and a reused target belongs to its latest invocation.
  const reused=new Element('div');await Promise.all([env.api.mount(car,reused),env.api.mount({...car,id:'other-id',shareCode:'999999999'},reused)]);
  assert.deepEqual(links(reused),['https://www.youtube.com/watch?v=unrelated01']);
  assert.equal(env.calls.length,2);
  console.log('PASS: remakes, earlier-version labels, mirror lag, archived versions, stable identity, ambiguity, history failure and reused-target race');
})().catch(error=>{console.error(error);process.exitCode=1;});
