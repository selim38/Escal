"use client";

import { Camera, Mail, Sparkles, Trash2, User } from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";

import { calculatePrice } from "@/lib/calculatePrice";
import { quotePricingPreviewSchema, type QuoteFormDraft } from "@/lib/quote-schema";
import { pendingPhotos } from "@/lib/pending-photos";

export function StepLead() {
  const { register, watch, formState } = useFormContext<QuoteFormDraft>();
  const values = watch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);

  // Synchronise le singleton à chaque changement
  useEffect(() => {
    pendingPhotos.files = photos.map((p) => p.file);
  }, [photos]);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files).slice(0, 10 - photos.length);
    const entries = next.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...entries]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const estimate = useMemo(() => {
    const parsed = quotePricingPreviewSchema.safeParse({
      riserOption: values.riserOption,
      stepCount: values.stepCount,
      widthBand: values.widthBand,
      depthBand: values.depthBand,
      stepConfigs: values.stepConfigs,
      openSides: values.openSides,
      intermediateLanding: values.intermediateLanding,
    });
    if (!parsed.success) return null;
    return calculatePrice(parsed.data);
  }, [
    values.depthBand,
    values.intermediateLanding,
    values.openSides,
    values.riserOption,
    values.stepConfigs,
    values.stepCount,
    values.widthBand,
  ]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="size-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-brand">
            Résultat & demande de devis
          </h2>
          <p className="text-sm text-muted">
            Voici une estimation matériaux. Laissez vos coordonnées pour être
            recontacté par un commercial.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/35 bg-gradient-to-br from-primary/12 to-surface p-6 shadow-sm">
        {estimate ? (
          <p className="text-center text-lg font-bold tracking-tight text-brand sm:text-xl md:text-2xl">
            Prix estimé des matériaux :{" "}
            <span className="text-primary">{estimate.materialsSubtotal} €</span>
          </p>
        ) : (
          <p className="text-center text-sm text-muted">
            Complétez les étapes précédentes pour afficher l’estimation.
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-brand">
          <User className="size-5 text-primary" aria-hidden />
          <h3 className="text-base font-semibold">Vos coordonnées</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="lastName" className="text-sm font-medium text-brand">
              Nom
            </label>
            <input
              id="lastName"
              autoComplete="family-name"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              {...register("lastName")}
            />
            {formState.errors.lastName?.message ? (
              <p className="text-sm text-red-600" role="alert">
                {formState.errors.lastName.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="firstName" className="text-sm font-medium text-brand">
              Prénom
            </label>
            <input
              id="firstName"
              autoComplete="given-name"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              {...register("firstName")}
            />
            {formState.errors.firstName?.message ? (
              <p className="text-sm text-red-600" role="alert">
                {formState.errors.firstName.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-brand">
            E-mail
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-3 text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              {...register("email")}
            />
          </div>
          {formState.errors.email?.message ? (
            <p className="text-sm text-red-600" role="alert">
              {formState.errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm font-medium text-brand">
            Téléphone
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
            {...register("phone")}
          />
          {formState.errors.phone?.message ? (
            <p className="text-sm text-red-600" role="alert">
              {formState.errors.phone.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="country" className="text-sm font-medium text-brand">
            Pays
          </label>
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
          {formState.errors.country?.message ? (
            <p className="text-sm text-red-600" role="alert">
              {formState.errors.country.message}
            </p>
          ) : null}
        </div>
      </div>

      {/* Section photos — en fin de formulaire */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-brand">
          <Camera className="size-5 text-primary" aria-hidden />
          <h3 className="text-base font-semibold">Photos de votre escalier</h3>
        </div>
        <p className="text-sm text-muted">
          Ajoutez des photos pour aider notre équipe à affiner le devis (facultatif).
        </p>

        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((p, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted-bg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.preview}
                  alt={`Photo ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/50 text-white opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100"
                  aria-label={`Supprimer photo ${i + 1}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length < 10 && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              className="sr-only"
              onChange={(e) => addFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface px-4 py-4 text-xs sm:text-sm text-muted transition hover:border-primary/40 hover:text-brand"
            >
              <Camera className="size-4" aria-hidden />
              {photos.length === 0 ? "Ajouter des photos" : "Ajouter d'autres photos"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
