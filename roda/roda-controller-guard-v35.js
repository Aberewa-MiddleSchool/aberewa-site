/* RODA 3.5: controller neutrality/menu drift hotfix; leaves fighters, arenas, combat and audio unchanged. */
(() => {
'use strict';
const padMemory=new Map(),axisDeadzone=.34,startupFrames=12,uiScenes=new Set(['title','menu','select','pause','setup']);
const standardPad=p=>p?.mapping==='standard'||/\b(?:xinput|f310|f710|xbox)\b/i.test(String(p?.id||''));
const press=b=>typeof b==='object'&&b!==null?Boolean(b.pressed):Boolean(b);
const normalized=typeof normalizedButtons==='function'?normalizedButtons:null;
const originalPad=typeof padState==='function'?padState:null;
if(!originalPad||!normalized){console.warn('[RODA 3.5] Engine input functions not found; old input preserved.');return;}
function buttons(p){let b;if(standardPad(p))b=Array.from(p?.buttons||[],press);
else{try{b=Array.from(normalized(p)||[],Boolean);}catch(_){b=Array.from(p?.buttons||[],press);}}
while(b.length<17)b.push(false);return b;}
function memory(p){const key=String(p?.id||'unknown')+':'+String(p?.index??0);
if(!padMemory.has(key))padMemory.set(key,{sum:[0,0],base:[0,0],observations:0,ready:false,lastDirection:''});
return padMemory.get(key);}
function analogValue(p,index,m){const raw=Number(p?.axes?.[index]);if(!Number.isFinite(raw)||!m.ready)return 0;
const d=raw-m.base[index];return Math.abs(d)>axisDeadzone?Math.max(-1,Math.min(1,d)):0;}
const direction=v=>v>.5?1:v<-.5?-1:0;
try{
normalizedButtons=function roda35NormalizedButtons(p){return buttons(p);};
padState=function roda35PadState(p){
const b=buttons(p),old=typeof prevPads!=='undefined'?prevPads[p.index]||[]:[];
const edge=b.map((held,i)=>held&&!old[i]);if(typeof prevPads!=='undefined')prevPads[p.index]=b.slice();
const m=memory(p);
if(!m.ready&&!([12,13,14,15].some(i=>b[i]))){
for(let i=0;i<2;i++){const v=Number(p?.axes?.[i]??0);m.sum[i]+=Number.isFinite(v)?v:0;}
m.observations++;
if(m.observations>=startupFrames){m.base=m.sum.map(v=>v/m.observations);m.ready=true;}
}
const dx=(b[14]?-1:0)+(b[15]?1:0),dy=(b[12]?-1:0)+(b[13]?1:0);
let x=dx||analogValue(p,0,m),y=dy||analogValue(p,1,m);
if(uiScenes.has(typeof scene==='undefined'?'':scene)){
const mx=direction(x),my=direction(y);
const nav=Math.abs(mx)>=Math.abs(my)&&mx?'x'+mx:my?'y'+my:'';
if(!nav||!m.ready&&!dx&&!dy){m.lastDirection='';x=0;y=0;}
else if(nav===m.lastDirection){x=0;y=0;}
else{m.lastDirection=nav;x=nav.startsWith('x')?mx:0;y=nav.startsWith('y')?my:0;}
}
return{b,edge,x,y};
};
}catch(error){console.error('[RODA 3.5] Controller guard could not attach',error);return;}
const erase=e=>{if(e?.gamepad?.index===undefined)return;const index=':'+e.gamepad.index;
for(const key of padMemory.keys())if(key.endsWith(index))padMemory.delete(key);
if(typeof prevPads!=='undefined')delete prevPads[e.gamepad.index];};
window.addEventListener('gamepaddisconnected',erase);
window.addEventListener('gamepadconnected',erase);
if(typeof setMode==='function'){const previousMode=setMode;setMode=function roda35SetMode(next){
if(typeof arcadeAutoplay!=='undefined'&&!['watch','watcharcade'].includes(next))arcadeAutoplay=false;
return previousMode.apply(this,arguments);};}
window.RODAControllerGuard35=Object.freeze({version:'3.5',deadzone:axisDeadzone,frames:startupFrames,
get status(){return'active';},get recognizedPads(){return[...padMemory.keys()];}});
})();