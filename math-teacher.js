import {firebaseConfig} from './math-firebase-config.js';
import {TEACHER_UID,grade,escapeHTML as esc,csvCell} from './math-common.js';
import {mountLessonManager} from './math-lesson-manager.js';
import {attemptResult} from './math-lessons-common.js';
const root=document.getElementById('teacher-app');
const [{initializeApp},auth,store]=await Promise.all([
  import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
  import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),
  import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')]);
const app=initializeApp(firebaseConfig),a=auth.getAuth(app),db=store.getFirestore(app);
await auth.setPersistence(a,auth.browserSessionPersistence);
let stops=[],profiles=new Map(),attempts=[],rows=[],lessons=new Map();
function clear(){stops.forEach(f=>f());stops=[];profiles=new Map();attempts=[];rows=[];lessons=new Map();}
auth.onAuthStateChanged(a,user=>{
  clear();
  if(!user){
    root.innerHTML='<h2>Teacher sign-in</h2><p>Use the email and password created for your teacher gradebook. Your Google account password may be different.</p><form id="teacher-login"><label>Email <input id="teacher-email" type="email" autocomplete="username" required></label><label>Password <input id="teacher-password" type="password" autocomplete="current-password" required></label><button id="teacher-submit">Sign in</button></form><button type="button" id="teacher-reset">Forgot password? Send reset email</button><p id="teacher-error" role="status"></p>';
    const form=root.querySelector('form'),email=root.querySelector('#teacher-email'),password=root.querySelector('#teacher-password'),submit=root.querySelector('#teacher-submit'),reset=root.querySelector('#teacher-reset'),status=root.querySelector('#teacher-error');
    function message(error){
      if(error.code==='auth/network-request-failed')return 'The sign-in service could not be reached. Check your internet connection and try again.';
      if(error.code==='auth/too-many-requests')return 'Sign-in is temporarily limited after several attempts. Wait a few minutes before trying again.';
      if(error.code==='auth/user-disabled')return 'This account is disabled. Contact the classroom administrator.';
      if(['auth/invalid-api-key','auth/app-not-authorized','auth/operation-not-allowed','auth/unauthorized-domain'].includes(error.code))return 'The classroom sign-in configuration needs attention. Tell the site administrator.';
      return 'The email or gradebook password was not accepted. Check the email, or use Forgot password to reset your gradebook password.';
    }
    form.onsubmit=async e=>{e.preventDefault();submit.disabled=true;reset.disabled=true;status.textContent='Signing in…';try{await auth.signInWithEmailAndPassword(a,email.value.trim(),password.value);}catch(error){status.textContent=message(error);submit.disabled=false;reset.disabled=false;}};
    reset.onclick=async()=>{if(!email.reportValidity())return;reset.disabled=true;submit.disabled=true;status.textContent='Requesting a password reset email…';try{await auth.sendPasswordResetEmail(a,email.value.trim());status.textContent='If this email has a gradebook account, a password reset link has been sent. Check your inbox and spam folder. After choosing a new password, return here and sign in.';}catch(error){status.textContent=message(error);}finally{reset.disabled=false;submit.disabled=false;}};
    return;
  }
  if(user.uid!==TEACHER_UID){root.innerHTML='<p>This account cannot access the teacher dashboard.</p><button id="signout">Sign out</button>';root.querySelector('button').onclick=()=>auth.signOut(a);return;}
  root.innerHTML='<h2>Private teacher dashboard</h2><p>Names and scores update automatically while this page is open.</p><button id="signout">Sign out</button><button id="download">Download scores CSV</button><p><a href="interactive-mathematics.html">Open existing student quizzes</a></p><p><a href="#manage-lessons">Add or manage mathematics lessons</a></p><h3>Student accounts</h3><p>Approve only students you recognize. Pausing an account stops new submissions.</p><div id="roster">Loading student accounts…</div><h3>Quiz results</h3><label>Filter by student, lesson, or session <input id="filter" type="search"></label><div id="scores">Loading scores…</div><p id="dashboard-status" role="status"></p><section id="manage-lessons" class="lesson-editor"></section>';
  root.querySelector('#signout').onclick=()=>auth.signOut(a);
  stops.push(mountLessonManager(root.querySelector('#manage-lessons'),{db,store,onLessons:map=>{lessons=map;renderScores();}}));
  root.querySelector('#filter').oninput=renderScores;
  root.querySelector('#download').onclick=()=>{const cols=['name','email','lesson','day','week','score','correct','total','attempt','missed','date'];const csv=[cols,...rows.map(r=>cols.map(c=>Array.isArray(r[c])?r[c].join('; '):r[c]))].map(r=>r.map(csvCell).join(',')).join('\r\n');const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));link.download='aberewa-teacher-grades.csv';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);};
  stops.push(store.onSnapshot(store.collection(db,'profiles'),snap=>{profiles=new Map(snap.docs.map(d=>[d.id,d.data()]));renderRoster();renderScores();},fail));
  stops.push(store.onSnapshot(store.collectionGroup(db,'attempts'),snap=>{attempts=snap.docs.map(d=>({...d.data(),uid:d.ref.parent.parent.id,id:d.id}));renderScores();},fail));
});
function fail(){const status=root.querySelector('#dashboard-status');if(status)status.textContent='Live updates failed. Check your connection and database permissions; reload to retry.';}
function renderRoster(){const roster=root.querySelector('#roster');if(!roster)return;roster.innerHTML=profiles.size?'<div class="scroll"><table><thead><tr><th>Student</th><th>Email</th><th>Access</th><th>Action</th></tr></thead><tbody>'+[...profiles].map(([uid,p])=>'<tr><td>'+esc(p.displayName)+'</td><td>'+esc(p.email)+'</td><td>'+(p.active?'Approved':'Awaiting approval / paused')+'</td><td><button data-uid="'+esc(uid)+'">'+(p.active?'Pause':'Approve')+'</button></td></tr>').join('')+'</tbody></table></div>':'<p>No student registrations yet. Students create their accounts on the quiz page, then appear here for approval.</p>';roster.querySelectorAll('button').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await store.updateDoc(store.doc(db,'profiles',b.dataset.uid),{active:!profiles.get(b.dataset.uid).active});}catch{fail();b.disabled=false;}});}
function renderScores(){const target=root.querySelector('#scores');if(!target)return;const counts=new Map();rows=attempts.slice().sort((a,b)=>(a.recordedAt?.toMillis?.()||0)-(b.recordedAt?.toMillis?.()||0)).flatMap(d=>{try{const result=attemptResult(d,lessons,grade),p=profiles.get(d.uid);const key=d.uid+':'+(d.lessonId||d.day);counts.set(key,(counts.get(key)||0)+1);return [{...result,name:p?.displayName||'Profile unavailable',email:p?.email||'',day:d.day||'',week:d.week||'',attempt:counts.get(key),date:d.recordedAt?.toDate?.().toISOString()||'Saving…'}];}catch{return [];}}).reverse();const query=root.querySelector('#filter').value.toLowerCase();const visible=rows.filter(r=>(r.name+' '+r.email+' '+r.lesson+' session '+r.day).toLowerCase().includes(query));const cols=['name','email','lesson','day','week','score','correct','total','attempt','missed','date'];const labels=['Student','Email','Lesson','Session','Week','Score %','Correct','Total','Attempt','Missed questions','Submitted (UTC)'];target.innerHTML=visible.length?'<p>'+visible.length+' submitted attempts.</p><div class="scroll"><table><thead><tr>'+labels.map(h=>'<th scope="col">'+h+'</th>').join('')+'</tr></thead><tbody>'+visible.map(r=>'<tr>'+cols.map(c=>'<td>'+esc(Array.isArray(r[c])?r[c].join(', '):r[c])+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>':'<p>No matching submitted results yet.</p>';}
