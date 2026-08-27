# Configurateur KitRenovationEscalier.fr — Intégration WordPress

> **Version 2.0** — réponse au cahier des charges Knewledge du 2026-08-03 (v1.0).
> Émetteur : Point Soft — Contact technique : selim.kirac@point-soft.com
>
> Cette version **remplace intégralement la v1.0** de ce document, qui proposait
> une intégration par redirection ou iframe. Le cahier des charges ayant tranché
> pour un **Web Component avec Shadow DOM**, les sections « Mode A / Mode B »,
> les recommandations SEO liées à l'iframe et le pont `postMessage` n'ont plus
> d'objet : le composant vit désormais dans le DOM de votre page.

---

## 1. Livrables

| Livrable | Emplacement |
|---|---|
| Bundle JS — production | `https://escal.point-soft.fr/wc/v1.1.0/kre-configurateur.js` |
| Bundle JS — staging | `https://escal.point-soft.fr/wc/staging/kre-configurateur.js` |
| Balise d'intégration | §2 |
| Liste des attributs | §3 |
| Événements dataLayer | §5 |
| Plugin WordPress (optionnel) | `deliverables/kre-configurateur-wp/` |

Les URLs de production sont **versionnées et immuables** : une nouvelle version
est publiée sous un nouveau chemin (`/wc/v1.2.0/`…), jamais en écrasant la
précédente. Vous maîtrisez donc la date de bascule. `staging` est republié à
chaque itération de recette.

**v1.1.0** — logo KitRenovationEscalier.fr dans l'en-tête, et alignement complet
sur la charte graphique : angles droits, police Archivo, titres en brun, couleurs
d'état officielles. Voir §4.3 pour les trois écarts de contraste assumés.

---

## 2. Intégration

```html
<script src="https://escal.point-soft.fr/wc/v1.1.0/kre-configurateur.js"
        type="module" defer></script>

<kre-configurateur lang="fr" theme="kre"></kre-configurateur>
```

Deux points d'attention :

- **`type="module"` est obligatoire.** Le bundle est un module ES et utilise
  `import.meta.url` pour résoudre l'URL de ses propres images depuis notre
  domaine. Sans ce type, le script ne s'exécute pas.
- **La balise fermante est obligatoire.** Un custom element n'est jamais
  auto-fermant : `<kre-configurateur />` ferait passer tout le reste de la page
  pour son contenu. Écrivez toujours `<kre-configurateur></kre-configurateur>`.

Le composant occupe toute la largeur de son conteneur (`display: block`) et gère
sa propre mise en page responsive jusqu'à 320 px. Placez-le dans le conteneur de
votre choix ; il n'a pas besoin de largeur imposée.

### 2.1 Plugin WordPress fourni

Le cahier des charges laisse l'intégration à votre main. Nous fournissons quand
même un plugin minimal, prêt à activer, dans `deliverables/kre-configurateur-wp/` :

1. copier le dossier dans `wp-content/plugins/` ;
2. activer « KRE — Configurateur de devis » ;
3. insérer `[kre_configurateur]` dans la page.

Le script n'est chargé que sur les pages contenant le shortcode. Pour pointer sur
le staging, ajouter dans `wp-config.php` :

```php
define('KRE_SCRIPT_URL',   'https://escal.point-soft.fr/wc/staging/kre-configurateur.js');
define('KRE_API_ENDPOINT', 'https://escal.point-soft.fr/api');
```

Les attributs du shortcode sont documentés dans le `readme.txt` du plugin.

### 2.2 Où poser le shortcode, et comment y amener le trafic

Le schéma prévu est **une page dédiée** de votre WordPress portant le shortcode,
vers laquelle pointent les CTA du reste du site (accueil, pages de service,
articles). Le visiteur ne quitte jamais votre domaine.

```
[ Accueil / page de service ]  ── CTA ──▶  [ /devis/ · shortcode ]
     contenu et SEO                          configurateur intégré
```

C'est le montage recommandé, pour trois raisons :

