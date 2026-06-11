/**
 * LaTeX Resume Generator for the official IIT Indore resume format.
 */

export interface IITResumeData {
  personal: {
    name: string;
    roll: string;
    course: string;
    branch: string;
    phone: string;
    email1: string;
    email2?: string;
    github?: string;
    linkedin?: string;
  };
  education: Array<{
    degree: string;
    institute: string;
    cgpaOrPercentage: string;
    year: string;
  }>;
  experience?: Array<{
    organization: string;
    location: string;
    role: string;
    dates: string;
    bullets: string[];
  }>;
  projects?: Array<{
    name: string;
    subtitle: string;
    dates: string;
    linkLabel?: string;
    linkUrl?: string;
    bullets: string[];
  }>;
  skills?: Array<{
    category: string;
    items: string;
  }>;
  courses?: Array<{
    category: string;
    items: string;
  }>;
  positions?: Array<{
    position: string;
    organization: string;
    tenure: string;
  }>;
  achievements?: Array<{
    title: string;
    description: string;
    year: string;
  }>;
}

function escapeLatex(text: string | undefined): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/#/g, "\\#")
    .replace(/\$/g, "\\$")
    .replace(/%/g, "\\%")
    .replace(/&/g, "\\&")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function clean(value: string | undefined): string {
  return value?.trim() ?? "";
}

function cleanList(values: string[] | undefined): string[] {
  return (values ?? []).map(clean).filter(Boolean);
}

