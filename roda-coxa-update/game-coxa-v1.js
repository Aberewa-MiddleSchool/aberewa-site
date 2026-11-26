const heatherRects=[[0, 0, 210, 304, 0.9967], [339, 0, 243, 268, 0.9967], [678, 0, 225, 283, 0.9967], [1017, 0, 331, 64, 0.9967], [0, 331, 163, 208, 0.9967], [339, 331, 247, 177, 0.9967], [678, 331, 185, 185, 0.9967], [1017, 331, 246, 174, 0.9967], [0, 662, 167, 299, 0.9967], [339, 662, 250, 294, 0.9967], [678, 662, 281, 279, 0.9967], [1017, 662, 318, 202, 0.9967], [0, 993, 259, 291, 0.9967], [339, 993, 301, 178, 0.9967], [678, 993, 280, 295, 0.9967], [1017, 993, 152, 323, 0.9967]];
const HEATHER_ID=16;
const heatherArt=new Image(),heatherWhiteArt=new Image();
heatherArt.src='heather/poses.webp';
heatherWhiteArt.src='heather/white-poses.webp';
function installHeather(){
 profiles[HEATHER_ID]={name:'Heather',home:'Oakland, California · now in Bahia',personality:'A Cordão de Ouro player who brings Oakland flair to Mestre Maré’s Bahia studio.',win:'Did you hear that, Mestre? I waited for the answer.',lose:'I practiced the finish. Tomorrow I’ll practice listening.',pitch:210};
 fighterTraits[HEATHER_ID]={height:174,build:1,speed:5.2,tempo:1,reach:1,power:1,style:'Acrobatic standing combinations',signature:'Two Shores',accent:'#f29569',variant:0};
 fighterPlans[HEATHER_ID]='Standing acrobatic pairs · LB and RB three-strike powers';
 const chains=[
  ['Oakland Arc',[9,11]],['Turn of the Tide',[13,10]],['Two-Coast Crescent',[10,15]],['Compass Turn',[12,9]],
  ['Bay Bridge Spiral',[9,14,10]],['Bahia Return',[11,12,15]]
 ];
 characterMoves[HEATHER_ID]=chains.map(([name,poses],slot)=>{
  const power=slot>=4;
  const phases=poses.map((pose,i)=>({pose,frames:13,damage:power?9:7,level:pose===13?'low':pose===15||pose===9?'high':'mid',range:205,travel:0,push:i===poses.length-1?3:0,knockdown:power&&i===poses.length-1}));
  return {...moves[slot],...phases[0],phases,name,signature:power?name:null,label:power?'THREE-STRIKE POWER':'TWO-STRIKE COMBINATION',rank:power?3:slot>=2?2:1,cost:power?35:0,start:8,active:poses.length*13,end:power?16:10,retreat:0};
 });
}
function heatherPose(p){
 if(p.hp<=0||p.down>0)return p.hp>0&&p.down<10?7:3;
 if(p.stun>0&&!p.guardStun)return 2;
 if(p.rollTime>0){
  const t=24-p.rollTime;
  const frames=p.rollDirection===p.dir?[1,5,6,7,1]:[1,7,6,5,1];
  return frames[t<4?0:t<9?1:t<16?2:t<21?3:4];
 }
 if(inJump(p))return p.y>0?4:1;
 if(p.attack!==null){
  const m=moveFor(p,p.attack),phase=attackPhase(m,p.at);
  if(p.at<m.start||p.at>=m.start+m.active)return 8;
  return phase.phaseFrame<8?phase.pose:8;
 }
 return p.crouch?1:0;
}
function drawHeather(p){
 const [x,y,w,h,scale]=heatherRects[heatherPose(p)];
 ctx.save();ctx.translate(p.x,590-p.y);ctx.scale(p.dir,1);
 ctx.drawImage(p.whiteUniform?heatherWhiteArt:heatherArt,x,y,w,h,-w*scale/2,-h*scale,w*scale,h*scale);ctx.restore();
}

const aishaRects=[[0, 0, 272, 300, 137, 0.89], [276, 0, 215, 234, 92, 0.89], [495, 0, 188, 225, 91, 0.89], [687, 0, 250, 284, 126, 0.89], [941, 0, 209, 318, 123, 0.89], [1154, 0, 277, 317, 97, 0.89], [1435, 0, 308, 313, 38, 0.89], [1747, 0, 263, 330, 102, 0.89], [0, 334, 290, 309, 63, 0.89], [294, 334, 267, 295, 89, 0.89], [565, 334, 333, 204, 119, 0.89], [902, 334, 200, 191, 98, 0.89], [1106, 334, 392, 217, 170, 0.67], [1502, 334, 261, 261, 124, 0.67], [0, 647, 405, 262, 156, 0.67], [409, 647, 417, 264, 138, 0.67], [830, 647, 475, 102, 222, 0.67], [1309, 647, 328, 290, 160, 0.67], [0, 941, 211, 277, 98, 0.93], [215, 941, 301, 300, 108, 0.93], [520, 941, 250, 289, 94, 0.93], [774, 941, 329, 293, 60, 0.93], [1107, 941, 143, 323, 45, 0.93], [1254, 941, 190, 348, 48, 0.93], [1448, 941, 332, 251, 120, 0.93], [0, 1293, 329, 269, 25, 0.93], [333, 1293, 217, 254, 112, 0.93], [554, 1293, 364, 284, 150, 0.93], [922, 1293, 235, 301, 107, 0.93], [1161, 1293, 346, 296, 101, 0.93], [1511, 1293, 182, 232, 76, 0.85], [1697, 1293, 307, 218, 35, 0.85], [0, 1598, 280, 224, 47, 0.85], [284, 1598, 336, 212, 40, 0.85], [624, 1598, 253, 215, 120, 0.85], [881, 1598, 356, 210, 113, 0.85], [1241, 1598, 285, 229, 120, 0.85], [1530, 1598, 331, 225, 98, 0.85], [0, 1831, 239, 241, 97, 0.85], [243, 1831, 327, 232, 92, 0.85], [574, 1831, 298, 223, 104, 0.85], [876, 1831, 355, 215, 118, 0.85]];
const aishaSequence={"guard": [0], "crouch": [1], "air": [2], "flinch": [3], "walk": [0], "backstep": [0], "roll": [12, 11, 13, 14, 17], "backroll": [17, 14, 13, 11, 12], "recover": [3, 15, 16, 16, 15, 17, 1, 0], "front": [0, 4, 4, 5, 4, 4], "side": [0, 4, 4, 6, 4, 4], "high": [0, 4, 4, 7, 4, 4], "round": [0, 4, 4, 8, 4, 4], "push": [0, 4, 4, 9, 4, 4], "low": [0, 4, 4, 10, 4, 4]};
const aishaSole={"5": [267, 107], "6": [294, 98], "7": [245, 26], "8": [273, 54], "9": [255, 104], "10": [318, 163], "19": [288, 95], "21": [309, 109], "23": [172, 27], "25": [313, 91], "27": [349, 96], "29": [326, 19], "31": [283, 201], "33": [316, 193], "35": [342, 176], "37": [318, 50], "39": [315, 204], "41": [336, 193]};
const aishaArt=new Image();
aishaArt.src="aisha-relays.webp";
const aishaMirrorArt=new Image();
aishaMirrorArt.src="aisha-relays-blue.webp";

let aishaLowMoves;
function installAisha(){
 profiles[AISHA_ID]={name:'Aisha Aterrissagem do Pé',home:'Salvador, Bahia',personality:'The Sentinel of 2323 steps into the roda to face its winner.',win:'One more game?',lose:'The roda is yours.',pitch:192};
 fighterTraits[AISHA_ID]={height:174,build:1,speed:5.1,tempo:1,reach:1,power:1,style:'Grounded five-hit relay kicks',signature:'Sentinel of 2323',accent:'#65eeeb',variant:0};
 fighterPlans[AISHA_ID]='Six standing and six crouching combinations · 2% health per strike · 10% on a full connection';
 // Each pair is an illustrated wind-up followed by its contact pose.
 const standing=[
  ['Sentinel Step',[19,5,19,9,19]],['Reverse Relay',[21,8,21,6,21]],
  ['Zenith Drop',[23,7,23,5,23]],['Driving Hook',[25,9,25,8,25]],
  ['Compass Circuit',[27,10,27,6,27]],['Outside Crescent',[29,7,29,8,29]]
 ];
 const crouching=[
  ['Ankle Pulse',[31,33,31,35,31]],['Rail Sweep',[33,41,33,31,33]],
  ['Seated Relay',[35,39,35,37,35]],['Bridge Drive',[37,35,37,33,37]],
  ['Kneeling Reversal',[39,31,39,41,39]],['Ground Orbit',[41,33,41,39,41]]
 ];
 function buildChain([name,poses],slot,low){
  const phases=poses.map((pose,i)=>({
   pose,windup:pose>=18?pose-1:18+2*slot,
   level:low?'low':[7,8,23,29].includes(pose)?'high':pose===10?'low':'mid',
   range:200,frames:[13,12,14,12,14][i],damage:1,travel:0,push:i===4?2:0,knockdown:false
  }));
  return {...moves[slot],...phases[0],phases,name,label:low?'CROUCHING RELAY':'STANDING RELAY',
   rank:1,cost:0,start:9,active:phases.reduce((sum,phase)=>sum+phase.frames,0),end:12,signature:null,retreat:0};
 }
 characterMoves[AISHA_ID]=standing.map((chain,slot)=>buildChain(chain,slot,false));
 aishaLowMoves=crouching.map((chain,slot)=>buildChain(chain,slot,true));
}

function aishaPose(p){
 const seq=aishaSequence;
 function frame(name,progress){
  const frames=seq[name];
  return frames[Math.min(frames.length-1,Math.max(0,Math.floor(progress*frames.length)))];
 }
 if(p.hp<=0||p.down>0){
  const age=Math.max(0,tick-p.hitAt);
  if(age<4)return seq.flinch[0];
  if(age<12)return seq.recover[0];
  if(p.hp<=0||p.down>=18)return seq.recover[2];
  return frame('recover',1-p.down/24);
 }
 if(p.stun>0&&!p.guardStun)return seq.flinch[0];
 if(p.rollTime>0){
  return frame(p.rollDirection===p.dir?'roll':'backroll',1-p.rollTime/24);
 }
 if(p.y>0)return seq.air[0];
 if(p.takeoff>0||p.landing>0)return seq.crouch[0];
 if(p.attack!==null){
  const move=moveFor(p,p.attack),phase=attackPhase(move,p.at);
  if(p.at<move.start || p.at>=move.start+move.active)return phase.windup;
  return phase.phaseFrame>=2 && phase.phaseFrame<9?phase.pose:phase.windup;
 }
 if(p.crouch)return seq.crouch[0];
 if(p.block&&p.guardStun)return seq.guard[0];
 if(Math.abs(p.vx)>.25)return frame(p.vx*p.dir>0?'walk':'backstep',((p.ginga%185+185)%185)/185);
 return seq.guard[0];
}

const androidStandIn=new Image();
androidStandIn.src='sentinel-android.webp';
const androidSheets=new Map();
function androidSheet(wave){
 if(!androidSheets.has(wave)){
  const art=new Image();
  art.src='androids/unit-'+wave+'.webp';
  androidSheets.set(wave,art);
 }
 return androidSheets.get(wave);
}
function drawAisha(p){
 const pose=aishaPose(p);
 const [x,y,w,h,anchor,scale]=aishaRects[pose];
 ctx.save();ctx.translate(p.x,590-p.y);ctx.scale(p.dir*scale,scale);
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 const sheet=p.android?androidSheet(p.unitNumber):mode!=='aisha' && players[0]?.id===AISHA_ID && players[1]?.id===AISHA_ID && players[1]?.dir===p.dir?aishaMirrorArt:aishaArt;
 if(sheet.complete && sheet.naturalWidth){
  if(p.android){
   // Android frames have a 32px margin for helmet crests and horns.
   ctx.drawImage(sheet,(pose%6)*544,Math.floor(pose/6)*416,w+64,h+64,-anchor-32,-h-32,w+64,h+64);
  }else ctx.drawImage(sheet,x,y,w,h,-anchor,-h,w,h);
 }else if(p.android && androidStandIn.complete && androidStandIn.naturalWidth){
  ctx.drawImage(androidStandIn,x,y,w,h,-anchor,-h,w,h);
 }
 const sole=aishaSole[pose];
 if(sole && p.attack!==null){
  const phase=attackPhase(moveFor(p,p.attack),p.at);
  const radius=27+phase.phase*2;
  ctx.translate(sole[0]-anchor,sole[1]-h);
  ctx.globalCompositeOperation='lighter';
  const light=ctx.createRadialGradient(0,0,1,0,0,radius);
  light.addColorStop(0,'#eaffff');light.addColorStop(.27,'#55ffffe0');
  light.addColorStop(.62,'#00c7f56b');light.addColorStop(1,'#008bff00');
  ctx.fillStyle=light;ctx.fillRect(-radius,-radius,2*radius,2*radius);
  ctx.strokeStyle='#96ffffbd';ctx.lineWidth=1.6;ctx.beginPath();
  ctx.ellipse(0,0,radius*.83,radius*.46,-.22,0,Math.PI*2);ctx.stroke();
 }
 ctx.restore();
}

const gingaV26={"0":{"src":"ginga-0-v26.webp","rects":[[0,0,320,320],[320,0,320,320],[640,0,320,320],[960,0,320,320],[1280,0,320,320],[1600,0,320,320],[1920,0,320,320]],"referenceHeight":202},"1":{"src":"ginga-1-v26.webp","rects":[[0,0,320,320],[320,0,320,320],[640,0,320,320],[960,0,320,320],[1280,0,320,320],[1600,0,320,320],[1920,0,320,320]],"referenceHeight":195},"3":{"src":"ginga-3-v26.webp","rects":[[0,0,320,320],[320,0,320,320],[640,0,320,320],[960,0,320,320],[1280,0,320,320],[1600,0,320,320],[1920,0,320,320]],"referenceHeight":190},"4":{"src":"ginga-4-v26.webp","rects":[[0,0,320,320],[320,0,320,320],[640,0,320,320],[960,0,320,320],[1280,0,320,320],[1600,0,320,320],[1920,0,320,320]],"referenceHeight":185},"5":{"src":"ginga-5-v26.webp","rects":[[0,0,320,320],[320,0,320,320],[640,0,320,320],[960,0,320,320],[1280,0,320,320],[1600,0,320,320]],"referenceHeight":197},"6":{"src":"ginga-6-v26.webp","rects":[[0,0,320,320],[320,0,320,320],[640,0,320,320],[960,0,320,320],[1280,0,320,320],[1600,0,320,320]],"referenceHeight":200},"7":{"src":"ginga-7-v26.webp","rects":[[0,0,320,320],[320,0,320,320],[640,0,320,320],[960,0,320,320],[1280,0,320,320],[1600,0,320,320]],"referenceHeight":199},"8":{"src":"ginga-8-v26.webp","rects":[[0,0,320,320],[320,0,320,320],[640,0,320,320],[960,0,320,320],[1280,0,320,320],[1600,0,320,320]],"referenceHeight":197},"9":{"src":"ginga-9-v26.webp","rects":[[0,0,320,320],[320,0,320,320],[640,0,320,320],[960,0,320,320],[1280,0,320,320],[1600,0,320,320]],"referenceHeight":186},"10":{"src":"ginga-10-v26.webp","rects":[[0,0,320,320],[320,0,320,320],[640,0,320,320],[960,0,320,320],[1280,0,320,320],[1600,0,320,320]],"referenceHeight":220},"11":{"src":"ginga-11-v26.webp","rects":[[0,0,320,320],[320,0,320,320],[640,0,320,320],[960,0,320,320],[1280,0,320,320],[1600,0,320,320]],"referenceHeight":208},"12":{"src":"ginga-12-v26.webp","rects":[[0,0,320,320],[320,0,320,320],[640,0,320,320],[960,0,320,320],[1280,0,320,320],[1600,0,320,320]],"referenceHeight":199},"13":{"src":"ginga-13-v26.webp","rects":[[0,0,320,320],[320,0,320,320],[640,0,320,320],[960,0,320,320],[1280,0,320,320],[1600,0,320,320]],"referenceHeight":191},"14":{"src":"ginga-14-v26.webp","rects":[[0,0,320,320],[320,0,320,320],[640,0,320,320],[960,0,320,320],[1280,0,320,320],[1600,0,320,320]],"referenceHeight":163}};

