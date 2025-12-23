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
    address_full: z.string().optional(),
    wage: z.number().optional(),
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
    // Get User Profile for Market ID
    const { data: profile } = await (supabase as any).from("profiles").select("market_id").eq("id", user.id).single();

    let marketId = profile?.market_id;

    if (!marketId) {
        // Fallback: Fetch "Rheinbach" market
        const { data: defaultMarket } = await (supabase as any).from("markets").select("id").ilike("name", "%Rheinbach%").single();
        marketId = defaultMarket?.id;
    }

    if (!marketId) {
        // Ultimate fallback if even DB fetch fails (should not happen in prod)
        return { error: "Systemfehler: Kein Markt zuweisbar." };
    }

    const useDefault = formData.get("use_default_location") === "true";
    let addressFull = formData.get("address_full") as string;
    let locationId = null;
    let publicLabel = isDemo ? "[DEMO] Rheinbach" : "Rheinbach (Zentrum)"; // Fallback

    if (useDefault) {
        // Fetch default location
        const { data: defLoc } = await (supabase as any).from("provider_locations")
            .select("*")
            .eq("provider_id", user.id)
            .eq("is_default", true)
            .single();

        if (defLoc) {
            addressFull = `${defLoc.address_line1}, ${defLoc.postal_code} ${defLoc.city}`;
            locationId = defLoc.id;
            publicLabel = defLoc.public_label || publicLabel;
        } else {
            return { error: "Kein Standard-Ort gefunden. Bitte Adresse eingeben." };
        }
    } else {
        if (!addressFull || addressFull.length < 5) {
            return { error: "Bitte gib eine Adresse ein oder wähle Standard-Ort." };
        }
    }

    const rawData = {
        title: (formData.get("title") as string)?.trim(),
        description: (formData.get("description") as string)?.trim(),
        address_full: addressFull,
        wage: parseFloat(formData.get("wage") as string) || 12.00,
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
            market_id: marketId,
            title: validated.data.title,
            description: validated.data.description,
            wage_hourly: (validated.data as any).wage || 12.00,
            status: "open",
            category: "other",
            public_location_label: publicLabel,
            public_lat: 50.63,
            public_lng: 6.95,
            address_reveal_policy: "after_apply"
        },
        // Private Details
        {
            address_full: validated.data.address_full || null,
            private_lat: 50.6255,
            private_lng: 6.9455,
            notes: "Private Access Only",
            location_id: locationId
        },
        isDemo
    );

    if (serviceError) {
        console.error("Create Job Error:", serviceError);
        return { error: "Fehler beim Erstellen des Inserats." };
    }

    revalidatePath("/app-home/offers");
    revalidatePath("/app-home/jobs");
    redirect("/app-home/offers");
}
