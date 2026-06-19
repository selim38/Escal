<?php
/**
 * /api/devis.php?id=L-12&t=<token>
 * Devis en PDF (FPDF) affiché dans le navigateur. Auth par token en query.
 */

require __DIR__ . '/bootstrap.php';
require __DIR__ . '/devis-lib.php';

$uid = auth_verify_token((string) ($_GET['t'] ?? ''));
if ($uid === null) { http_response_code(401); exit('Non autorisé'); }

$dbId = db_id((string) ($_GET['id'] ?? ''));
$lead = devis_load_lead(db(), $dbId);
if (!$lead) { http_response_code(404); exit('Lead introuvable'); }

$pdf = devis_build_fpdf($lead);
$name = 'Devis-KRE-' . str_pad((string) $dbId, 5, '0', STR_PAD_LEFT) . '.pdf';
$pdf->Output('I', $name);   // I = inline (affichage navigateur, téléchargeable)
