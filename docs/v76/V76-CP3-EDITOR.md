# V76 · CP3 — L'éditeur : deux langages manquants, et rien d'autre

> **Un défaut démontré, corrigé. Aucune fonction décorative ajoutée.**

---

## 1. Le défaut, et comment il a été trouvé

`lib/exercise-files.mjs` déduit le langage de chaque fichier depuis son
extension, et il le fait **correctement** — `html`, `css`, `json`, `markdown`,
`text` y sont reconnus depuis longtemps :

```js
const LANG_BY_EXT = {
  mjs: 'javascript', js: 'javascript', cjs: 'javascript',
  ts: 'typescript', tsx: 'tsx', jsx: 'jsx',
  py: 'python',
  html: 'html', htm: 'html', css: 'css',
  json: 'json', md: 'markdown', txt: 'text',
};
```

Mais `CodeMirrorEditor.tsx` n'en connaissait que **quatre** :

```js
if (language === 'python') return python();
if (language === 'tsx')    return javascript({ typescript: true, jsx: true });
if (language === 'jsx')    return javascript({ jsx: true });
return javascript({ typescript: language === 'typescript' });   // ← tout le reste
```

**Le langage était correctement calculé, puis jeté.** Une information juste,
transportée jusqu'à l'éditeur, et ignorée à la dernière ligne.

### Ce que ça coûtait, en fichiers réels

Extensions présentes dans les 376 exercices :

```
.mjs 236 · .py 113 · .ts 21 · .tsx 18 · .html 11 · .js 8 · .jsx 4 · .css 3
```

**11 fichiers `.html` et 3 fichiers `.css` étaient colorés avec une grammaire
JavaScript** — dans les exercices `web`, c'est-à-dire précisément ceux où le
langage **est** le sujet de l'apprentissage.

---

## 2. Le correctif : deux lignes, deux paquets

```js
if (language === 'html') return html();
if (language === 'css')  return css();
```

`@codemirror/lang-html` et `@codemirror/lang-css`. **Rien d'autre.** Le contrat
interdit les fonctions d'IDE décoratives : c'est un environnement
d'apprentissage, pas un clone de VS Code.

**`json` reste volontairement en mode JavaScript** : sa grammaire en est un
sous-ensemble, et **aucun exercice du corpus n'a de fichier `.json` éditable`.
Ajouter un paquet pour zéro fichier serait le contournement `G13`.

---

## 3. Pourquoi « ça colore » n'était pas une preuve

Rendu réel dans Chromium, sur `web-card` :

| fichier actif | jetons colorés |
|---|---|
| `index.html` | 19 |
| `style.css` | 23 |

**Ce tableau ne prouve rien.** Une grammaire fausse produit *aussi* des jetons :
le repli JavaScript colorait déjà `.card` comme un accès de propriété et `320px`
comme un nombre suivi d'un identifiant. Compter des `<span>` aurait validé le
défaut aussi bien que le correctif.

### La preuve qui discrimine

`tests/v76-editor-languages.test.mjs` compare les **arbres syntaxiques** produits
par les deux grammaires sur le même texte, et exige que la bonne reconnaisse des
nœuds que la mauvaise **ne peut pas** produire :

| grammaire | nœuds reconnus, absents de l'analyse JavaScript |
|---|---|
| `html()` | `Element` · `TagName` · `Attribute` · `AttributeName` |
| `css()` | `RuleSet` · `ClassSelector` · `Declaration` · `PropertyName` |

Et surtout, le test décisif :

> **Sur `.card { max-width: 320px; }`, la grammaire JavaScript produit un nœud
> d'erreur `⚠`.** Le repli n'était pas « un peu moins joli » : il **n'arrivait
> pas à analyser le document**.

---

## 4. Branché, pas seulement importé

La distinction que V75 a payée trois fois. Un test lit le code de l'éditeur, en
retire les commentaires, et exige le **câblage** — pas l'import :

```js
assert.match(code, /language === 'html'\)\s*return html\(\)/);
assert.match(code, /language === 'css'\)\s*return css\(\)/);
```

---

## 5. Le test garde la décision dans les DEUX sens

`G13` interdit d'ajouter une capacité que les données ne justifient pas. Le test
l'applique symétriquement :

- il **exige** qu'il y ait au moins 5 fichiers HTML et 1 fichier CSS dans le
  corpus — sinon l'ajout du CP3 serait une capacité pour personne ;
- il **exige** qu'aucun langage présent au moins 3 fois ne reste sans grammaire
  dédiée — pour que le défaut corrigé ici ne puisse pas réapparaître ailleurs.

---

## 6. Deux mutations, vues rouges

| mutation | résultat |
|---|---|
| `html()` débranché de l'éditeur | 🔴 |
| `css()` débranché de l'éditeur | 🔴 |

Fichier restauré, arbre vérifié propre après chaque essai.

---

## 7. Ce qui n'a PAS été ajouté

Le brief prévient : *« ne pas ajouter 200 options, Learning IDE et pas clone de
VS Code »*. Étaient possibles, et écartés faute de défaut démontré :

| envisagé | pourquoi non |
|---|---|
| autocomplétion | aucune mesure ne montre qu'elle manque ; elle nuirait même au rappel actif |
| pliage de code | 236 fichiers `.mjs` de moins de 60 lignes |
| recherche/remplacement | la palette de fichiers existe déjà (`⌘K`) |
| minimap | inutile à cette taille de fichier |
| multi-curseur | aucun exercice ne l'exige |
| linter temps réel | ferait le travail que l'exercice demande à l'apprenant |

**Le dernier mérite d'être explicite** : un linter qui souligne l'erreur avant
l'exécution retirerait à l'apprenant l'étape « exécuter, observer, comprendre »
que tout le produit cherche à provoquer.