- **Le tracking fonctionne sans rien faire.** Le composant vit dans votre page,
  donc votre conteneur GTM voit tout l'entonnoir (§5). Un CTA qui sortirait du
  site vers un domaine tiers ferait perdre la mesure du taux d'abandon par
  étape — précisément l'indicateur demandé au §5 du cahier des charges.
- **Le SEO reste chez vous.** Le contenu indexable et le maillage interne vivent
  dans WordPress ; le configurateur est un outil transactionnel en bout de
  parcours, pas une cible de référencement.
- **Le script n'est chargé que là.** Les autres pages ne paient rien.

Les CTA sont de simples liens internes, sans rien de particulier :

```html
<a href="/devis/" class="btn-devis">Calculer mon devis</a>
```

Deux variantes possibles selon la maquette :

- **Configurateur sur la même page que le contenu** — poser le shortcode dans un
  bloc en bas de page et faire pointer les CTA sur une ancre :
  `<a href="#configurateur">`. Entourez le shortcode d'un conteneur portant
  l'`id` correspondant, le composant n'en pose pas lui-même.
- **Plusieurs points d'entrée** — le shortcode peut être posé sur plusieurs
  pages sans précaution particulière. Chaque instance est indépendante (§7) et
  émet son propre `devis_start`.

Si vous voulez distinguer dans GA4 quel CTA a amené le visiteur, ajoutez des
paramètres UTM à vos liens internes : le composant les lit dans l'URL et les
joint à tous ses événements ainsi qu'au lead enregistré (§5).

```html
<a href="/devis/?utm_source=site&utm_medium=cta&utm_content=home-hero">
  Calculer mon devis
</a>
```

---

## 3. Attributs du composant

| Attribut | Type | Défaut | Description |
|---|---|---|---|
| `lang` | string | `fr` | Langue d'affichage. **`fr` seul est disponible en v1** — voir §8. |
| `theme` | string | `kre` | Identifiant de thème CSS. Sélectionne un jeu de tokens de couleur. |
| `endpoint` | URL | `https://escal.point-soft.fr/api` | Base de l'API Point Soft. Permet de pointer une API de recette. |
| `recipient-email` | email | *(vide)* | Destinataire des demandes. Voir §3.2. |
| `confirmation-url` | URL | *(vide)* | Redirection après envoi. Vide = écran de succès interne au composant. |
| `show-sample-cta` | booléen | absent | Affiche le CTA « Demander un échantillon ». Voir §3.3. |
| `assets-base` | URL | *(déduite)* | Base des images. **À ne pas renseigner** en usage normal : elle est déduite de l'URL du script. |
| `show-header` | booléen | `true` | Titre et accroche internes au composant. `false` si votre page porte déjà son propre titre. |
| `demo` | booléen | absent | Simule la soumission sans appeler l'API. Réservé à la recette. |

Les attributs booléens suivent la convention HTML : **la présence de l'attribut
vaut `true`**. `show-sample-cta` et `show-sample-cta="true"` sont équivalents ;
`show-sample-cta="false"` désactive explicitement.

Une valeur invalide (URL malformée, e-mail invalide, langue inconnue) est
**ignorée avec un avertissement dans la console** et la valeur par défaut
s'applique : une faute de frappe côté page ne casse jamais le configurateur.

### 3.1 `endpoint` et environnements

Le même bundle sert le staging et la production ; seul `endpoint` change. C'est
la variante la plus simple à maintenir des deux options prévues par le cahier
des charges (§7).

Toute origine hébergeant le composant doit figurer dans l'allowlist CORS de
notre API. Sont déjà autorisées :

- `https://kitrenovationescalier.knewledge.com`
- `https://kitrenovationescalier.fr` et `https://www.kitrenovationescalier.fr`

**Si vous utilisez un autre domaine ou sous-domaine (préproduction, domaine de
test), signalez-le nous** : sans ajout à l'allowlist, la soumission échoue en
CORS au moment de l'envoi du lead.

### 3.2 `recipient-email`

