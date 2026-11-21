'use strict';
const castRoot = new URL('cast/', document.currentScript.src);
const castImages = new Map();
const juremaMotionSheet = new Image();
juremaMotionSheet.src = new URL('jurema-moves.webp', castRoot);
const juremaChristmasMotionSheet = new Image();
juremaChristmasMotionSheet.src = new URL('jurema-moves-christmas.webp', castRoot);
const juremaTravelSheet = new Image();
juremaTravelSheet.src = new URL('jurema-travel.webp', castRoot);
const juremaChristmasTravelSheet = new Image();
juremaChristmasTravelSheet.src = new URL('jurema-travel-christmas.webp', castRoot);
const juremaActionSheet = new Image();
juremaActionSheet.src = new URL('jurema-actions.webp', castRoot);
const juremaChristmasActionSheet = new Image();
juremaChristmasActionSheet.src = new URL('jurema-actions-christmas.webp', castRoot);
const juremaGingaSheet = new Image();
juremaGingaSheet.src = new URL('jurema-ginga.webp', castRoot);
const dalvaBowVariantImages=['dalva-bow.webp','dalva-bow-traveler.webp','dalva-bow-ceremonial.webp'].map(name=>{const image=new Image();image.src=new URL(name,castRoot);return image;});
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
alternateOutfits.delete(1);
const dalvaOutfitKey='roda-dalva-outfit-v1';
let dalvaOutfit=(()=>{try{return Math.max(0,Math.min(2,Number(localStorage.getItem(dalvaOutfitKey))||0));}catch{return 0;}})();
window.rodaDalvaOutfit=()=>dalvaOutfit;
window.rodaAlternateOutfit=id=>Number(id)===18?dalvaOutfit>0:alternateOutfits.has(Number(id));
const dalvaMotionName=()=>dalvaOutfit===1?'motion-18-traveler':dalvaOutfit===2?'motion-18-ceremonial':'motion-18';
const dalvaAttackName=()=>dalvaOutfit===1?'attack-18-traveler':dalvaOutfit===2?'attack-18-ceremonial':'attack-18';
const cardUrl = id => new URL('card-' + id + (id===18&&dalvaOutfit===1?'-traveler':id===18&&dalvaOutfit===2?'-ceremonial':([7,14,22].includes(Number(id))&&window.rodaAlternateOutfit(id)?'-alt':'')) + '.webp' + (id===22?'?v=jurema-new-slot-2':''), castRoot).href;
window.rodaCardUrl=cardUrl;
const dalvaChains=[
  ['bencao','rasteira'],['frente','chapa'],['costas','bencao'],['chapa','martelo'],
  ['au','rasteira','frente'],['costas','au','chapa']
];
characterMoves[18]=characterMoves[18].map((old,slot)=>{
  const keys=dalvaChains[slot],frames=18,total=old.phases.reduce((sum,p)=>sum+p.damage,0);
  const phases=keys.map((key,index)=>({...techniqueBook[key],key,frames,range:old.range*techniqueBook[key].reach,
    damage:total/keys.length,rank:old.rank,travel:0,contactStart:10,contactEnd:15,
    push:index===keys.length-1?4:0,knockdown:index===keys.length-1&&(slot>=4||key==='rasteira')}));
  const name=phases.map(p=>p.name).join(' → ');
  return {...old,name,signature:name,start:9,active:frames*keys.length,end:13,phases};
});
// Dalva is a long-range counter fighter; keep that advantage on every kick.
characterMoves[18].forEach(move=>move.phases.forEach(phase=>{phase.range=Math.round(phase.range*1.2)}));

// Shared hit timing follows each fighter's drawn extension/contact frame.
// Leave authored timing untouched; fill only phases that had no contact window.
characterMoves.forEach((kit,id)=>kit.forEach(move=>move.phases.forEach(phase=>{
  const frames=Math.max(1,phase.frames||move.active||12);
  if(phase.contactStart==null){
    if((id===14||id===15)&&phase.contactFrame!=null)phase.contactStart=phase.contactFrame;
    else if(id>=16&&id<=20&&kickHolds[id])phase.contactStart=kickHolds[id][0];
    else phase.contactStart=Math.floor(frames*.68);
  }
  if(phase.contactEnd==null){
    if(id>=16&&id<=20&&kickHolds[id])phase.contactEnd=Math.max(phase.contactStart+1,Math.min(frames,kickHolds[id][1]));
    else phase.contactEnd=frames;
  }
})));

