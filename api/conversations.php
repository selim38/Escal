<?php
/**
 * /api/conversations.php?leadId=L-12
 *   GET  → historique des messages
 *   POST → enregistre un message (et, en point 2, l'envoie via Twilio WhatsApp)
 *          ← remplace admin GET/POST /api/conversations/[leadId]
 */

require __DIR__ . '/bootstrap.php';

$leadId = $_GET['leadId'] ?? '';
if ($leadId === '') {
    json_error('Paramètre leadId manquant', 400);
}
$dbId = db_id((string) $leadId);

switch (method()) {
    case 'GET':  get_history($dbId);    break;
    case 'POST': post_message($dbId);   break;
    default:     json_error('Méthode non autorisée', 405);
}

// ───────────────────────────────────────────────────────────────────────────
function get_history(int $dbId): never
{
    $stmt = db()->prepare(
        'SELECT author, message, sent_at
         FROM conversations
         WHERE lead_id = ?
         ORDER BY sent_at ASC'
    );
    $stmt->execute([$dbId]);

    $messages = array_map(static function (array $r): array {
        $ts = strtotime((string) $r['sent_at'] . ' UTC');
        return [
            'author' => $r['author'],
            'text'   => $r['message'],
            'time'   => $ts ? date('H:i', $ts) : '',
        ];
    }, $stmt->fetchAll());

    json_out($messages);
}

// ───────────────────────────────────────────────────────────────────────────
function post_message(int $dbId): never
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
    if ($author === 'vendor') {
        require_once __DIR__ . '/twilio.php';
        $whatsapp = twilio_send_whatsapp((string) $leadPhone, $message);
        // L'échec d'envoi n'empêche pas l'enregistrement local (on le remonte).
    }

    try {
        $pdo->prepare('INSERT INTO conversations (lead_id, author, message) VALUES (?, ?, ?)')
            ->execute([$dbId, $author, $message]);

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
        $out['whatsapp'] = $whatsapp;   // {ok, sid, status} ou {ok:false, error}
    }
    json_out($out);
}
