import type { RiserOption } from "@/lib/quote-schema";

/**
 * Données des options de contremarche. Les libellés et descriptions vivent
 * dans `lib/i18n/<locale>.ts` sous `catalog.riser`.
 */
export type RiserOptionEntry = {
  id: RiserOption;
  /** Supplément par marche en euros (0 si inclus ou sans contremarche). */
  pricePerStep: number;
};

export const RISER_OPTIONS: RiserOptionEntry[] = [
  { id: "NONE", pricePerStep: 0 },
  { id: "DECOR", pricePerStep: 0 },
  { id: "BLACK_MATTE", pricePerStep: 19 },
  { id: "WHITE_MATTE", pricePerStep: 19 },
];

export function getRiserPricePerStep(option: RiserOption): number {
  return RISER_OPTIONS.find((o) => o.id === option)?.pricePerStep ?? 0;
}
