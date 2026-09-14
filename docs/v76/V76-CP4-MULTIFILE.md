# V76 · CP4 — Le multi-fichier : trois exercices, rien à reconstruire

> **Trois exercices sur 376. La séquence complète passe sur les trois.
> Aucune ligne écrite.**

---

## 1. Le chiffre qui décide du checkpoint

Le CP0 a compté les fichiers éditables de chacun des 376 exercices :

| fichiers éditables | exercices |
|---|---|
| **1** | **373** |
| **2** | **3** |

Les trois sont des exercices `web`, et le brief avait anticipé exactement ce cas :

> *« Ne construis pas multi-file si aucun exercice ne le nécessite. Mais si le
> curriculum en dépend, le Workbench doit le supporter. »*

Le curriculum en dépend **un peu**. Le Workbench le supporte **déjà**. Le travail
du CP4 était donc de le **prouver**, pas de le construire.

---

## 2. Les trois exercices

| exercice | éditables | protégé | langages servis |
|---|---|---|---|
| `web-card` | `index.html` · `style.css` | — | html · css |
| `web-counter` | `style.css` · `app.js` | **`index.html`** (lecture seule) | html · css · javascript |
| `web-nav` | `index.html` · `style.css` | — | html · css |

`web-counter` est le plus intéressant des trois : il sert **trois** fichiers dont
**un en lecture seule**, dans **trois langages différents**. C'est le cas qui
exerce à la fois le multi-fichier, la protection et — depuis le CP3 — les trois
grammaires de coloration.

---

## 3. La séquence complète du brief, par HTTP

`départ → éditer A → éditer B → lancer → échec → reprise → réussite → reset →
recharger`

| exercice | ouvre | tous servis | édition conservée | éditions indépendantes | échoue | réussit | reset | rechargement |
|---|---|---|---|---|---|---|---|---|
| `web-card` | ✅ | ✅ | ✅ | ✅ | ✅ **0/5** | ✅ **5/5** | ✅ | ✅ |
| `web-counter` | ✅ | ✅ | ✅ | ✅ | ✅ **2/4** | ✅ **4/4** | ✅ | ✅ |
| `web-nav` | ✅ | ✅ | ✅ | ✅ | ✅ **0/3** | ✅ **3/3** | ✅ | ✅ |

**3/3 sur les neuf étapes.**

### « Éditions indépendantes » : la vérification qui n'était pas évidente

Le multi-fichier a un défaut caractéristique : **sauvegarder un fichier écrase
les autres**. Le script marque donc chaque fichier avec un commentaire unique,
l'un après l'autre, et vérifie après **chaque** sauvegarde que les marques
précédentes sont toujours là.

**Aucune perte sur les trois exercices.**

---

## 4. Les trois natures de fichier, gelées au CP1

| exercice | lecture seule servie | test caché **non** servi | drapeaux transmis | écriture sur protégé |
|---|---|---|---|---|
| `web-card` | ✅ | ✅ | ✅ | — |
| `web-counter` | ✅ | ✅ | ✅ | ✅ **refusée** |
| `web-nav` | ✅ | ✅ | ✅ | — |

Le refus est explicite et lisible :

> *« Fichier en lecture seule : « index.html ». »*

**C'est la garantie qui compte le plus dans un multi-fichier.** Si l'apprenant
pouvait réécrire `index.html` dans `web-counter`, il pourrait faire passer les
tests en changeant l'énoncé plutôt qu'en résolvant le problème. Le produit
refuse, et le dit.

Le script vérifie aussi que les **drapeaux** `editable` transmis au client
correspondent exactement aux natures déclarées côté serveur : une interface qui
laisserait taper dans un fichier que le serveur refusera ensuite serait une
promesse fausse.

---

## 5. Ce qui n'a pas été construit

| envisagé par le brief | pourquoi non |
|---|---|
| arbre de fichiers hiérarchique | **aucun exercice n'a de sous-répertoire** — les 3 sont à plat |
| création de fichier par l'apprenant | **aucun exercice ne le demande** ; le harnais exécute une entrée fixe |
| suppression de fichier | idem |
| renommage | idem |
| glisser-déposer, import | aucun besoin mesuré |

Le Workbench possède déjà des **onglets** et une **palette de fichiers** (`⌘K`)
— largement suffisants pour deux ou trois fichiers à plat.

Construire un arbre de fichiers complet pour **trois exercices sans
sous-répertoire** aurait été le contournement `G13` : une capacité pour personne.

---

## 6. La limite déclarée

**Ces trois exercices sont tous `web`.** Le multi-fichier n'a donc **jamais été
exercé sur un runtime qui exécute réellement du code** (`node-js`, `python3`,
`typescript`, `python-ds`) — où interviendraient des imports entre fichiers, une
résolution de modules, un `sys.path`.

`lib/runtime.mjs` déclare `multiFile: true` pour **tous** les runtimes. Cette
capacité est donc **déclarée mais non vérifiée** pour quatre d'entre eux, faute
d'exercice à mesurer. C'est écrit ici plutôt que supposé : le jour où un exercice
Python multi-fichier sera écrit, il faudra le mesurer avant de le déclarer
supporté.

---

## 7. Artefact

`docs/v76/cp4-multifile.json` — les trois séquences, étape par étape.
`node scripts/v76/cp4-multifile.mjs` les rejoue.
