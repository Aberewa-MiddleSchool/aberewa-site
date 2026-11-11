# Grading verification

Run `npm ci` then `npm test` (Node 24 and Java 21). Tests use an isolated demo Firestore emulator, never student records.

Checks cover all ten original quiz keys, correct and incorrect scores, rejected forged grades, teacher-only roster and collection queries, private student records, pending and paused account restrictions, immutable attempts, invalid payload rejection, and spreadsheet-safe CSV cells.

Before student use, publish the matching Firestore rules, deploy the static website, then verify a synthetic student's registration, teacher approval, quiz submission, live dashboard receipt, and denied cross-student access in production. Do not mark the classroom ready until that final live check succeeds.

Teacher dashboard: `/math-teacher.html`; student quizzes: `/interactive-mathematics.html`. Existing teacher UID is fixed in rules and `math-common.js`. New students self-register with email/password, provide a name, and await approval. Only the existing teacher can approve or pause their access. No paid tier is required for this implementation within Firebase Spark quotas. These remain open-book formative quizzes: original lesson answer keys and feedback are intentionally public.
