"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RoleOverrideExpiryWatcher({ overrideExpiresAt }: { overrideExpiresAt?: string | null }) {
  const router = useRouter();

  useEffect(() => {
    if (!overrideExpiresAt) return;

    const expiresMs = new Date(overrideExpiresAt).getTime();
    if (!Number.isFinite(expiresMs)) return;

    const msLeft = expiresMs - Date.now();
    if (msLeft <= 0) {
      router.refresh();
      return;
    }

    const t = setTimeout(() => {
      router.refresh();
    }, msLeft + 250);

    return () => clearTimeout(t);
  }, [overrideExpiresAt, router]);

  return null;
}

