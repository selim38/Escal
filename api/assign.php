<?php
/**
 * /api/assign.php?id=L-12   (POST, authentifié)
 *
 * Verrou souple anti-collision : le commercial qui consulte une conversation
 * la « prend ». Appelé à l'ouverture + en heartbeat (~25s).
 * On prend le verrou s'il est libre, périmé (>60s) ou déjà à nous.
 *
 * Réponse : { assignedTo, assignedAgent, assignedAtTs, mine, locked }
 *   locked = true si quelqu'un d'autre détient un verrou FRAIS.
 */

require __DIR__ . '/bootstrap.php';
$uid = require_auth();

$id = $_GET['id'] ?? '';
if ($id === '') json_error('Paramètre id manquant', 400);
$dbId = db_id((string) $id);

if (method() !== 'POST') json_error('Méthode non autorisée', 405);

$pdo = db();

// ─── Libération explicite (quand on quitte la conversation) ─────────────────
if (isset($_GET['release'])) {
    // On ne libère que si le verrou est à nous (évite de voler celui d'un autre)
    $pdo->prepare('UPDATE leads SET assigned_to = NULL, assigned_at = NULL WHERE id = ? AND assigned_to = ?')
        ->execute([$dbId, $uid]);
    json_out(['ok' => true, 'released' => true]);
}

$STALE = 30; // secondes avant qu'un verrou soit considéré périmé

$stmt = $pdo->prepare(
    'SELECT assigned_to, assigned_at,
            (assigned_at IS NULL OR assigned_at < (NOW() - INTERVAL ? SECOND)) AS is_stale
     FROM leads WHERE id = ?'
);
$stmt->execute([$STALE, $dbId]);
$row = $stmt->fetch();
if (!$row) json_error('Lead introuvable', 404);

$assignedTo = $row['assigned_to'] !== null ? (int) $row['assigned_to'] : null;
$stale      = (bool) $row['is_stale'];

// On prend (ou rafraîchit) le verrou si libre / périmé / déjà à nous
if ($assignedTo === null || $stale || $assignedTo === $uid) {
    $pdo->prepare('UPDATE leads SET assigned_to = ?, assigned_at = NOW() WHERE id = ?')
        ->execute([$uid, $dbId]);
    $assignedTo = $uid;
    $locked = false;
} else {
    // Quelqu'un d'autre détient un verrou frais
    $locked = true;
}

$agent = $pdo->prepare('SELECT name FROM users WHERE id = ?');
$agent->execute([$assignedTo]);
$agentName = $agent->fetchColumn() ?: null;

// Relit assigned_at à jour
$at = $pdo->prepare('SELECT assigned_at FROM leads WHERE id = ?');
$at->execute([$dbId]);
$assignedAt = $at->fetchColumn();

json_out([
    'assignedTo'    => $assignedTo,
    'assignedAgent' => $agentName,
    'assignedAtTs'  => $assignedAt ? strtotime((string) $assignedAt . ' UTC') * 1000 : null,
    'mine'          => $assignedTo === $uid,
    'locked'        => $locked,
]);
