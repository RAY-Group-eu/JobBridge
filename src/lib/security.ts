"use server";

import { headers } from "next/headers";
import { supabaseServer } from "./supabaseServer";

export async function logSecurityEvent(
    eventType: string,
    userId?: string
) {
    const supabase = await supabaseServer();
    const headersList = await headers();

    const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    try {
        await supabase.from("security_events").insert({
            event_type: eventType,
            user_id: userId || null,
            ip_address: ip,
            user_agent: userAgent,
        });
    } catch (error) {
        console.error("Failed to log security event:", error);
        // Don't throw, we don't want to break the app flow for logging failure
    }
}

export async function logSecurityEventAction(
    eventType: string,
    userId?: string
) {
    await logSecurityEvent(eventType, userId);
}
