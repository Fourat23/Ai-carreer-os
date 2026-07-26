# ADR-011 — Runtime de preview frontend (HTML / CSS / JS)

Statut : accepté (Sprint V11). Décision d'implémentation, concise.

## Contexte

V9/V10 ont livré des runtimes **exécutables** (Node, Python, TypeScript) : le
code de l'apprenant s'exécute dans un **processus serveur** cloisonné
(`execFile` sans shell, timeout+SIGKILL, sortie plafonnée, env minimal), produit
une ligne `__LAB_RESULT__` et est noté par comparaison attendu/observé. V11 ajoute
un environnement **frontend** (HTML/CSS/JS navigateur, DOM, événements,
formulaires, responsive) avec une **preview web sécurisée**.

## Décisions

### 1. Runtime EXÉCUTABLE vs runtime de PREVIEW (distinction fondamentale)

- **Exécutable** (node-js, python3, typescript) : exécution **serveur**, notation
  par sortie capturée. Inchangé.
- **Preview** (`web`) : le code s'affiche dans une **iframe navigateur**
  sandboxée (`srcDoc`) — c'est le rendu que voit l'apprenant. Il n'y a **aucun
  processus serveur** pour la preview elle-même.

Ces deux familles cohabitent dans le même modèle d'exercice et le même Workbench,
sans second exécuteur ni réécriture de l'existant.

### 2. Modèle multi-fichiers HTML/CSS/JS

Un exercice `web` déclare des fichiers `.html`, `.css`, `.js` (et `.json` en
lecture seule si justifié), avec **exactement un** fichier d'entrée HTML
(`index.html` par défaut). Validation PURE : chemins relatifs sûrs (pas de
traversal/doublon/absolu), extensions autorisées, tailles bornées, cohérence
runtime↔extensions, un seul HTML d'entrée, fichiers privés jamais transmis au
client. Rétrocompatibilité totale V7/V8/V9/V10.

### 3. Construction du document de preview (pur)

Une fonction **pure et testable** (`lib/frontend-preview.mjs`) construit le
`srcDoc` final :
- base = `index.html` de l'utilisateur ;
- injection **déterministe** des `<style>` (CSS, dans `<head>`) et des `<script>`
  (JS, en fin de `<body>`, ordre stable) ;
- injection d'une **CSP stricte** (voir §6) et d'un **bootstrap** d'instrumentation
  (console + erreurs) portant un **identifiant de canal non devinable** ;
- neutralisation des séquences `</script>` dans le JS injecté inline ;
- aucune donnée privée, aucune solution, aucune valeur attendue, aucune donnée de
  progression n'entre dans le `srcDoc`.

### 4. Protocole iframe ↔ application (postMessage)

L'iframe est en **origine opaque** (sandbox sans `allow-same-origin`) : le parent
ne peut PAS lire son DOM (cross-origin). La communication se fait par
`postMessage` **à sens unique** (iframe → parent) pour la **console et les
erreurs uniquement**. Le parent valide chaque message par :
- `event.source === iframe.contentWindow` ;
- un `channel` (identifiant aléatoire non devinable, généré par montage) ;
- un type de message connu, une charge **sérialisable et bornée** (nombre et
  taille de messages plafonnés).
Tout message ne satisfaisant pas ces critères est **ignoré**. Aucun message du
parent vers l'iframe ne transporte de données privées.

### 5. Capture des erreurs et de la console

Le bootstrap injecté instrumente `console.log/info/warn/error`, `window.onerror`
et `unhandledrejection`, sérialise de façon bornée (profondeur, longueur, cycles)
et poste vers le parent. La preview **ne note aucun test** : elle est purement
visuelle. Les valeurs complexes sont formatées de façon bornée ; **aucun HTML
utilisateur n'est jamais interprété** dans l'UI de la console (rendu en texte).

### 6. Sécurité de la preview (décisions minimales)

- iframe `srcDoc` avec `sandbox="allow-scripts"` **uniquement** (pas de
  `allow-same-origin`, ni top-navigation, popup, formulaires, téléchargements) ;
- CSP injectée dans le document : `default-src 'none'`, `script-src
  'unsafe-inline'`, `style-src 'unsafe-inline'`, `img-src data: blob:`,
  `connect-src 'none'`, `base-uri 'none'`, `form-action 'none'` ;
