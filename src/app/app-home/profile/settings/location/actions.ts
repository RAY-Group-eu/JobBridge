"use server";

import { supabaseServer } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

export async function updateLocationAction(prevState: any, formData: FormData) {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { status: "error", error: { message: "Nicht eingeloggt" } };
    }

    const street = formData.get("street") as string;
    const house_number = formData.get("house_number") as string;
    const zip = formData.get("zip") as string;
    const city = formData.get("city") as string;
    const latStr = formData.get("lat") as string;
    const lngStr = formData.get("lng") as string;

    if (!street || !city || !latStr || !lngStr) {
        return { status: "error", error: { message: "Bitte wähle eine gültige Adresse aus den Vorschlägen aus." } };
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    const { error } = await supabase
        .from("profiles")
        .update({
            street,
            house_number: house_number || null,
            zip: zip || null,
            city,
            lat,
            lng
        })
        .eq("id", user.id);

    if (error) {
        console.error("Fehler beim Speichern der Adresse:", error);
        return { status: "error", error: { message: "Adresse konnte nicht gespeichert werden." } };
    }

    revalidatePath("/app-home/profile/settings");
    revalidatePath("/app-home/profile/settings/location");
    revalidatePath("/app-home/jobs");

    return { status: "success" };
}
