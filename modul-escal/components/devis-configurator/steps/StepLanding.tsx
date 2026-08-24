"use client";

import { Check } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { useT } from "@/lib/i18n/useT";
import { useFieldError } from "@/lib/useFieldError";
import type {
  QuoteFormDraft,
  LandingFinish,
  SeuilColor,
} from "@/lib/quote-schema";

/** Pastilles de couleur du seuil — données, libellés dans `catalog.seuilColor`. */
const SEUIL_COLOR_HEX: Record<SeuilColor, string> = {
  OR: "#C9A84C",
  NOIR: "#1C1C1C",
  ALUMINIUM: "#A8A9AD",
};

const SEUIL_COLORS: SeuilColor[] = ["OR", "NOIR", "ALUMINIUM"];

export function StepLanding() {
  const { watch, setValue } = useFormContext<QuoteFormDraft>();
  const landingFinish = watch("landingFinish");
  const seuilColor = watch("seuilColor");
  const finishError = useFieldError("landingFinish");
  const seuilError = useFieldError("seuilColor");
  const { m } = useT();

  const choices: Array<{
    value: LandingFinish;
    label: string;
    description: string;
    note: string;
  }> = [
    { value: "NEZ_SEUIL", ...m.steps.landing.nezSeuil },
    { value: "NEZ_RACCORD_PARQUET", ...m.steps.landing.nezRaccordParquet },
  ];

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
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold tracking-tight text-heading sm:text-2xl">
          {m.steps.landing.title}
        </h2>
        <p className="text-sm text-muted">{m.steps.landing.subtitle}</p>
      </div>

      <fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                  : "border-border bg-surface hover:border-primary/30"
              }`}
            >
              {isActive && (
                <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="size-3.5 stroke-[3]" aria-hidden />
                </span>
              )}
              <span className="block pr-8 text-sm font-semibold text-brand">
                {choice.label}
              </span>
              <span className="mt-1 block text-xs text-muted">
                {choice.description}
              </span>
              <span className="mt-2 block text-xs italic text-primary/80">
                {choice.note}
              </span>
            </button>
          );
        })}
      </fieldset>

      {finishError && (
        <p className="text-center text-sm text-red-600" role="alert">
          {finishError}
        </p>
      )}

      {/* Choix couleur seuil — uniquement pour NEZ_SEUIL */}
      {landingFinish === "NEZ_SEUIL" && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-brand">
            {m.steps.landing.seuilColorLabel}
          </legend>
          <div className="flex flex-wrap gap-3">
            {SEUIL_COLORS.map((id) => {
              const active = seuilColor === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSeuilColor(id)}
                  aria-pressed={active}
                  className={`flex items-center gap-2.5 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    active
                      ? "border-primary bg-primary/5 text-brand ring-2 ring-primary/25"
                      : "border-border bg-surface text-muted hover:border-brand-medium/35"
                  }`}
                >
                  <span
                    className="size-4 shrink-0 rounded-full border border-black/10"
                    style={{ backgroundColor: SEUIL_COLOR_HEX[id] }}
                    aria-hidden
                  />
                  {m.catalog.seuilColor[id]}
                  {active && (
                    <Check
                      className="ml-1 size-3.5 stroke-[3] text-emerald-500"
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </div>
          {seuilError && (
            <p className="text-sm text-red-600" role="alert">
              {seuilError}
            </p>
          )}
        </fieldset>
      )}
    </div>
  );
}
