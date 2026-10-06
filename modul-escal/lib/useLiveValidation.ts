"use client";

import { useFormContext } from "react-hook-form";

import { validateFormField, type QuoteFormDraft } from "@/lib/quote-schema";

type LiveField = Parameters<typeof validateFormField>[0];

/**
 * Validation au fil de la saisie, pour les champs tapés au clavier.
 *
 * Le formulaire n'a pas de résolveur : sans ce hook, une valeur incorrecte
 * grisait le bouton « Suivant » sans rien dire. Recommandation Knewledge :
 * signaler le champ mal rempli à l'utilisateur.
 *
 * Stratégie « tard pour signaler, tôt pour lever » : l'erreur apparaît à la
 * sortie du champ (pas au milieu d'une frappe, où « 1 » serait déjà « trop
 * court » pour 175), puis disparaît dès que la saisie redevient valide.
 */
export function useLiveValidation() {
  const { getValues, setError, clearErrors, getFieldState } =
    useFormContext<QuoteFormDraft>();

  /** Valide maintenant et affiche ou retire l'erreur. */
  const check = (name: LiveField) => {
    const message = validateFormField(name, getValues(name));
    if (message) setError(name, { type: "manual", message });
    else clearErrors(name);
  };

  /** Pendant la frappe : ne fait que lever une erreur déjà affichée. */
  const recheck = (name: LiveField) => {
    if (getFieldState(name).error) check(name);
  };

  /**
   * Sortie d'un champ obligatoire : signale une saisie incorrecte, mais pas un
   * champ simplement traversé au clavier. Les champs restés vides sont
   * signalés à l'envoi.
   */
  const touch = (name: LiveField) => {
    const value = getValues(name);
    if (value === undefined || value === "") return;
    check(name);
  };

  return { check, recheck, touch };
}
