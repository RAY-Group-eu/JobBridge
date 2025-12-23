"use client";

import { Profile } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function RoleGuard({ profile }: { profile: Profile | null }) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!profile) return;

        const accountType = profile.account_type;

        // Define Base Paths
        const isJobsPath = pathname === "/app-home/jobs" || pathname === "/app-home/jobs/";
        const isOffersPath = pathname.startsWith("/app-home/offers");

        // Rule 1: Providers checking Jobs Feed -> Send to Offers
        // We assume "Provider" is ANYONE who is meant to post jobs (including adult/company/senior)
        if (accountType === "job_provider" && isJobsPath) {
            console.log("RoleGuard: Provider on jobs feed -> redirecting to offers");
            router.replace("/app-home/offers");
            return;
        }

        // Rule 2: Seekers checking Offers -> Send to Jobs Feed
        if (accountType === "job_seeker" && isOffersPath) {
            console.log("RoleGuard: Seeker on offers -> redirecting to jobs");
            router.replace("/app-home/jobs");
            return;
        }

    }, [pathname, profile, router]);

    return null; // Renderless component
}
