"use client";

import { CheckIcon, PackageIcon, PlayCircleIcon } from "@phosphor-icons/react";
import { useFormContext } from "react-hook-form";

import { useAsset } from "@/lib/asset";
import { calculatePrice } from "@/lib/calculatePrice";
import { useKreConfig } from "@/lib/config";
import type { Messages } from "@/lib/i18n";
import { useT } from "@/lib/i18n/useT";
import type { Translator } from "@/lib/i18n/useT";
import { STAIR_LAYOUT_OPTIONS } from "@/lib/stair-layout-catalog";
import { quotePricingPreviewSchema, type QuoteFormDraft } from "@/lib/quote-schema";
import { StepHeader, Tag } from "../ui/Typography";

/**
 * Photos du matériel inclus, sous `public/materiel/`. Même ordre que
 * `steps.included.materials` — le libellé et la photo sont appariés par index.
 */
const MATERIAL_PHOTOS = [
  "metre",
  "regle",
  "feutre-effacable",
  "scotch-papier",
  "scie-sauteuse",
  "lames-dent-inverse",
  "lame-acier",
  "cutter",
  "cale-a-poncer",
  "degraissant",
  "acetone",
  "colle-polyurethane",
  "pistolet-cartouche",
  "silicone",
  "spatule-silicone",
  "produit-lissage",
  "chiffon",
  "gants",
];

/** « Compris dans le prix » — toujours accolé au titre de la section. */
function IncludedTag({ children }: { children: React.ReactNode }) {
  return <Tag icon={<CheckIcon aria-hidden className="size-3.5" />}>{children}</Tag>;
}

/** Ligne « Dimensions » : fourchettes uniques, ou répartition par type de marche. */
function summarizeDimensions(
  values: QuoteFormDraft,
  m: Messages,
  t: Translator["t"],
): string | null {
  if (values.uniformStepDimensions === true) {
    if (!values.widthBand || !values.depthBand) return null;
    return t(m.steps.included.valueDimensionsUniform, {
      width: m.catalog.width[values.widthBand],
      depth: m.catalog.depth[values.depthBand],
    });
  }
  const configs = values.stepConfigs;
  if (values.uniformStepDimensions === false && configs) {
    const plural = (n: number) => (n > 1 ? "s" : "");
    const detail = STAIR_LAYOUT_OPTIONS.map((layout) => {
      const count = configs.filter((c) => c.layout === layout).length;
      return count > 0
        ? t(m.steps.included.layoutCount[layout], { count, plural: plural(count) })
        : null;
    })
      .filter(Boolean)
      .join(" · ");
    return t(m.steps.included.valueDimensionsPerStep, { detail });
  }
  return null;
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
    <div className="flex items-start justify-between gap-4 border-t border-border-subtle py-3 text-[14.5px]">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-bold text-heading">{value}</dd>
    </div>
  );
}

