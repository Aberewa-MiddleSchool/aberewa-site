/* Celina replacement. Load before game-v24.js, after fighter-traits. */
'use strict';
const CELINA_ID=2;
const CELINA_ASSET_ROOT=new URL('celina/',document.currentScript.src).href;
const celinaImage=new Image();celinaImage.src=CELINA_ASSET_ROOT+'poses.webp';
const celinaMovement=new Image();celinaMovement.src=CELINA_ASSET_ROOT+'movement.webp';
const celinaCard=new Image();celinaCard.src=CELINA_ASSET_ROOT+'card.webp';
const celinaSequences={"crescent_turn_candidate": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], "high_side_candidate": [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], "mid_low_candidate": [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35], "mixed_kick_candidate": [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47], "front_back_candidate": [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59], "low_sweep_candidate": [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71], "inverted_kick_candidate": [72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83], "mixed_incomplete_candidate": [84, 85, 86, 87, 88, 89, 90, 91, 92, 93], "push_side_candidate": [94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105], "jump_keyposes": [106, 107, 108, 109, 110, 111, 112, 113, 114, 115], "ginga_single_pose": [116], "hit_recoil": [117], "fall_airborne": [118], "fall_grounded": [119]};
let celinaLowMoves=[];
const celinaFrame=(name,n=1)=>celinaSequences[name][n-1];
const CF={
 guard:celinaFrame('ginga_single_pose'),
 low:celinaFrame('low_sweep_candidate',1),
 hit:celinaFrame('hit_recoil'),airFall:celinaFrame('fall_airborne'),ground:celinaFrame('fall_grounded')
};
function installCelina(){
 profiles[CELINA_ID]={name:'Celina',home:'Salvador, Bahia · Brasil',personality:'Born and raised in Brasil. Forty years of Capoeira Angola; Mestre Maré is her husband. A mentor who teaches through every encounter.',win:'You have learned how to kick. Now learn when not to kick.',lose:'Even after forty years, the roda still has something to teach me.',pitch:174};
 fighterTraits[CELINA_ID]={height:164,build:1,speed:4.7,tempo:1,reach:1,power:1,style:'Forty years of Capoeira Angola',signature:'Malícia e sabedoria',accent:'#e6cc81',variant:0};
 fighterPlans[CELINA_ID]='Six two-kick combinations · two single-kick powers · 25% maximum HP per unblocked power hit';
 const seq=(s,ns)=>ns.map(n=>celinaFrame(s,n));
 const p=(name,level,s,ns,contact=2)=>({name,level,art:seq(s,ns),contact});
 const standing=[
  [p('Benção','mid','push_side_candidate',[2,3,4,5,6],2),p('Chapa','mid','push_side_candidate',[7,8,9,10,11,12],2)],
  [p('Meia-lua de frente','high','crescent_turn_candidate',[2,3,4,5,6],2),p('Armada','high','crescent_turn_candidate',[7,8,9,10,11,12],2)],
  [p('Queixada','high','high_side_candidate',[2,3,4,5,6],2),p('Martelo','mid','high_side_candidate',[8,7,9,10,11,12],2)],
  [p('Giro baixo','mid','mid_low_candidate',[2,3,4,5,6],2),p('Rasteira','low','mid_low_candidate',[7,8,9,10,11,12],2)],
  [p('Chapa giratória','mid','mixed_kick_candidate',[2,3,4,5,6],2),p('Meia-lua alta','high','mixed_kick_candidate',[9,10,11,12],1)],
  [p('Ponteira','mid','front_back_candidate',[2,3,4,5,6],2),p('Chapa de costas','mid','front_back_candidate',[7,8,9,10,11,12],2)]
 ];
 const grounded=[
  {name:'Rasteira curta',art:[136,137,138,139],contact:2},
  {name:'Chapa baixa',art:[140,141,142,143],contact:2},
  {name:'Rasteira lateral',art:[144,145,146,147],contact:2},
  {name:'Varredura',art:[148,149,150,151],contact:1}
 ];
 const lowPairs=[[0,1],[1,2],[2,3],[3,0],[0,2],[1,3]];
 const make=(pair,slot,low=false,power=false)=>{
  const phases=pair.map((q,i)=>({pose:0,art:q.art,contact:q.contact,level:q.level,frames:24,damage:low?5:7,range:low?173:200,travel:0,push:i===pair.length-1?3:0,knockdown:i===pair.length-1&&(power||low),rank:power?3:low?1:2,powerKick:power}));
  return {...moves[slot%6],...phases[0],button:['A','B','X','Y','LB','RB','LT','RT'][slot],name:pair.map(q=>q.name).join(' → '),signature:power?pair[0].name:null,label:power?'SINGLE POWER KICK':low?'LOW TWO-KICK COMBINATION':'TWO-KICK COMBINATION',cost:power?50:0,start:7,active:phases.reduce((s,q)=>s+q.frames,0),end:power?18:10,retreat:0,phases};
 };
 characterMoves[CELINA_ID]=standing.map((q,i)=>make(q,i));
 characterMoves[CELINA_ID].push(make([p('Aú batido','high','inverted_kick_candidate',[1,2,3,4,5,6],3)],6,false,true),make([p('Meia-lua potente','mid','mixed_incomplete_candidate',[2,3,4,5,6],2)],7,false,true));
 celinaLowMoves=lowPairs.map((pair,i)=>make(pair.map(index=>({...grounded[index],level:'low'})),i,true));
}
function celinaPose(p){
 const pick=(a,t)=>a[Math.min(a.length-1,Math.max(0,Math.floor(t*a.length)))];
 if(p.hp<=0||p.down>0){const age=tick-p.hitAt;if(age<7)return CF.hit;if(age<19)return CF.airFall;if(p.hp<=0||p.down>14)return CF.ground;return pick([128,129,130,131],1-p.down/14);}
 if(p.stun>0&&!p.guardStun)return CF.hit;
 if(p.rollTime>0){const frames=[124,125,126,127];return pick(p.rollDirection===p.dir?frames:[...frames].reverse(),1-p.rollTime/24);}
 if(inJump(p)){const a=celinaSequences.jump_keyposes;return p.takeoff>0?a[0]:p.vy>0?pick(a.slice(1,6),Math.max(0,Math.min(.99,p.y/200))):pick(a.slice(6),Math.max(0,Math.min(.99,1-p.y/200)));}
 if(p.landing>0)return celinaFrame('jump_keyposes',1);
 if(p.attack!==null){const b=moveFor(p,p.attack),m=attackPhase(b,p.at);if(p.at<b.start)return p.attackCrouched?CF.low:CF.guard;if(p.at>=b.start+b.active)return p.attackCrouched?CF.low:CF.guard;return pick(m.art,m.phaseFrame/m.frames);}
 if(p.crouch)return p.block?124:136;
 if(p.block)return 132;
 if(typeof endWait!=='undefined'&&endWait>0&&players[matchWinner]===p)return endWait>90?134:135;
 return pick([120,121,122,123],(tick%96)/96);
}
function drawCelina(p){
 if(!celinaImage.complete||!celinaImage.naturalWidth)return;
 const pose=celinaPose(p);if(!Number.isInteger(pose))return;
 const image=pose>=120?celinaMovement:celinaImage;const frame=pose>=120?pose-120:pose;
 if(!image.complete||!image.naturalWidth)return;
 const f=1.12;ctx.save();ctx.translate(p.x,590-p.y);ctx.scale(p.dir,1);ctx.drawImage(image,(frame%8)*480,Math.floor(frame/8)*384,480,384,-240*f,-324*f,480*f,384*f);ctx.restore();
}
const celinaWisdom=[
 ['Even after forty years, the roda still has something to teach me.','You have learned how to kick. Now learn when not to kick.'],
 ['Your patience served you well. Carry it into the next roda.','Your opponent’s rhythm tells a story. Learn to listen.'],
 ['A victory understood becomes wisdom. Remember what you learned.','Never confuse movement with progress. Every movement must have purpose.'],
 ['You are growing. Honor those who taught you.','A defeat remembered becomes a lesson. Keep playing.'],
 ['You read my rhythm beautifully. Now make your own.','Power is not the same as control. Give each kick a reason.'],
 ['Today you taught your teacher. That is a beautiful thing.','Forty years have taught me that every fall is another beginning.']
];
function celinaAdvice(index,playerWon){return celinaWisdom[index%celinaWisdom.length][playerWon?0:1];}
