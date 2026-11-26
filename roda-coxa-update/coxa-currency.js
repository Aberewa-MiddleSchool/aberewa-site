/* Preserve RODA's original BRL compatibility layer; override presentation only for Coxa. */
(()=>{'use strict';
 const coxa=()=>chosen?.[0]===COXA_ID&&(mode==='solo'||mode==='coxa');
 const convert=s=>typeof s==='string'?s.replace(/R\$\s*([0-9.]+(?:,[0-9]{2})?)/g,(_,v)=>coxaMoney(Math.round(Number(v.replace(/\./g,'').replace(',','.'))*100))):s;
 const oldRecord=window.record;window.record=function(value){const r=oldRecord.call(this,value);if(coxa()&&inputs[0])inputs[0].text=convert(inputs[0].text);return r;};
 const oldContact=window.scoreContact;window.scoreContact=function(...args){const r=oldContact.apply(this,args);if(coxa()&&scoreToast)scoreToast.text=convert(scoreToast.text);return r;};
 const oldHud=window.hud;window.hud=function(...args){if(!coxa())return oldHud.apply(this,args);const oldText=window.text;window.text=function(value,x,y,...rest){return oldText.call(this,convert(value),x,y,...rest);};try{return oldHud.apply(this,args);}finally{window.text=oldText;}};
 const oldBoard=window.paintScoreBoard;window.paintScoreBoard=function(...args){const r=oldBoard.apply(this,args);if(coxa()){for(const row of document.querySelectorAll('#scoreboard li'))row.textContent=convert(row.textContent);}return r;};
 const oldScore=window.openArcadeScore;window.openArcadeScore=function(...args){const r=oldScore.apply(this,args);const p=document.getElementById('score');if(p){for(const n of p.querySelectorAll('p,h3,li')){if(!n.dataset.coxaOriginal)n.dataset.coxaOriginal=n.textContent;if(coxa())n.textContent=convert(n.textContent).replace('Brazilian-real','euro').replace('R$ denotes','€ denotes');else if(n.textContent.includes('€ denotes')||n.textContent.includes('€ per clean hit'))n.textContent=n.dataset.coxaOriginal;}}return r;};
 const oldMode=window.setMode;window.setMode=function(...args){const r=oldMode.apply(this,args);coxaMenuSync();return r;};
 const oldShow=window.show;window.show=function(...args){const r=oldShow.apply(this,args);coxaMenuSync();return r;};
 coxaMenuSync();
})();
