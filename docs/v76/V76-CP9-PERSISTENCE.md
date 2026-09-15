# V76 · CP9 — Persistance, brouillon périmé, réinitialisation

> Sondes rejouables : `node scripts/v76/cp9-persistence.mjs` (10 sondes HTTP
> contre le produit en marche) · tests : `tests/v76-persistence.test.mjs` (19) ·
> résultats bruts : `docs/v76/cp9-persistence.json`.

## 1 · Ce que le CP0 avait mesuré, et ce qu'il n'avait pas pu

Le CP0 avait établi quatre choses sur la persistance, et les avait vérifiées :

| fait | mesure CP0 |
|---|---|
| un brouillon survit à un rechargement | ✅ |
| un brouillon n'est **pas** une tentative | ✅ `36 → 36` |
| un `run` écrit une tentative, succès **ou** échec | ✅ |
| `reset` restaure les fichiers de départ | ✅ |

Et il en avait laissé une de côté, **écrite comme non mesurée** dans le modèle
de menace :

> `T20` — brouillon périmé écrasant un plus récent : **non mesuré**.

Le CP9 l'a mesurée. Elle se produisait.

## 2 · Le scénario, tel qu'il arrive vraiment

Ce n'est pas un scénario d'attaque. C'est la vie d'un onglet oublié :

1. l'apprenant ouvre l'exercice dans un onglet, puis passe à autre chose ;
2. plus tard, dans une autre fenêtre, il travaille pour de bon et enregistre ;
3. le premier onglet, resté ouvert, finit par enregistrer — autosave, fermeture
   de l'onglet, `sendBeacon` — et renvoie **son** état, vieux d'une heure ;
4. le travail de l'étape 2 disparaît.

Sans trace. Sans avertissement. Sans moyen de le retrouver.

La sonde `P4` mesure d'abord le comportement nu, sans jugement : **le dernier à
écrire gagne**. Ce n'est pas un défaut en soi — c'est la règle par défaut de
toute écriture concurrente. Le défaut est que « le dernier » n'est pas
« le plus récent » : c'est le dernier à avoir **appuyé**, quel que soit l'âge de
ce qu'il tient en main.

## 3 · Ce qui a été construit — et pourquoi si peu

**Une révision par fichier, et un refus.** Rien d'autre.

```js
// lib/workspace-fs.mjs
export function revisionDe(contenu) {
  return createHash('sha1').update(String(contenu ?? ''), 'utf8').digest('hex').slice(0, 12);
}
```

Elle est calculée sur le **contenu**, pas sur l'horloge. C'est la seule variante
qui a la bonne propriété : enregistrer deux fois un fichier identique ne doit
pas échouer. Une révision horodatée aurait refusé une sauvegarde qui ne change
rien — une protection qui punit l'inaction n'est pas une protection.

Le chemin complet :

- `readWorkspaceTree` pose `rev` sur chaque entrée ;
- `clientFiles()` la transmet à la surface ;
- la surface la mémorise et la renvoie **à la sauvegarde uniquement** ;
- le serveur compare, et refuse en **409** si la base a bougé.

### Pourquoi la révision ne voyage pas avec un `run`

Un `run` juge le code présent. Il n'arbitre pas une concurrence d'écriture.
Y exiger une révision ferait échouer une exécution pour une raison sans rapport
avec ce que l'apprenant vient de faire — et un lancement qui échoue « parce
qu'un autre onglet existe » est exactement le genre de friction qui fait fermer
le produit. La sauvegarde est le seul endroit où la question se pose.

### Pourquoi l'absence de révision ne refuse rien

```js
if (!revsAttendues || typeof revsAttendues !== 'object') return { refuse: false, conflits: [] };
```

Un client qui ne connaît pas encore les révisions **perd la protection, pas sa
sauvegarde**. La règle inverse aurait transformé une amélioration en panne pour
tout onglet ouvert avant le déploiement.

### Pourquoi un fichier inconnu du serveur n'est pas un conflit

C'est une **création**. Refuser une création parce qu'on n'a rien à comparer
serait refuser le cas le plus banal du monde.

## 4 · Ce que l'apprenant voit

Le refus n'est pas résolu à sa place. Pas de fusion devinée, pas d'écrasement
« au mieux », **pas de bouton « forcer »** — un test l'interdit explicitement.
Il voit :

> **Ce fichier a changé ailleurs.** `solution.mjs` a été modifié depuis que cet
> onglet l'a ouvert — sans doute dans une autre fenêtre. **Rien n'a été
> écrasé.** Recharge la page pour repartir de la version enregistrée, ou copie
> ton travail avant de recharger.

Trois choses dans ce message, et chacune a été pesée :

