import { getRiserPricePerStep } from "./riser-options";
import { getStepConfigPanelPrice } from "./step-config";
import {
  getStraightStepPanelPrice,
  STRAIGHT_STEP_PRICE_EUR,
} from "./straight-step-pricing";
import {
  validateStepConfigs,
  type DepthBand,
  type QuotePricingInput,
  type WidthBand,
} from "./quote-schema";

export type PriceBreakdown = {
  basePanel: number;
  adjustedPanel: number;
  baseTotal: number;
  glue: number;
  riserSupplement: number;
  openSidesSupplement: number;
  landingSupplement: number;
};

export type CalculatePriceResult = {
  /** Total matériaux arrondi à l’euro (affichage principal). */
  materialsSubtotal: number;
  breakdown: PriceBreakdown;
};

/** Prix unitaire marche droite selon la grille largeur × profondeur (€ / marche). */
export function getUniformStraightStepPanelPrice(
  widthBand?: WidthBand,
  depthBand?: DepthBand,
): number {
  const w = widthBand ?? "W_LT_800";
  const d = depthBand ?? "D_LT_320";
  return getStraightStepPanelPrice(w, d);
}

export function calculatePrice(data: QuotePricingInput): CalculatePriceResult {
  const basePanel = STRAIGHT_STEP_PRICE_EUR.D_LT_320.W_LT_800;

  const perStepConfigs =
    data.stepConfigs && validateStepConfigs(data.stepConfigs, data.stepCount)
      ? data.stepConfigs
      : null;

  let adjustedPanel: number;
  let baseTotal: number;

  if (perStepConfigs) {
    const panelPrices = perStepConfigs.map(getStepConfigPanelPrice);
    baseTotal = panelPrices.reduce((sum, p) => sum + p, 0);
    adjustedPanel =
      panelPrices.reduce((sum, p) => sum + p, 0) / perStepConfigs.length;
  } else {
    adjustedPanel = getUniformStraightStepPanelPrice(
      data.widthBand,
      data.depthBand,
    );
    baseTotal = adjustedPanel * data.stepCount;
  }
  const glue = Math.ceil(data.stepCount / 3) * 12;
  const riserSupplement =
    getRiserPricePerStep(data.riserOption) * data.stepCount;
  const openStepsCount = perStepConfigs
    ? perStepConfigs.filter((c) => c.openSide).length
    : data.openSides
      ? data.stepCount
      : 0;
  const openSidesSupplement = openStepsCount * 15;
  const landingSupplement = data.intermediateLanding ? 150 : 0;

  const materialsSubtotal = Math.round(
    baseTotal +
      glue +
      riserSupplement +
      openSidesSupplement +
      landingSupplement,
  );

  return {
    materialsSubtotal,
    breakdown: {
      basePanel,
      adjustedPanel,
      baseTotal,
      glue,
      riserSupplement,
      openSidesSupplement,
      landingSupplement,
    },
  };
}
