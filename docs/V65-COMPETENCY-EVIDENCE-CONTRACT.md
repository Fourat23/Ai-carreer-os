# V65 — Contrat Compétence / Preuve / Historique

> **GELÉ AU CP1, avant toute ligne de moteur.** Les règles ci-dessous sont
> écrites avant la mesure AFTER et ne seront pas assouplies après coup, y
> compris si elles sont défavorables au verdict (brief §13).

Contexte mesuré : `docs/audits/V65-CP0-AUDIT.md`.

---

## 1. Ce qu'une preuve N'EST PAS

Une **Evidence** n'est jamais créée par :

- une visite, un scroll, un `GET`, un rendu, un montage ou un démontage ;
- l'ouverture d'une journée ;
- un `START` de session ;
- un `COMPLETE` de session **lorsque la tâche exige une validation** ;
- la simple présence d'une compétence dans le curriculum.

> **Couverture curriculum ≠ tentative ≠ preuve ≠ compétence.**
> Ces quatre notions sont distinctes et le resteront.

## 2. Types de source

Dérivés du **produit réel**, pas inventés. Chaque type existe déjà :

| `sourceType` | Origine réelle | Validateur existant réutilisé |
|---|---|---|
| `exercise` | `/lab/[id]`, `runExercise` | `attempt.allPassed` |
| `assessment` | `/diagnostics`, `data/assessments/` | `gradeAssessment` → `passedOverall` |
| `mission` | `/missions/[id]` | `computeMissionStatus() === 'done'` |
| `capstone` | `data/capstones/` | statut de capstone existant |
| `submission` | session V64, réponse ouverte | aucun — jamais auto-validée |
| `declared` | `DayEvidence` (dépôt, note, capture…) | aucun — déclaration de l'apprenant |
| `review` | `/revisions` | compréhension déclarée |

**Aucun type n'a été ajouté sans qu'une source réelle le produise.**

## 3. Preuve QUALIFIANTE — la règle centrale

Une preuve est **qualifiante** si et seulement si elle porte une validation
`status === 'passed'` **produite par un validateur déterministe du produit** :

| `sourceType` | Qualifiante ? | Seuil — **réutilisé, non réinventé** |
|---|---|---|
| `exercise` | oui si `allPassed` | tous les tests du laboratoire passent |
| `assessment` | oui si `passedOverall` | `passThreshold` de la fixture, défaut **0,7** (existant) |
| `mission` | oui si statut `done` | règle de livrables existante |
| `capstone` | oui si statut `done` | règle de capstone existante |
| `submission` | **non** | une réponse ouverte n'est pas notée par le produit |
| `declared` | **non** | l'apprenant déclare, le produit ne certifie pas |
| `review` | **non** | une révision atteste d'un réentraînement, pas d'une démonstration |

**Le seuil 0,7 n'est pas choisi par V65** : c'est `DEFAULT_PASS_THRESHOLD` de
`lib/assessment.mjs`, déjà en vigueur et déjà testé. Aucun « ≥ 80 % » arbitraire
n'est introduit.

Une preuve non qualifiante **existe, est conservée, est affichée** — elle ne
suffit simplement pas à déclarer une démonstration.

## 4. Machine à états de compétence

Quatre états. Vocabulaire FR aligné sur l'existant.

| État | Libellé FR | Règle — **exhaustive** |
|---|---|---|
| `unassessed` | Non évaluée | 0 preuve qualifiante **et** 0 preuve non qualifiante |
| `practiced` | Pratiquée | ≥ 1 preuve **non** qualifiante, 0 qualifiante |
| `demonstrated` | Démontrée | ≥ 1 preuve **qualifiante** |
| `reinforced` | Consolidée | ≥ 2 preuves qualifiantes, **`sourceId` distincts** **et** **dates UTC distinctes** |

### Ce qui change, explicitement

