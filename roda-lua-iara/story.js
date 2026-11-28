const luaIaraStory = (() => {
  const root = new URL('.', document.currentScript.src);
  const chapters = {
    before: {
      title: 'One game before we go',
      destination: 'lua-iara-fight',
      panels: [
        ['Lua and Iara touch hands outside the capoeira hall.', 'Lua and Iara are both 23. They fell in love in the time they spent together after the roda.'],
        ['They stand on a doorstep with their overnight bags.', 'When their parents found out, both families told them to leave home.'],
        ['Iara takes Lua’s hand as they sit with their bags.', 'Lua: “I don’t know where we’re going.” Iara: “We’ll figure it out together.”'],
        ['Lua and Iara face each other in the roda.', 'Iara: “One game before we go?” Lua: “You know I never let you win.”']
      ]
    },
    after: {
      title: 'We go together',
      destination: 'lua-iara-result',
      panels: [
        ['Lua and Iara smile as the bout ends.', 'The berimbau calls them back to the foot of the roda. They’re both catching their breath and smiling.'],
        ['They lean against each other at the edge of the roda.', 'Lua: “You were watching my feet.” Iara: “Only because you caught me looking at you.”'],
        ['They sit beside two bags in the studio doorway.', 'Iara: “We still need somewhere to sleep.” Lua: “Let’s ask if we can stay here tonight.”'],
        ['Lua and Iara walk down the street hand in hand.', 'They pick up their bags and leave together, hand in hand.']
      ]
    }
  };

  function isPair(first, second) {
    return (first === 4 && second === 5) || (first === 5 && second === 4);
  }

  function isMatch() {
    return (mode === 'solo' || mode === cinzaRewards.versus) && isPair(...chosen);
  }

  function open(after) {
    const key = after ? 'after' : 'before';
    const { title, destination, panels } = chapters[key];
    const artwork = panels.map(([, caption], index) => [
      new URL(key + '-' + (index + 1) + '.webp', root).href, caption
    ]);
    openShortChapter(title, 'Salvador, Bahia', artwork, 'LUA & IARA',
      after ? 'BOUT COMPLETE' : 'LUA VS IARA', '', destination);
    const images = document.querySelectorAll('#story .roda-story-panel img');
    images.forEach((image, index) => { image.alt = panels[index][0]; });
    document.querySelector('#storyadvance').textContent = after ? 'A · MATCH RESULTS' : 'A · ENTER THE RODA';
    const page = document.querySelector('#story');
    page.scrollTop = 0;
    if (arcadeAutoplay) storyTime = 900;
    else if (page.scrollHeight > page.clientHeight) {
      document.querySelector('#storyhint').textContent = 'D-PAD ↑ / ↓ TO SCROLL · A TO CONTINUE · START TO PAUSE';
    }
  }

  return { isPair, isMatch, open };
})();

profiles[4].age = 23;
profiles[5].age = 23;
