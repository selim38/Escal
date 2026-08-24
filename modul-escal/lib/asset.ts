"use client";

import { useCallback } from "react";

import { useKreConfig } from "@/lib/config";

/**
 * Résolution des URLs d'assets publics.
 *
 * La base n'est plus une constante : elle dépend du mode de consommation.
 *   - build Next (export statique sous /calcul) → "/calcul"
 *   - Web Component → dérivée de l'URL du script, ou de l'attribut `assets-base`
 *
 * Un chemin absolu (http/https, //, data:) est renvoyé tel quel.
 */
export function assetUrl(base: string, path: string): string {
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }
  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

/** Hook d'accès à `asset()` avec la base de l'instance courante. */
export function useAsset(): (path: string) => string {
  const { assetsBase } = useKreConfig();
  return useCallback((path: string) => assetUrl(assetsBase, path), [assetsBase]);
}
