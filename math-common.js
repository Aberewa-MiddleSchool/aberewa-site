export const TEACHER_UID = 'rq8Z1su8FNe1O1ETJgB4jjI0Sxx2';
export const keys = {1:[0,1,1],2:[0,1,1],3:[0,1,1],4:[1,1,1],5:[1,1,0,1,1],6:[0,1,1],7:[0,1,1],8:[2,0,0],9:[0,0,1],10:[1,0,0,0,1]};
export function grade(day, answers) {
  const key = keys[day];
  if (!key || !Array.isArray(answers) || answers.length !== key.length || answers.some(a => !Number.isInteger(a) || a < 0 || a > 2)) throw new Error('Invalid quiz answers');
  const correct = answers.filter((a,i) => a === key[i]).length;
  return {correct,total:key.length,score:Math.round(100*correct/key.length),missed:answers.flatMap((a,i)=>a === key[i] ? [] : [i+1])};
}
export const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function csvCell(value) { let s=String(value ?? ''); if (/^[=+\-@\t\r]/.test(s)) s="'"+s; return '"'+s.replace(/"/g,'""')+'"'; }
