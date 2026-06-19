<?php
/**
 * /api/migrate.php?token=XXXX
 *
 * Applique schema.sql (CREATE IF NOT EXISTS + ALTER). Les erreurs attendues
 * sur base déjà à jour (« duplicate column », « table exists ») sont ignorées.
 * À lancer UNE fois après un changement de schéma, puis À SUPPRIMER.
 *
 *   https://escal.point-soft.fr/api/migrate.php?token=LE_TOKEN
 */

declare(strict_types=1);
header('Content-Type: text/plain; charset=utf-8');

$CONFIG = require __DIR__ . '/config.php';
if (($_GET['token'] ?? '') !== ($CONFIG['install_token'] ?? '_')) {
    http_response_code(403);
    exit("Accès refusé.\n");
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

$ok = 0; $skip = 0;
foreach ($statements as $stmt) {
    $stmt = rtrim($stmt, ";\n ");
    if ($stmt === '') continue;
    try {
        $pdo->exec($stmt);
        echo '✔ ' . preg_replace('/\s+/', ' ', substr($stmt, 0, 60)) . "…\n";
        $ok++;
    } catch (Throwable $e) {
        $msg = $e->getMessage();
        // Erreurs attendues sur base déjà à jour
        if (stripos($msg, 'Duplicate column') !== false || stripos($msg, 'exists') !== false) {
            echo '· déjà présent : ' . preg_replace('/\s+/', ' ', substr($stmt, 0, 50)) . "…\n";
            $skip++;
        } else {
            echo '‼ ' . $msg . "\n";
        }
    }
}

echo "\n--- $ok appliqué(s), $skip déjà présent(s). ---\n";
echo "\n⚠️  SUPPRIME migrate.php du serveur après usage.\n";
