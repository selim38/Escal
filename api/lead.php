<?php
/**
 * /api/lead.php?id=L-12
 *   PATCH → met à jour statut / snippet / unread / notes internes
 *           ← remplace admin PATCH /api/leads/[id]
 *
 * Note : sur mutualisé certains clients HTTP ne passent pas PATCH ; on
 * accepte aussi POST avec en-tête `X-HTTP-Method-Override: PATCH`.
 */

require __DIR__ . '/bootstrap.php';

$verb = method();
if ($verb === 'POST' && ($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ?? '') === 'PATCH') {
    $verb = 'PATCH';
}
if ($verb !== 'PATCH') {
    json_error('Méthode non autorisée', 405);
}

$id = $_GET['id'] ?? '';
if ($id === '') {
    json_error('Paramètre id manquant', 400);
}
$dbId = db_id((string) $id);

$b = read_json_body();

// Liste blanche colonne ← clé JSON
$allowed = [
    'status'         => 'status',
    'last_snippet'   => 'last_snippet',
    'unread_count'   => 'unread_count',
    'internal_notes' => 'internal_notes',
];

$sets = [];
$vals = [];
foreach ($allowed as $key => $col) {
    if (array_key_exists($key, $b)) {
        $sets[] = "$col = ?";
        $vals[] = $b[$key];
    }
}

if (!$sets) {
    json_error('Nothing to update', 400);
}

// status : on borne aux valeurs valides
if (isset($b['status']) && !in_array($b['status'], ['new', 'pending', 'won', 'lost'], true)) {
    json_error('Statut invalide', 400);
}

$vals[] = $dbId;

try {
    $stmt = db()->prepare('UPDATE leads SET ' . implode(', ', $sets) . ' WHERE id = ?');
    $stmt->execute($vals);
} catch (Throwable $e) {
    json_error('DB error', 500, $e);
}

json_out(['ok' => true]);
