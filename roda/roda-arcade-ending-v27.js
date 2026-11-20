/* RODA v2.7.4: Final boss -> comic -> name/score; Arcade loss -> Game Over. */
(() => {
  'use strict';
  const screen=document.querySelector('.screen');
  const end=document.querySelector('#ending');
  const next=document.querySelector('#endingnext');
  if(!screen || !end || !next ||
     typeof showResults!=='function' ||
     typeof openArcadeScore!=='function' ||
     typeof openComicEnding!=='function' ||
     typeof advanceComicEnding!=='function' ||
     typeof returnToMenu!=='function' ||
     typeof pollPads!=='function') {
    console.warn('[RODA ending] Existing story functions unavailable; existing flow preserved.');
    return;
  }
  let finale=false;
  if(!screen.style.position) screen.style.position='relative';
  const gameOver=document.createElement('section');
  gameOver.id='roda-arcade-gameover';
  gameOver.setAttribute('role','dialog');
  gameOver.setAttribute('aria-label','Game over');
  gameOver.style.cssText='position:absolute;inset:0;z-index:1100;display:none;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:24px;background:#000;text-align:center;';
  const headline=document.createElement('h2');
  headline.textContent='GAME OVER';
  headline.style.cssText='color:#eec55f;margin:0;font-family:Impact,Haettenschweiler,"Arial Black",sans-serif;font-size:clamp(62px,11vw,145px);font-weight:900;line-height:1.05;letter-spacing:.08em;text-shadow:4px 4px 0 #735115;';
  const subtitle=document.createElement('p');
  subtitle.textContent='THE RODA HAS ENDED';
  subtitle.style.cssText='color:#e2c77c;margin:0;font:900 23px Impact,"Arial Black",sans-serif;letter-spacing:.13em;';
  const back=document.createElement('button');
  back.type='button';
  back.textContent='RETURN TO MAIN MENU';
  back.style.cssText='border:2px solid #eec55f;background:#171208;color:#f4d27b;padding:15px 26px;font:900 23px Impact,"Arial Black",sans-serif;letter-spacing:.06em;cursor:pointer;';
  gameOver.append(headline,subtitle,back);
  screen.append(gameOver);

  const finish=document.createElement('button');
  finish.id='roda-comic-finish-score';
  finish.type='button';
  finish.textContent='FINISH COMIC · SAVE NAME AND SCORE →';
  finish.style.cssText='display:none;margin:14px auto;padding:14px 20px;border:2px solid #eec55f;background:#171208;color:#f4d27b;font:900 18px Impact,"Arial Black",sans-serif;letter-spacing:.06em;cursor:pointer;';
  end.append(finish);
  function hideOver(){gameOver.style.display='none';}
  function afterComic(){
    if(!finale)return;
    finale=false;finish.style.display='none';
    hideOver();openArcadeScore();
  }
  finish.addEventListener('click',afterComic);
  function backToMenu(){finale=false;finish.style.display='none';hideOver();returnToMenu();}
  back.addEventListener('click',backToMenu);

  const originalResults=showResults;
  showResults=function rodaArcadeResults(...args){
    const arcade=mode==='solo' && matchOver;
    if(arcade && matchWinner===0 && arcadeIndex===arcadeOrder.length-1){
      // Preserve the existing scoring ledger, but show the comic FIRST.
      finale=true;hideOver();
      openArcadeScore();
      try {
        openComicEnding();
        finish.style.display='block';
      } catch(error) {
        console.error('[RODA ending] Comic could not load; score screen is available.',error);
        afterComic();
      }
      return;
    }
    if(arcade && matchWinner!==0){
      finale=false;finish.style.display='none';
      stopResultSound();
      scene='gameover';show(null);
      gameOver.style.display='flex';back.focus();
      return;
    }
    return originalResults.apply(this,args);
  };

  const originalAdvance=advanceComicEnding;
  advanceComicEnding=function rodaFinalComicAdvance(...args){
    if(!finale)return originalAdvance.apply(this,args);
    const out=originalAdvance.apply(this,args);
    // Original comic may close the ending overlay at its final page.
    const hidden=end.classList.contains('hidden');
    if(scene!=='ending' || hidden)afterComic();
    return out;
  };
  // The page also installs the onclick after loading this script; it resolves
  // our replacement function, so both button and gamepad paths use it.
  next.onclick=()=>advanceComicEnding();

  const originalMenu=returnToMenu;
  returnToMenu=function rodaEndMenu(...args){
    if(finale && (scene==='ending'||scene==='story')){
      afterComic();
      return;
    }
    finale=false;finish.style.display='none';hideOver();
    return originalMenu.apply(this,args);
  };
  const originalPoll=pollPads;
  pollPads=function rodaGameOverPad(...args){
    const states=originalPoll.apply(this,args);
    if(scene==='gameover' && Array.isArray(states) &&
       states.some(s=>s?.edge?.[0]||s?.edge?.[9])) backToMenu();
    return states;
  };
  window.RODAArcadeEnding=Object.freeze({version:'v27.4',comicBeforeScore:true,gameOver:true});
})();