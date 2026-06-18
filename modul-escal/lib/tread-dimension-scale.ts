import type { DepthBand, WidthBand } from "@/lib/quote-schema";

/** Largeur représentative (m) — milieu de fourchette pour l’aperçu 3D. */
export const WIDTH_METERS: Record<WidthBand, number> = {
  W_LT_800: 0.75,
  W_801_1000: 0.9,
  W_1001_1300: 1.15,
  W_1301_1600: 1.45,
  W_1601_1800: 1.7,
};

/** Profondeur / giron représentatif (m). */
export const LENGTH_METERS: Record<DepthBand, number> = {
  D_LT_320: 0.28,
  D_GT_320: 0.36,
};

export const DEFAULT_WIDTH_M = 0.9;
export const DEFAULT_LENGTH_M = 0.28;
export const TREAD_THICKNESS_M = 0.04;

export type TreadSize3D = {
  width: number;
  length: number;
  thickness: number;
};

export type Vec3 = [number, number, number];

export type CameraView3D = {
  position: Vec3;
  target: Vec3;
};

export function resolveTreadSize3D(
  widthBand?: WidthBand,
  depthBand?: DepthBand,
): TreadSize3D {
  return {
    width: widthBand ? WIDTH_METERS[widthBand] : DEFAULT_WIDTH_M,
    length: depthBand ? LENGTH_METERS[depthBand] : DEFAULT_LENGTH_M,
    thickness: TREAD_THICKNESS_M,
  };
}

export function cameraDistanceMeters(size: TreadSize3D): number {
  const span = Math.max(size.width, size.length);
  return Math.max(0.75, span * 1.65);
}

export function formatSizeHint(size: TreadSize3D): string {
  const w = Math.round(size.width * 100);
  const l = Math.round(size.length * 100);
  return `≈ ${w} × ${l} cm (max.)`;
}

export function getStraightCameraViews(size: TreadSize3D): Record<
  "default" | "widthBand" | "depthBand",
  CameraView3D
> {
  const cy = size.thickness / 2;
  const d = cameraDistanceMeters(size);
  return {
    default: { position: [d * 0.62, d * 0.48, d * 0.62], target: [0, cy, 0] },
    widthBand: { position: [0, d * 0.38, d * 0.72], target: [0, cy, 0] },
    depthBand: { position: [d * 0.72, d * 0.38, 0], target: [0, cy, 0] },
  };
}

export type BalancedVerts = { bl: Vec3; br: Vec3; fr: Vec3; fl: Vec3 };

export function getBalancedVertices(size: TreadSize3D): BalancedVerts {
  const wFront = size.width;
  const wBack = size.width * 0.42;
  const zBack = -size.length * 0.45;
  const zFront = size.length * 0.52;
  return {
    bl: [-wBack * 0.55, 0, zBack],
    br: [wBack * 0.45, 0, zBack],
    fr: [wFront / 2, 0, zFront],
    fl: [-wFront / 2, 0, zFront],
  };
}

export function getBalancedCameraViews(size: TreadSize3D): Record<
  "default" | "widthBand" | "depthBand",
  CameraView3D
> {
  const v = getBalancedVertices(size);
  const cy = size.thickness / 2;
  const d = cameraDistanceMeters(size);
  const frontMid: Vec3 = [
    (v.fl[0] + v.fr[0]) / 2,
    cy,
    (v.fl[2] + v.fr[2]) / 2,
  ];
  const leftMid: Vec3 = [
    (v.bl[0] + v.fl[0]) / 2,
    cy,
    (v.bl[2] + v.fl[2]) / 2,
  ];
  return {
    default: { position: [d * 0.58, d * 0.52, d * 0.58], target: [0, cy, 0] },
    widthBand: {
      position: [frontMid[0], d * 0.38, frontMid[2] + d * 0.62],
      target: frontMid,
    },
    depthBand: {
      position: [leftMid[0] - d * 0.62, d * 0.38, leftMid[2]],
      target: leftMid,
    },
  };
}

/** Pentagone irrégulier — 5 sommets CCW (vue dessus). */
export type FiveSidedVerts = {
  fl: Vec3;
  fr: Vec3;
  outer: Vec3;
  back: Vec3;
  inner: Vec3;
};

function normalizePentagonOnGround(v: FiveSidedVerts): FiveSidedVerts {
  const pts = [v.fl, v.fr, v.outer, v.back, v.inner];
  const minZ = Math.min(...pts.map((p) => p[2]));
  const minX = Math.min(...pts.map((p) => p[0]));
  const maxX = Math.max(...pts.map((p) => p[0]));
  const cx = (minX + maxX) / 2;
  const ground = (p: Vec3): Vec3 => [p[0] - cx, p[1], p[2] - minZ];
  return {
    fl: ground(v.fl),
    fr: ground(v.fr),
    outer: ground(v.outer),
    back: ground(v.back),
    inner: ground(v.inner),
  };
}

export function getFiveSidedPentagon(size: TreadSize3D): FiveSidedVerts {
  const W = size.width;
  const D = size.length;
  // Forme "flèche" pointant à droite (vue du dessus) :
  // côté gauche vertical plat, pointe au milieu de la profondeur à droite.
  return normalizePentagonOnGround({
    fl:    [-W / 2,  0,     0    ],   // avant-gauche
    fr:    [ W * 0.18, 0,   0    ],   // avant-droit (épaulement)
    outer: [ W / 2,  0,   D / 2  ],   // pointe droite (côté le plus profond)
    back:  [ W * 0.18, 0,   D    ],   // arrière-droit (épaulement)
    inner: [-W / 2,  0,     D    ],   // arrière-gauche
  });
}

export function getPreviewThickness(size: TreadSize3D): number {
  return Math.max(0.1, size.width * 0.1);
}

function pentagonCentroid(v: FiveSidedVerts, y: number): Vec3 {
  return [
    (v.fl[0] + v.fr[0] + v.outer[0] + v.back[0] + v.inner[0]) / 5,
    y,
    (v.fl[2] + v.fr[2] + v.outer[2] + v.back[2] + v.inner[2]) / 5,
  ];
}

export function getFiveSidedCameraViews(size: TreadSize3D): Record<
  "default" | "widthBand" | "depthBand",
  CameraView3D
> {
  const v = getFiveSidedPentagon(size);
  const t = getPreviewThickness(size);
  const center = pentagonCentroid(v, t / 2);
  const span = Math.max(size.width, size.length);
  const dist = Math.max(1.4, span * 2.4);

  return {
    default: {
      position: [dist * 0.65, dist * 1.05, dist * 0.55],
      target: center,
    },
    widthBand: {
      position: [0, dist * 1.15, -dist * 0.95],
      target: center,
    },
    depthBand: {
      position: [dist * 1.05, dist * 0.95, dist * 0.25],
      target: center,
    },
  };
}
