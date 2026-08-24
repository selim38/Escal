"use client";

import { useFormContext } from "react-hook-form";

import { useAsset } from "@/lib/asset";
import { useT } from "@/lib/i18n/useT";
import { useFieldError } from "@/lib/useFieldError";
import type { QuoteFormDraft } from "@/lib/quote-schema";

export function StepStepCount() {
  const { register } = useFormContext<QuoteFormDraft>();
  const error = useFieldError("stepCount");
  const asset = useAsset();
  const { m } = useT();

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold tracking-tight text-heading sm:text-2xl">
          {m.steps.stepCount.title}
        </h2>
        <p className="text-sm text-muted">{m.steps.stepCount.subtitle}</p>
      </div>

      {/* Photo d'exemple */}
      <figure className="mx-auto w-full max-w-[240px]">
        <div className="relative overflow-hidden rounded-xl border border-border">
          <span className="absolute left-2 top-2 z-10 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
            {m.steps.stepCount.exampleBadge}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/etape/etape-4.webp")}
            alt={m.steps.stepCount.exampleAlt}
            loading="lazy"
            decoding="async"
            width={560}
            height={747}
            className="block w-full"
          />
        </div>
        <figcaption className="mt-2 text-center text-xs text-muted">
          {m.steps.stepCount.exampleCaption}
        </figcaption>
      </figure>

      <div className="mx-auto w-full max-w-xs">
        <label htmlFor="kre-stepCount" className="sr-only">
          {m.steps.stepCount.inputLabel}
        </label>
        <input
          id="kre-stepCount"
          type="number"
          inputMode="numeric"
          min={1}
          max={30}
          placeholder={m.steps.stepCount.inputPlaceholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "kre-stepCount-error" : undefined}
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
        <p
          id="kre-stepCount-error"
          className="text-center text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
