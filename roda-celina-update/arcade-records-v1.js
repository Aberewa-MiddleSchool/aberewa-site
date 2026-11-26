/* Name required before a player-controlled run. Save each completed bout once. */
'use strict';
const RODA_RECORD_KEY='aberewa_roda_arcade_runs_v1';
let namedArcadeRun=null;
function readArcadeRuns(){const raw=localStorage.getItem(RODA_RECORD_KEY);const rows=raw?JSON.parse(raw):[];if(!Array.isArray(rows))throw Error('Invalid saved records');return rows;}
function persistArcadeRun(){
 if(!namedArcadeRun)return true;
 try{const rows=readArcadeRuns(),i=rows.findIndex(r=>r.id===namedArcadeRun.id);if(i<0)rows.push(namedArcadeRun);else rows[i]=namedArcadeRun;localStorage.setItem(RODA_RECORD_KEY,JSON.stringify(rows));return true;}
 catch(e){console.error('Could not save Arcade records',e);return false;}
}
function arcadeNameInput(){return document.getElementById('roda-player-name');}
function beginNamedArcade(){
 namedArcadeRun=null;if(arcadeAutoplay)return;
 const player=arcadeNameInput().value.trim().slice(0,32);
 if(!player)throw Error('Player name required');
 namedArcadeRun={id:crypto.randomUUID(),campaign:campaignTwo?2:1,player,fighter:profiles[chosen[0]].name,difficulty,roundLimit,route:arcadeOrder.map(id=>({opponent:profiles[id].name,mentor:!campaignTwo&&id===CELINA_ID})),matches:[],createdAt:new Date().toISOString()};
 persistArcadeRun();
}
function recordNamedBout(){
 if(mode!=='solo'||arcadeAutoplay||!namedArcadeRun||!matchOver||matchWinner<0)return;
 if(namedArcadeRun.matches.some(m=>m.index===arcadeIndex))return;
 const entry=namedArcadeRun.route[arcadeIndex];if(!entry)return;
 namedArcadeRun.matches.push({...entry,index:arcadeIndex,outcome:matchWinner===0?'win':'loss',roundWins:wins[0],roundLosses:wins[1],date:new Date().toISOString()});
 namedArcadeRun.earnings=arcadeScore.total;
 if(arcadeIndex===arcadeOrder.length-1)namedArcadeRun.completedAt=new Date().toISOString();
 const saved=persistArcadeRun();
 const count=arcadeRunTotals(namedArcadeRun);
 document.getElementById('roda-bout-record').textContent=count.wins+' W · '+count.losses+' L · '+(saved?'RECORD SAVED':'STORAGE UNAVAILABLE');
}
function arcadeRunTotals(run){return {wins:run?.matches.filter(m=>m.outcome==='win').length||0,losses:run?.matches.filter(m=>m.outcome==='loss').length||0};}
function renderNamedRecords(){
 const tbody=document.getElementById('roda-record-rows');if(!tbody)return;tbody.replaceChildren();
 let rows;try{rows=readArcadeRuns();}catch{const tr=tbody.insertRow();tr.insertCell().textContent='Saved records could not be read.';return;}
 for(const r of [...rows].reverse().slice(0,100)){const t=arcadeRunTotals(r),tr=tbody.insertRow();for(const value of [r.player,r.fighter,r.campaign===2?'A Última Volta':'Arcade',r.difficulty,t.wins,t.losses,r.matches.length+' / '+r.route.length,r.completedAt?'Complete':'In progress'])tr.insertCell().textContent=String(value);}
 if(!rows.length){const tr=tbody.insertRow(),cell=tr.insertCell();cell.colSpan=8;cell.textContent='No named Arcade runs recorded yet.';}
}
function installRecordUI(){
 const label=document.createElement('label');label.id='roda-player-name-wrap';label.style.cssText='display:flex;flex-direction:column;gap:4px;color:#ffe1aa;font-weight:700;margin:8px 0';label.textContent='PLAYER NAME (REQUIRED FOR ARCADE)';
 const input=document.createElement('input');input.id='roda-player-name';input.maxLength=32;input.autocomplete='off';input.placeholder='Enter your name';input.style.cssText='padding:9px;color:#111;background:#fff;border:1px solid #d6b258';try{input.value=localStorage.getItem('roda-last-player')||'';}catch{}label.append(input);document.getElementById('confirm').before(label);
 input.addEventListener('change',()=>{try{localStorage.setItem('roda-last-player',input.value.trim());}catch{}});
 const result=document.createElement('p');result.id='roda-bout-record';result.style.cssText='color:#ffe1aa;font-weight:800;text-align:center';document.querySelector('#result .result-head').append(result);
 const section=document.createElement('section');section.id='roda-match-ledger';section.style.cssText='margin:18px auto;max-width:1000px;padding:18px;background:#1c2b22;color:#f8eccb;border:1px solid #ae9453;overflow:auto';
 section.innerHTML='<h3>HALL OF RHYTHM · NAMED ARCADE RECORDS</h3><p>Completed matches are saved automatically on this browser. Records include both wins and losses.</p><table style="width:100%;text-align:left"><thead><tr><th>Player</th><th>Fighter</th><th>Campaign</th><th>Difficulty</th><th>Wins</th><th>Losses</th><th>Matches</th><th>Status</th></tr></thead><tbody id="roda-record-rows"></tbody></table>';
 document.querySelector('#cabinet').after(section);renderNamedRecords();
}
