// Stage themes are automatic; named themes always override the shuffled pool.
let localMusic=null,currentCue=-2,musicSource='stage';
const suppliedBeatPool=['berimbau-bells','pulo-1','pulo-2','roda-1','roda-2'].map(n=>'audio/'+n+'-v27.mp3');let beatBag=[],previousBeat=-1;const sessionStageThemes={};
function nextStageBeat(){if(!beatBag.length){beatBag=[0,1,2,3,4];for(let i=4;i>0;i--){const j=Math.floor(Math.random()*(i+1));[beatBag[i],beatBag[j]]=[beatBag[j],beatBag[i]];}if(beatBag[4]===previousBeat)[beatBag[0],beatBag[4]]=[beatBag[4],beatBag[0]];}previousBeat=beatBag.pop();return suppliedBeatPool[previousBeat];}
function musicStage(n){const value=Number(n);return Number.isFinite(value)?clamp(Math.trunc(value),-1,stageNames.length-1):DEFAULT_STAGE;}
function stageTheme(n){n=musicStage(n);if(arenas[n]?.theme)return arenas[n].theme.src;if(n===homeStageFor(CELINA_ID))return CELINA_ASSET_ROOT+'music.mp3';return ({'-1':'audio/roda-opening-v27.mp3',3:'audio/meilin-hall.mp3',4:'audio/meilin-garden.mp3',5:'audio/skull-studio-v26.wav',13:'audio/skull-studio-v26.wav',14:'audio/studio-v24.wav'})[n]||(sessionStageThemes[n]??=nextStageBeat());}
function setStageMusic(n){
 if(!musicEnabled)return;
 n=musicStage(n);
 if(!localMusic){
  localMusic=new Audio();
  localMusic.loop=true;
  localMusic.volume=.32;
  localMusic.addEventListener('playing',()=>{
   if(!musicEnabled||!sound)return;
   const stage=arenas[currentCue];
   $('#musicstatus').textContent='NOW PLAYING · '+(stage?.theme?.title ?? stage?.name ?? 'RODA OPENING');
  });
  localMusic.addEventListener('error',()=>{if(musicEnabled)$('#musicstatus').textContent='Music could not play. Click Enable Audio to retry.';});
 }
 if(n!==currentCue){
  currentCue=n;
  localMusic.src=stageTheme(n);
  localMusic.load();
 }
 if(sound)localMusic.play().catch(error=>{
  if(error.name!=='AbortError'&&musicEnabled&&sound&&n===currentCue)
   $('#musicstatus').textContent='Click Enable Audio to allow playback.';
 });
}
function useStageMusic(){musicSource='stage';musicCommand('pauseVideo');setStageMusic(['title','menu','foundation'].includes(scene)?-1:activeStage);}
$('#stagemusic').hidden=true;$('#musicstart').hidden=true;$('#musicplayer').hidden=true;$('#musicplayer').style.display='none';
const musicPreference='roda-music-enabled-v1';
// Films carry a mixed soundtrack. In-game effects and voices use a separate audio path.
const filmVolumes=new WeakMap();
function syncFilmMusic(video){
 if(!musicEnabled&&!filmVolumes.has(video)){filmVolumes.set(video,video.volume);video.volume=0;}
 else if(musicEnabled&&filmVolumes.has(video)){video.volume=filmVolumes.get(video);filmVolumes.delete(video);}
}
document.addEventListener('play',event=>{if(event.target instanceof HTMLVideoElement)syncFilmMusic(event.target);},true);
function syncMusicButtons(){
 document.querySelectorAll('video').forEach(syncFilmMusic);
 for(const button of document.querySelectorAll('#cabinet-music,#musicmute,[data-music]')){
  button.textContent=musicEnabled?'MUSIC ON':'MUSIC OFF';
  button.setAttribute('aria-pressed',String(musicEnabled));
 }
}
function toggleGameMusic(){
 musicEnabled=!musicEnabled;
 try{localStorage.setItem(musicPreference,String(musicEnabled));}catch{}
 if(musicEnabled){
  initAudio();setStageMusic(['title','menu','foundation','openingfilm'].includes(scene)?-1:activeStage);
 }else{
  localMusic?.pause();musicCommand('pauseVideo');window.RODAStageRhythms?.stop();
  $('#musicstatus').textContent='Music off';
 }
 syncMusicButtons();
}
try{musicEnabled=localStorage.getItem(musicPreference)!=='false';}catch{}
for(const button of document.querySelectorAll('#cabinet-music,#musicmute,[data-music]'))button.onclick=toggleGameMusic;
syncMusicButtons();
const soundtrackText=document.querySelector('.soundtrack > div > p:not(.eyebrow)');if(soundtrackText)soundtrackText.textContent='Stage music is selected automatically. The Comedy Club plays “Berimbau Bounce” once unlocked. Lídia’s Social Club plays “Donna.”';

function syncAnnouncerControls(){
 for(const input of document.querySelectorAll('[data-voice]')){
  input.value=rodaAnnouncer.volume;
  input.nextElementSibling.textContent=input.value+'%';
 }
}
for(const input of document.querySelectorAll('[data-voice]')){
 input.oninput=()=>{rodaAnnouncer.setVolume(Number(input.value));syncAnnouncerControls();};
}
syncAnnouncerControls();
