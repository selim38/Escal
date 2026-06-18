import { z } from "zod";

export const DECOR_VALUES = [
  "CHENE_NATUREL",
  "CHENE_VINTAGE",
  "CHENE_VINTAGE_GRIS",
  "CHENE_CERUSE",
  "NOYER",
  "NOYER_BLANC",
  "HETRE",
  "PIN_RUSTIQUE",
  "GRIS_MINERAL",
  "PIERRE_ANTHRACITE",
  "PIERRE_BETON_GRIS",
] as const;
export type Decor = (typeof DECOR_VALUES)[number];

export const RISER_OPTION_VALUES = [
  "NONE",
  "DECOR",
  "BLACK_MATTE",
  "WHITE_MATTE",
] as const;
export type RiserOption = (typeof RISER_OPTION_VALUES)[number];

export const WIDTH_BAND_VALUES = [
  "W_LT_800",
  "W_801_1000",
  "W_1001_1300",
  "W_1301_1600",
  "W_1601_1800",
] as const;
export type WidthBand = (typeof WIDTH_BAND_VALUES)[number];

export const DEPTH_BAND_VALUES = ["D_LT_320", "D_GT_320"] as const;
export type DepthBand = (typeof DEPTH_BAND_VALUES)[number];

export const STEP_END_CAP_VALUES = ["NONE", "OPEN_STEP", "OVERHANGING"] as const;
export type StepEndCap = (typeof STEP_END_CAP_VALUES)[number];

export const END_SIDE_VALUES = ["LEFT", "RIGHT"] as const;
export type EndSide = (typeof END_SIDE_VALUES)[number];

export const LANDING_FINISH_VALUES = [
  "NONE",
  "NEZ_SEUIL",
  "NEZ_RACCORD_PARQUET",
] as const;
export type LandingFinish = (typeof LANDING_FINISH_VALUES)[number];

export const STAIR_LAYOUT_VALUES = ["STRAIGHT", "BALANCED", "FIVE_SIDED"] as const;
export type StairLayout = (typeof STAIR_LAYOUT_VALUES)[number];

export const stepConfigSchema = z.object({
  layout: z.enum(STAIR_LAYOUT_VALUES, {
    error: () => ({ message: "Choisissez un type de marche." }),
  }),
  widthBand: z.enum(WIDTH_BAND_VALUES, {
    error: () => ({ message: "Sélectionnez une largeur." }),
  }),
  depthBand: z.enum(DEPTH_BAND_VALUES, {
    error: () => ({ message: "Sélectionnez une profondeur." }),
  }),
  openSide: z.boolean().optional(),
});

export type StepConfig = z.infer<typeof stepConfigSchema>;
export type StepConfigDraft = Partial<StepConfig>;

export const stepConfigsSchema = z.array(stepConfigSchema);

export function validateStepConfigs(
  configs: StepConfigDraft[] | undefined,
  stepCount: number,
): configs is StepConfig[] {
  if (!configs || configs.length !== stepCount) return false;
  return configs.every((c) => stepConfigSchema.safeParse(c).success);
}

export const stepDimensionsBandsSchema = z.object({
  widthBand: z.enum(WIDTH_BAND_VALUES, {
    error: () => ({ message: "Sélectionnez une largeur." }),
  }),
  depthBand: z.enum(DEPTH_BAND_VALUES, {
    error: () => ({ message: "Sélectionnez une profondeur." }),
  }),
});

export const quoteFormBaseSchema = z.object({
  decor: z.enum(DECOR_VALUES, {
    error: () => ({ message: "Sélectionnez un décor." }),
  }),
  riserOption: z.enum(RISER_OPTION_VALUES, {
    error: () => ({ message: "Choisissez une finition de contremarche." }),
  }),
  stepCount: z
    .number({
      error: () => ({ message: "Indiquez le nombre de marches." }),
    })
    .int("Nombre entier requis.")
    .min(1, "Minimum 1 marche.")
    .max(30, "Maximum 30 marches."),
  uniformStepDimensions: z.boolean({
    error: () => ({
      message: "Indiquez si toutes les marches ont les mêmes dimensions.",
    }),
  }),
  stepConfigs: z.array(stepConfigSchema.partial()).optional(),
  widthBand: z.enum(WIDTH_BAND_VALUES).optional(),
  depthBand: z.enum(DEPTH_BAND_VALUES).optional(),
  openSides: z.boolean(),
  intermediateLanding: z.boolean(),
  landingFinish: z.enum(LANDING_FINISH_VALUES, {
    error: () => ({ message: "Choisissez un type de marche palière." }),
  }),
  landingAreaM2: z.number().positive().optional(),
  wantPlinthes: z.boolean().optional(),
  plinthesML: z.number().positive().optional(),
  stepEndCap: z.enum(STEP_END_CAP_VALUES, {
    error: () => ({ message: "Choisissez un type d’embout de marche." }),
  }),
  openStepEndSide: z.enum(END_SIDE_VALUES).optional(),
  lateralEndSide: z.enum(END_SIDE_VALUES).optional(),
  firstName: z.string().min(1, "Le prénom est obligatoire."),
  lastName: z.string().min(1, "Le nom est obligatoire."),
  email: z.email({ error: () => ({ message: "E-mail invalide." }) }),
  phone: z.string().min(1, "Le téléphone est obligatoire."),
  country: z.string().min(1, "Le pays est obligatoire."),
});

