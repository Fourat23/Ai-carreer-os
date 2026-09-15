# V77 — RAPPORT FINAL

**PRACTICE COVERAGE & EVIDENCE UNIFICATION**
CP0 → CP15 · branche `claude/ai-career-os-saas-phfg49`

---

## 1. La question posée, et la réponse

> **Lorsque l'apprenant FAIT quelque chose d'important dans AI Career OS, est-ce
> que le système sait observer ce travail proprement, quelle que soit la surface
> où il se produit ?**

**Oui pour neuf surfaces sur treize, non pour quatre — et les quatre sont
déclarées, pas oubliées.** Le détail est le sujet de ce rapport.

## 2. Les deux verdicts

### 2.1 Axe ingénierie — `PRACTICE_OBSERVABILITY_UNIFIED`

Chaque surface de pratique porte une **politique explicite**, écrite dans une
carte exécutable (`lib/practice-model.mjs`) et non dans un document :

```
FACT_REQUIRED  9   dont 4 alimentent la compétence, 5 ne l'alimentent pas
NO_FACT        4   dont 2 écrivent un USAGE, 2 n'écrivent rien
surfaces de lecture 21  → NO_FACT par contrat
```

Le vocabulaire des preuves est **unifié et vérifiable** : 192 combinaisons
énumérées, **0 incohérence**, **12 qualifiantes**. Les gardes tiennent :
**36 mutations jouées, 36 vues échouer, 0 survivante**, et la porte `v77:check`
(146 vérifications) est jugée par un **juge externe**.

### 2.2 Axe pédagogique — `HUMAN_PRACTICE_EFFICACY_STILL_NOT_MEASURED`

**Inchangé depuis V76, et c'est correct.** V77 n'a observé aucun humain. Il a
rendu l'observation honnête ; il n'a rien appris sur l'apprentissage.

Ce verdict ne bougera pas avant V78, et aucun checkpoint de V77 n'avait le droit
de le faire bouger.

## 3. Ce que V77 a réellement changé

| avant | après | mesuré où |
|---|---|---|
| une mission validée d'un clic écrivait `passed` et créditait une compétence | `manual` · `DECLARED` · ne crédite plus — **17 compétences passent de `demonstrated` à `practiced`** | CP5 |
| un capstone corrigé par le serveur était archivé `self` | `capstone-grade` · `VALIDATED` · `simulation: true` | CP6 |
| 5 échecs de diagnostic → **1** trace, et c'était la **première** | 5 échecs → **5 faits** | CP4 |
| 6 surfaces calculaient sans rien garder | 5 écrivent un fait, `pipelines` écrit un usage | CP3, CP7 |
| `isQualifying` ignorait le niveau de preuve | exige `VALIDATED` — **18 combinaisons cessent de qualifier** | CP9 |
| les 4 faits nouveaux n'étaient lus par personne | lisibles dans `/history`, travail et usage **comptés séparément** | CP11 |
| 4 faits ne survivaient pas à leur propre sauvegarde | **quatrième liste blanche** trouvée et corrigée | CP3 |

## 4. Les six découvertes qui ne figuraient pas dans le brief

**1. La phrase de départ du brief était fausse dans les deux sens (CP0).** Il
annonçait « 11 surfaces, 2 écrivent un fait ». Le disque en porte **36**, dont
**12** où l'on agit vraiment ; et `assessments`/`capstones` écrivaient déjà une
preuve depuis V65. Recopier la phrase aurait fait combler des trous inexistants
pendant que les vrais restaient ouverts.

**2. Une QUATRIÈME liste blanche (CP3).** Le défaut `P7` de V75 avait coûté deux
fois pour trois listes ; la quatrième vivait dans `lib/backup.mjs`, invisible
depuis le store. Mesuré : `recallAttempts 1 → 0`, `hintViews 1 → 0`,
`usageEvents 1 → 0`. **Les quatre faits introduits depuis V66 ne survivaient pas
à leur propre sauvegarde.** L'énumération des faits vit désormais à **un seul
endroit**.

