<?php
/**
 * /api/vcheck.php?token=XXXX[&phone=+33...]
 *
 * Diagnostic TEMPORAIRE de la config Twilio Verify. À SUPPRIMER après usage.
 * Vérifie que les clés Twilio sont présentes, et (avec &phone=) tente un envoi
 * Verify en affichant la réponse brute de Twilio.
 */

declare(strict_types=1);
header('Content-Type: text/plain; charset=utf-8');

$C = require __DIR__ . '/config.php';
if (($_GET['token'] ?? '') !== ($C['install_token'] ?? '_')) {
    http_response_code(403);
    exit("token invalide\n");
}

$t = $C['twilio'] ?? [];
echo "account_sid : " . (empty($t['account_sid']) ? 'MANQUANT' : substr($t['account_sid'], 0, 6) . '…') . "\n";
echo "auth_token  : " . (empty($t['auth_token'])  ? 'MANQUANT' : 'présent') . "\n";
echo "verify_sid  : " . (empty($t['verify_service_sid']) ? 'MANQUANT' : $t['verify_service_sid']) . "\n";

$phone = $_GET['phone'] ?? '';
if ($phone === '') { echo "\n(ajoute &phone=+33783318138 pour tester l'envoi)\n"; exit; }
if (empty($t['verify_service_sid'])) { echo "\nImpossible de tester : verify_service_sid manquant.\n"; exit; }

$va = $t['verify_service_sid'];
$ch = curl_init("https://verify.twilio.com/v2/Services/{$va}/Verifications");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => http_build_query(['To' => $phone, 'Channel' => 'whatsapp']),
    CURLOPT_USERPWD        => $t['account_sid'] . ':' . $t['auth_token'],
    CURLOPT_TIMEOUT        => 15,
]);
$r = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
echo "\nRéponse Twilio (HTTP {$code}) :\n" . $r . "\n";
echo "\n⚠️  SUPPRIME vcheck.php après le test.\n";
