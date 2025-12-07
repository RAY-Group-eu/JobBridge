import type { SupabaseClient } from "@supabase/supabase-js";

export type AuthLike = Pick<SupabaseClient, "auth"> & {
  auth: {
    verifyOtp: (args: { email: string; token: string; type: "signup" }) => Promise<{ error: { message: string } | null }>;
  };
};

export async function verifySignupCode(client: AuthLike, email: string, token: string) {
  const t = token.trim();
  if (!/^\d{8}$/.test(t)) {
    return { ok: false, error: "Bitte gib den 8-stelligen Code ein." } as const;
  }
  const { error } = await client.auth.verifyOtp({ email, token: t, type: "signup" });
  if (error) {
    return { ok: false, error: error.message || "Ungültiger oder abgelaufener Code." } as const;
  }
  return { ok: true } as const;
}
