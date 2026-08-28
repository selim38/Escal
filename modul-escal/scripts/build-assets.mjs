/**
 * Conversion des visuels du configurateur en WebP.
 *
 * Exigence du cahier des charges Knewledge (§6.1) : « les images (vignettes
 * matériaux) doivent être servies en WebP avec lazy loading ».
 *
 * `assets-src/` contient les masters JPG/PNG (12,2 Mo) et n'est pas déployé.
 * `public/` ne reçoit que les WebP générés (1,2 Mo) — c'est ce dossier qui est
 * servi, à la fois par l'export Next sous /calcul et par le bundle Web Component.
 *
 * Prérequis : `cwebp` (paquet webp, `brew install webp`).
 * Idempotent : un `.webp` plus récent que son master est laissé tel quel.
 *
 * Usage : npm run assets:webp [-- --force]
 */

import { execFile } from "node:child_process";
import { mkdir, readdir, stat } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

const SOURCE_DIR = new URL("../assets-src/", import.meta.url).pathname;
const OUTPUT_DIR = new URL("../public/", import.meta.url).pathname;
const SOURCE_EXT = new Set([".jpg", ".jpeg", ".png"]);

/**
 * Qualité et largeur maximale par dossier.
 *
 * Les largeurs de rendu réelles (mesurées dans le composant) justifient un
 * plafond : servir du 1086 px pour un affichage à 400 px double inutilement le
 * poids. Le plafond est fixé à ~2× la largeur de rendu, pour rester net sur les
 * écrans à haute densité.
 *
 * `dimensions/` méritait une attention particulière : ce sont des photos
 * annotées de 1086×1448 enregistrées en PNG (1,3 à 1,6 Mo chacune, 8,1 Mo au
 * total). Le PNG est le mauvais format ici — en WebP avec perte et plafonnées à
 * 800 px, elles passent sous 100 Ko sans perte visible à la taille d'affichage.
 */
const OPTIONS_BY_DIR = {
  //           logo en aplats à bords nets, avec canal alpha : le sans-perte est
  //           à la fois plus fidèle et plus léger que le lossy (6,9 Ko contre
  //           9,5 Ko à q90). Rendu ≈ 160 px de large, plafond à 3× pour les
  //           écrans à haute densité.
  brand: { lossless: true, maxWidth: 480 },
  //           rendu ≈ 400 px (grille 2 colonnes dans max-w-2xl)
  dimensions: { quality: 82, maxWidth: 800 },
  //           rendu ≈ 400 px (aspect-video, grille 2 colonnes)
  escalier: { quality: 80, maxWidth: 800 },
  //           rendu ≈ 140 px (vignettes décor, 6 par ligne)
  decor: { quality: 80, maxWidth: 400 },
  //           rendu ≈ 200 px (photo contremarche, 3 par ligne)
  CM: { quality: 80, maxWidth: 480 },
  //           rendu ≈ 240 px (figure d'exemple)
  etape: { quality: 80, maxWidth: 560 },
  //           rendu ≈ 320 px (illustration d'une option d'embout)
  embout: { quality: 80, maxWidth: 640 },
  default: { quality: 80, maxWidth: 1000 },
};

const force = process.argv.includes("--force");

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

function cwebpArgs(path) {
  const segment = path.slice(SOURCE_DIR.length).split("/")[0];
  const opts = OPTIONS_BY_DIR[segment] ?? OPTIONS_BY_DIR.default;
  // `-resize <w> 0` conserve le ratio ; cwebp n'agrandit jamais une image plus
  // petite que le plafond.
  const resize = ["-resize", String(opts.maxWidth), "0"];
  return opts.lossless
    ? ["-lossless", "-z", "9", ...resize]
    : ["-q", String(opts.quality), "-m", "6", ...resize];
}

async function isUpToDate(source, target) {
  if (force) return false;
  try {
    const [s, t] = await Promise.all([stat(source), stat(target)]);
    return t.mtimeMs >= s.mtimeMs;
  } catch {
    return false;
  }
}

async function main() {
  try {
    await run("cwebp", ["-version"]);
  } catch {
    console.error(
      "cwebp est introuvable. Installation : brew install webp (macOS) " +
        "ou apt install webp (Debian/Ubuntu).",
    );
    process.exit(1);
  }

  let converted = 0;
  let skipped = 0;
  let sourceBytes = 0;
  let targetBytes = 0;

  for await (const source of walk(SOURCE_DIR)) {
    if (!SOURCE_EXT.has(extname(source).toLowerCase())) continue;

    const target = join(
      OUTPUT_DIR,
      source.slice(SOURCE_DIR.length).replace(/\.(jpe?g|png)$/i, ".webp"),
    );
    await mkdir(dirname(target), { recursive: true });
    sourceBytes += (await stat(source)).size;

    if (await isUpToDate(source, target)) {
      skipped += 1;
      targetBytes += (await stat(target)).size;
      continue;
    }

    await run("cwebp", [...cwebpArgs(source), source, "-o", target]);
    converted += 1;
    targetBytes += (await stat(target)).size;
  }

  const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} Mo`;
  console.log(
    `${converted} converti(s), ${skipped} à jour — ` +
      `${mb(sourceBytes)} → ${mb(targetBytes)} ` +
      `(${Math.round((1 - targetBytes / sourceBytes) * 100)} % de gain)`,
  );

}

await main();
