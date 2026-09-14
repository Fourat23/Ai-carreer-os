# V76 · CP6 — Le symptôme observé rejoint enfin l'aide

> **Le produit savait qu'un test attendait `"C"` et avait reçu `"F"`.
> L'échelle d'aide, elle, ne savait que compter les tentatives.**

---

## 1. Le défaut, et son emplacement exact

Deux choses existaient et ne se parlaient pas :

| ce que le produit savait | ce qu'il en faisait |
|---|---|
| `expected: "C"`, `received: "F"`, nom du test, diff structuré | affiché dans l'onglet « Tests » |
| l'échelle de remédiation de V74 · CP7 | **montée sur le nombre d'échecs** |

La route jetait l'information au moment précis où elle aurait servi :

```ts
testsEchoues: publicResults.filter((t) => !t.passed).map((t) => ({ name: t.name })),
//                                                                ^^^^^^^^^^^^^^
//                        `expected` et `received` restaient sur le quai
```

L'aide pouvait donc dire *« reprends le test « 70 → C (borne) » »* — jamais
*« il attend `C` et reçoit `F` »*.

---

## 2. Ce qui a été ajouté : un `DIAGNOSTIC`, au sens du contrat gelé

`lib/diagnostic.mjs` — module **pur**. Il transforme un `TEST_RESULT` en un
**fait observé**, déductible sans supposer l'intention (contrat §1.8).

| classe | ce qu'elle observe |
|---|---|
| `COMPILATION` | le code n'a pas atteint l'exécution — avec la ligne |
| `ERREUR_LEVEE` | une exception, ou un dépassement de délai |
| `TYPE` | la valeur reçue n'a pas la nature attendue |
| `CARDINALITE` | même type, quantité différente |
| `CAS_ISOLE` | **un seul** cas échoue parmi plusieurs |
| `VALEUR` | écart de valeur, sans motif plus précis |
| `RIEN_NE_PASSE` | aucun test public ne passe |
| **`INDETERMINE`** | **le test ne permet rien d'en déduire** |

Le diagnostic est **calculé sur les seuls résultats publics**. En tirer un d'un
test privé publierait son attendu, et l'anti-fuite prime sur la qualité du
retour.

### Rendu réel, sur le produit en marche

```
• py-debug-grades (python3) → CAS_ISOLE
  Un seul cas échoue sur 4 : « 70 -> C (borne) », qui attend « C » et
  reçoit « F ». Tous les autres passent.
  ↳ Ce cas-là seul diffère des autres. Compare-le à un cas qui passe :
    ce qui les sépare est la piste.

• ds-stack (typescript) → RIEN_NE_PASSE
  Aucun des 2 tests publics ne passe. Le premier attend [1,3] et reçoit [].
  ↳ Aucun cas ne passe : le problème est probablement en amont, dans la
    forme de ce que tu renvoies.
```

---

## 3. L'anomalie n° 5 — quand le module a violé sa propre règle

**La première version nommait le motif `BORNE`** et affirmait :

> *« Un seul cas échoue, et c'est celui de la limite. Relis la comparaison à
> cette valeur précise. »*

Sur `py-debug-grades`, c'était **juste** : le bug *est* un `>` écrit pour `>=`.
La phrase était satisfaisante, presque élégante.

Puis le même module a produit **exactement la même phrase** pour
`react-counter`, où un compteur **démarre à 0 au lieu de 7**. Il n'y a aucune
borne. La piste envoyait l'apprenant relire une comparaison qui n'existe pas.

> **Le module violait la règle pour laquelle il existe.** « Un seul cas échoue »
> est une **observation** vraie ; « c'est une borne » est une **interprétation**
> que rien dans le résultat de test ne soutient — les arguments du cas ne
> quittent même pas le serveur.

La classe s'appelle donc `CAS_ISOLE`, et la piste propose une **démarche**
(*compare-le à un cas qui passe*) au lieu de nommer une cause. **Un test refuse
désormais que la piste contienne les mots « borne », « limite »,
« comparaison » ou « condition ».**

