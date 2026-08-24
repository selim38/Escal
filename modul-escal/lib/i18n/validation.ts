/**
 * Traduction des messages de validation.
 *
 * Les schémas zod de `lib/quote-schema.ts` sont définis au niveau module : ils
 * ne peuvent pas connaître la locale de l'instance. Ils émettent donc des clés
 * (`validation.selectWidth`) que l'on résout au moment de l'affichage.
 *
 * Une chaîne qui n'est pas une clé connue est renvoyée telle quelle : les
 * messages internes de zod (et tout message futur écrit en dur) restent lisibles.
 */

import type { Messages } from "./index";

export const VALIDATION_PREFIX = "validation.";

/** Construit la clé émise par les schémas. */
export function vKey(name: keyof Messages["validation"]): string {
  return `${VALIDATION_PREFIX}${name}`;
}

export function resolveMessage(
  m: Messages,
  raw: string | undefined,
): string | undefined {
  if (!raw) return raw;
  if (!raw.startsWith(VALIDATION_PREFIX)) return raw;
  const name = raw.slice(VALIDATION_PREFIX.length) as keyof Messages["validation"];
  return m.validation[name] ?? raw;
}
