/**
 * Notifications : son (Web Audio, sans fichier) + notification navigateur.
 */

let audioCtx: AudioContext | null = null;

/** Demande l'autorisation d'afficher des notifications navigateur. */
export function requestNotifyPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission().catch(() => {});
  }
}

/** Petit bip synthétisé (aucun asset requis). */
export function playChime() {
  if (typeof window === "undefined") return;
  try {
    type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };
    const Ctx = window.AudioContext ?? (window as WindowWithWebkit).webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx ?? new Ctx();
    const ctx = audioCtx;
    const now = ctx.currentTime;
    // Deux notes brèves (ré–sol)
    [880, 1175].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = now + i * 0.13;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.13);
    });
  } catch {
    /* silencieux */
  }
}

/** Notification visuelle + sonore. */
export function notify(title: string, body: string) {
  playChime();
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    try {
      new Notification(title, { body, tag: "escal-admin" });
    } catch {
      /* certains navigateurs exigent un ServiceWorker — on ignore */
    }
  }
}
