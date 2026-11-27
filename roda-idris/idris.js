// Idris uses the same combat loop as the other Campaign Two fighters.
const IDRIS_ID = 21;
const idris = (() => {
  const name = 'Pastor Idris El-Masri';
  const title = 'Idris’s Sanctuary';
  const root = new URL('./', document.currentScript.src);
  const asset = filename => new URL(filename, root).href;
  const art = filename => {
    const image = new Image();
    image.src = asset(filename);
    return image;
  };
  const stage = art('sanctuary.webp');
  const portrait = art('select.png');
  const clips = [
    'ginga', 'jump', 'roll-forward', 'roll-backward', 'negativa', 'rasteira',
    'rabo-de-arraia', 'meia-lua-de-frente', 'chapa-de-costas', 'hit-reaction',
    'chapa-de-frente', 'meia-lua-baixa', 'martelo-de-solo', 'armada', 'chibata', 'knockdown',
    'esquiva', 'chapa-de-costas-baixa', 'rasteira-baixa'
  ];
  const costumes = ['', '-alternate'].map(suffix =>
    Object.fromEntries(clips.map(clip => [clip, art(clip + suffix + '.webp')]))
  );
  const ready = Promise.all([stage, portrait, ...costumes.flatMap(set => Object.values(set))]
    .map(image => image.decode())).then(() => true).catch(error => {
      console.error('Idris artwork unavailable:', error);
      return false;
    });
  const techniques = {
    frente: { name: 'Meia-Lua de Frente', clip: 'meia-lua-de-frente', level: 'high', range: 182, contact: 3 },
    costas: { name: 'Chapa de Costas', clip: 'chapa-de-costas', level: 'mid', range: 176, contact: 3 },
    arraia: { name: 'Rabo de Arraia', clip: 'rabo-de-arraia', level: 'mid', range: 172, contact: 3 },
    rasteira: { name: 'Rasteira', clip: 'rasteira', level: 'low', range: 172, contact: 3 },
    chapa: { name: 'Chapa de Frente', clip: 'chapa-de-frente', level: 'mid', range: 177, contact: 3 },
    luaBaixa: { name: 'Meia-Lua Baixa', clip: 'meia-lua-baixa', level: 'low', range: 163, contact: 3 },
    marteloSolo: { name: 'Martelo de Solo', clip: 'martelo-de-solo', level: 'mid', range: 164, contact: 3 },
    armada: { name: 'Armada', clip: 'armada', level: 'high', range: 175, contact: 3 },
    costasBaixa: { name: 'Chapa de Costas Baixa', clip: 'chapa-de-costas-baixa', level: 'low', range: 155, contact: 3 },
    rasteiraBaixa: { name: 'Rasteira Baixa', clip: 'rasteira-baixa', level: 'low', range: 161, contact: 3 },
    chibata: { name: 'Chibata', clip: 'chibata', level: 'mid', range: 173, contact: 3 }
  };
  const standing = [
    ['frente','chapa','rasteira'], ['chapa','armada','frente'],
    ['armada','frente','arraia'], ['costas','arraia','chibata'],
    ['chibata','chapa','costas'], ['rasteira','arraia','chapa']
  ];
  const low = [
    ['luaBaixa','rasteira','costasBaixa'], ['rasteira','marteloSolo','luaBaixa'],
    ['marteloSolo','arraia','rasteiraBaixa'], ['costasBaixa','luaBaixa','marteloSolo'],
    ['rasteiraBaixa','costasBaixa','arraia'], ['luaBaixa','arraia','marteloSolo']
  ];
  let lowMoves;
  function build(keys, slot, crouching) {
    const power = slot === 7;
    const rank = power ? 3 : 2;
    const frames = 24;
    const phases = keys.map((key, index) => ({
      ...techniques[key], key, frames, rank, travel: 0,
      fraction: (power ? .15 : .10) / keys.length,
      push: index === keys.length - 1 ? 3 : 0, knockdown: false
    }));
    const label = phases.map(phase => phase.name).join(' → ');
    return {
      ...phases[0], phases, name: label, signature: null, power, rank, crouching,
      button: ['A','B','X','Y','LB','RB','','RT'][slot],
      cost: power ? 50 : 0, start: 4, active: frames * phases.length, end: 10
    };
  }
  function install() {
    profiles[IDRIS_ID] = {
      name, home: 'Cairo', personality: 'A disciplined player who officiated Maré and Celina’s wedding.',
      win: 'Until the next roda.', lose: 'Until the next roda.', pitch: 116
    };
    fighterTraits[IDRIS_ID] = {
      height: 183, build: 1, speed: 3.5, tempo: 1, reach: 1, power: 1,
      style: 'Capoeira Angola', accent: '#b28ad2', variant: 0
    };
    const regular = standing.map((keys, slot) => build(keys, slot, false));
    regular[7] = build(['arraia','costas','rasteira'], 7, false);
    characterMoves[IDRIS_ID] = regular;
    lowMoves = low.map((keys, slot) => build(keys, slot, true));
    roster[IDRIS_ID] = [name, 'Capoeira Angola · Cairo'];
    playableIds.push(IDRIS_ID);
  }
  function move(slot, crouched) {
    return (crouched && lowMoves[slot]) || characterMoves[IDRIS_ID][slot];
  }
  function strike(p, opponent, phase) {
    const frame = Math.floor(6 * phase.phaseFrame / phase.frames);
    return frame === phase.contact && Math.abs(p.x - opponent.x) <= phase.range;
  }
  function draw(p) {
    let clip = 'ginga', frame = Math.floor(tick / 11) % 6;
    let face = p.dir;
    if (p.hp <= 0 || p.down > 0) {
      clip = 'knockdown';
      if (p.hp > 0 && p.down <= 11) frame = p.down <= 5 ? 5 : 4;
      else frame = Math.min(3, Math.floor((tick - p.hitAt) / 4));
    } else if (p.stun > 0 && !p.guardStun) {
      clip = 'hit-reaction';
      frame = Math.min(5, Math.floor((tick - p.hitAt) / 4));
    } else if (p.rollTime > 0) {
      face = p.abimbolaRollFacing || p.dir;
      clip = p.rollDirection === face ? 'roll-forward' : 'roll-backward';
      frame = Math.floor((24 - p.rollTime) / 4);
    } else if (inJump(p) || p.landing > 0) {
      clip = 'jump';
      frame = p.takeoff > 0 ? 0 : p.landing > 0 ? 5 : p.vy > 7 ? 1 : p.vy >= 0 ? 2 : p.vy > -11 ? 3 : 4;
    } else if (p.attack !== null) {
      const attack = moveFor(p, p.attack);
      if (p.at >= attack.start && p.at < attack.start + attack.active) {
        const phase = attackPhase(attack, p.at);
        clip = phase.clip;
        frame = Math.floor(6 * phase.phaseFrame / phase.frames);
      }
    } else if (p.crouch) {
      clip = p.block ? 'negativa' : 'esquiva';
      if (p.idrisGuardPose !== clip) p.idrisGuardStarted = tick;
      frame = Math.min(3, Math.floor((tick - p.idrisGuardStarted) / 4));
    } else if (p.block) {
      frame = 0;
    }
    p.idrisGuardPose = clip;
    const image = costumes[p.idrisAlternate ? 1 : 0][clip];
    frame = clamp(frame, 0, 5);
    ctx.save();
    ctx.fillStyle = '#21162d60';
    ctx.beginPath();
    ctx.ellipse(p.x, 591, Math.max(22, 70 - p.y / 4), 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(p.x, 590 - p.y);
    ctx.scale(face, 1);
    ctx.drawImage(image, frame % 3 * 512, Math.floor(frame / 3) * 512, 512, 512, -256, -476, 512, 512);
    ctx.restore();
  }
  function face(canvas) {
    const ctx = canvas.getContext('2d');
    const ratio = Math.max(canvas.width / portrait.naturalWidth, canvas.height / portrait.naturalHeight);
    const width = portrait.naturalWidth * ratio, height = portrait.naturalHeight * ratio;
    ctx.drawImage(portrait, (canvas.width - width) / 2, (canvas.height - height) * .28, width, height);
  }
  function comic(after) {
    const page = after
      ? {title:'The circle settles', source:asset('after.webp'), alt:'Idris finds his footing. The instruments fall quiet and he returns to neutral ginga.'}
      : {title:'At the sanctuary', source:asset('before.webp'), alt:'Idris ties his sash in the sanctuary and steps into ginga as the roda begins.'};
    openCoxaPage(page, 'PASTOR IDRIS EL-MASRI',
      after ? 'BOUT COMPLETE' : 'IDRIS’S SANCTUARY',
      after ? 'The roda settles back into rhythm.' : 'Three years ago, Idris officiated Maré and Celina’s wedding.',
      after ? 'idris-result' : 'idris-fight');
    $('#storyplace').textContent = title;
    $('#storyadvance').textContent = after ? 'A · MATCH RESULTS' : 'A · ENTER THE RODA';
  }
  return { name, title, stage, portrait, ready, install, move, strike, draw, face, comic };
})();
