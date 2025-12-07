"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CardHeader } from "./ui/CardHeader";
import { ChoiceTile } from "./ui/ChoiceTile";
import { ButtonPrimary } from "./ui/ButtonPrimary";
import { ButtonSecondary } from "./ui/ButtonSecondary";
import { Loader } from "./ui/Loader";
import { Toast } from "./ui/Toast";
import { signUpWithEmail, signInWithEmail } from "@/lib/authClient";
import { saveProfile } from "@/lib/profile";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { UserType, Profile } from "@/lib/types";
import { getRegions, type Region } from "@/lib/regions";
import { BRAND_EMAIL } from "@/lib/constants";
import { Sparkles, HandHeart, Building2 } from "lucide-react";
import { verifySignupCode } from "@/lib/verify";

type Step = "welcome" | "mode" | "auth" | "email-confirm" | "role" | "profile" | "contact" | "summary";

type AuthMode = "signup" | "signin" | null;

type OnboardingWizardProps = {
  initialProfile?: Profile | null;
  forcedStep?: Step | null;
  initialEmail?: string;
};

const isProfileComplete = (profile: Profile | null | undefined) => {
  return Boolean(
    profile?.full_name && profile.birthdate && profile.city && profile.user_type
  );
};

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || BRAND_EMAIL;
const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