### Et sa seconde moitié : les valeurs qui n'apprennent rien

Toujours sur le produit réel, `web-card` affichait :

> *« Aucun des 4 tests publics ne passe. Le premier attend `null` et reçoit
> `false`. »*

Syntaxiquement vrai, pédagogiquement vide — et **pire, ça a l'air d'un
diagnostic**. Les assertions de DOM (`selector-exists`, `element-count`)
publient des sentinelles, pas des valeurs.

Le prédicat qui les écarte est défini **avant toute branche** de la cascade : la
première correction ne le posait qu'à la fin, et la phrase vide ressortait par
la branche « aucun test ne passe ».

---

## 4. Le repli honnête, qui est le vrai sujet du checkpoint

```js
INDETERMINE  →  exploitable: false
```

Quand le test ne publie ni attendu ni reçu, le produit **le dit** :

> *« « sortie attendue » échoue, mais ce test ne publie ni attendu ni reçu : le
> produit ne peut pas dire ce qui diffère. »*

Et la route ne transmet l'observation à l'échelle d'aide **que si elle est
exploitable** — un symptôme flou ne doit pas devenir un indice ferme.

> **Une piste inventée est pire qu'un silence : l'apprenant la suit.**

---

## 5. Où cela apparaît

Le symptôme est rendu **avant** l'aide, et **visuellement distinct** d'elle :

```
┌ lab-diag ─────────────────────────────────────────┐
│ Un seul cas échoue sur 4 : « 70 -> C (borne) »…   │  ← ce qui EST
│ Ce cas-là seul diffère des autres. Compare-le…    │  ← où regarder
└───────────────────────────────────────────────────┘
┌ lab-remediation ──────────────────────────────────┐
│ échelon 1 — Oublie les autres tests. Fais passer  │  ← quoi FAIRE
│ celui-ci, et seulement celui-ci…                  │
└───────────────────────────────────────────────────┘
```

La variante `lab-diag--flou` marque le cas non exploitable : le refus
d'interpréter **se voit**. Les confondre ferait lire une observation comme une
instruction.

---

## 6. Six mutations, et une qui a survécu

| mutation | résultat |
|---|---|
| le diagnostic est calculé sur **tous** les tests, privés compris | 🔴 |
| un test sans attendu se déclare quand même `exploitable` | 🔴 |
| la piste du cas isolé renomme « la borne » | 🔴 |
| le diagnostic n'est plus publié par la route | 🔴 |
| **la piste de `TYPE` dicte « il faut écrire un `Number()` »** | 🟢 **survécue** |
| la piste dicte « remplace ta condition par… » | 🔴 |

**La cinquième est restée verte au premier passage**, et le motif est
familier : mon test n'examinait que **trois observations échantillonnées**, et
la classe mutée n'était pas dedans. *Un test qui regarde trois cas sur huit
garde trois cas sur huit.*

### Le correctif a failli être le mauvais

Premier durcissement : interdire tout verbe à l'impératif. Il a aussitôt refusé
ma propre piste de compilation — *« Corrige d'abord ce que l'outil signale »* —
qui est une consigne d'**ordre** (traiter la compilation avant le fond) et ne
contient aucune réponse.

Affaiblir cette phrase pour satisfaire le test aurait été le contournement
`G12` : *on teste alors le test, pas le produit*. Le test interdit donc
précisément ce que « donner le correctif » signifie — nommer un opérateur, un
appel de fonction, une valeur, ou un « remplace X par Y ». **Après correction,
6/6 rougissent.**

---

## 7. Vérifications

| | |
|---|---|
| tests CP6 | **17** |
| `npm test` | **1893 / 1893** |
| `tsc` · build · `gates:active` | 0 · OK · **48 portes, 0 violation** |
| mutations vues rouges | **6 / 6** (après correction de la cinquième) |
