/* RODA 3.1 — Arcade: boss victory -> comic -> save name; loss -> Game Over. */
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
  const finish=document.createElement('button');finish.id='roda-comic-finish-score';
  finish.type='button';finish.textContent='FINISH COMIC · SAVE NAME AND SCORE';
  finish.style.cssText='display:none;margin:14px auto;padding:14px 23px;border:2px solid #efc65c;background:#19140b;color:#f9d87e;font:900 18px Impact,"Arial Black",sans-serif;letter-spacing:.04em;cursor:pointer;';
  comic.append(finish);
  function toScore(){
    if(!pendingComic)return;
    pendingComic=false;finish.style.display='none';hideOver();
    // Score is initialized before comic so the original ending can access it.
    // Reopening it is idempotent: the underlying ledger guards clear bonuses.
    openArcadeScore();
  }
  finish.addEventListener('click',toScore);
  function toMenu(){pendingComic=false;finish.style.display='none';hideOver();returnToMenu();}
  back.addEventListener('click',toMenu);
  const oldShowResults=showResults;
  showResults=function rodaArcadeFinish(...args){
    if(mode==='solo'&&matchOver&&matchWinner===0&&arcadeIndex===arcadeOrder.length-1){
      hideOver();pendingComic=true;finish.style.display='block';
      try {
        // Prepare score in memory, then replace the screen with the comic.
        // The visitor sees comic FIRST, name/score SECOND.
        openArcadeScore();
        openComicEnding();
      }catch(e){console.error('[RODA ending] Comic unavailable:',e);toScore();}
      return;
    }
    if(mode==='solo'&&matchOver&&matchWinner!==0){
      pendingComic=false;finish.style.display='none';stopResultSound();
      scene='gameover';show(null);over.style.display='flex';back.focus();return;
    }
    return oldShowResults.apply(this,args);
  };
  const oldAdvanceComic=advanceComicEnding;
  advanceComicEnding=function rodaComicNext(...args){
    const result=oldAdvanceComic.apply(this,args);
    if(pendingComic&&(scene!=='ending'||comic.classList.contains('hidden')))toScore();
    return result;
  };
  const oldReturnToMenu=returnToMenu;
  returnToMenu=function rodaComicMenu(...args){
    // Some original endings return to the menu when their last strip closes.
    if(pendingComic){toScore();return;}
    finish.style.display='none';hideOver();
    return oldReturnToMenu.apply(this,args);
  };
  const oldPollPads=pollPads;
  pollPads=function rodaGameOverControls(...args){
    const states=oldPollPads.apply(this,args);
    if(scene==='gameover'&&Array.isArray(states)&&states.some(st=>st?.edge?.[0]||st?.edge?.[9]))toMenu();
    return states;
  };
  // The original page assigns onclick handlers after our script loads.
  // Those handlers resolve the overridden advanceComicEnding function.
  const score=document.querySelector('#score');
  if(score){
    const scoreMenu=document.createElement('button');
    scoreMenu.id='roda-finished-main-menu';scoreMenu.type='button';
    scoreMenu.textContent='RETURN TO MAIN MENU';
    scoreMenu.style.cssText='margin:12px 0;padding:10px 20px;border:2px solid #efc65c;background:#19140b;color:#f9d87e;font-weight:900;cursor:pointer;';
    scoreMenu.addEventListener('click',toMenu);score.querySelector('div')?.append(scoreMenu);
  }
  window.RODAArcadeEnding=Object.freeze({version:'3.1',victory:'comic then name',loss:'Game Over then menu'});
})();