function profileId(value: string | undefined, domain: string): string {
  const text = clean(value).replace(/^@/, "");
  if (!text) return "";

  const match = text.match(new RegExp(`${domain.replace(".", "\\.")}/([^/?#]+)`, "i"));
  if (match?.[1]) return match[1].replace(/\/$/, "");

  return text
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(new RegExp(`^${domain.replace(".", "\\.")}/`, "i"), "")
    .replace(/^in\//i, "")
    .replace(/\/$/, "");
}

function hasAnyValue(values: Array<string | undefined>): boolean {
  return values.some((value) => clean(value).length > 0);
}

export function generateLatexResume(data: IITResumeData): string {
  const personal = data.personal;
  const branch = clean(personal.branch) || "Engineering";
  const github = profileId(personal.github, "github.com");
  const linkedin = profileId(personal.linkedin, "linkedin.com");

  const educationRows = (data.education ?? [])
    .filter((edu) =>
      hasAnyValue([edu.degree, edu.institute, edu.cgpaOrPercentage, edu.year])
    )
    .map(
      (edu) =>
        `  ${escapeLatex(edu.degree)} & ${escapeLatex(edu.institute)} & ${escapeLatex(
          edu.cgpaOrPercentage
        )} & ${escapeLatex(edu.year)} \\\\\\hline`
    )
    .join("\n");

  const experienceContent = (data.experience ?? [])
    .filter((exp) =>
      hasAnyValue([exp.organization, exp.location, exp.role, exp.dates])
    )
    .map((exp) => {
      const bullets = cleanList(exp.bullets)
        .map((bullet) => `    \\item {${escapeLatex(bullet)}}`)
        .join("\n");

      return `    \\resumeSubheading
      {${escapeLatex(exp.organization)}}{${escapeLatex(exp.location)}}
      {${escapeLatex(exp.role)}}{${escapeLatex(exp.dates)}}
      \\resumeItemListStart
${bullets}
    \\resumeItemListEnd`;
    })
    .join("\n\n");

  const projectsContent = (data.projects ?? [])
    .filter((project) =>
      hasAnyValue([project.name, project.subtitle, project.dates, project.linkLabel, project.linkUrl])
    )
    .map((project) => {
      const bullets = cleanList(project.bullets)
        .map((bullet) => `        \\item {${escapeLatex(bullet)}}`)
        .join("\n");
      const label = clean(project.linkLabel) || (project.linkUrl ? "GitHub" : "");
      const link = project.linkUrl
        ? `\\href{${escapeLatex(project.linkUrl)}}{${escapeLatex(label || "Link")}}`
        : escapeLatex(label);

      return `    \\resumeProject
      {${escapeLatex(project.name)}}
      {${escapeLatex(project.subtitle)}}
      {${escapeLatex(project.dates)}}
      {${link}}
      \\resumeItemListStart
${bullets}
    \\resumeItemListEnd`;
    })
    .join("\n\n");

  const skillsContent = (data.skills ?? [])
    .filter((skill) => hasAnyValue([skill.category, skill.items]))
    .map(
      (skill) => `  \\resumeSubItem{${escapeLatex(skill.category)}}
    {${escapeLatex(skill.items)}}`
    )
    .join("\n");

  const coursesContent = (data.courses ?? [])
    .filter((course) => hasAnyValue([course.category, course.items]))
    .map(
      (course) => `  \\resumeSubItem{${escapeLatex(course.category)}}
    {${escapeLatex(course.items)}}`
    )
    .join("\n");

  const positionsContent = (data.positions ?? [])
    .filter((position) =>
      hasAnyValue([position.position, position.organization, position.tenure])
    )
    .map(
      (position) => `  \\resumePOR{${escapeLatex(position.position)}}
    {${escapeLatex(position.organization)}}
    {${escapeLatex(position.tenure)}}`
    )
    .join("\n");

  const achievementsContent = (data.achievements ?? [])
    .filter((achievement) =>
      hasAnyValue([achievement.title, achievement.description, achievement.year])
    )
    .map(
      (achievement) => `  \\resumePOR{${escapeLatex(achievement.title)}}
    {${escapeLatex(achievement.description)}}
    {${escapeLatex(achievement.year)}}`
    )
    .join("\n");

  return `%-------------------------
%  IIT Indore Resume Template
%  Generated by HireU Resume Builder
%------------------------

\\documentclass[a4paper,11pt]{article}
\\usepackage{latexsym}
\\usepackage{xcolor}
\\usepackage{float}
\\usepackage{ragged2e}
\\usepackage[empty]{fullpage}
\\usepackage{wrapfig}
\\usepackage{lipsum}
\\usepackage{tabularx}
\\usepackage{titlesec}
\\usepackage{geometry}
\\usepackage{marvosym}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage{multicol}
\\usepackage{graphicx}
\\usepackage{cfr-lm}
\\usepackage[T1]{fontenc}
\\setlength{\\multicolsep}{0pt}
\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\geometry{left=1.4cm, top=0.8cm, right=1.2cm, bottom=1cm}

\\usepackage[most]{tcolorbox}
\\tcbset{
  frame code={},
  center title,
  left=0pt,
  right=0pt,
  top=0pt,
  bottom=0pt,
  colback=gray!20,
  colframe=white,
  width=\\dimexpr\\textwidth\\relax,
  enlarge left by=-2mm,
  boxsep=4pt,
  arc=0pt,outer arc=0pt,
}

\\urlstyle{same}
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-7pt}]

\\newcommand{\\resumeItem}[2]{
  \\item{
    \\textbf{#1}{:\\hspace{0.5mm}#2 \\vspace{-0.5mm}}
  }
}

\\newcommand{\\resumePOR}[3]{
\\vspace{0.5mm}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
        \\textbf{#1},\\hspace{0.3mm}#2 & \\textit{\\small{#3}}
    \\end{tabular*}
    \\vspace{-2mm}
}

\\newcommand{\\resumeSubheading}[4]{
\\vspace{0.5mm}\\item
    \\begin{tabular*}{0.98\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
        \\textbf{#1} & \\textit{\\footnotesize{#4}} \\\\
        \\textit{\\footnotesize{#3}} &  \\footnotesize{#2}\\\\
    \\end{tabular*}
    \\vspace{-2.4mm}
}

\\newcommand{\\resumeProject}[4]{
\\vspace{0.5mm}\\item
    \\begin{tabular*}{0.98\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
        \\textbf{#1} & \\textit{\\footnotesize{#3}} \\\\
        \\footnotesize{\\textit{#2}} & \\footnotesize{#4}
    \\end{tabular*}
    \\vspace{-2.4mm}
}

\\newcommand{\\resumeSubItem}[2]{\\resumeItem{#1}{#2}\\vspace{-4pt}}
\\renewcommand{\\labelitemi}{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=*,labelsep=0mm]}
\\newcommand{\\resumeHeadingSkillStart}{\\begin{itemize}[leftmargin=*,itemsep=1.7mm, rightmargin=2ex]}
\\newcommand{\\resumeItemListStart}{\\begin{justify}\\begin{itemize}[leftmargin=3ex, rightmargin=2ex, noitemsep,labelsep=1.2mm,itemsep=0mm]\\small}

\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}\\vspace{2mm}}
\\newcommand{\\resumeHeadingSkillEnd}{\\end{itemize}\\vspace{-2mm}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\end{justify}\\vspace{-2mm}}

\\newcolumntype{L}{>{\\raggedright\\arraybackslash}X}
\\newcolumntype{R}{>{\\raggedleft\\arraybackslash}X}
\\newcolumntype{C}{>{\\centering\\arraybackslash}X}

\\newcommand{\\name}{${escapeLatex(personal.name)}}
\\newcommand{\\course}{${escapeLatex(personal.course)}}
\\newcommand{\\roll}{${escapeLatex(personal.roll)}}
\\newcommand{\\phone}{${escapeLatex(personal.phone)}}
\\newcommand{\\emaila}{${escapeLatex(personal.email1)}}
\\newcommand{\\emailb}{${escapeLatex(personal.email2)}}
\\newcommand{\\github}{${escapeLatex(github)}}
\\newcommand{\\linkedin}{${escapeLatex(linkedin)}}

\\begin{document}
\\fontfamily{cmr}\\selectfont

\\parbox{2.35cm}{%
\\includegraphics[width=2.35cm,clip]{Your_Photo.jpg}
}
\\parbox{\\dimexpr\\linewidth-5cm\\relax}{
\\begin{tabularx}{\\linewidth}{L r}
  \\textbf{\\LARGE \\name} & +91-\\phone\\\\
  {Roll No.:\\roll} & \\href{mailto:\\emaila}{\\emaila} \\\\
  \\course &  \\href{mailto:\\emailb}{\\emailb}\\\\
  {${escapeLatex(branch)}} &  \\href{https://github.com/\\github}{GitHub}\\\\
  {Indian Institute Of Technology, Indore} & \\href{https://www.linkedin.com/in/\\linkedin/}{linkedin.com/in/\\linkedin}
\\end{tabularx}
}
\\parbox{2.35cm}{%
\\includegraphics[width=3cm,clip]{IITI Logo - Refined.jpg}
}

\\section{Education}
\\setlength{\\tabcolsep}{5pt}
\\small{\\begin{tabularx}
{\\dimexpr\\textwidth-3mm\\relax}{|c|C|c|c|}
  \\hline
  \\textbf{Degree/Certificate } & \\textbf{Institute/Board} & \\textbf{CGPA/Percentage} & \\textbf{Year}\\\\
  \\hline
${educationRows}
\\end{tabularx}}
\\vspace{-2mm}

${
  experienceContent
    ? `%-----------EXPERIENCE-----------------
\\section{Experience}
  \\resumeSubHeadingListStart
${experienceContent}
  \\resumeSubHeadingListEnd
\\vspace{-5.5mm}
`
    : ""
}${
    projectsContent
      ? `%-----------PROJECTS-----------------
\\section{Projects}
\\resumeSubHeadingListStart
${projectsContent}
\\resumeSubHeadingListEnd
\\vspace{-5.5mm}
`
      : ""
  }${
    skillsContent
      ? `\\section{Technical Skills}
 \\resumeHeadingSkillStart
${skillsContent}
\\hfill \\textit{\\footnotesize{* Elementary proficiency}} \\hspace{3mm}
 \\resumeHeadingSkillEnd
`
      : ""
  }${
    coursesContent
      ? `\\section{Key Courses Taken}
\\resumeHeadingSkillStart
${coursesContent}
\\resumeHeadingSkillEnd
`
      : ""
  }${
    positionsContent
      ? `\\section{Positions of Responsibility}
\\vspace{-0.4mm}
\\resumeSubHeadingListStart
${positionsContent}
\\resumeSubHeadingListEnd
\\vspace{-4mm}
`
      : ""
  }${
    achievementsContent
      ? `\\section{Achievements}
\\vspace{-0.2mm}
\\resumeSubHeadingListStart
${achievementsContent}
\\resumeSubHeadingListEnd
`
      : ""
  }\\hspace*{-5mm}\\rule{1.035\\textwidth}{0.1mm}

\\end{document}
`;
}
