/* RODA: native-resolution, exclusive Mestre Mare artwork, fighter ID 14. */
const MARE_ID=14;
const MARE_HD_SHEETS=['move','high','au','back','roll','mid'];
const mareAtlasImages=MARE_HD_SHEETS.map(key=>{
 const im=new Image();im.src=new URL('hd/mare-hd-'+key+'.webp?v=3',document.currentScript.src).href;return im;
});
const mareAtlas=mareAtlasImages[0];
const MARE_ART=Object.freeze({idle:0,crouch:1,jump:[2,3,4,5],forward:[0,25,26,27,28,0],backward:[0,28,27,26,25,0]});
const MARE_TECHNIQUES=Object.freeze({
 high:{name:'Chapa alta',level:'high',art:[7,8,9,10],contact:1,range:205},
 cartwheel:{name:'Aú batido',level:'mid',art:[13,14,15,16],contact:2,range:215},
 back:{name:'Chapa de costas',level:'mid',art:[19,20,21,0],contact:1,range:215},
 backFirst:{name:'Chapa de costas',level:'mid',art:[19,20,21,21],contact:1,range:215},
 back2:{name:'Chapa de costas',level:'mid',art:[21,22,21,0],contact:1,range:215},
 mid:{name:'Bênção',level:'mid',art:[31,32,31,0],contact:1,range:190},
 rising:{name:'Aú com chapa',level:'mid',art:[13,14,15,16],contact:1,range:215}
});
const MARE_CHAINS=[['high','back'],['mid','rising'],['high','cartwheel'],['backFirst','back2'],['cartwheel','high'],['back','cartwheel'],['mid','back'],['rising','mid']];
function installMareMoves(){
 const base=characterMoves[MARE_ID][0],buttons=['A','B','X','Y','LB','RB','LT','RT'];
 characterMoves[MARE_ID]=MARE_CHAINS.map((pair,i)=>{
  const phases=pair.map((key,j)=>({...MARE_TECHNIQUES[key],pose:0,key,frames:24,damage:7.5,travel:0,push:j===1?4:0,knockdown:j===1,rank:2,cost:0,powerKick:false}));
  return {...base,...phases[0],button:buttons[i],name:phases.map(p=>p.name).join(' → '),signature:null,label:'TWO HITS · 15% TOTAL',cost:0,start:7,active:48,end:10,retreat:0,phases};
 });
}
function marePick(a,t){return a[Math.min(a.length-1,Math.max(0,Math.floor(t*a.length)))];}
function marePose(p){
 const age=Math.max(0,tick-(p.hitAt??-100));
 // Temporary grounded recovery uses native poses only, never retired sprites.
 if(p.hp<=0||p.down>0){if(age<7)return 1;if(age<15)return 26;if(p.hp<=0||p.down>14)return 27;return marePick([27,28,1,0],1-p.down/14);}
 if(endWait>0&&players[matchWinner]===p)return 0;
 if(p.stun>0&&!p.guardStun)return age<12?1:2;
 if(p.rollTime>0){const facing=p.mareRollFacing??p.dir;return marePick(p.rollDirection===facing?MARE_ART.forward:MARE_ART.backward,(24-p.rollTime)/24);}
 if(p.takeoff>0)return 2;
 if(p.y>0||p.vy!==0)return p.vy>0?(p.y<75?3:4):(p.y>75?4:3);
 if(p.landing>0)return 5;
 if(p.attack!==null&&p.attack!==undefined){
  const b=moveFor(p,p.attack);
  if(p.at<b.start)return p.attackCrouched?1:0;
  if(p.at>=b.start+b.active)return 0;
  const m=attackPhase(b,p.at);
  return m.art?marePick(m.art,m.phaseFrame/m.frames):0;
 }
 if(p.crouch)return 1;
 return 0;
}
function drawMareAt(c,index,x,y,dir=1,opacity=1){
 let i=Number.isInteger(index)&&index>=0&&index<=32?index:0;
 let im=mareAtlasImages[Math.floor(i/6)],cell=i%6;
 if(!im?.complete||!im.naturalWidth){im=mareAtlas;cell=0;}
 if(!im.complete||!im.naturalWidth)return;
 const f=305/465;
 c.save();c.filter='none';c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.globalAlpha*=opacity;
 c.translate(x,y);c.scale(dir,1);c.drawImage(im,(cell%3)*800,Math.floor(cell/3)*600,800,600,-400*f,-560*f,800*f,600*f);c.restore();
}
function drawMare(p){drawMareAt(ctx,marePose(p),p.x,590-p.y,p.rollTime>0?(p.mareRollFacing??p.dir):p.dir);}
function drawMareFighter(p){
 const t=fighterTraits[MARE_ID],h=visualHeight(MARE_ID);
 ctx.fillStyle='#10190f66';ctx.beginPath();ctx.ellipse(p.x,592,Math.max(18,82*(1-p.y/420))*t.build,Math.max(5,14-p.y*.025),0,0,Math.PI*2);ctx.fill();
 ctx.save();ctx.translate(p.x,590-p.y);ctx.scale(h*t.build,h);ctx.translate(-p.x,-(590-p.y));drawMare(p);ctx.restore();
 if(p.combo>=2&&p.comboTimer>0){text(p.combo+' HIT',p.x,205,34,'#ffdb6e','center');text('COMBINATION',p.x,225,12,'#eee6c8','center');}
}
function mareLegacyPose(kind,frame){
 const a=kind==='extra'?[1,2,27,28,25,26,27,28]:kind==='cycles'?[31,32,31,0,19,20,21,0,19,20,21,0,13,14,15,16,2,3,4,3,5,0]:kind==='base'?[0,0,8,8,1,32,15,20]:[0];
 return a[Math.max(0,Math.min(a.length-1,Math.floor(frame)||0))];
}
function mareIntroPose(part,age){const rows=[[0],[0,31,32,31,0],[0,19,20,21,22,0],[0,13,14,15,16,0]];return rows[part][Math.floor(age/24)%rows[part].length];}
function installMareFinalGuard(){
 const prior=drawFighter;if(prior.mareExclusive)return;
 const guard=function(p){if(p.id===MARE_ID){drawMareFighter(p);return;}return prior.apply(this,arguments);};
 guard.mareExclusive=true;drawFighter=guard;
}
