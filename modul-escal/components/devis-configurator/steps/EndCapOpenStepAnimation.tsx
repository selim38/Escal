"use client";

import type { EndSide } from "@/lib/quote-schema";

type EndCapOpenStepAnimationProps = {
  firstStepSide: EndSide;
  lateralSide: EndSide;
};

/** Vue schématique : 1ʳᵉ marche + embout latéral sur un côté. */
export function EndCapOpenStepAnimation({
  firstStepSide,
  lateralSide,
}: EndCapOpenStepAnimationProps) {
  const capRight = firstStepSide === "RIGHT";
  const lateralRight = lateralSide === "RIGHT";

  return (
    <svg
      viewBox="0 0 280 160"
      preserveAspectRatio="xMidYMid meet"
      className="mx-auto h-auto w-full max-w-[240px] sm:max-w-[280px]"
      aria-hidden
    >
      <rect x="40" y="100" width="200" height="12" fill="#d4c5b5" rx="1" />
      <rect x="60" y="78" width="160" height="22" fill="#ebe4dc" stroke="#7a6550" strokeWidth="1.5" />
      <rect x="60" y="62" width="160" height="16" fill="#f5f0eb" stroke="#7a6550" strokeWidth="1" opacity="0.9" />

      {capRight ? (
        <rect x="218" y="62" width="14" height="38" fill="#ff6d1b" rx="2" className="animate-pulse" />
      ) : (
        <rect x="48" y="62" width="14" height="38" fill="#ff6d1b" rx="2" className="animate-pulse" />
      )}

      {lateralRight ? (
        <rect x="208" y="40" width="12" height="50" fill="#ff6d1b" opacity="0.85" rx="2" className="animate-pulse" />
      ) : (
        <rect x="60" y="40" width="12" height="50" fill="#ff6d1b" opacity="0.85" rx="2" className="animate-pulse" />
      )}

      <text x="140" y="55" textAnchor="middle" className="fill-[#5c4a3a] text-[10px] font-medium">
        1ʳᵉ marche
      </text>
      <text
        x={capRight ? 225 : 55}
        y={capRight ? 58 : 58}
        textAnchor="middle"
        className="fill-[#ff6d1b] text-[10px] font-semibold"
      >
        {capRight ? "Droite" : "Gauche"}
      </text>
      <text
        x={lateralRight ? 214 : 66}
        y={32}
        textAnchor="middle"
        className="fill-[#ff6d1b] text-[10px] font-semibold"
      >
        Latéral
      </text>
    </svg>
  );
}
