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

/**
 * Photos de mesure à côté des champs. La photo du champ en cours de saisie
 * passe en surbrillance : contour et légende orange.
 */
export function StepTreadPhotos({ layout, activeField }: Props) {
  const asset = useAsset();
  const { m, t } = useT();
  const slug = m.steps.dimensions.layoutSlug[layout];

  return (
    <div className="grid grid-cols-2 content-start gap-3">
      {PHOTO_FIELDS.map(({ field, suffix }) => {
        const active = activeField === field;
        const label = m.catalog.dimensionField[field];
        return (
          <figure
            key={field}
            className={`border transition-colors duration-200 ${
              active ? "border-primary" : "border-border-subtle"
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
              className="block aspect-[3/4] w-full object-cover"
            />
            <figcaption
              className={`py-2 text-center text-[13px] font-semibold transition-colors duration-200 ${
                active ? "bg-primary text-on-primary" : "bg-tint text-heading"
              }`}
            >
              {label}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
