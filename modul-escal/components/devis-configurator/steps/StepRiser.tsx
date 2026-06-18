"use client";

import { useState } from "react";
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

  // withRiser: null = pas encore choisi, false = sans, true = avec
  const [withRiser, setWithRiser] = useState<boolean | null>(
    value === undefined ? null : value === "NONE" ? false : true
  );

  const selectWithout = () => {
    setWithRiser(false);
    setValue("riserOption", "NONE", { shouldValidate: true, shouldDirty: true });
  };

  const selectWith = () => {
    setWithRiser(true);
    // Réinitialise si on revenait de "NONE"
    if (value === "NONE") {
      setValue("riserOption", undefined as unknown as RiserOption, { shouldValidate: false, shouldDirty: true });
    }
  };

  const selectOption = (option: RiserOption) => {
    setValue("riserOption", option, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-center text-xl font-bold tracking-tight text-[#1e2a4a] sm:text-2xl">
        Contremarches
      </h2>
      <p className="text-center text-sm text-muted">
        Souhaitez-vous des contremarches ?
      </p>

      {/* Choix avec / sans */}
      <div className="mx-auto grid max-w-sm gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={selectWithout}
          className={`relative rounded-xl border-2 p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            withRiser === false
              ? "border-primary bg-primary/5 ring-2 ring-primary/25"
              : "border-border bg-surface hover:border-brand-medium/35"
          }`}
        >
          {withRiser === false && (
            <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-primary text-white">
              <Check className="size-3.5 stroke-[3]" aria-hidden />
            </span>
          )}
          <span className="block pr-8 text-base font-semibold text-brand">Sans contremarche</span>
          <span className="mt-1 block text-sm text-muted">Marches seules, sans habillage.</span>
          <span className="mt-3 inline-block rounded-full bg-muted-bg px-2.5 py-1 text-xs font-medium text-brand">
            Inclus
          </span>
        </button>

        <button
          type="button"
          onClick={selectWith}
          className={`relative rounded-xl border-2 p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            withRiser === true
              ? "border-primary bg-primary/5 ring-2 ring-primary/25"
              : "border-border bg-surface hover:border-brand-medium/35"
          }`}
        >
          {withRiser === true && (
            <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-primary text-white">
              <Check className="size-3.5 stroke-[3]" aria-hidden />
            </span>
          )}
          <span className="block pr-8 text-base font-semibold text-brand">Avec contremarche</span>
          <span className="mt-1 block text-sm text-muted">Habillage personnalisé des contremarches.</span>
          <span className="mt-3 inline-block rounded-full bg-muted-bg px-2.5 py-1 text-xs font-medium text-brand">
            Selon finition
          </span>
        </button>
      </div>

      {/* Options de finition (visible seulement si "avec") */}
      {withRiser === true && (
        <div className="space-y-4">
          <p className="text-center text-sm font-medium text-[#1e2a4a]">
            Choisissez la finition des contremarches
          </p>
          <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-3">
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
                  className={`relative rounded-xl border-2 p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    selected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/25"
                      : "border-border bg-surface hover:border-brand-medium/35"
                  }`}
                >
                  {selected && (
                    <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-primary text-white">
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
        </div>
      )}

      {error && (
        <p className="text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