const gingaImagesV26=Object.fromEntries(Object.entries(gingaV26).map(([id,d])=>{let i=new Image();i.src=d.src+(Number(id)===9?"?v=3.4.3":"")+([11,13].includes(Number(id))?"?v=3.4.2":"");return [id,i]}));
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#game'),ctx=canvas.getContext('2d'),W=1280,H=660;
const AISHA_ID=15;
// Keep the game's logical playing field while drawing at the display resolution.
if (typeof ResizeObserver === 'function') {
 const fitCanvas = () => {
  const box = canvas.getBoundingClientRect();
  const scale = Math.min(2, Math.min(box.width / W, box.height / H) * (window.devicePixelRatio || 1));
  if (!(scale > 0)) return;
  const width = Math.round(W * scale), height = Math.round(H * scale);
  if (canvas.width !== width || canvas.height !== height) {
   canvas.width = width;
   canvas.height = height;
   ctx.setTransform(width / W, 0, 0, height / H, 0, 0);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
 };
 new ResizeObserver(fitCanvas).observe(canvas);
 window.addEventListener('resize', fitCanvas);
 fitCanvas();
}
const roster=[['Dandara','The rhythm keeper'],['Jurema','Braided thunder'],['Celina','Forty years of Capoeira Angola'],['Zinga','The fearless flame'],['Lua','Moonlit malícia'],['Iara','The flowing tide'],['Nala','Quiet lightning'],['Meilin','The gilded low guard'],['Jaci','Blue horizon'],['Sol','The golden hour'],['Ayana','The white braid'],['Bento','The steady mountain'],,['Nestor','The old fox'],['Mestre Maré','Mestre • all hard kicks • +10% health'],['Aisha','Sentinel of 2323'],['Heather','Oakland to Bahia'],['Coxa','Capoeira Angola novice']];
// Sprite sheets and saved ranks use stable fighter IDs.
const playableIds=roster.flatMap((fighter,id)=>fighter?[id]:[]); // Freeze after the optional Coxa artwork preflight.
function nextFighter(id,offset){
 const count=playableIds.length;
 return playableIds[(playableIds.indexOf(id)+offset+count)%count];
}
function isProtagonist(id){return id===11||id===13;}
const moves=[{name:'Bênção',label:'MID KICK 1',button:'A',pose:2,start:8,active:8,end:12,damage:7,range:172,level:'mid',rank:1,cost:0},{name:'Rasteira',label:'MID KICK 2',button:'B',pose:5,start:11,active:9,end:14,damage:8,range:184,level:'low',rank:1,cost:0},{name:'Meia-lua de frente',label:'HARD KICK 1',button:'X',pose:3,start:14,active:9,end:17,damage:13,range:198,level:'high',rank:2,cost:0},{name:'Meia-lua de costas',label:'HARD KICK 2',button:'Y',pose:7,start:16,active:10,end:18,damage:15,range:214,level:'high',rank:2,cost:0},{name:'Aú com chapa',label:'SPECIAL MOVE 1',button:'LB',pose:6,start:12,active:17,end:18,damage:19,range:221,level:'high',rank:3,cost:35},{name:'Giro da roda',label:'SPECIAL MOVE 2',button:'RB',pose:7,start:17,active:20,end:20,damage:23,range:245,level:'mid',rank:3,cost:50}];
moves.forEach(m=>{m.start=Math.max(5,m.start-3);m.end=Math.max(8,m.end-5)});
const bossMoves=moves.map((m,i)=>({...m,name:['Bênção forte','Chapa baixa','Meia-lua pesada','Compasso forte','Aú pesado','Giro do mestre'][i],label:['HARD KICK 3','HARD KICK 4','HARD KICK 1','HARD KICK 2','HARD SPECIAL 1','HARD SPECIAL 2'][i],damage:[12,12,15,17,21,25][i],start:m.start+2,end:m.end+5,attackClass:'hard'}));
buildFighterMoves(moves,bossMoves);
connectExclusiveSpecials();
connectEightFighters();
installAisha();
installHeather();
installCelina();
installCoxa();
const moveFor=(p,n)=>p.id===COXA_ID?(p.attackCrouched&&n===1?coxaLowMove:characterMoves[COXA_ID][n]):p.id===CELINA_ID?(p.attackCrouched&&n<6?celinaLowMoves[n]:characterMoves[p.id][n]):p.id===AISHA_ID&&p.attackCrouched?aishaLowMoves[n]:p.attackCrouched&&p.id!==HEATHER_ID&&p.id!==AISHA_ID&&p.id!==7&&p.id!==14&&!isProtagonist(p.id)?crouchingMove(characterMoves[p.id][n],n):characterMoves[p.id][n];
function crouchingMove(base,n){const key=n===1||n===4?'rasteira':n===3||n===5?'costas':'chapa';const tech=techniqueBook[key];const phases=[{...base.phases[0],...tech,visual:n===3||n===5?'lowback':'lowpush',level:'low',travel:0,frames:base.active,range:base.range*.9,damage:base.damage,knockdown:n>=2,push:3}];return {...base,...phases[0],phases,name:['Chapa baixa','Rasteira curta','Chapa baixa forte','Meia-lua baixa','Varredura','Contra-ataque baixo'][n],signature:n>=4?'BAIXA · '+base.signature:null,active:phases[0].frames,start:Math.max(4,base.start-1),crouching:true};}
const ROUND_SECONDS=99;
const playModes=['solo','training','watcharcade','aisha','coxa'];
let roundLimit=5,suddenDeath=false,introDuration=0;
function winsNeeded(){return mode==='aisha'?1:roundLimit===1?1:3}
function formatLabel(){return roundLimit===1?'ONE ROUND':'BEST OF FIVE'}
function setRounds(value=roundLimit){
 if(mode!=='aisha')roundLimit=Number(value)===1?1:5;suddenDeath=false;
 $$('[data-rounds]').forEach(button=>{
  button.disabled=mode==='aisha';
  const selected=Number(button.dataset.rounds)===(mode==='aisha'?1:roundLimit);
  button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));
 });
}
function roundLabel(){return mode==='aisha'?androidLabel()+' / '+ANDROID_LIMIT:roundLimit===1?'ONE ROUND':`ROUND ${round} · FIRST TO ${winsNeeded()}`;}
function visualHeight(id){return fighterTraits[id].height/174;}

let arcadeOrder=[],arcadeIndex=0,matchWinner=-1,resultTime=0,resumeScene='fight';
function arcadeOpponents(playerId){
 return playableIds.filter(id=>id!==CELINA_ID&&(id!==playerId||id===HEATHER_ID));
}
function buildCelinaArcadeOrder(player,rotate=true){
 const final=player===AISHA_ID?14:AISHA_ID;
 const closing=[11,13].filter(id=>id!==player);
 const early=arcadeOpponents(player).filter(id=>id!==final&&!closing.includes(id));
 const start=rotate?Math.floor(Math.random()*early.length):0;
 const regular=early.slice(start).concat(early.slice(0,start),closing);
 const route=[];regular.forEach((id,i)=>{route.push(id);if(player!==CELINA_ID&&(i+1)%2===0)route.push(CELINA_ID);});
 route.push(final);return route;
}
function makeArcade(){
 resetArcadeScore();
 arcadeOrder=buildCelinaArcadeOrder(chosen[0]);
 beginNamedArcade();
 if(chosen[0]===COXA_ID&&namedArcadeRun){namedArcadeRun.currency='EUR';persistArcadeRun();}
 arcadeIndex=0;chosen[1]=arcadeOrder[0];
 arcadeStages.splice(0,arcadeStages.length,...arcadeOrder.map(homeStageFor));
}

const redesignImages=Object.fromEntries(Object.entries(redesignData).map(([id,d])=>{const im=new Image();im.src=d.src;return [id,im]}));
const privateArenaImages=['studio-v24.webp','meilin-hall-v24.webp','meilin-garden-v24.webp'].map(src=>{const im=new Image();im.src=src;return im});
const bossImage=new Image();bossImage.src='mestre-mare-clean.webp';
const atlases=[1,2,3].map(n=>{let i=new Image();i.src=`fighters-${n}.webp`+(n===3?"?v=3.4.2":"");return i});
let arcadeAutoplay=false;let roundIntro=false;let loaded=false,scene='title',mode='solo',difficulty='easy',menuMode=0,pick=0,pickStage=0,chosen=[0,5],players=[],round=1,wins=[0,0],timer=99,tick=0,last=0,freeze=0,shake=0,announcement='',announceTime=0,endWait=0,matchOver=false,pauseFocus=0,prevPads={},inputs=[],particles=[],sound=true,audioCtx,beat=0,lastPads=[],trainingDummy=0,rosterBuilt=false;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function setMode(m){
 if(!playModes.includes(m))return;
 arcadeAutoplay=m==='watcharcade';mode=m;menuMode=playModes.indexOf(m);setRounds();
 if(m==='aisha')androidSheet(1);
 $('#choose').textContent=m==='coxa'?'START COXA MODE':m==='aisha'?'START AISHA MODE':'CHOOSE YOUR FIGHTER';
 $$('[data-mode]').forEach(b=>b.classList.toggle('selected',b.dataset.mode===m));
}
function setDifficulty(d){difficulty=d;$$('[data-diff]').forEach(b=>b.classList.toggle('selected',b.dataset.diff===d));}
$('#quit').textContent='RETURN TO MAIN MENU';$('#backmenu').textContent='RETURN TO MAIN MENU';
$$('[data-rounds]').forEach(b=>b.onclick=()=>setRounds(b.dataset.rounds));
$$('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));$$('[data-diff]').forEach(b=>b.onclick=()=>setDifficulty(b.dataset.diff));
function show(id){['title','menu','select','pause','setup','result','story','ending','score','coxa-complete'].forEach(n=>$('#'+n)?.classList.toggle('hidden',n!==id))}
function connected(){return [...(navigator.getGamepads?.()||[])].filter(p=>p&&p.connected)}
const ANDROID_LIMIT=20;
let androidWave=1,androidRunId='',androidSaveState='';
function androidLabel(){return 'ANDROID '+String(androidWave).padStart(2,'0');}
function beginAndroidRun(){
 androidRunId=String(9999999999999-Date.now()).padStart(13,'0')+'-'+crypto.randomUUID();
 androidSaveState='';retrySentinelScores();
 resetArcadeScore();androidWave=1;wins=[0,0];round=1;
 chosen=[AISHA_ID,AISHA_ID];startRound();
}
function continueAndroidRun(){
 if(matchWinner===0 && androidWave<ANDROID_LIMIT){
  androidWave++;wins=[0,0];round=1;startRound();return;
 }
 saveAndroidOutcome();
 scene='watchcomplete';show(null);showAndroidOutcome();
 const panel=$('#watchcomplete');
 panel.hidden=false;
}
function choose(){stopResultSound();if(!loaded){$('#padhelp').textContent='Loading fighter artwork…';return}if(mode==='coxa'){beginCoxaRun();return}if(mode==='aisha'){beginAndroidRun();return}if(mode==='watcharcade'){mode='solo';arcadeAutoplay=true;}scene='select';pickStage=0;pick=chosen[0];show('select');updatePick()}
$('#choose').onclick=choose;$('#backmenu').onclick=()=>{scene='menu';show('menu')};$('#confirm').onclick=confirmPick;
let heatherWhiteSelected=false;
const outfitButton=document.createElement('button');
outfitButton.id='heather-outfit';outfitButton.type='button';outfitButton.hidden=true;
$('#confirm').parentElement?.insertBefore(outfitButton,$('#confirm'));
function toggleHeatherOutfit(){
 if(pick===COXA_ID){coxaCycleOutfit();updatePick();return;}
 if(pick!==HEATHER_ID)return;
 heatherWhiteSelected=!heatherWhiteSelected;
 updatePick();
}
outfitButton.onclick=toggleHeatherOutfit;
function updatePick(){
 outfitButton.hidden=pick!==HEATHER_ID&&pick!==COXA_ID;
 outfitButton.textContent=pick===COXA_ID?'Y · OUTFIT: '+COXA_COLORS[coxaSelected].toUpperCase()+' ('+coxaUnlocked+'/'+COXA_COLORS.length+' UNLOCKED)':'Y · OUTFIT: '+(heatherWhiteSelected?'ALL WHITE':'OAKLAND');
 outfitButton.setAttribute('aria-pressed',String(pick===COXA_ID?coxaSelected!==0:heatherWhiteSelected));
 if(pick===HEATHER_ID){
  const preview=$$('.fightercard')[playableIds.indexOf(HEATHER_ID)]?.querySelector('canvas');
  if(preview)facePortrait(preview,HEATHER_ID);
 }
 document.getElementById('roda-player-name-wrap').style.display=mode==='solo'&&!arcadeAutoplay?'flex':'none';
 $('#arenachoice').textContent=mode==='solo'?'ARCADE · '+buildCelinaArcadeOrder(pick,false).length+' BOUTS · OPPONENT HOME ARENAS':'STAGE '+(stageChoice+1)+'/'+stageNames.length+' · '+stageNames[stageChoice]+' · LT / RT TO CHANGE';
 $('#nextarena').hidden=mode==='solo';
 $('#picklabel').textContent=arcadeAutoplay?'WATCH ARCADE · SELECT A FIGHTER':'SELECT YOUR FIGHTER';
 $('#fightername').textContent=roster[pick][0].toUpperCase();$('#fighterstyle').textContent=characterRank(pick);
 $$('.fightercard').forEach((b,i)=>b.classList.toggle('active',playableIds[i]===pick));
 $('#confirm').textContent='A · ENTER THE RODA';
 const formatHint=$('#pick-format');if(formatHint)formatHint.textContent='LB · One round   /   RB · Best of five   ·   '+formatLabel();
}
function confirmPick(){
 if(!['solo','training'].includes(mode)||!Number.isInteger(pick)||!playableIds.includes(pick))return;
 if(!connected().length&&!arcadeAutoplay){$('#picklabel').textContent='CONNECT A CONTROLLER · PRESS A BUTTON TO ACTIVATE';return;}
 if(mode==='solo'&&!arcadeAutoplay&&!arcadeNameInput().value.trim()){$('#picklabel').textContent='ENTER YOUR NAME TO START ARCADE';arcadeNameInput().focus();return;}
 chosen[0]=pick;pickStage=0;
 if(mode==='solo')makeArcade();else chosen[1]=nextFighter(chosen[0],5);
 wins=[0,0];round=1;setRounds();startRound();if(mode==='solo')openStory();
}
function fighter(id,x,dir){return{id,x,dir,y:0,vy:0,hp:id===14?110:100,maxHp:id===14?110:100,meter:100,attack:null,at:0,hit:false,stun:0,block:false,crouch:false,buffer:null,combo:0,comboTimer:0,flash:0,aiWait:60,moveText:'GINGA',walk:0,ginga:id*4.1,stepOffset:0,jumpHeld:false,jumpBuffer:0,takeoff:0,landing:0,vx:0,down:0,invuln:0,hitAt:-100,reaction:0,pushV:0,impactKind:'mid'}}
function startRound(){
 setRounds();firstHitClaimed=false;roundRewarded=false;roundIntro=true;stopResultSound();musicCommand('setVolume',[35]);
 if(typeof localMusic!=='undefined'&&localMusic)localMusic.volume=.32;
 $('#restart').textContent=mode==='coxa'?'RESTART COXA MODE':mode==='solo'?'RESTART ARCADE RUN':mode==='aisha'?'RESTART AISHA MODE':'RESTART MATCH';$('#resume').classList.remove('hidden');
 activeStage=mode==='coxa'?(coxaRun?.arena??DEFAULT_STAGE):mode==='aisha'?homeStageFor(AISHA_ID):mode==='solo'?(arcadeStages[arcadeIndex]??DEFAULT_STAGE):stageChoice;
 if(activeStage<0||activeStage>=stageNames.length)activeStage=DEFAULT_STAGE;
 setStageMusic(activeStage);players=[fighter(chosen[0],390,1),fighter(chosen[1],890,-1)];
 players.forEach(p=>{if(p.id===COXA_ID)p.coxaColor=coxaSelected;});
 if(mode==='aisha'){
  players[1].android=true;
  players[1].unitNumber=androidWave;
  androidSheet(androidWave);
  if(androidWave<ANDROID_LIMIT)androidSheet(androidWave+1);
  for(const wave of androidSheets.keys())if(wave!==androidWave && wave!==androidWave+1)androidSheets.delete(wave);
  players[1].strengthBonus=androidWave-1;
  players[1].relayIndex=(androidWave-1)%12;
 }
 players[0].whiteUniform=chosen[0]===HEATHER_ID&&heatherWhiteSelected;
 players[1].whiteUniform=chosen[0]===HEATHER_ID&&chosen[1]===HEATHER_ID&&!heatherWhiteSelected;
 timer=ROUND_SECONDS;endWait=0;matchWinner=-1;matchOver=false;freeze=0;particles=[];inputs=[];
 scene='fight';show(null);announcement=mode==='training'?'TRAINING ROOM':round===1?'ENTER THE RODA':roundLabel();
 introDuration=mode==='aisha'?90:mode==='training'?60:round===1?270:120;announceTime=introDuration;
 $('#sessionlabel').textContent=(mode==='coxa'?'COXA MODE · STAGE '+coxaRun.stage+'/20 · '+difficulty.toUpperCase():mode==='aisha'?'AISHA MODE · '+roundLabel():mode==='training'?'TRAINING':(arcadeAutoplay?'WATCH ARCADE ':'ARCADE ')+(arcadeIndex+1)+'/'+arcadeOrder.length+' · '+difficulty.toUpperCase())+' · '+stageNames[activeStage];
}
function isMenuPrologue(targetScene=scene){return targetScene==='story'&&typeof storyPrologue!=='undefined'&&storyPrologue&&storyReturn==='menu';}
function togglePause(reason){
 if(scene==='fight'||scene==='result'||scene==='story'){
  if(activeStage===homeStageFor(CELINA_ID))localMusic?.pause();
  resumeScene=scene;scene='pause';pauseFocus=0;$('#pausetitle').textContent='PAUSED';$('#pausereason').textContent=reason||'Start to resume';show('pause');paintPause();
 }else if(scene==='pause'){
  if(!connected().length&&!arcadeAutoplay&&!isMenuPrologue(resumeScene)){$('#pausereason').textContent='Reconnect the controller to resume';return;}
  scene=resumeScene;if(activeStage===homeStageFor(CELINA_ID)&&sound&&musicEnabled)setStageMusic(activeStage);show(scene==='result'?'result':scene==='story'?(storyEnding?'ending':'story'):null);
 }
}
function paintPause(){$$('#pause button').forEach((b,i)=>b.classList.toggle('focused',i===pauseFocus))}
$('#resume').onclick=()=>togglePause();$('#restart').onclick=()=>{if(mode==='coxa'){beginCoxaRun();return}if(mode==='aisha'){beginAndroidRun();return}if(mode==='solo')makeArcade();wins=[0,0];round=1;suddenDeath=false;startRound();if(mode==='solo')openStory()};$('#quit').onclick=()=>{stopResultSound();scene='menu';players=[];freeze=0;endWait=0;storyEnding=false;show('menu');setStageMusic(-1);};
$('#fullscreen').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen?.();else $('#cabinet').requestFullscreen?.()};
$('#sound').onclick=()=>{sound=!sound;$('#sound').textContent=sound?'SOUND ON':'SOUND OFF';if(sound){initAudio();setStageMusic(scene==='title'?-1:activeStage)}else if(typeof localMusic!=='undefined')localMusic?.pause()};
function initAudio(){try{audioCtx ||=new(window.AudioContext||window.webkitAudioContext)();audioCtx.resume();loadSamples()}catch(e){sound=true}}
function tone(freq,dur=.1,volume=.08,type='sine'){if(!sound)return;initAudio();if(!audioCtx)return;let o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(freq,audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(40,freq*.55),audioCtx.currentTime+dur);g.gain.setValueAtTime(volume,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+dur);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+dur)}
function padState(p){let b=normalizedButtons(p),old=prevPads[p.index]||[],edge=b.map((v,i)=>v&&!old[i]);prevPads[p.index]=b;return{b,edge,x:(b[14]?-1:0)+(b[15]?1:0)||(Math.abs(p.axes[0]||0)>.25?p.axes[0]:0),y:(b[12]?-1:0)+(b[13]?1:0)||(Math.abs(p.axes[1]||0)>.25?p.axes[1]:0)}}

