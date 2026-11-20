// The boss keeps his saved ID. Display order is shared by cards and controller input.
const playableIds = [...Array(15).keys(),16,17,18,19,20];
const homeArena=[0,5,8,4,3,6,9,19,7,2,15,27,17,10,18,21,22,23,24,25,26];
const newPlayers = [
  ['Tainá Reis','Salvador, Bahia','Patient sweeping counters','#227c77','The rhythm gave me time.',.98],
  ['Luzia Santos','Recife, Pernambuco','Fast combinations from close range','#bb5438','There was my opening.',1.07],
  ['Dalva Brito','Recôncavo da Bahia, Bahia','Low entries and turning kicks','#555688','I heard the change in the beat.',1.11],
  ['Neide Cruz','Belo Horizonte, Minas Gerais','Compact footwork and quick returns','#dda436','There is always another answer.',.94],
  ['Marília Nascimento','Rio de Janeiro, Rio de Janeiro','Measured pressure and lateral kicks','#884b79','I saved that turn for the last exchange.',1.12]
];
const costumeRoot = new URL('.',document.currentScript.src);
const costumes = rodaRigs.map((_,id) => {
  const art = new Image();
  art.src = new URL(id+'.webp',costumeRoot);
  return art;
});

function installFighterKits() {
  newPlayers.forEach(([name,home,style,accent,win,build],i) => {
    roster.push([name,style]);
    profiles.push({name,home,personality:style,win,lose:'I’ll be back in the circle.',pitch:165+i*9});
    fighterTraits.push({...fighterTraits[[0,6,3,4,11][i]],build,style,accent});
    characterMoves.push(moves.map(m=>({...m,phases:[m]})));
  });
  // Six different opening techniques per fighter. Rotating the two replies
  // gives each fighter a distinct set while keeping three distinct techniques in every chain.
  const keys=['bencao','rasteira','frente','costas','chapa','au','armada','martelo'];
  const used=new Set();
  for (const [id,kit] of characterMoves.entries()) {
    kit.forEach((base,button) => {
      const first=(button+id)%keys.length;
      const replies=keys.filter(k=>k!==keys[first]);
      const pairs=replies.flatMap(a=>replies.filter(b=>b!==a).map(b=>[a,b]));
      let index=(id*11+button*3)%pairs.length;
      let chain;
      do {
        chain=[keys[first],...pairs[index]];
        index=(index+1)%pairs.length;
      } while(used.has(chain.join('/')));
      used.add(chain.join('/'));
      const frames=10+(id+button)%4;
      const total=(base.phases||[base]).reduce((sum,phase)=>sum+phase.damage,0);
      const phases=chain.map((key,i)=>({...techniqueBook[key],key,frames,
        range:base.range*techniqueBook[key].reach,damage:total*[.28,.32,.40][i],
        rank:base.rank,push:i===2?3:0,knockdown:i===2 && (button>=4||key==='rasteira')}));
      const name=chain.map(key=>techniqueBook[key].name).join(' → ');
      kit[button]={...base,...phases[0],phases,active:3*frames,name,signature:name};
    });
  }
}

