"use client";

import { useState } from "react";
import { Check, ChevronLeft } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { useT } from "@/lib/i18n/useT";
import type {
  QuoteFormDraft,
  StepEndCapConfig,
  EndSide,
} from "@/lib/quote-schema";
import { StepTitle } from "../ui/Typography";

type SubStep = "between2Walls" | "capType" | "side";

function btn() {
  return "flex-1 rounded-xl border-2 border-border bg-surface px-4 py-4 text-sm font-semibold text-brand transition hover:border-brand-medium/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
}

export function StepEndCap() {
  const { watch, setValue } = useFormContext<QuoteFormDraft>();
  const stepCount = watch("stepCount") ?? 0;
  const configs: StepEndCapConfig[] = watch("stepEndCapConfigs") ?? [];
  const { m, t } = useT();

  // Sous-étape en cours pour la marche actuellement configurée
  const [subStep, setSubStep] = useState<SubStep>("between2Walls");

  const currentIndex = configs.length; // index de la prochaine marche à configurer
  const allDone = currentIndex >= stepCount;

  function saveConfig(config: StepEndCapConfig) {
    const next = [...configs, config];
    setValue("stepEndCapConfigs", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
    // Réinitialise l'état local pour la prochaine marche
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

  function handleEditMarche(index: number) {
    const next = configs.slice(0, index);
    setValue("stepEndCapConfigs", next, {
      shouldValidate: false,
      shouldDirty: true,
    });
    setSubStep("between2Walls");
  }

  function capLabel(c: StepEndCapConfig) {
    if (c.between2Walls) return m.steps.endCap.summaryBetween2Walls;
    if (c.cap === "OVERHANGING") return m.steps.endCap.summaryOverhanging;
    if (c.cap === "OPEN_STEP") {
      return c.side === "LEFT"
        ? m.steps.endCap.summaryOpenLeft
        : m.steps.endCap.summaryOpenRight;
    }
    return m.steps.endCap.summaryNone;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <StepTitle align="left">{m.steps.endCap.title}</StepTitle>
        <p className="text-sm text-muted">{m.steps.endCap.subtitle}</p>
      </div>

      {/* Récap des marches déjà configurées */}
      {configs.length > 0 && (
        <ul className="mx-auto w-full max-w-sm space-y-1.5">
          {configs.map((c, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            >
              <span className="font-medium text-brand">
                {t(m.steps.endCap.stepLabel, { index: i + 1 })}
              </span>
              <span className="text-muted">{capLabel(c)}</span>
              <button
                type="button"
                onClick={() => handleEditMarche(i)}
                className="ml-3 rounded text-xs text-primary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {m.common.edit}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Wizard pour la marche en cours */}
      {!allDone && (
        <div className="mx-auto w-full max-w-sm space-y-5 rounded-2xl border border-border bg-surface p-5 shadow-sm">
          {/* En-tête de progression */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>
                {t(m.steps.endCap.progress, {
                  index: currentIndex + 1,
                  total: stepCount,
                })}
              </span>
              <span>{Math.round((currentIndex / stepCount) * 100)} %</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted-bg">
              <div
                className="h-full rounded-full bg-primary transition-all motion-reduce:transition-none"
                style={{ width: `${(currentIndex / stepCount) * 100}%` }}
              />
            </div>
          </div>

          {/* Sous-étape : entre 2 murs ? */}
          {subStep === "between2Walls" && (
            <div className="space-y-4">
              <p className="text-center text-sm font-semibold text-brand">
                {t(m.steps.endCap.askBetween2Walls, {
                  index: currentIndex + 1,
                })}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleBetween2Walls(true)}
                  className={btn()}
                >
                  {m.common.yes}
                </button>
                <button
                  type="button"
                  onClick={() => handleBetween2Walls(false)}
                  className={btn()}
                >
                  {m.common.no}
                </button>
              </div>
            </div>
          )}

          {/* Sous-étape : type d'embout */}
          {subStep === "capType" && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoBack}
                className="flex items-center gap-1 rounded text-xs text-muted hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <ChevronLeft className="size-3.5" aria-hidden />
                {m.common.back}
              </button>
              <p className="text-center text-sm font-semibold text-brand">
                {m.steps.endCap.askCapType}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => handleCapType("OVERHANGING")}
                  className={btn()}
                >
                  {m.steps.endCap.capOverhanging}
                </button>
                <button
                  type="button"
                  onClick={() => handleCapType("OPEN_STEP")}
                  className={btn()}
                >
                  {m.steps.endCap.capOpenStep}
                </button>
              </div>
            </div>
          )}

          {/* Sous-étape : côté */}
          {subStep === "side" && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoBack}
                className="flex items-center gap-1 rounded text-xs text-muted hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <ChevronLeft className="size-3.5" aria-hidden />
                {m.common.back}
              </button>
              <p className="text-center text-sm font-semibold text-brand">
                {m.steps.endCap.askSide}{" "}
                <span className="font-normal text-muted">
                  {m.steps.endCap.askSideHint}
                </span>
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleSide("LEFT")}
                  className={btn()}
                >
                  {m.catalog.endSide.LEFT}
                </button>
                <button
                  type="button"
                  onClick={() => handleSide("RIGHT")}
                  className={btn()}
                >
                  {m.catalog.endSide.RIGHT}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tout configuré */}
      {allDone && (
        <div
          className="mx-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-success/30 bg-success-tint px-4 py-3"
          role="status"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success text-white">
            <Check className="size-3.5 stroke-[3]" aria-hidden />
          </span>
          <p className="text-sm font-medium text-success">
            {m.steps.endCap.allDone}
          </p>
        </div>
      )}
    </div>
  );
}
