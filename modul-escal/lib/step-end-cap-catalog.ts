import {
  END_SIDE_VALUES,
  STEP_END_CAP_VALUES,
  type EndSide,
  type StepEndCap,
} from "@/lib/quote-schema";

/**
 * Ordre d'affichage des embouts de marche. Les libellés vivent dans
 * `lib/i18n/<locale>.ts` sous `catalog.endCap` / `catalog.endSide`.
 */
export const STEP_END_CAP_OPTIONS: StepEndCap[] = [...STEP_END_CAP_VALUES];

export const END_SIDE_OPTIONS: EndSide[] = [...END_SIDE_VALUES];

/** Limite métier indiquée sur le cahier des charges. */
export const STEP_END_CAP_MAX_COUNT = 60;

export function requiresOpenStepSides(cap: StepEndCap | undefined): boolean {
  return cap === "OPEN_STEP";
}
