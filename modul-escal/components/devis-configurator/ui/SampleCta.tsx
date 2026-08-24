"use client";

import { Mail } from "lucide-react";

import { KRE_EVENTS, pushEvent } from "@/lib/analytics";
import { useKreConfig } from "@/lib/config";
import { useT } from "@/lib/i18n/useT";

/**
 * CTA « Demander un échantillon » (attribut `show-sample-cta`).
 *
 * Volontairement sans flux backend : ouvre un `mailto:` pré-rempli vers
 * `recipient-email`. Sans destinataire configuré, le CTA n'est pas rendu
 * (un mailto sans adresse ne mène à rien) et un avertissement est loggué.
 */
export function SampleCta({
  decorLabel,
  onRequest,
  className = "",
}: {
  /** Décor sélectionné, injecté dans le corps du message. */
  decorLabel?: string;
  /** Callback additionnel au clic (le tracking est émis automatiquement). */
  onRequest?: () => void;
  className?: string;
}) {
  const { showSampleCta, recipientEmail } = useKreConfig();
  const { m, t } = useT();

  if (!showSampleCta) return null;

  if (!recipientEmail) {
    if (typeof console !== "undefined") {
      console.warn(`[kre-configurateur] ${m.sample.unavailable}`);
    }
    return null;
  }

  const body = decorLabel
    ? t(m.sample.bodyWithDecor, { decor: decorLabel })
    : m.sample.bodyWithoutDecor;

  const href = `mailto:${recipientEmail}?subject=${encodeURIComponent(
    m.sample.subject,
  )}&body=${encodeURIComponent(body)}`;

  return (
    <div className={`flex justify-center ${className}`}>
      <a
        href={href}
        onClick={() => {
          pushEvent(KRE_EVENTS.sampleRequest, {
            ...(decorLabel ? { decor: decorLabel } : {}),
          });
          onRequest?.();
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-surface px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Mail className="size-4 shrink-0" aria-hidden />
        {m.sample.cta}
      </a>
    </div>
  );
}
