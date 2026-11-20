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
['THE MYSTERY MAN’S THREE','Porto Alegre · Bento’s denim workroom','The studio qualifiers are over. The mystery man sends his three fighters: Bento, Caio, and Nestor. They work for him. Defeat them to reach the mystery man’s final challenge.','Bento steps into the roda as the first hired challenger. The studio stands behind you.',11,9],
['CAIO · THE SECOND CHALLENGER','Natal · Working for the mystery man','Bento is defeated. Caio now enters for the mystery man. His speed is dangerous, but his doubts about his employer are growing.','Two victories will leave the stranger with only one guard between the champion and the final clause.',12,6],
['NESTOR · THE LAST CHALLENGER','Ouro Preto · Working for the mystery man','Caio is defeated. Nestor is the mystery man’s last fighter. Beat his low traps and only the mystery man’s final challenge remains.','Defeat this final obstacle, and the stranger must allow the last match. The mystery man is waiting in his skull studio.',13,9],
['THE MAN BEHIND THE THREAT','The grey-and-gold skull studio','You have defeated the hired challengers. One opponent remains: the mystery man himself. Enter his grey-and-gold studio and face him inside the skull-marked roda.','“You have defeated my fighters. Now face me.” Every attack is a three-hit power combination. Defeat him to complete Arcade mode.',14,2]
];
let storyTime=0,storyEnding=false;
function openStory(ending=false){if(ending){openComicEnding();return}storyEnding=ending;scene='story';show('story');storyTime=ending?1500:1080;
 const chapter=ending?['THE DOORS STAY OPEN','Salvador · A new morning','Before the witnesses, the final result voids the stranger’s claim. His threat has failed. No fighter saved this place alone.','Mestre opens the doors. The women, their neighbours, and a new generation enter together. The unknown man vanishes—but the roda remains.',15,2]:storyChapters[arcadeIndex];
 $('#storychapter').textContent=ending?'EPILOGUE · THE STUDIO SURVIVES':`CHAPTER ${arcadeIndex+1} / ${arcadeOrder.length} · ${arcadeIndex<arcadeOrder.length-4?'THE QUALIFIERS':arcadeIndex<arcadeOrder.length-1?'THE HIRED CHALLENGERS':'THE FINAL BOSS'}`;
 $('#storytitle').textContent=chapter[0];$('#storyplace').textContent=chapter[1];$('#storycopy1').textContent=chapter[2];$('#storycopy2').textContent=chapter[3];
 [chapter[4],chapter[5]].forEach((cell,i)=>{$('#storyart'+(i+1)).style.backgroundPosition=`${(cell%4)*100/3}% ${Math.floor(cell/4)*100/3}%`});
 const opp=ending?chosen[0]:arcadeOrder[arcadeIndex];portrait($('#storyportrait'),opp);$('#storyopponent').textContent=ending?profiles[chosen[0]].name+' · STUDIO CHAMPION':profiles[opp].name+' · NEXT OPPONENT';
 $('#storyrole').textContent=ending?'The victory belongs to the whole circle.':profiles[opp].home+' · '+fighterTraits[opp].style;
 if(!ending&&chosen[0]>=11 && chosen[0]<=14){$('#storyrole').textContent+=' · Alternate-viewpoint tournament replay';}
 configureFinalComic(!ending&&arcadeOrder[arcadeIndex]===15);
 $('#storyadvance').textContent=ending?'A · RETURN TO TITLE':arcadeOrder[arcadeIndex]===15?'A · FIGHT THE MYSTERY MAN':'A · ENTER THE RODA';$('#sessionlabel').textContent=ending?'THE STUDIO SURVIVES':`STORY · CHAPTER ${arcadeIndex+1} / ${arcadeOrder.length}`;setStageMusic(ending?0:activeStage);
}
function advanceStory(){if(storyEnding){advanceComicEnding();return}scene='fight';show(null);roundIntro=true;introDuration=round===1?270:120;announceTime=introDuration;announcement=round===1?'ENTER THE RODA':roundLabel();}

let comicPage=0;
const endingCaptions=[
 'After the tournament, the mystery man takes and destroys the studio anyway.',
 'Bento, Caio, and Nestor laugh among the ruins.',
 'Meilin offers her two training areas, protected by security and beyond his claim.',
 'Mestre remembers: Meilin is rich. She welcomes everyone to continue training.',
 'A new home: the women and Mestre continue their roda in Meilin’s indoor studio.'
];
function openComicEnding(){storyEnding=true;comicPage=0;scene='story';show('ending');setStageMusic(19);paintComicEnding();}
function paintComicEnding(){storyTime=Infinity;$('#endingimage').src='ending/'+(comicPage+1)+'.jpg';$('#endingimage').alt=endingCaptions[comicPage];$('#endingcaption').textContent=endingCaptions[comicPage];$('#endingcount').textContent='EPILOGUE · '+(comicPage+1)+' / 5';$('#endingnext').textContent=comicPage===4?'A · RETURN TO MAIN MENU':'A · NEXT STRIP';$('#endingprev').disabled=comicPage===0;}
function advanceComicEnding(){if(comicPage<4){comicPage++;paintComicEnding();return}storyEnding=false;scene='menu';show('menu');setStageMusic(-1);if(typeof reviewReset==='function')reviewReset();}
