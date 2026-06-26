import { calculatePrice } from "@/lib/calculatePrice";
import { validateStepConfigs, type QuoteFormValues } from "@/lib/quote-schema";

import {
  DECOR_LABELS,
  DEPTH_LABELS,
  LANDING_FINISH_LABELS,
  SEUIL_COLOR_LABELS,
  END_SIDE_LABELS,
  RISER_OPTION_LABELS,
  STAIR_LAYOUT_LABELS,
  STEP_END_CAP_LABELS,
  WIDTH_LABELS,
} from "@/lib/quote-labels";
export function buildLeadPayload(values: QuoteFormValues) {
  const price = calculatePrice(values);
  return {
    type: "escal-concept-devis-request",
    submittedAt: new Date().toISOString(),
    estimatedMaterialsEuro: price.materialsSubtotal,
    priceBreakdown: price.breakdown,
    configuration: {
      decor: DECOR_LABELS[values.decor],
      riserOption: RISER_OPTION_LABELS[values.riserOption],
      ...(values.riserHeightMm ? { riserHeightMm: values.riserHeightMm } : {}),
      stepCount: values.stepCount,
      uniformStepDimensions: values.uniformStepDimensions ? "Oui" : "Non",
      ...(values.stepConfigs &&
      validateStepConfigs(values.stepConfigs, values.stepCount)
        ? {
            steps: values.stepConfigs.map((step, index) => ({
              index: index + 1,
              layout: STAIR_LAYOUT_LABELS[step.layout],
              width: WIDTH_LABELS[step.widthBand],
              depth: DEPTH_LABELS[step.depthBand],
            })),
          }
        : {}),
      ...(values.widthBand
        ? { widthBand: WIDTH_LABELS[values.widthBand] }
        : {}),
      ...(values.depthBand
        ? { depthBand: DEPTH_LABELS[values.depthBand] }
        : {}),
      openSides: values.openSides,
      intermediateLanding: values.intermediateLanding,
      landingFinish: values.landingFinish ? LANDING_FINISH_LABELS[values.landingFinish] : undefined,
      ...(values.seuilColor ? { seuilColor: SEUIL_COLOR_LABELS[values.seuilColor] } : {}),
      ...(values.stepEndCapConfigs
        ? {
            stepEndCapConfigs: values.stepEndCapConfigs.map((c, i) => ({
              marche: i + 1,
              entre2Murs: c.between2Walls ? "Oui" : "Non",
              ...(c.cap !== "NONE"
                ? { embout: STEP_END_CAP_LABELS[c.cap] }
                : {}),
              ...(c.side ? { cote: END_SIDE_LABELS[c.side] } : {}),
            })),
          }
        : {}),
    },
    contact: {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      country: values.country,
      ...(values.contactPreference
        ? { contactPreference: values.contactPreference === "WHATSAPP" ? "WhatsApp" : "E-mail" }
        : {}),
    },
  };
}
