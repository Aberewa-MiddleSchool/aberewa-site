const duoKit=(()=>{
 const root=new URL('./',document.currentScript.src);
 const art={};
 for(const [id,name] of [[11,'bento'],[13,'nestor']]){
  const image=new Image();image.src=new URL(name+'.webp',root);art[id]=image;
 }
 const acrobatics=new Image();acrobatics.src=new URL('inversions.webp',root);
 const movement=new Image();movement.src=new URL('movement.webp',root);
 const rolls=new Image();rolls.src=new URL('rolls.webp',root);
 const attacks={
  11:[
   ['Front kick → rear push',[4,4]],['Shin kick → side kick',[8,5]],
   ['Body kick → high round kick',[4,6]],['Side kick → back kick',[5,7]],
   ['Planted side kick',[10]],['Turning heel kick',[11]]
  ],
  13:[
   ['Lead front kick',[4]],['Rear push kick',[5]],['High straight kick',[6]],['Straight back kick',[7]],
   ['Cartwheel combination',[10,10,5,4]],['Handstand scissors',[11,11,7,7]]
  ]
 };
 function build(id,slot,name,poses,sweep=false){
  const heavy=id===11,power=heavy&&slot>=4;
  const frames=heavy?16:10;
  const phases=poses.map((pose,i)=>{
   const low=sweep||(heavy&&slot===1&&i===0)||(!heavy&&slot===4&&i===2);
   const key= sweep?'rasteira':pose===6?'martelo':pose===7?'costas':pose===5?'chapa':'bencao';
   return {...techniqueBook[key],key,pose,frames,rank:power?3:slot<2?1:2,travel:0,
    level:low?'low':[6,10,11].includes(pose)&&!power?'high':'mid',range:power?210:190,
    damage:power?29:sweep?(heavy?15:8):heavy?10:poses.length===1?7:3.5,
    push:i===poses.length-1?3:0,knockdown:i===poses.length-1&&(sweep||power)};
  });
  return {...moves[slot],...phases[0],name,signature:power?name:null,label:power?'POWER KICK':sweep?'SWEEP':poses.length+' HIT',
   cost:power?moves[slot].cost:0,retreat:0,start:power?21:heavy?12:5,end:power?27:heavy?17:7,active:poses.length*frames,phases};
 }
 const lows={11:{1:build(11,1,'Low ankle sweep',[8],true)},13:{1:build(13,1,'Inward ankle sweep',[8],true),2:build(13,2,'Outward heel sweep',[9],true)}};
 for(const id of [11,13])characterMoves[id]=attacks[id].map(([name,poses],slot)=>build(id,slot,name,poses));
 fighterPlans[11]='Heavy two-hit kicks · LB/RB single power kicks · Down+B sweeps';
 fighterPlans[13]='Fast straight kicks · LB cartwheel · RB handstand · Down+B/X sweeps';
 fighterTraits[11].speed=3.6;fighterTraits[13].speed=6.25;
 function draw(p){
  let sheet=art[p.id],invertedIndex=-1;
  if(!sheet?.naturalWidth||p.down>0||(p.stun>0&&!p.guardStun)||p.hp<=0)return false;
  let pose=[0,1,2,1][Math.floor(p.ginga/(p.id===11?17:10))%4]||0;
  if(p.attack!==null){
   const move=moveFor(p,p.attack),phase=attackPhase(move,p.at),age=p.at-move.start;
   pose=age<0||age>=move.active?3:phase.pose;
   if(age>=0&&age<move.active&&phase.phaseFrame>=phase.frames*.77)pose=(phase.pose===10||phase.pose===11)&&p.id===13?phase.pose:3;
   if(p.id===13&&p.attack>=4&&age>=0&&age<move.active&&acrobatics.naturalWidth){
    invertedIndex=(p.attack-4)*4+phase.phase;sheet=acrobatics;
   }
  }
  let movementIndex=0;
  if(p.attack===null){
   if(p.y>0||p.vy!==0)movementIndex=p.vy>0?3:4;
   else if(p.takeoff>0||p.landing>0)movementIndex=2;
   else if(p.crouch)movementIndex=1;
  }
  let box=invertedIndex>=0?duoInversions[invertedIndex]:duoFrames[p.id][pose],scale=invertedIndex>=0?286/duoInversions[3][3]:286/duoFrames[p.id][1][3];
  if(p.rollTime>0&&rolls.naturalWidth){
   const row=duoRolls[p.id],step=Math.min(3,Math.floor((24-p.rollTime)/6));
   const forward=p.rollDirection===(p.abimbolaRollFacing??p.dir);
   box=row[forward?1+step:4-step];scale=286/row[0][3];sheet=rolls;
  }else if(movementIndex&&movement.naturalWidth){
   const row=duoMovement[p.id];
   box=row[movementIndex];scale=286/row[0][3];sheet=movement;
  }
  ctx.save();ctx.translate(p.x,590-p.y);ctx.scale(p.dir/fighterTraits[p.id].build,1);
  ctx.drawImage(sheet,...box,-box[2]*scale/2,-box[3]*scale,box[2]*scale,box[3]*scale);ctx.restore();return true;
 }
 return {lows,draw};
})();
