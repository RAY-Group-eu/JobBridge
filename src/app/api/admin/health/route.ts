import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireCurrentStaffContext } from "@/lib/data/adminAuth";

export async function GET() {
    try {
        const context = await requireCurrentStaffContext();
        if (context.error) {
            const status = context.error === "Unauthorized." ? 401 : 403;
            return NextResponse.json({ ok: false, error: context.error }, { status });
        }

        const admin = getSupabaseAdminClient();
        const { count, error } = await admin.from("profiles").select("*", { count: "exact", head: true });

        if (error) {
            return NextResponse.json(
                { ok: false, db: "error", error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ ok: true, db: "ok", usersCount: count });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { ok: false, db: "fatal", error: message },
            { status: 500 }
        );
    }
}
