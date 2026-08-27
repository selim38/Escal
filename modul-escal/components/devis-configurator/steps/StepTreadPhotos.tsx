"use client";

import { useAsset } from "@/lib/asset";
import { useT } from "@/lib/i18n/useT";
import type { DimensionField } from "@/lib/step-config";
import type { StairLayout } from "@/lib/quote-schema";

const PHOTO_FIELDS: Array<{ field: DimensionField; suffix: string }> = [
  { field: "widthBand", suffix: "longueur" },
  { field: "depthBand", suffix: "profondeur" },
];

type Props = {
  layout: StairLayout;
  activeField: DimensionField | null;
};

export function StepTreadPhotos({ layout, activeField }: Props) {
  const asset = useAsset();
  const { m, t } = useT();
  const slug = m.steps.dimensions.layoutSlug[layout];

  return (
    <div className="grid grid-cols-2 gap-3">
      {PHOTO_FIELDS.map(({ field, suffix }) => {
        const active = activeField === field;
        const label = m.catalog.dimensionField[field];
        return (
          <div
            key={field}
            className={`overflow-hidden rounded-xl border-2 transition ${
              active ? "border-primary ring-2 ring-primary/25" : "border-border"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(`/dimensions/${slug}-${suffix}.webp`)}
              alt={t(m.steps.dimensions.photoAlt, { field: label, layout: slug })}
              loading="lazy"
              decoding="async"
              width={800}
              height={1067}
              className="block w-full object-contain"
            />
            <p
              className={`py-1.5 text-center text-xs font-medium ${
                active ? "bg-primary text-on-primary" : "bg-muted-bg text-muted"
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
