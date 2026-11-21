'use strict';
const storyChapters=[
['THE LETTER','Salvador · The studio','A stranger delivers an ultimatum: hold his tournament, defeat his three hired fighters, and complete one final test—or Mestre Maré’s studio disappears forever.','The sixteen women who train here agree to compete. The qualifiers will reveal who is ready to carry everyone’s future.',0,1],
['A PROMISE, NOT A FEUD','Recife · First journey','The studio fighters are not enemies. Each bout is a demanding test of timing, courage, and restraint. Losing a match does not mean leaving the cause.','The defeated fighter joins the travelling support roda. Every victory brings another ally to the champion’s corner.',3,4],
['WHAT THE ELDERS KEEP','Cachoeira · Old lessons','The studio holds more than equipment: it holds lessons, meals, friendships, and generations of memory. Celina refuses to let a stranger erase it.','Experience tests the contender’s patience. Power alone will not win the trials ahead.',5,2],
['UNDER THE LANTERNS','São Luís · The watchers','The stranger’s observers arrive. They want angry rivals; instead, they find women who help each other stand after every fall.','The qualifiers continue in public rodas so the stranger cannot change the results in secret.',6,3],
['THE RIVER ROUTE','Belém · Changing rhythms','Rain delays the journey, but the next roda still forms. Lua insists the champion must learn to read uncertainty instead of rushing through it.','The group discovers that the stranger has wagered on their failure. His confidence becomes their opening.',7,8],
['HOLD THE CURRENT','Manaus · A wider circle','News of the threat travels along the river. Another community offers a place to play and witnesses to record the result.','Iara reminds the group that adapting does not mean surrendering. Their solidarity is becoming harder to ignore.',7,2],
['THE CITY LISTENS','Rio · Public ground','With each qualifier, more people hear about the studio. The stranger can no longer make the tournament disappear behind closed doors.','A champion must handle pressure without losing control. The next exchange tests that balance.',8,10],
['A PLACE FOR EVERY BODY','Fortaleza · The wind turns','Short reach, long reach, speed, weight: the studio’s strength has never belonged to one kind of fighter. Each contender brings a different answer.','The champion learns from everyone she faces. The tournament is becoming a shared defence of their home.',2,4],
['THE HIDDEN CLAUSE','Olinda · Read the fine print','Jaci finds the stranger’s concealed final condition: after his three fighters, the champion must face the mystery man himself before witnesses.','Maré warns the champion: “He has hidden behind his fighters long enough. His own roda is the final test.”',9,1],
['NO ONE WALKS ALONE','Curitiba · Meilin’s private hall','Meilin opens her private training hall to the studio. Her wealth cannot buy the tournament’s result; everyone must earn their place. Friends who lost earlier now coach, accompany, and protect the remaining contender.','The stranger expected jealousy to divide the studio. Instead, its circle grows larger.',8,2],
['BY THE WATER','Salvador · Tainá’s boathouse','Tainá clears the boat racks and invites the travellers inside.','The first exchange belongs to the fighter who can wait.',0,3],
['THE REHEARSAL','Recife · Luzia’s cinema','Luzia rolls up the screen and makes space for the musicians.','From the back row, the smallest change in rhythm carries.',3,4],
['A MEMORY IN THE TIMBER','Recôncavo da Bahia · Dalva’s engenho','Dalva’s roda opens a window onto Bahia’s past.','The witnesses carry the memory of the people who laboured here into the next bout.',5,2],
['CLAY AND FIRE','Belo Horizonte · Neide’s atelier','Neide moves the unfired bowls away from the circle.','The potters close the workshop doors and stay to witness the bout.',6,3],
['BEFORE THE PARADE','Rio de Janeiro · Marília’s workshop','Marília draws the costumes aside to clear the floor.','The last stitches can wait until the players finish their exchange.',8,2],
['THE DECIDING RODA','Curitiba · Meilin’s conservatory','In Meilin’s conservatory, one last qualifying test settles who represents the studio. A returning rival demands a rematch: the champion must prove the result was no accident.','When the music ends, the studio stands behind its representative. The stranger’s challengers are next.',10,3],
['THE MYSTERY MAN’S THREE','Porto Alegre · Bento’s denim workroom','The mystery man sends three hired fighters. Bento insists he has a plan, Caio says he can improve it, and Nestor quietly asks whether either man read the contract.','Bento strides toward the roda with his chest out. Caio starts to follow, then checks which way everyone else is facing.',11,9],
['CAIO · THE SECOND CHALLENGER','Natal · Working for the mystery man','Bento bows out after an overconfident opening and one very noticeable stumble. Caio jogs in, takes the wrong angle, and turns it into a flourish before anyone can ask.','“That was intentional,” Caio says. Nestor, waiting at the edge of the roda, gives him a patient look.',12,6],
['NESTOR · THE LAST CHALLENGER','Ouro Preto · Working for the mystery man','Caio’s flourish ends with both feet pointing the wrong way. Nestor becomes the last hired fighter, adjusts his shirt, and takes a careful moment before stepping into the roda.','He studies the skull-marked door. “I assume the contract covers the door too?” The Mystery Man does not answer.',13,9],
['THE MIRROR DOOR','Salvador · 2323','','',0,1],
['THE MAN BEHIND THE THREAT','The grey-and-gold skull studio','You have defeated the hired challengers. One opponent remains: the mystery man himself. Enter his grey-and-gold studio and face him inside the skull-marked roda.','“You have defeated my fighters. Now face me.” Every attack is a three-hit power combination. Defeat him to complete Arcade mode.',14,2]
];
let storyTime=0,storyEnding=false;
let sentinelPanel=0;
const sentinelCaptions=[
  'Nestor steps aside. As the champion passes the skull-marked door, a berimbau sounds twice from the opposite wall.',
  'A turquoise line lights up the floor. Somewhere in Salvador, in 2323, Aisha hears her own two notes come back.',
  'For months, Aisha has been tuning her studio mirror to carry a roda across time. Tonight someone answers from the other side.',
  'Aisha steps through. “I’m Aisha. Usually I get my reflection. You’re the first person who’s ever answered.”',
  'She glances at the skull on the door. “Your business? It can wait a song, if you have one to spare.” She gestures toward her studio.',
  'The champion steps onto the maple floor. Aisha plants one foot behind her. “I’ve practiced with my reflection long enough. Let’s see what I miss when the other player has a mind of their own.”'
];
function paintSentinelPanel(){
 const p=sentinelPanel,art=$('#sentinel-art');
 art.style.backgroundPosition=(p%3*50)+'% '+(Math.floor(p/3)*100)+'%';
 $('#sentinel-caption').textContent=(chosen[0]===21||chosen[1]===21) && p===3
   ? 'Aisha meets her own eyes in the glass. “You crossed into 2026. I’m the reflection you used to practice with. Today I get to choose my own steps.”'
   : sentinelCaptions[p];
 $('#storychapter').textContent='THE SENTINEL · PANEL '+(p+1)+' / 6';
 $('#storyadvance').textContent=p===5?'A · FACE AISHA':'A · NEXT PANEL';
 $('#story .story-controls span').textContent=arcadeAutoplay?'WATCH ARCADE':'READ AT YOUR OWN PACE';
 storyTime=arcadeAutoplay?300:Infinity;
}
const guardEndings={
  11:[
    'Bento lowers his guard. Across the municipal arena, Mestre Maré is still watching his feet.',
    'The decision goes to Bento. Maré offers his hand. “You earned that one yourself.” Bento takes it.',
    'Outside, rain drums on the envelope carrying the result. Bento has held up his end of the bargain.',
    'The Mystery Man slides a ring of keys across the warehouse desk. “The school is yours to lock.”',
    'Bento sets the keys down. “I came here to collect my pay.” He takes the envelope and leaves the skull shirt behind.',
    'At dawn, he unlocks his own denim workshop. By noon, someone has brought him a pair of trousers to mend.'
  ],
  12:[
    'In Natal, Caio hears a thousand shoes stamp the floor as he faces Mestre Maré.',
    'Caio takes the decision. As he turns to the cameras, he catches Maré’s small nod and bows back.',
    'At the warehouse, his employer asks for the recording. “Give them a finish they will remember.”',
    'Caio watches the cut. The bow is gone. So is the hand that helped him up between rounds.',
    'At the bus stop, Caio posts the whole bout from his own phone. The first person to share it is standing beside him.',
    'As his bus pulls away, Caio sees two strangers replaying the bow. That is the finish he wants them to remember.'
  ],
  13:[
    'The crowd falls quiet for Nestor and Mestre Maré. Both men take their time entering the circle.',
    'Nestor wins. For a moment the two old players stay where they are, smiling at a trick each thought the other had forgotten.',
    'Back at the warehouse, the Mystery Man has another contract waiting. Nestor asks him for a pen.',
    'He writes a receipt for his last payment. His green skull shirt stays folded on the unsigned contract.',
    'Nestor reaches Ouro Preto just as the bakery on his street opens. For once, nobody is expecting him anywhere.',
    'On his own doorstep, he hears a drum two streets away. When he is ready, he decides, he will go and listen.'
  ]
};
function guardChapter(){
 const id=chosen[0], opponent=arcadeOrder[arcadeIndex],name=profiles[id].name;
 if(mode!=='solo'){
   const hired=[chosen[1],chosen[0]].find(isEnforcer);
   if(hired!=null)return storyChapters[16+hired-11];
 }
 if(arcadeIndex===arcadeOrder.length-1)return ['THE FINAL CONTRACT','Natal · Municipal tournament arena',
   name+' has won the right to face Mestre Maré. The Mystery Man watches from his warehouse. His hired fighter must earn the final decision alone.',
   'Maré sets his feet. “Your employer has had his say. Now, let me see your game.”',11,2];
 if(isEnforcer(opponent))return ['THE PRIVATE TRIAL',stageNames[activeStage],
   'The Mystery Man sends '+profiles[opponent].name+' to test '+name+' before the final appointment.',
   'Only one of his hired fighters will carry the contract into the last bout.',opponent+1,id+1];
 return [arcadeIndex===0?'THE ENVELOPE':'THE CHALLENGER’S ROAD',stageNames[activeStage],
   arcadeIndex===0?'At the warehouse, the Mystery Man gives '+name+' a sealed contract. Win the qualifiers, then defeat Mestre Maré in a public match.':
   name+' arrives for the next qualifier. Across the floor, '+profiles[opponent].name+' is already waiting.',
   'The ring officials call both players. The result will go on the public tournament record.',id+1,8];
}
function openStory(ending=false){if(ending){openComicEnding();return}storyEnding=ending;scene='story';show('story');storyTime=ending?1500:1080;
 const hiredSelection=mode!=='solo'&&chosen.some(isEnforcer);
 const sentinelSelection=mode!=='solo'&&chosen.includes(21);
 const chapter=ending?['THE DOORS STAY OPEN','Salvador · A new morning','Before the witnesses, the final result voids the stranger’s claim. His threat has failed. No fighter saved this place alone.','Mestre opens the doors. The women, their neighbours, and a new generation enter together. The unknown man vanishes—but the roda remains.',15,2]:hiredSelection?guardChapter():sentinelSelection?storyChapters[19]:isEnforcer(chosen[0])?guardChapter():storyChapters[arcadeIndex];
 $('#storychapter').textContent=ending?'EPILOGUE · THE STUDIO SURVIVES':`CHAPTER ${arcadeIndex+1} / ${arcadeOrder.length} · ${arcadeIndex<16?'THE QUALIFIERS':arcadeIndex<arcadeOrder.length-1?'THE HIRED CHALLENGERS':'THE FINAL BOSS'}`;
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
 if(!ending&&chosen[0]>=11 && chosen[0]<=14){$('#storyrole').textContent+=isEnforcer(chosen[0])?' · The hired fighter’s route':' · Mestre’s route';}
 configureFinalComic(!ending&&arcadeOrder[arcadeIndex]===15);
 const sentinel=arcadeOrder[arcadeIndex]===21||chosen[0]===21||chosen[1]===21;
 $('#sentinel-strip').hidden=!sentinel;
 $('#story .comic-grid').style.display=sentinel?'none':'';
 if(sentinel)sentinelPanel=0;
 if(isEnforcer(chosen[0]))$('#storychapter').textContent='CONTRACT · '+(arcadeIndex+1)+' / '+arcadeOrder.length;
 $('#storyadvance').textContent=isEnforcer(chosen[0])&&arcadeIndex===arcadeOrder.length-1?'A · FACE MESTRE MARÉ':ending?'A · RETURN TO TITLE':arcadeOrder[arcadeIndex]===15?'A · FIGHT THE MYSTERY MAN':'A · ENTER THE RODA';$('#sessionlabel').textContent=ending?'THE STUDIO SURVIVES':`STORY · CHAPTER ${arcadeIndex+1} / ${arcadeOrder.length}`;setStageMusic(ending?0:activeStage);if(sentinel)paintSentinelPanel();
}
function advanceStory(){if(!storyEnding && (arcadeOrder[arcadeIndex]===21||chosen[0]===21||chosen[1]===21) && sentinelPanel<5){sentinelPanel++;paintSentinelPanel();return}if(storyEnding){advanceComicEnding();return}if(meetsDalva()){openDalvaComic();return}scene='fight';show(null);roundIntro=true;introDuration=round===1?270:120;announceTime=introDuration;announcement=round===1?'ENTER THE RODA':roundLabel();}

