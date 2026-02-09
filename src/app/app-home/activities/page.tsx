import { requireCompleteProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { getEffectiveView } from "@/lib/dal/jobbridge";
import type { Database } from "@/lib/types/supabase";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { ActivityList } from "@/components/activity/ActivityList";

export default async function ActivityPage() {
    const { profile } = await requireCompleteProfile();

    const viewRes = await getEffectiveView({ userId: profile.id, baseAccountType: profile.account_type });
    const viewRole = viewRes.ok ? viewRes.data.viewRole : (profile.account_type ?? "job_seeker");
    const source = viewRes.ok ? viewRes.data.source : "live";

    if (viewRole !== "job_seeker") {
        redirect("/app-home/offers");
    }

    const supabase = await supabaseServer();
    const appsTable: "applications" | "demo_applications" = source === "demo" ? "demo_applications" : "applications";
    const jobsRelation: "jobs" | "demo_jobs" = source === "demo" ? "demo_jobs" : "jobs";

    type ActivityApp = Database["public"]["Tables"]["applications"]["Row"] & {
        job: { title: string; description: string; status: Database["public"]["Enums"]["job_status"] } | null;
        message?: string | null;
    };


    let client = supabase;
    try {
        const admin = getSupabaseAdminClient();
        if (admin) client = admin;
    } catch (e) {
        console.warn("Admin client not available for activity page", e);
    }

    const { data } = await client
        .from(appsTable)
        .select(`
            *,
            job:${jobsRelation}(
                *,
                creator:profiles!jobs_posted_by_fkey(full_name, company_name, account_type)
            )
        `)
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

    // Cast the specific joined data to a type that includes the full job with creator
    type AppWithFullJob = Database["public"]["Tables"]["applications"]["Row"] & {
        job: (Database["public"]["Tables"]["jobs"]["Row"] & {
            creator?: {
                full_name: string | null;
                company_name: string | null;
                account_type: Database["public"]["Enums"]["account_type"] | null;
            } | null;
        }) | null;
        message?: string | null;
    };

    const applications = (data ?? []) as unknown as AppWithFullJob[];

    // Calculate stats
    const total = applications?.length || 0;
    const accepted = applications?.filter(a => a.status === 'accepted').length || 0;
    const rejected = applications?.filter(a => a.status === 'rejected').length || 0;

    return (
        <div className="container mx-auto py-12 px-4 md:px-6">
            <div className="mx-auto max-w-4xl space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Deine Aktivitäten</h1>
                </div>

                <ActivityList applications={applications} />
            </div>
        </div>
    );
}
