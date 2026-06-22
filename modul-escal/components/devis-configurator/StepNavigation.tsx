"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type StepNavigationProps = {
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  isSubmitting?: boolean;
};

export function StepNavigation({
  isFirstStep,
  isLastStep,
  canGoNext,
  onPrev,
  onNext,
  isSubmitting,
}: StepNavigationProps) {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-6">
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirstStep}
        className="inline-flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-brand shadow-sm transition hover:bg-muted-bg disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="size-4 shrink-0" aria-hidden />
        Précédent
      </button>

      {!isLastStep ? (
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="inline-flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-surface shadow-sm transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40"
        >
          Suivant
          <ChevronRight className="size-4 shrink-0" aria-hidden />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!canGoNext || isSubmitting}
          className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-surface shadow-sm transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40"
        >
          Envoyer ma demande au commercial
        </button>
      )}
    </div>
  );
}
