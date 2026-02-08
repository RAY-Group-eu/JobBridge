import { requireCompleteProfile } from "@/lib/auth";
import { getAdminRoleAssignments } from "@/lib/data/adminRoles";
import { RoleBadge } from "../components/RoleBadge";
import { AddRoleForm } from "./AddRoleForm";
import { RemoveRoleButton } from "./RemoveRoleButton";
import { Shield } from "lucide-react";

export default async function RolesPage() {
    await requireCompleteProfile();
    const { items: assignments, error } = await getAdminRoleAssignments();

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Shield className="text-indigo-500" />
                        System Roles
                    </h1>
                    <p className="text-slate-400 mt-2">Manage staff access and permissions.</p>
                </div>
            </div>

            {/* Add Role Section */}
            <div>
                <h3 className="text-sm font-semibold text-white mb-3">Grant Access</h3>
                <AddRoleForm />
            </div>

            {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
                    <p className="text-sm text-rose-200">{error}</p>
                </div>
            )}

            {/* Roles List */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left bg-slate-900/50 rounded-2xl border-white/5 mt-0">
                    <thead className="bg-white/5 border-b border-white/5">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">User</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Role</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Assigned</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {assignments.map((item) => (
                            <tr key={`${item.user_id}-${item.role_name}-${item.created_at}`} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white">{item.full_name || "Unknown"}</div>
                                    <div className="text-xs text-slate-500">{item.email || "No email"}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1 items-start">
                                        <RoleBadge role={item.role_name} />
                                        <span className="text-[10px] text-slate-500">{item.role_description}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-400">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <RemoveRoleButton userId={item.user_id} role={item.role_name} />
                                </td>
                            </tr>
                        ))}
                        {assignments.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    No staff assignments found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