function refineDimensionsBranch(
  data: z.infer<typeof quoteFormBaseSchema>,
  ctx: z.RefinementCtx,
) {
  if (data.uniformStepDimensions) {
    if (!data.widthBand) {
      ctx.addIssue({
        code: "custom",
        path: ["widthBand"],
        message: "Sélectionnez une largeur.",
      });
    }
    if (!data.depthBand) {
      ctx.addIssue({
        code: "custom",
        path: ["depthBand"],
        message: "Sélectionnez une profondeur.",
      });
    }
  } else if (!validateStepConfigs(data.stepConfigs, data.stepCount)) {
    ctx.addIssue({
      code: "custom",
      path: ["stepConfigs"],
      message: "Configurez le type et les dimensions de chaque marche.",
    });
  }
}

export const quoteFormSchema = quoteFormBaseSchema.superRefine(
  refineDimensionsBranch,
);

export type QuoteFormValues = z.infer<typeof quoteFormBaseSchema>;

/** Valeurs du formulaire pendant le tunnel (champs non encore renseignés). */
export type QuoteFormDraft = Partial<
  Pick<
    QuoteFormValues,
    | "decor"
    | "riserOption"
    | "stepCount"
    | "uniformStepDimensions"
    | "stepConfigs"
    | "widthBand"
    | "depthBand"
  >
> &
  Pick<
    QuoteFormValues,
    | "openSides"
    | "intermediateLanding"
    | "landingFinish"
    | "stepEndCap"
    | "openStepEndSide"
    | "lateralEndSide"
    | "firstName"
    | "lastName"
    | "email"
    | "phone"
    | "country"
  > & {
    landingAreaM2?: number;
    wantPlinthes?: boolean;
    plinthesML?: number;
  };

/** Champs utilisés par `calculatePrice` (hors lead / décor). */
export type QuotePricingInput = Pick<
  QuoteFormValues,
  "riserOption" | "stepCount" | "openSides" | "intermediateLanding"
> & {
  widthBand?: QuoteFormValues["widthBand"];
  depthBand?: QuoteFormValues["depthBand"];
  stepConfigs?: QuoteFormValues["stepConfigs"];
};

/** Schémas Zod pour chaque étape du tunnel (0 → 6). */
export const quoteStepSchemas = [
  quoteFormBaseSchema.pick({ decor: true }),
  quoteFormBaseSchema.pick({ riserOption: true }),
  quoteFormBaseSchema.pick({ stepCount: true }),
  quoteFormBaseSchema.pick({ uniformStepDimensions: true }),
  quoteFormBaseSchema.pick({
    stepEndCap: true,
    openStepEndSide: true,
    lateralEndSide: true,
  }),
  quoteFormBaseSchema.pick({
    intermediateLanding: true,
    landingFinish: true,
  }),
  // Étape parquet — tous les champs sont optionnels, toujours valide
  quoteFormBaseSchema.pick({ intermediateLanding: true }).partial(),
  // Étape inclus — purement informative, toujours valide
  quoteFormBaseSchema.pick({ intermediateLanding: true }).partial(),
  quoteFormBaseSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    country: true,
  }),
] as const;

export const QUOTE_STEP_COUNT = quoteStepSchemas.length;

/** Sous-ensemble validé pour afficher l’estimation avant la capture lead. */
export const quotePricingPreviewSchema = quoteFormBaseSchema.pick({
  riserOption: true,
  stepCount: true,
  widthBand: true,
  depthBand: true,
  stepConfigs: true,
  openSides: true,
  intermediateLanding: true,
});

