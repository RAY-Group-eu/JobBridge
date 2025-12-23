"use server";

import { supabaseServer } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDemoStatus } from "@/lib/demo";
import { createJobService } from "@/lib/services/jobs";

const createJobSchema = z.object({
    title: z.string().min(5, "Titel muss mindestens 5 Zeichen lang sein."),
    description: z.string().min(20, "Beschreibung muss mindestens 20 Zeichen lang sein."),
    address_full: z.string().min(5, "Bitte gib eine Adresse an"),
    lat: z.string().optional(),
    lng: z.string().optional(),
});

export async function createJob(prevState: any, formData: FormData) {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Nicht authentifiziert" };
    }

    const { isEnabled: isDemo } = await getDemoStatus(user.id);

    // Get User Profile for Market ID
    const { data: profile } = await (supabase.from("profiles") as any).select("market_id").eq("id", user.id).single();
    if (!profile?.market_id) {
        return { error: "Kein Markt ausgewählt. Bitte Profil aktualisieren." };
    }

    const rawData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        address_full: formData.get("address_full") as string,
        lat: "50.625",
        lng: "6.945",
    };

    const validated = createJobSchema.safeParse(rawData);

    if (!validated.success) {
        return { error: validated.error.issues[0].message };
    }

    // Insert Job via Service
    const { error: serviceError } = await createJobService(
        user.id,
        {
            posted_by: user.id,
            market_id: profile.market_id,
            title: validated.data.title,
            description: validated.data.description,
            wage_hourly: 15, // Default wage as form doesn't seem to have it in this specific file, or defaulted in schema
            status: "open",
            category: "other",
            public_location_label: isDemo ? "[DEMO] Rheinbach" : "Rheinbach (Zentrum)",
            public_lat: 50.63,
            public_lng: 6.95,
            address_reveal_policy: "after_apply"
        },
        // Private Details
        {
            address_full: validated.data.address_full,
            private_lat: 50.6255,
            private_lng: 6.9455,
            notes: "Private Access Only"
        },
        isDemo
    );

    if (serviceError) {
        console.error("Create Job Error:", serviceError);
        return { error: "Fehler beim Erstellen des Inserats." };
    }

    revalidatePath("/app-home/offers");
    redirect("/app-home/offers");
}
