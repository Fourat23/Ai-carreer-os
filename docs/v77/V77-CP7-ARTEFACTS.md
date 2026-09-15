# V77 · CP7 — QUATRE SURFACES ANALYSAIENT VRAIMENT, ET N'ÉCRIVAIENT RIEN

> Le CP3 a réglé une des six surfaces muettes. Il en restait cinq. Celles-ci
> sont les **quatre qui observent un vrai travail** — et la cinquième,
> `pipelines`, qui n'en observe pas.

---

## 1. Ce que le CP0 avait mesuré

`kubernetes`, `cloud-lab`, `cloud-foundations` et `security` **valident et
analysent réellement** : elles acceptent un artefact, le valident contre un
schéma (`422` s'il est mal formé), puis rendent des diagnostics classés par
sévérité et par dimension. Réponse `200`, résultat substantiel — et **zéro octet
écrit**. C'est la moitié de la dette `D7` que le CP3 n'avait pas couverte.

Ce que ces surfaces ont et que le terminal n'avait pas : **l'apprenant rédige
vraiment quelque chose.** Un manifeste Kubernetes, une topologie réseau, une
architecture cloud, un scénario de sécurité. Ce n'est pas un choix dans une
énumération fermée, c'est une production. Elle mérite un fait.

## 2. Pourquoi `OBSERVED`, et pas plus

> **Un compte de diagnostics n'est pas un verdict.**

Il aurait été facile de traiter `0 diagnostic` comme une réussite : quatre
surfaces de plus en `VALIDATED`, et un tableau de couverture flatteur. C'est
faux, et la raison est structurelle : l'analyseur signale **ce qu'il sait
reconnaître**. `0 diagnostic` veut dire *« rien de ce que je sais détecter n'a
été détecté »* — jamais *« c'est juste »*. Une architecture vide déclenche peu de
règles ; récompenser ce silence reviendrait à récompenser le vide.

Le fait ne porte donc **aucune issue** : ni `passed`, ni `score`, ni `reussite`.
Même discipline que `UsageEvent` au CP3, pour une raison opposée — là, il n'y
avait rien à juger ; ici, il y a un vrai travail **que le produit ne sait pas
juger**.

`niveau: 'OBSERVED'` et `simulation: true` sont des **constantes structurelles** :
elles ne dépendent ni de l'artefact ni du résultat. La surface ne sait pas
juger, donc elle ne jugera jamais — quel que soit ce qui est soumis. Et aucun
cluster, aucun réseau, aucun appel cloud, aucune credential réelle n'existe :
les quatre routes le disent en tête de fichier depuis V22–V25.

## 3. La garde qui compte le plus

Les quatre routes acceptent `analyze` **sans** artefact et retombent alors sur
la fixture fournie par le produit. Enregistrer cette analyse reviendrait à
**compter une page vue comme du travail** — la façon la plus facile de gonfler
une couverture, et nommément interdite.

Deux gardes, pas une :

- le module pur **refuse** le fait quand `artefactFourni !== true` (un refus,
  pas une valeur par défaut) ;
- l'écriture partagée sort avant même d'appeler le moteur.

**Mesuré en HTTP**, sur `kubernetes/broken-service` :

```
analyze SANS artefact  →  7 diagnostics calculés  ·  AUCUN fichier écrit
analyze AVEC artefact  →  7 diagnostics calculés  ·  1 fait :
    kubernetes broken-service diagnostics=7 niveau=OBSERVED simulation=true
    parSeverite {blocking:1, risk:3, warning:2, observation:1}
    evidence : 0
```

Les deux appels calculent exactement la même chose. **Seul le second est un
travail de l'apprenant**, et seul le second laisse une trace.

## 4. Une seule écriture pour quatre routes

Les quatre surfaces partagent la même forme. Quatre copies de la même écriture
divergeraient, et l'une d'elles finirait par compter ce que les trois autres
refusent — c'est la leçon des listes blanches du CP3, appliquée **avant** d'en
payer le prix. `lib/artifact-analysis-server.ts` est le seul endroit qui
construit la commande ; un test vérifie qu'aucune route ne la reconstruit
elle-même.

### 4.1 Une empreinte qui distingue vraiment

`empreinteReponses` (V75 · CP10) sérialise `clé=valeur` : elle convient à des
réponses plates, pas à un manifeste imbriqué, où tout deviendrait
`[object Object]` et où **deux architectures différentes auraient la même
empreinte** — l'inverse de ce qu'on demande à une empreinte.

`empreinteDArtefact` sérialise donc en JSON **à clés triées** (un changement
d'ordre de champs ne crée pas une fausse « nouvelle version »), puis en prend une
empreinte FNV-1a — déterministe, sans dépendance. Ce n'est pas cryptographique et
n'a pas à l'être : elle distingue deux soumissions, elle ne résiste pas à un
adversaire.

Conséquence : un rejeu réseau fait **un** fait ; deux versions d'un artefact en
font **deux**, même à la même seconde, parce que ce sont deux productions.

## 5. `pipelines` — le renversement du CP1, tenu

Le brief demandait de ne pas jeter le verdict objectif de cette route
(`success`/`failed`/`blocked`). Le CP1 l'a renversé après lecture du code, et la
raison tient en une phrase :

> la route n'accepte **aucun pipeline candidat**.

Le corps est `{ action, event, approved }`. L'apprenant choisit un déclencheur et
coche une approbation ; **le pipeline est fourni par le produit**. Deux
apprenants qui choisissent le même déclencheur obtiennent exactement le même
résultat.

> *Le statut mesure la fixture, pas la personne.*

`pipelines` reçoit donc `USAGE_ONLY`, comme le terminal — **mais par un chemin
différent, et il faut le dire** :

| surface | ce qui manque | ce qu'on écrit |
|---|---|---|
| `terminal` | aucun critère de réussite ; arguments en énumération fermée | l'usage |
| `pipelines` | un critère objectif, mais qui porte sur **la fixture** | l'usage |
| les quatre analytiques | rien ne manque : l'apprenant **rédige** | `ArtifactAnalysis`, `OBSERVED` |

Mesuré en HTTP : le moteur rend `status: success`, et le fait écrit ne porte que
`{ adapter: 'manual' }`. **Le verdict n'est pas recopié** — un test vérifie que
ni `run.status`, ni `success`, ni `failed`, ni `blocked` n'apparaissent dans le
bloc d'écriture.

## 6. Ce que ce checkpoint N'A PAS fait

- **Aucune preuve.** Enregistrer une analyse ne modifie que `artifactAnalyses` —
  vérifié en comparant l'état complet avant/après.
- **Aucun moteur touché.** Compétence, rétention et récupération ignorent le
  champ ; un test de dépendance le garde.
- **Aucune surface promue.** `pipelines` reste sans `ArtifactAnalysis`, et le
  vocabulaire des surfaces analytiques le refuse explicitement.
- **Aucun `remediate` compté.** Cette action rend l'état **corrigé par le
  produit** : ce n'est pas le travail de l'apprenant, et elle n'écrit rien.

## 7. Vérifications

| vérification | résultat |
|---|---|
| `tests/v77-artifact-analysis.test.mjs` | **22 / 22** |
| `npm test` | **2103 / 2103** |
| `npx tsc --noEmit` | **0 erreur** |
| `npx next build` | **OK** |
| `npm run gates:active` | **49 portes, 0 violation** |
| `bash scripts/v76-negative.sh` | **11 règles vues échouer, 0 trou** |
| chaîne HTTP réelle | sans artefact → **0 octet** · avec artefact → **1 fait, 0 preuve** · pipeline → usage sans verdict |
| `data/progress.json` | **absent** |

## 8. Ce qui reste incertain

**On ne sait pas si l'artefact est bon.** C'est la limite assumée du checkpoint,
et elle est dans le fait lui-même : `niveau: 'OBSERVED'`. Un pilote humain qui
voudra juger un manifeste devra le lire — le produit ne le fera pas à sa place,
et ne prétendra pas l'avoir fait.

**Une baisse du nombre de diagnostics n'est pas un progrès.** Passer de 12 à 3
peut être une correction, ou la suppression de la moitié de l'architecture. La
lecture publie la suite des comptes et s'interdit tout verbe de progression ; un
test vérifie l'absence de ces mots.

**`D7` est désormais soldée pour cinq surfaces sur six** — il ne reste que les
surfaces de lecture, qui relèvent de `NO_FACT` par contrat. Le décompte exact des
politiques par surface sera publié au CP12.
