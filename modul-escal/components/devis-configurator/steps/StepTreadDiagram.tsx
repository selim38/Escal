"use client";

import dynamic from "next/dynamic";

import type { DimensionField } from "@/lib/step-config";
import type { DepthBand, StairLayout, WidthBand } from "@/lib/quote-schema";

const StepTreadScene3D = dynamic(() => import("./StepTreadScene3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[280px] items-center justify-center rounded-xl border border-border bg-muted-bg/50">
      <p className="text-sm text-muted">Chargement du modèle 3D…</p>
    </div>
  ),
});

type StepTreadDiagramProps = {
  layout: StairLayout;
  activeField: DimensionField | null;
  widthBand?: WidthBand;
  depthBand?: DepthBand;
};

export function StepTreadDiagram({
  layout,
  activeField,
  widthBand,
  depthBand,
}: StepTreadDiagramProps) {
  return (
    <div className="rounded-xl border border-border bg-muted-bg/30 p-1">
      <StepTreadScene3D
        layout={layout}
        activeField={activeField}
        widthBand={widthBand}
        depthBand={depthBand}
      />
    </div>
  );
}