let comicPage=0;
const endingCaptions=[
 'After the tournament, the mystery man takes and destroys the studio anyway.',
 'Back at the loading dock, Bento, Caio, and Nestor laugh as their employer’s truck pulls away.',
 'Meilin offers her two training areas, protected by security and beyond his claim.',
 'Mestre remembers: Meilin is rich. She welcomes everyone to continue training.',
 'A new home: the women and Mestre continue their roda in Meilin’s indoor studio.',
 'Dalva takes Mestre Maré’s hand. Celina, Sol and Meilin join the circle for the studio’s victory portrait.'
];
function openComicEnding(){storyEnding=true;comicPage=0;scene='story';show('ending');setStageMusic(isEnforcer(chosen[0])?21:19);paintComicEnding();}
function paintComicEnding(){
  storyTime=Infinity;
  const id=chosen[0],guard=isEnforcer(id),captions=guard?guardEndings[id]:endingCaptions;
  const image=$('#endingimage'),caption=captions[comicPage];
  image.src=new URL('cast/'+(guard?'end-'+id:'studio-end')+'-'+comicPage+'.webp',costumeRoot).href;
  image.alt=caption;$('#endingcaption').textContent=caption;
  $('#endingcount').textContent=(guard?profiles[id].name.toUpperCase()+' · ':'')+'EPILOGUE · '+(comicPage+1)+' / '+captions.length;
  $('#endingnext').textContent=comicPage===captions.length-1?'A · FINISH COMIC':'A · NEXT STRIP';
  $('#endingprev').disabled=comicPage===0;
}
function advanceComicEnding(){if(comicPage<endingCaptions.length-1){comicPage++;paintComicEnding();return}storyEnding=false;scene='menu';show('menu');setStageMusic(-1);if(typeof reviewReset==='function')reviewReset();}
