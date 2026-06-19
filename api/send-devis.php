<?php
/**
 * /api/send-devis.php?id=L-12   (POST, authentifié)
 *
 * Génère le devis PDF, le sauvegarde dans uploads/devis/ (URL publique),
 * et l'envoie au client par WhatsApp (MediaUrl). Enregistre la trace dans
 * la conversation.
 *
 * ⚠️ Hors fenêtre WhatsApp de 24h, l'envoi de média libre peut être refusé
 *    par Meta (nécessiterait un template). Fonctionne en conversation active.
 */

require __DIR__ . '/bootstrap.php';
require __DIR__ . '/devis-lib.php';
require __DIR__ . '/twilio.php';

$uid = require_auth();
if (method() !== 'POST') json_error('Méthode non autorisée', 405);

$dbId = db_id((string) ($_GET['id'] ?? ''));
$pdo  = db();
$lead = devis_load_lead($pdo, $dbId);
if (!$lead) json_error('Lead introuvable', 404);
if (empty($lead['phone'])) json_error('Numéro du client manquant', 400);

// ─── Génère + sauvegarde le PDF dans un dossier public ──────────────────────
global $CONFIG;
$baseDir = rtrim($CONFIG['uploads_dir'] ?? (__DIR__ . '/uploads'), '/');
$dir = "{$baseDir}/devis";
if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
    json_error('Impossible de créer le dossier devis', 500);
}
$file = 'KRE-' . str_pad((string) $dbId, 5, '0', STR_PAD_LEFT) . '.pdf';
$pdf  = devis_build_fpdf($lead);
$pdf->Output('F', "{$dir}/{$file}");

// URL publique du PDF (base publique configurée, sinon reconstruite)
$apiDir = dirname($_SERVER['SCRIPT_NAME'] ?? '/api/x');
$base   = !empty($CONFIG['public_base_url'])
    ? rtrim($CONFIG['public_base_url'], '/') . $apiDir
    : ((($_SERVER['HTTPS'] ?? '') === 'on' ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? '') . $apiDir);
$mediaUrl = "{$base}/uploads/devis/{$file}";

// ─── Envoi WhatsApp (média) ─────────────────────────────────────────────────
$body = 'Bonjour, voici votre devis Kit Rénovation Escalier. Nous restons à votre disposition.';
$scheme = (($_SERVER['HTTPS'] ?? '') === 'on' || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https') ? 'https' : 'http';
$statusCb = (!empty($CONFIG['public_base_url']) ? rtrim($CONFIG['public_base_url'], '/') . $apiDir
    : "{$scheme}://" . ($_SERVER['HTTP_HOST'] ?? '') . $apiDir) . '/whatsapp-status.php';

$res = twilio_send_whatsapp((string) $lead['phone'], $body, $mediaUrl, $statusCb);

if (empty($res['ok'])) {
    json_out(['ok' => false, 'error' => $res['error'] ?? 'Echec envoi WhatsApp', 'pdfUrl' => $mediaUrl], 200);
}

// ─── Trace dans la conversation ─────────────────────────────────────────────
try {
    $pdo->prepare(
        'INSERT INTO conversations (lead_id, author, message, media_json, twilio_sid, status, author_user_id)
         VALUES (?, "vendor", ?, ?, ?, ?, ?)'
    )->execute([
        $dbId, '📄 Devis envoyé', json_encode(["uploads/devis/{$file}"], JSON_UNESCAPED_SLASHES),
        $res['sid'] ?? null, $res['status'] ?? 'queued', $uid,
    ]);
    $pdo->prepare('UPDATE leads SET last_snippet = "📄 Devis envoyé", unread_count = 0, updated_at = NOW() WHERE id = ?')
        ->execute([$dbId]);
} catch (Throwable $e) {
    error_log('[send-devis] ' . $e->getMessage());
}

json_out(['ok' => true, 'pdfUrl' => $mediaUrl, 'whatsapp' => $res]);
