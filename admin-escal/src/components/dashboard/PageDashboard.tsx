"use client";

import { useState, useEffect } from "react";
import type { Lead } from "@/lib/types";
import { LEAD_STATUS } from "@/lib/data";
import { api } from "@/lib/api";
import { fmtEUR, avatarBg } from "@/lib/utils";
import {
  Euro, Check2, ArrowUp, ArrowDown, ChevronRight, WhatsApp,
} from "@/components/icons/Icons";

interface KpiTileProps {
  label: string;
  value: string | number;
  sub: string;
  icon: React.FC<{ size?: number }>;
  accent: string;
}

function KpiTile({ label, value, sub, icon: Icon, accent }: KpiTileProps) {
  return (
    <div className="ec-kpi">
      <div className="ec-kpi__head">
        <span className="ec-kpi__label">{label}</span>
        <span className="ec-kpi__icon"><Icon size={16} /></span>
      </div>
      <div className="ec-kpi__value" style={{ color: accent }}>{value}</div>
      <div className="ec-kpi__sub">{sub}</div>
    </div>
  );
}

function StatusPill({ status }: { status: Lead["status"] }) {
  const s = LEAD_STATUS[status] ?? { label: status, dot: "#888" };
  return (
    <span className="ec-pill">
      <span className="ec-dot" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

interface PageDashboardProps {
  accent: string;
  leads: Lead[];
  onSelectLead: (id: string) => void;
  onJumpTo: (page: string) => void;
}

export default function PageDashboard({ accent, leads, onSelectLead, onJumpTo }: PageDashboardProps) {
  const activeLeads = leads.filter(l => !["won", "lost"].includes(l.status)).length;

  const withPrice  = leads.filter(l => l.price > 0);
  const avgBasket  = withPrice.length
    ? Math.round(withPrice.reduce((s, l) => s + l.price, 0) / withPrice.length)
    : 0;
  const pendingLeads = leads.filter(l => l.status === "pending");
  const pendingSum   = pendingLeads.reduce((s, l) => s + l.price, 0);
  const wonLeads     = leads.filter(l => l.status === "won");
  const wonSum       = wonLeads.reduce((s, l) => s + l.price, 0);

  const top = [...leads]
    .filter(l => !["won", "lost"].includes(l.status) && l.price > 0)
    .sort((a, b) => b.price - a.price)
    .slice(0, 4);

  // Stats réelles (messages/heure, CA estimé, évolution hebdo)
  const [stats, setStats] = useState<{ hourly: number[]; totalCA: number; caDeltaPct: number | null }>({
    hourly: Array(24).fill(0), totalCA: 0, caDeltaPct: null,
  });
  useEffect(() => {
    const load = () => api.getStats()
      .then(s => setStats({ hourly: s.hourly, totalCA: s.totalCA, caDeltaPct: s.caDeltaPct }))
      .catch(() => {});
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);
  const hourly = stats.hourly;
  const maxH = Math.max(1, ...hourly);

  return (
    <div className="ec-dash">
      {/* Hero */}
      <section className="ec-hero">
        <div className="ec-hero__left">
          <div className="ec-eyebrow">Bonjour Admin · 1 juin 2026</div>
          <h2 className="ec-hero__title">
            <strong style={{ color: accent }}>
              {activeLeads} leads actifs
            </strong>{" "}
            à traiter aujourd&apos;hui.
          </h2>
          <div className="ec-hero__cta-row">
            <button className="ec-btn" onClick={() => onJumpTo("leads")}>
              Voir les leads <ChevronRight size={12} />
            </button>
            <button className="ec-btn ec-btn--ghost" onClick={() => onJumpTo("whatsapp")}>
              <WhatsApp size={13} /> Ouvrir WhatsApp
            </button>
          </div>
        </div>
        <div className="ec-hero__right">
          <div className="ec-hero__bigkpi">
            <div className="ec-card__eyebrow">Total CA estimé</div>
            <div className="ec-hero__bignum" style={{ color: accent }}>{fmtEUR(stats.totalCA)}</div>
            <div className="ec-hero__sub">
              {stats.caDeltaPct !== null ? (
                <span className={"ec-kpi__trend " + (stats.caDeltaPct >= 0 ? "is-up" : "is-down")}>
                  {stats.caDeltaPct >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                  {" "}{Math.abs(stats.caDeltaPct)} %
                </span>
              ) : null}
              vs. semaine dernière
            </div>
          </div>
        </div>
      </section>

      {/* KPI tiles */}
      <div className="ec-kpis">
        <KpiTile
          accent={accent}
          label="Panier moyen"
          value={fmtEUR(avgBasket)}
          sub="par devis envoyé"
          icon={Euro}
        />
        <KpiTile
          accent={accent}
          label="En attente de paiement"
          value={fmtEUR(pendingSum)}
          sub={`${pendingLeads.length} client${pendingLeads.length > 1 ? "s" : ""}`}
          icon={Euro}
        />
        <KpiTile
          accent={accent}
          label="Affaires gagnées"
          value={wonLeads.length}
          sub={`${fmtEUR(wonSum)} encaissés`}
          icon={Check2}
        />
      </div>

      {/* Grid */}
      <div className="ec-dash__grid">
        {/* Activity 24h */}
        <section className="ec-card">
          <header className="ec-card__head">
            <div>
              <div className="ec-card__eyebrow">WhatsApp · 24 h</div>
              <h3 className="ec-card__title-lg">Messages échangés</h3>
            </div>
            <div className="ec-stat">
              <span className="ec-stat__num">{hourly.reduce((s, x) => s + x, 0)}</span>
              <span className="ec-stat__lbl">messages</span>
            </div>
          </header>
          <div className="ec-bars24">
            {hourly.map((v, i) => (
              <div key={i} className="ec-bars24__col" title={`${i}h — ${v} msg`}>
                <div
                  className="ec-bars24__bar"
                  style={{ height: (v / maxH) * 100 + "%", background: accent }}
                />
              </div>
            ))}
          </div>
          <div className="ec-bars24__axis">
            <span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>24h</span>
          </div>
        </section>

        {/* Top opportunities */}
        <section className="ec-card">
          <header className="ec-card__head">
            <div>
              <div className="ec-card__eyebrow">À traiter en priorité</div>
              <h3 className="ec-card__title-lg">Top opportunités</h3>
            </div>
            <button className="ec-btn ec-btn--ghost" onClick={() => onJumpTo("leads")}>
              Tout voir <ChevronRight size={11} />
            </button>
          </header>
          <ul className="ec-top__list">
            {top.map(l => (
              <li key={l.id} className="ec-top__item" onClick={() => onSelectLead(l.id)}>
                <div className="ec-avatar" style={{ background: avatarBg(l.id) }}>{l.initials}</div>
                <div className="ec-top__body">
                  <div className="ec-top__name">
                    {l.name}
                    <StatusPill status={l.status} />
                  </div>
                  <div className="ec-top__meta">{l.lastTime}</div>
                </div>
                <div className="ec-top__price ec-mono">{fmtEUR(l.price)}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
