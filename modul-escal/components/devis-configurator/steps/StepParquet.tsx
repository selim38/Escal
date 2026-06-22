"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Info, X, CheckCircle2 } from "lucide-react";

import type { QuoteFormDraft } from "@/lib/quote-schema";
import { WIDTH_LABELS } from "@/lib/quote-labels";

const NEZ_RACCORD_BY_WIDTH: Record<string, string> = {
  W_LT_800:    "Nez de raccord < 800 mm",
  W_801_1000:  "Nez de raccord 801 – 1 000 mm",
  W_1001_1300: "Nez de raccord 1 001 – 1 300 mm",
  W_1301_1600: "Nez de raccord 1 301 – 1 600 mm",
  W_1601_1800: "Nez de raccord 1 601 – 1 800 mm",
};


function M2Modal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="mx-4 max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xl">
            💡
          </div>
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-1 text-gray-400 hover:bg-gray-100"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>
        </div>
        <h3 className="mb-2 text-base font-semibold text-[#1e2a4a]">
          Conseil pour les m²
        </h3>
        <p className="mb-1 text-sm text-gray-600">
          Nous vous conseillons de prévoir{" "}
          <span className="font-semibold text-primary">+20 %</span> par rapport à
          la surface mesurée, afin de couvrir les pertes liées aux coupes et chutes.
        </p>
        <p className="mb-5 text-sm text-gray-600">
          Exemple : pour un palier de <strong>2 m²</strong>, commandez{" "}
          <strong>2,4 m²</strong>.
        </p>
        <button
          onClick={onClose}
          className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
        >
          J'ai compris
        </button>
      </div>
    </div>
  );
}

export function StepParquet() {
  const { watch, setValue, register } = useFormContext<QuoteFormDraft>();
  const wantPlinthes = watch("wantPlinthes");
  const widthBand    = watch("widthBand");

  const [showM2Modal, setShowM2Modal] = useState(false);

  const nezRef = widthBand ? NEZ_RACCORD_BY_WIDTH[widthBand] : null;

  return (
    <>
      {showM2Modal && <M2Modal onClose={() => setShowM2Modal(false)} />}

      <div className="space-y-8">
        {/* ── Titre ─────────────────────────────────────────────── */}
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-bold tracking-tight text-[#1e2a4a] sm:text-2xl">
            Parquet du palier
          </h2>
          <p className="text-sm text-muted">
            Précisez la surface de votre palier. La teinte du parquet sera assortie à votre décor.
          </p>
        </div>

        {/* ── m² ────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="landingAreaM2" className="text-sm font-semibold text-brand">
              Surface du palier (m²)
            </label>
            <button
              type="button"
              onClick={() => setShowM2Modal(true)}
              className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
            >
              <Info className="size-3" />
              +20 % recommandé
            </button>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              id="landingAreaM2"
              type="number"
              min="0.1"
              step="0.1"
              placeholder="ex. 2.4"
              className="w-28 sm:w-36 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
              {...register("landingAreaM2", { valueAsNumber: true })}
            />
            <span className="text-sm text-muted">m²</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700">
            <CheckCircle2 className="size-3.5 shrink-0" />
            <span className="font-medium">Fourni avec sous-couche incluse</span>
          </div>
        </div>

        <hr className="border-border" />

        {/* ── Plinthes ──────────────────────────────────────────── */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-brand">
            Souhaitez-vous des plinthes 60 mm assorties ?
          </p>
          <p className="text-xs text-muted">
            Teinte assortie au décor sélectionné.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            {([true, false] as const).map((val) => {
              const isActive = wantPlinthes === val;
              return (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => setValue("wantPlinthes", val, { shouldDirty: true })}
                  className={`w-full sm:w-auto rounded-xl border-2 px-5 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted hover:border-primary/30"
                  }`}
                >
                  {val ? "Oui" : "Non"}
                </button>
              );
            })}
          </div>

          {wantPlinthes === true && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="plinthesML" className="text-sm font-medium text-brand">
                  Longueur de plinthes (ml)
                </label>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  +20 % recommandé
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  id="plinthesML"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="ex. 6.0"
                  className="w-28 sm:w-36 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                  {...register("plinthesML", { valueAsNumber: true })}
                />
                <span className="text-sm text-muted">ml</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
