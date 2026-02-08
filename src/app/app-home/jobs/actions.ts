"use server";

import { supabaseServer } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { Profile } from "@/lib/types";
import { getEffectiveView } from "@/lib/dal/jobbridge";

export async function applyToJob(jobId: string) {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Nicht authentifiziert" };
    }

    // Double check profile/verification
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
    const viewRes = await getEffectiveView({ userId: user.id, baseUserType: profile?.user_type ?? null });
    if (!viewRes.ok) {
        return { error: `${viewRes.error.code ? `${viewRes.error.code}: ` : ""}${viewRes.error.message}` };
    }
    const view = viewRes.data;

    if (!profile || !profile.is_verified || view.viewRole !== "job_seeker") {
        return { error: "Du bist nicht berechtigt, dich zu bewerben (Elternbestätigung fehlt)." };
    }

    // Get Job Owner ID
    const jobsTable: "jobs" | "demo_jobs" = view.source === "demo" ? "demo_jobs" : "jobs";
    const appsTable: "applications" | "demo_applications" = view.source === "demo" ? "demo_applications" : "applications";

    const { data: job, error: jobError } = await supabase.from(jobsTable).select("posted_by, title").eq("id", jobId).single();
    if (jobError) {
        console.error("Apply Job Load Error", jobError);
        return { error: "Job konnte nicht geladen werden." };
    }

    const { error } = await supabase.from(appsTable).insert({
        job_id: jobId,
        user_id: user.id,
        status: "submitted",
        message: "Ich habe Interesse!" // Hardcoded for now, can be expandable
    });

    if (error) {
        if (error.code === '23505') return { error: "Du hast dich bereits beworben." }; // Unique violation
        console.error("Apply Error", error);
        return { error: "Fehler beim Bewerben." };
    }

    // Create Notification for Provider
    if (job && job.posted_by) {
        await supabase.from("notifications").insert({
            user_id: job.posted_by,
            type: "application_new",
            title: "Neue Bewerbung",
            body: `Jemand hat sich auf '${job.title}' beworben.`,
            data: { route: "/app-home/applications" }
        });
    }

    revalidatePath("/app-home/jobs");
    revalidatePath("/app-home/activity");
    return { success: true };
}
