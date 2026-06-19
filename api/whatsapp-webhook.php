<?php
/**
 * /api/whatsapp-webhook.php
 *
 * URL à configurer dans Twilio (Messaging → WhatsApp Sender → "When a message
 * comes in") :  https://escal.point-soft.fr/api/whatsapp-webhook.php   (POST)
 *
 * Twilio envoie un POST x-www-form-urlencoded (From, Body, NumMedia, MediaUrlN…).
 * On retrouve le lead par numéro, on enregistre le message entrant, on
 * incrémente unread, puis on répond un TwiML vide (200).
 */

require __DIR__ . '/bootstrap.php';
require __DIR__ . '/twilio.php';

// Réponse TwiML vide standard pour Twilio
function twiml_ok(): never
{
    header('Content-Type: text/xml; charset=utf-8');
    echo '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
    exit;
}

if (method() !== 'POST') {
    json_error('Méthode non autorisée', 405);
}

global $CONFIG;
$authToken = $CONFIG['twilio']['auth_token'] ?? '';

// ─── Validation de la signature Twilio ──────────────────────────────────────
// Désactivable en dev via config 'twilio_skip_signature' => true.
$skip = $CONFIG['twilio_skip_signature'] ?? false;
if (!$skip) {
    $sig = $_SERVER['HTTP_X_TWILIO_SIGNATURE'] ?? '';
    $url = twilio_current_url();
    if (!twilio_validate_signature($authToken, $url, $_POST, $sig)) {
        error_log('[webhook] signature Twilio invalide pour ' . $url);
        json_error('Signature invalide', 403);
    }
}

// ─── Données du message entrant ─────────────────────────────────────────────
$from = (string) ($_POST['From'] ?? '');          // ex. "whatsapp:+33612345678"
$body = trim((string) ($_POST['Body'] ?? ''));
$numMedia = (int) ($_POST['NumMedia'] ?? 0);

// Numéro nu (sans préfixe whatsapp:)
$phone = preg_replace('/^whatsapp:/', '', $from) ?? '';
if ($phone === '') {
    twiml_ok();   // rien d'exploitable, on acquitte quand même
}

$pdo = db();

// ─── Retrouver le lead par numéro ───────────────────────────────────────────
// Match exact, puis repli sur les 9 derniers chiffres (tolérant aux formats).
$digits = preg_replace('/\D/', '', $phone) ?? '';
$last9  = substr($digits, -9);

$stmt = $pdo->prepare(
    "SELECT id FROM leads
     WHERE REPLACE(REPLACE(REPLACE(phone,' ',''),'.',''),'-','') = ?
        OR RIGHT(REPLACE(REPLACE(REPLACE(phone,' ',''),'.',''),'-',''), 9) = ?
     ORDER BY updated_at DESC
     LIMIT 1"
);
$stmt->execute(['+' . $digits, $last9]);
$leadId = $stmt->fetchColumn();

// ─── Lead inconnu → on en crée un minimal pour ne perdre aucun message ──────
if ($leadId === false) {
    $insert = $pdo->prepare(
        "INSERT INTO leads (first_name, last_name, email, phone, country,
            decor, riser_option, step_count, status, last_snippet, unread_count)
         VALUES ('Prospect', 'WhatsApp', '', ?, '', '', 'NONE', 0, 'new', ?, 0)"
    );
    $insert->execute(['+' . $digits, mb_substr($body !== '' ? $body : 'Photo reçue', 0, 120)]);
    $leadId = (int) $pdo->lastInsertId();
}

// ─── Télécharger les photos entrantes ───────────────────────────────────────
$media = [];
if ($numMedia > 0) {
    require_once __DIR__ . '/twilio.php';
    for ($i = 0; $i < $numMedia; $i++) {
        $url  = (string) ($_POST["MediaUrl{$i}"] ?? '');
        $type = (string) ($_POST["MediaContentType{$i}"] ?? 'image/jpeg');
        if ($url === '') continue;
        $path = twilio_download_media($url, $type, 'L-' . $leadId);
        if ($path) $media[] = $path;
    }
}

// message NOT NULL → libellé par défaut si seulement une photo
if ($body === '') {
    $body = $media ? '📷 Photo' : '[message vide]';
}

// ─── Enregistrer le message (+ médias) + incrémenter unread ─────────────────
try {
    try {
        $pdo->prepare('INSERT INTO conversations (lead_id, author, message, media_json) VALUES (?, ?, ?, ?)')
            ->execute([$leadId, 'client', $body, $media ? json_encode($media, JSON_UNESCAPED_SLASHES) : null]);
    } catch (Throwable $inner) {
        // Filet de sécurité : insertion minimale si une colonne manque (ex. migration non passée)
        error_log('[webhook] insert complet KO, fallback minimal: ' . $inner->getMessage());
        $pdo->prepare('INSERT INTO conversations (lead_id, author, message) VALUES (?, ?, ?)')
            ->execute([$leadId, 'client', $body]);
    }

    $snippet = $media && $body === '📷 Photo' ? '📷 Photo' : mb_substr($body, 0, 120);
    $pdo->prepare(
        'UPDATE leads SET last_snippet = ?, unread_count = unread_count + 1, updated_at = NOW() WHERE id = ?'
    )->execute([$snippet, $leadId]);
} catch (Throwable $e) {
    error_log('[webhook] DB error: ' . $e->getMessage());
    // On acquitte quand même pour éviter que Twilio ne réessaie en boucle.
}

// ─── Alerte SMS aux commerciaux (réponse client) ────────────────────────────
try {
    require_once __DIR__ . '/primotexto.php';
    $nameRow = $pdo->prepare('SELECT first_name, last_name FROM leads WHERE id = ?');
    $nameRow->execute([$leadId]);
    $who = $nameRow->fetch();
    $clientName = $who ? trim($who['first_name'] . ' ' . $who['last_name']) : 'Client';
    notify_commercials($pdo, "Message de {$clientName} : " . mb_substr($body, 0, 100));
} catch (Throwable $e) {
    error_log('[webhook] notif SMS: ' . $e->getMessage());
}

twiml_ok();
