// The boss keeps his saved ID. Display order is shared by cards and controller input.
const playableIds = [...Array(15).keys(),16,17,18,19,20,21];
const homeArena=[0,5,8,4,3,6,9,19,7,2,15,27,17,10,18,21,22,23,24,25,26,28];
const newPlayers = [
  ['Tainá Reis','Salvador, Bahia','Patient sweeping counters','#227c77','The rhythm gave me time.',.98],
  ['Luzia Santos','Recife, Pernambuco','Fast combinations from close range','#bb5438','There was my opening.',1.07],
  ['Dalva Brito','Recôncavo da Bahia, Bahia','Low entries and turning kicks','#555688','I heard the change in the beat.',1.11],
  ['Neide Cruz','Belo Horizonte, Minas Gerais','Compact footwork and quick returns','#dda436','There is always another answer.',.94],
  ['Marília Nascimento','Rio de Janeiro, Rio de Janeiro','Measured pressure and lateral kicks','#884b79','I saved that turn for the last exchange.',1.12],
  ['Aisha','Salvador, Bahia','Sentinel of 2323 · Inverted kicks','#39d8d1','My reflection never made me work for that opening.',1.0]
];
const costumeRoot = new URL('.',document.currentScript.src);
const costumes = rodaRigs.map((_,id) => {
  const art = new Image();
  art.src = new URL(id+'.webp'+(id>=11&&id<=13?'?v=skull':''),costumeRoot);
  return art;
});

function installFighterKits() {
  newPlayers.forEach(([name,home,style,accent,win,build],i) => {
    roster.push([name,style]);
    profiles.push({name,home,personality:style,win,lose:'I’ll be back in the circle.',pitch:165+i*9});
    fighterTraits.push({...fighterTraits[[0,6,3,4,11,4][i]],build,style,accent});
    characterMoves.push(moves.map(m=>({...m,phases:[m]})));
  });
  fighterTraits[14].build = .76;
  const chains = [
    ['bencao','frente','rasteira'], ['rasteira','bencao','costas'],
    ['frente','chapa','bencao'], ['costas','frente','rasteira'],
    ['chapa','martelo','costas'], ['bencao','au','rasteira']
  ];
  const sentinelChains=[
    ['bencao','frente','chapa'], ['rasteira','costas','rasteira'],
    ['frente','martelo','bencao'], ['chapa','costas','martelo'],
    ['au','costas','frente'], ['rasteira','au','chapa']
  ];
  for (const kit of characterMoves.slice(16)) {
    const sentinel=kit===characterMoves[21];
    kit.forEach((base,button) => {
      const chain=(sentinel?sentinelChains:chains)[button], frames=16;
      const total=(base.phases||[base]).reduce((sum,phase)=>sum+phase.damage,0);
      const phases=chain.map((key,i)=>({...techniqueBook[key],key,frames,
        range:base.range*techniqueBook[key].reach,damage:total*[.28,.32,.40][i],
        rank:base.rank,push:i===2?3:0,knockdown:i===2 && (button>=4||key==='rasteira')}));
      if(sentinel)for(const phase of phases){phase.contactStart=4;phase.contactEnd=10;}
      const name=chain.map(key=>techniqueBook[key].name).join(' → ');
      kit[button]={...base,...phases[0],phases,active:3*frames,name,signature:name};
    });
  }
}

