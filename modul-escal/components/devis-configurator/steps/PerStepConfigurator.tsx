"use client";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import {
  createDefaultStepConfig,
  DIMENSION_FIELD_LABELS,
  ensureStepConfigs,
  type DimensionField,
  type StepConfigDraft,
} from "@/lib/step-config";
import { STAIR_LAYOUT_OPTIONS } from "@/lib/stair-layout-catalog";
import type { QuoteFormDraft, StairLayout } from "@/lib/quote-schema";
import { DEPTH_BAND_VALUES, WIDTH_BAND_VALUES } from "@/lib/quote-schema";

import { DEPTH_LABELS, WIDTH_LABELS } from "@/lib/quote-labels";

import { StepTreadDiagram } from "./StepTreadDiagram";

export function PerStepConfigurator() {
  const { watch, setValue, formState } = useFormContext<QuoteFormDraft>();
  const stepCount = watch("stepCount") ?? 1;
  const stepConfigs = watch("stepConfigs") ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [focusedField, setFocusedField] = useState<DimensionField | null>(null);

  const rootError =
    typeof formState.errors.stepConfigs?.message === "string"
      ? formState.errors.stepConfigs.message
      : undefined;

  useEffect(() => {
    const next = ensureStepConfigs(stepConfigs, stepCount);
    if (next.length !== stepConfigs.length) {
      setValue("stepConfigs", next, { shouldValidate: true });
    }
    if (activeIndex >= stepCount) {
      setActiveIndex(Math.max(0, stepCount - 1));
    }
  }, [activeIndex, setValue, stepConfigs, stepCount]);

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

  return (
    <div className="space-y-6 border-t border-border pt-8">
      <div className="text-center">
        <p className="text-sm font-medium text-brand">
          Configurez chaque marche individuellement
        </p>
        <p className="mt-1 text-xs text-muted">
          Type, largeur et profondeur — le schéma indique les mesures demandées.
        </p>
      </div>

      <div className="flex flex-nowrap items-center justify-center gap-3 overflow-x-auto sm:flex-wrap sm:gap-2">
        {Array.from({ length: stepCount }, (_, i) => {
          const cfg = stepConfigs[i];
          const complete =
            cfg?.layout && cfg?.widthBand && cfg?.depthBand;
          const isActive = i === activeIndex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                setActiveIndex(i);
                setFocusedField(null);
              }}
              className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition sm:size-9 ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : complete
                    ? "border-2 border-emerald-500/60 bg-emerald-50 text-emerald-700"
                    : "border border-border bg-surface text-muted hover:border-brand-medium/40"
              }`}
              aria-label={`Marche ${i + 1}`}
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
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-border px-3 py-2.5 text-sm text-brand disabled:opacity-40 sm:flex-none sm:py-1.5"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Précédente
        </button>
        <span className="text-sm font-semibold text-brand">
          Marche {activeIndex + 1} / {stepCount}
        </span>
        <button
          type="button"
          disabled={activeIndex >= stepCount - 1}
          onClick={() => setActiveIndex((i) => i + 1)}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-border px-3 py-2.5 text-sm text-brand disabled:opacity-40 sm:flex-none sm:py-1.5"
        >
          Suivante
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <p className="text-sm font-medium text-brand">Type de marche</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {STAIR_LAYOUT_OPTIONS.map((option) => {
              const selected = layout === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectLayout(option.id)}
                  className={`w-full rounded-lg border-2 px-2.5 py-2 text-left text-sm transition sm:px-3 sm:py-2.5 ${
                    selected
                      ? "border-primary bg-primary/5 font-semibold text-brand"
                      : "border-border bg-surface text-muted hover:border-brand-medium/35"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor={`step-${activeIndex}-width`}
                className="text-sm font-medium text-brand"
              >
                {layout === "BALANCED"
                  ? "Largeur (la + large)"
                  : layout === "FIVE_SIDED"
                    ? "Largeur max."
                    : DIMENSION_FIELD_LABELS.widthBand}
              </label>
              <select
                id={`step-${activeIndex}-width`}
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
                <option value="">Choisir…</option>
                {WIDTH_BAND_VALUES.map((w) => (
                  <option key={w} value={w}>
                    {WIDTH_LABELS[w]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor={`step-${activeIndex}-depth`}
                className="text-sm font-medium text-brand"
              >
                {layout === "STRAIGHT"
                  ? "Profondeur"
                  : layout === "BALANCED"
                    ? "Longueur (la + longue)"
                    : layout === "FIVE_SIDED"
                      ? "Profondeur max."
                      : DIMENSION_FIELD_LABELS.depthBand}
              </label>
              <select
                id={`step-${activeIndex}-depth`}
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
                <option value="">Choisir…</option>
                {DEPTH_BAND_VALUES.map((d) => (
                  <option key={d} value={d}>
                    {DEPTH_LABELS[d]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <StepTreadDiagram
          layout={layout}
          activeField={focusedField}
          widthBand={current.widthBand}
          depthBand={current.depthBand}
        />
      </div>

      {rootError ? (
        <p className="text-center text-sm text-red-600" role="alert">
          {rootError}
        </p>
      ) : null}
    </div>
  );
}
