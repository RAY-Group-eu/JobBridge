"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar, FileText, Mail, User, X } from "lucide-react";
import { type AdminApplicationDetail, type AdminApplicationListItem } from "@/lib/data/adminTypes";

type ApplicationsTableProps = {
  applications: AdminApplicationListItem[];
  selectedApplication: AdminApplicationDetail | null;
  query: string;
};

export function ApplicationsTable({ applications, selectedApplication, query }: ApplicationsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function openApplication(applicationId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("applicationId", applicationId);
    const nextUrl = `${pathname}?${params.toString()}`;
    router.push(nextUrl, { scroll: false });
  }

  function closeDrawer() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("applicationId");
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
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Application</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Job</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {applications.map((application) => (
                <tr key={application.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-white font-mono">{application.id.slice(0, 8)}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[260px]">{application.message || "No message"}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{application.job_title || "Unknown job"}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-200">{application.applicant_name || "Unknown user"}</p>
                    <p className="text-xs text-slate-500">{application.applicant_email || "No email"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium capitalize border bg-blue-500/10 text-blue-300 border-blue-500/20">
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{new Date(application.created_at).toLocaleString("de-DE")}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => openApplication(application.id)}
                      className="text-indigo-400 hover:text-indigo-300 text-sm font-medium hover:underline"
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-900/80 px-6 py-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {applications.length} applications
            {query ? ` for "${query}"` : ""}
          </span>
          <span>Deep link: `/staff/applications?applicationId=&lt;uuid&gt;`</span>
        </div>
      </div>

      {selectedApplication && (
        <>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close application drawer"
            className="fixed inset-0 bg-black/50 z-40"
          />
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-950 border-l border-white/10 p-6 overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Application {selectedApplication.id.slice(0, 8)}</h2>
                <p className="text-xs text-slate-500 font-mono mt-1">{selectedApplication.id}</p>
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
                <p className="text-xs uppercase tracking-wider text-slate-500">Application</p>
                <p className="text-sm text-slate-200 flex items-center gap-2">
                  <FileText size={14} /> {selectedApplication.status}
                </p>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">{selectedApplication.message || "No message"}</p>
                <p className="text-sm text-slate-300 flex items-center gap-2">
                  <Calendar size={14} /> {new Date(selectedApplication.created_at).toLocaleString("de-DE")}
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/20 p-4 space-y-2">
                <p className="text-xs uppercase tracking-wider text-slate-500">Relations</p>
                <p className="text-sm text-slate-200">Job: {selectedApplication.job_title || "Unknown"}</p>
                <p className="text-sm text-slate-200 flex items-center gap-2">
                  <User size={14} /> {selectedApplication.applicant_name || "Unknown user"}
                </p>
                <p className="text-sm text-slate-200 flex items-center gap-2">
                  <Mail size={14} /> {selectedApplication.applicant_email || "No email"}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => router.push(`/staff/jobs?jobId=${selectedApplication.job_id}`, { scroll: false })}
                    className="text-xs text-indigo-300 hover:text-indigo-200"
                  >
                    Open job
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/staff/users?userId=${selectedApplication.user_id}`, { scroll: false })}
                    className="text-xs text-indigo-300 hover:text-indigo-200"
                  >
                    Open user
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
