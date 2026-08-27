"use client";

import { useKreConfig } from "@/lib/config";
import { useT } from "@/lib/i18n/useT";

import { KreDialog } from "./KreDialog";

/** Profondeur maximale au catalogue (mm). Au-delà : configuration sur-mesure. */
export const MAX_DEPTH_MM = 630;

/**
 * Affichée quand la profondeur saisie dépasse le catalogue.
 * Composant unique — était dupliqué à l'identique dans StepDimensions et
 * DimensionsBandsFields.
 */
export function DepthBlockedModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { m, t } = useT();
  const { recipientEmail } = useKreConfig();
  const supportEmail = recipientEmail || m.app.supportEmail;

  return (
    <KreDialog open={open} onClose={onClose} labelledBy="kre-depth-modal-title">
      <div className="mb-3 flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warning-tint text-2xl"
        >
          ⚠️
        </span>
        <h2
          id="kre-depth-modal-title"
          className="text-base font-semibold text-foreground"
        >
          {m.depthModal.title}
        </h2>
      </div>
      <p className="mb-1 text-sm text-muted">
        {t(m.depthModal.body1, { max: MAX_DEPTH_MM })}
      </p>
      <p className="mb-5 text-sm text-muted">{m.depthModal.body2}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <a
          href={`mailto:${supportEmail}`}
          className="inline-flex w-full items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-auto"
        >
          {m.common.contactSupport}
        </a>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted hover:bg-muted-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto"
        >
          {m.depthModal.fix}
        </button>
      </div>
    </KreDialog>
  );
}
