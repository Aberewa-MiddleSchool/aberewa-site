// The final player's fighter owns the unlock, including after a Campaign Two fighter switch.
const familyFilm = (() => {
  const key = 'roda.constanca.family-film.v1';
  const screen = document.querySelector('.screen');
  const buttons = [];
  let unlocked = false;
  let returnButton;
  let resumeMusic;
  let overlay;
  function earnedPreviously(run) {
    if (run?.campaign !== 2 || !run.completedAt || !run.route?.length) return false;
    const last = run.route.length - 1;
    if (!run.matches?.some(match => match.index === last && match.outcome === 'win')) return false;
    const fighter = run.route.reduce((name, bout) => bout.fighter || name, run.fighter);
    return fighter === profiles[CONSTANCA_ID].name;
  }
  function award() {
    unlocked = true;
    try { localStorage.setItem(key, '1'); } catch {}
    buttons.forEach(button => button.style.display = '');
  }
  function close() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    scene = returnButton.dataset.scene;
    show(scene);
    if (resumeMusic && musicEnabled && sound) setStageMusic(scene === 'menu' ? -1 : activeStage);
    returnButton.focus();
  }
  function play(from) {
    if (!unlocked || overlay || scene !== from) return;
    returnButton = buttons.find(button => button.dataset.scene === from);
    resumeMusic = !!localMusic && !localMusic.paused;
    localMusic?.pause();
    window.RODAStageRhythms?.stop();
    scene = 'constanca-film';
    show(null);
    overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'The sealed envelope · Campaign Two epilogue');
    overlay.style.cssText = 'position:absolute;inset:0;z-index:60;background:#100b10;color:white;display:flex;flex-direction:column;padding:8px;overflow:auto';
    overlay.innerHTML = '<iframe title="The sealed envelope" allow="autoplay; fullscreen" allowfullscreen style="flex:1;width:100%;min-height:0;border:0"></iframe><div style="padding:6px;text-align:center"><button type="button">B · RETURN</button> <a style="color:#ffdb85" target="_blank" rel="noopener">Open film in a new tab</a><details><summary>Read the reveal</summary>Constança opens the envelope Donna gave her. “Donna, I am your mother. Dracula is your biological father.”</details></div>';
    overlay.querySelector('iframe').src = 'https://app.heygen.com/embeds/5ccbd17a4ab1411c9d1601a23681ff60?autoplay=true';
    overlay.querySelector('a').href = 'https://app.heygen.com/share/5ccbd17a4ab1411c9d1601a23681ff60';
    overlay.querySelector('button').onclick = close;
    screen.append(overlay);
    overlay.querySelector('button').focus();
  }
  function install() {
    for (const [from, anchor, shortcut] of [['score','#watchending','X'],['menu','#choose','R3']]) {
      const button = document.createElement('button');
      button.textContent = shortcut + ' · WATCH CONSTANÇA’S EPILOGUE';
      button.dataset.scene = from;
      button.style.display = 'none';
      button.onclick = () => play(from);
      document.querySelector(anchor).after(button);
      buttons.push(button);
    }
    try { if (localStorage.getItem(key) === '1' || readArcadeRuns().some(earnedPreviously)) award(); } catch {}
    document.addEventListener('keydown', event => {
      if (overlay && event.key === 'Escape') { event.preventDefault(); close(); }
    });
  }
  return { install, award, play, close };
})();
