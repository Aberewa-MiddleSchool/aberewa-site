'use strict';
const campaignStageArt = new Map();
function arenaArt(file) {
 if (!campaignStageArt.has(file)) {
  const image=new Image();
  image.src=file;
  campaignStageArt.set(file,image);
 }
 return campaignStageArt.get(file);
}
// Begin loading the Solar Studio before the first fight frame needs it.
arenaArt(arenas[homeStageFor(3)].file);
let lastReadyArena;
window.drawArena=function(){
 let arena=arenas[activeStage]??arenas[DEFAULT_STAGE];
 let image=arenaArt(arena.file);
 if (!image.naturalWidth) {
  if (!lastReadyArena) {ctx.drawImage(stage,0,0,W,H);return;}
  arena=lastReadyArena;
  image=arenaArt(arena.file);
 }
 lastReadyArena=arena;
 if (arena.tile===undefined) {
  ctx.drawImage(image,0,0,W,H);
  return;
 }
 // These paintings are packed two across and three down on the original stage sheets.
 const width=image.naturalWidth/2, height=image.naturalHeight/3;
 ctx.drawImage(image,(arena.tile%2)*width,Math.floor(arena.tile/2)*height,width,height,0,0,W,H);
};
