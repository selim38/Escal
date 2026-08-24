import { STAIR_LAYOUT_VALUES, type StairLayout } from "@/lib/quote-schema";

/**
 * Ordre d'affichage des types de marche. Les libellés vivent dans
 * `lib/i18n/<locale>.ts` sous `catalog.layout`.
 */
export const STAIR_LAYOUT_OPTIONS: StairLayout[] = [...STAIR_LAYOUT_VALUES];
