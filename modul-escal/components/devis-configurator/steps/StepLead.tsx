"use client";

import {
  CameraIcon,
  CameraPlusIcon,
  ChatCircleIcon,
  EnvelopeSimpleIcon,
  ImageSquareIcon,
  TrashIcon,
  UserIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react";
import { useRef, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";

import { usePendingPhotos } from "@/lib/config";
import { useT } from "@/lib/i18n/useT";
import { useFieldError } from "@/lib/useFieldError";
import { useLiveValidation } from "@/lib/useLiveValidation";
import { type LeadField, type QuoteFormDraft } from "@/lib/quote-schema";

import { buttonClass } from "../ui/Button";
import {
  describedBy,
  FieldError,
  FieldLabel,
  fieldClass,
  SelectShell,
  selectClass,
} from "../ui/Field";
import { OptionCard } from "../ui/OptionCard";
import { SampleCta } from "../ui/SampleCta";
import { SectionTitle, StepHeader } from "../ui/Typography";

const PHOTO_SLOT_KEYS = ["bas", "milieu", "haut"] as const;
type PhotoSlotKey = (typeof PHOTO_SLOT_KEYS)[number];

type SlotPhoto = { file: File; preview: string } | null;

const SECTION_ICON_CLASS = "size-[21px] shrink-0 text-primary";

export function StepLead({
  requiredPhotoCount,
  showMissingAsError,
  onPhotoCountChange,
}: {
  requiredPhotoCount: number;
  /** Après un envoi refusé, les photos manquantes sont signalées en erreur. */
  showMissingAsError: boolean;
  /** Nombre de photos ajoutées, pour retirer le résumé d'erreur une fois complet. */
  onPhotoCountChange: (count: number) => void;
}) {
  const { register, watch, setValue } = useFormContext<QuoteFormDraft>();
  const contactPreference = watch("contactPreference");
  const decor = watch("decor");
  const pendingPhotos = usePendingPhotos();
  const live = useLiveValidation();
  const { m, t } = useT();

  const errors: Record<LeadField, string | undefined> = {
    lastName: useFieldError("lastName"),
    firstName: useFieldError("firstName"),
    email: useFieldError("email"),
    phone: useFieldError("phone"),
    country: useFieldError("country"),
  };

  /**
   * Props communes d'un champ : identifiant, état d'erreur relié au message
   * (aria-describedby), et validation à la sortie du champ — une saisie
   * incorrecte est signalée sans attendre l'envoi.
   */
  const fieldProps = (name: LeadField) => ({
    id: `kre-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": describedBy(errors[name] && `kre-${name}-error`),
    ...register(name, {
      onBlur: () => live.touch(name),
      onChange: () => live.recheck(name),
    }),
  });

  const [slotPhotos, setSlotPhotos] = useState<Record<string, SlotPhoto>>({
    bas: null,
    milieu: null,
    haut: null,
  });
  // Deux champs par emplacement : `capture` ouvre l'appareil photo, sans lui le
  // navigateur propose la galerie. Un seul champ ne peut pas offrir les deux.
  const cameraRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const libraryRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const files = Object.values(slotPhotos).filter(
    (s): s is NonNullable<SlotPhoto> => s !== null,
  );
  const missingPhotos = requiredPhotoCount - files.length;

  // Synchronise le magasin de photos porté par l'instance
  useEffect(() => {
    const photos = Object.values(slotPhotos)
      .filter((s): s is NonNullable<SlotPhoto> => s !== null)
      .map((s) => s.file);
    pendingPhotos.set(photos);
    onPhotoCountChange(photos.length);
  }, [slotPhotos, pendingPhotos, onPhotoCountChange]);

  // L'étape est démontée dès qu'on revient en arrière : les aperçus sont
  // perdus, le magasin doit l'être aussi pour ne pas envoyer de photos fantômes.
  useEffect(() => {
    return () => pendingPhotos.clear();
  }, [pendingPhotos]);

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

  const missingMessage = t(m.steps.lead.photosMissing, {
    count: missingPhotos,
    plural: missingPhotos > 1 ? "s" : "",
    total: requiredPhotoCount,
  });

  return (
    <div className="space-y-8">
      <StepHeader title={m.steps.lead.title} subtitle={m.steps.lead.subtitle} />

      {/* ── Formulaire contact ───────────────────────────────── */}
      <fieldset className="space-y-4">
        <SectionTitle as="legend" icon={<UserIcon aria-hidden className={SECTION_ICON_CLASS} />}>
          {m.steps.lead.personalInfo}
        </SectionTitle>

        <div className="grid grid-cols-1 gap-x-3.5 gap-y-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="kre-lastName">{m.steps.lead.lastName}</FieldLabel>
            <input autoComplete="family-name" className={fieldClass} {...fieldProps("lastName")} />
            <FieldError id="kre-lastName-error">{errors.lastName}</FieldError>
          </div>

          <div>
            <FieldLabel htmlFor="kre-firstName">{m.steps.lead.firstName}</FieldLabel>
            <input autoComplete="given-name" className={fieldClass} {...fieldProps("firstName")} />
            <FieldError id="kre-firstName-error">{errors.firstName}</FieldError>
          </div>

          <div>
            <FieldLabel htmlFor="kre-email">{m.steps.lead.email}</FieldLabel>
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              className={fieldClass}
              {...fieldProps("email")}
            />
            <FieldError id="kre-email-error">{errors.email}</FieldError>
          </div>

          <div>
            <FieldLabel htmlFor="kre-phone">{m.steps.lead.phone}</FieldLabel>
            <input type="tel" autoComplete="tel" className={fieldClass} {...fieldProps("phone")} />
            <FieldError id="kre-phone-error">{errors.phone}</FieldError>
          </div>

          <div>
            <FieldLabel htmlFor="kre-country">{m.steps.lead.country}</FieldLabel>
            <SelectShell>
              <select autoComplete="country-name" className={selectClass} {...fieldProps("country")}>
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
            </SelectShell>
            <FieldError id="kre-country-error">{errors.country}</FieldError>
          </div>
        </div>
      </fieldset>

      {/* ── Préférence de contact ────────────────────────────── */}
      <fieldset className="space-y-3.5">
        <SectionTitle as="legend" icon={<ChatCircleIcon aria-hidden className={SECTION_ICON_CLASS} />}>
          {m.steps.lead.contactPreferenceTitle}
        </SectionTitle>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {(
            [
              { value: "WHATSAPP", label: m.steps.lead.contactWhatsapp, Icon: WhatsappLogoIcon },
              { value: "EMAIL", label: m.steps.lead.contactEmail, Icon: EnvelopeSimpleIcon },
            ] as const
          ).map(({ value, label, Icon }) => (
            <OptionCard
              key={value}
              selected={contactPreference === value}
              onClick={() =>
                setValue("contactPreference", value, { shouldDirty: true })
              }
              markClassName="top-[13.5px]"
              className="flex h-14 items-center gap-3 px-[18px] text-left text-[15px] font-semibold text-heading"
            >
              {/* Même famille d'icônes que le reste du tunnel (Phosphor Regular). */}
              <Icon aria-hidden className="size-[22px] shrink-0 text-primary" />
              {label}
            </OptionCard>
          ))}
        </div>
        <p className="text-[13px] text-subtle">{m.steps.lead.contactHint}</p>
      </fieldset>

      {/* ── 3 photos labellisées ─────────────────────────────── */}
      <div className="space-y-3.5">
        <SectionTitle icon={<CameraIcon aria-hidden className={SECTION_ICON_CLASS} />}>
          {m.steps.lead.photosTitle}
        </SectionTitle>
        <p className="text-sm text-muted">{m.steps.lead.photosIntro}</p>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {PHOTO_SLOT_KEYS.map((key: PhotoSlotKey) => {
            const photo = slotPhotos[key];
            const slot = m.steps.lead.photoSlots[key];
            const inputId = `kre-photo-${key}`;
            return (
              <div key={key} className="flex flex-col">
                <div className="mb-2.5 sm:min-h-[54px]">
                  <p className="text-[13px] font-bold text-heading">{slot.label}</p>
                  <p className="mt-0.5 text-[12.5px] leading-snug text-muted">
                    {slot.hint}
                  </p>
                </div>

                {photo ? (
                  <div className="relative aspect-[4/3] overflow-hidden border-[1.5px] border-primary bg-muted-bg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.preview}
                      alt={slot.label}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setSlotFile(key, null)}
                      className="absolute right-2 top-2 grid size-8 place-items-center bg-heading/80 text-white transition-colors hover:bg-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      aria-label={t(m.steps.lead.removePhoto, {
                        label: slot.label,
                      })}
                    >
                      <TrashIcon aria-hidden className="size-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      id={`${inputId}-camera`}
                      ref={(el) => {
                        cameraRefs.current[key] = el;
                      }}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      tabIndex={-1}
                      onChange={(e) =>
                        setSlotFile(key, e.target.files?.[0] ?? null)
                      }
                    />
                    <input
                      id={inputId}
                      ref={(el) => {
                        libraryRefs.current[key] = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      tabIndex={-1}
                      onChange={(e) =>
                        setSlotFile(key, e.target.files?.[0] ?? null)
                      }
                    />
                    <div
                      className={`flex aspect-[4/3] w-full flex-col items-center justify-center gap-2.5 border-[1.5px] border-dashed bg-muted-bg p-3 transition-colors duration-200 hover:border-primary ${
                        showMissingAsError ? "border-error" : "border-border-strong"
                      }`}
                    >
                      <CameraPlusIcon aria-hidden className="size-7 text-primary" />
                      {/* Bouton appareil photo réservé au tactile : sur un
                          ordinateur, `capture` est ignoré et les deux boutons
                          ouvriraient le même sélecteur de fichiers. */}
                      <button
                        type="button"
                        onClick={() => cameraRefs.current[key]?.click()}
                        aria-label={`${slot.label} — ${m.steps.lead.takePhoto}`}
                        className={`${buttonClass("primary", "sm")} hidden w-full pointer-coarse:flex`}
                      >
                        <CameraIcon aria-hidden className="size-4 shrink-0" />
                        {m.steps.lead.takePhoto}
                      </button>
                      <button
                        type="button"
                        data-photo-pick
                        onClick={() => libraryRefs.current[key]?.click()}
                        aria-label={`${slot.label} — ${m.steps.lead.addPhoto}`}
                        className={`${buttonClass("secondary", "sm")} w-full bg-surface`}
                      >
                        <ImageSquareIcon aria-hidden className="size-4 shrink-0" />
                        {/* « Galerie » n'a de sens que sur mobile. */}
                        <span className="pointer-coarse:hidden">
                          {m.steps.lead.chooseFile}
                        </span>
                        <span className="hidden pointer-coarse:inline">
                          {m.steps.lead.choosePhoto}
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[13px] text-subtle">{m.steps.lead.photosNote}</p>
        {missingPhotos > 0 ? (
          showMissingAsError ? (
            <FieldError>{missingMessage}</FieldError>
          ) : (
            <p className="text-[13px] font-semibold text-heading" role="status">
              {missingMessage}
            </p>
          )
        ) : null}
      </div>

      <SampleCta decorLabel={decor ? m.catalog.decor[decor] : undefined} />
    </div>
  );
}
