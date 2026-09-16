# V77.1 · CP2 — RÉINITIALISER N'EST PAS SUPPRIMER

> Le CP0 n'avait pas trouvé un bug. Il avait trouvé **deux phrases fausses** et
> **une route manquante**. Le CP2 écrit la route, et rend les phrases vraies.

---

## 1. Ce qui était faux, mesuré au CP0

| # | le produit disait | la mesure disait |
|---|---|---|
| `F4` | — | **aucune route `DELETE ALL` n'existe.** `app/api/progress/` = `export`, `import`, `reset` |
| `F5` | « Efface **toute** ta progression […] Cette action est **irréversible** » puis, deux lignes plus bas, « l'état actuel sera tout de même **sauvegardé automatiquement** » | le même bloc affirmait une chose et son contraire |
| `F6` | « Télécharge **toutes tes données locales** » | les journaux de tentatives — **le code de l'apprenant** — n'y étaient pas |
| `F7` | — | `reset` conserve `lab-journals/` et `lab-workspaces/` : délibéré (V76 · CP10), **mais non dit** |

Le comportement de `reset` n'était pas le problème. **Le mot l'était.**

---

## 2. Ce que le CP2 a construit

### 2.1 Une carte des données, et elle est la source

`lib/learner-data.mjs` — pur, sans I/O — porte `CATEGORIES_DONNEES_APPRENANT` :
quatre catégories, et pour chacune ce que font les quatre opérations.

| catégorie | contient du code | `reset` | `delete all` | sauvegarde | archive |
|---|---|---|---|---|---|
| `progress` | non | **VIDÉ** | **SUPPRIMÉ** | INCLUS | INCLUS |
| `progress-snapshot` | non | **CRÉÉ** | **SUPPRIMÉ** | ABSENT | INCLUS |
| `lab-workspaces` | **oui** | CONSERVÉ | **SUPPRIMÉ** | INCLUS | INCLUS |
| `lab-journals` | **oui** | CONSERVÉ | **SUPPRIMÉ** | **ABSENT** | INCLUS |

L'interface, les trois routes, la documentation et les tests **lisent** ce
tableau. Personne ne le recopie. `couvreToutesLesDonnees(operation)` en dérive
la seule chose qui compte pour le wording :

```
deleteAll              true    ← a le droit de dire « toutes mes données »
archiveComplete        true    ← a le droit de dire « toutes mes données »
reset                  false   ← ne l'a pas
sauvegardeRestaurable  false   ← ne l'a pas
```

C'est la réponse à `F5` et `F6` : la phrase n'est plus une décision de
rédaction, c'est une **conséquence** de la carte, et un test rougit si les deux
divergent.

### 2.2 `POST /api/progress/delete-all`

Elle supprime réellement, sur le disque, les quatre catégories. Elle ne crée
**aucun** instantané — c'est sa différence de fond avec `reset`, et le seul
endroit du produit où le mot *irréversible* est vrai.

Elle exige `{"confirmation":"SUPPRIMER"}`. Un `POST` vide ne supprime rien.

### 2.3 Deux verrous, parce que `data/` contient le curriculum

C'est le risque central de ce checkpoint, et il mérite d'être nommé :
`data/` **n'est pas** le répertoire de l'apprenant. Il contient
`data/exercises/`, `data/assessments/`, `data/capstones/`, `data/missions/`,
`data/program.json` — le programme de 365 jours. Une suppression écrite « efface
`data/` » aurait détruit le produit en croyant respecter un droit.

| verrou | ce qu'il fait |
|---|---|
| **liste blanche** | `planDeSuppression` ne connaît que **quatre chemins nommés un par un**. Il n'existe aucun balayage, aucun glob, aucun `rm -rf` d'un répertoire deviné |
| **garde-fou** | `violationsDuPlan` **refuse le plan entier** si l'un des chemins tombe dans un répertoire ou un fichier du produit, vaut la racine du projet, ou vaut `/` |

Et le refus est total : **un plan refusé ne supprime rien**, pas même les
catégories parfaitement légitimes. Un test le vérifie en injectant
`journals → curriculum/` et en relisant les trois autres catégories, intactes.

