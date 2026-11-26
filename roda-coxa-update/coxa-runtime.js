/* COXA / RODA: dedicated fighter, stable authored atlas and 20-bout Heather challenge. */
'use strict';
const COXA_ID=17;
const COXA_LIMIT=20;
const COXA_COLORS=Object.freeze(['red','blue','orange','green','black']);
const COXA_ASSETS=new URL('assets/',document.currentScript.src).href;
const COXA_LEGACY_STORAGE='aberewa_roda_coxa_outfits_v1',COXA_STORAGE='aberewa_roda_coxa_outfits_20_0_v2',COXA_HISTORY='aberewa_roda_coxa_runs_v1';
const coxaCombat=new Image(),coxaMask=new Image(),coxaCard=new Image(),coxaFace=new Image();
coxaCombat.src=COXA_ASSETS+'combat-v3.webp';coxaMask.src=COXA_ASSETS+'suit-mask-v3.png';coxaCard.src=COXA_ASSETS+'card-v2.webp';coxaFace.src=COXA_ASSETS+'face.webp';
const coxaArt=[coxaCombat];
let coxaUnlocked=1,coxaSelected=0,coxaRun=null;
// Migrate the old per-bout reward only from recorded, distinct undefeated challenges.
function coxaPerfectRun(r){return r?.mode==='Coxa Mode'&&r.complete===true&&r.wins===COXA_LIMIT&&r.losses===0;}
function coxaLoadOutfits(){
 try{
  const v=JSON.parse(localStorage.getItem(COXA_STORAGE)||'null');
  if(v){coxaUnlocked=Math.max(1,Math.min(COXA_COLORS.length,Math.floor(Number(v.unlocked)||1)));coxaSelected=Math.max(0,Math.min(coxaUnlocked-1,Math.floor(Number(v.selected)||0)));return;}
  const rows=JSON.parse(localStorage.getItem(COXA_HISTORY)||'[]');
  const earned=new Set((Array.isArray(rows)?rows:[]).filter(r=>coxaPerfectRun(r)&&r.id).map(r=>r.id));
  coxaUnlocked=Math.min(COXA_COLORS.length,1+earned.size);
  const legacy=JSON.parse(localStorage.getItem(COXA_LEGACY_STORAGE)||'null');
  coxaSelected=Math.max(0,Math.min(coxaUnlocked-1,Math.floor(Number(legacy?.selected)||0)));
  coxaSaveOutfits();
 }catch{}
}
coxaLoadOutfits();
const coxaMoney=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format((Number(n)||0)/100);
function coxaSaveOutfits(){try{localStorage.setItem(COXA_STORAGE,JSON.stringify({unlocked:coxaUnlocked,selected:coxaSelected}));return true;}catch{return false;}}
function coxaCycleOutfit(){coxaSelected=(coxaSelected+1)%coxaUnlocked;coxaSaveOutfits();}
function coxaUnlockNext(){if(coxaUnlocked>=COXA_COLORS.length)return null;coxaSelected=coxaUnlocked++;coxaSaveOutfits();return COXA_COLORS[coxaSelected];}
function coxaStagePool(count,previous,random=Math.random){const n=Math.max(1,Math.floor(count));const pool=Array.from({length:n},(_,i)=>i).filter(i=>n===1||i!==previous);return pool[Math.min(pool.length-1,Math.max(0,Math.floor(random()*pool.length)))];}
function coxaDamagePercent(maxHp,phase){return Math.max(0,maxHp)*phase.damage/100;}
function coxaCanAttack(n,crouched){return Number.isInteger(n)&&n>=0&&n<6&&(!crouched||n===1);}
function coxaPhase(pose,damage,level,key,range){return {pose,damage,level,key,range,frames:13,travel:0,push:0,knockdown:false};}
function coxaMove(slot,name,phases,power=false){
 const rank=power?3:slot>=2?2:1;const ordered=phases.map((p,i)=>({...p,rank,push:i===phases.length-1?3:0,knockdown:i===phases.length-1&&(power||p.level==='low')}));
 return {...moves[slot],...ordered[0],name,label:power?'POWER COMBINATION':'SINGLE KICK',signature:power?name:null,phases:ordered,rank,start:8,active:ordered.reduce((n,p)=>n+p.frames,0),end:power?16:12,cost:power?moves[slot].cost:0,retreat:0};
}
let coxaLowMove;
function installCoxa(){
 profiles[COXA_ID]={name:'Coxa',home:'Paris, France',personality:'A 22-year-old Parisian Capoeira Angola novice. Tall, plus-sized, and still finding her rhythm.',win:'One more lesson. I am getting there.',lose:'I will practice and come back.',pitch:190};
 fighterTraits[COXA_ID]={height:185,build:1,speed:4.6,tempo:1.1,reach:1,power:1,style:'Capoeira Angola novice',signature:'Learning the roda',accent:'#ed4245',variant:0};
 fighterPlans[COXA_ID]='Capoeira Angola novice · one kick per face button · down + B only';
 const straight=()=>coxaPhase(4,15,'mid','bencao',195),heel=()=>coxaPhase(16,15,'mid','costas',205),handstand=()=>coxaPhase(7,15,'high','au',205),cartwheel=()=>coxaPhase(6,15,'mid','au',205);
 characterMoves[COXA_ID]=[
  coxaMove(0,'Straight kick',[straight()]),
  coxaMove(1,'Backward heel kick',[heel()]),
  coxaMove(2,'Handstand kick',[handstand()]),
  coxaMove(3,'Cartwheel kick',[cartwheel()]),
  coxaMove(4,'Straight kick → cartwheel',[{...straight(),damage:7},{...cartwheel(),damage:6},{...handstand(),damage:7}],true),
  coxaMove(5,'Backward heel → handstand',[{...heel(),damage:11},{...handstand(),damage:12}],true)
 ];
 coxaLowMove=coxaMove(1,'Two-leg low kick',[coxaPhase(8,15,'low','rasteira',200)]);
}
function coxaRGB(h,s,v){
 const k=n=>(n+h*6)%6;const f=n=>v-v*s*Math.max(0,Math.min(k(n),4-k(n),1));
 return [Math.round(f(5)*255),Math.round(f(3)*255),Math.round(f(1)*255)];
}
function prepareCoxaColors(){
 if(coxaArt.length===COXA_COLORS.length)return;
 const w=coxaCombat.naturalWidth,h=coxaCombat.naturalHeight;
 if(w!==1536||h!==2880||coxaMask.naturalWidth!==w||coxaMask.naturalHeight!==h)throw Error('Coxa atlas or suit mask has unexpected dimensions');
 const source=document.createElement('canvas');source.width=w;source.height=h;const sc=source.getContext('2d',{willReadFrequently:true});sc.drawImage(coxaCombat,0,0);const pixels=sc.getImageData(0,0,w,h);
 const mask=document.createElement('canvas');mask.width=w;mask.height=h;const mc=mask.getContext('2d',{willReadFrequently:true});mc.drawImage(coxaMask,0,0);const marked=mc.getImageData(0,0,w,h).data;
 const specs=[[.60,.90],[.075,.98],[.33,.78],null];
 for(let c=1;c<COXA_COLORS.length;c++){
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const g=canvas.getContext('2d');const frame=g.createImageData(w,h);frame.data.set(pixels.data);
  for(let i=0;i<frame.data.length;i+=4){if(marked[i]<128||!frame.data[i+3])continue;const r=frame.data[i],gg=frame.data[i+1],b=frame.data[i+2],v=Math.max(r,gg,b),s=v?(v-Math.min(r,gg,b))/v:0;let rgb;
   if(c===4){const v2=Math.round(13+v*.30);rgb=coxaRGB(0,.045,v2/255);}else{const [hue,sat]=specs[c-1];rgb=coxaRGB(hue,Math.min(1,s*sat),Math.min(1,v*(c===2?1.08:1)/255));}
   frame.data[i]=rgb[0];frame.data[i+1]=rgb[1];frame.data[i+2]=rgb[2];
  }
  g.putImageData(frame,0,0);coxaArt.push(canvas);
 }
}
function coxaPose(p){
 if(p.hp<=0||p.down>0)return p.hp>0&&p.down<14?14:10;
 if(p.stun>0&&!p.guardStun)return 9;
 if(p.rollTime>0){const age=Math.max(0,24-p.rollTime);const start=p.rollDirection===(p.coxaRollFacing??p.dir)?20:28;return start+Math.min(7,Math.floor(age/3));}
 if(inJump(p))return 11;
 if(p.attack!==null){const m=moveFor(p,p.attack),phase=attackPhase(m,p.at);if(p.at<m.start)return p.attackCrouched?2:phase.pose===16?5:phase.pose===6||phase.pose===7?12:1;
  if(p.at>=m.start+m.active)return p.attackCrouched?2:phase.pose===6||phase.pose===7?14:0;
  if(phase.phaseFrame<8)return phase.pose;
  if(phase.phase+1<m.phases.length)return phase.pose===4?12:phase.pose===16?5:phase.pose;
  return phase.pose===16?5:phase.pose===6||phase.pose===7?14:p.attackCrouched?2:0;
 }
 if(p.block)return p.crouch?2:3;
 if(p.crouch)return 2;
 // Match the other RODA fighters: hold one planted novice ginga pose.
 return 0;
}
function drawCoxa(p){
 const pose=coxaPose(p),im=coxaArt[p.coxaColor??0]||coxaCombat;if(!im||(!im.width&&!im.naturalWidth))return;
 // One calibrated lens for every pose, no pose-specific rescale, rotation or sprite-body translation.
 const f=1.16,dir=(p.rollTime>0?(p.coxaRollFacing??p.dir):p.dir)*(pose===5||pose===6?-1:1);
 ctx.save();ctx.translate(p.x,590-p.y);ctx.scale(dir,1);ctx.drawImage(im,(pose%4)*384,Math.floor(pose/4)*320,384,320,-192*f,-300*f,384*f,320*f);ctx.restore();
}
function coxaSaveHistory(record){try{let rows=JSON.parse(localStorage.getItem(COXA_HISTORY)||'[]');if(!Array.isArray(rows))rows=[];const i=rows.findIndex(r=>r.id===record.id);if(i>=0)rows[i]=record;else rows.push(record);localStorage.setItem(COXA_HISTORY,JSON.stringify(rows.slice(-200)));return true;}catch{return false;}}
function coxaNewRun(stageCount,random=Math.random){return {id:globalThis.crypto?.randomUUID?.()||String(Date.now())+'-'+Math.random(),mode:'Coxa Mode',currency:'EUR',stage:1,arena:coxaStagePool(stageCount,-1,random),wins:0,losses:0,recordedStage:0,unlocked:coxaUnlocked,score:0,complete:false,rewardRule:'20-0',date:new Date().toISOString()};}
function coxaApplyBout(run,won,score){
 if(run.complete||run.recordedStage===run.stage)return null;
 run.recordedStage=run.stage;run.wins+=won?1:0;run.losses+=won?0:1;run.score=Number(score)||0;
 run.complete=run.stage===COXA_LIMIT;
 // One color per completed 20-0 challenge; losses are recorded without resetting the ladder.
 const color=coxaPerfectRun(run)?coxaUnlockNext():null;
 run.unlocked=coxaUnlocked;run.reward=color||null;return color;
}
function coxaAdvanceBout(run,stageCount,random=Math.random){if(run.complete||run.recordedStage!==run.stage)return false;run.stage++;run.arena=coxaStagePool(stageCount,run.arena,random);return true;}
function beginCoxaRun(){if(!loaded||!playableIds.includes(COXA_ID))return;arcadeAutoplay=false;mode='coxa';coxaRun=coxaNewRun(stageNames.length);coxaRun.player=(document.getElementById('coxa-player-name')?.value||'').trim().slice(0,32)||'Coxa';coxaRun.difficulty=difficulty;coxaRun.roundLimit=roundLimit;chosen=[COXA_ID,HEATHER_ID];resetArcadeScore();wins=[0,0];round=1;startRound();}
function recordCoxaBout(){if(mode!=='coxa'||!coxaRun||!matchOver||matchWinner<0||coxaRun.recordedStage===coxaRun.stage)return;
 const color=coxaApplyBout(coxaRun,matchWinner===0,arcadeScore.total);if(coxaRun.complete&&!arcadeScore.completed){award('clear',5000);arcadeScore.completed=true;coxaRun.score=arcadeScore.total;}
 coxaRun.saved=coxaSaveHistory(coxaRun);$('#resulttitle').textContent+=(color?' · '+color.toUpperCase()+' UNLOCKED':'');$('#roda-bout-record').textContent='STAGE '+coxaRun.stage+' / 20 · '+coxaRun.wins+' W / '+coxaRun.losses+' L · '+coxaMoney(coxaRun.score)+' · '+coxaUnlocked+' / '+COXA_COLORS.length+' COLORS';
}
function continueCoxaRun(){if(!coxaRun)return;recordCoxaBout();if(coxaAdvanceBout(coxaRun,stageNames.length)){wins=[0,0];round=1;startRound();return;}if(!coxaRun.complete)return;
 scene='coxa-complete';show('coxa-complete');$('#coxa-summary').textContent=coxaRun.wins+' wins · '+coxaRun.losses+' losses · '+coxaMoney(coxaRun.score);$('#coxa-colors-summary').textContent=(coxaPerfectRun(coxaRun)?(coxaRun.reward?coxaRun.reward.toUpperCase()+' UNLOCKED · ':'UNDEFEATED · ALL COLORS EARNED · '):'NO NEW OUTFIT · A 20–0 RUN IS REQUIRED · ')+coxaUnlocked+' of '+COXA_COLORS.length+' outfits unlocked'+(coxaRun.saved?' · record saved':' · storage unavailable');$('#sessionlabel').textContent='COXA MODE COMPLETE · '+coxaMoney(coxaRun.score);
}
function coxaRecordArcade(entry){return coxaSaveHistory({id:'arcade-'+entry.time+'-'+entry.name,mode:'Arcade',player:entry.name,currency:'EUR',difficulty,score:entry.score,wins:entry.wins,losses:entry.losses,unlocked:coxaUnlocked,complete:true,rewardRule:'20-0',date:new Date(entry.time).toISOString()});}
function installCoxaUI(){
 const b=document.createElement('button');b.dataset.mode='coxa';b.innerHTML='<b>COXA MODE</b><span>20 BOUTS VS HEATHER · RANDOM ARENAS · ONE NEW COLOR PER 20–0 RUN</span>';b.onclick=()=>setMode('coxa');document.querySelector('.mode-buttons').append(b);
 const name=document.createElement('label');name.id='coxa-name-wrap';name.hidden=true;name.textContent='COXA MODE PLAYER NAME (OPTIONAL)';name.style.cssText='margin:8px 0;color:#ffe1aa;font-weight:700';const input=document.createElement('input');input.id='coxa-player-name';input.maxLength=32;input.placeholder='Enter your name';input.style.cssText='display:block;padding:8px;color:#111;background:white;width:100%';try{input.value=localStorage.getItem('roda-last-player')||'';}catch{}name.append(input);$('#choose').before(name);
 const panel=document.createElement('section');panel.id='coxa-complete';panel.className='overlay hidden';panel.style.cssText='text-align:center;padding:28px;overflow:auto';panel.innerHTML='<h2>COXA MODE COMPLETE</h2><p>20 BOUTS AGAINST HEATHER · ONE NEW OUTFIT PER UNDEFEATED RUN</p><h3 id="coxa-summary"></h3><p id="coxa-colors-summary"></p><button id="coxa-done" class="primary">A · RETURN TO MAIN MENU</button>';$('.screen').append(panel);$('#coxa-done').onclick=returnToMenu;
}
function coxaMenuSync(){const name=document.getElementById('coxa-name-wrap');if(name)name.hidden=mode!=='coxa';if(mode==='coxa'){const stage=document.querySelector('.roda-menu-stages');if(stage)stage.hidden=true;}}
