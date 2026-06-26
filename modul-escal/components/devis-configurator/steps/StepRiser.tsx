"use client";

import { Check } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { RISER_OPTIONS } from "@/lib/riser-options";
import type { QuoteFormDraft, RiserOption } from "@/lib/quote-schema";

function formatPricePerStep(price: number): string {
  if (price === 0) return "Inclus";
  return `+${price} € / marche`;
}

const WITH_RISER_OPTIONS = RISER_OPTIONS.filter((o) => o.id !== "NONE");

export function StepRiser() {
  const { watch, setValue, formState } = useFormContext<QuoteFormDraft>();
  const value = watch("riserOption");
  const error = formState.errors.riserOption?.message;

  const selectOption = (option: RiserOption) => {
    setValue("riserOption", option, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold tracking-tight text-[#1e2a4a] sm:text-2xl">
          Contremarches
        </h2>
        <p className="text-sm font-medium text-[#1e2a4a]">
          Choisir le décor des contremarches :
        </p>
      </div>

      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
        {WITH_RISER_OPTIONS.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => selectOption(option.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectOption(option.id);
                }
              }}
              className={`relative rounded-xl border-2 p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:p-4 ${
                selected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/25"
                  : "border-border bg-surface hover:border-brand-medium/35"
              }`}
            >
              {selected && (
                <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="size-3.5 stroke-[3]" aria-hidden />
                </span>
              )}
              <span className="block pr-8 text-base font-semibold text-brand">
                {option.label}
              </span>
              <span className="mt-1 block text-sm text-muted">
                {option.description}
              </span>
              <span className="mt-3 inline-block rounded-full bg-muted-bg px-2.5 py-1 text-xs font-medium text-brand">
                {formatPricePerStep(option.pricePerStep)}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
