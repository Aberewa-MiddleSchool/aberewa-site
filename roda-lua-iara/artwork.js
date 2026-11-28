const rodaFighterArt = (() => {
  const root = new URL('.', document.currentScript.src);
  const asset = (name, file) => {
    const image = new Image();
    image.src = new URL(name === 'nala' ? '../roda-nala/' + file : file, root);
    return image;
  };
  const skins = Object.fromEntries(Object.entries(rodaFighterFrames).map(([name, frames]) => [
    name,
    {
      frames,
      atlas: asset(name, name + '-combat.webp'),
      portrait: asset(name, name + '-portrait.webp')
    }
  ]));
  const sweepAtlas = asset('nala', 'nala-sweeps.webp');
  const filename = new WeakMap();
  const loaded = image => image?.complete && image.naturalWidth > 0;
  const active = skin => loaded(skin?.atlas) && loaded(skin?.portrait);
  const ready = Promise.allSettled([
    sweepAtlas.decode(),
    ...Object.values(skins).flatMap(skin => [skin.atlas.decode(), skin.portrait.decode()])
  ]);
  const standard = id => id === 4 ? skins.lua : id === 5 ? skins.iara : id === 6 ? skins.nala : null;
  const alternate = id => id === 4 ? skins['lua-pink'] : id === 5 ? skins['iara-slayer'] : null;
  const canSelectAlternate = id => active(alternate(id));
  function getSkin(id, useAlternate) {
    if (useAlternate && canSelectAlternate(id)) return alternate(id);
    const skin = standard(id);
    return active(skin) ? skin : null;
  }
  function portrait(id, useAlternate = false) {
    return getSkin(id, useAlternate)?.portrait;
  }
  function face(canvas, id, useAlternate) {
    const image = portrait(id, useAlternate);
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
    const skin = getSkin(p.id, p.luaIaraAlternate);
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
  function drawNalaSweep(p, row, frame) {
    if (!loaded(sweepAtlas)) return false;
    const tile = 256;
    ctx.save();
    ctx.translate(p.x, 590 - p.y);
    ctx.scale(p.dir, 1);
    ctx.drawImage(sweepAtlas, frame * tile, row * tile, tile, tile, -128, -238, tile, tile);
    ctx.restore();
    return true;
  }
  return { ready, canSelectAlternate, face, portrait, draw, drawNalaSweep };
})();