// Each angle rotates an original painted body part about its pivot. Neither
// the image scale nor the distance between joints depends on the attack.
const strikeAngles = {
  bencao:[-1.05,-1.74,.12,-.18,-.23,.25,-.18],
  rasteira:[-.38,-1.45,.61,-.53,.70,.32,.25],
  frente:[-1.74,-2.00,.04,-.20,-.30,-.42,.28],
  costas:[-2.14,-1.95,.35,-.4,.97,.65,-.35],
  chapa:[-1.48,-1.64,.12,-.28,-.64,-.64,.25],
  au:[-.96,-1.63,1.05,.55,2.72,-1.42,-1.35],
  armada:[-1.60,-2.28,.26,-.25,.57,-.82,-.43],
  martelo:[-1.85,-1.22,.18,-.36,-.44,.28,-.65]
};
// Both soles have world-space marks. Only the stepping foot leaves its mark.
// Solve each knee from the original painted thigh and shin lengths.
function legTo(hip,knee,ankle,x,y) {
  const a=Math.hypot(knee[0]-hip[0],knee[1]-hip[1]);
  const b=Math.hypot(ankle[0]-knee[0],ankle[1]-knee[1]);
  const d=Math.min(a+b-.01,Math.max(Math.abs(a-b)+.01,Math.hypot(x,y)));
  const restA=Math.atan2(knee[1]-hip[1],knee[0]-hip[0]);
  const restB=Math.atan2(ankle[1]-knee[1],ankle[0]-knee[0]);
  const bend=Math.sin(restB-restA)>=0?1:-1;
  const upper=Math.atan2(y,x)-bend*Math.acos(Math.max(-1,Math.min(1,(a*a+d*d-b*b)/(2*a*d))));
  const lower=Math.atan2(y-a*Math.sin(upper),x-a*Math.cos(upper));
  const wrap=v=>Math.atan2(Math.sin(v),Math.cos(v));
  return [wrap(upper-restA),wrap(lower-restB)];
}
function gingaStep(p,rig) {
  const [hip,knee,foot,backKnee,backFoot]=rig.points;
  const length=(j,f)=>Math.hypot(j[0]-hip[0],j[1]-hip[1])+Math.hypot(f[0]-j[0],f[1]-j[1]);
  const span=Math.min(length(knee,foot),length(backKnee,backFoot));
  const beat=(tick*(.008+.00034*(p.id%7))+p.id*.17)%1;
  const frontSteps=beat>=.5,phase=(beat*2)%1;
  const back=Math.sin(phase*Math.PI)**2;
  const lift=Math.sin(phase*2*Math.PI)**2*.105*span;
  const hipX=(frontSteps?1:-1)*back*.11*span;
  const sole=span*(.76-.035*back)+Math.max(rig.floor-foot[1]+hip[1],rig.floor-backFoot[1]+hip[1]);
  function targets(j,f,moving,offset){
    const x=span*(offset-(moving?.77*back:0))-hipX;
    const ankleY=sole-(rig.floor-f[1]+hip[1])-(moving?lift:0);
    return legTo(hip,j,f,x,ankleY);
  }
  return {angles:[...targets(knee,foot,frontSteps,.29),...targets(backKnee,backFoot,!frontSteps,.20)],
    x:hipX,y:sole, sway:Math.sin(beat*2*Math.PI)};
}

