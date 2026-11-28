const houseComic = (() => {
  const root = new URL('.', document.currentScript.src);
  const trigger = document.getElementById('roda-house-open');
  const reader = document.getElementById('roda-house');
  const image = document.getElementById('roda-house-art');
  const caption = document.getElementById('roda-house-caption');
  const pageNumber = document.getElementById('roda-house-page');
  const previous = document.getElementById('roda-house-prev');
  const next = document.getElementById('roda-house-next');
  const pages = [
    { alt: 'Lua and Iara arrive at a pink townhouse with a moving box.', line: 'Lua brought Iara to a little pink house with one moving box between them.' },
    { alt: 'Lua shows Iara the purchase paperwork at the front door.', line: '“My family just gave me my trust fund,” Lua said. “I used it to buy this place for us.”' },
    { alt: 'The living room is filled with pink Ranger collectibles and diamond patterns.', line: 'Iara took in the pink sofa, the diamond rug, and the display case. “Save some room for my Ranger Slayer collection.”' },
    { alt: 'Lua smiles and hands Iara a house key with a pink diamond tag.', line: '“Pink Ranger fans live here now.”', speaker: 'Lua' }
  ];
  let index = 0;

  function paint() {
    const page = pages[index];
    image.src = new URL('house-' + (index + 1) + '.webp', root);
    image.alt = page.alt;
    caption.replaceChildren();
    if (page.speaker) {
      const name = document.createElement('strong');
      name.textContent = page.speaker + ' ';
      caption.append(name);
    }
    caption.append(page.line);
    pageNumber.textContent = (index + 1) + ' / ' + pages.length;
    previous.textContent = index === 0 ? 'B · MAIN MENU' : 'B · PREVIOUS PAGE';
    next.textContent = index === pages.length - 1 ? 'A · MAIN MENU' : 'A · NEXT PAGE';
    reader.scrollTop = 0;
  }

  function open() {
    if (scene !== 'menu') return;
    index = 0;
    scene = 'house-comic';
    show('roda-house');
    paint();
    next.focus();
  }

  function close() {
    scene = 'menu';
    show('menu');
    trigger.focus();
  }

  function advance() {
    if (index === pages.length - 1) close();
    else {
      index++;
      paint();
    }
  }

  function back() {
    if (index === 0) close();
    else {
      index--;
      paint();
    }
  }

  trigger.addEventListener('click', open);
  previous.addEventListener('click', back);
  next.addEventListener('click', advance);
  reader.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
  });
  return { open, advance, back };
})();