const actionSheets=costumes.map((_,id)=>{
  if(id<16)return null;
  const image=new Image();
  image.src=new URL('actions/'+id+'.webp',costumeRoot);
  return image;
});
const actionCells=[[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,24,24,25,25,25,25,26,26,26,26],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,24,24,25,25,25,25,26,26,26,26],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,24,24,25,25,25,25,26,26,26,26],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,24,24,25,25,25,25,26,26,26,26],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,24,24,25,25,25,25,26,26,26,26],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,24,24,25,25,25,25,26,26,26,26],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,24,24,25,25,25,25,26,26,26,26],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,24,24,25,25,25,25,26,26,26,26],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,24,24,25,25,25,25,26,26,26,26],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,24,24,25,25,25,25,26,26,26,26],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,24,24,25,25,25,25,26,26,26,26],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,24,24,25,25,25,25,26,26,26,26],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,24,24,25,25,25,25,26,26,26,26],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,24,24,25,25,25,25,26,26,26,26],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,24,24,25,25,25,25,26,26,26,26],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,24,24,25,25,25,25,26,26,26,26],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,24,24,25,25,25,25,26,26,26,26],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,24,24,25,25,25,25,26,26,26,26],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,24,24,25,25,25,25,26,26,26,26],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,24,24,25,25,25,25,26,26,26,26],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,24,24,24,25,25,25,25,26,26,26,26]];
const inversionSheet=new Image();
inversionSheet.src=new URL('actions/inversions.webp',costumeRoot);
function paintInversion(g,p,phase){
  const id=p.id;
  if(id>=16){
    g.drawImage(inversionSheet,(id-16)*225,0,225,185,-149,-241,298,245);
    return;
  }
  if(combatData[id]){
    const table=combatKeys[id],button=table.findIndex(keys=>keys.includes('au'));
    const n=(button+2)*8+combatContacts[id][button][table[button].indexOf('au')];
    const f=185/combatData[id].stanceHeight;
    g.drawImage(combatImages[id],n%8*320,Math.floor(n/8)*320,320,320,-160*f,-300*f,320*f,320*f);
    return;
  }
  const group=Math.floor(id/5),rects=spriteBounds['transitions-'+(group+1)+'.webp'];
  const n=id%5*8, r=rects[n+(phase.phaseFrame<9?6:7)];
  const scale=185/rects[n][3];
  g.drawImage(transitionImages[group],...r,-r[2]*scale/2,-r[3]*scale,r[2]*scale,r[3]*scale);
}
const kickRows=['bencao','rasteira','frente','costas','chapa','martelo'];
// Extension and recoil frames are illustrated separately for each fighter.
// These holds affect presentation only. The three contacts use the shared game clock.
const kickHolds=[
  [6,11],[3,8],[8,12],[6,14],[3,7],[7,13],[4,9],
  [5,12],[4,10],[7,12],[8,14],[7,14],[3,9],[6,10],
  [5,9],[8,13],[8,15],[3,8],[6,13],[4,8],[7,11]
];
function paintFighter(g,p,x,y,zoom=1,card=false) {
  if(!card && window.drawCastState && drawCastState(g,p,x,y,zoom*.68))return;
  if(p.id<16 && !card){
    const prior=ctx;ctx=g;g.save();
    try{
      g.translate(x,y);g.scale(.70*zoom,.70*zoom);g.translate(-640,-590);
      drawFighter({...fighter(p.id,640,p.dir||1),...p,x:640,y:0});
    }finally{g.restore();ctx=prior;}
    return;
  }
  const id=p.id, rig=rodaRigs[id], guard=costumes[id];
  if(!rig || !guard?.naturalWidth)return;
  let row=-1,frame=0,attackPhaseInfo;
  if(!card){
    if(p.victory)row=7;
    else if(p.hp<=0 || p.down>0)row=8;
    else if(p.attack!=null){
      const move=moveFor(p,p.attack),phase=attackPhase(move,p.at);
      attackPhaseInfo=phase;
      row=kickRows.indexOf(phase.key);
      if(p.at<move.start)frame=0;
      else if(p.at>=move.start+move.active)frame=3;
      else{
        const [hold,recoil]=kickHolds[id];
        frame=phase.phaseFrame<hold?1:phase.phaseFrame<recoil?2:
          phase.phaseFrame<phase.frames-2?3:0;
        if(frame===0 && phase.phase<2)row=kickRows.indexOf(move.phases[phase.phase+1].key);
      }
    }else if(p.crouch || p.takeoff>0 || p.landing>0)row=6;
  }
  g.save();g.translate(x,y);
  g.scale((p.dir||1)*fighterTraits[id].build*zoom,zoom);

  if(attackPhaseInfo && p.attack===5 && flipData[id] && flipImages[id].naturalWidth){
    const m=moveFor(p,5),phase=attackPhaseInfo;
    const n=p.at<m.start?0:p.at>=m.start+m.active?7:1+phase.phase*2+(phase.phaseFrame>=kickHolds[id][0]?1:0);
    const f=185/flipData[id].stanceHeight;
    g.drawImage(flipImages[id],n%8*320,Math.floor(n/8)*320,320,320,-160*f,-300*f,320*f,320*f);
  }else if(attackPhaseInfo?.key==='au'){
    paintInversion(g,p,attackPhaseInfo);
  }else if(row>=0 && actionSheets[id].naturalWidth){
    const cell=actionCells[id][row*4+frame];
    g.drawImage(actionSheets[id],cell%4*200,Math.floor(cell/4)*140,200,140,-175,-240,350,245);
  }else{
    const scale=rig.scale*(card?1:(285/1.49)/270);
    g.scale(scale,scale);
    g.drawImage(guard,-rig.points[0][0],-rig.points[0][1]-rig.floor);
  }
  g.restore();
}
function paintedCard(canvas,id,defeat=false) {
  if(id<15){facePortrait(canvas,id);return;}
  if(id===15){portrait(canvas,id,defeat);return;}
  const g=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  const backdrop=g.createLinearGradient(0,0,w,h);
  backdrop.addColorStop(0,defeat?'#414345':fighterTraits[id].accent);
  backdrop.addColorStop(.63,'#26342e');backdrop.addColorStop(1,'#101916');
  g.fillStyle=backdrop;g.fillRect(0,0,w,h);
  paintFighter(g,{id,dir:1},w*.45,h*2.16,h/125,true);
}

// Both soles follow the signed distance of travel. Each half-cycle plants one
// foot and lifts the other. Reversing direction plays the same steps backward.
const stepSheets = new Map();
function drawTravelStep(p) {
  let sheet = stepSheets.get(p.id);
  if (!sheet) {
    sheet = new Image();
    sheet.src = new URL('steps/' + p.id + '.webp'+(p.id>=11&&p.id<=13?'?v=skull':''), costumeRoot);
    stepSheets.set(p.id, sheet);
  }
  const guard = costumes[p.id];
  const source = sheet.naturalWidth ? sheet : guard;
  if (!source.naturalWidth) return;
  const rig = rodaRigs[p.id];
  const width = p.id < 16 ? 1 : fighterTraits[p.id].build;
  const signedDistance = p.ginga / fighterTraits[p.id].build;
  const phase = ((signedDistance % 68) + 68) % 68;
  const frame = source === sheet ? Math.floor(phase * 12 / 68) : 0;
  const scale = rig.scale * (285 / 270);
  ctx.save();
  ctx.translate(p.x, 590 - p.y);
  ctx.scale(p.dir * width * scale, scale);
  ctx.drawImage(source, frame % 6 * 320, Math.floor(frame / 6) * 320, 320, 320,
    -rig.points[0][0], -rig.points[0][1] - rig.floor, 320, 320);
  ctx.restore();
}