- **ce qui s'est passé**, en une phrase, sans vocabulaire de contrôle de
  version ;
- **« rien n'a été écrasé »**, parce que c'est la seule information qui compte
  dans la seconde qui suit ;
- **deux sorties**, dont une qui préserve le travail en cours.

Le bloc porte `role="alert"` : contrairement à `.lab-provenance`, qui décrit,
celui-ci attend une décision.

Et le refus rend le **contenu actuel** de l'autre version. Un refus qui dit
seulement « non » laisse l'apprenant devant un mur : il sait qu'il ne peut pas
écrire, sans savoir contre quoi. Ce n'est pas un confort — c'est ce qui rend le
refus actionnable, et la sonde `P5` le vérifie.

## 5 · La règle qui ne se négocie pas

Contrat gelé §1.11 :

> Aucun `RESET` n'efface jamais un `ATTEMPT`, une `SUBMISSION` ou une
> `EVIDENCE`. Effacer l'histoire d'un échec est le contournement `R4` de V75.

La sonde `P8` la vérifie de la manière la plus directe possible : elle
**fabrique une histoire** (un échec réel, puis une réussite réelle), compte les
faits, réinitialise **deux fois et de deux façons**, et recompte.

`tentatives 43 → 43 · preuves 12 → 12 · aides 3 → 3`

Et `RESET_EXERCISE`, gelé au CP1 comme *« la sémantique qui n'existera pas »*,
n'existe toujours pas : `P9` l'appelle et reçoit `400 — Action inconnue.`

## 6 · Les dix sondes

| # | sonde | résultat | observation |
|---|---|---|---|
| P1 | un brouillon survit à un rechargement | ✅ | conservé |
| P2 | un brouillon n'est PAS une tentative | ✅ | tentatives 43 → 43 |
| P3 | un brouillon survit à un passage sur un AUTRE exercice | ✅ | conservé |
| P4 | DEUX ONGLETS : le dernier à écrire gagne (mesure, pas verdict) | ✅ | gagnant : B (le plus récent) |
| P5 | **BROUILLON PÉRIMÉ : le travail récent est-il écrasé ?** | ✅ | refus **409** · le travail récent survit · l'autre version est rendue |
| P6 | `RESET_FILE` restaure UN fichier et laisse les autres | ✅ | `index.html` restauré · `style.css` intact |
| P7 | `RESET_WORKSPACE` restaure TOUS les fichiers | ✅ | 2/2 |
| P8 | **`RESET` n'efface AUCUN fait** | ✅ | 43→43 · 12→12 · 3→3 |
| P9 | `RESET_EXERCISE` n'existe pas | ✅ | `400 — Action inconnue.` |
| P10 | un fichier PROTÉGÉ n'est pas réinitialisable | ✅ | `400` |

**Avant le correctif, `P5` disait** :
`❌ le travail RÉCENT a été écrasé par un brouillon périmé`.

## 7 · Le défaut de mes propres tests — troisième variante de la même leçon

**Le premier passage du CP9 a laissé survivre trois mutations sur sept.** Elles
méritent d'être nommées, parce que c'est la même faute que le CP6 et le CP7,
sous une forme nouvelle.

Mes tests cherchaient **du texte dans la route** :

```js
assert.match(route, /conflitsDeRevision\(/);
assert.match(route, /status: 409/);
```

Ces deux lignes prouvent qu'un appel **existe**. Elles ne prouvent jamais qu'il
**sert à quelque chose**. Il a suffi de :

```js
if (false && conflits.length) {   // M3
```

pour rendre la protection inopérante **sans faire rougir un seul test**. De
même, déplacer l'écriture avant la vérification (`M4`) la rendait décorative :
le fichier était déjà écrasé quand le `409` partait.

### Les deux corrections

**(a) La décision est devenue pure.** Même geste qu'au CP5 pour la frontière
d'exécution : `decisionDeSauvegarde(revsAttendues, revsActuelles)` vit dans
`lib/workspace.mjs`, ne touche ni au disque ni au réseau, et les tests
l'**appellent** au lieu de la chercher. `lib/workspace-server.ts` y délègue.

**(b) L'ordre est vérifié comme un ordre.** Le test ne regarde plus quelle
chaîne apparaît en premier : il découpe ce qui se trouve **entre** le début de
la branche `save` et la vérification, et exige qu'aucune écriture n'y figure.

### Et une quatrième mutation a survécu au deuxième passage

`M11` — « la surface ignore le conflit ». Mon test cherchait `setConflit(` dans
le composant. **Le composant en contient deux** : celui qui éteint
l'avertissement après un succès, et celui qui l'allume après un refus. Effacer
le second laissait le premier — donc le test vert, pendant que le refus
redevenait invisible.

