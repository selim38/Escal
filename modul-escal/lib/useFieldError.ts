"use client";

import { useFormContext } from "react-hook-form";

import { useT } from "@/lib/i18n/useT";
import { resolveMessage } from "@/lib/i18n/validation";
import type { QuoteFormDraft } from "@/lib/quote-schema";

/**
 * Message d'erreur traduit pour un champ du formulaire.
 *
 * Point d'entrée unique : les schémas zod émettent des clés `validation.*`
 * (voir lib/i18n/validation.ts), la traduction se fait ici.
 */
export function useFieldError(
  name: keyof QuoteFormDraft,
): string | undefined {
  const { formState } = useFormContext<QuoteFormDraft>();
  const { m } = useT();
  const raw = formState.errors[name]?.message;
  return resolveMessage(m, typeof raw === "string" ? raw : undefined);
}
