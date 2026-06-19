/**
 * Client API — pointe vers le backend PHP (escal.point-soft.fr/api).
 *
 * En production, l'admin est servi depuis /admin et l'API depuis /api sur le
 * même domaine → base "/api" (chemin absolu depuis la racine du domaine).
 * `basePath` de Next ne s'applique PAS à fetch(), donc "/api/..." vise bien
 * la racine du domaine, pas /admin/api.
 *
 * En dev local (next dev sur :3001), définir dans .env.local :
 *   NEXT_PUBLIC_API_BASE=http://127.0.0.1:8787
 * pour taper le serveur PHP local.
 */

import type { Lead, Message } from "./types";
import { authHeaders, clearToken } from "./auth";

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "/api";

async function asJson<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    // Session expirée/invalide → on déconnecte et on recharge
    clearToken();
    if (typeof window !== "undefined") window.location.reload();
    throw new Error("Session expirée");
  }
  if (!res.ok) {
    throw new Error(`API ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Liste des leads
  listLeads: (): Promise<Lead[]> =>
    fetch(`${BASE}/leads.php`, { headers: { ...authHeaders() } })
      .then(r => asJson<Lead[]>(r)),

  // Historique des messages d'un lead
  getConversation: (leadId: string): Promise<Message[]> =>
    fetch(`${BASE}/conversations.php?leadId=${encodeURIComponent(leadId)}`, {
      headers: { ...authHeaders() },
    }).then(r => asJson<Message[]>(r)),

  // Envoi d'un message (vendeur → client via WhatsApp)
  sendMessage: (leadId: string, author: "client" | "vendor", message: string) =>
    fetch(`${BASE}/conversations.php?leadId=${encodeURIComponent(leadId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ author, message }),
    }),

  // Mise à jour d'un lead (statut / notes / unread / snippet)
  // POST + override : certains hébergements mutualisés bloquent PATCH.
  patchLead: (
    leadId: string,
    body: Partial<{
      status: Lead["status"];
      last_snippet: string;
      unread_count: number;
      internal_notes: string;
    }>,
  ) =>
    fetch(`${BASE}/lead.php?id=${encodeURIComponent(leadId)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-HTTP-Method-Override": "PATCH",
        ...authHeaders(),
      },
      body: JSON.stringify(body),
    }),
};
