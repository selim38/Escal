"use client";

import { Check } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { useT } from "@/lib/i18n/useT";
import { useFieldError } from "@/lib/useFieldError";
import type { QuoteFormDraft } from "@/lib/quote-schema";

import { ensureStepConfigs } from "@/lib/step-config";

import { DimensionsBandsFields } from "./DimensionsBandsFields";
import { PerStepConfigurator } from "./PerStepConfigurator";
import { StepTitle } from "../ui/Typography";

export function StepUniformDimensions() {
  const { watch, setValue } = useFormContext<QuoteFormDraft>();
  const stepCount = watch("stepCount") ?? 1;
  const uniform = watch("uniformStepDimensions");
  const error = useFieldError("uniformStepDimensions");
  const { m } = useT();

  const choices = [
    { value: true, ...m.steps.dimensions.uniformYes },
    { value: false, ...m.steps.dimensions.uniformNo },
  ];

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
      <StepTitle>{m.steps.dimensions.title}</StepTitle>
      <p className="text-center text-sm text-muted">
        {m.steps.dimensions.question}
      </p>

      <fieldset className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
        <legend className="sr-only">{m.steps.dimensions.question}</legend>
        {choices.map((choice) => {
          const selected = uniform === choice.value;
          return (
            <button
              key={String(choice.value)}
              type="button"
              onClick={() => select(choice.value)}
              aria-pressed={selected}
              className={`relative rounded-xl border-2 p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:p-4 ${
                selected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/25"
                  : "border-border bg-surface shadow-sm transition-shadow hover:-translate-y-[3px] hover:border-brand-medium/35 hover:shadow-lg"
              }`}
            >
              {selected ? (
                <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-success text-white">
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
      </fieldset>

      {error ? (
        <p className="text-center text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}

      {uniform === true ? <DimensionsBandsFields /> : null}
      {uniform === false ? <PerStepConfigurator /> : null}
    </div>
  );
}
