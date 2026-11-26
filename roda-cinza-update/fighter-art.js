const cinzaArt = (() => {
  const sheet = new Image();
  sheet.src = cinza.asset('cinza-atlas.webp');
  const rolls = new Image();
  rolls.src = cinza.asset('cinza-rolls.webp');
  const ready = Promise.all([sheet.decode(),rolls.decode(),cinza.portrait.decode()]).then(()=>{
    if(sheet.naturalWidth!==sheet.naturalHeight || sheet.naturalWidth%4!==0 || rolls.naturalWidth!==sheet.naturalWidth || rolls.naturalHeight*2!==sheet.naturalHeight)throw Error('Unexpected Dona Cinza atlas dimensions');
    return true;
  }).catch(error=>{console.error('Dona Cinza art unavailable',error);return false;});

  const costumes = [
    {key:'original',name:'Original',combat:sheet,rolls},
    {key:'marfim',name:'Marfim'},
    {key:'rosa',name:'Rosa Rubra'},
    {key:'ninja',name:'Gray Ninja'}
  ];
  let selected=0;
  function cycleCostume(){
    selected=(selected+1)%costumes.length;
    const kit=costumes[selected];
    if(!kit.combat){
      for(const part of ['combat','rolls']){
        const image=new Image();
        image.src=cinza.asset('outfits/'+kit.key+'-'+part+'.webp');
        kit[part]=image;
      }
    }
  }
  const kicks = {bencao:5,frente:6,costas:6,rasteira:7,armada:9,compasso:9};
  function pose(p){
    if(p.down>0 || p.hp<=0)return 14;
    if(p.stun>0)return p.guardStun?3:11;
    if(p.rollTime>0){
      const forward = p.rollDirection===(p.abimbolaRollFacing??p.dir);
      return (forward?0:4)+Math.min(3,Math.floor((24-p.rollTime)/6));
    }
    if(inJump(p))return 10;
    if(p.attack!==null){
      const move=moveFor(p,p.attack);
      if(p.at<move.start || p.at>=move.start+move.active)return 0;
      const phase=attackPhase(move,p.at);
      if(phase.phaseFrame<phase.delay)return 0;
      const t=(phase.phaseFrame-phase.delay)/(phase.frames-phase.delay);
      if(t<.35 || t>=.78)return phase.key==='compasso'||phase.key==='armada'?8:4;
      return kicks[phase.key];
    }
    if(p.block)return 3;
    if(p.crouch || p.landing>0)return 2;
    return 0;
  }
  function draw(p){
    if(!sheet.naturalWidth)return;
    const frame=pose(p),cell=sheet.naturalWidth/4;
    const size=413;
    ctx.save();
    ctx.fillStyle='#16101555';ctx.beginPath();
    ctx.ellipse(p.x,592,Math.max(18,59*(1-p.y/420)),10,0,0,Math.PI*2);ctx.fill();
    ctx.translate(p.x,590-p.y);
    ctx.scale(p.rollTime>0?(p.abimbolaRollFacing??p.dir):p.dir,1);
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    const kit=costumes[p.cinzaCostume||0] || costumes[0];
    const part=p.rollTime>0 && p.down<=0 && p.hp>0 && p.stun<=0?'rolls':'combat';
    const art=kit[part]?.naturalWidth?kit[part]:costumes[0][part];
    ctx.drawImage(art,(frame%4)*cell,Math.floor(frame/4)*cell,cell,cell,-size/2,3-size,size,size);
    ctx.restore();
    if(p.combo>=2 && p.comboTimer>0)text(p.combo+' HIT',p.x,205,34,'#ffdb6e','center');
  }
  function face(canvas){
    const choice=costumes[selected];
    if(selected && choice.combat){
      if(!choice.combat.complete){
        choice.combat.addEventListener('load',()=>{if(costumes[selected]===choice)face(canvas);},{once:true});
      }else if(choice.combat.naturalWidth){
        const g=canvas.getContext('2d');
        g.clearRect(0,0,canvas.width,canvas.height);
        const scale=Math.min(canvas.width/235,canvas.height/245);
        g.drawImage(choice.combat,82,140,235,244,(canvas.width-235*scale)/2,canvas.height-244*scale,235*scale,244*scale);
        return;
      }
    }
    const photo=cinza.portrait;
    const scale=Math.max(canvas.width/photo.naturalWidth,canvas.height/photo.naturalHeight);
    const width=photo.naturalWidth*scale,height=photo.naturalHeight*scale;
    canvas.getContext('2d').drawImage(photo,(canvas.width-width)/2,(canvas.height-height)*.2,width,height);
  }
  return {ready,draw,face,cycleCostume,get selected(){return selected;},get outfitName(){return costumes[selected].name;}};
})();
