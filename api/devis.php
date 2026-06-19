<?php
/**
 * /api/devis.php?id=L-12&t=<token>
 *
 * Devis A4 imprimable (HTML → "Enregistrer en PDF" du navigateur).
 * Respecte la configuration du lead + détaille le kit matériel inclus.
 * Auth par token en query (les liens/onglets ne peuvent pas porter d'en-tête).
 */

require __DIR__ . '/bootstrap.php';

// ─── Auth via token query ───────────────────────────────────────────────────
$uid = auth_verify_token((string) ($_GET['t'] ?? ''));
if ($uid === null) {
    http_response_code(401);
    exit('Non autorisé');
}

$dbId = db_id((string) ($_GET['id'] ?? ''));
$stmt = db()->prepare('SELECT * FROM leads WHERE id = ?');
$stmt->execute([$dbId]);
$l = $stmt->fetch();
if (!$l) { http_response_code(404); exit('Lead introuvable'); }

// ─── Libellés ───────────────────────────────────────────────────────────────
$DECOR = [
    'CHENE_NATUREL'=>'Chêne Naturel','CHENE_VINTAGE'=>'Chêne Vintage','CHENE_VINTAGE_GRIS'=>'Chêne Vintage Gris',
    'CHENE_CERUSE'=>'Chêne Cérusé','NOYER'=>'Noyer','NOYER_BLANC'=>'Noyer Blanc','HETRE'=>'Hêtre',
    'PIN_RUSTIQUE'=>'Pin Rustique','GRIS_MINERAL'=>'Gris Minéral','PIERRE_ANTHRACITE'=>'Pierre Anthracite',
    'PIERRE_BETON_GRIS'=>'Pierre Béton Gris',
];
$RISER = ['NONE'=>'Sans contremarche','DECOR'=>'Couleur du décor','BLACK_MATTE'=>'Noir mat','WHITE_MATTE'=>'Blanc mat'];
$WIDTH = ['W_LT_800'=>'< 800 mm','W_801_1000'=>'801–1000 mm','W_1001_1300'=>'1001–1300 mm','W_1301_1600'=>'1301–1600 mm','W_1601_1800'=>'1601–1800 mm'];
$DEPTH = ['D_LT_320'=>'< 320 mm','D_GT_320'=>'> 320 mm'];
$ENDCAP = ['NONE'=>'Sans embout','OPEN_STEP'=>'Marche ouverte','OVERHANGING'=>'Marche débordante'];
$LANDING = ['NONE'=>'Sans palier','NEZ_SEUIL'=>'Nez + seuil','NEZ_RACCORD_PARQUET'=>'Nez de raccord parquet'];

$lbl = static fn(array $map, $k) => $k !== null && isset($map[$k]) ? $map[$k] : ($k ?: '—');
$esc = static fn($s) => htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');

$stepCount = (int) $l['step_count'];
$decor     = $lbl($DECOR, $l['decor']);
$riser     = $lbl($RISER, $l['riser_option']);
$endcap    = $lbl($ENDCAP, $l['step_end_cap']);
$priceTTC  = $l['estimated_materials_eur'] !== null ? (float) $l['estimated_materials_eur'] : 0;
$priceHT   = $priceTTC > 0 ? $priceTTC / 1.2 : 0;     // TVA 20% (devis indicatif)
$tva       = $priceTTC - $priceHT;
$glueDoses = (int) ceil($stepCount / 3);

$devisNo = 'KRE-' . str_pad((string) $dbId, 5, '0', STR_PAD_LEFT);
$today   = date('d/m/Y');

// ─── Composition du kit inclus ──────────────────────────────────────────────
$kit = [];
$kit[] = [$stepCount . ' marche(s) rénovation', "Décor « {$decor} »"
    . ($l['width_band'] ? ' · L ' . $lbl($WIDTH, $l['width_band']) : '')
    . ($l['depth_band'] ? ' · P ' . $lbl($DEPTH, $l['depth_band']) : '')];
