/*
 * RODA v3.2 — stage browser and exact in-game stage preview.
 * Includes all 22 stage IDs without replacing special Meilin or boss art.
 * Arcade keeps story-selected stages; other modes can choose any stage.
 */
(() => {
  'use strict';
  const q = selector => document.querySelector(selector);
  const stageList = (typeof stageNames !== 'undefined' && Array.isArray(stageNames)) ? stageNames : null;
  if (!stageList || !q('#game') || !q('#select .arena-selector') || !q('#menu .menupanel')) {
    console.warn('[RODA stage browser] Game UI not ready; keeping existing stage controls.');
    return;
  }
  const selected = id => ((Number(id) % stageList.length) + stageList.length) % stageList.length;
  const story = () => mode === 'solo' || mode === 'watcharcade' || !!arcadeAutoplay;
  const current = () => story() ? (arcadeArenaOverride ?? storyArena(scene==='menu' || scene==='select'?0:Number(arcadeIndex)||0) ?? 0) : stageChoice;
  const gameCanvas = q('#game');
  const css = document.createElement('style');
  css.textContent = `
    #menu .roda-menu-stages{border:1px solid #997849;border-radius:8px;background:#121b19ee;padding:10px;margin:10px 0}
    .roda-menu-stages h3{margin:0 0 6px;font-size:19px;color:#ffdb93}
    .roda-stage-visual{display:block;width:100%;height:auto;aspect-ratio:1280/660;object-fit:contain;border:2px solid #8c724d;border-radius:5px;background:#17221e}
    .roda-stage-label{font:700 13px/1.4 system-ui,sans-serif;color:#ffe1aa;margin:5px 0}
    .roda-stage-action-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:center}
    .roda-stage-action-row button,.roda-stage-grid button{min-height:35px;border-radius:4px;padding:7px 10px;background:#243a32;color:#fff4d6;border:1px solid #978157;font-size:13px;cursor:pointer}
    .roda-stage-action-row button:focus-visible,.roda-stage-grid button:focus-visible{outline:3px solid #ffd87b;outline-offset:2px}
    .roda-stage-grid button[aria-current="true"]{background:#8b5629;border-color:#ffdc8d;color:white}
    .roda-stage-grid button[disabled]{opacity:.5;cursor:not-allowed}
    .roda-stage-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(136px,1fr));gap:5px;max-height:164px;overflow-y:auto;margin:6px 0 0;padding:4px}
    .roda-stage-grid button{text-align:left;line-height:1.35}
    .roda-stage-grid small{display:block;opacity:.82;font-size:10px}
    #select .arena-selector{display:flex;flex-wrap:wrap;gap:7px}
    #select .roda-choose-stages{width:100%;padding:8px;background:#14201edc;border:1px solid #8f794f;border-radius:6px}
    #select .roda-choose-stages .roda-stage-visual{max-width:620px;max-height:300px;margin:0 auto}
    #select{overflow-y:auto}
    #menu{overflow-y:auto}
    @media(max-width:600px){.roda-stage-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.roda-stage-grid button{font-size:12px}}
  `;
  document.head.append(css);

  const create = (name, className) => {
    const el = document.createElement('details');
    el.className = className;el.id=name;return el;
  };
  const menu = create('roda-menu-stages','roda-menu-stages');
  menu.innerHTML = '<summary>Choose an arena</summary><canvas class="roda-stage-visual" width="640" height="330" aria-label="Actual playable arena preview"></canvas><p class="roda-stage-label"></p><div class="roda-stage-action-row"><button type="button" data-prev>← PREVIOUS</button><button type="button" data-next>NEXT →</button></div>';
  const choose = create('roda-choose-stages','roda-choose-stages');
  choose.innerHTML = '<summary>Choose an arena</summary><p class="roda-stage-label"></p><canvas class="roda-stage-visual" width="640" height="330" aria-label="Actual playable arena preview"></canvas><div class="roda-stage-action-row"><button type="button" data-prev>← PREVIOUS</button><button type="button" data-next>NEXT →</button><button type="button" data-audition>HEAR THIS STAGE BEAT</button></div><div class="roda-stage-grid" aria-label="Choose from all available stages"></div>';
  const homeButton=document.createElement('button');
  homeButton.type='button';homeButton.textContent='USE FIGHTER’S HOME ARENA';
  choose.querySelector('.roda-stage-action-row').append(homeButton);
  homeButton.onclick=()=>chooseStage(homeArena[pick]);
  const chooseBtn = q('#choose');
  q('#menu .menupanel').insertBefore(menu, chooseBtn);
  q('#select .arena-selector').append(choose);

  const routeButtons= [menu,choose].map(view=>{
    const button=document.createElement('button');
    button.type='button';button.textContent='USE STORY ROUTE';
    button.onclick=()=>{arcadeArenaOverride=null;sync();};
    view.querySelector('.roda-stage-action-row').append(button);
    return button;
  });
  let queued = false;
  const views = [menu,choose];
  function preview() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (scene === 'fight' || scene === 'pause' || scene === 'result' ||
          scene === 'story' || scene === 'ending') return;
      const index = selected(current());
      activeStage = index;
      try {
        if (typeof window.drawArena === 'function') window.drawArena();
        if (typeof window.drawRoda === 'function') window.drawRoda();
        for (const view of views) {
          const canvas = view.querySelector('canvas');
          canvas.getContext('2d')?.drawImage(gameCanvas,0,0,canvas.width,canvas.height);
        }
      } catch(err) { console.warn('[RODA stage browser] Preview unavailable',err); }
    });
  }
  function sync() {
    const id = selected(current());
    for(const b of routeButtons)b.hidden=!story() || arcadeArenaOverride===null;
    homeButton.hidden=false;
    const label = (id + 1) + ' / ' + stageList.length + ' — ' + stageList[id];
    for (const view of views) {
      const text = view.querySelector('.roda-stage-label');
      text.textContent = label + (story() ? arcadeArenaOverride===null?' · STORY ROUTE':' · CHOSEN FOR THIS RUN' : ' · SELECTABLE');
      for (const button of view.querySelectorAll('[data-prev],[data-next]')) {
        button.hidden = false;
        button.disabled = false;
      }
    }
    const grid = choose.querySelector('.roda-stage-grid');
    for (const btn of grid.children) {
      const which = Number(btn.dataset.stage);
      btn.setAttribute('aria-current',String(which === id));
      btn.disabled = false;
    }
    preview();
  }
  function chooseStage(i) {
    if(story())arcadeArenaOverride=selected(i);
    stageChoice = selected(i);
    activeStage = stageChoice;
    if (typeof window.updatePick === 'function' && scene === 'select') window.updatePick();
    sync();
    // Existing game switches the audio cue only at match start.
    // Selection itself leaves audio quiet unless "HEAR THIS STAGE BEAT" is used.
  }
  for (const view of views) {
    view.querySelector('[data-prev]').addEventListener('click',()=>chooseStage(current()-1));
    view.querySelector('[data-next]').addEventListener('click',()=>chooseStage(current()+1));
  }
  const grid = choose.querySelector('.roda-stage-grid');
  for (let id=0; id<stageList.length; id++) {
    const b=document.createElement('button');
    b.type='button';b.dataset.stage=String(id);
    const shortName=stageList[id].split(' · ')[0];
    b.textContent=String(id+1).padStart(2,'0')+' · '+shortName;
    if ([18,19].includes(id)) {
      const small=document.createElement('small');
      small.textContent='ORIGINAL PRIVATE ARENA';
      b.append(small);
    }
    b.addEventListener('click',()=>chooseStage(id));
    grid.append(b);
  }
  q('#select .arena-selector').querySelector('#nextarena')?.addEventListener('click',()=>requestAnimationFrame(sync));
  q('#select')?.addEventListener('click',()=>requestAnimationFrame(sync),true);
  const originalMode=window.setMode;
  if(typeof originalMode==='function')window.setMode=function stageBrowserMode(...args){
    const value=originalMode.apply(this,args);sync();return value;
  };
  const originalChoose=window.choose;
  if(typeof originalChoose==='function')window.choose=function stageBrowserChoose(...args){
    const value=originalChoose.apply(this,args);sync();return value;
  };
  const prevShow=window.show;
  if(typeof prevShow==='function')window.show=function stageBrowserShow(...args){
    const result=prevShow.apply(this,args);
    if(args[0]==='menu'||args[0]==='select')sync();
    return result;
  };
  choose.querySelector('[data-audition]').addEventListener('click',()=>{
    if(typeof window.RODAStageRhythms?.audition==='function')window.RODAStageRhythms.audition(current());
    else if(typeof window.setStageMusic==='function'){
      try{window.setStageMusic(current());}catch(err){console.warn(err);}
    }
  });
  const head=q('#menu .menu-title p:last-child');
  if (head) head.textContent='D-PAD: MODE / DIFFICULTY · LB / RB: ROUNDS · A: CHOOSE · STAGES: BUTTONS BELOW';
  sync();
  window.RODAStageBrowser=Object.freeze({version:'3.2',select:chooseStage,refresh:sync,count:stageList.length});
})();