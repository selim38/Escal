"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Info, CheckCircle2 } from "lucide-react";

import { useT } from "@/lib/i18n/useT";
import type { QuoteFormDraft } from "@/lib/quote-schema";

import { M2AdviceModal } from "../ui/M2AdviceModal";

export function StepParquet() {
  const { watch, setValue, register } = useFormContext<QuoteFormDraft>();
  const wantPlinthes = watch("wantPlinthes");
  const { m } = useT();

  const [showM2Modal, setShowM2Modal] = useState(false);

  return (
    <>
      <M2AdviceModal open={showM2Modal} onClose={() => setShowM2Modal(false)} />

      <div className="space-y-8">
        {/* ── Titre ─────────────────────────────────────────────── */}
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-bold tracking-tight text-heading sm:text-2xl">
            {m.steps.parquet.title}
          </h2>
          <p className="text-sm text-muted">{m.steps.parquet.subtitle}</p>
        </div>

        {/* ── m² ────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor="kre-landingAreaM2"
              className="text-sm font-semibold text-brand"
            >
              {m.steps.parquet.areaLabel}
            </label>
            <button
              type="button"
              onClick={() => setShowM2Modal(true)}
              className="flex items-center gap-1 rounded-full bg-warning-tint px-2 py-0.5 text-xs font-medium text-brand hover:bg-warning-tint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Info className="size-3" aria-hidden />
              {m.steps.parquet.plus20}
            </button>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              id="kre-landingAreaM2"
              type="number"
              min="0.1"
              step="0.1"
              placeholder={m.steps.parquet.areaPlaceholder}
              className="w-28 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25 sm:w-36"
              {...register("landingAreaM2", { valueAsNumber: true })}
            />
            <span className="text-sm text-muted">
              {m.steps.parquet.areaUnit}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-success">
            <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
            <span className="font-medium">
              {m.steps.parquet.underlayIncluded}
            </span>
          </div>
        </div>

        <hr className="border-border" />

        {/* ── Plinthes ──────────────────────────────────────────── */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-brand">
            {m.steps.parquet.plinthesQuestion}
          </legend>
          <p className="text-xs text-muted">{m.steps.parquet.plinthesHint}</p>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            {([true, false] as const).map((val) => {
              const isActive = wantPlinthes === val;
              return (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() =>
                    setValue("wantPlinthes", val, { shouldDirty: true })
                  }
                  aria-pressed={isActive}
                  className={`w-full rounded-xl border-2 px-5 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto ${
                    isActive
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted hover:border-primary/30"
                  }`}
                >
                  {val ? m.common.yes : m.common.no}
                </button>
              );
            })}
          </div>

          {wantPlinthes === true && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <label
                  htmlFor="kre-plinthesML"
                  className="text-sm font-medium text-brand"
                >
                  {m.steps.parquet.plinthesLabel}
                </label>
                <span className="rounded-full bg-warning-tint px-2 py-0.5 text-xs font-medium text-brand">
                  {m.steps.parquet.plus20}
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  id="kre-plinthesML"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder={m.steps.parquet.plinthesPlaceholder}
                  className="w-28 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25 sm:w-36"
                  {...register("plinthesML", { valueAsNumber: true })}
                />
                <span className="text-sm text-muted">
                  {m.steps.parquet.plinthesUnit}
                </span>
              </div>
            </div>
          )}
        </fieldset>
      </div>
    </>
  );
}
