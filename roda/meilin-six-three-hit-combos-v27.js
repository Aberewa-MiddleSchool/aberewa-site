/* RODA v2.7: Meilin (fighter 7), six three-hit button combinations. */
(() => {
  'use strict';
  const ID = 7;
  const combos = [
    {name:'Jade Current',keys:['bencao','frente','costas']},
    {name:'Low Jade',keys:['rasteira','chapa','frente']},
    {name:'Emerald Crescent',keys:['frente','costas','bencao']},
    {name:'Dragon Wheel',keys:['costas','martelo','rasteira']},
    {name:'Golden Passage',keys:['au','chapa','costas']}
  ];
  if (typeof characterMoves==='undefined' || !Array.isArray(characterMoves[ID]) ||
      characterMoves[ID].length<6 || typeof techniqueBook==='undefined' ||
      typeof window.updateFighter!=='function' ||
      combos.some(combo=>combo.keys.some(key=>!techniqueBook[key]))) {
    console.warn('[RODA Meilin combos] Required combat data unavailable; keeping original moves.');
    return;
  }
  // Five individual three-phase chains; keep RB's original veteran flip chain.
  for(let n=0;n<5;n++){
    const old=characterMoves[ID][n];
    const prior=Array.isArray(old.phases)&&old.phases.length?old.phases:[old];
    const phases=combos[n].keys.map((key,i)=>({
      ...prior[Math.min(i,prior.length-1)],...techniqueBook[key],key,frames:12,
      range:Math.max(180,old.range||180),damage:100/30,rank:Math.max(1,old.rank||1),
      knockdown:i===2,push:i===2?3:0,travel:i===2?.15:.1
    }));
    characterMoves[ID][n]={...old,...phases[0],name:combos[n].name,
      signature:combos[n].name.toUpperCase(),start:Math.max(9,old.start||10),
      active:36,end:Math.max(12,old.end||12),phases};
  }
  const originalUpdate=window.updateFighter;
  window.updateFighter=function meilinBalancedCombos(p,opp,s,dt){
    if(!p||p.id!==ID||p.attack===null||!opp||!opp.maxHp)
      return originalUpdate(p,opp,s,dt);
    const move=characterMoves[ID][p.attack];
    if(!move||!Array.isArray(move.phases)||move.phases.length!==3)
      return originalUpdate(p,opp,s,dt);
    // Each clean strike removes one third of 10% of the defender's max HP,
    // accounting for the engine's existing running-combo attenuation.
    const comboAfterTick=p.comboTimer-dt<=0?0:p.combo;
    const attenuation=Math.max(.55,1-comboAfterTick*.1);
    const damage=(opp.maxHp*.1/3)/attenuation;
    const oldDamage=move.damage;
    const prior=move.phases.map(phase=>phase.damage);
    move.damage=damage;
    move.phases.forEach(phase=>{phase.damage=damage});
    try{return originalUpdate(p,opp,s,dt)}
    finally{
      move.damage=oldDamage;
      move.phases.forEach((phase,i)=>{phase.damage=prior[i]});
    }
  };
  window.RODAMeilinCombos=Object.freeze({
    fighterId:ID,buttons:['A','B','X','Y','LB','RB'],
    hitsPerButton:3,fullComboMaxHpFraction:0.10
  });
})();