function fighterAngles(p) {
  const beat=tick*(.045+.0023*(p.id%6))+(p.ginga||0)*.022+p.id*.65;
  const sway=Math.sin(beat),lift=Math.cos(beat);
  const ready=[sway*.38,-sway*.36+Math.max(0,lift)*.17,-sway*.39,sway*.28,
    -.11+sway*.14,-sway*.52,sway*.41];
  if (p.victory || (scene==='result' && !p.defeated)) {
    const style=p.id%5;
    const salute=[[ -.18,-.1,.15,.2,-.2,-1.7,-.7],[-.5,.22,.12,.16,.55,.4,-.7],
      [-1.7,-2.0,.15,-.25,-.4,-.8,.1],[.16,.2,-.3,.3,.08,-1.45,-.98],
      [-.6,.32,.35,-.25,-.38,-.68,-1.3]][style];
    salute[4]+=(Math.floor(p.id/5)-2)*.07;salute[5]+=(p.id%4)*.16;return salute;
  }
  if(p.down>0 || p.hp<=0)return [.3,.25,.2,-.32,-1.38,.4,.3];
  if(p.stun>0)return [-.19,.25,.1,-.15,-.4,-.33,-.42];
  if(p.attack==null)return p.crouch?[.42,-.8,-.63,.58,.48,.24,-.4]:ready;
  const move=characterMoves[p.id][p.attack], phase=attackPhase(move,p.at);
  if(p.demoKey)phase.key=p.demoKey;
  const age=p.at-move.start;
  if(age<0 || age>=move.active)return ready;
  const progress=phase.phaseFrame/phase.frames;
  const extension=Math.sin(Math.PI*Math.min(1,(progress+.12)/1.12));
  const flair=(p.id%7-3)*.055, timing=(p.id%5-2)*.09;
  const swing=Math.pow(extension,1+timing), arc=Math.sin(progress*2*Math.PI);
  // Shoulder lead, hip turn, knee chamber and follow-through are individual
  // animation accents for Tainá, Luzia, Dalva, Neide and Marília respectively.
  const accents=[
    [.10,-.22,.22,-.15,.28,-.40,.24],
    [-.28,.37,.08,-.09,-.12,.32,-.31],
    [.16,.13,-.19,.23,.37,-.26,.15],
    [-.35,.47,-.12,.10,-.24,.19,-.36],
    [.27,-.16,.31,-.19,-.31,.23,.29]
  ][p.id-16];
  const accentBeat=Math.sin(Math.PI*progress)*(1-.5*progress);
  return strikeAngles[phase.key].map((v,i)=>ready[i]*(1-swing)+
    (v+(i===0?flair:i===4?-flair*.7:0))*swing+(accents?accents[i]*accentBeat:0)+arc*(i===1?.22+flair:0));
}
function turn(point,angle) {
  const [x,y]=point;
  return [x*Math.cos(angle)-y*Math.sin(angle),x*Math.sin(angle)+y*Math.cos(angle)];
}
function joint(origin,a,b,angle) {
  const d=turn([b[0]-a[0],b[1]-a[1]],angle);
  return [origin[0]+d[0],origin[1]+d[1]];
}
function paintFighter(g,p,x,y,zoom=1,card=false) {
  const rig=rodaRigs[p.id],im=costumes[p.id];
  if (!rig || !im?.naturalWidth)return;
  const [hip,knee,foot,rearKnee,rearFoot,shoulder,elbow,hand,rearShoulder]=rig.points;
  const stepping=!card && p.attack==null && p.hp>0 && !p.down && !p.stun && !p.crouch &&
    !p.block && !p.victory && scene!=='result' && !p.y && !p.takeoff;
  const gait=stepping?gingaStep(p,rig):null;
  const pose=card?Array(7).fill(0):fighterAngles(p);
  if(gait)pose.splice(0,7,...gait.angles,-.10+gait.sway*.12,-gait.sway*.54,gait.sway*.39);
  const [thigh,shin,backThigh,backShin,body,arm,forearm]=pose;
  const origin=[0,0], newKnee=joint(origin,hip,knee,thigh), newBack=joint(origin,hip,rearKnee,backThigh);
  const newShoulder=joint(origin,hip,shoulder,body);
  const newElbow=joint(newShoulder,shoulder,elbow,arm+body);
  const angles=[backThigh,backShin,thigh,shin,body,arm+body,forearm+body,body-arm*.64,gait?0:backShin,gait?0:shin];
  const anchors=[origin,newBack,origin,newKnee,origin,newShoulder,newElbow,joint(origin,hip,rearShoulder,body),joint(newBack,rearKnee,rearFoot,backShin),joint(newKnee,knee,foot,shin)];
  const floor=Math.max(joint(newKnee,knee,foot,shin)[1]+rig.floor-(foot[1]-hip[1]),
    joint(newBack,rearKnee,rearFoot,backShin)[1]+rig.floor-(rearFoot[1]-hip[1]),
    joint(newElbow,elbow,hand,forearm+body)[1],turn([0,rig.top],body)[1]);
  g.save();
  g.translate(x,y);
  const scale=rig.scale*zoom*(card?1:0.76);
  g.scale(scale*(p.dir||1)*fighterTraits[p.id].build,scale);
  g.translate(gait?gait.x:0,-(gait?gait.y:floor));
  if(card)g.drawImage(im,-hip[0],-hip[1]);
  else paintSkin(g,p.id,im,anchors,angles);
  g.restore();
}
function paintedCard(canvas,id,defeat=false) {
  const g=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  const backdrop=g.createLinearGradient(0,0,w,h);
  backdrop.addColorStop(0,defeat?'#414345':fighterTraits[id].accent);
  backdrop.addColorStop(.63,'#26342e');backdrop.addColorStop(1,'#101916');
  g.fillStyle=backdrop;g.fillRect(0,0,w,h);
  paintFighter(g,{id,dir:1},w*.45,h*2.16,h/125,true);
}
