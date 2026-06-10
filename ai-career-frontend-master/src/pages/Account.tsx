import { useEffect, useState } from "react";
import {
  Calendar,
  Crown,
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
import type { HistoryEntry } from "../types";

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

const Account = () => {
  const { user, LogoutUser } = useAppData();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

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
                return (
                  <div
                    key={entry._id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors"
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
                    <p className="text-[10px] text-white/25 shrink-0 mt-0.5">
                      {new Date(entry.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
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
