"use client";

import { useState, useEffect } from "react";
import {
  login, signup, requestReset, verifyResetCode, resetPassword, type AuthUser,
} from "@/lib/auth";
import { Staircase } from "@/components/icons/Icons";
import OtpInput from "./OtpInput";

const ACCENT = "#E8743C";
const ACCENT_2 = "#C95E27";

interface AuthScreenProps {
  onAuthenticated: (user: AuthUser) => void;
}

type Mode = "login" | "signup" | "forgot";
type ForgotStep = "email" | "code" | "password";

function passwordChecks(pwd: string) {
  return [
    { ok: pwd.length >= 8, label: "8 caractères minimum" },
    { ok: /[a-z]/.test(pwd), label: "une minuscule" },
    { ok: /[A-Z]/.test(pwd), label: "une majuscule" },
    { ok: /\d/.test(pwd), label: "un chiffre" },
  ];
}
const passwordOk = (pwd: string) => passwordChecks(pwd).every(c => c.ok);

// ── styles partagés ──────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 13px", borderRadius: 10,
  border: "1px solid #e2ddd6", fontSize: 16, outline: "none", background: "#fff", color: "#1c1917",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12.5, fontWeight: 600, color: "#6b6560", marginBottom: 6,
};
const primaryBtn = (loading: boolean): React.CSSProperties => ({
  width: "100%", padding: "12px 16px", borderRadius: 10, border: "none",
  background: loading ? "#d98a63" : ACCENT, color: "#fff", fontSize: 14.5, fontWeight: 700,
  cursor: loading ? "default" : "pointer",
});
const linkBtn: React.CSSProperties = {
  background: "none", border: "none", color: ACCENT_2, fontWeight: 700, cursor: "pointer", fontSize: 13.5,
};

