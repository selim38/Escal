# Livraison du Web Component — checklist de mise en ligne

> Document **interne Point Soft**. Ne pas transmettre à Knewledge.
> Le déploiement est automatique à chaque push sur `main` (SFTP IONOS).
> Restent les actions qui touchent le serveur ou la base, hors périmètre du CI.
> Version : 1.3.0.

---

## Étape 1 — Publier le bundle (automatique)

Le job `wc` de [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml)
s'exécute à chaque push sur `main` et publie :

| Cible distante | Contenu | Cache |
|---|---|---|
| `~/wc/.htaccess` | compression, cache, CORS | — |
| `~/wc/staging/` | bundle de recette, republié à chaque push | 5 min |
| `~/wc/$WC_VERSION/` | version figée pour la production | 1 an, immuable |

**Rien à faire manuellement.** Deux points d'attention en revanche :

- **`WC_VERSION` est un bump manuel**, dans l'`env` du job. Un dossier de version
  déjà publié ne doit jamais être écrasé : les pages WordPress pointent une URL
  versionnée figée, et le cache d'un an la rend impossible à corriger côté
  visiteur. Pour livrer une évolution : incrémenter `WC_VERSION`, pousser, puis
  communiquer la nouvelle URL à Knewledge.
- **Le dossier `~/wc/` doit exister** sur le serveur au premier déploiement.
  Si le job échoue sur l'upload, le créer une fois à la main en SFTP.

Contrôle après le premier passage du workflow — les quatre doivent répondre `200` :

```bash
curl -sI https://escal.point-soft.fr/wc/staging/kre-configurateur.js | head -1
curl -sI https://escal.point-soft.fr/wc/staging/fonts/geist-variable.woff2 | head -1
curl -sI https://escal.point-soft.fr/wc/staging/decor/chene-naturel.webp | head -1
curl -sI https://escal.point-soft.fr/wc/v1.3.0/kre-configurateur.js | head -1
```

Puis les en-têtes que le `.htaccess` doit poser — sans eux, le module ES et la
police sont refusés en cross-origin depuis WordPress :

```bash
curl -sI -H 'Origin: https://kitrenovationescalier.knewledge.com' \
  https://escal.point-soft.fr/wc/staging/kre-configurateur.js \
  | grep -iE 'content-type|access-control-allow-origin|cache-control'
```

Attendu : `Content-Type: application/javascript` et
`Access-Control-Allow-Origin: *`. **Si l'en-tête CORS est absent**, `AllowOverride`
est désactivé pour ce répertoire et le `.htaccess` est ignoré : voir §Dépannage.

---

## Étape 2 — Autoriser les origines WordPress dans l'API

`api/config.php` n'est **pas** versionné : la modification est à faire
directement sur le serveur. Le modèle à jour est `api/config.sample.php`.

Ajouter dans `cors_allowed_origins` :

```php
'https://kitrenovationescalier.knewledge.com',   // staging Knewledge
'https://kitrenovationescalier.fr',              // production
'https://www.kitrenovationescalier.fr',
```

Et créer la clé `allowed_recipient_emails` (nouvelle) :

```php
'allowed_recipient_emails' => [
    'contact@escal-concept.fr',
],
```

Sans la première liste, la soumission échoue en CORS à l'étape 10. Sans la
seconde, l'attribut `recipient-email` est simplement ignoré (le lead est quand
même enregistré) — mais le CTA « Demander un échantillon » ne s'affichera pas.

Contrôle du préflight :

```bash
curl -sI -X OPTIONS \
  -H 'Origin: https://kitrenovationescalier.knewledge.com' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: Content-Type' \
  https://escal.point-soft.fr/api/leads.php | head -8
```

Attendu : `204`, `Access-Control-Allow-Origin` renvoyant l'origine demandée, et
`Access-Control-Allow-Methods` incluant `POST`.

---

## Étape 3 — Migrer la base

Trois colonnes ont été ajoutées à `leads` : `recipient_email`, `origin`,
`tracking_json`.

`create_lead()` s'adapte aux colonnes réellement présentes (voir
`leads_columns()` dans `api/leads.php`) : tant que la migration n'est pas
appliquée, les leads sont enregistrés **sans** ces trois champs plutôt que de
partir en erreur. Le déploiement automatique ne casse donc pas la prise de
leads — mais la provenance et le destinataire sont perdus jusqu'à la migration.
À faire dès que possible.

En ligne de commande sur le serveur — l'accès HTTP est bloqué par `api/.htaccess` :

```bash
php ~/kitrenovation/api/migrate.php "$(grep -o "'install_token' => '[^']*'" ~/kitrenovation/api/config.php | cut -d"'" -f4)"
```

Ajuster le chemin si `api/` n'est pas sous `~/kitrenovation`. Les erreurs
« duplicate column » sur les ALTER déjà appliqués sont normales et ignorées.

Contrôle :

```sql
SHOW COLUMNS FROM leads LIKE 'recipient_email';
SHOW COLUMNS FROM leads LIKE 'origin';
SHOW COLUMNS FROM leads LIKE 'tracking_json';
```

> `migrate.php` n'est plus à supprimer après usage : il n'est plus joignable par
> HTTP (`api/.htaccess`) et ne s'exécute qu'en ligne de commande. La suppression
> était de toute façon illusoire — `api/` est redéployé depuis le dépôt à chaque
> push, donc le fichier revenait au déploiement suivant.

---

## Étape 4 — Recette interne avant d'ouvrir à Knewledge

Tester **soi-même depuis une autre origine**, sinon on fait porter à Knewledge le
débogage de notre propre déploiement.

