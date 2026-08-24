"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { RISER_OPTIONS } from "@/lib/riser-options";
import { getCMImagePath } from "@/lib/decor-catalog";
import { useAsset } from "@/lib/asset";
import { useT } from "@/lib/i18n/useT";
import { useFieldError } from "@/lib/useFieldError";
import type { QuoteFormDraft, RiserOption } from "@/lib/quote-schema";

const WITH_RISER_OPTIONS = RISER_OPTIONS.filter((o) => o.id !== "NONE");

function CMPhoto({ src, label }: { src: string; label: string }) {
  const [failed, setFailed] = useState(false);
  const asset = useAsset();
  if (failed) return null;
  return (
    <div className="mb-3 overflow-hidden rounded-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset(src)}
        alt={label}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className="h-28 w-full object-cover"
      />
    </div>
  );
}

export function StepRiser() {
  const { watch, setValue, register } = useFormContext<QuoteFormDraft>();
  const value = watch("riserOption");
  const decor = watch("decor");
  const error = useFieldError("riserOption");
  const heightError = useFieldError("riserHeightMm");
  const { m, t } = useT();

  const formatPricePerStep = (price: number) =>
    price === 0 ? m.steps.riser.included : t(m.steps.riser.pricePerStep, { price });

  const selectOption = (option: RiserOption) => {
    setValue("riserOption", option, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold tracking-tight text-heading sm:text-2xl">
          {m.steps.riser.title}
        </h2>
        <p className="text-sm font-medium text-heading">
          {m.steps.riser.subtitle}
        </p>
      </div>

      <fieldset className="mx-auto grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
        <legend className="sr-only">{m.steps.riser.subtitle}</legend>
        {WITH_RISER_OPTIONS.map((option) => {
          const selected = value === option.id;
          const photo = decor ? getCMImagePath(decor, option.id) : null;
          const label = m.catalog.riser[option.id].label;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => selectOption(option.id)}
              aria-pressed={selected}
              className={`relative rounded-xl border-2 p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:p-4 ${
                selected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/25"
                  : "border-border bg-surface hover:border-brand-medium/35"
              }`}
            >
              {selected && (
                <span className="absolute right-3 top-3 z-10 flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="size-3.5 stroke-[3]" aria-hidden />
                </span>
              )}
              {photo && <CMPhoto src={photo} label={label} />}
              <span className="block pr-8 text-base font-semibold text-brand">
                {label}
              </span>
              <span className="mt-1 block text-sm text-muted">
                {m.catalog.riser[option.id].description}
              </span>
              <span className="mt-3 inline-block rounded-full bg-muted-bg px-2.5 py-1 text-xs font-medium text-brand">
                {formatPricePerStep(option.pricePerStep)}
              </span>
            </button>
          );
        })}
      </fieldset>

      {error && (
        <p className="text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="mx-auto w-full max-w-xs space-y-2 text-center">
        <label
          htmlFor="kre-riserHeightMm"
          className="block text-sm font-medium text-brand"
        >
          {m.steps.riser.heightLabel}{" "}
          <span className="font-normal text-muted">
            {m.steps.riser.heightOptional}
          </span>
        </label>
        <div className="flex items-center justify-center gap-2">
          <input
            id="kre-riserHeightMm"
            type="number"
            inputMode="numeric"
            min={100}
            max={300}
            placeholder={m.steps.riser.heightPlaceholder}
            aria-invalid={heightError ? true : undefined}
            aria-describedby={heightError ? "kre-riserHeightMm-error" : undefined}
            className="w-32 rounded-lg border border-border bg-surface px-4 py-3 text-center text-lg text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
            {...register("riserHeightMm", {
              setValueAs: (v) => {
                if (v === "" || v === null || v === undefined) return undefined;
                const n = Number(v);
                return Number.isFinite(n) ? n : undefined;
              },
            })}
          />
          <span className="text-sm text-muted">{m.common.mm}</span>
        </div>
        {heightError && (
          <p
            id="kre-riserHeightMm-error"
            className="text-sm text-red-600"
            role="alert"
          >
            {heightError}
          </p>
        )}
      </div>
    </div>
  );
}
