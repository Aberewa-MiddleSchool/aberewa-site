'use strict';
const $=id=>document.getElementById(id), canvas=document.querySelector('canvas'),g=canvas.getContext('2d');
const cover=new Image();cover.src='emerald-night-suit.webp';
const districts=['Harbor','Tile Market','Palm Boulevard','Tram Depot','Old Fort','Hill Gardens','Copper Foundry','Radio Heights','Clock Quarter','Beacon Citadel'];
const missions=['Approach','Crossing','Blockade','Breakthrough','Showdown'];
const combinations=[['Maré','KS'],['Lua','SK'],['Tambor','KK'],['Raiz','SS'],['Farol','KKS'],['Brisa','SKS'],['Vento','KSK'],['Onda','SSK'],['Eco','SKK'],['Aurora','KSS']];
const held=new Set(),ink='#102328',green='#116a43',gold='#ffda47';
let state='menu',stage=1,mode='Easy',save={},x,face,hp,energy,camera,enemies,items,fx,gate,length,wave,action,timer,cool,inv,chain,lastHit,clock=0,tip='',tipTime=0,kills,comboHits;
function read(){try{return JSON.parse(localStorage.getItem('guardia-verde-v1'))||{}}catch{return {}}}
let playerName='',typedName='',letter=0,watchMode=false;
function slot(){return watchMode?'Watch '+mode:mode}
const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function load(){
 const data=read(), legacy=data[mode];
 const previous=playerName&&data.players?.[playerName]?.[slot()];
 save=previous||(playerName&&!watchMode&&!data.legacyOwners?.[mode]&&legacy)||{};
 stage=Math.min(50,Math.max(1,Number(save.stage)||1));save.moves=Array.isArray(save.moves)?save.moves:[];
}
function persist(){
 if(!playerName)return;
 try{const data=read();data.players=data.players||{};data.players[playerName]=data.players[playerName]||{};
 if(!watchMode&&data[mode]){data.legacyOwners=data.legacyOwners||{};data.legacyOwners[mode]=data.legacyOwners[mode]||playerName}data.players[playerName][slot()]=save;localStorage.setItem('guardia-verde-v1',JSON.stringify(data))}catch{}
}
function nameGrid(){
 $('nameValue').textContent=typedName.padEnd(12,'·');
 $('letters').replaceChildren(...Array.from(alphabet,(c,i)=>{const tile=document.createElement('span');tile.textContent=c;tile.className=i===letter?'active':'';return tile}));
}
function enterName(){sfx("block");
 typedName='';letter=0;
 panel('name','ARCADE REGISTRATION','Player name','D-pad selects · A adds · X deletes · B goes back','Confirm name');
 nameGrid();
}
function nameInput(edge){
 if(edge(1)){menu();return}
 if(edge(9)){
   if(!typedName){$('desc').textContent='Choose at least one letter or number. Press A to enter it.';return}
   playerName=typedName;load();if(save.done){stage=1;save={stage:1,moves:[],deaths:save.deaths||0};sessionSeed=(Math.random()*4294967296)>>>0}
   persist();sfx("block");start();return;
 }
 if(edge(0)&&typedName.length<12)typedName+=alphabet[letter];
 else if(edge(2))typedName=typedName.slice(0,-1);
 else if(edge(14))letter=(letter+35)%36;
 else if(edge(15))letter=(letter+1)%36;
 else if(edge(12))letter=(letter+27)%36;
 else if(edge(13))letter=(letter+9)%36;
 else return;
 nameGrid();
}
function title(){return districts[Math.floor((stage-1)/5)]+' · '+missions[(stage-1)%5]}
function panel(s,t,h,d,b){state=s;if(s==='lost'||s==='clear')remainingContinue=6;$('nameBox').hidden=s!=='name';held.clear();$('panel').hidden=false;$('tag').textContent=t;$('title').textContent=h;$('desc').textContent=d;$('primary').textContent='A / Start · '+b;$('difficulty').textContent='↕ '+(watchMode?'Watch CPU':'Play Arcade')+'   ◀ '+mode+' ▶';$('difficulty').hidden=s!=='menu'}
function menu(){playerName='';load();panel('menu','ABEREWA ARCADE  /  SIDE-SCROLLING ADVENTURE','Guardiã Verde','Guardiã Verde is a blind Afro-Brazilian woman who teaches blind middle school students. After dark she takes to the sidewalks of a futuristic Brazil to stop a drug-dealing network. Ten women control its districts.','Enter player name')}
function play(){state='play';$('panel').hidden=true;$('book').hidden=true}
let midpoint=false,arrowTime=0,worldLayer=false;
let sessionSeed=(Math.random()*4294967296)>>>0,layout;
function stageLayout(){
  let seed=(sessionSeed^Math.imul(stage,2654435761))>>>0;
  function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
  return {phase:random()*6.28,hills:145+random()*85,first:475+random()*130,
    middle:.53+random()*.09,final:190+random()*130,span:random()*350,
    emblem:205+random()*120,enemy:Math.floor(random()*3),space:random()*69,
    view:Math.floor(random()*4),rearFirst:random()>.5};
}
function travel(){return stage%2?1:-1}
let defeated=[],hitStop=0,bossDefeated=false;
const stageBossNames=["Âncora","Vela","Sirene","Maré Alta","Doca","Safira","Mosaica","Faísca","Calçada","Vitral","Vereda","Jatobá","Copa","Folhagem","Palma","Catraca","Linha Rubra","Bitola","Volta","Condutora","Sentinela","Torre","Guarita","Baluarte","Muralha","Hera","Dália","Urtiga","Bromélia","Espinha","Escória","Forja","Brasa","Bigorna","Cobre","Sintonia","Antena","Onda Curta","Frequência","Estática","Minuta","Espiral","Corda","Engrenagem","Pêndula","Centelha","Vigia","Aurora Negra","Coroa","Regente"];
function start(){bossDefeated=false;defeated=[];hitStop=0;stageReais=0;moveClock=0;held.clear();layout=stageLayout();sequence=null;airTime=poseTime=0;midpoint=false;arrowTime=0;x=90;face=1;hp=100;energy=100;camera=0;enemies=[];fx=[];wave=0;gate=layout.first;length=waveCount()*1850+layout.span+((stage-1)%5)*140;
items=stage%5===1&&!save.moves.includes(Math.floor((stage-1)/5))?[{x:layout.emblem,id:Math.floor((stage-1)/5)}]:[];action='';timer=cool=inv=chainAge=0;chain='';lastHit=-10;kills=comboHits=0;play();say(title()+' · '+(travel()>0?'Go right →':'← Go left'))}
let chainAge=0;
function say(s){tip=s;tipTime=2.2}
function waveCount(){return 26+Math.floor((stage-1)/10)}
function spawn(){wave++;const bossWave=wave===waveCount();const count=bossWave?1:2+(stage>10?1:0);
for(let i=0;i<count;i++){let boss=bossWave,kind=(stage+wave+i+layout.enemy)%3;let life=boss?(stage%5===0?120:83)+stage:24+kind*7+Math.floor(stage*.5);const side=(i%2===0?1:-1)*(layout.rearFirst?-1:1);const entry=Math.max(12,Math.min(length-12,x+side*(198+layout.space+i*31)));enemies.push({x:entry,hp:life,max:life,boss,kind,wind:0,beat:i+wave,move:kind,kickTime:0,rest:.4+i*.3,stun:0,dir:-side})}say(bossWave?(stage===50?"Final boss":stage%5===0?"District boss":"Stage boss")+" · "+stageBossNames[stage-1]:"Dealers closing in · both sides")}
function burst(px,y,color,n){y+=ground(px)-373;for(let i=0;i<n;i++)fx.push({x:px,y,vx:Math.cos(i*2.4)*120,vy:-60+Math.sin(i*2.4)*90,t:.45,color})}
const starters = {
  kick:  { name:'Chapa dupla', keys:'K', beats:['straight','rising'] },
  sweep: { name:'Chapa e rasteira', keys:'S', beats:['straight','sweep'] },
  power: { name:'Chapa forte', keys:'', beats:['straight','turn','strength'] },
  jump:  { name:'Chapa no ar', keys:'K', beats:['airStraight','airTurn'] }
};
let sequence=null, pose='', poseTime=0, airTime=0;
function lift(){return airTime>0?88*Math.sin(Math.PI*(1-airTime/.66)):0}
function strike(type){
  if(state!=='play'||sequence||cool>0)return;
  const starter=starters[type];
  if(!starter)return;
  if(type==='power'&&energy<40){say('Strength recharging');return}
  if(type==='power')energy-=40;
  if(type==='jump'&&airTime<=0)airTime=.66;
  sequence={type,index:0,wait:type==='jump'?.09:.04};
  cool=type==='power'?.85:type==='jump'?.67:.47;
  action=type;vocalize();
  chain=starter.keys?((chainAge>0?chain:'')+starter.keys).slice(-3):'';
  chainAge=1.45;
  const match=[...save.moves].sort((a,b)=>combinations[b][1].length-combinations[a][1].length)
    .find(i=>chain.endsWith(combinations[i][1]));
  sequence.bonus=match!==undefined;sequence.collectName=sequence.bonus?combinations[match][0]:'';
  if(sequence.bonus){comboHits++;say(combinations[match][0]+' combination!')}
}
function advanceAttack(dt){
  const wasAirborne=airTime>0;airTime=Math.max(0,airTime-dt);if(wasAirborne&&airTime===0)sfx("land");poseTime=Math.max(0,poseTime-dt);
  if(!sequence)return;
  sequence.wait-=dt;
  if(sequence.wait>0)return;
  const starter=starters[sequence.type], beat=starter.beats[sequence.index];
  const last=sequence.index===starter.beats.length-1, powered=beat==='strength';
  sfx(powered?'power':'swing');pose=beat;poseTime=.20;displayMove(last&&sequence.bonus?sequence.collectName+' · '+moveNames[beat]:moveNames[beat]);
  let radius=powered?180:beat==='sweep'?99:104;
  let damage=powered?44:last?13:8;
  if(last&&sequence.bonus){damage+=24;radius+=45;burst(x+face*40,340,gold,12)}
  if(powered)burst(x,358,gold,32);
  const hadEnemies=enemies.length>0;
  for(const e of enemies){
    const dx=e.x-x;
    if(e.impact?.height>0||reach(x,e.x)>radius||(!powered&&dx*face< -18))continue;
    e.hp=last?e.hp-damage:Math.max(1,e.hp-damage);sfx(e.hp<=0?'fall':'hit');e.stun=beat==='sweep'?.58:.28;e.wind=0;e.kickTime=0;e.hitPending=false;e.rest=.42;
    const dir=Math.sign(dx||face);
    const distance=powered?180:sequence.bonus?145:110;
    e.impact={age:0,duration:last?.56:.16,dir,travel:last?distance:0,height:last?(powered?80:55):0};
    e.stun=Math.max(e.stun,e.impact.duration);
    hitStop=Math.max(hitStop,last?.075:.035);
    burst(e.x,300,last?gold:'#edffda',last?20:10);
    if(e.hp<=0)defeated.push(e);
    if(e.hp<=0){if(e.boss)bossDefeated=true;kills++;stageReais+=e.boss?250:25;}
  }
  enemies=enemies.filter(e=>e.hp>0);
  if(hadEnemies&&!enemies.length&&wave<waveCount())gate=layout.first+wave*(length-layout.final-layout.first)/(waveCount()-1);
  if(last)sequence=null;else{sequence.index++;sequence.wait=.23}
}
function step(dt){clock+=dt;if(state!=='play')return;
if(hitStop>0){hitStop-=dt;return}
for(const e of [...enemies,...defeated]){
  const r=e.impact;if(!r)continue;
  const before=r.age/r.duration;r.age=Math.min(r.duration,r.age+dt);
  const after=r.age/r.duration;
  e.x=Math.max(0,Math.min(length,e.x+r.dir*r.travel*((1-before)**2-(1-after)**2)));
  if(after>=1){if(r.height>40)burst(e.x,370,'#dcba85',12);e.impact=null}
}
defeated=defeated.filter(e=>e.impact);
cool=Math.max(0,cool-dt);timer=Math.max(0,timer-dt);inv=Math.max(0,inv-dt);energy=Math.min(100,energy+dt*9);chainAge-=dt;tipTime-=dt;moveClock=Math.max(0,moveClock-dt);advanceAttack(dt);
arrowTime=Math.max(0,arrowTime-dt);let move=travel()*(Number(held.has('right'))-Number(held.has('left')));if(move)face=move;
x=Math.max(25,Math.min(enemies.length?gate+40:length,x+dt*stride(x,move,350)));
if(!midpoint&&x>=length*.5){midpoint=true;arrowTime=3.2;midpointBeep()}
for(const it of items)if(!it.got&&Math.abs(x-it.x)<37){it.got=true;save.moves.push(it.id);persist();say('Collected '+combinations[it.id].join(' · '));burst(x,330,gold,20)}
if(!enemies.length&&wave<waveCount()&&x>=gate-180)spawn();
for(const e of enemies){let dx=x-e.x;e.dir=Math.sign(dx)||1;e.stun-=dt;e.rest-=dt;e.kickTime=Math.max(0,e.kickTime-dt);if(e.stun>0)continue;
if(e.wind>0){e.wind-=dt;if(e.wind<=0){sfx('swing');e.kickTime=.48;e.hitPending=true;e.rest=mode==='Easy'?1.3:.9}}
else if(e.kickTime>0){
  if(e.hitPending&&e.kickTime<=.29){
    e.hitPending=false;
    if(reach(x,e.x)<78&&inv<=0&&!(e.move===1&&lift()>22)){
      hp=Math.max(0,hp-(mode==='Easy'?5:10)*(e.boss?1.5:1));inv=.75;sfx(hp<=0?'fall':'hit');burst(x,333,'#ff8264',7);
    }
  }
}
else if(Math.abs(dx)>50)e.x+=stride(e.x,e.dir,64+e.kind*11+stage*.4)*dt;
else if(e.rest<=0){e.move=(e.move+1)%moveset.length;e.wind=e.move===1?.78:.56}}

if(hp<=0){save.deaths=(Number(save.deaths)||0)+1;persist();vocalize(true);panel('lost','STAGE '+stage,'Regroup',playerName+' · '+mode+' · Deaths: '+save.deaths+'. Jump over low sweeps or move out of kick range.','Retry stage');return}
if(bossDefeated&&x>=length-2&&wave===waveCount()&&!enemies.length){save.reais=(Number(save.reais)||0)+stageReais;stageReais=0;save.stage=Math.min(50,stage+1);save.done=stage===50;persist();panel(stage===50?'won':'clear','STAGE '+stage+' / 50',stage===50?'Network dismantled':'Street cleared',stage===50?'Regente falls, and the drug network loses its hold on all ten districts. At sunrise, Guardiã Verde returns to her classroom.':stageBossNames[stage-1]+' defeated. '+kills+' dealers stopped · '+comboHits+' combinations landed. Next stop: '+districts[Math.floor(stage/5)]+'.',stage===50?'Title screen':'Next stage')}
camera=Math.max(0,Math.min(length-740,x-310));
for(const p of fx){p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=dt*260}fx=fx.filter(p=>p.t>0)}
function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h)}
function oval(x,y,a,b,c){g.fillStyle=c;g.beginPath();g.ellipse(x,y,a,b,0,0,Math.PI*2);g.fill()}
function poly(c,...p){g.fillStyle=c;g.beginPath();g.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1]);g.closePath();g.fill()}
function limb(x,y,a,b,w,c){g.lineCap='round';g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(a,b);g.stroke()}
function label(s,x,y,size,c){if(worldLayer&&travel()<0){g.save();g.translate(x,y);g.scale(-1,1);g.fillStyle=c;g.font='bold '+size+'px monospace';g.textAlign='right';g.fillText(s,0,0);g.restore();return}g.fillStyle=c;g.font='bold '+size+'px monospace';g.fillText(s,x,y)}
const panorama = new Image();
panorama.src = 'night-brasil.webp';
const districtViews = [0,2,1,1,0,2,3,2,1,3];
const checkpointNames = ['PORTO','MERCADO','AVENIDA','ESTAÇÃO','FORTE','JARDINS','FUNDIÇÃO','ANTENAS','RELÓGIO','CIDADELA'];

