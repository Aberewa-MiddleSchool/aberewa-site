'use strict';
const Meilin = (() => {
  const root = new URL('.',document.currentScript.src);
  function load(name){
    const image=new Image();
    image.src=new URL(name+'.webp',root);
    return image;
  }
  const movement=load('movement'), salute=load('salute');
  const kicks=Array.from({length:6},(_,i)=>load('low-'+i));
  const spritesReady=Promise.allSettled([movement,salute,...kicks].map(image=>image.decode()));
  const ease=t=>t*t*(3-2*t);
  const chains=[
    ['Bênção baixa','Chapa lateral baixa','Meia-lua baixa','Bênção longa baixa'],
    ['Rasteira curta','Rasteira de giro','Meia-lua de costas baixa','Rasteira longa'],
    ['Gancho baixo','Bênção baixa','Rasteira de giro','Chapa baixa'],
    ['Meia-lua de costas baixa','Chapa curta baixa','Meia-lua de frente baixa','Rasteira lateral'],
    ['Chapa lateral baixa','Meia-lua de costas baixa','Rasteira de chão','Meia-lua de frente baixa'],
    ['Gancho baixo','Rasteira de dentro','Chapa de chão','Meia-lua de giro baixa']
  ];
  characterMoves[7]=chains.map((names,slot)=>{
    const base=moves[slot];
    const phases=names.map((name,i)=>{
      const frames=17+(slot+i)%5;
      return {name,key:'lowpush',level:'low',travel:0,frames,
        contactStart:Math.ceil(frames*.43),contactEnd:Math.ceil(frames*.68),
        range:base.range,damage:base.damage/4,push:i===3?3:0,knockdown:i===3 && slot>=3};
    });
    const name=names.join(' → ');
    return {...base,level:'low',name,signature:name,phases,start:6+slot,end:8+slot,
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

  function draw(g,p,x,y,zoom){
    const won=p.victory || (!p.preview && endWait>0 && players[matchWinner]===p);
    const age=Math.max(0,tick-(p.hitAt??tick));
    let sheet=movement,row=0,frame=0;
    if(won && salute.naturalWidth){
      const scale=zoom*1.31;
      g.save();g.translate(x,y);g.scale((p.dir||1)*scale,scale);
      g.drawImage(salute,-salute.naturalWidth/2,-salute.naturalHeight);g.restore();return;
    }
    if(p.down>0 || p.hp<=0){
      row=3;frame=p.hp>0 && p.down<9?1:Math.min(3,Math.floor(age/6));
    }else if(p.stun>0 && !p.guardStun){
      row=3;frame=age>7?1:0;
    }else if(p.attack!=null){
      const move=characterMoves[7][p.attack];
      if(p.at>=move.start && p.at<move.start+move.active && kicks[p.attack].naturalWidth){
        const phase=attackPhase(move,p.at);
        sheet=kicks[p.attack];row=phase.phase;
        frame=phase.phaseFrame<phase.contactStart/2?0:phase.phaseFrame<phase.contactStart?1:
          phase.phaseFrame<phase.contactEnd?2:3;
      }
    }else if(p.takeoff>0 || p.landing>0 || p.y>0){
      row=2;frame=p.takeoff>0?0:p.landing>0?3:p.vy>4?1:2;
    }else if(p.tumble){
      row=1;frame=Math.min(3,Math.floor(4*p.tumble.elapsed/p.tumble.duration));
      if(p.tumble.axis*(p.dir||1)<0)frame=3-frame;
    }else if(p.crouch){row=2;frame=0;}
    if(!sheet.naturalWidth)return;
    const scale=zoom*1.40;
    g.save();g.translate(x,y);g.scale((p.dir||1)*scale,scale);
    g.drawImage(sheet,256*frame,256*row,256,256,-128,-244,256,256);
    g.restore();
  }
  return {update,draw,spritesReady};
})();
