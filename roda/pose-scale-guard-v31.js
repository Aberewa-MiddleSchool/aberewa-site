/*
 * RODA v3.3 — pose stability.
 * The legacy pose guard resized each drawImage call based on its destination
 * dimensions. That made attacks change size from one authored pose to the next,
 * often squashing jumps, flips and kicks. Fixed per-fighter scale is now
 * controlled by fighter-scale-v30.js, and none of the original animation
 * frames are modified here.
 */
(() => {
  'use strict';
  window.RODAPoseConsistency = Object.freeze({
    version:'3.3',
    perFrameResizing:false,
    fixedParentScale:true,
    changesCombat:false
  });
})();
