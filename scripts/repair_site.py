from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
OFFICIAL_EMAIL = "founder@aberewamiddleschool.org"
OLD_EMAILS = ["antoinelamond@gmail.com"]

COUNTER_PATTERNS = [
    re.compile(r'<div[^>]*class=["\'][^"\']*site-visitor-counter[^"\']*["\'][^>]*>.*?hits\.sh.*?</div>', re.I | re.S),
    re.compile(r'<div[^>]*>\s*<img[^>]+src=["\']https://hits\.sh/[^"\']+["\'][^>]*>\s*</div>', re.I | re.S),
    re.compile(r'<img[^>]+src=["\']https://hits\.sh/[^"\']+["\'][^>]*>', re.I | re.S),
]

TRUST_LINKS = (
    '<p class="footer-links">'
    '<a href="accessibility.html">Accessibility</a> &nbsp;|&nbsp; '
    '<a href="privacy.html">Privacy</a> &nbsp;|&nbsp; '
    '<a href="faq.html">FAQ</a> &nbsp;|&nbsp; '
    '<a href="contact.html">Contact</a>'
    '</p>'
)

ACCESSIBILITY_PAGE = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Accessibility statement for the developing Aberewa Middle School website.">
<meta name="theme-color" content="#2b2414">
<link rel="canonical" href="https://aberewamiddleschool.org/accessibility.html">
<title>Accessibility Statement | Aberewa Middle School</title>
<link rel="stylesheet" href="information-pages.css">
</head>
<body>
<a class="skip-link" href="#main-content">Skip to main content</a>
<header><img src="image.png" alt="Aberewa Middle School logo" class="site-logo"><h1>Aberewa Middle School</h1><p>Rooted in Wisdom. Rising in Purpose.</p></header>
<nav aria-label="Primary navigation"><a href="index.html">Home</a><a href="vision.html">About</a><a href="student-support.html">Student Support</a><a href="curriculum.html">Curriculum</a><a href="faq.html">FAQ</a><a href="contact.html">Contact</a></nav>
<main id="main-content"><section class="hero"><p class="eyebrow">Access Commitment</p><h2>Accessibility Statement</h2><p>Aberewa Middle School is developing a website intended to be usable by disabled, neurodivergent, and non-disabled visitors.</p></section><div class="content"><section class="section"><h2>Our goal</h2><p>We are working toward conformance with the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA. This is an ongoing process, not a claim that every page is already perfect.</p><h2>Measures we are taking</h2><ul><li>Keyboard-accessible navigation and visible focus indicators</li><li>Clear headings, labels, link text, and page structure</li><li>Responsive text and layouts</li><li>Alternative text for meaningful images</li><li>Reduced-motion support</li><li>Captions or transcripts for multimedia when available</li></ul><h2>Report a barrier</h2><p>Tell us which page or feature caused difficulty and what technology you were using. Email <a href="mailto:founder@aberewamiddleschool.org">founder@aberewamiddleschool.org</a>.</p><p>We will make a good-faith effort to provide the information in an accessible alternative format.</p></section></div></main>
<footer><p>&copy; 2026 Aberewa Middle School &nbsp;|&nbsp; <a href="mailto:founder@aberewamiddleschool.org">founder@aberewamiddleschool.org</a></p>''' + TRUST_LINKS + '''</footer>
</body></html>'''

PRIVACY_PAGE = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Privacy notice for the developing Aberewa Middle School website.">
<meta name="theme-color" content="#2b2414">
<link rel="canonical" href="https://aberewamiddleschool.org/privacy.html">
<title>Privacy Notice | Aberewa Middle School</title>
<link rel="stylesheet" href="information-pages.css">
</head>
<body>
<a class="skip-link" href="#main-content">Skip to main content</a>
<header><img src="image.png" alt="Aberewa Middle School logo" class="site-logo"><h1>Aberewa Middle School</h1><p>Rooted in Wisdom. Rising in Purpose.</p></header>
<nav aria-label="Primary navigation"><a href="index.html">Home</a><a href="vision.html">About</a><a href="student-support.html">Student Support</a><a href="curriculum.html">Curriculum</a><a href="faq.html">FAQ</a><a href="contact.html">Contact</a></nav>
<main id="main-content"><section class="hero"><p class="eyebrow">Website Information</p><h2>Privacy Notice</h2><p>This notice explains how information sent through the developing Aberewa Middle School website may be handled.</p></section><div class="content"><section class="section"><h2>Information you choose to send</h2><p>When you email us, we receive the information included in your message and the email address used to contact us. We use it to respond to your inquiry and maintain appropriate project records.</p><h2>Do not send confidential student records</h2><p>Do not email IEPs, evaluations, medical records, Social Security numbers, full birth dates, or other sensitive student information through a general inquiry. If secure records are needed in the future, instructions for an approved secure process will be provided.</p><h2>Website measurement</h2><p>The public visit counter has been removed. If privacy-conscious analytics are added later, this notice will be updated to explain what is collected and why.</p><h2>External services</h2><p>Links to payment, media, social, or other third-party services are governed by those services' own privacy practices.</p><h2>Questions</h2><p>Email <a href="mailto:founder@aberewamiddleschool.org">founder@aberewamiddleschool.org</a>.</p><p><small>Last updated: July 29, 2026.</small></p></section></div></main>
<footer><p>&copy; 2026 Aberewa Middle School &nbsp;|&nbsp; <a href="mailto:founder@aberewamiddleschool.org">founder@aberewamiddleschool.org</a></p>''' + TRUST_LINKS + '''</footer>
</body></html>'''

