"use client";

import { supabaseBrowser } from "./supabaseClient";

// Client-seitige Auth-Funktionen (nur für Client Components)
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabaseBrowser.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback?next=/verified` : undefined,
    },
  });
  return { data, error };
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

