export const MAX_QUESTIONS = 20;
export function validateLesson(lesson) {
  if (!lesson || typeof lesson.title !== 'string' || !lesson.title.trim() || lesson.title.length > 160) throw new Error('Enter a lesson title (up to 160 characters).');
  if (typeof lesson.body !== 'string' || lesson.body.length > 30000 || typeof lesson.standard !== 'string' || lesson.standard.length > 300) throw new Error('Check your lesson text and standard.');
  if (!Array.isArray(lesson.questions) || lesson.questions.length < 1 || lesson.questions.length > MAX_QUESTIONS || !Array.isArray(lesson.answerKey) || lesson.answerKey.length !== lesson.questions.length) throw new Error('Add 1–20 complete questions and their correct answers.');
  lesson.questions.forEach((q,i) => {
    if (typeof q.prompt !== 'string' || !q.prompt.trim() || q.prompt.length > 2000 || !Array.isArray(q.choices) || q.choices.length < 2 || q.choices.length > 4 || q.choices.some(c=>typeof c !== 'string' || !c.trim() || c.length > 500) || !Number.isInteger(lesson.answerKey[i]) || lesson.answerKey[i]<0 || lesson.answerKey[i]>=q.choices.length) throw new Error('Complete question '+(i+1)+', its choices, and the correct answer.');
  });
  return lesson;
}
export function gradeLesson(lesson, answers) {
  validateLesson(lesson);
  if (!Array.isArray(answers) || answers.length !== lesson.questions.length || answers.some((a,i)=>!Number.isInteger(a) || a<0 || a>=lesson.questions[i].choices.length)) throw new Error('Answer every question before submitting.');
  const missed=answers.flatMap((a,i)=>a===lesson.answerKey[i]?[]:[i+1]);
  const total=answers.length,correct=total-missed.length;
  return {correct,total,score:Math.round(100*correct/total),missed};
}
export function attemptResult(attempt, lessons, legacyGrade) {
  if (!attempt.lessonId) return {...legacyGrade(attempt.day,attempt.answers),lesson:'Original session '+attempt.day};
  const lesson=lessons.get(attempt.lessonId);
  // Published lesson content is immutable, including after archival.
  if (lesson) return {...gradeLesson(lesson,attempt.answers),lesson:lesson.title};
  const {correct,total}=attempt;
  if (!Number.isInteger(correct)||!Number.isInteger(total)||total<1||total>MAX_QUESTIONS||correct<0||correct>total) throw new Error('Invalid recorded result');
  return {correct,total,score:Math.round(100*correct/total),missed:[],lesson:'Lesson '+attempt.lessonId};
}
