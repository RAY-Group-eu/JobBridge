import { Profile } from "@/lib/types";
import { ProfileChip } from "../ProfileChip";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";

export function RightActionGroup({ profile, isDemo }: { profile: Profile | null; isDemo?: boolean }) {
    return (
        <div className="flex items-center gap-2 min-[420px]:gap-3">
            <NotificationsPopover />
            <ProfileChip profile={profile} isDemo={isDemo} />
        </div>
    );
}
