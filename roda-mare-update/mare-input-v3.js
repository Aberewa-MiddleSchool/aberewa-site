/* RODA: localized Mestre Mare movement and controller repair. Native-resolution art is rendered directly. */
(() => {
'use strict';
const memory=new Map();
const uiScenes=new Set(['title','menu','select','pause','setup']);
const previousRoll=updateRoll;
const standard=p=>p.mapping==='standard'||(p.buttons.length>=16&&/xbox|xinput|f310|f710/i.test(p.id||''));
const pressed=b=>typeof b==='object'&&b!==null?!!b.pressed||Number(b.value)>.5:!!b;
function safeButtons(p){
 const raw=Array.from(p.buttons||[],pressed);
 const b=Array.from({length:Math.max(17,raw.length)},(_,i)=>!!raw[i]);
 if(standard(p))return b;
 const cfg=customPads[p.id];
 if(cfg&&typeof cfg==='object')for(const [i,binding] of Object.entries(cfg)){
  if(!Number.isInteger(+i)||+i<0||+i>=17||!binding)continue;
  try{b[+i]=bindingPressed(p,binding);}catch(_){/* keep raw button */}
 }
 return b;
}
function axis(p,i){const n=Number(p.axes?.[i]);return Number.isFinite(n)&&Math.abs(n)<=1?Math.max(-1,Math.min(1,n)):0;}
function state(p){
 const b=safeButtons(p),old=prevPads[p.index]||[],edge=b.map((v,i)=>v&&!old[i]);
 prevPads[p.index]=b.slice();
 const key=String(p.index)+':'+String(p.id||'');
 if(!memory.has(key))memory.set(key,{armed:[false,false],lastNav:''});
 const m=memory.get(key),ax=axis(p,0),ay=axis(p,1);
 [ax,ay].forEach((v,i)=>{if(Math.abs(v)<.3)m.armed[i]=true;});
 const digital=b[12]||b[13]||b[14]||b[15];
 const dx=Number(b[15])-Number(b[14]),dy=Number(b[13])-Number(b[12]);
 let x=digital?dx:m.armed[0]&&Math.abs(ax)>.45?ax:0;
 let y=digital?dy:m.armed[1]&&Math.abs(ay)>.45?ay:0;
 const rollIntent=digital?dx:Math.abs(x)>.75?Math.sign(x):0;
 const nav=digital?(dx?'x'+dx:dy?'y'+dy:''):(Math.abs(x)>=Math.abs(y)&&Math.abs(x)>.55?'x'+Math.sign(x):Math.abs(y)>.55?'y'+Math.sign(y):'');
 if(uiScenes.has(scene)){
  if(!nav||nav===m.lastNav){x=0;y=0;}
  else{x=nav[0]==='x'?Number(nav.slice(1)):0;y=nav[0]==='y'?Number(nav.slice(1)):0;}
 }
 m.lastNav=nav;
 return {b,edge,x,y,rollIntent};
}
normalizedButtons=safeButtons;padState=state;
function forget(e){const i=e.gamepad?.index;if(i===undefined)return;for(const k of memory.keys())if(k.startsWith(i+':'))memory.delete(k);delete prevPads[i];}
window.addEventListener('gamepadconnected',forget);window.addEventListener('gamepaddisconnected',forget);
function mareRoll(p,input,dt){
 if(p.id!==14)return previousRoll(p,input,dt);
 const human=p===players[0]&&!arcadeAutoplay;
 const intent=human?Math.sign(input?.rollIntent||0):mode==='training'?0:Math.abs(input?.x||0)>.35?Math.sign(input.x):0;
 const vertical=Math.abs(input?.y||0)>.5;
 if(!intent)p.mareRollArmed=true;
 p.mareCpuRollWait=Math.max(0,(p.mareCpuRollWait||0)-dt);
 if(p.stun>0||p.down>0||p.hp<=0){p.rollTime=0;p.mareRollFacing=null;if(intent)p.mareRollArmed=false;return false;}
 const ready=!inJump(p)&&p.attack===null&&p.stun<=0&&p.down<=0&&p.hp>0;
 const requested=human?intent&&p.mareRollArmed===true:intent&&p.mareCpuRollWait<=0;
 if(human&&intent)p.mareRollArmed=false;
 const enemy=players.find(other=>other!==p);
 if(ready&&requested&&!(p.rollTime>0)&&!vertical&&!(intent===-p.dir&&enemy?.attack!=null)){
  p.rollTime=24;p.rollDirection=intent;p.mareRollFacing=p.dir;p.buffer=null;p.jumpBuffer=0;p.travelDirection=0;p.travelDistance=0;
 }
 if(!(p.rollTime>0))return false;
 // Move only during the actual rolling poses, not during fixed ginga.
 const before=24-p.rollTime,after=Math.min(24,before+dt);
 const distance=t=>{const z=clamp((t-4)/16,0,1);return 120*z*z*(3-2*z);};
 p.x=clamp(p.x+p.rollDirection*(distance(after)-distance(before)),100,1180);p.vx=0;p.crouch=true;p.block=false;
 p.moveText=p.rollDirection===p.mareRollFacing?'FORWARD ROLL':'BACKWARD ROLL';
 p.rollTime=Math.max(0,p.rollTime-dt);
 if(!p.rollTime){p.crouch=false;p.mareRollFacing=null;p.mareCpuRollWait=14;}
 return true;
}
updateRoll=mareRoll;
window.RODAMareRepairV3=Object.freeze({version:'3.0',oneRollPerPress:true,dpadPriority:true,nativeResolution:true});
})();
