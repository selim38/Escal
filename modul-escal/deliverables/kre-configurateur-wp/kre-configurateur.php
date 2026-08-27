<?php
/**
 * Plugin Name:       KRE — Configurateur de devis
 * Plugin URI:        https://escal.point-soft.fr/calcul
 * Description:       Intègre le configurateur de devis Kit Rénovation Escalier dans une page WordPress, via le Web Component <kre-configurateur> (Shadow DOM, sans iframe). Shortcode [kre_configurateur].
 * Version:           1.1.0
 * Requires at least: 6.3
 * Requires PHP:      7.4
 * Author:            Point Soft
 * Author URI:        https://point-soft.com
 * License:           GPL-2.0-or-later
 * Text Domain:       kre-configurateur
 *
 * Fourni par Point Soft à Knewledge en complément du fichier JS. Le cahier des
 * charges laisse l'intégration au choix de Knewledge (widget HTML ou shortcode) :
 * ce plugin est la variante shortcode, prête à activer.
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

/**
 * URL du bundle. Surchargeable depuis wp-config.php pour basculer entre
 * environnements sans toucher au plugin :
 *
 *   define('KRE_SCRIPT_URL', 'https://escal.point-soft.fr/wc/staging/kre-configurateur.js');
 *   define('KRE_API_ENDPOINT', 'https://escal.point-soft.fr/api');
 */
if (!defined('KRE_SCRIPT_URL')) {
    define('KRE_SCRIPT_URL', 'https://escal.point-soft.fr/wc/v1.1.0/kre-configurateur.js');
}
if (!defined('KRE_API_ENDPOINT')) {
    define('KRE_API_ENDPOINT', 'https://escal.point-soft.fr/api');
}

const KRE_HANDLE  = 'kre-configurateur';
const KRE_VERSION = '1.1.0';

/**
 * Enregistre le script sans le charger : il ne sera mis en file d'attente que
 * sur les pages qui utilisent réellement le shortcode (cf. kre_render_shortcode).
 * Évite d'alourdir toutes les pages du site.
 */
function kre_register_assets(): void
{
    // Le bundle est un module ES : le type est forcé plus bas via un filtre.
    wp_register_script(KRE_HANDLE, KRE_SCRIPT_URL, [], KRE_VERSION, false);

    // Chargement non bloquant, exigence de performance du cahier des charges.
    // Un script type="module" est déjà différé par défaut ; on pose `defer`
    // en plus pour couvrir un éventuel filtre de thème qui retirerait le type.
    // `strategy` requiert WordPress 6.3.
    wp_script_add_data(KRE_HANDLE, 'strategy', 'defer');
}
add_action('wp_enqueue_scripts', 'kre_register_assets');

/**
 * Le bundle est publié au format ES module (`format: "es"`) : sans
 * type="module", le navigateur refuse `import.meta.url`, dont le composant se
 * sert pour résoudre l'URL de ses images.
 */
function kre_script_type(string $tag, string $handle): string
{
    if ($handle !== KRE_HANDLE) {
        return $tag;
    }

    return str_replace('<script ', '<script type="module" ', $tag);
}
add_filter('script_loader_tag', 'kre_script_type', 10, 2);

/**
 * Attributs acceptés par le shortcode → attributs du custom element.
 *
 * La liste est volontairement fermée : seuls ces attributs sont transmis, ce qui
 * évite qu'un rédacteur injecte du HTML arbitraire dans la balise.
 */
function kre_attribute_map(): array
{
    return [
        'lang'             => 'lang',
        'theme'            => 'theme',
        'endpoint'         => 'endpoint',
        'recipient_email'  => 'recipient-email',
        'confirmation_url' => 'confirmation-url',
        'sample_cta'       => 'show-sample-cta',
        'header'           => 'show-header',
    ];
}

/**
 * [kre_configurateur]
 *
 * Exemples :
 *   [kre_configurateur]
 *   [kre_configurateur sample_cta="true" recipient_email="contact@escal-concept.fr"]
 *   [kre_configurateur header="false" confirmation_url="/merci/"]
 */
function kre_render_shortcode($atts): string
{
    $atts = shortcode_atts(
        [
            'lang'             => 'fr',
            'theme'            => 'kre',
            'endpoint'         => KRE_API_ENDPOINT,
            'recipient_email'  => '',
            'confirmation_url' => '',
            'sample_cta'       => '',
            'header'           => '',
        ],
        (array) $atts,
        'kre_configurateur'
    );

    wp_enqueue_script(KRE_HANDLE);

    $html = '<kre-configurateur';

    foreach (kre_attribute_map() as $shortcodeKey => $attribute) {
        $value = trim((string) $atts[$shortcodeKey]);
        if ($value === '') {
            continue;
        }

        // Les URLs passent par esc_url pour rejeter javascript: et data:.
        if (in_array($attribute, ['endpoint', 'confirmation-url'], true)) {
            $value = esc_url_raw($value);
            if ($value === '') {
                continue;
            }
        }

        if ($attribute === 'recipient-email') {
            $value = sanitize_email($value);
            if ($value === '' || !is_email($value)) {
                continue;
            }
        }

        $html .= sprintf(' %s="%s"', $attribute, esc_attr($value));
    }

    // Un custom element n'est jamais auto-fermant : la balise fermante est
    // obligatoire, sinon le reste de la page devient son contenu.
    return $html . '></kre-configurateur>';
}
add_shortcode('kre_configurateur', 'kre_render_shortcode');

/**
 * Autorise la balise dans le HTML filtré (éditeur, widget HTML) pour les rôles
 * qui n'ont pas la capacité `unfiltered_html`.
 */
function kre_allow_tag(array $tags): array
{
    $attributes = ['class' => true, 'id' => true, 'style' => true];
    foreach (kre_attribute_map() as $attribute) {
        $attributes[$attribute] = true;
    }
    $tags['kre-configurateur'] = $attributes;

    return $tags;
}
add_filter('wp_kses_allowed_html', static function ($tags, $context) {
    return $context === 'post' ? kre_allow_tag((array) $tags) : $tags;
}, 10, 2);
