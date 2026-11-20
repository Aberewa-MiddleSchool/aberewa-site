/* RODA v2.9 — optional one-round arcade matches.
 * Affects Arcade (solo) only. Other modes keep their original round selections.
 * Uses the existing one-round KO/advance logic; no change to combat or scoring.
 */
(() => {
  'use strict';
  const row = document.querySelector('.round-options');
  const three = row?.querySelector('[data-rounds="3"]');
  if (!row || !three || typeof window.roundChoices !== 'function' ||
      typeof window.setRounds !== 'function' ||
      typeof window.setMode !== 'function') {
    console.warn('[RODA round option] Existing round controls unavailable; no change applied.');
    return;
  }
  if (row.querySelector('[data-rounds="1"]')) return;

  const one = document.createElement('button');
  one.type = 'button';
  one.dataset.rounds = '1';
  one.textContent = '1 ROUND';
  one.title = 'Arcade only: one round decides each match';
  one.setAttribute('aria-label', 'Arcade only: best of one round');
  row.insertBefore(one, three);

  const originalChoices = window.roundChoices;
  const originalSetRounds = window.setRounds;
  const originalSetMode = window.setMode;
  const inArcade = () => mode === 'solo' && !arcadeAutoplay;

  window.roundChoices = function rodaRoundChoices() {
    return inArcade() ? [1, 3, 6, 9] : originalChoices.apply(this, arguments);
  };

  function sync() {
    const allowed = inArcade();
    one.hidden = !allowed;
    // Author CSS can override the UA [hidden] rule. Hide explicitly too.
    one.style.display = allowed ? '' : 'none';
    if (!allowed && roundLimit === 1) originalSetRounds(3);
    one.classList.toggle('selected', allowed && roundLimit === 1);
  }

  window.setRounds = function rodaSetRounds(value) {
    if (Number(value) === 1 && !inArcade()) return;
    const output = originalSetRounds.apply(this, arguments);
    sync();
    return output;
  };

  window.setMode = function rodaSetMode(value) {
    const output = originalSetMode.apply(this, arguments);
    sync();
    return output;
  };

  one.addEventListener('click', () => window.setRounds(1));
  sync();
  window.RODAArcadeOneRound = Object.freeze({ version: '2.9', arcadeOnly: true, roundOptions: [1, 3, 6, 9] });
})();
