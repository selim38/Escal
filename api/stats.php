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
try {
    $rows = db()->query(
        "SELECT HOUR(sent_at) AS h, COUNT(*) AS c
         FROM conversations
         WHERE sent_at >= (NOW() - INTERVAL 24 HOUR)
         GROUP BY HOUR(sent_at)"
    )->fetchAll();
    foreach ($rows as $r) {
        $h = (int) $r['h'];
        if ($h >= 0 && $h < 24) $hourly[$h] = (int) $r['c'];
    }
} catch (Throwable $e) {
    json_error('DB error', 500, $e);
}

json_out(['total' => array_sum($hourly), 'hourly' => $hourly]);
