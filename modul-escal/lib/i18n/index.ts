/**
 * i18n du configurateur.
 *
 * Le module était initialement écrit avec les chaînes françaises en dur dans le JSX.
 * L'attribut `lang` du Web Component impose une indirection : toutes les chaînes
 * vivent désormais dans `lib/i18n/<locale>.ts`.
 *
 * Ajouter une langue = ajouter un fichier respectant le type `Messages` (dérivé de `fr`)
 * puis l'enregistrer dans `LOCALES` ci-dessous. Le typage garantit qu'aucune clé ne manque.
 */

import { fr } from "./fr";

export type Messages = typeof fr;

export const LOCALES = { fr } satisfies Record<string, Messages>;

export type Locale = keyof typeof LOCALES;

export const DEFAULT_LOCALE: Locale = "fr";

export const SUPPORTED_LOCALES = Object.keys(LOCALES) as Locale[];

export function isSupportedLocale(value: string): value is Locale {
  return Object.prototype.hasOwnProperty.call(LOCALES, value);
}

export function getMessages(locale: Locale): Messages {
  return LOCALES[locale] ?? LOCALES[DEFAULT_LOCALE];
}

/**
 * Interpolation simple : remplace `{clé}` par la valeur fournie.
 * Volontairement minimaliste (pas de pluriels ICU) — le besoin actuel s'y limite.
 */
export function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
