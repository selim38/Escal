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
            photos_json,
            assigned_to, assigned_at,
            (SELECT name FROM users WHERE id = leads.assigned_to) AS assigned_agent
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
            'assignedTo'    => $r['assigned_to'] !== null ? (int) $r['assigned_to'] : null,
            'assignedAgent' => $r['assigned_agent'],
            'assignedAtTs'  => $r['assigned_at'] ? strtotime((string) $r['assigned_at'] . ' UTC') * 1000 : null,
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
/**
 * Colonnes réellement présentes sur `leads`.
 *
 * Le déploiement est automatique à chaque push, mais la migration
 * (api/migrate.php) est une action manuelle : il existe donc une fenêtre où ce
 * fichier est en ligne avant que les colonnes qu'il utilise n'existent. Plutôt
 * que de renvoyer une 500 sur chaque demande de devis pendant ce temps, on
 * adapte l'INSERT aux colonnes disponibles.
 *
 * Résultat mis en cache pour la durée de la requête.
 */
function leads_columns(): array
{
    static $columns = null;
    if ($columns !== null) {
        return $columns;
    }
    try {
        $columns = db()->query('SHOW COLUMNS FROM leads')->fetchAll(PDO::FETCH_COLUMN, 0);
    } catch (Throwable $e) {
        // Base inaccessible : l'INSERT échouera de toute façon juste après, avec
        // un message d'erreur propre. Ne pas masquer l'échec ici.
        $columns = [];
    }
    return $columns;
}

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

    // ─── Intégration Web Component (WordPress) ─────────────────────────────
    // `recipientEmail` vient de l'attribut HTML recipient-email, donc d'une page
    // publique éditable : on ne le stocke que s'il figure dans l'allowlist du
    // serveur, sinon l'API deviendrait un relais d'adresses arbitraires.
    global $CONFIG;
    $allowedRecipients = $CONFIG['allowed_recipient_emails'] ?? [];
    $recipient = isset($b['recipientEmail']) && is_string($b['recipientEmail'])
        && in_array($b['recipientEmail'], $allowedRecipients, true)
            ? $b['recipientEmail']
            : null;

    // Origine réelle de la page hôte (en-tête navigateur, non falsifiable par
    // le composant) : distingue les leads WordPress de ceux du module /calcul.
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? substr((string) $_SERVER['HTTP_ORIGIN'], 0, 255) : null;

    // Paramètres de provenance (utm_*, gclid, fbclid) lus dans l'URL par le
    // composant. Bornés en nombre et en taille : ils viennent du client.
    $tracking = null;
    if (isset($b['tracking']) && is_array($b['tracking'])) {
        $clean = [];
        foreach (array_slice($b['tracking'], 0, 12, true) as $key => $value) {
            if (!is_string($key) || !is_scalar($value)) {
                continue;
            }
            if (!preg_match('/^[a-z0-9_]{1,40}$/', $key)) {
                continue;
            }
            $clean[$key] = substr((string) $value, 0, 255);
        }
        $tracking = $clean !== [] ? json_encode($clean, JSON_UNESCAPED_UNICODE) : null;
    }

    $fields = [
        'first_name'              => $b['firstName'],
        'last_name'               => $b['lastName'],
        'email'                   => $b['email'],
        'phone'                   => $b['phone'],
        'country'                 => $b['country'] ?? '',
        'decor'                   => $b['decor'] ?? null,
        'riser_option'            => $b['riserOption'] ?? null,
        'step_count'              => $stepCount,
        'uniform_step_dimensions' => !empty($b['uniformStepDimensions']) ? 1 : 0,
        'width_band'              => $b['widthBand'] ?? null,
        'depth_band'              => $b['depthBand'] ?? null,
        'step_configs_json'       => $stepConfigs,
        'open_sides'              => !empty($b['openSides']) ? 1 : 0,
        'intermediate_landing'    => !empty($b['intermediateLanding']) ? 1 : 0,
        'landing_finish'          => $b['landingFinish'] ?? 'NONE',
        'step_end_cap'            => $b['stepEndCap'] ?? 'NONE',
        'open_step_end_side'      => $b['openStepEndSide'] ?? null,
        'lateral_end_side'        => $b['lateralEndSide'] ?? null,
        'estimated_materials_eur' => $estimated,
        'price_breakdown_json'    => $breakdownJson,
        'status'                  => 'new',
        'last_snippet'            => $snippet,
        'unread_count'            => 1,
    ];

    // Colonnes ajoutées pour l'intégration Web Component : incluses seulement
    // si la migration a été appliquée (voir leads_columns()).
    $available = leads_columns();
    foreach (
        [
            'recipient_email' => $recipient,
            'origin'          => $origin,
            'tracking_json'   => $tracking,
        ] as $column => $value
    ) {
        if (in_array($column, $available, true)) {
            $fields[$column] = $value;
        }
    }

    $sql = sprintf(
        'INSERT INTO leads (%s) VALUES (%s)',
        implode(', ', array_keys($fields)),
        implode(', ', array_fill(0, count($fields), '?'))
    );

    try {
        $stmt = db()->prepare($sql);
        $stmt->execute(array_values($fields));
        $id = (int) db()->lastInsertId();
    } catch (Throwable $e) {
        json_error('Erreur lors de la soumission', 500, $e);
    }

    // Alerte SMS aux commerciaux (non bloquant)
    try {
        require_once __DIR__ . '/primotexto.php';
        $who = trim($b['firstName'] . ' ' . $b['lastName']);
        $px  = $estimated !== null ? ' — ' . (int) round($estimated) . ' EUR' : '';
        notify_commercials(db(), "Nouveau lead : {$who}{$px} ({$stepCount} marches). À traiter sur l'admin.");
    } catch (Throwable $e) {
        error_log('[leads] notif SMS: ' . $e->getMessage());
    }

    json_out([
        'ok'     => true,
        'leadId' => 'L-' . $id,
        'estimatedMaterialsEuro' => $estimated,
    ]);
}
