/* Vehicle inventory shares authenticated memo storage; never publishes tunes. */
let inventoryReady = false;
let inventoryBusy = false;
let inventoryEditId = null;
let inventoryEditDraft = null;
let inventoryBulkDrafts = [];
const inventoryUI = Object.fromEntries(['inventoryAddForm','inventoryName','inventoryTime','inventoryTrack','inventoryNotes','inventoryAddButton','inventoryMessage','inventoryBulkText','inventoryBulkPreview','inventoryBulkTrack','inventoryBulkRows','inventoryBulkSave','inventoryBulkMessage','inventoryCount','inventorySearch','inventoryTrackFilter','inventorySort','inventoryReload','inventoryList'].map(id=>[id,document.getElementById(id)]));
const inventorySignature = v => JSON.stringify([v.name.trim(),v.time.trim(),v.notes.trim(),v.track||'']);
function normalizeInventoryValues(v) {
  const row = {name:String(v.name||'').trim(),time:String(v.time||'').trim(),notes:String(v.notes||'').trim(),track:v.track||''};
  if(!['','road','dirt'].includes(row.track))throw Error('코스 구분을 선택해주세요.');
  if(!row.name)throw Error('차량명을 입력해주세요.');
  if(row.name.length>200||row.time.length>40||row.notes.length>1000)throw Error('차량명 200자, 기록 40자, 메모 1000자 이내로 적어주세요.');
  return row;
}
function inventoryTimeValue(value) {
  const m=String(value).trim().match(/^(\d+):([0-5]\d)(?:\.(\d{1,3}))?$/);
  return m?Number(m[1])*60000+Number(m[2])*1000+Number((m[3]||'').padEnd(3,'0')):Infinity;
}
const inventoryTrackLabels = {'':'미지정',road:'레전드 아일랜드 · 온로드',dirt:'세키배 · 오프로드'};
function inventoryTrackOptions(value='') {return Object.entries(inventoryTrackLabels).map(([k,label])=>`<option value="${k}" ${k===value?'selected':''}>${label}</option>`).join('');}
function parseInventoryLines(text,track='') {
  return text.replace(/\s+\/\s+(?=[^/\n]*\d+:[0-5]\d(?:\.\d{1,3})?)/g,'\n').split(/\r?\n/).map(line=>line.trim().replace(/\s*\/\s*$/,'').trim()).filter(Boolean).map(line=>{
    const m=line.match(/^(.*?)\s+(\d+:[0-5]\d(?:\.\d{1,3})?)(.*)$/);
    if(!m)return {name:line,time:'',notes:'',track};
    let notes=m[3].trim();if(notes.startsWith('(')&&notes.endsWith(')'))notes=notes.slice(1,-1).trim();
    return {name:m[1].trim(),time:m[2],notes,track};
  });
}
function inventoryMessage(text) {inventoryUI.inventoryMessage.textContent=text;}
function setInventoryBusy(busy) {
  inventoryBusy=busy;
  inventoryUI.inventoryAddButton.disabled=busy||!inventoryReady;
  inventoryUI.inventoryBulkSave.disabled=busy||!inventoryReady;
  inventoryUI.inventoryBulkPreview.disabled=busy;
  inventoryUI.inventoryReload.disabled=busy;
  inventoryUI.inventoryList.querySelectorAll('button').forEach(b=>b.disabled=busy||!inventoryReady);
  inventoryUI.inventoryAddForm.querySelectorAll('input, select').forEach(e=>e.disabled=busy||!inventoryReady);
  inventoryUI.inventoryList.querySelectorAll('input, select').forEach(e=>e.disabled=busy||!inventoryReady);
  inventoryUI.inventoryBulkRows.querySelectorAll('input, select').forEach(e=>e.disabled=busy);
  inventoryUI.inventoryBulkText.disabled=busy;
}
function inventoryRowHTML(row) {
  const id=escapeAttribute(row.id);
  if(inventoryEditId===row.id){const v=inventoryEditDraft;return `<article class="inventory-row inventory-row-edit"><label>차량명·버전<input data-inventory-edit="name" maxlength="200" value="${escapeAttribute(v.name)}"></label><label>기록<input data-inventory-edit="time" maxlength="40" value="${escapeAttribute(v.time)}"></label><label>코스<select data-inventory-edit="track">${inventoryTrackOptions(v.track)}</select></label><label>메모<input data-inventory-edit="notes" maxlength="1000" value="${escapeAttribute(v.notes)}"></label><div class="inventory-row-actions"><button type="button" class="daily-tune-action-button" data-inventory-save="${id}">저장</button><button type="button" class="daily-tune-action-button" data-inventory-cancel>취소</button></div></article>`;}
  return `<article class="inventory-row"><span class="inventory-row-name">${escapeHTML(row.name)}</span><span class="inventory-row-time">${escapeHTML(row.time||'—')}</span><span class="inventory-row-track">${inventoryTrackLabels[row.track||'']||'미지정'}</span><span class="inventory-row-note">${escapeHTML(row.notes||'')}</span><div class="inventory-row-actions"><button type="button" class="daily-tune-action-button" data-inventory-start="${id}" aria-label="${escapeAttribute(row.name)} 수정">수정</button><button type="button" class="daily-tune-action-button danger" data-inventory-delete="${id}" aria-label="${escapeAttribute(row.name)} 삭제">삭제</button></div></article>`;
}
function renderInventoryRows() {
  const query=inventoryUI.inventorySearch.value.trim().toLocaleLowerCase();
  const trackFilter=inventoryUI.inventoryTrackFilter.value;
  const rows=inventoryMemos.filter(v=>(!trackFilter||(v.track||'')===(trackFilter==='unset'?'':trackFilter))).filter(v=>`${v.name} ${v.time} ${v.notes} ${inventoryTrackLabels[v.track||'']}`.toLocaleLowerCase().includes(query)).slice();
  const sort=inventoryUI.inventorySort.value;
  if(sort==='name')rows.sort((a,b)=>a.name.localeCompare(b.name,'ko'));
  if(sort==='time')rows.sort((a,b)=>inventoryTimeValue(a.time)-inventoryTimeValue(b.time));
  inventoryUI.inventoryCount.textContent=(query||trackFilter)?`${rows.length}대 / 전체 ${inventoryMemos.length}대`:`${inventoryMemos.length}대 저장됨`;
  inventoryUI.inventoryList.innerHTML=rows.length?rows.map(inventoryRowHTML).join(''):`<p class="inventory-empty">${query?'검색 결과가 없습니다.':inventoryReady?'아직 등록한 차량이 없습니다. 차량명만 적어도 추가할 수 있어요.':'서버 연결을 확인하는 중입니다.'}</p>`;
  setInventoryBusy(inventoryBusy);
}
window.renderTuningInventory = function(ready) {
  inventoryReady=ready===true;
  renderInventoryRows();
  if(ready===false)inventoryMessage('목록을 불러오지 못했어요. 새로고침으로 다시 연결해주세요.');
  else if(ready===true&&!inventoryBusy)inventoryMessage('서버에 저장된 재고 목록입니다. 차량명만 적어도 추가할 수 있어요.');
};
async function writeInventoryRecord(row,id='') {
  const v=normalizeInventoryValues(row);
  await callManagerMemoApi({action:id?'update':'add',id,title:v.name,body:JSON.stringify({kind:'tuning-inventory',version:1,...v}),tag:TUNING_INVENTORY_TAG,source:'manager'});
}
async function addInventoryRecord(event) {
  event.preventDefault();if(!inventoryReady||inventoryBusy)return;
  let v;try{v=normalizeInventoryValues({name:inventoryUI.inventoryName.value,time:inventoryUI.inventoryTime.value,notes:inventoryUI.inventoryNotes.value,track:inventoryUI.inventoryTrack.value});}catch(e){inventoryMessage(e.message);return;}
  setInventoryBusy(true);inventoryMessage('추가 중…');
  try{await writeInventoryRecord(v);inventoryUI.inventoryAddForm.reset();inventoryUI.inventoryTrack.value=v.track;await loadServerMemos();inventoryMessage(inventoryReady?'차량을 추가했어요.':'저장은 완료됐어요. 목록은 새로고침으로 다시 불러와주세요.');inventoryUI.inventoryName.focus();}catch(e){await loadServerMemos();inventoryMessage('추가 여부를 목록에서 확인해주세요. 입력은 유지됩니다. '+e.message);}finally{setInventoryBusy(false);}
}
async function saveInventoryEdit(id) {
  if(!inventoryReady||inventoryBusy)return;
  let v;try{v=normalizeInventoryValues(inventoryEditDraft);}catch(e){inventoryMessage(e.message);return;}
  setInventoryBusy(true);inventoryMessage('수정 중…');
  try{await writeInventoryRecord(v,id);inventoryEditId=null;inventoryEditDraft=null;await loadServerMemos();inventoryMessage(inventoryReady?'수정했어요.':'수정은 완료됐어요. 목록을 다시 불러와주세요.');}catch(e){inventoryMessage('수정하지 못했어요. 입력은 유지됩니다. '+e.message);}finally{setInventoryBusy(false);}
}
async function deleteInventoryRecord(id) {
  if(!inventoryReady||inventoryBusy)return;
  const row=inventoryMemos.find(v=>v.id===id);if(!row||!confirm(`${row.name} 항목을 삭제할까?`))return;
  setInventoryBusy(true);inventoryMessage('삭제 중…');
  try{await callManagerMemoApi({action:'delete',id});if(inventoryEditId===id){inventoryEditId=null;inventoryEditDraft=null;}await loadServerMemos();inventoryMessage(inventoryReady?'삭제했어요.':'삭제 요청은 완료됐어요. 목록을 다시 불러와주세요.');}catch(e){await loadServerMemos();inventoryMessage('삭제 여부를 목록에서 확인해주세요. '+e.message);}finally{setInventoryBusy(false);}
}
function renderInventoryBulkPreview() {
  inventoryUI.inventoryBulkRows.innerHTML=inventoryBulkDrafts.map((v,i)=>`<div class="inventory-preview-row"><label>${i+1}. 차량명<input data-inventory-bulk="name" data-index="${i}" maxlength="200" value="${escapeAttribute(v.name)}"></label><label>기록<input data-inventory-bulk="time" data-index="${i}" maxlength="40" value="${escapeAttribute(v.time)}"></label><label>코스<select data-inventory-bulk="track" data-index="${i}">${inventoryTrackOptions(v.track)}</select></label><label>메모<input data-inventory-bulk="notes" data-index="${i}" maxlength="1000" value="${escapeAttribute(v.notes)}"></label></div>`).join('');
  inventoryUI.inventoryBulkSave.classList.toggle('hidden',!inventoryBulkDrafts.length);
  inventoryUI.inventoryBulkSave.textContent=`${inventoryBulkDrafts.length}대 목록에 추가`;
  setInventoryBusy(inventoryBusy);
}
async function saveInventoryBulk() {
  if(!inventoryReady||inventoryBusy||!inventoryBulkDrafts.length)return;
  let rows;try{rows=inventoryBulkDrafts.map(normalizeInventoryValues);}catch(e){inventoryUI.inventoryBulkMessage.textContent=e.message;return;}
  setInventoryBusy(true);let added=0,skipped=0,failed=false;
  const seen=new Set(inventoryMemos.map(inventorySignature));
  try{for(const row of rows){if(seen.has(inventorySignature(row))){skipped++;continue;}inventoryUI.inventoryBulkMessage.textContent=`${added+1}대째 저장 중…`;await writeInventoryRecord(row);seen.add(inventorySignature(row));added++;}}
  catch(e){failed=true;inventoryUI.inventoryBulkMessage.textContent='일부 저장이 중단됐어요. 새로고침으로 저장 여부를 확인한 뒤 다시 추가해주세요. '+e.message;}
  finally{await loadServerMemos();if(inventoryReady){const saved=new Set(inventoryMemos.map(inventorySignature));inventoryBulkDrafts=rows.filter(v=>!saved.has(inventorySignature(v)));}if(!failed&&inventoryReady){inventoryBulkDrafts=[];inventoryUI.inventoryBulkText.value='';inventoryUI.inventoryBulkMessage.textContent=`${added}대 추가 완료${skipped?` · 동일한 항목 ${skipped}대 제외`:''}`;}else if(!failed)inventoryUI.inventoryBulkMessage.textContent=`${added}대 저장 요청 완료 · 목록 연결 후 중복 여부를 확인해주세요.`;setInventoryBusy(false);renderInventoryBulkPreview();}
}
inventoryUI.inventoryAddForm.addEventListener('submit',addInventoryRecord);
inventoryUI.inventorySearch.addEventListener('input',renderInventoryRows);
inventoryUI.inventorySort.addEventListener('change',renderInventoryRows);
inventoryUI.inventoryTrackFilter.addEventListener('change',renderInventoryRows);
inventoryUI.inventoryReload.addEventListener('click',async()=>{if(inventoryBusy)return;inventoryMessage('불러오는 중…');await loadServerMemos();});
inventoryUI.inventoryList.addEventListener('input',e=>{const key=e.target.dataset.inventoryEdit;if(key&&inventoryEditDraft)inventoryEditDraft[key]=e.target.value;});
inventoryUI.inventoryList.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset.inventoryEdit){e.preventDefault();saveInventoryEdit(inventoryEditId);}if(e.key==='Escape'&&inventoryEditId){inventoryEditId=null;inventoryEditDraft=null;renderInventoryRows();}});
inventoryUI.inventoryList.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||inventoryBusy||!inventoryReady)return;if(b.hasAttribute('data-inventory-start')){const row=inventoryMemos.find(v=>v.id===b.dataset.inventoryStart);if(!row)return;inventoryEditId=row.id;inventoryEditDraft={...row};renderInventoryRows();inventoryUI.inventoryList.querySelector('[data-inventory-edit="name"]')?.focus();}else if(b.hasAttribute('data-inventory-cancel')){inventoryEditId=null;inventoryEditDraft=null;renderInventoryRows();}else if(b.hasAttribute('data-inventory-save'))saveInventoryEdit(b.dataset.inventorySave);else if(b.hasAttribute('data-inventory-delete'))deleteInventoryRecord(b.dataset.inventoryDelete);});
inventoryUI.inventoryBulkPreview.addEventListener('click',()=>{const rows=parseInventoryLines(inventoryUI.inventoryBulkText.value,inventoryUI.inventoryBulkTrack.value);if(rows.length>100){inventoryUI.inventoryBulkMessage.textContent='한 번에 100대까지 나눠서 추가해주세요.';return;}inventoryBulkDrafts=rows;renderInventoryBulkPreview();inventoryUI.inventoryBulkMessage.textContent=rows.length?`${rows.length}대 확인 · 필요하면 칸을 수정한 뒤 추가해주세요.`:'차량 목록을 붙여넣어주세요.';});
inventoryUI.inventoryBulkRows.addEventListener('input',e=>{const key=e.target.dataset.inventoryBulk,index=Number(e.target.dataset.index);if(key&&inventoryBulkDrafts[index])inventoryBulkDrafts[index][key]=e.target.value;});
inventoryUI.inventoryBulkSave.addEventListener('click',saveInventoryBulk);
window.renderTuningInventory(typeof managerMemosLoaded!=='undefined'&&managerMemosLoaded?true:null);
