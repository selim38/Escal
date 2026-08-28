import { z } from "zod";

import { vKey } from "@/lib/i18n/validation";

/**
 * Clés de messages de validation.
 *
 * Les schémas sont construits une seule fois au niveau module : ils ne peuvent
 * pas connaître la locale de l'instance. Ils émettent donc des clés, traduites
 * à l'affichage par `resolveMessage()` / `useFieldError()`.
 */
const V = {
  chooseStepLayout: vKey("chooseStepLayout"),
  selectWidth: vKey("selectWidth"),
  selectDepth: vKey("selectDepth"),
  staircaseTypeRequired: vKey("staircaseTypeRequired"),
  decorRequired: vKey("decorRequired"),
  riserOptionRequired: vKey("riserOptionRequired"),
  riserHeightRequired: vKey("riserHeightRequired"),
  integerRequired: vKey("integerRequired"),
  riserHeightMin: vKey("riserHeightMin"),
  riserHeightMax: vKey("riserHeightMax"),
  stepCountRequired: vKey("stepCountRequired"),
  stepCountMin: vKey("stepCountMin"),
  stepCountMax: vKey("stepCountMax"),
  uniformRequired: vKey("uniformRequired"),
  landingFinishRequired: vKey("landingFinishRequired"),
  seuilColorRequired: vKey("seuilColorRequired"),
  endCapRequired: vKey("endCapRequired"),
  endCapConfigsIncomplete: vKey("endCapConfigsIncomplete"),
  stepConfigsIncomplete: vKey("stepConfigsIncomplete"),
  firstNameRequired: vKey("firstNameRequired"),
  lastNameRequired: vKey("lastNameRequired"),
  emailInvalid: vKey("emailInvalid"),
  phoneRequired: vKey("phoneRequired"),
  countryRequired: vKey("countryRequired"),
  answerRequired: vKey("answerRequired"),
};

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

export const stepEndCapConfigSchema = z.object({
  between2Walls: z.boolean(),
  /**
   * Marche encadrée par deux limons : côtés déjà habillés, donc aucun embout,
   * exactement comme entre 2 murs. Un drapeau plutôt qu'une valeur d'embout
   * supplémentaire — l'énumération `step_end_cap` est aussi celle de la base.
   */
  between2Stringers: z.boolean().optional(),
  cap: z.enum(STEP_END_CAP_VALUES),
  side: z.enum(END_SIDE_VALUES).optional(),
});
export type StepEndCapConfig = z.infer<typeof stepEndCapConfigSchema>;

export const LANDING_FINISH_VALUES = [
  "NONE",
  "NEZ_SEUIL",
  "NEZ_RACCORD_PARQUET",
] as const;
export type LandingFinish = (typeof LANDING_FINISH_VALUES)[number];

export const SEUIL_COLOR_VALUES = ["OR", "NOIR", "ALUMINIUM"] as const;
export type SeuilColor = (typeof SEUIL_COLOR_VALUES)[number];

export const STAIR_LAYOUT_VALUES = ["STRAIGHT", "BALANCED", "FIVE_SIDED"] as const;
export type StairLayout = (typeof STAIR_LAYOUT_VALUES)[number];

export const STAIRCASE_TYPE_VALUES = ["OPEN", "CLOSED"] as const;
export type StaircaseType = (typeof STAIRCASE_TYPE_VALUES)[number];

export const stepConfigSchema = z.object({
  layout: z.enum(STAIR_LAYOUT_VALUES, {
    error: () => ({ message: V.chooseStepLayout }),
  }),
  widthBand: z.enum(WIDTH_BAND_VALUES, {
    error: () => ({ message: V.selectWidth }),
  }),
  depthBand: z.enum(DEPTH_BAND_VALUES, {
    error: () => ({ message: V.selectDepth }),
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
    error: () => ({ message: V.selectWidth }),
  }),
  depthBand: z.enum(DEPTH_BAND_VALUES, {
    error: () => ({ message: V.selectDepth }),
  }),
});

