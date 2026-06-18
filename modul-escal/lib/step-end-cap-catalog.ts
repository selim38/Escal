import type { EndSide, StepEndCap } from "@/lib/quote-schema";

export type StepEndCapEntry = {
  id: StepEndCap;
  label: string;
  description: string;
};

export const STEP_END_CAP_OPTIONS: StepEndCapEntry[] = [
  {
    id: "NONE",
    label: "Sans",
    description: "Pas d’embout de marche.",
  },
  {
    id: "OPEN_STEP",
    label: "Pour marche ouverte",
    description: "Embout en 1 pièce — côtés ouverts.",
  },
  {
    id: "OVERHANGING",
    label: "Pour marche débordante",
    description: "Embout en 2 pièces — nez débordant.",
  },
];

export const END_SIDE_OPTIONS: { id: EndSide; label: string }[] = [
  { id: "LEFT", label: "Gauche" },
  { id: "RIGHT", label: "Droite" },
];

/** Limite métier indiquée sur le cahier des charges. */
export const STEP_END_CAP_MAX_COUNT = 60;

export function requiresOpenStepSides(cap: StepEndCap | undefined): boolean {
  return cap === "OPEN_STEP";
}
