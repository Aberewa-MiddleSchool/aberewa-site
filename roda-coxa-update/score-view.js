/* Separate EUR ledger: never mix euro scores into the Brazilian-real rankings. */
(()=>{'use strict';
 const panel=document.createElement('section');panel.className='panel';panel.innerHTML='<h2>Coxa · Euro earnings</h2><p>Fictional euro rewards and unlocked outfits, stored on this browser separately from Brazilian-real earnings.</p><div style="overflow:auto"><table><thead><tr><th>Player</th><th>Mode</th><th>Wins / losses</th><th>Outfits</th><th>Status</th><th>EUR</th></tr></thead><tbody id="coxa-rows"></tbody></table></div>';
 document.querySelector('main').append(panel);
 function render(){const body=document.getElementById('coxa-rows');body.replaceChildren();let data=[];try{data=JSON.parse(localStorage.getItem('aberewa_roda_coxa_runs_v1')||'[]');if(!Array.isArray(data))data=[];}catch{}for(const r of data.slice().reverse()){const tr=body.insertRow();for(const v of [r.player||'Coxa',r.mode||'Coxa Mode',(r.wins||0)+' / '+(r.losses||0),(r.unlocked||1)+' / 6',r.complete?'Complete':'In progress',new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format((Number(r.score)||0)/100)])tr.insertCell().textContent=v;}if(!data.length){const row=body.insertRow(),cell=row.insertCell();cell.colSpan=6;cell.textContent='No Coxa records yet.';}}
 render();window.addEventListener('pageshow',render);window.addEventListener('storage',render);
})();
