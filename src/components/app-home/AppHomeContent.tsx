"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogoBadge } from "@/components/ui/LogoBadge";
import { LiquidBackground } from "@/components/ui/LiquidBackground";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Profile } from "@/lib/types";

type AppHomeContentProps = {
  profile: Profile | null;
};

export function AppHomeContent({ profile }: AppHomeContentProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-[#050816] to-[#02040a]">
      {/* Liquid Background */}
      <LiquidBackground />

      {/* Fixed Glass Header */}
      <header className="relative z-20 border-b border-white/5 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4 md:px-8">
          <div className="flex items-center justify-between">
            <LogoBadge size="sm" />
            <ButtonPrimary onClick={handleLogout} className="px-6 py-2 text-sm">
              Abmelden
            </ButtonPrimary>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-2xl"
        >
          <div className="bg-white/8 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl shadow-black/40 p-10 md:p-12">
            <div className="text-center space-y-6">
              <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                Du bist angemeldet.
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed">
                Bald kannst du Jobs suchen oder anbieten. Wir entwickeln diesen Bereich gerade.
              </p>
              {profile?.full_name && (
                <p className="text-sm text-slate-400">
                  Willkommen, {profile.full_name}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer Zone */}
      <footer className="relative z-20 border-t border-white/5 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4 md:px-8">
          <p className="text-xs text-white/40 text-center">
            Ein Projekt der Ray Group
          </p>
        </div>
      </footer>
    </div>
  );
}