let customPads={};try{customPads=JSON.parse(localStorage.getItem('roda-controller-map')||'{}')}catch(e){}
let setupPad=null,setupStep=-1,setupWait=true,setupNeutral=[],setupBindings={},setupPrev=[];
const setupSteps=[[0,'A · MID KICK 1 / CONFIRM'],[1,'B · MID KICK 2 / BACK'],[2,'X · HARD KICK 1'],[3,'Y · HARD KICK 2'],[4,'LB · SPECIAL MOVE 1'],[5,'RB · SPECIAL MOVE 2'],[9,'START · PAUSE / RESUME'],[8,'VIEW / BACK · TRAINING DUMMY'],[6,'LT · MESTRE ATTACK / TRAINING RESET'],[7,'RT · MESTRE ATTACK / NEXT ARENA'],[12,'D-PAD UP'],[13,'D-PAD DOWN'],[14,'D-PAD LEFT'],[15,'D-PAD RIGHT']];
function bindingPressed(p,a){if(a.type==='button')return !!p.buttons[a.index]?.pressed;let v=p.axes[a.index]||0;if(Math.abs(v-a.neutral)<.2)return false;if(a.hat){let d=Math.abs(v-a.value);return Math.min(d,Math.abs(d-2.285714))<.31}return a.value<0?v<-.5:v>.5}
function normalizedButtons(p){let b=p.buttons.map(x=>x.pressed),config=customPads[p.id];if(config){b=Array(17).fill(false);Object.entries(config).forEach(([i,a])=>b[i]=bindingPressed(p,a))}return b}
function openSetup(){scene='setup';setupPad=null;setupStep=-1;setupWait=true;show('setup');$('#setupstep').textContent='Press any button on the controller to configure.';$('#setupdevice').textContent='';}
$('#padsetup').onclick=openSetup;$('#setupcancel').onclick=()=>{scene='menu';show('menu');prevPads={}};$('#setupreset').onclick=()=>{customPads={};try{localStorage.removeItem('roda-controller-map')}catch(e){}$('#setupcancel').click()};
function calibratePads(pads){if(setupPad===null){let p=pads.find(p=>p.buttons.some(b=>b.pressed));if(!p)return;setupPad=p.index;setupStep=0;setupBindings={};setupNeutral=p.axes.slice();setupWait=true;$('#setupdevice').textContent=p.id;$('#setupstep').textContent='Release all controls…';return}let p=pads.find(p=>p.index===setupPad);if(!p){$('#setupstep').textContent='Reconnect the controller to continue.';return}let neutral=!p.buttons.some(b=>b.pressed)&&p.axes.every((v,i)=>Math.abs(v-(setupNeutral[i]||0))<.2);if(setupWait){if(neutral){setupWait=false;$('#setupstep').textContent='Press '+setupSteps[setupStep][1]}return}let bi=p.buttons.findIndex(b=>b.pressed),a=null;if(bi>=0)a={type:'button',index:bi};else{let ai=p.axes.findIndex((v,i)=>Math.abs(v-(setupNeutral[i]||0))>.45);if(ai>=0)a={type:'axis',index:ai,value:p.axes[ai],neutral:setupNeutral[ai]||0,hat:ai>3||Math.abs(setupNeutral[ai]||0)>1}}if(!a)return;setupBindings[setupSteps[setupStep][0]]=a;setupStep++;if(setupStep>=setupSteps.length){customPads[p.id]=setupBindings;try{localStorage.setItem('roda-controller-map',JSON.stringify(customPads))}catch(e){}scene='menu';show('menu');$('#padhelp').textContent='Controller mapping saved. Ready to play.';prevPads={};return}setupWait=true;$('#setupstep').textContent='Registered. Release all controls…'}
// Preserve the original six stage indices for existing music and stage selections.
const arenas = [
 {name:'AMAZONIAN RESEARCH STATION INTERIOR',file:'research-station.png',owner:5},
 {name:'PELOURINHO ART STUDIO',file:'pelourinho-art-studio.png',owner:0},
 {name:'PAULISTA AVENUE APARTMENT',file:'paulista-apartment.png',owner:6},
 {name:'MEILIN’S ALTAR',file:'meilin-altar.png'},
 {name:'MEILIN’S COURTYARD',file:'comic/courtyard.jpg',owner:7},
 {name:'SKULL STUDIO',file:'skull-studio-v26.webp',owner:11},
 {name:'WEATHERED CAPOEIRA STUDIO',file:'arenas/weathered-studio.webp',owner:1},
 {name:'CACHOEIRA HERITAGE SQUARE',file:'brazil-arenas-2.webp',tile:2},
 {name:'SOLAR STUDIO',file:'arenas/solar-studio.webp',owner:3},
 {name:'BELÉM WATERFRONT',file:'brazil-arenas.webp',tile:3,owner:4},
 {name:'FORTALEZA BEACHFRONT',file:'brazil-arenas-2.webp',tile:1,owner:8},
 {name:'MOSAIC STUDIO',file:'arenas/mosaic-studio.webp',owner:9},
 {name:'WINGED SUN DOJO',file:'arenas/winged-sun-dojo.webp',owner:10},
 {name:'SKULL EMBLEM STUDIO',file:'arenas/skull-gallery.webp',owner:13},
 {name:'MESTRE’S SUNLIT STUDIO',file:'arenas/sunlit-studio.webp',owner:14},
 {name:'SENTINEL STUDIO 2323',file:'arenas/sentinel-studio.webp',owner:15},
 {name:'OAKLAND–BAHIA EXCHANGE',file:'arenas/oakland-bahia.webp',owner:HEATHER_ID},
 {name:'CELINA’S HOME · SALVADOR, BAHIA',file:CELINA_ASSET_ROOT+'stage.webp',owner:CELINA_ID}
];
const stageNames=arenas.map(arena=>arena.name);
const DEFAULT_STAGE=4;
const homeStages=new Map(arenas.flatMap((arena,index)=>arena.owner===undefined?[]:[[arena.owner,index]]));
function homeStageFor(id){return homeStages.get(id)??DEFAULT_STAGE;}
let activeStage=DEFAULT_STAGE,stageChoice=DEFAULT_STAGE;
const arcadeStages=[];
const arenaImages=['brazil-arenas.webp','brazil-arenas-2.webp','brazil-arenas-3.webp'].map(src=>{let i=new Image();i.src=src;return i});const musicianImage=new Image();musicianImage.src='roda-musicians.webp';const crowdImage=new Image();crowdImage.src='roda-crowd-v22.webp';

