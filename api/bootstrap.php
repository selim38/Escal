<?php
/**
 * Bootstrap commun à tous les endpoints PHP.
 * - Charge la config
 * - Ouvre la connexion PDO (singleton)
 * - Gère CORS + réponses JSON + erreurs
 *
 * Remplace l'équivalent Node de admin-escal/src/lib/db.ts.
 */

declare(strict_types=1);

// ─── Config ──────────────────────────────────────────────────────────────
$CONFIG_PATH = __DIR__ . '/config.php';
if (!is_file($CONFIG_PATH)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'config.php manquant sur le serveur']);
    exit;
}
$CONFIG = require $CONFIG_PATH;

// ─── CORS ──────────────────────────────────────────────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = $CONFIG['cors_allowed_origins'] ?? [];
if ($origin && in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}
// Préflight
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ─── Connexion PDO (singleton via static) ──────────────────────────────────
function db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }
    global $CONFIG;
    $c = $CONFIG['db'];
    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
        $c['host'], $c['port'] ?? 3306, $c['name'], $c['charset'] ?? 'utf8mb4'
    );
    try {
        $pdo = new PDO($dsn, $c['user'], $c['password'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
        // Cohérent avec mysql2 timezone "+00:00"
        $pdo->exec("SET time_zone = '+00:00'");
    } catch (Throwable $e) {
        json_error('Connexion DB impossible', 500, $e);
    }
    return $pdo;
}

// ─── Helpers réponse ────────────────────────────────────────────────────────
function json_out(mixed $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_error(string $message, int $status = 500, ?Throwable $e = null): never
{
    if ($e) {
        error_log('[api] ' . $message . ' :: ' . $e->getMessage());
    }
    json_out(['error' => $message], $status);
}

/** Corps JSON de la requête, en tableau associatif. */
function read_json_body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    if ($raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        json_error('Corps JSON invalide', 400);
    }
    return $data;
}

function method(): string
{
    return $_SERVER['REQUEST_METHOD'] ?? 'GET';
}

/** Convertit l'id "L-12" ou "12" en id numérique de base. */
function db_id(string $leadId): int
{
    return (int) preg_replace('/^L-/', '', $leadId);
}

// ─── Authentification ───────────────────────────────────────────────────────
/** Secret de signature des tokens (stable par serveur, dérivé si non défini). */
function auth_secret(): string
{
    global $CONFIG;
    if (!empty($CONFIG['auth_secret'])) {
        return $CONFIG['auth_secret'];
    }
    // Fallback stable : dépend des secrets déjà présents → pas besoin d'éditer la config.
    return hash('sha256', ($CONFIG['db']['password'] ?? '') . '|' . ($CONFIG['twilio']['auth_token'] ?? ''));
}

/** Fabrique un token signé (type JWT minimal) valable 30 jours. */
function auth_make_token(int $userId): string
{
    $payload = base64_encode(json_encode(['uid' => $userId, 'exp' => time() + 60 * 60 * 24 * 30]));
    $sig     = hash_hmac('sha256', $payload, auth_secret());
    return $payload . '.' . $sig;
}

/** Vérifie un token, renvoie l'id utilisateur ou null. */
function auth_verify_token(string $token): ?int
{
    $parts = explode('.', $token);
    if (count($parts) !== 2) {
        return null;
    }
    [$payload, $sig] = $parts;
    if (!hash_equals(hash_hmac('sha256', $payload, auth_secret()), $sig)) {
        return null;
    }
    $data = json_decode((string) base64_decode($payload), true);
    if (!is_array($data) || ($data['exp'] ?? 0) < time()) {
        return null;
    }
    return (int) $data['uid'];
}

/** Récupère le token (gère les serveurs qui masquent Authorization). */
function bearer_token(): ?string
{
    // 1) En-tête custom X-Auth-Token — jamais filtré par Apache/CGI (le plus fiable)
    if (!empty($_SERVER['HTTP_X_AUTH_TOKEN'])) {
        return trim((string) $_SERVER['HTTP_X_AUTH_TOKEN']);
    }
    // 2) Authorization: Bearer …
    $h = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if ($h === '' && function_exists('getallheaders')) {
        $hs = getallheaders();
        $h = $hs['Authorization'] ?? $hs['authorization'] ?? '';
    }
    if (preg_match('/Bearer\s+(.+)/i', (string) $h, $m)) {
        return trim($m[1]);
    }
    return null;
}

/** Exige un utilisateur authentifié, sinon 401. Renvoie l'id utilisateur. */
function require_auth(): int
{
    $token = bearer_token();
    $uid   = $token ? auth_verify_token($token) : null;
    if ($uid === null) {
        json_error('Non authentifié', 401);
    }
    return $uid;
}

/** Temps relatif en français — réplique relativeTime() de leads/route.ts. */
function relative_time(string $datetimeUtc): string
{
    $then = strtotime($datetimeUtc . ' UTC');
    if ($then === false) {
        return '';
    }
    $diffMin = intdiv(time() - $then, 60);
    if ($diffMin < 1)  return "à l'instant";
    if ($diffMin < 60) return "il y a {$diffMin} min";
    $diffH = intdiv($diffMin, 60);
    if ($diffH < 24)   return "il y a {$diffH} h";
    $diffD = intdiv($diffH, 24);
    if ($diffD === 1)  return 'hier';
    if ($diffD < 7)    return "il y a {$diffD} j";
    return date('d/m/Y', $then);
}
