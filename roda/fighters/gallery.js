(() => {
  const gallery=document.querySelector('.fighter-gallery-grid');
  for(const id of playableIds){
    const card=document.createElement('details'),heading=document.createElement('summary');
    const photo=document.createElement('canvas');
    photo.width=320;photo.height=220;
    photo.setAttribute('aria-label',profiles[id].name);
    const draw=()=>paintedCard(photo,id);
    if(costumes[id].naturalWidth)draw();else costumes[id].addEventListener('load',draw,{once:true});
    heading.append(photo,profiles[id].name);
    const bio=document.createElement('p');
    bio.textContent=(id>=16?'Afro-Brazilian · ':'')+profiles[id].home+' · '+fighterTraits[id].style;
    const home=document.createElement('p');
    home.textContent='Home arena · '+stageNames[homeArena[id]];
    if(id===18)bio.textContent+=' · A fictional fighter inspired by the Bahian sugar coast in the late 1500s.';
    const list=document.createElement('ol');
    for(const move of characterMoves[id]){
      const line=document.createElement('li');
      line.textContent=move.button+' · '+move.name;
      list.append(line);
    }
    card.append(heading,bio,home,list);gallery.append(card);
  }
})();
