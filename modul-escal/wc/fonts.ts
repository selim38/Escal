/**
 * Enregistrement de la police Geist.
 *
 * Un `@font-face` déclaré à l'intérieur d'un shadow root est **ignoré** par les
 * navigateurs : les polices ne peuvent être enregistrées qu'au niveau du document.
 * C'est la seule écriture du composant en dehors de son Shadow DOM — elle est
 * idempotente, limitée à un unique `<style>` identifiable, et documentée dans le
 * livrable d'intégration.
 *
 * Une seule police variable (69 Ko) couvre les graisses 100→900 : un fichier au
 * lieu de cinq statiques.
 *
 * Si l'injection échoue (CSP stricte côté WordPress), la pile de repli déclarée
 * dans `--kre-font-sans` (system-ui, -apple-system, …) prend le relais : le
 * configurateur reste parfaitement lisible.
 */

const STYLE_ID = "kre-configurateur-fonts";

export const FONT_FILE = "/fonts/geist-variable.woff2";

export function ensureFonts(assetsBase: string): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const href = `${assetsBase.replace(/\/+$/, "")}${FONT_FILE}`;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `@font-face{font-family:"Geist";src:url("${href}") format("woff2");font-weight:100 900;font-style:normal;font-display:swap;}`;

  try {
    document.head.appendChild(style);

    const preload = document.createElement("link");
    preload.rel = "preload";
    preload.as = "font";
    preload.type = "font/woff2";
    preload.href = href;
    preload.crossOrigin = "anonymous";
    document.head.appendChild(preload);
  } catch {
    // CSP stricte : on retombe sur la pile système, rien à signaler à l'utilisateur.
  }
}
