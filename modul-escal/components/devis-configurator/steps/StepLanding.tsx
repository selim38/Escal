"use client";

import { Check } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { useAsset } from "@/lib/asset";
import { useT } from "@/lib/i18n/useT";
import { useFieldError } from "@/lib/useFieldError";
import type {
  QuoteFormDraft,
  LandingFinish,
  SeuilColor,
} from "@/lib/quote-schema";
import { StepTitle } from "../ui/Typography";

/** Pastilles de couleur du seuil — données, libellés dans `catalog.seuilColor`. */
const SEUIL_COLOR_HEX: Record<SeuilColor, string> = {
  OR: "#C9A84C",
  NOIR: "#1C1C1C",
  ALUMINIUM: "#A8A9AD",
};

const SEUIL_COLORS: SeuilColor[] = ["OR", "NOIR", "ALUMINIUM"];

/** Photo d'un seuil posé, par couleur — sous `public/seuil/`. */
const SEUIL_PHOTO: Record<SeuilColor, string> = {
  OR: "/seuil/or.webp",
  NOIR: "/seuil/noir.webp",
  ALUMINIUM: "/seuil/aluminium.webp",
};

export function StepLanding() {
  const { watch, setValue } = useFormContext<QuoteFormDraft>();
  const landingFinish = watch("landingFinish");
  const seuilColor = watch("seuilColor");
  const finishError = useFieldError("landingFinish");
  const seuilError = useFieldError("seuilColor");
  const { m, t } = useT();
  const asset = useAsset();

  const choices: Array<{
    value: LandingFinish;
    label: string;
    description: string;
  }> = [{ value: "NEZ_SEUIL", ...m.steps.landing.nezSeuil }];

  const setLanding = (next: LandingFinish) => {
    setValue("landingFinish", next, { shouldValidate: true, shouldDirty: true });
    setValue("intermediateLanding", true, {
      shouldValidate: true,
      shouldDirty: true,
    });
    if (next !== "NEZ_SEUIL") {
      setValue("seuilColor", undefined, { shouldValidate: true });
    }
  };

  const setSeuilColor = (color: SeuilColor) => {
    setValue("seuilColor", color, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <StepTitle align="left">{m.steps.landing.title}</StepTitle>
        <p className="text-sm text-muted">{m.steps.landing.subtitle}</p>
      </div>

      <fieldset
        className={`grid grid-cols-1 gap-3 ${choices.length > 1 ? "sm:grid-cols-2" : ""}`}
      >
        <legend className="sr-only">{m.steps.landing.subtitle}</legend>
        {choices.map((choice) => {
          const isActive = landingFinish === choice.value;
          return (
            <button
              key={choice.value}
              type="button"
              onClick={() => setLanding(choice.value)}
              aria-pressed={isActive}
              className={`relative w-full rounded-xl border-2 p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                isActive
                  ? "border-primary bg-primary/5 ring-2 ring-primary/25"
                  : "border-border bg-surface shadow-sm hover:-translate-y-[3px] hover:border-primary/30 hover:shadow-lg"
              }`}
            >
              {isActive && (
                <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-success text-white">
                  <Check className="size-3.5 stroke-[3]" aria-hidden />
                </span>
              )}
              <span className="block pr-8 text-sm font-semibold text-brand">
                {choice.label}
              </span>
              <span className="mt-1 block text-xs text-muted">
                {choice.description}
              </span>
            </button>
          );
        })}
      </fieldset>

      {finishError && (
        <p className="text-center text-sm text-error" role="alert">
          {finishError}
        </p>
      )}

      {/* Choix couleur seuil — uniquement pour NEZ_SEUIL */}
      {landingFinish === "NEZ_SEUIL" && (
        <fieldset className="space-y-3">
          <legend className="text-[13px] font-bold tracking-[0.01em] text-heading">
            {m.steps.landing.seuilColorLabel}
          </legend>
          <div className="grid grid-cols-3 gap-3">
            {SEUIL_COLORS.map((id) => {
              const active = seuilColor === id;
              const label = m.catalog.seuilColor[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSeuilColor(id)}
                  aria-pressed={active}
                  className={`overflow-hidden rounded-xl border-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    active
                      ? "border-primary bg-primary/5 text-brand ring-2 ring-primary/25"
                      : "border-border bg-surface text-muted hover:border-brand-medium/35"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(SEUIL_PHOTO[id])}
                    alt={t(m.steps.landing.seuilPhotoAlt, { color: label })}
                    loading="lazy"
                    decoding="async"
                    width={480}
                    height={640}
                    className="block aspect-[3/4] w-full object-cover"
                  />
                  <span className="flex items-center justify-center gap-2 px-2 py-2">
                    <span
                      className="size-3.5 shrink-0 rounded-full border border-black/10"
                      style={{ backgroundColor: SEUIL_COLOR_HEX[id] }}
                      aria-hidden
                    />
                    {label}
                    {active && (
                      <Check
                        className="size-3.5 stroke-[3] text-success"
                        aria-hidden
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          {seuilError && (
            <p className="text-sm text-error" role="alert">
              {seuilError}
            </p>
          )}
        </fieldset>
      )}
    </div>
  );
}
