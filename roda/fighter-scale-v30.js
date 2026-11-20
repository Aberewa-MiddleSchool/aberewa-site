/*
 * RODA v3.3 — unified standing scale, distinct stable physiques.
 *
 * All fighters share the SAME on-screen parent height in every game pose.
 * Their silhouette width is a constant per fighter, not recomputed each frame.
 * This changes no hit boxes, health, move animations, collision or rankings.
 *
 * The original character art remains distinct. Clothing re-color and
 * painted-in cords require replacement sprite textures (not available here).
 */
(() => {
  'use strict';
  const baseDraw = window.drawFighter;
  const baseHeight = window.visualHeight;
  if (typeof baseDraw !== 'function' ||
      typeof baseHeight !== 'function' ||
      typeof fighterTraits === 'undefined' ||
      !Array.isArray(fighterTraits)) {
    console.warn('[RODA 3.3] Original draw functions missing. Styling fix skipped.');
    return;
  }
  // Same vertical scale, individualized silhouette widths. Values remain
  // subtle to preserve the original character designs and recognizable poses.
  const PHYSIQUE_WIDTHS = Object.freeze([
    .96, 1.03, 1.00, 1.08, .94, 1.01, 1.06, .99,
    .97, 1.04, 1.02, 1.07, .98, 1.10, 1.04, 1.12
  ]);
  const styleWidth = fighterTraits.map((trait,id) => {
    const authored = Number(trait && trait.build);
    const target = PHYSIQUE_WIDTHS[id] || 1;
    // Maintain each fighter's original stockiness in addition to a gentle
    // per-person silhouette difference, and never stretch more than 13%.
    const natural = Number.isFinite(authored) && authored > 0 ? authored : 1;
    return Math.min(1.13, Math.max(.90, target * (.8 + natural * .2)));
  });
  window.visualHeight = function unifiedFighterHeight(id) {
    if (!Number.isInteger(Number(id)) ||
        Number(id) < 0 || Number(id) >= fighterTraits.length) {
      return baseHeight(id);
    }
    return 1;
  };
  window.drawFighter = function consistentlyScaledFighter(p) {
    if (!p || !Number.isInteger(p.id) || !fighterTraits[p.id]) {
      return baseDraw.apply(this,arguments);
    }
    const traits = fighterTraits[p.id];
    const previous = traits.build;
    // The same style width is used from idle through attacks and KO.
    traits.build = styleWidth[p.id] || 1;
    try { return baseDraw.apply(this,arguments); }
    finally { traits.build = previous; }
  };
  window.RODAFighterScale = Object.freeze({
    version:'3.3',
    heightScale:1,
    stablePhysiques:styleWidth.slice(),
    changesCombat:false,
    shirtAndCordEdits:'require sprite texture updates'
  });
})();
