/* RODA: Arcade continuation and named match ledger. Load after existing game scripts. */
(()=>{
 'use strict';
 if(typeof CELINA_ID!=='undefined'||typeof makeArcade!=='function'||typeof autoContinue!=='function'||typeof showResults!=='function'||typeof confirmPick!=='function'||typeof updatePick!=='function'||document.getElementById('roda-player-name'))return;
 const KEY='aberewa_roda_arcade_runs_v1';
 let run=null;
 const read=()=>{const v=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(v))throw Error('Invalid records');return v;};
 const save=()=>{if(!run)return true;try{const rows=read(),i=rows.findIndex(r=>r.id===run.id);if(i<0)rows.push(run);else rows[i]=run;localStorage.setItem(KEY,JSON.stringify(rows));return true;}catch(e){console.error('[RODA records]',e);return false;}};
 const totals=r=>[r?.matches.filter(m=>m.outcome==='win').length||0,r?.matches.filter(m=>m.outcome==='loss').length||0];
 const label=document.createElement('label');label.style.cssText='display:block;color:#ffe1aa;font-weight:700;margin:8px 0';label.textContent='PLAYER NAME (REQUIRED FOR ARCADE)';
 const input=document.createElement('input');input.id='roda-player-name';input.maxLength=32;input.placeholder='Enter your name';input.style.cssText='display:block;padding:8px;color:#111;background:white;margin-top:4px;width:100%';
 try{input.value=localStorage.getItem('roda-last-player')||'';}catch{}label.append(input);document.getElementById('confirm').before(label);
 input.addEventListener('change',()=>{try{localStorage.setItem('roda-last-player',input.value.trim());}catch{}});
 const status=document.createElement('p');status.id='roda-bout-record';status.style.cssText='text-align:center;color:#ffe1aa;font-weight:800';document.querySelector('#result .result-head').append(status);
 const oldPick=updatePick;updatePick=function(...args){label.style.display=mode==='solo'&&!arcadeAutoplay?'block':'none';return oldPick.apply(this,args);};
 const oldConfirm=confirmPick;confirmPick=function(...args){if(mode==='solo'&&!arcadeAutoplay&&!input.value.trim()){document.getElementById('picklabel').textContent='ENTER YOUR NAME TO START ARCADE';input.focus();return;}return oldConfirm.apply(this,args);};document.getElementById('confirm').onclick=()=>confirmPick();
 const oldMake=makeArcade;makeArcade=function(...args){const result=oldMake.apply(this,args);run=null;if(!arcadeAutoplay){const player=input.value.trim().slice(0,32);if(player){run={id:crypto.randomUUID(),player,fighter:profiles[chosen[0]].name,difficulty,roundLimit,route:arcadeOrder.map(id=>({opponent:profiles[id].name,mentor:false})),matches:[],createdAt:new Date().toISOString()};save();}}return result;};
 const oldResults=showResults;showResults=function(...args){const result=oldResults.apply(this,args);status.textContent='';if(mode==='solo'&&!arcadeAutoplay&&run&&matchOver&&matchWinner>=0){const i=arcadeIndex;if(!run.matches.some(m=>m.index===i)&&run.route[i]){run.matches.push({...run.route[i],index:i,outcome:matchWinner===0?'win':'loss',roundWins:wins[0],roundLosses:wins[1],date:new Date().toISOString()});run.earnings=arcadeScore.total;if(i===arcadeOrder.length-1)run.completedAt=new Date().toISOString();}const ok=save(),[w,l]=totals(run);status.textContent=w+' W · '+l+' L · '+(ok?'RECORD SAVED':'STORAGE UNAVAILABLE');}return result;};
 const oldContinue=autoContinue;autoContinue=function(...args){if(mode!=='solo'||arcadeAutoplay||!matchOver||matchWinner===0)return oldContinue.apply(this,args);if(matchWinner<0)return oldContinue.apply(this,args);
  if(arcadeIndex<arcadeOrder.length-1){arcadeIndex++;chosen[1]=arcadeOrder[arcadeIndex];wins=[0,0];round=1;setRounds();startRound();openStory();return;}
  // The original ending wrapper accepts completion only through its winning branch.
  // Enter that branch after all bouts have been played; keep the recorded loss intact.
  const actual=matchWinner;matchWinner=0;try{return oldContinue.apply(this,args);}finally{matchWinner=actual;}
 };
 const oldScore=openArcadeScore;openArcadeScore=function(...args){const result=oldScore.apply(this,args);if(run&&!arcadeAutoplay){run.earnings=arcadeScore.total;save();document.getElementById('arcadename').value=run.player;const [w,l]=totals(run);document.getElementById('savestatus').textContent=w+' W · '+l+' L · Match record saved on this browser. Save earnings below.';}return result;};
 window.RODAArcadePersistence=Object.freeze({version:'1.0',storageKey:KEY,scope:'Player Arcade only'});
})();
