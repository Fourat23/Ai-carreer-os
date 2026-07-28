# ADR-012 — Runtime React/TSX (compilation TSX → preview React + notation serveur)

Statut : accepté (Sprint V12). Décision d'implémentation, concise.

## Contexte

V10 a livré un compilateur TypeScript pur (`lib/typescript-compile.mjs`). V11 a
livré une preview web sécurisée (iframe sandboxée `srcDoc`, CSP stricte,
postMessage validé), un modèle DOM minimal de notation (`lib/frontend-dom.mjs`)
et un harnais serveur (`lib/frontend-grade.mjs`) réutilisant l'exécuteur Node.
V12 ajoute un **runtime React/TSX réel** : compilation JSX/TSX → JavaScript,
**preview React locale** (sans CDN ni réseau) et **notation serveur** réutilisant
au maximum V10/V11. React **19.2.7** et ReactDOM **19.2.7** sont installés
localement (versions figées) ; `react/jsx-runtime`, `react-dom/client` et
`react-dom/server` sont résolubles.

## Décisions

### 1. Trois runtimes distincts (TypeScript / Web / React)

- **TypeScript** (`typescript`) : exécutable, compile `.ts` → JS exécuté par Node.
- **Web** (`web`) : preview HTML/CSS/JS, notation DOM serveur.
- **React** (`react-tsx`, NOUVEAU) : compile `.tsx`/`.jsx` → JS ; **preview** React
  dans l'iframe V11 ; **notation** par rendu serveur (`react-dom/server`) +
  modèle DOM V11. Le modèle `RuntimeAdapter` est **étendu**, pas contourné.

### 2. Compilation JSX/TSX

Réutilise le compilateur TypeScript (API programmatique) avec `jsx:
ts.JsxEmit.ReactJSX` (**runtime JSX automatique** : le JSX émet des appels à
`react/jsx-runtime`, pas de `import React` obligatoire), `module: CommonJS`,
`target: ES2020`, `strict` (assoupli pour `.jsx`), `esModuleInterop: true`.
Diagnostics normalisés (fichier, ligne, colonne, code, phase `compile`) comme en
V10. `noEmitOnError` : pas d'émission si erreur bloquante.

### 3. Résolution locale de React et ReactDOM (sans CDN, sans réseau)

- **Grading (serveur)** : le child Node résout `react`, `react-dom/server`,
  `react/jsx-runtime` depuis le `node_modules` du projet (remontée depuis le
  workspace). Aucune injection nécessaire.
- **Preview (client, iframe)** : React est **fourni par l'application** en
  injectant, dans un **micro-système CommonJS** à l'intérieur du `srcDoc`, les
  sources **de production** lues côté serveur depuis `node_modules` :
  `react` (cjs/react.production.js), `scheduler`, `react-dom`,
  `react-dom/client`, `react/jsx-runtime`. Un `process.env.NODE_ENV =
  'production'` et un `require(name)` sur registre sont fournis. **Une seule
  instance React** est enregistrée → pas d'« invalid hook call ». **Aucun CDN,
  aucune requête réseau** (CSP `connect-src 'none'` inchangée).

### 4. Modèle multi-fichiers & imports autorisés

Extensions : `.tsx`, `.ts`, `.jsx`, `.js`, `.css`, `.json` (lecture seule).
**Un seul fichier d'entrée** (`App.tsx` par défaut) exportant le composant
racine. Imports **RELATIFS** entre fichiers de l'exercice + **allowlist React**
explicite : `react`, `react-dom`, `react-dom/client`, `react/jsx-runtime`,
`react/jsx-dev-runtime`. Tout autre import (npm arbitraire, chemin absolu, URL,
built-in Node) est **rejeté** avant compilation. Cycles de modules gérés par le
micro-loader (cache de module en cours). CSS importé (`import './x.css'`) est
collecté et injecté comme `<style>` (l'import CSS n'exporte rien).

### 5. Génération du document de preview

Réutilise `lib/frontend-preview.mjs` (CSP, bootstrap console/erreurs, canal non
devinable, neutralisation `</script>`). Ajoute : sources React injectées, modules
utilisateur compilés enregistrés, un `<div id="root">` déterministe, et un
bootstrap qui `require` l'entrée puis `ReactDOM.createRoot(root).render(...)`.
**Remount** au refresh : nouvelle iframe (nouveau canal) → nouveau root propre
(l'ancien root est détruit avec l'iframe, pas de listener orphelin).

