"use client";

import { CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BaseSyntheticEvent } from "react";
import type { FieldPath, UseFormSetError } from "react-hook-form";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import type { z } from "zod";

import {
  getWizardStepFieldErrors,
  LEAD_FIELDS,
  pickQuoteStepValues,
  quoteFormSchema,
  quoteStepSchemas,
  QUOTE_STEP_COUNT,
  validateWizardStep,
  type QuoteFormDraft,
} from "@/lib/quote-schema";

import { calculatePrice } from "@/lib/calculatePrice";
import { KreConfigProvider, usePendingPhotos, useKreConfig, type KreConfig } from "@/lib/config";
import { useT } from "@/lib/i18n/useT";
import { useWizardTracking } from "@/lib/useWizardTracking";

import { ConfiguratorLogo, ConfiguratorProgress } from "./ConfiguratorProgress";
import { StepNavigation } from "./StepNavigation";
import { StepStaircaseType } from "./steps/StepStaircaseType";
import { StepDecor } from "./steps/StepDecor";
import { StepRiser } from "./steps/StepRiser";
import { StepUniformDimensions } from "./steps/StepUniformDimensions";
import { StepEndCap } from "./steps/StepEndCap";
import { StepLead } from "./steps/StepLead";
import { StepStepCount } from "./steps/StepStepCount";
import { StepLanding } from "./steps/StepLanding";
import { StepInclus } from "./steps/StepInclus";

const STEP_CLEAR_PATHS: (keyof QuoteFormDraft)[][] = [
  ["staircaseType"],
  ["decor"],
  ["riserOption"],
  ["stepCount"],
  ["uniformStepDimensions", "widthBand", "depthBand", "exactDepthMm", "stepConfigs"],
  ["openSides", "stepEndCapConfigs", "landingStepConfirmed"],
  ["intermediateLanding", "landingFinish", "seuilColor"],
  [], // étape inclus — aucun champ à effacer
  ["firstName", "lastName", "email", "phone"],
];

function applyZodIssues(
  setError: UseFormSetError<QuoteFormDraft>,
  issues: z.ZodIssue[],
) {
  const seen = new Set<string>();
  for (const issue of issues) {
    const path = issue.path[0];
    // zod v4 poursuit les contrôles après un échec : seul le premier message
    // d'un champ est pertinent (« obligatoire » avant « invalide »).
    if (typeof path === "string" && !seen.has(path)) {
      seen.add(path);
      setError(path as FieldPath<QuoteFormDraft>, {
        type: "manual",
        message: String(issue.message),
      });
    }
  }
}

