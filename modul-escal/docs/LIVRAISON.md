# Livraison du Web Component — checklist de mise en ligne

> Document **interne Point Soft**. Ne pas transmettre à Knewledge.
> À faire dans l'ordre : les étapes 1 à 3 sont bloquantes, Knewledge ne peut rien
> tester avant. Version : 1.0.0.

---

## Étape 1 — Publier le bundle sur escal.point-soft.fr

Construire les deux paquets :

```bash
cd modul-escal
npm run package:wc -- staging --base https://escal.point-soft.fr/wc/staging
npm run package:wc -- v1.0.0
```

Chaque commande produit un dossier **autonome** (bundle + images WebP + police +
`.htaccess`) dans `dist/release/`. Uploader par FTP, en conservant l'arborescence :

| Local | Distant |
|---|---|
| `dist/release/staging/` | `escal.point-soft.fr/wc/staging/` |
| `dist/release/v1.0.0/` | `escal.point-soft.fr/wc/v1.0.0/` |

Le `.htaccess` est **inclus dans chaque dossier** : ne pas l'oublier (les clients
FTP masquent les fichiers commençant par un point par défaut).

Contrôle après upload — les quatre doivent répondre `200` :

```bash
curl -sI https://escal.point-soft.fr/wc/staging/kre-configurateur.js | head -1
curl -sI https://escal.point-soft.fr/wc/staging/fonts/geist-variable.woff2 | head -1
curl -sI https://escal.point-soft.fr/wc/staging/decor/chene-naturel.webp | head -1
curl -sI https://escal.point-soft.fr/wc/v1.0.0/kre-configurateur.js | head -1
```

Vérifier aussi les en-têtes que le `.htaccess` doit poser (sans eux, le module ES
et la police sont refusés en cross-origin depuis WordPress) :

```bash
curl -sI -H 'Origin: https://kitrenovationescalier.knewledge.com' \
  https://escal.point-soft.fr/wc/staging/kre-configurateur.js \
  | grep -iE 'content-type|content-encoding|access-control-allow-origin|cache-control'
```

Attendu : `Content-Type: application/javascript`,
`Access-Control-Allow-Origin: *`, et `Content-Encoding: gzip` si le client
annonce `Accept-Encoding`. **Si `Access-Control-Allow-Origin` est absent**, le
`.htaccess` n'est pas pris en compte (`AllowOverride` désactivé) : voir §Dépannage.

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
`tracking_json`. Sans elles, **toute soumission échoue en erreur 500** (l'INSERT
référence des colonnes inexistantes).

```
https://escal.point-soft.fr/api/migrate.php?token=LE_TOKEN
```

Le token est `install_token` dans `config.php`. Les erreurs « duplicate column »
sur les ALTER déjà appliqués sont normales et ignorées par le script.

Contrôle :

```sql
SHOW COLUMNS FROM leads LIKE 'recipient_email';
SHOW COLUMNS FROM leads LIKE 'origin';
SHOW COLUMNS FROM leads LIKE 'tracking_json';
```

> Rappel : `migrate.php` est un point d'entrée protégé par un simple token.
> Le supprimer du serveur après usage, comme indiqué dans son en-tête.

---

## Étape 4 — Recette interne avant d'ouvrir à Knewledge

Une fois les étapes 1 à 3 faites, tester **soi-même** depuis une origine tierce,
sinon on fait porter à Knewledge le débogage de notre propre déploiement.

Le plus simple : ouvrir n'importe quelle page d'un autre domaine, puis dans la
console du navigateur :

```js
const s = document.createElement("script");
s.type = "module";
s.src = "https://escal.point-soft.fr/wc/staging/kre-configurateur.js";
document.head.appendChild(s);
document.body.insertAdjacentHTML(
  "afterbegin",
  '<kre-configurateur lang="fr" theme="kre"></kre-configurateur>',
);
```

À vérifier :

- [ ] le configurateur s'affiche, images et police chargées (onglet Réseau :
      tout doit venir de `escal.point-soft.fr/wc/staging/`, rien du domaine hôte) ;
- [ ] parcours complet des 10 étapes ;
- [ ] la soumission renvoie une référence de lead (et non une erreur CORS) ;
- [ ] le lead apparaît dans le dashboard admin, avec `origin` renseigné ;
- [ ] `window.dataLayer` contient `devis_start`, les paires
      `devis_step_view` / `devis_step_complete`, puis `devis_submit`.

Pour tester sans polluer le CRM, ajouter l'attribut `demo` : la soumission est
simulée, aucun appel réseau.

---

## Étape 5 — Ce qu'on envoie à Knewledge

| Livrable | Où |
|---|---|
| Document d'intégration v2.0 | `docs/INTEGRATION-WORDPRESS.md` |
| Plugin WordPress | `deliverables/kre-configurateur-wp-1.0.0.zip` |
| URL staging | `https://escal.point-soft.fr/wc/staging/kre-configurateur.js` |
| URL production | `https://escal.point-soft.fr/wc/v1.0.0/kre-configurateur.js` |

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

**Erreur 500 à la soumission.**
La migration de l'étape 3 n'a pas été appliquée.

**Erreur CORS à la soumission uniquement.**
L'origine WordPress manque dans `cors_allowed_origins` (étape 2). Le message de
la console indique l'origine exacte refusée — c'est celle à ajouter.
