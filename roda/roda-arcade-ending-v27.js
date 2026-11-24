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
  function toMenu(){pendingComic=false;hideOver();returnToMenu();}
  back.addEventListener('click',toMenu);
  const oldShowResults=showResults;
  showResults=function rodaArcadeFinish(...args){
    // Watching never enters player name entry or controller-dependent Game Over.
    // The existing spectator ladder advances through its result and story screens.
    if(arcadeAutoplay)return oldShowResults.apply(this,args);
    if(mode==='solo'&&matchOver&&matchWinner===0&&arcadeIndex===arcadeOrder.length-1){
      hideOver();pendingComic=true;
      try{openComicEnding();}
      catch(e){console.error('[RODA ending] Comic unavailable:',e);toScore();}
      return;
    }
    if(mode==='solo'&&matchOver&&matchWinner!==0){
      pendingComic=false;stopResultSound();
      scene='gameover';show(null);over.style.display='flex';back.focus();return;
    }
    return oldShowResults.apply(this,args);
  };
  const oldAdvanceComic=advanceComicEnding;
  advanceComicEnding=function rodaComicNext(...args){
    const result=oldAdvanceComic.apply(this,args);
    // The comic intentionally uses scene='story'. Its visible overlay, rather
    // than the scene name, tells us whether another page is still being read.
    if(pendingComic&&comic.classList.contains('hidden'))toScore();
    return result;
  };
  const oldReturnToMenu=returnToMenu;
  returnToMenu=function rodaComicMenu(...args){
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
    const states=oldPollPads.apply(this,args);
    if(scene==='gameover'&&Array.isArray(states)&&states.some(st=>st?.edge?.[0]||st?.edge?.[9]))toMenu();
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
  window.RODAArcadeEnding=Object.freeze({version:'3.4',victory:'complete comic then name',loss:'Game Over then menu',watch:'automatic story ladder'});
})();
