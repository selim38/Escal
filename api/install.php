<?php
/**
 * /api/install.php?token=XXXX
 *
 * Crée les tables (idempotent — CREATE TABLE IF NOT EXISTS + INSERT … ON
 * DUPLICATE KEY) dans la base configurée (config.php). À lancer UNE fois
 * depuis le navigateur, puis À SUPPRIMER du serveur.
 *
 *   https://escal.point-soft.fr/api/install.php?token=LE_TOKEN
 *
 * Le token est défini dans config.php (clé 'install_token').
 */

declare(strict_types=1);
header('Content-Type: text/plain; charset=utf-8');

$CONFIG = require __DIR__ . '/config.php';

// ─── Garde-fou : token obligatoire ──────────────────────────────────────────
$expected = $CONFIG['install_token'] ?? '';
$given    = $_GET['token'] ?? '';
if ($expected === '' || !hash_equals($expected, $given)) {
    http_response_code(403);
    exit("Accès refusé : token invalide ou manquant.\n");
}

// ─── Connexion ──────────────────────────────────────────────────────────────
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

echo "Connexion OK à la base « {$c['name']} ».\n\n";

// ─── Lecture + découpage du schéma ──────────────────────────────────────────
$sqlFile = __DIR__ . '/schema.sql';
if (!is_file($sqlFile)) {
    http_response_code(500);
    exit("schema.sql introuvable à côté de install.php.\n");
}
$sql = file_get_contents($sqlFile) ?: '';

// Retire les commentaires en début de ligne (-- …)
$lines = array_filter(
    explode("\n", $sql),
    static fn ($l) => !preg_match('/^\s*--/', $l)
);
$sql = implode("\n", $lines);

// Découpe par ";" en fin d'instruction
$statements = array_filter(
    array_map('trim', explode(";\n", $sql . "\n")),
    static fn ($s) => $s !== ''
);

$ok = 0; $fail = 0;
foreach ($statements as $stmt) {
    $stmt = rtrim($stmt, ";\n ");
    if ($stmt === '') continue;
    try {
        $pdo->exec($stmt);
        $label = preg_replace('/\s+/', ' ', substr($stmt, 0, 60));
        echo "✔ $label…\n";
        $ok++;
    } catch (Throwable $e) {
        echo "�‼ ERREUR : " . $e->getMessage() . "\n   sur : " . substr($stmt, 0, 80) . "…\n";
        $fail++;
    }
}

echo "\n--- Terminé : $ok instruction(s) OK, $fail erreur(s). ---\n";
echo "\nTables présentes :\n";
foreach ($pdo->query('SHOW TABLES') as $row) {
    echo '  - ' . implode('', $row) . "\n";
}

echo "\n⚠️  SUPPRIME ce fichier install.php du serveur maintenant.\n";
