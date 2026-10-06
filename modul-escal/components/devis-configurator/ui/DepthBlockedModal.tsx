"use client";

import { WarningIcon } from "@phosphor-icons/react";

import { useKreConfig } from "@/lib/config";
import { useT } from "@/lib/i18n/useT";

import { buttonClass } from "./Button";
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
        <WarningIcon aria-hidden className="size-6 shrink-0 text-primary" />
        <h2
          id="kre-depth-modal-title"
          className="text-base font-bold text-heading"
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
          className={`${buttonClass("primary", "sm")} w-full sm:w-auto`}
        >
          {m.common.contactSupport}
        </a>
        <button
          type="button"
          onClick={onClose}
          className={`${buttonClass("secondary", "sm")} w-full sm:w-auto`}
        >
          {m.depthModal.fix}
        </button>
      </div>
    </KreDialog>
  );
}
