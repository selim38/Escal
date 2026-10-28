"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

import {
  createDefaultStepConfig,
  ensureStepConfigs,
  type DimensionField,
  type StepConfigDraft,
} from "@/lib/step-config";
import { STAIR_LAYOUT_OPTIONS } from "@/lib/stair-layout-catalog";
import { treadCount, type QuoteFormDraft, type StairLayout } from "@/lib/quote-schema";
import { DEPTH_BAND_VALUES, WIDTH_BAND_VALUES } from "@/lib/quote-schema";
import { useT } from "@/lib/i18n/useT";
import { useFieldError } from "@/lib/useFieldError";

import { ButtonArrow, buttonClass } from "../ui/Button";
import { FieldError, FieldLabel, SelectShell, selectClass } from "../ui/Field";
import { MeasureHintModal } from "../ui/MeasureHintModal";
import { OptionCard } from "../ui/OptionCard";
import { StepTreadPhotos } from "./StepTreadPhotos";

/** Marches dont les côtés sont inégaux : la mesure à retenir doit être rappelée. */
const UNEVEN_LAYOUTS: StairLayout[] = ["BALANCED", "FIVE_SIDED"];

/**
 * Repli stable pour `watch("stepConfigs")`. Un `?? []` littéral créerait un
 * tableau neuf à chaque rendu, ce qui relancerait l'effet de normalisation en
 * boucle.
 */
const NO_STEP_CONFIGS: StepConfigDraft[] = [];