L'adresse est transmise avec le lead et stockée avec lui. Comme l'attribut est
lisible et modifiable dans le HTML de n'importe quelle page, notre API la
**valide contre une allowlist serveur** : une adresse hors liste est ignorée et
le lead est enregistré sans destinataire. Communiquez-nous les adresses à
autoriser.

Aucun envoi d'e-mail automatique n'est déclenché à ce stade : les leads
continuent d'alimenter le CRM interne Escal. Une notification par e-mail à cette
adresse est une évolution possible (§8).

### 3.3 `show-sample-cta`

Le CTA « Demander un échantillon » ouvre un `mailto:` pré-rempli vers
`recipient-email`, avec le décor sélectionné dans le corps du message. Il
apparaît à l'étape Décor et sur l'étape Coordonnées.

`recipient-email` est donc **requis** : sans destinataire, le CTA n'est pas
affiché (un `mailto:` sans adresse ne mène à rien) et un avertissement est
loggué.

Si vous souhaitez un véritable flux « échantillon » (formulaire avec adresse
postale, enregistrement en base, suivi côté CRM) plutôt qu'un `mailto:`,
c'est une évolution à cadrer — dites-nous ce que vous attendez du parcours.

---

## 4. Charte graphique et isolation

### 4.1 Encapsulation

Le composant s'appuie sur un Shadow DOM ouvert (`mode: "open"`, pour rester
inspectable et débuggable). Concrètement :

- aucune règle CSS de votre thème n'atteint l'intérieur du composant ;
- aucune règle du composant ne fuit vers votre page ;
- les identifiants et classes ne peuvent pas entrer en collision.

Nous avons validé cette isolation contre une page de test reproduisant
délibérément les pratiques les plus agressives rencontrées dans les thèmes et
page builders WordPress : `html { font-size: 62.5% }`, `box-sizing: content-box`
forcé en `!important`, `button, input, select { all: unset }`, police et couleurs
imposées globalement, `!important` sur `h2/h3/p/a/img/li`, ancêtre en
`transform` + `will-change` + `contain: paint`, header sticky en `z-index: 9999`.

**Résultat : rendu strictement identique** à la page de référence — 78 éléments
comparés sur 32 propriétés calculées et leurs boîtes englobantes, zéro écart.

Deux précisions techniques importantes :

- Les échelles d'espacement, de typographie et de largeur du composant sont
  exprimées en **pixels** et non en `rem`. C'est volontaire : `rem` se résout
  contre le `font-size` du `<html>` de votre thème, et un thème en 62,5 %
  réduirait tout le configurateur de plus d'un tiers.
- Les points de rupture responsive restent en `rem`, ce qui est sans risque : à
  l'intérieur d'une media query, `rem` se résout contre la taille de police
  initiale (16 px) et non contre celle du `<html>`.

### 4.2 Ce qui sort du Shadow DOM

Par souci de transparence, voici les seules choses que le composant écrit en
dehors de son Shadow DOM. Aucune n'a d'effet visuel sur votre page.

| Élément | Raison |
|---|---|
| `<style id="kre-configurateur-fonts">` dans `<head>` | Une règle `@font-face` déclarée dans un shadow root est ignorée par les navigateurs : les polices ne peuvent être enregistrées qu'au niveau du document. |
| `<link rel="preload">` de la police | Évite le flash de texte non stylé. |
| `<style id="kre-configurateur-properties">` dans `<head>` | Notre framework CSS s'appuie sur des propriétés personnalisées enregistrées (`@property`). Le registre est global au document : dans un shadow root, ces règles sont ignorées, ce qui supprimerait toutes les bordures du composant. Ces déclarations ne portent aucun style. |
| `window.dataLayer` | Tracking GTM (§5). |
| Navigation | Uniquement si `confirmation-url` est renseignée. |

Les trois éléments injectés sont **idempotents** : plusieurs instances du
composant sur une même page n'en produisent qu'un seul de chaque.