function ground(worldX) {
  const phase = layout.phase;
  return 366 + 43 * Math.sin(worldX / layout.hills + phase) + 12 * Math.sin(worldX / 79 - phase);
}
function grade(worldX) {
  return (ground(worldX + 2) - ground(worldX - 2)) / 4;
}
function stride(worldX, direction, speed) {
  const slope = grade(worldX);
  return direction * speed * (1 + slope * direction * .35) / Math.hypot(1, slope);
}
function reach(ax, bx) {
  return Math.hypot(ax - bx, ground(ax) - ground(bx));
}
function networkMark(sx,sy,c){
  poly(c,sx,sy-9,sx+9,sy,sx,sy+9,sx-9,sy);
  poly('#252a36',sx+1,sy-6,sx-4,sy+2,sx,sy+1,sx-1,sy+6,sx+5,sy-2,sx+1,sy-1);
}
function streetStory(district){
  const clear=wave===waveCount()&&enemies.length===0;
  if(stage===1||stage===50){
    const world=stage===1?100:length-104,sx=world-camera,y=ground(world)-18;
    const lit=stage===1||clear;
    rect(sx-62,y-111,124,111,'#1f3541');rect(sx-65,y-114,130,5,'#9aab9f');
    for(let i=0;i<2;i++){
      rect(sx-48+i*51,y-70,43,70,'#152933');
      rect(sx-44+i*51,y-65,35,40,lit?'#dabd76':'#435765');
      rect(sx-12+i*51,y-25,3,9,'#b6c6b2');
    }
    label('ESCOLA',sx-49,y-86,16,'#f0d89c');
    for(let i=0;i<6;i++)if(i!==3)oval(sx+30+(i%2)*6,y-96+Math.floor(i/2)*5,1.8,1.8,'#d7c48c');
  }
  const site=length-layout.final-105,sx=site-camera,y=ground(site)-19;
  if(sx> -175&&sx<1100){
    rect(sx-67,y-87,134,87,'#223037');rect(sx-70,y-90,140,5,'#768789');
    rect(sx-50,y-61,100,61,clear?'#b1a26f':'#384651');
    const slats=clear?3:10;
    for(let i=0;i<slats;i++)rect(sx-50,y-61+i*6,100,3,'#15232b');
    if(clear)label('ABERTO',sx-29,y-19,14,'#243a35');
    else networkMark(sx,y-33,'#f18b6c');
    rect(sx-66,y-84,4,20,clear?'#74ead0':'#fa705c');
  }
  for(let i=0;i<3;i++){
    const world=layout.first+125+i*298,sx=world-camera,y=ground(world)-19;
    if(sx< -80||sx>995)continue;
    rect(sx,y-23,40,23,'#242a34');poly('#9a7255',sx,y-23,sx+8,y-29,sx+47,y-29,sx+40,y-23);
    poly('#634c47',sx+40,y-23,sx+47,y-29,sx+47,y-6,sx+40,y);
    rect(sx+5,y-21,3,19,'#959383');networkMark(sx+24,y-12,clear?'#6bd4bc':'#f18b6c');
    if(clear)limb(sx+4,y-2,sx+36,y-22,3,'#79e7c5');
  }
}

