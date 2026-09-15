# V77 · CP9 — LA MATRICE, ET LA DÉCISION QU'ELLE FORCE

> Une règle qu'on ne peut lire qu'en recoupant trois fichiers n'est pas une
> règle : c'est une coutume.

---

## 1. Ce qui était éparpillé

Le CP5 a posé un plafond par **SOURCE**, le CP6 un plafond par **MOYEN**. Chacun
avec sa justification, chacun testé — et **aucun endroit où lire la règle
complète**. C'est exactement la situation qui produit les incohérences que V77
passe son temps à retirer : deux phrases vraies séparément, dont la combinaison
n'avait jamais été relue.

`lib/evidence-matrix.mjs` énumère les **192 combinaisons**
(`sourceType × kind × status`) et rend, pour chacune, le niveau dérivé et ce
qu'elle qualifie.

```
par niveau : 80 × DECLARED · 100 × OBSERVED · 12 × VALIDATED
incohérences : aucune
```

`simulation` est une **colonne**, pas une dimension : elle ne change aucun
niveau ni aucune qualification — le contrat l'exige (`VALIDATED` et
`simulation: true` tiennent ensemble). L'énumérer comme dimension doublerait la
table pour rien ; l'afficher comme colonne dit qu'elle est présente **et** sans
effet, ce qui est le fait.

## 2. La décision : `isQualifying` regarde enfin le niveau

Le CP6 avait mesuré la contradiction et l'avait laissée ouverte, en le disant :

> `isQualifying` ne regarde ni le genre ni le niveau. Le produit disait
> « déclaration » dans le genre et créditait « démonstration » dans la
> compétence.

Le contrat gelé (CP1 §2) ne laisse pas le choix :

> **Seul `VALIDATED` compte** pour compétence, rétention et récupération.

`isQualifying` exige donc désormais **trois** conditions :

1. le type de source PEUT qualifier (règle V65, inchangée) ;
2. la validation a ABOUTI (`passed`) ;
3. le niveau dérivé vaut `VALIDATED` — **nouveau**.

C'est délibérément sévère, et le contrat dit pourquoi : *sous-déclarer une
maîtrise est moins grave que la sur-déclarer.*

### 2.1 Les 12 combinaisons qui qualifient

```
exercise           + exercise-tests    + passed
exercise           + assessment-grade  + passed
exercise           + capstone-grade    + passed
assessment         + exercise-tests    + passed
assessment         + assessment-grade  + passed
assessment         + capstone-grade    + passed
capstone           + exercise-tests    + passed
capstone           + assessment-grade  + passed
capstone           + capstone-grade    + passed
transfer-challenge + exercise-tests    + passed
transfer-challenge + assessment-grade  + passed
transfer-challenge + capstone-grade    + passed
```

Aucune mission. Aucun `self`. Aucun genre hérité. **Douze sur 192.**

## 3. Ce que la décision coûte, mesuré

**18 combinaisons cessent de qualifier**, et elles sont nommées dans
`docs/v77/cp9-evidence-matrix.json`. Les deux qui existent réellement dans des
données anciennes :

- `mission + mission-deliverables` — toute mission terminée avant le CP5 ;
- `capstone + capstone-review` — tout capstone migré depuis l'avant-V65.

La fixture d'exemple du dépôt ne porte **aucune** preuve (mesuré). J'ai donc
construit le cas qui existe vraiment chez un apprenant ancien, en passant par le
**seul producteur encore actif** de ces deux genres, `migrateLegacyEvidence` :

```
preuves héritées : 4
qualifiantes AVANT : 4  ·  APRÈS : 2

exercise    exercise-tests        VALIDATED   qualifiait → qualifie
mission     mission-deliverables  DECLARED    qualifiait → NE QUALIFIE PLUS
capstone    capstone-review       OBSERVED    qualifiait → NE QUALIFIE PLUS
assessment  assessment-grade      VALIDATED   qualifiait → qualifie
```

**Il faut le dire sans l'adoucir** : un apprenant ancien verra des compétences
redescendre de `demonstrated` à `practiced`. Ce n'est pas une perte de données —
aucune preuve n'est réécrite, déplacée ni supprimée — c'est la **règle de
lecture** qui s'aligne enfin sur ce que la preuve dit d'elle-même.

Pour V78 ce n'est pas un problème : les participants partent d'une progression
vierge. Pour quiconque relirait d'anciennes données, c'est une information
nécessaire, et c'est pourquoi elle est publiée plutôt que tue.

## 4. La tension du CP5, tranchée par la mesure

Le CP5 avait laissé deux phrases coexister :

