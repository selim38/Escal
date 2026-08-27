"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FieldPath, UseFormSetError } from "react-hook-form";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import type { z } from "zod";

import {
  getWizardStepFieldErrors,
  pickQuoteStepValues,
  quoteFormSchema,
  quoteStepSchemas,
  QUOTE_STEP_COUNT,
  validateWizardStep,
  type QuoteFormDraft,
} from "@/lib/quote-schema";

import { useAsset } from "@/lib/asset";
import { calculatePrice } from "@/lib/calculatePrice";
import { KreConfigProvider, usePendingPhotos, useKreConfig, type KreConfig } from "@/lib/config";
import { useT } from "@/lib/i18n/useT";
import { useWizardTracking } from "@/lib/useWizardTracking";

import { ProgressBar } from "./ProgressBar";
import { StepNavigation } from "./StepNavigation";
import { StepStaircaseType } from "./steps/StepStaircaseType";
import { StepDecor } from "./steps/StepDecor";
import { StepRiser } from "./steps/StepRiser";
import { StepUniformDimensions } from "./steps/StepUniformDimensions";
import { StepEndCap } from "./steps/StepEndCap";
import { StepLead } from "./steps/StepLead";
import { StepStepCount } from "./steps/StepStepCount";
import { StepLanding } from "./steps/StepLanding";
import { StepParquet } from "./steps/StepParquet";
import { StepInclus } from "./steps/StepInclus";

// Index de l'étape parquet (conditionnelle)
const STEP_PARQUET = 7;

const STEP_CLEAR_PATHS: (keyof QuoteFormDraft)[][] = [
  ["staircaseType"],
  ["decor"],
  ["riserOption"],
  ["stepCount"],
  ["uniformStepDimensions", "widthBand", "depthBand", "stepConfigs"],
  ["openSides", "stepEndCapConfigs"],
  ["intermediateLanding", "landingFinish", "seuilColor"],
  ["landingAreaM2", "wantPlinthes", "plinthesML"],
  [], // étape inclus — aucun champ à effacer
  ["firstName", "lastName", "email", "phone"],
];

function applyZodIssues(
  setError: UseFormSetError<QuoteFormDraft>,
  issues: z.ZodIssue[],
) {
  for (const issue of issues) {
    const path = issue.path[0];
    if (typeof path === "string") {
      setError(path as FieldPath<QuoteFormDraft>, {
        type: "manual",
        message: String(issue.message),
      });
    }
  }
}

const defaultValues: QuoteFormDraft = {
  openSides: false,
  intermediateLanding: false,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "",
};

type SubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; leadId: string; estimatedMaterialsEuro: number }
  | { status: "error"; message: string };

