"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { asset } from "@/lib/asset";
import type { QuoteFormDraft, StaircaseType } from "@/lib/quote-schema";

const CHOICES: Array<{
  value: StaircaseType;
  label: string;
  description: string;
  photo: string;
}> = [
  {
    value: "CLOSED",
    label: "Fermé",
    description: "Mon escalier est fermé entre chaque marche.",
    photo: "/escalier/ferme.jpg",
  },
  {
    value: "OPEN",
    label: "Ouvert",
    description: "Mon escalier est ouvert entre chaque marche.",
    photo: "/escalier/ouvert.jpg",
  },
];

function CasePhoto({ src, label }: { src: string; label: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#f5f0eb] to-[#e8e0d6]">
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={asset(src)}
          alt={label}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {failed && <span className="text-4xl" aria-hidden>🪜</span>}
    </div>
  );
}

export function StepStaircaseType() {
  const { watch, setValue, formState } = useFormContext<QuoteFormDraft>();
  const value = watch("staircaseType");
  const error = formState.errors.staircaseType?.message;

  const select = (v: StaircaseType) => {
    setValue("staircaseType", v, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold tracking-tight text-[#1e2a4a] sm:text-2xl">
          Type d&apos;escalier
        </h2>
        <p className="text-sm text-muted">
          Votre escalier est-il ouvert ou fermé entre chaque marche ?
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {CHOICES.map((choice) => {
          const selected = value === choice.value;
          return (
            <button
              key={choice.value}
              type="button"
              onClick={() => select(choice.value)}
              className={`relative overflow-hidden rounded-xl border-2 p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:p-4 ${
                selected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/25"
                  : "border-border bg-surface hover:border-brand-medium/35"
              }`}
            >
              {selected && (
                <span className="absolute right-3 top-3 z-10 flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                  <Check className="size-3.5 stroke-[3]" aria-hidden />
                </span>
              )}
              <CasePhoto src={choice.photo} label={choice.label} />
              <span className="mt-3 block text-base font-semibold text-brand">
                {choice.label}
              </span>
              <span className="mt-1 block text-sm text-muted">
                {choice.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cas spécifique : escalier ouvert → information uniquement */}
      {value === "OPEN" && (
        <div className="mx-auto max-w-2xl rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">
            Cas spécifique — escalier ouvert
          </p>
          <p className="mt-1 text-sm text-amber-800">
            Les escaliers ouverts entre chaque marche nécessitent une étude sur mesure.
            Notre équipe vous contactera pour affiner la configuration.
          </p>
        </div>
      )}

      {error && value !== "OPEN" && (
        <p className="text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
