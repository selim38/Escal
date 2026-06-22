"use client";

/** Vue schématique : marche débordante — embout en 2 pièces. */
export function EndCapOverhangingAnimation() {
  return (
    <svg
      viewBox="0 0 280 160"
      preserveAspectRatio="xMidYMid meet"
      className="mx-auto h-auto w-full max-w-[240px] sm:max-w-[280px]"
      aria-hidden
    >
      <rect x="40" y="100" width="200" height="12" fill="#d4c5b5" rx="1" />
      <rect x="50" y="72" width="180" height="28" fill="#f5f0eb" stroke="#7a6550" strokeWidth="1.5" />
      <rect x="50" y="68" width="180" height="6" fill="#ebe4dc" stroke="#7a6550" strokeWidth="1" />

      <rect x="42" y="62" width="16" height="38" fill="#ff6d1b" rx="2" className="animate-pulse" />
      <rect x="222" y="62" width="16" height="38" fill="#ff6d1b" rx="2" className="animate-pulse" />

      <path
        d="M 50 68 L 230 68"
        stroke="#ff6d1b"
        strokeWidth="3"
        strokeDasharray="6 4"
        className="animate-pulse"
      />

      <text x="140" y="58" textAnchor="middle" className="fill-[#5c4a3a] text-[10px] font-medium">
        Nez débordant
      </text>
      <text x="50" y="52" className="fill-[#ff6d1b] text-[10px] font-semibold">
        Pièce 1
      </text>
      <text x="210" y="52" className="fill-[#ff6d1b] text-[10px] font-semibold">
        Pièce 2
      </text>
    </svg>
  );
}
