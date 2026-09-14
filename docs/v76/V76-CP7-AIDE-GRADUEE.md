# V76 · CP7 — L'aide consultée devient un fait

> **Le produit ne savait pas qu'il avait aidé.**
>
> Une réussite après trois indices était indiscernable d'une réussite immédiate,
> et l'échelle reproposait la marche que l'apprenant venait de lire.

---

## 1. Le troisième trou de la boucle d'aide

Trois checkpoints, trois manques successifs, et celui-ci était le plus gênant :

| | ce qui manquait | comblé par |
|---|---|---|
| CP0 | l'échelle monte sur le **nombre** d'échecs | *(constat)* |
| CP6 | elle ne connaît pas le **symptôme** | `lib/diagnostic.mjs` |
| **CP7** | **rien n'enregistre qu'une aide a été lue** | `lib/hint-view.mjs` |

Conséquences, toutes présentes dans le produit d'avant :

- une réussite **après la correction complète** était indiscernable d'une
  réussite sans aide — alors que le contrat gelé (§1.12) exige que *« la
  provenance le montre »* ;
- l'échelle **reproposait à l'identique** la marche qui venait d'être lue ;
- monter volontairement jusqu'à la correction ne laissait **aucune trace**.

---

## 2. Le huitième fait du produit

`RECORD_HINT_VIEW` — même contrat que les sept autres (V75 · CP2) : horloge
**serveur**, `provenance` obligatoire, vocabulaire **fermé**, `schemaVersion: 2`,
idempotent par clé métier.

| champ | rôle |
|---|---|
| `exerciseId` · `action` · `niveau` | quelle marche, à quel échelon |
| `declenchee` | `auto` (servie après un échec) · `demandee` (ouverte par l'apprenant) |

**Le doute joue contre le crédit** : une aide dont l'origine est inconnue est
comptée `auto`. Même posture que `correctionSeen` depuis V74 — on ne crédite pas
une démarche qu'on n'a pas observée.

### La persistance, vérifiée là où V75 s'était fait avoir

`hintViews` est ajouté aux **deux** listes blanches du store **dans le même
commit**. Le défaut P7 de V75 avait laissé `curriculumPause` dans une seule des
deux pendant trois checkpoints : la fonctionnalité était écrite, testée, verte —
et **sans effet sur le disque**, parce que les tests appelaient `applyCommand`
sur un objet plat sans jamais passer par `writeActiveTrack`.

Le test du CP7 fait donc l'**aller-retour réel** :

```js
const r = applyCommand(base, cmd(), { now });
const relu = activeTrackProgress(writeActiveTrack(migrateToV7({}, T0), r.progress, T0));
assert.equal(relu.hintViews.length, 1);   // ← ce que le DISQUE garde
```

---

## 3. L'échelle ne piétine plus

`remedier` reçoit `dejaVues` et **écarte** les marches consultées.

```js
const neuves = dispo.filter(Boolean).filter((m) => !vues.has(m.action));
const offre  = neuves.length ? neuves : dispo.filter(Boolean);
```

**Le repli sur la liste complète n'est pas une concession, c'est une
protection.** Si toutes les marches ont été lues et qu'on laissait la liste
vide, `remedier` tomberait dans sa branche de dernier recours — et donnerait la
réponse. L'inverse exact de ce que le contrat exige (§1.10).

---

## 4. La provenance décrit, elle ne punit pas

```js
provenanceDeLaReussite(hintViews, exerciseId)
// → { reussite: true, aidesConsultees: 2, correctionVue: true,
//     lecture: 'Réussi après avoir consulté la correction complète.' }
```

**`reussite` vaut `true` en toutes circonstances.** Le champ n'existe que pour
qu'une lecture rapide ne confonde pas « résolu seul » et « résolu après avoir lu
la correction ».

Le contrat interdit d'en faire une note, et **trois protections l'empêchent** :

1. un test refuse tout vocabulaire de notation (`score`, `pénalité`, `malus`,
   `pourcentage`, `ratio`) dans le module ;
2. un test fige la **forme exacte** de l'objet rendu — y ajouter un `score`
   le fait rougir ;
3. un test refuse que la mention soit rendue comme un **avertissement**
   (`--danger`, `--warn`, rouge).

Elle s'affiche en texte secondaire, sous le résultat, et **seulement s'il y a eu
une aide** :

> *Réussi après 2 aides consultées.*

---

## 5. Sept mutations, et une qui a survécu

| mutation | résultat |
|---|---|
| `hintViews` retiré de la liste blanche d'**écriture** | 🔴 |
| une aide **dévalue** la réussite (`reussite: !correctionVue`) | 🔴 |
| la provenance calcule un **score** (`100 − aides × 20`) | 🔴 |
| l'échelle **repropose** la marche déjà lue | 🔴 |
| **toutes les marches lues → l'échelle se vide** | 🟢 **survécue** |
| la route **n'enregistre plus** l'aide servie | 🔴 |
| le vocabulaire d'action devient **ouvert** | 🔴 |

**La cinquième a survécu pour une raison instructive.** Vider les marches ne
donnait *pas* la correction — ça renvoyait « reprends plus tard ». Mon test
n'interdisait que le saut à la correction, et s'en satisfaisait.

Or *« reprends plus tard »* est **une autre façon de ne plus aider** : l'apprenant
échoue encore, du matériel d'aide existe, et le produit répond qu'il n'a rien.
Le test exige désormais une **marche réelle** tant qu'il en reste, et que
l'échelon ne saute pas. **7/7 après correction.**

---

## 6. Deux tests cassés par le CP7 lui-même — et pourquoi c'était mes tests

Ajouter `provenance` au corps de réponse a fait rougir deux tests des CP6 et
CP7, qui épinglaient la **chaîne exacte** `remediation, diagnostic }`.

**Aucune propriété du produit n'avait bougé** : seul l'ordre des champs avait
changé. Les assertions cherchent désormais la **présence de la clé** dans la
charge utile, pas sa position. Une mutation de contrôle — retirer la clé — les
fait toujours rougir.

---

## 7. Vérifications

| | |
|---|---|
| tests CP7 | **16** |
| `npm test` | **1909 / 1909** |
| `tsc` · build · `gates:active` | 0 · OK · **48 portes, 0 violation** |
| mutations vues rouges | **7 / 7** (après correction de la cinquième) |
