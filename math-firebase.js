import { configured, firebaseConfig } from './math-firebase-config.js';
import { TEACHER_UID, grade, escapeHTML as esc } from './math-common.js';
import {gradeLesson} from './math-lessons-common.js';
const panel=document.getElementById('account-panel'), button=document.getElementById('grade');
let current=null, profile=null, stopProfile=()=>{}, busy=false;
button.disabled=true;
window.AbMathAuth={async saveScore(){return {ok:false,message:'Sign in and wait for teacher approval before submitting.'};}};
if(!configured){panel.textContent='Student accounts are awaiting final security verification.';}
else { try {
  const [{initializeApp,getApps},auth,store]=await Promise.all([
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')]);
  const app=getApps()[0]||initializeApp(firebaseConfig), a=auth.getAuth(app), db=store.getFirestore(app);
  await auth.setPersistence(a,auth.browserSessionPersistence);
  function draw(){
    button.disabled=busy || !current || profile?.active!==true || current.uid===TEACHER_UID;
    if(!current){
      panel.innerHTML='<h3>Student sign-in</h3><form id="login"><label>Email <input id="email" type="email" autocomplete="username" required></label><label>Password <input id="password" type="password" autocomplete="current-password" required minlength="8"></label><label>Name (new accounts only) <input id="name" maxlength="80" autocomplete="name"></label><button name="action" value="signin">Sign in</button><button name="action" value="register" type="submit">Create student account</button></form><p>New accounts need teacher approval before submitting quizzes. Use your own account; sign out on shared computers.</p><p id="auth-status" role="status"></p>';
      panel.querySelector('form').onsubmit=async e=>{e.preventDefault();const email=panel.querySelector('#email').value.trim(),password=panel.querySelector('#password').value,name=panel.querySelector('#name').value.trim();const status=panel.querySelector('#auth-status');try{
        if(e.submitter?.value==='register'){
          if(!name){status.textContent='Enter your name to create your student account.';return;}
          const result=await auth.createUserWithEmailAndPassword(a,email,password);
          await store.setDoc(store.doc(db,'profiles',result.user.uid),{displayName:name,email:result.user.email,role:'student',active:false,createdAt:store.serverTimestamp()});
        }else await auth.signInWithEmailAndPassword(a,email,password);
      }catch(err){status.textContent=err.code==='auth/email-already-in-use'?'This email already has an account. Choose Sign in.':'Unable to sign in or register. Check your details and connection.';}};
      return;
    }
    if(current.uid===TEACHER_UID){panel.innerHTML='<p>You are signed in as the teacher. <a href="math-teacher.html">Open your private dashboard</a>.</p><button id="logout">Sign out</button>';}
    else if(!profile){panel.innerHTML='<p>Your account needs a student profile.</p><form id="profile"><label>Your name <input id="profile-name" maxlength="80" required></label><button>Request teacher approval</button></form><button id="logout">Sign out</button><p id="profile-status" role="status"></p>';panel.querySelector('form').onsubmit=async e=>{e.preventDefault();try{await store.setDoc(store.doc(db,'profiles',current.uid),{displayName:panel.querySelector('input').value.trim(),email:current.email,role:'student',active:false,createdAt:store.serverTimestamp()});}catch{panel.querySelector('#profile-status').textContent='Could not save your profile. Please tell your teacher.';}};}
    else panel.innerHTML='<p>Signed in as <strong>'+esc(profile.displayName)+'</strong>.</p><p>'+(profile.active?'Your teacher receives each submitted quiz automatically.':'Waiting for your teacher to approve your account. You can read the lessons while you wait.')+'</p><button id="logout">Sign out</button>';
    panel.querySelector('#logout').onclick=()=>auth.signOut(a);
  }
  auth.onAuthStateChanged(a,user=>{stopProfile();current=user;profile=null;window.dispatchEvent(new CustomEvent("aberewa-account",{detail:user?.uid}));draw();if(user && user.uid!==TEACHER_UID)stopProfile=store.onSnapshot(store.doc(db,'profiles',user.uid),snap=>{profile=snap.exists()?snap.data():null;draw();},()=>{button.disabled=true;panel.textContent='Unable to verify your account permissions. Reload or tell your teacher.';});});
  window.AbMathAuth={async saveScore(record){
    if(!current || !profile?.active || current.uid===TEACHER_UID)return {ok:false,message:'Your account must be approved before submitting.'};
    const uid=current.uid;busy=true;draw();
    try{let data;if(record.lessonId){const snap=await store.getDoc(store.doc(db,'mathLessons',record.lessonId));if(!snap.exists()||!snap.data().published)throw new Error('Unavailable lesson');const result=gradeLesson(snap.data(),record.answers);data={lessonId:record.lessonId,answers:record.answers,correct:result.correct,total:result.total,recordedAt:store.serverTimestamp()};}else{const result=grade(record.day,record.answers);data={day:record.day,week:record.week,answers:record.answers,correct:result.correct,total:result.total,recordedAt:store.serverTimestamp()};}await store.addDoc(store.collection(db,'scores',uid,'attempts'),data);return {ok:true,message:'Saved successfully. Your teacher can now see your name and score.'};}
    catch{return {ok:false,message:'NOT SAVED to your teacher dashboard. Check your connection, then submit again.'};}
    finally{busy=false;draw();}
  }};
}catch{panel.textContent='Secure sign-in could not load. Reload this page before submitting.';}}
