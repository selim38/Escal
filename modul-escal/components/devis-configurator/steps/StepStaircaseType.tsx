"use client";

import { useState } from "react";
import { InfoIcon } from "@phosphor-icons/react";
import { useFormContext } from "react-hook-form";

import { useAsset } from "@/lib/asset";
import { useT } from "@/lib/i18n/useT";
import { useFieldError } from "@/lib/useFieldError";
import type { QuoteFormDraft, StaircaseType } from "@/lib/quote-schema";
import { FieldError } from "../ui/Field";
import { OptionCard } from "../ui/OptionCard";
import { StepHeader } from "../ui/Typography";

const PHOTOS: Record<StaircaseType, string> = {
  CLOSED: "/escalier/ferme.webp",
  OPEN: "/escalier/ouvert.webp",
};

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

export function StepStaircaseType() {
  const { watch, setValue } = useFormContext<QuoteFormDraft>();
  const value = watch("staircaseType");
  const error = useFieldError("staircaseType");
  const { m } = useT();

  const choices: Array<{
    value: StaircaseType;
    label: string;
    description: string;
  }> = [
    {
      value: "CLOSED",
      label: m.steps.staircaseType.closed.label,
      description: m.steps.staircaseType.closed.description,
    },
    {
      value: "OPEN",
      label: m.steps.staircaseType.open.label,
      description: m.steps.staircaseType.open.description,
    },
  ];

  const select = (v: StaircaseType) => {
    setValue("staircaseType", v, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-7">
      <StepHeader
        title={m.steps.staircaseType.title}
        subtitle={m.steps.staircaseType.subtitle}
      />

      <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <legend className="sr-only">{m.steps.staircaseType.subtitle}</legend>
        {choices.map((choice) => (
          <OptionCard
            key={choice.value}
            selected={value === choice.value}
            onClick={() => select(choice.value)}
            className="flex flex-col overflow-hidden text-left"
          >
            <CasePhoto src={PHOTOS[choice.value]} label={choice.label} />
            <span className="flex flex-col gap-1 px-[18px] pb-[18px] pt-4">
              <span className="text-base font-bold text-heading">
                {choice.label}
              </span>
              <span className="text-sm leading-normal text-muted">
                {choice.description}
              </span>
            </span>
          </OptionCard>
        ))}
      </fieldset>

      {/*
        Cas spécifique : escalier ouvert. Le tunnel s'arrête ici — l'icône Info
        affirme visuellement l'impasse, et le bouton « Suivant » devient
        « Être recontacté » (voir StepNavigation).
      */}
      {value === "OPEN" && (
        <div
          className="flex items-start gap-3.5 border border-primary/35 bg-tint px-5 py-[18px]"
          role="status"
        >
          <InfoIcon aria-hidden className="size-[22px] shrink-0 text-primary" />
          <div>
            <p className="text-[14.5px] font-bold text-heading">
              {m.steps.staircaseType.openWarningTitle}
            </p>
            <p className="mt-1 text-sm leading-normal text-muted">
              {m.steps.staircaseType.openWarningBody}
            </p>
          </div>
        </div>
      )}

      {value !== "OPEN" ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}
