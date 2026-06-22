"use client";

import { CheckCircle2 } from "lucide-react";

const MATERIELS = [
  { emoji: "📏", label: "Patron de mesure" },
  { emoji: "✏️", label: "Crayon de marquage" },
  { emoji: "📐", label: "Règles de pose" },
  { emoji: "🔲", label: "Stiro de calage" },
  { emoji: "⬜", label: "Cales silicone" },
];

const ACCESSOIRES = [
  { emoji: "🔩", label: "Tasseaux de calage" },
  { emoji: "🧴", label: "Colle de pose" },
  { emoji: "🪝", label: "Visserie & fixations" },
  { emoji: "📦", label: "Emballage protection" },
];

const TUTORIELS = [
  { emoji: "📐", label: "Prise de mesures", description: "Comment mesurer vos marches avec précision" },
  { emoji: "🪚", label: "Découpe des marches", description: "Technique de coupe pour un ajustement parfait" },
  { emoji: "🔧", label: "Pose & fixation", description: "Étapes de pose et encollage" },
  { emoji: "✨", label: "Finitions", description: "Raccords, joints et retouches finales" },
];

function IncludedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
      <CheckCircle2 className="size-3 shrink-0" />
      Compris dans le prix
    </span>
  );
}

export function StepInclus() {
  return (
    <div className="space-y-8">
      {/* ── Titre ──────────────────────────────────────────────────── */}
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold tracking-tight text-[#1e2a4a] sm:text-2xl">
          Tout ce qui est inclus
        </h2>
        <p className="text-sm text-muted">
          Votre kit comprend tout le nécessaire pour une pose réussie.
        </p>
      </div>

      {/* ── Matériels fournis ──────────────────────────────────────── */}
      <section className="space-y-3 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-brand">Matériels fournis</h3>
          <IncludedBadge />
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2 md:grid-cols-5">
          {MATERIELS.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white p-3 text-center"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#f5f0eb] text-xl sm:size-12 sm:text-2xl">
                {item.emoji}
              </div>
              <span className="text-xs font-medium text-brand">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Accessoires & Colles ───────────────────────────────────── */}
      <section className="space-y-3 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-brand">Accessoires &amp; Colles</h3>
          <IncludedBadge />
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2 md:grid-cols-4">
          {ACCESSOIRES.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white p-3 text-center"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#f5f0eb] text-xl sm:size-12 sm:text-2xl">
                {item.emoji}
              </div>
              <span className="text-xs font-medium text-brand">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Notice & Tutoriels ─────────────────────────────────────── */}
      <section className="space-y-3 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-brand">Notice de montage &amp; Tutoriels</h3>
          <IncludedBadge />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TUTORIELS.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border border-border bg-white p-3"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#f5f0eb] text-xl">
                {item.emoji}
              </div>
              <div>
                <p className="text-xs font-semibold text-brand">{item.label}</p>
                <p className="text-xs text-muted">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
