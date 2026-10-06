"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";

/**
 * Classes des boutons du design system — voir `lib/components.css` pour
 * l'animation de remplissage au survol.
 */
export function buttonClass(
  variant: "primary" | "secondary",
  size: "md" | "sm" = "md",
): string {
  return `kre-btn kre-btn-${variant}${size === "sm" ? " kre-btn-sm" : ""}`;
}

/**
 * Flèche fine Phosphor (style Regular) des boutons de navigation. Elle se
 * décale de 7 px dans son sens au survol du bouton parent.
 */
export function ButtonArrow({ dir }: { dir: "prev" | "next" }) {
  const Icon = dir === "prev" ? ArrowLeftIcon : ArrowRightIcon;
  return <Icon aria-hidden data-dir={dir} className="kre-btn-arrow size-[18px]" />;
}
