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
  const artRoot=new URL('arenas/',document.currentScript.src);
  const artwork=rooms.map((_,id)=>{
    if(id===18 || id===19)return privateArenaImages[id-18];
    if(id===21)return skullStudioImage;
    const image=new Image();
    image.src=new URL(id+'.webp',artRoot);
    return image;
  });
  for(const image of artwork){
    image.addEventListener('load',()=>window.RODAStageBrowser?.refresh(),{once:true});
  }
  function surface(id){
    const room=artwork[id];
    if(room?.naturalWidth)return room;
    const hall=artwork[19];
    return hall?.naturalWidth?hall:null;
  }
  window.drawArena=function(){
    // Keep the original lighting and decorative animation in the private studios.
    if([18,19,21].includes(activeStage) && artwork[activeStage].naturalWidth){
      oldDrawArena();return;
    }
    const room=surface(activeStage);
    if(room)ctx.drawImage(room,0,0,W,H);
    else{ctx.fillStyle='#19231d';ctx.fillRect(0,0,W,H);}
  };
  window.RODAIndoorArenas=Object.freeze({
    surface,version:'5',converted:rooms.map((_,id)=>id).filter(id=>![18,19,21].includes(id)),
    retainedIndoor:[18,19,21],name:id=>rooms[id]||''
  });
})();
