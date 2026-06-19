<?php
/**
 * /api/dcheck.php?token=XXXX[&lead=L-12]
 * Diagnostic TEMPORAIRE réception WhatsApp. À SUPPRIMER après usage.
 */
declare(strict_types=1);
header('Content-Type: text/plain; charset=utf-8');

$C = require __DIR__ . '/config.php';
if (($_GET['token'] ?? '') !== ($C['install_token'] ?? '_')) { http_response_code(403); exit("token invalide\n"); }

$c = $C['db'];
try {
    $pdo = new PDO("mysql:host={$c['host']};port=" . ($c['port'] ?? 3306) . ";dbname={$c['name']};charset=utf8mb4",
        $c['user'], $c['password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (Throwable $e) { exit('DB KO: ' . $e->getMessage() . "\n"); }

echo "=== Colonnes de `conversations` ===\n";
$cols = [];
foreach ($pdo->query("SHOW COLUMNS FROM conversations") as $r) { $cols[] = $r['Field']; echo "  - {$r['Field']}\n"; }
foreach (['media_json','twilio_sid','status','author_user_id'] as $need) {
    echo "  " . (in_array($need, $cols, true) ? "✔" : "✗ MANQUANT") . " {$need}\n";
}

echo "\n=== 5 derniers messages (toutes convs) ===\n";
foreach ($pdo->query("SELECT id, lead_id, author, LEFT(message,40) m, sent_at FROM conversations ORDER BY id DESC LIMIT 5") as $r) {
    echo "  #{$r['id']} lead={$r['lead_id']} [{$r['author']}] {$r['m']} @ {$r['sent_at']}\n";
}

$lead = $_GET['lead'] ?? '';
if ($lead !== '') {
    $dbId = (int) preg_replace('/^L-/', '', $lead);
    echo "\n=== Test requête d'affichage pour lead {$dbId} ===\n";
    try {
        $s = $pdo->prepare('SELECT c.author, c.message, c.media_json, c.status, c.sent_at, u.name AS agent_name
            FROM conversations c LEFT JOIN users u ON u.id = c.author_user_id
            WHERE c.lead_id = ? ORDER BY c.sent_at ASC');
        $s->execute([$dbId]);
        $rows = $s->fetchAll(PDO::FETCH_ASSOC);
        echo "  OK — " . count($rows) . " message(s)\n";
        foreach (array_slice($rows, -6) as $r) {
            echo "    [{$r['author']}] " . substr((string)$r['message'], 0, 40) . " | status=" . ($r['status'] ?? '-') . "\n";
        }
    } catch (Throwable $e) {
        echo "  ‼ ERREUR SQL : " . $e->getMessage() . "\n";
    }
}
echo "\n⚠️ Supprime dcheck.php après.\n";
