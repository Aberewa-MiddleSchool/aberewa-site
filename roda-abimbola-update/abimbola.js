/* RODA: Abimbola's authored sprite sheets share the same actor-floor anchor. */
const ABIMBOLA_ID = 18;
const abimbola = (() => {
 const root = new URL('./', document.currentScript.src);
 const asset = path => new URL(path, root).href;
 const image = path => {
  const art = new Image();
  art.src = asset(path);
  return art;
 };
 const card = image('card.jpg');
 const arena = image('lagos.webp');
 const rivalry = image('rivalry.webp');
 const sheets = new Map();
 let manifest;
 let ready = false;

 async function load() {
  const response = await fetch(asset('manifest.json'));
  if (!response.ok) throw Error('Abimbola frame manifest was unavailable.');
  manifest = await response.json();
  await Promise.all(Object.entries(manifest.pages).map(async ([key, page]) => {
   const atlas = image(page.file);
   await loadFighterImage(atlas);
   if (atlas.naturalWidth !== page.size[0] || atlas.naturalHeight !== page.size[1]) {
    throw Error('Unexpected dimensions for ' + page.file);
   }
   sheets.set(key, atlas);
  }).concat([card, arena, rivalry].map(loadFighterImage)));
  ready = true;
 }

 const kicks = {
  front_kick: {name:'Bênção', level:'mid', range:180, damage:12, contact:[2,4]},
  low_kick: {name:'Chapa baixa', level:'low', range:185, damage:11, contact:[2,4]},
  high_kick: {name:'Chapa alta', level:'high', range:195, damage:15, contact:[2,4]},
  turning_kick: {name:'Chapa de giro', level:'mid', range:190, damage:15, contact:[3,4]},
  cartwheel: {name:'Aú batido', level:'mid', range:190, damage:16, contact:[7,10]}
 };
 const chains = [['front_kick'], ['low_kick'], ['high_kick'], ['turning_kick'], ['cartwheel'], ['turning_kick','front_kick']];
 function makeMove(keys, slot, crouched = false) {
  const phases = keys.map((key,index) => ({
   ...kicks[key], key, pose:0, frames:key === 'cartwheel' ? 30 : 18, travel:0,
   damage:keys.length > 1 ? 9 : kicks[key].damage,
   push:index === keys.length - 1 ? 3 : 0,
   knockdown:!crouched && keys.length === 1 && (slot === 3 || slot === 4)
  }));
  return {
   ...moves[slot], ...phases[0], phases, button:['A','B','X','Y','LB','RB'][slot],
   name:phases.map(phase => phase.name).join(' → '), signature:null,
   label:crouched ? 'LOW KICK' : keys.length > 1 ? 'TWO STRIKES' : 'KICK',
   start:4, active:phases.reduce((sum, phase) => sum + phase.frames, 0),
   end:8, cost:0, rank:slot < 2 ? 1 : 2, retreat:0
  };
 }

 let lowMoves;
 function install() {
  profiles[ABIMBOLA_ID] = {name:'Abimbola',home:'Lagos, Nigeria',personality:'Meilin’s rival and a member of Mestre Maré’s studio and roda.',win:'I’ll see you in the roda again.',lose:'We have another game to play.',pitch:190};
  fighterTraits[ABIMBOLA_ID] = {height:174,build:1,speed:5.2,tempo:1,reach:1,power:1,style:'Grounded Angola with strong kicks',signature:'Aú batido',accent:'#eb9e32',variant:0};
  fighterPlans[ABIMBOLA_ID] = 'Strong kicks and a two-strike combination · no power moves';
  characterMoves[ABIMBOLA_ID] = chains.map((chain,slot) => makeMove(chain,slot));
  lowMoves = chains.map((_,slot) => makeMove(['low_kick'],slot,true));
 }

 function progressFrame(sequence, progress) {
  const frames = manifest.sequences[sequence];
  return frames[clamp(Math.floor(progress * frames.length), 0, frames.length - 1)];
 }
 function attackFrameIndex(move) {
  const count = manifest.sequences[move.key].length;
  return clamp(Math.floor(move.phaseFrame * count / move.frames),0,count - 1);
 }
 function strike(p, opponent, move) {
  const frame = attackFrameIndex(move);
  return frame >= move.contact[0] && frame < move.contact[1] && Math.abs(opponent.x - p.x) < move.range;
 }

 function roll(p,input,dt) {
  const human = p === players[0] && !arcadeAutoplay;
  const direction = Math.abs(input?.x || 0) > (human ? .6 : .35) ? Math.sign(input.x) : 0;
  if (p.stun > 0 || p.down > 0 || p.hp <= 0) {
   p.rollTime=0;
   p.abimbolaRollFacing=null;
   return false;
  }
  if (!direction) p.abimbolaRollArmed=true;
  const ready = !inJump(p) && p.attack === null && !p.rollTime;
  const opponent = players.find(other => other !== p);
  const guarded = direction === -p.dir && opponent?.attack != null;
  const requested = human ? p.abimbolaRollArmed !== false : mode !== 'training';
  if (ready && requested && direction && Math.abs(input.y || 0) < .5 && !guarded) {
   p.rollTime=24;
   p.rollDirection=direction;
   p.abimbolaRollFacing=p.dir;
   p.abimbolaRollArmed=false;
   p.buffer=null;
   p.jumpBuffer=0;
  }
  if (!p.rollTime) return false;
  const advance = elapsed => {
   const t=clamp((elapsed-3)/18,0,1);
   return 120*t*t*(3-2*t);
  };
  const elapsed=24-p.rollTime;
  p.x=clamp(p.x+p.rollDirection*(advance(elapsed+dt)-advance(elapsed)),100,1180);
  p.vx=0;
  p.crouch=true;
  p.block=false;
  p.moveText=p.rollDirection===p.abimbolaRollFacing?'FORWARD ROLL':'BACKWARD ROLL';
  p.rollTime=Math.max(0,p.rollTime-dt);
  if (!p.rollTime) {
   p.crouch=false;
   p.abimbolaRollFacing=null;
  }
  return true;
 }

 function pose(p) {
  const age = tick - p.hitAt;
  if (p.hp <= 0 || p.down > 0) {
   const frame = age < 18 ? Math.max(0,Math.floor(age / 6)) : p.hp <= 0 || p.down > 14 ? 3 : p.down > 6 ? 4 : 5;
   return manifest.sequences.knockdown_recovery[frame];
  }
  if (p.stun > 0 && !p.guardStun) return progressFrame('hit_reaction', age / 24);
  if (p.rollTime > 0) {
   const facing = p.abimbolaRollFacing ?? p.dir;
   return progressFrame(p.rollDirection === facing ? 'roll_forward' : 'roll_backward', (24 - p.rollTime) / 24);
  }
  if (p.takeoff > 0) return manifest.sequences.jump[1];
  if (p.y > 0 || p.vy) return manifest.sequences.jump[p.vy > 5 ? 2 : p.vy >= -5 ? 3 : 4];
  if (p.landing > 0) return manifest.sequences.jump[5];
  if (p.attack !== null) {
   const base = moveFor(p,p.attack);
   if (p.at >= base.start && p.at < base.start + base.active) {
    const move = attackPhase(base,p.at);
    return manifest.sequences[move.key][attackFrameIndex(move)];
   }
   return manifest.sequences[p.attackCrouched ? 'crouch' : 'ginga'][0];
  }
  return manifest.sequences[p.crouch ? 'crouch' : 'ginga'][0];
 }

 function draw(p) {
  if (!ready) return;
  const [key,index] = pose(p);
  const page = manifest.pages[key];
  const [sx,sy,w,h] = page.frames[index].rect;
  const {anchor_x:anchor, floor_y:floor} = manifest.tile;
  const scale = page.scale;
  const facing = p.rollTime > 0 ? p.abimbolaRollFacing ?? p.dir : p.dir;
  ctx.save();
  ctx.filter = 'none';
  ctx.fillStyle = '#10190f66';
  ctx.beginPath();
  ctx.ellipse(p.x,592,Math.max(18,82*(1-p.y/420)),Math.max(5,14-p.y*.025),0,0,Math.PI*2);
  ctx.fill();
  ctx.translate(p.x,590-p.y);
  ctx.scale(facing,1);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sheets.get(key),sx,sy,w,h,-anchor*scale,-floor*scale,w*scale,h*scale);
  ctx.restore();
  if (p.combo >= 2 && p.comboTimer > 0) {
   text(p.combo+' HIT',p.x,205,34,'#ffdb6e','center');
   text('COMBINATION',p.x,225,12,'#eee6c8','center');
  }
 }

 function portrait(canvas) {
  const context = canvas.getContext('2d');
  context.clearRect(0,0,canvas.width,canvas.height);
  // Crop the close-up already present in the approved card.
  context.drawImage(card,491,65,530,353,0,0,canvas.width,canvas.height);
 }
 function isRivalry(first, second) {
  return (first === ABIMBOLA_ID && second === 7) || (first === 7 && second === ABIMBOLA_ID);
 }
 function openRivalry() {
  storyEnding=false;storyPrologue=false;storyReturn='abimbola-rivalry';scene='story';
  show('story');
  storyTime=arcadeAutoplay ? 720 : Infinity;
  const strip = $('#story .family-comic');
  strip.classList.remove('roda-two-panel');
  strip.classList.add('roda-coxa-page');
  const comic = document.createElement('img');
  comic.className = 'roda-coxa-comic-art';
  comic.src = rivalry.src;
  comic.alt = 'Meilin and Abimbola meet at a comedy show, train under Mestre Maré, and face each other again in Lagos.';
  strip.replaceChildren(comic);
  $('#storychapter').textContent='ABIMBOLA & MEILIN';
  $('#storytitle').textContent='Five Years to the Final Roda';
  $('#storyplace').textContent='Lagos, Nigeria';
  $('#storyopponent').textContent='NEXT: '+roster[chosen[1]][0].toUpperCase();
  $('#storyrole').textContent='Mestre Maré’s studio and roda';
  $('#storyadvance').textContent='A · CONTINUE';
  setStoryHint();
 }

 return {asset,arena,load,install,strike,roll,draw,portrait,isRivalry,openRivalry,lowMove:slot => lowMoves[slot]};
})();