let navAt=0;
function pollPads(){
 lastPads=connected();
 if(scene==='setup'){calibratePads(lastPads);return [];}
 const states=lastPads.map(padState);
 $('#connection').textContent=lastPads.length?`● ${lastPads.length} CONTROLLER${lastPads.length>1?'S':''} CONNECTED`:'● CONNECT A CONTROLLER';
 $('#status').textContent=arcadeAutoplay?'CPU CONTROL · NO CONTROLLER REQUIRED':lastPads.length?'CONTROLLER READY':'AWAITING CONTROLLER';
 if(!arcadeAutoplay&&!isMenuPrologue()&&['fight','result','story'].includes(scene)&&!lastPads.length){togglePause('Controller disconnected. Reconnect, then press Start.');return states;}
 const s=states[0];if(!s)return states;
 if(scene==='coxa-complete'){if(s.edge[0]||s.edge[9])$('#coxa-done').click();return states}
 if(scene==='watchcomplete'){if(s.edge[0]||s.edge[9])$('#watchdone').click();return states}
 if(scene==='foundation'){if(s.edge[9]||s.edge[0])finishFoundation();return states;}
 if(scene==='title'){
  if(s.edge[9]||s.edge[0])startOpeningFilm();
 }else if(scene==='openingfilm'){
  if(s.edge[9]||s.edge[1])finishOpeningFilm();
  else if(s.edge[0])playOpeningFilm();
 }else if(scene==='menu'){
  // The controller guard delivers one direction per press, including analog deflections.
  if(s.x<-.5)setRounds(1);
  else if(s.x>.5)setRounds(5);
  else if(Math.abs(s.y)>.5)setMode(playModes[(menuMode+(s.y>0?1:playModes.length-1))%playModes.length]);
  if(s.edge[3])setRounds(roundLimit===1?5:1);
  if(s.edge[2])setDifficulty(difficulty==='easy'?'normal':'easy');
  if(s.edge[8])openSetup();else if(s.edge[0]||s.edge[9])choose();
 }else if(scene==='select'){
  if(s.edge[4]||s.edge[5]){setRounds(s.edge[4]?1:5);updatePick();}
  if(mode==='training'&&(s.edge[6]||s.edge[7])){stageChoice=(stageChoice+(s.edge[7]?1:stageNames.length-1))%stageNames.length;activeStage=stageChoice;updatePick();}
  if(Math.abs(s.x)>.5||Math.abs(s.y)>.5){pick=nextFighter(pick,Math.abs(s.x)>.5?Math.sign(s.x):5*Math.sign(s.y));updatePick();navAt=uiTick+13;}
  if(s.edge[3])toggleHeatherOutfit();
  if(s.edge[0])confirmPick();if(s.edge[1]){scene='menu';show('menu');}
 }else if(scene==='score'){
  if(s.edge[9]){returnToMenu();return states}if(s.edge[0])saveArcadeName();if(s.edge[1])openComicEnding();
 }else if(scene==='story'){
  if(s.edge[9])togglePause();else if(s.edge[0])advanceStory();
 }else if(scene==='pause'){
  if(s.edge[9])togglePause();
  else{if(uiTick>navAt&&Math.abs(s.y)>.5){pauseFocus=(pauseFocus+(s.y>0?1:2))%3;paintPause();navAt=uiTick+15;}if(s.edge[0])[$('#resume'),$('#restart'),$('#quit')][pauseFocus].click();}
 }else if(scene==='result'&&mode==='solo'&&!arcadeAutoplay&&chosen[1]===CELINA_ID&&s.edge[0])autoContinue();
 else if(['fight','result'].includes(scene)&&s.edge[9])togglePause();
 return states;
}
function record(text){inputs.unshift({text,t:tick});inputs=inputs.slice(0,6)}
function beginAttack(p,n,crouched=p.crouch){if(p.id===COXA_ID&&!coxaCanAttack(n,crouched))return false;p.attackCrouched=!!crouched&&p.y===0;let m=moveFor(p,n);if(p.stun>0||p.down>0||p.hp<=0||inJump(p)||p.rollTime>0)return false;if(p.meter<m.cost&&mode!=='training'){if(p===players[0])record('NOT ENOUGH AXÉ');return false}p.meter=mode==='training'?100:p.meter-m.cost;p.attack=n;p.at=0;p.phase=-1;p.hit=false;p.confirmed=false;p.swingPlayed=false;p.block=false;p.moveText=(m.signature||m.name).toUpperCase();if(p===players[0])record(m.button+' · '+m.name);return true}
function inJump(p){return p.takeoff>0||p.y>0||p.vy!==0}
function requestAttack(p,n,crouched=p.crouch){if(p.id===COXA_ID&&!coxaCanAttack(n,crouched))return;if(inJump(p)||p.rollTime>0||p.down>0||p.hp<=0)return;if(p.attack===null&&p.stun<=0&&p.takeoff<=0)beginAttack(p,n,crouched);else p.buffer={n,crouched:!!crouched,ttl:24}}
function advanceAir(p,dt){if(p.y>0||p.vy){p.y+=p.vy*dt;p.vy-=(p.vy>0?.52:.76)*dt;if(p.y<=0){p.y=0;p.vy=0;p.landing=6;burst(p.x,590,'#d0b48155',5)}}}
function updateRoll(p,input,dt){
 const direction=Math.abs(input?.x||0)>.6?Math.sign(input.x):0;
 if(p.stun>0||p.down>0||p.hp<=0){p.rollTime=0;p.tapWindow=0;}
 const ready=!inJump(p)&&p.attack===null&&p.stun<=0&&p.down<=0&&p.hp>0;
 // Celina begins a complete grounded roll on held horizontal input.
 // Down + away and holding away against an incoming attack retain guard.
 if(p.id===CELINA_ID&&ready&&direction&&!(p.rollTime>0)&&!(input.y>.5)&&!(input.y<-.5)
    &&!(direction===-p.dir&&players.find(other=>other!==p)?.attack!=null)){
  p.rollTime=24;p.rollDirection=direction;p.buffer=null;p.jumpBuffer=0;
 }
 if(ready&&direction&&direction!==p.previousDirection&&!(p.rollTime>0)){
  if(p.tapDirection===direction&&p.tapWindow>0){
   p.rollTime=24;p.rollDirection=direction;p.tapWindow=0;p.buffer=null;p.jumpBuffer=0;if(p.id===COXA_ID)p.coxaRollFacing=p.dir;
  }else{p.tapDirection=direction;p.tapWindow=14;}
 }
 p.previousDirection=direction;p.tapWindow=Math.max(0,(p.tapWindow||0)-dt);
 if(!(p.rollTime>0))return false;
 p.x=clamp(p.x+p.rollDirection*5*dt,100,1180);p.vx=0;p.crouch=true;p.block=false;
 p.moveText=p.dir===p.rollDirection?'FORWARD ROLL':'BACKWARD ROLL';
 p.rollTime=Math.max(0,p.rollTime-dt);
 if((p.id===CELINA_ID||p.id===COXA_ID)&&!p.rollTime)p.crouch=false;
 if(p.id===COXA_ID&&!p.rollTime)p.coxaRollFacing=null;
 return true;
}
// Source-head scale in each eight-frame row, measured against the upright
// guard. Keep a single lens through each move so tucked limbs stay tucked.
const identityRowScale = {
  1: [1,.86,.92,.90,.90,.88,.89,.90],
  4: [1,.92,1,.93,.94,.92,.90,.94],
  6: [1,.87,.86,.84,.83,.84,.84,.82],
  8: [1,.93,.85,.90,.89,.85,.84,.90],
  9: [1,.98,.94,.94,.96,.94,.95,.96],
  14:[1,.97,.97,.95,.95,.97,.94,.97]
};
// The retreat sheet was painted at a different resolution for each fighter.
// Calibrate each triplet once; the contact point stays on the same floor.
const retreatModelScale = {1:.97,4:1.26,6:1.06,8:1.33,9:1.3,14:1.17};
// Authored sheets were painted at different scales. These fixed source ratios
// come from comparing each sheet’s head, torso and opaque silhouette to idle.
// Every frame on a given source shares its ratio, including horizontal poses.
const legacyModelScales={
 0:{base:0.96, transition:0.96, motion:0.92, reaction:0.99, highHit:0.96, turn:0.91, bencao:1.02, normal:0.94, special0:1, special1:0.95, defeat:1.22, retreat:1.19},
 3:{base:1.03, transition:1, motion:0.88, reaction:1.02, highHit:1.04, turn:0.91, bencao:0.88, normal:1.04, special0:1.01, special1:0.97, defeat:1.28, retreat:1.18},
 5:{base:1.02, transition:1.02, motion:0.94, reaction:0.98, highHit:0.94, turn:0.87, bencao:0.88, normal:1.12, special0:0.93, special1:1.02, defeat:1.2, retreat:1.19},
 10:{base:1.02, transition:1.01, motion:0.92, reaction:1, highHit:0.94, turn:0.83, bencao:0.89, normal:1.25, special0:1.07, special1:1.02, defeat:1.17, retreat:1.22},
 11:{base:1.07, transition:1.07, motion:0.92, reaction:1.04, highHit:1.01, turn:0.84, bencao:0.92, normal:0.92, special0:0.99, special1:0.97, defeat:1.23, retreat:1.28},
 13:{base:1.09, transition:1.1, motion:1, reaction:1.07, highHit:1.12, turn:0.92, bencao:1.03, normal:1.09, special0:0.93, special1:0.98, defeat:1.26, retreat:1.34},
};
function legacyModelScale(id,source){return legacyModelScales[id]?.[source]??1;}
const retreatArt=new Image();retreatArt.src='handspring-retreat.webp';
const meilinRetreatArt=new Image();meilinRetreatArt.src='meilin-handspring.webp';
function drawHandspring(p){
 const age=32-p.rollTime;
 if(age<5||age>=27){drawFighterBody({...p,rollTime:0,crouch:true},fighterTraits[p.id]);return}
 const cell=age<12?0:age<21?1:2;
 const lift=age<12?24*Math.sin(Math.PI*(age-5)/7):age>=21?17*Math.sin(Math.PI*(age-21)/6):0;
 if(p.id===7){
  if(!meilinRetreatArt.complete||!meilinRetreatArt.naturalWidth){
   drawRedesignFrame(p,32+[2,4,5][cell]);return;
  }
  const scale=305/redesignData[7].referenceHeight;
  ctx.save();ctx.translate(p.x,590-lift);ctx.scale(p.dir,1);
  ctx.drawImage(meilinRetreatArt,cell*320,0,320,320,-160*scale,-300*scale,320*scale,320*scale);
  ctx.restore();return;
 }
 ctx.save();ctx.translate(p.x,590-lift);ctx.scale(p.dir,1);
 const scale=retreatModelScale[p.id]??legacyModelScale(p.id,'retreat');
 ctx.drawImage(retreatArt,cell*320,p.id*320,320,320,-160*scale,-306*scale,320*scale,320*scale);ctx.restore();
}
const groundRollArt=new Image();
groundRollArt.src='ground-rolls.webp';
// The height calibration is measured once against each fighter’s standing sprite.
const groundRollTucks={"0": [0, 0.9189], "1": [1, 1.0041], "3": [2, 0.9486], "4": [3, 0.8164], "5": [4, 0.8736], "6": [5, 0.8616], "8": [6, 0.8265], "9": [7, 0.8679], "10": [8, 0.8921], "11": [9, 0.8719], "13": [10, 0.8044], "14": [11, 0.9692]};
function drawGroundRoll(p){
 const age=24-p.rollTime;
 if(age<4||age>20){drawFighterBody({...p,rollTime:0,crouch:true},fighterTraits[p.id]);return}
 const poseIndex=age<9?0:age<16?1:2;
 const step=p.rollDirection===p.dir?poseIndex:2-poseIndex;
 if(step===1 && groundRollTucks[p.id] && groundRollArt.naturalWidth){
  const [cell,standingScale]=groundRollTucks[p.id];
  const scale=standingScale/visualHeight(p.id);
  ctx.save();ctx.translate(p.x,590);ctx.scale(p.dir,1);
  ctx.drawImage(groundRollArt,cell%4*256,Math.floor(cell/4)*256,256,256,-128*scale,-250*scale,256*scale,256*scale);
  ctx.restore();return;
 }
 if(p.id===7 && step===1 && flipImages[7]?.complete && flipImages[7].naturalWidth){
  // The tucked frame was painted higher in its tile for the aerial flip.
  // Ground that same pose on the roll, using its standing-frame calibration.
  const stance=redesignData[7].rects[0][3]*305/redesignData[7].referenceHeight;
  const scale=stance/flipData[7].stanceHeight;
  ctx.save();ctx.translate(p.x,590);ctx.scale(p.dir,1);
  ctx.drawImage(flipImages[7],640,0,320,320,-160*scale,-275*scale,320*scale,320*scale);
  ctx.restore();return;
 }
 if(p.id===14){
  const index=[9,14,9][step];
  drawPacked(p,combatImages[14],index,305/(combatData[14].referenceHeight*identityRowScale[14][1]));return;
 }
 if(identityRowScale[p.id]){
  const poses=({1:[2,13,6],4:[33,34,38],6:[33,35,38],8:[33,35,38],9:[25,26,29]})[p.id];
  drawRedesignFrame(p,poses[step]);return;
 }
 // These poses already include the turn of the torso and the planted hand.
 if(redesignData[p.id]){
  const row=p.id===7?4:3;
  drawRedesignFrame(p,row*8+[2,4,6][step]);return;
 }
 extraSprite(p,[4,5,7][step],p.x,590,true,1.48);
}
function strikeInReach(p,opp,m){
 let reach=m.range;
 let open=p.id===AISHA_ID?2:0,close=7;
 if(p.id===CELINA_ID&&m.art){open=m.contact*m.frames/m.art.length;close=(m.contact+1)*m.frames/m.art.length;}
 if(opp.android && p.id===AISHA_ID){
  // The unit's front hurtbox extends beyond its ground anchor. Match the
  // contact window to the painted kick, and keep the normal close-range reach.
  const [,,,,anchor,scale]=aishaRects[m.pose];
  reach=Math.max(reach,(aishaSole[m.pose][0]-anchor)*scale+48);
  close=9;
 }
 return m.phaseFrame>=open && m.phaseFrame<close && Math.abs(opp.x-p.x)<reach;
}
function updateFighter(p,opp,s,dt){if(updateRoll(p,s,dt))return;if(p.fallSoundAt&&tick>=p.fallSoundAt){playSample('fall',.8);p.fallSoundAt=0}p.flash=Math.max(0,p.flash-dt);p.invuln=Math.max(0,p.invuln-dt);p.x=clamp(p.x+p.pushV*dt,100,1180);p.pushV*=Math.pow(.84,dt);if(p.down>0){p.down=Math.max(0,p.down-dt);p.attack=null;p.stun=0;p.block=false;advanceAir(p,dt);p.moveText=p.down<14?'RECOVERY':'KNOCKDOWN';if(p.down===0)p.invuln=12;return}p.comboTimer-=dt;if(p.comboTimer<=0)p.combo=0;p.meter=Math.min(100,p.meter+.045*dt);if(p.buffer){p.buffer.ttl-=dt;if(p.buffer.ttl<=0)p.buffer=null}if(p.stun>0){p.stun-=dt;p.block=p.guardStun===true;p.attack=null;p.moveText=p.guardStun?'BLOCK':'HIT';advanceAir(p,dt);return}p.guardStun=false;p.dir=opp.x>=p.x?1:-1;let up=!!s&&s.y<-.6;if(up&&!p.jumpHeld)p.jumpBuffer=9;p.jumpHeld=up;if(p.jumpBuffer>0)p.jumpBuffer-=dt;p.walk=s?.x||0;let stepStart=p.x;p.stepOffset=0;p.landing=Math.max(0,p.landing-dt);if(p.takeoff>0){p.takeoff-=dt;if(p.takeoff<=0){p.vy=14.8;p.y=1;p.crouch=false;p.block=false}}
if(p.attack!==null){let base=moveFor(p,p.attack);p.at+=dt;let m=attackPhase(base,p.at);if(p.phase!==m.phase){p.phase=m.phase;p.hit=false;p.swingPlayed=false}let active=p.at>=m.start&&p.at<m.start+m.active;if(active&&!p.swingPlayed){p.swingPlayed=true;sfx('swing',m.rank)}
if(p.y>0&&s){p.vx+=(s.x*fighterTraits[p.id].speed-p.vx)*.16;p.x+=p.vx*dt};if(p.y===0){if(p.at<m.start)p.x+=p.dir*(base.retreat||0)*dt;else if(active)p.x+=p.dir*m.travel*dt;}
if(active&&!p.hit&&strikeInReach(p,opp,m)&&Math.abs(opp.y-p.y)<110&&opp.down<=0&&opp.invuln<=0){p.hit=true;let avoids=opp.crouch&&m.level==='high';if(avoids){tone(220,.06,.03)}else{p.confirmed=true;let blocked=opp.block&&(m.level!=='low'||opp.crouch);if(blocked){opp.stun=7;opp.guardStun=true;opp.meter=Math.min(100,opp.meter+5);p.meter=Math.min(100,p.meter+3);opp.moveText='BLOCK';burst((p.x+opp.x)/2,opp.crouch?505:405,'#c9f9ff',9);sfx('block',m.rank);rumble(players.indexOf(opp),.14,60)}else{let dmg=p.id===COXA_ID?coxaDamagePercent(opp.maxHp,m):p.id===CELINA_ID&&m.powerKick?opp.maxHp*.25:p.id===AISHA_ID?opp.maxHp*(p.android ? .01 : .02):m.damage*Math.max(.55,1-p.combo*.1);if(p.android)dmg*=1+p.strengthBonus/100;let actualDamage=Math.min(opp.hp,dmg);opp.hp=Math.max(0,opp.hp-dmg);scoreContact(p,opp,actualDamage);opp.stun=m.rank===3?33:24;opp.guardStun=false;opp.flash=8;opp.attack=null;opp.buffer=null;p.combo++;p.comboTimer=80;p.meter=Math.min(100,p.meter+8);opp.meter=Math.min(100,opp.meter+6);opp.pushV=p.dir*m.push;opp.hitAt=tick;opp.reaction=m.level==='high'?4:1;opp.impactKind=m.level;if(m.knockdown||opp.hp<=0){opp.down=opp.hp<=0?999: m.rank===3?52:40;opp.comboTimer=0;opp.fallSoundAt=tick+8}rumble(players.indexOf(opp),m.rank===3?.55:.3,90);if(mode!=='aisha'||m.phase===base.phases.length-1)shake=m.rank===3?10:5;freeze=m.rank===3?4:2;burst((p.x+opp.x)/2,m.level==='low'?530:m.level==='high'?590-270*fighterTraits[opp.id].height/174:410,m.rank===3?fighterTraits[p.id].accent:'#ffe999',m.rank===3?36:18);sfx('hit',m.rank);vocal(opp.id,opp.hp<=0?'defeat':'hit')}}}
let cancel=p.id!==COXA_ID&&p.id!==CELINA_ID&&p.id!==HEATHER_ID&&p.id!==AISHA_ID&&(p.confirmed||p.at>=m.start+m.active+2)&&p.at>=m.start+Math.max(2,m.active*.3)&&p.buffer&&(moveFor(p,p.buffer.n).rank>m.rank||(p.combo<3&&p.buffer.n!==p.attack&&moveFor(p,p.buffer.n).rank===m.rank));
if(cancel||p.at>=m.start+m.active+m.end){p.attack=null;if(p.buffer){let queued=p.buffer;p.buffer=null;beginAttack(p,queued.n,queued.crouched)}}
}else{p.crouch=p.y<=0&&s?.y>.5;p.block=!!s&&(s.guard===true||s.x*p.dir<-.35)&&p.y<=0;if(p.crouch)p.vx=0;if(!p.crouch&&s){let target=s.x*(p.block&&opp.attack!==null?2.7:fighterTraits[p.id].speed);p.vx+=(target-p.vx)*(p.y>0?.16:.62);if((!s.x&&!inJump(p))||Math.abs(p.vx)<.03)p.vx=0;p.x+=p.vx*dt}if(p.jumpBuffer>0&&p.y<=0&&p.takeoff<=0){p.buffer=null;p.takeoff=3;p.jumpBuffer=0;p.crouch=false;p.block=false}p.moveText=p.crouch?(p.block?'LOW GUARD':'ESQUIVA'):p.block?'GUARD':'GINGA';if(p.buffer){let queued=p.buffer;p.buffer=null;beginAttack(p,queued.n,queued.crouched)}}
advanceAir(p,dt);p.x=clamp(p.x,100,1180);
{
 const moving=p.y===0&&p.attack===null&&!p.crouch&&Math.abs(p.vx)>.25;
 const direction=moving?Math.sign(p.vx):0;
 if(!direction||direction!==p.travelDirection)p.travelDistance=0;
 if(direction)p.travelDistance=(p.travelDistance||0)+Math.abs(p.x-stepStart);
 p.travelDirection=direction;
}
// Distance-driven phase; never translate a whole sprite with a resetting sawtooth.
if(p.y===0&&p.attack===null&&!p.crouch){const travel=(p.x-stepStart)*p.dir;if(Math.abs(travel)>.03)p.ginga+=travel;}
}
function androidInput(p,opp,dt){
 const distance=Math.abs(p.x-opp.x);
 p.aiWait-=dt;
 // Commit to a planted guard briefly. Backward movement here used to send
 // the unit out of range, then reverse it immediately into another roll.
 if(p.attack===null && p.stun<=0 && opp.attack!==null && distance<220 &&
    p.aiWait>0 && p.aiWait<=18)
  return {x:0,y:moveFor(opp,opp.attack).level==='low'?1:0,guard:true};
 if(distance>175)return {x:p.dir,y:0};
 if(p.attack===null && p.stun<=0 && p.down<=0 && !(p.rollTime>0) && p.aiWait<=0){
  const slot=Math.floor(p.relayIndex/2),low=p.relayIndex%2===1;
  requestAttack(p,slot,low);
  if(p.attack!==null){
   p.relayIndex=(p.relayIndex+1)%12;
   p.aiWait=105+(difficulty==='easy'?24:0)-androidWave+Math.random()*16;
  }
  return {x:0,y:low?1:0};
 }
 return {x:0,y:0};
}
function ai(p,opp,dt){if(p.android)return androidInput(p,opp,dt);if(mode==='training'){if(trainingDummy===1)return{x:-p.dir,y:0};if(trainingDummy===2)return{x:-p.dir,y:1};return{x:0,y:0}}p.aiWait-=dt;let dist=Math.abs(p.x-opp.x),normal=difficulty==='normal';let s={x:dist>155?p.dir*(normal?.85:.6):0,y:0};if(opp.attack!==null&&dist<250&&normal&&p.aiWait<20){s.x=-p.dir;s.y=moveFor(opp,opp.attack).level==='low'?1:0}if(p.aiWait<=0){p.aiWait=normal?24+Math.random()*26:55+Math.random()*65;if(dist<255&&Math.random()<(normal?.9:.65)){let n=p.id===CELINA_ID?Math.floor(Math.random()*(p.meter>=50?8:6)):Math.floor(Math.random()*(p.id===7||p.meter>=50?6:4));requestAttack(p,n,(p.id===CELINA_ID&&n<6&&Math.random()<.3)||(p.id===COXA_ID&&n===1&&Math.random()<.35))}else if(dist<160)s.x=-p.dir}return s}
function finishRound(){
 const health=players.map(p=>p.hp/p.maxHp);
 const win=Math.abs(health[0]-health[1])<1e-9?-1:health[0]>health[1]?0:1;
 if(win>=0){wins[win]++;scoreRound(win);}
 matchOver=win>=0&&wins[win]>=winsNeeded();matchWinner=win;roundIntro=false;
 if(matchOver)recordNamedBout();
 if(mode==='aisha'&&matchOver&&(win===1||androidWave===ANDROID_LIMIT))saveAndroidOutcome();
 announcement=win<0?'DRAW · REPLAY ROUND':matchOver?(mode==='solo'&&win===0&&arcadeIndex===arcadeOrder.length-1?'RODA CHAMPION!':(players[win].android?androidLabel():roster[players[win].id][0].toUpperCase())+' WINS!'):(players.some(p=>p.hp<=0)?'K.O.':'TIME UP');
 announceTime=180;endWait=180;
}
function update(dt,states){
 if(scene==='story'){storyTime-=dt;if(storyTime<=0)advanceStory();return;}
 if(scene==='result'){resultTime-=dt;if(resultTime<=0){
   if(mode==='solo'&&chosen[1]===HEATHER_ID)openHeatherComic(true);
   else autoContinue();
  }return;}
 if(scene!=='fight')return;
 if(roundIntro){
  announceTime=Math.max(0,announceTime-dt);
  if(mode==='aisha')announcement=roundLabel();else if(mode!=='training'){const elapsed=introDuration-announceTime;announcement=round===1&&elapsed<80?'ENTER THE RODA':round===1&&elapsed<180?'FAMILY. RHYTHM. RESILIENCE.':roundLabel();}
  if(announceTime<=0)roundIntro=false;
  return;
 }
 if(endWait>0){
  freeze=0;
  for(const p of players){advanceAir(p,dt);p.x=clamp(p.x+p.pushV*dt,100,1180);p.pushV*=Math.pow(.84,dt);p.flash=Math.max(0,p.flash-dt);p.attack=null;}
  endWait-=dt;
  if(endWait<=0){if(matchOver)showResults();else{round=wins[0]+wins[1]+1;startRound();}}
  return;
 }
 if(freeze>0){freeze=Math.max(0,freeze-dt);return;}
 if(mode==='training'){
  players.forEach(p=>p.meter=100);
  if(states[0]?.edge[8]){trainingDummy=(trainingDummy+1)%3;record(['DUMMY: STAND','DUMMY: GUARD','DUMMY: LOW GUARD'][trainingDummy]);}
  const trainingShortcuts=![14,CELINA_ID].includes(players[0].id)||states[0]?.b?.[8];
  if(trainingShortcuts&&states[0]?.edge[6]){wins=[0,0];round=1;startRound();record('TRAINING RESET');return;}
  if(trainingShortcuts&&states[0]?.edge[7]){stageChoice=(activeStage+1)%stageNames.length;activeStage=stageChoice;setStageMusic(activeStage);record(stageNames[activeStage]);}
 }
 // A second controller never supplies an opponent input. Watch Arcade delegates both fighters to the CPU.
 states=arcadeAutoplay?[ai(players[0],players[1],dt),ai(players[1],players[0],dt)]:[states[0],ai(players[1],players[0],dt)];
 for(let i=0;i<2;i++){
  const p=players[i],st=states[i];p.dir=players[1-i].x>=p.x?1:-1;
  if(st&&p.attack===null&&p.stun<=0&&p.down<=0){p.crouch=p.y===0&&st.y>.5;p.block=p.y===0&&(st.guard===true||st.x*p.dir<-.35);}
 }
 for(let i=0;i<2;i++){
  const p=players[i],st=states[i];
  if(st?.edge&&st.y>=-.5&&i===0&&!arcadeAutoplay)for(let n=0;n<characterMoves[p.id].length;n++)if(st.edge[n])requestAttack(p,n,st.y>.5);
  if(st&&p.attack===null&&p.stun<=0&&p.down<=0){p.crouch=p.y<=0&&st.y>.5;p.block=p.y<=0&&(st.guard===true||st.x*p.dir<-.35);}
 }
 timer=Math.max(0,timer-dt/60);if(timer<1e-8)timer=0;
 for(let i=0;i<2;i++)updateFighter(players[i],players[1-i],states[i],dt);
 const gap=players[1].x-players[0].x;
 if(Math.abs(gap)<80){const sign=gap>=0?1:-1,shift=(80-Math.abs(gap))/2;players[0].x-=shift*sign;players[1].x+=shift*sign;}
 if(players.some(p=>p.hp<=0)||timer===0)finishRound();
}
function burst(x,y,color,n){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*18,vy:(Math.random()-.5)*15,life:20+Math.random()*10,color})}
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h)}
function text(s,x,y,size=20,color='#fff',align='left',font='Barlow Condensed'){ctx.fillStyle=color;ctx.textAlign=align;ctx.font=`800 ${size}px "${font}", Impact, sans-serif`;ctx.fillText(s,x,y)}
function poly(points,fill){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill()}
const stage=document.createElement('canvas');stage.width=W;stage.height=H;const sx=stage.getContext('2d');
function buildStage(){let old=ctx;let g=sx.createLinearGradient(0,0,0,660);g.addColorStop(0,'#304940');g.addColorStop(.5,'#c3a765');g.addColorStop(1,'#b57442');sx.fillStyle=g;sx.fillRect(0,0,W,H);sx.fillStyle='#f9d891';sx.beginPath();sx.arc(900,155,90,0,Math.PI*2);sx.fill();
const buildings=[[0,155,190,300,'#8c6850'],[180,90,210,355,'#bdad77'],[393,120,168,325,'#a86543'],[565,55,220,390,'#a9a56b'],[792,130,210,320,'#809279'],[1010,80,270,370,'#c8a075']];
for(let [x,y,w,h,col] of buildings){sx.fillStyle=col;sx.fillRect(x,y,w,h);sx.fillStyle='#4b4c35';sx.fillRect(x-5,y-8,w+10,12);sx.fillStyle='#d0bc85';sx.fillRect(x,y+15,w,8);sx.fillRect(x,y+h-60,w,7);for(let row=0;row<2;row++)for(let j=0;j<3;j++){let xx=x+20+j*(w-30)/3,yy=y+43+row*100;sx.fillStyle='#34463b';sx.fillRect(xx,yy,30,58);sx.beginPath();sx.arc(xx+15,yy,15,Math.PI,0);sx.fill();sx.fillStyle='#a7a16f';sx.fillRect(xx+13,yy,3,58);sx.fillStyle='#d8c68b';sx.fillRect(xx-3,yy+58,36,5)}sx.fillStyle='#31473a';sx.fillRect(x+w/2-22,y+h-80,44,80)}
sx.fillStyle='#253e32';sx.fillRect(0,412,W,60);sx.fillStyle='#64704b';sx.fillRect(0,451,W,14);sx.fillStyle='#a87a4a';sx.fillRect(0,465,W,195);sx.strokeStyle='#5d573a';sx.lineWidth=2;for(let i=-10;i<20;i++){sx.beginPath();sx.moveTo(640+i*55,465);sx.lineTo(640+i*150,660);sx.stroke()}for(let y=480;y<660;y+=30){sx.beginPath();sx.moveTo(0,y);sx.lineTo(W,y);sx.stroke()}sx.strokeStyle='#e8c987';sx.lineWidth=4;sx.beginPath();sx.ellipse(640,535,520,70,0,0,Math.PI*2);sx.stroke();sx.lineWidth=1;sx.beginPath();sx.ellipse(640,535,490,58,0,0,Math.PI*2);sx.stroke();
sx.strokeStyle='#2a3e32';sx.lineWidth=4;sx.beginPath();sx.moveTo(0,70);sx.quadraticCurveTo(640,220,1280,60);sx.stroke();for(let i=0;i<28;i++){let x=i*49,y=70+100*Math.sin(x/W*Math.PI);sx.fillStyle=['#d2b75c','#963f2b','#d3c795','#466851'][i%4];sx.beginPath();sx.moveTo(x,y);sx.lineTo(x+30,y+3);sx.lineTo(x+15,y+31);sx.closePath();sx.fill()}let vign=sx.createRadialGradient(640,320,200,640,320,750);vign.addColorStop(0,'#0000');vign.addColorStop(1,'#10251c99');sx.fillStyle=vign;sx.fillRect(0,0,W,H)}
function sprite(c,id,pose,x,y,scale=1,dir=1,alpha=1){if(id===14){drawLeanMestre(c,'base',pose,x,y,dir,alpha);return}let im=id===14?bossImage:atlases[Math.floor(id/5)];if(!im.complete||!im.naturalWidth)return;
 let key=id===14?'mestre-mare-clean.webp':'fighters-'+(Math.floor(id/5)+1)+'.webp',index=id===14?pose:(id%5)*8+pose,r=spriteBounds[key][index],factor=(id===14?410/im.height:1024/im.height)*scale*legacyModelScale(id,'base');
 c.save();c.globalAlpha=alpha;c.translate(x,y);c.scale(dir,1);c.drawImage(im,...r,-r[2]*factor/2,-r[3]*factor,r[2]*factor,r[3]*factor);c.restore();}

