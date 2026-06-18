"use client";

import { Dashboard, Leads, WhatsApp, Settings, Staircase } from "@/components/icons/Icons";

type Page = "dashboard" | "leads" | "whatsapp" | "settings";

interface SidebarProps {
  active: Page;
  onChange: (key: Page) => void;
  collapsed: boolean;
  accent: string;
}

const NAV_ITEMS = [
  { key: "dashboard" as Page, label: "Vue d'ensemble", Icon: Dashboard, badge: null },
  { key: "leads"     as Page, label: "Leads",          Icon: Leads,     badge: 9   },
  { key: "whatsapp"  as Page, label: "WhatsApp",       Icon: WhatsApp,  badge: 6   },
  { key: "settings"  as Page, label: "Paramètres",     Icon: Settings,  badge: null },
];

export default function Sidebar({ active, onChange, collapsed, accent }: SidebarProps) {
  return (
    <aside className={"ec-sidebar " + (collapsed ? "is-collapsed" : "")}>
      <div className="ec-sidebar__brand">
        <div className="ec-brand">
          <span className="ec-brand__mark">
            <Staircase size={22} color={accent} />
          </span>
          {!collapsed && (
            <span className="ec-brand__text">
              <span className="ec-brand__name">Kit Rénovation</span>
              <span className="ec-brand__sub">Escalier</span>
            </span>
          )}
        </div>
      </div>

      <nav className="ec-nav">
        {NAV_ITEMS.map(({ key, label, Icon, badge }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              className={"ec-nav__item " + (isActive ? "is-active" : "")}
              onClick={() => onChange(key)}
              title={collapsed ? label : undefined}
            >
              <span className="ec-nav__icon"><Icon size={18} /></span>
              {!collapsed && <span className="ec-nav__label">{label}</span>}
              {!collapsed && badge != null && (
                <span className="ec-nav__badge">{badge}</span>
              )}
              {isActive && <span className="ec-nav__rail" />}
            </button>
          );
        })}
      </nav>

      <div className="ec-sidebar__foot">
        {!collapsed && (
          <div className="ec-sidebar__status">
            <span className="ec-dot" style={{ background: "#5B8E5A" }} />
            <span>Bot WhatsApp connecté</span>
          </div>
        )}
      </div>
    </aside>
  );
}
