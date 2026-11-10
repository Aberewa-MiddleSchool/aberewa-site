import { googleFormsQuizUrl } from "./math-google-form-config.js";
const destinations = document.querySelectorAll("[data-aberewa-google-quiz]");
let url;
try {
  url = new URL(googleFormsQuizUrl);
  if (url.protocol !== "https:" || !(
      url.hostname === "forms.gle" ||
      (url.hostname === "docs.google.com" && url.pathname.startsWith("/forms/"))
  )) url = null;
} catch { url = null; }
for (const container of destinations) {
  if (!url) {
    // Configuration is absent: do not show a nonfunctional student assessment.
    container.hidden = true;
    continue;
  }
  container.hidden = false;
  container.replaceChildren();
  const heading = document.createElement("h3");
  heading.textContent = "Teacher-assigned mathematics quiz";
  const message = document.createElement("p");
  message.textContent = "Complete the assigned quiz. Google Forms records your submission in the teacher's private response gradebook. The practice quizzes on this website do not automatically submit to Google Forms.";
  const link = document.createElement("a");
  link.href = url.href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Open graded mathematics quiz";
  container.append(heading, message, link);
  // Use an embedded form only for the official Google Forms viewform endpoint.
  if (url.hostname === "docs.google.com" && url.pathname.endsWith("/viewform")) {
    const frame = document.createElement("iframe");
    frame.title = "Aberewa mathematics graded quiz (Google Forms)";
    frame.src = url.href;
    frame.loading = "lazy";
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.style.cssText = "display:block;width:100%;min-height:850px;border:1px solid #d7c89f;margin-top:1rem;border-radius:8px";
    container.append(frame);
  }
}
