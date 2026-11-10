import { configured, firebaseConfig } from "./math-firebase-config.js";
const appRoot=document.getElementById("teacher-app");
if(configured){
  const [{initializeApp},auth,store]=await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js")
  ]);
  const app=initializeApp(firebaseConfig), a=auth.getAuth(app), db=store.getFirestore(app);
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  async function draw(user){
    if(!user){
      appRoot.innerHTML='<h2>Teacher sign-in</h2><form id="teacher-login"><label>Email <input id="teacher-email" type="email" required autocomplete="username"></label><label>Password <input id="teacher-password" type="password" required autocomplete="current-password"></label><button>Sign in</button></form><p id="teacher-error"></p>';
      appRoot.querySelector("form").onsubmit=async e=>{e.preventDefault();try{await auth.signInWithEmailAndPassword(a,document.getElementById("teacher-email").value,document.getElementById("teacher-password").value)}catch(e){document.getElementById("teacher-error").textContent="Sign-in unsuccessful. Check your account."}};
      return;
    }
    const claims=await user.getIdTokenResult();
    if(claims.claims.teacher!==true){
      appRoot.innerHTML='<p>This account is not authorized to view students’ grades.</p><button id="signout">Sign out</button>';
      document.getElementById("signout").onclick=()=>auth.signOut(a);return;
    }
    appRoot.innerHTML='<h2>Student scores</h2><p>Only authorized teacher accounts can access this view.</p><button id="refresh">Refresh grades</button><button id="download">Download scores CSV</button><button id="signout">Sign out</button><div id="scores">Loading…</div>';
    document.getElementById("signout").onclick=()=>auth.signOut(a);
    async function load(){
      try{
        // Fetch student profiles first; each student’s grades live under the same UID.
        const profiles=await store.getDocs(store.collection(db,"profiles"));
        const rows=[];
        for(const p of profiles.docs){
          const info=p.data();
          if(info.role==="teacher")continue;
          const attempts=await store.getDocs(store.collection(db,"scores",p.id,"attempts"));
          for(const doc of attempts.docs){
            const d=doc.data();
            rows.push({name:info.displayName||"Student",studentId:info.studentCode||p.id.slice(0,8),
              day:d.day,week:d.week,score:d.score,correct:d.correct,total:d.total,
              attempts:d.attempts,missed:(d.missed||[]).join("; "),date:d.recordedAt?.toDate?.().toISOString()||""});
          }
        }
        rows.sort((a,b)=>a.name.localeCompare(b.name)||a.day-b.day||a.date.localeCompare(b.date));
        window.__aberewaRows=rows;
        const columns=["name","studentId","week","day","score","correct","total","attempts","missed","date"];
        const labels=["Student","Student code","Week","Day","Score %","Correct","Total","Attempt","Missed Questions","Submitted (UTC)"];
        document.getElementById("scores").innerHTML=rows.length
          ?'<p>'+rows.length+' submitted assessment attempts.</p><div class="scroll"><table><thead><tr>'+labels.map(h=>'<th scope="col">'+escape(h)+'</th>').join("")+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+columns.map(c=>'<td>'+escape(r[c])+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>'
          :'<p>No submitted results yet.</p>';
      }catch(err){document.getElementById("scores").textContent="Unable to load grades. Check Firestore rules, account permissions, and project setup.";}
    }
    document.getElementById("refresh").onclick=load;
    document.getElementById("download").onclick=()=>{
      const cols=["name","studentId","week","day","score","correct","total","attempts","missed","date"];
      const rows=[cols,...(window.__aberewaRows||[]).map(row=>cols.map(c=>row[c]))];
      const csv=rows.map(row=>row.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\r\n");
      const link=document.createElement("a");link.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));link.download="aberewa-teacher-grades.csv";link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);
    };
    await load();
  }
  auth.onAuthStateChanged(a,draw);
}