/* Illustrated post-bout story for A Última Volta. */
const cinzaComics = (() => {
  const pages = [
  {
    "title": "Room at the door",
    "alt": "COXA. Morning. I brought Lídia’s dominoes. DONA CINZA. Turn sideways, big girl. Maré just paid for that door. COXA. It opens both ways, madame. Step aside."
  },
  {
    "title": "The entry list",
    "alt": "DONA CINZA. One line for each player. Shall I save you two? COXA. Give me the chalk. COXA. C-O-X-A. Look. It fits."
  },
  {
    "title": "Two chairs",
    "alt": "DONA CINZA. I found you a seat, Coxa. Well, two. COXA. Madame Luz and Dona Bia have been standing all morning. COXA. Ladies, these are yours. I came to play."
  },
  {
    "title": "At the foot of the bow",
    "alt": "DONA CINZA. Bring all of you to the roda. I want to see the floor hold. COXA. Let me finish tying this boot. COXA. There. Still asking?"
  },
  {
    "title": "Half a turn",
    "alt": "DONA CINZA. You’ll need a whole chorus to turn those hips. COXA. Start singing. COXA. You missed it. I’m already here."
  },
  {
    "title": "Coffee for one",
    "alt": "COXA. Lídia used to put orange peel in the pot? DONA CINZA. She did. Drink up. I want another game. COXA. Then you have time to tell me how much peel."
  },
  {
    "title": "Between the lines",
    "alt": "DONA CINZA. Stay inside these lines. If you can. COXA. My boots are in. You want to measure the rest of me, too? COXA. Here’s your chalk. Draw a roda this time."
  },
  {
    "title": "The loose board",
    "alt": "DONA CINZA. With your weight, that old board ought to sing. COXA. I didn’t hear it. Your turn. THE FLOOR. CREEEAK."
  },
  {
    "title": "Front row",
    "alt": "DONA CINZA. Move those chairs back. Coxa needs the extra space. AT THE RINGSIDE. Nobody moves. COXA. Stay where you are, Dona Bia. You promised to keep score."
  },
  {
    "title": "In front of everybody",
    "alt": "DONA CINZA. At your weight? You’re not a real capoeirista, Coxa. COXA. I thought when I came here… BY THE SHUTTERS. She tries to finish. The tears come first. Nobody in the room says a word."
  },
  {
    "title": "Outside the circle",
    "alt": "COXA. I know what I look like. I didn’t know how much it would hurt to hear her say it. ON THE BENCH. For a while she just rolls the double six between her palms. COXA. I still want to play today. Let me get this knot out."
  },
  {
    "title": "The door again",
    "alt": "DONA CINZA. Still crying, big girl? COXA. I cried. You saw me. Everybody did. COXA. Now move your elbow. I’d like to get through."
  },
  {
    "title": "The tailor",
    "alt": "DONA CINZA. Tell me, does your tailor charge by the metre? COXA. He charges extra for opinions like yours. COXA. You couldn’t afford the fitting."
  },
  {
    "title": "At the chalk mark",
    "alt": "DONA CINZA. Show me how much room that turn really takes. COXA. Watch the chalk by my heel. DONA CINZA. Still there. Do it again."
  },
  {
    "title": "Two cups",
    "alt": "DONA CINZA. I called for another game. Did you hear me? COXA. I did. Your mouth sounds dry. AT THE WATER JUG. For once, Doralice takes the cup and lets her pass."
  },
  {
    "title": "In the glass",
    "alt": "DONA CINZA. Hard to get past anybody your size, isn’t it? COXA. I can see you in the window. COXA. Now you can see me leaving."
  },
  {
    "title": "On the back",
    "alt": "MESTRE MARÉ. Coxa, is that you? I’d know Doralice’s grin anywhere. Look at you pulling on her sleeve. IN DORALICE’S HAND. Paris. For my niece, Coxa, who hid the double six in my shoe. Love, Tia Doralice. COXA. Yeah, Mestre. Dona Cinza is my aunt. I wanted you to get to know me first."
  },
  {
    "title": "A circle for two",
    "alt": "DONA CINZA. There. A circle big enough even for you. COXA. You left someone out. COXA. There. Now you have to play in it, too."
  },
  {
    "title": "The front row",
    "alt": "DONA CINZA. One more, big girl. They came to see it. COXA. You all heard what she said. Is that what you came for? HEATHER. Coxa, sit with me a minute. I heard her. I should’ve said something then."
  },
  {
    "title": "The offer",
    "alt": "DONA CINZA. Euros, Coxa. All yours if you give me your word you’ll never train Capoeira again. ON THE CLUB FLOOR. Coxa smacks the notes out of Dona Cinza’s hand. They scatter under the chairs. COXA. Leave them there. You asked for one last game. Come play."
  },
  {
    "title": "Holding my own",
    "alt": "THE LAST GAME. Cinza turns. Coxa ducks under her kick and comes up facing her. They play until the berimbau calls them back. HEATHER. You came up looking her right in the eye. Maré saw it. Meilin saw it. We were right there, Coxa. COXA. All day I wondered what you saw when you looked at me. You saw me out there holding my own. That means something to me."
  }
];
  // The Cinza route has no mirror matches. Its shorter cut keeps every
  // dependent scene: the public insult, its aftermath, the offer and the answer.
  const shortCut = [1,2,3,6,8,9,10,11,12,14,17,18,19,20,21];
  function open(replay=false){
    const local=mode===cinzaRewards.versus;
    const bout=local?cinzaRewards.bout:arcadeIndex;
    const total=local?pages.length:arcadeOrder.length;
    const offset = !local && arcadeOrder[0]===CONSTANCA_ID ? 1 : 0;
    const chapter = Math.max(0,bout-offset), count = total-offset;
    const number = replay ? pages.length : count===shortCut.length
      ? shortCut[chapter] : Math.min(pages.length,chapter+1);
    const page = pages[number-1];
    const source = cinza.asset('comics/page-'+String(number).padStart(2,'0')+'.webp');
    const destination = replay ? 'cinza-score' : 'cinza-result';
    const label = replay ? 'CAMPAIGN ENDING' : 'BOUT '+(bout+1)+' OF '+total+' COMPLETE';
    openCoxaPage({...page,source},'COXA & DONA CINZA',label,'A Última Volta',destination);
    $('#storyadvance').textContent=replay?'A · RETURN TO SCORE':'A · MATCH RESULTS';
  }
  return {open};
})();
