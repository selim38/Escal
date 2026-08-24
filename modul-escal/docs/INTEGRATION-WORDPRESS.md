# Module de calcul de devis — Documentation d'intégration WordPress

> Document à destination de l'équipe en charge du site WordPress (Knewledge).
> Objet : intégrer le module de calcul de prix (« Configurateur de devis Kit Rénovation Escalier »)
> sur le futur site, et définir comment les données circulent entre le module, le site et vos
> outils d'analyse (SEO, suivi d'abandon, conversions).
>
> Version : 1.0 — Contact technique : selim.kirac@point-soft.com

---

## 1. Vue d'ensemble

Le module est une **application web autonome** (Next.js exportée en fichiers statiques HTML/CSS/JS).
Elle est **déjà hébergée et fonctionnelle**, indépendamment de WordPress, à l'adresse :

```
https://escal.point-soft.fr/calcul
```

Le rôle de WordPress se limite à **diriger l'internaute vers ce module** (boutons / liens / shortcode)
et, en option, à **recevoir des événements d'usage** pour le SEO et l'analyse comportementale.

```
┌─────────────────────┐       redirection / iframe        ┌──────────────────────────┐
│   Site WordPress     │ ───────────────────────────────▶ │  Module de calcul (Next) │
│  (contenu, SEO,      │                                   │  escal.point-soft.fr     │
│   boutons "Devis")   │ ◀───── événements analytics ───── │  /calcul                 │
└─────────────────────┘   (GA4 / dataLayer / postMessage)  └──────────┬───────────────┘
                                                                       │ POST lead (JSON)
                                                                       ▼
                                                            ┌──────────────────────────┐
                                                            │  API PHP + base MySQL     │
                                                            │  /api/leads.php           │
                                                            │  (CRM interne Escal)      │
                                                            └──────────────────────────┘
```

**Points clés :**

- Le module et WordPress sont **deux applications distinctes**. Le module n'a **pas** besoin d'être
  reconstruit dans WordPress.
- Le **prix est calculé côté navigateur** (export statique, pas de serveur applicatif côté module),
  puis le lead final est transmis à l'API PHP interne. WordPress **n'a pas accès** à cette base et
  n'a pas à la gérer.
- Aucun paiement en ligne : le module produit une **estimation matériaux** + une **demande de
  rappel** transmise à un commercial.

---

## 2. Le parcours utilisateur (10 étapes)

Le configurateur est un assistant (« wizard ») en **10 étapes**. Le lead n'est envoyé à l'API
qu'à la **validation finale (étape 10)**. C'est important pour comprendre le suivi d'abandon (§6).

| # | Étape | Contenu |
|---|-------|---------|
| 1 | Type d'escalier | Forme / configuration |
| 2 | Décor | Finition / matériau |
| 3 | Contremarches | Option + hauteur |
| 4 | Nombre de marches | Comptage |
| 5 | Dimensions | Longueur / profondeur (uniformes ou par marche) + photos |
| 6 | Embouts de marche | Côtés ouverts, type d'embout |
| 7 | Palier intermédiaire | Présence, finition, couleur seuil |
| 8 | Parquet *(conditionnelle)* | Affichée seulement si raccord parquet choisi |
| 9 | Éléments inclus | Récapitulatif de l'offre |
| 10 | Coordonnées | Nom, e-mail, téléphone, préférence de contact → **envoi du lead** |

---

## 3. Intégration sur WordPress

Deux modes possibles. **Le mode recommandé (et demandé) est la redirection.**

### 3.1 Mode A — Redirection par bouton/lien *(recommandé)*

C'est le plus simple, le plus performant et le plus sain pour le SEO : un simple lien.

```html
<a href="https://escal.point-soft.fr/calcul"
   class="btn-devis"
   rel="noopener">
   Calculer mon devis
</a>
```

Pour l'ouvrir dans un nouvel onglet (conserve la page WordPress ouverte) :

