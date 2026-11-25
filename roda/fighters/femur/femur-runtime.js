/* Standalone RODA Femur asset adapter. No global engine mutation. */
(function(root){
'use strict';
const BUTTONS=['A','B','X','Y','LB','RB'];
const finite=(n,d=0)=>Number.isFinite(n)?n:d;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function validate(manifest){
 if(manifest.schema!=='roda-femur-assets-v1')throw Error('Wrong asset manifest');
 for(const b of BUTTONS){const x=manifest.buttons[b],c=manifest.clips[x.clip];if(x.cost!==0||x.phases.length!==3||x.contactFrames.length!==3||x.contactFrames.some(i=>i<0||i>=c.count))throw Error('Invalid combo '+b);}
 return manifest;
}
function frameIndex(clip,elapsedMs){const i=Math.floor(Math.max(0,finite(elapsedMs))/clip.frameMs);return clip.loop?i%clip.count:Math.min(clip.count-1,i);}
function cell(manifest,name,index){const c=manifest.clips[name],f=manifest.frame,i=clamp(Math.floor(index),0,c.count-1);return {x:i%c.columns*f.width,y:Math.floor(i/c.columns)*f.height,w:f.width,h:f.height};}
function stateClip(p){
 // State age is measured in milliseconds by caller. A state change resets the age.
 if(p.hp<=0||p.defeated)return 'defeat';
 if(p.down>0)return p.recovering?'recover':'fall';
 if(p.stun>0)return p.guardStun?(p.crouch?'low_guard':'guard'):'hit';
 if(p.recovering)return 'recover';
 if(p.rollTime>0||p.rolling)return p.rollDirection===p.dir?'roll_forward':'roll_backward';
 if(p.airborne||p.y>0||p.takeoff>0||p.landing>0)return 'jump';
 if(p.attackButton&&BUTTONS.includes(p.attackButton))return 'combo_'+p.attackButton.toLowerCase();
 if(p.block)return p.crouch?'low_guard':'guard';
 if(p.crouch)return 'crouch';
 if(p.travelDirection)return p.travelDirection===p.dir?'advance':'retreat';
 return 'ginga'; // Including after a round win.
}
function combatPlan(manifest,button){
 const data=manifest.buttons[button];if(!data)throw Error('Unknown button');const clip=manifest.clips[data.clip];
 return {button,clip:data.clip,cost:0,groundOnly:true,durationMs:clip.frameMs*clip.count,contacts:data.phases.map(p=>({name:p.name,level:p.level,atMs:p.contactFrame*clip.frameMs,fromMs:p.firstFrame*clip.frameMs,untilMs:(p.lastFrame+1)*clip.frameMs}))};
}
// Pass the verified, stable roster IDs from the actual engine. No hard-coded IDs.
function storyRoute(route,{playerId,femurId,celinaId,aishaId,aishaAndroidMode=false,androidIds=[]}){
 const unique=new Set([femurId,celinaId,aishaId]);
 if(unique.size!==3||[playerId,femurId,celinaId,aishaId].some(x=>x==null))throw Error('Resolve distinct fighter IDs before routing');
 const clean=route.filter(id=>id!==femurId&&id!==playerId);
 if(playerId===femurId)return [celinaId,...clean.filter(id=>id!==celinaId)];
 if(aishaAndroidMode||playerId===aishaId){
  if(aishaAndroidMode&&(!androidIds.length||androidIds.some(id=>!clean.includes(id))))throw Error('Confirm complete Aisha android route before adding Femur');
  return [...clean,femurId];
 }
 const at=clean.lastIndexOf(aishaId);
 if(at<0)throw Error('Ordinary Arcade route must contain Aisha before Femur');
 clean.splice(at+1,0,femurId);return clean;
}
function comicKey({playerId,opponentId,femurId,celinaId,aishaId,aishaAndroidMode=false,studentIds=[],protagonistIds=[],result=null,routeComplete=false}){
 if(result==='win'||result==='loss'){
  if(!routeComplete)return null; // Never play a route ending on a round result.
  if(playerId===femurId)return result==='win'?'femur_victory':'femur_defeat';
  if(opponentId===femurId)return result==='win'?'player_defeats_femur':'player_loses_to_femur';
  return null;
 }
 if(playerId===femurId){
  if(opponentId===celinaId)return 'femur_opening_celina';
  if(protagonistIds.includes(opponentId))return 'femur_protagonist';
  if(studentIds.includes(opponentId))return 'femur_student';
  return 'femur_other';
 }
 if(opponentId===femurId)return aishaAndroidMode||playerId===aishaId?'aisha_challenge_femur':'challenge_femur';
 return null; // Existing story applies only when not overridden.
}
function femurArena(boutIndex,keys){
 if(keys.length!==5||new Set(keys).size!==5)throw Error('Five distinct Femur arenas required');
 return keys[((Math.trunc(finite(boutIndex))%5)+5)%5];
}
function unlockCostume(state,{playerId,femurId,result,routeComplete}){
 if(playerId!==femurId||result!=='win'||!routeComplete)return {...state};
 return {...state,femurAlternateAngola:true};
}
async function load(baseUrl){
 const base=new URL(baseUrl,document.baseURI);const manifest=validate(await (await fetch(new URL('manifest.json',base))).json());const images={};
 await Promise.all(Object.entries(manifest.clips).map(([name,c])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[name]=im;resolve();};im.onerror=()=>reject(Error('Cannot load Femur '+name));im.src=new URL(c.file,base).href;})));
 function draw(ctx,p,{x,groundY,scale=1,stateAgeMs=0,frameOverride}={}){
  const name=stateClip(p),c=manifest.clips[name],i=frameOverride==null?frameIndex(c,stateAgeMs):frameOverride,r=cell(manifest,name,i),f=manifest.frame;
  ctx.save();ctx.translate(x,groundY);ctx.scale(p.dir<0?-scale:scale,scale);ctx.imageSmoothingEnabled=true;ctx.drawImage(images[name],r.x,r.y,r.w,r.h,-f.anchorX,-f.anchorY,r.w,r.h);ctx.restore();return {name,index:i};
 }
 return {manifest,images,draw,combatPlan:b=>combatPlan(manifest,b)};
}
const api={BUTTONS,validate,frameIndex,cell,stateClip,combatPlan,storyRoute,comicKey,femurArena,unlockCostume,load};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.RODAFemur=api;
})(typeof window!=='undefined'?window:globalThis);