| Situation | Avant V65 | Après V65 |
|---|---|---|
| 3 journées terminées, 0 preuve | `practiced` | **`unassessed`** |
| 1 journée commencée, 0 preuve | `discovered` | **`unassessed`** |
| 1 note libre saisie à la main | `demonstrated` | **`practiced`** |
| 1 exercice réussi (tests verts) | `demonstrated` | `demonstrated` |
| 2 exercices réussis, même jour | `demonstrated` | `demonstrated` *(pas consolidée)* |
| 2 exercices réussis, jours différents | `demonstrated` | **`reinforced`** |

**Terminer une journée ne fait plus progresser aucune compétence.** C'est une
régression apparente des chiffres, et c'est le but : la couverture n'est pas une
démonstration.

### La règle de consolidation, et pourquoi elle est sévère

`reinforced` exige **deux sources distinctes ET deux dates distinctes**.

Réussir deux exercices différents le même après-midi ne consolide pas : c'est une
séance, pas un réancrage. Exiger un écart de date rend la consolidation
dépendante du temps, ce qui est la seule chose que la mémoire respecte.

Cette règle est délibérément conservatrice. **Sous-déclarer une maîtrise est un
défaut moins grave que la sur-déclarer** — et c'est la seule direction honnête
quand le produit s'adresse à une personne qui prépare un métier.

## 5. `needsReview` — un drapeau, jamais un niveau

`needsReview` est **orthogonal** à l'état. Une compétence `demonstrated` peut
être à revoir ; une compétence `unassessed` ne l'est jamais.

Il est vrai si **au moins une** de ces conditions tient :

1. une révision est **due** aujourd'hui sur une journée portant cette compétence
   (`getDueReviews`, moteur SM-2 existant) ;
2. la **dernière** validation de cette compétence a échoué (`status === 'failed'`) ;
3. une journée portant cette compétence est marquée `comprehension === 'review'`.

Aucune de ces conditions n'est inventée : les trois existent déjà dans le modèle.

## 6. Le niveau auto-déclaré n'est plus un état

`progress.skills[id]` (0-5) est **conservé sans perte** mais **reclassé** :

- ce n'est **pas** un état de compétence ;
- il **n'entre pas** dans la projection ;
- il est affiché comme ce qu'il est : une **auto-évaluation déclarée** ;
- `recordExerciseSuccess` et `recordMissionCompletion` **cessent d'y écrire** —
  c'était une écriture directe de niveau de compétence, interdite par P2.

## 7. Provenance obligatoire

Toute preuve porte, sans exception :

```
id            identifiant global, déterministe
sourceType    parmi §2
sourceId      identifiant de l'artefact source
competencyIds identifiants de PROGRAMME validés (§8)
createdAt     horodatage SERVEUR
validation    résultat, ou null
provenance    comment cette preuve est née
```

et, **lorsque le fait est réel** :

```
dayId | sessionId | submissionId | assessmentId | attemptNumber | score | artifactRef
```

> **On ne fabrique jamais un `dayId` pour remplir un champ.** Un diagnostic pris
> hors de toute journée a `dayId: null`, et c'est un fait, pas un trou.

## 8. Identifiants de compétence

Une preuve ne peut porter que des **identifiants de programme** (les 20 de
`program.json`). Un identifiant inconnu est **rejeté**, jamais stocké.

Le CP0 a mesuré que **204 exercices sur 376** déclarent des compétences fines
(`javascript`, `arrays`, `conditions`…) sans équivalent de programme, et ne
créditent donc rien. V65 étend `lib/skill-taxonomy.mjs` d'un palier
**fin → programme**.

**`curriculum/` n'est pas touché.** Le mapping est du code, pas du contenu.

## 9. Déduplication

Clé métier unique, valable pour **tous** les producteurs :

```
sourceType + sourceId + competencyId + qualifyingContext
```

Une même réussite rejouée ne crée pas une seconde preuve — quel que soit le
chemin (double clic, retry réseau, replay de commande, `COMPLETE` deux fois,
diagnostic renvoyé, soumission revalidée).

