import { useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Loader2,
  Plus,
  Sparkles,
  Trash,
} from "lucide-react";
import { server } from "../main";
import type {
  IITAchievement,
  IITCategory,
  IITEducation,
  IITExperience,
  IITLatexResponse,
  IITPosition,
  IITProject,
  IITResumeData,
} from "../types";

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
};

const blankEducation = (): IITEducation => ({
  degree: "",
  institute: "",
  cgpaOrPercentage: "",
  year: "",
});

const blankExperience = (): IITExperience => ({
  organization: "",
  location: "",
  role: "",
  dates: "",
  bullets: [""],
});

const blankProject = (): IITProject => ({
  name: "",
  subtitle: "",
  dates: "",
  linkLabel: "GitHub",
  linkUrl: "",
  bullets: [""],
});

const blankCategory = (): IITCategory => ({ category: "", items: "" });

const blankPosition = (): IITPosition => ({
  position: "",
  organization: "",
  tenure: "",
});

const blankAchievement = (): IITAchievement => ({
  title: "",
  description: "",
  year: "",
});

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-white/30 uppercase tracking-widest">
        {label}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={3}
          className="input-field resize-none"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="input-field"
        />
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="glass-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/2 transition-colors"
      >
        <span className="text-sm font-semibold text-white/80">{title}</span>
        {open ? (
          <ChevronUp size={16} className="text-white/30" />
        ) : (
          <ChevronDown size={16} className="text-white/30" />
        )}
      </button>
      {open && <div className="px-6 pb-6 flex flex-col gap-4">{children}</div>}
    </div>
  );
}

function updateItem<T, K extends keyof T>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  index: number,
  key: K,
  value: T[K]
) {
  setter((items) =>
    items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [key]: value } : item
    )
  );
}

function removeItem<T>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  index: number
) {
  setter((items) => items.filter((_, itemIndex) => itemIndex !== index));
}

function updateBullet<T extends { bullets: string[] }>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  itemIndex: number,
  bulletIndex: number,
  value: string
) {
  setter((items) =>
    items.map((item, index) =>
      index === itemIndex
        ? {
            ...item,
            bullets: item.bullets.map((bullet, currentBulletIndex) =>
              currentBulletIndex === bulletIndex ? value : bullet
            ),
          }
        : item
    )
  );
}

function addBullet<T extends { bullets: string[] }>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  itemIndex: number
) {
  setter((items) =>
    items.map((item, index) =>
      index === itemIndex ? { ...item, bullets: [...item.bullets, ""] } : item
    )
  );
}

function removeBullet<T extends { bullets: string[] }>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  itemIndex: number,
  bulletIndex: number
) {
  setter((items) =>
    items.map((item, index) =>
      index === itemIndex
        ? {
            ...item,
            bullets: item.bullets.filter(
              (_, currentBulletIndex) => currentBulletIndex !== bulletIndex
            ),
          }
        : item
    )
  );
}

