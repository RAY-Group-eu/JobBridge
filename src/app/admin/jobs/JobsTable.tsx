"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar, Mail, MapPin, User, X } from "lucide-react";
import { type AdminJobDetail, type AdminJobListItem } from "@/lib/data/adminTypes";

type JobsTableProps = {
  jobs: AdminJobListItem[];
  selectedJob: AdminJobDetail | null;
  query: string;
};

export function JobsTable({ jobs, selectedJob, query }: JobsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const basePath = query ? `${pathname}?q=${encodeURIComponent(query)}` : pathname;

  function openJob(jobId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("jobId", jobId);
    const nextUrl = `${pathname}?${params.toString()}`;
    router.push(nextUrl, { scroll: false });
  }

  function closeDrawer() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("jobId");
    const nextQuery = params.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }

  return (
    <>
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/80 border-b border-white/5 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Job Title</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Posted By</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Posted</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{job.title}</div>
                    <div className="text-xs text-slate-500 truncate max-w-[280px]">{job.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold uppercase">
                        {(job.posted_by_name || "?").substring(0, 1)}
                      </div>
                      <div className="text-sm text-slate-300">{job.posted_by_name || "Unknown"}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-md text-xs font-medium capitalize border ${
                        job.status === "open"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : job.status === "closed"
                            ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin size={12} />
                      {job.location_label || "Remote"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{new Date(job.created_at).toLocaleDateString("de-DE")}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => openJob(job.id)}
                      className="text-indigo-400 hover:text-indigo-300 text-sm font-medium hover:underline"
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-900/80 px-6 py-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {jobs.length} jobs
            {query ? ` for "${query}"` : ""}
          </span>
          <span>Deep link: `/staff/jobs?jobId=&lt;uuid&gt;`</span>
        </div>
      </div>

      {selectedJob && (
        <>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close job drawer"
            className="fixed inset-0 bg-black/50 z-40"
          />
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-950 border-l border-white/10 p-6 overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{selectedJob.title}</h2>
                <p className="text-xs text-slate-500 font-mono mt-1">{selectedJob.id}</p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white border border-white/10 rounded-lg px-2 py-1"
              >
                <X size={12} />
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-6">
              <div className="rounded-xl border border-white/5 bg-black/20 p-4 space-y-2">
                <p className="text-xs uppercase tracking-wider text-slate-500">Job details</p>
                <p className="text-sm text-slate-200">{selectedJob.description || "No description."}</p>
                <p className="text-sm text-slate-300 flex items-center gap-2">
                  <MapPin size={14} /> {selectedJob.location_label || "Remote"}
                </p>
                <p className="text-sm text-slate-300 flex items-center gap-2">
                  <Calendar size={14} /> {new Date(selectedJob.created_at).toLocaleString("de-DE")}
                </p>
                <p className="text-sm text-slate-300">
                  <span className="text-slate-500">Market:</span> {selectedJob.market || "—"}
                </p>
                <p className="text-sm text-slate-300">
                  <span className="text-slate-500">Category:</span> {selectedJob.category || "—"}
                </p>
                <p className="text-sm text-slate-300">
                  <span className="text-slate-500">Hourly wage:</span> {selectedJob.wage_hourly ? `${selectedJob.wage_hourly} €` : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/20 p-4 space-y-2">
                <p className="text-xs uppercase tracking-wider text-slate-500">Posted by</p>
                <p className="text-sm text-slate-200 flex items-center gap-2">
                  <User size={14} /> {selectedJob.posted_by_name || "Unknown"}
                </p>
                <p className="text-sm text-slate-200 flex items-center gap-2">
                  <Mail size={14} /> {selectedJob.posted_by_email || "No email"}
                </p>
                <button
                  type="button"
                  onClick={() => router.push(`/staff/users?userId=${selectedJob.posted_by}`, { scroll: false })}
                  className="inline-flex mt-2 text-xs text-indigo-300 hover:text-indigo-200"
                >
                  Open poster profile
                </button>
                <button
                  type="button"
                  onClick={() => router.push(basePath, { scroll: false })}
                  className="inline-flex text-xs text-slate-400 hover:text-slate-200"
                >
                  Remove jobId from URL
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
