/**
 * Empreinte de rendu du configurateur, utilisée par la recette :
 * `index.html` (styles hôtes neutres) et `demo/hostile.html` (thème agressif)
 * doivent produire exactement la même sortie.
 */
window.kreFingerprint = function kreFingerprint() {
  const host = document.querySelector("kre-configurateur");
  const sr = host.shadowRoot;
  const PROPS = [
    "display", "position", "boxSizing", "width", "height",
    "marginTop", "marginBottom", "paddingTop", "paddingLeft",
    "borderTopWidth", "borderStyle", "borderTopColor", "borderRadius",
    "backgroundColor", "color", "fontFamily", "fontSize", "fontWeight",
    "lineHeight", "letterSpacing", "textTransform", "textAlign",
    "textDecorationLine", "listStyleType", "filter", "opacity", "cursor",
    "gap", "maxWidth", "flexDirection", "gridTemplateColumns", "zIndex",
  ];
  const out = [];
  const walk = (node, path) => {
    if (node.nodeType !== 1) return;
    const cs = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    out.push([
      path,
      node.tagName,
      Math.round(rect.width),
      Math.round(rect.height),
      PROPS.map((p) => cs[p]).join("|"),
    ].join("~"));
    let i = 0;
    for (const child of node.children) {
      walk(child, `${path}/${child.tagName}[${i++}]`);
    }
  };
  for (const child of sr.children) walk(child, child.tagName);
  return out.join("\n");
};

/**
 * Avance le tunnel jusqu'à l'étape 5 (dimensions) — l'étape la plus riche en
 * mise en page (grilles, selects, photos guides). Permet de comparer l'empreinte
 * de rendu ailleurs qu'à l'étape 1.
 */
window.kreWalkToDimensions = async function kreWalkToDimensions() {
  const sr = document.querySelector("kre-configurateur").shadowRoot;
  const wait = (ms = 150) => new Promise((r) => setTimeout(r, ms));
  const setNative = (el, v) => {
    const d = Object.getOwnPropertyDescriptor(el.constructor.prototype, "value");
    d.set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  const clickText = async (t) => {
    const el = [...sr.querySelectorAll("button")].find((e) =>
      e.textContent.trim().startsWith(t),
    );
    if (!el) throw new Error("bouton introuvable : " + t);
    el.click();
    await wait();
  };

  await clickText("Fermé");
  await clickText("Suivant");
  sr.querySelectorAll("fieldset button")[0].click();
  await wait();
  await clickText("Suivant");
  await clickText("Noir mat");
  await clickText("Suivant");
  setNative(sr.getElementById("kre-stepCount"), "8");
  await wait(250);
  await clickText("Suivant");
  await clickText("Oui");
  await wait(300);
  return Boolean(sr.getElementById("kre-exactDepth"));
};
