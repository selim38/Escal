import type { KPIs } from "./types";

export const LEAD_STATUS = {
  new:     { label: "Nouveau",             dot: "#6366f1" },
  won:     { label: "Gagné",               dot: "#5B8E5A" },
  lost:    { label: "Perdu",               dot: "#B85850" },
  pending: { label: "En attente",          dot: "#E0A95B" },
} as const;

// Les leads et conversations proviennent désormais de l'API PHP (lib/api.ts).
// Seuls les libellés de statut et les KPIs d'en-tête restent ici.

export const KPIS: KPIs = {
  totalCA:        24710,
  activeLeads:    0,   // recalculé dynamiquement côté dashboard
  conversionRate: 18,
  avgTicket:      3460,
};
