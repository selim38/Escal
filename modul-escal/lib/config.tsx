"use client";

/**
 * Configuration runtime du configurateur.
 *
 * Le composant est consommé de deux manières :
 *   1. build Next.js (export statique sous /calcul) — les valeurs viennent des defaults ;
 *   2. build Web Component (<kre-configurateur>) — les valeurs viennent des attributs HTML.
 *
 * Aucune lecture de `process.env` ne doit subsister dans `components/` ou `lib/` :
 * Vite ne fournit pas `process.env`, et le module doit être configurable sans rebuild.
 */

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { DEFAULT_LOCALE, isSupportedLocale, type Locale } from "@/lib/i18n";

/** Base API par défaut : le backend PHP de production, en absolu. */
export const DEFAULT_ENDPOINT = "https://escal.point-soft.fr/api";

/** Base assets par défaut : l'app Next servie sous /calcul. */
export const DEFAULT_ASSETS_BASE = "/calcul";

export type KreConfig = {
  /** Locale d'affichage. Seul `fr` est fourni en v1. */
  locale: Locale;
  /** Identifiant de thème, appliqué en attribut `theme` sur l'hôte. */
  theme: string;
  /** Base absolue (ou relative en Next) de l'API PHP, sans slash final. */
  endpoint: string;
  /** Base des assets publics, sans slash final. */
  assetsBase: string;
  /** Destinataire des demandes ; transmis avec le lead et cible du CTA échantillon. */
  recipientEmail: string;
  /** URL de redirection après soumission réussie. Vide = écran de succès interne. */
  confirmationUrl: string;
  /** Afficher le CTA « Demander un échantillon ». */
  showSampleCta: boolean;
  /** Mode démo : la soumission est simulée, aucun appel réseau. */
  demo: boolean;
  /** Afficher l'en-tête (titre + accroche) à l'intérieur du composant. */
  showHeader: boolean;
};

export const DEFAULT_CONFIG: KreConfig = {
  locale: DEFAULT_LOCALE,
  theme: "kre",
  endpoint: DEFAULT_ENDPOINT,
  assetsBase: DEFAULT_ASSETS_BASE,
  recipientEmail: "",
  confirmationUrl: "",
  showSampleCta: false,
  demo: false,
  showHeader: true,
};

const KreConfigContext = createContext<KreConfig>(DEFAULT_CONFIG);

export function useKreConfig(): KreConfig {
  return useContext(KreConfigContext);
}

/**
 * Fichiers photos en attente d'upload, entre l'étape Coordonnées et la soumission.
 *
 * Porté par instance (et non par module) : deux <kre-configurateur> sur une même
 * page doivent avoir des jeux de photos indépendants.
 *
 * Exposé sous forme de méthodes plutôt que d'un objet mutable : muter la valeur
 * d'un contexte React depuis un composant est un anti-pattern (et signalé comme
 * tel par le compilateur React). Les fichiers vivent dans une clôture.
 */
export type PendingPhotos = {
  get: () => File[];
  set: (files: File[]) => void;
  clear: () => void;
};

function createPendingPhotos(): PendingPhotos {
  let files: File[] = [];
  return {
    get: () => files,
    set: (next) => {
      files = next;
    },
    clear: () => {
      files = [];
    },
  };
}

const PendingPhotosContext = createContext<PendingPhotos | null>(null);

export function usePendingPhotos(): PendingPhotos {
  const ctx = useContext(PendingPhotosContext);
  if (!ctx) {
    throw new Error("usePendingPhotos doit être utilisé dans <KreConfigProvider>");
  }
  return ctx;
}

export function KreConfigProvider({
  config,
  children,
}: {
  config: Partial<KreConfig>;
  children: ReactNode;
}) {
  const value = useMemo<KreConfig>(
    () => ({ ...DEFAULT_CONFIG, ...stripUndefined(config) }),
    [config],
  );
  // `useState` avec initialiseur paresseux : la clôture est créée une seule fois
  // par instance et n'est jamais lue pendant le rendu.
  const [photos] = useState(createPendingPhotos);

  return (
    <KreConfigContext.Provider value={value}>
      <PendingPhotosContext.Provider value={photos}>
        {children}
      </PendingPhotosContext.Provider>
    </KreConfigContext.Provider>
  );
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

// ───────────────────────── Parsing des attributs HTML ─────────────────────────

/** Liste des attributs observés par le custom element. */
export const KRE_ATTRIBUTES = [
  "lang",
  "theme",
  "endpoint",
  "recipient-email",
  "confirmation-url",
  "show-sample-cta",
  "assets-base",
  "demo",
  "show-header",
] as const;

/** `true` si l'attribut est présent et pas explicitement à "false"/"0". */
function parseBoolAttr(raw: string | null): boolean | undefined {
  if (raw === null) return undefined;
  const v = raw.trim().toLowerCase();
  if (v === "false" || v === "0" || v === "no") return false;
  return true;
}

/** Valide une URL http(s) et retire le slash final. Rejette `javascript:` & co. */
function parseUrlAttr(raw: string | null, label: string): string | undefined {
  if (raw === null) return undefined;
  const v = raw.trim();
  if (!v) return undefined;
  // On autorise les chemins relatifs (utile pour un endpoint same-origin).
  if (v.startsWith("/")) return v.replace(/\/+$/, "");
  try {
    const url = new URL(v);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      warn(`${label} : protocole non autorisé (${url.protocol}), valeur ignorée.`);
      return undefined;
    }
    return v.replace(/\/+$/, "");
  } catch {
    warn(`${label} : URL invalide (« ${v} »), valeur ignorée.`);
    return undefined;
  }
}

function parseEmailAttr(raw: string | null): string | undefined {
  if (raw === null) return undefined;
  const v = raw.trim();
  if (!v) return undefined;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
    warn(`recipient-email : adresse invalide (« ${v} »), valeur ignorée.`);
    return undefined;
  }
  return v;
}

function parseLocaleAttr(raw: string | null): Locale | undefined {
  if (raw === null) return undefined;
  const v = raw.trim().toLowerCase().split("-")[0];
  if (!v) return undefined;
  if (!isSupportedLocale(v)) {
    warn(`lang : langue « ${v} » non supportée, repli sur « ${DEFAULT_LOCALE} ».`);
    return DEFAULT_LOCALE;
  }
  return v;
}

function warn(message: string) {
  if (typeof console !== "undefined") {
    console.warn(`[kre-configurateur] ${message}`);
  }
}

/**
 * Traduit les attributs d'un élément DOM en configuration partielle.
 * Les attributs absents ou invalides sont omis → les defaults s'appliquent.
 */
export function configFromAttributes(el: Element): Partial<KreConfig> {
  const get = (name: string) => el.getAttribute(name);

  return stripUndefined({
    locale: parseLocaleAttr(get("lang")),
    theme: get("theme")?.trim() || undefined,
    endpoint: parseUrlAttr(get("endpoint"), "endpoint"),
    assetsBase: parseUrlAttr(get("assets-base"), "assets-base"),
    recipientEmail: parseEmailAttr(get("recipient-email")),
    confirmationUrl: parseUrlAttr(get("confirmation-url"), "confirmation-url"),
    showSampleCta: parseBoolAttr(get("show-sample-cta")),
    demo: parseBoolAttr(get("demo")),
    showHeader: parseBoolAttr(get("show-header")),
  });
}