// Fighters without a complete, authored two-way movement use a grounded
// forward or backward roll. One press starts one full roll.
const simulateFighter=updateFighter;
updateFighter=function(p,op,input,dt){
  if(p.id===7)return Meilin.update(p,op,input,dt,simulateFighter);
  if(p.id===22&&input?.y<-.6&&input.y>-.85)input={...input,y:0};
  const axis=input?.x||0;
  const facing=op.x>=p.x?1:-1;
  if(p.id===22){
    p.juremaFootGlow=Math.max(0,(p.juremaFootGlow||0)-dt);
    const canStart=p.hp>0&&!p.down&&!p.stun&&p.attack===null&&!p.y&&!p.takeoff&&!p.landing&&Math.abs(input?.y||0)<.5;
    const awayNow=axis*facing<-.4,forwardNow=axis*facing>.4;
    if(p.juremaTravel&&(p.down||p.stun||p.hp<=0||p.attack!==null))p.juremaTravel=null;
    if(canStart&&!p.juremaTravel&&awayNow&&tick>=(p.juremaTravelReadyAt||0)){
      p.juremaTravel={kind:'away',axis:Math.sign(axis),elapsed:0,duration:36,startX:p.x,distance:178};
      p.juremaTravelReadyAt=tick+55;p.block=false;p.crouch=false;
    }else if(canStart&&!p.juremaTravel&&forwardNow&&tick>=(p.juremaTravelReadyAt||0)){
      const distance=Math.min(132,Math.abs(op.x-p.x)-112);
      if(distance>0){p.juremaTravel={kind:'forward',axis:Math.sign(axis),elapsed:0,duration:36,startX:p.x,distance};p.juremaTravelReadyAt=tick+55;p.block=false;p.crouch=false;}
    }
    if(p.juremaTravel){
      const travel=p.juremaTravel;travel.elapsed+=dt;
      const progress=Math.min(1,travel.elapsed/travel.duration),eased=progress*progress*(3-2*progress);
      input={...input,x:0,y:0};p.block=false;p.crouch=false;p.vx=0;p.walk=0;
      p.x=Math.max(100,Math.min(1180,travel.startX+travel.axis*travel.distance*eased));
      const result=simulateFighter(p,op,input,dt);
      p.x=Math.max(100,Math.min(1180,travel.startX+travel.axis*travel.distance*eased));p.vx=0;
      if(progress>=1)p.juremaTravel=null;
      return result;
    }
    // Jurema relocates only through her green smoke step. A held direction
    // repeats that step after its recovery; it never falls through to walking.
    input={...input,x:0};p.walk=0;p.vx=0;
  }
  const rollFallback=![7,22].includes(p.id);
  const available=p.hp>0&&!p.down&&!p.stun&&p.attack===null&&
    !p.y&&!p.takeoff&&!p.landing&&Math.abs(input?.y||0)<.5;
  if(Math.abs(axis)<.25)p.movementLocked=false;
  if(!available&&p.tumble){p.tumble=null;p.vx=0;}
  if(rollFallback&&available&&!p.tumble&&!p.movementLocked&&Math.abs(axis)>.4){
    const forward=axis*facing>0,gap=Math.abs(op.x-p.x);
    const distance=forward?Math.max(42,Math.min(122,gap-112)):132;
    p.tumble={axis:Math.sign(axis),kind:p.id===21?(forward?'unique-forward':'backward-roll'):(forward?'forward-roll':'backward-roll'),elapsed:0,duration:38,startX:p.x,distance};
    p.movementLocked=true;p.block=false;p.crouch=false;
  }
  if(p.tumble){
    const roll=p.tumble;roll.elapsed+=dt;
    const progress=Math.min(1,roll.elapsed/roll.duration),eased=progress*progress*(3-2*progress);
    input={...input,x:0,y:0};p.block=false;p.crouch=false;p.vx=0;p.walk=0;
    const result=simulateFighter(p,op,input,dt);
    p.x=Math.max(100,Math.min(1180,roll.startX+roll.axis*roll.distance*eased));p.vx=0;
    if(progress>=1)p.tumble=null;
    return result;
  }
  // A completed roll is one deliberate movement. Keep held input from
  // falling back into the old sliding walk until the player releases it.
  if(rollFallback&&available&&p.movementLocked&&Math.abs(axis)>.4){
    input={...input,x:0};p.vx=0;p.walk=0;
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
  if(p.tumble)return (p.tumble.axis*p.dir>0?[3,11,10,11,3]:[3,10,11,10,3])[Math.min(4,Math.floor(p.tumble.elapsed/p.tumble.duration*5))];
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

function drawCastState(g,p,x,y,zoom) {
  if(p.id===22){
    const christmas=window.rodaAlternateOutfit(22);
    const reactions=christmas&&juremaChristmasMotionSheet.naturalWidth?juremaChristmasMotionSheet:juremaMotionSheet;
    const actions=christmas&&juremaChristmasActionSheet.naturalWidth?juremaChristmasActionSheet:juremaActionSheet;
    const travel=christmas&&juremaChristmasTravelSheet.naturalWidth?juremaChristmasTravelSheet:juremaTravelSheet;
    const ginga=christmas&&juremaChristmasActionSheet.naturalWidth?juremaChristmasActionSheet:juremaGingaSheet;
    if(actions.naturalWidth){
      const victorious=p.victory||(!p.preview&&endWait>0&&players[matchWinner]===p);
      const knockedDown=p.hp<=0||p.down>0;
      let cell=0,image=actions;
      if(victorious){p.victoryStart??=tick;cell=16+Math.min(3,Math.floor((tick-p.victoryStart)/10));image=reactions;}
      else if(knockedDown){const age=Math.max(0,tick-(p.hitAt??tick));cell=20+(p.hp>0&&p.down<12?3:Math.min(2,Math.floor(age/8)));image=reactions;}
      else if(p.juremaTravel&&travel.naturalWidth){const progress=Math.min(.999,p.juremaTravel.elapsed/p.juremaTravel.duration);cell=4+Math.floor(progress*4);image=travel;}
      else if(p.attack!==null){
        const move=moveFor(p,p.attack);
        if(p.at>=move.start&&p.at<move.start+move.active){
          const phase=attackPhase(move,p.at);
          const frame=Math.min(3,Math.floor(Math.min(.999,phase.phaseFrame/phase.frames)*4));
          cell=(move.juremaFrameRow??p.attack+1)*4+frame;
        }else{cell=0;image=ginga;}
      }else if(p.takeoff>0)cell=28;
      else if(p.y>0)cell=28+(p.vy>4?1:2);
      else if(p.landing>0)cell=31;
      else if(p.block){cell=3;image=reactions;}
      else if(p.crouch){cell=4;image=reactions;}
      else{cell=0;image=ginga;}
      const forward=!victorious&&!knockedDown&&!p.juremaTravel&&!p.block&&p.attack===null&&p.walk*p.dir>.1&&Math.abs(p.vx)>.1;
      if(forward&&travel.naturalWidth)image=travel;
      if(!image.naturalWidth){image=actions;cell=0;}
      const cellWidth=image.naturalWidth/4;
      const gingaRows=ginga===juremaGingaSheet?1:8;
      const rows=image===travel?2:image===ginga?gingaRows:image===actions?8:6;
      const cellHeight=image.naturalHeight/rows;
      const sx=(cell%4)*cellWidth,sy=Math.floor(cell/4)*cellHeight;
      g.save();g.translate(x,y);g.scale(p.dir||1,1);
      g.drawImage(image,sx,sy,cellWidth,cellHeight,-146*zoom,-305*zoom,292*zoom,305*zoom);
      g.restore();
      if(forward||p.juremaTravel)drawJuremaTravelSmoke(g,x,y,zoom,p,p.juremaTravel?.axis||p.dir);
      return true;
    }
    return true;
  }
  if(p.id===18&&(p.victory||(!p.preview&&endWait>0&&players[matchWinner]===p))){
    const bow=dalvaBowVariantImages[dalvaOutfit]||dalvaBowVariantImages[0];
    if(bow.complete&&bow.naturalWidth){
      const h=305*zoom,w=h*bow.naturalWidth/bow.naturalHeight;
      g.save();g.translate(x,y);g.drawImage(bow,-w/2,-h,w,h);g.restore();return true;
    }
  }
  if(p.id===21){studioFrame(g,'aisha',aishaFrame(p),x,y,zoom,p.dir);return true;}
  if(p.id===7){Meilin.draw(g,p,x,y,zoom);return true;}
  const id=p.id,special=id===18;
  if(id>=11 && id<=13){studioFrame(g,shirtSheets[id-11],shirtFrame(p),x,y,zoom,p.dir);return true;}
  if(id===14 && mareFrame(g,p,x,y,zoom))return true;
  let name=id===18?dalvaMotionName():'motion-'+id, cell,cols=6,angle=0;
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
    const phase=attackPhase(m,p.at),segments=6/m.phases.length;
    const local=Math.max(0,Math.min(.999,phase.phaseFrame/phase.frames));
    const index=Math.min(5,phase.phase*Math.ceil(segments)+Math.floor(local*segments));
    name=id===18?dalvaAttackName():'attack-'+id;cols=6;
    cell=p.attack*6+index;
    if(local<.28 || p.at<m.start || p.at>=m.start+m.active)cell+=36;
    angle=.014*Math.sin(local*Math.PI*2);
  }else if(p.attack!=null){
    return false;
  }else if(p.y>0 || p.takeoff>0 || p.landing>0){
    cell=p.takeoff>0?6:p.landing>0?9:p.vy>4?7:p.vy< -4?8:4;
  }else if(p.tumble){
    // Each whole-body drawing is registered to the same floor line.
    const forward=p.tumble.axis*(p.dir||1)>0;
    const cells=forward?[9,10,11,12,13,9]:[9,13,12,11,10,9];
    const frame=Math.min(cells.length-1,Math.floor(p.tumble.elapsed/p.tumble.duration*cells.length));
    cell=cells[frame];
  }else if(special){
    cell=p.crouch?9:Math.abs(p.vx)>.1?[0,8,0,8][Math.floor(Math.abs(p.ginga)/14)%4]:0;
  }else return false;
  if(!castTile(g,name,cell,cols,x,y,zoom,p.dir,angle))castGuard(g,p,x,y,zoom);
  return true;
}

function drawJuremaTravelSmoke(g,x,y,zoom,p,direction){
  const pulse=.72+.28*Math.sin(tick*.55);
  g.save();g.translate(x,y);g.scale(direction||p.dir||1,1);g.globalCompositeOperation='lighter';
  g.globalAlpha=.4*pulse;g.shadowColor='#53ff28';g.shadowBlur=18*zoom;
  g.strokeStyle='#71ff42';g.lineWidth=4*zoom;g.lineCap='round';
  for(let i=0;i<3;i++){
    const trail=-22-i*18-(tick%8)*1.2,offset=Math.sin((tick+i*5)*.4)*7;
    g.beginPath();g.moveTo(trail,-10*zoom+offset);g.quadraticCurveTo(trail-10*zoom,-24*zoom+offset,trail-22*zoom,-8*zoom+offset);g.stroke();
  }
  const glow=g.createRadialGradient(-22*zoom,-9*zoom,2*zoom,-22*zoom,-9*zoom,40*zoom);
  glow.addColorStop(0,'rgba(131,255,83,.5)');glow.addColorStop(.55,'rgba(76,255,37,.22)');glow.addColorStop(1,'rgba(48,255,24,0)');
  g.fillStyle=glow;g.beginPath();g.ellipse(-22*zoom,-9*zoom,40*zoom,15*zoom,0,0,Math.PI*2);g.fill();g.restore();
}

const quickStage=document.querySelector('#quickstage select');
stageNames.forEach((name,id)=>quickStage.add(new Option(name,String(id))));
quickStage.onchange=()=>RODAStageBrowser.select(Number(quickStage.value));
function refreshFighterCard(){
  const img=document.querySelector('#fullcard img'), home=profiles[pick].home;
  img.src=cardUrl(pick);img.alt=profiles[pick].name+' character portrait';
  const dalvaLabel=pick===18?['Original outfit','Traveler outfit','Ceremonial outfit'][dalvaOutfit]:'';
  document.querySelector('#fullcard figcaption').textContent=profiles[pick].name+' · '+home+(pick===18?' · Born 1568 · '+dalvaLabel:'')+(pick!==18&&window.rodaAlternateOutfit(pick)?' · Alternate outfit':'');
  const wardrobe=document.getElementById('altcostume');
  wardrobe.hidden=pick!==22&&pick!==7&&pick!==14&&pick!==18;
  wardrobe.textContent=pick===18?'OUTFIT: '+dalvaLabel.toUpperCase()+' · NEXT (X)':pick===22?(window.rodaAlternateOutfit(22)?'OUTFIT: CHRISTMAS · SWITCH (X)':'OUTFIT: ORIGINAL · SWITCH (X)'):(window.rodaAlternateOutfit(pick)?'OUTFIT: ALTERNATE · SWITCH (X)':'OUTFIT: ORIGINAL · SWITCH (X)');
  document.querySelectorAll('.fightercard img').forEach(image=>{
    const id=Number(image.closest('.fightercard').dataset.fighter);image.src=cardUrl(id);
  });
  quickStage.value=String(stageChoice);
  quickStage.parentElement.hidden=!['cpu','watch','local','training'].includes(mode);
}
refreshFighterCard();
document.getElementById('altcostume').onclick=()=>{
  if(pick===18){dalvaOutfit=(dalvaOutfit+1)%3;try{localStorage.setItem(dalvaOutfitKey,String(dalvaOutfit));}catch{}}
  else {if(pick!==22&&pick!==7&&pick!==14)return;if(alternateOutfits.has(pick))alternateOutfits.delete(pick);else alternateOutfits.add(pick);try{localStorage.setItem(outfitKey,JSON.stringify([...alternateOutfits]));}catch{}}
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
    castImage(id===18?dalvaMotionName():'motion-'+id);
    if(id===18)castImage(dalvaAttackName());
  }
}

window.addEventListener('keydown',event=>{if(event.key.toLowerCase()==='x'&&scene==='select'&&(pick===22||pick===7||pick===14||pick===18)){event.preventDefault();document.getElementById('altcostume')?.click();}});
