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
function twilio_send_whatsapp(string $toPhone, string $body, ?string $mediaUrl = null, ?string $statusCallback = null): array
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
    if ($statusCallback !== null && $statusCallback !== '') {
        $fields['StatusCallback'] = $statusCallback;
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
 * Télécharge un média Twilio (authentifié) vers uploads/leads/{leadId}/.
 * @return string|null chemin relatif "uploads/leads/L-x/…" ou null si échec.
 */
function twilio_download_media(string $mediaUrl, string $contentType, string $leadId): ?string
{
    global $CONFIG;
    $t = $CONFIG['twilio'] ?? [];
    $sid = $t['account_sid'] ?? '';
    $tok = $t['auth_token'] ?? '';

    $extMap = [
        'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp',
        'image/gif' => 'gif', 'application/pdf' => 'pdf',
    ];
    $ext = $extMap[strtolower(trim(explode(';', $contentType)[0]))] ?? 'jpg';

    $ch = curl_init($mediaUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_USERPWD        => "{$sid}:{$tok}",
        CURLOPT_TIMEOUT        => 25,
    ]);
    $data = curl_exec($ch);
    $http = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($data === false || $http < 200 || $http >= 300) {
        return null;
    }

    $baseDir = rtrim($CONFIG['uploads_dir'] ?? (__DIR__ . '/uploads'), '/');
    $dir = "{$baseDir}/leads/{$leadId}";
    if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
        return null;
    }
    $filename = sprintf('wa-%d-%s.%s', time(), bin2hex(random_bytes(5)), $ext);
    if (file_put_contents("{$dir}/{$filename}", $data) === false) {
        return null;
    }
    return "uploads/leads/{$leadId}/{$filename}";
}

/** Normalise un numéro en E.164 (+33…) pour l'API Verify. */
function twilio_e164(string $phone): string
{
    $phone = preg_replace('/^whatsapp:/', '', trim($phone));
    $clean = preg_replace('/[^\d+]/', '', (string) $phone) ?? '';
    if ($clean !== '' && $clean[0] !== '+') {
        $clean = str_starts_with($clean, '0') ? '+33' . substr($clean, 1) : '+' . $clean;
    }
    return $clean;
}

/**
 * Twilio Verify — envoie un code OTP par WhatsApp.
 * @return array{ok:bool, status?:string, error?:string}
 */
function twilio_verify_start(string $phone): array
{
    global $CONFIG;
    $t = $CONFIG['twilio'] ?? [];
    $sid = $t['account_sid'] ?? '';
    $tok = $t['auth_token'] ?? '';
    $va  = $t['verify_service_sid'] ?? '';
    if ($sid === '' || $tok === '' || $va === '') {
        return ['ok' => false, 'error' => 'Service Verify non configuré'];
    }

    // Canal configurable : 'whatsapp' (défaut) ou 'sms' (repli)
    $channel = $t['verify_channel'] ?? 'whatsapp';
    $fields = [
        'To'      => twilio_e164($phone),
        'Channel' => $channel,
    ];
    // Locale : doit correspondre à la langue du template WhatsApp approuvé (ex. 'en' ou 'fr')
    if (!empty($t['verify_locale'])) {
        $fields['Locale'] = $t['verify_locale'];
    }
    $url  = "https://verify.twilio.com/v2/Services/{$va}/Verifications";
    $resp = twilio_post($url, $sid, $tok, $fields);
    if ($resp['http'] >= 200 && $resp['http'] < 300) {
        return ['ok' => true, 'status' => $resp['json']['status'] ?? ''];
    }
    return ['ok' => false, 'error' => $resp['json']['message'] ?? "HTTP {$resp['http']}"];
}

/**
 * Twilio Verify — vérifie un code OTP.
 * @return bool true si le code est approuvé.
 */
function twilio_verify_check(string $phone, string $code): bool
{
    global $CONFIG;
    $t = $CONFIG['twilio'] ?? [];
    $sid = $t['account_sid'] ?? '';
    $tok = $t['auth_token'] ?? '';
    $va  = $t['verify_service_sid'] ?? '';
    if ($sid === '' || $tok === '' || $va === '') {
        return false;
    }

    $url  = "https://verify.twilio.com/v2/Services/{$va}/VerificationCheck";
    $resp = twilio_post($url, $sid, $tok, [
        'To'   => twilio_e164($phone),
        'Code' => $code,
    ]);
    return ($resp['http'] >= 200 && $resp['http'] < 300)
        && (($resp['json']['status'] ?? '') === 'approved');
}

/** POST form-urlencoded vers l'API Twilio (Basic Auth). */
function twilio_post(string $url, string $sid, string $tok, array $fields): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query($fields),
        CURLOPT_USERPWD        => "{$sid}:{$tok}",
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
    ]);
    $body = curl_exec($ch);
    $http = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['http' => $http, 'json' => json_decode((string) $body, true) ?: []];
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
