# V74 · CP11 — TRANSFERT ENTRE COMPÉTENCES

> Une notion retenue seulement dans son contexte d'origine n'est pas retenue : elle est
> **reconnue**. La question de rétention n'est pas « sait-il la réciter ? » mais « sait-il
> l'employer ailleurs ? ».

---

## 1. Le résultat en une phrase

**Le moteur de rétention était structurellement incapable d'observer un transfert**, et ce qu'il
appelait « transfert » s'allumait sur **74 % des journées**.

---

## 2. Ce que le moteur appelait « transfert » — et ce que ça valait

Le champ `transfers` de la fiche mémoire comptait les contacts survenus sur une journée dont les
leçons couvrent **au moins deux compétences**.

| | |
|---|---|
| journées satisfaisant ce critère | **269 / 365 (74 %)** |
| distribution du nombre de compétences par journée | 1 → 96 · 2 → 68 · 3 → 110 · 4 → 49 · 5 → 23 · 6 → 16 · 7 → 2 · 8 → 1 |

Deux défauts, et le second est le vrai :

1. **un indicateur qui s'allume trois fois sur quatre ne distingue rien.** C'est structurellement
   la même erreur que l'anomalie n° 2 de ce sprint — « 6 catégories sur 9 sortaient à 313-365
   parce que toutes les journées ont ces sections » ;
2. **surtout, il ne mesure pas le transfert.** *Deux compétences enseignées le même jour ne
   demandent pas de transposer l'une dans l'autre.* C'est une **co-occurrence**, et l'appeler
   transfert était une erreur de nom, pas de seuil. Aucun réglage ne l'aurait corrigée.

---

## 3. Ce que le produit possède réellement — et qui n'était pas branché

Le CP7 a appris à chercher l'existant avant d'écrire. Ici l'existant est considérable :

| | |
|---|---|
| taxonomie de distance de transfert | **T0 → T5** (`lib/transfer-taxonomy.mjs`), classifieur délibérément conservateur |
| défis de transfert | **25**, dont **23 en T5** et 2 en T4 |
| tous marqués `crossDomain` | **oui, 25/25** |
| pont conceptuel explicite exigé en T5 | oui, validé par `validateTransferChallenge` |
| compétences couvertes | **18 / 20** — seules `comm` et `autonomy` n'en ont aucun |
| moteur de notation propre | **aucun** : `gradeTransferChallenge` compose `lib/assessment.mjs` |

Répartition : `archi 7 · se 6 · sql 5 · http 5 · algo 3 · secu 3 · dl 2 · evalia 2 · ds 2 ·
llm 2 · agents 1 · gitlinux 1 · ml 1 · patterns 1 · cloud 1 · rag 1 · jsts 1 · python 1`.

**Le CP11 n'a donc écrit aucune taxonomie, aucun défi, aucun barème.** Comme le CP7 avec
`lib/misconceptions.mjs`, il branche ce qui existait.

---

## 4. Les quatre verrous

| verrou | état avant le CP11 |
|---|---|
| 1. journées du curriculum citant un défi | **0 / 365** |
| 2. défis référencés dans `data/program.json` | **non** |
| 3. page ou route exposant un défi à l'apprenant | **non** — `app/transfer` n'existe pas |
| 4. type de preuve permettant d'enregistrer un défi réussi | **non** — `transfer-challenge` n'était pas dans `EVIDENCE_SOURCE_TYPES` |

Le quatrième est le plus révélateur. **`createEvidence` aurait REFUSÉ une réussite à un défi de
transfert** avec `INVALID_SOURCE_TYPE`. Autrement dit : même si un apprenant avait réussi les
25 défis, rien n'aurait pu être écrit nulle part.

C'est exactement le motif du CP0 — *« le système n'a jamais observé un échec »* — appliqué au
transfert : **le système ne pouvait pas observer un transfert, et son compteur ne pouvait donc
valoir que zéro, quoi que fasse l'apprenant.**

---

## 5. Ce que le CP11 change

### 5.1 Le compteur dit la vérité

`transfers` compte désormais une **preuve validée issue d'un défi de transfert**. Aujourd'hui,
cela vaut **0 pour tout le monde**, et c'est la valeur honnête.

**Un zéro honnête vaut mieux qu'un compteur saturé** : le second laissait croire que le transfert
était mesuré. C'est la même décision qu'au CP2, où `exerciseAttempts: []` devait être une liste
vide plutôt qu'absente, pour que « aucune tentative » et « aucun échec observable » restent
distinguables.

### 5.2 La co-occurrence est conservée, sous son vrai nom

`cooccurrencesCompetences` remplace l'usage abusif. L'information reste réelle — elle change
seulement de nom pour dire ce qu'elle mesure.

### 5.3 Le quatrième verrou est ouvert