const defaultValues: QuoteFormDraft = {
  // Seul type d'escalier pris en charge pour l'instant (voir StepStaircaseType).
  staircaseType: "CLOSED",
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

/** Index de l'étape « Nombre de marches » (retour depuis la question du palier). */
const STEP_COUNT_STEP_INDEX = 3;

/** Nombre de photos exigées à l'étape Coordonnées avant l'envoi du dossier. */
const REQUIRED_PHOTO_COUNT = 3;

function WizardBody() {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  // Passe à `true` au premier envoi refusé : les manques (photos comprises)
  // sont alors signalés comme des erreurs, et plus seulement comme des consignes.
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const { watch, getValues, setError, clearErrors, handleSubmit, setFocus } =
    useFormContext<QuoteFormDraft>();
  const values = watch();
  const config = useKreConfig();
  const { showHeader } = config;
  const pendingPhotos = usePendingPhotos();
  const { m, t } = useT();
  const stepHeadingRef = useRef<HTMLDivElement>(null);
  const isFinished = submitState.status === "success";
  const tracking = useWizardTracking(currentStep, isFinished);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === QUOTE_STEP_COUNT - 1;
  // Résumé « demande incomplète » : affiché après un envoi refusé, et retiré
  // dès que tous les champs et les photos sont en règle — sans attendre un
  // nouvel envoi.
  const showIncompleteSummary =
    isLastStep &&
    submitAttempted &&
    (!quoteFormSchema.safeParse(values).success ||
      photoCount < REQUIRED_PHOTO_COUNT);
  const errorMessage =
    submitState.status === "error"
      ? submitState.message
      : showIncompleteSummary
        ? m.steps.lead.errorSummary
        : null;

  const canGoNext = useMemo(() => {
    // Dernière étape : le bouton d'envoi reste actif. Un bouton grisé ne dit
    // pas ce qui manque ; l'envoi, lui, signale chaque champ en cause et y
    // place le focus (recommandation Knewledge : annoncer les erreurs).
    if (isLastStep) return true;
    return validateWizardStep(currentStep, values);
  }, [currentStep, isLastStep, values]);

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
    // Le message d'échec d'envoi ne concerne que la dernière étape.
    if (submitState.status === "error") setSubmitState({ status: "idle" });
    // Les photos sont perdues en quittant l'étape : au retour, leurs
    // emplacements redeviennent des consignes, pas des erreurs.
    setSubmitAttempted(false);
    setCurrentStep((s) => s - 1);
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
    setCurrentStep((s) => Math.min(s + 1, QUOTE_STEP_COUNT - 1));
  };

  const onFinal = async (data: QuoteFormDraft, event?: BaseSyntheticEvent) => {
    setSubmitAttempted(true);
    // Un échec d'envoi précédent laisse la place au résumé des manques.
    setSubmitState({ status: "idle" });
    const res = quoteFormSchema.safeParse(data);
    // Sans les 3 photos, le dossier n'est pas envoyé. Le détail (« il manque
    // n photos ») s'affiche sous les emplacements ; le résumé reste générique
    // pour ne pas annoncer deux fois le même message.
    const photosMissing = pendingPhotos.get().length < REQUIRED_PHOTO_COUNT;
    if (!res.success) applyZodIssues(setError, res.error.issues);
    if (!res.success || photosMissing) {
      // Focus sur le premier manque dans l'ordre d'affichage — les photos,
      // puis les coordonnées : son message est lu par les lecteurs d'écran.
      if (photosMissing) {
        // La cible de l'événement d'envoi est le formulaire lui-même.
        (event?.target as HTMLFormElement | undefined)
          ?.querySelector<HTMLElement>("[data-photo-pick]")
          ?.focus();
      } else if (!res.success) {
        const invalid = new Set(res.error.issues.map((i) => i.path[0]));
        const first = LEAD_FIELDS.find((name) => invalid.has(name));
        if (first) setFocus(first);
      }
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
      <>
        {showHeader ? <ConfiguratorLogo /> : null}
        <div
          className="flex flex-col items-center gap-4 border border-border-subtle bg-surface px-6 py-14 text-center sm:px-11 sm:py-20"
          role="status"
          aria-live="polite"
        >
          <CheckCircleIcon aria-hidden className="size-14 text-primary" />
          <h2 className="text-[28px] font-light leading-tight tracking-tighter text-heading sm:text-[38px]">
            {m.success.titleStart}{" "}
            <span className="font-semibold text-primary">
              {m.success.titleEmphasis}
            </span>
          </h2>
          <p className="max-w-[52ch] text-[15.5px] leading-relaxed text-muted">
            {m.success.followUp}
          </p>
          <dl className="mt-2 space-y-1 text-sm text-muted">
            <div>
              <dt className="inline">{m.success.reference}</dt>{" "}
              <dd className="inline font-mono font-semibold text-heading">
                {submitState.leadId}
              </dd>
            </div>
            <div>
              <dt className="inline">{m.success.estimate}</dt>{" "}
              <dd className="inline">
                <span className="font-bold text-heading">
                  {submitState.estimatedMaterialsEuro.toLocaleString(config.locale)} €
                </span>{" "}
                {m.success.estimateNote}
              </dd>
            </div>
          </dl>
        </div>
      </>
    );
  }

  return (
    <>
      {showHeader ? <ConfiguratorLogo /> : null}

      <div className="border border-border-subtle bg-surface">
        <ConfiguratorProgress
          currentStep={currentStep}
          totalSteps={QUOTE_STEP_COUNT}
        />

        <form onSubmit={handleSubmit(onFinal)} noValidate>
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

          <div className="min-h-[280px] px-5 pb-9 pt-8 sm:px-9 lg:px-11">
            {currentStep === 0 ? <StepStaircaseType /> : null}
            {currentStep === 1 ? <StepDecor /> : null}
            {currentStep === 2 ? <StepRiser /> : null}
            {currentStep === 3 ? <StepStepCount /> : null}
            {currentStep === 4 ? <StepUniformDimensions /> : null}
            {currentStep === 5 ? (
              <StepEndCap
                onLandingConfirmed={goNext}
                onEditStepCount={() => setCurrentStep(STEP_COUNT_STEP_INDEX)}
              />
            ) : null}
            {currentStep === 6 ? <StepLanding /> : null}
            {currentStep === 7 ? <StepInclus /> : null}
            {currentStep === 8 ? (
              <StepLead
                requiredPhotoCount={REQUIRED_PHOTO_COUNT}
                showMissingAsError={submitAttempted}
                onPhotoCountChange={setPhotoCount}
              />
            ) : null}

            {errorMessage && (
              <p
                className="mt-7 flex items-start gap-2.5 border border-error/30 bg-error-tint px-4 py-3 text-sm font-semibold text-error"
                role="alert"
              >
                <WarningCircleIcon aria-hidden className="mt-px size-5 shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}
          </div>

          <StepNavigation
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            canGoNext={canGoNext && submitState.status !== "loading"}
            onPrev={goPrev}
            onNext={goNext}
            isSubmitting={submitState.status === "loading"}
          />
        </form>
      </div>
    </>
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

function ConfiguratorShell() {
  return <WizardBody />;
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