if ($l['riser_option'] !== 'NONE') {
    $kit[] = [$stepCount . ' contremarche(s)', $riser];
}
if ($l['step_end_cap'] !== 'NONE') {
    $kit[] = ['Embouts de marche', $endcap];
}
$kit[] = ['Colle de fixation', $glueDoses . ' dose(s) (1 pour 3 marches)'];
if ((int) $l['intermediate_landing'] === 1) {
    $kit[] = ['Palier intermédiaire', $lbl($LANDING, $l['landing_finish'])];
}
if ((int) $l['open_sides'] === 1) {
    $kit[] = ['Finition côté(s) ouvert(s)', 'Incluse'];
}
$kit[] = ['Visserie & accessoires de pose', 'Inclus'];
$kit[] = ['Notice de pose', 'Incluse'];
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Devis <?= $esc($devisNo) ?> — Kit Rénovation Escalier</title>
<style>
  :root { --accent:#E8743C; --ink:#1c1917; --muted:#6b6560; --line:#e7e2dc; }
  * { box-sizing:border-box; }
  body { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif; color:var(--ink); margin:0; background:#f3f1ee; }
  .sheet { background:#fff; max-width:760px; margin:18px auto; padding:42px 46px; box-shadow:0 6px 24px rgba(0,0,0,.08); }
  .top { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid var(--accent); padding-bottom:18px; }
  .brand { font-size:20px; font-weight:800; color:var(--accent); letter-spacing:-.01em; }
  .brand small { display:block; font-size:11px; font-weight:600; color:var(--muted); letter-spacing:.12em; text-transform:uppercase; }
  .doc { text-align:right; font-size:12.5px; color:var(--muted); }
  .doc b { color:var(--ink); font-size:15px; }
  h2 { font-size:12px; text-transform:uppercase; letter-spacing:.1em; color:var(--muted); margin:26px 0 8px; }
  .client { font-size:13.5px; line-height:1.6; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th { text-align:left; background:#faf7f4; color:var(--muted); font-size:11px; text-transform:uppercase; letter-spacing:.05em; padding:8px 10px; border-bottom:1px solid var(--line); }
  td { padding:9px 10px; border-bottom:1px solid var(--line); vertical-align:top; }
  td.det { color:var(--muted); }
  .totals { margin-top:18px; margin-left:auto; width:280px; font-size:13.5px; }
  .totals div { display:flex; justify-content:space-between; padding:6px 0; }
  .totals .grand { border-top:2px solid var(--accent); margin-top:6px; padding-top:10px; font-size:18px; font-weight:800; color:var(--accent); }
  .note { margin-top:26px; font-size:11.5px; color:var(--muted); line-height:1.6; border-top:1px solid var(--line); padding-top:14px; }
  .actions { text-align:center; margin:16px; }
  .btn { background:var(--accent); color:#fff; border:none; padding:11px 22px; border-radius:8px; font-size:14px; font-weight:700; cursor:pointer; }
  @media print { body{background:#fff;} .sheet{box-shadow:none; margin:0; max-width:none;} .actions{display:none;} }
</style>
</head>
<body>
  <div class="actions">
    <button class="btn" onclick="window.print()">Imprimer / Enregistrer en PDF</button>
  </div>
  <div class="sheet">
    <div class="top">
      <div class="brand">Kit Rénovation Escalier<small>Escaliers sur mesure</small></div>
      <div class="doc">
        <b>DEVIS <?= $esc($devisNo) ?></b><br>
        Date : <?= $esc($today) ?><br>
        Validité : 30 jours
      </div>
    </div>

    <h2>Client</h2>
    <div class="client">
      <b><?= $esc(trim($l['first_name'].' '.$l['last_name'])) ?></b><br>
      <?= $esc($l['email']) ?><br>
      <?= $esc($l['phone']) ?><?= $l['country'] ? ' · '.$esc($l['country']) : '' ?>
    </div>

    <h2>Composition du kit — inclus dans le prix</h2>
    <table>
      <thead><tr><th style="width:42%">Élément</th><th>Détail</th></tr></thead>
      <tbody>
        <?php foreach ($kit as $row): ?>
        <tr><td><?= $esc($row[0]) ?></td><td class="det"><?= $esc($row[1]) ?></td></tr>
        <?php endforeach; ?>
      </tbody>
    </table>

    <div class="totals">
      <div><span>Total HT</span><span><?= number_format($priceHT, 2, ',', ' ') ?> €</span></div>
      <div><span>TVA 20 %</span><span><?= number_format($tva, 2, ',', ' ') ?> €</span></div>
      <div class="grand"><span>Total TTC</span><span><?= number_format($priceTTC, 2, ',', ' ') ?> €</span></div>
    </div>

    <div class="note">
      Devis estimatif établi à partir de la configuration transmise par le client. Le kit comprend
      l'ensemble des matériaux listés ci-dessus, prêts à poser. Hors pose, sauf mention contraire.
      Prix indicatif susceptible d'ajustement après prise de mesures définitive.
      Kit Rénovation Escalier — devis n° <?= $esc($devisNo) ?>.
    </div>
  </div>
</body>
</html>
