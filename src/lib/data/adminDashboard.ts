import "server-only";

import { supabaseServer } from "@/lib/supabaseServer";
import { getHighestStaffRole, getStaffRolesForUser } from "@/lib/data/adminAuth";
import {
  type ActivityItem,
  type ActivityResponse,
  type DashboardMetrics,
  type MetricWidget,
  type StaffRole,
  type StaffHeaderContext,
  type WorkQueueItem,
} from "@/lib/data/adminTypes";
import type { Database } from "@/lib/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type JobRow = Database["public"]["Tables"]["jobs"]["Row"];
type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"];

function normalizeError(error: unknown, fallback: string): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: string }).message;
    if (message) return message;
  }
  return fallback;
}

function shortId(value: string | null | undefined): string {
  if (!value) return "???";
  return value.substring(0, 8);
}

/**
 * Helper to count rows safely.
 */
async function countRows(
  table: "profiles" | "jobs" | "applications",
  queryName: string,
  fallbackError: string
): Promise<MetricWidget> {
  try {
    const supabase = await supabaseServer();
    const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });

    if (error) {
      console.error(`dashboard:count:${queryName}`, error);
      return { value: 0, error: "Fehler" };
    }

    return { value: count ?? 0, error: null };
  } catch (err) {
    console.error(`dashboard:count:${queryName}:init`, err);
    return { value: 0, error: "Fehler" };
  }
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const [users, jobs, applications] = await Promise.all([
      countRows("profiles", "users", "Users load failed"),
      countRows("jobs", "jobs", "Jobs load failed"),
      countRows("applications", "applications", "Applications load failed"),
    ]);

    return { users, jobs, applications };
  } catch (error) {
    console.error("dashboard:metrics", error);
    return {
      users: { value: 0, error: "Fehler" },
      jobs: { value: 0, error: "Fehler" },
      applications: { value: 0, error: "Fehler" },
    };
  }
}

export async function getStaffHeaderContext(userId: string): Promise<StaffHeaderContext> {
  try {
    const supabase = await supabaseServer();
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", userId).single();

    // Fix: getStaffRolesForUser returns { roles, error }
    const { roles } = await getStaffRolesForUser(userId);

    const highestRole = getHighestStaffRole(roles || []);

    return {
      fullName: profile?.full_name || "Staff Member",
      roles: roles || [],
      highestRole,
      demoEnabled: false, // Default or fetch from profile settings if needed
      demoView: "job_provider", // Default
      error: null,
    };
  } catch (error) {
    console.error("dashboard:header", error);
    return {
      fullName: "Staff",
      roles: [],
      highestRole: "staff",
      demoEnabled: false,
      demoView: "job_provider",
      error: normalizeError(error, "Failed to load header context"),
    };
  }
}

export async function getRecentActivity(limit = 15, offset = 0): Promise<ActivityResponse> {
  try {
    const supabase = await supabaseServer();
    const safeLimit = Math.min(limit, 50);

    const [profiles, jobs, applications] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, city, created_at")
        .order("created_at", { ascending: false })
        .limit(safeLimit),
      supabase
        .from("jobs")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(safeLimit),
      supabase
        .from("applications")
        .select("id, job_id, user_id, created_at")
        .order("created_at", { ascending: false })
        .limit(safeLimit),
    ]);

    const items: ActivityItem[] = [];

    (profiles.data || []).forEach((p) => {
      items.push({
        entityId: p.id,
        type: "user", // Correct enum value
        title: p.full_name || "Neuer Nutzer",
        subtitle: p.city || "Unbekannter Ort",
        createdAt: p.created_at, // Use string ISO date
        href: `/staff/users/${p.id}`,
      });
    });

    (jobs.data || []).forEach((j) => {
      items.push({
        entityId: j.id,
        type: "job", // Correct enum value
        title: "Neuer Job",
        subtitle: j.title || "Ohne Titel",
        createdAt: j.created_at,
        href: `/staff/jobs?id=${j.id}`,
      });
    });

    (applications.data || []).forEach((a) => {
      items.push({
        entityId: a.id,
        type: "application", // Correct enum value
        title: "Neue Bewerbung",
        subtitle: `Job: ${shortId(a.job_id)}`,
        createdAt: a.created_at,
        href: `/staff/applications?id=${a.id}`,
      });
    });

    // Sort by createdAt string (ISO 8601 sorts lexicographically)
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const pagedItems = items.slice(offset, offset + limit);

    return {
      items: pagedItems,
      hasMore: items.length > offset + limit, // Add missing prop
      error: null,
    };
  } catch (error) {
    console.error("dashboard:activity", error);
    return { items: [], hasMore: false, error: normalizeError(error, "Failed to load activity.") };
  }
}

export async function getWorkQueue(limit = 10): Promise<{ items: WorkQueueItem[]; error: string | null }> {
  try {
    const supabase = await supabaseServer();

    // Example logic
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, full_name, account_type, guardian_status, provider_verification_status, created_at")
      .eq("account_type", "job_provider")
      .is("provider_verification_status", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return { items: [], error: normalizeError(error, "Failed to load work queue.") };
    }

    const items: WorkQueueItem[] = (profiles || []).map((p) => ({
      id: `verify-${p.id}`,
      type: "verification", // enum from adminTypes
      priority: "high",
      title: "Anbieter verifizieren",
      subtitle: p.full_name || "Unbekannter Anbieter", // mapped from description/subtitle
      created_at: p.created_at,
      link: `/staff/users/${p.id}`,
    }));

    return { items, error: null };
  } catch (error) {
    console.error("dashboard:work_queue", error);
    return { items: [], error: "Failed to load work queue." };
  }
}

export async function getStaffIdentity(userId: string): Promise<{
  full_name: string;
  roles: string[];
  highest_role: StaffRole;
  error: string | null;
}> {
  try {
    const supabase = await supabaseServer();
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", userId).single();
    const { roles, error } = await getStaffRolesForUser(userId);

    if (error) throw error;

    return {
      full_name: profile?.full_name || "Staff Member",
      roles: roles || [],
      highest_role: getHighestStaffRole(roles || []),
      error: null,
    };
  } catch (error) {
    console.error("dashboard:identity", error);
    return {
      full_name: "Staff",
      roles: [],
      highest_role: "staff",
      error: normalizeError(error, "Failed to load identity."),
    };
  }
}
