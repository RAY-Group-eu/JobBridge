import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { type AdminApplicationDetail, type AdminApplicationListItem } from "@/lib/data/adminTypes";

type ApplicationRow = {
  id: string;
  job_id: string;
  user_id: string;
  status: string | null;
  message: string | null;
  created_at: string;
  job: {
    title: string | null;
  } | null;
  applicant: {
    full_name: string | null;
    email: string | null;
  } | null;
};

function normalizeError(error: unknown, fallback: string): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: string }).message;
    if (message) return message;
  }
  return fallback;
}

function sanitizeSearchTerm(search: string): string {
  return search.replace(/[,%]/g, " ").trim().toLowerCase();
}

function mapApplicationRow(row: ApplicationRow): AdminApplicationDetail {
  return {
    id: row.id,
    job_id: row.job_id,
    user_id: row.user_id,
    status: row.status || "submitted",
    message: row.message,
    created_at: row.created_at,
    job_title: row.job?.title || null,
    applicant_name: row.applicant?.full_name || null,
    applicant_email: row.applicant?.email || null,
  };
}

function matchesSearch(item: AdminApplicationListItem, term: string): boolean {
  if (!term) return true;

  const haystack = [
    item.status,
    item.message,
    item.job_title,
    item.applicant_name,
    item.applicant_email,
    item.id,
    item.job_id,
    item.user_id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(term);
}

export async function getAdminApplications(params: {
  limit?: number;
  offset?: number;
  search?: string;
} = {}): Promise<{ items: AdminApplicationListItem[]; error: string | null }> {
  try {
    const { limit = 100, offset = 0, search = "" } = params;
    const safeLimit = Math.max(1, Math.min(500, limit));
    const safeOffset = Math.max(0, offset);
    const term = sanitizeSearchTerm(search);

    const adminClient = getSupabaseAdminClient();
    const { data, error } = await adminClient
      .from("applications")
      .select(
        "id, job_id, user_id, status, message, created_at, job:jobs!applications_job_id_fkey(title), applicant:profiles!applications_user_id_fkey(full_name, email)",
      )
      .order("created_at", { ascending: false })
      .range(0, Math.max(safeOffset + safeLimit + 200, 300));

    if (error) {
      console.error("applications:list", { error: error.message, safeLimit, safeOffset, term });
      return {
        items: [],
        error: normalizeError(error, "Failed to load applications."),
      };
    }

    const mapped = ((data ?? []) as unknown as ApplicationRow[]).map(mapApplicationRow);
    const filtered = term ? mapped.filter((item) => matchesSearch(item, term)) : mapped;

    return {
      items: filtered.slice(safeOffset, safeOffset + safeLimit),
      error: null,
    };
  } catch (error) {
    console.error("applications:list:init", {
      error: normalizeError(error, "Failed to initialize applications query."),
    });
    return {
      items: [],
      error: "Failed to load applications.",
    };
  }
}

export async function getAdminApplication(
  applicationId: string,
): Promise<{ item: AdminApplicationDetail | null; error: string | null }> {
  try {
    const adminClient = getSupabaseAdminClient();
    const { data, error } = await adminClient
      .from("applications")
      .select(
        "id, job_id, user_id, status, message, created_at, job:jobs!applications_job_id_fkey(title), applicant:profiles!applications_user_id_fkey(full_name, email)",
      )
      .eq("id", applicationId)
      .maybeSingle();

    if (error) {
      console.error("applications:detail", { applicationId, error: error.message });
      return {
        item: null,
        error: normalizeError(error, "Failed to load application details."),
      };
    }

    if (!data) {
      return { item: null, error: null };
    }

    return {
      item: mapApplicationRow(data as unknown as ApplicationRow),
      error: null,
    };
  } catch (error) {
    console.error("applications:detail:init", {
      applicationId,
      error: normalizeError(error, "Failed to initialize application detail query."),
    });
    return {
      item: null,
      error: "Failed to load application details.",
    };
  }
}