export function StepInclus() {
  const { watch } = useFormContext<QuoteFormDraft>();
  const values = watch();
  const { m, t } = useT();
  const { locale } = useKreConfig();
  const asset = useAsset();

  const stepCount = values.stepCount ?? 0;
  const glueCount = stepCount > 0 ? Math.ceil(stepCount / 3) : null;
  const plural = (n: number) => (n > 1 ? "s" : "");

  // Pas de `useMemo` : le compilateur React de Next 16 mémoïse ces dérivations
  // automatiquement, et une mémoïsation manuelle dont les dépendances incluent
  // le dictionnaire de traduction l'empêche de compiler ce composant.
  const endCapSummary = summarizeEndCaps(values.stepEndCapConfigs, m, t);
  const dimensionsSummary = summarizeDimensions(values, m, t);
  const estimate = previewPrice(values);

  return (
    <div className="space-y-7">
      <StepHeader
        title={m.steps.included.title}
        subtitle={m.steps.included.subtitle}
      />

      {/* ── Récap configuration : une ligne par étape, dans l'ordre ── */}
      <section className="border border-border-subtle px-5 pb-2 pt-5 sm:px-6">
        <h3 className="mb-1.5 text-[15px] font-bold text-heading">
          {m.steps.included.configTitle}
        </h3>
        <dl>
          {values.staircaseType && (
            <RecapRow
              label={m.steps.included.rowStaircaseType}
              value={
                values.staircaseType === "OPEN"
                  ? m.steps.staircaseType.open.label
                  : m.steps.staircaseType.closed.label
              }
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
          {stepCount > 0 && (
            <RecapRow
              label={m.steps.included.rowSteps}
              value={t(m.steps.included.valueSteps, {
                count: stepCount,
                plural: plural(stepCount),
              })}
            />
          )}
          {dimensionsSummary && (
            <RecapRow
              label={m.steps.included.rowDimensions}
              value={dimensionsSummary}
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
        </dl>
      </section>

      {/* ── Matériel inclus : vignettes réduites, 6 par ligne en desktop,
             pour ne pas diluer l'attention avant le prix ─────────────── */}
      <section className="border border-border-subtle p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h3 className="flex items-center gap-2.5 text-[15px] font-bold text-heading">
            <PackageIcon aria-hidden className="size-[21px] text-primary" />
            {m.steps.included.materialsTitle}
          </h3>
          <IncludedTag>{m.steps.included.priceIncluded}</IncludedTag>
        </div>
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {m.steps.included.materials.map((label, i) => (
            <li key={label} className="border border-border-subtle">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset(`/materiel/${MATERIAL_PHOTOS[i]}.webp`)}
                alt={t(m.steps.included.materialPhotoAlt, { item: label })}
                loading="lazy"
                decoding="async"
                width={400}
                height={267}
                className="block aspect-[4/3] w-full bg-muted-bg object-cover"
              />
              <span className="block px-1.5 py-2 text-center text-xs font-semibold leading-tight text-heading">
                {label}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[12.5px] text-subtle">
          {m.steps.included.materialsNote}
        </p>
      </section>

      {/* ── Tutoriels vidéo ───────────────────────────────────── */}
      <section className="flex items-start gap-3.5 border border-border-subtle px-5 py-5 sm:px-6">
        <PlayCircleIcon aria-hidden className="size-[30px] shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="text-[15px] font-bold text-heading">
              {m.steps.included.tutorialsTitle}
            </h3>
            <IncludedTag>{m.steps.included.priceIncluded}</IncludedTag>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            {m.steps.included.tutorialsBody}
            <br />
            {m.steps.included.tutorialsDevices}
          </p>
        </div>
      </section>

      {/* ── Prix estimé — « Encadré à halo » du design system : aplat beige
             soutenu et halo orange radial en partie haute ──────────── */}
      <section className="relative overflow-hidden bg-tint-strong px-6 py-8 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,rgb(255_109_27/0.16)_0%,rgb(255_109_27/0.055)_34%,rgb(255_109_27/0)_62%)]"
        />
        <div className="relative">
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-subtle">
            {m.steps.included.priceLabel}
          </h3>
          <div aria-live="polite">
            {estimate ? (
              <p className="mt-2 text-[44px] font-semibold leading-none tracking-tighter text-primary sm:text-[56px]">
                {estimate.materialsSubtotal.toLocaleString(locale)} €
              </p>
            ) : (
              <p className="mt-2 text-lg text-muted">
                {m.steps.included.priceUnavailable}
              </p>
            )}
          </div>
          <p className="mt-2.5 text-[13.5px] text-muted">
            {m.steps.included.priceNote}
          </p>
        </div>
      </section>

      {/* ── Suite : texte simple, sans aplat, pour laisser le prix seul
             au premier plan ──────────────────────────────────────── */}
      <p className="text-sm leading-relaxed text-heading">
        <strong className="font-bold">{m.steps.included.nextCtaStrong}</strong>{" "}
        {m.steps.included.nextCtaBody}
      </p>
    </div>
  );
}