Si une CSP stricte bloque ces injections, le composant reste fonctionnel : la
police retombe sur la pile système, et seules les bordures et dégradés sont
dégradés. Prévenez-nous si vous appliquez une CSP `style-src` restrictive, nous
adapterons la livraison.

### 4.3 Personnalisation de la charte

La palette est définie par des variables CSS préfixées `--kre-` :

| Variable | Valeur actuelle | Usage |
|---|---|---|
| `--kre-primary` | `#ff6d1b` | CTA, liens d'action, barre de progression |
| `--kre-brand` | `#6b3010` | Titres, accents forts |
| `--kre-brand-medium` | `#7a3b10` | Accents secondaires |
| `--kre-heading` | `#1e2a4a` | Titres d'étape |
| `--kre-background` | `#f5f0eb` | Fond |
| `--kre-surface` | `#ffffff` | Surfaces de cartes |
| `--kre-foreground` | `#1a1a1a` | Texte principal |
| `--kre-muted` | `#5c4a3a` | Texte secondaire |
| `--kre-border` | `#d4c5b5` | Bordures |
| `--kre-muted-bg` | `#ebe4dc` | Zones et survols |

**Transmettez-nous les maquettes et les valeurs exactes de la charte**
KitRenovationEscalier.fr : nous publions un thème correspondant, sélectionnable
via l'attribut `theme`. C'est la voie recommandée, car elle garantit la
cohérence sur l'ensemble du parcours.

À titre d'ajustement ponctuel, ces variables étant héritées, elles peuvent aussi
être surchargées depuis votre feuille de style :

```css
kre-configurateur {
  --kre-primary: #e85d0f;
}
```

---

## 5. Tracking — `window.dataLayer`

Le composant pousse ses événements directement dans le `dataLayer` de votre
page : GTM les voit sans configuration particulière, et **aucun pont
`postMessage` n'est nécessaire** — c'est l'avantage principal du Web Component
sur l'intégration iframe.

| Événement | Déclenchement | Données |
|---|---|---|
| `devis_start` | Ouverture du configurateur (une fois par instance) | `utm_*`, `gclid`, `fbclid` |
| `devis_step_view` | Affichage d'une étape | `step_index` (1-10), `step_name` |
| `devis_step_complete` | Étape validée, passage à la suivante | `step_index`, `step_name` |
| `devis_abandon` | Sortie avant soumission | `last_step_index`, `last_step_name`, `time_spent_sec` |
| `devis_submit` | Lead envoyé avec succès | `estimated_price`, `step_count`, `lead_id` |
| `devis_sample_request` | Clic sur le CTA échantillon | `decor` |

Les paramètres de provenance présents dans l'URL sont joints à **chaque**
événement, et enregistrés avec le lead.

`step_name` prend l'une de ces valeurs, dans cet ordre. **Ces noms sont stables :
nous ne les changerons pas sans vous prévenir**, vous pouvez les câbler en dur
dans GTM.

```
staircase_type · decor · riser · step_count · dimensions
end_cap · landing · parquet · included · contact
```

Exemple de payload :

```js
window.dataLayer.push({
  event: "devis_step_view",
  step_index: 5,
  step_name: "dimensions",
  utm_source: "wordpress",
  utm_content: "home-hero",
});
```

Dans GA4, ces événements alimentent directement **Explorer → Analyse de
l'entonnoir** et donnent le taux de chute par étape.

Deux points restent de votre côté :

- **`devis_abandon`** est émis sur `pagehide` et `visibilitychange` (et non
  `beforeunload`, inopérant sur iOS). Assurez-vous que votre balise GTM se
  déclenche assez tôt ; une balise en mode « une fois par page » suffit.
- **Communiquez-nous votre identifiant GTM ou GA4** si vous souhaitez que nous
  chargions le conteneur depuis le module autonome `/calcul`. Dans une page
  WordPress, votre conteneur existant suffit.

Le cahier des charges annonce une spécification tracking complète à venir : la
couche analytique est volontairement pilotée par une table de correspondance,
nous absorberons votre convention finale sans refonte.