function scene() {
  const district = Math.floor((stage - 1) / 5);
  const view = stage%5===1||stage===50?districtViews[district]:layout.view;
  rect(0,0,960,480,'#28464d');
  if (panorama.complete && panorama.naturalWidth) {
    const w = panorama.naturalWidth / 2, h = panorama.naturalHeight / 2;
    g.drawImage(panorama, (view % 2) * w, Math.floor(view / 2) * h, w, h,
      -275 * camera / Math.max(1,length-740), 0, 1240, 480);
  }
  // Elevated traffic glides through the skyline behind the combat lane.
  for(let i=0;i<4;i++){
    const lane=i%2===0?1:-1;
    const pos=((i*261+lane*clock*(14+i*3)-camera*.26)%1120+1120)%1120-70;
    const y=91+i*35;
    poly('#162a36',pos-20,y,pos-11,y-4,pos+10,y-4,pos+20,y,pos+13,y+4,pos-14,y+4);
    rect(pos-8,y-3,14,2,'#7bc6d5');rect(pos-18*lane,y+1,4,2,'#ff8a64');
    rect(pos+14*lane,y,4,2,'#e8ffbd');
  }
  streetStory(district);
  const start = Math.floor(camera / 16) * 16;
  for (let world = start; world < camera + 960; world += 16) {
    const sx = world - camera, a = ground(world), b = ground(world + 16);
    // Raised stone sidewalk, vertical curb face, and the lower vehicle lane.
    poly('#26333d',sx,a-16,sx+17,b-16,sx+17,480,sx,480);
    poly('#647477',sx,a-16,sx+17,b-16,sx+17,b+13,sx,a+13);
    poly('#8c9690',sx,a-15,sx+17,b-15,sx+17,b-13,sx,a-13);
    if(world%48===0)poly('#4a5a60',sx,a-14,sx+2,a-14,sx-4,a+12,sx-6,a+12);
    poly('#a1a898',sx,a+12,sx+17,b+12,sx+17,b+16,sx,a+16);
    poly('#414f53',sx,a+16,sx+17,b+16,sx+17,b+25,sx,a+25);
    if(world%96===0)poly('#8ae2d3',sx,a+18,sx+10,b+18,sx+10,b+20,sx,a+20);
    if(world%96<48)poly('#717264',sx,a+60,sx+17,b+60,sx+17,b+63,sx,a+63);
  }
  for (let world = 640; world < length; world += 700) {
    const sx = world-camera, y = ground(world);
    if (sx < -100 || sx > 990) continue;
    rect(sx,y-92,5,87,'#23383c');rect(sx-6,y-95,93,25,'#192d32');
    rect(sx-6,y-95,4,25,'#e4ab56');label(checkpointNames[district],sx+3,y-78,13,'#f9d294');
  }
  const end = length-camera, y = ground(length);
  rect(end,y-135,7,132,ink);poly(gold,end+7,y-135,end+80,y-135,end+62,y-116,end+7,y-116);
}
const fighterArt=new Image();fighterArt.src='guardia-fighter.webp';
const streetArt=new Image();streetArt.src='street-fighters.webp';
const rivalArt=new Image();rivalArt.src='district-fighters.webp';
function hero(){
  const height=lift(), onGround=height<3;
  const moving=held.has('left')||held.has('right');
  let frame=0;
  if(poseTime>0){
    if(!onGround)frame=7;
    else if(pose==='sweep')frame=6;
    else if(['rising','turn','strength'].includes(pose))frame=5;
    else frame=4;
  }else if(!onGround)frame=3;
  else frame=Math.sin(clock*(moving?8:4))>0?0:1;
  oval(x-camera,ground(x)+1,Math.max(18,41-height*.2),5,'#2b3c40');
  g.save();g.translate(x-camera,ground(x)-height);
  if(onGround)g.rotate(Math.atan(grade(x)));
  g.scale(face,1);
  if(inv>0)g.globalAlpha=.76;
  if(fighterArt.complete&&fighterArt.naturalWidth){
    g.drawImage(fighterArt,(frame%4)*224,Math.floor(frame/4)*192,224,192,-96,-177,224,192);
  }else{g.restore();heroFallback();return}
  if(pose==='strength'&&poseTime>0){
    const pulse=1-poseTime/.2;g.strokeStyle=gold;g.lineWidth=4;g.beginPath();
    g.ellipse(0,-15,14+pulse*155,10+pulse*21,0,0,Math.PI*2);g.stroke();
  }
  g.restore();
}

