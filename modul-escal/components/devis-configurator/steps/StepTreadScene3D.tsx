"use client";

import { Canvas } from "@react-three/fiber";
import { CameraControls, ContactShadows } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import type { DimensionField } from "@/lib/step-config";
import {
  formatSizeHint,
  getBalancedCameraViews,
  getBalancedVertices,
  getFiveSidedCameraViews,
  getFiveSidedPentagon,
  getPreviewThickness,
  getStraightCameraViews,
  resolveTreadSize3D,
  type CameraView3D,
  type FiveSidedVerts,
  type TreadSize3D,
  type Vec3,
} from "@/lib/tread-dimension-scale";
import type { DepthBand, StairLayout, WidthBand } from "@/lib/quote-schema";

import { FiveSidedPlanDiagram } from "./FiveSidedPlanDiagram";

type StepTreadScene3DProps = {
  layout: StairLayout;
  activeField: DimensionField | null;
  widthBand?: WidthBand;
  depthBand?: DepthBand;
};

const PRIMARY = "#ff6d1b";
const TREAD = "#d4c5b5";
const TREAD_TOP = "#f5f0eb";

const WIDTH_LABEL_BY_LAYOUT: Record<StairLayout, string> = {
  STRAIGHT: "Largeur",
  BALANCED: "Largeur (la + large)",
  FIVE_SIDED: "Largeur max.",
};

const LENGTH_LABEL_BY_LAYOUT: Record<StairLayout, string> = {
  STRAIGHT: "Longueur",
  BALANCED: "Longueur (la + longue)",
  FIVE_SIDED: "Profondeur max.",
};

function getCameraViews(
  layout: StairLayout,
  size: TreadSize3D,
): Record<"default" | DimensionField, CameraView3D> {
  switch (layout) {
    case "STRAIGHT":
      return getStraightCameraViews(size);
    case "BALANCED":
      return getBalancedCameraViews(size);
    case "FIVE_SIDED":
      return getFiveSidedCameraViews(size);
  }
}

function CameraRig({
  layout,
  activeField,
  size,
}: {
  layout: StairLayout;
  activeField: DimensionField | null;
  size: TreadSize3D;
}) {
  const controlsRef = useRef<CameraControls>(null);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const views = getCameraViews(layout, size);
    const key = activeField ?? "default";
    const view = views[key];
    void controls.setLookAt(...view.position, ...view.target, true);
  }, [activeField, layout, size]);

  return (
    <CameraControls
      ref={controlsRef}
      enabled={false}
      makeDefault
      mouseButtons={{ left: 0, middle: 0, right: 0, wheel: 0 }}
      touches={{ one: 0, two: 0, three: 0 }}
    />
  );
}

function makeMaterial(active: boolean, base = TREAD) {
  return new THREE.MeshStandardMaterial({
    color: active ? PRIMARY : base,
    emissive: active ? PRIMARY : "#000000",
    emissiveIntensity: active ? 0.45 : 0,
    roughness: 0.55,
    metalness: 0.08,
  });
}

function lift(v: Vec3, y: number): Vec3 {
  return [v[0], y, v[2]];
}

function TreadTri({
  a,
  b,
  c,
  material,
}: {
  a: Vec3;
  b: Vec3;
  c: Vec3;
  material: THREE.Material;
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2],
    ]);
    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, [a, b, c]);

  return <mesh geometry={geometry} material={material} castShadow receiveShadow />;
}

function TreadQuad({
  a,
  b,
  c,
  d,
  material,
}: {
  a: Vec3;
  b: Vec3;
  c: Vec3;
  d: Vec3;
  material: THREE.Material;
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2], a[0], a[1], a[2], c[0],
      c[1], c[2], d[0], d[1], d[2],
    ]);
    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, [a, b, c, d]);

  return <mesh geometry={geometry} material={material} castShadow receiveShadow />;
}

function LegendBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs sm:text-[10px] font-semibold leading-tight shadow-sm ${
        active
          ? "bg-primary text-white"
          : "border border-border bg-surface/95 text-muted"
      }`}
    >
      {label}
    </span>
  );
}

function DimensionLegend({
  layout,
  activeField,
  sizeHint,
}: {
  layout: StairLayout;
  activeField: DimensionField | null;
  sizeHint: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex flex-col items-center gap-1 px-2">
      <div className="flex justify-center gap-1.5">
        <LegendBadge
          label={WIDTH_LABEL_BY_LAYOUT[layout]}
          active={activeField === "widthBand"}
        />
        <LegendBadge
          label={LENGTH_LABEL_BY_LAYOUT[layout]}
          active={activeField === "depthBand"}
        />
      </div>
      <span className="rounded-full bg-surface/90 px-2 py-0.5 text-xs sm:text-[10px] text-muted shadow-sm">
        {sizeHint}
      </span>
    </div>
  );
}

function StraightTread({
  activeField,
  size,
}: {
  activeField: DimensionField | null;
  size: TreadSize3D;
}) {
  const wActive = activeField === "widthBand";
  const lActive = activeField === "depthBand";

  const materials = useMemo(() => {
    const lengthFace = makeMaterial(lActive);
    const widthFace = makeMaterial(wActive);
    const top = makeMaterial(false, TREAD_TOP);
    const neutral = makeMaterial(false);
    return [lengthFace, lengthFace, top, neutral, widthFace, widthFace];
  }, [wActive, lActive]);

  return (
    <mesh
      material={materials}
      castShadow
      receiveShadow
      position={[0, size.thickness / 2, 0]}
    >
      <boxGeometry args={[size.width, size.thickness, size.length]} />
    </mesh>
  );
}

function balancedVertsWithHeight(
  verts: ReturnType<typeof getBalancedVertices>,
  y: number,
) {
  return {
    bl: lift(verts.bl, y),
    br: lift(verts.br, y),
    fr: lift(verts.fr, y),
    fl: lift(verts.fl, y),
  };
}

function BalancedTread({
  activeField,
  size,
}: {
  activeField: DimensionField | null;
  size: TreadSize3D;
}) {
  const wActive = activeField === "widthBand";
  const lActive = activeField === "depthBand";

  const topMat = useMemo(() => makeMaterial(false, TREAD_TOP), []);
  const bottomMat = useMemo(() => makeMaterial(false), []);
  const widthMat = useMemo(() => makeMaterial(wActive), [wActive]);
  const lengthMat = useMemo(() => makeMaterial(lActive), [lActive]);
  const neutralSideMat = useMemo(() => makeMaterial(false), []);

  const { bottom, top } = useMemo(() => {
    const base = getBalancedVertices(size);
    return {
      bottom: balancedVertsWithHeight(base, 0),
      top: balancedVertsWithHeight(base, size.thickness),
    };
  }, [size]);

  return (
    <group>
      <TreadQuad a={top.fl} b={top.fr} c={top.br} d={top.bl} material={topMat} />
      <TreadQuad
        a={bottom.bl}
        b={bottom.br}
        c={bottom.fr}
        d={bottom.fl}
        material={bottomMat}
      />
      <TreadQuad
        a={bottom.fl}
        b={bottom.fr}
        c={top.fr}
        d={top.fl}
        material={widthMat}
      />
      <TreadQuad
        a={bottom.br}
        b={bottom.bl}
        c={top.bl}
        d={top.br}
        material={neutralSideMat}
      />
      <TreadQuad
        a={bottom.bl}
        b={bottom.fl}
        c={top.fl}
        d={top.bl}
        material={lengthMat}
      />
      <TreadQuad
        a={bottom.fr}
        b={bottom.br}
        c={top.br}
        d={top.fr}
        material={neutralSideMat}
      />
    </group>
  );
}

function pentagonVertsWithHeight(verts: FiveSidedVerts, y: number) {
  return {
    fl: lift(verts.fl, y),
    fr: lift(verts.fr, y),
    outer: lift(verts.outer, y),
    back: lift(verts.back, y),
    inner: lift(verts.inner, y),
  };
}

/** Prisme pentagonal — même matériaux que droit / balancée. */
function FiveSidedTread({
  activeField,
  size,
}: {
  activeField: DimensionField | null;
  size: TreadSize3D;
}) {
  const thickness = getPreviewThickness(size);

  const topMat = useMemo(() => makeMaterial(false, TREAD_TOP), []);
  const bottomMat = useMemo(() => makeMaterial(false), []);
  const neutralSideMat = useMemo(() => makeMaterial(false), []);

  const { bottom, top } = useMemo(() => {
    const b = getFiveSidedPentagon(size);
    return {
      bottom: pentagonVertsWithHeight(b, 0),
      top: pentagonVertsWithHeight(b, thickness),
    };
  }, [size, thickness]);

  return (
    <group>
      <TreadTri a={top.fl} b={top.fr} c={top.outer} material={topMat} />
      <TreadTri a={top.fl} b={top.outer} c={top.back} material={topMat} />
      <TreadTri a={top.fl} b={top.back} c={top.inner} material={topMat} />

      {/* Dessous pentagonal */}
      <TreadTri a={bottom.fl} b={bottom.outer} c={bottom.fr} material={bottomMat} />
      <TreadTri a={bottom.fl} b={bottom.back} c={bottom.outer} material={bottomMat} />
      <TreadTri a={bottom.fl} b={bottom.inner} c={bottom.back} material={bottomMat} />

      {/* 5 faces latérales */}
      <TreadQuad
        a={bottom.fl}
        b={bottom.fr}
        c={top.fr}
        d={top.fl}
        material={neutralSideMat}
      />
      <TreadQuad
        a={bottom.fr}
        b={bottom.outer}
        c={top.outer}
        d={top.fr}
        material={neutralSideMat}
      />
      <TreadQuad
        a={bottom.inner}
        b={bottom.back}
        c={top.back}
        d={top.inner}
        material={neutralSideMat}
      />
      <TreadQuad
        a={bottom.back}
        b={bottom.outer}
        c={top.outer}
        d={top.back}
        material={neutralSideMat}
      />
      <TreadQuad
        a={bottom.inner}
        b={bottom.fl}
        c={top.fl}
        d={top.inner}
        material={neutralSideMat}
      />
    </group>
  );
}

function Scene({
  layout,
  activeField,
  size,
}: {
  layout: StairLayout;
  activeField: DimensionField | null;
  size: TreadSize3D;
}) {
  const shadowScale = Math.max(size.width, size.length) * 4;

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-4, 3, -2]} intensity={0.4} />
      <hemisphereLight args={["#fff8f0", "#d4c5b5", 0.5]} />
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.5}
        scale={shadowScale}
        blur={2}
        far={2.5}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[shadowScale, shadowScale]} />
        <meshStandardMaterial color="#f5f0eb" roughness={0.95} />
      </mesh>
      {layout === "STRAIGHT" ? (
        <StraightTread activeField={activeField} size={size} />
      ) : null}
      {layout === "BALANCED" ? (
        <BalancedTread activeField={activeField} size={size} />
      ) : null}
      {layout === "FIVE_SIDED" ? (
        <FiveSidedTread activeField={activeField} size={size} />
      ) : null}
      <CameraRig layout={layout} activeField={activeField} size={size} />
    </>
  );
}

const FOOTER_BY_LAYOUT: Record<StairLayout, string> = {
  STRAIGHT:
    "Aperçu à l’échelle · face orange = champ actif (largeur ou longueur)",
  BALANCED:
    "Marche balancée · largeur = côté le plus large, longueur = côté le plus long",
  FIVE_SIDED:
    "Le schéma indique la largeur max. (nez) et la profondeur max. (coin profond)",
};

export default function StepTreadScene3D({
  layout,
  activeField,
  widthBand,
  depthBand,
}: StepTreadScene3DProps) {
  const size = useMemo(
    () => resolveTreadSize3D(widthBand, depthBand),
    [widthBand, depthBand],
  );
  const sizeHint = formatSizeHint(size);
  const isFiveSided = layout === "FIVE_SIDED";

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-xl bg-gradient-to-b from-[#ebe4dc] to-[#f5f0eb]">
      <div className="relative h-[200px] sm:h-[260px] w-full overflow-x-clip">
        <Canvas
          className={`!h-full !w-full ${isFiveSided ? "opacity-20" : ""}`}
          shadows={!isFiveSided}
          camera={{ position: [1.1, 0.75, 1.1], fov: 42 }}
          gl={{ antialias: true, alpha: isFiveSided }}
          dpr={[1, 1.5]}
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <Suspense fallback={null}>
            <Scene layout={layout} activeField={activeField} size={size} />
          </Suspense>
        </Canvas>
        {isFiveSided ? (
          <FiveSidedPlanDiagram size={size} activeField={activeField} />
        ) : (
          <DimensionLegend
            layout={layout}
            activeField={activeField}
            sizeHint={sizeHint}
          />
        )}
      </div>
      <p className="border-t border-[#d4c5b5]/60 px-2 py-2 text-center text-[10px] text-[#5c4a3a] sm:px-3 sm:text-[11px]">
        {FOOTER_BY_LAYOUT[layout]}
      </p>
    </div>
  );
}
