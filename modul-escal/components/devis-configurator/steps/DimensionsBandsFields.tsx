"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { useT } from "@/lib/i18n/useT";
import { useFieldError } from "@/lib/useFieldError";
import type { QuoteFormDraft } from "@/lib/quote-schema";
import { DEPTH_BAND_VALUES, WIDTH_BAND_VALUES } from "@/lib/quote-schema";
import type { DimensionField } from "@/lib/step-config";

import { DepthBlockedModal, MAX_DEPTH_MM } from "../ui/DepthBlockedModal";
import { StepTreadPhotos } from "./StepTreadPhotos";

export function DimensionsBandsFields() {
  const { register, setValue } = useFormContext<QuoteFormDraft>();
  const wErr = useFieldError("widthBand");
  const dErr = useFieldError("depthBand");
  const { m } = useT();

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

      <div className="space-y-6 border-t border-border pt-8">
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand">
            {m.steps.dimensions.bandsIntro}
          </p>
          <p className="text-xs text-muted">
            {m.steps.dimensions.bandsTolerance}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Longueur */}
            <div className="space-y-2">
              <label
                htmlFor="kre-widthBand"
                className="text-sm font-medium text-brand"
              >
                {m.steps.dimensions.lengthLabel}
              </label>
              <select
                id="kre-widthBand"
                aria-invalid={wErr ? true : undefined}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
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
              {wErr && (
                <p className="text-sm text-error" role="alert">
                  {wErr}
                </p>
              )}
            </div>

            {/* Profondeur */}
            <div className="space-y-2">
              <label
                htmlFor="kre-depthBand"
                className="text-sm font-medium text-brand"
              >
                {m.steps.dimensions.depthLabel}
              </label>
              <select
                id="kre-depthBand"
                aria-invalid={dErr ? true : undefined}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
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
              {dErr && (
                <p className="text-sm text-error" role="alert">
                  {dErr}
                </p>
              )}
            </div>

            {/* Profondeur exacte */}
            <div className="space-y-2 sm:col-span-2">
              <label
                htmlFor="kre-exactDepth"
                className="text-sm font-medium text-brand"
              >
                {m.steps.dimensions.exactDepthLabel}{" "}
                <span className="font-normal text-muted">
                  {m.common.optionalMm}
                </span>
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  id="kre-exactDepth"
                  type="number"
                  min="1"
                  max="999"
                  placeholder={m.steps.dimensions.exactDepthPlaceholder}
                  value={exactDepth}
                  onChange={(e) => setExactDepth(e.target.value)}
                  onBlur={handleDepthBlur}
                  className="w-24 rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25 sm:w-40"
                />
                <span className="text-sm text-muted">{m.common.mm}</span>
              </div>
            </div>
          </div>

          {/* Photos guides */}
          <StepTreadPhotos layout="STRAIGHT" activeField={focusedField} />
        </div>
      </div>
    </>
  );
}
