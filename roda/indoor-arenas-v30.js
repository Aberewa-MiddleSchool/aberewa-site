/*
 * RODA v3.0 — indoor venues throughout the Brazilian stage circuit.
 * The original fighter/KO/round logic and private interior artworks are unchanged.
 * Stages 0–17 use indoor arena art. Private stages 18, 19, 20 and 21,
 * including Meilin and the skull-themed boss, retain their original artwork.
 * Pre-rendered room backgrounds avoid repeated geometry cost during fights.
 */
(() => {
  'use strict';
  const oldDrawArena = window.drawArena;
  if (typeof oldDrawArena !== 'function' || typeof ctx === 'undefined' ||
      typeof stageNames === 'undefined') {
    console.warn('[RODA indoor arenas] Game renderer not found; leaving original stages intact.');
    return;
  }

  const rooms = [
    'SALVADOR CAPOEIRA ACADEMY · BAHIA',
    'OLINDA COLONIAL STUDIO · PERNAMBUCO',
    'RIO CULTURAL HALL · RJ',
    'BELÉM RODA HOUSE · PARÁ',
    'SÃO LUÍS AZULEJO HALL · MARANHÃO',
    'RECIFE PERCUSSION STUDIO · PERNAMBUCO',
    'MANAUS COMMUNITY ACADEMY · AMAZONAS',
    'FORTALEZA INDOOR PAVILION · CEARÁ',
    'CACHOEIRA HERITAGE HALL · BAHIA',
    'SÃO PAULO ARTS WAREHOUSE · SP',
    'OURO PRETO STONE ACADEMY · MINAS GERAIS',
    'FLORIANÓPOLIS COMMUNITY GYM · SC',
    'PORTO SEGURO REHEARSAL HALL · BAHIA',
    'PARATY OLD TOWN STUDIO · RJ',
    'SALVADOR DOCKSIDE WAREHOUSE · BAHIA',
    'BELO HORIZONTE CAPOEIRA INSTITUTE · MG',
    'BRASÍLIA CULTURAL AUDITORIUM · DF',
    'NATAL INDOOR ATRIUM · RIO GRANDE DO NORTE',
    'MESTRE’S PRIVATE STUDIO · SALVADOR',
    'MEILIN’S TRAINING HALL · CURITIBA',
    'MEILIN’S CONSERVATORY · CURITIBA',
    'THE MYSTERY MAN’S SKULL STUDIO',
    'TAINÁ’S BOATHOUSE · SALVADOR',
    'LUZIA’S REHEARSAL CINEMA · RECIFE',
    'DALVA’S ENGENHO · RECÔNCAVO DA BAHIA',
    'NEIDE’S CERAMICS ATELIER · BELO HORIZONTE',
    'MARÍLIA’S COSTUME WORKSHOP · RIO DE JANEIRO',
    'BENTO’S DENIM WORKROOM · PORTO ALEGRE'
  ];
  // Mutate the shared array so the original arcade sequence, selection menus,
  // stage captions and story still use the same indexes and stay synchronized.
  stageNames.splice(0,stageNames.length,...rooms);
  const customRooms = rooms.slice(22).map((_,n)=>{
    const img=new Image();
    img.src=new URL('arenas/'+(22+n)+'.webp',document.currentScript.src);
    img.addEventListener('load',()=>window.RODAStageBrowser?.refresh(),{once:true});
    return img;
  });

  const colors = [
    ['#514335','#756149','#d3a35e','#433324','#ad744b'],
    ['#355a59','#658280','#d2c38e','#344943','#a87e59'],
    ['#322f4d','#5b547c','#d8b47e','#292638','#78658c'],
    ['#304b46','#52796c','#e3bb72','#2a4238','#81664b'],
    ['#3d4d68','#7585a2','#f0d99a','#2f3449','#8a604b'],
    ['#5e3a33','#8a5b4b','#e8ae72','#472b2b','#9a6e42'],
    ['#1c3d44','#406973','#bfd7a0','#24343c','#6d6a51'],
    ['#454e46','#65796a','#edca7d','#343e39','#a47847'],
    ['#5e4037','#87695b','#d8b786','#3e2b2c','#987652'],
    ['#29343b','#57656c','#efb76c','#252e35','#696e65'],
    ['#5a4d4b','#877876','#ddc2a0','#353233','#837265'],
    ['#314958','#57819b','#e7cc93','#304354','#8a8170'],
    ['#584737','#947757','#e0c07d','#3b3430','#a37949'],
    ['#375459','#6c9290','#dcc2a2','#304648','#9e6e58'],
    ['#393b3a','#62625d','#d7ac65','#2a302e','#797969'],
    ['#4a474b','#817a78','#f0d7a4','#343237','#8c654d'],
    ['#3b3d58','#71708f','#e6c588','#2a2d46','#847a68'],
    ['#47605b','#77928a','#e6c894','#384d46','#9b7555'],
    ['#393d34','#5e6758','#e5d3a0','#2a2f29','#947854'],
    ['#453b48','#817080','#e3c49a','#302b39','#97765a'],
    ['#364957','#657f89','#dec18e','#2d3c45','#9d735c']
  ];

  const cache = new Map();
  function rect(g,x,y,w,h,color){g.fillStyle=color;g.fillRect(x,y,w,h);}
  function stroke(g,x1,y1,x2,y2,color,width){
    g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();
  }
  function ellipse(g,x,y,rx,ry,fill){
    g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fillStyle=fill;g.fill();
  }
  function arch(g,x,y,w,h,fill,edge){
    g.fillStyle=fill;g.strokeStyle=edge;g.lineWidth=7;
    g.beginPath();g.moveTo(x,y+h);g.lineTo(x,y+w*.42);
    g.bezierCurveTo(x,y-w*.1,x+w,y-w*.1,x+w,y+w*.42);
    g.lineTo(x+w,y+h);g.closePath();g.fill();g.stroke();
  }
  function light(g,x,y,accent){
    // Hanging lamp, painted on the back wall layer.
    stroke(g,x,0,x,85,'#1b1d1b',5);
    rect(g,x-31,76,62,13,'#22201f');
    g.fillStyle=accent;g.beginPath();g.moveTo(x-48,89);
    g.lineTo(x+48,89);g.lineTo(x+66,107);g.lineTo(x-66,107);g.closePath();g.fill();
    const glow=g.createRadialGradient(x,115,4,x,285,280);
    glow.addColorStop(0,'#fff2b93b');glow.addColorStop(1,'#fff2b900');
    rect(g,x-280,105,560,465,glow);
    ellipse(g,x,115,10,6,'#fff9dc');
  }
  function berimbau(g,x,y,accent,mirror){
    // Stylized berimbau installation on the studio wall.
    g.save();g.translate(x,y);g.scale(mirror?-1:1,1);
    g.strokeStyle='#241b18';g.lineWidth=5;
    g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(35,105,12,232);g.stroke();
    stroke(g,0,0,12,232,'#dfc28b',1);
    ellipse(g,22,179,18,27,'#9a5c32');ellipse(g,19,178,9,18,accent);
    stroke(g,5,112,38,128,'#c7a26c',4);
    g.restore();
  }
  function pandeiro(g,x,y,accent){
    ellipse(g,x,y,32,32,'#36251c');
    ellipse(g,x,y,27,27,'#f5d4a1');
    ellipse(g,x,y,20,20,'#9f8066');
    for(let k=0;k<8;k++){let a=k*Math.PI/4;ellipse(g,x+30*Math.cos(a),y+30*Math.sin(a),5,4,accent);}
  }
  function paint(i){
    const p=colors[i]||colors[0], c=document.createElement('canvas');
    c.width=1280;c.height=660;const g=c.getContext('2d');
    if(!g)return c;
    const wall=g.createLinearGradient(0,0,0,490);
    wall.addColorStop(0,p[0]);wall.addColorStop(.7,p[1]);wall.addColorStop(1,p[0]);
    rect(g,0,0,1280,485,wall);
    // Enclosed ceiling, beams, panels and far-back architecture.
    rect(g,0,0,1280,75,p[3]);
    for(let x=0;x<=1280;x+=160){
      stroke(g,x,0,640+(x-640)*.62,160,'#151d1c62',13);
      stroke(g,x,0,640+(x-640)*.62,160,'#c9ad7b28',2);
    }
    rect(g,0,57,1280,13,'#191d1ab8');
    rect(g,0,137,1280,10,p[2]);
    rect(g,0,148,1280,4,'#181c1bc0');
    rect(g,0,445,1280,15,p[3]);
    // Vertical acoustic or decorative wall panels.
    for(let x=0;x<1280;x+=85){
      rect(g,x+6,160,2,281,'#171b1b36');
      rect(g,x+12,165,1,270,'#ffffff16');
    }
    // Four architectural vocabularies, alternated and combined with each city palette.
    const style=i%6;
    if(style===0||style===4){
      for(const x of [105,365,815,1075]){
        arch(g,x,201,115,232,'#152e2e9c',p[2]);
        arch(g,x+13,214,89,210,p[1]+'aa','#161b1a');
      }
    } else if(style===1||style===2){
      for(const x of [82,305,870,1093]){
        rect(g,x,177,105,245,'#1e2628aa');
        rect(g,x+8,185,89,227,p[1]);
        for(let yy=207;yy<412;yy+=46)stroke(g,x+8,yy,x+97,yy,p[2]+'99',3);
        stroke(g,x+52,185,x+52,412,p[2]+'88',3);
      }
    } else if(style===3){
      for(const x of [88,300,905,1117]){
        rect(g,x,172,68,273,'#1827259a');
        rect(g,x+11,182,46,250,p[1]);
      }
      for(let y=190;y<420;y+=45)stroke(g,0,y,1280,y,p[2]+'33',3);
    } else {
      for(const x of [85,290,890,1095]){
        rect(g,x,170,105,258,'#1a2427aa');
        for(let y=179;y<420;y+=26)stroke(g,x+4,y,x+101,y,p[2]+'50',2);
      }
    }
    // Rear mural with raised metallic border; all city circuits retain a Capoeira Angola identity.
    ellipse(g,640,279,177,152,'#131d1ae0');
    ellipse(g,640,279,163,139,p[2]);
    ellipse(g,640,279,151,127,p[3]);
    ellipse(g,640,279,131,109,p[1]);
    g.save();g.translate(640,275);
    g.strokeStyle=p[2];g.lineWidth=4;
    g.beginPath();g.ellipse(0,0,103,79,0,-.7,2.45);g.stroke();
    g.beginPath();g.ellipse(0,0,103,79,0,2.65,5.75);g.stroke();
    g.fillStyle='#f5ebd6';g.textAlign='center';
    g.font='bold 43px Georgia, serif';g.fillText('RODA',0,5);
    g.font='bold 16px sans-serif';g.fillText('CAPOEIRA ANGOLA',0,34);
    g.restore();
    // Country-specific house banners, berimbau and hand-drum silhouettes.
    for(const x of [231,1049]){
      rect(g,x-31,162,62,150,p[2]);
      rect(g,x-25,170,50,132,p[0]);
      g.fillStyle='#eee2bf';g.textAlign='center';g.font='bold 12px sans-serif';
      g.fillText('AXÉ',x,214);
      ellipse(g,x,255,15,15,p[2]);
    }
    berimbau(g,26,203,p[2],false);berimbau(g,1248,203,p[2],true);
    pandeiro(g,89,379,p[2]);pandeiro(g,1191,379,p[2]);
    // Decorative stage benches, raised at either side of the actual combat space.
    for(const x of [24,1053]){
      rect(g,x,424,203,21,'#1b2422');
      rect(g,x+16,409,171,15,p[4]);
      for(const k of [30,161])rect(g,x+k,440,11,29,'#161b19');
    }
    // Perspective wood, stone, or laminate floor: full enclosed lower surface.
    g.fillStyle=p[4];g.beginPath();g.moveTo(0,459);g.lineTo(1280,459);
    g.lineTo(1280,660);g.lineTo(0,660);g.fill();
    const floor=g.createLinearGradient(0,458,0,660);
    floor.addColorStop(0,'#171a19a0');floor.addColorStop(.24,'#ffffff13');
    floor.addColorStop(1,'#080c0a9a');
    rect(g,0,459,1280,201,floor);
    for(let y=469;y<665;y+=(y<530?17:33))stroke(g,0,y,1280,y,'#161a1955',2);
    for(let x=-950;x<2400;x+=170){
      stroke(g,640+(x-640)*.2,460,x,660,'#f7d9a527',2);
    }
    // Spotlit playable roda floor, with no scenery obstructing fighters.
    const spot=g.createRadialGradient(640,553,50,640,553,480);
    spot.addColorStop(0,'#ffdfaa46');spot.addColorStop(1,'#ffdfaa00');
    rect(g,100,460,1080,200,spot);
    for(const x of [285,640,995])light(g,x,77,p[2]);
    // Bolted columns and foreground top fascia make the enclosure unmistakable.
    for(const x of [0,1254]){
      rect(g,x,125,26,335,p[3]);
      for(const y of [170,330,440])rect(g,x+4,y,18,5,p[2]);
    }
    rect(g,0,0,1280,17,'#121719');
    // Soft indoor contrast gradient rather than the previous outdoor foliage and sky.
    const fade=g.createLinearGradient(0,0,0,660);
    fade.addColorStop(0,'#070b0d8a');fade.addColorStop(.34,'#00000000');
    fade.addColorStop(.87,'#00000000');fade.addColorStop(1,'#070b0d75');
    rect(g,0,0,1280,660,fade);
    return c;
  }

  window.drawArena = function indoorRodaArena(...args){
    const id=Number(activeStage);
    const paintedRoom=customRooms[id-22];
    if(paintedRoom?.naturalWidth){
      ctx.drawImage(paintedRoom,0,0,W,H);
      return;
    }
    if ([18,19,21].includes(id) || id<0 || id>=rooms.length) {
      return oldDrawArena.apply(this,args);
    }
    if (!cache.has(id)) cache.set(id,paint(id));
    ctx.drawImage(cache.get(id),0,0,W,H);
  };

  window.RODAIndoorArenas=Object.freeze({
    surface(id){
      const image=customRooms[id-22] || (id===21?skullStudioImage:[18,19].includes(id)?privateArenaImages[id-18]:null);
      if(image)return image.naturalWidth?image:null;
      if(!cache.has(id))cache.set(id,paint(id));
      return cache.get(id);
    },
    version:'4.2',converted:[...Array(18).keys(),20],
    retainedIndoor:[18,19,21],name:(index)=>rooms[index]||''
  });
})();
