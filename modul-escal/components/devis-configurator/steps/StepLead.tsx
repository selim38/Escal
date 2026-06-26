"use client";

import { Camera, Mail, MessageCircle, Trash2, User } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";

import { type QuoteFormDraft } from "@/lib/quote-schema";
import { pendingPhotos } from "@/lib/pending-photos";

type PhotoSlot = {
  key: string;
  label: string;
  hint: string;
};

const PHOTO_SLOTS: PhotoSlot[] = [
  { key: "bas",    label: "Vue du bas",    hint: "Depuis le rez-de-chaussée, en regardant vers le haut." },
  { key: "milieu", label: "Vue du milieu", hint: "Depuis le milieu de l'escalier." },
  { key: "haut",   label: "Vue du haut",   hint: "Depuis le palier supérieur, en regardant vers le bas." },
];

type SlotPhoto = { file: File; preview: string } | null;

export function StepLead() {
  const { register, watch, setValue, formState } = useFormContext<QuoteFormDraft>();
  const contactPreference = watch("contactPreference");

  const [slotPhotos, setSlotPhotos] = useState<Record<string, SlotPhoto>>({
    bas: null, milieu: null, haut: null,
  });
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Synchronise le singleton à chaque changement
  useEffect(() => {
    pendingPhotos.files = Object.values(slotPhotos)
      .filter((s): s is NonNullable<SlotPhoto> => s !== null)
      .map((s) => s.file);
  }, [slotPhotos]);

  const setSlotFile = (key: string, file: File | null) => {
    setSlotPhotos((prev) => {
      if (prev[key]) URL.revokeObjectURL(prev[key]!.preview);
      return {
        ...prev,
        [key]: file ? { file, preview: URL.createObjectURL(file) } : null,
      };
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold tracking-tight text-[#1e2a4a] sm:text-2xl">
          Vos coordonnées
        </h2>
        <p className="text-sm text-muted">
          Un technicien vous recontactera pour finaliser votre devis.
        </p>
      </div>

      {/* ── Formulaire contact ───────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-brand">
          <User className="size-5 text-primary" aria-hidden />
          <h3 className="text-base font-semibold">Informations personnelles</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="lastName" className="text-sm font-medium text-brand">Nom</label>
            <input
              id="lastName"
              autoComplete="family-name"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              {...register("lastName")}
            />
            {formState.errors.lastName?.message && (
              <p className="text-sm text-red-600" role="alert">{formState.errors.lastName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="firstName" className="text-sm font-medium text-brand">Prénom</label>
            <input
              id="firstName"
              autoComplete="given-name"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              {...register("firstName")}
            />
            {formState.errors.firstName?.message && (
              <p className="text-sm text-red-600" role="alert">{formState.errors.firstName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-brand">E-mail</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-3 text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              {...register("email")}
            />
          </div>
          {formState.errors.email?.message && (
            <p className="text-sm text-red-600" role="alert">{formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm font-medium text-brand">Téléphone</label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
            {...register("phone")}
          />
          {formState.errors.phone?.message && (
            <p className="text-sm text-red-600" role="alert">{formState.errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="country" className="text-sm font-medium text-brand">Pays</label>
          <select
            id="country"
            autoComplete="country-name"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
            {...register("country")}
          >
            <option value="">Sélectionnez un pays…</option>
            <optgroup label="Principaux">
              <option value="France">France</option>
              <option value="Belgique">Belgique</option>
              <option value="Suisse">Suisse</option>
              <option value="Luxembourg">Luxembourg</option>
              <option value="Canada">Canada</option>
            </optgroup>
            <optgroup label="Autres">
              <option value="Allemagne">Allemagne</option>
              <option value="Espagne">Espagne</option>
              <option value="Italie">Italie</option>
              <option value="Pays-Bas">Pays-Bas</option>
              <option value="Portugal">Portugal</option>
              <option value="Royaume-Uni">Royaume-Uni</option>
              <option value="Maroc">Maroc</option>
              <option value="Tunisie">Tunisie</option>
              <option value="Algérie">Algérie</option>
              <option value="Autre">Autre</option>
            </optgroup>
          </select>
          {formState.errors.country?.message && (
            <p className="text-sm text-red-600" role="alert">{formState.errors.country.message}</p>
          )}
        </div>
      </div>

      {/* ── Préférence de contact ────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-brand">
          <MessageCircle className="size-5 text-primary" aria-hidden />
          <h3 className="text-base font-semibold">Comment souhaitez-vous être contacté ?</h3>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {([
            { value: "WHATSAPP", label: "WhatsApp", icon: "💬" },
            { value: "EMAIL",    label: "E-mail",   icon: "✉️" },
          ] as const).map((opt) => {
            const active = contactPreference === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue("contactPreference", opt.value, { shouldDirty: true })}
                className={`flex flex-1 items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  active
                    ? "border-primary bg-primary/5 text-brand ring-2 ring-primary/25"
                    : "border-border bg-surface text-muted hover:border-brand-medium/35"
                }`}
              >
                <span className="text-lg">{opt.icon}</span>
                {opt.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted">
          Si vous n'avez pas WhatsApp, choisissez E-mail — un technicien vous répondra dans les 24 h.
        </p>
      </div>

      {/* ── 3 photos labelisées ──────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-brand">
          <Camera className="size-5 text-primary" aria-hidden />
          <h3 className="text-base font-semibold">Photos de votre escalier</h3>
        </div>
        <p className="text-sm text-muted">
          3 photos sont nécessaires pour que notre technicien puisse affiner votre devis.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PHOTO_SLOTS.map((slot) => {
            const photo = slotPhotos[slot.key];
            return (
              <div key={slot.key} className="space-y-1.5">
                <p className="text-xs font-semibold text-brand">{slot.label}</p>
                <p className="text-xs text-muted">{slot.hint}</p>

                {photo ? (
                  <div className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted-bg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.preview}
                      alt={slot.label}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setSlotFile(slot.key, null)}
                      className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/50 text-white"
                      aria-label={`Supprimer ${slot.label}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      ref={(el) => { fileRefs.current[slot.key] = el; }}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      onChange={(e) => setSlotFile(slot.key, e.target.files?.[0] ?? null)}
                    />
                    <button
                      type="button"
                      onClick={() => fileRefs.current[slot.key]?.click()}
                      className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface text-muted transition hover:border-primary/40 hover:text-brand"
                    >
                      <Camera className="size-6" aria-hidden />
                      <span className="text-xs">Ajouter une photo</span>
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted">
          Les photos sont facultatives mais fortement recommandées pour obtenir un devis précis.
        </p>
      </div>
    </div>
  );
}
