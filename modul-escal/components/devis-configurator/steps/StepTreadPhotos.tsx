"use client";

import { asset } from "@/lib/asset";
import type { DimensionField } from "@/lib/step-config";
import type { StairLayout } from "@/lib/quote-schema";

const LAYOUT_SLUG: Record<StairLayout, string> = {
  STRAIGHT: "droite",
  BALANCED: "tournante",
  FIVE_SIDED: "cercueil",
};

const PHOTOS: Array<{ field: DimensionField; label: string; suffix: string }> = [
  { field: "widthBand", label: "Longueur", suffix: "longueur" },
  { field: "depthBand", label: "Profondeur", suffix: "profondeur" },
];

type Props = {
  layout: StairLayout;
  activeField: DimensionField | null;
};

export function StepTreadPhotos({ layout, activeField }: Props) {
  const slug = LAYOUT_SLUG[layout];

  return (
    <div className="grid grid-cols-2 gap-3">
      {PHOTOS.map(({ field, label, suffix }) => {
        const active = activeField === field;
        return (
          <div
            key={field}
            className={`overflow-hidden rounded-xl border-2 transition ${
              active ? "border-primary ring-2 ring-primary/25" : "border-border"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(`/dimensions/${slug}-${suffix}.png`)}
              alt={`${label} — marche ${slug}`}
              loading="lazy"
              className="block w-full object-contain"
            />
            <p
              className={`py-1.5 text-center text-xs font-medium ${
                active ? "bg-primary text-white" : "bg-muted-bg text-muted"
              }`}
            >
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