### 6. Notation serveur (réutilise V11)

Le harnais React (child Node cloisonné) : compile TSX→JS dans le workspace,
`require` l'entrée, puis pour chaque test rend le composant via
`renderToStaticMarkup(React.createElement(Entry, test.props ?? {}))`, parse le
HTML avec `parseHTML` (V11) et évalue l'assertion avec un `evalReactTest`
réutilisant `evalWebTest` + assertions React (rôle/nom accessibles, nombre
d'éléments, contenu de liste, visibilité conditionnelle **par props**). Les
diagnostics de compilation, erreurs runtime, tests publics et **agrégat privé**
sont séparés. Les tests privés restent **exclusivement serveur** (jamais dans le
srcDoc/props client/API/logs/index/backup/historique).

### 7. Limites honnêtes du grading

`renderToStaticMarkup` exécute le **rendu** (dont l'état initial de `useState`,
`useMemo`) mais **PAS les effets ni les événements**. Donc :
- **noté serveur (déterministe)** : rendu du composant, structure/sélecteurs,
  texte, attributs, rôles/noms accessibles, listes, comptage, **état/visibilité
  pilotés par les props** (ex. `visible={true}`, `items={[…]}`, `value="…"`).
- **NON noté automatiquement** : transitions d'état déclenchées par un clic/saisie
  réels (les effets et gestionnaires ne s'exécutent pas au rendu statique). Ce
  comportement est **exercé et visible dans la preview React vivante** (vrais
  événements, vrais hooks) ; les exercices sont conçus pour être **notés par
  rendu piloté par props** là où l'automatisation est fiable. Limite documentée,
  à l'image de `computed-style` en V11.

### 8. Discipline de bundle

CodeMirror, le compilateur TypeScript et **React** ne doivent apparaître dans
**aucun bundle de route hors `/lab/[id]`**. La preview React (construction du
srcDoc + injection React) est chargée **paresseusement**, uniquement à
l'ouverture d'un exercice React. Le compilateur TSX est **serveur uniquement**.

### 9. Sécurité — distinction honnête

1. **sandbox navigateur** : iframe origine opaque, `allow-scripts` seul (jamais
   `allow-same-origin`), CSP `default-src 'none'; connect-src 'none'` (réseau
   bloqué), navigation/popup/formulaires/téléchargements interdits ; postMessage
   validé (source + canal).
2. **protections applicatives** : allowlist runtime/extensions/imports (React +
   relatifs seuls), aucune donnée privée dans le srcDoc, tests privés serveur.
3. **limites de ressources** : timeout+SIGKILL et sortie plafonnée pour la
   compilation/notation, messages/logs bornés, debounce, nombre/taille de
   fichiers bornés.
4. **isolation OS/conteneur : NON fournie.** Compilation et notation sont des
   processus Node locaux ; la preview est un rendu navigateur local. Modèle de
   menace : accidents + ressources bornées pour du code personnel.

### 10. Évolution future (hors V12)

D'autres bibliothèques pourraient être ajoutées via une **allowlist étendue** et
le même micro-loader (sources locales injectées), sans CDN ni npm utilisateur.
La notation d'interactions réelles pourrait, à terme, s'appuyer sur un moteur de
rendu React plus complet côté serveur. Non implémenté ici.

## Conséquences

Nouveaux : `lib/react-compile.mjs` (compilation TSX/JSX + analyse d'imports),
`lib/react-preview.mjs` (srcDoc React + provisioning), `lib/react-grade.mjs`
(harnais de notation), assertions React dans `lib/frontend-dom.mjs`, adaptateur
`react-tsx` dans le registre, corpus `data/exercises/react-*.json`. Étendus sans
duplication : compilateur TS (V10), preview/DOM (V11), exécuteur Node (V9),
catalogue/recherche/backup/preuves. Node/Python/TypeScript/Web inchangés.
`/` et les routes hors Lab ne chargent ni CodeMirror, ni TypeScript, ni React.
