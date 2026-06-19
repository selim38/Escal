"use client";

import { useState, useEffect } from "react";
import { login, signup, requestReset, resetPassword, type AuthUser } from "@/lib/auth";
import { Staircase } from "@/components/icons/Icons";

const ACCENT = "#E8743C";
const ACCENT_2 = "#C95E27";

interface AuthScreenProps {
  onAuthenticated: (user: AuthUser) => void;
}

type Mode = "login" | "signup" | "forgot";

function passwordHint(pwd: string): { ok: boolean; label: string } {
  const checks = [pwd.length >= 8, /[a-z]/.test(pwd), /[A-Z]/.test(pwd), /\d/.test(pwd)];
  const passed = checks.filter(Boolean).length;
  if (pwd === "") return { ok: false, label: "8+ caractères, 1 minuscule, 1 majuscule, 1 chiffre" };
  if (passed < 4) return { ok: false, label: "Mot de passe trop faible" };
  return { ok: true, label: "Mot de passe robuste ✓" };
}

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");           // code d'invitation
  const [resetCode, setResetCode] = useState(""); // code de reset WhatsApp
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  // Lien d'invitation : ?invite=CODE → bascule en mode inscription
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inv = params.get("invite");
    if (inv) { setCode(inv); setMode("signup"); }
  }, []);

  const pwHint = passwordHint(password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setInfo("");
    setLoading(true);
    try {
      if (mode === "login") {
        onAuthenticated(await login(email, password));
      } else if (mode === "signup") {
        if (!pwHint.ok) throw new Error("Mot de passe trop faible.");
        if (password !== confirm) throw new Error("Les mots de passe ne correspondent pas.");
        onAuthenticated(await signup({ name, email, phone, password, code }));
      } else if (mode === "forgot") {
        if (forgotStep === 1) {
          await requestReset(email);
          setInfo("Si un compte existe, un code a été envoyé par WhatsApp.");
          setForgotStep(2);
        } else {
          if (!pwHint.ok) throw new Error("Mot de passe trop faible.");
          await resetPassword(email, resetCode, password);
          setInfo("Mot de passe réinitialisé. Vous pouvez vous connecter.");
          setMode("login"); setForgotStep(1); setPassword(""); setResetCode("");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 13px", borderRadius: 10,
    border: "1px solid #e2ddd6", fontSize: 14, outline: "none", background: "#fff", color: "#1c1917",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 12.5, fontWeight: 600, color: "#6b6560", marginBottom: 6,
  };

  const subtitle = mode === "login" ? "Connexion à l'espace admin"
    : mode === "signup" ? "Finaliser votre invitation"
    : "Réinitialiser le mot de passe";

  const cta = loading ? "…"
    : mode === "login" ? "Se connecter"
    : mode === "signup" ? "Créer le compte"
    : forgotStep === 1 ? "Envoyer le code" : "Réinitialiser";

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      background: "radial-gradient(120% 120% at 50% 0%, #fff 0%, #f6f4f1 60%)",
    }}>
      <div style={{ width: "100%", maxWidth: 410 }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <span style={{
            display: "inline-flex", width: 52, height: 52, alignItems: "center", justifyContent: "center",
            borderRadius: 14, background: "linear-gradient(135deg, rgba(232,116,60,.16), rgba(201,94,39,.16))",
          }}>
            <Staircase size={26} color={ACCENT_2} />
          </span>
          <h1 style={{ marginTop: 16, fontSize: 22, color: "#1c1917", letterSpacing: "-.01em" }}>Kit Rénovation Escalier</h1>
          <p style={{ marginTop: 6, color: "#6b6560", fontSize: 14 }}>{subtitle}</p>
        </div>

        <form onSubmit={submit} style={{
          background: "#fff", border: "1px solid #e7e2dc", borderRadius: 18, padding: 26,
          boxShadow: "0 18px 50px -28px rgba(0,0,0,.25)", display: "flex", flexDirection: "column", gap: 15,
        }}>
          {mode === "signup" && (
            <div>
              <label style={labelStyle}>Nom complet</label>
              <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Jean Dupont" required />
            </div>
          )}

          {/* Email — sauf à l'étape 2 du reset où il est figé */}
          {!(mode === "forgot" && forgotStep === 2) && (
            <div>
              <label style={labelStyle}>E-mail</label>
              <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.fr" autoComplete="email" required />
            </div>
          )}

          {mode === "signup" && (
            <>
              <div>
                <label style={labelStyle}>Téléphone</label>
                <input style={inputStyle} type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+33 6 12 34 56 78" required />
              </div>
              {!code && (
                <div>
                  <label style={labelStyle}>Code d'invitation</label>
                  <input style={inputStyle} value={code} onChange={e => setCode(e.target.value)}
                    placeholder="Collez votre code d'invitation" required />
                </div>
              )}
            </>
          )}

          {mode === "forgot" && forgotStep === 2 && (
            <div>
              <label style={labelStyle}>Code reçu par WhatsApp</label>
              <input style={inputStyle} value={resetCode} onChange={e => setResetCode(e.target.value)}
                placeholder="6 chiffres" inputMode="numeric" required />
            </div>
          )}

          {/* Mot de passe — pas à l'étape 1 du reset */}
          {!(mode === "forgot" && forgotStep === 1) && (
            <div>
              <label style={labelStyle}>{mode === "forgot" ? "Nouveau mot de passe" : "Mot de passe"}</label>
              <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} required />
              {mode !== "login" && (
                <p style={{ marginTop: 6, fontSize: 11.5, color: pwHint.ok ? "#5B8E5A" : "#9a938c" }}>{pwHint.label}</p>
              )}
            </div>
          )}

          {mode === "signup" && (
            <div>
              <label style={labelStyle}>Confirmer le mot de passe</label>
              <input style={inputStyle} type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••" autoComplete="new-password" required />
            </div>
          )}

          {error && <div style={{ background: "#fdeceb", color: "#B85850", border: "1px solid #f3cfcb", borderRadius: 10, padding: "9px 12px", fontSize: 13 }}>{error}</div>}
          {info && <div style={{ background: "#eef6ee", color: "#3f7a3e", border: "1px solid #cfe6cf", borderRadius: 10, padding: "9px 12px", fontSize: 13 }}>{info}</div>}

          <button type="submit" disabled={loading} style={{
            marginTop: 4, padding: "12px 16px", borderRadius: 10, border: "none",
            background: loading ? "#d98a63" : ACCENT, color: "#fff", fontSize: 14.5, fontWeight: 700,
            cursor: loading ? "default" : "pointer",
          }}>{cta}</button>
        </form>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 13.5, color: "#6b6560" }}>
          {mode === "login" && (
            <button onClick={() => { setMode("forgot"); setForgotStep(1); setError(""); setInfo(""); }}
              style={{ background: "none", border: "none", color: ACCENT_2, fontWeight: 700, cursor: "pointer", fontSize: 13.5 }}>
              Mot de passe oublié ?
            </button>
          )}
          {mode !== "login" && (
            <button onClick={() => { setMode("login"); setError(""); setInfo(""); setForgotStep(1); }}
              style={{ background: "none", border: "none", color: ACCENT_2, fontWeight: 700, cursor: "pointer", fontSize: 13.5 }}>
              ← Retour à la connexion
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