function downloadLatex(latex: string, fileName: string) {
  const blob = new Blob([latex], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function cleanLines(lines: string[]) {
  return lines.map((line) => line.trim()).filter(Boolean);
}

function Preview({ result }: { result: IITLatexResponse }) {
  const resume = result.resume;

  return (
    <div className="glass-card p-6 flex flex-col gap-5">
      <div className="border-b border-white/8 pb-4">
        <h2 className="text-2xl font-bold text-white">
          {resume.personal.name}
        </h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-white/40 text-xs">
          {[
            `Roll No.: ${resume.personal.roll}`,
            resume.personal.course,
            resume.personal.branch,
            resume.personal.email1,
            resume.personal.email2,
          ]
            .filter(Boolean)
            .map((item) => (
              <span key={item}>{item}</span>
            ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
          Education
        </p>
        <div className="flex flex-col gap-2">
          {resume.education
            .filter(
              (education) =>
                education.degree ||
                education.institute ||
                education.cgpaOrPercentage ||
                education.year
            )
            .map((education, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <span className="text-white/70">
                  {education.degree} - {education.institute}
                </span>
                <span className="text-white/35">
                  {[education.cgpaOrPercentage, education.year]
                    .filter(Boolean)
                    .join(" - ")}
                </span>
              </div>
            ))}
        </div>
      </div>

      {resume.projects.some((project) => project.name) && (
        <div>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
            Projects
          </p>
          <div className="flex flex-col gap-3">
            {resume.projects
              .filter((project) => project.name)
              .map((project, index) => (
                <div key={index}>
                  <p className="text-white/75 font-semibold">
                    {project.name}
                  </p>
                  <p className="text-xs text-white/35">
                    {[project.subtitle, project.dates].filter(Boolean).join(" - ")}
                  </p>
                  <ul className="list-disc pl-4 mt-1 text-xs text-white/50">
                    {cleanLines(project.bullets).map((bullet, bulletIndex) => (
                      <li key={bulletIndex}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      )}

      {resume.skills.some((skill) => skill.category || skill.items) && (
        <div>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
            Technical Skills
          </p>
          <div className="flex flex-col gap-1 text-xs text-white/55">
            {resume.skills
              .filter((skill) => skill.category || skill.items)
              .map((skill, index) => (
                <p key={index}>
                  <span className="text-white/70 font-semibold">
                    {skill.category}:
                  </span>{" "}
                  {skill.items}
                </p>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

const BuildResumePage = () => {
  const [personal, setPersonal] = useState<IITResumeData["personal"]>({
    name: "",
    roll: "",
    course: "B.Tech",
    branch: "",
    phone: "",
    email1: "",
    email2: "",
    github: "",
    linkedin: "",
  });
  const [education, setEducation] = useState<IITEducation[]>([
    {
      degree: "B.Tech.",
      institute: "Indian Institute of Technology Indore",
      cgpaOrPercentage: "",
      year: "",
    },
    {
      degree: "Senior Secondary (XII)",
      institute: "",
      cgpaOrPercentage: "",
      year: "",
    },
    {
      degree: "Secondary (X)",
      institute: "",
      cgpaOrPercentage: "",
      year: "",
    },
  ]);
  const [experience, setExperience] = useState<IITExperience[]>([]);
  const [projects, setProjects] = useState<IITProject[]>([blankProject()]);
  const [skills, setSkills] = useState<IITCategory[]>([
    { category: "Languages", items: "" },
    { category: "Tools and Frameworks", items: "" },
  ]);
  const [courses, setCourses] = useState<IITCategory[]>([blankCategory()]);
  const [positions, setPositions] = useState<IITPosition[]>([blankPosition()]);
  const [achievements, setAchievements] = useState<IITAchievement[]>([
    blankAchievement(),
  ]);
  const [result, setResult] = useState<IITLatexResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [enhancingBullet, setEnhancingBullet] = useState<{
    projectIndex: number;
    bulletIndex: number;
  } | null>(null);

  function makeResumeData(): IITResumeData {
    return {
      personal,
      education,
      experience,
      projects,
      skills,
      courses,
      positions,
      achievements,
    };
  }

  async function enhanceBullet(
    projectIndex: number,
    bulletIndex: number,
    bulletText: string
  ) {
    if (!bulletText.trim()) {
      setError("Cannot enhance an empty bullet point.");
      return;
    }

    setEnhancingBullet({ projectIndex, bulletIndex });
    setError("");

    try {
      const { data } = await axios.post<{ enhanced: string }>(
        `${server}/api/ai/enhance-bullet`,
        { text: bulletText },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      updateBullet(setProjects, projectIndex, bulletIndex, data.enhanced);
    } catch (requestError: unknown) {
      const message = axios.isAxiosError(requestError)
        ? requestError.response?.data?.message
        : undefined;
      setError(message || "Failed to enhance bullet point.");
    } finally {
      setEnhancingBullet(null);
    }
  }

  async function handleSubmit() {
    setError("");
    setResult(null);

    if (!personal.name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!personal.roll.trim()) {
      setError("Roll number is required.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post<IITLatexResponse>(
        `${server}/api/ai/resume-build`,
        { resumeData: makeResumeData() },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setResult(data);
    } catch (requestError: unknown) {
      const message = axios.isAxiosError(requestError)
        ? requestError.response?.data?.message
        : undefined;
      setError(
        message || "Failed to generate IIT Indore LaTeX resume."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-page min-h-screen pt-20 px-4 md:px-8 pb-12">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div className="glass-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs text-emerald-300 uppercase tracking-widest">
                IIT Indore Format
              </p>
              <h1 className="text-2xl font-bold text-white mt-2">
                Resume Builder
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/35">
              <FileText size={14} />
              <span>Exports official-template LaTeX</span>
            </div>
          </div>
        </div>

        <Section title="Personal Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Full Name"
              value={personal.name}
              onChange={(value) =>
                setPersonal((current) => ({ ...current, name: value }))
              }
              placeholder="ABC Singh"
            />
            <Field
              label="Roll Number"
              value={personal.roll}
              onChange={(value) =>
                setPersonal((current) => ({ ...current, roll: value }))
              }
              placeholder="24000XXXX"
            />
            <Field
              label="Course"
              value={personal.course}
              onChange={(value) =>
                setPersonal((current) => ({ ...current, course: value }))
              }
              placeholder="B.Tech"
            />
            <Field
              label="Branch"
              value={personal.branch}
              onChange={(value) =>
                setPersonal((current) => ({ ...current, branch: value }))
              }
              placeholder="Electrical Engineering"
            />
            <Field
              label="Phone"
              value={personal.phone}
              onChange={(value) =>
                setPersonal((current) => ({ ...current, phone: value }))
              }
              placeholder="99999XXXXX"
            />
            <Field
              label="Personal Email"
              value={personal.email1}
              onChange={(value) =>
                setPersonal((current) => ({ ...current, email1: value }))
              }
              placeholder="name@example.com"
            />
            <Field
              label="Institute Email"
              value={personal.email2}
              onChange={(value) =>
                setPersonal((current) => ({ ...current, email2: value }))
              }
              placeholder="roll@iiti.ac.in"
            />
            <Field
              label="GitHub"
              value={personal.github}
              onChange={(value) =>
                setPersonal((current) => ({ ...current, github: value }))
              }
              placeholder="github-username"
            />
            <Field
              label="LinkedIn"
              value={personal.linkedin}
              onChange={(value) =>
                setPersonal((current) => ({ ...current, linkedin: value }))
              }
              placeholder="linkedin-username"
            />
          </div>
        </Section>

        <Section title="Education">
          {education.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 p-4 bg-white/3 rounded-xl border border-white/6"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/30 uppercase tracking-widest">
                  Education {index + 1}
                </span>
                {education.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(setEducation, index)}
                    className="text-red-400/60 hover:text-red-400 transition-colors"
                    aria-label="Remove education"
                  >
                    <Trash size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  label="Degree/Certificate"
                  value={item.degree}
                  onChange={(value) =>
                    updateItem(setEducation, index, "degree", value)
                  }
                  placeholder="B.Tech. (Electrical Engineering)"
                />
                <Field
                  label="Institute/Board"
                  value={item.institute}
                  onChange={(value) =>
                    updateItem(setEducation, index, "institute", value)
                  }
                  placeholder="Indian Institute of Technology Indore"
                />
                <Field
                  label="CGPA/Percentage"
                  value={item.cgpaOrPercentage}
                  onChange={(value) =>
                    updateItem(setEducation, index, "cgpaOrPercentage", value)
                  }
                  placeholder="9"
                />
                <Field
                  label="Year"
                  value={item.year}
                  onChange={(value) =>
                    updateItem(setEducation, index, "year", value)
                  }
                  placeholder="2024-Present"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setEducation((items) => [...items, blankEducation()])}
            className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors"
          >
            <Plus size={10} /> Add Education
          </button>
        </Section>

        <Section title="Projects">
          {projects.map((project, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 p-4 bg-white/3 rounded-xl border border-white/6"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/30 uppercase tracking-widest">
                  Project {index + 1}
                </span>
                {projects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(setProjects, index)}
                    className="text-red-400/60 hover:text-red-400 transition-colors"
                    aria-label="Remove project"
                  >
                    <Trash size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  label="Project Name"
                  value={project.name}
                  onChange={(value) =>
                    updateItem(setProjects, index, "name", value)
                  }
                  placeholder="XYZ"
                />
                <Field
                  label="Subtitle"
                  value={project.subtitle}
                  onChange={(value) =>
                    updateItem(setProjects, index, "subtitle", value)
                  }
                  placeholder="Personal Project"
                />
                <Field
                  label="Dates"
                  value={project.dates}
                  onChange={(value) =>
                    updateItem(setProjects, index, "dates", value)
                  }
                  placeholder="June 2026 - Present"
                />
                <Field
                  label="Link Label"
                  value={project.linkLabel}
                  onChange={(value) =>
                    updateItem(setProjects, index, "linkLabel", value)
                  }
                  placeholder="GitHub"
                />
                <Field
                  label="Link URL"
                  value={project.linkUrl}
                  onChange={(value) =>
                    updateItem(setProjects, index, "linkUrl", value)
                  }
                  placeholder="https://github.com/user/project"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-white/30 uppercase tracking-widest">
                  Work Done
                </label>
                {project.bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex gap-2">
                    <input
                      value={bullet}
                      onChange={(event) =>
                        updateBullet(
                          setProjects,
                          index,
                          bulletIndex,
                          event.target.value
                        )
                      }
                      placeholder={`Work done ${bulletIndex + 1}`}
                      className="input-field flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => enhanceBullet(index, bulletIndex, bullet)}
                      disabled={enhancingBullet?.projectIndex === index && enhancingBullet?.bulletIndex === bulletIndex}
                      className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs font-medium"
                      aria-label="Enhance bullet point"
                      title="Enhance this bullet point using AI"
                    >
                      {enhancingBullet?.projectIndex === index && enhancingBullet?.bulletIndex === bulletIndex ? (
                        <>
                          <Loader2 size={13} className="animate-spin" /> Enhancing
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} /> Enhance
                        </>
                      )}
                    </button>
                    {project.bullets.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeBullet(setProjects, index, bulletIndex)
                        }
                        className="text-red-400/50 hover:text-red-400 transition-colors"
                        aria-label="Remove bullet"
                      >
                        <Trash size={13} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addBullet(setProjects, index)}
                  className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors"
                >
                  <Plus size={10} /> Add Work Done
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setProjects((items) => [...items, blankProject()])}
            className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors"
          >
            <Plus size={10} /> Add Project
          </button>
        </Section>

        <Section title="Experience">
          {experience.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 p-4 bg-white/3 rounded-xl border border-white/6"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/30 uppercase tracking-widest">
                  Experience {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(setExperience, index)}
                  className="text-red-400/60 hover:text-red-400 transition-colors"
                  aria-label="Remove experience"
                >
                  <Trash size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  label="Organization"
                  value={item.organization}
                  onChange={(value) =>
                    updateItem(setExperience, index, "organization", value)
                  }
                  placeholder="Company or lab name"
                />
                <Field
                  label="Location"
                  value={item.location}
                  onChange={(value) =>
                    updateItem(setExperience, index, "location", value)
                  }
                  placeholder="Location"
                />
                <Field
                  label="Role"
                  value={item.role}
                  onChange={(value) =>
                    updateItem(setExperience, index, "role", value)
                  }
                  placeholder="Intern"
                />
                <Field
                  label="Dates"
                  value={item.dates}
                  onChange={(value) =>
                    updateItem(setExperience, index, "dates", value)
                  }
                  placeholder="May 2026 - Jul. 2026"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-white/30 uppercase tracking-widest">
                  Work Done
                </label>
                {item.bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex gap-2">
                    <input
                      value={bullet}
                      onChange={(event) =>
                        updateBullet(
                          setExperience,
                          index,
                          bulletIndex,
                          event.target.value
                        )
                      }
                      placeholder={`Work done ${bulletIndex + 1}`}
                      className="input-field flex-1"
                    />
                    {item.bullets.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeBullet(setExperience, index, bulletIndex)
                        }
                        className="text-red-400/50 hover:text-red-400 transition-colors"
                        aria-label="Remove bullet"
                      >
                        <Trash size={13} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addBullet(setExperience, index)}
                  className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors"
                >
                  <Plus size={10} /> Add Work Done
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setExperience((items) => [...items, blankExperience()])
            }
            className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors"
          >
            <Plus size={10} /> Add Experience
          </button>
        </Section>

        <Section title="Technical Skills">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-[0.8fr_1.4fr_auto] gap-3 items-end"
            >
              <Field
                label="Category"
                value={skill.category}
                onChange={(value) =>
                  updateItem(setSkills, index, "category", value)
                }
                placeholder="Languages"
              />
              <Field
                label="Skills"
                value={skill.items}
                onChange={(value) =>
                  updateItem(setSkills, index, "items", value)
                }
                placeholder="Python, C/C++, JavaScript"
              />
              {skills.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(setSkills, index)}
                  className="h-11 px-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  aria-label="Remove skill category"
                >
                  <Trash size={15} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setSkills((items) => [...items, blankCategory()])}
            className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors"
          >
            <Plus size={10} /> Add Skill Category
          </button>
        </Section>

        <Section title="Key Courses Taken">
          {courses.map((course, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-[0.8fr_1.4fr_auto] gap-3 items-end"
            >
              <Field
                label="Category"
                value={course.category}
                onChange={(value) =>
                  updateItem(setCourses, index, "category", value)
                }
                placeholder="Mathematics"
              />
              <Field
                label="Courses"
                value={course.items}
                onChange={(value) =>
                  updateItem(setCourses, index, "items", value)
                }
                placeholder="Linear Algebra, Basic Calculus"
              />
              {courses.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(setCourses, index)}
                  className="h-11 px-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  aria-label="Remove course category"
                >
                  <Trash size={15} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setCourses((items) => [...items, blankCategory()])}
            className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors"
          >
            <Plus size={10} /> Add Course Category
          </button>
        </Section>

        <Section title="Positions of Responsibility">
          {positions.map((position, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_0.8fr_auto] gap-3 items-end"
            >
              <Field
                label="Position"
                value={position.position}
                onChange={(value) =>
                  updateItem(setPositions, index, "position", value)
                }
                placeholder="Secretary"
              />
              <Field
                label="Organization"
                value={position.organization}
                onChange={(value) =>
                  updateItem(setPositions, index, "organization", value)
                }
                placeholder="XYZ Club, IIT Indore"
              />
              <Field
                label="Tenure"
                value={position.tenure}
                onChange={(value) =>
                  updateItem(setPositions, index, "tenure", value)
                }
                placeholder="Apr. 2026 - Present"
              />
              {positions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(setPositions, index)}
                  className="h-11 px-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  aria-label="Remove position"
                >
                  <Trash size={15} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setPositions((items) => [...items, blankPosition()])}
            className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors"
          >
            <Plus size={10} /> Add Position
          </button>
        </Section>

        <Section title="Achievements">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1.3fr_0.6fr_auto] gap-3 items-end"
            >
              <Field
                label="Title"
                value={achievement.title}
                onChange={(value) =>
                  updateItem(setAchievements, index, "title", value)
                }
                placeholder="Problem Solving"
              />
              <Field
                label="Description"
                value={achievement.description}
                onChange={(value) =>
                  updateItem(setAchievements, index, "description", value)
                }
                placeholder="Solved 300+ DSA problems"
              />
              <Field
                label="Year"
                value={achievement.year}
                onChange={(value) =>
                  updateItem(setAchievements, index, "year", value)
                }
                placeholder="2026"
              />
              {achievements.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(setAchievements, index)}
                  className="h-11 px-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  aria-label="Remove achievement"
                >
                  <Trash size={15} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setAchievements((items) => [...items, blankAchievement()])
            }
            className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors"
          >
            <Plus size={10} /> Add Achievement
          </button>
        </Section>

        {error && (
          <p className="text-red-400 text-sm flex items-center gap-1.5">
            <AlertCircle size={14} /> {error}
          </p>
        )}

        {!loading ? (
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            <FileText size={16} /> Generate IIT Indore LaTeX
          </button>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 size={36} className="text-indigo-400 animate-spin" />
            <p className="text-white/40 text-sm">
              Generating the IIT Indore template...
            </p>
          </div>
        )}

        {result && !loading && (
          <div className="flex flex-col gap-4">
            <Preview result={result} />
            <button
              type="button"
              onClick={() => downloadLatex(result.latex, result.fileName)}
              className="btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Download size={16} /> Download .tex
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildResumePage;
