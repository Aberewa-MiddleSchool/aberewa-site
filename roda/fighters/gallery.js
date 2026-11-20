(() => {
  const gallery=document.querySelector('.fighter-gallery-grid');
  for(const id of playableIds){
    const card=document.createElement('details'),heading=document.createElement('summary');
    const photo=new Image();
    photo.src=new URL('portraits/'+id+'.webp',costumeRoot);
    photo.alt='';
    photo.loading='lazy';
    photo.width=320;
    photo.height=320;
    heading.append(photo,profiles[id].name);
    const bio=document.createElement('p');
    bio.textContent=(id>=16?'Afro-Brazilian · ':'')+profiles[id].home+' · '+fighterTraits[id].style;
    const home=document.createElement('p');
    home.textContent='Home arena · '+stageNames[homeArena[id]];
    if(id===18)bio.textContent+=' · Born 1568 · A fictional fighter inspired by the Bahian sugar coast in the late 1500s.';
    const list=document.createElement('ol');
    for(const move of characterMoves[id]){
      const line=document.createElement('li');
      line.textContent=move.button+' · '+move.name;
      list.append(line);
    }
    const watch=document.createElement('a');
    watch.href=new URL('#move-lab',location.href).href;
    watch.textContent='Watch '+profiles[id].name+'’s moves';
    watch.addEventListener('click',()=>{
      const select=document.getElementById('preview-fighter');
      select.value=String(id);select.dispatchEvent(new Event('change'));
    });
    card.append(heading,bio,home,list,watch);gallery.append(card);
  }
})();
