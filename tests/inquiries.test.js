import {readFileSync} from 'node:fs';
import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,getDocs,collection,query,where,updateDoc,writeBatch,serverTimestamp} from 'firebase/firestore';
import {TEACHER_UID} from '../math-common.js';
import {validateInquiry} from '../inquiry-common.js';
let env,visitor,other,teacher,publicDB;
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-aberewa',firestore:{rules:readFileSync('firebase/firestore.rules','utf8')}});visitor=env.authenticatedContext('inquiry-visitor',{email:'visitor@example.test'}).firestore();other=env.authenticatedContext('inquiry-other',{email:'other@example.test'}).firestore();teacher=env.authenticatedContext(TEACHER_UID,{email:'admin@example.test'}).firestore();publicDB=env.unauthenticatedContext().firestore();});
after(async()=>await env?.cleanup());
const base=()=>({ownerUid:'inquiry-visitor',email:'visitor@example.test',contactName:'Synthetic Visitor',category:'Other clarification',subject:'Test request',page:'',message:'Please clarify this item.',createdAt:serverTimestamp(),status:'open',reply:'',repliedAt:null});
function submission(db,id,patch={}){const b=writeBatch(db);b.set(doc(db,'inquiryRateLimits/inquiry-visitor'),{lastAt:serverTimestamp(),lastId:id});b.set(doc(db,'inquiries',id),{...base(),...patch});return b.commit();}
test('inquiries validate input and do not accept unsafe page links',()=>{assert.equal(validateInquiry(base()),'');assert.notEqual(validateInquiry({...base(),page:'javascript:alert(1)'}),'');assert.notEqual(validateInquiry({...base(),message:'x'.repeat(5001)}),'');});
test('request needs authentication and atomic rate record; spoofing and premature replies fail',async()=>{
 await assertFails(setDoc(doc(publicDB,'inquiries/anonymous-inquiry'),base()));
 await assertFails(setDoc(doc(visitor,'inquiries/no-rate'),base()));
 await assertFails(submission(visitor,'forged-owner',{ownerUid:'someone-else'}));
 await assertFails(submission(visitor,'forged-email',{email:'someone-else@example.test'}));
 await assertFails(submission(visitor,'forged-reply',{reply:'Fake answer',status:'answered'}));
 await assertFails(submission(visitor,'extra-field',{unexpected:true}));
 await assertSucceeds(submission(visitor,'valid-inquiry'));
 await assertFails(submission(visitor,'too-soon'));
});
test('request privacy and teacher replies are enforced by database rules',async()=>{
 await assertSucceeds(getDoc(doc(visitor,'inquiries/valid-inquiry')));
 await assertFails(getDoc(doc(other,'inquiries/valid-inquiry')));
 await assertFails(getDoc(doc(publicDB,'inquiries/valid-inquiry')));
 await assertFails(getDocs(collection(visitor,'inquiries')));
 await assertSucceeds(getDocs(query(collection(visitor,'inquiries'),where('ownerUid','==','inquiry-visitor'))));
 await assertSucceeds(getDocs(collection(teacher,'inquiries')));
 await assertFails(updateDoc(doc(visitor,'inquiries/valid-inquiry'),{reply:'Pretend school reply',status:'answered',repliedAt:serverTimestamp()}));
 await assertFails(updateDoc(doc(teacher,'inquiries/valid-inquiry'),{ownerUid:'other'}));
 await assertSucceeds(updateDoc(doc(teacher,'inquiries/valid-inquiry'),{reply:'Verified school reply',status:'answered',repliedAt:serverTimestamp()}));
 assert.equal((await getDoc(doc(visitor,'inquiries/valid-inquiry'))).data().reply,'Verified school reply');
 await assertFails(updateDoc(doc(teacher,'inquiries/valid-inquiry'),{reply:'',status:'answered',repliedAt:serverTimestamp()}));
});
test('all public pages expose a dashboard sign in link and inquiry code has no personal recipient',()=>{
 const pages=readFileSync('sitemap.xml','utf8').match(/https:\/\/aberewamiddleschool\.org\/[^<]*/g)||[];
 for(const url of pages){const file=url.split('/').pop()||'index.html';if(file.endsWith('.html'))assert.match(readFileSync(file,'utf8'),/class="dashboard-site-link"/);}
 for(const file of ['accessibility.html','inquiry-form.js','inquiry-inbox.js'])assert.doesNotMatch(readFileSync(file,'utf8'),/antoinelamond@gmail\.com/);
});
