import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminReportListItem = {
  id: string;
  target_type: string;
  target_id: string;
  reason_code: string;
  details: string | null;
  status: string;
  reporter_user_id: string;
  reporter_name: string | null;
  created_at: string;
};

type ReportRow = {
  id: string;
  target_type: string | null;
  target_id: string | null;
  reason_code: string | null;
  details: string | null;
  status: string | null;
  reporter_user_id: string;
  created_at: string;
  reporter: {
    full_name: string | null;
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

function mapReportRow(row: ReportRow): AdminReportListItem {
  return {
    id: row.id,
    target_type: row.target_type || "",
    target_id: row.target_id || "",
    reason_code: row.reason_code || "unspecified",
    details: row.details,
    status: row.status || "open",
    reporter_user_id: row.reporter_user_id,
    reporter_name: row.reporter?.full_name || null,
    created_at: row.created_at,
  };
}

export async function getAdminReports(params: {
  limit?: number;
  offset?: number;
} = {}): Promise<{ items: AdminReportListItem[]; error: string | null }> {
  try {
    const { limit = 100, offset = 0 } = params;
    const safeLimit = Math.max(1, Math.min(500, limit));
    const safeOffset = Math.max(0, offset);

    const adminClient = getSupabaseAdminClient();
    const { data, error } = await adminClient
      .from("reports")
      .select(
        "id, target_type, target_id, reason_code, details, status, reporter_user_id, created_at, reporter:profiles!reports_reporter_user_id_fkey(full_name)",
      )
      .order("created_at", { ascending: false })
      .range(safeOffset, safeOffset + safeLimit - 1);

    if (error) {
      console.error("moderation:reports:list", { error: error.message, safeLimit, safeOffset });
      return {
        items: [],
        error: normalizeError(error, "Failed to load reports."),
      };
    }

    return {
      items: ((data ?? []) as unknown as ReportRow[]).map(mapReportRow),
      error: null,
    };
  } catch (error) {
    console.error("moderation:reports:list:init", {
      error: normalizeError(error, "Failed to initialize reports query."),
    });
    return {
      items: [],
      error: "Failed to load reports.",
    };
  }
}

export async function getAdminReport(reportId: string): Promise<{ item: AdminReportListItem | null; error: string | null }> {
  try {
    const adminClient = getSupabaseAdminClient();
    const { data, error } = await adminClient
      .from("reports")
      .select(
        "id, target_type, target_id, reason_code, details, status, reporter_user_id, created_at, reporter:profiles!reports_reporter_user_id_fkey(full_name)",
      )
      .eq("id", reportId)
      .maybeSingle();

    if (error) {
      console.error("moderation:reports:detail", { reportId, error: error.message });
      return {
        item: null,
        error: normalizeError(error, "Failed to load report details."),
      };
    }

    if (!data) {
      return { item: null, error: null };
    }

    return {
      item: mapReportRow(data as unknown as ReportRow),
      error: null,
    };
  } catch (error) {
    console.error("moderation:reports:detail:init", {
      reportId,
      error: normalizeError(error, "Failed to initialize report detail query."),
    });
    return {
      item: null,
      error: "Failed to load report details.",
    };
  }
}
