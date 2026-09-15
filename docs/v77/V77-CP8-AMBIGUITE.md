# V77 · CP8 — LES 125 EXERCICES AMBIGUS : 125 → 125

> **Et c'est le résultat, pas un échec.** `125 → 0 n'est pas un objectif` ; la
> précision prime sur la couverture, et résoudre par heuristique arbitraire
> figure nommément dans la liste des interdits.

---

## 1. Ce qu'on savait, et ce qui manquait

Le CP0 avait mesuré la cause **unique** des 125 : `R5 · N leçons candidates,
aucune règle ne tranche`. Et la raison de fond :

> un fichier d'exercice ne contient **ni `conceptIds` ni `lessonRefs`**.

Le rattachement est entièrement dérivé du calendrier. Quand une journée enseigne
plusieurs leçons, rien ne tranche — **et c'est correct de ne pas trancher**.

Il manquait deux choses : un **endroit** où un auteur puisse trancher sans
modifier le corpus gelé, et une **mesure** de ce que les sources disponibles
permettent réellement.

## 2. Le mécanisme : déclarer hors du corpus gelé

`data/exercise-declarations.json` — un fichier annexe, versionné, qu'aucun
générateur ne touche. Ni un fichier d'exercice, ni `program.json`, ni un Markdown
de curriculum : modifier l'un de ces trois serait une modification du curriculum,
que le brief interdit.

La règle **R1b** l'utilise, et elle est nommée à part plutôt que fondue dans R1 :
savoir qu'un rattachement vient d'un fichier annexe **change ce qu'on peut en
dire**. Elle vient **après** R1 — une déclaration déjà présente dans le corpus
fait foi, et un fichier annexe ne doit pas pouvoir la contredire en silence.

### 2.1 La garde qui compte

**Une déclaration sans source est REFUSÉE** — pas corrigée, pas ignorée en
silence. Le vocabulaire des sources est fermé à trois valeurs
(`auteur-du-curriculum`, `cite-dans-la-lecon`,
`declare-ailleurs-dans-le-corpus`), parce qu'une source libre permettrait
d'écrire « évident » et de refermer le débat.

Sans cette garde, le fichier deviendrait l'endroit où écrire ce qu'on aimerait
croire. C'est la raison d'être du CP8, et le test qui la garde est le plus
important du checkpoint.

## 3. L'audit des sources — rendement mesuré, y compris nul

Quatre pistes, évaluées sur les 125, publiées même quand elles ne donnent rien.
Un rendement nul **mesuré** vaut mieux qu'une piste jamais essayée : c'est ce qui
permet d'affirmer que le blocage est dans la **donnée**, pas dans l'effort.

| source | touche | **tranche** |
|---|---|---|
| `S1` · l'identifiant de l'exercice est cité dans le texte d'une leçon | 1 | **0** |
| `S2` · l'exercice est lié depuis le Markdown d'une journée (`/lab/<id>`) | 0 | **0** |
| `S3` · le titre de l'exercice est exactement celui d'une leçon | 0 | **0** |
| `S4` · déclaration explicite hors corpus | 0 | **0** |

`S1` touche un exercice — `cloud-spof-detect`, cité par **deux** leçons
(`distributed-systems-failures` et `system-design-scaling`). Il ne tranche donc
rien : deux citations ne désignent pas une leçon.

`S2` donne zéro parce que les Markdown de journée ne lient pas les exercices :
le lien journée → exercice vit dans `data/day-exercises.json`, séparément. Il n'y
a **aucune proximité éditoriale** à exploiter.

**Conclusion mesurée : aucune source disponible ne tranche un seul des 125.** Le
fichier de déclaration est donc livré **vide**, et c'est la réponse honnête.

## 4. La sous-classification — une distinction qui a des conséquences

Le CP0 disait déjà que la classification honnête est `METADATA_MISSING`. Vrai,
mais peu actionnable. La distinction utile, que personne n'avait mesurée :

> **les leçons candidates portent-elles la MÊME compétence de programme ?**

| sous-classe | n | ce que ça veut dire |
|---|---|---|
| `METADATA_MISSING_CONSEQUENTE` | **112** | les candidates couvrent plusieurs compétences : choisir mal changerait la **compétence créditée** |
| `METADATA_MISSING_SANS_CONSEQUENCE_COMPETENCE` | **13** | toutes les candidates portent la même compétence : l'ambiguïté est réelle au grain du **concept** (rétention), sans effet sur la compétence |

Candidates par exercice : **min 2 · médiane 3 · max 14**.

**Aucun exercice ne change de classe.** Ce n'est pas une résolution déguisée :
c'est une carte de priorité pour un auteur — les 112 d'abord, parce que ce sont
ceux dont l'ambiguïté se propage jusqu'à la compétence.

## 5. BEFORE / AFTER

```
AVANT (V75 · CP4) : AMBIGUOUS 125
APRÈS (CP8)       : AMBIGUOUS 125

UNAMBIGUOUS 140 · MULTI_CONCEPT_BY_DESIGN 67 · RESOLVABLE_FROM_CONTEXT 32
RESOLVED_BY_SKILL 12 · ORPHAN 0

déclarations hors corpus présentes : 0
```

Le détail par exercice est publié dans `docs/v77/cp8-ambiguite.json`.

Un test garde l'invariant qui compte : **si `AMBIGUOUS` baisse un jour sans que
le nombre de déclarations augmente, quelqu'un aura deviné.**

```js
assert.ok(resolus <= m.declarationsPresentes,
  'une résolution sans déclaration est une heuristique');
```

## 6. Ce que ce checkpoint N'A PAS fait

- **Aucune heuristique.** Pas de correspondance de texte, pas de « première
  candidate », pas de plus-proche-voisin sur les compétences fines.
- **Aucune modification du corpus.** Les 376 fichiers d'exercice,
  `data/program.json` et les Markdown de curriculum sont intacts.
- **Aucun exercice reclassé.** La sous-classification est additive et publiée
  à côté ; `AMBIGUOUS` reste `AMBIGUOUS`.
- **Aucun chiffre habillé.** 125 → 125, écrit tel quel dans le titre.

## 7. Vérifications

| vérification | résultat |
|---|---|
| `tests/v77-ambiguite.test.mjs` | **14 / 14** |
| `npm test` | **2117 / 2117** |
| `npx tsc --noEmit` | **0 erreur** |
| `npx next build` | **OK** |
| `npm run gates:active` | **49 portes, 0 violation** |
| audit des sources | 4 pistes, **0 résolution** |
| corpus | **intact** — aucun fichier d'exercice, aucun Markdown, aucun `program.json` modifié |

## 8. Ce qu'il faudrait pour aller plus loin

Une décision d'**auteur**, exercice par exercice, pour les 112 conséquents. Le
mécanisme l'attend : une ligne dans `data/exercise-declarations.json`, avec sa
source. Ce n'est pas un travail d'ingénierie, et le présenter comme tel serait la
façon la plus efficace de ne jamais le faire.

**Pour V78, l'ambiguïté n'est pas bloquante** — elle est *déclarée*. Un exercice
`AMBIGUOUS` produit toujours sa preuve et sa tentative ; ce qu'il ne produit pas,
c'est un rattachement à un concept, donc il n'alimente pas la rétention au grain
du concept. Un pilote doit le savoir avant de lire une courbe de rétention, et
c'est exactement pourquoi ce chiffre est publié plutôt que corrigé.
