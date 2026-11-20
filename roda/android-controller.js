(async () => {
  'use strict';
  const source = document.currentScript.src;
  const hints = navigator.userAgentData;
  const indicatesAndroid = value => /\b(?:Android|K325G)\b/i.test(value || '');
  const quickPlay = new URLSearchParams(location.search).get('play') === 'android';
  let android = [hints?.platform, navigator.userAgent, navigator.appVersion,
    navigator.platform, navigator.oscpu].some(indicatesAndroid);
  if (!android && navigator.maxTouchPoints && hints?.getHighEntropyValues) {
    const info = await hints.getHighEntropyValues(['model','platform']).catch(() => ({}));
    android = [info.platform, info.model].some(indicatesAndroid);
  }
  if (!android) {
    if (quickPlay && navigator.maxTouchPoints) {
      const note = document.createElement('p');
      note.textContent = 'Android phone? In Chrome, turn off Desktop site and reload this page to enable touch controls.';
      document.querySelector('#cabinet .screen').before(note);
      note.scrollIntoView({block:'center'});
    }
    return;
  }

  const cabinet = document.getElementById('cabinet');
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = new URL('android-controller.css?v=enter4', source);
  document.head.append(style);
  cabinet.classList.add('android-cabinet');
  document.querySelector('#menu .tag').textContent='TOUCH CONTROLS';
  document.getElementById('padhelp').textContent='Tap a mode, then Choose your fighter.';
  const enter = document.getElementById('entermenu');
  enter.textContent='Tap to play';
  document.querySelector('#title .cast-splash').addEventListener('click',()=>enter.click());

  const roster = document.getElementById('roster');
  const label = document.getElementById('picklabel');
  const heading = document.querySelector('#select h2');
  const screen = cabinet.querySelector('.screen');

  function revealSelection() {
    if (scene !== 'select') return;
    heading.textContent = pickStage && mode === 'cpu' ? 'Tap your opponent' :
      pickStage ? 'Tap the second fighter' : 'Tap your fighter';
    label.scrollIntoView({block:'start'});
  }
  const confirm = document.getElementById('confirm');
  const status = document.createElement('span');
  status.setAttribute('role', 'status');
  confirm.before(status);
  roster.addEventListener('click', event => {
    if (!event.target.closest('button.fightercard')) return;
    status.textContent = rosterName() + ' selected.';
    confirm.scrollIntoView({block:'nearest'});
  });
  function rosterName() {
    return document.getElementById('fightername').textContent;
  }

  // Chrome handles tap versus scroll and dispatches one accessible button click.
  confirm.onclick = () => {
    if (scene !== 'select') return;
    if (mode === 'local' && connected().length < 2) {
      status.textContent = 'Local Versus needs a second controller. For one phone, choose VS CPU or Arcade.';
      return;
    }
    confirmPick();
    if (scene === 'select') {
      status.textContent = label.textContent;
      revealSelection();
    } else {
      status.textContent = '';
      screen.scrollIntoView({block:'start'});
    }
  };
  document.getElementById('storyadvance').onclick = () => {
    if (scene !== 'story' || storyEnding) return;
    advanceStory();
    screen.scrollIntoView({block:'start'});
  };
  const selectPanel = document.getElementById('select');
  new MutationObserver(records => {
    if (records.length && !selectPanel.classList.contains('hidden')) revealSelection();
  }).observe(selectPanel,{attributes:true,attributeFilter:['class']});

  const panel = document.createElement('div');
  panel.className = 'android-controls';
  panel.setAttribute('role', 'group');
  panel.setAttribute('aria-label', 'RODA virtual controller');
  const buttons = new Map();
  const held = new Map();
  const taps = new Set();

  function button(label, index, parent, accessibleName = label) {
    const key = document.createElement('button');
    key.type = 'button';
    key.textContent = label;
    key.setAttribute('aria-label', accessibleName);
    buttons.set(index, key);
    parent.append(key);
    key.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch') return;
      event.preventDefault();
      key.setPointerCapture(event.pointerId);
      held.set(event.pointerId, index);
      taps.add(index);
      key.classList.add('pressed');
    });
    const release = event => {
      held.delete(event.pointerId);
      if (![...held.values()].includes(index)) key.classList.remove('pressed');
    };
    for (const type of ['pointerup','pointercancel','lostpointercapture']) key.addEventListener(type, release);
    key.addEventListener('click', event => { if (event.detail === 0) taps.add(index); });
  }
  const dpad = document.createElement('div');
  dpad.className = 'android-dpad';
  dpad.setAttribute('role','group');
  dpad.setAttribute('aria-label','Directional pad');
  const arrows = [];
  for (const [symbol,x,y] of [['↑',0,-1],['←',-1,0],['→',1,0],['↓',0,1]]) {
    const arrow = document.createElement('span');
    arrow.textContent = symbol;
    arrow.style.gridArea = (y+2)+' / '+(x+2);
    dpad.append(arrow);
    arrows.push({arrow,x,y});
  }
  const directions = new Map();
  function axes() {
    let x=0,y=0;
    for(const dir of directions.values()){x+=dir.x;y+=dir.y;}
    return {x:Math.sign(x),y:Math.sign(y)};
  }
  function lightArrows(){
    const dir=axes();
    for(const a of arrows)a.arrow.classList.toggle('pressed',!!(a.x && dir.x===a.x || a.y && dir.y===a.y));
  }
  function point(event){
    const rect=dpad.getBoundingClientRect();
    const axis=(v,origin,size)=>{const n=(v-origin)/size-.5;return Math.abs(n)<.17?0:Math.sign(n);};
    directions.set(event.pointerId,{x:axis(event.clientX,rect.left,rect.width),y:axis(event.clientY,rect.top,rect.height)});
    lightArrows();
  }
  dpad.onpointerdown = event => {if(event.pointerType !== 'touch')return;event.preventDefault();dpad.setPointerCapture(event.pointerId);point(event);};
  dpad.onpointermove = event => {if(directions.has(event.pointerId))point(event);};
  dpad.onlostpointercapture = dpad.onpointerup = dpad.onpointercancel = event => {directions.delete(event.pointerId);lightArrows();};
  const actions=document.createElement('div');
  actions.className='android-actions';
  for(const [label,index] of [['X',2],['Y',3],['LB',4],['A',0],['B',1],['RB',5]])button(label,index,actions);
  const system=document.createElement('div');
  system.className='android-system';
  button('Start',9,system,'Start or pause');
  panel.append(dpad,system,actions);
  cabinet.querySelector('.screen').after(panel);
  function clear(){
    held.clear();taps.clear();directions.clear();lightArrows();
    for(const key of buttons.values())key.classList.remove('pressed');
  }
  window.addEventListener('blur',clear);
  window.addEventListener('pagehide',clear);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});

  const virtual={id:'RODA Android touch',index:-1,connected:true,axes:[0,0],buttons:Array.from({length:17},()=>({pressed:false}))};
  const hardwarePads=connected, hardwareState=padState;
  connected=function(){
    let pads;
    try { pads=hardwarePads(); }
    catch (error) {
      if(error.name!=='SecurityError')throw error;
      pads=[];
    }
    if(scene==='setup')return pads;
    if(!pads.length || (mode==='local' && pads.length===1))return [virtual,...pads];
    return pads;
  };
  padState=function(pad){
    const state=hardwareState(pad);
    if(pad!==lastPads[0] || scene==='setup')return state;
    for(const index of held.values())state.b[index]=true;
    for(const index of taps){state.b[index]=true;state.edge[index]=true;}
    taps.clear();
    const dir=axes();
    if(dir.x)state.x=dir.x;
    if(dir.y)state.y=dir.y;
    return state;
  };
  if (quickPlay) {
    const practice = document.createElement('button');
    practice.type = 'button';
    practice.className = 'primary';
    practice.textContent = 'Start practice with Aisha';
    screen.before(practice);
    practice.onclick = () => {
      if (scene !== 'title') return;
      enter.click();
      setMode('training');
      choose();
      pick = 21;
      updatePick();
      confirm.click();
    };
    new MutationObserver(() => {
      practice.hidden = scene !== 'title';
    }).observe(document.getElementById('title'), {attributes:true, attributeFilter:['class']});
    practice.scrollIntoView({block:'center'});
  }
})();
