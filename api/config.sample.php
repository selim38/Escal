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

    // ─── Origines autorisées (CORS) ──────────────────────────────────────
    // Le configurateur est aussi livré en Web Component <kre-configurateur>,
    // intégré dans les pages WordPress de Knewledge : l'appel à leads.php et
    // photos.php part alors d'une AUTRE origine que l'API. Toute origine qui
    // héberge le composant doit figurer ici, sinon la soumission échoue en CORS.
    'cors_allowed_origins' => [
        // Développement
        'http://localhost:3000',   // next dev
        'http://localhost:3001',
        'http://localhost:5174',   // vite dev (build Web Component)
        // Module autonome
        'https://escal.point-soft.fr',
        // WordPress — staging Knewledge
        'https://kitrenovationescalier.knewledge.com',
        // WordPress — production
        'https://kitrenovationescalier.fr',
        'https://www.kitrenovationescalier.fr',
    ],

    // ─── Destinataires autorisés (attribut recipient-email du composant) ──
    // L'attribut est public : il est lisible et modifiable dans le HTML de
    // n'importe quelle page. Sans allowlist, il transformerait l'API en relais
    // d'adresses arbitraires. Une valeur hors liste est ignorée et le lead est
    // enregistré sans destinataire.
    'allowed_recipient_emails' => [
        'contact@escal-concept.fr',
    ],

    // Dossier de stockage des photos clients (relatif à api/ ou absolu)
    // ─── Primotexto (alertes SMS aux commerciaux) ───────────────────────
    'primotexto' => [
        'api_key' => 'VOTRE_CLE_PRIMOTEXTO',
        'sender'  => 'KitRenov',
    ],

    'uploads_dir' => __DIR__ . '/uploads',
];