`transfer-challenge` rejoint `EVIDENCE_SOURCE_TYPES` **et** `QUALIFYING_SOURCE_TYPES`.

La justification est celle que V65 s'était donnée — *« les seuils sont ceux qui existaient déjà,
V65 n'en invente aucun »* : le seuil de **0,7** et la comparaison à un attendu préexistent dans
`gradeTransferChallenge`, exactement comme `gradeAssessment` pour `assessment`. **Aucun seuil
nouveau n'est introduit.**

**Un test de V65 a rougi, et il avait raison de rougir** : `tests/v65-evidence.test.mjs` gelait
la liste qualifiante à quatre types. Élargir le vocabulaire des preuves est précisément le genre
de changement qui doit être vu. Le gel est mis à jour **avec sa raison écrite**, pas contourné.

### 5.4 Le signal silencieux est nommé

`jamaisTransfere` : **« su, mais jamais hors de son contexte d'origine »**.

Il rejoint les deux signaux silencieux nommés au CP3 (« exposé mais jamais mis à l'épreuve »,
« travaillé mais jamais sans la réponse sous les yeux »). Ces trois-là ont en commun de ne
déclencher **aucune alerte naturelle** : rien n'échoue, donc rien ne se plaint.

Il ne s'allume **que sur une notion déjà réussie au moins une fois**. Le dire d'une notion jamais
réussie confondrait deux manques très différents — et un test garde cette distinction.

---

## 6. Ce que le CP11 ne fait PAS, et pourquoi

- **il n'invente aucun score de transfert.** Le CP0 a déclaré le transfert professionnel
  `UNMEASURABLE`, et rien ici ne le rend mesurable ;
- **il n'ouvre pas les trois premiers verrous.** Lier les 25 défis aux journées touche au
  curriculum ; créer la page relève de l'UI, donc du **CP12**. Les ouvrir à la sauvegarde ici
  aurait mélangé trois natures de changement dans un checkpoint qui en mesurait une ;
- **il ne transforme pas `transfers` en facteur de priorité.** Tant que la valeur est
  structurellement 0, un facteur qui la lit ne pèserait rien — et l'ajouter « pour plus tard »
  produirait exactement le code mort que l'anomalie n° 11 vient de me coûter.

**Dette D10** inscrite : les trois verrous restants, avec leur nature respective (curriculum, UI,
lien de données).

---

## 7. Conséquence pour le CP9

Le candidat **`evidence-aware`** du CP9 s'était révélé **aveugle** : ses chiffres étaient
identiques à Leitner parce que `applications` et `transfers` valaient 0 dans la simulation.

Le CP11 en explique la moitié : `transfers` ne pouvait pas être autre chose que 0. **La
correction rend le candidat évaluable *en principe*, pas encore en fait** — il faudra les trois
verrous restants, plus le paiement de la dette **D4** (les preuves portent `competencyIds`, 20,
jamais `conceptId`, 128). Les deux conditions que le CP9 avait posées pour rouvrir sa décision
sont donc toujours ouvertes, et l'une d'elles a un verrou de moins.

---

## 8. Une sonde de test corrigée

Trois tests échouaient d'abord, et **pour une raison sans rapport avec le transfert** : le
contexte de test passait `dayConcepts` comme objet simple, dont les clés sont des **chaînes**
(« 1 », « 2 »), alors que `dayRef` est un **nombre**. Les contacts de preuve n'étaient rattachés
à aucun concept.

Le module serveur, lui, construit une `Map` à clés numériques — le produit était correct, la
fixture ne l'était pas. Corrigée, avec la raison écrite dans le test : *une fixture qui diverge
de la forme réelle des données fait échouer (ou réussir) pour de mauvaises raisons.*

---

## 9. Les quatre mutations vues rougir

| mutation | tests rouges |
|---|---|
| la co-occurrence est de nouveau appelée « transfert » | **1** |
| `sourceType` n'est plus transmis (le filtre redevient code mort) | **3** |
| le signal silencieux s'allume aussi sur une notion jamais réussie | **1** |
| une preuve non validée compte comme transfert | **1** |

Toutes restaurées : **11 / 11** sur le fichier, **1556 / 1556** sur la suite.

---

## 10. Fichiers

**Créés** : `scripts/v74/cp11-transfert.mjs`, `tests/v74-transfert.test.mjs` (11 tests), ce
document.

**Modifiés** : `lib/learner-memory.mjs` (`transfers` redéfini, `cooccurrencesCompetences` et
`jamaisTransfere` ajoutés, `sourceType` transmis par la collecte), `lib/evidence.mjs`
(`transfer-challenge` ajouté aux deux listes), `tests/v65-evidence.test.mjs` (gel mis à jour avec
sa raison).