**3. L'affirmation la plus forte du produit n'était gardée par aucun test
(CP5).** En retirant `passed` des missions, **une seule assertion a rougi** dans
2 047 tests — la forme de `emptyFlat`. Aucun test ne tenait *« une mission
terminée démontre une compétence »*.

**4. Une contradiction que la dette ne disait pas (CP6).** Les 13 capstones
étaient archivés `self` (une déclaration) **et** créditaient `demonstrated`.
`isQualifying` ne regardait ni le genre ni le niveau : deux phrases opposées sur
le même objet, cohabitant sans que rien ne rougisse.

**5. Le « 14 » du CP0 ne voulait pas dire ce qu'on croyait (CP10).** Remesuré :
**42** paires structurelles, **14** qui chevauchent une compétence, **0** double
comptage effectif. Le 14 désignait un chevauchement **structurel**, pas un double
crédit — les deux se ressemblaient tant qu'une preuve de mission qualifiait.

**6. Deux de mes propres tests ne testaient rien (CP14).** Sur 36 mutations, deux
ont survécu au premier passage. `M01` : un test qui bouclait sur
`CHAMPS_INTERDITS` pour construire ses assertions — vider la liste le rendait
vert avec **zéro assertion**. `M10` : un test qui vérifiait un ordre de texte
qu'une condition glissée à l'intérieur laisse intact.

## 5. Les décisions difficiles, et pourquoi

### 5.1 Le terminal n'a pas gagné de `TerminalAttempt`

Il exécute vraiment. Mais ses trois tâches ne portent **aucun critère de réussite
pédagogique** et leurs arguments sont des énumérations fermées :

> Un apprenant qui choisit `-la` parmi trois options valides n'a rien démontré.

`USAGE_ONLY` : la chose a eu lieu, jamais qu'elle a réussi.

### 5.2 `pipelines` a été renversé par rapport au brief

Le brief demandait de ne pas jeter son verdict objectif. Le CP1 l'a renversé
après lecture du code : **la route n'accepte aucun pipeline candidat**. Deux
apprenants qui choisissent le même déclencheur obtiennent le même résultat.

> Le statut mesure la fixture, pas la personne.

### 5.3 `0 diagnostic` n'est pas une réussite

Traiter le silence de l'analyseur comme une validation aurait donné quatre
surfaces de plus en `VALIDATED` et un tableau flatteur. L'analyseur signale **ce
qu'il sait reconnaître** ; récompenser son silence, c'est récompenser le vide.

### 5.4 125 → 125, et c'est le résultat

Quatre sources auditées, **zéro** résolution. Le mécanisme de déclaration hors
corpus existe et est livré **vide**. Le blocage est dans la **donnée** — mesuré,
pas supposé. Ce qui a été ajouté est une distinction que personne n'avait
mesurée : **112 ambiguïtés conséquentes** (les candidates couvrent plusieurs
compétences) contre **13 sans conséquence**.

### 5.5 Une décision qui coûte, prise quand même

`isQualifying` exige `VALIDATED` (CP9). Conséquence énumérée **avant** de
regarder si le chiffre était confortable : un apprenant ancien verra des
compétences redescendre de `demonstrated` à `practiced`. Aucune donnée n'est
réécrite — c'est la règle de **lecture** qui s'aligne sur ce que la preuve dit
d'elle-même.

## 6. Ce que V77 N'A PAS fait

- **Aucune migration destructive.** Aucune preuve réécrite, déplacée ou
  supprimée. `evidenceLevel` est recalculé à la lecture.
- **Aucun score.** Ni maîtrise, ni percentile, ni probabilité de mémorisation, ni
  employabilité. Vérifié par la porte et par des tests qui balaient les textes
  **et** les noms de champs.
- **Aucun nouveau moteur.** L'historique reste une projection ; compétence,
  rétention et récupération ignorent les quatre faits nouveaux.
- **Aucune couverture visée pour elle-même.** 4 surfaces sur 13 restent en
  `NO_FACT`, et une chaîne E2E qui n'écrit rien a été constatée telle quelle.
- **`v73:check` n'a pas été inventé.**
- **Le curriculum n'a pas été touché.** Ni les 376 exercices, ni `program.json`,
  ni un Markdown.

## 7. L'état technique

