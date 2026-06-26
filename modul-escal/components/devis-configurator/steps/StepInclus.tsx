"use client";

import { useMemo } from "react";
import { CheckCircle2, ChevronRight, Package, PlayCircle, Sparkles } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { calculatePrice } from "@/lib/calculatePrice";
import { quotePricingPreviewSchema, type QuoteFormDraft } from "@/lib/quote-schema";
import {
  DECOR_LABELS,
  LANDING_FINISH_LABELS,
  RISER_OPTION_LABELS,
  SEUIL_COLOR_LABELS,
} from "@/lib/quote-labels";

const MATERIELS = [
  { emoji: "📏", label: "Patron de mesure" },
  { emoji: "✏️", label: "Crayon de marquage" },
  { emoji: "📐", label: "Règles de pose" },
  { emoji: "🔲", label: "Stiro de calage" },
  { emoji: "⬜", label: "Cales silicone" },
  { emoji: "🔩", label: "Tasseaux de calage" },
  { emoji: "🪝", label: "Visserie & fixations" },
  { emoji: "📦", label: "Emballage protection" },
];

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
      <CheckCircle2 className="size-3 shrink-0" />
      {children}
    </span>
  );
}

function RecapRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border py-2 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-right text-sm font-semibold text-brand">{value}</span>
    </div>
  );
}

export function StepInclus() {
  const { watch } = useFormContext<QuoteFormDraft>();
  const values = watch();

  const stepCount = values.stepCount ?? 0;
  const glueCount = stepCount > 0 ? Math.ceil(stepCount / 3) : null;

  const endCapSummary = useMemo(() => {
    const configs = values.stepEndCapConfigs;
    if (!configs || configs.length === 0) return null;
    const overhang = configs.filter((c) => c.cap === "OVERHANGING").length;
    const open = configs.filter((c) => c.cap === "OPEN_STEP").length;
    const parts: string[] = [];
    if (overhang > 0) parts.push(`${overhang} débordante${overhang > 1 ? "s" : ""}`);
    if (open > 0) parts.push(`${open} ouverte${open > 1 ? "s" : ""}`);
    return parts.length > 0 ? parts.join(" · ") : "Sans embout";
  }, [values.stepEndCapConfigs]);

  const estimate = useMemo(() => {
    const parsed = quotePricingPreviewSchema.safeParse({
      riserOption: values.riserOption,
      stepCount: values.stepCount,
      widthBand: values.widthBand,
      depthBand: values.depthBand,
      stepConfigs: values.stepConfigs,
      openSides: values.openSides,
      intermediateLanding: values.intermediateLanding,
    });
    if (!parsed.success) return null;
    return calculatePrice(parsed.data);
  }, [
    values.riserOption, values.stepCount, values.widthBand,
    values.depthBand, values.stepConfigs, values.openSides, values.intermediateLanding,
  ]);

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold tracking-tight text-[#1e2a4a] sm:text-2xl">
          Récapitulatif de votre offre
        </h2>
        <p className="text-sm text-muted">
          Vérifiez votre configuration avant de passer à l'étape finale.
        </p>
      </div>

      {/* ── Récap configuration ───────────────────────────────── */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="mb-3 text-sm font-bold text-brand">Votre configuration</h3>
        <div>
          {stepCount > 0 && (
            <RecapRow
              label="Marches"
              value={`${stepCount} marche${stepCount > 1 ? "s" : ""}`}
            />
          )}
          {values.decor && (
            <RecapRow label="Décor" value={DECOR_LABELS[values.decor]} />
          )}
          {values.riserOption && values.riserOption !== "NONE" && (
            <RecapRow
              label="Contremarches"
              value={[
                RISER_OPTION_LABELS[values.riserOption],
                values.riserHeightMm ? `(${values.riserHeightMm} mm)` : null,
              ].filter(Boolean).join(" ")}
            />
          )}
          {endCapSummary && (
            <RecapRow label="Embouts de marche" value={endCapSummary} />
          )}
          {values.landingFinish && values.landingFinish !== "NONE" && (
            <RecapRow
              label="Finition marche palière"
              value={[
                LANDING_FINISH_LABELS[values.landingFinish],
                values.seuilColor ? `— ${SEUIL_COLOR_LABELS[values.seuilColor]}` : null,
              ].filter(Boolean).join(" ")}
            />
          )}
          {glueCount && (
            <RecapRow
              label="Consommables"
              value={`${glueCount} tube${glueCount > 1 ? "s" : ""} de colle · 1 tube de silicone`}
            />
          )}
        </div>
      </section>

      {/* ── Matériel inclus ───────────────────────────────────── */}
      <section className="space-y-3 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-primary" />
            <h3 className="text-sm font-bold text-brand">Matériel inclus</h3>
          </div>
          <Badge>Compris dans le prix</Badge>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {MATERIELS.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white p-3 text-center"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#f5f0eb] text-xl">
                {item.emoji}
              </div>
              <span className="text-xs font-medium text-brand">{item.label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted">
          Des photos détaillées du contenu du kit seront ajoutées prochainement.
        </p>
      </section>

      {/* ── Tutoriels vidéo ───────────────────────────────────── */}
      <section className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <PlayCircle className="size-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-brand">Tutoriels de montage en vidéo</h3>
          <p className="mt-1 text-sm text-muted">
            L'ensemble des tutoriels de montage sous forme de vidéo est inclus dans votre commande —
            prise de mesures, découpe, pose, finitions.
          </p>
          <Badge>Compris dans le prix</Badge>
        </div>
      </section>

      {/* ── Prix estimé ───────────────────────────────────────── */}
      <section className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-surface p-6 text-center shadow-sm">
        <div className="flex items-center justify-center gap-2 text-brand mb-2">
          <Sparkles className="size-4 text-primary" />
          <span className="text-sm font-medium">Prix estimé des matériaux</span>
        </div>
        {estimate ? (
          <p className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
            {estimate.materialsSubtotal.toLocaleString("fr-FR")} €
          </p>
        ) : (
          <p className="text-lg text-muted">
            Complétez les étapes précédentes pour afficher l'estimation.
          </p>
        )}
        <p className="mt-2 text-xs text-muted">
          Estimation matériaux uniquement, hors pose et livraison.
        </p>
      </section>

      {/* ── CTA étape suivante ────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-muted-bg/60 p-4">
        <p className="text-sm text-brand">
          <span className="font-semibold">Pour finaliser votre devis,</span> renseignez vos
          coordonnées et ajoutez 3 photos de votre escalier à l'étape suivante.
          Un technicien vous recontactera rapidement.
        </p>
        <div className="mt-2 flex items-center gap-1 text-xs text-primary">
          <ChevronRight className="size-3.5" />
          Étape suivante : coordonnées &amp; photos
        </div>
      </div>
    </div>
  );
}
