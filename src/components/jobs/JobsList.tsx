"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { JobCard } from "@/components/jobs/JobCard";
import { JobDetailModal } from "@/components/jobs/JobDetailModal";
import { Briefcase, CheckCircle2 } from "lucide-react";
import type { Database } from "@/lib/types/supabase";

type JobRow = Database['public']['Tables']['jobs']['Row'] & {
    market_name?: string | null;
    public_location_label?: string | null;
    distance_km?: number | null;
    is_applied?: boolean;
    creator?: {
        full_name: string | null;
        company_name: string | null;
        account_type: Database["public"]["Enums"]["account_type"] | null;
    } | null;
};

interface JobsListProps {
    jobs: JobRow[];
    isDemo: boolean;
    canApply: boolean;
    guardianStatus: string;
}

export function JobsList({ jobs, isDemo, canApply, guardianStatus }: JobsListProps) {
    const [selectedJob, setSelectedJob] = useState<JobRow | null>(null);
    const router = useRouter();

    const handleClose = useCallback(() => setSelectedJob(null), []);

    const openJobs = jobs.filter(j => !j.is_applied);
    const appliedJobs = jobs.filter(j => j.is_applied);

    return (
        <>
            <div className="space-y-12">
                {/* Open Jobs Section */}
                <div>
                    {/* Only show header if we have applied jobs to distinguish */}
                    {appliedJobs.length > 0 && (
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Briefcase size={20} className="text-indigo-400" /> Aktuelle Angebote
                        </h2>
                    )}

                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                        {openJobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                isDemo={isDemo}
                                onClick={() => setSelectedJob(job)}
                            />
                        ))}
                        {openJobs.length === 0 && appliedJobs.length > 0 && (
                            <p className="text-slate-400 col-span-full py-8 text-center italic">
                                Keine weiteren offenen Jobs verfügbar.
                            </p>
                        )}
                    </div>
                </div>

                {/* Applied Jobs Section */}
                {appliedJobs.length > 0 && (
                    <div className="border-t border-white/10 pt-10">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <CheckCircle2 size={20} className="text-emerald-400" /> Bereits beworben
                        </h2>
                        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 opacity-75 grayscale-[0.3] hover:grayscale-0 transition-all duration-500">
                            {appliedJobs.map((job) => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    isDemo={isDemo}
                                    isApplied={true}
                                    onClick={() => setSelectedJob(job)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <JobDetailModal
                job={selectedJob}
                isOpen={!!selectedJob}
                onClose={handleClose}
                canApply={canApply}
                guardianStatus={guardianStatus}
            />
        </>
    );
}
