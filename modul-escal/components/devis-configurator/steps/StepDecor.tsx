"use client";

import { useFormContext } from "react-hook-form";

import { useAsset } from "@/lib/asset";
import { DECOR_CATALOG } from "@/lib/decor-catalog";
import { useT } from "@/lib/i18n/useT";
import { useFieldError } from "@/lib/useFieldError";
import type { Decor, QuoteFormDraft } from "@/lib/quote-schema";

import { FieldError } from "../ui/Field";
import { OptionCard } from "../ui/OptionCard";
import { SampleCta } from "../ui/SampleCta";
import { StepHeader } from "../ui/Typography";

export function StepDecor() {
  const { watch, setValue } = useFormContext<QuoteFormDraft>();
  const value = watch("decor");
  const error = useFieldError("decor");
  const asset = useAsset();
  const { m } = useT();

  const select = (d: Decor) => {
    setValue("decor", d, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-7">
      <StepHeader title={m.steps.decor.title} subtitle={m.steps.decor.subtitle} />

      {/* Six vignettes par ligne en desktop ; la dernière ligne, incomplète,
          reste centrée. */}
      <fieldset className="flex flex-wrap justify-center gap-3 sm:gap-3.5">
        <legend className="sr-only">{m.steps.decor.title}</legend>
        {DECOR_CATALOG.map((item) => {
          const label = m.catalog.decor[item.id];
          return (
            <OptionCard
              key={item.id}
              selected={value === item.id}
              onClick={() => select(item.id)}
              className="flex w-[calc(50%-6px)] min-w-0 flex-col overflow-hidden sm:w-[calc(33.333%-10px)] md:w-[calc(16.667%-12px)]"
            >
              <span className="relative block aspect-square w-full overflow-hidden bg-muted-bg">
                {item.imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset(item.imageSrc)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full scale-100 object-cover sm:scale-[1.25]"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="absolute inset-0"
                    style={{ background: item.swatch }}
                  />
                )}
              </span>
              <span className="flex min-h-11 items-center justify-center px-2 py-2.5 text-center text-[13.5px] font-semibold leading-tight text-heading">
                {label}
              </span>
            </OptionCard>
          );
        })}
      </fieldset>

      <SampleCta decorLabel={value ? m.catalog.decor[value] : undefined} />

      <FieldError>{error}</FieldError>
    </div>
  );
}
