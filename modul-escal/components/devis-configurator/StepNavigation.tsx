"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { useT } from "@/lib/i18n/useT";

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
  const { m } = useT();

  return (
    <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirstStep}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-brand shadow-sm transition hover:bg-muted-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 sm:flex-none"
      >
        <ChevronLeft className="size-4 shrink-0" aria-hidden />
        {m.nav.previous}
      </button>

      {!isLastStep ? (
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 sm:flex-none"
        >
          {m.nav.next}
          <ChevronRight className="size-4 shrink-0" aria-hidden />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!canGoNext || isSubmitting}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 sm:flex-none"
        >
          {isSubmitting ? m.nav.submitting : m.nav.submit}
        </button>
      )}
    </div>
  );
}
