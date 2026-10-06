"use client";

import { CheckIcon } from "@phosphor-icons/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Carte de choix — état unique pour toutes les sélections du tunnel.
 *
 * Recommandation Knewledge, « uniformisation des états Hover et Active » :
 *   - survol : contour orange léger ;
 *   - sélection : contour orange, fond orange léger, coche blanche dans un
 *     carré orange au coin supérieur droit.
 *
 * Ni arrondi, ni ombre, ni bordure intérieure blanche : une image posée dans la
 * carte va jusqu'au bord, sans marge qui formerait un cadre.
 *
 * L'alignement du texte reste celui du bouton (centré) : une carte à
 * description passe `text-left` dans `className`.
 */
export function OptionCard({
  selected,
  children,
  className = "",
  mark = true,
  markClassName,
  ...rest
}: {
  selected: boolean;
  children: ReactNode;
  className?: string;
  /** Coche de sélection. Omise sur les boutons trop bas pour la loger. */
  mark?: boolean;
  /** Position verticale de la coche, pour la centrer sur un bouton bas. */
  markClassName?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "aria-pressed">) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`relative border-[1.5px] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        selected
          ? "border-primary bg-selected"
          : "border-border-option bg-surface hover:border-primary/60"
      } ${className}`}
      {...rest}
    >
      {children}
      {selected && mark ? <SelectedMark className={markClassName} /> : null}
    </button>
  );
}

/** Coche de sélection : carré orange, coche blanche, coin supérieur droit. */
export function SelectedMark({ className = "top-2.5" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute right-2.5 z-10 grid size-7 place-items-center bg-primary text-white ${className}`}
    >
      <CheckIcon className="size-4" />
    </span>
  );
}
