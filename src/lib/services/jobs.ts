import { supabaseServer } from "@/lib/supabaseServer";
import { JobStatus } from "@/lib/types";
import { Database } from "@/lib/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export type CreateJobParams = {
    posted_by: string;
    market_id: string;
    title: string;
    description: string;
    wage_hourly: number;
    status: JobStatus;
    category: string;
    address_reveal_policy?: 'after_apply' | 'after_accept';
    public_location_label?: string;
    public_lat?: number;
    public_lng?: number;
};

export type JobPrivateParams = {
    address_full?: string | null;
    private_lat?: number;
    private_lng?: number;
    notes?: string;
    location_id?: string | null;
};

// --- Helper Functions ---

async function createRealJob(
    supabase: SupabaseClient<Database>,
    payload: CreateJobParams
) {
    const { data, error } = await supabase
        .from("jobs")
        .insert({
            posted_by: payload.posted_by,
            market_id: payload.market_id,
            title: payload.title,
            description: payload.description,
            wage_hourly: payload.wage_hourly,
            status: payload.status as Database["public"]["Enums"]["job_status"],
            category: payload.category,
            address_reveal_policy: payload.address_reveal_policy ?? "after_apply",
            public_location_label: payload.public_location_label || "",
            public_lat: payload.public_lat ?? null,
            public_lng: payload.public_lng ?? null,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function createDemoJob(
    supabase: SupabaseClient<Database>,
    payload: CreateJobParams
) {
    const { data, error } = await supabase
        .from("demo_jobs")
        .insert({
            posted_by: payload.posted_by,
            market_id: payload.market_id,
            title: payload.title,
            description: payload.description,
            wage_hourly: payload.wage_hourly,
            status: payload.status as Database["public"]["Enums"]["job_status"],
            category: payload.category, // Stored as TEXT in demo_jobs per patch
            address_reveal_policy: payload.address_reveal_policy ?? "after_apply",
        } as any)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function createRealJobPrivateDetails(
    supabase: SupabaseClient<Database>,
    jobId: string,
    params: JobPrivateParams
) {
    const { error } = await supabase
        .from("job_private_details")
        .insert({
            job_id: jobId,
            address_full: params.address_full,
            private_lat: params.private_lat,
            private_lng: params.private_lng,
            notes: params.notes,
            location_id: params.location_id
        });
    if (error) throw error;
}

// --- Main Service ---

export async function createJobService(
    userId: string,
    jobParams: CreateJobParams,
    privateParams: JobPrivateParams | null,
    isDemo: boolean
) {
    const supabase = await supabaseServer();

    try {
        let jobData;

        if (isDemo) {
            jobData = await createDemoJob(supabase, jobParams);
            // Demo logic remains separate as per plan
        } else {
            // Updated to use ATOMIC RPC
            const { data, error } = await supabase.rpc("create_job_atomic", {
                p_market_id: jobParams.market_id,
                p_title: jobParams.title,
                p_description: jobParams.description,
                p_wage_hourly: jobParams.wage_hourly,
                p_category: jobParams.category,
                p_address_reveal_policy: jobParams.address_reveal_policy || 'after_apply',
                p_public_location_label: jobParams.public_location_label || "",
                p_public_lat: jobParams.public_lat || null,
                p_public_lng: jobParams.public_lng || null,
                // Private Details
                p_address_full: privateParams?.address_full || null,
                p_private_lat: privateParams?.private_lat || null,
                p_private_lng: privateParams?.private_lng || null,
                p_notes: privateParams?.notes || null,
                p_location_id: privateParams?.location_id || null
            });

            if (error) throw error;
            jobData = data;
        }

        return { data: jobData };

    } catch (error: any) {
        console.error("Create Job Failed:", error);
        return { error: error.message || "Failed to create job" };
    }
}

export async function getProviderJobsService(userId: string, isDemo: boolean) {
    const supabase = await supabaseServer();

    if (isDemo) {
        const { data, error } = await supabase
            .from("demo_jobs")
            .select("*")
            .eq("posted_by", userId)
            .order("created_at", { ascending: false });
        if (error) return { error: error.message };
        return { data };
    } else {
        const { data, error } = await supabase
            .from("jobs")
            .select("*")
            .eq("posted_by", userId)
            .order("created_at", { ascending: false });
        if (error) return { error: error.message };
        return { data };
    }
}

export async function getJobByIdService(jobId: string, isDemo: boolean) {
    const supabase = await supabaseServer();

    if (isDemo) {
        const { data, error } = await supabase
            .from("demo_jobs")
            .select("*")
            .eq("id", jobId)
            .single();
        if (error) return { error: error.message };
        return { data };
    } else {
        const { data, error } = await supabase
            .from("jobs")
            .select("*")
            .eq("id", jobId)
            .single();
        if (error) return { error: error.message };
        return { data };
    }
}
