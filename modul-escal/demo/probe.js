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

/**
 * Parcours complet des 10 étapes jusqu'à la soumission, en mode démo.
 *
 * Sert à vérifier les événements `devis_step_complete` / `devis_submit` et,
 * quand l'attribut `confirmation-url` est posé, la redirection finale.
 *
 * Optionnel : `kreWalkToSubmit(hostIndex)` pour cibler une instance précise.
 */
window.kreWalkToSubmit = async function kreWalkToSubmit(hostIndex = 0) {
  const host = document.querySelectorAll("kre-configurateur")[hostIndex];
  const sr = host.shadowRoot;
  const wait = (ms = 150) => new Promise((r) => setTimeout(r, ms));
  // React et react-hook-form s'appuient sur leur propre suivi de valeur : passer
  // par le setter natif puis émettre `input` ET `change` couvre les deux (RHF
  // écoute `change` sur les <select>, React `input` sur les <input>).
  const setNative = (el, v) => {
    const d = Object.getOwnPropertyDescriptor(el.constructor.prototype, "value");
    d.set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  };
  const click = async (text) => {
    const el = [...sr.querySelectorAll("button, a")].find((e) =>
      e.textContent.trim().startsWith(text),
    );
    if (!el) throw new Error("introuvable : " + text);
    el.click();
    await wait();
  };
  const next = () => click("Suivant");

  // 1 type d'escalier · 2 décor · 3 contremarches · 4 nombre de marches
  await click("Fermé");
  await next();
  sr.querySelectorAll("fieldset button")[0].click();
  await wait();
  await next();
  await click("Noir mat");
  await next();
  setNative(sr.getElementById("kre-stepCount"), "3");
  await wait(250);
  await next();

  // 5 dimensions uniformes
  await click("Oui");
  await wait(250);
  setNative(sr.getElementById("kre-widthBand"), "W_1001_1300");
  setNative(sr.getElementById("kre-depthBand"), "D_LT_320");
  await wait(250);
  await next();

  // 6 embouts — une réponse par marche
  for (let i = 0; i < 3; i += 1) {
    await click("Oui"); // prise entre 2 murs
  }
  await wait(200);
  await next();

  // 7 marche palière
  await click("Nez + seuil");
  await wait(150);
  await click("Or");
  await wait(200);
  await next();

  // 8 récapitulatif (l'étape parquet est sautée : pas de raccord parquet)
  await next();

  // 9 coordonnées
  for (const [id, value] of [
    ["kre-lastName", "Test"],
    ["kre-firstName", "Recette"],
    ["kre-email", "recette@example.test"],
    ["kre-phone", "+33600000000"],
    ["kre-country", "France"],
  ]) {
    setNative(sr.getElementById(id), value);
    await wait(60);
  }
  await wait(300);

  const submit = [...sr.querySelectorAll("button[type=submit]")][0];
  if (!submit || submit.disabled) {
    throw new Error("bouton d'envoi indisponible — étape 10 incomplète");
  }
  submit.click();
  await wait(1500);

  return {
    success: /Demande envoyée/.test(sr.textContent),
    events: (window.dataLayer || []).map((e) => e.event),
  };
};
