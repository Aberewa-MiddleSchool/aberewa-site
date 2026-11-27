'use strict';
const $=id=>document.getElementById(id), canvas=document.querySelector('canvas'),g=canvas.getContext('2d');
const cover=new Image();cover.src='future-cover.webp';
const districts=['Harbor','Tile Market','Palm Boulevard','Tram Depot','Old Fort','Hill Gardens','Copper Foundry','Radio Heights','Clock Quarter','Beacon Citadel'];
const missions=['Approach','Crossing','Blockade','Breakthrough','Showdown'];
const combinations=[['Maré','KS'],['Lua','SK'],['Tambor','KK'],['Raiz','SS'],['Farol','KKS'],['Brisa','SKS'],['Vento','KSK'],['Onda','SSK'],['Eco','SKK'],['Aurora','KSS']];
const held=new Set(),ink='#102328',green='#116a43',gold='#ffda47';
let state='menu',stage=1,mode='Easy',save={},x,face,hp,energy,camera,enemies,items,fx,gate,length,wave,action,timer,cool,inv,chain,lastHit,clock=0,tip='',tipTime=0,kills,comboHits;
function read(){try{return JSON.parse(localStorage.getItem('guardia-verde-v1'))||{}}catch{return {}}}
function load(){save=read()[mode]||{};stage=Math.min(50,Math.max(1,Number(save.stage)||1));save.moves=Array.isArray(save.moves)?save.moves:[]}
function persist(){try{let data=read();data[mode]=save;localStorage.setItem('guardia-verde-v1',JSON.stringify(data))}catch{}}
function title(){return districts[Math.floor((stage-1)/5)]+' · '+missions[(stage-1)%5]}
function panel(s,t,h,d,b){state=s;held.clear();$('panel').hidden=false;$('tag').textContent=t;$('title').textContent=h;$('desc').textContent=d;$('primary').textContent=b;$('difficulty').hidden=s!=='menu';$('pause').textContent=s==='paused'?'Resume':'Pause'}
function menu(){load();panel('menu','ABEREWA ARCADE  /  SIDE-SCROLLING ADVENTURE','Guardiã Verde','Guardiã Verde is a blind Afro-Brazilian woman who teaches blind middle school students. In a future Brazil under machine surveillance, she follows their footfalls through the harbor to reclaim the coastal beacon.',save.done?'Replay final stage':stage>1?'Continue · Stage '+stage:'Begin stage 1')}
function play(){state='play';$('panel').hidden=true;$('book').hidden=true;$('pause').textContent='Pause'}
let midpoint=false,arrowTime=0,worldLayer=false;
function travel(){return stage%2?1:-1}
function start(){midpoint=false;arrowTime=0;x=90;face=1;hp=100;energy=100;camera=0;enemies=[];fx=[];wave=0;gate=480;length=1580+((stage-1)%5)*140;
items=stage%5===1&&!save.moves.includes(Math.floor((stage-1)/5))?[{x:275,id:Math.floor((stage-1)/5)}]:[];action='';timer=cool=inv=chainAge=0;chain='';lastHit=-10;kills=comboHits=0;play();say(title()+' · '+(travel()>0?'Go right →':'← Go left'))}
let chainAge=0;
function say(s){tip=s;tipTime=2.2}
function spawn(){wave++;const count=2+(stage>10?1:0)+(wave===3&&stage>30?1:0);
for(let i=0;i<count;i++){let boss=wave===3&&stage%5===0&&i===count-1,kind=(stage+wave+i)%3;let life=boss?120+stage:24+kind*7+Math.floor(stage*.5);const side=i%2===0?1:-1;const entry=Math.max(12,Math.min(length-12,x+side*(198+i*31)));enemies.push({x:entry,hp:life,max:life,boss,kind,wind:0,beat:i+wave,move:kind,kickTime:0,rest:.4+i*.3,stun:0,dir:-side})}say("Patrol closing in · both sides")}
function burst(px,y,color,n){y+=ground(px)-373;for(let i=0;i<n;i++)fx.push({x:px,y,vx:Math.cos(i*2.4)*120,vy:-60+Math.sin(i*2.4)*90,t:.45,color})}
function strike(type){if(state!=='play'||cool>0)return;if(type==='power'&&energy<40){say('Strength recharging');return}
action=type;timer=type==='power'?.5:.32;cool=timer;let damage=type==='power'?60:type==='kick'?17:14,radius=type==='power'?180:94;
if(type==='power'){energy-=40;chain='';burst(x,358,gold,32);say('Super-strength shockwave')}
else {chain=(chainAge>0?chain:'')+(type==='kick'?'K':'S');chain=chain.slice(-3);chainAge=.95;
let match=[...save.moves].sort((a,b)=>combinations[b][1].length-combinations[a][1].length).find(i=>chain.endsWith(combinations[i][1]));
if(match!==undefined){damage+=24;radius+=50;comboHits++;say(combinations[match][0]+' combination!');burst(x+face*45,347,gold,14);chain=chain.slice(-2)}}
for(const e of enemies){let dx=e.x-x;if(reach(x,e.x)>radius||(type!=='power'&&dx*face< -22))continue;e.hp-=damage;e.stun=type==='sweep'?.67:.38;e.wind=0;e.kickTime=0;e.rest=.45;e.x+=Math.sign(dx||face)*(type==='power'?90:18);burst(e.x,345,e.hp<=0?gold:'#ccf6d4',9);if(e.hp<=0)kills++}
const hadEnemies=enemies.length>0;enemies=enemies.filter(e=>e.hp>0);if(hadEnemies&&!enemies.length&&wave<3)gate=wave===1?Math.round(length*.54):length-220}
function step(dt){clock+=dt;if(state!=='play')return;
cool=Math.max(0,cool-dt);timer=Math.max(0,timer-dt);inv=Math.max(0,inv-dt);energy=Math.min(100,energy+dt*9);chainAge-=dt;tipTime-=dt;
arrowTime=Math.max(0,arrowTime-dt);let move=travel()*(Number(held.has('right'))-Number(held.has('left')));if(move)face=move;
x=Math.max(25,Math.min(enemies.length?gate+40:length,x+dt*stride(x,move,held.has('duck')?85:235)));
if(!midpoint&&x>=length*.5){midpoint=true;arrowTime=3.2;midpointBeep()}
for(const it of items)if(!it.got&&Math.abs(x-it.x)<37){it.got=true;save.moves.push(it.id);persist();say('Collected '+combinations[it.id].join(' · '));burst(x,330,gold,20)}
if(!enemies.length&&wave<3&&x>=gate-180)spawn();
for(const e of enemies){let dx=x-e.x;e.dir=Math.sign(dx)||1;e.stun-=dt;e.rest-=dt;e.kickTime=Math.max(0,e.kickTime-dt);if(e.stun>0)continue;
if(e.wind>0){e.wind-=dt;if(e.wind<=0){e.kickTime=.48;e.hitPending=true;e.rest=mode==='Easy'?1.3:.9}}
else if(e.kickTime>0){
  if(e.hitPending&&e.kickTime<=.29){
    e.hitPending=false;
    if(reach(x,e.x)<78&&inv<=0&&(!held.has('duck')||e.move===1)){
      hp=Math.max(0,hp-(mode==='Easy'?5:10)*(e.boss?1.5:1));inv=.75;burst(x,333,'#ff8264',7);
    }
  }
}
else if(Math.abs(dx)>50)e.x+=stride(e.x,e.dir,64+e.kind*11+stage*.4)*dt;
else if(e.rest<=0){e.move=(e.move+1)%moveset.length;e.wind=e.move===1?.78:.56}}

if(hp<=0){panel('lost','STAGE '+stage,'Regroup','The machines held the street. Duck under amber strikes and step away from red low strikes.','Retry stage');return}
if(x>=length-2&&wave===3&&!enemies.length){save.stage=Math.min(50,stage+1);save.done=stage===50;persist();panel(stage===50?'won':'clear','STAGE '+stage+' / 50',stage===50?'Beacon restored':'Street cleared',stage===50?'Light returns to the bay. Guardiã Verde has freed all ten districts.':kills+' machines stopped · '+comboHits+' combinations landed. Next stop: '+districts[Math.floor(stage/5)]+'.',stage===50?'Title screen':'Next stage')}
camera=Math.max(0,Math.min(length-740,x-310));
for(const p of fx){p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=dt*260}fx=fx.filter(p=>p.t>0)}
function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h)}
function oval(x,y,a,b,c){g.fillStyle=c;g.beginPath();g.ellipse(x,y,a,b,0,0,Math.PI*2);g.fill()}
function poly(c,...p){g.fillStyle=c;g.beginPath();g.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1]);g.closePath();g.fill()}
function limb(x,y,a,b,w,c){g.lineCap='round';g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(a,b);g.stroke()}
function label(s,x,y,size,c){if(worldLayer&&travel()<0){g.save();g.translate(x,y);g.scale(-1,1);g.fillStyle=c;g.font='bold '+size+'px monospace';g.textAlign='right';g.fillText(s,0,0);g.restore();return}g.fillStyle=c;g.font='bold '+size+'px monospace';g.fillText(s,x,y)}
const panorama = new Image();
panorama.src = 'future-brasil.webp';
const districtViews = [0,2,1,1,0,2,3,2,1,3];
const checkpointNames = ['PORTO','MERCADO','AVENIDA','ESTAÇÃO','FORTE','JARDINS','FUNDIÇÃO','ANTENAS','RELÓGIO','CIDADELA'];

