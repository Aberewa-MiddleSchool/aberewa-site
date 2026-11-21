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
const outfitKey='roda-alternate-outfits-v1';
const alternateOutfits=(()=>{try{return new Set(JSON.parse(localStorage.getItem(outfitKey)||'[]').map(Number));}catch{return new Set();}})();
window.rodaAlternateOutfit=id=>alternateOutfits.has(Number(id));
const cardUrl = id => new URL('card-' + id + (window.rodaAlternateOutfit(id)?'-alt':'') + '.webp', castRoot).href;
const dalvaChains=[
  ['bencao','rasteira'],['frente','chapa'],['costas','bencao'],['chapa','martelo'],
  ['au','rasteira','frente'],['costas','au','chapa']
];
characterMoves[18]=characterMoves[18].map((old,slot)=>{
  const keys=dalvaChains[slot],frames=18,total=old.phases.reduce((sum,p)=>sum+p.damage,0);
  const phases=keys.map((key,index)=>({...techniqueBook[key],key,frames,range:1.2*old.range*techniqueBook[key].reach,
    damage:total/keys.length,rank:old.rank,travel:0,contactStart:8,contactEnd:13,
    push:index===keys.length-1?4:0,knockdown:index===keys.length-1&&(slot>=4||key==='rasteira')}));
  const name=phases.map(p=>p.name).join(' → ');
  return {...old,name,signature:name,start:9,active:frames*keys.length,end:13,phases};
});

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
  if(Math.abs(axis)<.25)p.travelHeld=false;
  if(available && !p.tumble && !p.travelHeld && Math.abs(axis)>.4){
    p.tumble={axis:Math.sign(axis),elapsed:0,duration:30,startX:p.x};
    p.travelHeld=true;
  }
  if(p.tumble){
    const roll=p.tumble;
    roll.elapsed=Math.min(roll.duration,roll.elapsed+dt);
    const t=roll.elapsed/roll.duration;
    const forward=roll.axis*facing>0;
    p.vx=0;
    const result=simulateFighter(p,op,{...input,x:0},dt);
    if(p.attack===null && !p.down && !p.stun){
      const target=roll.startX+roll.axis*(forward?110:126)*t*t*(3-2*t);
      p.x=clamp(forward?(facing>0?Math.min(target,Math.max(roll.startX,op.x-100)):Math.max(target,Math.min(roll.startX,op.x+100))):target,100,1180);
      p.vx=0;
    }
    if(t===1||p.attack!==null||p.down||p.stun)p.tumble=null;
    return result;
  }
  if(p.travelHeld && Math.abs(axis)>.4)input={...input,x:0};
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
// One fixed-size whole-body cell contains both the shirt and its printed emblem.
const shirtSheets=['bento','caio','nestor'];
function studioFrame(g,name,cell,x,y,zoom,dir){
  const image=castImage(name);
  if(!image.naturalWidth)return;
  g.save();g.translate(x,y);g.scale((dir||1)*zoom,zoom);
  g.drawImage(image,cell%4*360,Math.floor(cell/4)*360,360,360,-180,-347,360,360);
  g.restore();
}
const shirtKicks={bencao:4,rasteira:5,frente:6,costas:7,chapa:8,martelo:9,au:10,
  armada:7,lowpush:5,lowsweep:5,lowback:7,lowswitch:5};
function shirtFrame(p){
  const age=Math.max(0,tick-(p.hitAt??tick));
  if(p.victory||(!p.preview&&endWait>0&&players[matchWinner]===p))return 15;
  if(p.down>0||p.hp<=0)return p.hp>0&&p.down<7?3:age<6?12:age<14?13:14;
  if(p.block)return p.crouch?3:2;
  if(p.stun>0&&!p.guardStun)return 12;
  if(p.attack!=null){
    const m=moveFor(p,p.attack);
    if(p.at<m.start)return 3;
    if(p.at>=m.start+m.active)return 0;
    const phase=attackPhase(m,p.at);
    if(phase.phaseFrame>=(phase.contactEnd??7))return phase.level==='low'?3:2;
    return shirtKicks[phase.key]??4;
  }
  if(p.tumble)return [3,11,10,11,3][Math.min(4,Math.floor(p.tumble.elapsed/p.tumble.duration*5))];
  if(p.takeoff>0||p.landing>0||p.crouch)return 3;
  if(p.y>0)return p.vy>0?9:2;
  if(Math.abs(p.walk)>.05&&Math.abs(p.vx)>.1)return [0,1,2,1][Math.floor(Math.abs(p.ginga)/16)%4];
  return 0;
}


