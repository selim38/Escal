import type { Decor, RiserOption } from "@/lib/quote-schema";

/** Slug de fichier correspondant à chaque décor (utilisé pour les photos CM). */
export const DECOR_SLUG: Record<Decor, string> = {
  CHENE_NATUREL:      "chene-naturel",
  CHENE_VINTAGE:      "chene-vintage",
  CHENE_VINTAGE_GRIS: "chene-vintage-gris",
  CHENE_CERUSE:       "chene-ceruse",
  NOYER:              "noyer",
  NOYER_BLANC:        "noyer-blanc",
  HETRE:              "hetre",
  PIN_RUSTIQUE:       "pin-rustique",
  GRIS_MINERAL:       "gris-mineral",
  PIERRE_ANTHRACITE:  "pierre-anthracite",
  PIERRE_BETON_GRIS:  "pierre-beton-gris",
};

const CM_SUFFIX: Partial<Record<RiserOption, string>> = {
  DECOR:       "",
  BLACK_MATTE: "-cm-noire",
  WHITE_MATTE: "-cm-blanche",
};

/**
 * Retourne le chemin de la photo CM pour un décor + option de contremarche donnés.
 * Retourne null si l'option n'a pas de photo associée (ex. NONE).
 */
export function getCMImagePath(decor: Decor, riserOption: RiserOption): string | null {
  const slug = DECOR_SLUG[decor];
  const suffix = CM_SUFFIX[riserOption];
  if (suffix === undefined || !slug) return null;
  return `/CM/${slug}${suffix}.jpg`;
}

export type DecorCatalogEntry = {
  id: Decor;
  label: string;
  swatch: string;
  imageSrc?: string;
};

export const DECOR_CATALOG: DecorCatalogEntry[] = [
  {
    id: "CHENE_NATUREL",
    label: "Chêne Naturel",
    swatch: "linear-gradient(135deg, #ecd9c4 0%, #ddb995 42%, #c9a06f 100%)",
    imageSrc: "/decor/chene-naturel.jpg",
  },
  {
    id: "CHENE_VINTAGE",
    label: "Chêne Vintage",
    swatch: "linear-gradient(135deg, #c4a882 0%, #a0795a 50%, #7a5c40 100%)",
    imageSrc: "/decor/chene-vintage.jpg",
  },
  {
    id: "CHENE_VINTAGE_GRIS",
    label: "Chêne Vintage Gris",
    swatch: "linear-gradient(135deg, #b8b0a4 0%, #9a9088 50%, #7c706a 100%)",
    imageSrc: "/decor/chene-vintage-gris.jpg",
  },
  {
    id: "CHENE_CERUSE",
    label: "Chêne Cérusé",
    swatch: "linear-gradient(135deg, #e8e0d8 0%, #d0c4b8 50%, #b8a898 100%)",
    imageSrc: "/decor/chene-ceruse.jpg",
  },
  {
    id: "NOYER",
    label: "Noyer",
    swatch: "linear-gradient(135deg, #8b5e3c 0%, #6b4228 50%, #4a2c18 100%)",
    imageSrc: "/decor/noyer.jpg",
  },
  {
    id: "NOYER_BLANC",
    label: "Noyer Blanc",
    swatch: "linear-gradient(135deg, #d4c4b0 0%, #b8a890 50%, #9c8c74 100%)",
    imageSrc: "/decor/noyer-blanc.jpg",
  },
  {
    id: "HETRE",
    label: "Hêtre",
    swatch: "linear-gradient(135deg, #f0e4d0 0%, #dcc8a8 50%, #c4a880 100%)",
    imageSrc: "/decor/hetre.jpg",
  },
  {
    id: "PIN_RUSTIQUE",
    label: "Pin Rustique",
    swatch: "linear-gradient(135deg, #e8d4b0 0%, #d0b888 50%, #b89860 100%)",
    imageSrc: "/decor/pin-rustique.jpg",
  },
  {
    id: "GRIS_MINERAL",
    label: "Gris Minéral",
    swatch: "linear-gradient(135deg, #c8c8c8 0%, #a8a8a8 50%, #888888 100%)",
    imageSrc: "/decor/gris-mineral.jpg",
  },
  {
    id: "PIERRE_ANTHRACITE",
    label: "Pierre Anthracite",
    swatch: "linear-gradient(135deg, #606060 0%, #404040 50%, #202020 100%)",
    imageSrc: "/decor/pierre-anthracite.jpg",
  },
  {
    id: "PIERRE_BETON_GRIS",
    label: "Pierre Béton Gris",
    swatch: "linear-gradient(135deg, #b0b0a8 0%, #909088 50%, #707068 100%)",
    imageSrc: "/decor/pierre-beton-gris.jpg",
  },
];
