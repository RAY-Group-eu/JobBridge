"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "./supabaseServer";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const mode = formData.get("mode") as string;

  if (!email || !password) {
    return { success: false, message: "Bitte E-Mail und Passwort eingeben." };
  }

  const supabase = await supabaseServer();

  if (mode === "signup") {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    // Bei SignUp nicht direkt weiterleiten, sondern zum Email-Confirm
    return { success: true, requiresEmailConfirm: true };
  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    redirect("/app-home");
  }
}
