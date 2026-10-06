"use client";

import { Fragment, useEffect, useState } from "react";
import { ArrowLeftIcon, CheckCircleIcon, XIcon } from "@phosphor-icons/react";
import { useFormContext } from "react-hook-form";

import { useAsset } from "@/lib/asset";
import { useT } from "@/lib/i18n/useT";
import type {
  QuoteFormDraft,
  StepEndCapConfig,
  EndSide,
} from "@/lib/quote-schema";
import { OptionCard } from "../ui/OptionCard";
import { StepHeader } from "../ui/Typography";

type SubStep = "between2Walls" | "capType" | "side";

/** Repli stable pour `watch` : un `?? []` littéral changerait à chaque rendu. */
const NO_CONFIGS: StepEndCapConfig[] = [];

/** Grille commune aux lignes « Marche n — valeur — action ». */
const ROW_CLASS =
  "grid grid-cols-[minmax(0,90px)_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-sm sm:grid-cols-[110px_minmax(0,1fr)_auto]";

/** Petit lien d'action dans le panneau (« Retour », « Annuler »). */
const PANEL_LINK_CLASS =
  "inline-flex items-center gap-1.5 text-[13px] font-semibold text-subtle transition-colors hover:text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/** Option d'embout illustrée : la photo porte l'explication, le texte la nomme. */
function PhotoChoice({
  src,
  alt,
  label,
  selected,
  onClick,
}: {
  src: string;
  alt: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <OptionCard
      selected={selected}
      onClick={onClick}
      // Mobile : vignette à gauche, libellé à droite. À partir de 640 px :
      // trois colonnes, photo pleine largeur au-dessus du libellé — assez
      // grande pour distinguer les différences techniques.
      className="flex items-center gap-4 overflow-hidden text-left sm:flex-col sm:items-stretch sm:gap-0"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={640}
        height={853}
        className="block aspect-[3/4] w-[84px] shrink-0 object-cover sm:w-full"
      />
      <span className="py-3 pr-3 text-[15px] font-bold leading-snug text-heading sm:px-2 sm:text-center sm:text-sm">
        {label}
      </span>
    </OptionCard>
  );
}

