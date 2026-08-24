"use client";

import { useMemo } from "react";

import { useKreConfig } from "@/lib/config";
import { getMessages, interpolate, type Messages } from "@/lib/i18n";

export type Translator = {
  /** Dictionnaire complet, pour accès direct typé : `m.steps.decor.title`. */
  m: Messages;
  /** Interpolation : `t(m.steps.count.label, { count: 3 })`. */
  t: (template: string, vars?: Record<string, string | number>) => string;
};

/** Accès aux chaînes traduites selon la locale configurée sur l'instance. */
export function useT(): Translator {
  const { locale } = useKreConfig();
  return useMemo(
    () => ({ m: getMessages(locale), t: interpolate }),
    [locale],
  );
}
