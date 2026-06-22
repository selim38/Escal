"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

import type { QuoteFormDraft, LandingFinish } from "@/lib/quote-schema";

const landingChoices: Array<{
  value: LandingFinish;
  label: string;
  description: string;
}> = [
  {
    value: "NONE",
    label: "Sans palier",
    description: "Aucun palier intermédiaire n'est prévu.",
  },
  {
    value: "NEZ_SEUIL",
    label: "Nez + seuil",
    description: "Nez et seuil raccordés en finition.",
  },
  {
    value: "NEZ_RACCORD_PARQUET",
    label: "Nez de raccord parquet",
    description: "Palier fini en parquet — nous vous guidons à l'étape suivante.",
  },
];

export function StepLanding() {
  const { watch, setValue, formState } = useFormContext<QuoteFormDraft>();
  const landingFinish = watch("landingFinish") ?? "NONE";

  const selected = useMemo(
    () => landingChoices.find((c) => c.value === landingFinish),
    [landingFinish],
  );

  const setLanding = (next: LandingFinish) => {
    setValue("landingFinish", next, { shouldValidate: true, shouldDirty: true });
    setValue("intermediateLanding", next !== "NONE", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="space-y-8">
      {/* ── Titre ─────────────────────────────────────────────────── */}
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold tracking-tight text-[#1e2a4a] sm:text-2xl">
          Marche palière
        </h2>
        <p className="text-sm text-muted">
          Choisissez le type de palier intermédiaire.
        </p>
      </div>

      {/* ── Photo palier ─────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="flex h-32 items-center justify-center bg-gradient-to-br from-[#f5f0eb] to-[#e8e0d6] sm:h-40 md:h-52">
          <div className="text-center text-muted">
            <div className="mb-2 text-4xl">🪵</div>
            <p className="text-xs">Photo d'un palier</p>
          </div>
        </div>
      </div>

      {/* ── Choix ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {landingChoices.map((choice) => {
          const isActive = landingFinish === choice.value;
          return (
            <button
              key={choice.value}
              type="button"
              onClick={() => setLanding(choice.value)}
              className={`w-full rounded-xl border-2 p-4 text-left transition ${
                isActive
                  ? "border-primary bg-primary/5 ring-2 ring-primary/25"
                  : "border-border bg-surface hover:border-primary/30"
              }`}
            >
              <span className="block text-sm font-semibold text-brand">
                {choice.label}
              </span>
              <span className="mt-1 block text-xs text-muted">
                {choice.description}
              </span>
            </button>
          );
        })}
      </div>

      {formState.errors.landingFinish?.message ? (
        <p className="text-sm text-red-600" role="alert">
          {formState.errors.landingFinish.message}
        </p>
      ) : null}

      {selected && landingFinish !== "NONE" ? (
        <p className="text-center text-xs text-muted">
          Sélection :{" "}
          <span className="font-semibold text-brand">{selected.label}</span>
        </p>
      ) : null}
    </div>
  );
}
