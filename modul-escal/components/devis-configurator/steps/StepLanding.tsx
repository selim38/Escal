"use client";

import { Check } from "lucide-react";
import { useFormContext } from "react-hook-form";

import type { QuoteFormDraft, LandingFinish, SeuilColor } from "@/lib/quote-schema";

const SEUIL_COLORS: Array<{ value: SeuilColor; label: string; hex: string }> = [
  { value: "OR",        label: "Or",        hex: "#C9A84C" },
  { value: "NOIR",      label: "Noir",      hex: "#1C1C1C" },
  { value: "ALUMINIUM", label: "Aluminium", hex: "#A8A9AD" },
];

const CHOICES: Array<{
  value: LandingFinish;
  label: string;
  description: string;
  note: string;
}> = [
  {
    value: "NEZ_SEUIL",
    label: "Nez + seuil",
    description: "Nez de marche avec seuil décoratif pour finir le palier.",
    note: "À choisir si vous ne prenez pas le parquet chez nous.",
  },
  {
    value: "NEZ_RACCORD_PARQUET",
    label: "Nez de raccord parquet",
    description: "Nez de raccord fourni avec votre commande de parquet.",
    note: "Inclus automatiquement si vous prenez le parquet chez nous.",
  },
];

export function StepLanding() {
  const { watch, setValue, formState } = useFormContext<QuoteFormDraft>();
  const landingFinish = watch("landingFinish");
  const seuilColor = watch("seuilColor");

  const setLanding = (next: LandingFinish) => {
    setValue("landingFinish", next, { shouldValidate: true, shouldDirty: true });
    setValue("intermediateLanding", true, { shouldValidate: true, shouldDirty: true });
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
        <h2 className="text-xl font-bold tracking-tight text-[#1e2a4a] sm:text-2xl">
          Marche palière
        </h2>
        <p className="text-sm text-muted">
          Choisissez le type de finition pour votre marche palière.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CHOICES.map((choice) => {
          const isActive = landingFinish === choice.value;
          return (
            <button
              key={choice.value}
              type="button"
              onClick={() => setLanding(choice.value)}
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
      </div>

      {formState.errors.landingFinish?.message && (
        <p className="text-center text-sm text-red-600" role="alert">
          {formState.errors.landingFinish.message}
        </p>
      )}

      {/* Choix couleur seuil — uniquement pour NEZ_SEUIL */}
      {landingFinish === "NEZ_SEUIL" && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-brand">Couleur du seuil</p>
          <div className="flex flex-wrap gap-3">
            {SEUIL_COLORS.map((c) => {
              const active = seuilColor === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setSeuilColor(c.value)}
                  className={`flex items-center gap-2.5 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    active
                      ? "border-primary bg-primary/5 ring-2 ring-primary/25 text-brand"
                      : "border-border bg-surface text-muted hover:border-brand-medium/35"
                  }`}
                >
                  <span
                    className="size-4 shrink-0 rounded-full border border-black/10"
                    style={{ backgroundColor: c.hex }}
                    aria-hidden
                  />
                  {c.label}
                  {active && <Check className="ml-1 size-3.5 stroke-[3] text-emerald-500" aria-hidden />}
                </button>
              );
            })}
          </div>
          {formState.errors.seuilColor?.message && (
            <p className="text-sm text-red-600" role="alert">
              {formState.errors.seuilColor.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
