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

// Si le client a envoyé des médias (photos), on l'indique dans le texte
if ($numMedia > 0) {
    $mediaNote = $numMedia . ' photo(s) reçue(s)';
    $body = $body !== '' ? "$body\n[$mediaNote]" : "[$mediaNote]";
}
if ($body === '') {
    $body = '[message vide]';
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
    $insert->execute(['+' . $digits, mb_substr($body, 0, 120)]);
    $leadId = (int) $pdo->lastInsertId();
}

// ─── Enregistrer le message + incrémenter unread ────────────────────────────
try {
    $pdo->prepare('INSERT INTO conversations (lead_id, author, message) VALUES (?, ?, ?)')
        ->execute([$leadId, 'client', $body]);
    $pdo->prepare(
        'UPDATE leads SET last_snippet = ?, unread_count = unread_count + 1, updated_at = NOW() WHERE id = ?'
    )->execute([mb_substr($body, 0, 120), $leadId]);
} catch (Throwable $e) {
    error_log('[webhook] DB error: ' . $e->getMessage());
    // On acquitte quand même pour éviter que Twilio ne réessaie en boucle.
}

twiml_ok();
