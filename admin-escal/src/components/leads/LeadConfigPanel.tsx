"use client";

import type { Lead, LeadConfig } from "@/lib/types";
import { fmtEUR, avatarBg } from "@/lib/utils";
import { LEAD_STATUS } from "@/lib/data";

// ── Labels lisibles ────────────────────────────────────────────────────────
const DECOR_LABELS: Record<string, string> = {
  CHENE_NATUREL:       "Chêne Naturel",
  CHENE_VINTAGE:       "Chêne Vintage",
  CHENE_VINTAGE_GRIS:  "Chêne Vintage Gris",
  CHENE_CERUSE:        "Chêne Cérusé",
  NOYER:               "Noyer",
  NOYER_BLANC:         "Noyer Blanc",
  HETRE:               "Hêtre",
  PIN_RUSTIQUE:        "Pin Rustique",
  GRIS_MINERAL:        "Gris Minéral",
  PIERRE_ANTHRACITE:   "Pierre Anthracite",
  PIERRE_BETON_GRIS:   "Pierre Béton Gris",
};

const RISER_LABELS: Record<string, string> = {
  NONE:        "Sans contremarche",
  DECOR:       "Couleur du décor",
  BLACK_MATTE: "Noir mat",
  WHITE_MATTE: "Blanc mat",
};

const WIDTH_LABELS: Record<string, string> = {
  W_LT_800:    "< 800 mm",
  W_801_1000:  "801 – 1 000 mm",
  W_1001_1300: "1 001 – 1 300 mm",
  W_1301_1600: "1 301 – 1 600 mm",
  W_1601_1800: "1 601 – 1 800 mm",
};

const DEPTH_LABELS: Record<string, string> = {
  D_LT_320: "< 320 mm",
  D_GT_320: "> 320 mm",
};

const END_CAP_LABELS: Record<string, string> = {
  NONE:        "Sans embout",
  OPEN_STEP:   "Marche ouverte",
  OVERHANGING: "Marche débordante",
};

const LANDING_LABELS: Record<string, string> = {
  NONE:               "Sans palier",
  NEZ_SEUIL:          "Nez + seuil",
  NEZ_RACCORD_PARQUET: "Nez de raccord parquet",
};

const SIDE_LABELS: Record<string, string> = { LEFT: "Gauche", RIGHT: "Droite" };

// ── Sous-composants ─────────────────────────────────────────────────────────
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== false && value !== 0) return null;
  return (
    <div className="lcp-row">
      <span className="lcp-row__label">{label}</span>
      <span className="lcp-row__value">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="lcp-section">
      <div className="lcp-section__title">{title}</div>
      {children}
    </div>
  );
}

// ── Composant principal ─────────────────────────────────────────────────────
interface LeadConfigPanelProps {
  lead: Lead;
  onClose: () => void;
  onSetStatus: (id: string, status: Lead["status"]) => void;
  accent: string;
}

export default function LeadConfigPanel({ lead, onClose, onSetStatus, accent }: LeadConfigPanelProps) {
  const c = lead.config as LeadConfig | null;
  const s = LEAD_STATUS[lead.status] ?? { label: lead.status, dot: "#888" };

  return (
    <aside className="lcp">
      {/* ── En-tête ──────────────────────────────────────────────────────── */}
      <div className="lcp-header">
        <div className="lcp-header__identity">
          <div className="ec-avatar ec-avatar--md" style={{ background: avatarBg(lead.id) }}>
            {lead.initials}
          </div>
          <div>
            <div className="lcp-header__name">{lead.name}</div>
            <div className="lcp-header__meta">{lead.email}</div>
            <div className="lcp-header__meta">{lead.phone}{lead.config?.country ? ` · ${lead.config.country}` : ""}</div>
          </div>
        </div>
        <button className="lcp-close" onClick={onClose} aria-label="Fermer">✕</button>
      </div>

      {/* ── Prix + statut ─────────────────────────────────────────────────── */}
      <div className="lcp-price-row">
        <div>
          <div className="lcp-price-row__label">Estimation matériaux</div>
          <div className="lcp-price-row__value" style={{ color: accent }}>
            {lead.price > 0 ? fmtEUR(lead.price) : "—"}
          </div>
        </div>
        <div className="lcp-status-select">
          <span className="ec-dot" style={{ background: s.dot }} />
          <select
            value={lead.status}
            onChange={e => onSetStatus(lead.id, e.target.value as Lead["status"])}
            className="lcp-select"
          >
            {Object.entries(LEAD_STATUS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Configuration ─────────────────────────────────────────────────── */}
      {c ? (
        <div className="lcp-body">
          <Section title="Escalier">
            <Row label="Décor"           value={c.decor ? DECOR_LABELS[c.decor] ?? c.decor : null} />
            <Row label="Contremarches"   value={c.riserOption ? RISER_LABELS[c.riserOption] ?? c.riserOption : null} />
            <Row label="Nombre de marches" value={c.stepCount ?? null} />
            <Row label="Côtés ouverts"   value={c.openSides ? "Oui" : "Non"} />
          </Section>

          <Section title="Dimensions">
            <Row label="Dimensions"      value={c.uniformStepDimensions ? "Uniformes" : "Par marche"} />
            {c.uniformStepDimensions && (
              <>
                <Row label="Largeur"     value={c.widthBand ? WIDTH_LABELS[c.widthBand] ?? c.widthBand : null} />
                <Row label="Profondeur"  value={c.depthBand ? DEPTH_LABELS[c.depthBand] ?? c.depthBand : null} />
              </>
            )}
          </Section>

          <Section title="Embouts & Palier">
            <Row label="Embouts"         value={c.stepEndCap ? END_CAP_LABELS[c.stepEndCap] ?? c.stepEndCap : null} />
            {c.stepEndCap === "OPEN_STEP" && (
              <>
                <Row label="1ère marche" value={c.openStepEndSide ? SIDE_LABELS[c.openStepEndSide] : null} />
                <Row label="Embout latéral" value={c.lateralEndSide ? SIDE_LABELS[c.lateralEndSide] : null} />
              </>
            )}
            <Row label="Palier intermédiaire" value={c.intermediateLanding ? "Oui" : "Non"} />
            {c.intermediateLanding && (
              <Row label="Finition palier" value={c.landingFinish ? LANDING_LABELS[c.landingFinish] ?? c.landingFinish : null} />
            )}
          </Section>
        </div>
      ) : (
        <div className="lcp-empty">Aucune configuration disponible.</div>
      )}
    </aside>
  );
}
