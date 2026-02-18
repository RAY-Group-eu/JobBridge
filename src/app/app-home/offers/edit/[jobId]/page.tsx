import { requireCompleteProfile } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";
import { notFound, redirect } from "next/navigation";
import { EditJobForm } from "./components/EditJobForm";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditJobPage({
    params
}: {
    params: Promise<{ jobId: string }>
}) {
    const { jobId } = await params;
    const { profile } = await requireCompleteProfile();

    const supabase = await supabaseServer();
    const { data: job, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();

    if (error || !job) {
        notFound();
    }

    // Authorization Check: Only creator can edit
    if (job.posted_by !== profile.id) {
        // Technically RLS should block this too, but good to check here
        return (
            <div className="container mx-auto py-20 px-4 text-center">
                <h1 className="text-2xl font-bold text-red-400">Zugriff verweigert</h1>
                <p className="text-slate-400 mt-2">Du kannst nur deine eigenen Jobs bearbeiten.</p>
                <Link href="/app-home/offers" className="mt-8 inline-block">
                    <Button variant="secondary">Zurück</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 max-w-2xl">
            <div className="mb-6">
                <Link href="/app-home/offers" className="text-slate-400 hover:text-white flex items-center gap-2 mb-4 transition-colors">
                    <ArrowLeft size={16} />
                    <span>Zurück zu meinen Jobs</span>
                </Link>
                <h1 className="text-3xl font-bold text-white">Job bearbeiten</h1>
            </div>

            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                <EditJobForm job={job} />
            </div>
        </div>
    );
}