const reactionImages=[1,2,3].map(n=>{let i=new Image();i.src=`reactions-${n}.webp`+(n===3?"?v=3.4.2":"");return i});
const transitionImages=[1,2,3].map(n=>{let i=new Image();i.src=`transitions-${n}.webp`+(n===3?"?v=3.4.2":"");return i});
const normalSequenceImages=['normal-sequences-v22.webp?v=3.5','normal-sequences-v23-2.webp','normal-sequences-v23-3.webp'].map(src=>{const im=new Image();im.src=src;return im});
const specialImages=Array.from({length:6},(_,n)=>{let i=new Image();i.src='special-'+(Math.floor(n/2)+1)+'-'+(n%2)+'.webp';return i});
const leanMestreImages=Object.fromEntries(['base','extra','ginga','cycles'].map(k=>{let i=new Image();i.src='mestre-lean-'+k+'.webp';return [k,i]}));
const bencaoImages=[1,2,3,4,5].map(n=>{let i=new Image();i.src='bencao-'+n+'.webp'+(n===4?'?v=3.5':n===1||n===5?'?v=3.4.2':'');return i});
const turnImages=[1,2,3].map(n=>{let i=new Image();i.src='turn-cycle-'+n+'.webp'+(n===3?'?v=3.5':'');return i});
const highHitImage=new Image();highHitImage.src='high-hit.webp?v=3.4.2';
const bossExtra=new Image();bossExtra.src='mestre-extra.webp';
const reactionRects=[[[9, 7, 233, 283], [299, 40, 180, 250], [515, 178, 320, 115], [876, 66, 213, 223]], [[10, 299, 246, 273], [299, 322, 192, 248], [491, 460, 346, 115], [878, 346, 223, 226]], [[10, 579, 240, 263], [298, 606, 162, 235], [516, 730, 320, 115], [874, 624, 224, 219]], [[11, 850, 241, 282], [300, 878, 172, 247], [509, 1010, 328, 118], [874, 896, 227, 229]], [[9, 1132, 246, 266], [299, 1147, 175, 251], [514, 1279, 323, 121], [874, 1172, 227, 228]], [[11, 18, 253, 262], [334, 57, 157, 223], [515, 163, 328, 118], [880, 87, 220, 194]], [[29, 289, 237, 275], [323, 321, 157, 243], [517, 448, 326, 118], [880, 349, 220, 217]], [[9, 572, 256, 278], [325, 609, 179, 241], [504, 725, 340, 126], [878, 644, 223, 207]], [[28, 859, 240, 270], [319, 900, 159, 229], [511, 1010, 333, 119], [877, 918, 224, 212]], [[14, 1139, 255, 258], [327, 1171, 177, 226], [504, 1272, 340, 124], [876, 1196, 225, 201]], [[59, 5, 212, 240], [431, 30, 136, 216], [689, 146, 317, 103], [1103, 66, 197, 182]], [[45, 249, 234, 235], [422, 286, 147, 197], [707, 249, 303, 236], [1094, 310, 209, 175]], [[57, 485, 224, 232], [417, 518, 144, 198], [704, 485, 307, 236], [1093, 536, 210, 184]], [[42, 722, 242, 226], [417, 752, 144, 196], [704, 721, 303, 230], [1093, 774, 209, 176]], [[59, 952, 217, 193], [429, 971, 132, 174], [680, 1050, 322, 95], [1096, 990, 200, 155]]];
function extraSprite(p,frame,x,y,isTransition=false,scale=1.4){if(p.id===14){drawLeanMestre(ctx,'extra',isTransition?4+frame:frame,x,y,p.dir);return}let im=p.id===14?bossExtra:(isTransition?transitionImages:reactionImages)[Math.floor(p.id/5)];if(!im.complete||!im.naturalWidth){sprite(ctx,p.id,p.down?4:1,x,y,scale,p.dir);return}if(!isTransition&&p.id!==14){let r=reactionRects[p.id][frame],factor=legacyModelScale(p.id,'reaction')*205*scale/reactionRects[p.id][0][3];ctx.save();ctx.translate(x,y);ctx.scale(p.dir,1);ctx.drawImage(im,...r,-r[2]*factor/2,-r[3]*factor,r[2]*factor,r[3]*factor);ctx.restore();return}let key=p.id===14?'mestre-extra.webp':'transitions-'+(Math.floor(p.id/5)+1)+'.webp';let index=p.id===14?(isTransition?4+frame:frame):(p.id%5)*8+frame;
 let r=spriteBounds[key][index],factor=legacyModelScale(p.id,'transition')*205*scale/(im.height/(p.id===14?3:5));ctx.save();ctx.translate(x,y);ctx.scale(p.dir,1);ctx.drawImage(im,...r,-r[2]*factor/2,-r[3]*factor,r[2]*factor,r[3]*factor);ctx.restore()}

function drawLeanMestre(c,kind,frame,x,y,dir=1,opacity=1){
 const data=leanMestreData[kind],im=leanMestreImages[kind];if(!im.complete||!im.naturalWidth)return;
 const r=data.rects[frame];let reference=kind==='base'?data.rects[2][3]:kind==='extra'?data.rects[6][3]:kind==='ginga'?Math.max(...data.rects.map(r=>r[3])):data.rects[0][3];
 let factor=305/reference;


 c.save();c.globalAlpha*=opacity;c.translate(x,y);c.scale(dir,1);c.drawImage(im,...r,(r[0]-data.anchors[frame])*factor,-r[3]*factor,r[2]*factor,r[3]*factor);c.restore();
}
function drawMotion(p,f,x=p.x,y=590-p.y,opacity=1){if(p.id===14){drawLeanMestre(ctx,'cycles',16+f,x,y,p.dir,opacity);return}let im=motionImages[Math.floor(p.id/5)];if(!im.complete||!im.naturalWidth)return;let r=motionRects[p.id][f],reference=motionRects[p.id][4][3],factor=legacyModelScale(p.id,'motion')*305/reference;// Tucked legs shorten the silhouette; do not raise the entire body again.
let lift=0;ctx.save();ctx.globalAlpha*=opacity;ctx.translate(x,y-lift);ctx.scale(p.dir,1);ctx.drawImage(im,...r,-r[2]*factor/2,-r[3]*factor,r[2]*factor,r[3]*factor);ctx.restore()}
function drawExclusiveSpecial(p,base,m,wind,recover){
 const data=specialData[p.id][base.exclusiveSlot],im=specialImages[data.sheet];if(!im.complete||!im.naturalWidth)return;
 let frame=wind?Math.min(base.phases[0].contactPose-1,Math.floor(p.at/base.start*base.phases[0].contactPose)):recover?6+Math.min(1,Math.floor((p.at-base.start-base.active)/base.end*2)):m.contactPose;
 if(!wind&&!recover&&m.phaseFrame>7&&m.phase<base.phases.length-1)frame=4;
 const r=data.rects[frame],factor=legacyModelScale(p.id,'special'+base.exclusiveSlot)*305/Math.max(data.rects[0][3],data.rects[7][3]);ctx.save();ctx.translate(p.x,590-p.y);ctx.scale(p.dir,1);ctx.drawImage(im,...r,(r[0]-data.anchors[frame])*factor,-r[3]*factor,r[2]*factor,r[3]*factor);ctx.restore();
}
function drawBencao(p,frame,x=p.x,y=590-p.y){
 if(p.id===14){drawLeanMestre(ctx,'cycles',frame,x,y,p.dir);return}
 const data=bencaoData[p.id],im=bencaoImages[data.sheet];if(!im.complete||!im.naturalWidth)return;
 frame=clamp(frame,0,7);const r=data.rects[frame],factor=legacyModelScale(p.id,'bencao')*305/Math.max(...data.rects.map(r=>r[3]));
 ctx.save();ctx.translate(x,y);ctx.scale(p.dir,1);ctx.drawImage(im,...r,(r[0]-data.anchors[frame])*factor,-r[3]*factor,r[2]*factor,r[3]*factor);ctx.restore();
}
function drawTurnCycle(p,frame,x=p.x,y=590-p.y){if(p.id===14){drawLeanMestre(ctx,'cycles',8+frame,x,y,p.dir);return}let im=turnImages[Math.floor(p.id/5)];if(!im.complete||!im.naturalWidth)return;
 frame=clamp(frame,0,7);let r=turnRects[p.id][frame],factor=legacyModelScale(p.id,'turn')*305/turnRects[p.id][0][3];ctx.save();ctx.translate(x,y);ctx.scale(p.dir,1);ctx.drawImage(im,...r,(r[0]-turnAnchors[p.id][frame])*factor,-r[3]*factor,r[2]*factor,r[3]*factor);ctx.restore();}
