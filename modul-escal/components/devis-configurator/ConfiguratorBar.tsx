"use client";

import { useAsset } from "@/lib/asset";
import { useT } from "@/lib/i18n/useT";

type ConfiguratorBarProps = {
  currentStep: number;
  totalSteps: number;
  /** Le logo suit l'attribut `show-header` : masqué si la page hôte l'affiche déjà. */
  showLogo: boolean;
};

/**
 * Barre horizontale du configurateur : logo, avancement, et la jauge en pied.
 *
 * Remplace l'en-tête empilé (logo + titre + accroche + réassurance) qui se
 * répétait à chaque étape. Deux raisons :
 *
 * 1. Il consommait environ 250 px de hauteur sur les dix étapes, obligeant à
 *    faire défiler la page pour atteindre le bouton de validation — alors que le
 *    composant est censé s'intégrer sans friction dans une page WordPress.
 * 2. Voir le discours de présentation réapparaître à chaque étape est incongru :
 *    il informe une fois, au départ, pas à chaque question.
 *
 * Le bloc de présentation est donc réservé à la première étape (voir
 * `ConfiguratorIntro`), et seul ce bandeau reste permanent — calé sur la nav du
 * site de Knewledge : hauteur 72 px, filet `--border-subtle` en pied.
 */
export function ConfiguratorBar({
  currentStep,
  totalSteps,
  showLogo,
}: ConfiguratorBarProps) {
  const { m, t } = useT();
  const asset = useAsset();
  const pct = Math.round(((currentStep + 1) / totalSteps) * 100);
  const stepLabel = t(m.progress.stepOf, {
    current: currentStep + 1,
    total: totalSteps,
  });

  return (
    <div className="mb-7">
      {/* `border-x-transparent` compense la bordure de 1 px du panneau du
          tunnel, pour que les contenus restent sur le même axe gauche. */}
      <div className="flex h-[72px] items-center justify-between gap-4 border-x border-x-transparent px-6 sm:px-9">
        {showLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset("/brand/logo-kre.webp")}
            alt={m.app.logoAlt}
            width={480}
            height={140}
            /* Hauteur fixe, largeur automatique : le ratio du logo (3,43) est
               conservé quelle que soit la largeur du conteneur hôte. */
            className="h-9 w-auto shrink-0 sm:h-10"
          />
        ) : (
          <span />
        )}

        <p className="shrink-0 text-right text-[13px] font-semibold text-brand">
          {stepLabel}
          <span className="ml-2 font-black text-primary">{pct} %</span>
        </p>
      </div>

      {/* La jauge fait office de filet de séparation : une ligne au lieu de deux. */}
      <div
        className="h-1 w-full overflow-hidden bg-border-subtle"
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuetext={stepLabel}
        aria-label={m.progress.label}
      >
        <div
          className="h-full bg-primary transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
