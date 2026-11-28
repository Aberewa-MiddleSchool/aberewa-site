const luaIaraArt = (() => {
  const root = new URL('.', document.currentScript.src);
  const asset = file => {
    const image = new Image();
    image.src = new URL(file, root);
    return image;
  };
  const skins = Object.fromEntries(Object.entries(luaIaraFrames).map(([name, frames]) => [
    name,
    {
      frames,
      atlas: asset(name + '-combat.webp'),
      portrait: asset(name + '-portrait.webp')
    }
  ]));
  const filename = new WeakMap();
  const loaded = image => image?.complete && image.naturalWidth > 0;
  const active = skin => loaded(skin?.atlas) && loaded(skin?.portrait);
  const ready = Promise.allSettled(Object.values(skins).flatMap(skin => [
    skin.atlas.decode(), skin.portrait.decode()
  ]));
  const standard = id => id === 4 ? skins.lua : id === 5 ? skins.iara : null;
  function getSkin(id, pink) {
    if (id === 4 && pink && active(skins['lua-pink'])) return skins['lua-pink'];
    const skin = standard(id);
    return active(skin) ? skin : null;
  }
  function portrait(id, pink = false) {
    return getSkin(id, pink)?.portrait;
  }
  function face(canvas, id, pink) {
    const image = portrait(id, pink);
    if (!image) return false;
    const g = canvas.getContext('2d');
    const width = image.naturalWidth;
    const height = width * canvas.height / canvas.width;
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.drawImage(image, 0, image.naturalHeight * .14, width, height,
      0, 0, canvas.width, canvas.height);
    return true;
  }
  function draw(p, render) {
    const skin = getSkin(p.id, p.luaPink);
    if (!skin) {
      render(p);
      return;
    }
    // Keep the legacy renderer's exact timing, destination rectangle and floor anchor.
    const nativeDraw = ctx.drawImage;
    ctx.drawImage = function(image, ...coords) {
      if (coords.length === 8 && image.src) {
        if (!filename.has(image)) {
          filename.set(image, new URL(image.src).pathname.split('/').at(-1));
        }
        const rect = skin.frames[filename.get(image) + ':' + coords.slice(0, 4).join(',')];
        if (rect) {
          nativeDraw.call(this, skin.atlas, ...rect, ...coords.slice(4));
          return;
        }
      }
      nativeDraw.call(this, image, ...coords);
    };
    try {
      render(p);
    } finally {
      ctx.drawImage = nativeDraw;
    }
  }
  return { ready, canSelectPink: () => active(skins['lua-pink']), face, portrait, draw };
})();
