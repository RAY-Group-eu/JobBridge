import { memo } from "react";
import { JobCard } from "@/components/jobs/JobCard";
import { cn } from "@/lib/utils";
import type { JobsListItem } from "@/lib/types/jobbridge";

interface SectionProps {
    title: string;
    icon: any;
    colorClass: string;
    jobs: JobsListItem[];
    emptyMsg: string;
    hiddenOnMobile?: boolean;
    isWhiteTitle?: boolean;
    isDemo: boolean;
    canApply: boolean;
    hideStatusLabel?: boolean;
    onSelect: (job: JobsListItem) => void;
}

export const JobsListSection = memo(function JobsListSection({
    title,
    icon: Icon,
    colorClass,
    jobs,
    emptyMsg,
    hiddenOnMobile,
    isWhiteTitle,
    isDemo,
    canApply,
    hideStatusLabel,
    onSelect
}: SectionProps) {
    return (
        <div className={cn("space-y-6", hiddenOnMobile ? "hidden lg:block" : "")}>
            <h2 className={cn("text-xl font-bold flex items-center gap-3", isWhiteTitle ? "text-white" : colorClass)}>
                <div className={cn("p-2 rounded-lg border", isWhiteTitle ? "bg-white/10 border-white/10 text-indigo-400" : "bg-white/5 border-white/10")}>
                    <Icon size={20} />
                </div>
                {title}
                <span className="text-sm font-medium bg-white/10 text-slate-400 px-2.5 py-0.5 rounded-full ml-auto lg:ml-2">
                    {jobs.length}
                </span>
            </h2>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {jobs.length === 0 ? (
                    <div className="col-span-full py-12 text-center rounded-2xl border border-dashed border-white/5 bg-white/[0.02]">
                        <p className="text-slate-500 italic">{emptyMsg}</p>
                    </div>
                ) : (
                    jobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            isDemo={isDemo}
                            isApplied={title === 'Bereits Beworben'}
                            isLocked={!canApply}
                            hideStatusLabel={hideStatusLabel}
                            onSelect={onSelect}
                        />
                    ))
                )}
            </div>
        </div>
    );
});
