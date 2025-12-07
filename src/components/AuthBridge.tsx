"use client";

import type { AuthState } from "@/lib/auth";
import { OnboardingWizard } from "./OnboardingWizard";

type AuthBridgeProps = {
  authState: AuthState;
};

export default function AuthBridge({ authState }: AuthBridgeProps) {
  if (authState.state === "no-session") {
    return <OnboardingWizard initialProfile={null} />;
  }

  if (authState.state === "email-unconfirmed") {
    return (
      <OnboardingWizard
        initialProfile={authState.profile}
        forcedStep="email-confirm"
        initialEmail={authState.session.user.email ?? ""}
      />
    );
  }

  if (authState.state === "incomplete-profile") {
    return (
      <OnboardingWizard
        initialProfile={authState.profile}
        initialEmail={authState.session.user.email ?? ""}
      />
    );
  }

  // "ready" wird bereits in den Server-Komponenten umgeleitet
  return null;
}
