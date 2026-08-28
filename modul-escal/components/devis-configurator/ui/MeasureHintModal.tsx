"use client";

import { X } from "lucide-react";

import { useT } from "@/lib/i18n/useT";
import type { DimensionField } from "@/lib/step-config";

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
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl"
        >
          📏
        </span>
        <h3
          id="kre-measure-hint-title"
          className="text-base font-semibold text-brand"
        >
          {m.measureHintModal.title}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto rounded-lg p-1 text-muted hover:bg-muted-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label={m.common.close}
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <p className="mb-1 text-sm text-foreground">
        {field === "depthBand"
          ? m.measureHintModal.depthBody
          : m.measureHintModal.widthBody}
      </p>
      <p className="mb-5 text-sm text-muted">{m.measureHintModal.help}</p>
      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {m.common.understood}
      </button>
    </KreDialog>
  );
}
