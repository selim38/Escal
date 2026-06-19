"use client";

import { useState } from "react";
import { login, signup, type AuthUser } from "@/lib/auth";
import { Staircase } from "@/components/icons/Icons";

const ACCENT = "#E8743C";
const ACCENT_2 = "#C95E27";

interface AuthScreenProps {
  onAuthenticated: (user: AuthUser) => void;
}

type Mode = "login" | "signup";

// Mêmes règles que le backend (auth.php)
function passwordHint(pwd: string): { ok: boolean; label: string } {
  const checks = [
    pwd.length >= 8,
    /[a-z]/.test(pwd),
    /[A-Z]/.test(pwd),
    /\d/.test(pwd),
  ];
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const pwHint = passwordHint(password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      if (!pwHint.ok) { setError("Mot de passe trop faible."); return; }
      if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    }

    setLoading(true);
    try {
      const user = mode === "login"
        ? await login(email, password)
        : await signup({ name, email, phone, password });
      onAuthenticated(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 13px", borderRadius: 10,
    border: "1px solid #e2ddd6", fontSize: 14, outline: "none",
    background: "#fff", color: "#1c1917",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 12.5, fontWeight: 600, color: "#6b6560", marginBottom: 6,
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      background: "radial-gradient(120% 120% at 50% 0%, #fff 0%, #f6f4f1 60%)",
    }}>
      <div style={{ width: "100%", maxWidth: 410 }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <span style={{
            display: "inline-flex", width: 52, height: 52, alignItems: "center",
            justifyContent: "center", borderRadius: 14,
            background: "linear-gradient(135deg, rgba(232,116,60,.16), rgba(201,94,39,.16))",
          }}>
            <Staircase size={26} color={ACCENT_2} />
          </span>
          <h1 style={{ marginTop: 16, fontSize: 22, color: "#1c1917", letterSpacing: "-.01em" }}>
            Kit Rénovation Escalier
          </h1>
          <p style={{ marginTop: 6, color: "#6b6560", fontSize: 14 }}>
            {mode === "login" ? "Connexion à l'espace admin" : "Créer un compte admin"}
          </p>
        </div>

        <form onSubmit={submit} style={{
          background: "#fff", border: "1px solid #e7e2dc", borderRadius: 18,
          padding: 26, boxShadow: "0 18px 50px -28px rgba(0,0,0,.25)",
          display: "flex", flexDirection: "column", gap: 15,
        }}>
          {mode === "signup" && (
            <div>
              <label style={labelStyle}>Nom complet</label>
              <input style={inputStyle} value={name} onChange={e => setName(e.target.value)}
                placeholder="Jean Dupont" autoComplete="name" required />
            </div>
          )}

          <div>
            <label style={labelStyle}>E-mail</label>
            <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="vous@exemple.fr" autoComplete="email" required />
          </div>

          {mode === "signup" && (
            <div>
              <label style={labelStyle}>Téléphone</label>
              <input style={inputStyle} type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+33 6 12 34 56 78" autoComplete="tel" required />
            </div>
          )}

          <div>
            <label style={labelStyle}>Mot de passe</label>
            <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} required />
            {mode === "signup" && (
              <p style={{ marginTop: 6, fontSize: 11.5, color: pwHint.ok ? "#5B8E5A" : "#9a938c" }}>
                {pwHint.label}
              </p>
            )}
          </div>

          {mode === "signup" && (
            <div>
              <label style={labelStyle}>Confirmer le mot de passe</label>
              <input style={inputStyle} type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••" autoComplete="new-password" required />
            </div>
          )}

          {error && (
            <div style={{
              background: "#fdeceb", color: "#B85850", border: "1px solid #f3cfcb",
              borderRadius: 10, padding: "9px 12px", fontSize: 13,
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            marginTop: 4, padding: "12px 16px", borderRadius: 10, border: "none",
            background: loading ? "#d98a63" : ACCENT, color: "#fff", fontSize: 14.5,
            fontWeight: 700, cursor: loading ? "default" : "pointer",
          }}>
            {loading ? "…" : mode === "login" ? "Se connecter" : "Créer le compte"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 18, fontSize: 13.5, color: "#6b6560" }}>
          {mode === "login" ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            style={{ background: "none", border: "none", color: ACCENT_2, fontWeight: 700, cursor: "pointer", fontSize: 13.5 }}
          >
            {mode === "login" ? "Créer un compte" : "Se connecter"}
          </button>
        </p>
      </div>
    </div>
  );
}
