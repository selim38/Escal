"use client";

import { useState, useCallback, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import LeadsTable from "@/components/leads/LeadsTable";
import LeadConfigPanel from "@/components/leads/LeadConfigPanel";
import PageDashboard from "@/components/dashboard/PageDashboard";
import PageWhatsApp from "@/components/whatsapp/PageWhatsApp";
import PageSettings from "@/components/settings/PageSettings";
import type { Lead, Conversations } from "@/lib/types";
import { api } from "@/lib/api";
import { Filter } from "@/components/icons/Icons";

type Page = "dashboard" | "leads" | "whatsapp" | "settings";
type Density = "compact" | "regular" | "comfy";

const ACCENT = "#E8743C";

export default function AppShell() {
  const [active, setActive]         = useState<Page>("leads");
  const [collapsed, setCollapsed]   = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [query, setQuery]           = useState("");
  const density: Density            = "regular";
  const [leads, setLeads]           = useState<Lead[]>([]);
  const [convs, setConvs]           = useState<Conversations>({});
  const [draft, setDraft]           = useState("");
  const [loading, setLoading]       = useState(true);

  // ── Chargement initial des leads ──────────────────────────────────────────
  useEffect(() => {
    api.listLeads()
      .then((data: Lead[]) => {
        setLeads(data);
        if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Chargement conversations au changement de lead sélectionné ───────────
  useEffect(() => {
    if (!selectedId) return;
    if (convs[selectedId]) return; // déjà chargées

    api.getConversation(selectedId)
      .then(msgs => setConvs(prev => ({ ...prev, [selectedId]: msgs })))
      .catch(console.error);
  }, [selectedId, convs]);

  const selected = leads.find(l => l.id === selectedId);

  // ── Actions ──────────────────────────────────────────────────────────────
  const onSelect = useCallback((id: string) => {
    setSelectedId(id);
    // Marquer comme lu localement + en DB
    setLeads(ls => ls.map(l => l.id === id ? { ...l, unread: 0 } : l));
    api.patchLead(id, { unread_count: 0 }).catch(console.error);
  }, []);

  const onOpenChat = useCallback((id: string) => {
    onSelect(id);
    setActive("whatsapp");
  }, [onSelect]);

  const onSetStatus = useCallback((id: string, status: Lead["status"]) => {
    setLeads(ls => ls.map(l => l.id === id ? { ...l, status } : l));
    api.patchLead(id, { status }).catch(console.error);
  }, []);

  const onSaveNotes = useCallback((id: string, notes: string) => {
    setLeads(ls => ls.map(l => l.id === id ? { ...l, internalNotes: notes } : l));
    api.patchLead(id, { internal_notes: notes }).catch(console.error);
  }, []);

  const onSend = useCallback(() => {
    if (!draft.trim() || !selected) return;
    const text = draft.trim();
    const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

    // Optimistic update
    setConvs(prev => ({
      ...prev,
      [selected.id]: [...(prev[selected.id] ?? []), { author: "vendor", text, time }],
    }));
    setLeads(ls => ls.map(l => l.id === selected.id
      ? { ...l, snippet: text, lastTime: "à l'instant", unread: 0 }
      : l
    ));
    setDraft("");

    // Persist to DB + envoi WhatsApp (Twilio) côté PHP
    api.sendMessage(selected.id, "vendor", text).catch(console.error);
  }, [draft, selected]);

  // Scroll chat to bottom
  useEffect(() => {
    const el = document.getElementById("ec-wa-thread-full");
    if (el) el.scrollTop = el.scrollHeight;
  }, [selectedId, active, convs]);

  const accentStyle = { "--accent": ACCENT, "--accent-2": "#C95E27" } as React.CSSProperties;

  return (
    <div className={"ec-app " + (collapsed ? "is-collapsed" : "")} style={accentStyle}>
      <Sidebar
        active={active}
        onChange={setActive}
        collapsed={collapsed}
        accent={ACCENT}
      />

      <main className="ec-app__main">
        <Header
          active={active}
          accent={ACCENT}
          onToggleSidebar={() => setCollapsed(c => !c)}
          query={query}
          onQuery={setQuery}
        />

        {active === "dashboard" && (
          <div className="ec-page">
            <PageDashboard
              accent={ACCENT}
              leads={leads}
              onSelectLead={id => { setSelectedId(id); setActive("leads"); }}
              onJumpTo={k => setActive(k as Page)}
            />
          </div>
        )}

        {active === "leads" && (
          <div className="ec-page ec-page--with-panel">
            <div className="ec-page__main">
              <div className="ec-toolbar">
                <div className="ec-toolbar__left">
                  <span className="ec-section-title">Master leads</span>
                  <span className="ec-chip">Tous · {leads.length}</span>
                </div>
                <div className="ec-toolbar__right">
                  <button className="ec-btn ec-btn--ghost">
                    <Filter size={14} /> Filtrer
                  </button>
                </div>
              </div>
              {loading ? (
                <div className="ec-empty">Chargement…</div>
              ) : (
                <LeadsTable
                  leads={leads}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onOpenChat={onOpenChat}
                  density={density}
                  query={query}
                  accent={ACCENT}
                />
              )}
            </div>

            {selected && (
              <LeadConfigPanel
                lead={selected}
                onClose={() => setSelectedId("")}
                onSetStatus={onSetStatus}
                accent={ACCENT}
              />
            )}
          </div>
        )}

        {active === "whatsapp" && (
          <div className="ec-page" style={{ padding: "16px 22px" }}>
            <PageWhatsApp
              accent={ACCENT}
              leads={leads}
              selectedId={selectedId}
              setSelectedId={onSelect}
              draft={draft}
              setDraft={setDraft}
              onSend={onSend}
              convs={convs}
              onSetStatus={onSetStatus}
              onSaveNotes={onSaveNotes}
            />
          </div>
        )}

        {active === "settings" && (
          <div className="ec-page">
            <PageSettings accent={ACCENT} />
          </div>
        )}
      </main>
    </div>
  );
}
