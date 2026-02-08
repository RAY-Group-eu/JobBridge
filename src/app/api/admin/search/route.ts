import { NextResponse } from "next/server";
import { searchAdminEntities } from "@/lib/data/adminSearch";
import { requireCurrentStaffContext } from "@/lib/data/adminAuth";

export async function GET(request: Request) {
    const context = await requireCurrentStaffContext();
    if (context.error) {
        const status = context.error === "Unauthorized." ? 401 : 403;
        return NextResponse.json({ error: context.error }, { status });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query) {
        return NextResponse.json({ items: [] });
    }

    const { items, error } = await searchAdminEntities(query, 10);
    if (error) {
        const status = error.toLowerCase().includes("forbidden") ? 403 : 500;
        return NextResponse.json({ error }, { status });
    }

    return NextResponse.json({ items });
}
