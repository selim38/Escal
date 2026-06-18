import type { RiserOption } from "@/lib/quote-schema";

export type RiserOptionEntry = {
  id: RiserOption;
  label: string;
  description: string;
  /** Supplément par marche en euros (0 si inclus ou sans contremarche). */
  pricePerStep: number;
};

export const RISER_OPTIONS: RiserOptionEntry[] = [
  {
    id: "NONE",
    label: "Sans contremarche",
    description: "Marches seules, sans habillage de contremarche.",
    pricePerStep: 0,
  },
  {
    id: "DECOR",
    label: "Couleur du décor",
    description: "Contremarches assorties au décor choisi.",
    pricePerStep: 0,
  },
  {
    id: "BLACK_MATTE",
    label: "Noir mat",
    description: "Finition noire mate, quel que soit le format.",
    pricePerStep: 19,
  },
  {
    id: "WHITE_MATTE",
    label: "Blanc mat",
    description: "Finition blanche mate, quel que soit le format.",
    pricePerStep: 19,
  },
];

export function getRiserPricePerStep(option: RiserOption): number {
  return RISER_OPTIONS.find((o) => o.id === option)?.pricePerStep ?? 0;
}
