const zingaKit=(()=>{
 const root=new URL('./',document.currentScript.src);
 const sheets={};for(const name of Object.keys(zingaFrames)){const im=new Image();im.src=new URL(name+'.webp',root);sheets[name]=im;}
 function move(slot,name,poses,low=false){
  const frames=low?12:10;
  const phases=poses.map((pose,index)=>{
   const last=index===poses.length-1;
   const key=low?'rasteira':pose===6||pose===7?'au':pose===5?'costas':pose===16?'chapa':'bencao';
   return {...coxaPhase(pose,low?5:poses.length===1?10:5,low?'low':pose===4?'mid':'high',key,low?179:198),
    rank:low||slot<2?1:2,frames,travel:0,push:last?3:0,knockdown:low&&last};
  });
  return {...coxaMove(slot,name,phases),cost:0,rank:slot<2||low?1:2,signature:null,label:low?'SWEEP COMBO':poses.length===3?'THREE-KICK COMBO':'SINGLE KICK',
   start:low?6:5,active:frames*poses.length,end:low?10:8,phases};
 }
 characterMoves[3]=[
  move(0,'Quick front kick',[4]),move(1,'Rear heel kick',[5]),move(2,'Fast side kick',[16]),move(3,'Handstand kick',[7]),
  move(4,'Cartwheel → side kick → heel',[6,16,5]),move(5,'Front kick → heel → handstand',[4,5,7])
 ];
 const low=[
  move(0,'Inside hook → floor kick',[36,38],true),move(1,'Outside heel → inside hook',[37,36],true),
  move(2,'Floor kick → spinning sweep',[38,39],true),move(3,'Spinning sweep → outside heel',[39,37],true)
 ];
 fighterTraits[3].speed=fighterTraits[COXA_ID].speed*1.25;
 fighterPlans[3]='Fast Coxa style · LB/RB three-hit chains · Down + attack sweeps';
 function draw(p){
  let sheet='movement',frame=0;
  if(p.hp<=0||p.down>0)frame=p.hp>0&&p.down<10?11:7;
  else if(p.stun>0&&!p.guardStun)frame=6;
  else if(p.rollTime>0){const step=Math.min(3,Math.floor((24-p.rollTime)/6));frame=8+(p.rollDirection===p.dir?step:3-step);}
  else if(inJump(p)||p.landing>0)frame=p.takeoff>0||p.landing>0?3:p.vy>0?4:5;
  else if(p.attack!==null){
   const m=moveFor(p,p.attack),ph=attackPhase(m,p.at),active=p.at>=m.start&&p.at<m.start+m.active;
   if(p.attackCrouched){sheet='sweeps';const i=ph.pose-36;frame=active&&ph.phaseFrame<9?[7,5,9,11][i]:[1,4,8,10][i];}
   else{sheet='strikes';frame=active&&ph.phaseFrame<8?({4:2,5:3,16:4,6:7,7:9})[ph.pose]:ph.pose===6||ph.pose===7?6:1;}
  }else frame=p.crouch?2:Math.floor((p.ginga||0)/16)%2;
  const im=sheets[sheet];if(!im.naturalWidth)return;
  const box=zingaFrames[sheet][frame],scale=287/zingaFrames[sheet][0][3];
  ctx.save();ctx.translate(p.x,590-p.y);ctx.scale(p.dir/fighterTraits[p.id].build,1);
  ctx.drawImage(im,...box,-box[2]*scale/2,-box[3]*scale,box[2]*scale,box[3]*scale);ctx.restore();
 }
 return {low:[...low,low[0],low[3]],draw};
})();
