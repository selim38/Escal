"use client";

import { useFormContext } from "react-hook-form";

import { createDefaultStepConfig, ensureStepConfigs } from "@/lib/step-config";
import type { QuoteFormDraft, StepConfigDraft } from "@/lib/quote-schema";

export function StepOptions() {
  const { watch, setValue } = useFormContext<QuoteFormDraft>();
  const stepCount = watch("stepCount") ?? 1;
  const stepConfigs = watch("stepConfigs") ?? [];

  const configs: StepConfigDraft[] = ensureStepConfigs(stepConfigs, stepCount);

  const toggle = (index: number) => {
    const next = [...configs];
    next[index] = { ...next[index], openSide: !next[index].openSide };
    setValue("stepConfigs", next, { shouldValidate: true, shouldDirty: true });
    // synchronise le champ global openSides
    setValue("openSides", next.some((c) => c.openSide), { shouldValidate: true });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold tracking-tight text-[#1e2a4a] sm:text-2xl">
          Options &amp; Embouts
        </h2>
        <p className="text-sm text-muted">
          Précisez la configuration pour affiner l'estimation.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-brand">
          Côté(s) ouvert(s) — sélectionnez les marches concernées
        </p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: stepCount }, (_, i) => {
            const isOpen = configs[i]?.openSide ?? false;
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggle(i)}
                className={`flex size-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                  isOpen
                    ? "bg-primary text-white shadow-sm"
                    : "border border-border bg-surface text-muted hover:border-brand-medium/40"
                }`}
                aria-pressed={isOpen}
                aria-label={`Marche ${i + 1} — côté ${isOpen ? "ouvert" : "fermé"}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {configs.some((c) => c.openSide) && (
          <p className="text-xs text-primary">
            {configs.filter((c) => c.openSide).length} marche
            {configs.filter((c) => c.openSide).length > 1 ? "s" : ""} avec côté ouvert
          </p>
        )}
      </div>
    </div>
  );
}
