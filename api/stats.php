<?php
/**
 * /api/stats.php  (GET, authentifié)
 * Statistiques du dashboard. Renvoie le nombre de messages WhatsApp échangés
 * par heure sur les dernières 24h.
 *   { total: int, hourly: int[24] }  (index = heure 0..23, UTC)
 */

require __DIR__ . '/bootstrap.php';
require_auth();

$hourly = array_fill(0, 24, 0);

// Décalage heure française courant (gère automatiquement l'heure d'été)
$offset = (new DateTimeZone('Europe/Paris'))->getOffset(new DateTime('now', new DateTimeZone('UTC')));

try {
    // sent_at est en UTC → on décale vers l'heure de Paris avant de grouper par heure
    $stmt = db()->prepare(
        "SELECT HOUR(DATE_ADD(sent_at, INTERVAL ? SECOND)) AS h, COUNT(*) AS c
         FROM conversations
         WHERE sent_at >= (NOW() - INTERVAL 24 HOUR)
         GROUP BY h"
    );
    $stmt->execute([$offset]);
    foreach ($stmt->fetchAll() as $r) {
        $h = (int) $r['h'];
        if ($h >= 0 && $h < 24) $hourly[$h] = (int) $r['c'];
    }
} catch (Throwable $e) {
    json_error('DB error', 500, $e);
}

json_out(['total' => array_sum($hourly), 'hourly' => $hourly]);
