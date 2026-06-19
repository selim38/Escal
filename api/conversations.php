<?php
/**
 * /api/conversations.php?leadId=L-12
 *   GET  → historique des messages
 *   POST → enregistre un message (et, en point 2, l'envoie via Twilio WhatsApp)
 *          ← remplace admin GET/POST /api/conversations/[leadId]
 */

require __DIR__ . '/bootstrap.php';

$AUTH_UID = require_auth();   // conversations réservées au dashboard admin

$leadId = $_GET['leadId'] ?? '';
if ($leadId === '') {
    json_error('Paramètre leadId manquant', 400);
}
$dbId = db_id((string) $leadId);

switch (method()) {
    case 'GET':  get_history($dbId);              break;
    case 'POST': post_message($dbId, $AUTH_UID);  break;
    default:     json_error('Méthode non autorisée', 405);
}

// ───────────────────────────────────────────────────────────────────────────
function get_history(int $dbId): never
{
    $stmt = db()->prepare(
        'SELECT c.author, c.message, c.media_json, c.status, c.sent_at, u.name AS agent_name
         FROM conversations c
         LEFT JOIN users u ON u.id = c.author_user_id
         WHERE c.lead_id = ?
         ORDER BY c.sent_at ASC'
    );
    $stmt->execute([$dbId]);

    $messages = array_map(static function (array $r): array {
        $ts = strtotime((string) $r['sent_at'] . ' UTC');
        return [
            'author' => $r['author'],
            'text'   => $r['message'],
            'time'   => $ts ? date('H:i', $ts) : '',
            'media'  => $r['media_json'] ? (json_decode((string) $r['media_json'], true) ?: []) : [],
            'status' => $r['status'],          // null|queued|sent|delivered|read|failed
            'agent'  => $r['agent_name'],      // nom du commercial (messages vendor)
        ];
    }, $stmt->fetchAll());

    json_out($messages);
}

// ───────────────────────────────────────────────────────────────────────────
function post_message(int $dbId, int $uid): never
{
    $b = read_json_body();
    $author  = $b['author'] ?? '';
    $message = trim((string) ($b['message'] ?? ''));

    if (!in_array($author, ['client', 'vendor'], true)) {
        json_error('Auteur invalide', 400);
    }
    if ($message === '') {
        json_error('Message vide', 400);
    }

    $pdo = db();

    // Récupère le téléphone du lead (nécessaire pour l'envoi WhatsApp)
    $stmt = $pdo->prepare('SELECT phone FROM leads WHERE id = ?');
    $stmt->execute([$dbId]);
    $leadPhone = $stmt->fetchColumn();
    if ($leadPhone === false) {
        json_error('Lead introuvable', 404);
    }

    // ─── Envoi WhatsApp réel quand un vendeur répond ─────────────────────
    $whatsapp = null;
    $twilioSid = null;
    $status = null;
    if ($author === 'vendor') {
        require_once __DIR__ . '/twilio.php';
        // URL publique du callback de statut
        global $CONFIG;
        $apiDir = dirname($_SERVER['SCRIPT_NAME'] ?? '/api/x');
        if (!empty($CONFIG['public_base_url'])) {
            $statusCb = rtrim($CONFIG['public_base_url'], '/') . $apiDir . '/whatsapp-status.php';
        } else {
            $scheme = (($_SERVER['HTTPS'] ?? '') === 'on' || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https') ? 'https' : 'http';
            $statusCb = "{$scheme}://" . ($_SERVER['HTTP_HOST'] ?? '') . $apiDir . '/whatsapp-status.php';
        }
        $whatsapp = twilio_send_whatsapp((string) $leadPhone, $message, null, $statusCb);
        if (!empty($whatsapp['ok'])) {
            $twilioSid = $whatsapp['sid'] ?? null;
            $status    = $whatsapp['status'] ?? 'queued';
        } else {
            $status = 'failed';
        }
    }

    try {
        $pdo->prepare(
            'INSERT INTO conversations (lead_id, author, message, twilio_sid, status, author_user_id)
             VALUES (?, ?, ?, ?, ?, ?)'
        )->execute([
            $dbId, $author, $message, $twilioSid, $status,
            $author === 'vendor' ? $uid : null,
        ]);

        $snippet = mb_substr($message, 0, 120);
        if ($author === 'client') {
            $pdo->prepare(
                'UPDATE leads SET last_snippet = ?, unread_count = unread_count + 1, updated_at = NOW() WHERE id = ?'
            )->execute([$snippet, $dbId]);
        } else {
            $pdo->prepare(
                'UPDATE leads SET last_snippet = ?, unread_count = 0, updated_at = NOW() WHERE id = ?'
            )->execute([$snippet, $dbId]);
        }
    } catch (Throwable $e) {
        json_error('DB error', 500, $e);
    }

    $out = ['ok' => true];
    if ($whatsapp !== null) {
        $out['whatsapp'] = $whatsapp;
    }
    json_out($out);
}
