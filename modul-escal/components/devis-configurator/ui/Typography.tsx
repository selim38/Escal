"use client";

import type { ReactNode } from "react";

/**
 * En-tête d'étape — titre et phrase d'introduction, alignés à gauche.
 *
 * Titre calé sur la maquette Knewledge : Hanken Grotesk 600, 30 px,
 * interlettrage −0,01em, brun 900. Le texte d'introduction est en « brun
 * texte » du design system.
 */
export function StepHeader({
  title,
  subtitle,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <div>
      <StepTitle>{title}</StepTitle>
      {subtitle ? (
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{subtitle}</p>
      ) : null}
    </div>
  );
}

export function StepTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[26px] font-semibold leading-tight tracking-tight text-heading sm:text-3xl">
      {children}
    </h2>
  );
}

/** Intitulé d'un bloc à l'intérieur d'une étape, avec icône orange facultative. */
export function SectionTitle({
  icon,
  children,
  as: Tag = "h3",
}: {
  icon?: ReactNode;
  children: ReactNode;
  as?: "h3" | "legend" | "p";
}) {
  return (
    <Tag className="flex items-center gap-2.5 text-base font-bold text-heading">
      {icon}
      {children}
    </Tag>
  );
}

/**
 * Étiquette accolée à un titre (« Compris dans le prix », « + 19 € / marche »).
 * Toujours au même endroit, juste après l'intitulé qu'elle qualifie.
 */
export function Tag({
  icon,
  children,
  className = "",
}: {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap bg-tint px-2.5 py-1 text-xs font-bold text-brand-medium ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
