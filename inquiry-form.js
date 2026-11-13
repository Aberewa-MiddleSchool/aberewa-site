import {firebaseConfig} from './math-firebase-config.js';
import {escapeHTML as esc} from './math-common.js';
import {validateInquiry,dateLabel} from './inquiry-common.js';
const account=document.getElementById('inquiry-account'),form=document.getElementById('clarification-form'),mine=document.getElementById('my-inquiries'),status=document.getElementById('inquiry-status'),send=form.querySelector('button[type="submit"]');
let current=null,stop=()=>{},busy=false;
const [{initializeApp,getApps},auth,store]=await Promise.all([
 import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
 import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),
 import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')]);
const app=getApps()[0]||initializeApp(firebaseConfig),a=auth.getAuth(app),db=store.getFirestore(app);
await auth.setPersistence(a,auth.browserSessionPersistence);
function drawAccount(){
 send.disabled=!current||busy;
 if(current){account.innerHTML='<p>You are signed in. Replies to your requests appear below. Sign out on shared devices.</p><button id="inquiry-signout" type="button">Sign out</button>';account.querySelector('button').onclick=()=>auth.signOut(a);return;}
 account.innerHTML='<h3>Keep your request and reply private</h3><p>Sign in with your existing school website account, or create an account below. A new inquiry account does not enroll you in the school or grant classroom access.</p><form id="inquiry-login"><label>Email <input id="inquiry-email" type="email" autocomplete="username" required></label><label>Password <input id="inquiry-password" type="password" autocomplete="current-password" minlength="8" required></label><div class="inquiry-actions"><button name="action" value="signin">Sign in</button><button name="action" value="register">Create inquiry account</button><button type="button" id="inquiry-reset">Reset password</button></div></form><p id="inquiry-auth-status" role="status"></p>';
 const login=account.querySelector('form'),msg=account.querySelector('[role="status"]'),email=account.querySelector('#inquiry-email');
 login.onsubmit=async e=>{e.preventDefault();const buttons=[...login.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);msg.textContent='Connecting…';try{const action=e.submitter?.value==='register'?auth.createUserWithEmailAndPassword:auth.signInWithEmailAndPassword;await action(a,email.value.trim(),account.querySelector('#inquiry-password').value);}catch(err){msg.textContent=err.code==='auth/email-already-in-use'?'This account already exists. Choose Sign in or reset its password.':'Could not sign in or create an account. Check your details and connection, or reset your password.';buttons.forEach(b=>b.disabled=false);}};
 account.querySelector('#inquiry-reset').onclick=async()=>{if(!email.reportValidity())return;try{await auth.sendPasswordResetEmail(a,email.value.trim());msg.textContent='If this email has an account, a reset link has been sent. Check your inbox and spam folder.';}catch{msg.textContent='Could not request a reset. Check your email address and connection.';}};
}
auth.onAuthStateChanged(a,user=>{
 stop();current=user;drawAccount();mine.textContent=user?'Loading your requests…':'Sign in to view your requests and the school’s replies.';
 if(user)stop=store.onSnapshot(store.query(store.collection(db,'inquiries'),store.where('ownerUid','==',user.uid)),snap=>{
  const records=snap.docs.map(d=>({id:d.id,...d.data()})).sort((x,y)=>(y.createdAt?.toMillis?.()||0)-(x.createdAt?.toMillis?.()||0));
  mine.innerHTML=records.length?records.map(d=>'<article class="inquiry-card"><h3>'+esc(d.subject)+'</h3><p class="inquiry-meta">'+esc(d.category)+' · '+esc(dateLabel(d.createdAt))+' · '+(d.status==='answered'?'Answered':'Awaiting a reply')+'</p><p class="inquiry-text">'+esc(d.message)+'</p>'+(d.reply?'<h4>Reply from Aberewa</h4><p class="inquiry-text">'+esc(d.reply)+'</p><p class="inquiry-meta">'+esc(dateLabel(d.repliedAt))+'</p>':'<p>We will review your request. Return to this page and sign in to check for a reply.</p>')+'</article>').join(''):'You have not submitted a request yet.';
 },()=>{mine.textContent='Your requests could not be loaded. Check your connection and reload.';});
});
form.onsubmit=async e=>{
 e.preventDefault();if(!current||busy)return;
 if(form.elements.website.value)return;
 const data={contactName:form.elements.contactName.value.trim(),category:form.elements.category.value,subject:form.elements.subject.value.trim(),page:form.elements.page.value.trim(),message:form.elements.message.value.trim()};
 const error=validateInquiry(data);if(error){status.textContent=error;return;}
 busy=true;send.disabled=true;status.textContent='Saving your request…';
 const user=current,ref=store.doc(store.collection(db,'inquiries')),rate=store.doc(db,'inquiryRateLimits',user.uid);
 try{
  await store.runTransaction(db,async tx=>{await tx.get(rate);tx.set(rate,{lastAt:store.serverTimestamp(),lastId:ref.id});tx.set(ref,{...data,ownerUid:user.uid,email:user.email,createdAt:store.serverTimestamp(),status:'open',reply:'',repliedAt:null});});
  form.reset();status.textContent='Your request has been saved to the private school inbox. Check “Your requests and replies” below for our response. Replies stay on this website; no personal administrator email address is shared.';
 }catch{status.textContent='Your request was NOT saved. Wait at least one minute between requests, check your connection, and try again. Your message is still in the form.';}
 finally{busy=false;send.disabled=!current;}
};
