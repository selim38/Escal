"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * Modale du configurateur.
 *
 * Pourquoi `<dialog>` plutôt qu'un overlay `position: fixed` :
 * dans un Shadow DOM inséré dans une page WordPress, `position: fixed` est piégé
 * par tout ancêtre créant un bloc conteneur (`transform`, `filter`, `will-change`,
 * `contain`, `perspective` — omniprésents dans les thèmes et page builders), et
 * `z-index` est scopé au contexte d'empilement de l'hôte (un header sticky en
 * `z-index: 9999` passerait devant). `showModal()` place l'élément dans la
 * **top layer**, qui échappe aux deux problèmes, et fournit nativement le piège
 * de focus et la touche Échap.
 *
 * Repli sur l'overlay `fixed` quand `showModal` est absent (iOS Safari 15.0–15.3).
 */
export function KreDialog({
  open,
  onClose,
  labelledBy,
  children,
  className = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  children: ReactNode;
  /** Classes de largeur du panneau. */
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [supportsModal, setSupportsModal] = useState(true);

  useEffect(() => {
    setSupportsModal(
      typeof HTMLDialogElement !== "undefined" &&
        typeof HTMLDialogElement.prototype.showModal === "function",
    );
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !supportsModal) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open, supportsModal]);

  // Échap déclenche `cancel` : on repasse par onClose pour garder l'état React source de vérité.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener("cancel", onCancel);
    return () => el.removeEventListener("cancel", onCancel);
  }, [onClose]);

  if (!supportsModal) {
    if (!open) return null;
    return (
      <FallbackOverlay onClose={onClose} labelledBy={labelledBy} className={className}>
        {children}
      </FallbackOverlay>
    );
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      className={`kre-dialog m-auto w-[calc(100%-32px)] rounded-2xl bg-surface p-6 text-foreground shadow-xl ${className}`}
      onClick={(e) => {
        // Clic sur le backdrop (la cible est le <dialog> lui-même, pas son contenu).
        if (e.target === ref.current) onClose();
      }}
    >
      {children}
    </dialog>
  );
}

/** Repli sans top layer : overlay + piège de focus et Échap câblés à la main. */
function FallbackOverlay({
  onClose,
  labelledBy,
  className,
  children,
}: {
  onClose: () => void;
  labelledBy?: string;
  className: string;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    // `document.activeElement` renvoie l'élément hôte quand le focus est dans un
    // shadow root : c'est la racine du shadow qu'il faut interroger.
    const root = panel.getRootNode() as ShadowRoot | Document;
    const activeInRoot = () => root.activeElement;
    const previouslyFocused = activeInRoot() as HTMLElement | null;
    const focusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);

    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = activeInRoot();
      if (e.shiftKey && (active === first || !panel.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    panel.ownerDocument.addEventListener("keydown", onKeyDown, true);
    return () => {
      panel.ownerDocument.removeEventListener("keydown", onKeyDown, true);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[2147483000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`mx-4 rounded-2xl bg-surface p-6 text-foreground shadow-xl ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
