/**
 * Découpage de la feuille de styles entre document et shadow root.
 *
 * Tailwind v4 s'appuie massivement sur les propriétés personnalisées
 * enregistrées (`@property --tw-border-style`, `--tw-gradient-*`, `--tw-ring-*`,
 * …) : environ 64 déclarations. Or **une règle `@property` est ignorée à
 * l'intérieur d'un shadow root** — le registre des propriétés personnalisées est
 * global au document.
 *
 * Conséquence si on ne fait rien : `var(--tw-border-style)` devient invalide à
 * la valeur calculée, `border-style` retombe sur `none`, et *toutes* les
 * bordures du configurateur disparaissent (constaté : `border-width` calculé à
 * 0px). Même symptôme pour les dégradés, les `ring-*` et les ombres.
 *
 * On extrait donc les `@property` pour les injecter une seule fois dans
 * `document.head`. Elles ne déclarent aucun style : ce sont des enregistrements
 * de type, sans effet visuel sur la page hôte.
 */

export type SplitStyles = {
  /** `@property` — à injecter dans le document. */
  documentCss: string;
  /** Tout le reste — à adopter dans le shadow root. */
  shadowCss: string;
};

const AT_PROPERTY = "@property";

export function splitStyles(css: string): SplitStyles {
  const properties: string[] = [];
  let rest = "";
  let cursor = 0;

  for (;;) {
    const start = css.indexOf(AT_PROPERTY, cursor);
    if (start === -1) {
      rest += css.slice(cursor);
      break;
    }

    const open = css.indexOf("{", start);
    if (open === -1) {
      rest += css.slice(cursor);
      break;
    }

    // Fin du bloc par comptage d'accolades — les valeurs `initial-value` peuvent
    // contenir des parenthèses mais pas d'accolade non appariée.
    let depth = 0;
    let end = -1;
    for (let i = open; i < css.length; i += 1) {
      const c = css[i];
      if (c === "{") depth += 1;
      else if (c === "}") {
        depth -= 1;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
    if (end === -1) {
      rest += css.slice(cursor);
      break;
    }

    rest += css.slice(cursor, start);
    properties.push(css.slice(start, end));
    cursor = end;
  }

  return { documentCss: properties.join(""), shadowCss: rest };
}
