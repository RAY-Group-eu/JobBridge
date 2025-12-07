"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Database } from "./types";

export const supabaseBrowser = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Legacy export für Kompatibilität während der Migration
export const createSupabaseClient = () => supabaseBrowser;
