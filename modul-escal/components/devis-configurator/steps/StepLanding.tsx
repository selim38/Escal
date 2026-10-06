"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import { useAsset } from "@/lib/asset";
import { getSeuilImagePath } from "@/lib/decor-catalog";
import { useT } from "@/lib/i18n/useT";
import { useFieldError } from "@/lib/useFieldError";
import type { QuoteFormDraft, SeuilColor } from "@/lib/quote-schema";
import { FieldError } from "../ui/Field";
import { OptionCard, SelectedMark } from "../ui/OptionCard";
import { StepHeader } from "../ui/Typography";

/** Pastilles de couleur du seuil — données, libellés dans `catalog.seuilColor`. */
const SEUIL_COLOR_HEX: Record<SeuilColor, string> = {
  OR: "#C9A84C",
  NOIR: "#1C1C1C",
  ALUMINIUM: "#A8A9AD",
};

const SEUIL_COLORS: SeuilColor[] = ["OR", "NOIR", "ALUMINIUM"];

export function StepLanding() {
  const { watch, setValue } = useFormContext<QuoteFormDraft>();
  const landingFinish = watch("landingFinish");
  const seuilColor = watch("seuilColor");
  const decor = watch("decor");
  const seuilError = useFieldError("seuilColor");
  const { m, t } = useT();
  const asset = useAsset();

  /*
   * « Nez + seuil » est la seule finition au catalogue : elle est sélectionnée
   * d'office (recommandation Knewledge) — un clic de moins, et plus de doute
   * sur une case qu'il fallait cocher sans avoir le choix.
   */
  useEffect(() => {
    if (landingFinish !== "NEZ_SEUIL") {
      setValue("landingFinish", "NEZ_SEUIL", { shouldDirty: true });
      setValue("intermediateLanding", true, { shouldDirty: true });
    }
  }, [landingFinish, setValue]);

  const setSeuilColor = (color: SeuilColor) => {
    setValue("seuilColor", color, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-7">
      <StepHeader
        title={m.steps.landing.title}
        subtitle={m.steps.landing.subtitle}
      />

      {/* Finition présélectionnée : présentée dans l'état « sélectionné »,
          sans être un bouton puisqu'il n'y a rien à choisir. */}
      <div className="relative flex flex-col gap-1 border-[1.5px] border-primary bg-selected py-[18px] pl-[18px] pr-14">
        <span className="text-base font-bold text-heading">
          {m.steps.landing.nezSeuil.label}
        </span>
        <span className="text-sm leading-normal text-muted">
          {m.steps.landing.nezSeuil.description}
        </span>
        <SelectedMark />
      </div>

      <fieldset>
        <legend className="mb-3 text-[13px] font-bold text-heading">
          {m.steps.landing.seuilColorLabel}
        </legend>
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {SEUIL_COLORS.map((id) => {
            const label = m.catalog.seuilColor[id];
            return (
              <OptionCard
                key={id}
                selected={seuilColor === id}
                onClick={() => setSeuilColor(id)}
                className="flex flex-col overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset(getSeuilImagePath(id, decor))}
                  alt={
                    decor
                      ? t(m.steps.landing.seuilPhotoAltDecor, {
                          color: label,
                          decor: m.catalog.decor[decor],
                        })
                      : t(m.steps.landing.seuilPhotoAlt, { color: label })
                  }
                  loading="lazy"
                  decoding="async"
                  width={480}
                  height={640}
                  className="block aspect-[3/4] w-full object-cover"
                />
                <span className="flex items-center justify-center gap-2 px-2 py-3 text-sm font-semibold text-heading sm:text-[14.5px]">
                  <span
                    className="size-3.5 shrink-0 border border-black/10"
                    style={{ backgroundColor: SEUIL_COLOR_HEX[id] }}
                    aria-hidden
                  />
                  {label}
                </span>
              </OptionCard>
            );
          })}
        </div>
        <FieldError>{seuilError}</FieldError>
      </fieldset>
    </div>
  );
}
