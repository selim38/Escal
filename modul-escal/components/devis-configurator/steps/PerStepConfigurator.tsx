"use client";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import {
  createDefaultStepConfig,
  ensureStepConfigs,
  type DimensionField,
  type StepConfigDraft,
} from "@/lib/step-config";
import { STAIR_LAYOUT_OPTIONS } from "@/lib/stair-layout-catalog";
import type { QuoteFormDraft, StairLayout } from "@/lib/quote-schema";
import { DEPTH_BAND_VALUES, WIDTH_BAND_VALUES } from "@/lib/quote-schema";
import { useT } from "@/lib/i18n/useT";
import { useFieldError } from "@/lib/useFieldError";

import { StepTreadPhotos } from "./StepTreadPhotos";

/**
 * Repli stable pour `watch("stepConfigs")`. Un `?? []` littéral créerait un
 * tableau neuf à chaque rendu, ce qui relancerait l'effet de normalisation en
 * boucle.
 */
const NO_STEP_CONFIGS: StepConfigDraft[] = [];

export function PerStepConfigurator() {
  const { watch, setValue } = useFormContext<QuoteFormDraft>();
  const stepCount = watch("stepCount") ?? 1;
  const stepConfigs = watch("stepConfigs") ?? NO_STEP_CONFIGS;
  const [requestedIndex, setActiveIndex] = useState(0);
  const [focusedField, setFocusedField] = useState<DimensionField | null>(null);
  const { m, t } = useT();

  const rootError = useFieldError("stepConfigs");

  // L'index actif est borné au rendu plutôt que corrigé par un `setState` dans
  // un effet : si l'utilisateur réduit le nombre de marches à l'étape 4, l'index
  // mémorisé peut dépasser. Dériver évite un rendu en cascade.
  const activeIndex = Math.min(requestedIndex, Math.max(0, stepCount - 1));

  // Aligne la longueur du tableau de configurations sur le nombre de marches.
  useEffect(() => {
    const next = ensureStepConfigs(stepConfigs, stepCount);
    if (next.length !== stepConfigs.length) {
      setValue("stepConfigs", next, { shouldValidate: true });
    }
  }, [setValue, stepConfigs, stepCount]);

  const current: StepConfigDraft =
    stepConfigs[activeIndex] ?? createDefaultStepConfig();
  const layout: StairLayout = current.layout ?? "STRAIGHT";

  const updateStep = (patch: Partial<StepConfigDraft>) => {
    const next = [...ensureStepConfigs(stepConfigs, stepCount)];
    next[activeIndex] = { ...next[activeIndex], ...patch };
    setValue("stepConfigs", next, { shouldValidate: true, shouldDirty: true });
  };

  const selectLayout = (nextLayout: StairLayout) => {
    updateStep({ layout: nextLayout });
    setFocusedField(null);
  };

  const widthLabel =
    layout === "BALANCED"
      ? m.steps.perStep.lengthBalanced
      : layout === "FIVE_SIDED"
        ? m.steps.perStep.lengthFiveSided
        : m.catalog.dimensionField.widthBand;

  const depthLabel =
    layout === "FIVE_SIDED"
      ? m.steps.perStep.depthFiveSided
      : m.catalog.dimensionField.depthBand;

  return (
    <div className="space-y-6 border-t border-border pt-8">
      <div className="text-center">
        <p className="text-sm font-medium text-brand">{m.steps.perStep.intro}</p>
        <p className="mt-1 text-xs text-muted">{m.steps.perStep.hint}</p>
      </div>

      <div className="flex flex-nowrap items-center justify-center gap-3 overflow-x-auto sm:flex-wrap sm:gap-2">
        {Array.from({ length: stepCount }, (_, i) => {
          const cfg = stepConfigs[i];
          const complete = cfg?.layout && cfg?.widthBand && cfg?.depthBand;
          const isActive = i === activeIndex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                setActiveIndex(i);
                setFocusedField(null);
              }}
              className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:size-9 ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : complete
                    ? "border-2 border-emerald-500/60 bg-emerald-50 text-emerald-700"
                    : "border border-border bg-surface text-muted hover:border-brand-medium/40"
              }`}
              aria-label={t(m.steps.perStep.stepAria, { index: i + 1 })}
              aria-current={isActive ? "step" : undefined}
            >
              {complete && !isActive ? (
                <Check className="size-4" aria-hidden />
              ) : (
                i + 1
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          disabled={activeIndex === 0}
          onClick={() => setActiveIndex((i) => i - 1)}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-border px-3 py-2.5 text-sm text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40 sm:flex-none sm:py-1.5"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {m.steps.perStep.previous}
        </button>
        <span className="text-sm font-semibold text-brand" aria-live="polite">
          {t(m.steps.perStep.counter, {
            index: activeIndex + 1,
            total: stepCount,
          })}
        </span>
        <button
          type="button"
          disabled={activeIndex >= stepCount - 1}
          onClick={() => setActiveIndex((i) => i + 1)}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-border px-3 py-2.5 text-sm text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40 sm:flex-none sm:py-1.5"
        >
          {m.steps.perStep.next}
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <fieldset className="space-y-4">
            <legend className="text-sm font-medium text-brand">
              {m.steps.perStep.layoutLabel}
            </legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {STAIR_LAYOUT_OPTIONS.map((id) => {
                const selected = layout === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => selectLayout(id)}
                    aria-pressed={selected}
                    className={`w-full rounded-lg border-2 px-2.5 py-2 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-3 sm:py-2.5 ${
                      selected
                        ? "border-primary bg-primary/5 font-semibold text-brand"
                        : "border-border bg-surface text-muted hover:border-brand-medium/35"
                    }`}
                  >
                    {m.catalog.layout[id].label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor={`kre-step-${activeIndex}-width`}
                className="text-sm font-medium text-brand"
              >
                {widthLabel}
              </label>
              <select
                id={`kre-step-${activeIndex}-width`}
                value={current.widthBand ?? ""}
                onFocus={() => setFocusedField("widthBand")}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => {
                  setFocusedField("widthBand");
                  updateStep({
                    widthBand: e.target.value as StepConfigDraft["widthBand"],
                  });
                }}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              >
                <option value="">{m.common.choose}</option>
                {WIDTH_BAND_VALUES.map((w) => (
                  <option key={w} value={w}>
                    {m.catalog.width[w]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor={`kre-step-${activeIndex}-depth`}
                className="text-sm font-medium text-brand"
              >
                {depthLabel}
              </label>
              <select
                id={`kre-step-${activeIndex}-depth`}
                value={current.depthBand ?? ""}
                onFocus={() => setFocusedField("depthBand")}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => {
                  setFocusedField("depthBand");
                  updateStep({
                    depthBand: e.target.value as StepConfigDraft["depthBand"],
                  });
                }}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              >
                <option value="">{m.common.choose}</option>
                {DEPTH_BAND_VALUES.map((d) => (
                  <option key={d} value={d}>
                    {m.catalog.depth[d]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <StepTreadPhotos layout={layout} activeField={focusedField} />
      </div>

      {rootError ? (
        <p className="text-center text-sm text-red-600" role="alert">
          {rootError}
        </p>
      ) : null}
    </div>
  );
}
