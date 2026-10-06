"use client";

import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { useAsset } from "@/lib/asset";
import { useT } from "@/lib/i18n/useT";
import { useFieldError } from "@/lib/useFieldError";
import { useLiveValidation } from "@/lib/useLiveValidation";
import {
  STEP_COUNT_MAX,
  STEP_COUNT_MIN,
  type QuoteFormDraft,
} from "@/lib/quote-schema";
import { describedBy, FieldError, FieldHelp, FieldLabel } from "../ui/Field";
import { StepHeader } from "../ui/Typography";

const stepperButtonClass =
  "grid w-14 shrink-0 place-items-center border-[1.5px] border-border bg-surface text-heading transition-colors duration-200 hover:text-primary focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40";

export function StepStepCount() {
  const { watch, setValue, clearErrors } = useFormContext<QuoteFormDraft>();
  const stepCount = watch("stepCount");
  const error = useFieldError("stepCount");
  const live = useLiveValidation();
  const asset = useAsset();
  const { m, t } = useT();

  // Texte brut du champ : une saisie en cours (vide, « 0 », « 2,5 ») doit
  // rester affichée telle quelle, même quand elle n'est pas un nombre valide.
  const [text, setText] = useState(stepCount !== undefined ? String(stepCount) : "");

  const commit = (raw: string) => {
    setText(raw);
    const n = raw.trim() === "" ? undefined : Number(raw);
    setValue("stepCount", Number.isFinite(n) ? n : undefined, {
      shouldDirty: true,
    });
    // Validation en temps réel (recommandation Knewledge) : une valeur hors
    // plage est signalée dès la frappe. Tout chiffre de 1 à 9 étant valide,
    // aucun message n'interrompt une saisie en cours. Un champ vidé ne
    // déclenche pas d'erreur : « Suivant » reste simplement inactif.
    if (raw.trim() === "") clearErrors("stepCount");
    else live.check("stepCount");
  };

  const current = stepCount ?? 0;
  const shift = (delta: number) => {
    const next = Math.min(
      STEP_COUNT_MAX,
      Math.max(STEP_COUNT_MIN, Math.round(current) + delta),
    );
    commit(String(next));
  };

  return (
    <div className="space-y-7">
      <StepHeader
        title={m.steps.stepCount.title}
        subtitle={m.steps.stepCount.subtitle}
      />

      <div className="grid grid-cols-1 items-center gap-7 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)] sm:gap-12">
        <figure className="relative mx-auto w-full max-w-[240px] sm:mx-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/etape/etape-4.webp")}
            alt={m.steps.stepCount.exampleAlt}
            loading="lazy"
            decoding="async"
            width={560}
            height={747}
            className="block aspect-[3/4] w-full border border-border-subtle object-cover"
          />
          <span className="absolute left-2.5 top-2.5 bg-primary px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-on-primary">
            {m.steps.stepCount.exampleBadge}
          </span>
          <figcaption className="mt-2.5 text-[13px] leading-snug text-muted">
            {m.steps.stepCount.exampleCaption}
          </figcaption>
        </figure>

        <div>
          <FieldLabel htmlFor="kre-stepCount">
            {m.steps.stepCount.inputLabel}
          </FieldLabel>
          <div className="flex max-w-[260px] items-stretch">
            <button
              type="button"
              onClick={() => shift(-1)}
              disabled={current <= STEP_COUNT_MIN}
              aria-label={m.steps.stepCount.decrease}
              aria-controls="kre-stepCount"
              className={`${stepperButtonClass} border-r-0`}
            >
              <MinusIcon aria-hidden className="size-5" />
            </button>
            <input
              id="kre-stepCount"
              type="number"
              inputMode="numeric"
              min={STEP_COUNT_MIN}
              max={STEP_COUNT_MAX}
              step={1}
              placeholder={m.steps.stepCount.inputPlaceholder}
              value={text}
              onChange={(e) => commit(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy(
                "kre-stepCount-range",
                error && "kre-stepCount-error",
              )}
              className="h-[58px] w-full min-w-0 border-[1.5px] border-border bg-surface text-center text-[22px] font-bold text-heading outline-none transition-colors duration-200 [appearance:textfield] placeholder:text-base placeholder:font-normal placeholder:text-subtle/70 focus:border-primary aria-[invalid=true]:border-error [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => shift(1)}
              disabled={current >= STEP_COUNT_MAX}
              aria-label={m.steps.stepCount.increase}
              aria-controls="kre-stepCount"
              className={`${stepperButtonClass} border-l-0`}
            >
              <PlusIcon aria-hidden className="size-5" />
            </button>
          </div>
          <FieldHelp id="kre-stepCount-range">
            {t(m.steps.stepCount.rangeHint, {
              min: STEP_COUNT_MIN,
              max: STEP_COUNT_MAX,
            })}
          </FieldHelp>
          <FieldError id="kre-stepCount-error">{error}</FieldError>
        </div>
      </div>
    </div>
  );
}
