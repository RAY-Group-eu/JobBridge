"use client";

import { ReactNode } from "react";
import { LogoBadge } from "./LogoBadge";

type WizardStepProps = {
  children: ReactNode;
  showLogo?: boolean;
};

export function WizardStep({ children, showLogo = false }: WizardStepProps) {
  return (
    <div className="space-y-8">
      {showLogo && (
        <div className="flex items-center justify-center pb-6">
          <LogoBadge size="sm" />
        </div>
      )}
      {children}
    </div>
  );
}

