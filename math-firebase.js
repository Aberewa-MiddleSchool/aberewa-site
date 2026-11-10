// Aberewa Mathematics Classroom student authentication and formative score collection.
// Score integrity caveat: student-browser submissions are formative evidence;
// browser-side scoring is not suitable as a tamper-resistant official grade.
import { configured, firebaseConfig } from "./math-firebase-config.js";
const section = document.getElementById("account-panel");
if (!section) throw new Error("Missing account panel");
if (!configured) {
  section.innerHTML = '<p><strong>Student accounts are not active yet.</strong> Teacher setup must be completed before sign-in and automatic score collection can be enabled. You can continue practising and exporting progress as a CSV.</p>';
} else {
  const [{ initializeApp }, auth, store] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js")
  ]);
  const app = initializeApp(firebaseConfig);
  const a = auth.getAuth(app);
  const db = store.getFirestore(app);
  const panel = section;
  let current = null;
  const escapeHTML = s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function renderSignedOut() {
    panel.innerHTML = '<h3>Student sign-in</h3><p>Use your school-provided account. Never share your password with your teacher.</p><form id="math-login"><label for="math-email">School account email</label> <input required type="email" autocomplete="username" id="math-email"><label for="math-password">Password</label> <input required type="password" autocomplete="current-password" id="math-password"><button>Sign in</button></form><p id="math-auth-message" role="status"></p>';
    panel.querySelector("form").onsubmit = async e => {
      e.preventDefault();
      const email = panel.querySelector("#math-email").value;
      const password = panel.querySelector("#math-password").value;
      panel.querySelector("#math-auth-message").textContent = "Signing in…";
      try { await auth.signInWithEmailAndPassword(a,email,password); }
      catch(err) { panel.querySelector("#math-auth-message").textContent = "Sign-in failed. Ask your teacher to check your account details."; }
    };
  }
  auth.onAuthStateChanged(a, async user=>{
    current=user;
    if(!user){renderSignedOut();return}
    const token = await user.getIdTokenResult();
    if (token.claims.student !== true || token.claims.teacher === true) {
      panel.innerHTML = '<p>This account is not approved for student mathematics submissions. Contact the school administrator.</p><button type="button" id="math-logout">Sign out</button>';
      panel.querySelector("#math-logout").onclick=()=>auth.signOut(a);
      return;
    }
    let displayName="Student";
    try {
      const p=await store.getDoc(store.doc(db,"profiles",user.uid));
      if(p.exists()) displayName = p.data().displayName || displayName;
    } catch(e) { /* Keep student account usable if profile not yet provisioned */ }
    panel.innerHTML='<p>Signed in as <strong>'+escapeHTML(displayName)+'</strong></p><p>New scores will be sent to your private student record when you submit an answer check.</p><button type="button" id="math-logout">Sign out</button><p id="math-sync-status" role="status"></p>';
    panel.querySelector("#math-logout").onclick=()=>auth.signOut(a);
  });
  window.AbMathAuth = {
    async saveScore(record) {
      if(!current) return {ok:false,message:"Sign in to save your result to the teacher gradebook. You can still download your result."};
      const token=await current.getIdTokenResult();
      if(token.claims.student !== true || token.claims.teacher === true)
        return {ok:false,message:"This account is not approved for student score submissions."};
      try {
        await store.addDoc(store.collection(db,"scores",current.uid,"attempts"),{
          day:record.day,week:record.week,score:record.score,correct:record.correct,
          total:record.total,attempts:record.attempts,missed:record.missed,
          recordedAt:store.serverTimestamp()
        });
        return {ok:true,message:"Score saved to your private student record."};
      } catch(e) {
        return {ok:false,message:"Score was not uploaded. Please download a CSV record and tell your teacher."};
      }
    }
  };
}
