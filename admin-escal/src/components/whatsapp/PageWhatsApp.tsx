"use client";

import { useState, useEffect, useRef } from "react";
import type { Lead, Message, Conversations } from "@/lib/types";
import { LEAD_STATUS } from "@/lib/data";
import { fmtEUR, avatarBg } from "@/lib/utils";
import {
  Search, WhatsApp as WhatsAppIcon, Paperclip, Smile, Send,
  CheckDouble, External, More, Euro, Edit, Download,
} from "@/components/icons/Icons";

function StatusPill({ status }: { status: Lead["status"] }) {
  const s = LEAD_STATUS[status] ?? { label: status, dot: "#888" };
  return (
    <span className="ec-pill">
      <span className="ec-dot" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

interface PageWhatsAppProps {
  accent: string;
  leads: Lead[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
  convs: Conversations;
  onSetStatus: (id: string, status: Lead["status"]) => void;
  onSaveNotes: (id: string, notes: string) => void;
}

export default function PageWhatsApp({
  accent, leads, selectedId, setSelectedId,
  draft, setDraft, onSend, convs, onSetStatus, onSaveNotes,
}: PageWhatsAppProps) {
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronise le textarea quand on change de lead
  const lead = leads.find(l => l.id === selectedId);
  useEffect(() => {
    setNotes(lead?.internalNotes ?? "");
    setNotesSaved(false);
  }, [selectedId, lead?.internalNotes]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setNotesSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (lead) {
        onSaveNotes(lead.id, value);
        setNotesSaved(true);
      }
    }, 1000);
  };

  const filtered = leads.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return l.name.toLowerCase().includes(q) || l.snippet.toLowerCase().includes(q);
  });

  const conv: Message[] = lead ? (convs[lead.id] ?? []) : [];

  return (
    <div className="ec-wa-full">
      {/* Left: conversation list */}
      <aside className="ec-walist">
        <div className="ec-walist__head">
          <div className="ec-walist__title">
            Conversations{" "}
            <span className="ec-walist__count">{leads.length}</span>
          </div>
          <label className="ec-search ec-search--sm">
            <Search size={14} />
            <input
              placeholder="Rechercher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </label>
        </div>

        <ul className="ec-walist__items">
          {filtered.map(l => (
            <li
              key={l.id}
              className={"ec-walist__item " + (l.id === selectedId ? "is-on" : "")}
              onClick={() => setSelectedId(l.id)}
            >
              <div className="ec-avatar ec-avatar--md" style={{ background: avatarBg(l.id) }}>
                {l.initials}
              </div>
              <div className="ec-walist__body">
                <div className="ec-walist__row">
                  <span className="ec-walist__name">{l.name}</span>
                  <span className="ec-walist__time">{l.lastTime}</span>
                </div>
                <div className="ec-walist__row">
                  <span className="ec-walist__snippet">{l.snippet}</span>
                  {l.unread > 0 && (
                    <span className="ec-walist__unread" style={{ background: accent }}>
                      {l.unread}
                    </span>
                  )}
                </div>
                <div className="ec-walist__meta">
                  <StatusPill status={l.status} />
                  <span className="ec-meta-sep">·</span>
                  <span className="ec-mono">{fmtEUR(l.price)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Center: chat */}
      <section className="ec-wachat">
        {lead ? (
          <>
            <header className="ec-wachat__head">
              <div className="ec-avatar ec-avatar--md" style={{ background: avatarBg(lead.id) }}>
                {lead.initials}
              </div>
              <div className="ec-wachat__title">
                <div className="ec-wachat__name">{lead.name}</div>
                <div className="ec-wachat__meta">
                  <span className="ec-dot" style={{ background: "#5B8E5A" }} />
                  en ligne · {lead.phone}
                </div>
              </div>
              <div className="ec-wachat__actions">
                <button className="ec-iconbtn ec-iconbtn--ghost" title="Ouvrir"><External size={15} /></button>
                <button className="ec-iconbtn ec-iconbtn--ghost" title="Plus"><More size={15} /></button>
              </div>
            </header>

            <div className="ec-wa__thread" id="ec-wa-thread-full">
              <div className="ec-wa__day">— Aujourd&apos;hui —</div>
              {conv.map((m, i) => (
                <div
                  key={i}
                  className={"ec-bubble " + (m.author === "vendor" ? "ec-bubble--out" : "ec-bubble--in")}
                >
                  <div
                    className="ec-bubble__body"
                    style={m.author === "vendor" ? { background: accent, color: "#fff" } : undefined}
                  >
                    {m.text}
                    <div className="ec-bubble__meta">
                      {m.time}
                      {m.author === "vendor" && <CheckDouble size={12} style={{ marginLeft: 4 }} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="ec-wa__compose">
              <div className="ec-wa__composer">
                <button className="ec-iconbtn ec-iconbtn--ghost"><Paperclip size={16} /></button>
                <button className="ec-iconbtn ec-iconbtn--ghost"><Smile size={16} /></button>
                <input
                  className="ec-wa__input"
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                  placeholder={`Répondre à ${lead.name.split(" ")[0]}…`}
                />
                <button
                  className="ec-iconbtn ec-iconbtn--solid"
                  style={{ background: accent, color: "#fff" }}
                  onClick={onSend}
                >
                  <Send size={16} />
                </button>
              </div>
              <div className="ec-wa__footnote">
                Messages envoyés via WhatsApp Business.
              </div>
            </div>
          </>
        ) : (
          <div className="ec-wa__empty">
            <div className="ec-wa__empty-icon"><WhatsAppIcon size={22} /></div>
            <div className="ec-wa__empty-title">Aucune conversation sélectionnée</div>
          </div>
        )}
      </section>

      {/* Right: lead context */}
      <aside className="ec-wactx">
        {lead ? (
          <>
            <div className="ec-wactx__head">
              <div className="ec-avatar ec-avatar--lg" style={{ background: avatarBg(lead.id) }}>
                {lead.initials}
              </div>
              <div className="ec-wactx__name">{lead.name}</div>
              <div className="ec-wactx__sub">{lead.phone}</div>
              <StatusPill status={lead.status} />
            </div>

            <div className="ec-wactx__section">
              <div className="ec-card__eyebrow">Fiche client</div>
              <div className="ec-wactx__row"><span>Email</span><span className="ec-mono">{lead.email}</span></div>
              <div className="ec-wactx__row"><span>Téléphone</span><span className="ec-mono">{lead.phone}</span></div>
              <div className="ec-wactx__row"><span>Référence</span><span className="ec-mono">{lead.id}</span></div>
              <div className="ec-wactx__row">
                <span>Prix estimé</span>
                <span className="ec-mono" style={{ color: accent, fontWeight: 700 }}>{fmtEUR(lead.price)}</span>
              </div>
              <div className="ec-wactx__row"><span>Dernière activité</span><span>{lead.lastTime}</span></div>
            </div>

            <div className="ec-wactx__section">
              <div className="ec-card__eyebrow" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Notes internes</span>
                {notesSaved && <span style={{ fontSize: 10, color: "#5B8E5A", fontWeight: 600 }}>✓ Enregistré</span>}
              </div>
              <textarea
                className="ec-notes-textarea"
                placeholder="Ajouter une note interne sur ce client…"
                value={notes}
                onChange={e => handleNotesChange(e.target.value)}
                rows={5}
              />
              <div className="ec-wa__footnote" style={{ padding: 0, marginTop: 4 }}>
                Visible uniquement par l'équipe commerciale.
              </div>
            </div>

            <div className="ec-wactx__section">
              <div className="ec-card__eyebrow">Actions</div>
              <div className="ec-wactx__actions">
                <button className="ec-btn">
                  <Download size={13} /> Générer le devis PDF
                </button>
                <button className="ec-btn" onClick={() => onSetStatus(lead.id, "pending")}>
                  <Euro size={13} /> Générer le lien de paiement
                </button>
                <button className="ec-btn ec-btn--ghost">
                  <Edit size={13} /> Éditer la configuration
                </button>
              </div>

              <div className="ec-wactx__mark">
                <span className="ec-wactx__mark-label">Marquer comme</span>
                <div className="ec-segmented ec-segmented--mark">
                  <button
                    className={lead.status === "won" ? "is-on" : ""}
                    onClick={() => onSetStatus(lead.id, "won")}
                  >
                    Gagné
                  </button>
                  <button
                    className={lead.status === "lost" ? "is-on" : ""}
                    onClick={() => onSetStatus(lead.id, "lost")}
                  >
                    Perdu
                  </button>
                </div>
              </div>

              <div className="ec-wa__footnote" style={{ padding: 0, marginTop: 6 }}>
                Le devis PDF et le lien de paiement sont transmis par WhatsApp.
                Le statut passe en « Attente de paiement » dès que le lien est généré.
              </div>
            </div>
          </>
        ) : null}
      </aside>
    </div>
  );
}
