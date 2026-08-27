"use client";

import { Camera, Mail, MessageCircle, Trash2, User } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";

import { usePendingPhotos } from "@/lib/config";
import { useT } from "@/lib/i18n/useT";
import { useFieldError } from "@/lib/useFieldError";
import { type QuoteFormDraft } from "@/lib/quote-schema";

import { SampleCta } from "../ui/SampleCta";

const PHOTO_SLOT_KEYS = ["bas", "milieu", "haut"] as const;
type PhotoSlotKey = (typeof PHOTO_SLOT_KEYS)[number];

type SlotPhoto = { file: File; preview: string } | null;

export function StepLead() {
  const { register, watch, setValue } = useFormContext<QuoteFormDraft>();
  const contactPreference = watch("contactPreference");
  const decor = watch("decor");
  const pendingPhotos = usePendingPhotos();
  const { m, t } = useT();

  const lastNameError = useFieldError("lastName");
  const firstNameError = useFieldError("firstName");
  const emailError = useFieldError("email");
  const phoneError = useFieldError("phone");
  const countryError = useFieldError("country");

  const [slotPhotos, setSlotPhotos] = useState<Record<string, SlotPhoto>>({
    bas: null,
    milieu: null,
    haut: null,
  });
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Synchronise le magasin de photos porté par l'instance
  useEffect(() => {
    pendingPhotos.set(
      Object.values(slotPhotos)
        .filter((s): s is NonNullable<SlotPhoto> => s !== null)
        .map((s) => s.file),
    );
  }, [slotPhotos, pendingPhotos]);

  // Libère les URLs d'aperçu au démontage (le composant peut être retiré de la
  // page hôte à tout moment).
  useEffect(() => {
    return () => {
      for (const slot of Object.values(slotPhotos)) {
        if (slot) URL.revokeObjectURL(slot.preview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSlotFile = (key: string, file: File | null) => {
    setSlotPhotos((prev) => {
      const existing = prev[key];
      if (existing) URL.revokeObjectURL(existing.preview);
      return {
        ...prev,
        [key]: file ? { file, preview: URL.createObjectURL(file) } : null,
      };
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold tracking-tight text-heading sm:text-2xl">
          {m.steps.lead.title}
        </h2>
        <p className="text-sm text-muted">{m.steps.lead.subtitle}</p>
      </div>

      {/* ── Formulaire contact ───────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="flex items-center gap-2 text-brand">
          <User className="size-5 text-primary" aria-hidden />
          <span className="text-base font-semibold">
            {m.steps.lead.personalInfo}
          </span>
        </legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="kre-lastName"
              className="text-sm font-medium text-brand"
            >
              {m.steps.lead.lastName}
            </label>
            <input
              id="kre-lastName"
              autoComplete="family-name"
              aria-invalid={lastNameError ? true : undefined}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              {...register("lastName")}
            />
            {lastNameError && (
              <p className="text-sm text-error" role="alert">
                {lastNameError}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="kre-firstName"
              className="text-sm font-medium text-brand"
            >
              {m.steps.lead.firstName}
            </label>
            <input
              id="kre-firstName"
              autoComplete="given-name"
              aria-invalid={firstNameError ? true : undefined}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              {...register("firstName")}
            />
            {firstNameError && (
              <p className="text-sm text-error" role="alert">
                {firstNameError}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="kre-email" className="text-sm font-medium text-brand">
            {m.steps.lead.email}
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <input
              id="kre-email"
              type="email"
              autoComplete="email"
              aria-invalid={emailError ? true : undefined}
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-3 text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              {...register("email")}
            />
          </div>
          {emailError && (
            <p className="text-sm text-error" role="alert">
              {emailError}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="kre-phone" className="text-sm font-medium text-brand">
            {m.steps.lead.phone}
          </label>
          <input
            id="kre-phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={phoneError ? true : undefined}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
            {...register("phone")}
          />
          {phoneError && (
            <p className="text-sm text-error" role="alert">
              {phoneError}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="kre-country"
            className="text-sm font-medium text-brand"
          >
            {m.steps.lead.country}
          </label>
          <select
            id="kre-country"
            autoComplete="country-name"
            aria-invalid={countryError ? true : undefined}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
            {...register("country")}
          >
            <option value="">{m.steps.lead.countryPlaceholder}</option>
            <optgroup label={m.steps.lead.countryMain}>
              {m.steps.lead.countries.main.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </optgroup>
            <optgroup label={m.steps.lead.countryOther}>
              {m.steps.lead.countries.other.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </optgroup>
          </select>
          {countryError && (
            <p className="text-sm text-error" role="alert">
              {countryError}
            </p>
          )}
        </div>
      </fieldset>

      {/* ── Préférence de contact ────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="flex items-center gap-2 text-brand">
          <MessageCircle className="size-5 text-primary" aria-hidden />
          <span className="text-base font-semibold">
            {m.steps.lead.contactPreferenceTitle}
          </span>
        </legend>
        <div className="flex flex-col gap-2 sm:flex-row">
          {(
            [
              {
                value: "WHATSAPP",
                label: m.steps.lead.contactWhatsapp,
                icon: "💬",
              },
              { value: "EMAIL", label: m.steps.lead.contactEmail, icon: "✉️" },
            ] as const
          ).map((opt) => {
            const active = contactPreference === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setValue("contactPreference", opt.value, {
                    shouldDirty: true,
                  })
                }
                aria-pressed={active}
                className={`flex flex-1 items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  active
                    ? "border-primary bg-primary/5 text-brand ring-2 ring-primary/25"
                    : "border-border bg-surface text-muted hover:border-brand-medium/35"
                }`}
              >
                <span className="text-lg" aria-hidden>
                  {opt.icon}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted">{m.steps.lead.contactHint}</p>
      </fieldset>

      {/* ── 3 photos labelisées ──────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-brand">
          <Camera className="size-5 text-primary" aria-hidden />
          <h3 className="text-base font-semibold">
            {m.steps.lead.photosTitle}
          </h3>
        </div>
        <p className="text-sm text-muted">{m.steps.lead.photosIntro}</p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PHOTO_SLOT_KEYS.map((key: PhotoSlotKey) => {
            const photo = slotPhotos[key];
            const slot = m.steps.lead.photoSlots[key];
            const inputId = `kre-photo-${key}`;
            return (
              <div key={key} className="flex flex-col">
                <div className="mb-2 min-h-[44px]">
                  <p className="text-xs font-semibold text-brand">
                    {slot.label}
                  </p>
                  <p className="text-xs text-muted">{slot.hint}</p>
                </div>

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
                      onClick={() => setSlotFile(key, null)}
                      className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/50 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      aria-label={t(m.steps.lead.removePhoto, {
                        label: slot.label,
                      })}
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      id={inputId}
                      ref={(el) => {
                        fileRefs.current[key] = el;
                      }}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      onChange={(e) =>
                        setSlotFile(key, e.target.files?.[0] ?? null)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => fileRefs.current[key]?.click()}
                      aria-label={`${slot.label} — ${m.steps.lead.addPhoto}`}
                      className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface text-muted transition hover:border-primary/40 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <Camera className="size-6" aria-hidden />
                      <span className="text-xs">{m.steps.lead.addPhoto}</span>
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted">{m.steps.lead.photosNote}</p>
      </div>

      <SampleCta decorLabel={decor ? m.catalog.decor[decor] : undefined} />
    </div>
  );
}