export const quoteFormBaseSchema = z.object({
  staircaseType: z.enum(STAIRCASE_TYPE_VALUES, {
    error: () => ({ message: V.staircaseTypeRequired }),
  }),
  decor: z.enum(DECOR_VALUES, {
    error: () => ({ message: V.decorRequired }),
  }),
  riserOption: z.enum(RISER_OPTION_VALUES, {
    error: () => ({ message: V.riserOptionRequired }),
  }),
  riserHeightMm: z
    .number({
      error: () => ({ message: V.riserHeightRequired }),
    })
    .int(V.integerRequired)
    .min(100, V.riserHeightMin)
    .max(300, V.riserHeightMax)
    .optional(),
  stepCount: z
    .number({
      error: () => ({ message: V.stepCountRequired }),
    })
    .int(V.integerRequired)
    .min(1, V.stepCountMin)
    .max(30, V.stepCountMax),
  uniformStepDimensions: z.boolean({
    error: () => ({
      message: V.uniformRequired,
    }),
  }),
  stepConfigs: z.array(stepConfigSchema.partial()).optional(),
  widthBand: z.enum(WIDTH_BAND_VALUES).optional(),
  depthBand: z.enum(DEPTH_BAND_VALUES).optional(),
  openSides: z.boolean(),
  intermediateLanding: z.boolean(),
  landingFinish: z.enum(LANDING_FINISH_VALUES, {
    error: () => ({ message: V.landingFinishRequired }),
  }),
  landingAreaM2: z.number().positive().optional(),
  wantPlinthes: z.boolean().optional(),
  plinthesML: z.number().positive().optional(),
  stepEndCap: z.enum(STEP_END_CAP_VALUES, {
    error: () => ({ message: V.endCapRequired }),
  }).optional(),
  openStepEndSide: z.enum(END_SIDE_VALUES).optional(),
  lateralEndSide: z.enum(END_SIDE_VALUES).optional(),
  stepEndCapConfigs: z.array(stepEndCapConfigSchema).optional(),
  seuilColor: z.enum(SEUIL_COLOR_VALUES).optional(),
  contactPreference: z.enum(["WHATSAPP", "EMAIL"]).optional(),
  firstName: z.string().min(1, V.firstNameRequired),
  lastName: z.string().min(1, V.lastNameRequired),
  email: z.email({ error: () => ({ message: V.emailInvalid }) }),
  phone: z.string().min(1, V.phoneRequired),
  country: z.string().min(1, V.countryRequired),
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
        message: V.selectWidth,
      });
    }
    if (!data.depthBand) {
      ctx.addIssue({
        code: "custom",
        path: ["depthBand"],
        message: V.selectDepth,
      });
    }
  } else if (!validateStepConfigs(data.stepConfigs, data.stepCount)) {
    ctx.addIssue({
      code: "custom",
      path: ["stepConfigs"],
      message: V.stepConfigsIncomplete,
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
    | "staircaseType"
    | "decor"
    | "riserOption"
    | "stepCount"
    | "uniformStepDimensions"
    | "stepConfigs"
    | "widthBand"
    | "depthBand"
    | "riserHeightMm"
    | "stepEndCap"
    | "openStepEndSide"
    | "lateralEndSide"
    | "stepEndCapConfigs"
    | "landingFinish"
    | "seuilColor"
    | "contactPreference"
  >
> &
  Pick<
    QuoteFormValues,
    | "openSides"
    | "intermediateLanding"
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

/** Schémas Zod pour chaque étape du tunnel. */
export const quoteStepSchemas = [
  quoteFormBaseSchema.pick({ staircaseType: true }),
  quoteFormBaseSchema.pick({ decor: true }),
  quoteFormBaseSchema.pick({ riserOption: true, riserHeightMm: true }),
  quoteFormBaseSchema.pick({ stepCount: true }),
  quoteFormBaseSchema.pick({ uniformStepDimensions: true }),
  quoteFormBaseSchema.pick({ stepEndCapConfigs: true }).partial(),
  quoteFormBaseSchema.pick({
    intermediateLanding: true,
    landingFinish: true,
    seuilColor: true,
  }).partial({ seuilColor: true }),
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
      return { staircaseType: values.staircaseType };
    case 1:
      return { decor: values.decor };
    case 2:
      return { riserOption: values.riserOption, riserHeightMm: values.riserHeightMm };
    case 3:
      return { stepCount: values.stepCount };
    case 4:
      return { uniformStepDimensions: values.uniformStepDimensions };
    case 5:
      return { stepEndCapConfigs: values.stepEndCapConfigs };
    case 6:
      return {
        intermediateLanding: values.intermediateLanding,
        landingFinish: values.landingFinish,
        seuilColor: values.seuilColor,
      };
    case 7:
      return {}; // étape parquet — optionnelle
    case 8:
      return {}; // étape inclus — informative
    case 9:
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
  const count = values.stepCount;
  if (!count) return false;
  const configs = values.stepEndCapConfigs;
  if (!configs || configs.length !== count) return false;
  return configs.every((c) => {
    if (c.between2Walls || c.between2Stringers) return c.cap === "NONE";
    if (!c.cap || c.cap === "NONE") return false;
    if (c.cap === "OPEN_STEP") return Boolean(c.side);
    return true;
  });
}

export function validateWizardStep(step: number, values: QuoteFormDraft): boolean {
  if (step === 0) {
    // Seul un escalier FERMÉ permet de continuer (OUVERT = cas spécifique, support).
    return values.staircaseType === "CLOSED";
  }
  if (step === 4) {
    return validateDimensionsStep(values);
  }
  if (step === 5) {
    return validateStepEndCapStep(values);
  }
  if (step === 6) {
    const finish = values.landingFinish;
    if (!finish || finish === "NONE") return false;
    if (finish === "NEZ_SEUIL") return Boolean(values.seuilColor);
    return true;
  }

  if (step === 7) return true; // étape parquet — toujours valide
  if (step === 8) return true; // étape inclus — toujours valide

  const schema = quoteStepSchemas[step];
  if (!schema) return false;
  return schema.safeParse(pickQuoteStepValues(step, values)).success;
}

export function getWizardStepFieldErrors(
  step: number,
  values: QuoteFormDraft,
): Partial<Record<keyof QuoteFormDraft, string>> {
  if (step === 4) {
    const errors: Partial<Record<keyof QuoteFormDraft, string>> = {};

    const uniformRes = quoteFormBaseSchema
      .pick({ uniformStepDimensions: true })
      .safeParse({ uniformStepDimensions: values.uniformStepDimensions });
    if (!uniformRes.success) {
      errors.uniformStepDimensions =
        uniformRes.error.issues[0]?.message ?? V.answerRequired;
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
        V.stepConfigsIncomplete,
    };
  }

  if (step === 5) {
    if (!validateStepEndCapStep(values)) {
      return { stepEndCapConfigs: V.endCapConfigsIncomplete };
    }
    return {};
  }

  if (step === 6) {
    const errors: Partial<Record<keyof QuoteFormDraft, string>> = {};
    const finish = values.landingFinish;
    if (!finish || finish === "NONE") {
      errors.landingFinish = V.landingFinishRequired;
    } else if (finish === "NEZ_SEUIL" && !values.seuilColor) {
      errors.seuilColor = V.seuilColorRequired;
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