## 10. Une seule source de vérité

```
Evidence[]  ──projection pure──▶  CompetencyState
```

- l'état de compétence **n'est jamais persisté comme vérité mutable** ;
- aucune route UI ne peut écrire un état ;
- une révision ne modifie **jamais** une compétence : elle produit une preuve, la
  projection fait le reste ;
- tout cache est **reconstructible** et jeté sans perte.

### Critère architectural de recette (brief §11)

> Supprimer du disque tous les champs dérivés de compétence, rejouer la
> projection depuis les preuves, et retrouver **exactement** le même état
> learner-facing.

Ce test sera exécuté et publié.

## 11. Historique

Un événement d'historique **atteste d'un fait métier réel**. Sont admis :

`DAY_STARTED` · `SUBMISSION_CREATED` · `EVIDENCE_CREATED` · `DAY_COMPLETED` ·
`ASSESSMENT_COMPLETED` · `DIAGNOSTIC_COMPLETED` · `REVIEW_COMPLETED`

Sont **interdits** : ouverture de page, navigation, scroll, focus, tout
horodatage reconstruit après coup.

L'historique est une **projection** des faits déjà persistés (session,
soumissions, preuves), **pas une seconde base mutable**.

## 12. États vides

Sur une installation neuve :

- **interdit** : « niveau moyen 0 % », « 0 / 5 », « 0 % maîtrisé » ;
- **attendu** : « Aucune preuve enregistrée pour l'instant. »

> **0 compétence évaluée ≠ compétence évaluée à 0.**

Le produit doit pouvoir dire « je ne sais pas ».

## 13. Interdits permanents

Ni XP, ni niveau joueur, ni série, ni classement, ni badge de mérite, ni
confettis, ni « maîtrise 73 % ». Tout chiffre affiché correspond à une grandeur
réelle : un décompte de preuves, d'essais, de sources, une date, un score réel.

---

## 14. Conditions de sortie — gelées

| # | Condition | Seuil | Bloquante |
|---|---|---|:--:|
| 1 | Aucune compétence ne progresse par navigation | 0 | oui |
| 2 | Aucune écriture directe d'un état de compétence | 0 | oui |
| 3 | Toute preuve porte une provenance complète | 100 % | oui |
| 4 | Preuves dédupliquées par clé métier | 0 doublon | oui |
| 5 | Projection reconstructible depuis les seules preuves | égalité stricte | oui |
| 6 | Un identifiant de compétence inconnu est rejeté | 0 accepté | oui |
| 7 | Un diagnostic existe sans `dayId` | oui | oui |
| 8 | `COMPLETE` idempotent | fichier identique | oui |
| 9 | Une révision ne modifie pas une compétence directement | 0 | oui |
| 10 | L'historique ne contient aucun événement de navigation | 0 | oui |
| 11 | Une installation neuve n'affiche aucun « 0 % de maîtrise » | 0 | oui |
| 12 | Chaque état affiché est explicable | 100 % | oui |
| 13 | Aucune seconde source de vérité | 0 | oui |
| 14 | Tous les nouveaux gates testés en négatif | 100 % | oui |
| 15 | Corpus, 365 journées, ordre, `progress.json` | inchangés | oui |
| 16 | 0 débordement, 0 axe critical/serious | 0 / 0 | oui |
| 17 | tsc, build, tests, gates | verts | oui |

## 15. Règle de verdict

- **17/17 et aucune dette P0** → `COMPETENCY_ENGINE_REFERENCE_READY`
- 17/17 avec dette P0 résiduelle → `COMPETENCY_ENGINE_READY`
- conditions bloquantes majoritairement tenues, une ou deux en échec →
  `COMPETENCY_ENGINE_PARTIAL`
- sinon → `COMPETENCY_ENGINE_NOT_READY`

**Le barème ne sera pas modifié après mesure.**
