/* RODA: Meilin HD2. All combat states use only the approved costume artwork. */
(() => {
'use strict';
const ID=7, W=800,H=680,FLOOR=640,HEIGHT=310;
if(typeof drawFighter!=='function'||typeof strikeInReach!=='function'||typeof attackPhase!=='function'||typeof moveFor!=='function'||!Array.isArray(characterMoves[ID]))return;
const baseURL=document.currentScript.src;
const specs={low:[3,2,471,'ae1c0231'],mid:[3,2,466,'72434615'],high:[3,2,476,'310e2685'],turn:[3,2,475,'13f44e1c'],jump:[3,2,439,'8257a0a6'],hit:[2,2,596,'c172c443'],down:[3,2,470,'3e72ac70'],roll:[6,2,310,'a881ceff']};
const sheets={};
for(const [key,[cols,rows,ref,hash]] of Object.entries(specs)){
 const im=new Image();sheets[key]={im,cols,rows,ref};im.src=new URL('hd2/meilin-'+key+'-hd.webp?v='+hash,baseURL).href;
}
function loaded(key){const s=sheets[key];return !!s?.im.complete&&s.im.naturalWidth===W*s.cols&&s.im.naturalHeight===H*s.rows;}
const oldDraw=drawFighter,oldReach=strikeInReach;
const lowKeys=new Set(['rasteira','lowpush','lowsweep','lowback','lowswitch','lowchapa']);
const turnKeys=new Set(['costas','armada','compasso','meialuadecostas','meia-lua-de-costas','au']);
const highKeys=new Set(['frente','martelo']);
const moves=characterMoves[ID];
// Retain the exact live combo count, timings, damage, cost and button mapping.
// Maintain the two low-kick entries requested and already installed in HD1.
for(const i of [1,4]){const b=moves[i];if(!b?.phases?.length)continue;if(!b.phases.some(q=>q.level==='low'||lowKeys.has(q.key))){b.phases[0].level='low';b.level='low';}}
function style(m){if(m.level==='low'||lowKeys.has(m.key))return 'low';if(turnKeys.has(m.key))return 'turn';if(m.level==='high'||highKeys.has(m.key))return 'high';return 'mid';}
function timeRatio(m){return Math.max(0,Math.min(.99999,(Number(m.phaseFrame)||0)/Math.max(1,Number(m.frames)||1)));}
function attackFrame(m){return [style(m),[1,2,3,4][Math.floor(timeRatio(m)*4)]];}
function frameAt(list,t){return list[Math.max(0,Math.min(list.length-1,Math.floor(t*list.length)))];}
function pose(p){
 const age=Math.max(0,tick-(p.hitAt??-100));
 if(p.hp<=0||p.down>0){if(age<7)return ['down',0];if(age<14)return ['down',1];if(age<20)return ['down',2];if(p.hp<=0||p.down>14)return ['down',3];return p.down>7?['down',4]:['low',0];}
 if(p.stun>0&&!p.guardStun)return ['hit',age<7?0:p.impactKind==='high'&&age<16?1:2];
 if(p.rollTime>0){const backward=p.rollDirection!==(p.meilinRollFacing??p.dir),i=frameAt([0,1,2,3,4,5],(24-p.rollTime)/24);return i===5?['low',0]:['roll',(backward?6:0)+i];}
 if(p.takeoff>0)return ['jump',0];
 if(p.y>0||p.vy)return ['jump',p.vy>5?2:p.vy>=-5?3:4];
 if(p.landing>0)return ['jump',0];
 if(p.attack!==null&&p.attack!==undefined){const b=moveFor(p,p.attack);if(b&&p.at>=b.start&&p.at<b.start+b.active)return attackFrame(attackPhase(b,p.at));return ['low',p.attackCrouched?1:0];}
 if(p.crouch)return ['low',1];
 if(p.travelDirection&&Math.abs(p.vx||0)>.25&&!p.block){const i=frameAt([0,1,2,3,4,5],((p.travelDistance||0)%120)/120);return i===5?['low',0]:['roll',(p.travelDirection===p.dir?0:6)+i];}
 return ['low',0];
}
function paint(p,key,i){
 // During loading, use only the approved new stance; never the legacy sheets.
 if(!loaded(key)){key='low';i=0;}if(!loaded(key))return;
 const s=sheets[key],f=HEIGHT/s.ref,ground=590-(p.y||0),dir=p.rollTime>0?(p.meilinRollFacing??p.dir):p.dir;
 ctx.save();ctx.filter='none';ctx.fillStyle='#10190f66';ctx.beginPath();ctx.ellipse(p.x,592,Math.max(18,82*(1-(p.y||0)/420)),Math.max(5,14-(p.y||0)*.025),0,0,Math.PI*2);ctx.fill();
 ctx.translate(p.x,ground);ctx.scale(dir===-1?-1:1,1);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(s.im,(i%s.cols)*W,Math.floor(i/s.cols)*H,W,H,-W*f/2,-FLOOR*f,W*f,H*f);ctx.restore();
 if(p.combo>=2&&p.comboTimer>0){text(p.combo+' HIT',p.x,205,34,'#ffdb6e','center');text('COMBINATION',p.x,225,12,'#eee6c8','center');}
}
function renderMeilin(p){paint(p,...pose(p));}
// This outer renderer is the last script in the combat load order. It owns all
// of fighter 7's poses, without falling through to old drawFighterBody/roll art.
drawFighter=function(p){if(p?.id===ID){renderMeilin(p);return;}return oldDraw.apply(this,arguments);};
const oldRoll=updateRoll;
updateRoll=function(p,input,dt){if(p?.id!==ID)return oldRoll.apply(this,arguments);const before=p.rollTime||0,dir=p.dir;const result=oldRoll.apply(this,arguments);if(!before&&p.rollTime>0)p.meilinRollFacing=dir;if(!(p.rollTime>0))p.meilinRollFacing=null;return result;};
// Strike windows now correspond to the drawn extension, not the old frames.
strikeInReach=function(p,opp,m){if(p?.id!==ID)return oldReach.apply(this,arguments);const t=timeRatio(m),k=style(m);return t>=(k==='turn'?.5:.25)&&t<.75&&Math.abs(opp.x-p.x)<m.range;};
window.RODAMeilinHD2=Object.freeze({version:'2.0',fighterId:ID,gingaHeight:HEIGHT,exclusiveArt:true,atlases:Object.freeze(Object.keys(sheets)),get ready(){return Object.keys(sheets).every(loaded);},get hitCounts(){return moves.map(m=>m.phases?.length||1);}});
})();
