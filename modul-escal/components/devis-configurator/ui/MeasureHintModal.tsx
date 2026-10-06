"use client";

import { RulerIcon, XIcon } from "@phosphor-icons/react";

import { useT } from "@/lib/i18n/useT";
import type { DimensionField } from "@/lib/step-config";

import { buttonClass } from "./Button";
import { KreDialog } from "./KreDialog";

/**
 * Rappel de mesure affiché avant l'ouverture d'un menu « Choisir… » pour les
 * marches tournantes et à 5 côtés : leurs côtés sont inégaux, il faut retenir la
 * plus grande valeur. Une seule fois par champ et par marche, sinon la modale
 * gênerait à chaque correction.
 */
export function MeasureHintModal({
  field,
  onClose,
}: {
  field: DimensionField | null;
  onClose: () => void;
}) {
  const { m } = useT();

  return (
    <KreDialog
      open={field !== null}
      onClose={onClose}
      labelledBy="kre-measure-hint-title"
    >
      <div className="mb-3 flex items-center gap-3">
        <RulerIcon aria-hidden className="size-6 shrink-0 text-primary" />
        <h3
          id="kre-measure-hint-title"
          className="text-base font-bold text-heading"
        >
          {m.measureHintModal.title}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto p-1 text-muted transition-colors hover:text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label={m.common.close}
        >
          <XIcon className="size-4" aria-hidden />
        </button>
      </div>
      <p className="mb-1 text-sm text-heading">
        {field === "depthBand"
          ? m.measureHintModal.depthBody
          : m.measureHintModal.widthBody}
      </p>
      <p className="mb-5 text-sm text-muted">{m.measureHintModal.help}</p>
      <button
        type="button"
        onClick={onClose}
        className={`${buttonClass("primary", "sm")} w-full`}
      >
        {m.common.understood}
      </button>
    </KreDialog>
  );
}
