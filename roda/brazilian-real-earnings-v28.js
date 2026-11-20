/* RODA v2.8 — Brazilian-real arcade earnings display.
 * Presentation-only conversion: 100 legacy points = R$ 1,00.
 * Does not change damage, fighter stats, score storage, ranking order, or gamepad input.
 * Currency is fictional in-game earnings; no payment or cash-out is offered.
 */
(() => {
  'use strict';
  const FORMAT = new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'});
  const money = amount => FORMAT.format((Number(amount) || 0) / 100);
  const message = value => String(value).replace(/\+([\d,]+)/g, (part, digits) => {
    const n = Number(digits.replace(/,/g, ''));
    return Number.isFinite(n) ? '+' + money(n) : part;
  });

  const previousRecord = window.record;
  if (typeof previousRecord === 'function') {
    window.record = function moedaRecord(value) { return previousRecord(message(value)); };
  }
  const previousScoreContact = window.scoreContact;
  if (typeof previousScoreContact === 'function') {
    window.scoreContact = function moedaScoreContact(...args) {
      const result = previousScoreContact.apply(this, args);
      if (typeof scoreToast !== 'undefined' && scoreToast && typeof scoreToast.text === 'string') {
        scoreToast.text = message(scoreToast.text);
      }
      return result;
    };
  }
  // RODA's original HUD draws "SCORE 1,000" directly to the canvas.
  // Intercept only these two precise HUD text positions; leave all other
  // fighter names, life bars, move names, and canvas drawing unchanged.
  const previousHud = window.hud;
  if (typeof previousHud === 'function' && typeof window.text === 'function') {
    window.hud = function moedaHud(...args) {
      const drawText = window.text;
      window.text = function moedaHudText(label, x, y, ...rest) {
        if (typeof label === 'string' && x === 640 && y === 26 &&
            label.startsWith('SCORE ') && typeof arcadeScore !== 'undefined') {
          return drawText.call(this, 'EARNED ' + money(arcadeScore.total), x, y, ...rest);
        }
        if (typeof label === 'string' && x === 640 && y === 174) {
          return drawText.call(this, message(label), x, y, ...rest);
        }
        return drawText.call(this, label, x, y, ...rest);
      };
      try { return previousHud.apply(this, args); }
      finally { window.text = drawText; }
    };
  } else {
    console.warn('[RODA earnings] Cannot locate fighting HUD; existing gameplay remains intact.');
  }

  const previousScoreBoard = window.paintScoreBoard;
  if (typeof previousScoreBoard === 'function') {
    window.paintScoreBoard = function moedaScoreBoard() {
      const list = document.getElementById('scoreboard');
      if (!list || typeof boardEntries !== 'function') return previousScoreBoard();
      list.replaceChildren();
      for (const entry of boardEntries().slice(0, 10)) {
        const row = document.createElement('li');
        row.textContent = [entry.name, entry.character, money(entry.score), entry.rank].join(' · ');
        list.append(row);
      }
    };
  }

  const panel = document.getElementById('score');
  if (panel) {
    const guide = [...panel.querySelectorAll('p')].find(p => p.textContent.includes('100 per clean hit'));
    if (guide) guide.textContent =
      'R$ 1,00 per clean hit · R$ 5,00 first hit per round · combo bonus R$ 1,00 per additional hit · R$ 10,00 round win · R$ 5,00 perfect round · R$ 50,00 arcade clear.';
    const disclosure = document.createElement('p');
    disclosure.className = 'eyebrow';
    disclosure.textContent = 'R$ denotes fictional Brazilian-real arcade rewards. No real money is paid.';
    panel.querySelector('div')?.append(disclosure);
  }
  const previousOpenScore = window.openArcadeScore;
  if (typeof previousOpenScore === 'function') {
    window.openArcadeScore = function moedaOpenArcadeScore(...args) {
      const outcome = previousOpenScore.apply(this, args);
      if (typeof arcadeScore === 'undefined' || !arcadeScore) return outcome;
      const total = document.getElementById('scoretotal');
      if (total) {
        const positionPart = total.textContent.split('·').slice(1).join('·').trim();
        total.textContent = money(arcadeScore.total) + (positionPart ? ' · ' + positionPart : '');
      }
      const breakdown = document.getElementById('scorebreakdown');
      if (breakdown) breakdown.textContent =
        'Clean hits ' + money(arcadeScore.hits) +
        ' · First hits ' + money(arcadeScore.firsts) +
        ' · Combos ' + money(arcadeScore.combo) +
        ' · Round wins ' + money(arcadeScore.rounds) +
        ' · Perfect rounds ' + money(arcadeScore.perfect) +
        ' · Arcade clear ' + money(arcadeScore.clear);
      if (typeof window.paintScoreBoard === 'function') window.paintScoreBoard();
      return outcome;
    };
  }
  window.RODAEarnings = Object.freeze({currency: 'BRL', legacyPointsPerReal: 100, format: money});
})();