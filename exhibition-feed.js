/* Shared, read-only exhibition feed. Never adds vehicles to archive rankings. */
window.ArchiveExhibitions=(()=>{
 const endpoint='https://fh6-exhibition-feed.lepe1210xd.chatgpt.site/api/exhibits';
 let pending;
 const safeImage=value=>{try{return new URL(value).protocol==='https:'?value:'';}catch{return '';}};
 function toCar(v){return {id:'atlas:'+v.id,atlasId:v.id,manufacturer:'수도고 복각',carName:v.name,gameBase:v.gameBase,className:v.pi?'PI '+v.pi:'',carType:'원작 재현',drive:'',category:'전시 전용',concept:v.intro||'',summary:'',tuneNotes:v.points||'',power:v.power?`${v.power} ${v.powerUnit||'hp'}`:'',torque:v.torque?`${v.torque} ${v.torqueUnit||'Nm'}`:'',weight:v.weight?`${v.weight} kg`:'',shareCode:v.shareCode,updatedAt:v.updatedAt,imageUrl:safeImage(v.imageUrl),series:v.series,character:v.character,testTrackBTime:'',testTrackCTime:''};}
 async function load(refresh=false){if(pending&&!refresh)return pending;pending=(async()=>{const r=await fetch(endpoint,{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('전시 차량을 불러오지 못했습니다.');const b=await r.json();if(b.schemaVersion!==1||!Array.isArray(b.vehicles))throw Error('전시 데이터 형식 확인 필요');return b.vehicles.filter(v=>typeof v.id==='string'&&/^[a-z0-9-]{1,100}$/.test(v.id)&&typeof v.name==='string'&&typeof v.gameBase==='string'&&/^\d{9}$/.test(v.shareCode)&&Array.isArray(v.series)).map(toCar);})();try{return await pending;}catch(e){pending=undefined;throw e;}}
 function pool(cars,exhibits){const codes=new Set(cars.map(c=>String(c.shareCode||'').replace(/\D/g,'')));return [...cars,...exhibits.filter(c=>{if(codes.has(c.shareCode))return false;codes.add(c.shareCode);return true;})];}
 return {load,pool};
})();
