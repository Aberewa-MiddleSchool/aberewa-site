import {configured,firebaseConfig} from './math-firebase-config.js';
import {TEACHER_UID,escapeHTML as esc} from './math-common.js';
const panel=document.getElementById('slope-account');
let user=null,profile=null,stop=()=>{},a=null,db=null,auth=null,store=null;
function publish(){window.SlopeAccount={approved:!!(user&&profile?.active===true&&user.uid!==TEACHER_UID),name:profile?.displayName||'',submit};window.dispatchEvent(new Event('slope-auth-change'));}
function draw(){
 if(!user){
 panel.innerHTML='<h2>Student sign-in</h2><p>Sign in using your existing Aberewa Mathematics student account.</p><form id="slope-login"><label>Email <input type="email" name="email" autocomplete="username" required></label><label>Password <input type="password" name="password" autocomplete="current-password" required minlength="8"></label><label>Student name (new account only) <input name="name" maxlength="80" autocomplete="name"></label><div><button type="submit" name="action" value="signin">Sign in</button> <button type="submit" name="action" value="register">Create account</button></div></form><p class="small">New accounts require teacher approval before an exit-ticket score can be submitted.</p><p id="slope-auth-status" role="status"></p>';
 panel.querySelector('form').onsubmit=async e=>{e.preventDefault();const f=e.currentTarget,status=panel.querySelector('#slope-auth-status');status.textContent='Checking account…';try{if(e.submitter?.value==='register'){const name=f.elements.name.value.trim();if(!name){status.textContent='Enter your name to register.';return}const r=await auth.createUserWithEmailAndPassword(a,f.elements.email.value.trim(),f.elements.password.value);await store.setDoc(store.doc(db,'profiles',r.user.uid),{displayName:name,email:r.user.email,role:'student',active:false,createdAt:store.serverTimestamp()});}else await auth.signInWithEmailAndPassword(a,f.elements.email.value.trim(),f.elements.password.value);}catch(e){status.textContent='Sign-in or registration failed. Check your details. Existing users should choose Sign in.';}};
 }else if(user.uid===TEACHER_UID){panel.innerHTML='<p>Teacher account detected. <a href="math-teacher.html">Open teacher dashboard</a> to view grades.</p><button id="slope-logout">Sign out</button>';}
 else if(!profile){panel.innerHTML='<p>Your student profile is not available. Complete it to request approval.</p><form id="slope-profile"><label>Name <input name="name" maxlength="80" required></label><button>Request teacher approval</button></form><p id="slope-auth-status" role="status"></p><button id="slope-logout">Sign out</button>';panel.querySelector('form').onsubmit=async e=>{e.preventDefault();try{await store.setDoc(store.doc(db,'profiles',user.uid),{displayName:e.currentTarget.elements.name.value.trim(),email:user.email,role:'student',active:false,createdAt:store.serverTimestamp()});}catch{panel.querySelector('#slope-auth-status').textContent='Could not create student profile.'}};}
 else {panel.innerHTML='<p>Signed in as <strong>'+esc(profile.displayName)+'</strong>. '+(profile.active?'Approved to submit graded exit tickets.':'Awaiting teacher approval. You may practice while waiting.')+'</p><button id="slope-logout">Sign out</button>';}
 panel.querySelector('#slope-logout')?.addEventListener('click',()=>auth.signOut(a));publish();
}
async function submit(answers,correct){
 if(!user||!profile?.active||user.uid===TEACHER_UID)return {ok:false,message:'Sign in with a teacher-approved student account before submitting.'};
 try{
 const record={lessonId:'rise-over-run-positive-slope',answers,correct,total:3,recordedAt:store.serverTimestamp()};
 await store.addDoc(store.collection(db,'scores',user.uid,'attempts'),record);
 return {ok:true,message:'Saved to the school gradebook. Your teacher can view your result.'};
 }catch(e){return {ok:false,message:'Score was NOT saved to the teacher gradebook. Verify permissions or connection before trying again.'};}
}
window.SlopeAccount={approved:false,name:'',submit};publish();
if(!configured){panel.textContent='Student sign-in is unavailable until the school authentication configuration is enabled.';}
else try{
 const [{initializeApp,getApps},am,sm]=await Promise.all([import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')]);
 auth=am;store=sm;const app=getApps()[0]||initializeApp(firebaseConfig);a=auth.getAuth(app);db=store.getFirestore(app);
 await auth.setPersistence(a,auth.browserSessionPersistence);
 auth.onAuthStateChanged(a,account=>{stop();user=account;profile=null;if(!user){draw();return;}draw();if(user.uid!==TEACHER_UID)stop=store.onSnapshot(store.doc(db,'profiles',user.uid),snap=>{profile=snap.exists()?snap.data():null;draw()},()=>{profile=null;panel.textContent='Could not verify student access. Reload to try again.';publish()});});
}catch(e){panel.textContent='Unable to load secure student sign-in. Refresh the page.';}
