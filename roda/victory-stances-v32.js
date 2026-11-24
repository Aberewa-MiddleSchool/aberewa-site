/*
 * RODA v3.2 — fighter-specific animated winner stances.
 * Reuses each fighter's own authored move artwork; does not add generic
 * silhouettes, change hitboxes, or replace the defeat presentation.
 */
(() => {
  'use strict';
  const originalRender=window.render, drawWinner=window.drawFighter;
  const game=document.getElementById('game');
  const portrait=document.getElementById('winnerportrait');
  if(typeof originalRender!=='function'||typeof drawWinner!=='function'||
     !game||!portrait||typeof characterMoves==='undefined'){
    console.warn('[RODA victory] Fighter animation renderer unavailable.');
    return;
  }
  // Each of the fifteen playable fighters has a
  // fighter-specific finish based on a different authored kick/flip/salute.
  const slots=[4,1,3,2,0,5,1,5,3,5,4,2,0,1,5];
  const labels=[
    'THE RHYTHM SALUTE','THE LOW-GUARD BOW','THE HIGH ARC',
    'THE SPINNING CELEBRATION','THE CRESCENT SALUTE','THE GINGA FINALE',
    'THE RODA TRIUMPH','THE JADE INVERSION','THE RIVER SALUTE',
    'THE SOLAR ARC','THE AXÉ SALUTE','THE IRON GUARD',
    'THE BACKSTEP VICTORY','THE WHEELING SALUTE',
    'THE MARÉ INVERSION'
  ];
  const card=document.querySelector('#result .winner-card');
  const caption=document.createElement('div');
  caption.className='roda-victory-caption';
  caption.setAttribute('aria-live','polite');
  caption.style.cssText='margin:3px 0 8px;color:#ffe0a2;font:700 13px/1.4 system-ui,sans-serif;letter-spacing:.08em;text-align:center';
  card?.insertBefore(caption,portrait.nextSibling);
  portrait.setAttribute('aria-label','Animated winning fighter performing their unique victory stance');

  let errorLogged=false;
  window.render=function rodaAnimatedVictory(dt) {
    const output=originalRender.apply(this,arguments);
    if(scene!=='result'||!Array.isArray(players)||players.length<2)return output;
    const winnerIndex=matchWinner<0?0:matchWinner;
    const winner=players[winnerIndex];
    if(!winner||!Number.isInteger(winner.id))return output;
    const id=winner.id;
    const attacks=characterMoves[id];
    if(!attacks||!attacks.length)return output;
    const slot=slots[id]??(id%6);
    const move=attacks[slot]||attacks[0];
    if(!move)return output;
    const elapsed=Math.max(0,420-resultTime);
    // Intro: a flourish using one of this character's own attacks.
    // Hold the final impact pose, then return to that character's natural ginga.
    const flourish=Math.min(1,elapsed/58);
    const hold=elapsed<245;
    const start=Number(move.start)||0, active=Math.max(4,Number(move.active)||18);
    const at=start+Math.max(1,Math.min(active-1,Math.floor(active*(.12+.63*flourish))));
    const pose={...winner,
      x:640,y:0,vy:0,dir:id%2===0?1:-1,vx:0,
      hp:Math.max(1,winner.maxHp||100),maxHp:winner.maxHp||100,
      stun:0,down:0,guardStun:false,flash:0,invuln:0,
      crouch:false,takeoff:0,landing:0,block:false,
      attack:hold?slot:null,attackCrouched:false,
      at:hold?at:0,phase:0,combo:0,comboTimer:0,
      moveText:labels[id]||'VICTORY SALUTE',stepOffset:0,pushV:0
    };
    try {
      drawWinner(pose);
      const pctx=portrait.getContext('2d');
      if(pctx) {
        pctx.clearRect(0,0,portrait.width,portrait.height);
        pctx.drawImage(game,340,225,600,435,0,0,portrait.width,portrait.height);
        // Subtle gold finish rather than an opaque graphic blocking the fighter.
        const band=pctx.createLinearGradient(0,220,0,280);
        band.addColorStop(0,'#101b1800');band.addColorStop(1,'#111d1dc7');
        pctx.fillStyle=band;pctx.fillRect(0,210,portrait.width,70);
      }
      caption.textContent=(labels[id]||'VICTORY SALUTE')+
        (hold?' · FINISHER':' · RETURN TO GINGA');
    } catch (err) {
      if(!errorLogged){errorLogged=true;console.warn('[RODA victory] Original winner portrait retained',err);}
    }
    return output;
  };
  window.RODAVictoryStances=Object.freeze({
    version:'3.4',fighterCount:slots.length,
    names:[...labels],artSource:'existing fighter-specific animation sheets'
  });
})();