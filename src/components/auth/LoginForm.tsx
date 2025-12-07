"use client";

import { FormEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { LogoBadge } from "@/components/ui/LogoBadge";

type Mode = "login" | "signup";

export function LoginForm() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    if (!email.trim() || !password) {
      setMessage("Bitte E-Mail und Passwort eingeben.");
      setLoading(false);
      return;
    }

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      }
      router.push("/app-home");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Anmeldung fehlgeschlagen. Bitte erneut versuchen.";
      setMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10 md:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="floating-blob absolute left-10 top-12 h-56 w-56 opacity-70" />
        <div className="floating-blob absolute right-12 top-20 h-64 w-64 bg-indigo-400/25" />
        <div className="floating-blob absolute bottom-0 left-1/3 h-60 w-60 bg-sky-400/25" />
      </div>
      <div className="relative bg-white/8 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl shadow-black/40 w-full max-w-4xl overflow-hidden p-8 md:p-12">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <div className="flex justify-center md:justify-start">
              <LogoBadge size="md" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
                Willkommen zurück
              </h1>
              <p className="text-lg text-slate-200/80 md:text-xl">
                Melden Sie sich mit E-Mail und Passwort an oder erstellen Sie
                in wenigen Sekunden einen neuen Zugang.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/5 p-2 text-sm text-slate-200/80">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 rounded-full px-4 py-2 font-semibold transition ${
                  mode === "login"
                    ? "soft-gradient text-slate-950 shadow-md"
                    : "bg-transparent text-slate-100"
                }`}
              >
                Einloggen
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-full px-4 py-2 font-semibold transition ${
                  mode === "signup"
                    ? "soft-gradient text-slate-950 shadow-md"
                    : "bg-transparent text-slate-100"
                }`}
              >
                Registrieren
              </button>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-lg font-medium text-white">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-lg text-white placeholder:text-slate-300/70 focus:border-cyan-300/80 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-lg font-medium text-white">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-lg text-white placeholder:text-slate-300/70 focus:border-cyan-300/80 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
                placeholder="Mindestens 6 Zeichen"
              />
            </div>

            {message && (
              <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 md:text-base">
                {message}
              </div>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              className="soft-gradient inline-flex w-full items-center justify-center rounded-2xl px-6 py-4 text-lg font-semibold text-slate-950 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:opacity-60"
            >
              {loading
                ? "Wird geladen..."
                : mode === "login"
                ? "Einloggen"
                : "Registrieren"}
            </motion.button>
            <p className="text-sm text-slate-200/70">
              Nach der Anmeldung führen wir Sie automatisch durch das kurze
              Onboarding.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