function drawHighHit(p){if(p.id===14){drawLeanMestre(ctx,'extra',0,p.x,590-p.y,p.dir);return}let age=tick-p.hitAt;
 if(age>17&&p.down<=0&&p.hp>0){extraSprite(p,0,p.x,590-p.y,true,1.48);return}
 if(!highHitImage.complete||!highHitImage.naturalWidth){extraSprite(p,0,p.x,590-p.y);return}
 let r=highHitRects[p.id],factor=legacyModelScale(p.id,'highHit')*300/r[3];ctx.save();ctx.translate(p.x,590-p.y);ctx.scale(p.dir,1);ctx.drawImage(highHitImage,...r,-r[2]*factor/2,-r[3]*factor,r[2]*factor,r[3]*factor);ctx.restore();
}
// Use a document-qualified fragment because the school page has an external base URL.
const fighterInkFilter = 'url("' + location.href.split('#')[0] + '#roda-fighter-ink")';
function drawFighter(p){
 ctx.fillStyle='#10190f66';ctx.beginPath();ctx.ellipse(p.x,592,Math.max(18,82*(1-p.y/420))*fighterTraits[p.id].build,Math.max(5,14-p.y*.025),0,0,Math.PI*2);ctx.fill();
 const t=fighterTraits[p.id],h=visualHeight(p.id);ctx.save();ctx.translate(p.x,590-p.y);ctx.scale(h*t.build,h);ctx.translate(-p.x,-(590-p.y));
 if(p.id!==COXA_ID&&p.id!==CELINA_ID&&!p.android){
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality='high';
  ctx.filter=fighterInkFilter;
 }
 const moving=p.travelDirection && p.attack===null && p.hp>0 && p.down<=0 && p.stun<=0 && !p.crouch && !inJump(p) && !p.landing;
 const roll=p.rollTime>0?p:moving?{...p,rollTime:24-(p.travelDistance/5)%24,rollDirection:p.travelDirection}:null;
 if(p.id===COXA_ID)drawCoxa(p);
 else if(p.id===CELINA_ID)drawCelina(p);
 else if(p.id===HEATHER_ID)drawHeather(roll||p);
 else if(p.id===AISHA_ID)drawAisha(roll||p);
 else if(roll)drawGroundRoll(roll);
 else drawFighterBody(p,t);
 ctx.restore();
 if(p.combo>=2&&p.comboTimer>0){text(p.combo+' HIT',p.x,205,34,'#ffdb6e','center');text('COMBINATION',p.x,225,12,'#eee6c8','center')}
}
function drawFighterBody(p,t){let ground=590-p.y;if(combatData[p.id]){drawCompleteFighter(p);return;}
 if(identityRowScale[p.id]){drawRedesignedFighter(p);return}
 if(p.hp<=0){drawDefeat(p);return}
 if(p.down<=0&&p.stun<=0&&p.attack===null&&p.y===0&&!p.crouch&&p.takeoff<=0&&p.landing<=0){drawGinga(p);return}
 if(redesignData[p.id]){drawRedesignedFighter(p);return}
 if(p.hp<=0||p.down>0){let age=tick-p.hitAt;if(p.reaction===4&&age<10){drawHighHit(p);return}extraSprite(p,p.hp<=0?(age<8?0:2):age<8?0:p.down<14?3:2,p.x,ground);return}
 if(p.stun>0&&!p.guardStun){if(p.reaction===4)drawHighHit(p);else extraSprite(p,p.reaction,p.x,ground);return}
 if(p.attack!==null){drawAttack(p,t);return}
 if(p.takeoff>0||p.landing>0){drawMotion(p,0);return}
 if(p.y>0){drawMotion(p,p.vy>4?2:p.vy>-5?1:2);return}
 if(Math.abs(p.vx)>.25&&!p.crouch){drawGinga(p);return}
 if(p.block){if(p.crouch)sprite(ctx,p.id,4,p.x,ground,1.48,p.dir);else drawGinga(p);text(p.crouch?'LOW GUARD':'GUARD',p.x,ground-(p.crouch?145:330),12,'#bdfaff','center');if(p.guardStun){ctx.strokeStyle='#bdfaff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x+p.dir*45,ground-(p.crouch?100:195),50,-1.3,1.3);ctx.stroke()}return}
 if(p.crouch){sprite(ctx,p.id,4,p.x,ground,1.48,p.dir);return}
 drawGinga(p);
}

function sequenceFrame(p,base,contact=4){
 if(p.at<base.start)return Math.min(contact-1,Math.floor(p.at/base.start*contact));
 if(p.at>=base.start+base.active)return 6+Math.min(1,Math.floor((p.at-base.start-base.active)/base.end*2));
 return p.at-base.start<Math.min(7,base.active*.6)?contact:Math.min(5,contact+1);
}
function drawTechniqueSequence(p,base,m){
 if(p.y>0)return false;
 // Choose an authored sequence only when its actual technique matches this normal.
 const slot=exclusiveSpecials[p.id].findIndex(d=>d[1].length===1&&d[1][0]===m.key);
 if(slot<0)return false;
 const contact=exclusiveSpecials[p.id][slot][2][0];
 drawSpecialFrame(p,slot,sequenceFrame(p,base,contact));return true;
}
function drawSpecialFrame(p,slot,frame){
 const data=specialData[p.id][slot],im=specialImages[data.sheet];if(!im.complete||!im.naturalWidth)return;
 const r=data.rects[frame],factor=legacyModelScale(p.id,'special'+slot)*305/Math.max(data.rects[0][3],data.rects[7][3]);
 ctx.save();ctx.translate(p.x,590-p.y);ctx.scale(p.dir,1);ctx.drawImage(im,...r,(r[0]-data.anchors[frame])*factor,-r[3]*factor,r[2]*factor,r[3]*factor);ctx.restore();
}

function drawAttack(p,t){
 if(redesignData[p.id]){drawRedesignedAttack(p);return}
 let base=moveFor(p,p.attack),m=attackPhase(base,p.at),wind=p.at<base.start,recover=p.at>=base.start+base.active;
 if(base.exclusiveSlot!==undefined&&!base.crouching){drawExclusiveSpecial(p,base,m,wind,recover);return}
 if(base.crouching){
 const lowSlot=exclusiveSpecials[p.id].findIndex(d=>d[1].length===1&&d[1][0]==='rasteira');
 if(lowSlot>=0){drawSpecialFrame(p,lowSlot,sequenceFrame(p,base,exclusiveSpecials[p.id][lowSlot][2][0]));return}
 if(wind){extraSprite(p,p.at<base.start*.5?4:5,p.x,590,true,1.48);return}
 if(recover){if(p.at<base.start+base.active+base.end*.5)extraSprite(p,5,p.x,590,true,1.48);else sprite(ctx,p.id,4,p.x,590,1.48,p.dir);return}
 sprite(ctx,p.id,5,p.x,590,1.48,p.dir);return
 }
 // Dedicated new normal art, using the same renderer in matches and review.
 if(!isProtagonist(p.id)&&p.y===0&&p.attack===(p.id===4?0:2)){
  const data=normalSequencesV23[p.id],im=normalSequenceImages[Math.floor(p.id/5)];
  if(im.complete&&im.naturalWidth){const frame=sequenceFrame(p,base,4),r=data.rects[frame],factor=legacyModelScale(p.id,'normal')*305/data.rects[0][3];
   ctx.save();ctx.translate(p.x,590);ctx.scale(p.dir,1);ctx.drawImage(im,...r,(r[0]-data.anchors[frame])*factor,-r[3]*factor,r[2]*factor,r[3]*factor);ctx.restore();return}
 }
 if(!isProtagonist(p.id)&&drawTechniqueSequence(p,base,m))return;
 let phaseProgress=clamp(m.phaseFrame/m.frames,0,1),extension=Math.sin(Math.PI*clamp(phaseProgress/.65,0,1)),x=p.x,y=590-p.y;
 if(m.visual==='push'&&p.y===0){let pose=wind?Math.min(3,Math.floor(p.at/base.start*4)):recover?6+Math.min(1,Math.floor((p.at-base.start-base.active)/base.end*2)):phaseProgress<.64?4:5;drawBencao(p,pose,x,y);return}
 if(m.visual==='turn'){let pose=wind?Math.min(3,Math.floor(p.at/base.start*4)):recover?6+Math.min(1,Math.floor((p.at-base.start-base.active)/base.end*2)):phaseProgress<.55?4:5;drawTurnCycle(p,pose,x,y);return}
 const low=['sweep','back','wheel'].includes(m.visual);
 if(wind){
  const phase=Math.min(2,Math.floor(p.at/base.start*3));
  if(phase===0){drawGinga(p);return}
  extraSprite(p,low?(phase===1?4:5):(phase===1?2:3),x,y,true,1.48);return;
 }
 if(recover){
  const age=(p.at-base.start-base.active)/base.end;
  if(age>.65){drawGinga(p);return}
  extraSprite(p,low?(age<.3?6:5):(age<.3?3:2),x,y,true,1.48);return;
 }
 ctx.save();
 if(p.y>0){drawMotion(p,m.visual==='side'?3:m.visual==='hook'?4:5,x,y)}
 else if(m.visual==='sweep'){sprite(ctx,p.id,phaseProgress<.7?5:4,x,y,1.48,p.dir)}
 else if(m.visual==='crescent'){sprite(ctx,p.id,phaseProgress<.25?2:phaseProgress<.75?3:2,x,y,1.48,p.dir)}
 else if(m.visual==='back'){if(phaseProgress<.2)extraSprite(p,6,x,y,true,1.48);else if(phaseProgress<.75)sprite(ctx,p.id,7,x,y,1.48,p.dir);else extraSprite(p,5,x,y,true,1.48)}
 else if(m.visual==='side'){if(phaseProgress<.2)sprite(ctx,p.id,2,x,y,1.48,p.dir);else if(phaseProgress<.72)drawMotion(p,3,x,y);else extraSprite(p,3,x,y,true,1.48)}
 else if(m.visual==='hook'){if(phaseProgress<.72)drawMotion(p,4,x,y);else sprite(ctx,p.id,2,x,y,1.48,p.dir)}
 else if(m.visual==='wheel'){extraSprite(p,phaseProgress<.2?5:phaseProgress<.7?6:7,x,y,true,1.48)}
 else drawBencao(p,sequenceFrame(p,base),x,y);

 ctx.strokeStyle=t.accent+'88';ctx.lineWidth=m.rank===1?2:4;ctx.beginPath();
 if(m.visual==='sweep')ctx.ellipse(x+p.dir*55,540,100,12,0,0,Math.PI);
 else if(m.visual==='side'||m.visual==='push'){ctx.moveTo(x,y-160);ctx.lineTo(x+p.dir*100,y-165)}
 else ctx.arc(x,y-180,m.visual==='wheel'?115:85,p.dir>0?-.8:2,p.dir>0?.7:3.7);
 ctx.stroke();ctx.restore();
}

function hud(){if(mode==='solo'||mode==='aisha'||mode==='coxa'){text('SCORE '+arcadeScore.total.toLocaleString(),640,26,20,'#ffdb6e','center');if(scoreToast&&tick<scoreToast.until)text(scoreToast.text,640,174,20,'#ffdb6e','center');}players.forEach((p,i)=>{let x=i?770:65;let right=i===1;text(p.android?androidLabel():roster[p.id][0].toUpperCase(),right?1215:65,46,30,'#fff0cc',right?'right':'left');text(i===0?(arcadeAutoplay?'CPU · WATCH ARCADE':'YOU'):p.android?`HIT STRENGTH ${100+p.strengthBonus}%`:mode==='training'?'TRAINING DUMMY':`CPU · ${difficulty.toUpperCase()}`,right?1215:65,65,12,'#d3d6b5',right?'right':'left');rect(x,78,445,27,'#141f18');rect(x+3,81,439,21,'#6c392c');let w=439*p.hp/p.maxHp;rect(right?x+442-w:x+3,81,w,21,p.hp>30?'#e7c45d':'#e15d3b');for(let j=0;j<winsNeeded();j++){ctx.fillStyle=j<wins[i]?'#f6d76e':'#72715a';ctx.beginPath();ctx.arc(right?1204-j*21:76+j*21,121,5,0,7);ctx.fill()}if(p.id!==AISHA_ID&&!isProtagonist(p.id)){rect(x,601,445,12,'#15231c');rect(right?x+445-p.meter*4.45:x,601,p.meter*4.45,12,i?'#72bbc0':'#f1c457');text('AXÉ '+Math.floor(p.meter)+' / 100',right?1215:65,637,13,'#e5d8b0',right?'right':'left');}text(p.moveText,right?1215:65,581,16,'#fff1ca',right?'right':'left')});text(String(Math.ceil(timer)),640,100,70,'#fff0c7','center');text(mode==='coxa'?'STAGE '+coxaRun.stage+'/20 · ROUND '+round:mode==='aisha'?roundLabel():roundLimit===1?formatLabel():`ROUND ${round} · BEST OF 5`,640,124,12,'#e4dcb5','center');text(stageNames[activeStage]+' · BRASIL',640,650,13,'#fff5dd','center');if(mode==='training'){rect(28,156,260,217,'#15251ce8');text('MOVEMENT LAB',43,181,20,'#f3cf68');characterMoves[players[0].id].forEach((m,i)=>text(m.button+'  '+(m.signature||m.name),43,208+i*(players[0].id===14?20:25),15,'#efe9d1'));text(players[0].id===COXA_ID?'DOWN + B ONLY: TWO-LEG LOW KICK':players[0].id===AISHA_ID?'HOLD DOWN: SIX CROUCHING RELAYS':'DOWN + A/B/X/Y: LOW KICKS',43,380,12,'#ffe08a');text('VIEW: DUMMY '+['STAND','GUARD','LOW GUARD'][trainingDummy],43,395,14,'#ffe08a');text(players[0].id===14?'HOLD VIEW + LT: RESET · RT: ARENA':'LT: RESET · RT: NEXT ARENA',43,415,14,'#ffe08a');text(fighterPlans[players[0].id].toUpperCase(),640,160,16,'#ffe08a','center');if(players[0].attack!==null)text(moveFor(players[0],players[0].attack).name,640,188,17,'#fff1cc','center');inputs.forEach((h,i)=>text(h.text,1240,180+i*25,15,i===0?'#ffdc76':'#f1ead3','right'))}}
// Light only the painted arena, keeping the fighters and health bars readable.
function lightSentinelStudio(){
 const hue=((androidWave-1)*137+28)%360;
 const left=androidWave%2===1;
 const x=left?W*.15:W*.85;
 ctx.save();
 ctx.globalCompositeOperation='soft-light';
 ctx.fillStyle='hsl('+hue+' 84% 52%)';ctx.globalAlpha=.48;ctx.fillRect(0,0,W,H);
 ctx.globalCompositeOperation='screen';ctx.globalAlpha=.7;
 const beam=ctx.createRadialGradient(x,H*.08,12,x,H*.18,W*.76);
 beam.addColorStop(0,'hsla('+hue+',100%,72%,.85)');
 beam.addColorStop(.45,'hsla('+hue+',90%,56%,.35)');
 beam.addColorStop(1,'transparent');
 ctx.fillStyle=beam;ctx.fillRect(0,0,W,H);ctx.restore();
}
function render(dt){if(scene==='foundation'){drawFoundation();return;}watchExit.hidden=!['fight','pause','result','story'].includes(scene)||!arcadeAutoplay;ctx.save();if(shake>0&&scene==='fight'){ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake=Math.max(0,shake-dt)}drawArena();if(mode==='aisha'&&players[1]?.android)lightSentinelStudio();drawRoda();if(players.length&&['fight','pause'].includes(scene)){players.forEach(drawFighter);particles=particles.filter(p=>p.life>0);for(let p of particles){if(scene==='fight'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}ctx.globalAlpha=clamp(p.life/25,0,1);rect(p.x,p.y,5,5,p.color);ctx.globalAlpha=1}hud();if(announceTime>0){drawAnnouncement()}}ctx.restore()}
let uiTick=0;let accumulator=0;function frame(now){if(typeof animationReview==='function'){animationReview(now);requestAnimationFrame(frame);return}let elapsed=Math.min(100,Math.max(0,now-last||16.6667));last=now;accumulator+=elapsed;while(accumulator>=16.6667){uiTick++;let states=pollPads();if(scene!=='pause'&&freeze<=0)tick++;update(1,states);accumulator-=16.6667}render(1);requestAnimationFrame(frame)}
window.addEventListener('blur',()=>{if((scene==='fight'||scene==='result'||scene==='story'))togglePause('Game paused while the window is inactive.')});document.addEventListener('visibilitychange',()=>{if(document.hidden&&(scene==='fight'||scene==='result'||scene==='story'))togglePause('Game paused while the page is hidden.')});
const motionImages=[1,2,3].map(n=>{let im=new Image();im.src='motion-'+n+'.webp'+(n===3?'?v=3.4.2':'');return im});
const gingaImages=[1,2,3,4].map(n=>{let im=new Image();im.src='ginga-'+n+'.webp';return im});
async function loadFighterImage(image) {
 if (image.complete && image.naturalWidth) return;
 try { await image.decode(); }
 catch {
  // A transient transfer error should not disable character selection.
  const source=image.src;
  image.src=source;
  try { await image.decode(); }
  catch { throw new Error(source.split('/').pop()); }
 }
}
installRecordUI();
const coxaArtworkReady=Promise.race([Promise.all([coxaCombat,coxaMask,coxaCard,coxaFace].map(loadFighterImage)).then(()=>{prepareCoxaColors();return true;}),new Promise((_,reject)=>setTimeout(()=>reject(Error('Coxa artwork timeout')),15000))]).catch(error=>{console.error('Coxa artwork unavailable; preserving original roster',error);return false;});
Promise.all([celinaImage,celinaMovement,celinaCard,heatherArt,heatherWhiteArt,groundRollArt,aishaArt,aishaMirrorArt,meilinRetreatArt,retreatArt,...Object.values(gingaImagesV26),...Object.values(defeatImages),...Object.values(redesignImages),...privateArenaImages,...normalSequenceImages,...specialImages,...Object.values(leanMestreImages),...bencaoImages,...turnImages,highHitImage,...motionImages,...atlases,bossImage,...reactionImages,...transitionImages,bossExtra,...arenaImages,musicianImage].map(loadFighterImage)).then(async()=>{if(!(await coxaArtworkReady)){delete roster[COXA_ID];const i=playableIds.indexOf(COXA_ID);if(i>=0)playableIds.splice(i,1);const m=playModes.indexOf('coxa');if(m>=0)playModes.splice(m,1);document.querySelector('[data-mode="coxa"]')?.remove();if(mode==='coxa')setMode('solo');}Object.freeze(playableIds);loaded=true;roster.forEach((f,i)=>{let b=document.createElement('button');b.className='fightercard';b.setAttribute('aria-label',f[0]);let c=document.createElement('canvas');c.width=300;c.height=200;b.append(c);facePortrait(c,i);let span=document.createElement('span');span.textContent=f[0].toUpperCase();b.append(span);b.onclick=()=>{pick=i;updatePick()};$('#roster').append(b)});rosterBuilt=true;updatePick()}).catch(error=>{console.error('RODA artwork or selection:',error);$('#padhelp').textContent='Could not prepare the roster: '+error.message;});
buildStage();requestAnimationFrame(frame);

function drawArena(){if(activeStage>=18){drawPrivateArena();return}let image=arenaImages[Math.floor(activeStage/6)],cell=activeStage%6;let camera=players.length&&scene==='fight'?clamp(((players[0].x+players[1].x)/2-640)*.025,-12,12):Math.sin(tick*.002)*4;if(image.complete&&image.naturalWidth){let aw=image.width/2,ah=image.height/3;ctx.drawImage(image,(cell%2)*aw,Math.floor(cell/2)*ah,aw,ah,-16-camera,-8,W+32,H+16)}else ctx.drawImage(stage,0,0);
ctx.save();ctx.globalAlpha=.12;for(let i=0;i<5;i++){let x=((tick*.38+i*310)%1620)-160,y=45+(i%3)*45;ctx.fillStyle='#fff0d0';ctx.beginPath();ctx.ellipse(x,y,90,18,0,0,Math.PI*2);ctx.ellipse(x+70,y+10,80,15,0,0,Math.PI*2);ctx.fill()}ctx.restore();
if([2,3,5,6,7,11,12,14,17].includes(activeStage)){ctx.save();ctx.strokeStyle='#fff1b377';ctx.lineWidth=2;for(let i=0;i<23;i++){let x=350+(i*117%720),y=348+(i*13%72),w=9+(i*17%38);ctx.globalAlpha=.25+.2*Math.sin(tick*.035+i);ctx.beginPath();ctx.moveTo(x+Math.sin(tick*.023+i)*7,y);ctx.lineTo(x+w+Math.sin(tick*.023+i)*7,y);ctx.stroke()}ctx.restore()}
// Foreground foliage has its own wind motion, visible below the top edge.
for(let side=0;side<2;side++){
 ctx.save();ctx.translate(side?W:0,165);ctx.scale(side?-1:1,1);
 const wind=Math.sin(tick*.024+side)*.09+Math.sin(tick*.009)*.035;
 ctx.rotate(wind);ctx.strokeStyle='#283b1c';ctx.lineWidth=6;
 ctx.beginPath();ctx.moveTo(-15,-90);ctx.quadraticCurveTo(70,-45,185,18);ctx.stroke();
 for(let i=0;i<16;i++){
  ctx.save();ctx.translate(8+i*11,-65+i*5);ctx.rotate(Math.sin(tick*.045+i*.7+side)*.22);
  ctx.fillStyle=i%3===0?'#708243':i%2?'#466534':'#304d29';
  ctx.beginPath();ctx.ellipse(0,i%2?12:-12,23,8,i%2?.65:-.65,0,Math.PI*2);ctx.fill();ctx.restore();
 }ctx.restore();
}
if([4,6,8,12,13,14].includes(activeStage)){for(let i=0;i<12;i++){let x=60+i*107+Math.sin(tick*.012+i)*18,y=230+(i*47%200)+Math.sin(tick*.019+i)*12;ctx.fillStyle=`rgba(255,219,110,${.15+.3*(Math.sin(tick*.025+i)+1)/2})`;ctx.beginPath();ctx.arc(x,y,2,0,7);ctx.fill()}}
let shade=ctx.createLinearGradient(0,0,0,H);shade.addColorStop(0,'#071611b0');shade.addColorStop(.28,'#07161100');shade.addColorStop(.8,'#07161100');shade.addColorStop(1,'#071611ba');ctx.fillStyle=shade;ctx.fillRect(0,0,W,H)}
function drawRoda(){
 ctx.save();ctx.strokeStyle='#f6e7b666';ctx.lineWidth=2;
 ctx.beginPath();ctx.ellipse(640,590,535,44,0,0,Math.PI*2);ctx.stroke();ctx.restore();
}
function sfx(kind,rank=1){if(!sound)return;if(kind==='hit'){playSample('strike',rank===3?.85:.7,1+(rank-2)*.035);return}initAudio();if(!audioCtx||audioCtx.state==='suspended')return;let now=audioCtx.currentTime;let length=kind==='swing'?.12:kind==='block'?.08:kind==='start'?.28:.16+rank*.025;let buf=audioCtx.createBuffer(1,Math.ceil(audioCtx.sampleRate*length),audioCtx.sampleRate),data=buf.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,kind==='swing'?1.2:3);let source=audioCtx.createBufferSource(),filter=audioCtx.createBiquadFilter(),gain=audioCtx.createGain();source.buffer=buf;filter.type=kind==='swing'?'bandpass':'lowpass';filter.frequency.setValueAtTime(kind==='swing'?1600:kind==='block'?3200:700,now);filter.frequency.exponentialRampToValueAtTime(kind==='swing'?450:160,now+length);gain.gain.setValueAtTime(kind==='swing'?.12:kind==='block'?.16:.22+rank*.035,now);source.connect(filter);filter.connect(gain);gain.connect(audioCtx.destination);source.start();if(kind==='hit')tone(95+rank*9,.15,.09,'sine');if(kind==='block')tone(510,.06,.04,'triangle');if(kind==='start'){tone(330,.2,.08,'triangle');setTimeout(()=>tone(495,.2,.08,'triangle'),130)}}
function rumble(index,strength,duration){let pad=lastPads[index];try{pad?.vibrationActuator?.playEffect('dual-rumble',{duration,strongMagnitude:strength,weakMagnitude:strength*.65}).catch(()=>{})}catch(e){}}
const soundtrackIds=['2VoCoHryE7g','sQSICgGzuVs','2R1-OPTX-Wk','OmkNq-_ZQts','hKwV4HWMk-c','9YR9mEPgwH0','Wqeka4KSOMQ','rXGKBaal_ZI','XHYNCG1mDSQ','lwyGR9Lh7zU'];
let soundtrackStarted=false,musicFrame=null,musicEnabled=true,ytPlayer=null;
function attachMusicApi(){if(!musicFrame||ytPlayer||!window.YT?.Player)return;ytPlayer=new window.YT.Player(musicFrame,{events:{onReady:e=>{e.target.setVolume(35);if(musicEnabled)e.target.playVideo()},onStateChange:e=>{if(e.data===1)$('#musicstatus').textContent='RODA soundtrack playing · tracks 1–10 only';},onAutoplayBlocked:()=>{$('#musicstatus').textContent='Browser paused autoplay. Click Play in the music player below to start the soundtrack.'}}})}
window.onYouTubeIframeAPIReady=attachMusicApi;
function musicCommand(func,args=[]){if(musicFrame?.contentWindow)musicFrame.contentWindow.postMessage(JSON.stringify({event:'command',func,args}),'https://www.youtube.com')}
function startMusic(){if(!musicEnabled)return;if(soundtrackStarted){musicCommand('playVideo');return}let f=document.createElement('iframe');f.title='RODA soundtrack — tracks 1–10 only';f.src='https://www.youtube.com/embed/'+soundtrackIds[0]+'?playlist='+soundtrackIds.join(',')+'&loop=1&rel=0&autoplay=1&enablejsapi=1&playsinline=1&origin='+encodeURIComponent(location.origin);f.allow='autoplay; encrypted-media; picture-in-picture';f.allowFullscreen=true;musicFrame=f;f.id='roda-music-video';f.onload=()=>{musicCommand('setVolume',[35]);if(typeof localMusic!=='undefined'&&localMusic)localMusic.volume=.32;musicCommand('playVideo')};$('#musicplayer').append(f);soundtrackStarted=true;if(window.YT?.Player)attachMusicApi();else{let api=document.createElement('script');api.src='https://www.youtube.com/iframe_api';document.head.append(api)}$('#musicstart').textContent='PLAY / RESUME MUSIC';$('#musicstatus').textContent='If music is silent, press Play in the player below. YouTube requires internet.';}
function enableGameAudio(){sound=true;$('#sound').textContent='SOUND ON';initAudio();setStageMusic(scene==='title'?-1:activeStage);$('#enableaudio').textContent='AUDIO ENABLED · PRESS START';}
$('#enableaudio').onclick=enableGameAudio;
$('#musicstart').onclick=()=>{musicEnabled=true;initAudio();startMusic()};
$('#musicmute').onclick=()=>{musicEnabled=!musicEnabled;musicCommand(musicEnabled?'playVideo':'pauseVideo');$('#musicmute').textContent=musicEnabled?'PAUSE MUSIC':'RESUME MUSIC'};
$('#titlesetup').onclick=openSetup;
$('#nextarena').onclick=()=>{stageChoice=(stageChoice+1)%stageNames.length;activeStage=stageChoice;updatePick()};
window.addEventListener('pointerdown',()=>{if(sound)initAudio()},{once:true});
show('title');
const portraitImages=["dandara", "jurema", "celina", "zinga", "lua", "iara", "nala", "meilin-v24", "jaci", "sol-v24", "ayana", "bento",  , "nestor", "mestre-mare", "aisha", "heather"].map(slug=>{if(slug==='celina')return celinaCard;let im=new Image();const base=slug.replace('-v24','');im.src=["jaci", "jurema", "lua", "nala", "mestre-mare", "sol", "meilin", "nestor", "zinga"].includes(base)?'portraits/'+base+'-card-v25.jpg':'portraits/'+slug+'.webp';return im});
portraitImages[COXA_ID]=coxaCard;
// A held rear-foot ginga base while idle; feet never move with the breath.
function drawGinga(p){
 if(p.id===9){drawRedesignFrame(p,1);return;}
 const d=gingaV26[p.id],im=gingaImagesV26[p.id];if(!d||!im?.complete||!im.naturalWidth)return;
 // Hold the reference guard when stationary. A stable canvas origin replaces per-frame foot centering.
 const count=d.rects.length,cycle=count*22,phase=((p.ginga%cycle)+cycle)%cycle;
 const frame=Math.abs(p.vx)>.25?Math.floor(phase/22):0;
 const r=d.rects[frame],f=(redesignData[p.id]?305*redesignData[p.id].rects[0][3]/redesignData[p.id].referenceHeight:285)/gingaStanceHeights[p.id];
 ctx.save();ctx.translate(p.x,590-p.y);ctx.scale(p.dir,1);ctx.drawImage(im,...r,-160*f,-300*f,320*f,320*f);ctx.restore();
}

function showResultCard(slot,id,whiteUniform=false){
 const card=$('#'+slot+'portrait');
 card.src=whiteUniform?heatherWhiteCard.src:portraitImages[id].src;
 card.alt=profiles[id].name+' fighter card';
}
function boutProfile(p){
 return p.android?{name:androidLabel(),home:'Sentinel Studio 2323',win:'Relay complete.',lose:'Unit offline.'}:profiles[p.id];
}
function showResults(){recordNamedBout();renderNamedRecords();scene='result';resultTime=300;show('result');let wi=matchWinner<0?0:matchWinner,li=1-wi,w=boutProfile(players[wi]),l=boutProfile(players[li]);$('#resulttitle').textContent=mode==='solo'&&wi===0&&arcadeIndex===arcadeOrder.length-1?'RODA CHAMPION':w.name.toUpperCase()+' WINS';$('#winnername').textContent=w.name;$('#winnerhome').textContent=w.home;$('#winnerquote').textContent='“'+w.win+'”';$('#losername').textContent=l.name;$('#loserhome').textContent=l.home;$('#loserquote').textContent='“'+l.lose+'”';showResultCard('winner',players[wi].id,players[wi].whiteUniform);showResultCard('loser',players[li].id,players[li].whiteUniform);
 if(mode==='aisha'){
  const card=$(wi===1?'#winnerportrait':'#loserportrait');
  card.src='androids/card-'+androidWave+'.webp';card.alt=androidLabel()+' fighter card';
 }
 if(mode==='solo'&&chosen[1]===CELINA_ID){const mentorIndex=arcadeOrder.slice(0,arcadeIndex).filter(id=>id===CELINA_ID).length;const slot=wi===1?'winner':'loser';$('#'+slot+'quote').textContent='“'+celinaAdvice(mentorIndex,wi===0)+'”';const portrait=$('#'+slot+'portrait');portrait.src=CELINA_ASSET_ROOT+'wisdom-'+(1+mentorIndex%6)+'.webp';portrait.alt='Celina offers advice';resultTime=arcadeAutoplay?540:Infinity; if(!arcadeAutoplay)$('#resulttitle').textContent+=' · A TO CONTINUE';}
 if(mode!=='solo'||arcadeAutoplay)$('#roda-bout-record').textContent='';
 if(mode==='coxa')recordCoxaBout();
 $('#resume').classList.remove('hidden');$('#restart').textContent=mode==='coxa'?'RESTART COXA MODE':mode==='solo'?'RESTART ARCADE RUN':mode==='aisha'?'RESTART AISHA MODE':'RESTART MATCH';stopResultSound();resultSound=playSample((mode==='solo'||mode==='aisha')&&wi===1?'defeat':'victory',.65);musicCommand('setVolume',[12]);if(localMusic)localMusic.volume=.15}
function restartWatchArcade(){
 mode='solo';arcadeAutoplay=true;menuMode=playModes.indexOf('watcharcade');
 makeArcade();wins=[0,0];round=1;setRounds();startRound();openStory();
}
function autoContinue(){
 if(mode==='coxa'){continueCoxaRun();return;}
 if(mode==='aisha'){continueAndroidRun();return;}
 let advanced=false;
 if(mode==='solo'){
  if(arcadeIndex<arcadeOrder.length-1){arcadeIndex++;chosen[1]=arcadeOrder[arcadeIndex];advanced=true;}
  else{if(arcadeAutoplay)openComicEnding();else openArcadeScore();return;}
 }
 wins=[0,0];round=1;setRounds();startRound();if(advanced||(mode==='solo'&&chosen[1]===AISHA_ID))openStory();
}

function vocal(id,kind='hit'){if(!sound)return;initAudio();if(!audioCtx||audioCtx.state==='suspended')return;let t=audioCtx.currentTime,len=kind==='defeat'?.45:kind==='win'?.28:.16,base=profiles[id].pitch;let osc=audioCtx.createOscillator(),amp=audioCtx.createGain();osc.type='sawtooth';osc.frequency.setValueAtTime(base*(kind==='win'?1.15:1),t);osc.frequency.exponentialRampToValueAtTime(base*(kind==='defeat'?.55:.8),t+len);amp.gain.setValueAtTime(.001,t);amp.gain.exponentialRampToValueAtTime(.075,t+.025);amp.gain.exponentialRampToValueAtTime(.001,t+len);for(let frequency of [kind==='hit'?650:500,1100,2400]){let f=audioCtx.createBiquadFilter();f.type='bandpass';f.frequency.value=frequency;f.Q.value=5;osc.connect(f);f.connect(amp)}amp.connect(audioCtx.destination);osc.start(t);osc.stop(t+len)}

let samplesLoading=false,sampleBuffers={},resultSound=null;
function loadSamples(){if(samplesLoading||!audioCtx||typeof sampleSources==='undefined')return;samplesLoading=true;for(let [name,b64] of Object.entries(sampleSources)){let data=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));audioCtx.decodeAudioData(data.buffer).then(buf=>sampleBuffers[name]=buf).catch(()=>{})}}
function playSample(name,volume=1,rate=1){if(!sound)return null;initAudio();let buf=sampleBuffers[name];if(!buf||!audioCtx)return null;let source=audioCtx.createBufferSource(),gain=audioCtx.createGain();source.buffer=buf;source.playbackRate.value=rate;gain.gain.value=volume;source.connect(gain);gain.connect(audioCtx.destination);source.start();return source}
function stopResultSound(){if(resultSound){try{resultSound.stop()}catch(e){}resultSound=null}}

