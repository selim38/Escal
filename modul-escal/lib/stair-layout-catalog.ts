import type { StairLayout } from "@/lib/quote-schema";

export type StairLayoutEntry = {
  id: StairLayout;
  label: string;
  description: string;
};

export const STAIR_LAYOUT_OPTIONS: StairLayoutEntry[] = [
  {
    id: "STRAIGHT",
    label: "Droit",
    description: "Escalier droit, sans changement de direction.",
  },
  {
    id: "BALANCED",
    label: "Balancée",
    description: "Escalier avec palier ou retour en équilibre.",
  },
  {
    id: "FIVE_SIDED",
    label: "5 côtés",
    description:
      "Pentagone irrégulier : largeur max. et profondeur max. selon vos fourchettes.",
  },
];
