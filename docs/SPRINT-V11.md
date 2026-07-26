# Sprint V11 — Frontend Workbench V1 : HTML, CSS, JavaScript & preview sécurisée

Rapport final. AI Career OS reste **strictement local, mono-utilisateur**.
Curriculum des 365 jours et `data/program.json` **byte-identiques** à la baseline
V6 (`b7bc8e7`). Aucune montée de version de Next.js. Aucune dépendance ajoutée
(le modèle DOM de notation est écrit maison, sans librairie).

## 1. Mission

Ajouter un véritable environnement d'exercices **frontend multi-fichiers**
(HTML, CSS, JavaScript navigateur, DOM, événements, formulaires, responsive) avec
une **preview web sécurisée et isolée**, en réutilisant l'explorateur, les
onglets, la persistance, l'historique, les preuves et le catalogue existants —
sans régresser Node/Python/TypeScript, sans toucher au Markdown, et en posant une
fondation générique réutilisable pour React/TSX en V12.

## 2. Architecture

**Deux familles de runtimes** (voir ADR-011) :
- **Exécutable** (Node, Python, TypeScript) : exécution serveur cloisonnée,
  notation par sortie capturée. Inchangé.
- **Preview** (`web`) : le code s'affiche dans une **iframe sandboxée** (srcDoc,
  `allow-scripts` seul, jamais `allow-same-origin`) ; la **notation** se fait
  **côté serveur** par un **modèle DOM minimal** + l'**exécuteur Node existant**
  (aucun second exécuteur). Les tests n'entrent JAMAIS dans le srcDoc.

