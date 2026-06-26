"use client";

import { useState } from "react";
import { Check, ChevronLeft } from "lucide-react";
import { useFormContext } from "react-hook-form";

import type { QuoteFormDraft, StepEndCapConfig, EndSide } from "@/lib/quote-schema";

type SubStep = "between2Walls" | "capType" | "side";

function btn(active: boolean) {
  return `flex-1 rounded-xl border-2 px-4 py-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
    active
      ? "border-primary bg-primary/5 ring-2 ring-primary/25 text-brand"
      : "border-border bg-surface hover:border-brand-medium/35 text-brand"
  }`;
}

export function StepEndCap() {
  const { watch, setValue } = useFormContext<QuoteFormDraft>();
  const stepCount = watch("stepCount") ?? 0;
  const configs: StepEndCapConfig[] = watch("stepEndCapConfigs") ?? [];

  // Sous-étape en cours pour la marche actuellement configurée
  const [subStep, setSubStep] = useState<SubStep>("between2Walls");
  // Valeur intermédiaire avant de confirmer et passer à la marche suivante
  const [pendingBetween2Walls, setPendingBetween2Walls] = useState<boolean | null>(null);
  const [pendingCap, setPendingCap] = useState<"OPEN_STEP" | "OVERHANGING" | null>(null);

  const currentIndex = configs.length; // index de la prochaine marche à configurer
  const allDone = currentIndex >= stepCount;

  function saveConfig(config: StepEndCapConfig) {
    const next = [...configs, config];
    setValue("stepEndCapConfigs", next, { shouldValidate: true, shouldDirty: true });
    // Réinitialise l'état local pour la prochaine marche
    setSubStep("between2Walls");
    setPendingBetween2Walls(null);
    setPendingCap(null);
  }

  function handleBetween2Walls(yes: boolean) {
    if (yes) {
      saveConfig({ between2Walls: true, cap: "NONE" });
    } else {
      setPendingBetween2Walls(false);
      setSubStep("capType");
    }
  }

  function handleCapType(cap: "OPEN_STEP" | "OVERHANGING") {
    if (cap === "OVERHANGING") {
      saveConfig({ between2Walls: false, cap: "OVERHANGING" });
    } else {
      setPendingCap("OPEN_STEP");
      setSubStep("side");
    }
  }

  function handleSide(side: EndSide) {
    saveConfig({ between2Walls: false, cap: "OPEN_STEP", side });
  }

  function handleGoBack() {
    if (subStep === "side") {
      setPendingCap(null);
      setSubStep("capType");
    } else if (subStep === "capType") {
      setPendingBetween2Walls(null);
      setSubStep("between2Walls");
    }
  }

  function handleEditMarche(index: number) {
    const next = configs.slice(0, index);
    setValue("stepEndCapConfigs", next, { shouldValidate: false, shouldDirty: true });
    setSubStep("between2Walls");
    setPendingBetween2Walls(null);
    setPendingCap(null);
  }

  function capLabel(c: StepEndCapConfig) {
    if (c.between2Walls) return "Entre 2 murs";
    if (c.cap === "OVERHANGING") return "Débordante";
    if (c.cap === "OPEN_STEP") return `Ouverte — ${c.side === "LEFT" ? "gauche" : "droite"}`;
    return "—";
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold tracking-tight text-[#1e2a4a] sm:text-2xl">
          Embout de marche
        </h2>
        <p className="text-sm text-muted">
          Nous allons configurer chaque marche de bas en haut.
        </p>
      </div>

      {/* Récap des marches déjà configurées */}
      {configs.length > 0 && (
        <div className="mx-auto w-full max-w-sm space-y-1.5">
          {configs.map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            >
              <span className="font-medium text-brand">Marche {i + 1}</span>
              <span className="text-muted">{capLabel(c)}</span>
              <button
                type="button"
                onClick={() => handleEditMarche(i)}
                className="ml-3 text-xs text-primary underline-offset-2 hover:underline"
              >
                Modifier
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Wizard pour la marche en cours */}
      {!allDone && (
        <div className="mx-auto w-full max-w-sm space-y-5 rounded-2xl border border-border bg-surface p-5 shadow-sm">
          {/* En-tête de progression */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Marche {currentIndex + 1} sur {stepCount}</span>
              <span>{Math.round((currentIndex / stepCount) * 100)} %</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted-bg">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(currentIndex / stepCount) * 100}%` }}
              />
            </div>
          </div>

          {/* Sous-étape : entre 2 murs ? */}
          {subStep === "between2Walls" && (
            <div className="space-y-4">
              <p className="text-center text-sm font-semibold text-brand">
                Votre marche {currentIndex + 1} est-elle prise entre 2 murs ?
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={() => handleBetween2Walls(true)} className={btn(false)}>
                  Oui
                </button>
                <button type="button" onClick={() => handleBetween2Walls(false)} className={btn(false)}>
                  Non
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
                className="flex items-center gap-1 text-xs text-muted hover:text-brand"
              >
                <ChevronLeft className="size-3.5" />
                Retour
              </button>
              <p className="text-center text-sm font-semibold text-brand">
                Comment est cette marche côté ouvert ?
              </p>
              <div className="flex flex-col gap-3">
                <button type="button" onClick={() => handleCapType("OVERHANGING")} className={btn(false)}>
                  Marche débordante
                </button>
                <button type="button" onClick={() => handleCapType("OPEN_STEP")} className={btn(false)}>
                  Ouverte sur le côté
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
                className="flex items-center gap-1 text-xs text-muted hover:text-brand"
              >
                <ChevronLeft className="size-3.5" />
                Retour
              </button>
              <p className="text-center text-sm font-semibold text-brand">
                De quel côté est-elle ouverte ?{" "}
                <span className="font-normal text-muted">(vu du bas de l'escalier)</span>
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={() => handleSide("LEFT")} className={btn(false)}>
                  Gauche
                </button>
                <button type="button" onClick={() => handleSide("RIGHT")} className={btn(false)}>
                  Droite
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tout configuré */}
      {allDone && (
        <div className="mx-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check className="size-3.5 stroke-[3]" />
          </span>
          <p className="text-sm font-medium text-emerald-800">
            Toutes les marches sont configurées.
          </p>
        </div>
      )}
    </div>
  );
}
