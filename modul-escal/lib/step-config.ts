import type { StepConfig, StepConfigDraft } from "@/lib/quote-schema";
import { getStraightStepPanelPrice } from "@/lib/straight-step-pricing";

export type { StepConfig, StepConfigDraft };

export function createDefaultStepConfig(): StepConfigDraft {
  return { layout: "STRAIGHT" };
}

export function ensureStepConfigs(
  current: StepConfigDraft[] | undefined,
  stepCount: number,
): StepConfigDraft[] {
  return Array.from({ length: stepCount }, (_, i) => ({
    ...createDefaultStepConfig(),
    ...current?.[i],
  }));
}

export function getStepConfigPanelPrice(config: StepConfig): number {
  return getStraightStepPanelPrice(config.widthBand, config.depthBand);
}

export type DimensionField = "widthBand" | "depthBand";

export const DIMENSION_FIELD_LABELS: Record<DimensionField, string> = {
  widthBand: "Largeur",
  depthBand: "Profondeur",
};
