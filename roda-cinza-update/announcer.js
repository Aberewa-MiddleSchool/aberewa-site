/* Brazilian Portuguese calls voiced by Thaís. Time spans share one audio bank. */
const rodaAnnouncer=(()=>{
  const cues={"Na roda": [0.168, 0.843], "Dandara": [1.022, 1.654], "Jurema": [1.79, 2.294], "Celina": [2.515, 3.019], "Zinga": [3.24, 3.744], "Lua": [3.88, 4.299], "Iara": [4.52, 5.067], "Nala": [5.203, 5.707], "Meilin": [5.843, 6.39], "Jaci": [6.611, 7.2], "Sol": [7.336, 7.755], "Ayana": [7.976, 8.523], "Bento": [8.702, 9.12], "Nestor": [9.427, 10.016], "Mestre Maré": [10.28, 11.126], "Heather": [11.262, 11.68], "Coxa": [11.987, 12.491], "Abimbola": [12.627, 13.344], "Dona Cinza": [13.48, 14.24], "Contra": [14.419, 14.88], "Podem começar": [15.016, 15.819]};
  let decoded, loading, pending, sources=[];
  let voiceGain, volume=100;
  try{
    const saved=localStorage.getItem('roda-announcer-volume');
    if(saved!==null && Number.isFinite(Number(saved)))volume=Math.max(0,Math.min(100,Number(saved)));
  }catch{}
  function setVolume(value){
    volume=Math.max(0,Math.min(100,value));
    if(voiceGain)voiceGain.gain.value=volume/100;
    try{localStorage.setItem('roda-announcer-volume',String(volume));}catch{}
  }
  function prepare(){
    if(decoded||loading||!sound)return;
    initAudio();
    if(!audioCtx)return;
    loading=fetch(cinza.asset('announcer-pt-br.mp3'))
      .then(r=>{if(!r.ok)throw Error('Announcer audio unavailable');return r.arrayBuffer();})
      .then(bytes=>audioCtx.decodeAudioData(bytes))
      .then(buffer=>{decoded=buffer;}).catch(()=>{}).finally(()=>{loading=null;});
  }
  function stop(){
    for(const source of sources){try{source.stop();}catch{}}
    sources=[];
  }
  function mark(first,second){
    stop();
    pending=['Na roda',first,'Contra',second,'Podem começar'];
    if(sound&&!decoded)prepare();
  }
  function tick(){
    if(!pending||!sound||!decoded||audioCtx?.state!=='running')return;
    if(announceTime<90){pending=null;return;}
    if(!voiceGain){
      voiceGain=audioCtx.createGain();
      voiceGain.gain.value=volume/100;
      voiceGain.connect(audioCtx.destination);
    }
    let start=audioCtx.currentTime+.03;
    for(const cue of pending){
      const segment=cues[cue];
      if(!segment)continue;
      const source=audioCtx.createBufferSource();
      source.buffer=decoded;source.connect(voiceGain);
      const [from,to]=segment;
      source.start(start,from,to-from);
      start+=to-from+.08;
      sources.push(source);
    }
    pending=null;
  }
  return {mark,tick,stop,prepare,setVolume,get volume(){return volume;}};
})();
