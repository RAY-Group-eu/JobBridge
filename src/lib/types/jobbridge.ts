import type { AccountType } from "@/lib/types";
import type { Database } from "@/lib/types/supabase";

export type DataSource = "live" | "demo";

export type ErrorInfo = {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
  statusText?: string;
};

export type EffectiveViewSnapshot = {
  isDemoEnabled: boolean;
  viewRole: AccountType;
  source: DataSource;
  // Only present when role override is active (and demo is disabled).
  overrideExpiresAt?: string | null;
  // Only present when demo is enabled.
  demoView?: AccountType | null;
};

export type JobStatus = Database["public"]["Enums"]["job_status"];

// Normalized shape for list rendering across live + demo sources and RPC/table strategies.
export type JobsListItem = {
  id: string;
  title: string;
  description: string;
  posted_by: string;
  status: JobStatus;
  created_at: string;
  market_id: string | null;
  public_location_label: string | null;
  wage_hourly: number | null;
  // Optional enrichments (RPC or separate lookup).
  distance_km?: number | null;
  market_name?: string | null;
  brand_prefix?: string | null;
  is_applied?: boolean;
};

