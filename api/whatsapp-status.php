<?php
/**
 * /api/whatsapp-status.php
 *
 * Callback de statut Twilio (StatusCallback). Twilio POST :
 *   MessageSid, MessageStatus (queued|sent|delivered|read|failed|undelivered)
 * On met à jour le statut du message correspondant.
 */

require __DIR__ . '/bootstrap.php';
require __DIR__ . '/twilio.php';

if (method() !== 'POST') {
    http_response_code(405);
    exit;
}

global $CONFIG;
$authToken = $CONFIG['twilio']['auth_token'] ?? '';
$skip = $CONFIG['twilio_skip_signature'] ?? false;
if (!$skip) {
    $sig = $_SERVER['HTTP_X_TWILIO_SIGNATURE'] ?? '';
    if (!twilio_validate_signature($authToken, twilio_current_url(), $_POST, $sig)) {
        http_response_code(403);
        exit;
    }
}

$sid    = (string) ($_POST['MessageSid'] ?? $_POST['SmsSid'] ?? '');
$status = (string) ($_POST['MessageStatus'] ?? $_POST['SmsStatus'] ?? '');

if ($sid !== '' && $status !== '') {
    try {
        db()->prepare('UPDATE conversations SET status = ? WHERE twilio_sid = ?')
            ->execute([$status, $sid]);
    } catch (Throwable $e) {
        error_log('[status] ' . $e->getMessage());
    }
}

http_response_code(204);
