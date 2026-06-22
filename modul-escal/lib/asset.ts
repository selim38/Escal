/**
 * Préfixe les chemins d'assets publics par le basePath de l'app.
 * DOIT correspondre au `basePath` de next.config.ts ("/calcul").
 * Nécessaire car en export statique sous sous-dossier, next/image (unoptimized)
 * ne préfixe pas le basePath au src → 404 sur /decor/... au lieu de /calcul/decor/...
 */
export const BASE_PATH = "/calcul";

/** Renvoie l'URL publique correcte (ex. asset("/decor/x.jpg") → "/calcul/decor/x.jpg"). */
export function asset(path: string): string {
  return `${BASE_PATH}${path.startsWith("/") ? "" : "/"}${path}`;
}
