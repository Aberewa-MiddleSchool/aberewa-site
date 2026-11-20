'use strict';
const castRoot = new URL('cast/', document.currentScript.src);
const castImages = new Map();
function castImage(name) {
  if (!castImages.has(name)) {
    const image = new Image();
    image.src = new URL(name + '.webp', castRoot);
    castImages.set(name, image);
  }
  return castImages.get(name);
}
const cardUrl = id => new URL('card-' + id + '.webp', castRoot).href;
const castKickRows = [
  ['frente','bencao','chapa','martelo'], ['rasteira','chapa','costas','rasteira'],
  ['frente','martelo','frente','bencao'], ['costas','rasteira','martelo','costas'],
  ['chapa','bencao','martelo','chapa'], ['au','frente','costas','rasteira']
];
{
  const id=18;
  characterMoves[id] = characterMoves[id].map((old, slot) => {
    const duration = 14 + slot % 3;
    const phases = castKickRows[slot].map((key,index) => ({
      ...techniqueBook[key],key,frames:duration,range:old.range*techniqueBook[key].reach,
      damage:4.2*(1+slot*.08),rank:old.rank,
      push:index===3?4:0,knockdown:index===3 && slot>=3
    }));
    const name=phases.map(p=>p.name).join(' → ');
    return {...old,name,signature:name,start:9+slot,active:duration*4,end:13+slot,phases};
  });
}

// An aú or roll completes its travel even when the direction is tapped.
// Hitstun, jump, crouch and a new attack may interrupt it immediately.
const simulateFighter=updateFighter;
updateFighter=function(p,op,input,dt){
  if(p.id===7)return Meilin.update(p,op,input,dt,simulateFighter);
  const axis=input?.x||0;
  const facing=op.x>=p.x?1:-1;
  const available=p.hp>0 && !p.down && !p.stun && p.attack===null &&
    !p.y && !p.takeoff && !p.landing && Math.abs(input?.y||0)<.5;
  if(!available)p.tumble=null;
  if(available && !p.tumble && Math.abs(axis)>.4 && axis*facing<0){
    p.tumble={axis:Math.sign(axis),elapsed:0,duration:30};
  }
  if(p.tumble){
    p.tumble.elapsed+=dt;
    input={...input,x:p.tumble.axis};
    if(p.tumble.elapsed>=p.tumble.duration)p.tumble=null;
  }
  return simulateFighter(p,op,input,dt);
};

function castTile(g,name,cell,columns,x,y,zoom,dir,angle=0) {
  const im=castImage(name);
  if(!im.naturalWidth)return false;
  const tile=224;
  const span=342*zoom;
  g.save();g.translate(x,y);g.scale(dir||1,1);g.rotate(angle);
  g.drawImage(im,cell%columns*tile,Math.floor(cell/columns)*tile,tile,tile,
    -span/2,-span*212/tile,span,span);
  g.restore();
  return true;
}
function castGuard(g,p,x,y,zoom) {
  const rig=rodaRigs[p.id],im=costumes[p.id];
  if(!im.naturalWidth)return;
  const scale=rig.scale*zoom;
  g.save();g.translate(x,y);g.scale(scale*(p.dir||1),scale);
  g.drawImage(im,-rig.points[0][0],-rig.points[0][1]-rig.floor);g.restore();
}
function drawCastState(g,p,x,y,zoom) {
  if(p.id===7){Meilin.draw(g,p,x,y,zoom);return true;}
  const id=p.id, special=id===18, denim=id>=11 && id<=13;
  let name='motion-'+id, cell,cols=6,angle=0;
  const age=Math.max(0,tick-(p.hitAt??tick));
  const beat=5+id%5;
  if(p.victory || (!p.preview && endWait>0 && players[matchWinner]===p)){
    cell=0;
  }else if(p.hp<=0 || p.down>0){
    cell=age<beat?1:age<beat*2.8?2:3;
    if(cell===2)angle=(id%2?1:-1)*.13*Math.min(1,(age-beat)/beat);
    if(p.hp>0 && p.down<8)cell=9;
  }else if(p.stun>0 && !p.guardStun){
    cell=1;angle=(id%2?1:-1)*(.035+(id%4)*.015)*Math.sin(Math.min(1,age/18)*Math.PI);
  }else if(p.attack!=null && (special||denim)){
    const m=moveFor(p,p.attack);
    const segments=id===18?6:4;
    const progress=Math.max(0,Math.min(.999,(p.at-m.start)/m.active));
    let index=id===18?Math.min(5,Math.floor(progress*6)):Math.floor(progress*4);
    const local=progress*segments%1;
    name='attack-'+id;cols=segments;
    cell=p.attack*segments+index;
    if(special && (local<.40 || p.at<m.start || p.at>=m.start+m.active))cell+=6*segments;
    angle=(denim?.03:.018)*Math.sin(local*Math.PI*2);
  }else if(p.attack!=null){
    return false;
  }else if(p.y>0 || p.takeoff>0 || p.landing>0){
    cell=p.takeoff>0?6:p.landing>0?9:p.vy>4?7:p.vy< -4?8:4;
  }else if(p.tumble){
    const frame=Math.min(3,Math.floor(p.tumble.elapsed/p.tumble.duration*4));
    cell=10+frame;

  }else if(denim && (p.crouch || p.guardStun)){
    cell=6;
  }else if(denim && !(Math.abs(p.walk)>.05 && Math.abs(p.vx)>.1)){
    castGuard(g,p,x,y,zoom);return true;
  }else return false;
  if(!castTile(g,name,cell,cols,x,y,zoom,p.dir,angle))castGuard(g,p,x,y,zoom);
  return true;
}

