/**
 * Authentification admin — tokens stockés en localStorage, endpoints PHP auth.php.
 */

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "/api";
const TOKEN_KEY = "escal_admin_token";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
}

/** En-têtes d'autorisation pour les appels protégés.
 *  X-Auth-Token : en-tête custom non filtré par Apache/CGI (le plus fiable
 *  sur hébergement mutualisé). Authorization gardé en complément. */
export function authHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { "X-Auth-Token": t, Authorization: `Bearer ${t}` } : {};
}

async function parse(res: Response) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Erreur ${res.status}`);
  return json;
}

export async function signup(data: {
  name: string; email: string; phone: string; password: string;
}): Promise<AuthUser> {
  const json = await parse(await fetch(`${BASE}/auth.php?action=signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }));
  setToken(json.token);
  return json.user;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const json = await parse(await fetch(`${BASE}/auth.php?action=login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }));
  setToken(json.token);
  return json.user;
}

/** Valide le token courant et renvoie l'utilisateur, ou null si non connecté. */
export async function fetchMe(): Promise<AuthUser | null> {
  if (!getToken()) return null;
  try {
    const json = await parse(await fetch(`${BASE}/auth.php?action=me`, {
      headers: { ...authHeaders() },
    }));
    return json.user as AuthUser;
  } catch {
    clearToken();
    return null;
  }
}

export function logout() {
  clearToken();
  // Recharge → AuthScreen reprend la main
  if (typeof window !== "undefined") window.location.reload();
}
