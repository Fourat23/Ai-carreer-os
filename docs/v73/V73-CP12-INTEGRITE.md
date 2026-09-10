# V73 — CP12. Intégrité factuelle

**Le résultat le plus solide du sprint : les 376 solutions de référence du corpus ont été
EXÉCUTÉES contre leurs propres tests. 376 / 376 passent, zéro échec.** Jusqu'ici, une porte
vérifiait qu'une solution de référence *existe* ; rien ne vérifiait qu'elle *marche*.

**Le défaut le plus coûteux : un accent grave orphelin faisait perdre 55 minutes de lecture à
douze journées.** Il était dans une sonde de production, pas dans le corpus.

---

## 1. Sept contrôles mécaniques, tous verts

| # | contrôle | résultat |
|---|---|---|
| **R1** | les liens `/doc/lessons/…` des 365 journées pointent vers une leçon existante | **0 lien mort** |
| **R2** | les liens entre leçons pointent vers une leçon existante | **0 lien mort** |
| **R3** | les `practiceRefs` de la carte pointent vers un artefact existant (exercice, playbook, mission, **lab-route**) | **0 référence morte** |
| **R4** | les exercices programmés par `day-exercises.json` existent dans la banque | **0 identifiant mort** |
| **R5** | **clés dupliquées** dans les littéraux d'objet des données de journée | **0** |
| **R6** | `readingMinutes` recompté indépendamment, document par document | **0 écart > 3 min** |
| **R7** | chaque exercice a une solution de référence **et** des tests | **0 manquant** |

Inventaire contrôlé : **128 leçons · 376 exercices · 45 playbooks · 42 missions · 4 labs**.

**Le lab `terminal` n'a pas été « re-corrigé »** : il l'avait été au CP2, et R3 le confirme
vert. Un défaut réparé ne se répare pas deux fois.

---

## 2. R5 — la dette du CP3, enfin outillée

Deux anomalies de ce sprint sont le **même défaut** : une **clé dupliquée dans un littéral
d'objet JavaScript**. La dernière écrase la première, silencieusement, sans le moindre
avertissement — ni du moteur, ni d'un linter, ni d'un test.

- **n° 10 (CP2)** : un test négatif ciblait le jour 51, qui possédait déjà une clé dans
  `LESSONS_V67`. La mutation n'a **eu aucun effet** et le test est passé au vert pour la
  mauvaise raison.
- **n° 14 (CP3)** : **en production, cette fois.** Deux des cinq rattachements cloud — jours
  291 et 326 — n'ont eu aucun effet, pour la même raison. Le CP3 s'était engagé à ce que le
  CP14 ajoute un contrôle. **Il est ici, et il s'exécute à chaque passage.**

### Le contrôle a été testé négativement, pas seulement écrit

Une clé `292` en double a été injectée dans `days-lessons-v67.mjs` :

```
R5  clés dupliquées dans les données de journée    ❌ 1
      days-lessons-v67.mjs : clé 292 déclarée deux fois
```

puis le fichier restauré (`git status` propre) et le contrôle revenu à `✅ 0`. **Un contrôle
qu'on n'a pas vu rougir ne prouve rien** — c'est la leçon des anomalies n° 9 et n° 10.

Le motif d'indentation a par ailleurs été **élargi de deux espaces exactement à une à huit
positions** : les fichiers d'enrichissement n'ont pas tous la même indentation, et un motif
trop étroit aurait rendu le contrôle vert *par construction*, c'est-à-dire exactement inutile.

---

## 3. ANOMALIE DE SONDE n° 24 — et celle-ci était dans le produit

`readingMinutes` est **affiché à l'apprenant** sur chaque journée. Il est calculé par
`minutesDeLecture(journée + leçons liées + correction)`, sur la **concaténation** des documents.

La fonction retirait le code en ligne avec le motif ``/`[^`]*`/g`` — **sans exclure le saut de
ligne**. Deux accents graves séparés par des paragraphes, ou par un document entier,
s'appariaient donc, et tout ce qui se trouvait entre eux disparaissait du comptage.

**Un seul document sur 858 porte un nombre impair d'accents graves hors blocs de code** :
`prompt-engineering.md`, dont la ligne 127 montre une clôture ```` ```json ```` littérale
dans un `<code>`. **Ce contenu est juste.** Mais son accent grave orphelin s'appariait avec le
suivant — situé dans le document d'après — et avalait plusieurs milliers de mots.

