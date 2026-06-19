"use client";

import { Search, Refresh, Bell } from "@/components/icons/Icons";
import { logout, type AuthUser } from "@/lib/auth";

type Page = "dashboard" | "leads" | "whatsapp" | "settings";

interface HeaderProps {
  active: Page;
  accent: string;
  onToggleSidebar: () => void;
  query: string;
  onQuery: (q: string) => void;
  user: AuthUser;
  unreadCount: number;
}

function initials(name: string, email: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

const TITLES: Record<Page, string> = {
  dashboard: "Vue d'ensemble",
  leads:     "Leads",
  whatsapp:  "WhatsApp",
  settings:  "Paramètres",
};

const SUBTITLES: Record<Page, string> = {
  dashboard: "Tableau de bord temps réel · configurateur",
  leads:     "Tous les prospects actifs du configurateur",
  whatsapp:  "Conversations clients",
  settings:  "Configuration de l'espace",
};

export default function Header({ active, accent, onToggleSidebar, query, onQuery, user, unreadCount }: HeaderProps) {
  return (
    <header className="ec-header">
      <div className="ec-header__left">
        <button
          className="ec-iconbtn ec-iconbtn--ghost ec-header__burger"
          onClick={onToggleSidebar}
          title="Réduire"
        >
          <span className="ec-burger"><span /><span /><span /></span>
        </button>
        <div className="ec-header__title">
          <div className="ec-eyebrow">Admin · Kit Rénovation Escalier</div>
          <h1>{TITLES[active]}</h1>
          <div className="ec-header__sub">{SUBTITLES[active]}</div>
        </div>
      </div>

      <div className="ec-header__right">
        <label className="ec-search">
          <Search size={16} />
          <input
            placeholder="Rechercher un client, un n° de devis…"
            value={query}
            onChange={e => onQuery(e.target.value)}
          />
          <span className="ec-search__kbd">⌘K</span>
        </label>

        <button className="ec-iconbtn" title="Actualiser">
          <Refresh size={17} />
        </button>

        <button className="ec-iconbtn ec-iconbtn--bell" title={`${unreadCount} notification(s)`}>
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="ec-iconbtn__dot" style={{ background: accent }} />
          )}
        </button>

        <div className="ec-user" title={user.email}>
          <div className="ec-user__avatar">{initials(user.name, user.email)}</div>
          <div className="ec-user__meta">
            <div className="ec-user__name">{user.name || user.email}</div>
            <div className="ec-user__role">{user.email}</div>
          </div>
        </div>

        <button
          className="ec-iconbtn ec-iconbtn--ghost"
          title="Se déconnecter"
          onClick={() => { if (confirm("Se déconnecter ?")) logout(); }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </button>
      </div>
    </header>
  );
}
