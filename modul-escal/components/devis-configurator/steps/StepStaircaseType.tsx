"use client";

import { useState } from "react";
import { InfoIcon } from "@phosphor-icons/react";

import { useAsset } from "@/lib/asset";
import { useKreConfig, type KreConfig } from "@/lib/config";
import type { Messages } from "@/lib/i18n";
import { useT } from "@/lib/i18n/useT";
import { buttonClass } from "../ui/Button";
import { OptionCard } from "../ui/OptionCard";
import { StepHeader } from "../ui/Typography";

function CasePhoto({ src, label }: { src: string; label: string }) {
  const [failed, setFailed] = useState(false);
  const asset = useAsset();
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-muted-bg">
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={asset(src)}
          alt={label}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}

/**
 * Étape 1 — le kit ne couvre pour l'instant que les escaliers fermés (demande
 * Escal Concept). « Fermé », seul choix, est présélectionné (valeur par défaut
 * du formulaire) ; un autre escalier mène à une demande de recontact.
 */
export function StepStaircaseType() {
  const config = useKreConfig();
  const { m } = useT();
  const s = m.steps.staircaseType;

  return (
    <div className="space-y-7">
      <StepHeader title={s.title} subtitle={s.subtitle} />

      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
        <OptionCard
          selected
          // Seul choix possible : la carte reste sélectionnée.
          aria-disabled
          className="flex cursor-default flex-col overflow-hidden text-left"
        >
          <CasePhoto src="/escalier/ferme.webp" label={s.closed.label} />
          <span className="flex flex-col gap-1 px-[18px] pb-[18px] pt-4">
            <span className="text-base font-bold text-heading">{s.closed.label}</span>
            <span className="text-sm leading-normal text-muted">
              {s.closed.description}
            </span>
          </span>
        </OptionCard>

        <div className="flex items-start gap-3.5 border border-primary/35 bg-tint px-5 py-[18px]">
          <InfoIcon aria-hidden className="size-[22px] shrink-0 text-primary" />
          <div>
            <p className="text-[14.5px] font-bold text-heading">{s.otherTitle}</p>
            <p className="mt-1 text-sm leading-normal text-muted">{s.otherBody}</p>
            <a
              href={otherStaircaseHref(config, m)}
              className={`${buttonClass("secondary", "sm")} mt-4 bg-surface`}
            >
              {s.otherCta}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Destination de « Être recontacté » : le formulaire désigné par l'attribut
 * `open-staircase-url`, sinon un e-mail pré-rempli.
 */
function otherStaircaseHref(config: KreConfig, m: Messages): string {
  if (config.openStaircaseUrl) return config.openStaircaseUrl;
  const to = config.recipientEmail || m.app.supportEmail;
  const { otherContactSubject, otherContactBody } = m.steps.staircaseType;
  return `mailto:${to}?subject=${encodeURIComponent(
    otherContactSubject,
  )}&body=${encodeURIComponent(otherContactBody)}`;
}
