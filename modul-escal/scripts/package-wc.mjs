/**
 * Prépare le dossier à publier pour une version du Web Component.
 *
 * Produit `dist/release/<version>/` contenant tout ce que le bundle référence :
 *   kre-configurateur.js        le composant (chargé par la balise <script>)
 *   kre-configurateur.js.map    source map, pour que Knewledge puisse débugger
 *   fonts/, CM/, decor/, …      assets résolus via import.meta.url
 *   .htaccess                   compression, cache, CORS (deliverables/hosting)
 *
 * La base publique du bundle est injectée par `KRE_PUBLIC_BASE` : elle doit
 * correspondre à l'URL finale du dossier, sinon les chunks éventuels seraient
 * résolus contre le domaine WordPress.
 *
 * Usage :
 *   node scripts/package-wc.mjs 1.0.0
 *   node scripts/package-wc.mjs staging --base https://escal.point-soft.fr/wc/staging
 */

import { execFile } from "node:child_process";
import { cp, mkdir, readFile, rm, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

const ROOT = new URL("..", import.meta.url).pathname;
const DEFAULT_ORIGIN = "https://escal.point-soft.fr/wc";

const [version, ...rest] = process.argv.slice(2);
if (!version) {
  console.error(
    "Version manquante.\n" +
      "  node scripts/package-wc.mjs 1.0.0\n" +
      "  node scripts/package-wc.mjs staging --base https://.../wc/staging",
  );
  process.exit(1);
}

const baseIndex = rest.indexOf("--base");
const publicBase =
  baseIndex !== -1 ? rest[baseIndex + 1] : `${DEFAULT_ORIGIN}/${version}`;

const outDir = join(ROOT, "dist/release", version);

async function main() {
  console.log(`Base publique : ${publicBase}`);

  await run("npm", ["run", "assets:webp"], { cwd: ROOT });
  await run("npx", ["vite", "build"], {
    cwd: ROOT,
    env: { ...process.env, KRE_PUBLIC_BASE: publicBase },
  });

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  await cp(join(ROOT, "dist/wc"), outDir, { recursive: true });
  // Le composant résout ses assets relativement à l'URL du script : les images
  // et la police doivent donc vivre à côté du bundle.
  await cp(join(ROOT, "public"), outDir, { recursive: true });
  await cp(
    join(ROOT, "deliverables/hosting/.htaccess"),
    join(outDir, ".htaccess"),
  );

  const bundlePath = join(outDir, "kre-configurateur.js");
  const bundle = await readFile(bundlePath);
  const gzip = gzipSync(bundle, { level: 9 }).length;
  const raw = (await stat(bundlePath)).size;

  // `eval` dans le bundle ferait échouer le composant sous une CSP WordPress
  // stricte (script-src sans 'unsafe-eval').
  const hasEval = /\beval\s*\(/.test(bundle.toString("utf8"));

  const kb = (n) => `${(n / 1024).toFixed(1)} Ko`;
  console.log(`Bundle : ${kb(raw)} brut, ${kb(gzip)} gzip`);
  console.log(hasEval ? "⚠  `eval(` détecté dans le bundle" : "Pas d'eval ✓");
  console.log(`Prêt à publier : dist/release/${version}/`);
  console.log(`Balise :`);
  console.log(
    `  <script src="${publicBase}/kre-configurateur.js" type="module" defer></script>`,
  );
}

await main();
