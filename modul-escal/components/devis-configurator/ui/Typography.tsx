"use client";

import type { ReactNode } from "react";

/**
 * Accroche en capitales — composant `Eyebrow` du design system Knewledge.
 *
 * Specs reprises telles quelles : graisse 800, 12 px, interlettrage 0,14em,
 * capitales, couleur `--text-accent`. C'est ce contraste entre des capitales
 * très espacées et des titres à interlettrage négatif qui donne au site son
 * caractère — sans lui, la typographie paraît plate.
 */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3.5 text-xs font-extrabold uppercase tracking-wider text-accent">
      {children}
    </p>
  );
}

/**
 * Titre d'étape — calé sur le `h1` du design system : graisse 900,
 * interlettrage −0,02em, couleur `--text-strong`.
 *
 * L'échelle est un cran en dessous du héros du site (qui monte à 56 px) : le
 * composant s'insère dans une page qui a déjà son propre titre principal.
 */
export function StepTitle({
  children,
  align = "center",
}: {
  children: ReactNode;
  /** Les étapes sont centrées, l'en-tête du composant est aligné à gauche. */
  align?: "center" | "left";
}) {
  return (
    <h2
      className={`text-2xl font-black leading-tight tracking-tight text-heading sm:text-3xl ${
        align === "center" ? "text-center" : ""
      }`}
    >
      {children}
    </h2>
  );
}

/** Sous-titre d'étape. */
export function StepSubtitle({
  children,
  align = "center",
}: {
  children: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <p
      className={`text-base text-muted ${align === "center" ? "text-center" : ""}`}
    >
      {children}
    </p>
  );
}