export function StepEndCap() {
  const { watch, setValue } = useFormContext<QuoteFormDraft>();
  const stepCount = watch("stepCount") ?? 0;
  const rawConfigs = watch("stepEndCapConfigs") ?? NO_CONFIGS;
  const { m, t } = useT();
  const asset = useAsset();

  // Sous-étape en cours pour la marche active
  const [subStep, setSubStep] = useState<SubStep>("between2Walls");
  // Marche rouverte via « Modifier » ; `null` = on configure la suivante.
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Si le nombre de marches a baissé depuis l'étape 4, les réglages en trop
  // sont retirés : la validation exige un réglage par marche, ni plus ni moins.
  useEffect(() => {
    if (rawConfigs.length > stepCount) {
      setValue("stepEndCapConfigs", rawConfigs.slice(0, stepCount), {
        shouldValidate: true,
      });
    }
  }, [rawConfigs, stepCount, setValue]);

  const configs = rawConfigs.slice(0, stepCount);
  const editIndex =
    editingIndex !== null && editingIndex < configs.length ? editingIndex : null;
  const isEditing = editIndex !== null;
  const activeIndex =
    editIndex ?? (configs.length < stepCount ? configs.length : null);
  const activeConfig = editIndex !== null ? configs[editIndex] : undefined;
  const doneCount = configs.length;
  const pct = stepCount > 0 ? Math.round((doneCount / stepCount) * 100) : 0;

  function saveConfig(config: StepEndCapConfig) {
    const next = [...configs];
    if (editIndex !== null) {
      // Modification en place : les marches suivantes restent configurées.
      next[editIndex] = config;
    } else {
      next.push(config);
    }
    setValue("stepEndCapConfigs", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setEditingIndex(null);
    setSubStep("between2Walls");
  }

  function handleBetween2Walls(yes: boolean) {
    if (yes) {
      saveConfig({ between2Walls: true, cap: "NONE" });
    } else {
      setSubStep("capType");
    }
  }

  function handleCapType(cap: "OPEN_STEP" | "OVERHANGING") {
    if (cap === "OVERHANGING") {
      saveConfig({ between2Walls: false, cap: "OVERHANGING" });
    } else {
      setSubStep("side");
    }
  }

  function handleBetween2Stringers() {
    saveConfig({ between2Walls: false, between2Stringers: true, cap: "NONE" });
  }

  function handleSide(side: EndSide) {
    saveConfig({ between2Walls: false, cap: "OPEN_STEP", side });
  }

  function handleGoBack() {
    if (subStep === "side") {
      setSubStep("capType");
    } else if (subStep === "capType") {
      setSubStep("between2Walls");
    }
  }

  function startEdit(index: number) {
    setEditingIndex(index);
    setSubStep("between2Walls");
  }

  function cancelEdit() {
    setEditingIndex(null);
    setSubStep("between2Walls");
  }

  function capLabel(c: StepEndCapConfig) {
    if (c.between2Walls) return m.steps.endCap.summaryBetween2Walls;
    if (c.between2Stringers) return m.steps.endCap.summaryBetween2Stringers;
    if (c.cap === "OVERHANGING") return m.steps.endCap.summaryOverhanging;
    if (c.cap === "OPEN_STEP") {
      return c.side === "LEFT"
        ? m.steps.endCap.summaryOpenLeft
        : m.steps.endCap.summaryOpenRight;
    }
    return m.steps.endCap.summaryNone;
  }

  const panel =
    activeIndex === null ? null : (
      <div
        className={`border-[1.5px] bg-surface p-5 sm:p-6 ${
          isEditing ? "border-primary" : "mt-2 border-border-option"
        }`}
      >
        {/* Progression dans la liste des marches */}
        <div className="flex justify-between text-[13px] font-semibold text-subtle">
          <span>
            {t(m.steps.endCap.progress, {
              index: activeIndex + 1,
              total: stepCount,
            })}
          </span>
          <span aria-hidden>{pct} %</span>
        </div>
        <div className="mt-2 h-[3px] bg-track">
          <div
            className="h-full bg-primary transition-[width] duration-[360ms] ease-out motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Sous-étape : entre 2 murs ? */}
        {subStep === "between2Walls" && (
          <>
            {isEditing ? (
              <button type="button" onClick={cancelEdit} className={`${PANEL_LINK_CLASS} mt-4`}>
                <XIcon aria-hidden className="size-3.5" />
                {m.steps.endCap.cancelEdit}
              </button>
            ) : null}
            <p className={`${isEditing ? "mt-3.5" : "mt-6"} mb-[18px] text-center text-[19px] font-semibold text-heading`}>
              {t(m.steps.endCap.askBetween2Walls, { index: activeIndex + 1 })}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <OptionCard
                selected={activeConfig?.between2Walls === true}
                mark={false}
                onClick={() => handleBetween2Walls(true)}
                className="h-[54px] text-center text-[15px] font-bold text-heading"
              >
                {m.common.yes}
              </OptionCard>
              <OptionCard
                selected={activeConfig !== undefined && !activeConfig.between2Walls}
                mark={false}
                onClick={() => handleBetween2Walls(false)}
                className="h-[54px] text-center text-[15px] font-bold text-heading"
              >
                {m.common.no}
              </OptionCard>
            </div>
          </>
        )}

        {/* Sous-étape : type d'embout */}
        {subStep === "capType" && (
          <>
            <button type="button" onClick={handleGoBack} className={`${PANEL_LINK_CLASS} mt-4`}>
              <ArrowLeftIcon aria-hidden className="size-3.5" />
              {m.common.back}
            </button>
            <p className="mb-[18px] mt-3.5 text-center text-[19px] font-semibold text-heading">
              {m.steps.endCap.askCapType}
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
              <PhotoChoice
                src={asset("/embout/limons.webp")}
                alt={m.steps.endCap.photoAltBetween2Stringers}
                label={m.steps.endCap.capBetween2Stringers}
                selected={activeConfig?.between2Stringers === true}
                onClick={handleBetween2Stringers}
              />
              <PhotoChoice
                src={asset("/embout/debordante.webp")}
                alt={m.steps.endCap.photoAltOverhanging}
                label={m.steps.endCap.capOverhanging}
                selected={activeConfig?.cap === "OVERHANGING"}
                onClick={() => handleCapType("OVERHANGING")}
              />
              <PhotoChoice
                src={asset("/embout/ouvert-cote.webp")}
                alt={m.steps.endCap.photoAltOpenStep}
                label={m.steps.endCap.capOpenStep}
                selected={activeConfig?.cap === "OPEN_STEP"}
                onClick={() => handleCapType("OPEN_STEP")}
              />
            </div>
          </>
        )}

        {/* Sous-étape : côté */}
        {subStep === "side" && (
          <>
            <button type="button" onClick={handleGoBack} className={`${PANEL_LINK_CLASS} mt-4`}>
              <ArrowLeftIcon aria-hidden className="size-3.5" />
              {m.common.back}
            </button>
            <p className="mb-[18px] mt-3.5 text-center text-[19px] text-heading">
              <span className="font-semibold">{m.steps.endCap.askSide}</span>{" "}
              <span className="text-[15px] text-muted">
                {m.steps.endCap.askSideHint}
              </span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(["LEFT", "RIGHT"] as const).map((side) => (
                <OptionCard
                  key={side}
                  selected={activeConfig?.cap === "OPEN_STEP" && activeConfig.side === side}
                  mark={false}
                  onClick={() => handleSide(side)}
                  className="h-[54px] text-center text-[15px] font-bold text-heading"
                >
                  {m.catalog.endSide[side]}
                </OptionCard>
              ))}
            </div>
          </>
        )}
      </div>
    );

  return (
    <div className="space-y-7">
      <StepHeader
        title={m.steps.endCap.title}
        subtitle={m.steps.endCap.subtitle}
      />

      {/*
        Liste des marches dans l'ordre. Une marche modifiée reste à sa place :
        sa ligne passe en orange (« En cours de modification ») et le panneau de
        choix s'ouvre juste en dessous, sans effacer les marches suivantes.
      */}
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
        {configs.map((c, i) => (
          <Fragment key={i}>
            {i === activeIndex ? (
              <div className={`${ROW_CLASS} bg-primary text-white`}>
                <span className="font-bold">
                  {t(m.steps.endCap.stepLabel, { index: i + 1 })}
                </span>
                <span className="truncate">{capLabel(c)}</span>
                <span className="text-[13px] font-semibold">
                  {m.steps.endCap.editing}
                </span>
              </div>
            ) : (
              <div className={`${ROW_CLASS} bg-tint`}>
                <span className="font-bold text-heading">
                  {t(m.steps.endCap.stepLabel, { index: i + 1 })}
                </span>
                <span className="truncate text-muted">{capLabel(c)}</span>
                <button
                  type="button"
                  onClick={() => startEdit(i)}
                  aria-label={`${m.common.edit} — ${t(m.steps.endCap.stepLabel, { index: i + 1 })}`}
                  className="text-[13px] font-semibold text-primary underline underline-offset-[3px] transition-colors hover:text-primary-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {m.common.edit}
                </button>
              </div>
            )}
            {i === activeIndex ? panel : null}
          </Fragment>
        ))}

        {/* Prochaine marche à configurer : le panneau suit la liste. */}
        {!isEditing ? panel : null}

        {/* Tout configuré */}
        {activeIndex === null && stepCount > 0 && (
          <div
            className="mt-2 flex items-center gap-2.5 border-[1.5px] border-primary/40 px-4 py-3.5 text-sm font-semibold text-heading"
            role="status"
          >
            <CheckCircleIcon aria-hidden className="size-[22px] shrink-0 text-primary" />
            {m.steps.endCap.allDone}
          </div>
        )}
      </div>
    </div>
  );
}
