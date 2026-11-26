/* RODA 3.4 — Arcade clear: complete comic, then save name; loss: Game Over. */
(() => {
  'use strict';
  const screen=document.querySelector('.screen');
  const comic=document.querySelector('#ending');
  if(!screen||!comic||typeof showResults!=='function'||
     typeof openArcadeScore!=='function'||typeof openComicEnding!=='function'||
     typeof advanceComicEnding!=='function'||typeof returnToMenu!=='function'||
     typeof pollPads!=='function'){
    console.warn('[RODA ending] Missing original Arcade handlers; default flow retained.');
    return;
  }
  let pendingComic=false;
  const over=document.createElement('section');
  over.id='roda-arcade-gameover';
  over.setAttribute('role','dialog');over.setAttribute('aria-label','Game over');
  over.style.cssText='position:absolute;inset:0;z-index:1100;display:none;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:24px;background:#000;text-align:center;';
  if(!screen.style.position)screen.style.position='relative';
  const title=document.createElement('h2');title.textContent='GAME OVER';
  title.style.cssText='color:#efc65c;margin:0;font:900 clamp(60px,11vw,145px)/1.05 Impact,Haettenschweiler,"Arial Black",sans-serif;letter-spacing:.1em;text-shadow:4px 4px 0 #6d4b0d;';
  const sub=document.createElement('p');sub.textContent='THE RODA HAS ENDED';
  sub.style.cssText='color:#e7c87c;font:900 24px Impact,"Arial Black",sans-serif;letter-spacing:.13em;margin:0;';
  const back=document.createElement('button');back.type='button';back.textContent='RETURN TO MAIN MENU';
  back.style.cssText='border:2px solid #efc65c;background:#19140b;color:#f9d87e;padding:15px 28px;font:900 23px Impact,"Arial Black",sans-serif;letter-spacing:.08em;cursor:pointer;';
  over.append(title,sub,back);screen.append(over);
  function hideOver(){over.style.display='none';}
  function toScore(){
    if(!pendingComic)return;
    // Clear before opening the score panel so any nested menu transition is safe.
    // Score accounting happens exactly once, after the comic has finished.
    pendingComic=false;hideOver();
    openArcadeScore();
  }
  function toMenu(){if(pendingComic){toScore();return}hideOver();returnToMenu();}
  back.addEventListener('click',toMenu);
  const nextBout=autoContinue;
  autoContinue=function rodaArcadeFinish(...args){
    // Watching never enters player name entry or controller-dependent Game Over.
    // The existing spectator ladder advances through its result and story screens.
    if(arcadeAutoplay || campaignTwo)return nextBout.apply(this,args);
    if(mode==='solo'&&matchOver&&arcadeIndex===arcadeOrder.length-1){
      hideOver();pendingComic=true;
      try{openComicEnding();}
      catch(e){console.error('[RODA ending] Comic unavailable:',e);toScore();}
      return;
    }
    return nextBout.apply(this,args);
  };
  const film=document.createElement('video');
  film.preload='none';film.playsInline=true;film.controls=true;
  const cinema=document.createElement('section');
  cinema.id='ending-film';cinema.hidden=true;
  cinema.style.cssText='position:absolute;inset:0;z-index:1100;background:black;text-align:center';
  film.style.cssText='display:block;width:100%;height:86%;object-fit:contain';
  const skip=document.createElement('button');skip.textContent='B · SKIP FILM';
  cinema.append(film,skip);screen.append(cinema);
  function gameOver(){
    film.pause();cinema.hidden=true;storyEnding=false;scene='gameover';show(null);
    over.style.display='flex';back.textContent=pendingComic?'A · CONTINUE TO RANKING':'A · RETURN TO MAIN MENU';back.focus();
  }
  function playFilm(){
    film.play().catch(()=>{if(scene==='endingfilm')film.controls=true});
  }
  window.finishArcadeComic=function(shortEnding){
    if(shortEnding && typeof campaignTwo!=='undefined' && campaignTwo){
      storyEnding=false;
      if(pendingComic)toScore();else openArcadeScore();
      return;
    }
    if(shortEnding){gameOver();return}
    storyEnding=false;scene='endingfilm';show(null);cinema.hidden=false;
    if(localMusic)localMusic.pause();
    film.src='comic/welcome-to-roda.mp4';film.muted=!sound;playFilm();
  };
  film.onended=gameOver;film.onerror=()=>{if(scene==='endingfilm')gameOver()};
  skip.onclick=gameOver;
  const oldReturnToMenu=returnToMenu;
  returnToMenu=function rodaComicMenu(...args){
    if(scene==='endingfilm'){film.pause();cinema.hidden=true;}
    if(pendingComic){toScore();return;}
    hideOver();
    return oldReturnToMenu.apply(this,args);
  };
  // New runs abandon any unfinished epilogue before the score object resets.
  // Otherwise a later menu action could apply the previous run's clear award.
  const oldMakeArcade=typeof makeArcade==='function'?makeArcade:null;
  if(oldMakeArcade)makeArcade=function rodaArcadeNewRun(...args){
    pendingComic=false;hideOver();
    return oldMakeArcade.apply(this,args);
  };
  // Resolve the wrapped handler at click time; core UI was wired before this patch.
  const quit=document.querySelector('#quit');
  if(quit)quit.onclick=()=>returnToMenu();
  if(typeof watchExit!=='undefined'&&watchExit)watchExit.onclick=()=>returnToMenu();
  const oldPollPads=pollPads;
  pollPads=function rodaGameOverControls(...args){
    const before=scene;const states=oldPollPads.apply(this,args);
    if(before==='endingfilm'&&scene===before){const edge=states?.[0]?.edge;if(edge?.[1])gameOver();else if(edge?.[0]&&film.paused)playFilm();}
    if(before==='gameover'&&scene===before&&Array.isArray(states)&&states.some(st=>st?.edge?.[0]||st?.edge?.[9]))toMenu();
    return states;
  };
  const score=document.querySelector('#score');
  if(score){
    const scoreMenu=document.createElement('button');
    scoreMenu.id='roda-finished-main-menu';scoreMenu.type='button';
    scoreMenu.textContent='RETURN TO MAIN MENU';
    scoreMenu.style.cssText='margin:12px 0;padding:10px 20px;border:2px solid #efc65c;background:#19140b;color:#f9d87e;font-weight:900;cursor:pointer;';
    scoreMenu.addEventListener('click',toMenu);score.querySelector('div')?.append(scoreMenu);
  }
  window.RODAArcadeEnding=Object.freeze({version:'3.4',victory:'ending, Game Over, ranking',loss:'Continue to next bout',watch:'automatic story ladder'});
})();
