"use client";

import { Profile } from "@/lib/types";
import { LeftBrandChip } from "./header/LeftBrandChip";
import { CenterNavPill } from "./header/CenterNavPill";
import { RightActionGroup } from "./header/RightActionGroup";

export function AppHeader({ profile, isDemo }: { profile: Profile | null; isDemo?: boolean }) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 md:px-8 pointer-events-none">
            <div className="max-w-7xl mx-auto h-[52px] flex items-center justify-between gap-2 md:gap-4 pointer-events-auto">
                <div className="flex-shrink-0 flex items-center gap-1 md:gap-3">
                    <LeftBrandChip />
                </div>

                <div className="hidden md:flex absolute left-1/2 top-4 -translate-x-1/2">
                    <CenterNavPill profile={profile} instanceId="desktop" />
                </div>
                <div className="flex md:hidden">
                    <CenterNavPill profile={profile} instanceId="mobile" />
                </div>

                <div className="flex-shrink-0 flex justify-end gap-2 md:gap-4">
                    <div className="flex items-center">
                        <RightActionGroup profile={profile} isDemo={isDemo} />
                    </div>
                </div>
            </div>
        </header>
    );
}
