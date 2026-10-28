"use client";

import { useFormContext } from "react-hook-form";

import { useT } from "@/lib/i18n/useT";
import { useFieldError } from "@/lib/useFieldError";
import { treadCount, type QuoteFormDraft } from "@/lib/quote-schema";

import { ensureStepConfigs } from "@/lib/step-config";

import { DimensionsBandsFields } from "./DimensionsBandsFields";
import { PerStepConfigurator } from "./PerStepConfigurator";
import { FieldError } from "../ui/Field";
import { LandingStepNote } from "../ui/LandingStepNote";
import { OptionCard } from "../ui/OptionCard";
import { StepHeader } from "../ui/Typography";

export function StepUniformDimensions() {
  const { watch, setValue } = useFormContext<QuoteFormDraft>();
  const stepCount = watch("stepCount");
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
      setValue("exactDepthMm", undefined);
      setValue("stepConfigs", ensureStepConfigs(undefined, treadCount(stepCount)), {
        shouldValidate: true,
      });
    }
  };

  return (
    <div className="space-y-7">
      <StepHeader
        title={m.steps.dimensions.title}
        subtitle={m.steps.dimensions.question}
      />
      <LandingStepNote stepCount={stepCount} />

      <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <legend className="sr-only">{m.steps.dimensions.question}</legend>
        {choices.map((choice) => (
          <OptionCard
            key={String(choice.value)}
            selected={uniform === choice.value}
            onClick={() => select(choice.value)}
            className="flex flex-col gap-1 py-[18px] pl-[18px] pr-14 text-left"
          >
            <span className="text-base font-bold text-heading">
              {choice.label}
            </span>
            <span className="text-sm leading-normal text-muted">
              {choice.description}
            </span>
          </OptionCard>
        ))}
      </fieldset>

      <FieldError>{error}</FieldError>

      {uniform === true ? <DimensionsBandsFields /> : null}
      {uniform === false ? <PerStepConfigurator /> : null}
    </div>
  );
}