function WizardBody() {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const { watch, getValues, setError, clearErrors, handleSubmit } =
    useFormContext<QuoteFormDraft>();
  const values = watch();
  const config = useKreConfig();
  const pendingPhotos = usePendingPhotos();
  const { m, t } = useT();
  const stepHeadingRef = useRef<HTMLDivElement>(null);
  const isFinished = submitState.status === "success";
  const tracking = useWizardTracking(currentStep, isFinished);

  const canGoNext = useMemo(() => {
    return validateWizardStep(currentStep, values);
  }, [currentStep, values]);

  const isParquetStep = (v: QuoteFormDraft) => v.landingFinish === "NEZ_RACCORD_PARQUET";

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === QUOTE_STEP_COUNT - 1;

  // Déplace le focus en tête d'étape à chaque transition (navigation clavier
  // et annonce lecteur d'écran) — sauf au premier rendu, pour ne pas voler le
  // focus à la page WordPress hôte.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    stepHeadingRef.current?.focus();
  }, [currentStep]);

  const goPrev = () => {
    if (currentStep === 0) return;
    // Si on revient depuis inclus (step 7) et que parquet non choisi, sauter step 6
    const v = getValues();
    if (currentStep === STEP_PARQUET + 1 && !isParquetStep(v)) {
      setCurrentStep(STEP_PARQUET - 1);
    } else {
      setCurrentStep((s) => s - 1);
    }
  };

  const goNext = () => {
    const stepValues = getValues();

    for (const name of STEP_CLEAR_PATHS[currentStep]) {
      clearErrors(name);
    }

    if (!validateWizardStep(currentStep, stepValues)) {
      const fieldErrors = getWizardStepFieldErrors(currentStep, stepValues);
      for (const [name, message] of Object.entries(fieldErrors)) {
        setError(name as FieldPath<QuoteFormDraft>, {
          type: "manual",
          message,
        });
      }
      const res = quoteStepSchemas[currentStep]?.safeParse(
        pickQuoteStepValues(currentStep, stepValues),
      );
      if (res && !res.success) {
        applyZodIssues(setError, res.error.issues);
      }
      return;
    }

    tracking.trackStepComplete(currentStep);

    // Depuis l'étape palier (5) : sauter l'étape parquet si non pertinente
    if (currentStep === STEP_PARQUET - 1 && !isParquetStep(stepValues)) {
      setCurrentStep(STEP_PARQUET + 1);
    } else {
      setCurrentStep((s) => Math.min(s + 1, QUOTE_STEP_COUNT - 1));
    }
  };

  const onFinal = async (data: QuoteFormDraft) => {
    const res = quoteFormSchema.safeParse(data);
    if (!res.success) {
      applyZodIssues(setError, res.error.issues);
      return;
    }
    setSubmitState({ status: "loading" });

    const price = calculatePrice(res.data);

    const succeed = (leadId: string, estimatedMaterialsEuro: number) => {
      tracking.trackSubmit({
        estimated_price: estimatedMaterialsEuro,
        step_count: res.data.stepCount,
        lead_id: leadId,
      });
      setSubmitState({ status: "success", leadId, estimatedMaterialsEuro });
      redirectToConfirmation(config, leadId, estimatedMaterialsEuro);
    };

    if (config.demo) {
      await new Promise((r) => setTimeout(r, 800));
      succeed("DEMO-001", price.materialsSubtotal);
      return;
    }

    try {
      // Le prix est calculé côté client (export statique = pas de serveur Node),
      // puis transmis au backend PHP qui enregistre le lead.
      const response = await fetch(`${config.endpoint}/leads.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...res.data,
          estimatedMaterialsEuro: price.materialsSubtotal,
          priceBreakdown: price.breakdown,
          ...(config.recipientEmail ? { recipientEmail: config.recipientEmail } : {}),
          ...(Object.keys(tracking.context).length > 0
            ? { tracking: tracking.context }
            : {}),
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? m.common.serverError);

      // Upload des photos si présentes
      const photos = pendingPhotos.get();
      if (photos.length > 0) {
        const fd = new FormData();
        fd.append("leadId", json.leadId);
        for (const file of photos) fd.append("photos", file);
        await fetch(`${config.endpoint}/photos.php`, {
          method: "POST",
          body: fd,
        }).catch(() => null);
        pendingPhotos.clear();
      }

      succeed(json.leadId, json.estimatedMaterialsEuro);
    } catch (err) {
      setSubmitState({
        status: "error",
        message: err instanceof Error ? err.message : m.common.unknownError,
      });
    }
  };

  if (submitState.status === "success") {
    return (
      <div
        className="rounded-2xl border border-border bg-surface p-8 text-center shadow-lg shadow-brand/10 space-y-4"
        role="status"
        aria-live="polite"
      >
        <div className="flex justify-center">
          <span
            aria-hidden
            className="flex size-16 items-center justify-center rounded-full bg-green-100 text-4xl"
          >
            ✅
          </span>
        </div>
        <h2 className="text-xl font-semibold text-brand">{m.success.title}</h2>
        <p className="text-sm text-muted">
          {m.success.reference}{" "}
          <span className="font-mono font-semibold text-foreground">
            {submitState.leadId}
          </span>
        </p>
        <p className="text-sm text-muted">
          {m.success.estimate}{" "}
          <strong className="text-foreground">
            {submitState.estimatedMaterialsEuro} €
          </strong>
        </p>
        <p className="text-sm text-muted">{m.success.followUp}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onFinal)}
      className="rounded-2xl border border-border bg-surface p-6 shadow-lg shadow-brand/10 sm:p-8"
      noValidate
    >
      <ProgressBar currentStep={currentStep} totalSteps={QUOTE_STEP_COUNT} />

      {/* Annonce le changement d'étape et reçoit le focus à chaque transition. */}
      <div
        ref={stepHeadingRef}
        tabIndex={-1}
        aria-live="polite"
        className="sr-only"
      >
        {t(m.progress.announce, {
          current: currentStep + 1,
          total: QUOTE_STEP_COUNT,
          name: m.progress.stepLabels[currentStep] ?? "",
        })}
      </div>

      <div className="mt-8 min-h-[280px]">
        {currentStep === 0 ? <StepStaircaseType /> : null}
        {currentStep === 1 ? <StepDecor /> : null}
        {currentStep === 2 ? <StepRiser /> : null}
        {currentStep === 3 ? <StepStepCount /> : null}
        {currentStep === 4 ? <StepUniformDimensions /> : null}
        {currentStep === 5 ? <StepEndCap /> : null}
        {currentStep === 6 ? <StepLanding /> : null}
        {currentStep === 7 ? <StepParquet /> : null}
        {currentStep === 8 ? <StepInclus /> : null}
        {currentStep === 9 ? <StepLead /> : null}
      </div>

      {submitState.status === "error" && (
        <p
          className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700"
          role="alert"
        >
          {submitState.message}
        </p>
      )}

      <StepNavigation
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        canGoNext={canGoNext && submitState.status !== "loading"}
        onPrev={goPrev}
        onNext={goNext}
        isSubmitting={submitState.status === "loading"}
      />
    </form>
  );
}

/**
 * Redirection après soumission (attribut `confirmation-url`).
 * Différée pour laisser GTM émettre `devis_submit` avant la navigation.
 */
function redirectToConfirmation(
  config: KreConfig,
  leadId: string,
  estimatedMaterialsEuro: number,
) {
  if (!config.confirmationUrl || typeof window === "undefined") return;
  try {
    const url = new URL(config.confirmationUrl, window.location.href);
    url.searchParams.set("lead", leadId);
    url.searchParams.set("estimate", String(estimatedMaterialsEuro));
    window.setTimeout(() => window.location.assign(url.toString()), 400);
  } catch {
    console.warn("[kre-configurateur] confirmation-url invalide, redirection annulée.");
  }
}

/**
 * En-tête interne, rendu quand le composant n'est pas encadré par la page hôte.
 *
 * Le logo remplace l'ancienne accroche textuelle « Kit Rénovation Escalier » :
 * il porte déjà ce nom, le répéter serait une redondance à l'écran comme au
 * lecteur d'écran. Le nom de marque vit donc dans l'`alt`.
 */
function ConfiguratorHeader() {
  const { m } = useT();
  const asset = useAsset();
  return (
    <header className="mb-8 flex flex-col gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset("/brand/logo-kre.webp")}
        alt={m.app.logoAlt}
        width={480}
        height={140}
        /* Hauteur fixe, largeur automatique : le ratio du logo (3,43) est
           conservé quelle que soit la largeur du conteneur hôte. */
        className="h-10 w-auto self-start sm:h-12"
      />
      <h2 className="text-2xl font-bold tracking-tight text-brand sm:text-3xl">
        {m.app.title}
      </h2>
      <p className="text-sm text-muted sm:text-base">{m.app.intro}</p>
    </header>
  );
}

function ConfiguratorShell() {
  const { showHeader } = useKreConfig();
  return (
    <>
      {showHeader ? <ConfiguratorHeader /> : null}
      <WizardBody />
    </>
  );
}

export function DevisConfigurator({
  config = {},
}: {
  /** Surcharges de configuration (attributs du Web Component, ou props en Next). */
  config?: Partial<KreConfig>;
} = {}) {
  const methods = useForm<QuoteFormDraft>({
    defaultValues,
    mode: "onChange",
  });

  return (
    <KreConfigProvider config={config}>
      <FormProvider {...methods}>
        <ConfiguratorShell />
      </FormProvider>
    </KreConfigProvider>
  );
}
