"use client";

import { Check } from "lucide-react";
import { useFormContext } from "react-hook-form";

import type { QuoteFormDraft } from "@/lib/quote-schema";

import { ensureStepConfigs } from "@/lib/step-config";

import { DimensionsBandsFields } from "./DimensionsBandsFields";
import { PerStepConfigurator } from "./PerStepConfigurator";

const CHOICES = [
  {
    value: true,
    label: "Oui",
    description: "Toutes les marches ont la même profondeur et la même largeur.",
  },
  {
    value: false,
    label: "Non",
    description:
      "Les marches ont des dimensions différentes (profondeur ou largeur variables).",
  },
] as const;

export function StepUniformDimensions() {
  const { watch, setValue, formState } = useFormContext<QuoteFormDraft>();
  const stepCount = watch("stepCount") ?? 1;
  const uniform = watch("uniformStepDimensions");
  const error = formState.errors.uniformStepDimensions?.message;

  const select = (choice: boolean) => {
    setValue("uniformStepDimensions", choice, {
      shouldValidate: true,
      shouldDirty: true,
    });
    if (choice) {
      setValue("stepConfigs", undefined);
    } else {
      setValue("widthBand", undefined);
      setValue("depthBand", undefined);
      setValue("stepConfigs", ensureStepConfigs(undefined, stepCount), {
        shouldValidate: true,
      });
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-center text-xl font-bold tracking-tight text-[#1e2a4a] sm:text-2xl">
        Dimensions des marches
      </h2>
      <p className="text-center text-sm text-muted">
        Toutes vos marches ont-elles les mêmes dimensions (profondeur et
        largeur)&nbsp;?
      </p>

      <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-2">
        {CHOICES.map((choice) => {
          const selected = uniform === choice.value;
          return (
            <button
              key={String(choice.value)}
              type="button"
              onClick={() => select(choice.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  select(choice.value);
                }
              }}
              className={`relative rounded-xl border-2 p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                selected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/25"
                  : "border-border bg-surface hover:border-brand-medium/35"
              }`}
            >
              {selected ? (
                <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="size-3.5 stroke-[3]" aria-hidden />
                </span>
              ) : null}
              <span className="block pr-8 text-base font-semibold text-brand">
                {choice.label}
              </span>
              <span className="mt-1 block text-sm text-muted">
                {choice.description}
              </span>
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {uniform === true ? <DimensionsBandsFields /> : null}
      {uniform === false ? <PerStepConfigurator /> : null}
    </div>
  );
}