Même remède : `lectureDuRefus()` dans `lib/workspace-conflit.mjs` (module pur,
sans aucun import Node, puisqu'il est chargé par un composant client). La
surface l'appelle, les tests l'exercent, et trois mutations de cette fonction
meurent maintenant.

**Ce que je retiens, écrit pour le CP14** : une assertion de texte tient une
convention, jamais un comportement. Quand la propriété à garder est
comportementale, il faut soit une fonction pure qu'un test peut appeler, soit
une exécution réelle. Il n'y a pas de troisième voie, et « le test est vert »
n'est pas la même chose que « la propriété est tenue ».

## 8 · Le gantelet de mutations — 14 mutations, 14 tuées

Deux ensembles, parce que deux natures de propriété.

### Groupe A — tuables par `node --test tests/v76-persistence.test.mjs`

| # | mutation | fichier | tuée par |
|---|---|---|---|
| `M1` | la révision devient constante | `lib/workspace-fs.mjs` | même contenu ⇒ même révision, contenu différent ⇒ révision différente |
| `M2` | l'arborescence ne porte plus de révision | `lib/workspace-fs.mjs` | la révision est servie avec chaque fichier |
| `M5` | la décision n'oppose jamais de refus | `lib/workspace.mjs` | une base PÉRIMÉE est refusée |
| `M6` | la décision refuse tout | `lib/workspace.mjs` | sans révisions annoncées, rien n'est refusé |
| `M8` | `reset` efface aussi les faits | `route.ts` | aucune réinitialisation ne touche aux faits |
| `M9` | `RESET_EXERCISE` est inventé | `route.ts` | `RESET_EXERCISE` n'existe pas |
| `M10` | le client renvoie ses révisions à CHAQUE action | `LabWorkspace.tsx` | la base est réservée à la sauvegarde |
| `M11` | la surface ne voit plus le refus | `lib/workspace-conflit.mjs` | un refus est LU comme un refus |
| `M12` | un fichier inconnu du serveur devient un conflit | `lib/workspace.mjs` | un fichier inconnu est une CRÉATION |
| `M13` | le refus perd le contenu de l'autre version | `lib/workspace-conflit.mjs` | un refus est LU comme un refus |
| `M14` | tout est vu comme un conflit | `lib/workspace-conflit.mjs` | une sauvegarde RÉUSSIE n'annonce rien |

### Groupe B — que SEULE une exécution réelle peut tuer

Chacune est appliquée, **le produit est reconstruit et servi**, puis la sonde
`P5` est rejouée.

| # | mutation | fichier | `P5` sous mutation |
|---|---|---|---|
| `M3` | `if (false && conflits.length)` | `route.ts` | ❌ *le travail RÉCENT a été écrasé par un brouillon périmé* |
| `M4` | les fichiers sont écrits AVANT la vérification | `route.ts` | ❌ *le travail RÉCENT a été écrasé par un brouillon périmé* |
| `M7` | le refus ne rend plus le contenu de l'autre version | `workspace-server.ts` | ❌ *l'autre version est rendue : non* |

**14 mutations, 14 tuées, aucune protection affaiblie pour y parvenir.**

### La limite, déclarée plutôt que masquée

`M3`, `M4` et `M7` portent sur une **route Next.js en TypeScript**. `npm test`
ne peut pas l'exécuter : il n'y a pas de harnais d'intégration dans ce dépôt,
et aucune assertion statique ne peut prouver qu'un handler appelle réellement ce
qu'il importe. Ces trois-là sont donc tuées par la **sonde**, pas par la suite
de tests — et le gantelet du CP14 devra faire tourner les deux, pas seulement
`npm test`.

## 9 · Ce qui n'a PAS été construit

- **Aucun historique de versions, aucun `diff` à trois volets, aucune fusion.**
  Le défaut démontré est « le travail disparaît sans qu'on le sache ». Le refus
  + le contenu de l'autre version y répondent. Un mini-Git ne répondrait à rien
  de mesuré — ce serait `G14`.
- **Aucun verrou de fichier.** Un verrou transforme un onglet oublié en blocage
  permanent : le remède serait pire.
- **Aucun autosave plus agressif, aucun intervalle modifié.** Rien ne l'a
  demandé.
- **Aucun `RESET_EXERCISE`**, comme gelé au CP1.

## 10 · Vérifications

| | |
|---|---|
| `npm test` | **1936 / 1936** |
| `npx tsc --noEmit` | 0 |
| `npx next build` | OK |
| `npm run gates:active` | **48 portes, 0 violation** |
| sondes CP9 | **10 / 10** |
| mutations | **14 appliquées, 14 tuées** |
| `data/progress.json` | **absent** (fixture hors dépôt via `AICOS_PROGRESS_FILE`) |
