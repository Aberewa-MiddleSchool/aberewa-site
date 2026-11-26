/* RODA - Meilin HD stage 1: planted guard and native low straight-leg strikes. */
(() => {
'use strict';
const ID=7, TILE_W=800,TILE_H=600,FLOOR=560,REF=471;
if(typeof drawFighter!=='function'||typeof strikeInReach!=='function'||typeof moveFor!=='function'||typeof attackPhase!=='function'||!Array.isArray(characterMoves[ID]))return;
const url=new URL('meilin-low-hd.webp?v=56906c6b',document.currentScript.src).href;
const atlas=new Image();
const oldDraw=drawFighter,oldReach=strikeInReach;
let ready=false;
const ok=()=>atlas.complete&&atlas.naturalWidth===2400&&atlas.naturalHeight===1200;
function install(){
 if(ready||!ok())return;
 const list=characterMoves[ID],targets=[];
 for(let i=0;i<list.length;i++){
  const move=list[i];if(!Array.isArray(move?.phases))continue;
  move.phases.forEach((phase,j)=>{if(phase.level==='low'||['rasteira','lowpush','lowsweep','lowback','lowswitch'].includes(phase.key))targets.push([i,j]);});
 }
 // B and LB retain their original phase counts, costs and damage, with a low contact.
 for(const i of [1,4])if(list[i]?.phases?.length&&!targets.some(([n])=>n===i))targets.push([i,0]);
 targets.forEach(([i,j],n)=>{
  const move=list[i],phase=move.phases[j];
  phase.meilinHDLow=n%2?3:2;phase.level='low';
  if(j===0)move.level='low';
 });
 ready=true;
 window.RODAMeilinHD1=Object.freeze({version:'1.0',fighterId:ID,nativeAtlas:[2400,1200],lowContacts:targets.length,fullRedraw:false});
}
function phaseFor(p,m){return p.attack==null?null:moveFor(p,p.attack)?.phases?.[m.phase];}
function chosenFrame(p){
 if(!ready||!ok()||p.hp<=0||p.down>0||p.stun>0||p.rollTime>0||p.y>0||p.takeoff>0||p.landing>0||p.vy)return null;
 if(p.attack==null){if(p.travelDirection||Math.abs(p.vx||0)>.25)return null;return p.crouch?1:0;}
 const b=moveFor(p,p.attack);if(!b)return null;
 if(p.at<b.start||p.at>=b.start+b.active)return p.crouch?1:0;
 const m=attackPhase(b,p.at),q=phaseFor(p,m);
 if(!q?.meilinHDLow)return null;
 const ratio=m.phaseFrame/Math.max(1,m.frames);
 return ratio<.25?1:ratio<.75?q.meilinHDLow:4;
}
function drawHD(p,index){
 const t=fighterTraits[ID],h=visualHeight(ID),width=window.RODAFighterScale?.stablePhysiques?.[ID]??t.build;
 const d=redesignData[ID],target=305*d.rects[0][3]/d.referenceHeight;
 const f=target/REF;
 ctx.save();ctx.filter='none';ctx.fillStyle='#10190f66';ctx.beginPath();ctx.ellipse(p.x,592,82*width,14,0,0,Math.PI*2);ctx.fill();
 ctx.translate(p.x,590-p.y);ctx.scale(p.dir*h*width,h);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(atlas,(index%3)*TILE_W,Math.floor(index/3)*TILE_H,TILE_W,TILE_H,-TILE_W*f/2,-FLOOR*f,TILE_W*f,TILE_H*f);ctx.restore();
 if(p.combo>=2&&p.comboTimer>0){text(p.combo+' HIT',p.x,205,34,'#ffdb6e','center');text('COMBINATION',p.x,225,12,'#eee6c8','center');}
}
drawFighter=function(p){
 if(p?.id===ID){const frame=chosenFrame(p);if(frame!==null){drawHD(p,frame);return;}}
 return oldDraw.apply(this,arguments);
};
strikeInReach=function(p,opp,m){
 if(ready&&p?.id===ID&&phaseFor(p,m)?.meilinHDLow){const ratio=m.phaseFrame/Math.max(1,m.frames);return ratio>=.25&&ratio<.75&&Math.abs(opp.x-p.x)<m.range;}
 return oldReach.apply(this,arguments);
};
atlas.addEventListener('load',install,{once:true});atlas.src=url;if(ok())install();
})();
