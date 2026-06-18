<?php
/**
 * /api/photos.php
 *   POST (multipart/form-data) → upload des photos client d'un lead
 *   champs : leadId (string), photos[] (fichiers)
 *   ← remplace modul POST /api/photos
 */

require __DIR__ . '/bootstrap.php';

if (method() !== 'POST') {
    json_error('Méthode non autorisée', 405);
}

$leadId = $_POST['leadId'] ?? '';
if ($leadId === '') {
    json_error('leadId manquant', 400);
}
$dbId = db_id((string) $leadId);

if (empty($_FILES['photos'])) {
    json_out(['ok' => true, 'paths' => []]);
}

global $CONFIG;
$baseDir   = rtrim($CONFIG['uploads_dir'] ?? (__DIR__ . '/uploads'), '/');
$uploadDir = "$baseDir/leads/$leadId";
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
    json_error('Impossible de créer le dossier d\'upload', 500);
}

$allowedExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic'];
$saved = [];

// Normalise la structure $_FILES (multi-fichiers)
$files = $_FILES['photos'];
$count = is_array($files['name']) ? count($files['name']) : 1;

for ($i = 0; $i < $count; $i++) {
    $error = is_array($files['error']) ? $files['error'][$i] : $files['error'];
    if ($error !== UPLOAD_ERR_OK) {
        continue;
    }
    $tmp  = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
    $name = is_array($files['name']) ? $files['name'][$i] : $files['name'];

    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION) ?: 'jpg');
    if (!in_array($ext, $allowedExt, true)) {
        continue;
    }
    $filename = sprintf('%d-%s.%s', time(), bin2hex(random_bytes(6)), $ext);
    $dest     = "$uploadDir/$filename";

    if (move_uploaded_file($tmp, $dest)) {
        $saved[] = "uploads/leads/$leadId/$filename";
    }
}

if ($saved) {
    try {
        db()->prepare('UPDATE leads SET photos_json = ? WHERE id = ?')
            ->execute([json_encode($saved, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), $dbId]);
    } catch (Throwable $e) {
        json_error('Erreur enregistrement photos', 500, $e);
    }
}

json_out(['ok' => true, 'paths' => $saved]);
