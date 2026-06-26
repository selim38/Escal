import { DECOR_CATALOG } from "@/lib/decor-catalog";
import { RISER_OPTIONS } from "@/lib/riser-options";
import { STAIR_LAYOUT_OPTIONS } from "@/lib/stair-layout-catalog";

import { STEP_END_CAP_OPTIONS } from "@/lib/step-end-cap-catalog";
import type {
  Decor,
  DepthBand,
  LandingFinish,
  EndSide,
  RiserOption,
  SeuilColor,
  StairLayout,
  StepEndCap,
  WidthBand,
} from "@/lib/quote-schema";

export const DECOR_LABELS: Record<Decor, string> = Object.fromEntries(
  DECOR_CATALOG.map((d) => [d.id, d.label]),
) as Record<Decor, string>;

export const RISER_OPTION_LABELS: Record<RiserOption, string> = Object.fromEntries(
  RISER_OPTIONS.map((o) => [o.id, o.label]),
) as Record<RiserOption, string>;

export const STAIR_LAYOUT_LABELS: Record<StairLayout, string> = Object.fromEntries(
  STAIR_LAYOUT_OPTIONS.map((o) => [o.id, o.label]),
) as Record<StairLayout, string>;

/** Fourchettes largeur (mm) — marche droite. */
export const WIDTH_LABELS: Record<WidthBand, string> = {
  W_LT_800: "< 800 mm",
  W_801_1000: "801 – 1000 mm",
  W_1001_1300: "1001 – 1300 mm",
  W_1301_1600: "1301 – 1600 mm",
  W_1601_1800: "1601 – 1800 mm",
};

/** Fourchettes profondeur / giron (mm) — marche droite. */
export const DEPTH_LABELS: Record<DepthBand, string> = {
  D_LT_320: "< 320 mm",
  D_GT_320: "> 320 mm",
};

export const STEP_END_CAP_LABELS: Record<StepEndCap, string> = Object.fromEntries(
  STEP_END_CAP_OPTIONS.map((o) => [o.id, o.label]),
) as Record<StepEndCap, string>;

export const END_SIDE_LABELS: Record<EndSide, string> = {
  LEFT: "Gauche",
  RIGHT: "Droite",
};

export const LANDING_FINISH_LABELS: Record<LandingFinish, string> = {
  NONE: "Sans palier",
  NEZ_SEUIL: "Nez + seuil",
  NEZ_RACCORD_PARQUET: "Nez de raccord parquet",
};

export const SEUIL_COLOR_LABELS: Record<SeuilColor, string> = {
  OR: "Or",
  NOIR: "Noir",
  ALUMINIUM: "Aluminium",
};
