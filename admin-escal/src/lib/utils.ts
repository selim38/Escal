export function fmtEUR(n: number): string {
  if (!n) return "—";
  return n.toLocaleString("fr-FR") + " €";
}

export function avatarBg(id: string): string {
  const palette = [
    "linear-gradient(135deg,#EFE2CC,#D9C2A0)",
    "linear-gradient(135deg,#E8DACB,#C9B49A)",
    "linear-gradient(135deg,#F0D9C2,#D9B498)",
    "linear-gradient(135deg,#E3D6C2,#B89E80)",
    "linear-gradient(135deg,#ECE0CD,#C7A98A)",
  ];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export function shade(hex: string, percent: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  let r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
  const k = 1 + percent / 100;
  r = Math.max(0, Math.min(255, Math.round(r * k)));
  g = Math.max(0, Math.min(255, Math.round(g * k)));
  b = Math.max(0, Math.min(255, Math.round(b * k)));
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