export function PerStepConfigurator() {
  const { watch, setValue } = useFormContext<QuoteFormDraft>();
  // Marche palière exclue : elle n'a ni type ni dimensions à renseigner.
  const stepCount = Math.max(treadCount(watch("stepCount")), 1);
  const stepConfigs = watch("stepConfigs") ?? NO_STEP_CONFIGS;
  const [requestedIndex, setActiveIndex] = useState(0);
  const [focusedField, setFocusedField] = useState<DimensionField | null>(null);
  const [hintField, setHintField] = useState<DimensionField | null>(null);
  const { m, t } = useT();

  // Le rappel de mesure ne s'affiche qu'une fois par marche et par champ : le
  // client corrige souvent sa saisie, une modale à chaque clic serait pénible.
  const seenHints = useRef<Set<string>>(new Set());
  const widthRef = useRef<HTMLSelectElement>(null);
  const depthRef = useRef<HTMLSelectElement>(null);

  const rootError = useFieldError("stepConfigs");

  // L'index actif est borné au rendu plutôt que corrigé par un `setState` dans
  // un effet : si l'utilisateur réduit le nombre de marches à l'étape 4, l'index
  // mémorisé peut dépasser. Dériver évite un rendu en cascade.
  const activeIndex = Math.min(requestedIndex, Math.max(0, stepCount - 1));

  // Aligne la longueur du tableau de configurations sur le nombre de marches.
  useEffect(() => {
    const next = ensureStepConfigs(stepConfigs, stepCount);
    if (next.length !== stepConfigs.length) {
      setValue("stepConfigs", next, { shouldValidate: true });
    }
  }, [setValue, stepConfigs, stepCount]);

  const current: StepConfigDraft =
    stepConfigs[activeIndex] ?? createDefaultStepConfig();
  const layout: StairLayout = current.layout ?? "STRAIGHT";

  const updateStep = (patch: Partial<StepConfigDraft>) => {
    const next = [...ensureStepConfigs(stepConfigs, stepCount)];
    next[activeIndex] = { ...next[activeIndex], ...patch };
    setValue("stepConfigs", next, { shouldValidate: true, shouldDirty: true });
  };

  const selectLayout = (nextLayout: StairLayout) => {
    updateStep({ layout: nextLayout });
    setFocusedField(null);
  };

  /**
   * Intercepte l'ouverture du menu pour montrer le rappel : le `<select>` natif
   * ne peut pas être rouvert par script, l'utilisateur reclique donc après
   * fermeture — on lui rend le focus.
   */
  const guardOpen = (
    field: DimensionField,
    e: React.PointerEvent<HTMLSelectElement>,
  ) => {
    if (!UNEVEN_LAYOUTS.includes(layout)) return;
    const key = `${activeIndex}:${layout}:${field}`;
    if (seenHints.current.has(key)) return;
    e.preventDefault();
    seenHints.current.add(key);
    setFocusedField(field);
    setHintField(field);
  };

  const closeHint = useCallback(() => {
    const field = hintField;
    setHintField(null);
    const el = field === "depthBand" ? depthRef.current : widthRef.current;
    el?.focus();
  }, [hintField]);

  const widthLabel =
    layout === "BALANCED"
      ? m.steps.perStep.lengthBalanced
      : layout === "FIVE_SIDED"
        ? m.steps.perStep.lengthFiveSided
        : m.catalog.dimensionField.widthBand;

  const depthLabel =
    layout === "FIVE_SIDED"
      ? m.steps.perStep.depthFiveSided
      : m.catalog.dimensionField.depthBand;

  return (
    <div className="space-y-6 border-t border-border-subtle pt-7">
      <MeasureHintModal field={hintField} onClose={closeHint} />

      <div className="text-center">
        <p className="text-[15px] font-bold text-heading">{m.steps.perStep.intro}</p>
        <p className="mt-1 text-[13.5px] text-muted">{m.steps.perStep.hint}</p>
      </div>

      {/* Onglets carrés : orange plein pour la marche en cours, beige à filet
          orange et coche pour une marche déjà renseignée. */}
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: stepCount }, (_, i) => {
          const cfg = stepConfigs[i];
          const complete = cfg?.layout && cfg?.widthBand && cfg?.depthBand;
          const isActive = i === activeIndex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                setActiveIndex(i);
                setFocusedField(null);
              }}
              className={`grid size-[38px] shrink-0 place-items-center border-[1.5px] text-sm font-bold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                isActive
                  ? "border-primary bg-primary text-on-primary"
                  : complete
                    ? "border-primary/45 bg-tint text-heading hover:border-primary"
                    : "border-border bg-surface text-heading hover:border-primary"
              }`}
              aria-label={t(m.steps.perStep.stepAria, { index: i + 1 })}
              aria-current={isActive ? "step" : undefined}
            >
              {complete && !isActive ? (
                <CheckIcon aria-hidden className="size-[17px]" />
              ) : (
                i + 1
              )}
            </button>
          );
        })}
      </div>

      {/* « Marche précédente / suivante » : libellés explicites, pour ne pas
          confondre avec la navigation entre étapes du tunnel. */}
      <div className="grid grid-cols-2 items-center gap-3 sm:flex sm:justify-between">
        <button
          type="button"
          disabled={activeIndex === 0}
          onClick={() => setActiveIndex((i) => i - 1)}
          className={`${buttonClass("secondary")} h-auto min-h-[52px] py-2 max-sm:px-3`}
        >
          <ButtonArrow dir="prev" />
          {m.steps.perStep.previous}
        </button>
        {/* Numéro de la marche en cours mis en avant (retour Escal Concept). */}
        <span
          className="col-span-2 row-start-1 text-center text-[22px] font-bold leading-tight text-heading sm:text-[26px]"
          aria-live="polite"
        >
          {t(m.steps.perStep.counter, {
            index: activeIndex + 1,
            total: stepCount,
          })}
        </span>
        <button
          type="button"
          disabled={activeIndex >= stepCount - 1}
          onClick={() => setActiveIndex((i) => i + 1)}
          // Action principale de l'écran : bouton plein, à la taille de
          // « Suivant ».
          className={`${buttonClass("primary")} h-auto min-h-[52px] py-2 max-sm:px-3`}
        >
          {m.steps.perStep.next}
          <ButtonArrow dir="next" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-5">
          <fieldset>
            <legend className="mb-2 text-[13px] font-bold text-heading">
              {m.steps.perStep.layoutLabel}
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {STAIR_LAYOUT_OPTIONS.map((id) => (
                <OptionCard
                  key={id}
                  selected={layout === id}
                  onClick={() => selectLayout(id)}
                  // Pas de coche : le bouton est trop bas pour la loger sans
                  // masquer le libellé ; fond et contour orange suffisent.
                  mark={false}
                  className="h-[46px] px-2 text-center text-sm font-semibold text-heading"
                >
                  {m.catalog.layout[id].label}
                </OptionCard>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor={`kre-step-${activeIndex}-width`}>
                {widthLabel}
              </FieldLabel>
              <SelectShell>
                <select
                  id={`kre-step-${activeIndex}-width`}
                  ref={widthRef}
                  value={current.widthBand ?? ""}
                  onPointerDown={(e) => guardOpen("widthBand", e)}
                  onFocus={() => setFocusedField("widthBand")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => {
                    setFocusedField("widthBand");
                    updateStep({
                      widthBand: e.target.value as StepConfigDraft["widthBand"],
                    });
                  }}
                  className={selectClass}
                >
                  <option value="">{m.common.choose}</option>
                  {WIDTH_BAND_VALUES.map((w) => (
                    <option key={w} value={w}>
                      {m.catalog.width[w]}
                    </option>
                  ))}
                </select>
              </SelectShell>
            </div>

            <div>
              <FieldLabel htmlFor={`kre-step-${activeIndex}-depth`}>
                {depthLabel}
              </FieldLabel>
              <SelectShell>
                <select
                  id={`kre-step-${activeIndex}-depth`}
                  ref={depthRef}
                  value={current.depthBand ?? ""}
                  onPointerDown={(e) => guardOpen("depthBand", e)}
                  onFocus={() => setFocusedField("depthBand")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => {
                    setFocusedField("depthBand");
                    updateStep({
                      depthBand: e.target.value as StepConfigDraft["depthBand"],
                    });
                  }}
                  className={selectClass}
                >
                  <option value="">{m.common.choose}</option>
                  {DEPTH_BAND_VALUES.map((d) => (
                    <option key={d} value={d}>
                      {m.catalog.depth[d]}
                    </option>
                  ))}
                </select>
              </SelectShell>
            </div>
          </div>
        </div>

        <StepTreadPhotos layout={layout} activeField={focusedField} />
      </div>

      <FieldError>{rootError}</FieldError>
    </div>
  );
}
