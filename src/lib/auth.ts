import type { Session } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { supabaseServer } from "./supabaseServer";
import { Profile, isProfileComplete } from "./types";

export type AuthState =
  | { state: "no-session" }
  | { state: "email-unconfirmed"; session: Session; profile: Profile | null }
  | { state: "incomplete-profile"; session: Session; profile: Profile | null }
  | { state: "ready"; session: Session; profile: Profile | null };

export const getCurrentSessionAndProfile = async (): Promise<{
  session: Session | null;
  profile: Profile | null;
}> => {
  const supabase = await supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return { session: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .maybeSingle();

  return { session, profile: (profile as Profile | null) ?? null };
};

// Klare Zustände, kein Redirect
export async function getAuthState(): Promise<AuthState> {
  const { session, profile } = await getCurrentSessionAndProfile();

  if (!session) {
    return { state: "no-session" } as const;
  }

  const confirmedAt = (session.user as { confirmed_at?: string } | null | undefined)?.confirmed_at;
  const isEmailConfirmed = Boolean((session.user as any)?.email_confirmed_at || confirmedAt);

  if (!isEmailConfirmed) {
    return { state: "email-unconfirmed", session, profile } as const;
  }

  if (!isProfileComplete(profile)) {
    return { state: "incomplete-profile", session, profile } as const;
  }

  return { state: "ready", session, profile } as const;
}

export const requireSession = async () => {
  const state = await getAuthState();
  if (state.state === "no-session" || state.state === "email-unconfirmed") redirect("/");
  return { session: state.session!, profile: state.profile ?? null };
};

export const requireCompleteProfile = async () => {
  const state = await getAuthState();
  if (state.state === "no-session" || state.state === "email-unconfirmed")
    redirect("/");
  if (state.state === "incomplete-profile") redirect("/onboarding");
  return { session: state.session!, profile: state.profile! };
};

export const redirectIfAuthenticated = async () => {
  const state = await getAuthState();
  if (state.state === "ready") redirect("/app-home");
};
