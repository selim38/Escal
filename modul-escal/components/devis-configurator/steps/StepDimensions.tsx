"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import { useFormContext } from "react-hook-form";

import type { QuoteFormDraft } from "@/lib/quote-schema";
import { DEPTH_BAND_VALUES, WIDTH_BAND_VALUES } from "@/lib/quote-schema";
import { DEPTH_LABELS, WIDTH_LABELS } from "@/lib/quote-labels";

const MAX_DEPTH_MM = 630;

function DepthBlockedModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="depth-modal-title"
    >
      <div className="mx-4 max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-2xl">
            ⚠️
          </span>
          <h2 id="depth-modal-title" className="text-base font-semibold text-gray-900">
            Profondeur hors catalogue
          </h2>
        </div>
        <p className="mb-1 text-sm text-gray-700">
          Les marches avec une profondeur supérieure à{" "}
          <strong>{MAX_DEPTH_MM} mm</strong> dépassent les dimensions
          standard de notre catalogue.
        </p>
        <p className="mb-5 text-sm text-gray-700">
          Pour une configuration sur-mesure, veuillez contacter notre support
          technique directement.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <a
            href="mailto:contact@escal-concept.fr"
            className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
          >
            Contacter le support
          </a>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Corriger la valeur
          </button>
        </div>
      </div>
    </div>
  );
}

export function StepDimensions() {
  const { register, formState, setValue } = useFormContext<QuoteFormDraft>();
  const wErr = formState.errors.widthBand?.message;
  const dErr = formState.errors.depthBand?.message;

  const [exactDepth, setExactDepth] = useState("");
  const [showDepthModal, setShowDepthModal] = useState(false);

  function handleDepthBlur() {
    const val = Number(exactDepth);
    if (exactDepth && !isNaN(val) && val > MAX_DEPTH_MM) {
      setShowDepthModal(true);
      setValue("depthBand", undefined as unknown as "D_LT_320", { shouldValidate: false });
    }
  }

  return (
    <>
      {showDepthModal && (
        <DepthBlockedModal
          onClose={() => {
            setExactDepth("");
            setShowDepthModal(false);
          }}
        />
      )}

      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-bold tracking-tight text-[#1e2a4a] sm:text-2xl">
            Dimensions des marches
          </h2>
          <p className="text-sm text-muted">
            Indiquez les fourchettes de mesure de vos marches.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="widthBand" className="text-sm font-medium text-brand">
              Largeur
            </label>
            <select
              id="widthBand"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
              {...register("widthBand")}
            >
              <option value="">Choisir…</option>
              {WIDTH_BAND_VALUES.map((w) => (
                <option key={w} value={w}>
                  {WIDTH_LABELS[w]}
                </option>
              ))}
            </select>
            {wErr && (
              <p className="text-sm text-red-600" role="alert">{wErr}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="depthBand" className="text-sm font-medium text-brand">
              Profondeur
            </label>
            <select
              id="depthBand"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              {...register("depthBand")}
            >
              <option value="">Choisir…</option>
              {DEPTH_BAND_VALUES.map((d) => (
                <option key={d} value={d}>
                  {DEPTH_LABELS[d]}
                </option>
              ))}
            </select>
            {dErr && (
              <p className="text-sm text-red-600" role="alert">{dErr}</p>
            )}
          </div>

          {/* Profondeur exacte — validation > 630 mm */}
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="exactDepth" className="text-sm font-medium text-brand">
              Profondeur exacte{" "}
              <span className="font-normal text-gray-400">(optionnel, mm)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="exactDepth"
                type="number"
                min="1"
                max="999"
                placeholder="ex. 280"
                value={exactDepth}
                onChange={e => setExactDepth(e.target.value)}
                onBlur={handleDepthBlur}
                className="w-40 rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
              />
              <span className="text-sm text-gray-400">mm</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
