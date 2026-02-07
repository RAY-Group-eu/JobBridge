import { getActiveOverride, getCurrentSessionAndProfile } from "@/lib/auth";
import { AlertTriangle } from "lucide-react";

export async function TestModeBanner() {
    const { session } = await getCurrentSessionAndProfile();
    if (!session) return null;

    const override = await getActiveOverride(session.user.id);
    if (!override) return null;

    const minutesLeft = Math.ceil((new Date(override.expires_at).getTime() - new Date().getTime()) / 60000);

    return (
        <div className="bg-indigo-600 text-white px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 relative z-50">
            <AlertTriangle size={16} className="text-yellow-300" />
            <span>
                Test Mode Active: Viewing as <span className="underline capitalize">{override.view_as.replace('_', ' ')}</span>.
                Ends in {minutesLeft}m.
            </span>
        </div>
    );
}
