(() => {
  const el=id=>document.getElementById(id);
  const select=el('preview-fighter'), screen=el('move-screen'), g=screen.getContext('2d');
  const row=el('move-buttons'), caption=el('move-sequence'), pause=el('preview-pause');
  let slot=0, age=0, cycling=true, visible=false, last=0, raf=0;
  let playing=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  const id=()=>Number(select.value);
  const move=()=>characterMoves[id()][slot];
  for(const fighter of [...playableIds,15]){
    select.add(new Option(profiles[fighter].name+(fighter===15?' · Boss':''),fighter));
  }
  select.value='18';
  const motion=document.createElement('select'), motionLabel=document.createElement('label');
  for(const label of ['Kick combinations','Retreat','Jump','Hit reaction','Knockdown','Victory pose']){
    motion.add(new Option(label,label));
  }
  motionLabel.append('Animation ',motion);select.closest('label').after(motionLabel);
  motion.onchange=()=>{age=0;last=0;playing=true;labels();redraw();schedule();};
  function labels(){
    row.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(slot===i)));
    caption.replaceChildren();
    row.hidden=motion.selectedIndex!==0;
    if(motion.selectedIndex)caption.textContent=motion.value;
    for(const [i,phase] of (motion.selectedIndex?[]:move().phases).entries()){
      if(i)caption.append(' → ');
      const span=document.createElement('span');
      span.textContent=(phase.name || techniqueBook[phase.key]?.name || move().name);caption.append(span);
    }
    pause.textContent=playing?'Pause':'Play';
    el('preview-all').setAttribute('aria-pressed',String(cycling));
  }
  function redraw(){
    const fighter=id(),m=move();
    const lead=24,at=age-lead;
    const attacking=at>=0 && at<m.start+m.active+m.end;
    const body={id:fighter,dir:1,hp:100,y:0,preview:true,
      attack:attacking?slot:null,at:Math.max(0,at)};
    const arena=window.RODAIndoorArenas?.surface(homeArena[fighter]);
    if(arena)g.drawImage(arena,0,0,760,335);
    else{g.fillStyle='#243f38';g.fillRect(0,0,760,335);}
    g.fillStyle='#122018d9';g.fillRect(8,6,310,58);
    g.fillStyle='#f3d699';g.font='bold 18px system-ui';g.fillText(profiles[fighter].name,18,30);
    g.font='14px system-ui';g.fillText(profiles[fighter].home,18,54);
    g.fillStyle='#211d1866';g.beginPath();g.ellipse(375,290,75,10,0,0,Math.PI*2);g.fill();
    if(motion.selectedIndex){
      const t=age%75;
      body.attack=null;body.vx=0;
      if(motion.value==='Victory pose')body.victory=true;
      if(motion.value==='Retreat')body.tumble={axis:-1,elapsed:t%30,duration:30};
      if(motion.value==='Hit reaction' && t<28){body.stun=28-t;body.hitAt=tick-t;}
      if(motion.value==='Knockdown' && t<54){body.down=54-t;body.hitAt=tick-t;}
      if(motion.value==='Jump' && t<44){
        body.takeoff=t<4?4-t:0;body.landing=t>37?44-t:0;
        const flight=Math.max(0,Math.min(1,(t-4)/33));
        body.y=Math.sin(Math.PI*flight)*100;body.vy=Math.cos(Math.PI*flight)*14;
      }
    }
    paintFighter(g,body,375,290-body.y);
    const phase=at>=m.start && at<m.start+m.active?attackPhase(m,at).phase:-1;
    [...caption.children].forEach((span,i)=>{
      span.style.color=i===phase?'#ffda77':'';
      span.style.fontWeight=i===phase?'800':'';
      span.style.textDecoration=i===phase?'underline':'';
    });
  }
  let audition=false;
  function frame(now){
    raf=0;
    const previousAge=age;
    if(last)age+=Math.min(4,(now-last)*.06);
    last=now;
    const m=move();
    if(audition && id()===21 && motion.selectedIndex===0 && scene!=='fight' && sound){
      let contact=24+m.start;
      for(const phase of m.phases){
        const at=contact+(phase.contactStart||0);
        if(previousAge<at && age>=at)strikeSound({id:21,attack:slot},'hit',m);
        contact+=phase.frames;
      }
    }
    if(age>=24+m.start+m.active+m.end+35){
      age=0;
      if(cycling && !motion.selectedIndex){slot=(slot+1)%6;labels();}
    }
    redraw();schedule();
  }
  function schedule(){
    if(playing && visible && !document.hidden && !raf)raf=requestAnimationFrame(frame);
  }
  function restart(all){
    audition=id()===21;
    if(audition && sound)initAudio();
    motion.selectedIndex=0;cycling=all;age=0;last=0;playing=true;labels();redraw();schedule();
  }
  for(const [i,m] of characterMoves[0].entries()){
    const button=document.createElement('button');button.type='button';button.textContent=m.button;
    button.onclick=()=>{slot=i;restart(false);};row.append(button);
  }
  select.onchange=()=>{audition=false;slot=0;age=0;last=0;labels();redraw();schedule();};
  pause.onclick=()=>{
    playing=!playing;last=0;
    if(!playing){cancelAnimationFrame(raf);raf=0;}
    labels();schedule();
  };
  el('preview-replay').onclick=()=>restart(false);
  el('preview-all').onclick=()=>{slot=0;restart(true);};
  new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;last=0;
    if(!visible){cancelAnimationFrame(raf);raf=0;}else schedule();
  }).observe(screen);
  document.addEventListener('visibilitychange',()=>{last=0;schedule();});
  costumes.forEach(im=>im.addEventListener('load',()=>{if(!playing)redraw();},{once:true}));
  const query=new URLSearchParams(location.search);
  const linked={aisha:21,meilin:7,mestre:14,bento:11,caio:12,nestor:13}[query.get('fighter')];
  if(Number.isInteger(linked)){
    select.value=String(linked);
    const index=characterMoves[linked].findIndex(move=>move.button===query.get('button'));
    if(index>=0){slot=index;cycling=false;}
  }
  Meilin.spritesReady.then(redraw);
  labels();redraw();
})();
