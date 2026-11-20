/* RODA v2.7.4: six DISTINCT three-technique combinations for Meilin. */
(() => {
  'use strict';
  const ID = 7;
  const combos = [
    {name:'Jade Current',keys:['bencao','frente','costas']},
    {name:'Low Jade',keys:['rasteira','bencao','frente']},
    {name:'Emerald Crescent',keys:['frente','costas','rasteira']},
    {name:'Dragon Wheel',keys:['costas','frente','bencao']},
    {name:'Golden Passage',keys:['rasteira','costas','frente']}
  ];
  const rowFor = {frente:2,bencao:3,rasteira:4,costas:5};
  if (typeof characterMoves === 'undefined' || !Array.isArray(characterMoves[ID]) ||
      characterMoves[ID].length < 6 || typeof techniqueBook === 'undefined' ||
      typeof updateFighter !== 'function' || typeof drawRedesignedAttack !== 'function' ||
      typeof drawRedesignFrame !== 'function' ||
      combos.some(combo => combo.keys.some(key => !techniqueBook[key]))) {
    console.warn('[RODA] Missing authored technique art or combat data; Meilin combo patch skipped.');
    return;
  }
  // A/B/X/Y/LB use three independently animated authored techniques.
  // RB retains its original veteran flip art, now scaled consistently.
  for (let n=0;n<5;n++) {
    const old = characterMoves[ID][n];
    const prior = Array.isArray(old.phases)&&old.phases.length ? old.phases : [old];
    const phases = combos[n].keys.map((key,i)=>({
      ...prior[Math.min(i,prior.length-1)], ...techniqueBook[key], key,frames:12,
      range:Math.max(180,Number(old.range)||180),damage:10/3,
      rank:Math.max(1,Number(old.rank)||1),knockdown:i===2,
      push:i===2?3:0,travel:i===2?.15:.1
    }));
    characterMoves[ID][n]={...old,...phases[0],name:combos[n].name,
      signature:combos[n].name.toUpperCase(),start:Math.max(9,old.start||10),
      active:36,end:Math.max(12,old.end||12),phases};
  }
  const previousAttackRenderer=drawRedesignedAttack;
  drawRedesignedAttack=function rodaMeilinTechniqueRenderer(p) {
    if (p.id!==ID || p.attack===null || p.attack===5)
      return previousAttackRenderer(p);
    const base=moveFor(p,p.attack);
    if (!Array.isArray(base.phases) || base.phases.length!==3) return previousAttackRenderer(p);
    const state=attackPhase(base,p.at);
    const phase=Math.max(0,Math.min(2,Number(state.phase)||0));
    const key=base.phases[phase]?.key, row=rowFor[key];
    if (row===undefined) return previousAttackRenderer(p);
    let pose;
    if (p.at < base.start) {
      pose=Math.min(2,Math.floor(Math.max(0,p.at)/Math.max(1,base.start)*3));
    } else if (p.at >= base.start+base.active) {
      const lastRow=rowFor[base.phases[2].key];
      const progress=(p.at-base.start-base.active)/Math.max(1,base.end);
      drawRedesignFrame(p,lastRow*8+Math.min(7,5+Math.floor(Math.max(0,progress)*3)));
      return;
    } else {
      const duration=Math.max(1,Number(state.frames)||12);
      const elapsed=Math.max(0,Math.min(duration-1,Number(state.phaseFrame)||0));
      pose=Math.min(7,Math.floor(elapsed*8/duration));
    }
    // Each phase selects a DIFFERENT technique row, not three repeats.
    drawRedesignFrame(p,row*8+pose);
  };
  const previousUpdate=updateFighter;
  updateFighter=function rodaMeilinBalancedHits(p,opp,s,dt) {
    if (!p || p.id!==ID || p.attack===null || !opp || !opp.maxHp)
      return previousUpdate(p,opp,s,dt);
    const move=characterMoves[ID][p.attack];
    if (!move || !Array.isArray(move.phases) || move.phases.length!==3)
      return previousUpdate(p,opp,s,dt);
    const afterDt=p.comboTimer-dt<=0 ? 0 : p.combo;
    const attenuation=Math.max(.55,1-afterDt*.1);
    const damage=(opp.maxHp*.1/3)/attenuation;
    const original=move.damage, previous=move.phases.map(phase=>phase.damage);
    move.damage=damage;
    move.phases.forEach(phase=>{phase.damage=damage});
    try {return previousUpdate(p,opp,s,dt);}
    finally {
      move.damage=original;
      move.phases.forEach((phase,i)=>{phase.damage=previous[i]});
    }
  };
  window.RODAMeilinCombos=Object.freeze({version:'v27.4',fighterId:ID,
    buttons:['A','B','X','Y','LB','RB'],hitsPerButton:3,
    fullComboMaxHpFraction:.1,visualRows:[2,3,4,5]});
})();