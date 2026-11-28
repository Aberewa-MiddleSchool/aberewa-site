/* Campaign Two rewards are shared across runs on the same browser. */
const cinzaRewards = (() => {
  const key = 'roda-campaign-two-coxa-clear-v1';
  const versus = 'cinza-versus';
  let earned = false;
  let clubIndex = -1;
  let versusBout = 0;
  let justEarned = false;
  const kit = [{}, {}];
  const seats = [];
  function register(){
    if(earned)return;
    earned=true;
    clubIndex=arenas.length;
    arenas.push({name:'COMEDY CLUB · SALVADOR',file:cinza.asset('comedy-club.webp'),
      theme:{title:'Berimbau Bounce',src:cinza.asset('music/berimbau-bounce.mp3')}});
    stageNames.push(arenas[clubIndex].name);
  }
  function restore(){
    try{
      const legacy=()=>readArcadeRuns().some(run=>run.campaign===2 && run.fighter==='Coxa' &&
        run.completedAt && run.route?.at(-1)?.opponent==='Dona Cinza' &&
        run.matches?.some(match=>match.index===run.route.length-1 && match.outcome==='win'));
      if(localStorage.getItem(key)==='1'||legacy())register();
    }catch{}
    paint();
  }
  function win(){
    justEarned=false;
    if(earned || !campaignTwo || mode!=='solo' || arcadeAutoplay || !matchOver ||
       matchWinner!==0 || chosen[0]!==COXA_ID || chosen[1]!==CINZA_ID || arcadeIndex!==arcadeOrder.length-1)return;
    register();justEarned=true;
    try{localStorage.setItem(key,'1');}catch{}
    paint();
  }
  function paint(){
    const option=document.querySelector('#cinza-versus');
    const hint=document.querySelector('#cinza-reward-hint');
    option.hidden=!(earned&&campaignTwo);
    hint.hidden=!campaignTwo||earned;
  }
  function startVersus(){
    if(!earned||!campaignTwo)return;
    mode=versus;arcadeAutoplay=false;stageChoice=clubIndex;versusBout=0;
    seats.length=0;
    choose();
  }
  function pads(pads=connected()){
    if(!seats.length)return pads;
    const active=pads.slice();
    return seats.map(index=>{
      const i=active.findIndex(p=>p.index===index);
      return i<0?null:active.splice(i,1)[0];
    });
  }
  function reconnect(){
    const active=connected();
    if(active.length<2)return false;
    const available=active.filter(p=>!seats.includes(p.index));
    seats.forEach((index,i)=>{if(!active.some(p=>p.index===index))seats[i]=available.shift().index;});
    return true;
  }
  function pickFighter(){
    const active=connected();
    if(active.length<2){$('#picklabel').textContent='ACTIVATE BOTH CONTROLLERS TO PLAY LOCAL VERSUS';return;}
    if(!pickStage){seats.splice(0,seats.length,active[0].index,active[1].index);}
    const side=pickStage;
    chosen[side]=pick;
    kit[side]={cinzaCostume:cinzaArt.selected,coxaColor:coxaSelected,whiteUniform:pick===HEATHER_ID&&heatherWhiteSelected};
    if(!side){
      pickStage=1;
      pick=selectionRoster().includes(chosen[1])?chosen[1]:selectionRoster()[0];
      updatePick();return;
    }
    wins=[0,0];round=1;startRound();
  }
  function nextVersus(){
    if(++versusBout>=21){returnToMenu();return;}
    choose();
  }
  return {restore,win,paint,startVersus,pickFighter,pads,reconnect,nextVersus,kit,versus,
    get bout(){return versusBout;},get justEarned(){return justEarned;}};
})();
