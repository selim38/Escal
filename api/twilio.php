<?php
/**
 * Helper Twilio WhatsApp — envoi sortant + validation de signature entrante.
 * N'utilise que cURL (natif PHP) : aucun SDK à installer sur le mutualisé.
 */

declare(strict_types=1);

/** Normalise un numéro en `whatsapp:+33...` pour l'API Twilio. */
function twilio_wa_address(string $phone): string
{
    $phone = trim($phone);
    if (str_starts_with($phone, 'whatsapp:')) {
        return $phone;
    }
    // Garde le + initial, retire espaces/points/parenthèses/tirets
    $clean = preg_replace('/[^\d+]/', '', $phone) ?? '';
    if ($clean !== '' && $clean[0] !== '+') {
        // 0612... (FR) → +33612...   ; sinon préfixe brut
        if (str_starts_with($clean, '0')) {
            $clean = '+33' . substr($clean, 1);
        } else {
            $clean = '+' . $clean;
        }
    }
    return 'whatsapp:' . $clean;
}

/**
 * Envoie un message WhatsApp via l'API REST Twilio.
 * @return array{ok:bool, sid?:string, status?:string, error?:string}
 */
function twilio_send_whatsapp(string $toPhone, string $body, ?string $mediaUrl = null): array
{
    global $CONFIG;
    $t = $CONFIG['twilio'] ?? [];
    $sid   = $t['account_sid']   ?? '';
    $token = $t['auth_token']    ?? '';
    $from  = $t['whatsapp_from'] ?? '';

    if ($sid === '' || $token === '' || $from === '') {
        return ['ok' => false, 'error' => 'Config Twilio incomplète'];
    }

    $url    = "https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json";
    $fields = [
        'From' => $from,
        'To'   => twilio_wa_address($toPhone),
        'Body' => $body,
    ];
    if ($mediaUrl !== null && $mediaUrl !== '') {
        $fields['MediaUrl'] = $mediaUrl;
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query($fields),
        CURLOPT_USERPWD        => "{$sid}:{$token}",
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
    ]);
    $resp = curl_exec($ch);
    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $cerr = curl_error($ch);
    curl_close($ch);

    if ($resp === false) {
        return ['ok' => false, 'error' => "cURL: $cerr"];
    }
    $json = json_decode((string) $resp, true);
    if ($http >= 200 && $http < 300 && isset($json['sid'])) {
        return ['ok' => true, 'sid' => $json['sid'], 'status' => $json['status'] ?? ''];
    }
    return ['ok' => false, 'error' => $json['message'] ?? "HTTP $http"];
}

/**
 * Valide la signature X-Twilio-Signature d'une requête entrante (webhook).
 * Algorithme officiel : HMAC-SHA1(authToken, URL + concat(clé+valeur triés)).
 */
function twilio_validate_signature(string $authToken, string $url, array $postParams, string $signature): bool
{
    ksort($postParams);
    $data = $url;
    foreach ($postParams as $k => $v) {
        $data .= $k . $v;
    }
    $expected = base64_encode(hash_hmac('sha1', $data, $authToken, true));
    return hash_equals($expected, $signature);
}

/** Reconstitue l'URL publique complète de la requête courante (pour la signature). */
function twilio_current_url(): string
{
    $https  = (($_SERVER['HTTPS'] ?? '') === 'on') || (($_SERVER['SERVER_PORT'] ?? '') === '443')
              || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    $scheme = $https ? 'https' : 'http';
    $host   = $_SERVER['HTTP_HOST'] ?? '';
    $uri    = $_SERVER['REQUEST_URI'] ?? '';
    return "{$scheme}://{$host}{$uri}";
}
