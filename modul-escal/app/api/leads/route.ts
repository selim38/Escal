import { NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { buildLeadPayload } from "@/lib/lead-payload";
import type { QuoteFormValues } from "@/lib/quote-schema";

export async function POST(req: Request) {
  try {
    const values = (await req.json()) as QuoteFormValues;
    const payload = buildLeadPayload(values);

    const result = await execute(
      `INSERT INTO leads (
        first_name, last_name, email, phone, country,
        decor, riser_option, step_count,
        uniform_step_dimensions,
        width_band, depth_band, step_configs_json,
        open_sides, intermediate_landing, landing_finish,
        step_end_cap, open_step_end_side, lateral_end_side,
        estimated_materials_eur, price_breakdown_json,
        status, last_snippet, unread_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, 1)`,
      [
        values.firstName,
        values.lastName,
        values.email,
        values.phone,
        values.country,
        values.decor,
        values.riserOption,
        values.stepCount,
        values.uniformStepDimensions ? 1 : 0,
        values.widthBand ?? null,
        values.depthBand ?? null,
        values.stepConfigs ? JSON.stringify(values.stepConfigs) : null,
        values.openSides ? 1 : 0,
        values.intermediateLanding ? 1 : 0,
        values.landingFinish,
        values.stepEndCap,
        values.openStepEndSide ?? null,
        values.lateralEndSide  ?? null,
        payload.estimatedMaterialsEuro,
        JSON.stringify(payload.priceBreakdown),
        `Devis estimé : ${payload.estimatedMaterialsEuro} € — ${values.stepCount} marches`,
      ],
    );

    return NextResponse.json({
      ok: true,
      leadId: `L-${result.insertId}`,
      estimatedMaterialsEuro: payload.estimatedMaterialsEuro,
    });
  } catch (err) {
    console.error("[POST /api/leads]", err);
    return NextResponse.json({ error: "Erreur lors de la soumission" }, { status: 500 });
  }
}
