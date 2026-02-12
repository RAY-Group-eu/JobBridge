"use client";

import { ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";

export function VerificationRequiredGuard() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mb-8 ring-1 ring-amber-500/20 shadow-[0_0_40px_-10px_rgba(245,158,11,0.2)]">
                <ShieldAlert size={48} className="text-amber-500" />
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                Verifizierung erforderlich
            </h1>

            <p className="text-lg text-slate-400 max-w-lg mb-10 leading-relaxed">
                Um die Sicherheit unserer Community zu gewährleisten, ist eine einmalige Adress-Verifizierung notwendig. <br />
                Bitte bestätige deine Wohnadresse, um Jobs veröffentlichen zu können.
            </p>

            <Link
                href="/app-home/profile"
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative">Jetzt verifizieren</span>
                <ArrowRight className="relative group-hover:translate-x-1 transition-transform" />
            </Link>

            <p className="mt-8 text-sm text-slate-500">
                Deine Adresse dient ausschließlich dem internen Trust-Check. <br />
                Sie wird nicht öffentlich angezeigt.
            </p>
        </div>
    );
}
