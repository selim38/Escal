"use client";

import { Search, Refresh, Bell, ChevronDown } from "@/components/icons/Icons";

type Page = "dashboard" | "leads" | "whatsapp" | "settings";

interface HeaderProps {
  active: Page;
  accent: string;
  onToggleSidebar: () => void;
  query: string;
  onQuery: (q: string) => void;
}

const TITLES: Record<Page, string> = {
  dashboard: "Vue d'ensemble",
  leads:     "Leads",
  whatsapp:  "WhatsApp",
  settings:  "Paramètres",
};

const SUBTITLES: Record<Page, string> = {
  dashboard: "Tableau de bord temps réel · configurateur Escal",
  leads:     "Tous les prospects actifs du configurateur",
  whatsapp:  "Conversations clients",
  settings:  "Configuration de l'espace",
};

export default function Header({ active, accent, onToggleSidebar, query, onQuery }: HeaderProps) {
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

        <button className="ec-iconbtn ec-iconbtn--bell" title="Notifications">
          <Bell size={17} />
          <span className="ec-iconbtn__dot" style={{ background: accent }} />
        </button>

        <div className="ec-user">
          <div className="ec-user__avatar">AD</div>
          <div className="ec-user__meta">
            <div className="ec-user__name">Admin</div>
            <div className="ec-user__role">Compte propriétaire</div>
          </div>
          <ChevronDown size={14} />
        </div>
      </div>
    </header>
  );
}
