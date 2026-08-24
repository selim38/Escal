/**
 * <kre-configurateur> — point d'entrée du bundle Web Component.
 *
 * Livrable : un unique fichier JS chargé en `defer` depuis une page WordPress.
 *   <script src="https://escal.point-soft.fr/wc/v1/kre-configurateur.js" defer></script>
 *   <kre-configurateur lang="fr" theme="kre"></kre-configurateur>
 *
 * Le composant monte React dans un Shadow DOM ouvert : les styles du thème hôte
 * ne peuvent pas l'atteindre, et les siens ne fuient pas vers la page.
 */

import { createRoot, type Root } from "react-dom/client";

import {
  configFromAttributes,
  DEFAULT_CONFIG,
  KRE_ATTRIBUTES,
  type KreConfig,
} from "@/lib/config";

import { renderConfigurator } from "./mount";
import { ensureFonts } from "./fonts";
import { splitStyles } from "./styles-split";
import rawStyles from "./styles.css?inline";

export const TAG_NAME = "kre-configurateur";

/**
 * Base des assets déduite de l'URL du script.
 * `import.meta.url` pointe vers le bundle servi par Point Soft, donc les images
 * sont résolues sur notre domaine et non sur celui de WordPress.
 */
function inferAssetsBase(): string | undefined {
  try {
    return new URL(/* @vite-ignore */ ".", import.meta.url).href.replace(
      /\/+$/,
      "",
    );
  } catch {
    return undefined;
  }
}

const { documentCss, shadowCss } = splitStyles(rawStyles);

const PROPERTIES_STYLE_ID = "kre-configurateur-properties";

/**
 * Enregistre les `@property` de Tailwind au niveau du document (voir
 * `styles-split.ts` pour la raison). Idempotent, un seul `<style>`.
 */
function ensureRegisteredProperties(): void {
  if (!documentCss) return;
  if (document.getElementById(PROPERTIES_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = PROPERTIES_STYLE_ID;
  style.textContent = documentCss;
  try {
    document.head.appendChild(style);
  } catch {
    // CSP stricte : bordures et dégradés dégradés, mais le composant reste utilisable.
  }
}

/** Feuille de styles partagée par toutes les instances (une seule construction). */
let sharedSheet: CSSStyleSheet | null = null;

function adoptStyles(shadow: ShadowRoot): void {
  const supportsAdopted =
    typeof CSSStyleSheet !== "undefined" &&
    "adoptedStyleSheets" in Document.prototype &&
    "replaceSync" in CSSStyleSheet.prototype;

  if (supportsAdopted) {
    if (!sharedSheet) {
      sharedSheet = new CSSStyleSheet();
      sharedSheet.replaceSync(shadowCss);
    }
    shadow.adoptedStyleSheets = [sharedSheet];
    return;
  }

  // Repli (Safari < 16.4) : un <style> par shadow root.
  const style = document.createElement("style");
  style.textContent = shadowCss;
  shadow.appendChild(style);
}

export class KreConfigurateurElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return [...KRE_ATTRIBUTES];
  }

  #root: Root | null = null;
  #shadow: ShadowRoot | null = null;
  /** Figées au montage : les changer en cours de session n'a pas de sens. */
  #frozen: Pick<KreConfig, "endpoint" | "assetsBase"> | null = null;

  connectedCallback(): void {
    if (this.#root) return;

    ensureRegisteredProperties();
    this.#shadow = this.attachShadow({ mode: "open", delegatesFocus: true });
    adoptStyles(this.#shadow);

    const config = this.#readConfig();
    this.#frozen = { endpoint: config.endpoint, assetsBase: config.assetsBase };
    ensureFonts(config.assetsBase);

    const container = document.createElement("div");
    container.setAttribute("lang", config.locale);
    this.#shadow.appendChild(container);

    this.#root = createRoot(container);
    this.#render();
  }

  attributeChangedCallback(): void {
    // Ignoré avant le montage : connectedCallback lit tous les attributs.
    if (!this.#root) return;
    this.#render();
  }

  disconnectedCallback(): void {
    // Démontage différé : un page builder qui déplace le nœud dans le DOM
    // déclenche disconnected + connected dans la même tâche.
    const root = this.#root;
    const shadow = this.#shadow;
    this.#root = null;
    this.#shadow = null;
    this.#frozen = null;
    queueMicrotask(() => {
      if (this.isConnected) return;
      root?.unmount();
      shadow?.replaceChildren();
    });
  }

  #readConfig(): KreConfig {
    const inferredAssetsBase = inferAssetsBase();
    return {
      ...DEFAULT_CONFIG,
      ...(inferredAssetsBase ? { assetsBase: inferredAssetsBase } : {}),
      ...configFromAttributes(this),
      // `endpoint` et `assetsBase` restent ceux du montage initial : les changer
      // en cours de session invaliderait les URLs déjà résolues.
      ...(this.#frozen ?? {}),
    };
  }

  #render(): void {
    const container = this.#shadow?.firstElementChild;
    const config = this.#readConfig();
    if (container) container.setAttribute("lang", config.locale);
    this.#root?.render(renderConfigurator(config));
  }
}

/**
 * Enregistrement défensif : un thème ou un plugin WordPress peut charger le
 * script deux fois (concaténation, cache, shortcode dupliqué).
 */
if (typeof customElements !== "undefined" && !customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, KreConfigurateurElement);
}
