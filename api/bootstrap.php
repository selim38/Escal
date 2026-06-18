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
