/*
 * RODA v2.7 — Meilin-only sprite geometry repair.
 * Loads AFTER game-v24.js and stage-player-v24.js.
 * Non-destructive: never changes fighter stats, moves, stage selection or scoring.
 * Only activates for the verified original 2048x256 Meilin image assets.
 */
(() => {
  'use strict';
  const ID = 7;
  const CELL = 256;
  const SHEET_W = 2048;
  const SHEET_H = 256;
  const STANCE_TOP = 80;
  const STANCE_BOTTOM = 240;
  const STANCE_HEIGHT = STANCE_BOTTOM - STANCE_TOP; // observed alpha bounds: 160 px
  const DISPLAY_HEIGHT = 305;
  const SCALE = DISPLAY_HEIGHT / STANCE_HEIGHT;
  const GROUND_Y = 590;
  const FRAMES_GINGA = 6;  // the last two 256px cells are fully transparent
  const FRAMES_FLIP = 8;

  const originalGinga = window.drawGinga;
  const originalFlip = window.drawVeteranFlip;
  if (typeof originalGinga !== 'function' || typeof originalFlip !== 'function') {
    console.warn('[RODA Meilin fix] Missing game renderer; hotfix not applied.');
    return;
  }

  const validSheet = im => im && im.complete && im.naturalWidth === SHEET_W && im.naturalHeight === SHEET_H;

  function drawCell(p, im, index) {
    const frame = Math.max(0, Math.min(FRAMES_FLIP - 1, Math.trunc(index) || 0));
    ctx.save();
    ctx.translate(p.x, GROUND_Y - p.y);
    ctx.scale(p.dir, 1);
    // Source artwork shares the same frame origin and a 240px floor line.
    // Do not independently resize aerial poses to their bounding boxes.
    ctx.drawImage(im, frame * CELL, 0, CELL, CELL,
      -CELL * SCALE / 2, -STANCE_BOTTOM * SCALE, CELL * SCALE, CELL * SCALE);
    ctx.restore();
  }

  window.drawGinga = function repairedGinga(p) {
    if (p.id !== ID || !validSheet(gingaImagesV26[ID])) return originalGinga(p);
    const im = gingaImagesV26[ID];
    // Recalculate cycle length from the six REAL frames; never request blank 6 or 7.
    const cycle = FRAMES_GINGA * 22;
    const phase = ((p.ginga % cycle) + cycle) % cycle;
    const index = Math.abs(p.vx) > 0.25 ? Math.floor(phase / 22) : 0;
    drawCell(p, im, index);
  };

  window.drawVeteranFlip = function repairedFlip(p) {
    if (p.id !== ID || !validSheet(flipImages[ID])) return originalFlip(p);
    const base = moveFor(p, p.attack);
    const phase = attackPhase(base, p.at);
    const index = p.at < base.start ? 0
      : p.at >= base.start + base.active ? 7
      : 1 + phase.phase * 2 + (phase.phaseFrame >= 7 ? 1 : 0);
    drawCell(p, flipImages[ID], index);
  };
})();
