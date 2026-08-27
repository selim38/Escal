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

  /*
   * Navigation collante en pied de panneau : sur les étapes riches en images
   * (décor, contremarches), le bouton de validation tombait sous la ligne de
   * flottaison et obligeait à faire défiler la page pour valider.
   *
   * `sticky` et non `fixed` : le bouton reste dans le flux du panneau, donc il
   * ne recouvre jamais le contenu de la page hôte au-dessus ou en dessous du
   * composant. Le fond opaque et le filet supérieur évitent que le contenu
   * défile visiblement derrière.
   */
  return (
    <div className="sticky bottom-0 -mx-6 mt-8 flex flex-col gap-3 border-t border-border bg-surface px-6 pb-1 pt-6 sm:-mx-9 sm:flex-row sm:items-center sm:justify-between sm:px-9">
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirstStep}
        className="inline-flex h-[46px] flex-1 items-center justify-center gap-[9px] rounded-none border-[1.5px] border-border bg-surface px-5 text-[15px] font-semibold text-brand shadow-xs transition hover:bg-muted-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 sm:flex-none"
      >
        <ChevronLeft className="size-4 shrink-0" aria-hidden />
        {m.nav.previous}
      </button>

      {!isLastStep ? (
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="inline-flex h-[46px] flex-1 items-center justify-center gap-[9px] rounded-none bg-primary px-5 text-[15px] font-semibold text-on-primary shadow-accent transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 sm:flex-none"
        >
          {m.nav.next}
          <ChevronRight className="size-4 shrink-0" aria-hidden />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!canGoNext || isSubmitting}
          className="inline-flex h-[46px] flex-1 items-center justify-center gap-[9px] rounded-none bg-primary px-5 text-[15px] font-semibold text-on-primary shadow-accent transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 sm:flex-none"
        >
          {isSubmitting ? m.nav.submitting : m.nav.submit}
        </button>
      )}
    </div>
  );
}
