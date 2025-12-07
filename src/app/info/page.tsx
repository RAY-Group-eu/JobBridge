import { LogoBadge } from "@/components/ui/LogoBadge";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/constants";

export default function InfoPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-14 top-12 h-60 w-60 rounded-full bg-cyan-400/20 blur-3xl animate-pulse" />
        <div className="absolute right-14 top-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative bg-white/8 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl shadow-black/40 w-full max-w-3xl p-10">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex items-center justify-center gap-4">
            <LogoBadge size="md" />
            <div>
              <h1 className="text-2xl font-semibold text-white md:text-3xl">
                {BRAND_NAME}
              </h1>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-slate-200 md:text-3xl">
            Über uns
          </h2>
          <div className="space-y-4 text-lg text-slate-300">
            <p>
              {BRAND_NAME} ist eine Plattform, die Menschen zusammenbringt – egal ob du Hilfe suchst oder anbietest.
            </p>
            <p>
              Wir verbinden Jugendliche mit Jobangeboten, Senioren mit Unterstützung und Unternehmen mit den richtigen Menschen.
            </p>
            <p className="text-slate-400">
              Sicher, einfach und für alle zugänglich.
            </p>
          </div>
          <Link
            href="/"
            className="soft-gradient rounded-2xl px-8 py-3 text-lg font-semibold text-slate-950 transition hover:scale-105"
          >
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}

