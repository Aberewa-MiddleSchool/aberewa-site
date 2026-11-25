/*
 * RODA v3.2 — distinct, original, synthesized Capoeira Angola-inspired
 * instrumental arrangements for each venue. Complements the existing
 * recorded stage music without substituting or overwriting user recordings.
 * Instruments: synthesized berimbau, atabaque, pandeiro and agogô.
 * No copyrighted music or samples are included.
 */
(() => {
  'use strict';
  const originalMusic = window.setStageMusic;
  if (typeof originalMusic !== 'function') {
    console.warn('[RODA stage beats] Existing stage music unavailable.');
    return;
  }
  // Each scene has a dedicated speed, string tuning and interlocking pulse.
  const tempi=[68,76,82,70,78,74,66,84,72,86,64,80,73,69,88,75,79,71,67,83,77];
  const tunings=[106,123,131,110,147,119,98,137,113,154,104,127,116,109,144,121,135,112,99,143,152];
  const patterns=[
    'x--o--x-xx-o-x--','x-o-x---x--o-xx-','x-xx--o-x-o--x-x',
    'x--o-x-x--o-xx--','x-x-o---xx-o--x-','x--o-xx-x--o-xx-',
    'x---oxx-x-o---xx','x-o--x-x--ox-x--','x--xx-o--x-o-x-x',
    'xx-o-x---x--ox-x','x---x-o-x--ox---','x-o-xx--x-o--x-x',
    'x-xx-o--x---x-ox','x---ox-x-x--o-x-','xx-o--x--x-ox-x-',
    'x-o---xx-x-o-x--','x--o-x--xx-o-x-x','x-x--ox-x--o--xx',
    'x---o-x-xx--ox--','x-o-xx-x---o-x--','x-ox--x-xx--o-x-'
  ];
  let currentStage=-1, timer=null, context=null, noise=null, nextTime=0, step=0;
  const READAHEAD=.3, LOOKAHEAD_MS=85;

  function ctxReady(){
    if (typeof audioCtx !== 'undefined' && audioCtx && audioCtx.state !== 'closed') {
      context=audioCtx;return context.state === 'running';
    }
    return false;
  }
  function makeNoise(c){
    if (noise && noise.sampleRate===c.sampleRate) return noise;
    const count=Math.ceil(c.sampleRate*.15);
    noise=c.createBuffer(1,count,c.sampleRate);
    const a=noise.getChannelData(0);
    for(let n=0;n<count;n++) a[n]=(Math.random()*2-1)*(1-n/count);
    return noise;
  }
  function note(freq,at,loud,kind='sine',duration=.22){
    const c=context;if(!c)return;
    const gain=c.createGain(), osc=c.createOscillator(), filter=c.createBiquadFilter();
    osc.type=kind;osc.frequency.setValueAtTime(freq,at);
    osc.frequency.exponentialRampToValueAtTime(Math.max(32,freq*.87),at+duration);
    filter.type='lowpass';filter.frequency.value=kind==='triangle'?520:1400;
    gain.gain.setValueAtTime(.0001,at);
    gain.gain.exponentialRampToValueAtTime(loud,at+.007);
    gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
    osc.connect(filter);filter.connect(gain);gain.connect(c.destination);
    osc.start(at);osc.stop(at+duration+.02);
  }
  function drum(at,loud){
    const c=context;if(!c)return;
    const osc=c.createOscillator(),g=c.createGain();
    osc.type='sine';osc.frequency.setValueAtTime(114,at);
    osc.frequency.exponentialRampToValueAtTime(58,at+.16);
    g.gain.setValueAtTime(.0001,at);
    g.gain.exponentialRampToValueAtTime(loud,at+.005);
    g.gain.exponentialRampToValueAtTime(.0001,at+.21);
    osc.connect(g);g.connect(c.destination);osc.start(at);osc.stop(at+.23);
  }
  function shake(at,loud){
    const c=context;if(!c)return;
    const source=c.createBufferSource(),hp=c.createBiquadFilter(),g=c.createGain();
    source.buffer=makeNoise(c);
    hp.type='highpass';hp.frequency.value=3000;
    g.gain.setValueAtTime(.0001,at);
    g.gain.exponentialRampToValueAtTime(loud,at+.003);
    g.gain.exponentialRampToValueAtTime(.0001,at+.085);
    source.connect(hp);hp.connect(g);g.connect(c.destination);
    source.start(at);source.stop(at+.09);
  }
  function hit(n,at){
    const s=currentStage;
    if(s<0 || s>=tempi.length)return;
    const pattern=patterns[s],v=pattern[n%16];
    const root=tunings[s],turn=(Math.floor(n/16)%2),shift=s%4;
    // Two-tone berimbau: open/closed string notes and the wooden caxixi click.
    if(v!=='-'){
      const f=(v==='o' ? root*1.33 : root)*(turn?1.01:1);
      note(f,at,v==='o'?.052:.075,'triangle',v==='o'?.13:.21);
      note(f*2.02,at,.014,'sine',.12);
      shake(at,.016);
    }
    // Independent 16-step percussion signatures; unique per venue.
    const down=(n+shift)%16;
    if(down===0||down===8||((s%3)===0&&down===12))drum(at,down===0?.17:.11);
    if((n+(s%5))%4===2 || ((n+s)%7===0))shake(at,.035);
    if(((n+s*3)%16===6) || ((n+s)%16===14)){
      note(root*3.5,at,.016,'sine',.09);
      if(s%2===0)note(root*4.4,at+.09,.009,'sine',.08);
    }
  }
  function schedule(){
    if(!ctxReady() || currentStage<0 || !sound ||
       document.hidden || !['fight','select'].includes(scene)) {
      nextTime=0;
      return;
    }
    const now=context.currentTime;
    if(!nextTime || nextTime<now-.5)nextTime=now+.08;
    const unit=60/tempi[currentStage]/4;
    while(nextTime<now+READAHEAD){
      hit(step,nextTime);
      nextTime+=unit;
      step=(step+1)%32;
    }
  }
  function start(stage,preview){
    const id=Number(stage);
    if(!Number.isInteger(id) || id<0 || id>=tempi.length){
      currentStage=-1;nextTime=0;step=0;return;
    }
    const switched=id!==currentStage;
    currentStage=id;
    if(switched){nextTime=0;step=0;}
    if(!timer)timer=setInterval(schedule,LOOKAHEAD_MS);
    if(preview && typeof window.initAudio==='function')window.initAudio();
    // Sound starts only after the browser receives an audio-unlocking gesture.
    schedule();
  }
  window.setStageMusic=function stageSpecificMusic(stage){
    const number=Number(stage);
    const id=Number.isFinite(number)?Math.max(-1,Math.min(stageNames.length-1,Math.trunc(number))):DEFAULT_STAGE;
    const result=originalMusic.call(this,id);
    start(id===homeStageFor(CELINA_ID)?-1:id,false);
    return result;
  };
  function audition(id){
    if (typeof window.initAudio === 'function')window.initAudio();
    window.setStageMusic(Number(id));
    // 'select' scene is permitted for the preview music.
    schedule();
    const status=document.getElementById('musicstatus');
    if(status&&Number(id)!==homeStageFor(CELINA_ID)) status.textContent='Stage '+(Number(id)+1)+': unique original berimbau, atabaque and pandeiro arrangement.';
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)nextTime=0;});
  window.RODAStageRhythms=Object.freeze({
    version:'3.4',stageCount:stageNames.length,tempi:[...tempi],
    audition, stop:()=>start(-1), get currentStage(){return currentStage;}
  });
})();