function ground(worldX) {
  const phase = (stage - 1) * .51;
  return 366 + 43 * Math.sin(worldX / 174 + phase) + 12 * Math.sin(worldX / 79 - phase);
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
function scene() {
  const district = Math.floor((stage - 1) / 5);
  const view = districtViews[district];
  rect(0,0,960,480,'#28464d');
  if (panorama.complete && panorama.naturalWidth) {
    const w = panorama.naturalWidth / 2, h = panorama.naturalHeight / 2;
    g.drawImage(panorama, (view % 2) * w, Math.floor(view / 2) * h, w, h,
      -camera * .15, 0, 1190, 480);
  }
  const start = Math.floor(camera / 16) * 16;
  for (let world = start; world < camera + 960; world += 16) {
    const sx = world - camera, a = ground(world), b = ground(world + 16);
    poly('#435456',sx,a-5,sx+17,b-5,sx+17,480,sx,480);
    poly('#adc0ae',sx,a-5,sx+17,b-5,sx+17,b-2,sx,a-2);
    poly('#344447',sx,a+13,sx+17,b+13,sx+17,b+16,sx,a+16);
    poly('#28393d',sx,a+48,sx+17,b+48,sx+17,480,sx,480);
    if (world % 128 === 0) poly('#bc9952',sx,a+18,sx+12,b+18,sx+6,b+25,sx-6,a+25);
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
function hero(){g.save();g.translate(x-camera,ground(x));g.scale(face,1);let t=Math.sin(clock*(held.has('left')||held.has('right')?11:4)),low=held.has('duck')?22:0,k=timer>0,s=k&&action==='sweep',kick=k&&action==='kick';if(s)low=26;let hip=-51+low+t*2,sh=hip-32;
oval(0,1,46,7,'#293e3d');if(inv>0)g.globalAlpha=.72;
function leg(h,kx,ky,ax,ay,shade){if(ay===-4)ay+=ground(x+face*ax)-ground(x);limb(h,hip,kx,ky,22,ink);limb(h,hip,kx,ky,18,shade);limb(kx,ky,ax,ay,15,ink);limb(kx,ky,ax,ay,12,shade);limb(ax,ay,ax+11,ay+1,10,'#161f25')}
leg(-9,-26-t*7,hip+19,-39-t*8,-4,'#125439');leg(8,kick?39:s?38:20+t*7,kick?-61:s?-22:hip+15,kick?78:s?75:30+t*7,kick?-73:s?-12:-4,green);
poly(ink,-16,hip+5,-13,hip-12,-8,sh-3,10,sh-7,18,sh+6,8,hip-12,17,hip-1,4,hip+10);poly(green,-12,hip-7,-5,sh,10,sh-4,15,sh+5,6,hip-10);poly('#152026',-16,hip-7,12,hip-8,17,hip,3,hip+11,-16,hip+3);
oval(7,sh-15,12,15,ink);oval(7,sh-16,10.8,13.5,green);poly('#884b35',8,sh-12,20,sh-14,17,sh-6,11,sh-5);
limb(-4,sh+3,-20,sh+16,10,green);limb(-20,sh+16,-34,sh+10+t*3,8,green);oval(-35,sh+9+t*3,5,5,ink);
limb(11,sh+7,24,sh+14,11,green);limb(24,sh+14,32,sh-2+t*2,8,green);oval(33,sh-4+t*2,5,6,ink);
oval(6,sh+7,8,8,ink);oval(6,sh+7,7,7,'#138550');poly(gold,-1,sh+7,6,sh+2,13,sh+7,6,sh+12);oval(6,sh+7,3.1,3.1,'#265ca1');
if(k&&action==='power'){g.strokeStyle=gold;g.lineWidth=4;g.beginPath();g.ellipse(0,-12,10+(1-timer/.5)*160,10+18*(1-timer/.5),0,0,7);g.stroke()}g.restore()}
const moveset = ['Meia-lua de frente','Rasteira','Meia-lua de compasso'];
function robot(e) {
  const size = e.boss ? 1.32 : 1;
  const rhythm = Math.sin(clock * 4.4 + e.beat);
  const attack = Math.sin(Math.PI * Math.max(0, e.kickTime) / .48);
  const sweep = e.move === 1, spin = e.move === 2;
  const low = (e.wind > 0 ? 9 : 0) + attack * (sweep ? 27 : spin ? 18 : 3);
  const hip = -43 + rhythm * 2 + low, shoulder = hip - 27;
  const armor = ['#db8466','#e0ae60','#abbad2'][e.kind];
  g.save();g.translate(e.x-camera,ground(e.x));g.rotate(Math.atan(grade(e.x)));
  g.scale(e.dir*size,size);oval(0,1,35,5,'#27373b');
  function segment(ax,ay,bx,by,w) {
    limb(ax,ay,bx,by,w+3,ink);limb(ax,ay,bx,by,w,armor);
    oval(bx,by,w*.34,w*.34,'#576269');
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
  const head=lean+5;
  rect(head-9,shoulder-23,22,22,ink);rect(head-5,shoulder-19,16,14,armor);
  rect(head+3,shoulder-14,10,4,e.wind>0?'#fff3a1':'#fc684e');
  segment(lean-4,shoulder+3,lean-22,shoulder+15,6);
  segment(lean-22,shoulder+15,lean-32,spin&&attack>.2?-5:shoulder+9,5);
  segment(lean+6,shoulder+4,lean+18,shoulder+12,7);
  segment(lean+18,shoulder+12,lean+24,shoulder-4+rhythm*3,5);
  g.restore();
  const barX=e.x-camera-18,barY=ground(e.x)-102*size;
  rect(barX,barY,36,4,ink);rect(barX,barY,36*e.hp/e.max,3,gold);
  if(e.wind>0){const cue=moveset[e.move];const width=cue.length*8+10;rect(barX,barY-22,width,18,ink);label(cue,barX+4,barY-9,13,sweep?'#ffad98':gold)}
}
function draw(){if(state==='menu'&&cover.complete&&cover.naturalWidth){g.drawImage(cover,0,0,960,480);return}if(x===undefined)return;g.save();worldLayer=true;if(travel()<0){g.translate(960,0);g.scale(-1,1)}scene();for(let it of items)if(!it.got){let y=ground(it.x)-51+Math.sin(clock*4)*6;oval(it.x-camera,y,16,16,ink);oval(it.x-camera,y,13,13,gold);label('✦',it.x-camera-8,y+6,18,ink)}enemies.forEach(robot);hero();fx.forEach(p=>rect(p.x-camera,p.y,5,5,p.color));worldLayer=false;g.restore();rect(0,0,960,53,ink);label('GUARDIÃ VERDE',16,21,15,'#fff4d0');rect(16,30,150,8,'#526460');rect(16,30,hp*1.5,8,'#57d292');label('STRENGTH',196,21,13,gold);rect(196,30,92,7,'#526460');rect(196,30,energy*.92,7,gold);label('STAGE '+stage+'/50   '+title(),322,32,16,'#fff4d0');label(enemies.length?'MACHINES '+enemies.length:(travel()>0?'ADVANCE →':'← ADVANCE'),805,31,16,gold);if(arrowTime>0){const right=travel()>0;g.save();g.translate(right?850:110,100);g.scale(right?1:-1,1);poly(ink,-76,-17,17,-17,17,-36,75,0,17,36,17,17,-76,17);poly(gold,-69,-11,23,-11,23,-24,62,0,23,24,23,11,-69,11);g.restore();label('HALFWAY',right?810:70,153,17,gold)}if(tipTime>0){g.font='bold 18px monospace';let w=g.measureText(tip).width;rect(480-w/2-12,63,w+24,31,ink);label(tip,480-w/2,85,18,gold)}}
$('primary').onclick=()=>{if(state==='paused')play();else if(state==='won')menu();else{if(state==='clear')stage=save.stage;start()}};
$('difficulty').onchange=e=>{mode=e.target.value;menu()};function pause(){if(state==='play')panel('paused','STAGE '+stage,title(),'Take a breath. Your fight resumes here.','Resume');else if(state==='paused')play()}
$('pause').onclick=pause;$('moves').onclick=()=>{if(state==='play')pause();$('book').hidden=!$('book').hidden;$('list').replaceChildren(...(save.moves.length?save.moves.map(i=>combinations[i].join(' · ')):['Find the first gold disc near the harbor entrance.']).map(s=>{let li=document.createElement('li');li.textContent=s;return li}))};
const mapping={ArrowLeft:'left',ArrowRight:'right',ArrowDown:'duck',KeyV:'listen',KeyZ:'kick',KeyX:'sweep',KeyC:'power'};
let audio;
function unlockAudio(){
  try{audio=audio||new AudioContext();if(audio.state==='suspended')audio.resume().catch(()=>{})}catch{}
}
window.addEventListener('pointerdown',unlockAudio,{capture:true});
window.addEventListener('keydown',unlockAudio,{capture:true});
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

function listen(){
  let target=enemies.slice().sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x))[0];
  if(!target){say('Listening · street clear ahead');return}
  let dx=target.x-x, distance=reach(x,target.x);
  face=dx<0?-1:1;
  say('Footsteps · '+(dx*travel()<0?'left':'right')+' · '+(distance<95?'in kick range':'approaching'));
  burst(target.x,315,'#a8f5de',12);
  try{
    audio=audio||new AudioContext();audio.resume().catch(()=>{});
    const tone=audio.createOscillator(),gain=audio.createGain(),pan=audio.createStereoPanner();
    const now=audio.currentTime;tone.frequency.value=distance<95?370:230;
    pan.pan.value=face*travel()*.8;gain.gain.setValueAtTime(.09,now);gain.gain.exponentialRampToValueAtTime(.001,now+.2);
    tone.connect(gain).connect(pan).connect(audio.destination);tone.start(now);tone.stop(now+.21);
  }catch{}
}
function down(k){if(state!=='play')return;held.add(k);if(k==='listen')listen();if(['kick','sweep','power'].includes(k))strike(k)}
window.addEventListener('keydown',e=>{if(e.code==='KeyP'&&!e.repeat){pause();return}let k=mapping[e.code];if(k&&state==='play'){e.preventDefault();if(!e.repeat)down(k)}});window.addEventListener('keyup',e=>held.delete(mapping[e.code]));
document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);down(b.dataset.key)};b.onlostpointercapture=()=>held.delete(b.dataset.key)});
window.addEventListener('blur',()=>{if(state==='play')pause()});menu();let last=0;function frame(now){step(Math.min(.04,(now-last)/1000));last=now;draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);