```html
<a href="https://escal.point-soft.fr/calcul" target="_blank" rel="noopener">
   Calculer mon devis
</a>
```

#### Shortcode WordPress (à créer côté WordPress)

Pour permettre aux rédacteurs de poser le bouton partout sans coller du HTML, ajoutez ce shortcode
dans `functions.php` du thème (ou un petit plugin) :

```php
// [devis_escal texte="Calculer mon devis" cible="_self"]
add_shortcode('devis_escal', function ($atts) {
    $a = shortcode_atts([
        'texte'  => 'Calculer mon devis',
        'cible'  => '_self',          // _self ou _blank
        'source' => '',               // ex. "home-hero" pour le suivi
    ], $atts);

    $url = 'https://escal.point-soft.fr/calcul';

    // Propagation des paramètres de suivi (voir §4)
    $params = [];
    if (!empty($a['source']))                  $params['utm_source']  = 'wordpress';
    if (!empty($a['source']))                  $params['utm_content'] = sanitize_title($a['source']);
    if (isset($_GET['utm_campaign']))          $params['utm_campaign'] = sanitize_text_field($_GET['utm_campaign']);
    if (!empty($params)) $url .= '?' . http_build_query($params);

    return sprintf(
        '<a href="%s" class="btn-devis" target="%s" rel="noopener">%s</a>',
        esc_url($url),
        esc_attr($a['cible']),
        esc_html($a['texte'])
    );
});
```

Usage dans n'importe quelle page/article WordPress :

```
[devis_escal texte="Estimer ma rénovation" source="page-tarifs"]
```

### 3.2 Mode B — Intégration en iframe *(optionnel)*

Si vous souhaitez afficher le module **à l'intérieur** d'une page WordPress (sans quitter le site) :

```html
<iframe
   src="https://escal.point-soft.fr/calcul"
   title="Configurateur de devis"
   style="width:100%; min-height:900px; border:0;"
   loading="lazy"></iframe>
```

> ⚠️ **À nous signaler si vous choisissez l'iframe.** Deux ajustements seront nécessaires côté
> module : (1) autoriser votre domaine dans l'en-tête `Content-Security-Policy: frame-ancestors`,
> et (2) activer la communication `postMessage` pour le suivi d'abandon et l'auto-redimensionnement
> de la hauteur (voir §6.3). En redirection (Mode A), rien de tout cela n'est requis.

---

## 4. Paramètres d'URL — suivi de la provenance

Le module accepte des paramètres en query string. Ils servent à **savoir d'où vient le visiteur**
(quelle page WordPress, quelle campagne) et sont **renvoyés tels quels dans les événements
analytics** et, idéalement, **stockés avec le lead**.

| Paramètre | Rôle | Exemple |
|-----------|------|---------|
| `utm_source` | Origine | `wordpress` |
| `utm_medium` | Canal | `bouton-cta` |
| `utm_campaign` | Campagne | `promo-printemps` |
| `utm_content` | Emplacement précis | `home-hero`, `page-tarifs` |
| `gclid` / `fbclid` | Suivi pub Google/Meta | *(transmis automatiquement)* |

Exemple d'URL complète :

```
https://escal.point-soft.fr/calcul?utm_source=wordpress&utm_medium=cta&utm_content=home-hero
```

> 🔧 **Statut :** la lecture/propagation de ces paramètres jusqu'au lead enregistré est une
> **évolution à implémenter côté module** (voir §7). Aujourd'hui le module n'exploite pas encore
> ces paramètres. Merci de vous mettre d'accord avec nous sur la convention de nommage UTM finale.

---

## 5. SEO

### 5.1 Principe : la séparation des rôles

