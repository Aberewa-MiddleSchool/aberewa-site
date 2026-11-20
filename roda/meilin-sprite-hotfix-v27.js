/* RODA v2.7.4: Meilin sprite geometry and size matching. Other fighters untouched. */
(() => {
  'use strict';
  const ID = 7, CELL = 256, SHEET_W = 2048, SHEET_H = 256;
  const GINGA_FRAMES = 6, FLIP_FRAMES = 8;
  const GINGA_HEIGHT = 160; // measured standing silhouette in source frame 0
  const FLIP_STANCE_HEIGHT = 143; // measured standing pose in flip frames 0 and 7
  const FLOOR_IN_FRAME = 240;
  const previousGinga = typeof drawGinga === 'function' ? drawGinga : null;
  const previousFlip = typeof drawVeteranFlip === 'function' ? drawVeteranFlip : null;
  const previousHeight = typeof visualHeight === 'function' ? visualHeight : null;
  if (!previousGinga || !previousFlip || !previousHeight) {
    console.warn('[RODA] Missing original renderer. Meilin fix safely skipped.');
    return;
  }
  const isOriginal = image => !!image?.complete && image.naturalWidth === SHEET_W && image.naturalHeight === SHEET_H;
  function standingTarget() {
    // Keep the same idle stature as Meilin's other authored redesign poses.
    const data = typeof redesignData !== 'undefined' && redesignData[ID];
    const reference = Number(data?.referenceHeight);
    const sourceHeight = Number(data?.rects?.[0]?.[3]);
    return reference > 0 && sourceHeight > 0 ? 305 * sourceHeight / reference : 305;
  }
  function drawFrame(p, img, frame, visibleReferenceHeight) {
    const scale = standingTarget() / visibleReferenceHeight;
    const index = Math.max(0, Math.min(7, Math.trunc(frame) || 0));
    ctx.save();
    ctx.translate(p.x, 590 - p.y);
    ctx.scale(p.dir, 1);
    // Fix the common floor line; do not rescale individual airborne frames.
    ctx.drawImage(img, index * CELL, 0, CELL, CELL,
      -CELL * scale / 2, -FLOOR_IN_FRAME * scale, CELL * scale, CELL * scale);
    ctx.restore();
  }
  visualHeight = function rodaMeilinVisualHeight(id) {
    return Number(id) === ID ? 1 : previousHeight(id);
  };
  drawGinga = function rodaMeilinGinga(p) {
    const img = typeof gingaImagesV26 !== 'undefined' && gingaImagesV26[ID];
    if (p.id !== ID || !isOriginal(img)) return previousGinga(p);
    const period = GINGA_FRAMES * 22;
    const phase = ((p.ginga % period) + period) % period;
    const frame = Math.abs(p.vx) > .25 ? Math.floor(phase / 22) : 0;
    drawFrame(p, img, frame, GINGA_HEIGHT);
  };
  drawVeteranFlip = function rodaMeilinFlip(p) {
    const img = typeof flipImages !== 'undefined' && flipImages[ID];
    if (p.id !== ID || !isOriginal(img)) return previousFlip(p);
    const move = moveFor(p, p.attack), state = attackPhase(move, p.at);
    const phase = Math.max(0, Math.min(2, state.phase | 0));
    const index = p.at < move.start ? 0 : p.at >= move.start + move.active ? 7
      : Math.min(6, 1 + phase * 2 + (state.phaseFrame >= 7 ? 1 : 0));
    drawFrame(p, img, index, FLIP_STANCE_HEIGHT);
  };
  window.RODAMeilinFix = Object.freeze({version:'v27.4',fighterId:ID,gingaFrames:GINGA_FRAMES,
    flipFrames:FLIP_FRAMES,reference:'redesigned stance'});
})();