| | |
|---|---|
| `npm test` | **2177 / 2177** |
| `npx tsc --noEmit` | **0 erreur** |
| `npx next build` | **OK** |
| `npm run gates:active` | **50 portes, 0 violation** (49 + `v77:check`) |
| `v74` · `v75` · `v76` · `v77` | ✅ ✅ ✅ ✅ |
| `v76:negative` | **11 règles vues échouer, 0 trou** |
| mutations V77 | **36 / 36 vues, 0 survivante** |
| chaînes E2E | **6 / 6 conformes** |
| `data/progress.json` | **absent** |

**Faits du produit : 9** (5 avant V77, 4 ajoutés).
**Commandes du moteur : 28** (24 avant V77).

## 8. Ce qui reste incertain, et le restera

**On ne sait pas si un artefact est bon.** Missions et surfaces analytiques
plafonnent à `OBSERVED` parce que le produit ne sait pas juger le fond. Un
runbook disant « il n'y a pas de rollback prévu » obtient toujours
`structure ok: true` — c'est ce qu'un validateur de forme fait.

**On ne sait pas distinguer comprendre de mémoriser le corrigé.**

**125 exercices sur 376 n'ont pas de concept.** Ils produisent leur preuve et
leur tentative, mais n'alimentent pas la rétention au grain du concept. À savoir
**avant** de lire une courbe de rétention.

**Le zéro double comptage dépend d'une décision, pas d'une structure.** Les 42
paires existent toujours ; c'est la règle de qualification qui les rend
inoffensives. Un test dit exactement ce qui rouvrirait le défaut.

**36 mensonges vus sont 36 mensonges auxquels j'ai pensé.** Une mutation qu'on
n'écrit pas ne survit pas : elle n'existe pas, et son absence n'est pas une
preuve d'absence de trou.

## 9. Deux réserves qu'un protocole humain doit énoncer

Mesurées au CP12, **non corrigées**, et délibérément :

1. **« Réinitialiser ma progression » n'efface pas tout.** L'instantané de
   secours contient encore tout, et les journaux de laboratoire — **qui
   contiennent le code de l'apprenant** — sont intacts. C'est la décision de
   V76 · CP10 : un `RESET` ne doit pas effacer l'histoire d'un échec.
2. **L'export ne contient pas le code.** Un participant qui exporte « toutes ses
   données » n'emporte pas ses journaux de laboratoire.

Changer ces comportements à la veille d'un pilote casserait une garantie
pédagogique pour en servir une autre, sans mesure. **C'est une décision de
protocole, pas d'ingénierie.**

## 10. Trois questions pour la suite

**1. Faut-il trancher les 112 ambiguïtés conséquentes avant le pilote ?**
Le mécanisme les attend (`data/exercise-declarations.json`, une ligne et sa
source). Ce n'est pas un travail d'ingénierie, et le présenter comme tel est la
façon la plus efficace de ne jamais le faire. Sans elles, les courbes de
rétention du pilote porteront sur un tiers de corpus en moins.

**2. Un niveau `OBSERVED` doit-il rester invisible dans les moteurs, ou mériter
une lecture propre ?** Aujourd'hui `OBSERVED` et `DECLARED` ne comptent pour
rien — un choix sévère et assumé. Cinq surfaces écrivent pourtant un travail
réel qui n'atteint jamais une compétence. Est-ce la bonne asymétrie, ou faut-il
un troisième état de compétence entre `practiced` et `demonstrated` ? **V77 n'a
pas tranché, et n'aurait pas dû.**

**3. Que faut-il regarder pendant V78 ?** `V78-PILOT-READINESS.md` dit ce qui est
observable ; il ne dit pas ce qu'il faut observer. Un protocole qui collecterait
tout ne mesurerait rien.

## 11. La phrase qu'il ne faudra pas écrire

> « Le système mesure l'apprentissage. »

Il ne le mesure pas. Il observe des **faits** — tentatives, soumissions,
artefacts, usages — avec leur moyen de constat et leur niveau de preuve. Ce que
ces faits disent de l'apprentissage est exactement la question que V78 doit poser
à des humains, et qu'aucun checkpoint de V77 n'avait le droit de pré-répondre.
