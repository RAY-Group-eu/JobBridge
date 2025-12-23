"use server";

import { requireCompleteProfile } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";
import { getDemoStatus } from "@/lib/demo";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { JobStatus } from "@/lib/types";
import { createJobService } from "@/lib/services/jobs";

export async function createJob(prevState: any, formData: FormData) {
    const supabase = await supabaseServer();
    const { profile } = await requireCompleteProfile();
    const { isEnabled: isDemo } = await getDemoStatus(profile.id);

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const wage = parseFloat(formData.get("wage") as string) || 0;

    // Market defaults & Fallback
    let marketId = profile.market_id;

    if (!marketId) {
        // Fallback: Find Rheinbach (or default region)
        console.log("No market_id on profile, attempting fallback to Rheinbach...");
        const { data: region } = await supabase.from("regions_live")
            .select("id")
            .eq("city", "Rheinbach")
            .eq("is_live", true)
            .single();

        if (region) {
            marketId = region.id;
        }
    }

    if (!title) {
        return { error: "Titel ist erforderlich." };
    }

    if (!marketId) {
        return { error: "Systemfehler: Kein Markt (Region) zuweisbar. Bitte kontaktiere den Support." };
    }

    const { error } = await createJobService(
        profile.id,
        {
            posted_by: profile.id,
            market_id: marketId,
            title: title.trim(),
            description: description?.trim(),
            wage_hourly: wage,
            status: 'open',
            category: 'other', // Default to 'other' until UI supports selection
            address_reveal_policy: 'after_apply', // Default policy
            public_location_label: 'Rheinbach', // Default location label
        },
        null, // No private params in this form yet
        isDemo
    );

    if (error) return { error };

    revalidatePath("/app-home/offers");
    redirect("/app-home/offers");
}