---

## 6. Performance et accessibilité

### 6.1 Performance

| Poste | Mesure |
|---|---|
| Bundle JS | 400 Ko brut, **113 Ko gzip** |
| Images | 12,2 Mo → **1,2 Mo** en WebP (−90 %) |
| Police | 1 fichier variable, 68 Ko (graisses 100→900) |
| Chargement | module ES + `defer` — non bloquant |
| `eval` | absent (vérifié à chaque publication : compatible CSP sans `unsafe-eval`) |

Toutes les images sont en **WebP**, en `loading="lazy"` et `decoding="async"`,
avec des dimensions plafonnées à environ deux fois leur taille d'affichage
réelle. Les visuels portent leurs dimensions intrinsèques quand la mise en page
ne les impose pas, pour éliminer le décalage cumulé (CLS).

Le dossier `/wc/` est servi avec `mod_deflate` (gzip) et un cache immuable d'un
an sur les chemins versionnés. Brotli est activé si le module est disponible sur
l'hébergement — **nous ne le garantissons pas** sur l'hébergement mutualisé
actuel ; gzip l'est.

### 6.2 Accessibilité

- **Navigation clavier complète** : tous les contrôles sont des éléments
  interactifs natifs (`button`, `input`, `select`), atteignables au `Tab`, avec
  un anneau de focus visible.
- **Groupes de choix** structurés en `fieldset`/`legend`, état porté par
  `aria-pressed`.
- **Changement d'étape annoncé** dans une région `aria-live`, et le focus est
  déplacé en tête d'étape à chaque transition — sauf au premier rendu, pour ne
  pas voler le focus à votre page.
- **Erreurs de validation** en `role="alert"`, champs en `aria-invalid`, liés à
  leur message par `aria-describedby`.
- **Barre de progression** en `role="progressbar"` avec `aria-valuenow` et
  `aria-valuetext`.
- **Modales** en `<dialog>` natif : piège de focus, `Échap` et restitution du
  focus assurés par le navigateur. Le prix estimé est annoncé en `aria-live`.
- `prefers-reduced-motion` respecté.

Un point de conception mérite d'être signalé : les modales utilisent la **top
layer** du navigateur et non un simple `position: fixed`. Un overlay `fixed` est
piégé par tout ancêtre créant un bloc conteneur (`transform`, `filter`,
`contain`…) et passe sous un header sticky à `z-index` élevé — deux situations
omniprésentes dans les thèmes WordPress. La top layer y échappe par
construction. Nous l'avons vérifié contre un header sticky en `z-index: 9999`
placé dans un ancêtre transformé.

### 6.3 Compatibilité navigateurs

