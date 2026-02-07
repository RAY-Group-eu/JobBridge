"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { AlertCircle, Clock, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { AccountType } from "@/lib/types";

// Helper to calculate expiration
const getExpiration = (minutes: number) => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + minutes);
    return d.toISOString();
};

export function TestOverrideControl({ userId, activeOverride }: { userId: string, activeOverride?: { view_as: string, expires_at: string } | null }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = supabaseBrowser;

    const handleSetOverride = async (viewAs: "job_seeker" | "job_provider", minutes: number) => {
        setLoading(true);
        try {
            const expiresAt = getExpiration(minutes);

            // Upsert override
            const { error } = await supabase.from("role_overrides" as any).upsert({
                user_id: userId,
                view_as: viewAs,
                expires_at: expiresAt,
                created_by: userId // Self-created for now
            });

            if (error) throw error;
            router.refresh();
        } catch (err) {
            console.error("Failed to set override", err);
            alert("Failed to set override");
        } finally {
            setLoading(false);
        }
    };

    const clearOverride = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.from("role_overrides" as any).delete().eq("user_id", userId);
            if (error) throw error;
            router.refresh();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isActive = activeOverride && new Date(activeOverride.expires_at) > new Date();

    return (
        <div className="bg-slate-900 border border-indigo-500/20 rounded-xl p-4 space-y-4">
            <div className="flex items-start gap-3">
                <ShieldAlert className="text-indigo-400 mt-1" size={20} />
                <div>
                    <h3 className="text-sm font-semibold text-indigo-200">Test Role Override</h3>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                        Temporarily act as a different user type to test flows. This does not change your permanent account data.
                    </p>
                </div>
            </div>

            {isActive ? (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-indigo-200 font-medium">
                            Acting as: <span className="text-white capitalize">{activeOverride.view_as.replace('_', ' ')}</span>
                        </p>
                        <p className="text-xs text-indigo-400 flex items-center gap-1 mt-1">
                            <Clock size={12} />
                            Expires in {Math.ceil((new Date(activeOverride.expires_at).getTime() - new Date().getTime()) / 60000)}m
                        </p>
                    </div>
                    <button
                        onClick={clearOverride}
                        disabled={loading}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg transition-colors"
                    >
                        Clear
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-xs text-slate-500 font-medium uppercase">Job Seeker</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSetOverride("job_seeker", 15)}
                                disabled={loading}
                                className="flex-1 py-2 text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/5 transition-colors"
                            >
                                15m
                            </button>
                            <button
                                onClick={() => handleSetOverride("job_seeker", 60)}
                                disabled={loading}
                                className="flex-1 py-2 text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/5 transition-colors"
                            >
                                1h
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-slate-500 font-medium uppercase">Job Provider</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSetOverride("job_provider", 15)}
                                disabled={loading}
                                className="flex-1 py-2 text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/5 transition-colors"
                            >
                                15m
                            </button>
                            <button
                                onClick={() => handleSetOverride("job_provider", 60)}
                                disabled={loading}
                                className="flex-1 py-2 text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/5 transition-colors"
                            >
                                1h
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
