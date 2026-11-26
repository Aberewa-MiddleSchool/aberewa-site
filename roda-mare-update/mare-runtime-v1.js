/* RODA - Mestre Mare exclusive raster atlas; fighter ID 14 only. */
const MARE_ID=14;
const mareAtlas=new Image();
mareAtlas.src=new URL('mare-atlas.webp?v=1b76655a',document.currentScript.src).href;
const MARE_ART=Object.freeze({
 idle:0,crouch:1,jump:[2,3,4,5,6,7],forward:[24,25,26,27,28,29],backward:[30,31,32,33,34,35],recover:[36,37,38,39],hit:[45,46,47,48]
});
const MARE_TECHNIQUES=Object.freeze({
 high:{name:'Meia-lua de frente',level:'high',art:[9,10,10,11],contact:1,range:205},
 cartwheel:{name:'Aú batido',level:'mid',art:[12,13,14,15],contact:2,range:220},
 back:{name:'Chapa de costas',level:'mid',art:[17,18,19,20],contact:2,range:215},
 back2:{name:'Chapa de costas',level:'mid',art:[20,21,21,22],contact:1,range:215},
 sweep:{name:'Rasteira',level:'low',art:[40,40,41,42],contact:1,range:205},
 rising:{name:'Aú com chapa',level:'high',art:[42,43,43,44],contact:1,range:220}
});
const MARE_CHAINS=[['high','back'],['sweep','rising'],['high','cartwheel'],['back','back2'],['cartwheel','high'],['back','cartwheel'],['sweep','back'],['rising','sweep']];
function installMareMoves(){
 const base=characterMoves[MARE_ID][0];
 const buttons=['A','B','X','Y','LB','RB','LT','RT'];
 characterMoves[MARE_ID]=MARE_CHAINS.map((pair,i)=>{
  const phases=pair.map((key,j)=>({...MARE_TECHNIQUES[key],pose:0,key,frames:24,damage:7.5,travel:0,push:j===1?4:0,knockdown:j===1,rank:2,cost:0,powerKick:false}));
  return {...base,...phases[0],button:buttons[i],name:phases.map(p=>p.name).join(' → '),signature:null,label:'TWO HITS · 15% TOTAL',cost:0,start:7,active:48,end:10,retreat:0,phases};
 });
}
function marePick(a,t){return a[Math.min(a.length-1,Math.max(0,Math.floor(t*a.length)))];}
function marePose(p){
 const age=Math.max(0,tick-(p.hitAt??-100));
 if(p.hp<=0||p.down>0){if(age<7)return 45;if(age<15)return 46;if(p.hp<=0||p.down>14)return 36;return marePick([37,38,39],1-p.down/14);}
 if(endWait>0&&players[matchWinner]===p)return MARE_ART.idle;
 if(p.stun>0&&!p.guardStun)return age<6?45:age<14?46:47;
 if(p.rollTime>0){const facing=p.mareRollFacing??p.dir;return marePick(p.rollDirection===facing?MARE_ART.forward:MARE_ART.backward,(24-p.rollTime)/24);}
 if(p.takeoff>0)return 2;
 if(p.y>0||p.vy!==0)return p.vy>0?(p.y<75?3:4):(p.y>75?5:6);
 if(p.landing>0)return 7;
 if(p.attack!==null&&p.attack!==undefined){
  const b=moveFor(p,p.attack);
  if(p.at<b.start)return p.attackCrouched?MARE_ART.crouch:MARE_ART.idle;
  if(p.at>=b.start+b.active)return MARE_ART.idle;
  const m=attackPhase(b,p.at);
  return m.art?marePick(m.art,m.phaseFrame/m.frames):MARE_ART.idle;
 }
 if(p.crouch)return MARE_ART.crouch;
 return MARE_ART.idle;
}
function drawMareAt(c,index,x,y,dir=1,opacity=1){
 if(!mareAtlas.complete||!mareAtlas.naturalWidth)return;
 const i=Number.isInteger(index)&&index>=0&&index<49?index:0;
 // Fixed floor anchor, fixed scale. No pose-dependent resizing or body rotation.
 const f=305/152;
 c.save();c.filter='none';c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.globalAlpha*=opacity;
 c.translate(x,y);c.scale(dir,1);c.drawImage(mareAtlas,(i%8)*320,Math.floor(i/8)*280,320,280,-160*f,-250*f,320*f,280*f);c.restore();
}
function drawMare(p){drawMareAt(ctx,marePose(p),p.x,590-p.y,p.rollTime>0?(p.mareRollFacing??p.dir):p.dir);}
function drawMareFighter(p){
 const t=fighterTraits[MARE_ID],h=visualHeight(MARE_ID);
 ctx.fillStyle='#10190f66';ctx.beginPath();ctx.ellipse(p.x,592,Math.max(18,82*(1-p.y/420))*t.build,Math.max(5,14-p.y*.025),0,0,Math.PI*2);ctx.fill();
 ctx.save();ctx.translate(p.x,590-p.y);ctx.scale(h*t.build,h);ctx.translate(-p.x,-(590-p.y));drawMare(p);ctx.restore();
 if(p.combo>=2&&p.comboTimer>0){text(p.combo+' HIT',p.x,205,34,'#ffdb6e','center');text('COMBINATION',p.x,225,12,'#eee6c8','center');}
}
function mareLegacyPose(kind,frame){
 const a=kind==='extra'?[45,46,36,38,24,25,26,29]:kind==='cycles'?[9,10,11,0,17,18,19,22,17,18,19,22,12,13,14,15,2,3,4,5,6,7]:kind==='base'?[0,0,10,10,1,40,14,19]:[0];
 return a[Math.max(0,Math.min(a.length-1,Math.floor(frame)||0))];
}
function mareIntroPose(part,age){const rows=[[0],[9,10,11,0],[17,18,19,20,21,22,0],[40,41,42,43,44,0]];return rows[part][Math.floor(age/24)%rows[part].length];}
function installMareFinalGuard(){
 const prior=drawFighter;
 if(prior.mareExclusive)return;
 const guard=function(p){if(p.id===MARE_ID){drawMareFighter(p);return;}return prior.apply(this,arguments);};
 guard.mareExclusive=true;drawFighter=guard;
}
