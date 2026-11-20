/* RODA 3.1 — six genuinely animated three-technique sequences for Meilin. */
(() => {
  'use strict';
  const ID=7;
  const combos=[
    {name:'Jade Current',keys:['bencao','frente','costas']},
    {name:'Low Jade',keys:['rasteira','bencao','frente']},
    {name:'Emerald Crescent',keys:['frente','costas','bencao']},
    {name:'Dragon Wheel',keys:['costas','frente','bencao']},
    {name:'Golden Passage',keys:['bencao','costas','frente']}
  ];
  const row={frente:2,bencao:3,rasteira:4,costas:5};
  const level={frente:'high',bencao:'mid',rasteira:'low',costas:'high'};
  if(typeof characterMoves==='undefined' || characterMoves[ID]?.length!==6 ||
     typeof techniqueBook==='undefined' || typeof updateFighter!=='function' ||
     typeof drawFighterBody!=='function' || typeof drawRedesignFrame!=='function' ||
     typeof attackPhase!=='function' || typeof moveFor!=='function' ||
     combos.some(c=>c.keys.some(k=>!techniqueBook[k]))){
    console.warn('[RODA Meilin 3.1] Original animation data unavailable; preserving existing moves.');
    return;
  }
  for(let n=0;n<5;n++){
    const prev=characterMoves[ID][n], oldPhases=Array.isArray(prev.phases)&&prev.phases.length?prev.phases:[prev];
    const phases=combos[n].keys.map((key,i)=>({
      ...oldPhases[Math.min(i,oldPhases.length-1)], ...techniqueBook[key],key,level:level[key],
      frames:12,range:Math.max(180,Number(prev.range)||180),damage:10/3,
      rank:Math.max(1,Number(prev.rank)||1),knockdown:i===2,push:i===2?3:0,
      travel:i===2?.15:.1
    }));
    characterMoves[ID][n]={...prev,...phases[0],name:combos[n].name,
      signature:combos[n].name.toUpperCase(),start:Math.max(9,Number(prev.start)||10),
      active:36,end:Math.max(12,Number(prev.end)||12),phases};
  }
  // CRITICAL: drawFighterBody(), not drawAttack(), is the actual entry point
  // for redesigned fighters. Override this dispatch only for Meilin attacks.
  const originalBody=drawFighterBody;
  drawFighterBody=function rodaMeilinBody(p,t){
    if(p.id!==ID || p.hp<=0 || p.down>0 || p.stun>0 || p.attack===null ||
       p.attack===5 || p.y>0 || !redesignData?.[ID]){
      return originalBody(p,t);
    }
    const base=moveFor(p,p.attack);
    if(!Array.isArray(base?.phases)||base.phases.length!==3)return originalBody(p,t);
    // Use the same stable wind-up and recovery as the game's polished
    // Mestre combinations, avoiding the unreliable extreme frames (0/1/7).
    if(p.at < base.start || p.at >= base.start + base.active){
      return drawGinga(p);
    }
    const state=attackPhase(base,p.at);
    const segment=Math.max(0,Math.min(2,Number(state.phase)||0));
    const key=base.phases[segment]?.key;
    const techniqueRow=row[key];
    if(techniqueRow===undefined)return originalBody(p,t);
    const elapsed=Math.max(0,Number(state.phaseFrame)||0);
    // Authored strike images 2, 4 and 6 are the stable contact/key poses
    // used by the original game's veteran combinations.
    const pose=elapsed<3?2:elapsed<8?4:6;
    return drawRedesignFrame(p,techniqueRow*8+pose);
  };
  // The engine attenuates follow-up hits, so compensate only for Meilin's
  // current attack. Three clean strikes remove exactly 10% of opponent maxHP.
  const originalUpdate=updateFighter;
  updateFighter=function rodaMeilinHits(p,opp,s,dt){
    if(p?.id!==ID||p.attack===null||!opp?.maxHp)return originalUpdate(p,opp,s,dt);
    const move=characterMoves[ID][p.attack];
    if(move?.phases?.length!==3)return originalUpdate(p,opp,s,dt);
    const combo=p.comboTimer-dt<=0 ? 0 : p.combo;
    const reduction=Math.max(.55,1-combo*.1);
    const damage=opp.maxHp*.1/3/reduction;
    const old=move.damage, phaseOld=move.phases.map(q=>q.damage);
    move.damage=damage;
    move.phases.forEach(q=>{q.damage=damage;});
    try{return originalUpdate(p,opp,s,dt)}
    finally{move.damage=old;move.phases.forEach((q,i)=>{q.damage=phaseOld[i]});}
  };
  window.RODAMeilinCombos=Object.freeze({version:'3.1',fighterId:ID,
    buttons:['A','B','X','Y','LB','RB'],hitsPerButton:3,
    fullCleanComboMaxHpFraction:.1,lowKickButton:'B'});
})();