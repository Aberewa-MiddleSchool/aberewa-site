'use strict';
let storyTime=0,storyEnding=false;
const sentinelCaptions=[
 'Nestor steps aside. From the other side of the glass comes the same two-note call that started the tournament.',
 'In Salvador, 2323, Aisha rests a hand on the mirror. Every exchange the school has played is recorded here.',
 'She watched the last roda of her own time disappear. She built this archive so that it could never happen again.',
 'The champion asks for the recordings back. Aisha shakes her head. “Once that door opens, I lose control of what survives.”',
 'She clears the studio floor. “Win the roda and I will open the archive. Until then, the mirror answers to me.”',
 'They meet at the foot of the berimbau. On both sides of the glass, the musicians wait for the first step.'
];
function paintSentinelPanel(){
 const fromAisha=chosen.includes(21)&&(mode!=='solo'||arcadeIndex===0);
 sentinelCaptions.forEach((caption,index)=>{
   const art=$('#sentinel-art-'+(index+1));
   art.style.backgroundPosition=`${(index%3)*50}% ${Math.floor(index/3)*100}%`;
   $('#sentinel-caption-'+(index+1)).textContent=caption;
 });
 $('#storychapter').textContent='THE SENTINEL · SIX-PANEL COMIC';
 $('#storyadvance').textContent='A · FACE AISHA';
 $('#story .story-controls span').textContent=arcadeAutoplay?'WATCH ARCADE':'READ AT YOUR OWN PACE';
 storyTime=arcadeAutoplay?300:Infinity;
}
function tournamentChapter(opponent){
 const fighter=profiles[opponent].name, home=profiles[opponent].home;
 if(chosen[0]===21 && opponent===14)return ['THE LAST WORD',home,
  'Mestre Maré has carried a berimbau through the mirror. He asks Aisha who gave her the right to keep every song.',
  'She offers one last bout. If she wins, the archive stays under her care.',2,10];
 if(chosen[0]===21)return ['THE ARCHIVIST',home,
  'Aisha comes to record '+fighter+' for her archive in Salvador, 2323.',
  'Before sharing a song, '+fighter+' insists she join the circle and answer it in person.',0,3];
 return ['THE ROAD TO THE MIRROR',home,
  'Aisha has sealed the school’s recordings inside her studio mirror. The musicians will need a chorus strong enough to reach her.',
  fighter+' knows part of the answering rhythm. Play a roda together before carrying it on to the next studio.',5,2];
}
function openStory(ending=false){if(ending){openComicEnding();return}storyEnding=ending;scene='story';show('story');storyTime=ending?1500:1080;
 const opponent=mode==='solo'?arcadeOrder[arcadeIndex]:chosen[1];
 const chapter=tournamentChapter(opponent);
 $('#storychapter').textContent='CHAPTER '+(arcadeIndex+1)+' / '+arcadeOrder.length;
 $('#storytitle').textContent=chapter[0];$('#storyplace').textContent=chapter[1];$('#storycopy1').textContent=chapter[2];$('#storycopy2').textContent=chapter[3];
 const cells=[chapter[4],chapter[5]];
 if(!isEnforcer(chosen[0])&&arcadeIndex>=16&&arcadeIndex<=18)cells[0]=12+arcadeIndex-16;
 cells.forEach((cell,i)=>{$('#storyart'+(i+1)).style.backgroundPosition=`${(cell%4)*100/3}% ${Math.floor(cell/4)*100/3}%`});
 if(isEnforcer(chosen[0]) && arcadeIndex===arcadeOrder.length-1){
   for(let i=0;i<2;i++){
     const art=$('#storyart'+(i+1));art.style.backgroundImage='url("'+new URL(i===0?'cast/end-'+chosen[0]+'-0.webp':'../arenas/17.webp',costumeRoot).href+'")';art.style.backgroundSize='cover';art.style.backgroundPosition='center';
   }
 }else for(const art of [$('#storyart1'),$('#storyart2')]){
   art.style.backgroundImage='url("'+new URL('cast/chapters.webp',costumeRoot).href+'")';art.style.backgroundSize='400% 400%';
 }
 const opp=ending?chosen[0]:mode==='solo'?arcadeOrder[arcadeIndex]:chosen[1];const canvas=$('#storyportrait');let card=$('#story-opponent-card');if(!card){card=new Image();card.id='story-opponent-card';canvas.after(card)}canvas.hidden=true;card.src=cardUrl(opp);card.alt=profiles[opp].name;$('#storyopponent').textContent=ending?profiles[chosen[0]].name+' · STUDIO CHAMPION':profiles[opp].name+' · NEXT OPPONENT';
 $('#storyrole').textContent=ending?'The victory belongs to the whole circle.':profiles[opp].home+' · '+fighterTraits[opp].style;
 if(!ending&&chosen[0]>=11 && chosen[0]<=14){$('#storyrole').textContent+=' · Tournament route';}

 const sentinel=opponent===21;
 $('#sentinel-strip').hidden=!sentinel;
 $('#story .comic-grid').style.display=sentinel?'none':'';
 $('#story').classList.toggle('sentinel-mode',sentinel);

 $('#storyadvance').textContent='A · FACE '+profiles[opponent].name.toUpperCase();$('#sessionlabel').textContent=ending?'THE STUDIO SURVIVES':`STORY · CHAPTER ${arcadeIndex+1} / ${arcadeOrder.length}`;setStageMusic(ending?0:activeStage);if(sentinel)paintSentinelPanel();
}
function advanceStory(){if(storyEnding){advanceComicEnding();return}if(meetsDalva()){openDalvaComic();return}scene='fight';show(null);roundIntro=true;introDuration=round===1?270:120;announceTime=introDuration;announcement=round===1?'ENTER THE RODA':roundLabel();}

