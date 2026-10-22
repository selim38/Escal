"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { useT } from "@/lib/i18n/useT";
import { useFieldError } from "@/lib/useFieldError";
import { useLiveValidation } from "@/lib/useLiveValidation";
import type { QuoteFormDraft } from "@/lib/quote-schema";
import {
  DEPTH_BAND_VALUES,
  EXACT_DEPTH_MAX_MM,
  EXACT_DEPTH_MIN_MM,
  WIDTH_BAND_VALUES,
} from "@/lib/quote-schema";
import type { DimensionField } from "@/lib/step-config";

import { DepthBlockedModal } from "../ui/DepthBlockedModal";
import {
  describedBy,
  FieldError,
  FieldHelp,
  FieldLabel,
  fieldClass,
  SelectShell,
  selectClass,
} from "../ui/Field";
import { StepTreadPhotos } from "./StepTreadPhotos";

export function DimensionsBandsFields() {
  const { register, setValue, getValues, clearErrors, setFocus, watch } =
    useFormContext<QuoteFormDraft>();
  const depthBand = watch("depthBand");
  const wErr = useFieldError("widthBand");
  const dErr = useFieldError("depthBand");
  const exactErr = useFieldError("exactDepthMm");
  const live = useLiveValidation();
  const { m, t } = useT();

  const [showDepthModal, setShowDepthModal] = useState(false);
  const [focusedField, setFocusedField] = useState<DimensionField | null>(null);

  // La profondeur exacte n'a de sens que pour « > 320 mm » : on l'efface dès
  // qu'une autre fourchette est choisie.
  function handleDepthBandChange(value: string) {
    if (value === "D_GT_320") return;
    setValue("exactDepthMm", undefined);
    clearErrors("exactDepthMm");
  }

  // Hors catalogue : la modale oriente vers le support, puis la saisie est
  // effacée. La fourchette reste « > 320 mm » : tant que la profondeur exacte
  // n'est pas corrigée, l'étape ne peut pas être validée.
  function handleExactDepthBlur() {
    setFocusedField(null);
    const value = getValues("exactDepthMm");
    if (value !== undefined && value > EXACT_DEPTH_MAX_MM) {
      setShowDepthModal(true);
      return;
    }
    live.touch("exactDepthMm");
  }

  return (
    <>
      <DepthBlockedModal
        open={showDepthModal}
        onClose={() => {
          setValue("exactDepthMm", undefined);
          clearErrors("exactDepthMm");
          setShowDepthModal(false);
          setFocus("exactDepthMm");
        }}
      />

      <div className="grid gap-7 border-t border-border-subtle pt-7 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-5">
          <div>
            <p className="text-[15px] font-bold text-heading">
              {m.steps.dimensions.bandsIntro}
            </p>
            <p className="mt-1 text-[13.5px] text-muted">
              {m.steps.dimensions.bandsTolerance}
            </p>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            {/* Longueur */}
            <div>
              <FieldLabel htmlFor="kre-widthBand">
                {m.steps.dimensions.lengthLabel}
              </FieldLabel>
              <SelectShell>
                <select
                  id="kre-widthBand"
                  aria-invalid={wErr ? true : undefined}
                  aria-describedby={wErr ? "kre-widthBand-error" : undefined}
                  className={selectClass}
                  onFocus={() => setFocusedField("widthBand")}
                  {...register("widthBand", { onBlur: () => setFocusedField(null) })}
                >
                  <option value="">{m.common.choose}</option>
                  {WIDTH_BAND_VALUES.map((w) => (
                    <option key={w} value={w}>
                      {m.catalog.width[w]}
                    </option>
                  ))}
                </select>
              </SelectShell>
              <FieldError id="kre-widthBand-error">{wErr}</FieldError>
            </div>

            {/* Profondeur */}
            <div>
              <FieldLabel htmlFor="kre-depthBand">
                {m.steps.dimensions.depthLabel}
              </FieldLabel>
              <SelectShell>
                <select
                  id="kre-depthBand"
                  aria-invalid={dErr ? true : undefined}
                  aria-describedby={dErr ? "kre-depthBand-error" : undefined}
                  className={selectClass}
                  onFocus={() => setFocusedField("depthBand")}
                  {...register("depthBand", {
                    onBlur: () => setFocusedField(null),
                    onChange: (e) => handleDepthBandChange(e.target.value),
                  })}
                >
                  <option value="">{m.common.choose}</option>
                  {DEPTH_BAND_VALUES.map((d) => (
                    <option key={d} value={d}>
                      {m.catalog.depth[d]}
                    </option>
                  ))}
                </select>
              </SelectShell>
              <FieldError id="kre-depthBand-error">{dErr}</FieldError>
            </div>
          </div>

          {/* Profondeur exacte — demandée seulement pour « > 320 mm », pour
              repérer une marche hors catalogue. */}
          {depthBand === "D_GT_320" ? (
            <div>
              <FieldLabel htmlFor="kre-exactDepthMm">
                {m.steps.dimensions.exactDepthLabel}
              </FieldLabel>
              <div className="flex items-center gap-2.5">
                <input
                  id="kre-exactDepthMm"
                  type="number"
                  inputMode="numeric"
                  min={EXACT_DEPTH_MIN_MM}
                  max={EXACT_DEPTH_MAX_MM}
                  placeholder={m.steps.dimensions.exactDepthPlaceholder}
                  aria-invalid={exactErr ? true : undefined}
                  aria-describedby={describedBy(
                    exactErr && "kre-exactDepthMm-error",
                    "kre-exactDepthMm-help",
                  )}
                  className={`${fieldClass} max-w-[180px]`}
                  onFocus={() => setFocusedField("depthBand")}
                  {...register("exactDepthMm", {
                    setValueAs: (v) => {
                      if (v === "" || v === null || v === undefined) return undefined;
                      const n = Number(v);
                      return Number.isFinite(n) ? n : undefined;
                    },
                    onBlur: handleExactDepthBlur,
                    onChange: () => live.recheck("exactDepthMm"),
                  })}
                />
                <span className="text-sm text-muted">{m.common.mm}</span>
              </div>
              <FieldError id="kre-exactDepthMm-error">{exactErr}</FieldError>
              <FieldHelp id="kre-exactDepthMm-help">
                {t(m.steps.dimensions.exactDepthHelp, {
                  min: EXACT_DEPTH_MIN_MM,
                  max: EXACT_DEPTH_MAX_MM,
                })}
              </FieldHelp>
            </div>
          ) : null}
        </div>

        {/* Photos guides */}
        <StepTreadPhotos layout="STRAIGHT" activeField={focusedField} />
      </div>
    </>
  );
}
