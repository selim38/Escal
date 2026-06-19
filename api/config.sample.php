<?php
/**
 * Modèle de configuration — À COPIER en `config.php` sur le serveur.
 *
 *   cp config.sample.php config.php
 *
 * `config.php` contient les vrais secrets (DB + Twilio) et n'est JAMAIS
 * commité (voir .gitignore). Ce fichier-ci, sans secrets, sert de référence.
 */

return [
    // ─── Base de données MySQL (panneau IONOS) ───────────────────────────
    'db' => [
        'host'     => 'db5020727221.hosting-data.io',
        'port'     => 3306,
        'name'     => 'NOM_DE_LA_BASE',     // ex. dbs1234567
        'user'     => 'UTILISATEUR',        // ex. dbu1234567
        'password' => 'MOT_DE_PASSE',
        'charset'  => 'utf8mb4',
    ],

    // ─── Twilio WhatsApp ─────────────────────────────────────────────────
    'twilio' => [
        'account_sid'        => 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',  // SID Twilio
        'auth_token'         => 'METTRE_LE_TOKEN_ICI',                  // ⚠️ secret
        'whatsapp_from'      => 'whatsapp:+33XXXXXXXXX',               // numéro WhatsApp
        'verify_service_sid' => 'VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',  // Twilio Verify (codes OTP/reset)
    ],

    // ─── Origines autorisées (CORS) — pour le dev local ──────────────────
    // En prod tout est sur escal.point-soft.fr (même origine), donc inutile,
    // mais on autorise localhost pour développer le frontend en `next dev`.
    'cors_allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://escal.point-soft.fr',
    ],

    // Dossier de stockage des photos clients (relatif à api/ ou absolu)
    // ─── Primotexto (alertes SMS aux commerciaux) ───────────────────────
    'primotexto' => [
        'api_key' => 'VOTRE_CLE_PRIMOTEXTO',
        'sender'  => 'KitRenov',
    ],

    'uploads_dir' => __DIR__ . '/uploads',
];
