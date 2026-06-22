"use client";

import { useState, useEffect } from "react";
import { WhatsApp, Euro, Settings, ChevronRight, Edit } from "@/components/icons/Icons";
import { inviteUser, listUsers, type UserAccount } from "@/lib/auth";

function UsersList() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { listUsers().then(setUsers).catch(() => setError("Impossible de charger les comptes.")); }, []);

  const fmtDate = (s: string | null) =>
    s ? new Date(s.replace(" ", "T") + "Z").toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  if (error) return <div style={{ color: "#B85850", fontSize: 13 }}>{error}</div>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="ec-set__pricing" style={{ minWidth: 460 }}>
        <thead><tr><th>Nom</th><th>E-mail</th><th>Téléphone</th><th>Dernière connexion</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name || "—"}</td>
              <td className="ec-mono">{u.email}</td>
              <td className="ec-mono">{u.phone || "—"}</td>
              <td>{fmtDate(u.lastLoginAt)}</td>
            </tr>
          ))}
          {users.length === 0 && !error && (
            <tr><td colSpan={4} style={{ color: "#9a938c" }}>Chargement…</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function InviteUsers({ accent }: { accent: string }) {
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLink(""); setCopied(false); setLoading(true);
    try {
      const code = await inviteUser(email.trim());
      setLink(`${window.location.origin}/admin/?invite=${code}`);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="ec-set__hint">
        Génère un lien d'invitation à envoyer à la personne. Elle pourra créer son compte
        avec cette adresse e-mail uniquement (lien valable 7 jours).
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="ec-input"
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="collegue@exemple.fr"
          style={{ flex: 1, padding: "10px 12px", borderRadius: 9, border: "1px solid #e2ddd6", fontSize: 14 }}
        />
        <button className="ec-btn" type="submit" disabled={loading}
          style={{ background: accent, color: "#fff", border: "none" }}>
          {loading ? "…" : "Inviter"}
        </button>
      </div>
      {error && <div style={{ color: "#B85850", fontSize: 13 }}>{error}</div>}
      {link && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#f6f4f1", border: "1px solid #e7e2dc", borderRadius: 9, padding: "9px 12px" }}>
          <span style={{ flex: 1, fontSize: 12.5, wordBreak: "break-all", color: "#6b6560" }}>{link}</span>
          <button type="button" className="ec-btn ec-btn--ghost"
            onClick={() => { navigator.clipboard?.writeText(link); setCopied(true); }}>
            {copied ? "Copié ✓" : "Copier"}
          </button>
        </div>
      )}
    </form>
  );
}

function Switch({ on, onChange, accent }: { on: boolean; onChange: (v: boolean) => void; accent: string }) {
  return (
    <button
      className={"ec-switch " + (on ? "is-on" : "")}
      style={on ? { background: accent } : undefined}
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
    >
      <span className="ec-switch__knob" />
    </button>
  );
}

function SettingsCard({
  title, eyebrow, children, danger,
}: {
  title: string; eyebrow: string; children: React.ReactNode; danger?: boolean;
}) {
  return (
    <section className={"ec-card ec-set__card " + (danger ? "is-danger" : "")}>
      <header className="ec-set__card-head">
        <div className="ec-card__eyebrow">{eyebrow}</div>
        <h3 className="ec-card__title-lg">{title}</h3>
      </header>
      <div className="ec-set__card-body">{children}</div>
    </section>
  );
}

function SettingRow({
  label, hint, children,
}: {
  label: string; hint?: string; children?: React.ReactNode;
}) {
  return (
    <div className="ec-set__row">
      <div className="ec-set__row-label">
        <div className="ec-set__row-name">{label}</div>
        {hint && <div className="ec-set__row-hint">{hint}</div>}
      </div>
      <div className="ec-set__row-control">{children}</div>
    </div>
  );
}

const TABS = [
  { key: "bot",     label: "Bot WhatsApp",       Icon: WhatsApp },
  { key: "pricing", label: "Algorithme de prix", Icon: Euro     },
  { key: "account", label: "Compte",             Icon: Settings },
] as const;

type Tab = typeof TABS[number]["key"];

export default function PageSettings({ accent }: { accent: string }) {
  const [tab, setTab]           = useState<Tab>("bot");
  const [botEnabled, setBotEnabled] = useState(true);

  return (
    <div className="ec-set">
      <aside className="ec-set__nav">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={"ec-set__tab " + (tab === key ? "is-on" : "")}
            onClick={() => setTab(key)}
          >
            <span className="ec-set__tab-icon"><Icon size={15} /></span>
            <span>{label}</span>
            {tab === key && <ChevronRight size={11} />}
          </button>
        ))}
      </aside>

      <div className="ec-set__body">
        {tab === "bot" && (
          <SettingsCard title="État du bot" eyebrow="WhatsApp Business API">
            <SettingRow
              label="Bot actif"
              hint="Lorsque désactivé, les messages entrants ne déclenchent plus de réponse automatique."
            >
              <Switch on={botEnabled} onChange={setBotEnabled} accent={accent} />
            </SettingRow>
            <SettingRow label="Numéro connecté" hint="Numéro WhatsApp Business utilisé pour le configurateur.">
              <span className="ec-mono">+33 4 78 00 00 00</span>
            </SettingRow>
            <SettingRow label="Statut" hint="Connecté à Meta Cloud API.">
              <span className="ec-pill" style={{ color: "#5B8E5A" }}>
                <span className="ec-dot" style={{ background: "#5B8E5A" }} /> Vérifié
              </span>
            </SettingRow>
          </SettingsCard>
        )}

        {tab === "pricing" && (
          <>
            <SettingsCard title="Algorithme de prix" eyebrow="Calcul automatique du devis estimé">
              <div className="ec-set__hint" style={{ marginBottom: 12 }}>
                Le prix affiché aux leads est calculé en temps réel à partir des choix du configurateur.
                Le devis PDF et un lien de paiement sont ensuite transmis par WhatsApp.
              </div>
              <table className="ec-set__pricing">
                <thead>
                  <tr><th>Variable</th><th>Coefficient</th><th>Unité</th></tr>
                </thead>
                <tbody>
                  <tr><td>Prix de base</td><td className="ec-mono">1 200</td><td>€</td></tr>
                  <tr><td>Coût par marche</td><td className="ec-mono">85</td><td>€ / marche</td></tr>
                  <tr><td>Multiplicateur chêne massif</td><td className="ec-mono">×1,35</td><td>—</td></tr>
                  <tr><td>Multiplicateur hêtre</td><td className="ec-mono">×1,18</td><td>—</td></tr>
                  <tr><td>Option LED contre-marches</td><td className="ec-mono">+340</td><td>€</td></tr>
                  <tr><td>Pose incluse (rayon &lt; 30 km)</td><td className="ec-mono">+0</td><td>€</td></tr>
                </tbody>
              </table>
              <div className="ec-set__pricing-actions">
                <button className="ec-btn ec-btn--ghost"><Edit size={13} /> Modifier les coefficients</button>
              </div>
            </SettingsCard>

            <SettingsCard title="Garde-fous" eyebrow="Sécurité du devis">
              <SettingRow label="Prix minimum affichable" hint="Empêche d'afficher un devis irréaliste si l'utilisateur tronque la config.">
                <span className="ec-mono">1 500 €</span>
              </SettingRow>
              <SettingRow label="Prix maximum sans validation" hint="Au-delà, un message demande une visite métreur.">
                <span className="ec-mono">8 000 €</span>
              </SettingRow>
            </SettingsCard>
          </>
        )}

        {tab === "account" && (
          <>
            <SettingsCard title="Organisation" eyebrow="Espace Kit Rénovation Escalier">
              <SettingRow label="Raison sociale"><span>Kit Rénovation Escalier</span></SettingRow>
              <SettingRow label="Renouvellement"><span className="ec-mono">15 juin 2026</span></SettingRow>
            </SettingsCard>

            <SettingsCard title="Comptes existants" eyebrow="Accès au dashboard">
              <UsersList />
            </SettingsCard>

            <SettingsCard title="Inviter un utilisateur" eyebrow="Accès sur invitation">
              <InviteUsers accent={accent} />
            </SettingsCard>
          </>
        )}
      </div>
    </div>
  );
}
