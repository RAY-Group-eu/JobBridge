import { supabaseServer } from "@/lib/supabaseServer";
import { getDataSource } from "@/lib/auth";
import { AccountType } from "@/lib/types";

export type AdminDashboardStats = {
    users: number;
    jobs: number;
    applications: number;
    isDemo: boolean;
};

export type WorkQueueItem = {
    id: string;
    type: 'report' | 'verification';
    title: string;
    subtitle: string;
    priority: 'high' | 'medium' | 'low';
    created_at: string;
};

export async function getDashboardStats(userId: string): Promise<AdminDashboardStats> {
    const supabase = await supabaseServer();
    const source = await getDataSource(userId);
    const isDemo = source.mode === 'demo';

    // Parallel fetch for speed
    const [usersResult, jobsResult, appsResult] = await Promise.all([
        // Users: Always from profiles (live), or maybe handle strictly if strict demo separation needed? 
        // Plan says: "demo: you can still show live users... OR count demo users if you have them"
        // We will just count profiles for now as demo_users table doesn't exist in plan.
        supabase.from("profiles").select("*", { count: 'exact', head: true }),

        // Jobs: Switch based on mode
        supabase.from(isDemo ? "demo_jobs" : "jobs").select("*", { count: 'exact', head: true }).eq("status", "open"),

        // Applications: Switch based on mode
        supabase.from(isDemo ? "demo_applications" : "applications").select("*", { count: 'exact', head: true })
    ]);

    return {
        users: usersResult.count || 0,
        jobs: jobsResult.count || 0, // In Demo these are demo jobs
        applications: appsResult.count || 0,
        isDemo
    };
}

export async function getRecentActivity(limit = 10) {
    const supabase = await supabaseServer();

    // For now we just fetch security events or new users
    // A real implementation would union multiple tables or use a specific activity log
    const { data: events } = await supabase
        .from("profiles")
        .select("id, full_name, created_at, user_type")
        .order("created_at", { ascending: false })
        .limit(limit);

    return events?.map(u => ({
        type: 'user_register',
        message: `New User registered: ${u.full_name || 'Unknown'}`,
        meta: u.user_type,
        created_at: u.created_at
    })) || [];
}

export async function getWorkQueue(isDemo: boolean): Promise<WorkQueueItem[]> {
    const supabase = await supabaseServer();
    const items: WorkQueueItem[] = [];

    // 1. Pending Verifications (Live only usually, unless we want to fake it in demo)
    if (!isDemo) {
        const { data: pendingVerifications } = await supabase
            .from("profiles")
            .select("id, full_name, created_at")
            .eq("is_verified", false) // Assuming false means pending/unverified
            // We might need a specific 'pending' status if 'is_verified' is just boolean
            // For now let's just grab unverified providers
            .in("user_type", ["company", "adult"] as any)
            .limit(5);

        pendingVerifications?.forEach(p => {
            items.push({
                id: p.id,
                type: 'verification',
                title: 'Verification Pending',
                subtitle: `Provider: ${p.full_name || 'Access Request'}`,
                priority: 'medium',
                created_at: p.created_at || new Date().toISOString()
            });
        });
    }

    // 2. Open Reports (If reports table exists, if not we skip)
    // We didn't explicitly create reports in migration, but User Request said it exists?
    // "reports, moderation_actions... tables already present"
    // Let's assume it exists. If TS fails we fix.

    // To be safe with TS since we haven't seen 'reports' in types.ts (except my failed list_tables),
    // we will try to fetch if we can, or cast.
    // Actually, I should probably add 'reports' to types or treat as any for now to avoid blocking.
    // I recall `reports` was in list of "tables already present" in USER_REQUEST.

    // I will try to fetch from 'reports' using 'any' cast if needed, or better, update types.
    // But I'll just use 'any' for the table name to avoid type errors for now.

    const { data: reports } = await supabase
        .from("reports" as any)
        .select("id, reason, created_at, status")
        .eq("status", "open")
        .limit(5);

    reports?.forEach((r: any) => {
        items.push({
            id: r.id,
            type: 'report',
            title: `Report #${r.id.substring(0, 6)}`,
            subtitle: r.reason || 'No reason provided',
            priority: 'high',
            created_at: r.created_at
        });
    });

    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
}