FAQ_PAGE = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Frequently asked questions about the developing Aberewa Middle School project in New Orleans.">
<meta name="theme-color" content="#2b2414">
<link rel="canonical" href="https://aberewamiddleschool.org/faq.html">
<title>Frequently Asked Questions | Aberewa Middle School</title>
<link rel="stylesheet" href="information-pages.css">
</head>
<body>
<a class="skip-link" href="#main-content">Skip to main content</a>
<header><img src="image.png" alt="Aberewa Middle School logo" class="site-logo"><h1>Aberewa Middle School</h1><p>Rooted in Wisdom. Rising in Purpose.</p></header>
<nav aria-label="Primary navigation"><a href="index.html">Home</a><a href="vision.html">About</a><a href="student-support.html">Student Support</a><a href="curriculum.html">Curriculum</a><a href="faq.html" aria-current="page">FAQ</a><a href="contact.html">Contact</a></nav>
<main id="main-content"><section class="hero"><p class="eyebrow">Clear Answers</p><h2>Frequently Asked Questions</h2><p>What is known, what is planned, and what has not yet been determined.</p></section><div class="content"><section class="section"><h2>Is Aberewa Middle School open?</h2><p>No. Aberewa Middle School is in development and is not currently enrolling students.</p><h2>Where is the school being developed?</h2><p>The project is being developed for New Orleans, Louisiana. A campus has not yet been announced.</p><h2>When will the school open?</h2><p>No guaranteed opening date has been announced. Opening depends on funding, facilities, approvals, qualified staffing, and student-support systems.</p><h2>Which grades are planned?</h2><p>The current plan begins with seventh-grade entry. The inaugural cohort would advance to eighth grade in Year Two while a new seventh-grade cohort may enter. Direct eighth-grade entry is not part of the current opening model.</p><h2>What does Akan-rooted mean?</h2><p>Akan language, history, symbols, oral tradition, pattern, community knowledge, and cultural meaning are integrated with academic and life-skills learning. It does not mean that every student must already know Akan language or culture.</p><h2>What does IEP-centered mean?</h2><p>The developing model places individualized access, accommodations, communication, assistive technology, and student-support planning near the center of school design. Specific services cannot be promised before staffing, approvals, and placement processes are established.</p><h2>Will there be tuition, transportation, or meals?</h2><p>These matters have not yet been determined. Updates will be published when the school's legal model, campus, funding, and operating plan are confirmed.</p><h2>How can families receive updates?</h2><p>Email <a href="mailto:founder@aberewamiddleschool.org">founder@aberewamiddleschool.org</a> with “Family Updates” in the subject line. Do not send confidential student records through a general email.</p><h2>Are payments tax-deductible?</h2><p>Aberewa Middle School does not currently represent payments as tax-deductible charitable donations. See the <a href="support.html">support page</a> for current disclosures.</p></section></div></main>
<footer><p>&copy; 2026 Aberewa Middle School &nbsp;|&nbsp; <a href="mailto:founder@aberewamiddleschool.org">founder@aberewamiddleschool.org</a></p>''' + TRUST_LINKS + '''</footer>
</body></html>'''

ROBOTS = '''User-agent: *
Allow: /
Sitemap: https://aberewamiddleschool.org/sitemap.xml
'''


def canonical_for(path: Path) -> str:
    if path.name == "index.html":
        return "https://aberewamiddleschool.org/"
    return f"https://aberewamiddleschool.org/{path.name}"


def repair_html(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    text = original

    for old in OLD_EMAILS:
        text = text.replace(old, OFFICIAL_EMAIL)

    for pattern in COUNTER_PATTERNS:
        text = pattern.sub("", text)

    text = text.replace("&copy; 2025", "&copy; 2026").replace("© 2025", "© 2026")

    if re.search(r'<html(?![^>]*\blang=)', text, re.I):
        text = re.sub(r'<html([^>]*)>', r'<html lang="en"\1>', text, count=1, flags=re.I)

    if '<meta name="theme-color"' not in text.lower() and "</head>" in text.lower():
        text = re.sub(r'</head>', '<meta name="theme-color" content="#2b2414"></head>', text, count=1, flags=re.I)

    if 'rel="canonical"' not in text.lower() and "</head>" in text.lower():
        canonical = canonical_for(path)
        text = re.sub(r'</head>', f'<link rel="canonical" href="{canonical}"></head>', text, count=1, flags=re.I)

    if 'class="skip-link"' not in text and re.search(r'<body[^>]*>', text, re.I):
        text = re.sub(r'(<body[^>]*>)', r'\1<a class="skip-link" href="#main-content">Skip to main content</a>', text, count=1, flags=re.I)

    if re.search(r'<main(?![^>]*\bid=)', text, re.I):
        text = re.sub(r'<main([^>]*)>', r'<main id="main-content"\1>', text, count=1, flags=re.I)

    text = re.sub(r'<nav(?![^>]*aria-label=)([^>]*)>', r'<nav aria-label="Primary navigation"\1>', text, flags=re.I)

    if "</nav>" in text.lower():
        nav_match = re.search(r'<nav\b[^>]*>(.*?)</nav>', text, re.I | re.S)
        if nav_match:
            nav_inner = nav_match.group(1)
            additions = []
            if 'href="faq.html"' not in nav_inner:
                additions.append('<a href="faq.html">FAQ</a>')
            if 'href="contact.html"' not in nav_inner:
                additions.append('<a href="contact.html">Contact</a>')
            if additions:
                replacement = '<nav' + text[nav_match.start()+4:nav_match.start(1)] + nav_inner + ''.join(additions) + '</nav>'
                text = text[:nav_match.start()] + replacement + text[nav_match.end():]

    if "</footer>" in text.lower() and 'class="footer-links"' not in text:
        text = re.sub(r'</footer>', TRUST_LINKS + '</footer>', text, count=1, flags=re.I)

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def append_accessibility_css(path: Path) -> bool:
    if not path.exists():
        return False
    original = path.read_text(encoding="utf-8")
    marker = "/* Sitewide accessibility and trust improvements */"
    if marker in original:
        return False
    addition = r'''

