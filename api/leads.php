<?php
/**
 * /api/leads.php
 *   GET  → liste des leads (dashboard admin)   ← remplace admin GET /api/leads
 *   POST → création d'un lead (module calcul)  ← remplace modul POST /api/leads
 */

require __DIR__ . '/bootstrap.php';

switch (method()) {
    case 'GET':  list_leads();   break;
    case 'POST': create_lead();  break;
    default:     json_error('Méthode non autorisée', 405);
}

// ───────────────────────────────────────────────────────────────────────────
function list_leads(): never
{
    require_auth();   // liste réservée au dashboard admin
    $rows = db()->query("
        SELECT
            id, first_name, last_name, email, phone, country,
            status, estimated_materials_eur,
            last_snippet, unread_count, internal_notes,
            created_at, updated_at,
            decor, riser_option, step_count,
            uniform_step_dimensions, width_band, depth_band,
            open_sides, intermediate_landing, landing_finish,
            step_end_cap, open_step_end_side, lateral_end_side,
            photos_json
        FROM leads
        ORDER BY updated_at DESC
    ")->fetchAll();

    $leads = array_map(static function (array $r): array {
        $first = (string) $r['first_name'];
        $last  = (string) $r['last_name'];
        return [
            'id'        => 'L-' . $r['id'],
            'dbId'      => (int) $r['id'],
            'name'      => trim("$first $last"),
            'firstName' => $first,
            'lastName'  => $last,
            'initials'  => mb_substr($first, 0, 1) . mb_substr($last, 0, 1),
            'email'     => $r['email'],
            'phone'     => $r['phone'],
            'status'    => $r['status'],
            'price'     => $r['estimated_materials_eur'] !== null
                            ? (int) round((float) $r['estimated_materials_eur']) : 0,
            'snippet'   => $r['last_snippet'] ?? '',
            'unread'    => (int) $r['unread_count'],
            'lastTime'  => relative_time((string) $r['updated_at']),
            'lastTs'    => strtotime((string) $r['updated_at'] . ' UTC') * 1000,
            'step'      => 'stage',
            'funnelHistory' => [],
            'internalNotes' => $r['internal_notes'] ?? '',
            'photos'    => $r['photos_json'] ? (json_decode((string) $r['photos_json'], true) ?: []) : [],
            'config'    => [
                'decor'                 => $r['decor'],
                'riserOption'           => $r['riser_option'],
                'stepCount'             => $r['step_count'] !== null ? (int) $r['step_count'] : null,
                'uniformStepDimensions' => $r['uniform_step_dimensions'] !== null
                                            ? (bool) $r['uniform_step_dimensions'] : null,
                'widthBand'             => $r['width_band'],
                'depthBand'             => $r['depth_band'],
                'openSides'             => (bool) $r['open_sides'],
                'intermediateLanding'   => (bool) $r['intermediate_landing'],
                'landingFinish'         => $r['landing_finish'],
                'stepEndCap'            => $r['step_end_cap'],
                'openStepEndSide'       => $r['open_step_end_side'],
                'lateralEndSide'        => $r['lateral_end_side'],
                'country'               => $r['country'] ?? null,
            ],
        ];
    }, $rows);

    json_out($leads);
}

// ───────────────────────────────────────────────────────────────────────────
function create_lead(): never
{
    $b = read_json_body();

    // Champs contact obligatoires
    foreach (['firstName', 'lastName', 'email', 'phone'] as $req) {
        if (empty($b[$req])) {
            json_error("Champ manquant : $req", 400);
        }
    }

    // Le prix est calculé côté client (module calcul, calculatePrice.ts) et
    // transmis ici. price_breakdown peut être un objet/tableau → JSON.
    $estimated     = isset($b['estimatedMaterialsEuro']) ? (float) $b['estimatedMaterialsEuro'] : null;
    $breakdownJson = isset($b['priceBreakdown']) ? json_encode($b['priceBreakdown'], JSON_UNESCAPED_UNICODE) : null;
    $stepConfigs   = isset($b['stepConfigs']) ? json_encode($b['stepConfigs'], JSON_UNESCAPED_UNICODE) : null;

    $stepCount = (int) ($b['stepCount'] ?? 0);
    $snippet   = $estimated !== null
        ? sprintf('Devis estimé : %s € — %d marches', (int) round($estimated), $stepCount)
        : sprintf('Nouvelle demande — %d marches', $stepCount);

    $sql = "INSERT INTO leads (
        first_name, last_name, email, phone, country,
        decor, riser_option, step_count,
        uniform_step_dimensions,
        width_band, depth_band, step_configs_json,
        open_sides, intermediate_landing, landing_finish,
        step_end_cap, open_step_end_side, lateral_end_side,
        estimated_materials_eur, price_breakdown_json,
        status, last_snippet, unread_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, 1)";

    try {
        $stmt = db()->prepare($sql);
        $stmt->execute([
            $b['firstName'],
            $b['lastName'],
            $b['email'],
            $b['phone'],
            $b['country'] ?? '',
            $b['decor'] ?? null,
            $b['riserOption'] ?? null,
            $stepCount,
            !empty($b['uniformStepDimensions']) ? 1 : 0,
            $b['widthBand'] ?? null,
            $b['depthBand'] ?? null,
            $stepConfigs,
            !empty($b['openSides']) ? 1 : 0,
            !empty($b['intermediateLanding']) ? 1 : 0,
            $b['landingFinish'] ?? 'NONE',
            $b['stepEndCap'] ?? 'NONE',
            $b['openStepEndSide'] ?? null,
            $b['lateralEndSide'] ?? null,
            $estimated,
            $breakdownJson,
            $snippet,
        ]);
        $id = (int) db()->lastInsertId();
    } catch (Throwable $e) {
        json_error('Erreur lors de la soumission', 500, $e);
    }

    json_out([
        'ok'     => true,
        'leadId' => 'L-' . $id,
        'estimatedMaterialsEuro' => $estimated,
    ]);
}
