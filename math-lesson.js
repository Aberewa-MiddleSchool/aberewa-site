import {firebaseConfig} from './math-firebase-config.js';
import {escapeHTML as esc} from './math-common.js';
import {validateLesson,gradeLesson} from './math-lessons-common.js';
const [{initializeApp,getApps},store]=await Promise.all([import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')]);
const app=getApps()[0]||initializeApp(firebaseConfig),db=store.getFirestore(app);
const container=document.getElementById('added-lessons');
if(container){store.onSnapshot(store.query(store.collection(db,'mathLessons'),store.where('published','==',true)),snap=>{container.innerHTML=snap.empty?'<p>Your teacher’s additional mathematics lessons will appear here.</p>':snap.docs.sort((a,b)=>a.data().title.localeCompare(b.data().title)).map(d=>'<article class="lesson-card"><h3><a href="math-lesson.html?id='+encodeURIComponent(d.id)+'">'+esc(d.data().title)+'</a></h3><p>'+esc(d.data().standard)+'</p><p>'+d.data().questions.length+' questions · scores sent to your teacher</p></article>').join('');},()=>{container.textContent='Additional lessons could not load. Check your connection and try reloading.';});}
const content=document.getElementById('lesson-content');
if(content){
  const id=new URLSearchParams(location.search).get('id');let lesson=null;
  const result=document.getElementById('result');
  document.getElementById('grade').addEventListener('click',async()=>{
    if(!lesson)return;
    const answers=lesson.questions.map((q,i)=>{const checked=document.querySelector('input[name="q'+i+'"]:checked');return checked?Number(checked.value):null;});
    try{const local=gradeLesson(lesson,answers);result.textContent='Saving your answers…';const status=await window.AbMathAuth.saveScore({lessonId:id,answers});result.textContent=status.ok?'Score: '+local.correct+' / '+local.total+' ('+local.score+'%). '+status.message:status.message;}catch(e){result.textContent=e.message;}
  });
  if(!id||!/^[A-Za-z0-9_-]{1,128}$/.test(id)){content.textContent='Choose a lesson from the mathematics classroom.';}else{
    store.onSnapshot(store.doc(db,'mathLessons',id),snap=>{if(!snap.exists()||!snap.data().published){lesson=null;content.textContent='This lesson is not currently available. Return to the mathematics classroom.';return;}try{lesson=validateLesson(snap.data());document.getElementById('lesson-title').textContent=lesson.title;content.innerHTML='<p>'+esc(lesson.standard)+'</p><div class="lesson-text">'+esc(lesson.body)+'</div><h2>Check your understanding</h2><form id="lesson-quiz">'+lesson.questions.map((q,i)=>'<fieldset class="question"><legend>Question '+(i+1)+': '+esc(q.prompt)+'</legend>'+q.choices.map((c,j)=>'<label class="choice"><input type="radio" name="q'+i+'" value="'+j+'"> '+esc(c)+'</label>').join('')+'</fieldset>').join('')+'</form>';}catch{content.textContent='This lesson needs a correction from your teacher.';lesson=null;}},()=>{lesson=null;content.textContent='This lesson is unavailable or archived. Return to the mathematics classroom.';});
  }
  window.addEventListener('aberewa-account',()=>{document.querySelectorAll('#lesson-quiz input').forEach(i=>i.checked=false);result.textContent='';});
}
