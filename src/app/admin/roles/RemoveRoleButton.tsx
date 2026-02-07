"use client";

import { useState } from "react";
import { removeRole } from "../actions";
import { Trash2, Loader2 } from "lucide-react";

export function RemoveRoleButton({ userId, role }: { userId: string, role: string }) {
    const [loading, setLoading] = useState(false);

    const handleRemove = async () => {
        if (!confirm(`Are you sure you want to remove ${role} role from this user?`)) return;

        setLoading(true);
        await removeRole(userId, role);
        setLoading(false);
    };

    return (
        <button
            onClick={handleRemove}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Remove Role"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
    );
}
