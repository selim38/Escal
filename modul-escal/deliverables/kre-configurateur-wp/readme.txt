=== KRE — Configurateur de devis ===
Contributors: pointsoft
Requires at least: 6.3
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.5.0
License: GPL-2.0-or-later

Intègre le configurateur de devis Kit Rénovation Escalier dans une page
WordPress via le Web Component <kre-configurateur> (Shadow DOM, sans iframe).

== Installation ==

1. Copier le dossier `kre-configurateur-wp/` dans `wp-content/plugins/`.
2. Activer « KRE — Configurateur de devis » dans Plugins.
3. Insérer `[kre_configurateur]` dans la page souhaitée.

Aucune page de réglages : la configuration passe par les attributs du shortcode
et, pour l'environnement, par deux constantes dans `wp-config.php`.

== Environnements ==

Par défaut le plugin pointe vers la production. Pour le staging, ajouter dans
`wp-config.php`, AVANT la ligne `require_once ABSPATH . 'wp-settings.php';` :

    define('KRE_SCRIPT_URL',   'https://escal.point-soft.fr/wc/staging/kre-configurateur.js');
    define('KRE_API_ENDPOINT', 'https://escal.point-soft.fr/api');

== Attributs du shortcode ==

* `lang`             — langue d'affichage. `fr` uniquement en version 1.
* `theme`            — identifiant de thème CSS. Défaut `kre`.
* `endpoint`         — base de l'API Point Soft. Défaut : constante KRE_API_ENDPOINT.
* `recipient_email`  — adresse destinataire des demandes. Doit figurer dans
                       l'allowlist du serveur, sinon elle est ignorée côté API.
* `confirmation_url` — redirection après envoi. Vide = écran de succès interne.
* `sample_cta`       — `true` pour afficher le CTA « Demander un échantillon ».
                       Nécessite `recipient_email`.
* `header`           — `false` pour masquer le titre interne du composant quand
                       la page WordPress porte déjà son propre titre.

Exemples :

    [kre_configurateur]
    [kre_configurateur header="false"]
    [kre_configurateur sample_cta="true" recipient_email="contact@escal-concept.fr"]
    [kre_configurateur confirmation_url="/demande-envoyee/"]

== Intégration sans le plugin ==

Le plugin n'est qu'une commodité. Un bloc HTML suffit :

    <script src="https://escal.point-soft.fr/wc/v1.5.0/kre-configurateur.js" type="module" defer></script>
    <kre-configurateur lang="fr" theme="kre"></kre-configurateur>

`type="module"` est nécessaire : le bundle est un module ES et utilise
`import.meta.url` pour résoudre l'URL de ses images.

== Notes techniques ==

* Le script n'est chargé que sur les pages contenant le shortcode.
* Le composant écrit trois éléments dans `document.head` : la déclaration
  `@font-face` de sa police, son préchargement, et les propriétés CSS
  enregistrées de Tailwind (une `@property` est ignorée dans un shadow root).
  Rien d'autre ne sort du Shadow DOM.
* Les événements de tunnel sont poussés dans `window.dataLayer`, directement
  exploitables par Google Tag Manager.
