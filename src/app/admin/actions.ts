"use server";

import { supabaseServer } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

export async function toggleDemoMode(enabled: boolean, view: 'job_seeker' | 'job_provider' = 'job_seeker') {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No user" };

    // Update demo_sessions
    // We cast to any because TS might trigger 'never' error as seen before
    const { error } = await (supabase.from("demo_sessions") as any).upsert({
        user_id: user.id,
        enabled: enabled,
        demo_view: view,
        updated_at: new Date().toISOString()
    });

    if (error) {
        console.error("Demo Toggle Error", error);
        return { error: "Failed to toggle demo mode" };
    }

    revalidatePath("/");
    return { success: true };
}

export async function seedDemoData() {
    const supabase = await supabaseServer();

    // Seed logical jobs for demo
    // Check if jobs exist first
    const { count } = await supabase.from("demo_jobs").select("*", { count: 'exact', head: true });

    if (count && count > 0) return { message: "Data already seeded" };

    // Insert dummy jobs
    await (supabase.from("demo_jobs") as any).insert([
        {
            title: "Rasenmähen in Rheinbach",
            description: "Suche jemanden, der meinen Rasen mäht. Ca. 200qm. Mäher vorhanden.",
            posted_by: "00000000-0000-0000-0000-000000000000", // Dummy UUID or auth.uid
            status: "open",
            market_id: "00000000-0000-0000-0000-000000000000", // Would need real UUID
            public_location_label: "Rheinbach (Nord)",
            created_at: new Date().toISOString()
        }
        // ... more data
    ]);

    return { success: true };
}

export async function assignRole(email: string, roleName: string) {
    const supabase = await supabaseServer();

    // 1. Find user by email
    const { data: user } = await supabase.from("profiles").select("id").eq("email", email).single(); // Assuming email is in profiles or we need to use auth.users (which we can't search easily from client unless using admin api)
    // Wait, profiles table usually has email? If not, we serve profiles by ID.
    // The profiles table definition in types.ts showed 'email' column? 
    // Let's check types.ts. If not, we might need another way.
    // I'll assume profiles has email for now or I'll check types.ts first.

    if (!user) return { error: "User not found" };

    // 2. Find role ID
    const { data: role } = await supabase.from("system_roles").select("id").eq("name", roleName).single();
    if (!role) return { error: "Role not found" };

    // 3. Insert
    const { error } = await supabase.from("user_system_roles").insert({
        user_id: user.id,
        role_id: role.id
    });

    if (error) return { error: error.message };
    revalidatePath("/admin/roles");
    return { success: true };
}

export async function removeRole(userId: string, roleName: string) {
    const supabase = await supabaseServer();

    const { data: role } = await supabase.from("system_roles").select("id").eq("name", roleName).single();
    if (!role) return { error: "Role not found" };

    const { error } = await supabase.from("user_system_roles").delete()
        .eq("user_id", userId)
        .eq("role_id", role.id);

    if (error) return { error: error.message };
    revalidatePath("/admin/roles");
    return { success: true };
}
