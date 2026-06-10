import { useEffect, useState, type ReactNode } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Crown,
  ExternalLink,
  LogOut,
  Mail,
  Zap,
  History,
  ScanText,
  Briefcase,
  FileEdit,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useAppData } from "../context/AppContext";
import { HashLink } from "react-router-hash-link";
import axios from "axios";
import { server } from "../main";
import type {
  Analysis,
  HistoryEntry,
  InterviewData,
  Job,
  ResumeData,
} from "../types";

const typeConfig: Record<
  HistoryEntry["type"],
  { label: string; icon: any; color: string; bg: string }
> = {
  resume_analyse: {
    label: "Resume Analysed",
    icon: ScanText,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  job_match: {
    label: "Job Matched",
    icon: Briefcase,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  resume_build: {
    label: "Resume Built",
    icon: FileEdit,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
  interview_prep: {
    label: "Interview Prep",
    icon: MessageSquare,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asResume(details: HistoryEntry["details"]): ResumeData | null {
  return isObject(details) && "experience" in details && "education" in details
    ? (details as unknown as ResumeData)
    : null;
}

function asAnalysis(details: HistoryEntry["details"]): Analysis | null {
  return isObject(details) && "atsScore" in details && "suggestions" in details
    ? (details as unknown as Analysis)
    : null;
}

function asJobMatch(
  details: HistoryEntry["details"]
): { jobs: Job[]; summary: string } | null {
  return isObject(details) && Array.isArray(details.jobs)
    ? (details as { jobs: Job[]; summary: string })
    : null;
}

function asInterview(details: HistoryEntry["details"]): InterviewData | null {
  return isObject(details) && Array.isArray(details.questions)
    ? (details as unknown as InterviewData)
    : null;
}

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white/4 border border-white/8 p-3">
      <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">
        {title}
      </p>
      {children}
    </div>
  );
}

function renderHistoryDetails(entry: HistoryEntry) {
  if (!entry.details) {
    return (
      <p className="text-xs text-white/35 leading-relaxed">
        Detailed output was not saved for this older activity. New generated
        resumes, analyses, job matches, and interview questions will appear
        here.
      </p>
    );
  }

  if (entry.type === "resume_analyse") {
    const analysis = asAnalysis(entry.details);
    if (!analysis) return null;

    return (
      <div className="flex flex-col gap-3">
        <DetailBlock title="ATS Result">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-white/60 leading-relaxed">
              {analysis.summary}
            </p>
            <span className="text-2xl font-black text-indigo-300 shrink-0">
              {analysis.atsScore}
            </span>
          </div>
        </DetailBlock>

        {analysis.strengths?.length > 0 && (
          <DetailBlock title="Strengths">
            <div className="flex flex-col gap-2">
              {analysis.strengths.map((strength, index) => (
                <p
                  key={index}
                  className="text-xs text-white/55 flex items-start gap-2"
                >
                  <CheckCircle2
                    size={13}
                    className="text-emerald-400 shrink-0 mt-0.5"
                  />
                  {strength}
                </p>
              ))}
            </div>
          </DetailBlock>
        )}

        {analysis.suggestions?.length > 0 && (
          <DetailBlock title="Suggestions">
            <div className="flex flex-col gap-2">
              {analysis.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-white/4 p-2 text-xs text-white/50"
                >
                  <p className="font-semibold text-white/70">
                    {suggestion.category} - {suggestion.priority}
                  </p>
                  <p className="mt-1">{suggestion.recommendation}</p>
                </div>
              ))}
            </div>
          </DetailBlock>
        )}
      </div>
    );
  }

  if (entry.type === "job_match") {
    const match = asJobMatch(entry.details);
    if (!match) return null;

    return (
      <div className="flex flex-col gap-3">
        {match.summary && (
          <DetailBlock title="Summary">
            <p className="text-sm text-white/60 leading-relaxed">
              {match.summary}
            </p>
          </DetailBlock>
        )}

        <DetailBlock title="Matched Jobs">
          <div className="flex flex-col gap-3">
            {match.jobs.map((job, index) => (
              <div key={index} className="rounded-lg bg-white/4 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white/80">
                      {job.title}
                    </p>
                    <p className="text-xs text-white/35 mt-0.5">
                      {job.company} - {job.location} - {job.type}
                    </p>
                  </div>
                  <span className="text-lg font-black text-emerald-300">
                    {job.matchScore}%
                  </span>
                </div>
                {job.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {job.skills.map((skill) => (
                      <span key={skill} className="feature-pill">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                {job.whyMatch && (
                  <p className="text-xs text-white/50 leading-relaxed mt-2">
                    {job.whyMatch}
                  </p>
                )}
                {job.applyTip && (
                  <p className="text-xs text-white/45 leading-relaxed mt-2 flex gap-1.5">
                    <ExternalLink
                      size={12}
                      className="text-indigo-300 shrink-0 mt-0.5"
                    />
                    {job.applyTip}
                  </p>
                )}
              </div>
            ))}
          </div>
        </DetailBlock>
      </div>
    );
  }

  if (entry.type === "resume_build") {
    const resume = asResume(entry.details);
    if (!resume) return null;

    return (
      <div className="flex flex-col gap-3">
        <DetailBlock title="Resume">
          <p className="text-base font-bold text-white/85">{resume.name}</p>
          <p className="text-xs text-white/35 mt-1">
            {[resume.email, resume.phone, resume.location, resume.linkedin]
              .filter(Boolean)
              .join(" - ")}
          </p>
          {resume.summary && (
            <p className="text-sm text-white/60 leading-relaxed mt-3">
              {resume.summary}
            </p>
          )}
        </DetailBlock>

        {resume.experience?.length > 0 && (
          <DetailBlock title="Experience">
            <div className="flex flex-col gap-3">
              {resume.experience.map((exp, index) => (
                <div key={index}>
                  <p className="text-sm font-semibold text-white/75">
                    {exp.title} - {exp.company}
                  </p>
                  <p className="text-xs text-white/30">
                    {[exp.location, exp.startDate, exp.endDate]
                      .filter(Boolean)
                      .join(" - ")}
                  </p>
                  <ul className="list-disc pl-4 mt-1.5 text-xs text-white/50">
                    {exp.bullets?.filter(Boolean).map((bullet, bulletIndex) => (
                      <li key={bulletIndex}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </DetailBlock>
        )}

        {(resume.skills?.technical?.length > 0 ||
          resume.skills?.soft?.length > 0) && (
          <DetailBlock title="Skills">
            <div className="flex flex-col gap-2 text-xs text-white/55">
              {resume.skills.technical?.length > 0 && (
                <p>
                  <span className="font-semibold text-white/70">
                    Technical:
                  </span>{" "}
                  {resume.skills.technical.join(", ")}
                </p>
              )}
              {resume.skills.soft?.length > 0 && (
                <p>
                  <span className="font-semibold text-white/70">Soft:</span>{" "}
                  {resume.skills.soft.join(", ")}
                </p>
              )}
            </div>
          </DetailBlock>
        )}

        {resume.projects?.length > 0 && (
          <DetailBlock title="Projects">
            <div className="flex flex-col gap-2">
              {resume.projects.map((project, index) => (
                <div key={index} className="text-xs">
                  <p className="font-semibold text-white/70">{project.name}</p>
                  <p className="text-white/45 mt-0.5">{project.description}</p>
                </div>
              ))}
            </div>
          </DetailBlock>
        )}
      </div>
    );
  }

  if (entry.type === "interview_prep") {
    const interview = asInterview(entry.details);
    if (!interview) return null;

    return (
      <div className="flex flex-col gap-3">
        <DetailBlock title="Interview Set">
          <p className="text-sm font-semibold text-white/80">
            {interview.role}
          </p>
          <p className="text-xs text-white/35 mt-0.5">
            {interview.round === "hr" ? "HR Round" : "Technical Round"} -{" "}
            {interview.questions.length} questions
          </p>
        </DetailBlock>

        <DetailBlock title="Questions">
          <div className="flex flex-col gap-3">
            {interview.questions.map((question) => (
              <div key={question.id} className="rounded-lg bg-white/4 p-3">
                <p className="text-sm text-white/75 leading-relaxed">
                  Q{question.id}. {question.question}
                </p>
                <p className="text-[10px] text-white/25 uppercase tracking-widest mt-1">
                  {question.category}
                </p>
                {question.hint && (
                  <p className="text-xs text-white/45 leading-relaxed mt-2">
                    Hint: {question.hint}
                  </p>
                )}
              </div>
            ))}
          </div>
        </DetailBlock>
      </div>
    );
  }

  return null;
}

const Account = () => {
  const { user, LogoutUser } = useAppData();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [openHistoryId, setOpenHistoryId] = useState<string | null>(null);

  const isPro = user?.subscription && new Date() < new Date(user.subscription);
  const FREE_LIMIT = 10;
  const freeLeft = Math.max(0, FREE_LIMIT - (user?.freeRequestsUsed ?? 0));

  useEffect(() => {
    async function loadHistory() {
      try {
        const { data } = await axios.get(`${server}/api/user/history`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setHistory(data);
      } catch {
        /* ignore */
      } finally {
        setHistoryLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <div className="bg-page flex items-start justify-center px-4 pt-28 pb-12">
      <div className="w-full max-w-xl flex flex-col gap-5">
        {/* Profile card */}
        <div className="glass-card p-6 flex items-center gap-4">
          <img
            src="/user.png"
            alt="avatar"
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/10"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg truncate">{user?.name}</h2>
            <p className="text-white/40 text-sm flex items-center gap-1.5 truncate">
              <Mail size={12} /> {user?.email}
            </p>
          </div>
          <button
            className="feature-pill gap-2 text-red-400 border-red-500/20 hover:bg-red-500/10 transition-colors cursor-pointer"
            onClick={LogoutUser}
          >
            <LogOut size={12} /> Sign out
          </button>
        </div>

        {/* Plan card */}
        <div
          className={`glass-card p-6 flex items-center gap-4 ${
            isPro ? "border-emerald-500/25" : "border-white/8"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isPro ? "bg-emerald-500/15" : "bg-white/5"
            }`}
          >
            {isPro ? (
              <Crown size={20} className="text-emerald-400" />
            ) : (
              <Zap size={20} className="text-white/40" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold">{isPro ? "Pro Plan" : "Free Plan"}</p>
            {isPro ? (
              <p className="text-white/40 text-sm flex items-center gap-1.5 mt-0.5">
                <Calendar size={12} /> Expires{" "}
                {new Date(user!.subscription!).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            ) : (
              <p className="text-white/40 text-sm mt-0.5">
                {freeLeft} of {FREE_LIMIT} free requests remaining
              </p>
            )}
          </div>
          {!isPro && (
            <HashLink
              to="/#pricing"
              className="btn-primary text-xs font-semibold px-4 py-2 rounded-lg whitespace-nowrap"
            >
              Upgrade
            </HashLink>
          )}
        </div>

        {/* Credits card (only for non-Pro) */}
        {!isPro && (
          <div className="glass-card p-6 flex flex-col gap-4">
            {/* Free requests bar */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Free requests used</span>
                <span className="text-white/70 font-medium">
                  {user?.freeRequestsUsed ?? 0} / {FREE_LIMIT}
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      ((user?.freeRequestsUsed ?? 0) / FREE_LIMIT) * 100
                    }%`,
                  }}
                />
              </div>
              {freeLeft === 0 && (
                <p className="text-xs text-amber-400/80">
                  You have used all free requests.
                </p>
              )}
            </div>

            {/* Paid credits */}
            <div className="divider-subtle" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Paid Credits</p>
                <p className="text-white/35 text-xs mt-0.5">
                  Buy more at ₹1 for 10 credits
                </p>
              </div>
              <span className="text-2xl font-black text-indigo-400">
                {user?.paidCredits ?? 0}
              </span>
            </div>
          </div>
        )}

        {/* Activity History */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <History size={16} className="text-white/40" />
            <p className="text-sm font-semibold text-white/70">
              Activity History
            </p>
          </div>

          {historyLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 size={22} className="text-indigo-400 animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-6">
              No activity yet. Start using HireU to see your history here.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {history.map((entry) => {
                const cfg = typeConfig[entry.type];
                const Icon = cfg.icon;
                const isOpen = openHistoryId === entry._id;
                return (
                  <div
                    key={entry._id}
                    className="rounded-xl bg-white/3 hover:bg-white/5 transition-colors overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenHistoryId(isOpen ? null : entry._id)
                      }
                      className="w-full flex items-start gap-3 p-3 text-left cursor-pointer"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}
                      >
                        <Icon size={14} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white/60">
                          {cfg.label}
                        </p>
                        <p className="text-sm text-white/80 truncate">
                          {entry.summary}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p className="text-[10px] text-white/25 mt-0.5">
                          {new Date(entry.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                            }
                          )}
                        </p>
                        {isOpen ? (
                          <ChevronUp size={14} className="text-white/30" />
                        ) : (
                          <ChevronDown size={14} className="text-white/30" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-3 pb-3 pt-1 border-t border-white/6">
                        {renderHistoryDetails(entry)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
