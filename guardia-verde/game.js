'use strict';
const $=id=>document.getElementById(id), canvas=document.querySelector('canvas'),g=canvas.getContext('2d');
const cover=new Image();cover.src='cover.webp';
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
function menu(){load();panel('menu','ABEREWA ARCADE  /  SIDE-SCROLLING ADVENTURE','Guardiã Verde','Guardiã Verde is a blind Afro-Brazilian woman who teaches blind middle school students. Tonight, she follows the machines’ footfalls through the harbor to reclaim the coastal beacon.',save.done?'Replay final stage':stage>1?'Continue · Stage '+stage:'Begin stage 1')}
function play(){state='play';$('panel').hidden=true;$('book').hidden=true;$('pause').textContent='Pause'}
function start(){x=90;face=1;hp=100;energy=100;camera=0;enemies=[];fx=[];wave=0;gate=480;length=1580+((stage-1)%5)*140;
items=stage%5===1&&!save.moves.includes(Math.floor((stage-1)/5))?[{x:275,id:Math.floor((stage-1)/5)}]:[];action='';timer=cool=inv=chainAge=0;chain='';lastHit=-10;kills=comboHits=0;play();say(title())}
let chainAge=0;
function say(s){tip=s;tipTime=2.2}
function spawn(){wave++;const count=2+(stage>10?1:0)+(wave===3&&stage>30?1:0);
for(let i=0;i<count;i++){let boss=wave===3&&stage%5===0&&i===count-1,kind=(stage+wave+i)%3;let life=boss?120+stage:24+kind*7+Math.floor(stage*.5);enemies.push({x:gate+85+i*64,hp:life,max:life,boss,kind,wind:0,rest:.4+i*.3,stun:0,dir:-1})}}
function burst(px,y,color,n){for(let i=0;i<n;i++)fx.push({x:px,y,vx:Math.cos(i*2.4)*120,vy:-60+Math.sin(i*2.4)*90,t:.45,color})}
function strike(type){if(state!=='play'||cool>0)return;if(type==='power'&&energy<40){say('Strength recharging');return}
action=type;timer=type==='power'?.5:.32;cool=timer;let damage=type==='power'?60:type==='kick'?17:14,radius=type==='power'?180:94;
if(type==='power'){energy-=40;chain='';burst(x,358,gold,32);say('Super-strength shockwave')}
else {chain=(chainAge>0?chain:'')+(type==='kick'?'K':'S');chain=chain.slice(-3);chainAge=.95;
let match=[...save.moves].sort((a,b)=>combinations[b][1].length-combinations[a][1].length).find(i=>chain.endsWith(combinations[i][1]));
if(match!==undefined){damage+=24;radius+=50;comboHits++;say(combinations[match][0]+' combination!');burst(x+face*45,347,gold,14);chain=chain.slice(-2)}}
for(const e of enemies){let dx=e.x-x;if(Math.abs(dx)>radius||(type!=='power'&&dx*face< -22))continue;e.hp-=damage;e.stun=type==='sweep'?.67:.38;e.wind=0;e.rest=.45;e.x+=Math.sign(dx||face)*(type==='power'?90:18);burst(e.x,345,e.hp<=0?gold:'#ccf6d4',9);if(e.hp<=0)kills++}
enemies=enemies.filter(e=>e.hp>0)}
function step(dt){clock+=dt;if(state!=='play')return;
cool=Math.max(0,cool-dt);timer=Math.max(0,timer-dt);inv=Math.max(0,inv-dt);energy=Math.min(100,energy+dt*9);chainAge-=dt;tipTime-=dt;
let move=Number(held.has('right'))-Number(held.has('left'));if(move)face=move;
x=Math.max(25,Math.min(enemies.length?gate+40:length,x+move*dt*(held.has('duck')?85:235)));
for(const it of items)if(!it.got&&Math.abs(x-it.x)<37){it.got=true;save.moves.push(it.id);persist();say('Collected '+combinations[it.id].join(' · '));burst(x,330,gold,20)}
if(!enemies.length&&wave<3&&x>=gate-180)spawn();
for(const e of enemies){let dx=x-e.x;e.dir=Math.sign(dx)||1;e.stun-=dt;e.rest-=dt;if(e.stun>0)continue;
if(e.wind>0){e.wind-=dt;if(e.wind<=0){if(Math.abs(dx)<78&&inv<=0&&(!held.has('duck')||e.kind===2)){hp=Math.max(0,hp-(mode==='Easy'?5:10)*(e.boss?1.5:1));inv=.75;burst(x,333,'#ff8264',7)}e.rest=mode==='Easy'?1.3:.9}}
else if(Math.abs(dx)>50)e.x+=e.dir*(64+e.kind*11+stage*.4)*dt;
else if(e.rest<=0)e.wind=e.kind===2?.8:.52}
if(wave&&enemies.length===0&&x>=gate-200&&wave<3)gate=wave===1?Math.round(length*.54):length-220;
if(hp<=0){panel('lost','STAGE '+stage,'Regroup','The machines held the street. Duck under amber strikes and step away from red low strikes.','Retry stage');return}
if(x>=length-2&&wave===3&&!enemies.length){save.stage=Math.min(50,stage+1);save.done=stage===50;persist();panel(stage===50?'won':'clear','STAGE '+stage+' / 50',stage===50?'Beacon restored':'Street cleared',stage===50?'Light returns to the bay. Guardiã Verde has freed all ten districts.':kills+' machines stopped · '+comboHits+' combinations landed. Next stop: '+districts[Math.floor(stage/5)]+'.',stage===50?'Title screen':'Next stage')}
camera=Math.max(0,Math.min(length-740,x-310));
for(const p of fx){p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=dt*260}fx=fx.filter(p=>p.t>0)}
function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h)}
function oval(x,y,a,b,c){g.fillStyle=c;g.beginPath();g.ellipse(x,y,a,b,0,0,Math.PI*2);g.fill()}
function poly(c,...p){g.fillStyle=c;g.beginPath();g.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1]);g.closePath();g.fill()}
function limb(x,y,a,b,w,c){g.lineCap='round';g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(a,b);g.stroke()}
function label(s,x,y,size,c){g.fillStyle=c;g.font='bold '+size+'px monospace';g.fillText(s,x,y)}
function scene(){let district=Math.floor((stage-1)/5),hue=(170+district*23)%360;let grad=g.createLinearGradient(0,0,0,380);grad.addColorStop(0,'hsl('+hue+' 42% 42%)');grad.addColorStop(1,'#ffce82');g.fillStyle=grad;g.fillRect(0,0,960,480);oval(758-camera*.04,103,54,54,'#ffe697');
for(let layer=0;layer<2;layer++){let scroll=camera*(layer?.52:.2),w=layer?98:66;for(let i=Math.floor(scroll/w)-1;i<Math.ceil((scroll+960)/w)+1;i++){let xx=i*w-scroll,hh=54+Math.abs(Math.sin(i*21+stage*.8))*110,top=330-hh-(layer?0:47);rect(xx,top,w-2,380-top,layer?['#965d46','#a97349','#816853','#aa784a'][Math.abs(i+stage)%4]:'#567878');poly(layer?'#70483e':'#4d7171',xx-3,top,xx+w*.48,top-18,xx+w+1,top);if(layer){rect(xx+5,top+4,w-12,5,'#e2ab6e');for(let j=0;j<3;j++){rect(xx+13+j*26,top+20,13,22,'#354c4e');rect(xx+15+j*26,top+23,3,15,'#ffcf7a')}rect(xx+30,302,28,61,'#334b48')}}}
rect(0,359,960,11,'#e7b379');rect(0,370,960,110,'#46605c');for(let i=0;i<18;i++){let xx=i*75-camera%75;poly('#354e4c',xx,378,xx+2,378,xx-27,480,xx-32,480)}rect(0,397,960,2,'#829089');rect(0,448,960,3,'#697f75');
let end=length-camera;rect(end,225,8,145,ink);poly(gold,end+8,226,end+84,226,end+64,244,end+8,244)}
function hero(){g.save();g.translate(x-camera,373);g.scale(face,1);let t=Math.sin(clock*(held.has('left')||held.has('right')?11:4)),low=held.has('duck')?22:0,k=timer>0,s=k&&action==='sweep',kick=k&&action==='kick';if(s)low=26;let hip=-51+low+t*2,sh=hip-32;
oval(0,1,46,7,'#293e3d');if(inv>0)g.globalAlpha=.72;
function leg(h,kx,ky,ax,ay,shade){limb(h,hip,kx,ky,22,ink);limb(h,hip,kx,ky,18,shade);limb(kx,ky,ax,ay,15,ink);limb(kx,ky,ax,ay,12,shade);limb(ax,ay,ax+11,ay+1,10,'#161f25')}
leg(-9,-26-t*7,hip+19,-39-t*8,-4,'#125439');leg(8,kick?39:s?38:20+t*7,kick?-61:s?-22:hip+15,kick?78:s?75:30+t*7,kick?-73:s?-12:-4,green);
poly(ink,-16,hip+5,-13,hip-12,-8,sh-3,10,sh-7,18,sh+6,8,hip-12,17,hip-1,4,hip+10);poly(green,-12,hip-7,-5,sh,10,sh-4,15,sh+5,6,hip-10);poly('#152026',-16,hip-7,12,hip-8,17,hip,3,hip+11,-16,hip+3);
oval(7,sh-15,12,15,ink);oval(7,sh-16,10.8,13.5,green);poly('#884b35',8,sh-12,20,sh-14,17,sh-6,11,sh-5);
limb(-4,sh+3,-20,sh+16,10,green);limb(-20,sh+16,-34,sh+10+t*3,8,green);oval(-35,sh+9+t*3,5,5,ink);
limb(11,sh+7,24,sh+14,11,green);limb(24,sh+14,32,sh-2+t*2,8,green);oval(33,sh-4+t*2,5,6,ink);
oval(6,sh+7,8,8,ink);oval(6,sh+7,7,7,'#138550');poly(gold,-1,sh+7,6,sh+2,13,sh+7,6,sh+12);oval(6,sh+7,3.1,3.1,'#265ca1');
if(k&&action==='power'){g.strokeStyle=gold;g.lineWidth=4;g.beginPath();g.ellipse(0,-12,10+(1-timer/.5)*160,10+18*(1-timer/.5),0,0,7);g.stroke()}g.restore()}
function robot(e){g.save();g.translate(e.x-camera,372);g.scale(e.dir*(e.boss?1.35:1),e.boss?1.35:1);let bob=Math.sin(clock*7+e.x*.02)*2,c=['#ba7158','#d49b51','#8296ab'][e.kind];oval(0,1,28,5,'#293e3d');limb(-9,-24,-16,-4,10,ink);limb(9,-25,16,-4,10,ink);poly(ink,-19,-53,16,-57,20,-27,6,-18,-14,-22);poly(c,-15,-50,12,-53,15,-34,-8,-28);rect(-10,-72+bob,26,21,ink);rect(-6,-68+bob,23,14,c);rect(5,-65+bob,13,4,e.wind>0?'#fff5ab':'#ff5c46');limb(12,-47,e.wind>0?34:23,-34,9,ink);oval(24,-33,7,7,c);if(e.wind>0)label(e.kind===2?'LOW!':'!',-14,-85,15,e.kind===2?'#ffac98':gold);rect(-17,-79,35,3,ink);rect(-17,-79,35*e.hp/e.max,3,gold);g.restore()}
function draw(){if(state==='menu'&&cover.complete&&cover.naturalWidth){g.drawImage(cover,0,0,960,480);return}if(x===undefined)return;scene();for(let it of items)if(!it.got){let y=322+Math.sin(clock*4)*6;oval(it.x-camera,y,16,16,ink);oval(it.x-camera,y,13,13,gold);label('✦',it.x-camera-8,y+6,18,ink)}enemies.forEach(robot);hero();fx.forEach(p=>rect(p.x-camera,p.y,5,5,p.color));rect(0,0,960,53,ink);label('GUARDIÃ VERDE',16,21,15,'#fff4d0');rect(16,30,150,8,'#526460');rect(16,30,hp*1.5,8,'#57d292');label('STRENGTH',196,21,13,gold);rect(196,30,92,7,'#526460');rect(196,30,energy*.92,7,gold);label('STAGE '+stage+'/50   '+title(),322,32,16,'#fff4d0');label(enemies.length?'MACHINES '+enemies.length:'ADVANCE →',805,31,16,gold);if(tipTime>0){g.font='bold 18px monospace';let w=g.measureText(tip).width;rect(480-w/2-12,63,w+24,31,ink);label(tip,480-w/2,85,18,gold)}}
$('primary').onclick=()=>{if(state==='paused')play();else if(state==='won')menu();else{if(state==='clear')stage=save.stage;start()}};
$('difficulty').onchange=e=>{mode=e.target.value;menu()};function pause(){if(state==='play')panel('paused','STAGE '+stage,title(),'Take a breath. Your fight resumes here.','Resume');else if(state==='paused')play()}
$('pause').onclick=pause;$('moves').onclick=()=>{if(state==='play')pause();$('book').hidden=!$('book').hidden;$('list').replaceChildren(...(save.moves.length?save.moves.map(i=>combinations[i].join(' · ')):['Find the first gold disc near the harbor entrance.']).map(s=>{let li=document.createElement('li');li.textContent=s;return li}))};
const mapping={ArrowLeft:'left',ArrowRight:'right',ArrowDown:'duck',KeyV:'listen',KeyZ:'kick',KeyX:'sweep',KeyC:'power'};
let audio;
function listen(){
  let target=enemies.slice().sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x))[0];
  if(!target){say('Listening · street clear ahead');return}
  let dx=target.x-x, distance=Math.abs(dx);
  face=dx<0?-1:1;
  say('Footsteps · '+(dx<0?'left':'right')+' · '+(distance<95?'in kick range':'approaching'));
  burst(target.x,315,'#a8f5de',12);
  try{
    audio=audio||new AudioContext();audio.resume().catch(()=>{});
    const tone=audio.createOscillator(),gain=audio.createGain(),pan=audio.createStereoPanner();
    const now=audio.currentTime;tone.frequency.value=distance<95?370:230;
    pan.pan.value=face*.8;gain.gain.setValueAtTime(.09,now);gain.gain.exponentialRampToValueAtTime(.001,now+.2);
    tone.connect(gain).connect(pan).connect(audio.destination);tone.start(now);tone.stop(now+.21);
  }catch{}
}
function down(k){if(state!=='play')return;held.add(k);if(k==='listen')listen();if(['kick','sweep','power'].includes(k))strike(k)}
window.addEventListener('keydown',e=>{if(e.code==='KeyP'&&!e.repeat){pause();return}let k=mapping[e.code];if(k&&state==='play'){e.preventDefault();if(!e.repeat)down(k)}});window.addEventListener('keyup',e=>held.delete(mapping[e.code]));
document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);down(b.dataset.key)};b.onlostpointercapture=()=>held.delete(b.dataset.key)});
window.addEventListener('blur',()=>{if(state==='play')pause()});menu();let last=0;function frame(now){step(Math.min(.04,(now-last)/1000));last=now;draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);
