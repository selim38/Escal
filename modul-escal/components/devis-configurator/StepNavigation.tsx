"use client";

import { useT } from "@/lib/i18n/useT";

import { ButtonArrow, buttonClass } from "./ui/Button";

type StepNavigationProps = {
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  isSubmitting?: boolean;
  /**
   * Escalier ouvert : le tunnel s'arrête, « Suivant » devient un lien vers le
   * formulaire de contact adapté.
   */
  exitHref?: string;
};

export function StepNavigation({
  isFirstStep,
  isLastStep,
  canGoNext,
  onPrev,
  onNext,
  isSubmitting,
  exitHref,
}: StepNavigationProps) {
  const { m } = useT();

  /*
   * Recommandations Knewledge :
   * - boutons côte à côte à toutes les tailles, y compris tablette et mobile ;
   * - barre NON collante sur desktop : collée en pied d'écran, elle laissait
   *   croire l'étape terminée alors que des champs restaient plus bas. Elle le
   *   reste sous 1024 px, où les étapes illustrées dépassent l'écran et où le
   *   bouton de validation tomberait loin sous la ligne de flottaison.
   *
   * `sticky` et non `fixed` : la barre reste dans le flux de la carte, donc
   * elle ne recouvre jamais le contenu de la page hôte autour du composant.
   */
  return (
    <div className="z-20 flex items-center justify-between gap-3 border-t border-border-subtle bg-surface px-5 py-5 max-lg:sticky max-lg:bottom-0 sm:px-9 lg:px-11">
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirstStep}
        className={`${buttonClass("secondary")} flex-1 max-sm:px-3.5 sm:flex-none`}
      >
        <ButtonArrow dir="prev" />
        {m.nav.previous}
      </button>

      {exitHref ? (
        <a href={exitHref} className={`${buttonClass("primary")} flex-1 max-sm:px-3.5 sm:flex-none`}>
          {m.nav.openStaircase}
          <ButtonArrow dir="next" />
        </a>
      ) : !isLastStep ? (
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className={`${buttonClass("primary")} flex-1 max-sm:px-3.5 sm:flex-none`}
        >
          {m.nav.next}
          <ButtonArrow dir="next" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!canGoNext || isSubmitting}
          className={`${buttonClass("primary")} flex-1 max-sm:px-3.5 sm:flex-none`}
        >
          {isSubmitting ? (
            m.nav.submitting
          ) : (
            <>
              <span className="sm:hidden">{m.nav.submitShort}</span>
              <span className="max-sm:hidden">{m.nav.submit}</span>
            </>
          )}
          {!isSubmitting ? <ButtonArrow dir="next" /> : null}
        </button>
      )}
    </div>
  );
}
