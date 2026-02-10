import "server-only";

import { supabaseServer } from "@/lib/supabaseServer";
import type { Database } from "@/lib/types/supabase";

type JobRow = Database["public"]["Tables"]["jobs"]["Row"] & {
  poster: { full_name: string | null; email: string | null } | null;
  market_region: { city: string | null } | null;
};

export type AdminJobListItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  posted_by: string;
  posted_by_name: string | null;
  created_at: string;
  location_label: string | null;
  market: string | null;
};

export type AdminJobDetail = AdminJobListItem & {
  posted_by_email: string | null;
  wage_hourly: number | null;
  category: string | null;
};

function sanitizeSearchTerm(search: string): string {
  return search.replace(/[,%]/g, " ").trim();
}

function normalizeError(error: unknown, fallback: string): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: string }).message;
    if (message) return message;
  }
  return fallback;
}

function mapJobRow(row: JobRow): AdminJobDetail {
  return {
    id: row.id,
    title: row.title || "Untitled job",
    description: row.description || "",
    status: row.status,
    posted_by: row.posted_by,
    posted_by_name: row.poster?.full_name || null,
    posted_by_email: row.poster?.email || null,
    created_at: row.created_at,
    location_label: row.public_location_label || null,
    market: row.market_region?.city || null,
    wage_hourly: row.wage_hourly ? Number(row.wage_hourly) : null,
    category: row.category || null,
  };
}

export async function getAdminJobs(params: {
  limit?: number;
  offset?: number;
  search?: string;
} = {}): Promise<{ items: AdminJobListItem[]; error: string | null }> {
  try {
    const { limit = 100, offset = 0, search = "" } = params;
    const safeLimit = Math.max(1, Math.min(500, limit));
    const safeOffset = Math.max(0, offset);
    const term = sanitizeSearchTerm(search);

    const supabase = await supabaseServer();
    let query = supabase
      .from("jobs")
      .select(
        "id, title, description, status, posted_by, created_at, public_location_label, wage_hourly, category, poster:profiles!jobs_posted_by_fkey(full_name, email), market_region:regions_live!jobs_market_id_fkey(city)",
      )
      .order("created_at", { ascending: false })
      .range(safeOffset, safeOffset + safeLimit - 1);

    if (term.length > 0) {
      const pattern = `%${term}%`;
      query = query.or(`title.ilike.${pattern},description.ilike.${pattern}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("jobs:list", { error: error.message, term, safeLimit, safeOffset });
      return {
        items: [],
        error: normalizeError(error, "Failed to load jobs."),
      };
    }

    // Cast needed because the join result shape isn't fully inferred by TS complex joins sometimes
    // But it's much safer than 'unknown'
    const rows = (data ?? []) as any as JobRow[];

    return {
      items: rows.map((row) => {
        const mapped = mapJobRow(row);
        return {
          id: mapped.id,
          title: mapped.title,
          description: mapped.description,
          status: mapped.status,
          posted_by: mapped.posted_by,
          posted_by_name: mapped.posted_by_name,
          created_at: mapped.created_at,
          location_label: mapped.location_label,
          market: mapped.market,
        };
      }),
      error: null,
    };
  } catch (error) {
    console.error("jobs:list:init", {
      error: normalizeError(error, "Failed to initialize jobs query."),
    });
    return {
      items: [],
      error: "Failed to load jobs.",
    };
  }
}

export async function getAdminJob(jobId: string): Promise<{ item: AdminJobDetail | null; error: string | null }> {
  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase
      .from("jobs")
      .select(
        "id, title, description, status, posted_by, created_at, public_location_label, wage_hourly, category, poster:profiles!jobs_posted_by_fkey(full_name, email), market_region:regions_live!jobs_market_id_fkey(city)",
      )
      .eq("id", jobId)
      .maybeSingle();

    if (error) {
      console.error("jobs:detail", { jobId, error: error.message });
      return {
        item: null,
        error: normalizeError(error, "Failed to load job details."),
      };
    }

    if (!data) {
      return { item: null, error: null };
    }

    return {
      item: mapJobRow(data as any as JobRow),
      error: null,
    };
  } catch (error) {
    console.error("jobs:detail:init", {
      jobId,
      error: normalizeError(error, "Failed to initialize job detail query."),
    });
    return {
      item: null,
      error: "Failed to load job details.",
    };
  }
}
