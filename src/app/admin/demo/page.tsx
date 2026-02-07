import { requireCompleteProfile } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";
import { TestOverrideControl } from "../components/TestOverrideControl";
import { Database, Zap, RefreshCw, AlertTriangle } from "lucide-react";
import { toggleDemoMode, seedDemoData } from "../actions";
import { revalidatePath } from "next/cache";

export default async function DemoModePage() {
    const { session } = await requireCompleteProfile();
    const supabase = await supabaseServer();

    // Fetch current demo status
    const { data: demoSession } = await supabase
        .from("demo_sessions")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

    // Fetch active override
    const { data: activeOverride } = await (supabase.from("role_overrides" as any)
        .select("view_as, expires_at")
        .eq("user_id", session.user.id)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle() as any);

    async function handleToggleDemo() {
        "use server";
        await toggleDemoMode(!demoSession?.enabled, (demoSession?.demo_view as 'job_seeker' | 'job_provider') || 'job_seeker');
    }

    async function handleSeed() {
        "use server";
        await seedDemoData();
        revalidatePath("/admin/demo");
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Database className="text-indigo-500" />
                    Demo & Developer Tools
                </h1>
                <p className="text-slate-400 mt-2">Manage your session state and test data.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Role Overrides */}
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Role Overrides</h3>
                    <TestOverrideControl userId={session.user.id} activeOverride={activeOverride} />
                </div>

                {/* Demo Mode Toggle */}
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Zap className={demoSession?.enabled ? "text-yellow-400" : "text-slate-500"} size={20} />
                        Demo Session
                    </h3>
                    <p className="text-sm text-slate-400 mb-6">
                        Enable demo mode to view the application with isolated test data.
                        Your real data remains safe.
                    </p>

                    <form action={handleToggleDemo}>
                        <button
                            type="submit"
                            className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${demoSession?.enabled
                                ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/20"
                                : "bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10"
                                }`}
                        >
                            {demoSession?.enabled ? "Deactivate Demo Mode" : "Activate Demo Mode"}
                        </button>
                    </form>
                </div>

                {/* Data Seeding */}
                <div className="md:col-span-2 bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <RefreshCw className="text-blue-400" size={20} />
                        Data Management
                    </h3>

                    <div className="flex items-start gap-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl mb-6">
                        <AlertTriangle className="text-blue-400 shrink-0 mt-0.5" size={18} />
                        <div className="space-y-1">
                            <p className="text-sm text-blue-200 font-medium">Safe Seeding</p>
                            <p className="text-xs text-blue-400/80">
                                This will populate `demo_jobs` and `demo_applications` with test data.
                                It does NOT affect live tables.
                            </p>
                        </div>
                    </div>

                    <form action={handleSeed}>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Seed Demo Data
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