| | AVANT | APRÈS |
|---|---|---|
| j197 « Fonctionnement des LLM » | **45 min** | **100 min** |
| j198 → j210 | 44 à 49 min | 99 à 104 min |
| journées corrigées | — | **27** |
| médiane du parcours | 77 | **80** |
| total de l'année | 31 141 | **32 289** min |
| écart max | — | **+55 min** |

**Le correctif est dans la sonde, pas dans le corpus** : le motif est borné à la ligne
(``/`[^`\n]*`/g``). **Le hash du corpus des 128 leçons est inchangé** — la leçon n'a pas été
touchée, parce qu'elle n'avait rien de faux.

> **Ce que cette anomalie apprend, et qui vaut au-delà d'elle** : un caractère orphelin dans
> UN document sur 858 a faussé une valeur affichée sur **douze journées**, parce que la
> fonction opérait sur une concaténation. Une mesure qui joint des documents doit traiter
> chaque document comme un document.

---

## 4. Les affirmations exécutables ont été exécutées

C'est le contrôle que ce checkpoint devait apporter, et il n'existait pas.

| | |
|---|---|
| exercices du corpus | **376** |
| solutions de référence **exécutées** dans le vrai exécuteur de l'application (`runExercise`) | **376** |
| **passent l'intégralité de leurs propres tests** | **376 / 376** |
| échecs | **0** |
| non exécutées | **0** |

**Aucune réimplémentation** : le script appelle `lib/workspace-fs.mjs → runExercise`, celui-là
même qui note les tentatives de l'apprenant. Les six runtimes sont couverts —
`node-js` 233 · `python3` 83 · `python-ds` 18 · `typescript` 16 · `react-tsx` 15 · `web` 11.

**Un détail d'honnêteté qui a failli passer.** Au premier passage, les 18 exercices `python-ds`
ont été comptés « non exécutables ici » : l'environnement Data/ML (`.venv-ds`) n'était pas
provisionné. Le résultat aurait pu être publié comme **358 / 376 avec 18 non concernés** — une
formulation vraie et trompeuse. Le dépôt fournit `scripts/v47-provision-ds-venv.sh` ; il a été
exécuté (numpy 2.4.6, pandas 2.3.3, scikit-learn 1.7.2) et **les 18 ont été réellement
exécutés**. *Un environnement absent n'est pas un exercice qui passe.*

---

## 5. Les sous-déclarations de la carte des leçons, traitées

Le CP10 et le CP11 avaient tous deux buté sur `lessons-map.mjs` et renvoyé ici.

### 5.1 Compétences — quatre ajouts et six retraits, sur une règle déclarée d'avance

> **Règle : `week.skills` nomme ce que la semaine ENSEIGNE.** Une compétence simplement
> *utilisée* par le travail de la semaine appartient aux exercices et au projet, pas au titre
> de la semaine. Si une leçon de la semaine l'enseigne sans la déclarer → **corriger la
> carte**. Si aucune leçon ne l'enseigne → **corriger la semaine**.

**Quatre ajouts à la carte, chacun vérifié en lisant la leçon :**

| leçon | avant | après | ce que la leçon dit |
|---|---|---|---|
| `ai-security` | `secu` | `secu, llm` | « pour un LLM, les INSTRUCTIONS et les DONNÉES sont le même texte » — l'attaque est propre aux LLM |
| `prompt-injection-defense` | `secu` | `secu, llm` | même famille |
| `rag-fundamentals` | `rag` | `rag, llm` | « RETROUVER les extraits pertinents et les DONNER au modèle… sans le ré-entraîner » |
| `agent-workflows-orchestration` | `agents` | `agents, archi` | « paralléliser, borner les budgets, reprendre sur échec » — de l'architecture |

**Six retraits de semaine**, où la compétence est utilisée mais jamais enseignée : s27 `python`
(la semaine enseigne le deep learning, Python en est le véhicule) · s33, s34, s45 `se` ·
s35 `sql` (une semaine *vector DB* n'enseigne pas SQL) · s48 `se` et `evalia`.

| | CP10 (avant) | CP10 (après) | **CP12** |
|---|---|---|---|
| semaines déclarant une compétence qu'aucune leçon ne porte | 22 / 52 | 10 / 52 | **0 / 52** |

**Aucune étiquette de journée de revue n'a bougé** : les six retraits ne touchent jamais le
premier élément de `skills`, dont le générateur tire cette étiquette.

**Effet de bord assumé** : la porte **V49** a rougi — son *ledger* est un artefact DÉRIVÉ de la
carte, et il a dérivé. C'est sa fonction. Il a été régénéré (`npm run v49:ledger`), pas
contourné.

### 5.2 `practiceRefs` — la mesure du CP11 précisée, et corrigée dans son interprétation

Le CP11 enregistrait **P2-CP11-1 : « `lessons-map.mjs` sous-déclare les `practiceRefs` de toute
la moitié IA »**. La mesure complète oblige à reformuler :

| | |
|---|---|
| exercices de la banque | **376** |
| **programmés par au moins une journée** | **376 — la totalité** |
| déclarés par au moins une leçon | **207** |
| déclarés mais jamais programmés | **0** |
| **inatteignables** | **0** |

> **Il n'y a donc pas d'exercice orphelin, et aucune leçon ne pointe vers une pratique que le
> calendrier ne programme pas.** L'énoncé exact est : **169 exercices sur 376 (45 %) ne sont
> atteignables que par le calendrier, jamais depuis la page d'une leçon.**

Ce n'est pas un défaut d'intégrité — c'est un **choix de navigation**, et il est désormais
chiffré. **P2-CP11-1 est reformulé en conséquence** ; aucun `practiceRefs` n'a été ajouté,
parce que rattacher mécaniquement 169 exercices à des leçons serait inventer une intention
pédagogique que personne n'a écrite.

---

## 6. Ce que le CP12 a modifié

| fichier | nature |
|---|---|
| `scripts/generate-curriculum.mjs` | anomalie n° 24 : `minutesDeLecture` bornée à la ligne — **27 journées corrigées** |
| `scripts/data/lessons-map.mjs` | 4 compétences ajoutées, chacune vérifiée en lisant la leçon |
| `scripts/data/program-structure.mjs` | 6 sur-déclarations de semaine retirées |
| `data/v49-ledger.json` | régénéré (artefact dérivé) |
| `scripts/v73/cp12-integrite.mjs` | **nouveau** — les sept contrôles, avec R5 testé négativement |
| `scripts/v73/cp12-executer-references.mjs` | **nouveau** — exécute les 376 solutions de référence |

**Aucune leçon n'a été touchée** — corpus `92d5fae6…` inchangé. **Aucun texte de journée n'a
été réécrit** ; seul le nombre affiché en tête de 27 journées change, et il devient exact.

---

## 7. Ce que le CP12 laisse ouvert

| # | constat | pour |
|---|---|---|
| **P2-CP12-1** | **169 exercices sur 376 ne sont atteignables que depuis le calendrier**, jamais depuis une page de leçon. Choix de navigation, chiffré, non corrigé. | CP15 |
| **remplace P2-CP11-1** | La formulation « la carte sous-déclare la pratique » était trop forte : aucun exercice n'est orphelin et aucune référence n'est morte. | — |

---

## 8. Vérifications

| contrôle | résultat |
|---|---|
| **7 contrôles d'intégrité (R1→R7)** | **0 défaut sur 7** |
| **376 solutions de référence exécutées** | **376 / 376 passent** |
| `npm test` | **1420 / 1420** |
| `npx tsc --noEmit` | **0** |
| `npm run gates:active` | **0 violation** (V49 régénérée) |
| porte V73 du graphe | **verte** |
| **corpus des 128 leçons** | **`92d5fae6…` INCHANGÉ** |
| invariants | 365 journées · 128 leçons · 52 semaines · 12 mois |
| **`data/progress.json`** | **toujours absent** |
| **L1 · L2 · L3** | **0 · 0/52 · 6/365** ✅ |
| semaines déclarant une compétence non portée | **0 / 52** |
