'use strict';
const Meilin = (() => {
  const root = new URL('.',document.currentScript.src);
  function load(name){
    const image=new Image();
    image.src=new URL(name+'.webp',root);
    return image;
  }
  const movement=load('ginga-roll');
  const pairs=['sole-sweep','crescent-hook','turn-ground'].map(load);
  const spritesReady=Promise.allSettled([movement,...pairs].map(image=>image.decode()));
  const ease=t=>t*t*(3-2*t);
  const families=[
    [['bencao','Bênção baixa'],['bencao','Bênção curta'],['bencao','Bênção em avanço'],['bencao','Bênção longa']],
    [['rasteira','Rasteira curta'],['rasteira','Rasteira de giro'],['rasteira','Rasteira sentada'],['rasteira','Rasteira longa']],
    [['frente','Meia-lua de dentro'],['costas','Meia-lua de fora'],['frente','Meia-lua em esquiva'],['costas','Meia-lua de costas']],
    [['chapa','Chapa curta'],['martelo','Gancho por dentro'],['chapa','Chapa lateral'],['chapa','Chapa cruzada']],
    [['rasteira','Rasteira apoiada'],['chapa','Chapa sentada'],['rasteira','Rasteira de lado'],['chapa','Chapa com apoio']],
    [['rasteira','Rasteira de negativa'],['bencao','Bênção sentada'],['chapa','Chapa de chão'],['martelo','Gancho baixo']]
  ];
  // Each number selects a unique preparation/contact pair in the new atlases.
  // Interleave body positions so the four kicks on one button read differently.
  const chains=[
    [0,4,8,12], [5,17,1,21], [9,13,6,18],
    [14,2,22,10], [16,11,3,7], [20,15,19,23]
  ];
  characterMoves[7]=chains.map((sequence,slot)=>{
    const base=moves[slot];
    const phases=sequence.map((pose,index)=>{
      const family=Math.floor(pose/4);
      const [key,name]=families[family][pose%4];
      const frames=20+(index+slot)%4;
      return {...techniqueBook[key],key,name,pose,level:'low',travel:0,frames,
        contactStart:8,contactEnd:14,range:base.range,damage:base.damage/4,
        push:index===3?3:0,knockdown:index===3 && slot>=3};
    });
    const name=phases.map(p=>p.name).join(' → ');
    return {...base,name,signature:name,phases,start:8,end:8,level:'low',
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
    if(won){frame=3;}
    else if(p.down>0 || p.hp<=0){
      row=3;frame=p.hp>0 && p.down<9?1:Math.min(3,Math.floor(age/6));
    }else if(p.stun>0 && !p.guardStun){
      row=3;frame=age>7?1:0;
    }else if(p.attack!=null){
      const slot=p.attack,move=characterMoves[7][slot];
      const recovery=p.at-move.start-move.active;
      if(p.at<move.start){frame=p.at<3?1:2;}
      else if(recovery>=0){frame=recovery<4?2:1;}
      else{
        const phase=attackPhase(move,p.at);
        const extended=phase.phaseFrame>=phase.contactStart && phase.phaseFrame<phase.contactEnd;
        const family=Math.floor(phase.pose/4);
        const pair=pairs[Math.floor(family/2)];
        if(pair.naturalWidth){
          sheet=pair;row=phase.pose%4;frame=(family%2)*2+Number(extended);
        }else frame=2;
      }
    }else if(p.takeoff>0 || p.landing>0 || p.y>0){
      row=2;frame=p.takeoff>0?0:p.landing>0?3:p.vy>4?1:2;
    }else if(p.tumble){
      row=1;frame=Math.min(3,Math.floor(4*p.tumble.elapsed/p.tumble.duration));
      if(p.tumble.axis*(p.dir||1)<0)frame=3-frame;
    }else if(p.crouch){frame=2;}
    if(!sheet.naturalWidth)return;
    const scale=zoom*1.40;
    g.save();g.translate(x,y);g.scale((p.dir||1)*scale,scale);
    g.drawImage(sheet,256*frame,256*row,256,256,-128,-244,256,256);
    g.restore();
  }
  return {update,draw,spritesReady};
})();
