'use strict';
const Meilin = (() => {
  const torso = new Image();
  torso.src = new URL('tunic.webp', document.currentScript.src);
  const brocade=new Image();
  brocade.src=new URL('brocade.webp',document.currentScript.src);
  const pi = Math.PI;
  const limit = v => Math.max(0,Math.min(1,v));
  const ease = v => {const t=limit(v);return t*t*(3-2*t);};
  const mix = (a,b,t) => a+(b-a)*t;
  const toward = (a,b,t) => [mix(a[0],b[0],t),mix(a[1],b[1],t)];
  const rotate = ([x,y],a) => [x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)];
  // Each step specifies an ankle path in hip space, torso angle, active leg and timing.
  // Shared bone lengths give the low guard and standing salute the same anatomy.
  const chains = [
    [['bencao',130,14,-.26,0,16],['chapa',145,-8,-.43,1,17],['frente',121,-62,-.32,0,19],['bencao',145,-26,-.49,1,18]],
    [['rasteira',129,61,.53,1,18],['lowpush',142,45,.28,0,16],['lowsweep',149,34,.64,1,19],['lowback',137,53,.87,0,20]],
    [['frente',101,-94,-.50,1,17],['martelo',127,-71,-.66,0,18],['frente',81,-119,-.55,1,20],['chapa',139,-46,-.62,0,18]],
    [['costas',140,15,1.07,0,20],['armada',121,-77,.76,1,21],['martelo',114,-91,-.57,0,17],['costas',143,-25,1.17,1,20]],
    [['chapa',138,30,-.52,1,15],['bencao',120,-42,-.27,0,16],['armada',138,-48,.67,1,19],['martelo',103,-104,-.70,0,21]],
    [['lowback',141,49,.92,0,18],['rasteira',147,35,.62,1,17],['costas',128,-62,1.22,0,20],['frente',90,-114,-.46,1,22]]
  ];
  characterMoves[7]=chains.map((chain,slot)=>{
    const base=moves[slot];
    const phases=chain.map(([key,x,y,lean,leg,frames],i)=>{
      const tech=techniqueBook[key];
      return {...tech,key,frames,contactStart:Math.ceil(frames*.43),contactEnd:Math.ceil(frames*.68),
        range:Math.round(base.range*tech.reach),damage:base.damage/4,push:i===3?3:0,
        knockdown:i===3 && slot>=3,travel:0};
    });
    const name=phases.map(p=>p.name).join(' → ');
    return {...base,name,signature:name,phases,start:6+slot,end:8+slot,
      active:phases.reduce((total,p)=>total+p.frames,0)};
  });

  function update(p,op,input,dt,simulate) {
    const axis=input?.x||0;
    const free=p.hp>0 && p.attack===null && !(p.stun>0 || p.down>0 || p.y || p.takeoff>0 || p.landing>0 || Math.abs(input?.y||0)>.5);
    if(!free)p.tumble=null;
    if(free && !p.tumble && Math.abs(axis)>.35)
      p.tumble={elapsed:0,duration:32,axis:Math.sign(axis)};
    const roll=p.tumble;
    if(!roll){simulate(p,op,input,dt);return;}
    const prev=roll.elapsed;
    roll.elapsed=Math.min(prev+dt,roll.duration);
    const distance=100*(ease(roll.elapsed/roll.duration)-ease(prev/roll.duration));
    simulate(p,op,{...input,x:0},dt);
    if(p.attack===null && !p.down && !p.stun){
      p.x=clamp(p.x+roll.axis*distance,100,1180);
      p.vx=0;p.block=roll.axis*p.dir<0;
      p.moveText=p.block?'ROLÊ · RETREAT':'ROLÊ · ADVANCE';
    }
    if(roll.elapsed>=roll.duration || p.attack!==null)p.tumble=null;
  }

  function pose(p){
    const q={feet:[[-76,101],[62,101]],hands:[[12,-77],[63,-63]],lean:.22,turn:0};
    const age=Math.max(0,tick-(p.hitAt??tick));
    if(p.victory || (!p.preview && endWait>0 && players[matchWinner]===p)){
      q.feet=[[-26,150],[28,150]];q.lean=-.03;q.hands=[[35,-94],[59,-112]];
    }else if(p.down>0 || p.hp<=0){
      const f=ease(age/19)*(p.hp>0?ease(p.down/11):1);
      q.turn=-1.60*f;q.feet=[toward(q.feet[0],[-35,136],f),toward(q.feet[1],[38,109],f)];
      q.hands=[[-27,-43],[39,-44]];
    }else if(p.stun>0 || p.guardStun){
      const f=p.guardStun?.5:Math.sin(pi*limit((age+4)/31));
      q.lean-=.65*f;q.hands=[[-10,-80],[36,-94]];
    }else if(p.attack!=null){
      const move=characterMoves[7][p.attack], state=attackPhase(move,p.at);
      const [key,x,y,lean,leg]=chains[p.attack][state.phase];
      const t=limit(state.phaseFrame/state.frames);
      const lift=ease(t/.26)*(1-ease((t-.73)/.27));
      const extend=ease((t-.20)/.27)*(1-ease((t-.64)/.29));
      const sweeping=['rasteira','lowsweep','lowback','costas','armada','frente'].includes(key);
      const chamber=[leg?58:35,sweeping?15:-21];
      q.feet[leg]=toward(toward(q.feet[leg],chamber,lift),[x,y+(sweeping?19*Math.sin(t*2*pi):0)],extend);
      const support=1-leg;
      q.feet[support][1]+= (y<0?24:-15)*lift;
      q.lean=mix(q.lean,lean,extend);
      q.hands=[toward(q.hands[0],[-51,-60],lift),toward(q.hands[1],[42,lean>.6?35:-86],lift)];
    }else if(p.tumble){
      const t=limit(p.tumble.elapsed/p.tumble.duration),tuck=Math.sin(pi*t);
      q.turn=(p.tumble.axis*(p.dir||1))*2*pi*ease(t);
      q.lean+=.55*tuck;
      q.feet=[toward(q.feet[0],[-27,34],tuck),toward(q.feet[1],[35,18],tuck)];
      q.hands=[toward(q.hands[0],[28,-106],tuck),toward(q.hands[1],[53,-106],tuck)];
    }else if(p.y>0 || p.takeoff>0 || p.landing>0){
      q.feet=p.y>0?[[-56,52],[72,35]]:[[-71,92],[64,92]];
      q.hands=[[-13,-93],[57,-113]];q.lean=.13;
    }else if(p.crouch){
      q.feet=[[-84,84],[66,84]];q.lean=.39;
    }
    return q;
  }

  // Solve both segments together. Clamp the endpoint to the reachable arc
  // before constructing the knee so a stretched kick cannot detach the ankle.
  function limb(root,target,a,b,bend){
    const dx=target[0]-root[0],dy=target[1]-root[1],raw=Math.hypot(dx,dy)||1;
    const d=Math.min(a+b-.01,Math.max(Math.abs(a-b)+.01,raw)),ux=dx/raw,uy=dy/raw;
    const along=(a*a-b*b+d*d)/(2*d),out=Math.sqrt(Math.max(0,a*a-along*along))*bend;
    return [root,[root[0]+along*ux-out*uy,root[1]+along*uy+out*ux],[root[0]+d*ux,root[1]+d*uy]];
  }
  function path(g,points,fill,stroke){
    g.beginPath();for(const [i,v] of points.entries())i?g.lineTo(...v):g.moveTo(...v);
    g.closePath();g.fillStyle=fill;g.fill();
    if(stroke){g.strokeStyle=stroke;g.lineWidth=1.7;g.stroke();}
  }
  function line(g,points,width,color){
    g.beginPath();points.forEach((v,i)=>i?g.lineTo(...v):g.moveTo(...v));
    g.lineWidth=width;g.strokeStyle=color;g.stroke();
  }
  function ellipse(g,x,y,a,b,color,angle=0){
    g.fillStyle=color;g.beginPath();g.ellipse(x,y,a,b,angle,0,2*pi);g.fill();
  }
  function leg(g,[hip,knee,foot],far){
    const axis=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0]);
    const upper=axis(hip,knee),lower=axis(knee,foot);
    const offset=(p,ang,w)=>[p[0]-Math.sin(ang)*w,p[1]+Math.cos(ang)*w];
    const mid=upper+Math.atan2(Math.sin(lower-upper),Math.cos(lower-upper))/2;
    const cuff=toward(knee,foot,.91);
    const seam=[offset(hip,upper,17),offset(knee,mid,17),offset(cuff,lower,17),
      offset(cuff,lower,-17),offset(knee,mid,-15),offset(hip,upper,-16)];
    g.save();g.beginPath();
    seam.forEach((p,i)=>{
      const next=seam[(i+1)%seam.length],prev=seam[(i+seam.length-1)%seam.length];
      const a=toward(p,prev,.14),b=toward(p,next,.14);
      if(!i)g.moveTo(...a);else g.lineTo(...a);
      g.quadraticCurveTo(...p,...b);
    });
    g.closePath();g.fillStyle=far?'#5b272b':'#832e32';g.fill();g.strokeStyle='#342222';g.lineWidth=2;g.stroke();g.clip();
    if(brocade.naturalWidth){
      for(const [root,end,angle,top,span] of [[hip,knee,upper,0,.49],[knee,cuff,lower,.49,.51]]){
        const length=Math.hypot(root[0]-end[0],root[1]-end[1]);
        g.save();g.translate(...root);g.rotate(angle-pi/2);
        g.drawImage(brocade,0,brocade.naturalHeight*top,brocade.naturalWidth,brocade.naturalHeight*span,-22,-13,44,length+26);g.restore();
      }
    }
    if(far){g.fillStyle='#28142240';g.fillRect(-190,-170,380,370);}
    g.restore();
    line(g,[offset(cuff,lower,15),offset(cuff,lower,-15)],3,'#dca341');
    g.save();g.translate(...foot);g.rotate(Math.max(-.85,Math.min(.76,lower-pi/2))*.7);
    path(g,[[-9,-9],[5,-8],[10,-2],[21,2],[22,7],[-10,7]],'#24482e','#18251d');
    line(g,[[-9,6],[12,7],[21,5]],3,'#ece5c8');line(g,[[3,-5],[10,-3]],2,'#eee8ce');g.restore();
  }
  function arm(g,[shoulder,elbow,hand],far){
    const skin=far?'#c08751':'#eab074',shade=far?'#94623e':'#bd8051';
    const bone=(a,b,top,bottom,bulge)=>{
      const angle=Math.atan2(b[1]-a[1],b[0]-a[0]),length=Math.hypot(b[0]-a[0],b[1]-a[1]);
      g.save();g.translate(...a);g.rotate(angle);
      g.beginPath();g.moveTo(-2,-top);g.bezierCurveTo(length*.35,-top-bulge,length*.6,-bottom-1,length,-bottom);
      g.quadraticCurveTo(length+3,0,length,bottom);g.bezierCurveTo(length*.55,bottom+2,length*.32,top+bulge,-2,top);
      g.quadraticCurveTo(-top-1,0,-2,-top);g.closePath();g.fillStyle=skin;g.fill();g.strokeStyle='#69452c';g.lineWidth=1;g.stroke();
      g.beginPath();g.moveTo(1,top-2);g.quadraticCurveTo(length*.55,top+1,length-1,bottom-1);
      g.strokeStyle=shade;g.lineWidth=2;g.stroke();g.restore();
    };
    bone(shoulder,elbow,7,5.3,1.6);bone(elbow,hand,5.4,3.4,1.4);
    const a=Math.atan2(hand[1]-elbow[1],hand[0]-elbow[0]);
    g.save();g.translate(...hand);g.rotate(a);
    path(g,[[-2,-3],[3,-4],[7,-8],[8,-7],[6,-3],[13,-4],[14,-2],[11,0],[13,0],[11,2],[4,4],[-1,3]],skin,'#835933');
    g.restore();
  }
  function draw(g,p,x,y,zoom){
    const q=pose(p),feet=q.feet.map((v,i)=>limb([i?7:-7,0],v,77,77,-1));
    const arms=q.hands.map((v,i)=>limb(rotate(i?[-23,-67]:[19,-68],q.lean),v,38,34,1));
    const supports=feet.flatMap(([,k,f])=>[[k,15],[f,9]]);
    supports.push(...arms.flatMap(([,elbow,hand])=>[[elbow,7],[hand,6]]),
      [rotate([0,-116],q.lean),20],[rotate([-34,-80],q.lean),15],[[0,0],15]);
    const floor=Math.max(...supports.map(([point,r])=>rotate(point,q.turn)[1]+r));
    g.save();g.translate(x,y);g.scale((p.dir||1)*zoom*.965,zoom*.965);g.translate(0,-floor);g.rotate(q.turn);
    g.lineJoin='round';g.lineCap='round';
    leg(g,feet[0],true);arm(g,arms[0],true);leg(g,feet[1],false);
    g.save();g.rotate(q.lean);
    if(torso.naturalWidth)g.drawImage(torso,-98,-137,165,165);
    else{path(g,[[-26,-74],[22,-75],[32,20],[-34,20]],'#304729','#d4a33c');ellipse(g,4,-104,19,25,'#df9d61');}
    g.restore();arm(g,arms[1],false);g.restore();
  }
  return {update,draw};
})();
