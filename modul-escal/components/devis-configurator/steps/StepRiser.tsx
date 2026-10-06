"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { RISER_OPTIONS } from "@/lib/riser-options";
import { getCMImagePath } from "@/lib/decor-catalog";
import { useAsset } from "@/lib/asset";
import { useT } from "@/lib/i18n/useT";
import { useFieldError } from "@/lib/useFieldError";
import { useLiveValidation } from "@/lib/useLiveValidation";
import type { QuoteFormDraft, RiserOption } from "@/lib/quote-schema";
import { describedBy, FieldError, FieldHelp, FieldLabel, fieldClass } from "../ui/Field";
import { OptionCard } from "../ui/OptionCard";
import { StepHeader, Tag } from "../ui/Typography";

const WITH_RISER_OPTIONS = RISER_OPTIONS.filter((o) => o.id !== "NONE");

function CMPhoto({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  const asset = useAsset();
  if (failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset(src)}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="block aspect-[3/1] w-full object-cover"
    />
  );
}

export function StepRiser() {
  const { watch, setValue, register } = useFormContext<QuoteFormDraft>();
  const value = watch("riserOption");
  const decor = watch("decor");
  const error = useFieldError("riserOption");
  const heightError = useFieldError("riserHeightMm");
  const live = useLiveValidation();
  const { m, t } = useT();

  const formatPricePerStep = (price: number) =>
    price === 0 ? m.steps.riser.included : t(m.steps.riser.pricePerStep, { price });

  const selectOption = (option: RiserOption) => {
    setValue("riserOption", option, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-7">
      <StepHeader title={m.steps.riser.title} subtitle={m.steps.riser.subtitle} />

      <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <legend className="sr-only">{m.steps.riser.subtitle}</legend>
        {WITH_RISER_OPTIONS.map((option) => {
          const photo = decor ? getCMImagePath(decor, option.id) : null;
          return (
            <OptionCard
              key={option.id}
              selected={value === option.id}
              onClick={() => selectOption(option.id)}
              className="flex flex-col overflow-hidden text-left"
            >
              {photo && <CMPhoto src={photo} />}
              <span className="flex flex-col items-start gap-1.5 px-4 pb-[18px] pt-4">
                <span className="text-[15.5px] font-bold text-heading">
                  {m.catalog.riser[option.id].label}
                </span>
                <span className="text-[13.5px] leading-normal text-muted">
                  {m.catalog.riser[option.id].description}
                </span>
                <Tag className="mt-1">{formatPricePerStep(option.pricePerStep)}</Tag>
              </span>
            </OptionCard>
          );
        })}
      </fieldset>

      <FieldError>{error}</FieldError>

      <div className="max-w-md">
        <FieldLabel htmlFor="kre-riserHeightMm" optional={m.common.optional}>
          {m.steps.riser.heightLabel}
        </FieldLabel>
        <div className="flex items-center gap-2.5">
          <input
            id="kre-riserHeightMm"
            type="number"
            inputMode="numeric"
            min={100}
            max={300}
            placeholder={m.steps.riser.heightPlaceholder}
            aria-invalid={heightError ? true : undefined}
            aria-describedby={describedBy(
              "kre-riserHeightMm-help",
              heightError && "kre-riserHeightMm-error",
            )}
            className={`${fieldClass} max-w-[180px]`}
            {...register("riserHeightMm", {
              setValueAs: (v) => {
                if (v === "" || v === null || v === undefined) return undefined;
                const n = Number(v);
                return Number.isFinite(n) ? n : undefined;
              },
              onBlur: () => live.check("riserHeightMm"),
              onChange: () => live.recheck("riserHeightMm"),
            })}
          />
          <span className="text-sm text-muted">{m.common.mm}</span>
        </div>
        <FieldError id="kre-riserHeightMm-error">{heightError}</FieldError>
        {/* Recommandation Knewledge : dire quand et pourquoi renseigner ce champ. */}
        <FieldHelp id="kre-riserHeightMm-help">{m.steps.riser.heightHelp}</FieldHelp>
      </div>
    </div>
  );
}