`demo/recette-prod.html` est là pour ça : la page charge le bundle **réellement
publié** sur `escal.point-soft.fr/wc/staging/`, servie depuis `localhost` — donc
une origine tierce, exactement la situation de WordPress. C'est la seule façon de
vérifier ce que le serveur de dev ne peut pas montrer : résolution des assets via
`import.meta.url`, en-têtes CORS, compression, absence de StrictMode.

```bash
npm run dev:wc
# puis http://localhost:5174/demo/recette-prod.html
```

La page charge aussi `demo/probe.js`, qui fournit dans la console :

- `kreWalkToDimensions()` — avance jusqu'à l'étape 5 (la plus riche en mise en page) ;
- `kreWalkToSubmit()` — déroule les 10 étapes et renvoie `{ success, events }` ;
- `kreFingerprint()` — empreinte de rendu, pour comparer deux contextes.

### Vérifié le 2026-08-26 sur le bundle en ligne

- [x] aucune erreur console ;
- [x] `import.meta.url` résout les assets sur `escal.point-soft.fr/wc/staging/`
      et non sur le domaine de la page hôte ;
- [x] en-tête CORS effectif sur les images — vérifié en lisant les pixels dans un
      canvas non contaminé, ce qui n'est possible qu'avec `Access-Control-Allow-Origin` ;
- [x] police et propriétés CSS enregistrées injectées dans `document.head` ;
- [x] rendu conforme à la charte (le découpage des `@property` tient en production) ;
- [x] parcours complet des 10 étapes, entonnoir `dataLayer` complet :
      `devis_start`, 8 paires `devis_step_view`/`devis_step_complete`
      (l'étape parquet est sautée sans raccord parquet), puis `devis_submit`.

### Reste à valider manuellement

**La soumission d'un vrai lead.** `api/leads.php` déclenche une **alerte SMS aux
commerciaux** (Primotexto) à chaque création : un test envoie un vrai SMS à une
vraie personne. Prévenir l'équipe, ou commenter temporairement l'appel, puis
retirer l'attribut `demo` de la balise dans `demo/recette-prod.html`.

À contrôler ensuite dans le dashboard : le lead présent, avec `origin` renseigné
(ce qui confirme aussi que la migration de l'étape 3 est passée).

**Le clavier et iOS.** `Entrée`, `Espace` et `Échap` ne sont pas testables par
automatisation ici — le harnais délivre les touches avec un `key` vide, donc
l'action par défaut du navigateur ne se déclenche jamais. `Tab` et l'anneau de
focus sont vérifiés. Prévoir une passe manuelle de deux minutes, et un essai sur
iOS Safari 15 si l'appareil est disponible (le repli sans `<dialog>` ne se voit
que là).

## Étape 5 — Ce qu'on envoie à Knewledge

| Livrable | Où |
|---|---|
| Document d'intégration v2.0 | `docs/INTEGRATION-WORDPRESS.md` |
| Plugin WordPress | `deliverables/kre-configurateur-wp-1.3.0.zip` |
| URL staging | `https://escal.point-soft.fr/wc/staging/kre-configurateur.js` |
| URL production | `https://escal.point-soft.fr/wc/v1.3.0/kre-configurateur.js` |

Le document couvre déjà la balise, les attributs, les événements dataLayer, la
compatibilité navigateurs et les points en attente : pas besoin d'y ajouter
d'explications par e-mail.

**Les deux seules choses à leur demander explicitement**, parce qu'elles nous
bloquent pour la suite :

1. la liste complète des domaines qui hébergeront le composant (préproduction
   incluse), pour l'allowlist CORS ;
2. les valeurs de la charte graphique / les maquettes, pour publier le thème
   définitif — aujourd'hui le composant utilise nos couleurs de développement.

---

## Dépannage

**Le composant ne s'affiche pas du tout, rien dans la console.**
La balise a été écrite auto-fermante (`<kre-configurateur />`) : tout le reste de
la page devient son contenu. Il faut la balise fermante.

**Erreur « Cannot use 'import.meta' outside a module ».**
Le `type="module"` a été perdu. Un thème ou un plugin d'optimisation a réécrit la
balise `<script>`. Le plugin fourni pose ce type via le filtre
`script_loader_tag` ; si Knewledge intègre à la main, il est obligatoire.

**Le composant s'affiche sans bordures, dégradés plats.**
Une CSP `style-src` bloque l'injection des propriétés CSS enregistrées dans
`<head>`. Demander la CSP à Knewledge (§4.2 du document d'intégration).

**Images ou police en 404 depuis WordPress.**
L'arborescence n'a pas été conservée à l'upload : les dossiers `CM/`, `decor/`,
`dimensions/`, `escalier/`, `etape/`, `fonts/` doivent être **frères** du fichier
`kre-configurateur.js`, qui résout ses assets relativement à sa propre URL.

**Pas d'`Access-Control-Allow-Origin` sur le bundle.**
`AllowOverride` est désactivé pour ce répertoire, le `.htaccess` est ignoré. À
défaut de pouvoir l'activer, servir le bundle depuis un dossier où il l'est, ou
ajouter les en-têtes dans la configuration du vhost.

**Les leads arrivent sans `origin` ni provenance UTM.**
La migration de l'étape 3 n'a pas été appliquée. La soumission fonctionne, mais
les trois colonnes sont ignorées.

**Erreur CORS à la soumission uniquement.**
L'origine WordPress manque dans `cors_allowed_origins` (étape 2). Le message de
la console indique l'origine exacte refusée — c'est celle à ajouter.
