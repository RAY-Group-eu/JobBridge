import { requireCompleteProfile } from "@/lib/auth";
import { Users, Briefcase, Shield } from "lucide-react";
import { StatsBento } from "./dashboard/StatsBento";
import { getDashboardMetrics, getRecentActivity, getStaffHeaderContext, getWorkQueue } from "@/lib/data/adminDashboard";
import Link from "next/link";

export default async function AdminDashboard() {
  const { session } = await requireCompleteProfile();

  const [metrics, activity, workQueue, staffHeader] = await Promise.all([
    getDashboardMetrics(),
    getRecentActivity(15, 0),
    getWorkQueue(),
    getStaffHeaderContext(session.user.id),
  ]);

  const firstName = staffHeader.fullName.split(" ")[0] || "Staff";
  const demoLabel = staffHeader.demoView === "job_provider" ? "job_provider" : "job_seeker";

  const metricsAllFailed = Boolean(metrics.users.error && metrics.jobs.error && metrics.applications.error);
  const allSectionsFailed = metricsAllFailed && Boolean(activity.error) && Boolean(workQueue.error);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Welcome back, {firstName}.</h1>
          <p className="text-sm text-slate-400 mt-1">Live operations overview for JobBridge staff.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <span
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${
              staffHeader.highestRole === "admin"
                ? "bg-purple-500/15 text-purple-200 border-purple-500/30"
                : staffHeader.highestRole === "moderator"
                  ? "bg-blue-500/15 text-blue-200 border-blue-500/30"
                  : staffHeader.highestRole === "analyst"
                    ? "bg-sky-500/15 text-sky-200 border-sky-500/30"
                    : "bg-slate-500/15 text-slate-200 border-slate-500/30"
            }`}
          >
            {staffHeader.highestRole}
          </span>
          <span
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${
              staffHeader.demoEnabled
                ? "bg-amber-500/15 text-amber-200 border-amber-500/30"
                : "bg-emerald-500/15 text-emerald-200 border-emerald-500/30"
            }`}
          >
            {staffHeader.demoEnabled ? `DEMO: ${demoLabel}` : "LIVE"}
          </span>
        </div>
      </div>

      {staffHeader.error && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <p className="text-sm text-amber-200">Failed to load header metadata completely.</p>
          <p className="text-xs text-amber-300/80 mt-1">{staffHeader.error}</p>
        </div>
      )}

      {allSectionsFailed && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
          <p className="text-sm text-rose-200 font-medium">Dashboard data could not be loaded.</p>
          <p className="text-xs text-rose-300/80 mt-1">
            {[metrics.users.error, metrics.jobs.error, metrics.applications.error, activity.error, workQueue.error]
              .filter(Boolean)
              .join(" ")}
          </p>
        </div>
      )}

      <StatsBento
        metrics={metrics}
        activity={activity.items}
        activityHasMore={activity.hasMore}
        activityError={activity.error}
        workQueue={workQueue.items}
        workQueueError={workQueue.error}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/staff/demo"
          className="p-4 bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 rounded-2xl flex items-center justify-between group transition-all"
        >
          <span className="font-semibold text-indigo-300">Demo Setup</span>
          <Briefcase size={18} className="text-indigo-400 group-hover:scale-110 transition-transform" />
        </Link>
        <Link
          href="/staff/roles"
          className="p-4 bg-slate-800/50 border border-white/5 hover:bg-slate-800/80 rounded-2xl flex items-center justify-between group transition-all"
        >
          <span className="font-semibold text-slate-300">Roles & perms</span>
          <Shield size={18} className="text-slate-400 group-hover:scale-110 transition-transform" />
        </Link>
        <Link
          href="/staff/users"
          className="p-4 bg-slate-800/50 border border-white/5 hover:bg-slate-800/80 rounded-2xl flex items-center justify-between group transition-all"
        >
          <span className="font-semibold text-slate-300">Manage Users</span>
          <Users size={18} className="text-slate-400 group-hover:scale-110 transition-transform" />
        </Link>
        <Link
          href="/staff/jobs"
          className="p-4 bg-slate-800/50 border border-white/5 hover:bg-slate-800/80 rounded-2xl flex items-center justify-between group transition-all"
        >
          <span className="font-semibold text-slate-300">Manage Jobs</span>
          <Briefcase size={18} className="text-slate-400 group-hover:scale-110 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