function PasswordField({
  label, value, onChange, autoComplete,
}: { label: string; value: string; onChange: (v: string) => void; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)}
          placeholder="••••••••" autoComplete={autoComplete} required
          style={{ ...inputStyle, paddingRight: 64 }}
        />
        <button type="button" onClick={() => setShow(s => !s)}
          style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", color: ACCENT_2, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          {show ? "Masquer" : "Afficher"}
        </button>
      </div>
    </div>
  );
}

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>("login");

  // login / signup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  // forgot
  const [forgotStep, setForgotStep] = useState<ForgotStep>("email");
  const [otp, setOtp] = useState("");
  const [ticket, setTicket] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [verifying, setVerifying] = useState(false);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  // Lien d'invitation : ?invite=CODE
  useEffect(() => {
    const inv = new URLSearchParams(window.location.search).get("invite");
    if (inv) { setInviteCode(inv); setMode("signup"); }
  }, []);

  // Cooldown "Renvoyer le code"
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const resetMessages = () => { setError(""); setInfo(""); };
  const goLogin = () => {
    setMode("login"); setForgotStep("email"); setOtp(""); setTicket("");
    setPassword(""); setConfirm(""); resetMessages();
  };

  // ── Soumission principale (login / signup / forgot-email / forgot-password) ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      if (mode === "login") {
        onAuthenticated(await login(email, password));
      } else if (mode === "signup") {
        if (!passwordOk(password)) throw new Error("Mot de passe trop faible.");
        if (password !== confirm) throw new Error("Les mots de passe ne correspondent pas.");
        onAuthenticated(await signup({ name, email, phone, password, code: inviteCode }));
      } else if (mode === "forgot" && forgotStep === "email") {
        await requestReset(email);
        setForgotStep("code");
        setOtp("");
        setResendIn(30);
        setInfo("Code envoyé. Vérifiez vos messages.");
      } else if (mode === "forgot" && forgotStep === "password") {
        if (!passwordOk(password)) throw new Error("Mot de passe trop faible.");
        if (password !== confirm) throw new Error("Les mots de passe ne correspondent pas.");
        await resetPassword(email, ticket, password);
        goLogin();
        setInfo("Mot de passe réinitialisé. Vous pouvez vous connecter.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // ── Vérification du code OTP ────────────────────────────────────────────────
  const verifyOtp = async (codeValue: string) => {
    resetMessages();
    setVerifying(true);
    try {
      const t = await verifyResetCode(email, codeValue);
      setTicket(t);
      setForgotStep("password");
      setPassword(""); setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code invalide.");
      setOtp("");
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    if (resendIn > 0) return;
    resetMessages();
    try { await requestReset(email); setOtp(""); setResendIn(30); setInfo("Nouveau code envoyé."); }
    catch { setError("Impossible de renvoyer le code."); }
  };

  const pwChecks = passwordChecks(password);
  const subtitle =
    mode === "login" ? "Connexion à l'espace admin"
    : mode === "signup" ? "Finaliser votre invitation"
    : forgotStep === "email" ? "Réinitialiser le mot de passe"
    : forgotStep === "code" ? "Vérification en deux étapes"
    : "Nouveau mot de passe";

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      background: "radial-gradient(120% 120% at 50% 0%, #fff 0%, #f6f4f1 60%)",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span style={{
            display: "inline-flex", width: 52, height: 52, alignItems: "center", justifyContent: "center",
            borderRadius: 14, background: "linear-gradient(135deg, rgba(232,116,60,.16), rgba(201,94,39,.16))",
          }}>
            <Staircase size={26} color={ACCENT_2} />
          </span>
          <h1 style={{ marginTop: 16, fontSize: 22, color: "#1c1917", letterSpacing: "-.01em" }}>Kit Rénovation Escalier</h1>
          <p style={{ marginTop: 6, color: "#6b6560", fontSize: 14 }}>{subtitle}</p>
        </div>

        <div style={{
          background: "#fff", border: "1px solid #e7e2dc", borderRadius: 18, padding: 26,
          boxShadow: "0 18px 50px -28px rgba(0,0,0,.25)",
        }}>
          {/* ÉTAPE CODE — hors <form> (auto-validation) */}
          {mode === "forgot" && forgotStep === "code" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontSize: 13.5, color: "#6b6560", textAlign: "center", lineHeight: 1.5 }}>
                Saisissez le code à 6 chiffres envoyé par WhatsApp/SMS à votre numéro enregistré.
              </p>
              <OtpInput value={otp} onChange={setOtp} onComplete={verifyOtp} disabled={verifying} error={!!error} accent={ACCENT} />

              {error && <Banner type="error">{error}</Banner>}
              {info && !error && <Banner type="info">{info}</Banner>}

              <button type="button" disabled={otp.length < 6 || verifying} onClick={() => verifyOtp(otp)}
                style={{ ...primaryBtn(verifying), opacity: otp.length < 6 ? 0.5 : 1 }}>
                {verifying ? "Vérification…" : "Vérifier le code"}
              </button>

              <div style={{ textAlign: "center", fontSize: 13, color: "#6b6560" }}>
                {resendIn > 0
                  ? <span>Renvoyer le code dans {resendIn}s</span>
                  : <button type="button" onClick={resend} style={linkBtn}>Renvoyer le code</button>}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              {mode === "signup" && (
                <div>
                  <label style={labelStyle}>Nom complet</label>
                  <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Jean Dupont" required />
                </div>
              )}

              {/* Email — sauf à l'étape mot de passe du reset */}
              {!(mode === "forgot" && forgotStep === "password") && (
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
                  {!inviteCode && (
                    <div>
                      <label style={labelStyle}>Code d'invitation</label>
                      <input style={inputStyle} value={inviteCode} onChange={e => setInviteCode(e.target.value)}
                        placeholder="Collez votre code d'invitation" required />
                    </div>
                  )}
                </>
              )}

              {/* Mot de passe : login, signup, et reset-password */}
              {(mode === "login" || mode === "signup" || (mode === "forgot" && forgotStep === "password")) && (
                <PasswordField
                  label={mode === "forgot" ? "Nouveau mot de passe" : "Mot de passe"}
                  value={password} onChange={setPassword}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              )}

              {/* Critères + confirmation pour signup & reset */}
              {(mode === "signup" || (mode === "forgot" && forgotStep === "password")) && (
                <>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: -4 }}>
                    {pwChecks.map(c => (
                      <span key={c.label} style={{ fontSize: 11.5, color: c.ok ? "#3f7a3e" : "#9a938c" }}>
                        {c.ok ? "✓" : "○"} {c.label}
                      </span>
                    ))}
                  </div>
                  <PasswordField label="Confirmer le mot de passe" value={confirm} onChange={setConfirm} autoComplete="new-password" />
                  {confirm.length > 0 && confirm !== password && (
                    <span style={{ fontSize: 11.5, color: "#B85850", marginTop: -8 }}>Les mots de passe ne correspondent pas.</span>
                  )}
                </>
              )}

              {error && <Banner type="error">{error}</Banner>}
              {info && !error && <Banner type="info">{info}</Banner>}

              <button type="submit" disabled={loading} style={primaryBtn(loading)}>
                {loading ? "…"
                  : mode === "login" ? "Se connecter"
                  : mode === "signup" ? "Créer le compte"
                  : forgotStep === "email" ? "Envoyer le code"
                  : "Réinitialiser le mot de passe"}
              </button>
            </form>
          )}
        </div>

        {/* Liens bas de carte */}
        <div style={{ textAlign: "center", marginTop: 18, fontSize: 13.5, color: "#6b6560" }}>
          {mode === "login" && (
            <button onClick={() => { setMode("forgot"); setForgotStep("email"); resetMessages(); }} style={linkBtn}>
              Mot de passe oublié ?
            </button>
          )}
          {mode !== "login" && (
            <button onClick={goLogin} style={linkBtn}>← Retour à la connexion</button>
          )}
        </div>
      </div>
    </div>
  );
}

function Banner({ type, children }: { type: "error" | "info"; children: React.ReactNode }) {
  const s = type === "error"
    ? { background: "#fdeceb", color: "#B85850", border: "1px solid #f3cfcb" }
    : { background: "#eef6ee", color: "#3f7a3e", border: "1px solid #cfe6cf" };
  return <div style={{ ...s, borderRadius: 10, padding: "9px 12px", fontSize: 13 }}>{children}</div>;
}
