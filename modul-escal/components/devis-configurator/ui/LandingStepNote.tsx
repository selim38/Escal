"use client";

import { InfoIcon } from "@phosphor-icons/react";

import { useT } from "@/lib/i18n/useT";

/**
 * Rappel aux étapes Dimensions et Embouts : la dernière marche comptée est la
 * marche palière (seuil + nez de marche d'un seul morceau), elle n'est donc pas
 * à configurer.
 */
export function LandingStepNote({ stepCount }: { stepCount: number | undefined }) {
  const { m, t } = useT();
  if (!stepCount) return null;
  return (
    <p className="flex items-start gap-2.5 border-l-2 border-primary bg-tint px-4 py-3 text-[13.5px] leading-snug text-heading">
      <InfoIcon aria-hidden className="mt-px size-[18px] shrink-0 text-primary" />
      <span>{t(m.landingStep.note, { index: stepCount })}</span>
    </p>
  );
}
