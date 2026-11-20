// Authored normal and special choreography for the five new full animation sets.
const authoredKitsV25={
 1:['bencao','rasteira','frente','martelo',['frente','martelo','rasteira'],['bencao','rasteira','martelo']],
 4:['bencao','rasteira','frente','lowback',['bencao','rasteira','frente'],['lowback','bencao','rasteira']],
 6:['bencao','rasteira','chapa','costas',['bencao','chapa','rasteira'],['costas','rasteira','chapa']],
 8:['bencao','rasteira','frente','costas',['frente','rasteira','au'],['rasteira','costas','frente']],
 14:['bencao','rasteira','frente','costas',['frente','bencao','rasteira'],['rasteira','costas','frente']]
};
function connectEightFighters(){
 for(const [id,kit] of Object.entries(authoredKitsV25)){
  characterMoves[id]=kit.map((entry,n)=>{
   const old=characterMoves[id][n],keys=Array.isArray(entry)?entry:[entry];
   const total=old.phases.reduce((s,p)=>s+p.damage,0);
   const phases=keys.map((key,i)=>({...techniqueBook[key],key,frames:keys.length===3?12:old.active,range:old.range,damage:Math.max(1,Math.round(total/keys.length)),knockdown:i===keys.length-1&&(n>=4||key==='rasteira'),push:i===keys.length-1?4:1}));
   return {...old,...phases[0],phases,active:phases.reduce((s,p)=>s+p.frames,0),name:keys.map(k=>techniqueBook[k].name).join(' → '),authoredRow:n<4?({0:3,1:4,2:2,3:5})[n]:n+2,authored:true};
  });
 }
 // Existing three identity sheets retain their drawn techniques; specials now chain three contacts.
 for(const id of [2,7,9])for(const n of [4,5]){
  const old=characterMoves[id][n],keys=id===7?(n===4?['lowpush','lowsweep','lowback']:['lowback','lowswitch','lowsweep']):id===2?(n===4?['rasteira','bencao','chapa']:['costas','rasteira','frente']):(n===4?['frente','martelo','armada']:['bencao','frente','costas']);
  const total=old.phases.reduce((s,p)=>s+p.damage,0),phases=keys.map((key,i)=>({...techniqueBook[key],key,frames:12,range:old.range,damage:Math.max(1,Math.round(total/3)),knockdown:i===2,push:i===2?4:1}));
  characterMoves[id][n]={...old,...phases[0],phases,active:36,name:keys.map(k=>techniqueBook[k].name).join(' → ')};
 }
 for(let id=0;id<15;id++)for(const n of [4,5]){
  const old=characterMoves[id][n];if(old.phases.length===3)continue;
  const total=old.phases.reduce((s,p)=>s+p.damage,0);
  const phases=Array.from({length:3},(_,i)=>({...old.phases[i%old.phases.length],frames:12,damage:Math.max(1,Math.round(total/3)),knockdown:i===2,push:i===2?4:1}));
  characterMoves[id][n]={...old,phases,active:36};
 }

}