| Navigateur | Statut |
|---|---|
| Chrome, Edge, Firefox (N-2) | ✅ |
| Safari 16.4+ / macOS | ✅ |
| Safari 15.4 – 16.3 | ✅ (feuille de style injectée en `<style>` au lieu d'une feuille adoptée) |
| iOS Safari 15.4+ | ✅ |
| iOS Safari 15.0 – 15.3 | ✅ avec repli — `<dialog>` y est absent, les modales retombent sur un overlay avec piège de focus et `Échap` implémentés à la main |
| Chrome Android | ✅ |

Cible ES2020, sans dépendance à une API récente en dehors des replis ci-dessus.

---

## 7. Multi-instances et cycle de vie

- **Plusieurs `<kre-configurateur>` sur une même page** sont indépendants :
  états, formulaires, photos et attributs sont propres à chaque instance
  (vérifié). Chacun émet son propre `devis_start`.
- Les attributs `lang`, `theme`, `recipient-email`, `confirmation-url`,
  `show-sample-cta` et `show-header` peuvent être **modifiés dynamiquement** :
  le composant se met à jour sans perdre la saisie en cours.
- `endpoint` et `assets-base` sont figés au montage : les modifier en cours de
  session invaliderait des URLs déjà résolues.
- Le composant survit à un déplacement de son nœud dans le DOM — cas courant
  avec un page builder qui réorganise ses blocs.
- Le script peut être chargé deux fois sans erreur (concaténation, cache,
  shortcode dupliqué) : l'enregistrement du custom element est protégé.

---

## 8. Points ouverts

À trancher ou à nous transmettre pour finaliser :

1. **Charte graphique** — maquettes et valeurs exactes des couleurs, pour
   publier le thème définitif (§4.3).
2. **Spécification tracking** — votre convention d'événements et de nommage UTM
   définitive, ainsi que l'identifiant GTM / GA4 (§5).
3. **Domaines** — `kitrenovationescalier.knewledge.com` est déjà autorisé, ainsi
   que `kitrenovationescalier.fr` et sa variante `www.`. Confirmez le domaine de
   production définitif, et signalez-nous tout autre domaine ou sous-domaine
   (préproduction, recette client) depuis lequel le composant sera chargé :
   sans ajout à l'allowlist, la soumission du lead échoue en CORS (§3.1).
4. **`recipient-email`** — adresses à autoriser côté serveur, et souhaitez-vous
   une notification par e-mail en plus de l'enregistrement CRM ? (§3.2)
5. **CTA échantillon** — le `mailto:` suffit-il, ou attendez-vous un vrai flux
   avec adresse postale et suivi CRM ? (§3.3)
6. **`lang`** — l'attribut est implémenté et validé, mais seul le dictionnaire
   français est fourni en v1. Toutes les chaînes sont extraites : l'ajout d'une
   langue ne demande qu'une traduction, sans modification du code. Confirmez si
   une seconde langue est au programme, et laquelle.
7. **SEO du module autonome** — `escal.point-soft.fr/calcul` reste en ligne pour
   nos recettes. Souhaitez-vous qu'on y pose un `noindex` ou une `canonical`
   vers une page WordPress, pour concentrer le référencement sur votre site ?
8. **Webhook lead** — souhaitez-vous une copie des leads vers une URL de votre
   côté (CRM marketing) ? Réalisable sur demande.
9. **CSP** — appliquez-vous une `Content-Security-Policy` sur les pages
   concernées ? Si oui, transmettez-la : les trois injections en `<head>` (§4.2)
   nécessitent `style-src 'unsafe-inline'` ou un nonce que nous devrons recevoir.

---

## Annexe — Structure du lead transmis

Pour information. WordPress n'a pas à consommer ces données : elles vont
directement à notre API et au CRM Escal.

```jsonc
{
  "firstName": "…", "lastName": "…", "email": "…", "phone": "…",
  "country": "France",
  "contactPreference": "WHATSAPP" | "EMAIL",

  "staircaseType": "CLOSED",
  "decor": "CHENE_NATUREL",
  "riserOption": "BLACK_MATTE",
  "riserHeightMm": 175,
  "stepCount": 14,
  "uniformStepDimensions": true,
  "widthBand": "W_1001_1300",
  "depthBand": "D_LT_320",
  "stepConfigs": [ /* si dimensions non uniformes */ ],
  "stepEndCapConfigs": [ /* une entrée par marche */ ],
  "openSides": false,
  "intermediateLanding": true,
  "landingFinish": "NEZ_SEUIL",
  "seuilColor": "OR",
  "landingAreaM2": 2.4,
  "wantPlinthes": true,
  "plinthesML": 6,

  "estimatedMaterialsEuro": 1234,
  "priceBreakdown": { /* détail du calcul */ },

  // Ajoutés par l'intégration Web Component
  "recipientEmail": "contact@escal-concept.fr",
  "tracking": { "utm_source": "wordpress", "utm_content": "home-hero" }
}
```

Les photos de l'escalier (3 vues, facultatives) sont envoyées séparément en
`multipart/form-data` après la création du lead.

Le prix est calculé côté navigateur puis transmis au serveur : c'est une
**estimation matériaux indicative**, confirmée par un commercial. Elle ne doit
pas être présentée comme un prix ferme.
