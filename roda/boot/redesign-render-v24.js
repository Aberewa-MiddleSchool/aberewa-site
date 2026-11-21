// One identity sheet per redesigned fighter: every state uses the same face and clothes.
function drawRedesignFrame(p,index,breathing=false){
 const d=redesignData[p.id],im=redesignImages[p.id];if(!im?.complete||!im.naturalWidth)return;
 const r=d.rects[index],f=305/d.referenceHeight,x=(r[0]-d.anchors[index])*f,y=-r[3]*f,w=r[2]*f,h=r[3]*f;
 ctx.save();ctx.translate(p.x,590-p.y);ctx.scale(p.dir,1);
 ctx.drawImage(im,...r,x,y,w,h);
 ctx.restore();
}
function redesignedRow(p,m){
 if(p.id===7)return ({lowpush:2,lowsweep:3,lowback:4,lowswitch:5})[m.visual]??3;
 if(m.level==='low')return 3;
 return ({push:2,sweep:3,crescent:4,back:5,turn:5,side:6,hook:4,wheel:7})[m.visual]??2;
}
function drawRedesignedAttack(p){
 const base=moveFor(p,p.attack),m=attackPhase(base,p.at),d=redesignData[p.id];
 let row,frame;
 if(d.authored){
  row=base.crouching?4:base.authoredRow;
  if(p.at<base.start)frame=base.phases.length===3&&!base.crouching?0:Math.min(3,Math.floor(p.at/base.start*4));
  else if(p.at>=base.start+base.active)frame=6+Math.min(1,Math.floor((p.at-base.start-base.active)/base.end*2));
  else if(base.phases.length===3&&!base.crouching)frame=1+m.phase*2+(m.phaseFrame>=m.frames*.65?1:0);
  else frame=m.phaseFrame<m.frames*.65?4:5;
 }else{
  row=redesignedRow(p,m);
  if(p.at<base.start)frame=Math.min(3,Math.floor(p.at/base.start*4));
  else if(p.at>=base.start+base.active)frame=6+Math.min(1,Math.floor((p.at-base.start-base.active)/base.end*2));
  else frame=m.phaseFrame<m.frames*.65?4:5;
 }
 if(d.authored&&[4,6].includes(p.id)&&base.phases.length===3&&p.at>=base.start&&p.at<base.start+base.active&&m.key==='bencao'){row=3;frame=m.phaseFrame<m.frames*.65?4:5;}
 ctx.save();
 drawRedesignFrame(p,row*8+frame);ctx.restore();
 if(p.attack>=4&&p.at>=base.start&&p.at<base.start+base.active){
  ctx.save();ctx.strokeStyle=fighterTraits[p.id].accent;ctx.globalAlpha=.6;ctx.lineWidth=4;
  ctx.beginPath();ctx.arc(p.x+p.dir*35,590-p.y-(m.level==='low'?55:150),65+m.phase*12,-1.2+p.at*.14,1+p.at*.14);ctx.stroke();ctx.restore();
 }
}
function drawRedesignedFighter(p){
 if(p.hp<=0||p.down>0){drawRedesignFrame(p,tick-p.hitAt<8?(p.reaction===4?4:3):p.down<14?6:5);return}
 if(p.stun>0&&!p.guardStun){drawRedesignFrame(p,p.reaction===4?4:3);return}
 if(p.attack!==null){drawRedesignedAttack(p);return}
 if(p.takeoff>0||p.landing>0){drawRedesignFrame(p,p.takeoff>0?12:15);return}
 if(p.y>0){drawRedesignFrame(p,p.vy>0?13:14);return}
 if(Math.abs(p.vx)>.25&&!p.crouch){
  const phase=((p.ginga%48)+48)%48,frame=8+Math.floor(phase/12);
  ctx.save();ctx.translate(-(phase%12)*p.dir,0);drawRedesignFrame(p,frame);ctx.restore();return;
 }
 if(p.block){drawRedesignFrame(p,p.crouch?2:1);text(p.crouch?'LOW GUARD':'GUARD',p.x,590-(p.id===7?205:330),12,'#bdfaff','center');if(p.guardStun){ctx.strokeStyle='#bdfaff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x+p.dir*45,590-(p.id===7||p.crouch?100:195),50,-1.3,1.3);ctx.stroke()}return}
 if(p.crouch){drawRedesignFrame(p,2,true);return}
 drawRedesignFrame(p,0,true);
}
function drawPrivateArena(){
 const im=privateArenaImages[activeStage-18];if(im?.complete&&im.naturalWidth)ctx.drawImage(im,0,0,W,H);
 // Quiet warm lamp glow indoors; water reflections and drifting petals in the garden.
 ctx.save();
 if(activeStage===20){for(let i=0;i<10;i++){const x=610+(i*17)%150,y=356+(i*7)%24;ctx.strokeStyle=`rgba(245,211,139,${.12+.08*Math.sin(tick*.027+i)})`;ctx.beginPath();ctx.moveTo(x+Math.sin(tick*.02+i)*3,y);ctx.lineTo(x+12+Math.sin(tick*.02+i)*3,y);ctx.stroke()}
 for(let i=0;i<7;i++){ctx.fillStyle='#df91a299';ctx.beginPath();ctx.ellipse((tick*.3+i*193)%1280,175+(tick*.14+i*39)%220,3,1.5,tick*.015+i,0,Math.PI*2);ctx.fill()}}
 else {ctx.globalAlpha=.045+.028*Math.sin(tick*.025);ctx.fillStyle='#ffd175';ctx.fillRect(0,0,W,H)}
 ctx.restore();
}
