"use client";

import { X } from "lucide-react";

import { useT } from "@/lib/i18n/useT";

import { KreDialog } from "./KreDialog";

/** Conseil de surcoupe (+20 %) sur la surface du palier. */
export function M2AdviceModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { m } = useT();

  return (
    <KreDialog
      open={open}
      onClose={onClose}
      labelledBy="kre-m2-modal-title"
      className="max-w-sm"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xl"
        >
          💡
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto rounded-lg p-1 text-muted hover:bg-muted-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label={m.common.close}
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <h3
        id="kre-m2-modal-title"
        className="mb-2 text-base font-semibold text-brand"
      >
        {m.m2Modal.title}
      </h3>
      <p className="mb-1 text-sm text-muted">{m.m2Modal.body1}</p>
      <p className="mb-5 text-sm text-muted">{m.m2Modal.body2}</p>
      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {m.common.understood}
      </button>
    </KreDialog>
  );
}