// The sheet and cell identify the illustrated contact for each variation.
const mareChains=[
  [['frente','Meia-lua curta',1],['rasteira','Rasteira por dentro',2],['bencao','Bênção recolhida',12],['costas','Meia-lua apoiada',14]],
  [['chapa','Chapa diagonal',4],['martelo','Martelo à cintura',5],['costas','Meia-lua de costas',6],['frente','Meia-lua ascendente',13]],
  [['rasteira','Rasteira cruzada',8],['armada','Armada lateral',9],['rasteira','Rasteira comprida',10],['chapa','Chapa de frente',11]],
  [['rasteira','Rasteira de chão',0],['bencao','Bênção oblíqua',1],['frente','Meia-lua por dentro',2],['martelo','Martelo alto',12]],
  [['costas','Coice em recuo',4],['au','Aú de uma mão',5],['chapa','Chapa baixa',6],['costas','Meia-lua de compasso',13]],
  [['frente','Meia-lua por fora',8],['bencao','Bênção longa',9],['rasteira','Rasteira de gancho',10],['au','Aú aberto',14]]
];
characterMoves[14]=characterMoves[14].map((base,slot)=>{
  const damage=base.phases.reduce((sum,p)=>sum+p.damage,0);
  const phases=mareChains[slot].map(([key,name,cell],i)=>{
    const tech=techniqueBook[key],frames=16+(slot+i)%3;
    return {...tech,key,name,cell,frames,range:base.range*tech.reach,rank:base.rank,travel:0,
      contactStart:5,contactEnd:10,damage:damage/4,push:i===3?4:0,knockdown:i===3};
  });
  return {...base,phases,start:8,active:phases.reduce((n,p)=>n+p.frames,0),end:15};
});
function mareFrame(g,p,x,y,zoom){
  if(p.victory||(!p.preview&&endWait>0&&players[matchWinner]===p)||p.hp<=0||p.down>0||
     p.stun>0||p.tumble||p.takeoff>0||p.landing>0||p.y>0||p.crouch&&p.attack==null)return false;
  if(p.attack==null&&Math.abs(p.vx)>.1)return false;
  const baseSheet=p.attack>=3?'mare1':'mare0';
  const selectedSheet=baseSheet+(window.rodaAlternateOutfit(14)?'-alt':'');
  const sheet=castImage(selectedSheet).naturalWidth?selectedSheet:baseSheet;
  let cell=p.block?(p.crouch?9:7):3;
  if(p.attack!=null){
    const m=moveFor(p,p.attack);
    if(p.at>=m.start&&p.at<m.start+m.active){
      const phase=attackPhase(m,p.at);
      cell=phase.phaseFrame<phase.contactStart?7:phase.phaseFrame<phase.contactEnd+2?
        phase.cell:15;
    }
  }
  studioFrame(g,sheet,cell,x,y,zoom,p.dir);return true;
}

// Aisha's whole-body drawings share a single scale and floor line.
const aishaContacts={bencao:4,frente:5,chapa:4,martelo:5,rasteira:6,costas:13,au:9};
function aishaFrame(p){
  if(p.victory || (!p.preview && endWait>0 && players[matchWinner]===p))return 15;
  if(p.down>0 || p.hp<=0)return tick-p.hitAt<8?7:14;
  if(p.stun>0 && !p.guardStun)return 7;
  if(p.block)return p.crouch?2:1;
  if(p.attack!=null){
    const m=moveFor(p,p.attack);
    if(p.at<m.start)return 2;
    if(p.at>=m.start+m.active)return 1;
    const phase=attackPhase(m,p.at), t=phase.phaseFrame/phase.frames;
    const key=phase.key;
    if(key==='au')return t<.22?8:t<.66?9:t<.86?10:11;
    if(t<.17)return key==='costas'?12:2;
    if(t<.68)return aishaContacts[key]??4;
    return key==='costas'||key==='rasteira'?11:1;
  }
  if(p.tumble)return (p.tumble.axis*p.dir>0?[2,8,9,10,11]:[2,10,9,8,11])[Math.min(4,Math.floor(p.tumble.elapsed/p.tumble.duration*5))];
  if(p.y>0)return 3;
  if(p.takeoff>0||p.landing>0||p.crouch)return 2;
  if(Math.abs(p.vx)>.1)return [0,1,2,1][Math.floor(Math.abs(p.ginga)/14)%4];
  return 0;
}

