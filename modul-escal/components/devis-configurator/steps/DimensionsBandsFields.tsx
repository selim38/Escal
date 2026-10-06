"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { useT } from "@/lib/i18n/useT";
import { useFieldError } from "@/lib/useFieldError";
import type { QuoteFormDraft } from "@/lib/quote-schema";
import { DEPTH_BAND_VALUES, WIDTH_BAND_VALUES } from "@/lib/quote-schema";
import type { DimensionField } from "@/lib/step-config";

import { DepthBlockedModal, MAX_DEPTH_MM } from "../ui/DepthBlockedModal";
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
  const { register, setValue } = useFormContext<QuoteFormDraft>();
  const wErr = useFieldError("widthBand");
  const dErr = useFieldError("depthBand");
  const { m, t } = useT();

  const [exactDepth, setExactDepth] = useState("");
  const [showDepthModal, setShowDepthModal] = useState(false);
  const [focusedField, setFocusedField] = useState<DimensionField | null>(null);

  function handleDepthBlur() {
    const val = Number(exactDepth);
    if (exactDepth && !Number.isNaN(val) && val > MAX_DEPTH_MM) {
      setShowDepthModal(true);
      // Réinitialise la bande sélectionnée
      setValue("depthBand", undefined, { shouldValidate: false });
    }
  }

  return (
    <>
      <DepthBlockedModal
        open={showDepthModal}
        onClose={() => {
          setExactDepth("");
          setShowDepthModal(false);
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
                  {...register("depthBand", { onBlur: () => setFocusedField(null) })}
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

          {/* Profondeur exacte — sert uniquement à repérer une marche hors
              catalogue ; l'aide dit quand la renseigner. */}
          <div>
            <FieldLabel htmlFor="kre-exactDepth" optional={m.common.optional}>
              {m.steps.dimensions.exactDepthLabel}
            </FieldLabel>
            <div className="flex items-center gap-2.5">
              <input
                id="kre-exactDepth"
                type="number"
                inputMode="numeric"
                min="1"
                max="999"
                placeholder={m.steps.dimensions.exactDepthPlaceholder}
                value={exactDepth}
                onChange={(e) => setExactDepth(e.target.value)}
                onBlur={handleDepthBlur}
                aria-describedby={describedBy("kre-exactDepth-help")}
                className={`${fieldClass} max-w-[180px]`}
              />
              <span className="text-sm text-muted">{m.common.mm}</span>
            </div>
            <FieldHelp id="kre-exactDepth-help">
              {t(m.steps.dimensions.exactDepthHelp, { max: MAX_DEPTH_MM })}
            </FieldHelp>
          </div>
        </div>

        {/* Photos guides */}
        <StepTreadPhotos layout="STRAIGHT" activeField={focusedField} />
      </div>
    </>
  );
}
