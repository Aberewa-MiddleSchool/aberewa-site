/*
 * RODA v3.1 — pose-to-pose size consistency.
 * Loads after fighter-scale-v30.js.
 *
 * The v3.0 parent transformation already makes character height consistent.
 * Some animation sheets still specify oversized destination rectangles.
 * This guard learns each fighter's neutral animation rectangle, then prevents
 * attack, flip, hit and knockdown sprites from exceeding a reasonable ratio.
 * Canvas scaling is visual-only; mechanics, damage, hitboxes and scoring stay
 * in the original game's coordinate system.
 */
(() => {
  'use strict';
  const previousDraw = window.drawFighter;
  if (typeof previousDraw !== 'function' || typeof ctx === 'undefined' ||
      typeof ctx.drawImage !== 'function') {
    console.warn('[RODA poses] Main fighter renderer unavailable.');
    return;
  }
  const neutral = new Map();
  const BASELINE_LIMIT = 40;
  const MAX_POSE_HEIGHT_RATIO = 1.12;
  const MAX_POSE_WIDTH_RATIO = 1.52;
  // Sheets use extra transparent padding, especially the six-frame Meilin
  // correction. Compare like with like: observed frame rectangles, not the
  // image's overall sheet width or its blank transparent margin.
  function geometry(args) {
    if (args.length === 9) return {x:5,y:6,w:7,h:8};
    if (args.length === 5) return {x:1,y:2,w:3,h:4};
    return null;
  }
  const drawable = (w,h) =>
    Number.isFinite(w) && Number.isFinite(h) &&
    Math.abs(w) >= 125 && Math.abs(h) >= 145;

  window.drawFighter = function stablePoseFighter(p) {
    if (!p || !Number.isInteger(p.id)) {
      return previousDraw.apply(this, arguments);
    }
    // Meilin has a dedicated fixed-size sprite renderer. The generic
    // oversize clamp was modifying individual kick frames as they changed
    // animation rows, creating an apparent size jump and visual popping.
    if (p.id === 7) return previousDraw.apply(this, arguments);
    const idle = p.attack === null && p.stun <= 0 && p.down <= 0 &&
      !p.crouch && p.y === 0 && p.takeoff <= 0 && p.landing <= 0;
    const id = p.id;
    let stats = neutral.get(id);
    const previousImage = ctx.drawImage;
    let active = false;
    const hooked = function poseAwareImage(...imageArgs) {
      const pos = geometry(imageArgs);
      if (!pos || !drawable(Number(imageArgs[pos.w]),Number(imageArgs[pos.h]))) {
        return previousImage.apply(this,imageArgs);
      }
      const width = Math.abs(Number(imageArgs[pos.w]));
      const height = Math.abs(Number(imageArgs[pos.h]));
      if (idle) {
        // Neutral sprites have a constant cell geometry for each fighter.
        // The first pose establishes the scale; only gentle corrections
        // are accepted during the first few neutral frames.
        if (!stats) {
          stats = {width,height,samples:1};
          neutral.set(id,stats);
        } else if (stats.samples < BASELINE_LIMIT) {
          const rangeW = stats.width * 1.12;
          const rangeH = stats.height * 1.12;
          if (width < rangeW && height < rangeH &&
              width > stats.width * .83 && height > stats.height * .83) {
            stats.width += (width-stats.width)*.07;
            stats.height += (height-stats.height)*.07;
          }
          stats.samples++;
        }
        return previousImage.apply(this,imageArgs);
      }
      const anchor = stats || {width:405,height:405};
      // Kicks may be wider than a standing pose; preserve their extension.
      // A larger rendered BODY is not allowed: both constraints use a single
      // uniform factor so the fighter's anatomy is never stretched.
      const limitH = anchor.height * MAX_POSE_HEIGHT_RATIO;
      const limitW = Math.max(anchor.width * MAX_POSE_WIDTH_RATIO, anchor.height * 1.5);
      const scale = Math.min(1,limitH/height,limitW/width);
      if (scale >= .999) return previousImage.apply(this,imageArgs);
      const signedW = Number(imageArgs[pos.w]);
      const signedH = Number(imageArgs[pos.h]);
      const x = Number(imageArgs[pos.x]);
      const y = Number(imageArgs[pos.y]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return previousImage.apply(this,imageArgs);
      // Anchor every frame to its original floor point, not to the top of
      // the sprite rectangle; no visible upward pop during combo attacks.
      imageArgs[pos.w] = signedW*scale;
      imageArgs[pos.h] = signedH*scale;
      imageArgs[pos.x] = x+(signedW-imageArgs[pos.w])*.5;
      imageArgs[pos.y] = y+(signedH-imageArgs[pos.h]);
      return previousImage.apply(this,imageArgs);
    };
    try {
      ctx.drawImage = hooked;
      active = ctx.drawImage === hooked;
    } catch (e) {
      active = false;
    }
    try { return previousDraw.apply(this, arguments); }
    finally {
      if (active) ctx.drawImage = previousImage;
    }
  };
  window.RODAPoseConsistency = Object.freeze({
    version:'3.1',
    maxHeightRatio:MAX_POSE_HEIGHT_RATIO,
    maxWidthRatio:MAX_POSE_WIDTH_RATIO,
    appliesTo:'all fighters and all rendered animations',
    stats:()=>Object.fromEntries([...neutral].map(([id,v])=>[id,{...v}]))
  });
})();
