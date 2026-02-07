"use client";

import { useState } from "react";
import { assignRole } from "../actions";
import { Plus, Loader2 } from "lucide-react";

export function AddRoleForm() {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("moderator");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const res = await assignRole(email, role);
        setLoading(false);

        if (res.error) {
            setMessage(res.error);
        } else {
            setMessage("Role assigned successfully");
            setEmail("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 items-end bg-slate-900/50 p-4 rounded-xl border border-white/5">
            <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">User Email</label>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="block w-64 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Role</label>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-32 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                    <option value="analyst">Analyst</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Assign
            </button>
            {message && (
                <span className={`text-xs ${message.includes("success") ? "text-emerald-400" : "text-red-400"} mb-3`}>
                    {message}
                </span>
            )}
        </form>
    );
}