function drawAnnouncement(){const elapsed=roundIntro?introDuration-announceTime:180-announceTime;const phase=roundIntro&&round===1?(elapsed<80?elapsed:elapsed<180?elapsed-80:elapsed-180):elapsed;const entrance=Math.min(1,phase/12),pulse=1+Math.sin(phase*.14)*.015;ctx.save();ctx.translate(640+(1-entrance)*180,330);ctx.scale((.85+entrance*.15)*pulse,(.85+entrance*.15)*pulse);ctx.globalAlpha=Math.min(1,entrance+.25);ctx.fillStyle='#10251eea';ctx.fillRect(-620,-75,1240,140);ctx.fillStyle='#a63529';ctx.fillRect(-600,-75,1200*entrance,8);ctx.fillStyle='#f6cc61';ctx.fillRect(600-1200*entrance,57,1200*entrance,5);ctx.shadowColor='#e58d31';ctx.shadowBlur=18;const size=announcement.length>32?32:announcement.length>20?42:64;text(announcement.toUpperCase(),0,9,size,'#ffe29b','center');ctx.shadowBlur=0;if(roundIntro)text((winsNeeded()===1?'ONE ROUND':'FIRST TO THREE')+' · 99 SECONDS',0,42,14,'#fff3d1','center');ctx.restore();}

const heatherWhiteCard=new Image();
heatherWhiteCard.src='portraits/heather-white.webp';
// Each source card has different framing. Coordinates refer to a 152 × 208 thumbnail.
const selectFaceBounds={"2":[76,37,39],"0": [75, 40, 41], "1": [76, 38, 39], "3": [75, 36, 40], "4": [76, 40, 40], "5": [76, 38, 42], "6": [73, 39, 40], "7": [81, 73, 46], "8": [73, 36, 42], "9": [83, 49, 43], "10": [76, 32, 41], "11": [76, 31, 41], "13": [73, 32, 42], "14": [75, 32, 42], "15": [75, 68, 128], "16": [79, 50, 45]};
function facePortrait(c,id){
 if(id===COXA_ID){if(!coxaFace.complete||!coxaFace.naturalWidth)return;const g=c.getContext('2d'),w=coxaFace.naturalWidth,h=coxaFace.naturalHeight,scale=Math.max(c.width/w,c.height/h);g.clearRect(0,0,c.width,c.height);g.drawImage(coxaFace,(c.width-w*scale)/2,(c.height-h*scale)/2,w*scale,h*scale);return;}
 const im=id===HEATHER_ID&&heatherWhiteSelected?heatherWhiteCard:portraitImages[id];
 if(!im.complete||!im.naturalWidth){im.addEventListener('load',()=>facePortrait(c,id),{once:true});return}
 const [x,y,span]=selectFaceBounds[id];
 const sw=im.naturalWidth*span/152,sh=sw*2/3;
 const sx=im.naturalWidth*x/152-sw/2,sy=im.height*y/208-sh*.48;
 const g=c.getContext('2d');
 g.clearRect(0,0,c.width,c.height);g.drawImage(im,sx,sy,sw,sh,0,0,c.width,c.height);
}

