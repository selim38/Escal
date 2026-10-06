"use client";

import { CaretDownIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

/**
 * Champs de saisie — design system, « Formulaires » : angles droits, bordure
 * 1,5 px, la bordure passe à l'orange au focus. En erreur, elle passe au rouge
 * (`aria-invalid`), ce qui rend l'état visible sans dépendre du seul message.
 */
export const fieldClass =
  "w-full border-[1.5px] border-border bg-surface px-4 py-3 text-[15px] text-heading outline-none transition-colors duration-200 placeholder:text-subtle/70 focus:border-primary aria-[invalid=true]:border-error";

export function FieldLabel({
  htmlFor,
  children,
  optional,
}: {
  htmlFor?: string;
  children: ReactNode;
  /** Mention affichée en graisse normale après le libellé, ex. « (optionnel) ». */
  optional?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-[13px] font-bold text-heading"
    >
      {children}
      {optional ? (
        <span className="font-normal text-subtle"> {optional}</span>
      ) : null}
    </label>
  );
}

/** Phrase d'aide sous un champ : quand et pourquoi le renseigner. */
export function FieldHelp({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-2 text-[13px] leading-snug text-subtle">
      {children}
    </p>
  );
}

/**
 * Message d'erreur d'un champ. `role="alert"` : annoncé par les lecteurs d'écran
 * dès son apparition, sans déplacer le focus.
 */
export function FieldError({ id, children }: { id?: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p
      id={id}
      role="alert"
      className="mt-2 flex items-start gap-1.5 text-[13px] font-semibold leading-snug text-error"
    >
      <WarningCircleIcon aria-hidden className="mt-px size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/**
 * Enveloppe d'un `<select>` natif : la flèche système est masquée
 * (`appearance-none` sur le select) et remplacée par un caret Phosphor, pour un
 * rendu identique d'un navigateur à l'autre.
 */
export function SelectShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <CaretDownIcon
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-heading"
      />
    </div>
  );
}

export const selectClass = `${fieldClass} cursor-pointer appearance-none pr-11`;

/** Ids `aria-describedby` présents, joints par une espace. */
export function describedBy(...ids: Array<string | false | null | undefined>) {
  const list = ids.filter(Boolean).join(" ");
  return list || undefined;
}
