import type { SupabaseClient } from "@supabase/supabase-js";
import { Database, Profile } from "./types";

export const getProfileById = async (
  supabase: SupabaseClient<Database>,
  userId: string
) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
};

export const saveProfile = async (
  supabase: SupabaseClient<Database>,
  payload: Partial<Profile> & { id: string }
) => {
  const insertPayload: Database["public"]["Tables"]["profiles"]["Insert"] = {
    id: payload.id,
    full_name: payload.full_name ?? null,
    birthdate: payload.birthdate ?? null,
    city: payload.city ?? null,
    user_type: payload.user_type ?? null,
    is_verified: payload.is_verified ?? null,
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(insertPayload, { onConflict: "id" })
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
};