function heroFallback(){g.save();const height=lift();oval(x-camera,ground(x)+1,Math.max(16,42-height*.21),5,'#293e3d');g.translate(x-camera,ground(x)-height);g.scale(face,1);let t=Math.sin(clock*(held.has('left')||held.has('right')?11:4)),low=0,k=poseTime>0,s=k&&pose==='sweep',kick=k&&!s;if(s)low=26;let hip=-51+low+t*2,sh=hip-32;
if(inv>0)g.globalAlpha=.72;
function leg(h,kx,ky,ax,ay,shade){if(ay===-4)ay+=airTime?-12:ground(x+face*ax)-ground(x);limb(h,hip,kx,ky,22,ink);limb(h,hip,kx,ky,18,shade);limb(kx,ky,ax,ay,15,ink);limb(kx,ky,ax,ay,12,shade);limb(h*.7,hip+2,kx*.84,ky-2,2.5,'#63d6b4');oval(kx,ky,6,5,'#1a5549');limb(kx,ky+1,ax,ay-3,2,'#58bba4');limb(ax,ay,ax+11,ay+1,10,'#161f25');limb(ax+2,ay+3,ax+9,ay+3,1.5,'#79efd5')}
const run=(held.has('left')||held.has('right'))?t*5:0;
leg(-9,-26-t*7-run,hip+19,-39-t*8-run,-4,'#125439');
if(kick){
  const endY=pose==='rising'?-91:pose==='turn'||pose==='airTurn'?-78:-52;
  const extension=.83+.17*Math.sin(Math.PI*poseTime/.2);
  leg(8,8+33*extension,(hip+endY)/2,8+70*extension,endY,green);
}else{leg(8,s?38:20+t*7+run,s?-22:hip+15,s?75:30+t*7+run,s?-12:-4,green)}
poly(ink,-16,hip+5,-13,hip-12,-8,sh-3,10,sh-7,18,sh+6,8,hip-12,17,hip-1,4,hip+10);poly(green,-12,hip-7,-5,sh,10,sh-4,15,sh+5,6,hip-10);poly('#152026',-16,hip-7,12,hip-8,17,hip,3,hip+11,-16,hip+3);
oval(7,sh-15,12,15,ink);oval(7,sh-16,10.8,13.5,green);poly('#884b35',8,sh-12,20,sh-14,17,sh-6,11,sh-5);
poly('#204d43',-10,sh+4,-5,sh+1,1,sh+9,-5,sh+15);limb(-7,sh+11,-6,hip-11,1.8,'#73e4bd');limb(0,sh-23,-2,sh-15,1.5,'#71ddc0');
limb(-4,sh+3,-20,sh+16,10,green);limb(-20,sh+16,-34,sh+10+t*3,8,green);oval(-35,sh+9+t*3,5,5,ink);
limb(11,sh+7,24,sh+14,11,green);limb(24,sh+14,32,sh-2+t*2,8,green);oval(33,sh-4+t*2,5,6,ink);
limb(23,sh+12,30,sh+2+t*2,3,'#70eace');poly('#143d35',7,sh+1,12,sh-1,17,sh+4,15,sh+9);oval(6,sh+7,8,8,ink);oval(6,sh+7,7,7,'#138550');poly(gold,-1,sh+7,6,sh+2,13,sh+7,6,sh+12);oval(6,sh+7,3.1,3.1,'#265ca1');
if(k&&pose==='strength'){g.strokeStyle=gold;g.lineWidth=4;g.beginPath();g.ellipse(0,-12,10+(1-poseTime/.2)*160,10+18*(1-poseTime/.2),0,0,7);g.stroke()}g.restore()}
const moveset = ['Meia-lua de frente','Rasteira','Meia-lua de compasso'];
const bosses=[
  ['Doca','#ba584c','#663b31',1.56,1.14],['Vitral','#7976bd','#ad7051',1.49,1.22],
  ['Palma','#478c85','#603c31',1.62,1.12],['Condutora','#b78248','#b78061',1.53,1.18],
  ['Muralha','#8b6c9e','#875440',1.66,1.18],['Espinha','#ab5f82','#52372c',1.55,1.23],
  ['Cobre','#ad684a','#9d674e',1.61,1.17],['Estática','#586fa3','#6f4639',1.58,1.2],
  ['Pêndula','#7c8655','#bc8666',1.64,1.13],['Regente','#9a4e62','#653e34',1.71,1.22]
];
function bossProfile(){return bosses[Math.floor((stage-1)/5)]}
function rival(e) {
  const chief=bossProfile(), district=Math.floor((stage-1)/5);
  const size=e.boss?chief[3]:1;
  const rhythm = Math.sin(clock * 4.4 + e.beat);
  const attack = Math.sin(Math.PI * Math.max(0, e.kickTime) / .48);
  const sweep = e.move === 1, spin = e.move === 2;
  const low = (e.wind > 0 ? 9 : 0) + attack * (sweep ? 27 : spin ? 18 : 3);
  const hip = -43 + rhythm * 2 + low, shoulder = hip - 27;
  const armor=e.boss?chief[1]:['#b57d68','#a68a66','#8a9ab0'][e.kind];
  const skin=e.boss?chief[2]:['#996346','#bd8a69','#724936'][e.kind];
  const r=e.impact, phase=r?r.age/r.duration:0, arc=Math.sin(phase*Math.PI);
  const floor=ground(e.x);
  oval(e.x-camera,floor,32,4,'#27373b');
  g.save();g.translate(e.x-camera,floor-(r?r.height*arc:0));g.rotate(Math.atan(grade(e.x))+(r?r.dir*(e.hp<=0?phase*1.3:arc*.44):0));
  g.scale(e.dir*size*(e.boss?chief[4]:1),size);
  const art=e.boss?rivalArt:streetArt;
  if(art.complete&&art.naturalWidth){
    const column=e.kickTime>0?(sweep?2:1):0;
    const row=e.boss?district:e.kind;
    const sway=column===0?rhythm*2:0;
    const scale=e.boss?.84:.92;
    g.scale(scale,scale);
    g.transform(1,0,sway*.012,1,0,0);
    g.drawImage(art,column*224,row*192,224,192,-96,-177,224,192);
  }else{
  function segment(ax,ay,bx,by,w) {
    const thick=w*(e.boss?1.54:1.13);limb(ax,ay,bx,by,thick+2,ink);limb(ax,ay,bx,by,thick,armor);
    if(w<=7)oval(bx,by,w*.55,w*.55,skin);
  }
  const shift = rhythm*4, lean = attack*(spin ? -19 : -8) + shift;
  const footX = 24+attack*48, footY = -4-attack*(sweep ? 6 : spin ? 44 : 60);
  segment(-5,hip,-22-shift,hip+18,11);segment(-22-shift,hip+18,-32-shift,-4,8);
  limb(-33-shift,-4,-23-shift,-4,8,ink);
  segment(6,hip,22+attack*17,hip+11-attack*18,11);
  segment(22+attack*17,hip+11-attack*18,footX,footY,8);
  limb(footX,footY,footX+9,footY-2,8,ink);
  poly(ink,-10,hip,lean-13,shoulder,lean+12,shoulder-3,12,hip-1,0,hip+7);
  poly(armor,-7,hip-6,lean-9,shoulder+4,lean+8,shoulder+1,7,hip-8);
  if(e.boss){
    oval(0,hip-2,15,10,armor);oval(lean+1,shoulder+8,14,11,armor);
    poly('#202d38',-13,hip-7,11,hip-10,13,hip-5,-12,hip-2);
    poly('#edc48a',lean-10,shoulder+1,lean-5,shoulder,8,hip-9,5,hip-8);
  }
  networkMark(lean+2,shoulder+8,'#ed8668');
  const head=lean+5,hy=shoulder-14;
  oval(head,hy,10,13,'#252832');oval(head+2,hy+1,8.5,10.5,skin);
  poly(skin,head+8,hy-2,head+13,hy+2,head+8,hy+4);
  oval(head-1,hy-8,10,6,'#27262c');rect(head+4,hy-2,4,1.6,'#28242b');
  {
    const hair=e.boss?district:e.kind;
    if(hair%3===0)oval(head-9,hy-12,8,8,'#27262c');
    else if(hair%3===1)limb(head-8,hy-6,head-14,hy+15,7,'#302731');
    else for(let j=0;j<5;j++)oval(head-10+j*4,hy-11-Math.sin(j)*2,5,6,'#352a32');
    rect(head-5,hy+4,2,4,'#ffd48a');
  }
  segment(lean-4,shoulder+3,lean-22,shoulder+15,6);
  segment(lean-22,shoulder+15,lean-32,spin&&attack>.2?-5:shoulder+9,5);
  segment(lean+6,shoulder+4,lean+18,shoulder+12,7);
  segment(lean+18,shoulder+12,lean+24,shoulder-4+rhythm*3,5);
  }
  g.restore();
  const barX=e.x-camera-18,barY=ground(e.x)-(e.boss?136:143)*size;
  if(e.hp<=0)return;rect(barX,barY,36,4,ink);rect(barX,barY,36*e.hp/e.max,3,gold);
  
}
const reais=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const moveNames={straight:'Chapa de frente · Straight kick',airStraight:'Chapa no ar · Jump kick',airTurn:'Airborne turning kick',rising:'Rising kick',turn:'Turning kick',sweep:'Rasteira · Sweep',strength:'Super-strength kick'};
let stageReais=0,moveCaption='',moveClock=0;
function displayMove(name){moveCaption=name;moveClock=1.15}
function hud(){
  rect(0,0,960,54,ink);
  label(watchMode?'CPU · '+playerName:playerName||'GUARDIÃ VERDE',16,19,15,'#fff4d0');rect(16,28,143,8,'#526460');rect(16,28,hp*1.43,8,'#57d292');
  label('STRENGTH',177,19,13,gold);rect(177,28,83,7,'#526460');rect(177,28,energy*.83,7,gold);
  g.save();g.textAlign='center';label('REAIS',480,17,12,'#b9d0c3');label(reais.format((save.reais||0)+stageReais),480,41,23,gold);
  g.textAlign='right';label('STAGE '+stage+' / 50',944,20,15,'#fff4d0');
  label(enemies.length?'DEALERS '+enemies.length:travel()>0?'ADVANCE →':'← ADVANCE',944,41,14,gold);g.restore();
  const warning=enemies.find(e=>e.wind>0);
  const current=moveClock>0?moveCaption:airTime>0?'Jump':'Ginga';
  g.save();g.textAlign='center';g.font='bold 17px monospace';
  const wide=Math.max(130,g.measureText(current).width+28,warning?g.measureText(moveset[warning.move]).width+85:0);
  rect(480-wide/2,warning?420:440,wide,warning?56:36,'#102328ed');
  if(warning)label('Rival · '+moveset[warning.move],480,437,13,'#ffae89');
  label(current,480,464,17,'#e1ffdf');g.restore();
}