Pipeline web : `preview client (visuel)` d'un côté ; `runExercise → copie du
modèle DOM + harnais dans le workspace → Node cloisonné exécute le JS contre le
DOM → assertions publiques ET privées évaluées serveur → preuve` de l'autre.

## 3. Checkpoints & commits

| CP | Sujet | Commit |
|----|-------|--------|
| CP1 | ADR-011 runtime de preview frontend | `bbf7811` |
| CP2 | Modèle générique de preview web (runtime `web`) | `4e7a0fd` |
| CP3 | Construction pure et sécurisée du srcDoc | `7255a16` |
| CP4 | Workbench frontend + preview sécurisée | `18a007c` |
| CP5 | Console navigateur contrôlée | `5ff827b` |
| CP6 | Fondation de tests pédagogiques (modèle DOM serveur) | `bdefc29` |
| CP7 | Corpus pilote de 11 exercices HTML/CSS/JS | `ea83155` |
| CP8 | Liaison journées + progression + preuves | `a2294d5` |
| CP9 | Catalogue (filtre type) + recherche + backup | `59b3906` |
| CP10| Hardening, performance, validation + rapport | (ce commit) |

## 4. Fichiers principaux

Nouveaux : `lib/frontend-preview.mjs`(+d.ts) (srcDoc pur, CSP, bootstrap,
canal), `lib/frontend-dom.mjs` (modèle DOM minuscule + `evalWebTest`),
`lib/frontend-grade.mjs` (harnais de notation Node), `lib/console-format.mjs`(+d.ts)
(bornage des logs), `app/lab/[exerciseId]/FrontendPreview.tsx` (iframe sandboxée),
`data/exercises/web-*.json` (11), `docs/ADR-011-frontend-preview.md`. Modifiés :
`lib/runtime.mjs`/`runtime-detect.mjs` (adaptateur `web`), `lib/exercise.mjs`
(validation web + `WEB_TEST_KINDS`), `lib/exercise-files.mjs` (html/css),
`lib/workspace-fs.mjs` (`runWebExercise`), `app/lab/[exerciseId]/*`,
`app/lab/page.tsx`/`LabCatalog.tsx` (filtre type), `data/day-exercises.json`.

## 5. Preview sécurisée

- iframe `srcDoc`, `sandbox="allow-scripts"` (jamais `allow-same-origin`) ;
- CSP stricte : `default-src 'none'; script-src 'unsafe-inline'; style-src
  'unsafe-inline'; img-src data: blob:; connect-src 'none'; base-uri 'none';
  form-action 'none'` ;
- bootstrap d'instrumentation (console + `onerror` + `unhandledrejection`) posté
  au parent en UN SEUL sens, avec un **canal aléatoire non devinable** ;
- messages validés par `event.source` + `channel` ; sérialisation bornée
  (profondeur, longueur, nombre, cycles → `[cycle]`) ; `</script>`/`</style>`
  neutralisés ;
- rafraîchissement DEBOUNCÉ (500 ms) + boutons « Actualiser » / « Redémarrer » ;
  états « Mise à jour… / Prête / Erreur » ; jamais de rechargement de page.

## 6. Console navigateur

log/info/warn/error, erreurs JS et promesses rejetées ; rendu en **TEXTE**
(aucun `dangerouslySetInnerHTML`, anti-XSS) ; plafond **200 entrées**, **2000
caractères/entrée** ; bouton « Effacer » (`lib/console-format.mjs`, testé).

## 7. Notation pédagogique

Modèle DOM minimal **pur, sans dépendance** (`lib/frontend-dom.mjs`) : parseur
HTML tolérant, `querySelector`/`All` (tag/#id/.class/[attr]/descendant),
`textContent` (exclut script/style), `classList`, `value`,
`addEventListener`/`dispatchEvent` (bubbling). Assertions : `selector-exists`,
`selector-count`, `text-contains`, `attribute-equals`, `class-present`,
`input-value`, `computed-style-equals` (style inline — sous-ensemble documenté),
`event-changes-text`, `console-contains`. Le JS de l'apprenant s'exécute dans
l'**exécuteur Node existant** (timeout/SIGKILL/sortie plafonnée/env minimal) ;
chaque test événementiel repart d'un **DOM neuf** (isolation). Retour public
détaillé + **agrégat privé** ; les tests privés restent exclusivement serveur.

## 8. Corpus (11 exercices)

web-semantic (d1) · web-card (d1) · web-log-init (d1) · web-greeting-form (d2) ·
web-counter (d2) · web-nav (d2) · web-inline-style (d2) · web-debug-toggle (d2) ·
web-debug-selector (d2) · web-list-filter (d3) · web-status-text (d3).
Couverture : HTML ×3, CSS ×3, JS/DOM ×7, formulaire, responsive, multi-fichiers
×9, tests privés ×7, débogage ×2. **Toutes les références passent** ; les codes
de départ échouent utilement. Liés aux journées frontend J87/J88/J92/J96 (sans
toucher au Markdown).

## 9. Performance (production chaude, médiane de 5)

| Route | total |
|-------|-------|
| / | 35 ms |
| /lab (catalogue) | 26 ms |
| /lab/web-counter | 18 ms |
| /lab/web-card | 17 ms |
| /day/87 (journée frontend) | 25 ms |
| /lab/fizzbuzz (Node) | 17 ms |
| /lab/ts-typed-average (TS) | 16 ms |

Construction du srcDoc (pur) : **~0,06 ms**. Notation web (POST run, médiane 3) :
**web-card 66 ms · web-counter 65 ms** (parse HTML + exécution JS + assertions),
comparable à Node (~70 ms). Aucune boucle de rendu (rebuild debouncé). Aucune
régression hors Lab.

## 10. Discipline de bundle

- `/` reste à **109 kB** : ni CodeMirror, ni moteur de preview.
- `/lab` (catalogue) à **109 kB** : aucun éditeur, aucun moteur de preview.
- `/lab/[id]` à **118 kB** : CodeMirror **et** la preview (iframe + construction
  du srcDoc) chargés **paresseusement** (import dynamique), uniquement là.
- Vérifié : `buildPreviewDoc`, `allow-scripts`, CSP absents des chunks de `/` et
  `/lab` ; présents seulement dans le chunk de `/lab/[id]`.

## 11. Matrice navigateur

12 routes (Dashboard, Parcours, Calendrier, Jour court /day/1, Jour long /day/91,
Catalogue, Node, Python, TypeScript, Web HTML/CSS, Web JS, Web responsive) ×
5 largeurs (375/768/1024/1440/1920) = **60 vérifications, 0 échec** (200, aucun
débordement, aucune erreur console applicative). Vérifs complémentaires : palette
Ctrl+K + Escape, focus clavier de l'éditeur, `prefers-reduced-motion`, preview
**en erreur** (erreur contenue dans l'iframe + affichée dans la Console),
**aucune fuite de test privé**. Node/Python/TypeScript non régressés.

## 12. Modèle de sécurité — distinction honnête

1. **sandbox navigateur** : iframe origine opaque, `allow-scripts` seul, CSP
   stricte, réseau (`connect-src 'none'`)/navigation/parent bloqués ; `postMessage`
   validé (source + canal) ; message forgé rejeté.
2. **protections applicatives** : allowlist runtime/extensions, aucune donnée
   privée dans le srcDoc, tests privés serveur uniquement, logs rendus en texte.
3. **limites de ressources** : timeout+SIGKILL et sortie plafonnée pour la
   notation JS, messages/logs bornés, debounce.
4. **isolation OS/conteneur : NON fournie.** La preview est un rendu navigateur
   local ; la notation est un processus Node local. Modèle de menace : accidents
   + ressources bornées pour du code personnel, pas du code adverse.

Validé en navigateur : réseau bloqué (fetch échoue), parent inaccessible,
erreur/promesse rejetée capturées, message postMessage forgé ignoré, aucune fuite
de tests privés / solutions / code d'un autre workspace / `data/progress.json`.

## 13. Limites honnêtes

- **Pas d'isolation OS/conteneur** (voir §12).
- Le modèle DOM de **notation** est un sous-ensemble borné du navigateur : pas de
  mise en page réelle ni de cascade CSS complète. `computed-style-equals` ne
  couvre que le **style inline**. Les media queries / le layout responsive sont
  **rendus** fidèlement dans la preview mais **non notés** automatiquement.
- V11 = HTML/CSS/JS uniquement (pas de React/TSX ni de preview de framework).
- Les assertions événementielles couvrent `click`/`input` (extensible).

## 14. Tests & gates

`410 tests` (node:test) verts ; `tsc --noEmit` propre ; `next build` sans
avertissement ; `curriculum:check` OK ; `data/program.json` et les 365 jours
**byte-identiques** à `b7bc8e7`.

## 15. État Git final

Branche `claude/ai-career-os-saas-phfg49`, tous les checkpoints commités et
poussés, working tree propre, local == origin, `data/progress.json` restauré au
SHA initial (`12f5390…`), aucun workspace parasite.

## 16. Recommandation V12 (React/TSX)

1. Runtime `react-preview` réutilisant le **compilateur TypeScript V10** (jsx) +
   ce **document de preview** et ce **protocole postMessage**, sans toucher au
   modèle d'exercice.
2. Notation de composants : rendu dans l'iframe + assertions publiques postées ;
   tests privés toujours évalués serveur (étendre le modèle DOM au rendu React,
   ou instrumenter le composant).
3. `event-changes-text` étendu (change, submit, clavier) et assertions de classe
   après événement.
4. Élargir le corpus (accordéon accessible, thème clair/sombre, grille CSS notée
   via un moteur de style plus complet) et lier davantage de journées frontend.
