"use server";

import { supabaseServer } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const locationSchema = z.object({
    address_line1: z.string().min(3, "Adresse ist zu kurz"),
    postal_code: z.string().min(4, "PLZ ungültig"),
    city: z.string().min(2, "Stadt ist zu kurz"),
    public_label: z.string().optional(),
});

export async function saveDefaultLocation(prevState: any, formData: FormData) {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Nicht authentifiziert" };

    const raw = {
        address_line1: formData.get("address_line1"),
        postal_code: formData.get("postal_code"),
        city: formData.get("city"),
        public_label: formData.get("public_label"),
    };

    const validated = locationSchema.safeParse(raw);

    if (!validated.success) {
        return { error: validated.error.issues[0].message };
    }

    const { error } = await (supabase as any).from("provider_locations").upsert({
        provider_id: user.id,
        ...validated.data,
        is_default: true,
        lat: 50.625, // Mock Geocoding
        lng: 6.945,  // Mock Geocoding
        updated_at: new Date().toISOString()
    }, { onConflict: "provider_id, is_default" } as any); // Constraint might need specific index name or handling

    // Note: Upsert on partial index is tricky in standard Supabase client without 'onConflict' constraint name sometimes.
    // If it fails, we might need to delete old default or handle ID.
    // simpler strategy: check if exists, update or insert.
    // But let's try standard upsert with unique index columns logic if supported.
    // Actually, 'provider_id' + 'is_default' where is_default=true is a unique partial index.
    // Postgres UPSERT requires a unique constraint/index. 
    // Let's assume we handle it by just checking first for robustness in this step.

    if (error) {
        // Fallback: Delete old default and insert new (Brute force but safe for "Default")
        // Or actually, just query ID.
        const { data: existing } = await (supabase as any).from("provider_locations")
            .select("id")
            .eq("provider_id", user.id)
            .eq("is_default", true)
            .single();

        if (existing) {
            const { error: updateError } = await (supabase as any).from("provider_locations")
                .update({ ...validated.data, updated_at: new Date().toISOString() })
                .eq("id", existing.id);
            if (updateError) return { error: updateError.message };
        } else {
            const { error: insertError } = await (supabase as any).from("provider_locations")
                .insert({
                    provider_id: user.id,
                    ...validated.data,
                    is_default: true,
                    lat: 50.625,
                    lng: 6.945
                });
            if (insertError) return { error: insertError.message };
        }
    }

    revalidatePath("/app-home/settings/location");
    return { success: "Ort gespeichert!" };
}
