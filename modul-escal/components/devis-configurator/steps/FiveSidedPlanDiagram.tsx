"use client";

import type { DimensionField } from "@/lib/step-config";
import {
  getFiveSidedPentagon,
  type TreadSize3D,
} from "@/lib/tread-dimension-scale";

type FiveSidedPlanDiagramProps = {
  size: TreadSize3D;
  activeField: DimensionField | null;
};

const VB_W = 300;
const VB_H = 210;
const PAD = 36;

function toSvgPoint(
  p: [number, number, number],
  minX: number,
  maxZ: number,
  scale: number,
) {
  return {
    x: PAD + (p[0] - minX) * scale,
    y: PAD + (maxZ - p[2]) * scale,
  };
}

export function FiveSidedPlanDiagram({
  size,
  activeField,
}: FiveSidedPlanDiagramProps) {
  const v = getFiveSidedPentagon(size);
  // ring: fl(0) → fr(1) → outer(2) → back(3) → inner(4)
  const ring = [v.fl, v.fr, v.outer, v.back, v.inner];

  const xs = ring.map((p) => p[0]);
  const zs = ring.map((p) => p[2]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);
  const scale = Math.min(
    (VB_W - PAD * 2) / (maxX - minX || 1),
    (VB_H - PAD * 2) / (maxZ - minZ || 1),
  );

  const svg = ring.map((p) => toSvgPoint(p, minX, maxZ, scale));
  const outline =
    svg.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") +
    " Z";

  // Points nommés
  const fl    = svg[0]; // avant-gauche  (bas-gauche SVG)
  const fr    = svg[1]; // épaulement haut-droite
  const outer = svg[2]; // pointe droite
  const back  = svg[3]; // épaulement bas-droite
  const inner = svg[4]; // arrière-gauche (haut-gauche SVG)

  const wActive = activeField === "widthBand";
  const dActive = activeField === "depthBand";

  const color = (active: boolean) => (active ? "#ff6d1b" : "#b8a898");
  const sw    = (active: boolean) => (active ? 2 : 1.5);

  // Côte largeur : horizontale en haut (fl → outer)
  const coteWY = Math.min(fl.y, inner.y, fr.y, outer.y, back.y) - 18;
  // Côte profondeur : verticale à gauche (inner → fl)
  const coteDX = Math.min(fl.x, inner.x) - 18;

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#f5f0eb]/92 px-2 sm:px-4">
      <p className="mb-1 text-center text-[10px] font-medium text-[#5c4a3a]">
        Vue du dessus — contour de la marche
      </p>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-auto w-full max-w-[240px] sm:max-w-[300px]"
        aria-label="Schéma pentagonal de la marche 5 côtés"
      >
        {/* Forme */}
        <path d={outline} fill="#ebe4dc" stroke="#7a6550" strokeWidth={2} strokeLinejoin="round" />

        {/* Arêtes largeur actives (fl → fr → outer) */}
        {wActive && (
          <>
            <line x1={fl.x} y1={fl.y} x2={fr.x} y2={fr.y}
              stroke="#ff6d1b" strokeWidth={4} strokeLinecap="round" />
            <line x1={fr.x} y1={fr.y} x2={outer.x} y2={outer.y}
              stroke="#ff6d1b" strokeWidth={4} strokeLinecap="round" />
          </>
        )}

        {/* Arête profondeur active (inner → fl) */}
        {dActive && (
          <line x1={inner.x} y1={inner.y} x2={fl.x} y2={fl.y}
            stroke="#ff6d1b" strokeWidth={4} strokeLinecap="round" />
        )}

        {/* Point de la pointe */}
        <circle cx={outer.x} cy={outer.y} r={3}
          fill={dActive ? "#ff6d1b" : "#7a6550"} />

        {/* ── Côte largeur (horizontale en haut, fl → outer) ── */}
        <line x1={fl.x}    y1={fl.y}    x2={fl.x}    y2={coteWY}
          stroke={color(wActive)} strokeWidth={1} strokeDasharray="3 3" />
        <line x1={outer.x} y1={outer.y} x2={outer.x} y2={coteWY}
          stroke={color(wActive)} strokeWidth={1} strokeDasharray="3 3" />
        <line x1={fl.x} y1={coteWY} x2={outer.x} y2={coteWY}
          stroke={color(wActive)} strokeWidth={sw(wActive)} strokeLinecap="round" />
        <line x1={fl.x}    y1={coteWY - 5} x2={fl.x}    y2={coteWY + 5}
          stroke={color(wActive)} strokeWidth={sw(wActive)} />
        <line x1={outer.x} y1={coteWY - 5} x2={outer.x} y2={coteWY + 5}
          stroke={color(wActive)} strokeWidth={sw(wActive)} />

        {/* ── Côte profondeur (verticale à gauche, inner → fl) ── */}
        <line x1={inner.x} y1={inner.y} x2={coteDX} y2={inner.y}
          stroke={color(dActive)} strokeWidth={1} strokeDasharray="3 3" />
        <line x1={fl.x}    y1={fl.y}    x2={coteDX} y2={fl.y}
          stroke={color(dActive)} strokeWidth={1} strokeDasharray="3 3" />
        <line x1={coteDX} y1={inner.y} x2={coteDX} y2={fl.y}
          stroke={color(dActive)} strokeWidth={sw(dActive)} strokeLinecap="round" />
        <line x1={coteDX - 5} y1={inner.y} x2={coteDX + 5} y2={inner.y}
          stroke={color(dActive)} strokeWidth={sw(dActive)} />
        <line x1={coteDX - 5} y1={fl.y}    x2={coteDX + 5} y2={fl.y}
          stroke={color(dActive)} strokeWidth={sw(dActive)} />

        {/* Label nez */}
        <text x={(fl.x + fr.x) / 2} y={fl.y + 14}
          textAnchor="middle" fontSize={10} fill="#8a7358">
          Nez (avant)
        </text>
      </svg>
    </div>
  );
}