/* Sitewide accessibility and trust improvements */
img{max-width:100%;height:auto}
.skip-link{position:absolute;left:-9999px;top:auto;z-index:9999;padding:.75rem 1rem;background:#fff;color:#111;border:3px solid #d4af37;font-weight:700}
.skip-link:focus{left:1rem;top:1rem}
a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid #d4af37;outline-offset:3px}
[aria-current="page"]{text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:.25em}
.footer-links{margin:.45rem 0 0}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
'''
    path.write_text(original.rstrip() + addition, encoding="utf-8")
    return True


def build_sitemap() -> str:
    pages = sorted(p.name for p in ROOT.glob("*.html") if not p.name.startswith("_"))
    urls = []
    for name in pages:
        loc = "https://aberewamiddleschool.org/" if name == "index.html" else f"https://aberewamiddleschool.org/{name}"
        urls.append(f"  <url><loc>{loc}</loc></url>")
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(urls) + "\n</urlset>\n"


def main() -> None:
    changed = []

    new_pages = {
        "accessibility.html": ACCESSIBILITY_PAGE,
        "privacy.html": PRIVACY_PAGE,
        "faq.html": FAQ_PAGE,
        "robots.txt": ROBOTS,
    }
    for name, content in new_pages.items():
        path = ROOT / name
        if not path.exists() or path.read_text(encoding="utf-8") != content:
            path.write_text(content, encoding="utf-8")
            changed.append(name)

    for html_path in ROOT.glob("*.html"):
        if repair_html(html_path):
            changed.append(html_path.name)

    for css_name in ("information-pages.css", "style.css", "css/style.css"):
        if append_accessibility_css(ROOT / css_name):
            changed.append(css_name)

    sitemap = build_sitemap()
    sitemap_path = ROOT / "sitemap.xml"
    if not sitemap_path.exists() or sitemap_path.read_text(encoding="utf-8") != sitemap:
        sitemap_path.write_text(sitemap, encoding="utf-8")
        changed.append("sitemap.xml")

    print(f"Repaired {len(set(changed))} files")
    for name in sorted(set(changed)):
        print(name)


if __name__ == "__main__":
    main()
