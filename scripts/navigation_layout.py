"""Consistent public navigation and bottom-only dashboard entry."""
import re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
ORIGIN='https://aberewamiddleschool.org/'
def link(path,label):return f'<a href="{ORIGIN}{path}">{label}</a>'
def group(label,items):return '<details class="school-nav-group"><summary>'+label+'</summary><div class="school-nav-dropdown">'+''.join(link(*x) for x in items)+'</div></details>'
NAV='<nav class="school-navigation" aria-label="Primary navigation">'+link('','Home')+group('Our school',[('vision.html','About Aberewa'),('leadership-governance.html','Leadership'),('roadmap.html','School roadmap'),('employment-policies.html','Employment')])+group('Learning',[('curriculum.html','Curriculum'),('student-support.html','Student support'),('iep.html','IEP integration'),('media.html','Media'),('interactive-tools.html','Interactive tools'),('concept-schedules.html','Schedules')])+group('Capoeira',[('capoeira-angola.html','Capoeira Angola program'),('capoeira-angola-game.html','Play RODA'),('guardia-verde/','Play Guardiã Verde')])+group('Support',[('support.html','Support the school'),('grants-partnerships.html','Grants & partnerships')])+link('contact.html','Contact')+'</nav>'
DASH='<div class="school-dashboard-entry"><a class="dashboard-site-link" href="'+ORIGIN+'math-teacher.html#inquiries">Dashboard sign in <span aria-hidden="true">↗</span></a></div>'
def normalize_navigation(text):
 text=re.sub(r'<div class="school-dashboard-entry">.*?</div>','',text,flags=re.S)
 text=re.sub(r'<a\b[^>]*class="dashboard-site-link"[^>]*>.*?</a>','',text,flags=re.S)
 first=re.search(r'<nav\b[^>]*>.*?</nav>',text,re.S|re.I)
 if first:text=text[:first.start()]+NAV+text[first.end():]
 elif '</header>' in text:text=text.replace('</header>','</header>'+NAV,1)
 else:text=text.replace('<body>','<body>'+NAV,1)
 if '</footer>' in text:text=text.replace('</footer>',DASH+'</footer>',1)
 else:text=text.replace('</body>','<footer class="site-dashboard-footer">'+DASH+'</footer></body>',1)
 if 'school-navigation.css' not in text:text=text.replace('</head>','<link rel="stylesheet" href="'+ORIGIN+'school-navigation.css?v=2"></head>',1)
 return text
if __name__=='__main__':
 for p in ROOT.glob('*.html'):p.write_text(normalize_navigation(p.read_text()))