- le contrat plafonne la mission à `OBSERVED` ;
- la règle du maillon faible, appliquée à ses livrables, donne `DECLARED`.

**La résolution tient dans la nature de `NIVEAU_MAX_PAR_SOURCE` : c'est un
PLAFOND, pas une assignation.** `mission → OBSERVED` dit « pas plus qu'observé » ;
il n'interdit pas d'être en dessous. Les deux phrases ne se contredisaient pas —
elles n'étaient simplement jamais lues ensemble.

Ce qui tranche, c'est la mesure : **42 missions sur 42** portent un livrable de
revue **requis** que l'apprenant signe lui-même. `mission-deliverables` inclut
donc toujours une auto-confirmation, et son plafond par moyen est `DECLARED` —
pas par principe, **parce que le corpus est ainsi**.

Un test re-mesure les 42 et rougit si une mission sans revue requise apparaît :
le plafond deviendrait alors trop sévère, et il faudrait le rouvrir plutôt que le
subir.

## 5. Les trois moteurs disent la même chose

Le brief demande une colonne `qualifiesFor{Competency, Retention, Recovery}`.
Elle existe — et les trois valeurs sont **toujours identiques**.

Ce n'est pas une paresse : le contrat les traite ensemble, et inventer trois
règles là où il en pose une serait ajouter de la doctrine, pas de la précision.
Une propriété de la matrice vérifie qu'elles ne divergent jamais : **si un jour
elles divergent, ce sera une décision écrite**, et ce test rougira d'abord.

## 6. Les propriétés, vérifiées sur la table entière

192 lignes ne se relisent pas à l'œil. On énonce donc les propriétés et on les
vérifie **partout** — la différence entre « on a regardé » et « on a vérifié » :

| # | propriété |
|---|---|
| `P1` | rien ne qualifie sans `VALIDATED` |
| `P2` | rien ne qualifie sans `passed` |
| `P3` | une auto-déclaration ne dépasse jamais `DECLARED` |
| `P4` | un type non qualifiant ne qualifie jamais, quoi qu'il porte |
| `P5` | les trois moteurs ne divergent pas |

Et une propriété de plus, qui garde la matrice honnête : **`isQualifying` et la
matrice disent la même chose sur les 192 lignes.** Une matrice qui décrirait une
règle que le produit n'applique pas serait exactement le défaut que V77 retire.

## 7. Ce que ce checkpoint N'A PAS fait

- **Aucune migration.** Rien n'est réécrit sur le disque ; `evidenceLevel` reste
  recalculé à la lecture.
- **Aucune règle inventée par moteur.** Trois colonnes, une règle, et c'est dit.
- **Aucun seuil modifié après coup.** Les 18 combinaisons perdues ont été
  énumérées **avant** de regarder si le chiffre était confortable.
- **`capstone-review` n'a toujours pas été remonté** (décision du CP6) — et
  descend désormais aussi côté qualification, ce qui est cohérent : une
  correction jamais rejouée ne démontre pas.

## 8. Vérifications

| vérification | résultat |
|---|---|
| `tests/v77-evidence-matrix.test.mjs` | **13 / 13** |
| `npm test` | **2130 / 2130** |
| `npx tsc --noEmit` | **0 erreur** |
| `npx next build` | **OK** |
| `npm run gates:active` | **49 portes, 0 violation** |
| `bash scripts/v76-negative.sh` | **11 règles vues échouer, 0 trou** |
| matrice | **192 lignes, 0 incohérence, 12 combinaisons qualifiantes** |
| impact mesuré | 18 combinaisons perdues · 4 preuves héritées → 2 qualifiantes |

## 9. Six tests amendés, et pourquoi ce n'est pas un affaiblissement

Six assertions des CP5 et CP6 pinçaient les valeurs d'alors : `OBSERVED` pour une
mission, `isQualifying === true` pour un capstone `self`. Elles ont rougi parce
que **la règle a changé, délibérément**, pas parce qu'un comportement s'est
dégradé.

Chacune a été amendée en conservant son intention et en écrivant la raison. Un
cas méritait plus qu'une valeur remplacée : le test du CP5 qui mesurait
`demonstrated → practiced` reconstruisait l'« avant » en passant par
`makeEvidence` — or ce comportement est devenu **inatteignable** avec le code
actuel. Il reconstruit désormais explicitement une preuve dont le moyen atteint
`VALIDATED`, plutôt que de prétendre que le produit le produit encore.

La mesure publiée au CP5 reste vraie de la bascule qu'elle décrivait ; elle ne se
rejoue simplement plus telle quelle, et le test le dit.
