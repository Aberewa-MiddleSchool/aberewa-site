export const categories=['Accessibility barrier','Curriculum or lesson clarification','School program or services','Policies or procedures','Website or account help','Other clarification'];
export function validateInquiry(d){
  if(!d.contactName?.trim()||d.contactName.length>80)return 'Enter your name (80 characters or fewer).';
  if(!categories.includes(d.category))return 'Choose the type of clarification.';
  if(!d.subject?.trim()||d.subject.length>160)return 'Enter a subject (160 characters or fewer).';
  if(d.page.length>1000||d.page&&!/^https?:\/\//i.test(d.page))return 'Use a complete http or https page address, or leave it blank.';
  if(!d.message?.trim()||d.message.length>5000)return 'Enter your request (5,000 characters or fewer).';
  return '';
}
export function dateLabel(t){return t?.toDate?.().toLocaleString()||'Saving…';}
