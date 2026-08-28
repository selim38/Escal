"use client";

import { Clock, ShieldCheck, Zap } from "lucide-react";
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

import { calculatePrice } from "@/lib/calculatePrice";
import { KreConfigProvider, usePendingPhotos, useKreConfig, type KreConfig } from "@/lib/config";
import { useT } from "@/lib/i18n/useT";
import { useWizardTracking } from "@/lib/useWizardTracking";

import { Eyebrow } from "./ui/Typography";
import { ConfiguratorBar } from "./ConfiguratorBar";
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
  ["uniformStepDimensions", "widthBand", "depthBand", "stepConfigs"],
  ["openSides", "stepEndCapConfigs"],
  ["intermediateLanding", "landingFinish", "seuilColor"],
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
  const { showHeader } = config;
  const pendingPhotos = usePendingPhotos();
  const { m, t } = useT();
  const stepHeadingRef = useRef<HTMLDivElement>(null);
  const isFinished = submitState.status === "success";
  const tracking = useWizardTracking(currentStep, isFinished);

  const canGoNext = useMemo(() => {
    return validateWizardStep(currentStep, values);
  }, [currentStep, values]);

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
      <>
        <ConfiguratorBar
          currentStep={QUOTE_STEP_COUNT - 1}
          totalSteps={QUOTE_STEP_COUNT}
          showLogo={showHeader}
        />
        <div
          className="rounded-lg border border-border-subtle bg-surface p-6 py-10 text-center shadow-md space-y-4 sm:p-9"
          role="status"
          aria-live="polite"
        >
        <div className="flex justify-center">
          <span
            aria-hidden
            className="flex size-16 items-center justify-center rounded-full bg-success-tint text-4xl"
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
      </>
    );
  }

  return (
    <>
      <ConfiguratorBar
        currentStep={currentStep}
        totalSteps={QUOTE_STEP_COUNT}
        showLogo={showHeader}
      />

      <form
        onSubmit={handleSubmit(onFinal)}
        className="rounded-lg border border-border-subtle bg-surface p-6 shadow-md sm:p-9"
        noValidate
      >
        {showHeader && currentStep === 0 ? <ConfiguratorIntro /> : null}

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

      <div className="min-h-[280px]">
        {currentStep === 0 ? <StepStaircaseType /> : null}
        {currentStep === 1 ? <StepDecor /> : null}
        {currentStep === 2 ? <StepRiser /> : null}
        {currentStep === 3 ? <StepStepCount /> : null}
        {currentStep === 4 ? <StepUniformDimensions /> : null}
        {currentStep === 5 ? <StepEndCap /> : null}
        {currentStep === 6 ? <StepLanding /> : null}
        {currentStep === 7 ? <StepInclus /> : null}
        {currentStep === 8 ? <StepLead /> : null}
      </div>

      {submitState.status === "error" && (
        <p
          className="mt-4 rounded-lg bg-error-tint px-4 py-2.5 text-sm text-error"
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

/**
 * En-tête interne, rendu quand le composant n'est pas encadré par la page hôte.
 *
 * Le logo remplace l'ancienne accroche textuelle « Kit Rénovation Escalier » :
 * il porte déjà ce nom, le répéter serait une redondance à l'écran comme au
 * lecteur d'écran. Le nom de marque vit donc dans l'`alt`.
 */
/**
 * Bloc de présentation — affiché uniquement à la première étape.
 *
 * Titre, accroche et réassurance informent une fois, au moment où l'internaute
 * décide de se lancer. Les répéter aux neuf étapes suivantes n'apportait rien et
 * repoussait le bouton de validation sous la ligne de flottaison.
 */
function ConfiguratorIntro() {
  const { m } = useT();
  const icons = [Zap, ShieldCheck, Clock];

  return (
    <div className="mb-8 border-b border-border-subtle pb-8">
      <Eyebrow>{m.app.eyebrow}</Eyebrow>
      <h2 className="text-2xl font-black leading-tight tracking-tight text-heading sm:text-3xl">
        {m.app.title}
      </h2>
      <p className="mt-3 max-w-[54ch] text-base text-muted">{m.app.intro}</p>

      {/*
        Rangée de réassurance, reprise de la bande « Simplicité · Sur mesure ·
        Outils inclus » du site : icônes orange fines et libellés courts.
      */}
      <ul className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
        {m.app.reassurance.map((label, i) => {
          const Icon = icons[i] ?? Zap;
          return (
            <li
              key={label}
              className="flex items-center gap-2 text-[13px] font-semibold text-brand"
            >
              <Icon className="size-4 shrink-0 text-primary" aria-hidden />
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
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
