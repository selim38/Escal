<?php
/**
 * /api/migrate.php?token=XXXX
 *
 * Applique schema.sql de façon idempotente (CREATE TABLE IF NOT EXISTS …).
 * Sert à créer les nouvelles tables (ex. `users`) sur une base existante.
 * À lancer UNE fois depuis le navigateur, puis À SUPPRIMER du serveur.
 *
 *   https://escal.point-soft.fr/api/migrate.php?token=LE_TOKEN
 *
 * Token = clé 'install_token' de config.php.
 */

declare(strict_types=1);
header('Content-Type: text/plain; charset=utf-8');

$CONFIG = require __DIR__ . '/config.php';

$expected = $CONFIG['install_token'] ?? '';
$given    = $_GET['token'] ?? '';
if ($expected === '' || !hash_equals($expected, $given)) {
    http_response_code(403);
    exit("Accès refusé : token invalide ou manquant.\n");
}

$c = $CONFIG['db'];
try {
    $pdo = new PDO(
        sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s',
            $c['host'], $c['port'] ?? 3306, $c['name'], $c['charset'] ?? 'utf8mb4'),
        $c['user'], $c['password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (Throwable $e) {
    http_response_code(500);
    exit('Connexion DB impossible : ' . $e->getMessage() . "\n");
}

$sql = file_get_contents(__DIR__ . '/schema.sql') ?: '';
$sql = implode("\n", array_filter(explode("\n", $sql), static fn ($l) => !preg_match('/^\s*--/', $l)));
$statements = array_filter(array_map('trim', explode(";\n", $sql . "\n")), static fn ($s) => $s !== '');

$ok = 0; $fail = 0;
foreach ($statements as $stmt) {
    $stmt = rtrim($stmt, ";\n ");
    if ($stmt === '') continue;
    try {
        $pdo->exec($stmt);
        echo '✔ ' . preg_replace('/\s+/', ' ', substr($stmt, 0, 60)) . "…\n";
        $ok++;
    } catch (Throwable $e) {
        echo '‼ ' . $e->getMessage() . "\n";
        $fail++;
    }
}

echo "\n--- $ok OK, $fail erreur(s). ---\nTables :\n";
foreach ($pdo->query('SHOW TABLES') as $row) {
    echo '  - ' . implode('', $row) . "\n";
}
echo "\n⚠️  SUPPRIME migrate.php du serveur maintenant.\n";
