/* Dona Cinza shares RODA's combat clock, input slots, and hit confirmation. */
const CINZA_ID = 19;
const cinza = (() => {
  const root = new URL('./', document.currentScript.src);
  const asset = name => new URL(name, root).href;
  const portrait = new Image();
  portrait.src = asset('portrait.jpg');
  const society = asset('social-club.webp');
  const chains = [
    ['Última Palavra', ['frente','costas','compasso']],
    ['Porta Fechada', ['bencao','frente']],
    ['Duas Luas', ['frente','costas']],
    ['Cinza Fria', ['rasteira','armada']],
    ['Maré Baixa', ['rasteira','rasteira','frente']],
    ['Sino Fúnebre', ['frente','armada','costas']]
  ];
  function install(){
    profiles[CINZA_ID] = {name:'Dona Cinza', home:'Salvador, Bahia', personality:'Doralice Viana returns to the club where she and Lídia once played.', win:'You heard the pause.', lose:'I heard you that time.', pitch:152};
    fighterTraits[CINZA_ID] = {height:160, build:1, speed:4.8, tempo:1, reach:1, power:1, style:'Capoeira Angola', signature:'Última Palavra', accent:'#ce8d98', variant:0};
    fighterPlans[CINZA_ID] = 'A / LB / RB: 13% + recover 4% on a full chain · B / X / Y: 10%';
    characterMoves[CINZA_ID] = chains.map(([name,keys],slot) => {
      const power = keys.length === 3;
      const phases = keys.map((key,index) => {
        const technique = techniqueBook[key] || techniqueBook.costas;
        const delay = slot === 0 && index === 2 ? 9 : 0;
        return {...technique,key,delay,frames:(slot === 2 ? 12 : 16)+delay,travel:0,
          damage:power ? [4,4,5][index] : 5,range:196,push:index===keys.length-1 ? 3 : 0,knockdown:false};
      });
      return {...moves[slot],...phases[0],phases,name,signature:power?name:null,
        label:power?'THREE-KICK POWER':'TWO-KICK CHAIN',rank:power?3:2,cost:0,start:7,
        active:phases.reduce((total,p)=>total+p.frames,0),end:power?16:10,retreat:0};
    });
  }
  function inReach(p,opponent,m){
    const t = (m.phaseFrame-m.delay)/(m.frames-m.delay);
    return t>=.35 && t<.75 && Math.abs(opponent.x-p.x)<m.range;
  }
  function onCleanHit(p,phase){
    p.cinzaHits++;
    if(phase.phases.length===3 && phase.phase===2 && p.cinzaHits===3){
      p.hp=Math.min(p.maxHp,p.hp+p.maxHp*.04);
    }
  }
  function route(player,rotate){
    const final = player===COXA_ID || !playableIds.includes(COXA_ID) ? (player===14?7:14) : COXA_ID;
    const opening = player===COXA_ID ? [HEATHER_ID] : [];
    const pool = playableIds.filter(id=>id!==CONSTANCA_ID && id!==player && id!==final && id!==CINZA_ID && !isProtagonist(id) && !opening.includes(id));
    const start = rotate ? Math.floor(Math.random()*pool.length) : 0;
    const regular = [...opening,...pool.slice(start),...pool.slice(0,start),final];
    const result = [];
    regular.forEach((id,i)=>{
      result.push(id);
      if(player!==CINZA_ID && (i+1)%2===0)result.push(CINZA_ID);
    });
    return result;
  }
  const chapters = [
    ['Two coffees','Doralice waits outside the newly opened studio. Maré recognizes her before Meilin can turn her key. “Abimbola, pass me those cups. I want your hands free.”'],
    ['The photograph','Doralice stops beneath Lídia’s photograph. “You used the one I took.” Maré sets down the coffee. “It was the best one we had.”'],
    ['The invitation','Lídia’s friends are gathering at the old social club. Doralice asks to close the memorial roda with Maré. “Tell them first,” he says. “Tell them why she never came home.”'],
    ['The missing beat','When the instruments fall quiet, Meilin glances at the door. This time Doralice is already inside.'],
    ['Who gets to stand','“Lídia yielded,” Maré says. Doralice smooths the wrap round her ankle. From the doorway, Abimbola asks, “Did you see her yield?” Doralice answers, “Yes.”'],
    ['The score on the back','Meilin lifts the old photograph from its hook. Behind it she finds a domino score in Lídia’s handwriting. She takes it with her to the club.'],
    ['The last chair','There is one folding chair left by the shutters. Nobody claims it. Maré sets Lídia’s domino tin on the seat.'],
    ['The closing game','Doralice stands where the afternoon light crosses the boards. For the first time since she came back, she waits for someone else to invite her in.']
  ];
  const regularLines = {
    0:'Dandara carries Lídia’s old pandeiro in its soft case. She asks the youngest player to hold it while she plays.',
    1:'Jurema has brought six folding chairs from home. She sets them along the wall and leaves her place in the circle open.',
    2:'Celina lays a palm on the wooden floor. “This board was loose even when we were girls.”',
    3:'Zinga waits until the last person has taken their seat. Then she answers the call.',
    4:'Lua finds a little pencilled L on the bottom of a domino. She slips it into Maré’s hand.',
    5:'Iara comes in carrying fresh coffee. The cups go on the windowsill, away from the game.',
    6:'Nala sits beside the photograph for a moment before she joins the circle.',
    7:'Meilin sets her new studio key next to the domino tin. “Nobody has to wait outside today.”',
    8:'Jaci has written down the names of everyone who played here with Lídia. She leaves space at the bottom of the page.',
    9:'Sol opens the high shutter. A stripe of sunlight reaches all the way across the floor.',
    10:'Ayana brushes the dust from an old bench. Someone has carved the score of a very close game into the underside.',
    14:'Maré turns the photograph toward the light. “She always hated that frame. Loved the picture, though.”',
    16:'Heather rolls up her sleeves and takes the place beside the door. She can hear the music from the street.',
    17:'Coxa watches the players exchange places. When her turn comes, she puts her shoes squarely against the boards.',
    18:'Abimbola recognizes the cups Doralice brought that morning. She fills them both and brings them inside.'
  };
  function chapter(){
    const playerIsCinza = chosen[0]===CINZA_ID;
    const encounter = chosen[1]===CINZA_ID;
    const milestone = playerIsCinza ? Math.floor(arcadeIndex/2) : arcadeOrder.slice(0,arcadeIndex+1).filter(id=>id===CINZA_ID).length;
    const regular = !encounter && arcadeIndex>0 && (!playerIsCinza || arcadeIndex%2===1);
    const host = profiles[chosen[1]].name;
    const [title,line] = regular
      ? [host+' opens the circle',regularLines[chosen[1]]]
      : chapters[Math.min(milestone,chapters.length-1)];
    openShortChapter(title, 'Salvador, Bahia', [
      [encounter || playerIsCinza ? portrait.src : society, line],
      [portraitImages[chosen[1]].src, profiles[chosen[1]].name+' takes the floor.']
    ],'A ÚLTIMA VOLTA','NEXT: '+profiles[chosen[1]].name,'Bout '+(arcadeIndex+1)+' of '+arcadeOrder.length+' · '+formatLabel());
  }
  const ending = [
    [society,'At Lídia’s memorial the players step back into ginga. Win or lose, the books carry every result. Maré opens the shutters.'],
    [portrait.src,'A child asks about the score behind the photograph. “She beat me by forty,” Maré says. “Forty-two,” says Doralice. He turns it over and smiles. “Forty-two.”']
  ];
  return {asset,portrait,society,install,inReach,onCleanHit,route,chapter,ending};
})();
