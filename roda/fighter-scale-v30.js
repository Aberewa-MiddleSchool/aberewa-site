/* RODA v3.0 — consistent fighter screen sizes in all combat poses.
 * Visual-only adjustment: preserves fighterTraits values outside rendering.
 * Men 11–15 render at the same 1x scale; everyone is capped to an
 * approximately 305px standing-figure height in the original renderer.
 * Meilin's existing sprite crop correction and combos remain in place.
 */
(() => {
  'use strict';
  const priorDraw = window.drawFighter;
  const priorHeight = window.visualHeight;
  if (typeof priorDraw !== 'function' || typeof priorHeight !== 'function' ||
      typeof fighterTraits === 'undefined') {
    console.warn('[RODA fighter scale] Draw routine not found; original sizing retained.');
    return;
  }

  const isMan = id => id >= 11 && id <= 15;
  // The game already draws all source poses under one parent canvas transform.
  // Normalizing that transform makes standing, kicks, knockdowns and flips
  // consistent instead of letting fighterTraits.height amplify some models.
  window.visualHeight = function rodaConsistentHeight(id) {
    const n = Number(id);
    if (!Number.isInteger(n) || n < 0 || n >= fighterTraits.length) {
      return priorHeight(id);
    }
    return 1.0;
  };

  window.drawFighter = function rodaConsistentFighterDraw(p) {
    if (!p || !Number.isInteger(p.id) || !fighterTraits[p.id]) {
      return priorDraw.apply(this, arguments);
    }
    const traits = fighterTraits[p.id];
    const oldBuild = traits.build;
    const proposed = Number(oldBuild);
    // Only the rendering call sees the revised proportions.
    // The normal physique range remains visible without oversized shoulders.
    const visualBuild = isMan(p.id) ? 1.0
      : Number.isFinite(proposed) ? Math.max(0.93, Math.min(1.06, proposed)) : 1.0;
    traits.build = visualBuild;
    try { return priorDraw.apply(this, arguments); }
    finally { traits.build = oldBuild; }
  };

  window.RODAFighterScale = Object.freeze({
    version: '3.0', visualHeight: 1.0,
    maleFighters: [11,12,13,14,15], maleWidthScale: 1.0,
    femaleBuildRange: [0.93,1.06], visualOnly: true
  });
})();
