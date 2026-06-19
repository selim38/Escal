<?php
/**
 * Helper Primotexto — envoi de SMS de notification aux commerciaux.
 * Doc : POST https://api.primotexto.com/v2/notification/messages/send
 *       header X-Primotexto-ApiKey, body { number, message, sender, campaignName, category }
 */

declare(strict_types=1);

/**
 * Envoie un SMS via Primotexto.
 * @return array{ok:bool, error?:string}
 */
function primotexto_send_sms(string $number, string $message, string $category = 'notification'): array
{
    global $CONFIG;
    $p = $CONFIG['primotexto'] ?? [];
    $key    = $p['api_key'] ?? '';
    $sender = $p['sender']  ?? 'KitRenov';
    if ($key === '' || $number === '') {
        return ['ok' => false, 'error' => 'Primotexto non configuré ou numéro vide'];
    }

    $payload = json_encode([
        'number'       => $number,
        'message'      => $message,
        'sender'       => $sender,
        'campaignName' => 'Alertes admin',
        'category'     => $category,
    ], JSON_UNESCAPED_UNICODE);

    $ch = curl_init('https://api.primotexto.com/v2/notification/messages/send');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_TIMEOUT        => 8,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'X-Primotexto-ApiKey: ' . $key,
        ],
    ]);
    $resp = curl_exec($ch);
    $http = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $cerr = curl_error($ch);
    curl_close($ch);

    if ($resp === false) return ['ok' => false, 'error' => "cURL: $cerr"];
    if ($http >= 200 && $http < 300) return ['ok' => true];
    return ['ok' => false, 'error' => "HTTP $http: " . substr((string) $resp, 0, 200)];
}

/**
 * Notifie tous les comptes commerciaux (qui ont un téléphone) par SMS.
 * Non bloquant : les échecs sont ignorés (loggués).
 */
function notify_commercials(PDO $pdo, string $message): void
{
    try {
        $rows = $pdo->query("SELECT phone FROM users WHERE phone IS NOT NULL AND phone <> ''")->fetchAll();
    } catch (Throwable $e) {
        return;
    }
    $seen = [];
    foreach ($rows as $r) {
        $num = trim((string) $r['phone']);
        if ($num === '' || isset($seen[$num])) continue;
        $seen[$num] = true;
        $res = primotexto_send_sms($num, $message, 'alerteAdmin');
        if (empty($res['ok'])) {
            error_log('[primotexto] échec ' . $num . ' : ' . ($res['error'] ?? '?'));
        }
    }
}
