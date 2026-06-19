<?php
/**
 * Construction du devis en PDF (FPDF). Utilisé par devis.php (affichage)
 * et send-devis.php (envoi WhatsApp).
 */

declare(strict_types=1);
require_once __DIR__ . '/lib/fpdf.php';

/** UTF-8 → windows-1252 pour FPDF (polices coeur). */
function _t(string $s): string
{
    return iconv('UTF-8', 'windows-1252//TRANSLIT', $s) ?: $s;
}

/** Charge un lead par id numérique. */
function devis_load_lead(PDO $pdo, int $dbId): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM leads WHERE id = ?');
    $stmt->execute([$dbId]);
    $l = $stmt->fetch();
    return $l ?: null;
}

/** Construit et renvoie l'instance FPDF du devis. */
function devis_build_fpdf(array $l): FPDF
{
    $DECOR = [
        'CHENE_NATUREL'=>'Chêne Naturel','CHENE_VINTAGE'=>'Chêne Vintage','CHENE_VINTAGE_GRIS'=>'Chêne Vintage Gris',
        'CHENE_CERUSE'=>'Chêne Cérusé','NOYER'=>'Noyer','NOYER_BLANC'=>'Noyer Blanc','HETRE'=>'Hêtre',
        'PIN_RUSTIQUE'=>'Pin Rustique','GRIS_MINERAL'=>'Gris Minéral','PIERRE_ANTHRACITE'=>'Pierre Anthracite',
        'PIERRE_BETON_GRIS'=>'Pierre Béton Gris',
    ];
    $RISER  = ['NONE'=>'Sans contremarche','DECOR'=>'Couleur du décor','BLACK_MATTE'=>'Noir mat','WHITE_MATTE'=>'Blanc mat'];
    $WIDTH  = ['W_LT_800'=>'< 800 mm','W_801_1000'=>'801-1000 mm','W_1001_1300'=>'1001-1300 mm','W_1301_1600'=>'1301-1600 mm','W_1601_1800'=>'1601-1800 mm'];
    $DEPTH  = ['D_LT_320'=>'< 320 mm','D_GT_320'=>'> 320 mm'];
    $ENDCAP = ['NONE'=>'Sans embout','OPEN_STEP'=>'Marche ouverte','OVERHANGING'=>'Marche débordante'];
    $LANDING= ['NONE'=>'Sans palier','NEZ_SEUIL'=>'Nez + seuil','NEZ_RACCORD_PARQUET'=>'Nez de raccord parquet'];
    $lbl = static fn(array $m, $k) => ($k !== null && isset($m[$k])) ? $m[$k] : ($k ?: '-');

    $dbId      = (int) $l['id'];
    $stepCount = (int) $l['step_count'];
    $priceTTC  = $l['estimated_materials_eur'] !== null ? (float) $l['estimated_materials_eur'] : 0;
    $priceHT   = $priceTTC > 0 ? $priceTTC / 1.2 : 0;
    $tva       = $priceTTC - $priceHT;
    $glue      = (int) ceil(max($stepCount, 1) / 3);
    $devisNo   = 'KRE-' . str_pad((string) $dbId, 5, '0', STR_PAD_LEFT);
    $fmt       = static fn(float $n) => number_format($n, 2, ',', ' ') . ' EUR';

    // Kit inclus
    $kit = [];
    $kit[] = [$stepCount . ' marche(s) rénovation',
        'Décor "' . $lbl($DECOR, $l['decor']) . '"'
        . ($l['width_band'] ? ' - L ' . $lbl($WIDTH, $l['width_band']) : '')
        . ($l['depth_band'] ? ' - P ' . $lbl($DEPTH, $l['depth_band']) : '')];
    if ($l['riser_option'] !== 'NONE') $kit[] = [$stepCount . ' contremarche(s)', $lbl($RISER, $l['riser_option'])];
    if ($l['step_end_cap'] !== 'NONE') $kit[] = ['Embouts de marche', $lbl($ENDCAP, $l['step_end_cap'])];
    $kit[] = ['Colle de fixation', $glue . ' dose(s) (1 pour 3 marches)'];
    if ((int) $l['intermediate_landing'] === 1) $kit[] = ['Palier intermédiaire', $lbl($LANDING, $l['landing_finish'])];
    if ((int) $l['open_sides'] === 1) $kit[] = ['Finition côté(s) ouvert(s)', 'Incluse'];
    $kit[] = ['Visserie & accessoires de pose', 'Inclus'];
    $kit[] = ['Notice de pose', 'Incluse'];

    $A = [232, 116, 60];   // accent
    $pdf = new FPDF('P', 'mm', 'A4');
    $pdf->SetMargins(18, 18, 18);
    $pdf->AddPage();

    // En-tête
    $pdf->SetFont('Arial', 'B', 20);
    $pdf->SetTextColor($A[0], $A[1], $A[2]);
    $pdf->Cell(120, 9, _t('Kit Rénovation Escalier'), 0, 2);
    $pdf->SetFont('Arial', '', 9);
    $pdf->SetTextColor(120, 118, 115);
    $pdf->Cell(120, 5, _t('ESCALIERS SUR MESURE'), 0, 0);
    // Bloc devis (droite)
    $pdf->SetXY(120, 18);
    $pdf->SetFont('Arial', 'B', 13);
    $pdf->SetTextColor(28, 25, 23);
    $pdf->Cell(74, 7, _t('DEVIS ' . $devisNo), 0, 2, 'R');
    $pdf->SetFont('Arial', '', 10);
    $pdf->SetTextColor(120, 118, 115);
    $pdf->Cell(74, 5, _t('Date : ' . date('d/m/Y')), 0, 2, 'R');
    $pdf->Cell(74, 5, _t('Validité : 30 jours'), 0, 0, 'R');

    $pdf->SetY(40);
    $pdf->SetDrawColor($A[0], $A[1], $A[2]);
    $pdf->SetLineWidth(0.8);
    $pdf->Line(18, 42, 192, 42);

    // Client
    $pdf->SetY(48);
    $pdf->SetFont('Arial', 'B', 10);
    $pdf->SetTextColor(120, 118, 115);
    $pdf->Cell(0, 6, _t('CLIENT'), 0, 1);
    $pdf->SetFont('Arial', 'B', 12);
    $pdf->SetTextColor(28, 25, 23);
    $pdf->Cell(0, 6, _t(trim($l['first_name'] . ' ' . $l['last_name'])), 0, 1);
    $pdf->SetFont('Arial', '', 10);
    $pdf->SetTextColor(80, 78, 75);
    $pdf->Cell(0, 5, _t($l['email']), 0, 1);
    $pdf->Cell(0, 5, _t($l['phone'] . ($l['country'] ? ' - ' . $l['country'] : '')), 0, 1);

    // Kit
    $pdf->Ln(6);
    $pdf->SetFont('Arial', 'B', 10);
    $pdf->SetTextColor(120, 118, 115);
    $pdf->Cell(0, 6, _t('COMPOSITION DU KIT - INCLUS DANS LE PRIX'), 0, 1);
    $pdf->SetFont('Arial', 'B', 9);
    $pdf->SetFillColor(250, 247, 244);
    $pdf->SetTextColor(120, 118, 115);
    $pdf->Cell(78, 8, _t('  ÉLÉMENT'), 0, 0, 'L', true);
    $pdf->Cell(96, 8, _t('  DÉTAIL'), 0, 1, 'L', true);
    $pdf->SetFont('Arial', '', 10);
    $pdf->SetDrawColor(231, 226, 220);
    $pdf->SetLineWidth(0.2);
    foreach ($kit as $row) {
        $y = $pdf->GetY();
        $pdf->SetTextColor(28, 25, 23);
        $pdf->Cell(78, 8, _t('  ' . $row[0]), 'B', 0);
        $pdf->SetTextColor(110, 108, 105);
        $pdf->Cell(96, 8, _t('  ' . $row[1]), 'B', 1);
    }

    // Totaux
    $pdf->Ln(6);
    $pdf->SetX(112);
    $pdf->SetFont('Arial', '', 10);
    $pdf->SetTextColor(80, 78, 75);
    $pdf->Cell(45, 7, _t('Total HT'), 0, 0);
    $pdf->Cell(35, 7, _t($fmt($priceHT)), 0, 1, 'R');
    $pdf->SetX(112);
    $pdf->Cell(45, 7, _t('TVA 20 %'), 0, 0);
    $pdf->Cell(35, 7, _t($fmt($tva)), 0, 1, 'R');
    $pdf->SetX(112);
    $pdf->SetDrawColor($A[0], $A[1], $A[2]);
    $pdf->SetLineWidth(0.6);
    $pdf->Line(112, $pdf->GetY(), 192, $pdf->GetY());
    $pdf->Ln(2);
    $pdf->SetX(112);
    $pdf->SetFont('Arial', 'B', 14);
    $pdf->SetTextColor($A[0], $A[1], $A[2]);
    $pdf->Cell(45, 9, _t('Total TTC'), 0, 0);
    $pdf->Cell(35, 9, _t($fmt($priceTTC)), 0, 1, 'R');

    // Note
    $pdf->SetY(-44);
    $pdf->SetDrawColor(231, 226, 220);
    $pdf->SetLineWidth(0.2);
    $pdf->Line(18, $pdf->GetY(), 192, $pdf->GetY());
    $pdf->Ln(2);
    $pdf->SetFont('Arial', '', 8.5);
    $pdf->SetTextColor(120, 118, 115);
    $pdf->MultiCell(0, 4.5, _t(
        "Devis estimatif établi à partir de la configuration transmise par le client. Le kit comprend "
        . "l'ensemble des matériaux listés ci-dessus, prêts à poser. Hors pose sauf mention contraire. "
        . "Prix indicatif susceptible d'ajustement après prise de mesures définitive. "
        . "Kit Rénovation Escalier - devis n° " . $devisNo . "."
    ));

    return $pdf;
}
