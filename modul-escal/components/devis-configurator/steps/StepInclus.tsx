"use client";

import {
  CheckCircle2,
  ChevronRight,
  Package,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { useFormContext } from "react-hook-form";

import { calculatePrice } from "@/lib/calculatePrice";
import { useKreConfig } from "@/lib/config";
import type { Messages } from "@/lib/i18n";
import { useT } from "@/lib/i18n/useT";
import type { Translator } from "@/lib/i18n/useT";
import { quotePricingPreviewSchema, type QuoteFormDraft } from "@/lib/quote-schema";

/** Emojis du matériel inclus — même ordre que `steps.included.materials`. */
const MATERIAL_EMOJIS = ["📏", "✏️", "📐", "🔲", "⬜", "🔩", "🪝", "📦"];

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-success-tint px-2 py-0.5 text-xs font-semibold text-success">
      <CheckCircle2 className="size-3 shrink-0" aria-hidden />
      {children}
    </span>
  );
}

/** Résumé « 3 débordantes · 2 ouvertes » des embouts configurés. */
function summarizeEndCaps(
  configs: QuoteFormDraft["stepEndCapConfigs"],
  m: Messages,
  t: Translator["t"],
): string | null {
  if (!configs || configs.length === 0) return null;
  const plural = (n: number) => (n > 1 ? "s" : "");
  const overhang = configs.filter((c) => c.cap === "OVERHANGING").length;
  const open = configs.filter((c) => c.cap === "OPEN_STEP").length;
  const parts: string[] = [];
  if (overhang > 0) {
    parts.push(
      t(m.steps.included.endCapOverhanging, {
        count: overhang,
        plural: plural(overhang),
      }),
    );
  }
  if (open > 0) {
    parts.push(
      t(m.steps.included.endCapOpen, { count: open, plural: plural(open) }),
    );
  }
  return parts.length > 0 ? parts.join(" · ") : m.steps.included.endCapNone;
}

/**
 * Estimation affichée avant la capture du lead. `null` tant que la
 * configuration est incomplète — le schéma d'aperçu fait office de garde.
 */
function previewPrice(values: QuoteFormDraft) {
  const parsed = quotePricingPreviewSchema.safeParse({
    riserOption: values.riserOption,
    stepCount: values.stepCount,
    widthBand: values.widthBand,
    depthBand: values.depthBand,
    stepConfigs: values.stepConfigs,
    openSides: values.openSides,
    intermediateLanding: values.intermediateLanding,
  });
  return parsed.success ? calculatePrice(parsed.data) : null;
}

function RecapRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border py-2 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-right text-sm font-semibold text-brand">
        {value}
      </span>
    </div>
  );
}

export function StepInclus() {
  const { watch } = useFormContext<QuoteFormDraft>();
  const values = watch();
  const { m, t } = useT();
  const { locale } = useKreConfig();

  const stepCount = values.stepCount ?? 0;
  const glueCount = stepCount > 0 ? Math.ceil(stepCount / 3) : null;
  const plural = (n: number) => (n > 1 ? "s" : "");

  // Pas de `useMemo` : le compilateur React de Next 16 mémoïse ces dérivations
  // automatiquement, et une mémoïsation manuelle dont les dépendances incluent
  // le dictionnaire de traduction l'empêche de compiler ce composant.
  const endCapSummary = summarizeEndCaps(values.stepEndCapConfigs, m, t);
  const estimate = previewPrice(values);

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold tracking-tight text-heading sm:text-2xl">
          {m.steps.included.title}
        </h2>
        <p className="text-sm text-muted">{m.steps.included.subtitle}</p>
      </div>

      {/* ── Récap configuration ───────────────────────────────── */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="mb-3 text-sm font-bold text-brand">
          {m.steps.included.configTitle}
        </h3>
        <div>
          {stepCount > 0 && (
            <RecapRow
              label={m.steps.included.rowSteps}
              value={t(m.steps.included.valueSteps, {
                count: stepCount,
                plural: plural(stepCount),
              })}
            />
          )}
          {values.decor && (
            <RecapRow
              label={m.steps.included.rowDecor}
              value={m.catalog.decor[values.decor]}
            />
          )}
          {values.riserOption && values.riserOption !== "NONE" && (
            <RecapRow
              label={m.steps.included.rowRiser}
              value={[
                m.catalog.riser[values.riserOption].label,
                values.riserHeightMm ? `(${values.riserHeightMm} mm)` : null,
              ]
                .filter(Boolean)
                .join(" ")}
            />
          )}
          {endCapSummary && (
            <RecapRow
              label={m.steps.included.rowEndCaps}
              value={endCapSummary}
            />
          )}
          {values.landingFinish && values.landingFinish !== "NONE" && (
            <RecapRow
              label={m.steps.included.rowLandingFinish}
              value={[
                m.catalog.landingFinish[values.landingFinish],
                values.seuilColor
                  ? `— ${m.catalog.seuilColor[values.seuilColor]}`
                  : null,
              ]
                .filter(Boolean)
                .join(" ")}
            />
          )}
          {glueCount && (
            <RecapRow
              label={m.steps.included.rowConsumables}
              value={t(m.steps.included.valueConsumables, {
                count: glueCount,
                plural: plural(glueCount),
              })}
            />
          )}
        </div>
      </section>

      {/* ── Matériel inclus ───────────────────────────────────── */}
      <section className="space-y-3 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-primary" aria-hidden />
            <h3 className="text-sm font-bold text-brand">
              {m.steps.included.materialsTitle}
            </h3>
          </div>
          <Badge>{m.steps.included.priceIncluded}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {m.steps.included.materials.map((label, i) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-3 text-center"
            >
              <div
                aria-hidden
                className="flex size-10 items-center justify-center rounded-xl bg-background text-xl"
              >
                {MATERIAL_EMOJIS[i]}
              </div>
              <span className="text-xs font-medium text-brand">{label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted">{m.steps.included.materialsNote}</p>
      </section>

      {/* ── Tutoriels vidéo ───────────────────────────────────── */}
      <section className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5">
        <div
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
        >
          <PlayCircle className="size-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-brand">
            {m.steps.included.tutorialsTitle}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {m.steps.included.tutorialsBody}
          </p>
          <Badge>{m.steps.included.priceIncluded}</Badge>
        </div>
      </section>

      {/* ── Prix estimé ───────────────────────────────────────── */}
      <section className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-surface p-6 text-center shadow-sm">
        <div className="mb-2 flex items-center justify-center gap-2 text-brand">
          <Sparkles className="size-4 text-primary" aria-hidden />
          <span className="text-sm font-medium">
            {m.steps.included.priceLabel}
          </span>
        </div>
        <div aria-live="polite">
          {estimate ? (
            <p className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
              {estimate.materialsSubtotal.toLocaleString(locale)} €
            </p>
          ) : (
            <p className="text-lg text-muted">
              {m.steps.included.priceUnavailable}
            </p>
          )}
        </div>
        <p className="mt-2 text-xs text-muted">{m.steps.included.priceNote}</p>
      </section>

      {/* ── CTA étape suivante ────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-muted-bg/60 p-4">
        <p className="text-sm text-brand">
          <span className="font-semibold">
            {m.steps.included.nextCtaStrong}
          </span>{" "}
          {m.steps.included.nextCtaBody}
        </p>
        <div className="mt-2 flex items-center gap-1 text-xs text-primary">
          <ChevronRight className="size-3.5" aria-hidden />
          {m.steps.included.nextCtaLink}
        </div>
      </div>
    </div>
  );
}