- **réseau bloqué** (`connect-src 'none'` + `default-src 'none'`) ;
- pas d'accès aux cookies/localStorage de l'app (origine opaque) ;
- pas d'accès au parent (cross-origin + sandbox) ;
- `postMessage` validé par `event.source` + `channel` non devinable ;
- aucune donnée applicative privée dans la preview.

### 7. Tests pédagogiques : évaluation SERVEUR, jamais dans le srcDoc

Contrainte dure : **les tests privés ne doivent jamais entrer dans un `srcDoc`**
(le code utilisateur y a accès). Comme le sandbox interdit `allow-same-origin`,
le parent ne peut pas non plus lire le DOM de l'iframe. **Conséquence** : les
tests web (publics ET privés) sont évalués **côté serveur**, de façon
**déterministe**, par un **modèle DOM minimal, sans dépendance** :
- assertions **structurelles** sur le HTML statique (`selector-exists`,
  `selector-count`, `text-contains`, `attribute-equals`, `class-present`,
  `input-value`) : évaluées par un moteur de requête pur
  (`lib/frontend-dom.mjs`) ;
- assertions **pilotées par JS** (`event-changes-text`, contenu dynamique) : le
  JS de l'exercice s'exécute dans **l'exécuteur Node existant** (aucun second
  exécuteur) avec un **shim DOM minimal** injecté (querySelector, textContent,
  classList, addEventListener/dispatchEvent, value…), puis les assertions
  requêtent le DOM résultant.
Le même moteur évalue publics et privés → **cohérence** garantie. Les tests
privés restent **exclusivement serveur** : jamais dans le srcDoc, les props
client, l'API publique, les logs, l'index de recherche, le backup ni l'historique.

### 8. Persistance

Les fichiers frontend éditables sont persistés/restaurés comme tout workspace
(schéma v3, allowlist) ; fichiers en lecture seule et tests privés jamais
persistés côté client. Une seule source de progression : `data/progress.json`.

### 9. Sécurité réelle — distinction honnête

1. **sandbox navigateur** : iframe origine opaque, `allow-scripts` seul, CSP
   stricte, réseau/navigation/parent bloqués ;
2. **protections applicatives** : allowlist runtime/extensions, imports/URL
   rejetés, aucune donnée privée dans le srcDoc, postMessage validé ;
3. **limites de ressources** : messages/logs plafonnés, tailles bornées, debounce,
   timeout de l'exécuteur pour le grading JS ;
4. **isolation OS/conteneur : NON fournie.** La preview est un rendu navigateur
   local ; le grading JS est un processus Node local. Modèle de menace :
   accidents + ressources bornées pour du code personnel, pas du code adverse.

### 10. Limites honnêtes du grading

Le modèle DOM de notation est un **sous-ensemble** volontairement borné du
navigateur, suffisant pour le corpus V11 ; il **ne calcule pas** la mise en page
réelle ni la cascade CSS complète. `computed-style-equals` n'est donc supporté
que de façon **limitée et documentée** (styles simples), voire signalé comme
fragile ; les media queries/layout responsive ne sont pas *notés* (la preview les
*rend* réellement, elle). La **preview** utilise, elle, le vrai moteur du
navigateur.

### 11. Évolution future (hors V11)

React/TSX exigeraient un transpileur (réutilisable depuis le compilateur V10) +
un runtime de rendu et un modèle de composants : possible via un futur runtime
`react-preview` réutilisant CE document de preview et CE protocole, sans toucher
au modèle. **Non implémenté ici** (V11 = HTML/CSS/JS uniquement).

## Conséquences

Nouveaux : `lib/frontend-preview.mjs` (srcDoc pur), `lib/frontend-dom.mjs`
(modèle DOM + assertions), runtime `web` dans le registre, onglet **Preview**
dans le Workbench, corpus `data/exercises/web-*.json`. Exécuteur, preuves,
sauvegarde et catalogue étendus **sans duplication**. Node/Python/TypeScript
inchangés. `/` et les routes hors Lab ne chargent ni CodeMirror ni le moteur de
preview.
