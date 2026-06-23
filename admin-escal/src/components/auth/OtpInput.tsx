"use client";

import { useRef, type KeyboardEvent, type ClipboardEvent } from "react";

interface OtpInputProps {
  value: string;                       // 0..length chiffres
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;    // appelé quand les `length` chiffres sont saisis
  length?: number;
  disabled?: boolean;
  error?: boolean;
  accent?: string;
}

/** Saisie d'un code à N chiffres dans des cases séparées (style 2FA pro). */
export default function OtpInput({
  value, onChange, onComplete, length = 6, disabled, error, accent = "#E8743C",
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focusAt = (i: number) => {
    const el = refs.current[Math.max(0, Math.min(length - 1, i))];
    el?.focus();
    el?.select();
  };

  const setDigit = (i: number, d: string) => {
    const next = digits.slice();
    next[i] = d;
    const joined = next.join("").slice(0, length);
    onChange(joined);
    return joined;
  };

  const handleChange = (i: number, raw: string) => {
    const only = raw.replace(/\D/g, "");
    if (only === "") { setDigit(i, ""); return; }
    // Saisie multiple (autofill clavier) → répartit
    if (only.length > 1) {
      const joined = (value.slice(0, i) + only).replace(/\D/g, "").slice(0, length);
      onChange(joined);
      if (joined.length >= length) { refs.current[length - 1]?.blur(); onComplete?.(joined); }
      else focusAt(joined.length);
      return;
    }
    const joined = setDigit(i, only);
    if (i < length - 1) focusAt(i + 1);
    if (joined.length >= length && !joined.includes("")) onComplete?.(joined);
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) setDigit(i, "");
      else { setDigit(i - 1, ""); focusAt(i - 1); }
    } else if (e.key === "ArrowLeft") { e.preventDefault(); focusAt(i - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); focusAt(i + 1); }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    if (pasted.length >= length) { refs.current[length - 1]?.blur(); onComplete?.(pasted); }
    else focusAt(pasted.length);
  };

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={i === 0}
          maxLength={1}
          value={d}
          disabled={disabled}
          aria-label={`Chiffre ${i + 1}`}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          style={{
            width: 46, height: 56, textAlign: "center",
            fontSize: 22, fontWeight: 700, color: "#1c1917",
            borderRadius: 12, outline: "none", background: disabled ? "#f6f4f1" : "#fff",
            border: `2px solid ${error ? "#B85850" : d ? accent : "#e2ddd6"}`,
            transition: "border-color .15s",
            caretColor: accent,
          }}
        />
      ))}
    </div>
  );
}
