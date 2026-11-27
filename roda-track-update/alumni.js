const trackArt=(()=>{
 const frames=[[[122,8,148,240],[484,67,154,181],[853,8,216,240],[1220,17,242,231],[56,320,288,165],[486,327,164,150],[814,278,229,206],[1173,410,312,66]],[[121,11,148,234],[484,70,154,175],[857,13,205,232],[1227,18,234,227],[55,327,289,160],[486,329,164,150],[831,277,217,208],[1173,412,312,66]],[[109,7,174,243],[480,71,183,179],[865,7,215,243],[1220,14,252,236],[48,327,301,164],[486,338,168,149],[848,269,209,221],[1171,418,341,66]],[[113,7,170,241],[483,71,178,176],[863,5,217,243],[1203,10,269,238],[48,318,300,173],[456,339,199,148],[819,268,239,222],[1171,413,341,71]],[[126,9,141,237],[492,72,152,173],[860,10,217,236],[1216,18,258,227],[53,332,285,148],[467,315,181,161],[813,268,254,215],[1173,412,346,64]],[[118,0,154,248],[495,73,150,174],[852,3,222,245],[1223,11,251,237],[35,331,309,158],[469,312,184,177],[826,268,251,227],[1169,416,336,73]],[[118,12,150,236],[490,73,139,176],[864,12,193,241],[1223,18,250,236],[61,338,280,155],[482,330,169,153],[843,276,220,217],[1176,413,333,71]],[[115,8,156,237],[488,73,147,172],[855,7,208,241],[1223,16,251,234],[49,336,304,160],[472,330,179,162],[829,278,243,217],[1165,408,346,80]],[[116,12,153,233],[481,61,167,179],[855,12,204,233],[1211,17,248,226],[56,332,284,152],[482,336,165,137],[838,276,230,209],[1178,411,332,64]],[[116,10,153,234],[481,60,167,180],[856,10,204,235],[1212,15,247,228],[56,329,284,156],[482,337,165,136],[836,272,232,214],[1180,413,330,63]]];
 const root=new URL('.',document.currentScript.src);
 const sheets=frames.map((row,i)=>{
  const image=new Image();image.src=new URL('alumnus-'+i+'.webp',root);return image;
 });
 function ready(){return sheets.every(image=>image.complete&&image.naturalWidth>0);}
 function failed(){return sheets.some(image=>image.complete&&!image.naturalWidth);}
 function pose(p){
  if(p.hp<=0||p.down>0){
   if(p.hp>0&&p.down<12)return 1;
   return tick-p.hitAt<9?6:7;
  }
  if(p.stun>0&&!p.guardStun)return 6;
  if(p.rollTime>0)return p.rollTime>20||p.rollTime<4?1:5;
  if(p.attack!==null){
   const move=moveFor(p,p.attack),phase=attackPhase(move,p.at);
   if(p.at<move.start||p.at>=move.start+move.active)return p.attackCrouched?1:0;
   if(p.attackCrouched||phase.level==='low')return 4;
   return (p.attack+phase.phase)%2?3:2;
  }
  return p.crouch||inJump(p)||p.landing>0?1:0;
 }
 function draw(p){
  const i=p.trackAthlete,row=frames[i],box=row[pose(p)],scale=286/row[0][3];
  ctx.save();ctx.translate(p.x,590-p.y);ctx.scale(p.dir,1);
  ctx.drawImage(sheets[i],...box,-box[2]*scale/2,-box[3]*scale,box[2]*scale,box[3]*scale);ctx.restore();
 }
 function portrait(i){
  const c=document.createElement('canvas'),box=frames[i][0];c.width=240;c.height=300;
  const g=c.getContext('2d');g.fillStyle='#211b31';g.fillRect(0,0,240,300);
  const h=box[3]*.72,w=h*.8;
  g.drawImage(sheets[i],box[0]+(box[2]-w)/2,box[1],w,h,0,0,240,300);
  return c;
 }
 return {ready,failed,draw,portrait};
})();
