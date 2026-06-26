import type { StairLayout } from "@/lib/quote-schema";

export type StairLayoutEntry = {
  id: StairLayout;
  label: string;
  description: string;
};

export const STAIR_LAYOUT_OPTIONS: StairLayoutEntry[] = [
  {
    id: "STRAIGHT",
    label: "Droite",
    description: "Marche droite, sans changement de direction.",
  },
  {
    id: "BALANCED",
    label: "Tournante",
    description: "Marche tournante (palier ou retour d'angle).",
  },
  {
    id: "FIVE_SIDED",
    label: "5 côtés",
    description:
      "Pentagone irrégulier : largeur max. et profondeur max. selon vos fourchettes.",
  },
];
