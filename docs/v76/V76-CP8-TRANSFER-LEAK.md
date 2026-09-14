# V76 · CP8 — Les réponses des défis ne quittent plus le serveur

> **25/25 fuyaient. 0/25 fuient. Et les 25 fonctionnent toujours.**

---

## 1. La fuite, telle qu'elle était

`GET /transfer/archi-scale-shift` renvoyait une page de 60 869 octets contenant,
dans sa charge utile RSC :

```
…,"answer":0,"explanation":"La décision dépend de la contrainte de charge…"
…,"answer":[0,1,2],"explanation":"La bonne réponse CHANGE avec la contrainte…"
```

**Un « afficher le code source » donnait les bonnes réponses et leur
justification, avant toute tentative.**

La cause tenait en une ligne :

```tsx
<ChallengeRunner challenge={challenge} skillNames={skillNames} />
//                          ^^^^^^^^^  le défi ENTIER, corrigé compris
```

### Pourquoi V75 ne pouvait pas la voir

Son CP9 avait vérifié **six** choses sur chacun des 25 défis — structure, HTTP
200, réussite avec les bonnes réponses, **échec avec les mauvaises**, preuve
valide, comptage par le moteur. Des vérifications sérieuses, et **aucune sur la
fuite**.

*Un défi qui fonctionne parfaitement peut donner la réponse d'avance.*

---

## 2. Le correctif : la discipline du laboratoire, enfin traversée

Le côté laboratoire filtrait **déjà correctement** depuis V74 : `exerciseMeta()`
n'expose ni la `reference`, ni les `expected`, ni les noms des tests privés, et
`splitAttempt()` n'agrège les tests privés qu'après exécution. La discipline
existait — elle n'avait jamais atteint le chemin transfert.

```js
export function vuePubliqueDuDefi(challenge) { … }   // retire `answer` et `explanation`
```

Et la correction arrive **par la réponse de l'API, après soumission** — qui
portait déjà `expected` et `explanation` par question.

### Le type fait la garde, pas la relecture

```ts
export type QuestionPublique = Omit<AssessmentQuestion, 'answer' | 'explanation'>;
challenge: TransferChallengePublic;   // ← le composant ne PEUT plus recevoir le défi complet
```

Le compilateur refuse désormais de passer le défi entier. Une protection qui
dépend d'une relecture attentive n'est pas une protection.

---

## 3. Ce que le correctif a coûté, et pourquoi c'était juste

**La correction hors ligne a disparu.** Le composant client corrigeait le défi
dans le navigateur quand le serveur ne répondait pas.

> **Ce repli ne pouvait fonctionner que parce que la page recevait les
> réponses.** Autrement dit : *le repli hors ligne ÉTAIT la fuite*, pas
> seulement une conséquence.

Un client capable de se corriger seul est un client qui détient le corrigé. Le
produit dit donc ce qui se passe :

> *Le serveur n'a pas répondu : **la correction n'a pas pu être faite**. Elle est
> calculée côté serveur, et elle seule — ton navigateur ne reçoit pas les bonnes
> réponses, sans quoi elles seraient lisibles avant même que tu répondes.
> Réessaie quand la connexion est revenue ; tes réponses sont conservées.*

C'est une capacité en moins, assumée : **elle n'existait qu'au prix de la
fuite.**

---

## 4. Le résultat d'une tentative est enfin annoncé

Le CP2 avait mesuré **`aria-live = 0`** sur cette page. Un apprenant utilisant un
lecteur d'écran soumettait sa tentative et **n'apprenait rien de ce qui s'était
passé**.

Le bloc de résultat est désormais dans une région `aria-live="polite"` —
`polite` et non `assertive` : le verdict ne doit pas interrompre une lecture en
cours, seulement être lu ensuite. Un test vérifie que la région **entoure le
résultat**, et pas un élément quelconque.

---

## 5. Les 25 défis, dix vérifications chacun

| vérification | résultat |
|---|---|
| la page charge | **25 / 25** |
| l'énoncé est servi | **25 / 25** |
| **aucune fuite dans le HTML** | **25 / 25** |
| **aucune fuite par l'API avant tentative** | **25 / 25** |
| échoue avec de mauvaises réponses | **25 / 25** |
| réussit avec les bonnes | **25 / 25** |
| la correction arrive **après** la tentative | **25 / 25** |
| l'explication arrive **après** la tentative | **25 / 25** |

**Les six vérifications de V75 tiennent toujours**, et quatre s'y ajoutent. Un
défi qui ne fuit pas mais ne fonctionne plus ne serait pas un progrès.

### La contre-épreuve, qui donne sa valeur au tableau

Une sonde qui ne trouve rien peut simplement être aveugle. L'ancien code a donc
été remis en place, le produit reconstruit, et la sonde relancée :

| version | défis qui fuient |
|---|---|
| **avant le CP8** | **25 / 25** |
| après | **0 / 25** |

La sonde discrimine.

---

## 6. Ce qu'est une fuite, précisément

Pas « le mot `answer` apparaît » — il peut venir d'un nom de classe ou d'un
fragment de bundle. La sonde cherche **ce qui permet de répondre sans
chercher** : la valeur sérialisée de `answer`, et les quarante premiers
caractères du texte d'`explanation`.

Et elle vérifie l'inverse dans le même passage : **l'énoncé et les options
doivent être présents**. Une page qui ne fuirait pas parce qu'elle ne sert rien
serait vide, pas sûre.

---

## 7. Sept mutations, vues rouges

| mutation | résultat |
|---|---|
| la vue publique garde `explanation` | 🔴 |
| la vue publique garde `answer` | 🔴 |
| la vue publique retire aussi l'**énoncé** | 🔴 |
| la page repasse le défi complet | 🔴 |
| le client recorrige hors ligne | 🔴 |
| la région vivante disparaît | 🔴 |
| le **type** accepte à nouveau le défi complet | 🔴 |

La troisième garde la moitié qu'on oublie : **ne pas fuir ne suffit pas, il faut
encore servir**.

---

## 8. Vérifications

| | |
|---|---|
| tests CP8 | **8** |
| `npm test` | **1917 / 1917** |
| `tsc` · build · `gates:active` | 0 · OK · **48 portes, 0 violation** |
| mutations vues rouges | **7 / 7** |
| artefact | `docs/v76/cp8-transfer.json` |