const tuckRegistration={"19":[111.5,148.5,[62,55,46,38,40,40,38,40,49,57,63,64,64,60,54,46,38,39,38,44,55,62,67,67]],"8":[111.5,146.5,[64,61,56,47,37,40,42,41,43,51,59,63,66,66,65,63,58,50,43,40,44,54,61,65]],"12":[111.5,159.5,[52,50,45,38,37,38,40,42,43,49,53,54,52,50,45,37,37,40,42,41,37,40,46,50]],"4":[111.5,140.0,[71,68,60,51,49,46,48,49,52,60,66,68,72,73,71,65,57,45,50,51,49,56,64,69]],"10":[111.5,153.5,[58,56,51,43,37,39,42,43,42,40,48,54,58,63,64,60,54,50,44,36,37,44,52,56]],"5":[112.0,151.5,[60,58,53,46,35,38,39,38,40,46,53,57,60,62,61,59,56,48,40,35,39,48,55,59]],"6":[111.5,149.5,[62,58,53,45,35,37,38,39,48,55,60,62,62,60,55,47,38,39,40,41,43,52,59,62]],"1":[111.5,138.0,[73,70,63,53,50,48,48,46,51,56,66,71,74,76,75,72,68,59,50,50,49,58,67,72]],"11":[112.0,153.0,[58,57,51,43,40,44,50,54,55,54,59,61,59,54,51,49,50,52,51,47,41,46,53,57]],"3":[111.5,145.5,[66,62,56,48,45,43,44,43,51,59,64,67,66,64,60,53,44,41,44,47,46,53,61,65]],"17":[111.5,154.0,[57,52,46,37,35,35,34,37,43,51,56,59,58,55,49,40,36,37,36,33,43,51,56,58]],"20":[112.0,151.0,[60,59,54,46,39,40,38,37,47,55,61,63,61,61,58,51,42,36,39,41,44,53,59,62]],"9":[112.0,153.0,[58,57,54,48,43,48,50,50,51,57,60,60,59,55,52,52,52,52,51,47,40,42,50,56]],"18":[112.0,146.5,[64,58,49,38,40,40,43,46,52,60,66,67,66,62,55,46,45,46,44,43,54,63,67,68]],"16":[112.0,147.0,[64,58,50,40,39,38,37,40,44,52,60,64,65,62,57,47,38,39,38,41,51,59,65,66]],"2":[111.5,153.0,[58,55,49,39,35,34,36,38,42,49,53,56,59,59,56,49,40,36,38,37,41,49,56,58]],"13":[111.5,150.5,[60,59,53,45,43,45,50,53,52,55,61,63,62,57,51,49,50,51,50,48,42,47,55,60]],"14":[111.5,153.5,[58,55,50,42,37,42,46,49,50,55,60,61,58,55,48,45,46,48,48,45,40,45,52,57]],"0":[111.5,148.0,[63,60,53,46,44,41,42,47,56,61,66,66,64,60,54,46,37,40,42,42,44,53,60,63]]};
function drawTuckedRoll(g,p,x,y,zoom){
 const sheet=castImage('motion-'+p.id), reg=tuckRegistration[p.id];
 if(!reg || !sheet.naturalWidth)return false;
 const progress=Math.min(1,p.tumble.elapsed/p.tumble.duration);
 if(progress<.12 || progress>.88)return castTile(g,'motion-'+p.id,9,6,x,y,zoom,p.dir);
 const phase=(progress-.12)/.76;
 const direction=p.tumble.axis*p.dir>0?1:-1;
 const turn=(direction*phase+1)%1;
 const frame=turn*24, i=Math.floor(frame), mix=frame-i;
 const floor=reg[2][i]*(1-mix)+reg[2][(i+1)%24]*mix;
 const scale=342*zoom/224;
 g.save();g.translate(x,y-floor*scale);g.scale(p.dir*scale,scale);g.rotate(turn*Math.PI*2);
 g.drawImage(sheet,896,0,224,224,-reg[0],-reg[1],224,224);g.restore();return true;
}
function drawHomeGinga(g,p,x,y,zoom){
 if(p.id===7 || p.id===21 || (p.id===14 && window.rodaAlternateOutfit(14)))return false;
 const phase=Math.floor((p.preview?p.ginga:tick)/14);
 const data=gingaV26[p.id],sheet=gingaImagesV26[p.id];
 if(data && sheet?.naturalWidth && p.id<=10){
   const frames=data.rects, rect=frames[phase%frames.length], scale=285*zoom/gingaStanceHeights[p.id];
   g.save();g.translate(x,y);g.scale(p.dir,1);g.drawImage(sheet,...rect,-160*scale,-300*scale,320*scale,320*scale);g.restore();return true;
 }
 let art=stepSheets.get(p.id);
 if(!art){art=new Image();art.src=new URL('steps/'+p.id+'.webp',costumeRoot);stepSheets.set(p.id,art);}
 if(!art.naturalWidth)return false;
 const rig=rodaRigs[p.id], frame=phase%12, scale=rig.scale*zoom*285/270;
 g.save();g.translate(x,y);g.scale(scale*p.dir,scale);
 g.drawImage(art,frame%6*320,Math.floor(frame/6)*320,320,320,-rig.points[0][0],-rig.points[0][1]-rig.floor,320,320);g.restore();return true;
}
function drawCastState(g,p,x,y,zoom) {
 const upright=p.hp>0 && !p.down && !p.stun && !p.victory && (p.preview || !endWait) && p.attack==null && !p.y && !p.takeoff && !p.landing;
 if(upright && p.tumble && drawTuckedRoll(g,p,x,y,zoom))return true;
 if(upright && !p.tumble && !p.crouch && !p.block && drawHomeGinga(g,p,x,y,zoom))return true;
  if(p.id===21){studioFrame(g,'aisha',aishaFrame(p),x,y,zoom,p.dir);return true;}
  if(p.id===7){Meilin.draw(g,p,x,y,zoom);return true;}
  const id=p.id,special=id===18;
  if(id>=11 && id<=13){studioFrame(g,shirtSheets[id-11],shirtFrame(p),x,y,zoom,p.dir);return true;}
  if(id===14 && mareFrame(g,p,x,y,zoom))return true;
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
  }else if(p.block && special){
    cell=p.crouch?9:0;
  }else if(p.attack!=null && special){
    const m=moveFor(p,p.attack);
    const phase=attackPhase(m,p.at);
    const attackRows={bencao:0,rasteira:1,frente:2,costas:3,chapa:4,martelo:4,au:5};
    let frame=0;
    if(p.at>=m.start && p.at<m.start+m.active){
      if(phase.phaseFrame<phase.contactStart)frame=phase.phaseFrame<4?1:2;
      else frame=phase.phaseFrame<phase.contactEnd?3:4;
    }else if(p.at>=m.start+m.active)frame=5;
    name='attack-'+id;cell=attackRows[phase.key]*6+frame;
  }else if(p.attack!=null){
    return false;
  }else if(p.y>0 || p.takeoff>0 || p.landing>0){
    cell=p.takeoff>0?6:p.landing>0?9:p.vy>4?7:p.vy< -4?8:4;
  }else if(p.tumble && special){
    const frame=Math.min(3,Math.floor(p.tumble.elapsed/p.tumble.duration*4));
    const forward=p.tumble.axis*(p.dir||1)>0;
    cell=(forward?[9,11,12,13]:[9,12,11,13])[frame];
  }else if(p.tumble){
    const frame=Math.min(3,Math.floor(p.tumble.elapsed/p.tumble.duration*4));
    cell=10+frame;
  }else if(special){
    cell=p.crouch?9:Math.abs(p.vx)>.1?[0,3,0,3][Math.floor(Math.abs(p.ginga)/14)%4]:0;
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
  document.querySelector('#fullcard figcaption').textContent=profiles[pick].name+' · '+home+(pick===18?' · Born 1568':'')+(window.rodaAlternateOutfit(pick)?' · Alternate outfit':'');
  const wardrobe=document.getElementById('altcostume');
  wardrobe.hidden=pick!==7&&pick!==14;
  wardrobe.textContent=window.rodaAlternateOutfit(pick)?'OUTFIT: ALTERNATE · SWITCH (X)':'OUTFIT: ORIGINAL · SWITCH (X)';
  document.querySelectorAll('.fightercard[data-fighter="7"] img,.fightercard[data-fighter="14"] img').forEach(image=>{
    const id=Number(image.closest('.fightercard').dataset.fighter);image.src=cardUrl(id);
  });
  quickStage.value=String(stageChoice);
  quickStage.parentElement.hidden=!['cpu','watch','local','training'].includes(mode);
}
refreshFighterCard();
document.getElementById('altcostume').onclick=()=>{
  if(pick!==7&&pick!==14)return;
  if(alternateOutfits.has(pick))alternateOutfits.delete(pick);else alternateOutfits.add(pick);
  try{localStorage.setItem(outfitKey,JSON.stringify([...alternateOutfits]));}catch{}
  refreshFighterCard();
};
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
    if(id===21){castImage('aisha');continue;}
    if(id===7)continue;
    if(id>=11 && id<=13){castImage(shirtSheets[id-11]);continue;}
    if(id===14){castImage('mare0');castImage('mare1');if(window.rodaAlternateOutfit(14)){castImage('mare0-alt');castImage('mare1-alt');}}
    castImage('motion-'+id);
    if(id===18)castImage('attack-'+id);
  }
}