export function OnboardingWizard({
  initialProfile,
  forcedStep = null,
  initialEmail = "",
}: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(
    forcedStep
      ? forcedStep
      : initialProfile && !isProfileComplete(initialProfile)
        ? "role"
        : "welcome"
  );
  const [mode, setMode] = useState<AuthMode>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
  const [code, setCode] = useState("");
  const [codeMessage, setCodeMessage] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [codeAttempts, setCodeAttempts] = useState(0);
  const [codeLocked, setCodeLocked] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    role: (initialProfile?.user_type as UserType) || null,
    fullName: initialProfile?.full_name || "",
    birthdate: initialProfile?.birthdate || "",
    region: initialProfile?.city || "",
    companyName: "",
    companyEmail: "",
    companyMessage: "",
  });

  // Lade Regionen beim Mount
  useEffect(() => {
    const loadRegions = async () => {
      setRegionsLoading(true);
      try {
        const loadedRegions = await getRegions();
        setRegions(loadedRegions);
      } catch (err) {
        console.error("Fehler beim Laden der Regionen:", err);
      } finally {
        setRegionsLoading(false);
      }
    };
    loadRegions();
  }, []);

  // Prüfe Session nach Email-Bestätigung
  const checkSessionAfterEmailConfirm = useCallback(async () => {
    try {
      setEmailStatus(null);
      const { data: userData } = await supabaseBrowser.auth.getUser();
      const user = userData?.user;
      const confirmedAt = (
        user as { confirmed_at?: string } | null | undefined
      )?.confirmed_at;
      const isConfirmed = Boolean(user?.email_confirmed_at || confirmedAt);

      if (!user || !isConfirmed) {
        setEmailConfirmed(false);
        setEmailStatus(
          "Deine E-Mail ist noch nicht bestätigt. Bitte bestätige sie, bevor du fortfährst."
        );
        return false;
      }

      setEmailConfirmed(true);

      const { data: profile } = await supabaseBrowser
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      const profileTyped = profile as Profile | null;
      const verified = Boolean(profileTyped?.is_verified) || isConfirmed;
      const isComplete = isProfileComplete(profileTyped);

      if (verified && isComplete) {
        router.push("/app-home");
        return true;
      }

      if (verified) {
        setStep("role");
      } else {
        setEmailConfirmed(false);
        setEmailStatus("Du hast noch nicht bestätigt.");
      }
      if (profileTyped) {
        setProfileData((prev) => ({
          ...prev,
          role: profileTyped.user_type as UserType,
          fullName: profileTyped.full_name || "",
          birthdate: profileTyped.birthdate || "",
          region: profileTyped.city || "",
        }));
      }
      return true;
    } catch (err) {
      console.error("Fehler beim Prüfen der Session:", err);
      setEmailStatus("Prüfung fehlgeschlagen. Bitte später erneut versuchen.");
      return false;
    }
  }, [router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => {
      setResendCooldown((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  // Höre auf Auth-State-Änderungen (nur für Email-Confirm, nicht für direkten Login)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session && step === "email-confirm") {
        await checkSessionAfterEmailConfirm();
      }
    });

    return () => subscription.unsubscribe();
  }, [checkSessionAfterEmailConfirm, step]);

  const handleSignUp = async () => {
    if (!email.trim() || !password || password.length < 6) {
      setError("Bitte gib eine gültige E-Mail und ein Passwort (mindestens 6 Zeichen) ein.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await signUpWithEmail(email, password);
      if (error) throw error;
      setStep("email-confirm");
      setEmailStatus("Wir haben dir eine Bestätigung gesendet. Bitte prüfe dein Postfach.");
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "Registrierung fehlgeschlagen. Bitte versuche es erneut.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError("Bitte gib E-Mail und Passwort ein.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        if (error.message.includes("Invalid") || error.message.includes("password")) {
          throw new Error("E-Mail oder Passwort stimmen nicht. Bitte überprüfe deine Eingaben.");
        }
        throw error;
      }
      // Direkt zu /app weiterleiten nach erfolgreichem Login
      router.push("/app-home");
    } catch (err: unknown) {
      const message = getErrorMessage(
        err,
        "Anmeldung fehlgeschlagen. Bitte überprüfe deine Daten."
      );
      setError(message);
      if (message.toLowerCase().includes("bestätigt") || message.toLowerCase().includes("confirm")) {
        setStep("email-confirm");
        setEmailStatus("Deine E-Mail ist noch nicht bestätigt. Bitte prüfe dein Postfach.");
      }
      setLoading(false);
    }
  };

  const handleEmailConfirmation = async () => {
    setLoading(true);
    setError(null);
    setEmailStatus(null);

    try {
      const confirmed = await checkSessionAfterEmailConfirm();
      if (!confirmed) {
        setEmailStatus(
          "Deine E-Mail ist noch nicht bestätigt. Bitte bestätige sie, bevor du fortfährst."
        );
      }
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "E-Mail noch nicht bestätigt. Bitte versuche es erneut.")
      );
    } finally {
      setLoading(false);
    }
  };


  const handleVerifyCode = async () => {
    setCodeError(null);
    setCodeMessage(null);
    if (codeLocked) {
      setCodeError("Zu viele Versuche. Bitte nutze den Bestätigungslink.");
      return;
    }
    const trimmed = code.trim();
    if (!/^\d{8}$/.test(trimmed)) {
      setCodeError("Bitte gib den 8-stelligen Code ein.");
      return;
    }
    try {
      setLoading(true);
      const res = await verifySignupCode(supabaseBrowser as any, email, trimmed);
      if (!res.ok) throw new Error(res.error!);
      setCodeMessage("Code erfolgreich bestätigt. Session wird geprüft...");
      try {
        const { data: { session } } = await supabaseBrowser.auth.getSession();
        if (session?.user?.id) {
          await supabaseBrowser.from("profiles").update({ is_verified: true }).eq("id", session.user.id);
        }
        await supabaseBrowser.auth.refreshSession();
      } catch {}
      const ok = await checkSessionAfterEmailConfirm();
      if (!ok) {
        setEmailStatus("Noch nicht bestätigt. Bitte nutze den Link in der E-Mail.");
      }
    } catch (err) {
      setCodeError(getErrorMessage(err, "Ungültiger oder abgelaufener Code."));
      setToastType("error");
      setToastMsg("Der Code stimmt nicht");
      setToastOpen(true);
      const next = codeAttempts + 1;
      setCodeAttempts(next);
      if (next >= 5) {
        setCodeLocked(true);
        setCodeError("Zu viele Versuche. Bitte nutze den Bestätigungslink.");
      }
      try {
        const { data: { session } } = await supabaseBrowser.auth.getSession();
        if (session?.user?.id) {
          await supabaseBrowser
            .from("verification_attempts")
            .upsert({ id: session.user.id, attempts: next });
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setResendMessage(null);
    setEmailStatus(null);
    try {
      const { error } = await supabaseBrowser.auth.resend({
        type: "signup",
        email,
      });
      if (error) throw error;
      setResendMessage("Link gesendet. Bitte prüfe dein Postfach.");
      setResendCooldown(30);
      setToastType("success");
      setToastMsg("Neue Bestätigung gesendet");
      setToastOpen(true);
    } catch (err: unknown) {
      setResendMessage("Konnte nicht senden — versuche später erneut.");
      setToastType("error");
      setToastMsg("Konnte nicht senden — versuche später erneut");
      setToastOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyContact = async () => {
    if (!profileData.companyName || !profileData.companyEmail || !profileData.companyMessage) {
      setError("Bitte fülle alle Felder aus.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("Keine aktive Session gefunden.");
      }

      await saveProfile(supabaseBrowser, {
        id: session.user.id,
        full_name: profileData.fullName.trim(),
        birthdate: profileData.birthdate,
        city: profileData.companyName,
        user_type: "company",
        is_verified: false,
      });

      router.push("/info");
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "Fehler beim Absenden. Bitte versuche es erneut.")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!profileData.role || !profileData.fullName || !profileData.birthdate || !profileData.region) {
      setError("Bitte fülle alle Felder aus.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("Keine aktive Session gefunden. Bitte melde dich erneut an.");
      }

      await saveProfile(supabaseBrowser, {
        id: session.user.id,
        full_name: profileData.fullName.trim(),
        birthdate: profileData.birthdate,
        city: profileData.region.trim(),
        user_type: profileData.role,
        is_verified: false,
      });

      router.push("/app-home");
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "Speichern fehlgeschlagen. Bitte versuche es erneut.")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => {
    if (step === "welcome") {
      setStep("mode");
    } else if (step === "mode") {
      setStep("auth");
    } else if (step === "auth") {
      if (mode === "signup") {
        handleSignUp();
      } else {
        handleSignIn();
      }
    } else if (step === "email-confirm") {
      handleEmailConfirmation();
    } else if (step === "role") {
      if (!profileData.role) {
        setError("Bitte wähle eine Rolle aus.");
        return;
      }
      setStep("profile");
    } else if (step === "profile") {
      if (!profileData.fullName || !profileData.birthdate || !profileData.region) {
        setError("Bitte fülle alle Felder aus.");
        return;
      }
      if (profileData.role === "company") {
        setStep("contact");
      } else {
        setStep("summary");
      }
    } else if (step === "contact") {
      handleCompanyContact();
    } else if (step === "summary") {
      handleCompleteOnboarding();
    }
  };

  const prevStep = () => {
    if (step === "mode") {
      setStep("welcome");
    } else if (step === "auth") {
      setStep("mode");
    } else if (step === "profile") {
      setStep("role");
    } else if (step === "contact") {
      setStep("profile");
    } else if (step === "summary") {
      setStep("profile");
    }
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#07090f]">
      <Toast open={toastOpen} message={toastMsg} type={toastType} onClose={() => setToastOpen(false)} />

      {/* Glass Card Container */}
      <div className="relative z-10 max-w-2xl w-full">
        <AnimatePresence mode="wait">
          {/* Schritt 1: Willkommen */}
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="relative bg-white/10 backdrop-blur-[28px] backdrop-saturate-[180%] border border-white/10 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.75)] p-8 md:p-12 overflow-hidden">
                {/* Lichtkante */}
                <div className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_60%)] opacity-70 mix-blend-screen" />
                {/* Subtile Textur */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-15 mix-blend-soft-light"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(255,255,255,0.08) 60%, transparent 100%)",
                  }}
                />
                
                <div className="flex flex-col items-start gap-4 text-left">
                  <CardHeader 
                    title="JobBridge"
                    subtitle="Sichere Taschengeldjobs zwischen Jugendlichen und Auftraggebern."
                    spacing="tight"
                  />
                  <p className="text-base text-slate-200/80 max-w-md">
                    Plattform mit verifizierten Aufgaben, klaren Schritten und seniorenfreundlicher Bedienung.
                  </p>
                  <div className="pt-2 w-full">
                    <ButtonPrimary onClick={nextStep} className="w-full">Jetzt starten</ButtonPrimary>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

              {/* Schritt 2: Neu oder wiederkehrend */}
              {step === "mode" && (
                <motion.div
                  key="mode"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="relative bg-white/10 backdrop-blur-[28px] backdrop-saturate-[180%] border border-white/10 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.75)] p-8 md:p-12 overflow-hidden">
                    {/* Lichtkante */}
                    <div className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_60%)] opacity-70 mix-blend-screen" />
                    {/* Subtile Textur */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-15 mix-blend-soft-light"
                      style={{
                        backgroundImage:
                          "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(255,255,255,0.08) 60%, transparent 100%)",
                      }}
                    />
                    
                    <CardHeader 
                      title="Warst du schon bei JobBridge?"
                      subtitle="Damit wir dich richtig weiterleiten können."
                    />

                    {/* Choice Tiles */}
                    <div className="grid gap-4 mb-8">
                      <ChoiceTile
                        onClick={() => {
                          setMode("signup");
                          setError(null);
                        }}
                        selected={mode === "signup"}
                      >
                        <div className="space-y-1">
                          <div className="text-lg font-semibold text-white">Ich bin neu hier</div>
                          <div className="text-sm text-slate-300">Ich möchte ein neues Konto erstellen.</div>
                        </div>
                      </ChoiceTile>
                      <ChoiceTile
                        onClick={() => {
                          setMode("signin");
                          setError(null);
                        }}
                        selected={mode === "signin"}
                      >
                        <div className="space-y-1">
                          <div className="text-lg font-semibold text-white">Ich war schon hier</div>
                          <div className="text-sm text-slate-300">Ich habe bereits ein Konto.</div>
                        </div>
                      </ChoiceTile>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-4">
                      <ButtonSecondary onClick={prevStep} className="flex-1">
                        Zurück
                      </ButtonSecondary>
                      <ButtonPrimary onClick={nextStep} disabled={!mode} className="flex-1" loading={loading}>
                        Weiter
                      </ButtonPrimary>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Schritt 3: E-Mail & Passwort */}
              {step === "auth" && (
                <motion.div
                  key="auth"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="relative bg-white/10 backdrop-blur-[28px] backdrop-saturate-[180%] border border-white/10 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.75)] p-8 md:p-12 overflow-hidden">
                    {/* Lichtkante */}
                    <div className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_60%)] opacity-70 mix-blend-screen" />
                    {/* Subtile Textur */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-15 mix-blend-soft-light"
                      style={{
                        backgroundImage:
                          "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(255,255,255,0.08) 60%, transparent 100%)",
                      }}
                    />
                    
                    <CardHeader 
                      title="Dein Konto"
                      subtitle="Für Sicherheit und Identifikation erforderlich."
                    />
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    nextStep();
                  }}
                  className="space-y-6"
                >
                  <div>
                    <label className="mb-2 block text-lg font-medium text-white">
                      E-Mail-Adresse
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-white/20 bg-white/5 px-5 py-4 text-lg text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder="deine@email.de"
                      required
                    />
                    <p className="mt-2 text-sm text-slate-400">
                      Für Sicherheit und Identifikation erforderlich.
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block text-lg font-medium text-white">
                      Passwort
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-white/20 bg-white/5 px-5 py-4 text-lg text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder={mode === "signup" ? "Mindestens 6 Zeichen" : "Dein Passwort"}
                      required
                      minLength={mode === "signup" ? 6 : undefined}
                    />
                    <p className="mt-2 text-sm text-slate-400">
                      Schützt deinen Zugang.
                    </p>
                  </div>
                  {error && (
                    <div className="rounded-2xl border border-rose-400/50 bg-rose-500/20 px-5 py-4 text-rose-100">
                      {error}
                    </div>
                  )}
                  <div className="flex gap-4">
                    <ButtonSecondary onClick={prevStep} className="flex-1">
                      Zurück
                    </ButtonSecondary>
                    <ButtonPrimary type="submit" className="flex-1" loading={loading}>
                      {mode === "signup" ? "Registrieren" : "Anmelden"}
                    </ButtonPrimary>
                  </div>
                </form>
                  </div>
                </motion.div>
              )}

              {/* Schritt 4: E-Mail-Bestätigung */}
              {step === "email-confirm" && (
                <motion.div
                  key="email-confirm"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="relative bg-white/10 backdrop-blur-[28px] backdrop-saturate-[180%] border border-white/10 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.75)] p-8 md:p-12 overflow-hidden">
                    {/* Lichtkante */}
                    <div className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_60%)] opacity-70 mix-blend-screen" />
                    {/* Subtile Textur */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-15 mix-blend-soft-light"
                      style={{
                        backgroundImage:
                          "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(255,255,255,0.08) 60%, transparent 100%)",
                      }}
                    />
                    
                    <div className="text-center space-y-4 max-w-lg mx-auto">
                      <CardHeader 
                        title="Bitte bestätige deine E-Mail"
                        subtitle="Bestätige deine E-Mail, um fortzufahren."
                        showLogo
                        spacing="compact"
                      />
                      {emailConfirmed && (
                        <div className="rounded-2xl border border-green-400/50 bg-green-500/20 px-5 py-4 text-green-100">
                          E-Mail erfolgreich bestätigt! Du wirst weitergeleitet...
                        </div>
                      )}
                      {!emailConfirmed && (
                        <>
                          {loading && <Loader text="Session wird geprüft..." />}
                          <div className="space-y-4 mt-2">
                            <ButtonPrimary onClick={handleEmailConfirmation} loading={loading} className="w-full h-14 text-lg">
                              Weiter prüfen
                            </ButtonPrimary>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <ButtonSecondary onClick={handleResendConfirmation} className="w-full" disabled={resendCooldown > 0 || loading}>
                                {resendCooldown > 0 ? `Erneut senden (${resendCooldown}s)` : "Bestätigung erneut senden"}
                              </ButtonSecondary>
                              <ButtonSecondary
                                onClick={() => {
                                  setShowCodeForm((prev) => !prev);
                                  setCodeError(null);
                                  setCodeMessage(null);
                                }}
                                className="w-full"
                              >
                                Mit Code bestätigen
                              </ButtonSecondary>
                            </div>
                          </div>
                          {emailStatus && (
                            <p className="text-sm text-rose-200 mt-3">{emailStatus}</p>
                          )}
                          {resendMessage && (
                            <p className="text-sm text-slate-200/90 mt-2">{resendMessage}</p>
                          )}
                          {showCodeForm && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                              className="mt-5 space-y-4 rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl px-6 py-6 text-left shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
                            >
                              <div className="flex items-center justify-between">
                                <label className="text-base font-medium text-white/95">Bestätigungscode eingeben</label>
                              </div>
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                                <input
                                  type="text"
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(/[^0-9]/g, "");
                                    setCode(raw.slice(0, 8));
                                    setCodeError(null);
                                    setCodeMessage(null);
                                  }}
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  maxLength={11}
                                  className="flex-1 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-center text-lg tracking-[0.35em] text-white placeholder:text-slate-400 focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                                  placeholder="1234 5678"
                                  value={code.replace(/(\d{4})(?=\d)/g, "$1 ")}
                                  autoFocus
                                  disabled={codeLocked}
                                />
                                <ButtonSecondary onClick={handleVerifyCode} className="sm:w-40 h-12" disabled={loading || code.length < 8 || codeLocked}>
                                  Code prüfen
                                </ButtonSecondary>
                              </div>
                              {codeError && (
                                <p className="text-sm text-rose-200">{codeError}</p>
                              )}
                              {codeMessage && (
                                <p className="text-sm text-green-200">{codeMessage}</p>
                              )}
                            </motion.div>
                          )}
                        </>
                      )}
                      {error && (
                        <div className="rounded-2xl border border-rose-400/50 bg-rose-500/20 px-5 py-4 text-rose-100">
                          {error}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Schritt 5: Rollenwahl */}
              {step === "role" && (
                <motion.div
                  key="role"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="relative bg-white/10 backdrop-blur-[28px] backdrop-saturate-[180%] border border-white/10 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.75)] p-8 md:p-12 overflow-hidden">
                    {/* Lichtkante */}
                    <div className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_60%)] opacity-70 mix-blend-screen" />
                    {/* Subtile Textur */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-15 mix-blend-soft-light"
                      style={{
                        backgroundImage:
                          "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(255,255,255,0.08) 60%, transparent 100%)",
                      }}
                    />
                    
                    <CardHeader 
                      title="Welche Rolle passt zu dir?"
                    />

                    {/* Choice Tiles */}
                    <div className="flex flex-col gap-4 mb-8">
                      {[
                        {
                          value: "youth" as UserType,
                          title: "Jugendliche/r",
                          description: "Ich suche Taschengeldjobs",
                          icon: <Sparkles className="h-6 w-6 text-amber-300" />,
                        },
                        {
                          value: "adult" as UserType,
                          title: "Privatperson/Eltern/Anbieter",
                          description: "Ich möchte Aufträge vergeben",
                          icon: <HandHeart className="h-6 w-6 text-cyan-300" />,
                        },
                        {
                          value: "company" as UserType,
                          title: "Organisation/Unternehmen",
                          description: "Ich vertrete ein Unternehmen",
                          icon: <Building2 className="h-6 w-6 text-indigo-300" />,
                        },
                      ].map((role) => {
                        const active = profileData.role === role.value;
                        return (
                          <ChoiceTile
                            key={role.value}
                            onClick={() => {
                              setProfileData((prev) => ({ ...prev, role: role.value }));
                              setError(null);
                            }}
                            selected={active}
                          >
                            <div
                              className={`flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition shadow-inner ${active ? "border-cyan-200/70 bg-white/10 ring-1 ring-cyan-300/60 shadow-[0_0_30px_rgba(56,189,248,0.25)]" : "border-white/10 bg-white/5"}`}
                            >
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                                {role.icon}
                              </div>
                              <div className="space-y-1">
                                <div className="text-lg font-semibold text-white leading-tight">{role.title}</div>
                                <div className="text-sm text-slate-300 leading-snug">{role.description}</div>
                              </div>
                            </div>
                          </ChoiceTile>
                        );
                      })}
                    </div>

                    {/* Error Display */}
                    {error && (
                      <div className="mb-6 rounded-2xl border border-rose-400/50 bg-rose-500/20 px-5 py-4 text-rose-100 text-center">
                        {error}
                      </div>
                    )}

                    {/* Continue Button */}
                    <ButtonPrimary onClick={nextStep} disabled={!profileData.role} className="w-full">
                      Weiter
                    </ButtonPrimary>
                  </div>
                </motion.div>
              )}

              {/* Schritt 6: Profil-Daten */}
              {step === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="relative bg-white/10 backdrop-blur-[28px] backdrop-saturate-[180%] border border-white/10 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.75)] p-8 md:p-12 overflow-hidden">
                    {/* Lichtkante */}
                    <div className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_60%)] opacity-70 mix-blend-screen" />
                    {/* Subtile Textur */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-15 mix-blend-soft-light"
                      style={{
                        backgroundImage:
                          "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(255,255,255,0.08) 60%, transparent 100%)",
                      }}
                    />
                    
                    <CardHeader 
                      title="Erzähl uns etwas über dich"
                    />
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    nextStep();
                  }}
                  className="space-y-6"
                >
                  <div>
                    <label className="mb-2 block text-lg font-medium text-white">
                      Name
                    </label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, fullName: e.target.value }))
                      }
                      className="w-full rounded-2xl border border-white/20 bg-white/5 px-5 py-4 text-lg text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder="Max Mustermann"
                      required
                    />
                    <p className="mt-2 text-sm text-slate-400">
                      Damit wir dich korrekt ansprechen können.
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block text-lg font-medium text-white">
                      Geburtsdatum
                    </label>
                    <input
                      type="date"
                      value={profileData.birthdate}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, birthdate: e.target.value }))
                      }
                      className="w-full rounded-2xl border border-white/20 bg-white/5 px-5 py-4 text-lg text-white focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      required
                    />
                    <p className="mt-2 text-sm text-slate-400">
                      Erforderlich für Jugendschutz.
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block text-lg font-medium text-white">
                      Region / Stadt
                    </label>
                    {regionsLoading ? (
                      <div className="w-full rounded-2xl border border-white/20 bg-white/5 px-5 py-4 text-lg text-slate-400">
                        Regionen werden geladen...
                      </div>
                    ) : (
                      <select
                        value={profileData.region}
                        onChange={(e) =>
                          setProfileData((prev) => ({ ...prev, region: e.target.value }))
                        }
                        className="w-full rounded-2xl border border-white/20 bg-white/5 px-5 py-4 text-lg text-white focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        required
                      >
                        <option value="">Bitte wähle eine Region</option>
                        {regions.map((region) => (
                          <option key={region.id} value={region.name} className="bg-slate-900">
                            {region.name}
                          </option>
                        ))}
                      </select>
                    )}
                    <p className="mt-2 text-sm text-slate-400">
                      Damit wir dir passende Angebote zeigen können.
                    </p>
                    {regions.length === 0 && !regionsLoading && (
                      <p className="mt-2 text-sm text-amber-400">
                        Wenn deine Region nicht verfügbar ist, unterstützen wir sie noch nicht.
                      </p>
                    )}
                  </div>
                  {error && (
                    <div className="rounded-2xl border border-rose-400/50 bg-rose-500/20 px-5 py-4 text-rose-100">
                      {error}
                    </div>
                  )}
                  <div className="flex gap-4">
                    <ButtonSecondary onClick={prevStep} className="flex-1">
                      Zurück
                    </ButtonSecondary>
                    <ButtonPrimary type="submit" className="flex-1">
                      Weiter
                    </ButtonPrimary>
                  </div>
                </form>
                  </div>
                </motion.div>
              )}

              {/* Schritt 7: Company-Kontakt */}
              {step === "contact" && (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="relative bg-white/10 backdrop-blur-[28px] backdrop-saturate-[180%] border border-white/10 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.75)] p-8 md:p-12 overflow-hidden">
                    {/* Lichtkante */}
                    <div className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_60%)] opacity-70 mix-blend-screen" />
                    {/* Subtile Textur */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-15 mix-blend-soft-light"
                      style={{
                        backgroundImage:
                          "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(255,255,255,0.08) 60%, transparent 100%)",
                      }}
                    />
                    
                    <CardHeader 
                      title="Kontaktiere uns"
                      subtitle="Für Unternehmen schalten wir Zugänge manuell frei."
                    />
                  {isSaving ? (
                    <Loader text="Wird gespeichert..." />
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleCompanyContact();
                      }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="mb-2 block text-lg font-medium text-white">
                          Firmenname / Organisation
                        </label>
                        <input
                          type="text"
                          value={profileData.companyName}
                          onChange={(e) =>
                            setProfileData((prev) => ({ ...prev, companyName: e.target.value }))
                          }
                          className="w-full rounded-2xl border border-white/20 bg-white/5 px-5 py-4 text-lg text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          placeholder="Musterfirma GmbH"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-lg font-medium text-white">
                          E-Mail-Adresse
                        </label>
                        <input
                          type="email"
                          value={profileData.companyEmail}
                          onChange={(e) =>
                            setProfileData((prev) => ({ ...prev, companyEmail: e.target.value }))
                          }
                          className="w-full rounded-2xl border border-white/20 bg-white/5 px-5 py-4 text-lg text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          placeholder="kontakt@firma.de"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-lg font-medium text-white">
                          Nachricht
                        </label>
                        <textarea
                          value={profileData.companyMessage}
                          onChange={(e) =>
                            setProfileData((prev) => ({ ...prev, companyMessage: e.target.value }))
                          }
                          rows={5}
                          className="w-full rounded-2xl border border-white/20 bg-white/5 px-5 py-4 text-lg text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          placeholder="Erzähl uns kurz, was du suchst oder anbietest..."
                          required
                        />
                      </div>
                      {error && (
                        <div className="rounded-2xl border border-rose-400/50 bg-rose-500/20 px-5 py-4 text-rose-100">
                          {error}
                          <button
                            onClick={handleCompanyContact}
                            className="mt-2 text-sm underline text-rose-200 hover:text-rose-100"
                          >
                            Noch einmal versuchen
                          </button>
                        </div>
                      )}
                      <div className="flex gap-4">
                        <ButtonSecondary onClick={prevStep} className="flex-1">
                          Zurück
                        </ButtonSecondary>
                        <ButtonPrimary type="submit" className="flex-1" loading={isSaving}>
                          Absenden
                        </ButtonPrimary>
                      </div>
                      <div className="text-center text-sm text-slate-400">
                        Oder schreibe uns direkt an:{" "}
                        <a
                          href={`mailto:${CONTACT_EMAIL}`}
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          {CONTACT_EMAIL}
                        </a>
                      </div>
                    </form>
                  )}
                  </div>
                </motion.div>
              )}

              {/* Schritt 8: Zusammenfassung */}
              {step === "summary" && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="relative bg-white/10 backdrop-blur-[28px] backdrop-saturate-[180%] border border-white/10 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.75)] p-8 md:p-12 overflow-hidden">
                    {/* Lichtkante */}
                    <div className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_60%)] opacity-70 mix-blend-screen" />
                    {/* Subtile Textur */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-15 mix-blend-soft-light"
                      style={{
                        backgroundImage:
                          "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(255,255,255,0.08) 60%, transparent 100%)",
                      }}
                    />
                    
                    <CardHeader 
                      title="Überblick vor dem Start"
                      subtitle="So sehen Auftraggeber dein Profil auf den ersten Blick."
                    />
                  {isSaving ? (
                    <Loader text="Wird gespeichert..." />
                  ) : (
                    <>
                      <div className="space-y-3 text-left">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-300/80">Übersicht</p>
                        <div className="glass-card rounded-2xl border border-white/20 bg-white/5 p-7 space-y-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-sm text-slate-400">Rolle</div>
                              <div className="text-xl font-semibold text-white">
                                {profileData.role === "youth" && "Jobsuchende/r (unter 18)"}
                                {profileData.role === "adult" && "Jobanbieter (ab 18)"}
                                {profileData.role === "company" && "Unternehmen / Organisation"}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setStep("profile")}
                              className="text-sm text-cyan-200 underline-offset-4 hover:underline"
                            >
                              Bearbeiten
                            </button>
                          </div>
                          <div>
                            <div className="text-sm text-slate-400">Name</div>
                            <div className="text-xl font-semibold text-white">{profileData.fullName}</div>
                          </div>
                          <div>
                            <div className="text-sm text-slate-400">Region</div>
                            <div className="text-xl font-semibold text-white">{profileData.region}</div>
                          </div>
                        </div>
                      </div>
                      {error && (
                        <div className="rounded-2xl border border-rose-400/50 bg-rose-500/20 px-5 py-4 text-rose-100">
                          {error}
                          <button
                            onClick={handleCompleteOnboarding}
                            className="mt-2 text-sm underline text-rose-200 hover:text-rose-100"
                          >
                            Noch einmal versuchen
                          </button>
                        </div>
                      )}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <ButtonSecondary onClick={() => setStep("profile")}>Daten bearbeiten</ButtonSecondary>
                        <ButtonPrimary onClick={handleCompleteOnboarding} className="sm:w-40" loading={isSaving}>
                          Start
                        </ButtonPrimary>
                      </div>
                    </>
                  )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

      </div>
    </div>
  );
}
