"use client";

import { supabaseBrowser } from "./supabaseClient";

// Client-seitige Auth-Funktionen (nur für Client Components)
export const signUpWithEmail = async (email: string, password: string, data?: object) => {
  // Prio: Env Var (für korrekte Domain) -> Window Origin (Fallback)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const emailRedirectTo = siteUrl ? `${siteUrl}/auth/callback?next=/verified` : undefined;

  console.log("[Auth] SignUp initiated with redirect:", emailRedirectTo);

  const { data: result, error } = await supabaseBrowser.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data,
    },
  });
  return { data: result, error };
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabaseBrowser.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  await supabaseBrowser.auth.signOut();
};

