import type { DepthBand, WidthBand } from "@/lib/quote-schema";

/**
 * Grille tarifaire marche droite (€ / marche, panneau marche + contremarche).
 * Source : tableau fourni — largeur en mm, profondeur (giron) en mm.
 */
export const STRAIGHT_STEP_PRICE_EUR: Record<
  DepthBand,
  Record<WidthBand, number>
> = {
  D_LT_320: {
    W_LT_800: 50,
    W_801_1000: 60,
    W_1001_1300: 70,
    W_1301_1600: 80,
    W_1601_1800: 90,
  },
  D_GT_320: {
    W_LT_800: 100,
    W_801_1000: 120,
    W_1001_1300: 140,
    W_1301_1600: 160,
    W_1601_1800: 180,
  },
};

export function getStraightStepPanelPrice(
  widthBand: WidthBand,
  depthBand: DepthBand,
): number {
  return STRAIGHT_STEP_PRICE_EUR[depthBand][widthBand];
}
