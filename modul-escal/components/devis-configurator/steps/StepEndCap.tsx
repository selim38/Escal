"use client";

import { CornerDownRight } from "lucide-react";
import { useFormContext } from "react-hook-form";

import {
  END_SIDE_OPTIONS,
  STEP_END_CAP_MAX_COUNT,
  STEP_END_CAP_OPTIONS,
} from "@/lib/step-end-cap-catalog";
import type { QuoteFormDraft, StepEndCap } from "@/lib/quote-schema";

import { EndCapOpenStepAnimation } from "./EndCapOpenStepAnimation";
import { EndCapOverhangingAnimation } from "./EndCapOverhangingAnimation";

export function StepEndCap() {
  const { register, watch, setValue, formState } = useFormContext<QuoteFormDraft>();
  const stepEndCap = watch("stepEndCap");
  const openStepEndSide = watch("openStepEndSide") ?? "LEFT";
  const lateralEndSide = watch("lateralEndSide") ?? "LEFT";

  const selectCap = (id: StepEndCap) => {
    setValue("stepEndCap", id, { shouldValidate: true, shouldDirty: true });
    if (id !== "OPEN_STEP") {
      setValue("openStepEndSide", undefined, { shouldValidate: true });
      setValue("lateralEndSide", undefined, { shouldValidate: true });
    } else if (!watch("openStepEndSide")) {
      setValue("openStepEndSide", "LEFT", { shouldValidate: true });
      setValue("lateralEndSide", "LEFT", { shouldValidate: true });
    }
  };

  const cardClass = (selected: boolean) =>
    `w-full rounded-xl border-2 p-4 text-left transition ${
      selected
        ? "border-primary bg-primary/5 ring-2 ring-primary/25"
        : "border-border bg-surface hover:border-brand-medium/35"
    }`;

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h3 className="text-base font-bold tracking-tight text-[#1e2a4a]">
          Embouts de marche
        </h3>
        <p className="text-sm text-muted">
          Choisissez la finition des nez de marche. Maximum {STEP_END_CAP_MAX_COUNT} embouts par commande.
        </p>
      </div>

      <input type="hidden" {...register("stepEndCap")} />

      <div className="grid gap-3 sm:grid-cols-3">
        {STEP_END_CAP_OPTIONS.map((option) => {
          const selected = stepEndCap === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => selectCap(option.id)}
              className={cardClass(selected)}
            >
              <span className="block text-sm font-semibold text-brand">
                {option.label}
              </span>
              <span className="mt-1 block text-xs text-muted">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

      {formState.errors.stepEndCap?.message ? (
        <p className="text-sm text-red-600" role="alert">
          {formState.errors.stepEndCap.message}
        </p>
      ) : null}

      {stepEndCap === "OPEN_STEP" ? (
        <div className="space-y-4 rounded-xl border border-border bg-muted-bg/40 p-4">
          <p className="text-center text-sm font-medium text-brand">
            Marche ouverte — embout 1 pièce
          </p>
          <EndCapOpenStepAnimation
            firstStepSide={openStepEndSide}
            lateralSide={lateralEndSide}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-brand">
                1ʳᵉ marche — côté
              </legend>
              <div className="flex gap-2">
                {END_SIDE_OPTIONS.map((side) => (
                  <label
                    key={side.id}
                    className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 px-3 py-2 text-sm font-medium transition ${
                      openStepEndSide === side.id
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-surface text-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      value={side.id}
                      {...register("openStepEndSide")}
                    />
                    {side.label}
                  </label>
                ))}
              </div>
              {formState.errors.openStepEndSide?.message ? (
                <p className="text-sm text-red-600" role="alert">
                  {formState.errors.openStepEndSide.message}
                </p>
              ) : null}
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-brand">
                Embout latéral — côté
              </legend>
              <div className="flex gap-2">
                {END_SIDE_OPTIONS.map((side) => (
                  <label
                    key={side.id}
                    className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 px-3 py-2 text-sm font-medium transition ${
                      lateralEndSide === side.id
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-surface text-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      value={side.id}
                      {...register("lateralEndSide")}
                    />
                    {side.label}
                  </label>
                ))}
              </div>
              {formState.errors.lateralEndSide?.message ? (
                <p className="text-sm text-red-600" role="alert">
                  {formState.errors.lateralEndSide.message}
                </p>
              ) : null}
            </fieldset>
          </div>
        </div>
      ) : null}

      {stepEndCap === "OVERHANGING" ? (
        <div className="space-y-3 rounded-xl border border-border bg-muted-bg/40 p-4">
          <p className="text-center text-sm font-medium text-brand">
            Marche débordante — embout 2 pièces
          </p>
          <EndCapOverhangingAnimation />
        </div>
      ) : null}

      {stepEndCap === "NONE" ? (
        <p className="text-center text-sm text-muted">
          Aucun embout de marche ne sera ajouté à la configuration.
        </p>
      ) : null}
    </div>
  );
}
