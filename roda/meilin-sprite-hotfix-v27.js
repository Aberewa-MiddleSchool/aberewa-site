/* RODA 3.1 — Meilin-only sprite geometry; compatible with fighter-scale-v30. */
(() => {
  'use strict';
  const ID=7, TILE=256, FLOOR=240;
  const oldGinga=typeof drawGinga==='function' ? drawGinga : null;
  const oldFlip=typeof drawVeteranFlip==='function' ? drawVeteranFlip : null;
  if(!oldGinga || !oldFlip) return;
  const sheetOK=im=>!!im?.complete && im.naturalWidth===2048 && im.naturalHeight===256;
  // Original redesign renderer uses 305 / referenceHeight on its cropped source.
  // Match its standing-pose height rather than inventing a separate on-screen height.
  function targetHeight(){
    const d=typeof redesignData!=='undefined' && redesignData[ID];
    const ref=Number(d?.referenceHeight), h=Number(d?.rects?.[0]?.[3]);
    return ref>0 && h>0 ? 305*h/ref : 305;
  }
  function draw(p,im,index,reference){
    const f=targetHeight()/reference;
    const frame=Math.max(0,Math.min(7,Math.trunc(index)||0));
    ctx.save();
    ctx.translate(p.x,590-p.y);
    ctx.scale(p.dir,1);
    // All frame tiles have a stable 240px source ground line. Inverted/tucked
    // poses keep their own foreshortening; only the standing reference is matched.
    ctx.drawImage(im,frame*TILE,0,TILE,TILE,-TILE*f/2,-FLOOR*f,TILE*f,TILE*f);
    ctx.restore();
  }
  drawGinga=function rodaMeilinGinga(p){
    const im=typeof gingaImagesV26!=='undefined' && gingaImagesV26[ID];
    if(p.id!==ID || !sheetOK(im))return oldGinga(p);
    const cycle=6*22, phase=((p.ginga%cycle)+cycle)%cycle;
    const frame=Math.abs(p.vx)>.25 ? Math.floor(phase/22) : 0;
    draw(p,im,frame,160);  // measured alpha height (frames 0–5)
  };
  drawVeteranFlip=function rodaMeilinFlip(p){
    const im=typeof flipImages!=='undefined' && flipImages[ID];
    if(p.id!==ID || !sheetOK(im))return oldFlip(p);
    const base=moveFor(p,p.attack),phase=attackPhase(base,p.at);
    const part=Math.max(0,Math.min(2,Number(phase.phase)||0));
    const frame=p.at<base.start ? 0 : p.at>=base.start+base.active ? 7
      : Math.min(6,1+part*2+(phase.phaseFrame>=7 ? 1:0));
    draw(p,im,frame,143); // measured alpha height (standing flip frames 0,7)
  };
  window.RODAMeilinFix=Object.freeze({version:'3.1',fighterId:ID,gingaFrames:6,flipFrames:8});
})();