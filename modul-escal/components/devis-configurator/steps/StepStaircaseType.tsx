"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { useAsset } from "@/lib/asset";
import { useT } from "@/lib/i18n/useT";
import { useFieldError } from "@/lib/useFieldError";
import type { QuoteFormDraft, StaircaseType } from "@/lib/quote-schema";
import { StepTitle } from "../ui/Typography";

const PHOTOS: Record<StaircaseType, string> = {
  CLOSED: "/escalier/ferme.webp",
  OPEN: "/escalier/ouvert.webp",
};

function CasePhoto({ src, label }: { src: string; label: string }) {
  const [failed, setFailed] = useState(false);
  const asset = useAsset();
  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-background to-muted-bg">
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
      {failed && (
        <span className="text-4xl" aria-hidden>
          🪜
        </span>
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
    <div className="space-y-6">
      <div className="space-y-2">
        <StepTitle align="left">{m.steps.staircaseType.title}</StepTitle>
        <p className="text-sm text-muted">{m.steps.staircaseType.subtitle}</p>
      </div>

      <fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <legend className="sr-only">{m.steps.staircaseType.subtitle}</legend>
        {choices.map((choice) => {
          const selected = value === choice.value;
          return (
            <button
              key={choice.value}
              type="button"
              onClick={() => select(choice.value)}
              aria-pressed={selected}
              className={`relative overflow-hidden rounded-xl border-2 p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:p-4 ${
                selected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/25"
                  : "border-border bg-surface shadow-sm transition-shadow hover:-translate-y-[3px] hover:border-brand-medium/35 hover:shadow-lg"
              }`}
            >
              {selected && (
                <span className="absolute right-3 top-3 z-10 flex size-6 items-center justify-center rounded-full bg-success text-white shadow-sm">
                  <Check className="size-3.5 stroke-[3]" aria-hidden />
                </span>
              )}
              <CasePhoto src={PHOTOS[choice.value]} label={choice.label} />
              <span className="mt-3 block text-base font-semibold text-brand">
                {choice.label}
              </span>
              <span className="mt-1 block text-sm text-muted">
                {choice.description}
              </span>
            </button>
          );
        })}
      </fieldset>

      {/* Cas spécifique : escalier ouvert → information uniquement */}
      {value === "OPEN" && (
        <div
          className="rounded-lg border border-warning bg-warning-tint p-4"
          role="status"
        >
          <p className="text-sm font-semibold text-brand">
            {m.steps.staircaseType.openWarningTitle}
          </p>
          <p className="mt-1 text-sm text-brand">
            {m.steps.staircaseType.openWarningBody}
          </p>
        </div>
      )}

      {error && value !== "OPEN" && (
        <p className="text-center text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
