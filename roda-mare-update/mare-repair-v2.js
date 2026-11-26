/* RODA: localized Mestre Mare movement, controller, and atlas clarity repair. */
(() => {
'use strict';
const memory=new Map();
const uiScenes=new Set(['title','menu','select','pause','setup']);
const previousRoll=updateRoll;
const originalDraw=drawMareAt;
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
 const intent=human?Math.sign(input?.rollIntent||0):Math.abs(input?.x||0)>.35?Math.sign(input.x):0;
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
 p.x=clamp(p.x+p.rollDirection*5*dt,100,1180);p.vx=0;p.crouch=true;p.block=false;
 p.moveText=p.rollDirection===p.mareRollFacing?'FORWARD ROLL':'BACKWARD ROLL';
 p.rollTime=Math.max(0,p.rollTime-dt);
 if(!p.rollTime){p.crouch=false;p.mareRollFacing=null;p.mareCpuRollWait=14;}
 return true;
}
updateRoll=mareRoll;
// Preserve every original pose and floor anchor. Build a 2x, edge-enhanced tile
// from the new Mare-only atlas; no old art, rotation, or per-pose rescaling.
const sharp=new Map();let sharpeningUnavailable=false;
function sharpTile(i){
 if(sharp.has(i))return sharp.get(i);
 if(sharpeningUnavailable||!mareAtlas.complete||!mareAtlas.naturalWidth)return null;
 try{
  const a=document.createElement('canvas');a.width=640;a.height=560;
  const ac=a.getContext('2d',{willReadFrequently:true});
  ac.imageSmoothingEnabled=true;ac.imageSmoothingQuality='high';
  ac.drawImage(mareAtlas,(i%8)*320,Math.floor(i/8)*280,320,280,0,0,640,560);
  const blur=document.createElement('canvas');blur.width=640;blur.height=560;
  const bc=blur.getContext('2d',{willReadFrequently:true});bc.filter='blur(1.1px)';bc.drawImage(a,0,0);bc.filter='none';
  const data=ac.getImageData(0,0,640,560),d=data.data,soft=bc.getImageData(0,0,640,560).data;
  for(let k=0;k<d.length;k+=4){const alpha=d[k+3];if(alpha>38){for(let c=0;c<3;c++)d[k+c]=d[k+c]+1.3*(d[k+c]-soft[k+c]);}d[k+3]=alpha<7?0:alpha>250?255:Math.max(0,Math.min(255,(alpha-127.5)*1.18+127.5));}
  ac.putImageData(data,0,0);sharp.set(i,a);return a;
 }catch(err){sharpeningUnavailable=true;console.warn('[RODA] Mare clarity enhancement unavailable; retaining replacement atlas.',err);return null;}
}
drawMareAt=function(c,index,x,y,dir=1,opacity=1){
 const i=Number.isInteger(index)&&index>=0&&index<49?index:0;
 const tile=sharpTile(i);if(!tile)return originalDraw(c,index,x,y,dir,opacity);
 const f=305/152;c.save();c.filter='none';c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.globalAlpha*=opacity;
 c.translate(x,y);c.scale(dir,1);c.drawImage(tile,-160*f,-250*f,320*f,280*f);c.restore();
};
// Precompute the most frequently used poses after the image loads, spreading
// work across animation frames rather than blocking the title screen.
function warm(){let i=0;function next(){if(i<49&&!sharpeningUnavailable){sharpTile(i++);requestAnimationFrame(next);}}requestAnimationFrame(next);}
if(mareAtlas.complete&&mareAtlas.naturalWidth)warm();else mareAtlas.addEventListener('load',warm,{once:true});
window.RODAMareRepairV2=Object.freeze({version:'2.0',oneRollPerPress:true,dpadPriority:true,get sharpFrames(){return sharp.size;}});
})();
