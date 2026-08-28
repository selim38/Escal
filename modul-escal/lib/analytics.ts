"use client";

/**
 * Tracking `window.dataLayer` (compatible Google Tag Manager / GA4).
 *
 * Le Web Component vit dans le DOM de la page hôte : GTM voit ces événements
 * directement, sans pont `postMessage` (contrairement à une intégration iframe).
 *
 * Convention d'événements annoncée à Knewledge dans docs/INTEGRATION-WORDPRESS.md.
 */

type DataLayerRecord = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerRecord[];
  }
}

export const KRE_EVENTS = {
  start: "devis_start",
  stepView: "devis_step_view",
  stepComplete: "devis_step_complete",
  abandon: "devis_abandon",
  submit: "devis_submit",
  sampleRequest: "devis_sample_request",
} as const;

export type KreEventName = (typeof KRE_EVENTS)[keyof typeof KRE_EVENTS];

/** Noms techniques des étapes, stables — ne pas renommer sans avertir Knewledge. */
export const STEP_NAMES = [
  "staircase_type",
  "decor",
  "riser",
  "step_count",
  "dimensions",
  "end_cap",
  "landing",
  "included",
  "contact",
] as const;

export function stepName(index: number): string {
  return STEP_NAMES[index] ?? `step_${index}`;
}

/** Paramètres de provenance capturés à l'ouverture. */
export type TrackingContext = Record<string, string>;

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
  "msclkid",
] as const;

/**
 * Lit les paramètres de provenance dans l'URL de la page hôte.
 * Renvoie un objet vide côté serveur (build Next) ou sans paramètre.
 */
export function readTrackingContext(search?: string): TrackingContext {
  if (typeof window === "undefined" && search === undefined) return {};
  const params = new URLSearchParams(search ?? window.location.search);
  const out: TrackingContext = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) out[key] = value.slice(0, 255);
  }
  return out;
}

/** Pousse un événement dans le dataLayer. No-op silencieux si indisponible. */
export function pushEvent(
  event: KreEventName,
  payload: DataLayerRecord = {},
): void {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event, ...payload });
  } catch {
    // Un dataLayer figé par un plugin tiers ne doit jamais casser le configurateur.
  }
}
