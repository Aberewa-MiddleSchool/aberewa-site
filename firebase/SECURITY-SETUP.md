# Aberewa mathematics authentication — restricted setup plan

**Status: NOT LIVE.** The public website keeps `configured = false` in `math-firebase-config.js`. Do not enable it or add actual student records until Firebase security rules have passed emulator tests and have been deployed and verified in the existing Firebase project.

## Requested student sign-in
- **Username:** lowercase first name, dot, last-name initial (example: `maya.j`).
- When a collision occurs, an authorized administrator reserves `maya.j2`, `maya.j3`, etc. The username must be unique, but **the student's full name stays exclusively in private Firestore**, not on the public site or in repository files.
- Firebase Auth Email/Password provider can use an **internal synthetic login email** `maya.j@students.aberewamiddleschool.org`. Students never enter an email and do not need their own mailbox. Provision these identities *only after approval*, with a trusted Firebase admin workflow. No public account creation.
- Generate a **unique, random password per student** using a cryptographically secure generator at account provisioning; do not derive it from the name and never commit credentials to GitHub, store them in Firestore, or display them in the gradebook.
- Firebase Auth UID, not name or username, links the private `profiles/{uid}` record to `scores/{uid}/attempts/{attemptId}`.
- Only teacher accounts with the custom claim `teacher: true` can list names and scores. A student must have `student: true` and an admin-created `profiles/{uid}` record with `role: "student"` to submit.
- Frontend score submissions are **unverified formative evidence**: a technically skilled user can manipulate browser-generated answers and scores. Do not treat these as tamper-resistant official grades.

## Administrative access and resets
- **Only the school owner** should control account creation, disablement, password resets, teacher-role assignment, and grade-data exports. Protect the owner's Firebase / Google account with MFA and grant no other account project administrative access.
- **Do not implement browser-side Admin SDK or service-account credentials.** GitHub Pages cannot safely store or execute them.
- Firebase client SDK cannot have a teacher reset a different student's Firebase Authentication password. A teacher custom claim does *not* confer Firebase Auth administrative authority.
- Until a **verified trusted admin backend** is available without enabling billing, account resets must be performed by the sole authorized project administrator in the Firebase console or through an independently operated secure admin environment using Admin SDK. **Dashboard reset control is not implemented.** Do not suggest that it works.
- Student self-signup and self-service password reset are absent from the curriculum UI. Do not provide real-mail password reset links to synthetic addresses.
- If the requirement is literally *all resets from the website dashboard*, keep this feature blocked pending a verified backend and explicit approval; do not compromise security or enable paid services.

## Pre-launch gate
1. Identify the correct existing Firebase project through authorized Google access; confirm Spark plan and that no billing account is attached.
2. Enable **Email/Password** only; avoid anonymous login / public self-registration. Firebase Auth enabling Email/Password does not itself prevent direct API signup: before launch, enforce signup restrictions through a validated, supported control and test that unknown users cannot register or gain access. Firestore rules already reject users without approved claims, but that alone does not stop Auth-account creation.
3. Create Firestore in production mode, or otherwise start with deny-all rules. Never enable test mode for student data.
4. Assign `teacher: true` only to the owner using an authenticated administrator channel. Assign `student: true` only to provisioned students.
5. Use Firestore Rules emulator tests with unauthenticated users, ordinary auth accounts, students, owner, forged role fields, cross-student reads/writes, listings, and malformed scores.
6. Deploy and independently verify the effective rules and authentication configuration on the actual project. Verify the site's authorized domains and teacher-only profile listing.
7. Confirm security/privacy/education-data compliance, then and only then populate approved student accounts and set `configured = true` with public Firebase web identifiers. No secret keys in source.

## Test cases
- [ ] Unauthenticated profile/score reads and writes are denied.
- [ ] Random signed-in account without custom claims cannot access private data or write scores.
- [ ] Approved student can read own profile and own attempts, but not list profiles.
- [ ] Approved student cannot read or write any other student's records.
- [ ] Approved student cannot write a profile or modify/delete an attempt.
- [ ] Teacher can read/list profiles and students' attempts but cannot write fabricated scores from the client.
- [ ] Supplying `role: "teacher"` in a document never grants teacher privileges.
- [ ] Incorrect day/week, total, and score fields are rejected.
- [ ] No real accounts or production rollout before the above tests pass.

The code in this pull request is **preparation only**; it does not establish that live Firebase settings or rules have been applied.
