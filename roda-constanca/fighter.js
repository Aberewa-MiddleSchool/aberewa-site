const CONSTANCA_ID=20;
const constanca=(()=>{
 const root=new URL('.',document.currentScript.src);
 function image(file){const img=new Image();img.src=new URL(file,root);return img;}
 const portrait=image('portrait.png');
 const sheets=Object.fromEntries(['body','turn','rise','arc','bat','power','invert','high'].map(k=>[k,image(k+'.webp')]));
const brideContacts={B:[2,4],X:[3,4],Y:[4,2],A:[0,3,5],LB:[1,2,4],RB:[0,2,3]};
// The contact drawings straddle the actual hit checks. Between hits the bride
// keeps moving through the rotation instead of returning to her initial windup.
function brideAttackTimeline(a){
 const hits=a.hits, type=a.type;
 let timeline;
 if(a.brideHigh){
  const half=type==='B'?3:4, contact={B:2,X:3,Y:4}[type];
  timeline=[[0,'body',2],[.08,'rise',0],[.16,'rise',1],[.25,'high',1],
   [.33,'rise',2],[.41,'rise',half],[hits[0]-.045,'high',contact],
   [.63,'rise',half],[.72,'rise',2],[.81,'rise',5],[.91,'rise',0],[1.0,'body',2]];
 }else if(a.bridePower){
  const contacts=brideContacts[type];
  const bridge={A:[3,5,4,5],LB:[2,3,3,0],RB:[1,2,3,4]}[type];
  timeline=[[0,'turn',0],[.09,'arc',0],[.18,'turn',1],[.27,'arc',1],[.35,'arc',type==='LB'?2:0],
   [hits[0]-.04,'power',contacts[0]],[.56,'arc',bridge[0]],[.67,'arc',bridge[1]],
   [.78,type==='A'?'rise':'turn',type==='A'?2:4],[hits[1]-.045,'power',contacts[1]],
   [1.07,'arc',bridge[2]],[1.18,'arc',bridge[3]],[1.29,type==='LB'?'turn':'rise',type==='LB'?5:4],
   [hits[2]-.045,'power',contacts[2]],[1.56,'arc',type==='LB'?0:4],[1.67,'arc',5],[1.77,'turn',0]];
 }else{
  const contacts=brideContacts[type];
  timeline=[[0,'turn',0],[.08,'turn',1],[.16,'invert',1],[.24,'turn',2],[.32,'turn',type==='X'?3:2],
   [hits[0]-.04,'invert',contacts[0]],[.55,'turn',3],[.67,'turn',4],[.80,'turn',3],
   [hits[1]-.055,'invert',contacts[1]],[1.10,'turn',4],[1.19,'turn',5],[1.29,'invert',5],[1.37,'turn',0]];
 }
 return timeline;
}
function brideAttackFrame(a){
 const timeline=a.timeline??=brideAttackTimeline(a);
 let i=timeline.length-1;
 while(i>0&&a.t<timeline[i][0])i--;
 return timeline[i];
}
 const names=['Última Valsa','Twin Cartwheel','Handstand Scissors','Turning Cartwheel','Voto Eterno','Véu Rubro'];
 const highs=['High Front Kick','High Side Kick','High Crescent Kick'];
 let standing,low;
 function make(slot,crouched){
  const power=slot===0||slot>=4, high=!power&&crouched;
  const hits=power?[.44,.94,1.44]:high?[.52]:[.42,.98];
  const start=Math.round(hits[0]*60), frames=power?30:high?9:34;
  const phases=hits.map((_,i)=>({frames,range:power?205:190,level:high?'high':'mid',travel:0,push:i===hits.length-1?2:0,damage:power?6:high?11:7,knockdown:false}));
  const name=high?highs[slot-1]:names[slot];
  return {...moves[slot],...phases[0],name,label:power?'POWER DRAIN':high?'HIGH KICK':'TWO-HIT KICK',signature:power?name:null,
   cost:0,rank:power?3:2,phases,start,active:frames*hits.length,end:power?0:high?25:0,retreat:0,power,
   timeline:brideAttackTimeline({type:moves[slot].button,hits,brideHigh:high,bridePower:power})};
 }
 function install(){
  profiles[20]={name:'Dona Constança da Luz',home:'Brasil',personality:'A daywalker who remembers the earliest rodas.',win:'I still hear the roda after the music stops.',lose:'The sun will find me here tomorrow.',pitch:175};
  fighterTraits[20]={height:183,build:1,speed:5,tempo:1,reach:1,power:1,style:'Bridal Angola',signature:'Última Valsa',accent:'#ef445a',variant:0};
  fighterPlans[20]='B/X/Y · two kicks for 3% life. Down + B/X/Y · single high kick. A/LB/RB · drain enemy axé. Move sideways to fly.';
  standing=moves.map((_,i)=>make(i,false));low=moves.map((_,i)=>make(i,true));characterMoves[20]=standing;
 }
 function move(slot,crouched){return (crouched?low:standing)[slot];}
 function draw(p){
  let clip='body',frame=0;
  if(p.down>0||p.hp<=0)frame=5;
  else if(p.stun>0)frame=p.guardStun?1:4;
  else if(p.attack!==null){const m=move(p.attack,p.attackCrouched);[,clip,frame]=brideAttackFrame({timeline:m.timeline,t:p.at/60});}
  else if(p.y>0)frame=3;
  else if(p.crouch)frame=2;
  else if(Math.abs(p.vx)>.3){clip='bat';frame=Math.floor(tick/5)%6;}
  else if(p.block)frame=1;
  const img=sheets[clip];if(!img.naturalWidth)return;
  ctx.save();ctx.translate(p.x,590-p.y);ctx.scale(p.dir*.89,.89);
  ctx.drawImage(img,frame%3*512,Math.floor(frame/3)*448,512,448,-256,-390,512,448);ctx.restore();
 }
 function face(c){if(!portrait.naturalWidth){portrait.addEventListener('load',()=>face(c),{once:true});return;}
  const side=Math.min(portrait.width,portrait.height),g=c.getContext('2d');g.drawImage(portrait,(portrait.width-side)/2,0,side,side,0,0,c.width,c.height);}
 return {install,draw,face,move,portrait};
})();