// Preserve the original playable fighters and local arcade scoring.
// Mestre has a different three-technique chain on every attack button.
const mestreKits=[['bencao','frente','rasteira'],['rasteira','bencao','costas'],['frente','costas','bencao'],['costas','frente','rasteira'],['frente','rasteira','costas'],['costas','bencao','frente']];
characterMoves[14]=mestreKits.map((keys,n)=>{const old=characterMoves[14][n],phases=keys.map((key,i)=>({...techniqueBook[key],key,rank:n>=4?3:2,frames:12,range:old.range,damage:n>=4?9:6,knockdown:i===2,push:i===2?4:0}));return {...old,...phases[0],phases,start:12,active:36,end:19,authoredRow:null,name:keys.map(k=>techniqueBook[k].name).join(' → ')};});
const originalRedesignedAttack=drawRedesignedAttack;
drawRedesignedAttack=function(p){if(p.id!==14){originalRedesignedAttack(p);return}const b=moveFor(p,p.attack),m=attackPhase(b,p.at);if(p.at<b.start||p.at>=b.start+b.active){drawGinga(p);return}const row=({frente:2,bencao:3,rasteira:4,costas:5})[m.key];const frame=m.phaseFrame<3?2:m.phaseFrame<8?4:6;drawRedesignFrame(p,row*8+frame);};
let arcadeScore,scoreToast=null,firstHitClaimed=false,roundRewarded=false;
let rankStore={characters:{},boards:[]};try{const saved=JSON.parse(localStorage.getItem('roda-ranks-v1')||'null');if(saved&&typeof saved.characters==='object'&&Array.isArray(saved.boards))rankStore=saved;}catch(e){}
function resetArcadeScore(){scoreToast=null;arcadeScore={total:0,hits:0,firsts:0,combo:0,rounds:0,perfect:0,clear:0,maxCombo:0,completed:false,saved:false,rankApplied:false};}
resetArcadeScore();
function rankName(xp){return xp>=100000?'RODA LEGEND':xp>=50000?'GOLD':xp>=20000?'SILVER':xp>=5000?'BRONZE':'NEWCOMER';}
function characterRank(id){return 'ARCADE RANK · '+rankName(Number(rankStore.characters[id]?.xp)||0);}
function award(bucket,points){arcadeScore[bucket]+=points;arcadeScore.total+=points;}
function scoreContact(p,opp,damage){if((mode!=='solo'&&mode!=='aisha'&&mode!=='coxa')||damage<=0||arcadeScore.completed)return;const first=!firstHitClaimed;firstHitClaimed=true;if(p!==players[0]){players[0].combo=0;players[0].comboTimer=0;return}award('hits',100);if(first){award('firsts',500);record('FIRST HIT +500');scoreToast={text:'FIRST HIT +500',until:tick+90};}const chain=p.combo+1;arcadeScore.maxCombo=Math.max(arcadeScore.maxCombo,chain);if(chain>=2){const bonus=100*(chain-1);award('combo',bonus);record(chain+' HIT COMBO +'+bonus);scoreToast={text:chain+' HIT COMBO +'+bonus,until:tick+70};}}
function scoreRound(win){if((mode!=='solo'&&mode!=='aisha'&&mode!=='coxa')||roundRewarded||arcadeScore.completed)return;roundRewarded=true;if(win===0){award('rounds',1000);if(players[0].hp===players[0].maxHp)award('perfect',500);}}
const scorePanel=document.createElement('div');scorePanel.id='score';scorePanel.className='overlay hidden';scorePanel.style.cssText='overflow:auto;background:#131716f5;padding:24px;display:block';scorePanel.innerHTML='<div style="max-width:800px;margin:auto"><p class="eyebrow">ARCADE COMPLETE</p><h2>YOUR PLACE IN THE RODA</h2><h3 id="scoretotal"></h3><p id="scorerank"></p><p id="scorebreakdown"></p><p>100 per clean hit · 500 first hit per round · combo bonus: 100 × each hit after the first · 1,000 round win · 500 perfect round · 5,000 arcade clear.</p><label for="arcadename">ADD YOUR NAME</label><input id="arcadename" maxlength="20" placeholder="Your name" style="display:block;font-size:24px;margin:12px 0;padding:10px;color:#111;background:#fff"><button id="savescore">A · SAVE NAME + SCORE</button><button id="watchending">B · WATCH ENDING</button><p id="savestatus">Rankings and character progress are saved on this browser.</p><ol id="scoreboard"></ol></div>';
$('.screen').append(scorePanel);
function boardKey(){return difficulty+':'+roundLimit;}
function boardEntries(){return rankStore.boards.filter(e=>playableIds.some(id=>profiles[id]?.name===e.character)&&e.category===boardKey()&&((e.character==='Coxa')===(chosen[0]===COXA_ID))).sort((a,b)=>b.score-a.score||a.time-b.time);}
function paintScoreBoard(){const list=$('#scoreboard');list.textContent='';for(const e of boardEntries().slice(0,10)){const li=document.createElement('li');li.textContent=e.name+' · '+e.character+' · '+e.score.toLocaleString()+' · '+e.rank;list.append(li);}}
function persistRanks(){try{localStorage.setItem('roda-ranks-v1',JSON.stringify(rankStore));return true}catch(e){return false}}
function openArcadeScore(){if(!arcadeScore.completed){award('clear',5000);arcadeScore.completed=true;}if(!arcadeScore.rankApplied){const id=chosen[0],old=rankStore.characters[id]||{xp:0,clears:0};rankStore.characters[id]={xp:old.xp+arcadeScore.total,clears:old.clears+1};arcadeScore.rankApplied=true;persistRanks();}scene='score';show('score');if(namedArcadeRun){$('#arcadename').value=namedArcadeRun.player;const t=arcadeRunTotals(namedArcadeRun);$('#savestatus').textContent=t.wins+' W · '+t.losses+' L · Matches already recorded; save earnings below.';namedArcadeRun.earnings=arcadeScore.total;persistArcadeRun();renderNamedRecords();}const position=boardEntries().filter(e=>e.score>=arcadeScore.total).length+1;$('#scoretotal').textContent=arcadeScore.total.toLocaleString()+' POINTS · #'+position;$('#scorerank').textContent=profiles[chosen[0]].name+' · '+characterRank(chosen[0])+' · '+difficulty.toUpperCase()+' / '+formatLabel();$('#scorebreakdown').textContent='Hits '+arcadeScore.hits+' + First hits '+arcadeScore.firsts+' + Combos '+arcadeScore.combo+' + Round wins '+arcadeScore.rounds+' + Perfect rounds '+arcadeScore.perfect+' + Clear '+arcadeScore.clear+' = '+arcadeScore.total+' · Best combo '+arcadeScore.maxCombo;$('#savescore').disabled=arcadeScore.saved;paintScoreBoard();}
function saveArcadeName(){if(scene!=='score'||!arcadeScore.completed||arcadeScore.saved)return;const name=String(namedArcadeRun?.player||$('#arcadename').value||'').trim().slice(0,32);if(!name){$('#savestatus').textContent='Enter a name to save your score, or choose Watch Ending.';$('#arcadename').focus();return}const entry={name,character:profiles[chosen[0]].name,currency:chosen[0]===COXA_ID?'EUR':'BRL',score:arcadeScore.total,...arcadeRunTotals(namedArcadeRun),rank:rankName(rankStore.characters[chosen[0]].xp),category:boardKey(),time:Date.now()};rankStore.boards.push(entry);if(!persistRanks()){rankStore.boards.pop();$('#savestatus').textContent='Browser storage is unavailable. Your score is shown above but could not be saved.';return}arcadeScore.saved=true;if(chosen[0]===COXA_ID)coxaRecordArcade(entry);$('#savescore').disabled=true;$('#savestatus').textContent='Saved. Choose Watch Ending to continue.';paintScoreBoard();}
$('#savescore').onclick=saveArcadeName;$('#watchending').onclick=()=>openComicEnding();
// Limit every confirmation path to the active fighters.
const confirmPlayable=confirmPick;confirmPick=function(){if(!playableIds.includes(pick))return;confirmPlayable()};$('#confirm').onclick=confirmPick;

const gingaStanceHeights={"0": 201, "1": 193, "2": 189, "3": 188, "4": 185, "5": 197, "6": 200, "7": 199, "8": 197, "9": 186, "10": 219, "11": 204, "12": 198, "13": 189, "14": 163};
const combatData={"14": {"src": "mestre-complete-v27.webp", "referenceHeight": 147, "stanceHeight": 139}};
const flipData={"7":{"src":"flip-7-v27.webp","referenceHeight":205,"stanceHeight":178},"9":{"src":"flip-9-v27.webp","referenceHeight":212,"stanceHeight":204},"14":{"src":"flip-14-v27.webp","referenceHeight":226,"stanceHeight":201}};
// Mestre uses one full-body sheet for every state.
const combatImages=Object.fromEntries(Object.entries(combatData).map(([id,d])=>{const im=new Image();im.src=d.src;return[id,im]}));
const flipImages=Object.fromEntries(Object.entries(flipData).map(([id,d])=>{const im=new Image();im.src=d.src;return[id,im]}));
const combatContacts={14:[[1,3,5],[2,4,6],[2,4,6],[2,5,6],[2,4,6],[2,4,6]]};
const combatKeys={14:[['rasteira','bencao','frente'],['rasteira','chapa','costas'],['frente','costas','armada'],['chapa','costas','martelo'],['au','chapa','rasteira'],['rasteira','bencao','martelo']]};
const combatNames={14:['Maré Ascendente','Corrente Rasteira','Giro do Mestre','Recuo e Resposta','Aú da Maré','Espiral Dourada']};
for(const id of [14])characterMoves[id].forEach((m,n)=>{m.phases=combatKeys[id][n].map((key,i)=>({...m.phases[i],...techniqueBook[key],key,contactFrame:combatContacts[id][n][i],knockdown:i===2,push:i===2?4:0}));m.name=combatNames[id][n];m.signature=m.name;});
// Assemble two grounded chains from the matching contact poses on Maré's sheet.
for(const [button,name,sequence] of [
 ['LT','Low Tide',[[1,0],[0,1]]],
 ['RT','Turning Tide',[[3,1],[3,2]]]
]){
 const base=characterMoves[14][0];
 const phases=sequence.map(([slot,index],step)=>({
  ...characterMoves[14][slot].phases[index],artRow:slot+2,
  knockdown:step===sequence.length-1,push:step===sequence.length-1?4:0
 }));
 characterMoves[14].push({...base,...phases[0],button,name,signature:name,phases,active:phases.reduce((total,phase)=>total+phase.frames,0),cost:0});
}
function combatFrame(p){
 if(p.hp<=0||p.down>0){const age=Math.max(0,tick-p.hitAt);return p.hp>0&&p.down<12?14:age<8?10:age<16?11:age<24?12:13;}
 if(p.stun>0&&!p.guardStun)return 10;
 if(p.attack!==null){const b=moveFor(p,p.attack),m=attackPhase(b,p.at),row=(m.artRow??(p.attack+2))*8;if(p.at<b.start)return row;if(p.at>=b.start+b.active)return row+7;return row+Math.min(7,m.contactFrame+(m.phaseFrame>=7?1:0));}
 if(p.y>0)return 15;if(p.takeoff>0||p.landing>0||p.crouch)return 9;if(p.block)return 8;return Math.abs(p.vx)>.25?Math.floor((((p.ginga%176)+176)%176)/22):0;
}
function drawPacked(p,im,index,f){
 // The original crouch has a second arm behind the planted hand. The clean
 // squat shares its floor anchor and is used for both crouching and rolling.
 if(p.id===14 && im===combatImages[14] && index===9)index=57;
 if(!im?.complete||!im.naturalWidth)return;ctx.save();ctx.translate(p.x,590-p.y);ctx.scale(p.dir,1);ctx.drawImage(im,index%8*320,Math.floor(index/8)*320,320,320,-160*f,-300*f,320*f,320*f);ctx.restore();}
function drawCompleteFighter(p){
 const index=combatFrame(p),row=Math.floor(index/8);
 drawPacked(p,combatImages[p.id],index,305/(combatData[p.id].referenceHeight*identityRowScale[p.id][row]));
}
const flipNames={7:'Jade Inversion',9:'Solar Arc',2:'Memória no Ar',14:'Maré Invertida'};
function drawVeteranFlip(p){const b=moveFor(p,p.attack),m=attackPhase(b,p.at),index=p.at<b.start?0:p.at>=b.start+b.active?7:1+m.phase*2+(m.phaseFrame>=7?1:0);const d=flipData[p.id],ref=combatData[p.id],rd=redesignData[p.id];const stance=ref?305*ref.stanceHeight/ref.referenceHeight:305*rd.rects[0][3]/rd.referenceHeight;drawPacked(p,flipImages[p.id],index,stance/d.stanceHeight);}
if(!document.querySelector('[data-mode="watcharcade"]')){const b=document.createElement('button');b.dataset.mode='watcharcade';b.innerHTML='<b>WATCH ARCADE</b><span>CPU PLAYS THE STORY LADDER</span>';b.onclick=()=>setMode('watcharcade');document.querySelector('.mode-buttons').append(b);}
const androidButton=document.createElement('button');
androidButton.dataset.mode='aisha';
androidButton.innerHTML='<b>AISHA MODE</b><span>20 ANDROIDS · FULL HEALTH EACH FIGHT</span>';
androidButton.onclick=()=>setMode('aisha');
document.querySelector('.mode-buttons').append(androidButton);
installCoxaUI();
function returnToMenu(){if(mode==='aisha')$('#watchcomplete').querySelector('h2').textContent='ARCADE COMPLETE';setMode('solo');stopResultSound();scene='menu';players=[];freeze=0;endWait=0;storyEnding=false;activeStage=DEFAULT_STAGE;show('menu');setStageMusic(-1);}
const watchExit=document.createElement('button');watchExit.textContent='RETURN TO MAIN MENU';watchExit.hidden=true;watchExit.onclick=returnToMenu;document.querySelector('.cabinet-top').append(watchExit);
const menuStyle=document.createElement('style');menuStyle.textContent='#menu{overflow-y:auto}.mode-buttons{gap:5px}.mode-buttons button{padding:8px 12px;min-height:44px}#menu .menupanel{padding:12px 24px}.cabinet-top button{font-size:11px}';document.head?.append(menuStyle);
$('#quit').onclick=returnToMenu;
// Intro uses the same correctly scaled fighter sheet as gameplay.
let foundationStarted=0;
const foundationSkip=document.createElement('button');foundationSkip.textContent='SKIP INTRO → MENU';foundationSkip.onclick=()=>finishFoundation();
const foundationSound=document.createElement('button');foundationSound.textContent='ENABLE INTRO MUSIC';foundationSound.onclick=()=>{sound=true;initAudio();useStageMusic();setStageMusic(-1)};
document.querySelector('.cabinet-top').append(foundationSound,foundationSkip);
function startFoundation(){scene='foundation';foundationStarted=tick;show(null);foundationSkip.hidden=false;foundationSound.hidden=false;}
function finishFoundation(){scene='menu';show('menu');foundationSkip.hidden=true;foundationSound.hidden=true;setStageMusic(-1);}
function drawFoundation(){const age=tick-foundationStarted;if(age>=1440){finishFoundation();return;}const part=Math.floor(age/360);rect(0,0,W,H,'#15211c');ctx.strokeStyle='#c7a04b';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(640,590,310,48,0,0,Math.PI*2);ctx.stroke();text('THE MOVEMENT BEHIND RODA',640,72,38,'#edc768','center');const titles=['GINGA · THE MOVING BASE','BÊNÇÃO · DIRECT PRESSURE','MEIA-LUA DE COSTAS · TURNING KICK','RASTEIRA · LOW SWEEP'];text(titles[part],640,122,25,'#fff0d1','center');const frames=[[0,1,2,3,4,5,6,7],[16,18,19,20,23],[32,35,36,37,39],[24,25,26,27,31]][part];drawPacked({x:640,y:0,dir:1},combatImages[14],frames[Math.floor(age/24)%frames.length],305/combatData[14].referenceHeight);text('Inspired by Mestre Curtis Pierre’s published movement curriculum',640,637,18,'#d5cdaa','center');text('Arcade interpretations · not an instructional demonstration',640,665,15,'#b4baae','center');}
foundationSkip.hidden=true;foundationSound.hidden=true;
// The school page shares this runtime, so its older shell receives current labels.
const versionLabel=document.querySelector('.intro .eyebrow');if(versionLabel)versionLabel.textContent='RODA / '+playableIds.length+' FIGHTERS · 99-SECOND ROUNDS';
const reviewLink=document.querySelector('.review-entry a');if(reviewLink)reviewLink.textContent='WATCH THE ACTUAL GAME ANIMATIONS';
const arenaHeading=document.querySelector('.soundtrack h3');if(arenaHeading)arenaHeading.textContent=stageNames.length+' ARENAS. A WORLD OF RHYTHM.';
const menuTag=document.querySelector('.menupanel .tag');if(menuTag)menuTag.textContent='PLAY OR WATCH';
const mestreNote=document.querySelector('.under p.small');if(mestreNote)mestreNote.textContent='MESTRE MARÉ: All six buttons deliver three-hit combinations. Bento and Nestor each have six grounded three-kick combinations.';

retrySentinelScores();
