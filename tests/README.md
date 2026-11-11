# Grading verification

Run `npm ci` then `npm test` (Node 24 and Java 21). Tests use an isolated demo Firestore emulator, never student records.

Checks cover all ten original quiz keys, correct and incorrect scores, rejected forged grades, teacher-only roster and collection queries, private student records, pending and paused account restrictions, immutable attempts, invalid payload rejection, and spreadsheet-safe CSV cells.

Before student use, publish the matching Firestore rules, deploy the static website, then verify a synthetic student's registration, teacher approval, quiz submission, live dashboard receipt, and denied cross-student access in production. Do not mark the classroom ready until that final live check succeeds.

Teacher dashboard: `/math-teacher.html`; student quizzes: `/interactive-mathematics.html`. Existing teacher UID is fixed in rules and `math-common.js`. New students self-register with email/password, provide a name, and await approval. Only the existing teacher can approve or pause their access. No paid tier is required for this implementation within Firebase Spark quotas. These remain open-book formative quizzes: original lesson answer keys and feedback are intentionally public.

## Additional mathematics lessons

The teacher dashboard now includes **Add or manage mathematics lessons**. Enter a title, lesson text, 1–20 multiple-choice questions, 2–4 choices per question, and the correct answer. Save a private draft, preview it, then publish it. The student classroom subscribes to published lessons automatically, and the gradebook resolves new lesson IDs and titles without a code update per lesson.

Published lesson content and answer keys cannot change; copying creates a new lesson. Archiving hides a lesson and stops new submissions while preserving its scores. Student accounts and teacher approval are unchanged. These are formative open-book quizzes, as with the original ten sessions.

`tests/lessons.test.js` checks arbitrary new IDs, quiz lengths 1/2/3/5/10/20, server score validation, pending/private/archived lesson behavior, teacher-only authoring, immutable published content and attempts, account privacy, paused-account rejection, and malformed submissions. Full suite: 11 tests passing. Browser editor controls were also checked in an isolated local fixture (preview, draft, publish, archive, copy, and add question). Deployment still requires publishing the accompanying rules and a final production check.