- **WordPress = le contenu indexable** (pages de service, articles, FAQ, landing « rénovation
  d'escalier », etc.). C'est lui qui doit capter le trafic organique.
- **Le module = un outil transactionnel**, pas une cible SEO. Il n'a pas vocation à être positionné
  dans Google ; il doit recevoir un trafic déjà qualifié venant de WordPress.

### 5.2 Recommandations

1. **Ne pas dupliquer le contenu.** Tout le discours commercial/SEO (descriptions, mots-clés,
   maillage interne) vit dans WordPress. Le module reste minimaliste.
2. **Indexation du module : à cadrer ensemble.** Par défaut nous pouvons le laisser indexable, mais
   si vous préférez concentrer le « jus SEO » sur WordPress, nous poserons sur le module :
   ```html
   <meta name="robots" content="noindex, follow">
   ```
   ou une `rel="canonical"` pointant vers la page WordPress de référence. **Indiquez-nous votre
   choix.**
3. **Liens sortants depuis WordPress.** Utilisez des liens HTML standard (`<a href>`) vers le module
   (Mode A) plutôt que du JavaScript : ils sont suivis par les crawlers et transmettent le contexte.
   Conservez `rel="noopener"` (sécurité) ; **n'ajoutez pas** `nofollow` si vous voulez que Google
   comprenne la relation entre les deux domaines.
4. **Données structurées (Schema.org).** Côté WordPress, sur la page qui présente le service, un
   balisage `Service` / `Offer` / `FAQPage` est recommandé. Le module n'en a pas besoin.
5. **Performance / Core Web Vitals.** Le module est un export statique léger ; en Mode A il
   n'impacte pas les performances WordPress. En Mode B (iframe), utilisez `loading="lazy"` pour ne
   pas pénaliser le LCP de la page hôte.
6. **Cohérence de marque.** Le module est servi depuis le sous-domaine `escal.point-soft.fr`. Si une
   URL « propre » sous votre domaine est souhaitée (ex. `www.votresite.fr/calcul` via reverse-proxy
   ou sous-domaine `devis.votresite.fr`), c'est faisable — **à discuter** car cela touche
   l'hébergement et les certificats.

---

## 6. Communication des données & suivi comportemental

C'est le cœur de la demande : **récupérer les données d'usage**, notamment **« à quelle étape les
clients quittent le module »**, pour savoir où l'améliorer.

### 6.1 Ce qui existe aujourd'hui

- À la **validation finale uniquement**, le module envoie le lead complet (configuration + prix
  estimé + coordonnées + photos) à l'API PHP interne (`POST /api/leads.php`). Ces données alimentent
  le **CRM Escal**, pas WordPress.
- **Aucun événement intermédiaire n'est émis** : on ne sait pas encore à quelle étape un visiteur
  abandonne. C'est précisément ce que la spécification ci-dessous vient combler.

### 6.2 Spécification des événements analytics *(à implémenter — voir §7)*

Le module poussera des événements dans le **`dataLayer`** de la page (compatible Google Tag Manager
/ GA4). Vous pourrez ainsi suivre le tunnel et calculer les taux d'abandon par étape dans GA4.

**Convention proposée** — un événement à chaque transition :

| Événement | Quand | Données |
|-----------|-------|---------|
| `devis_start` | Ouverture du module | `{ source, utm_* }` |
| `devis_step_view` | Affichage d'une étape | `{ step_index, step_name }` |
| `devis_step_complete` | Passage à l'étape suivante | `{ step_index, step_name }` |
| `devis_abandon` | Fermeture/sortie avant la fin | `{ last_step_index, last_step_name, time_spent_sec }` |
| `devis_submit` | Lead envoyé avec succès | `{ estimated_price, step_count }` |

Exemple de payload poussé dans le `dataLayer` :

```js
window.dataLayer.push({
  event: "devis_step_view",
  step_index: 5,
  step_name: "dimensions",
  source: "home-hero"
});
```

Côté GTM/GA4, vous créez les déclencheurs sur ces `event` et obtenez directement, dans
**Explorer → Analyse de l'entonnoir**, le **taux de chute étape par étape**. C'est l'indicateur
« où les clients abandonnent » demandé.

> Pour que cela fonctionne, **fournissez-nous votre identifiant GTM (`GTM-XXXX`) ou de mesure GA4
> (`G-XXXX`)**. Nous pouvons soit installer GTM directement dans le module, soit nous contenter de
> pousser dans le `dataLayer` si vous gérez le conteneur en iframe parente.

### 6.3 Cas de l'iframe (Mode B) — `postMessage`

Si le module est en iframe, il enverra **en plus** les mêmes événements à la page WordPress parente
via `postMessage`, pour que votre code (ou votre GTM hébergé dans WordPress) les capte :

```js
// À placer dans WordPress (page contenant l'iframe)
window.addEventListener("message", (e) => {
  if (e.origin !== "https://escal.point-soft.fr") return;   // sécurité
  const msg = e.data;
  if (msg?.type === "devis-event") {
    // ex. { type:"devis-event", event:"devis_abandon", step_index:5, step_name:"dimensions" }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(msg.payload);
  }
  if (msg?.type === "devis-resize") {
    document.querySelector("#iframe-devis").style.height = msg.height + "px";
  }
});
```

### 6.4 Données du lead transmises (référence)

Pour information, voici la structure JSON envoyée à l'API interne lors de la soumission finale.
WordPress n'a normalement pas à la consommer, mais si vous souhaitez aussi **recevoir une copie du
lead** (ex. pour un CRM marketing côté WordPress), nous pouvons ajouter un **webhook** vers une URL
que vous nous fournirez.

```jsonc
{
  "type": "escal-concept-devis-request",
  "submittedAt": "2026-06-30T10:00:00.000Z",
  "estimatedMaterialsEuro": 1234,
  "priceBreakdown": { /* détail du calcul */ },
  "configuration": {
    "decor": "…", "riserOption": "…", "stepCount": 14,
    "widthBand": "…", "depthBand": "…",
    "openSides": false, "intermediateLanding": false
    /* … reste de la configuration … */
  },
  "contact": {
    "firstName": "…", "lastName": "…",
    "email": "…", "phone": "…",
    "country": "…", "contactPreference": "WhatsApp" | "E-mail"
  }
}
```

---

## 7. Récapitulatif — ce qui est prêt vs. à implémenter

| Élément | Statut |
|---------|--------|
| Module en ligne et fonctionnel (`/calcul`) | ✅ Prêt |
| Redirection par bouton/lien (Mode A) | ✅ Prêt — rien à faire côté module |
| Shortcode WordPress | 🔧 À créer **côté WordPress** (code fourni §3.1) |
| Envoi du lead final au CRM interne | ✅ Prêt |
| Lecture/propagation des paramètres UTM jusqu'au lead | 🔧 À implémenter côté module (§4) |
| Événements `dataLayer` / GA4 (suivi d'entonnoir & abandon) | 🔧 À implémenter côté module (§6.2) |
| `postMessage` + auto-resize (si iframe) | 🔧 À implémenter côté module (§6.3) |
| `noindex` / `canonical` SEO sur le module | 🔧 Selon votre décision (§5.2) |
| Webhook copie du lead vers WordPress | 🔧 Sur demande (§6.4) |

---

## 8. Décisions attendues de votre part

Pour finaliser, merci de nous préciser :

1. **Mode d'intégration** : redirection (Mode A) ou iframe (Mode B) ?
2. **SEO** : module indexable, ou `noindex` + `canonical` vers une page WordPress ?
3. **Analytics** : votre identifiant **GTM (`GTM-XXXX`)** ou **GA4 (`G-XXXX`)**, et la convention de
   nommage UTM souhaitée.
4. **URL** : on conserve `escal.point-soft.fr/calcul`, ou vous voulez une URL sous votre domaine ?
5. **Webhook lead** (optionnel) : souhaitez-vous une copie des leads vers une URL de votre côté ?

Une fois ces points tranchés, nous livrons les évolutions du module listées en §7.