export function pickQuoteStepValues(
  step: number,
  values: QuoteFormDraft,
): unknown {
  switch (step) {
    case 0:
      return { decor: values.decor };
    case 1:
      return { riserOption: values.riserOption };
    case 2:
      return { stepCount: values.stepCount };
    case 3:
      return { uniformStepDimensions: values.uniformStepDimensions };
    case 4:
      return {
        stepEndCap: values.stepEndCap,
        openStepEndSide: values.openStepEndSide,
        lateralEndSide: values.lateralEndSide,
      };
    case 5:
      return {
        intermediateLanding: values.intermediateLanding,
        landingFinish: values.landingFinish,
      };
    case 6:
      return {}; // étape parquet — optionnelle
    case 7:
      return {}; // étape inclus — informative
    case 8:
      return {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        country: values.country,
      };
    default:
      return {};
  }
}

function validateDimensionsStep(values: QuoteFormDraft): boolean {
  const uniformOk = quoteFormBaseSchema
    .pick({ uniformStepDimensions: true })
    .safeParse({ uniformStepDimensions: values.uniformStepDimensions }).success;
  if (!uniformOk) return false;

  if (values.uniformStepDimensions === true) {
    return stepDimensionsBandsSchema.safeParse({
      widthBand: values.widthBand,
      depthBand: values.depthBand,
    }).success;
  }
  if (values.uniformStepDimensions === false) {
    return validateStepConfigs(values.stepConfigs, values.stepCount ?? 0);
  }
  return false;
}

function validateStepEndCapStep(values: QuoteFormDraft): boolean {
  if (!values.stepEndCap) return false;
  if (values.stepEndCap === "OPEN_STEP") {
    return Boolean(values.openStepEndSide && values.lateralEndSide);
  }
  return true;
}

export function validateWizardStep(step: number, values: QuoteFormDraft): boolean {
  if (step === 3) {
    return validateDimensionsStep(values);
  }
  if (step === 4) {
    return validateStepEndCapStep(values);
  }

  if (step === 6) return true; // étape parquet — toujours valide
  if (step === 7) return true; // étape inclus — toujours valide

  const schema = quoteStepSchemas[step];
  if (!schema) return false;
  return schema.safeParse(pickQuoteStepValues(step, values)).success;
}

export function getWizardStepFieldErrors(
  step: number,
  values: QuoteFormDraft,
): Partial<Record<keyof QuoteFormDraft, string>> {
  if (step === 3) {
    const errors: Partial<Record<keyof QuoteFormDraft, string>> = {};

    const uniformRes = quoteFormBaseSchema
      .pick({ uniformStepDimensions: true })
      .safeParse({ uniformStepDimensions: values.uniformStepDimensions });
    if (!uniformRes.success) {
      errors.uniformStepDimensions =
        uniformRes.error.issues[0]?.message ?? "Réponse requise.";
      return errors;
    }

    if (values.uniformStepDimensions === true) {
      const res = stepDimensionsBandsSchema.safeParse({
        widthBand: values.widthBand,
        depthBand: values.depthBand,
      });
      if (res.success) return {};
      return Object.fromEntries(
        res.error.issues
          .filter((i) => typeof i.path[0] === "string")
          .map((i) => [i.path[0], i.message]),
      ) as Partial<Record<keyof QuoteFormDraft, string>>;
    }

    if (validateStepConfigs(values.stepConfigs, values.stepCount ?? 0)) {
      return {};
    }
    return {
      stepConfigs:
        "Configurez le type et les dimensions de chaque marche.",
    };
  }

  if (step === 4) {
    const errors: Partial<Record<keyof QuoteFormDraft, string>> = {};
    if (!values.stepEndCap) {
      errors.stepEndCap = "Choisissez un type d’embout de marche.";
    }
    if (values.stepEndCap === "OPEN_STEP") {
      if (!values.openStepEndSide) {
        errors.openStepEndSide = "Indiquez le côté sur la 1ʳᵉ marche.";
      }
      if (!values.lateralEndSide) {
        errors.lateralEndSide = "Indiquez le côté pour l’embout latéral.";
      }
    }
    return errors;
  }

  const schema = quoteStepSchemas[step];
  if (!schema) return {};
  const res = schema.safeParse(pickQuoteStepValues(step, values));
  if (res.success) return {};
  return Object.fromEntries(
    res.error.issues
      .filter((i) => typeof i.path[0] === "string")
      .map((i) => [i.path[0], i.message]),
  ) as Partial<Record<keyof QuoteFormDraft, string>>;
}
