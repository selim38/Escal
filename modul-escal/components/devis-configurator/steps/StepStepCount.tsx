"use client";

import { useFormContext } from "react-hook-form";

import { asset } from "@/lib/asset";
import type { QuoteFormDraft } from "@/lib/quote-schema";

export function StepStepCount() {
  const { register, formState } = useFormContext<QuoteFormDraft>();
  const error = formState.errors.stepCount?.message;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold tracking-tight text-[#1e2a4a] sm:text-2xl">
          Nombre de marches
        </h2>
        <p className="text-sm text-muted">
          Comptez les marches de bas en haut, marche terminale de palier incluse.
        </p>
      </div>

      {/* Photo d'exemple */}
      <figure className="mx-auto w-full max-w-[240px]">
        <div className="relative overflow-hidden rounded-xl border border-border">
          <span className="absolute left-2 top-2 z-10 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
            Exemple
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/etape/etape-4.jpg")}
            alt="Exemple : marches numérotées de bas en haut, marche de palier incluse"
            loading="lazy"
            className="block w-full"
          />
        </div>
        <figcaption className="mt-2 text-center text-xs text-muted">
          Exemple — ici 7 marches (marche de palier incluse).
        </figcaption>
      </figure>

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
