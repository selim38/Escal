"use client";

import { useFormContext } from "react-hook-form";

import type { QuoteFormDraft } from "@/lib/quote-schema";

export function StepStepCount() {
  const { register, formState } = useFormContext<QuoteFormDraft>();
  const error = formState.errors.stepCount?.message;

  return (
    <div className="space-y-8">
      <h2 className="text-center text-xl font-bold tracking-tight text-[#1e2a4a] sm:text-2xl">
        Nombre de marches
      </h2>
      <p className="text-center text-sm text-muted">
        Indiquez le nombre de marches à recouvrir (entre 1 et 30).
      </p>

      <div className="mx-auto w-full max-w-xs">
        <label htmlFor="stepCount" className="sr-only">
          Nombre de marches
        </label>
        <input
          id="stepCount"
          type="number"
          inputMode="numeric"
          min={1}
          max={30}
          placeholder="Ex. 12"
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-center text-lg text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
          {...register("stepCount", {
            setValueAs: (v) => {
              if (v === "" || v === null || v === undefined) return undefined;
              const n = Number(v);
              return Number.isFinite(n) ? n : undefined;
            },
          })}
        />
      </div>

      {error ? (
        <p className="text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
