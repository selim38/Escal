"use client";

import type { Lead } from "@/lib/types";
import { LEAD_STATUS } from "@/lib/data";
import { fmtEUR, avatarBg } from "@/lib/utils";
import { Message, Edit, More, Download, Plus } from "@/components/icons/Icons";

function StatusPill({ status }: { status: Lead["status"] }) {
  const s = LEAD_STATUS[status] ?? { label: status, dot: "#888" };
  return (
    <span className="ec-pill">
      <span className="ec-dot" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

interface LeadsTableProps {
  leads: Lead[];
  selectedId: string;
  onSelect: (id: string) => void;
  onOpenChat: (id: string) => void;
  density: "compact" | "regular" | "comfy";
  query: string;
  statusFilter: "all" | Lead["status"];
  accent: string;
}

export default function LeadsTable({
  leads,
  selectedId,
  onSelect,
  onOpenChat,
  density,
  query,
  statusFilter,
  accent,
}: LeadsTableProps) {
  const filtered = leads
    .filter(l => statusFilter === "all" || l.status === statusFilter)
    .filter(l => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        l.snippet.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      // Les leads "new" remontent toujours en tête
      if (a.status === "new" && b.status !== "new") return -1;
      if (b.status === "new" && a.status !== "new") return 1;
      return b.lastTs - a.lastTs;
    });

  return (
    <div className={`ec-table ec-table--${density}`}>
      <div className="ec-table__head">
        <div className="ec-th ec-th--client">Client</div>
        <div className="ec-th ec-th--status">État</div>
        <div className="ec-th ec-th--price">Prix estimé</div>
        <div className="ec-th ec-th--activity">Dernière activité</div>
        <div className="ec-th ec-th--actions">Actions</div>
      </div>

      <div className="ec-table__body">
        {filtered.length === 0 && (
          <div className="ec-empty">Aucun lead ne correspond à la recherche.</div>
        )}
        {filtered.map(l => (
          <div
            key={l.id}
            className={"ec-row " + (l.id === selectedId ? "is-selected" : "") + (l.status === "new" ? " ec-row--new" : "")}
            onClick={() => onSelect(l.id)}
          >
            <div className="ec-td ec-td--client">
              <div className="ec-avatar" style={{ background: avatarBg(l.id) }}>
                {l.initials}
              </div>
              <div className="ec-client">
                <div className="ec-client__name">
                  {l.name}
                  {l.status === "new" && (
                    <span className="ec-badge-new">Nouveau</span>
                  )}
                  {l.unread > 0 && (
                    <span className="ec-unread" style={{ background: accent }}>
                      {l.unread}
                    </span>
                  )}
                </div>
                <div className="ec-client__meta">
                  <span>{l.email}</span>
                  <span className="ec-meta-sep">·</span>
                  <span className="ec-mono">{l.phone}</span>
                </div>
              </div>
            </div>

            <div className="ec-td ec-td--status">
              <StatusPill status={l.status} />
            </div>

            <div className="ec-td ec-td--price">
              <div className="ec-price">
                <span className="ec-price__num">{fmtEUR(l.price)}</span>
                {l.price > 0 && <span className="ec-price__tag">algo</span>}
              </div>
            </div>

            <div className="ec-td ec-td--activity">
              <div className="ec-activity">
                <div className="ec-activity__snippet">{l.snippet}</div>
                <div className="ec-activity__time">{l.lastTime}</div>
              </div>
            </div>

            <div className="ec-td ec-td--actions">
              <button
                className="ec-iconbtn ec-iconbtn--ghost"
                title="Ouvrir la conversation"
                onClick={e => { e.stopPropagation(); onOpenChat(l.id); }}
              >
                <Message size={16} />
              </button>
              <button
                className="ec-iconbtn ec-iconbtn--ghost"
                title="Éditer"
                onClick={e => e.stopPropagation()}
              >
                <Edit size={16} />
              </button>
              <button
                className="ec-iconbtn ec-iconbtn--ghost"
                title="Plus"
                onClick={e => e.stopPropagation()}
              >
                <More size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="ec-table__foot">
        <div>
          {filtered.length} lead{filtered.length > 1 ? "s" : ""} affiché
          {filtered.length > 1 ? "s" : ""} · {leads.length} au total
        </div>
        <div className="ec-table__foot-actions">
          <button className="ec-btn ec-btn--ghost">
            <Download size={14} /> Exporter CSV
          </button>
          <button className="ec-btn">
            <Plus size={14} /> Nouveau lead
          </button>
        </div>
      </div>
    </div>
  );
}