function draw(){if((state==='menu'||state==='name')&&cover.complete&&cover.naturalWidth){g.drawImage(cover,0,0,960,480);return}if(x===undefined)return;g.save();worldLayer=true;if(travel()<0){g.translate(960,0);g.scale(-1,1)}scene();for(let it of items)if(!it.got){let y=ground(it.x)-51+Math.sin(clock*4)*6;oval(it.x-camera,y,16,16,ink);oval(it.x-camera,y,13,13,gold);label('✦',it.x-camera-8,y+6,18,ink)}defeated.forEach(rival);enemies.forEach(rival);hero();fx.forEach(p=>rect(p.x-camera,p.y,5,5,p.color));worldLayer=false;g.restore();hud();if(arrowTime>0){const right=travel()>0;g.save();g.translate(right?850:110,100);g.scale(right?1:-1,1);poly(ink,-76,-17,17,-17,17,-36,75,0,17,36,17,17,-76,17);poly(gold,-69,-11,23,-11,23,-24,62,0,23,24,23,11,-69,11);g.restore();label('HALFWAY',right?810:70,153,17,gold)}if(tipTime>0){g.font='bold 18px monospace';let w=g.measureText(tip).width;rect(480-w/2-12,63,w+24,31,ink);label(tip,480-w/2,85,18,gold)}}
function choose(){if(state==='menu'){enterName();return}if(state==='paused')play();else if(state==='won')menu();else{if(state==='clear')stage=save.stage;start()}};
function pause(){if(state==='play')panel('paused','STAGE '+stage,title(),playerName+' · '+slot()+' · Deaths: '+(save.deaths||0)+' · B to title','Resume');else if(state==='paused')play()}
function toggleBook(){if(state==='play')pause();$('book').hidden=!$('book').hidden;$('list').replaceChildren(...(save.moves.length?save.moves.map(i=>combinations[i].join(' · ')):['Find the first gold disc near the harbor entrance.']).map(s=>{let li=document.createElement('li');li.textContent=s;return li}))};
let audio,effectOutput,voiceBuffer,voiceLoad,activeVoice,voiceIndex=0;
const voiceClips=[[0,.22],[.35,.28],[.75,.33],[1.22,.88]];
function prepareVoice(){
  if(voiceLoad||!audio?.decodeAudioData)return;
  voiceLoad=fetch('guardia-voice.wav').then(r=>{if(!r.ok)throw Error('voice load');return r.arrayBuffer()})
    .then(bytes=>audio.decodeAudioData(bytes)).then(decoded=>{voiceBuffer=decoded}).catch(()=>{voiceLoad=null});
}
function vocalize(defeat=false){
  if(!voiceBuffer||audio?.state!=='running')return;
  if(activeVoice){try{activeVoice.stop()}catch{}}
  const clip=voiceClips[defeat?3:voiceIndex++%3], voice=audio.createBufferSource(), volume=audio.createGain();
  voice.buffer=voiceBuffer;volume.gain.value=defeat?.48:.29;voice.connect(volume).connect(audio.destination);
  activeVoice=voice;voice.onended=()=>{voice.disconnect();volume.disconnect();if(activeVoice===voice)activeVoice=null};
  voice.start(0,clip[0],clip[1]);
}

