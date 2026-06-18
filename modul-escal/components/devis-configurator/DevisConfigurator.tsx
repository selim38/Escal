"use client";

import { useMemo, useState } from "react";
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
import { pendingPhotos } from "@/lib/pending-photos";

// Backend PHP. En prod : même domaine → "/api". En dev : NEXT_PUBLIC_API_BASE.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "/api";
import { ProgressBar } from "./ProgressBar";
import { StepNavigation } from "./StepNavigation";
import { StepDecor } from "./steps/StepDecor";
import { StepRiser } from "./steps/StepRiser";
import { StepUniformDimensions } from "./steps/StepUniformDimensions";
import { StepEndCap } from "./steps/StepEndCap";
import { StepLead } from "./steps/StepLead";
import { StepOptions } from "./steps/StepOptions";
import { StepStepCount } from "./steps/StepStepCount";
import { StepLanding } from "./steps/StepLanding";
import { StepParquet } from "./steps/StepParquet";
import { StepInclus } from "./steps/StepInclus";

// Index de l'étape parquet (conditionnelle)
const STEP_PARQUET = 6;

const STEP_CLEAR_PATHS: (keyof QuoteFormDraft)[][] = [
  ["decor"],
  ["riserOption"],
  ["stepCount"],
  ["uniformStepDimensions", "widthBand", "depthBand", "stepConfigs"],
  ["openSides", "stepEndCap", "openStepEndSide", "lateralEndSide"],
  ["intermediateLanding", "landingFinish"],
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
  landingFinish: "NONE",
  stepEndCap: "NONE",
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

  const canGoNext = useMemo(() => {
    return validateWizardStep(currentStep, values);
  }, [currentStep, values]);

  const isParquetStep = (v: QuoteFormDraft) => v.landingFinish === "NEZ_RACCORD_PARQUET";

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === QUOTE_STEP_COUNT - 1;

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

    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      await new Promise(r => setTimeout(r, 800));
      setSubmitState({ status: "success", leadId: "DEMO-001", estimatedMaterialsEuro: 0 });
      return;
    }

    try {
      // Le prix est calculé côté client (export statique = pas de serveur Node),
      // puis transmis au backend PHP qui enregistre le lead.
      const price = calculatePrice(res.data);
      const response = await fetch(`${API_BASE}/leads.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...res.data,
          estimatedMaterialsEuro: price.materialsSubtotal,
          priceBreakdown: price.breakdown,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Erreur serveur");

      // Upload des photos si présentes
      if (pendingPhotos.files.length > 0) {
        const fd = new FormData();
        fd.append("leadId", json.leadId);
        for (const file of pendingPhotos.files) fd.append("photos", file);
        await fetch(`${API_BASE}/photos.php`, { method: "POST", body: fd }).catch(() => null);
        pendingPhotos.files = [];
      }

      setSubmitState({
        status: "success",
        leadId: json.leadId,
        estimatedMaterialsEuro: json.estimatedMaterialsEuro,
      });
    } catch (err) {
      setSubmitState({
        status: "error",
        message: err instanceof Error ? err.message : "Erreur inconnue",
      });
    }
  };

  if (submitState.status === "success") {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 shadow-lg shadow-brand/10 text-center space-y-4">
        <div className="flex justify-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-green-100 text-4xl">✅</span>
        </div>
        <h2 className="text-xl font-semibold text-brand">Demande envoyée !</h2>
        <p className="text-sm text-muted">
          Votre référence :{" "}
          <span className="font-mono font-semibold text-foreground">{submitState.leadId}</span>
        </p>
        <p className="text-sm text-muted">
          Estimation matériaux :{" "}
          <strong className="text-foreground">{submitState.estimatedMaterialsEuro} €</strong>
        </p>
        <p className="text-sm text-muted">
          Notre équipe vous contactera sous 24&nbsp;h pour finaliser votre devis.
        </p>
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

      <div className="mt-8 min-h-[280px]">
        {currentStep === 0 ? <StepDecor /> : null}
        {currentStep === 1 ? <StepRiser /> : null}
        {currentStep === 2 ? <StepStepCount /> : null}
        {currentStep === 3 ? <StepUniformDimensions /> : null}
        {currentStep === 4 ? (
          <div className="space-y-8">
            <StepOptions />
            <hr className="border-[#ece8e4]" />
            <StepEndCap />
          </div>
        ) : null}
        {currentStep === 5 ? <StepLanding /> : null}
        {currentStep === 6 ? <StepParquet /> : null}
        {currentStep === 7 ? <StepInclus /> : null}
        {currentStep === 8 ? <StepLead /> : null}
      </div>

      {submitState.status === "error" && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
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

export function DevisConfigurator() {
  const methods = useForm<QuoteFormDraft>({
    defaultValues,
    mode: "onChange",
  });

  return (
    <FormProvider {...methods}>
      <WizardBody />
    </FormProvider>
  );
}
