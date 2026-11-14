/* Tab-scoped expiring manager sessions. No password verifier is shipped to visitors. */
window.ArchiveManagerSecurity=(()=>{
 const API='https://script.google.com/macros/s/AKfycbzqX8DvEixZQdDBEhuFZfm_fJjY66ITdeqhDLuQmCvGkCRjpGVEvP3MZdFkW5uR3X4DWg/exec';
 const KEY='forzaManagerSessionV2';let queue=Promise.resolve();
 const enc=new TextEncoder();
 const hex=b=>Array.from(new Uint8Array(b),v=>v.toString(16).padStart(2,'0')).join('');
 const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),v=>v.toString(16).padStart(2,'0')).join('');
 async function mac(message,key){const k=await crypto.subtle.importKey('raw',enc.encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',k,enc.encode(message)));}
 function clear(){sessionStorage.removeItem(KEY);sessionStorage.removeItem('forzaManagerAccess');sessionStorage.removeItem('forzaManagerMemoAuth');}
 function session(){try{const s=JSON.parse(sessionStorage.getItem(KEY)||'null');if(s&&typeof s.session==='string'&&typeof s.key==='string'&&Number.isInteger(s.seq)&&s.expires>Date.now()&&Date.now()-s.last<1800000)return s;}catch{}clear();return null;}
 function jsonp(params){return new Promise((resolve,reject)=>{
  const callback='managerSecure_'+random(),script=document.createElement('script');let finished=false;
  function cleanup(){clearTimeout(timer);delete window[callback];script.remove();}
  const timer=setTimeout(()=>{if(finished)return;finished=true;cleanup();reject(Error('서버 응답 시간이 초과됐어요. 저장 요청이었다면 다시 로그인한 뒤 목록에서 결과를 확인해주세요.'));},20000);
  window[callback]=data=>{if(finished)return;finished=true;cleanup();resolve(data);};
  script.onerror=()=>{if(finished)return;finished=true;cleanup();reject(Error('서버 연결에 실패했어요.'));};
  script.referrerPolicy='no-referrer';script.src=API+'?'+new URLSearchParams({...params,callback,cacheBust:random()});document.body.appendChild(script);
 });}
 function message(data){return data&&data.message==='rate_limited'?'로그인 시도가 많아요. 잠시 후 다시 시도해주세요.':data&&data.message==='unauthorized'?'인증이 만료됐거나 로그인 정보가 맞지 않아요. 다시 로그인해주세요.':'관리자 서버 응답을 확인해주세요.';}
 async function login(password){
  clear();const c=await jsonp({action:'managerChallenge'});
  if(!c||!c.ok||c.securityVersion!==2||!c.challenge||!c.nonce)throw Error(c&&c.securityVersion===2?message(c):'관리자 서버 업데이트가 아직 적용되지 않았어요.');
  let verifier=hex(await crypto.subtle.digest('SHA-256',enc.encode('forza6-manager-memo-api-v1:'+password)));
  const proof=await mac('fh6-login-v2:'+c.challenge+':'+c.nonce,verifier);verifier='';password='';
  const data=await jsonp({action:'managerLogin',challenge:c.challenge,proof});
  if(!data||!data.ok)throw Error(message(data));
  if(typeof data.session!=='string'||typeof data.key!=='string'||!Number.isFinite(data.expires)||data.expires<=Date.now())throw Error('로그인 응답이 올바르지 않아요.');
  sessionStorage.setItem(KEY,JSON.stringify({session:data.session,key:data.key,seq:0,expires:data.expires,last:Date.now()}));
 }
 function canonical(p){return JSON.stringify(['fh6-manager-v2',p.session,p.seq,p.time,p.action,p.id||'',p.title||'',p.body||'',p.tag||'',p.source||'manager']);}
 function call(params={}){
  const task=queue.then(async()=>{
   const s=session();if(!s)throw Error('인증이 만료됐어요. 메인에서 다시 로그인해주세요.');
   const p={action:String(params.action||'list'),id:String(params.id||''),title:String(params.title||''),body:String(params.body||''),tag:String(params.tag||''),source:String(params.source||'manager'),session:s.session,seq:String(s.seq+1),time:String(Date.now())};
   p.proof=await mac(canonical(p),s.key);
   try{
    const data=await jsonp(p);
    // Ignore an in-flight response after logout or another login.
    if(sessionStorage.getItem(KEY)!==JSON.stringify(s))throw Error('로그인이 변경되었어요. 다시 확인해주세요.');
    if(!data||!data.ok){if(data&&data.message==='unauthorized')clear();else{s.seq++;s.last=Date.now();sessionStorage.setItem(KEY,JSON.stringify(s));}throw Error(message(data));}
    s.seq++;s.last=Date.now();sessionStorage.setItem(KEY,JSON.stringify(s));return data;
   }catch(error){clear();throw error;}
  });queue=task.catch(()=>{});return task;
 }
 async function logout(){try{if(session())await call({action:'logout'});}finally{clear();}}
 return {login,call,logout,clear,hasSession:()=>!!session()};
})();
