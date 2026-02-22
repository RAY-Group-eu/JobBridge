"use server";

import { supabaseAdmin } from "./supabaseAdmin";

/**
 * Checks if a profile exists for a given email by querying the auth.users table
 * via the admin client, or by checking the profiles table.
 * We'll check the profiles table joined with email if we store it, 
 * or we can just try to find a user by calling admin.listUsers or similar.
 * A simpler way for JobBridge: The user table is not directly queriable by anon.
 * We will use supabaseAdmin logic to safely check if a given email is registered.
 */
export async function checkEmailExists(email: string): Promise<boolean> {
    if (!email) return false;

    // wir können entweder die auth.users durchsuchen, wenn wir admin rechte haben, 
    // oder wir schauen in der öffentlichen (oder durch service_role zugänglichen) profiles tabelle.
    // Da Email nicht in public.profiles liegt bei Supabase standardmäßig,
    // nutzen wir das admin Backend.

    const adminClient = supabaseAdmin();

    // List users matching the email. This requires service_role key.
    // Search only for exact match
    const { data, error } = await adminClient.auth.admin.listUsers();

    if (error || !data || !data.users) {
        // If admin check fails (e.g. no service key in this environment context),
        // fallback to returning true so it proceeds to normal login failure.
        console.error("Error checking email existence, falling back safely:", error);
        return true;
    }

    const userExists = data.users.some(u => u.email?.toLowerCase() === email.toLowerCase());
    return userExists;
}
