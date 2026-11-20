/*
 * RODA v2.7 — Meilin-only sprite geometry and visual-height repair.
 * Loads AFTER game-v24.js and stage-player-v24.js.
 * Non-destructive: never changes fighter stats, moves, stage selection or scoring.
 * Pixel-crop fixes activate only for verified original 2048x256 Meilin assets.
 * Her visual height is normalized across all rendering states without altering combat stats.
 */
(() => {
  'use strict';
  const ID = 7;
  const CELL = 256;
  const SHEET_W = 2048;
  const SHEET_H = 256;
  const STANCE_BOTTOM = 240;
  const STANCE_HEIGHT = 160; // source alpha bounds y80..240
  const DISPLAY_HEIGHT = 305;
  const SCALE = DISPLAY_HEIGHT / STANCE_HEIGHT;
  const GROUND_Y = 590;
  const FRAMES_GINGA = 6;  // the last two 256px cells are fully transparent
  const FRAMES_FLIP = 8;

  const originalGinga = window.drawGinga;
  const originalFlip = window.drawVeteranFlip;
  const originalVisualHeight = window.visualHeight;
  if (typeof originalGinga !== 'function' || typeof originalFlip !== 'function' || typeof originalVisualHeight !== 'function') {
    console.warn('[RODA Meilin fix] Missing game renderer; hotfix not applied.');
    return;
  }

  // Existing drawFighter scales all Meilin poses using the fighter height ratio.
  // Normalizing this visual ratio aligns ginga, attacks, damage and flip poses.
  // No change to combat stats, hitboxes, damage, or the other fighters.
  window.visualHeight = function correctedMeilinHeight(id) {
    return Number(id) === ID ? 1 : originalVisualHeight(id);
  };

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
  window.RODAMeilinFix = Object.freeze({version:'v27.2',fighterId:ID,gingaFrames:FRAMES_GINGA,flipFrames:FRAMES_FLIP,visualHeight:1});
})();
