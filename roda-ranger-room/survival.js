'use strict';

const rangerSurvival = (() => {
  const mode = 'ranger-survival';
  const enemy = 24;
  const fighterIds = [4, 5];
  const reward = 1000;
  const walletKey = 'aberewa_roda_ranger_survival_wallet_v1';
  const format = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const atlas = new Image();
  atlas.src = new URL('putty-patrol.webp?v=1', document.currentScript.src).href;
  const outfits = new Set(fighterIds);
  let run;

  function balance(id) {
    try {
      const cents = Number(localStorage.getItem(walletKey + ':' + id));
      return Number.isSafeInteger(cents) && cents > 0 ? cents : 0;
    } catch {
      return 0;
    }
  }

  function install(moves) {
    const id = enemy;
    profiles[id] = { name: 'Putty Patroller', pitch: 96 };
    fighterTraits[id] = {
      height: 174, build: 1, speed: 4.6, tempo: 1, reach: 1, power: 1, accent: '#beb2a3'
    };
    const attacks = [
      ['Clay Thrust', 4, 7, 175, 1], ['Low Sweep', 5, 8, 181, 1],
      ['Stone Crescent', 6, 11, 192, 1], ['Low Turning Kick', 7, 13, 200, 2],
      ['Patrol Rush', 4, 14, 208, 3], ['Heavy Clay Sweep', 5, 16, 218, 3]
    ];
    characterMoves[id] = attacks.map(([name, pose, damage, range, rank], slot) => {
      const base = moves[slot];
      const low = pose === 5 || pose === 7;
      const phase = {
        pose, frames: base.active, damage, range, rank,
        key: low ? 'rasteira' : 'bencao',
        level: low ? 'low' : pose === 6 ? 'high' : 'mid',
        travel: rank === 3 ? 2 : .5, push: rank + 1, knockdown: rank === 3
      };
      return { ...base, ...phase, name, phases: [phase] };
    });
  }

  function begin(id) {
    run = { id, wave: 1, cleared: 0, earnings: 0, power: 100, meter: 100, resolved: false, saved: true };
  }

  function setup(player, patroller) {
    run.resolved = false;
    player.hp = run.power;
    player.meter = run.meter;
    patroller.hp = patroller.maxHp = 40 + Math.min(run.wave - 1, 12) * 5;
  }

  function resolve(player, patroller) {
    if (run.resolved) return;
    run.resolved = true;
    run.power = player.hp;
    run.meter = player.meter;
    if (patroller.hp > 0) return;
    run.cleared++;
    run.earnings += reward;
    try {
      localStorage.setItem(walletKey + ':' + run.id, String(balance(run.id) + reward));
    } catch {
      run.saved = false;
    }
  }

  function finish() {
    if (run.power > 0) {
      run.wave++;
      startRound();
      return;
    }
    scene = 'ranger-summary';
    $('#ranger-summary-name').textContent = profiles[run.id].name.toUpperCase() + ' · RANGER SURVIVAL';
    $('#ranger-summary-stats').textContent = run.cleared + (run.cleared === 1 ? ' patroller defeated' : ' patrollers defeated') + ' · ' + money(run.earnings) + ' earned';
    $('#ranger-summary-wallet').textContent = money(balance(run.id)) + ' banked for ' + profiles[run.id].name + (run.saved ? ' on this browser.' : '. Some rewards could not be saved.');
    show('ranger-summary');
  }

  function attackPose(p) {
    const move = moveFor(p, p.attack);
    if (p.at < move.start) return p.at < move.start / 2 ? 13 : 1;
    if (p.at < move.start + move.active) return move.pose;
    return p.at < move.start + move.active + move.end / 2 ? 15 : 0;
  }

  function poseFor(p) {
    if (p.hp <= 0) return 10;
    if (p.down > 0) return p.down < 14 ? 11 : 10;
    if (p.stun > 0 && !p.guardStun) return p.reaction === 4 ? 9 : 8;
    if (p.rollTime > 0) return p.rollTime < 7 ? 15 : 14;
    if (inJump(p)) return p.y > 0 ? 12 : 15;
    if (p.attack !== null) return attackPose(p);
    if (p.crouch) return 3;
    if (p.block) return 13;
    if (!p.travelDirection) return 0;
    return [0, 1, 0, 2][Math.floor(p.travelDistance / 23) % 4];
  }

  function draw(ctx, p) {
    const pose = poseFor(p);
    ctx.save();
    ctx.fillStyle = '#15170977';
    ctx.beginPath();
    ctx.ellipse(p.x, 592, Math.max(24, 82 - p.y * .2), 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(p.x, 590 - p.y);
    ctx.scale(p.dir, 1);
    ctx.drawImage(atlas, pose % 4 * 384, Math.floor(pose / 4) * 384, 384, 384, -192, -350, 384, 384);
    ctx.restore();
  }

  function money(cents) {
    return format.format(cents / 100);
  }

  return {
    mode, enemy, fighterIds, outfits, install, begin, setup, resolve, finish, draw, balance, money,
    loaded: () => atlas.complete && atlas.naturalWidth > 0,
    failed: () => atlas.complete && !atlas.naturalWidth,
    get wave() { return run.wave; },
    get earnings() { return run.earnings; },
    get rewardText() { return money(reward); }
  };
})();
