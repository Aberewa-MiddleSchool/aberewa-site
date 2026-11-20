const defeatImages=Object.fromEntries(Object.entries(defeatData).map(([id,d])=>{const im=new Image();im.src=d.src;return [id,im]}));
function drawDefeat(p){
 const d=defeatData[p.id],im=defeatImages[p.id];if(!im?.complete||!im.naturalWidth)return;
 const tempos=[7,6,10,7,5,8,6,8,5,7,9,11,5,10,12];
 const age=Math.max(0,tick-p.hitAt),frame=p.y>0?1:Math.min(5,Math.floor(age/tempos[p.id]));
 const r=d.rects[frame],f=305/d.referenceHeight;
 ctx.save();ctx.translate(p.x,590-p.y);ctx.scale(p.dir,1);
 ctx.drawImage(im,...r,-r[2]*f/2,-r[3]*f,r[2]*f,r[3]*f);ctx.restore();
}
