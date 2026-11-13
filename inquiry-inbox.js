import {escapeHTML as esc} from './math-common.js';
import {dateLabel} from './inquiry-common.js';
export function mountInquiryInbox(root,{db,store}){
 root.innerHTML='<h3>School clarification inbox</h3><p>Read and answer accessibility reports and any request for clarification here. Replies appear in the requester’s private account on the accessibility page. Do not paste your personal email address into a reply.</p><p><a href="accessibility.html#clarification">Open the visitor form</a></p><label>Show <select id="inquiry-filter"><option value="open">Awaiting reply</option><option value="all">All requests</option><option value="answered">Answered</option></select></label><p id="inbox-status" role="status"></p><div id="inbox-list">Loading requests…</div>';
 let records=[],drafts=new Map(),sending=false,pending=false;
 const filter=root.querySelector('select'),list=root.querySelector('#inbox-list'),status=root.querySelector('#inbox-status');
 function render(){
  if(sending){pending=true;return;}pending=false;
  list.querySelectorAll('textarea').forEach(t=>drafts.set(t.dataset.id,t.value));
  const visible=records.filter(d=>filter.value==='all'||d.status===filter.value);
  list.innerHTML=visible.length?visible.map(d=>'<article class="inquiry-card"><h4>'+esc(d.subject)+'</h4><p class="inquiry-meta">'+esc(d.contactName)+' · '+esc(d.category)+' · '+esc(dateLabel(d.createdAt))+'</p><p class="inquiry-text">'+esc(d.message)+'</p>'+(d.page?'<p class="inquiry-text">Page: '+esc(d.page)+'</p>':'')+'<form class="inquiry-form" data-id="'+esc(d.id)+'"><label>Reply on the website<textarea required maxlength="10000" data-id="'+esc(d.id)+'">'+esc(drafts.get(d.id)??d.reply??'')+'</textarea></label><button type="submit">'+(d.reply?'Update website reply':'Publish private website reply')+'</button><p class="reply-status" role="status"></p></form></article>').join(''):'<p>No requests in this view.</p>';
  list.querySelectorAll('form').forEach(f=>f.onsubmit=async e=>{e.preventDefault();const input=f.querySelector('textarea'),reply=input.value.trim(),msg=f.querySelector('.reply-status');if(!reply||sending)return;sending=true;f.querySelector('button').disabled=true;msg.textContent='Saving reply…';try{await store.updateDoc(store.doc(db,'inquiries',f.dataset.id),{reply,status:'answered',repliedAt:store.serverTimestamp()});drafts.delete(f.dataset.id);input.value='';status.textContent='Reply saved. The requester can read it on the website after signing in.';}catch{msg.textContent='Reply was NOT saved. Check your connection and try again.';}finally{sending=false;if(pending)render();else f.querySelector('button').disabled=false;}});
 }
 filter.onchange=render;
 const stop=store.onSnapshot(store.query(store.collection(db,'inquiries'),store.orderBy('createdAt','desc'),store.limit(200)),snap=>{records=snap.docs.map(d=>({id:d.id,...d.data()}));render();},()=>{status.textContent='Could not load the private inbox. Check your connection and database permissions.';});
 return stop;
}
