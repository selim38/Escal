"use client";

import { useEffect, useMemo, useRef } from "react";

import {
  KRE_EVENTS,
  pushEvent,
  readTrackingContext,
  stepName,
  type TrackingContext,
} from "@/lib/analytics";

type WizardTracking = {
  /** Paramètres de provenance de l'instance, à joindre au lead. */
  context: TrackingContext;
  /** Étape validée → passage à la suivante. */
  trackStepComplete: (index: number) => void;
  /** Lead envoyé avec succès. */
  trackSubmit: (payload: Record<string, unknown>) => void;
  /** CTA « Demander un échantillon ». */
  trackSampleRequest: (payload?: Record<string, unknown>) => void;
};

/**
 * Émet les événements d'entonnoir du configurateur.
 *
 * `devis_abandon` est déclenché sur `pagehide` / `visibilitychange` et non
 * `beforeunload`, inopérant sur iOS Safari.
 */
export function useWizardTracking(
  currentStep: number,
  isFinished: boolean,
): WizardTracking {
  const context = useMemo(() => readTrackingContext(), []);
  const startedAt = useRef<number>(0);
  const lastStep = useRef(currentStep);
  const finished = useRef(isFinished);
  const abandonSent = useRef(false);
  const startSent = useRef(false);
  const lastViewSent = useRef(-1);

  // Miroir des props dans des refs, pour que le gestionnaire `pagehide` (attaché
  // une seule fois) lise toujours l'état courant. Écrit dans un effet et non
  // pendant le rendu : muter une ref au rendu casse la réconciliation.
  useEffect(() => {
    finished.current = isFinished;
    lastStep.current = currentStep;
  });

  // devis_start — une seule fois par instance.
  // Le garde-fou est nécessaire : StrictMode double l'exécution des effets en
  // développement, et un double `devis_start` fausserait l'entonnoir GA4.
  useEffect(() => {
    if (startSent.current) return;
    startSent.current = true;
    startedAt.current = Date.now();
    pushEvent(KRE_EVENTS.start, { ...context });
  }, [context]);

  // devis_step_view — à chaque affichage d'étape, une fois par étape.
  useEffect(() => {
    if (lastViewSent.current === currentStep) return;
    lastViewSent.current = currentStep;
    pushEvent(KRE_EVENTS.stepView, {
      step_index: currentStep + 1,
      step_name: stepName(currentStep),
      ...context,
    });
  }, [currentStep, context]);

  // devis_abandon — sortie avant soumission.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const sendAbandon = () => {
      if (abandonSent.current || finished.current) return;
      abandonSent.current = true;
      pushEvent(KRE_EVENTS.abandon, {
        last_step_index: lastStep.current + 1,
        last_step_name: stepName(lastStep.current),
        time_spent_sec: startedAt.current
          ? Math.round((Date.now() - startedAt.current) / 1000)
          : 0,
        ...context,
      });
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") sendAbandon();
    };

    window.addEventListener("pagehide", sendAbandon);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", sendAbandon);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [context]);

  return {
    context,
    trackStepComplete: (index: number) => {
      pushEvent(KRE_EVENTS.stepComplete, {
        step_index: index + 1,
        step_name: stepName(index),
        ...context,
      });
    },
    trackSubmit: (payload) => {
      abandonSent.current = true; // pas d'abandon après un envoi réussi
      pushEvent(KRE_EVENTS.submit, { ...payload, ...context });
    },
    trackSampleRequest: (payload = {}) => {
      pushEvent(KRE_EVENTS.sampleRequest, { ...payload, ...context });
    },
  };
}