// One-shot sound effects from The Forever Woman, 13-arena edition.
function tone(freq=190,dur=.15,kind='triangle',vol=.13,delay=0,endFreq){if(!effectOutput||audio?.state!=='running')return;const ac=audio,now=ac.currentTime+delay;const osc=ac.createOscillator(),gain=ac.createGain();osc.type=kind;osc.frequency.setValueAtTime(freq,now);if(endFreq)osc.frequency.exponentialRampToValueAtTime(Math.max(30,endFreq),now+dur);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+dur);osc.connect(gain);gain.connect(effectOutput);osc.start(now);osc.stop(now+dur+.03)}
function noise(dur=.09,vol=.13,high=false){if(!effectOutput||audio?.state!=='running')return;const ac=audio,buffer=ac.createBuffer(1,Math.floor(ac.sampleRate*dur),ac.sampleRate),d=buffer.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,1.6);const source=ac.createBufferSource(),filter=ac.createBiquadFilter(),gn=ac.createGain();buffer.copyToChannel(d,0);source.buffer=buffer;filter.type=high?'highpass':'lowpass';filter.frequency.value=high?1100:600;gn.gain.value=vol;source.connect(filter);filter.connect(gn);gn.connect(effectOutput);source.start();source.stop(ac.currentTime+dur+.03)}
function sfx(type){if(!effectOutput||audio?.state!=='running')return;if(type==='hit'){tone(180,.13,'sawtooth',.21,0,58);noise(.085,.14,true)}else if(type==='swing'){tone(390,.09,'triangle',.06,0,135)}else if(type==='fall'){tone(115,.32,'triangle',.14,0,45);noise(.2,.13)}else if(type==='land'){tone(77,.13,'triangle',.17,0,42)}else if(type==='block'){tone(240,.095,'square',.08,0,130)}else if(type==='dash'){noise(.25,.15,true);tone(280,.27,'sine',.13,0,95)}else if(type==='power'){tone(440,.46,'sine',.17,0,155);tone(730,.3,'triangle',.12,.07,230)}}

