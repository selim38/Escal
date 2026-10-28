import type { StepConfig, StepConfigDraft } from "@/lib/quote-schema";
import { getStraightStepPanelPrice } from "@/lib/straight-step-pricing";

export type { StepConfig, StepConfigDraft };

export function createDefaultStepConfig(): StepConfigDraft {
  return { layout: "STRAIGHT" };
}

/** Une configuration par marche à configurer (`treadCount`, palier exclu). */
export function ensureStepConfigs(
  current: StepConfigDraft[] | undefined,
  count: number,
): StepConfigDraft[] {
  return Array.from({ length: count }, (_, i) => ({
    ...createDefaultStepConfig(),
    ...current?.[i],
  }));
}

export function getStepConfigPanelPrice(config: StepConfig): number {
  return getStraightStepPanelPrice(config.widthBand, config.depthBand);
}

export type DimensionField = "widthBand" | "depthBand";