const quickStage=document.querySelector('#quickstage select');
stageNames.forEach((name,id)=>quickStage.add(new Option(name,String(id))));
quickStage.onchange=()=>RODAStageBrowser.select(Number(quickStage.value));
function refreshFighterCard(){
  const img=document.querySelector('#fullcard img'), home=profiles[pick].home;
  img.src=cardUrl(pick);img.alt=profiles[pick].name+' character portrait';
  document.querySelector('#fullcard figcaption').textContent=profiles[pick].name+' · '+home+(pick===18?' · Born 1568':'');
  quickStage.value=String(stageChoice);
  quickStage.parentElement.hidden=!['cpu','watch','local','training'].includes(mode);
}
refreshFighterCard();
const winsByFighter=(()=>{
  try{return JSON.parse(localStorage.getItem('roda-winner-counts')||'{}')||{};}
  catch{return {};}
})();
const showBoutResults=showResults;
showResults=function(){
  const id=players[matchWinner]?.id;
  if(id!=null){
    winsByFighter[id]=(Number(winsByFighter[id])||0)+1;
    try{localStorage.setItem('roda-winner-counts',JSON.stringify(winsByFighter));}catch{}
  }
  const outcome=showBoutResults.apply(this,arguments);
  if(scene==='result'){
    for(const [canvas,player] of [['winnerportrait',players[matchWinner]],['loserportrait',players[1-matchWinner]]]){
      if(!player)continue;
      const c=document.getElementById(canvas);
      let img=c.parentElement.querySelector('.result-art');
      if(!img){img=new Image();img.className='result-art';c.after(img);}
      c.hidden=true;img.src=cardUrl(player.id);img.alt=profiles[player.id].name;
    }
  }
  return outcome;
};
const hallButton=document.createElement('button');
hallButton.id='open-winners';hallButton.type='button';hallButton.textContent='Winners’ circle · R3';
document.getElementById('choose').after(hallButton);
hallButton.onclick=()=>{
  const list=document.getElementById('winner-list');list.replaceChildren();
  const ids=Object.keys(winsByFighter).map(Number).filter(id=>profiles[id]&&winsByFighter[id]>0)
    .sort((a,b)=>winsByFighter[b]-winsByFighter[a]);
  if(!ids.length)list.textContent='Finish a match to see its winner here.';
  for(const id of ids){
    const card=document.createElement('figure'),img=new Image(),cap=document.createElement('figcaption');
    img.src=cardUrl(id);img.alt=profiles[id].name;
    cap.textContent=profiles[id].name+' · '+winsByFighter[id]+(winsByFighter[id]===1?' win':' wins');
    card.append(img,cap);list.append(card);
  }
  scene='winners';show('winners');document.getElementById('close-winners').focus();
};
document.getElementById('close-winners').onclick=returnToMenu;
function prepareCastBout(ids){
  for(const id of ids){
    if(id===7)continue;
    castImage('motion-'+id);
    if([11,12,13,18].includes(id))castImage('attack-'+id);
  }
}
