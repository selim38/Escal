"use client";

import { useAsset } from "@/lib/asset";
import { useT } from "@/lib/i18n/useT";

/**
 * Avancement du tunnel, en tête de la carte du configurateur.
 *
 * Recommandation Knewledge : la barre ne s'étend plus jusqu'aux bords, pour
 * ne pas être prise pour un élément décoratif. Elle s'aligne donc sur les
 * marges intérieures de la carte, sous le libellé « Étape x sur 9 ».
 */
export function ConfiguratorProgress({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const { m, t } = useT();
  const pct = Math.round(((currentStep + 1) / totalSteps) * 100);
  const stepLabel = t(m.progress.stepOf, {
    current: currentStep + 1,
    total: totalSteps,
  });

  return (
    <div className="px-5 pt-6 sm:px-9 lg:px-11">
      <div className="flex items-baseline justify-between gap-4 text-[13px] font-semibold text-subtle">
        <span>{stepLabel}</span>
        {/* Doublon visuel du libellé : masqué aux lecteurs d'écran, qui ont déjà
            la valeur de la jauge. */}
        <span aria-hidden className="text-primary">
          {pct} %
        </span>
      </div>
      <div
        className="mt-2.5 h-[3px] bg-track"
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuetext={stepLabel}
        aria-label={m.progress.label}
      >
        <div
          className="h-full bg-primary transition-[width] duration-[420ms] ease-out motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Logo au-dessus de la carte (attribut `show-header`). Sur le site, l'en-tête
 * de la page porte déjà le logo : l'intégration WordPress le masque.
 */
export function ConfiguratorLogo() {
  const { m } = useT();
  const asset = useAsset();
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset("/brand/logo-kre.webp")}
      alt={m.app.logoAlt}
      width={480}
      height={140}
      /* Hauteur fixe, largeur automatique : le ratio du logo (3,43) est
         conservé quelle que soit la largeur du conteneur hôte. */
      className="mb-6 block h-9 w-auto self-start sm:h-10"
    />
  );
}
