<?php
/**
 * Applique schema.sql (CREATE IF NOT EXISTS + ALTER). Les erreurs attendues
 * sur base déjà à jour (« duplicate column », « table exists ») sont ignorées.
 * À lancer après chaque changement de schéma.
 *
 * En ligne de commande, sur le serveur — voie recommandée :
 *
 *   php api/migrate.php LE_TOKEN
 *
 * L'accès HTTP est refusé par api/.htaccess. C'est plus sûr que de supprimer le
 * fichier après usage comme le prévoyait la version précédente : le dossier
 * api/ étant redéployé depuis le dépôt à chaque push, la suppression ne tenait
 * que jusqu'au déploiement suivant.
 */

declare(strict_types=1);

/*
 * L'hébergement expose PHP en SAPI CGI, pas CLI : tester `PHP_SAPI === 'cli'`
 * ne suffit pas. Le vrai critère est l'absence de requête HTTP en cours.
 */
$isCli = PHP_SAPI === 'cli' || !isset($_SERVER['REQUEST_METHOD']);
if (!$isCli) {
    header('Content-Type: text/plain; charset=utf-8');
}

$CONFIG = require __DIR__ . '/config.php';

/*
 * Hors requête HTTP, le token vient du premier argument. `$argv` n'existe que
 * si `register_argc_argv` est actif — ce n'est pas garanti en CGI, d'où le
 * repli sur la variable d'environnement KRE_INSTALL_TOKEN.
 */
$token = $isCli
    ? ($argv[1] ?? getenv('KRE_INSTALL_TOKEN') ?: '')
    : ($_GET['token'] ?? '');
if ($token !== ($CONFIG['install_token'] ?? '_')) {
    if (!$isCli) {
        http_response_code(403);
    }
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
if (!$isCli) {
    echo "\n⚠️  Accès HTTP : préférez `php api/migrate.php LE_TOKEN` en ligne de commande.\n";
}
