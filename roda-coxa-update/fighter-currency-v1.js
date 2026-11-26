/* RODA: fictional score denominations, no exchange rates or cash payouts. */
(()=>{'use strict';
 const currencyFor=fighter=>/^heather(?:\s|$)/i.test(String(fighter||'').trim())?'USD':/^coxa(?:\s|$)/i.test(String(fighter||'').trim())?'EUR':'BRL';
 const formats={USD:new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}),EUR:new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}),BRL:new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'})};
 const money=(points,currency='BRL')=>(formats[currency]||formats.BRL).format((Number(points)||0)/100);
 window.RODACurrency=Object.freeze({currencyFor,money});
 // This helper is also loaded by the public earnings ledger, without the game.
 if(typeof chosen==='undefined'||typeof mode==='undefined')return;
 const selected=()=>chosen[0]===COXA_ID?'EUR':chosen[0]===HEATHER_ID?'USD':'BRL';
 const active=()=>mode==='solo'||mode==='coxa';
 const convert=(s,c=selected())=>typeof s==='string'&&c!=='BRL'?s.replace(/R\$\s*([0-9.]+(?:,[0-9]{2})?)/g,(_,v)=>money(Math.round(Number(v.replace(/\./g,'').replace(',','.'))*100),c)):s;
 const originalRecord=window.record;
 window.record=function(value){const result=originalRecord.call(this,value);if(active()&&inputs[0])inputs[0].text=convert(inputs[0].text);return result;};
 const originalContact=window.scoreContact;
 window.scoreContact=function(...args){const result=originalContact.apply(this,args);if(active()&&scoreToast)scoreToast.text=convert(scoreToast.text);return result;};
 const originalHud=window.hud;
 window.hud=function(...args){if(!active()||selected()==='BRL')return originalHud.apply(this,args);const oldText=window.text;window.text=function(label,x,y,...rest){return oldText.call(this,convert(label),x,y,...rest);};try{return originalHud.apply(this,args);}finally{window.text=oldText;}};
 // Separate leaderboards by denomination, using fighter identity for older records.
 const originalBoards=boardEntries;
 boardEntries=function(){return originalBoards().filter(e=>currencyFor(e.character)===selected());};
 window.paintScoreBoard=function(){const list=document.getElementById('scoreboard');if(!list)return;list.replaceChildren();for(const e of boardEntries().slice(0,10)){const li=document.createElement('li');li.textContent=[e.name,e.character,money(e.score,currencyFor(e.character)),e.rank].join(' · ');list.append(li);}};
 const priorBegin=beginNamedArcade;
 beginNamedArcade=function(...args){const r=priorBegin.apply(this,args);if(namedArcadeRun){namedArcadeRun.currency=selected();persistArcadeRun();}return r;};
 // The original score-saving handler calls this function, so save the correct
 // denomination in the same write without changing points or stored match history.
 const priorPersist=persistRanks;
 persistRanks=function(...args){for(const e of rankStore.boards)e.currency=currencyFor(e.character);return priorPersist.apply(this,args);};
 const panel=document.getElementById('score');
 const guide=panel&&[...panel.querySelectorAll('p')].find(n=>n.textContent.includes('per clean hit'));
 const disclosure=panel&&[...panel.querySelectorAll('p')].find(n=>n.textContent.includes('fictional Brazilian-real'));
 const priorScore=window.openArcadeScore;
 window.openArcadeScore=function(...args){const r=priorScore.apply(this,args),c=selected(),fmt=n=>money(n,c);const total=document.getElementById('scoretotal'),breakdown=document.getElementById('scorebreakdown');if(total){const suffix=total.textContent.split('·').slice(1).join('·').trim();total.textContent=fmt(arcadeScore.total)+(suffix?' · '+suffix:'');}if(breakdown)breakdown.textContent='Clean hits '+fmt(arcadeScore.hits)+' · First hits '+fmt(arcadeScore.firsts)+' · Combos '+fmt(arcadeScore.combo)+' · Round wins '+fmt(arcadeScore.rounds)+' · Perfect rounds '+fmt(arcadeScore.perfect)+' · Arcade clear '+fmt(arcadeScore.clear);if(guide)guide.textContent=fmt(100)+' per clean hit · '+fmt(500)+' first hit per round · combo bonus '+fmt(100)+' per additional hit · '+fmt(1000)+' round win · '+fmt(500)+' perfect round · '+fmt(5000)+' arcade clear.';if(disclosure)disclosure.textContent=c+' denotes fictional arcade rewards. No real money is paid.';paintScoreBoard();return r;};
 const oldMode=window.setMode;window.setMode=function(...args){const r=oldMode.apply(this,args);coxaMenuSync();return r;};
 const oldShow=window.show;window.show=function(...args){const r=oldShow.apply(this,args);coxaMenuSync();return r;};
 coxaMenuSync();
})();
