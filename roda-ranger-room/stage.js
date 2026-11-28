const rangerRoom = (() => {
  const root = new URL('.', document.currentScript.src);
  const arena = {
    name: 'RANGER FAN ROOM · SALVADOR',
    owners: [4, 5],
    file: new URL('stage.webp', root).href,
    theme: { title: 'Triumph in the Beat', src: new URL('triumph-in-the-beat.mp3', root).href }
  };
  const frames = [
    { file: 'amy-jo-johnson.webp', name: 'AMY JO JOHNSON', x: 486, y: 131, width: 135, height: 175 },
    { file: 'meghan-camarena.webp', name: 'MEGHAN CAMARENA', x: 714, y: 131, width: 136, height: 175 }
  ].map(frame => {
    const image = new Image();
    image.src = new URL(frame.file, root).href;
    return { ...frame, image };
  });

  function drawPortraits(ctx) {
    ctx.save();
    ctx.font = '700 11px "Barlow Condensed", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe3ad';
    for (const { image, name, x, y, width, height } of frames) {
      if (image.complete && image.naturalWidth > 0) {
        const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
        const cropWidth = width / scale, cropHeight = height / scale;
        const sx = (image.naturalWidth - cropWidth) / 2;
        const sy = (image.naturalHeight - cropHeight) * .25;
        ctx.drawImage(image, sx, sy, cropWidth, cropHeight, x, y, width, height);
      }
      ctx.fillText(name, x + width / 2, y + height + 23);
    }
    ctx.restore();
  }

  return { arena, drawPortraits };
})();