let comicPage=0;
const endingCaptions=[
 'Across two centuries the instruments fall silent. Aisha takes her hand off the glass.',
 'The first sound through the open mirror is an ordinary one: a student counting the beat for a friend.',
 'In Curitiba, Meilin makes room for the musicians who kept playing until the mirror opened.',
 'Mestre hears a song he learned as a child, with a verse someone in 2323 has added.',
 'The recordings return to the people who made them. Each school decides which songs to share.',
 'Dalva calls the next player into the circle. This time the mirror carries an invitation.'
];
const aishaEnding=[
 'Mestre lowers his guard. Aisha has won the last bout on the school’s side of the glass.',
 'She returns to Salvador with the recordings. No other person holds a key.',
 'Meilin opens her hall to the players who choose to stay behind.',
 'Mestre gathers them for a song nobody has recorded yet.',
 'In 2323, Aisha listens for a chorus she remembers. This time, nothing comes through.',
 'Across the centuries the roda continues, somewhere her mirror cannot reach.'
];
function openComicEnding(){storyEnding=true;comicPage=0;scene='story';show('ending');setStageMusic(chosen[0]===21?27:19);paintComicEnding();}
function paintComicEnding(){
  storyTime=Infinity;
  const id=chosen[0],guard=false,captions=id===21?aishaEnding:endingCaptions;
  const image=$('#endingimage'),caption=captions[comicPage];
  image.src=comicPage===0?cardUrl(21):comicPage===1?new URL('../arenas/28.webp',costumeRoot).href:new URL('cast/studio-end-'+comicPage+'.webp',costumeRoot).href;
  image.alt=caption;$('#endingcaption').textContent=caption;
  $('#endingcount').textContent=(guard?profiles[id].name.toUpperCase()+' · ':'')+'EPILOGUE · '+(comicPage+1)+' / '+captions.length;
  $('#endingnext').textContent=comicPage===captions.length-1?'A · FINISH COMIC':'A · NEXT STRIP';
  $('#endingprev').disabled=comicPage===0;
}
function advanceComicEnding(){if(comicPage<endingCaptions.length-1){comicPage++;paintComicEnding();return}storyEnding=false;scene='menu';show('menu');setStageMusic(-1);if(typeof reviewReset==='function')reviewReset();}