function unlockAudio(){
  try{audio=audio||new AudioContext();if(!effectOutput){effectOutput=audio.createGain();effectOutput.gain.value=.22;effectOutput.connect(audio.destination)}prepareVoice();if(audio.state==='suspended')audio.resume().catch(()=>{})}catch{}
}
$('sound').onclick=()=>{unlockAudio();if(audio)audio.resume().then(()=>{$('sound').hidden=true}).catch(()=>{})};
function midpointBeep(){
  if(!audio||audio.state!=='running')return;
  for(let i=0;i<2;i++){
    const tone=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime+i*.24;
    tone.type='triangle';tone.frequency.value=i?990:740;
    gain.gain.setValueAtTime(.001,t);gain.gain.linearRampToValueAtTime(.38,t+.012);
    gain.gain.exponentialRampToValueAtTime(.001,t+.2);
    tone.connect(gain).connect(audio.destination);tone.start(t);tone.stop(t+.22);
  }
}

let controllerIndex=null,previous=[],lastStatus='',confirmedGeneric=null;
function showStatus(message){
  if(message!==lastStatus){$('padStatus').textContent=message;lastStatus=message}
}
function pollController(){
  let pads=[];
  try{pads=Array.from(navigator.getGamepads?.()||[]).filter(p=>p&&p.connected!==false)}catch{}
  const named=p=>/logitech|046d|f310/i.test(p.id)&&p.buttons.length>=16;
  const generic=p=>/xinput|standard gamepad|generic gamepad/i.test(p.id)&&p.buttons.length>=16;
  const confirm=p=>generic(p)&&p.buttons[8]?.pressed&&p.buttons[9]?.pressed;
  let pad=pads.find(named)||pads.find(p=>generic(p)&&p.index===confirmedGeneric)||pads.find(confirm);
  if(!pad){
    if(controllerIndex!==null&&state==='play')pause();
    controllerIndex=confirmedGeneric=null;previous=[];held.clear();
    showStatus(pads.some(generic)?'Using an F310 in X mode? Hold Back + Start to confirm.':'Connect your Logitech F310 in X mode and press a controller button.');
    return;
  }
  if(!named(pad))confirmedGeneric=pad.index;
  const pressed=pad.buttons.map(b=>b.pressed||b.value>.55);
  const axis=pad.axes[0]||0;
  pressed[14]=pressed[14]||axis<-.34;pressed[15]=pressed[15]||axis>.34;
  pressed[12]=pressed[12]||(pad.axes[1]||0)<-.55;
  pressed[13]=pressed[13]||(pad.axes[1]||0)>.55;
  const edge=i=>pressed[i]&&!previous[i];
  if(controllerIndex!==pad.index){controllerIndex=pad.index;previous=pressed;showStatus('F310 connected · Press Start or A');return}
  showStatus('F310 connected');
  if(state==='name'){nameInput(edge);previous=pressed;return}
  if(['lost','clear','won','paused'].includes(state)&&edge(1)){$('book').hidden=true;menu()}
  else if(edge(8))toggleBook();
  else if(!$('book').hidden){if(edge(9)||edge(0)){$('book').hidden=true;if(state==='paused')play()}}
  else if(state==='play'){
    held.clear();
    for(const [i,k] of [[14,'left'],[15,'right']])if(pressed[i])held.add(k);
    if(edge(9))pause();
    else if(watchMode){held.clear()}
    else if(edge(7)&&airTime===0&&!sequence){airTime=.66;}
    else for(const [i,k] of [[2,'kick'],[0,'sweep'],[1,'jump'],[3,'power']])if(edge(i)){strike(k);break}
  }else if(state==='menu'&&(edge(12)||edge(13))){watchMode=!watchMode;menu()}
  else if(state==='menu'&&(edge(14)||edge(15))){mode=mode==='Easy'?'Normal':'Easy';menu()}
  else if(edge(9)||edge(0)){unlockAudio();choose()}
  previous=pressed;
}
let remainingContinue=0;
function cpuPlayer(){
  const target=enemies.reduce((near,e)=>!near||reach(x,e.x)<reach(x,near.x)?e:near,null);
  const dx=target?target.x-x:1;
  held.clear();
  if(!target||Math.abs(dx)>66){
    held.add((target?Math.sign(dx):1)*travel()>0?'right':'left');
    return;
  }
  face=Math.sign(dx)||face;
  if(energy>=40)strike('power');
  else if(target.wind>0&&target.move===1)strike('jump');
  else strike((wave+kills+Math.floor(clock*2))%2?'sweep':'kick');
}
function autoContinue(dt){
  if(!['lost','clear'].includes(state)||controllerIndex===null||!$('book').hidden)return;
  remainingContinue-=dt;
  if(remainingContinue<=0){choose();return}
  const prompt='Continuing in '+Math.ceil(remainingContinue)+' · A / Start now · B to title';
  if($('primary').textContent!==prompt)$('primary').textContent=prompt;
}

window.addEventListener('blur',()=>{if(state==='play')pause()});menu();let last=0;function frame(now){const dt=Math.min(.04,(now-last)/1000);pollController();autoContinue(dt);if(watchMode&&state==='play')cpuPlayer();step(dt);last=now;draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);