Le garde-fou compare des **segments**, pas des préfixes de texte : `/a/data`
n'est pas le parent de `/a/database`. Un test pin cette distinction, parce
qu'une comparaison de chaînes aurait laissé passer exactement l'inverse de ce
qu'on croit garder.

Un chemin **hors** du projet reste supprimable : `AICOS_PROGRESS_FILE` peut
pointer ailleurs, et c'est même ainsi que le pilote fonctionnera.

### 2.4 `GET /api/progress/export-all`

Une **seconde** route, pas un champ de plus dans la sauvegarde. La raison est
qu'il s'agit de deux besoins différents :

| | sauvegarde restaurable | archive complète |
|---|---|---|
| relisible par `/api/progress/import` | **oui** | non |
| contient les journaux (le code) | **non** | **oui** |
| contient l'instantané de secours | non | **oui** |
| sert à | revenir en arrière | **emporter** |

Verser les journaux dans la sauvegarde aurait obligé à toucher
`serializeBackupV3` / `parseBackupV3` / `validateStrict` — le format que trois
portes gardent — pour servir un besoin qui n'est pas celui de la restauration.
**Deux noms exacts valent mieux qu'un nom élargi.**

### 2.5 `reset` rend désormais sa portée

Le comportement est **inchangé** — V76 · CP10 reste : un `RESET` n'efface pas
l'histoire d'un échec. Ce qui change est que la route rend `porteeDe('reset')`,
dérivé de la carte : l'appelant peut **vérifier** ce qui a survécu au lieu de le
croire.

---

## 3. Le wording, ligne à ligne

| bloc | avant | après |
|---|---|---|
| export | « Télécharge **toutes tes données locales** » | « Exporter une sauvegarde restaurable […] **Il ne contient pas tes journaux de tentatives** — pour les emporter, utilise l'archive complète » |
| — | *(n'existait pas)* | « **Exporter toutes mes données** […] C'est tout ce que cette machine détient de toi. Cette archive **n'est pas restaurable** » |
| réinitialiser | « Efface **toute** ta progression […] **irréversible** » | « Réinitialiser ma progression […] **Ce n'est pas une suppression.** Un instantané […] est conservé, et tes workspaces ainsi que tes journaux de tentatives — donc ton code — restent intacts » |
| confirmation | « Tout sera effacé (l'état actuel sera **tout de même sauvegardé**) » | « La progression repart de zéro. L'état actuel est conservé dans un instantané de secours ; ton code n'est pas touché » |
| — | *(n'existait pas)* | « **Supprimer toutes mes données** […] **y compris le code que tu as écrit**. Aucune sauvegarde n'est créée […] Les leçons, les exercices et leurs corrigés ne sont pas touchés : ils ne t'appartiennent pas » |

Le mot *irréversible* a **disparu** du bloc `reset` et **apparaît** dans le bloc
de suppression. Il n'y a qu'un seul endroit où il est vrai.

---

## 4. Mesuré en HTTP réel, pas en unité seulement

Serveur de production reconstruit, progression hors dépôt
(`AICOS_PROGRESS_FILE`), données d'apprenant réelles créées d'abord.

```
AVANT
  progression  1 jour terminé, hors dépôt
  instantané   présent
  workspaces   data/lab-workspaces/fizzbuzz/index.js
  journaux     data/lab-journals/fizzbuzz.json  → contient "code rate"

/api/progress/export       → le code du journal est DEDANS ?  False
/api/progress/export-all   → kind = archive-complete
                             categories = progress INCLUS · snapshot INCLUS
                                          workspaces INCLUS · journals INCLUS
                             journaux = ['fizzbuzz']   code dedans = True
                             instantané = présent

POST /delete-all  {}                        → 400 CONFIRMATION_MANQUANTE
POST /delete-all  {"confirmation":"supprimer"} → 400 CONFIRMATION_MANQUANTE
   → progression et journal TOUJOURS sur le disque

POST /delete-all  {"confirmation":"SUPPRIMER"} → 200 ok:true
   progress           etaitPresent True · 1 fichier · reste False
   progress-snapshot  etaitPresent True · 1 fichier · reste False
   lab-workspaces     etaitPresent True · 1 fichier · reste False
   lab-journals       etaitPresent True · 1 fichier · reste False

APRÈS — sur le disque
  progress.json          absent      data/program.json      PRÉSENT
  progress.backup.json   absent      data/exercises         PRÉSENT
  data/lab-workspaces    absent      data/assessments       PRÉSENT
  data/lab-journals      absent      data/capstones         PRÉSENT
                                     data/missions          PRÉSENT
                                     curriculum             PRÉSENT
                                     lib/evidence.mjs       PRÉSENT

/api/progress/export-all (rejoué)  → journaux {} · instantané None
                                     workspaces {} · progression vide
```

**La minuscule compte** : `"supprimer"` est refusé, `"SUPPRIMER"` accepté.

---

## 5. Les tests

`tests/v771-learner-data.test.mjs` — **22 tests**. Ils créent un faux projet
dans un répertoire temporaire, avec les données de l'apprenant **et le
curriculum côte à côte**, appellent la fonction de suppression **du produit**,
puis relisent le disque.

| ce qui est tenu |
|---|
| les quatre catégories sont nommées **en clair** — pas dérivées de la chose testée |
| `reset` ne couvre pas tout, `deleteAll` et l'archive oui |
| un plan visant `data/`, un répertoire du produit, un fichier du produit, la racine, ou `/` est refusé — **chacun vérifié un par un** |
| un plan refusé ne supprime **rien** |
| la suppression efface réellement les quatre catégories **sur le disque** |
| elle emporte le **code** : workspaces ET journaux |
| curriculum, exercices, `program.json`, leçons et code source **survivent** |
| elle ne crée **aucun** filet |
| elle est **idempotente** |
| le rapport compte les fichiers **réellement** supprimés (sous-répertoires inclus) |
| `estSousLeChemin` compare des segments : `/a/data` ≠ parent de `/a/database` |

`tests/v771-data-rights-ux.test.mjs` — **14 tests**. Ils ne tiennent pas une
formulation : ils tiennent la **relation** entre ce qu'un bloc annonce et ce que
la carte dit qu'il fait. Deux exceptions assumées — l'absence littérale des deux
phrases du CP0 — parce que celles-là sont des faits historiques, pas du style.

Un test interdit à la route de l'archive de **recopier** un identifiant de
catégorie ; un autre interdit à la route de suppression de recopier le mot
`SUPPRIMER`. Une seule source, vérifiée comme telle.

---

## 6. Le gantelet

| | |
|---|---|
| `npm test` | **2213 / 2213** (2177 + 36 nouveaux) |
| `npx tsc --noEmit` | **0 erreur** |
| `npx next build` | **OK** |
| `npm run gates:active` | **50 portes, 0 violation** |
| `data/progress.json` | **absent** |
| traversée HTTP réelle | **faite** — §4 |

---

## 7. Ce que le CP2 n'a PAS fait

- **Le comportement de `reset` n'a pas changé.** V76 · CP10 tient : un `RESET`
  n'efface pas l'histoire d'un échec. Seul le **mot** a été corrigé.
- **Le format de sauvegarde n'a pas été touché.** `serializeBackupV3`,
  `parseBackupV3` et `validateStrict` sont intacts — l'archive est une route
  distincte, précisément pour ne pas les remuer à la veille d'un pilote.
- **Aucune notion de « données d'étude » n'a été inventée.** Le pilote n'écrit
  pas de catégorie nouvelle : il traverse la boucle et lit les faits existants.
  Inventer un magasin séparé aurait créé une cinquième catégorie à supprimer, à
  exporter et à tester, pour un besoin que personne n'a mesuré.
- **Aucun chiffrement, aucune anonymisation, aucun multi-profil.** Ce sont des
  besoins réels ; aucun n'est nécessaire à un pilote local de trois personnes,
  et chacun est déclaré dans `V78-DATA-RIGHTS.md` §5 au lieu d'être suggéré.
- **Aucune suppression sélective** (« efface seulement mes journaux »). Le droit
  exercé dans un pilote est « tout emporter » ou « tout effacer ».
