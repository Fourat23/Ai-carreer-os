# AI Career OS — V68 / ACADEMIC CURRICULUM HARDENING II

> Prompt du sprint suivant, rédigé par V67. **Ne pas lancer V68 dans la session
> de V67.**

---

## 0. Où en est le produit

V67 a prononcé **`ACADEMIC_QUALITY_CANDIDATE`**. Quatre conditions gelées sur
dix-sept échouent, dont la première.

Lire avant toute chose, dans cet ordre :

| Fichier | Ce qu'on y trouve |
|---|---|
| `docs/V67-FINAL-REPORT.md` | verdict, notation des 15 dimensions, dette déclarée |
| `docs/V67-ACADEMIC-CONTRACT-FROZEN.md` | les 12 principes éditoriaux — **restent gelés** |
| `docs/V67-ACADEMIC-SCORING-FROZEN.md` | les 15 dimensions et les 17 conditions — **restent gelées** |
| `docs/V67-EDITORIAL-ARCHITECTURE.md` | les sept gestes, le contre-modèle, la grammaire |
| `docs/V67-RANDOM-SAMPLE-FROZEN.md` | l'échantillon primaire, désormais **brûlé** (voir §6) |
| `scripts/data/days-lessons-v67.mjs` | rattachements + `REFERENCE_LIBRE` |

---

## 1. Ce qui est gelé et ne se rouvre pas

- Les **12 principes** du contrat éditorial.
- Les **15 dimensions**, leurs ancres, et les **17 conditions** de verdict.
- Le modèle de lecture : 150 mots/min, 20 lignes de code/min.
- L'ordre des 365 journées, les identifiants publics, les routes.
- La règle de rattachement : **une leçon ne se rattache qu'à une journée dont le
  sujet est déjà le sien.**

Un seuil ne se renégocie pas après mesure. Une sonde mal formée se **déclare et
s'écarte**, jamais ne se réajuste — treize l'ont été sur ce projet, dont quatre
pendant V67.

---

## 2. Chantier 1 — finir le stock (condition 1)

**23 leçons de famille C** restent privées de correction, cas professionnel,
transfert et récupération active. Quinze sont sur le parcours, huit sur
l'étagère de référence.

```
breaking-changes-compatibility · browser-dom-rendering · database-migrations
database-transactions-concurrency · frontend-performance · frontend-testing
html-semantic-structure · react-accessibility · react-application-states
react-composition-architecture · refactoring-legacy-code · sql-performance-indexing
technical-debt · technical-documentation · web-forms-validation
css-flexbox · css-fundamentals · css-grid · responsive-design
nextjs-foundations · nextjs-rendering · nextjs-server-client-components
nextjs-data-production
```

**Traiter par exposition décroissante**, pas par ordre alphabétique. V67 a fait
l'erreur inverse et le dit dans sa section L.

Chaque correction doit nommer **une erreur probable réelle** et dire **pourquoi
elle séduit**. Une correction qui se contente de donner la réponse ne compte pas
— et le test négatif 2 de V67 montre que la grammaire structurelle ne le verra
pas : c'est la lecture qui décide.

---

## 3. Chantier 2 — D12, le jargon (condition 7)

**C'est la dimension qui n'a pas bougé en V67 : 3/5, inchangée.**

Densité médiane de **8 termes marqués** par fenêtre de trois lignes, jusqu'à 12,
contre un seuil d'alerte à 5.

Méthode qui a marché une fois, à généraliser : dans `rag-fundamentals`, la ligne
qui empilait BM25, FTS5, hybrid search, RRF et reranker a été **dépliée** — RRF y
gagne le problème concret qu'il résout (deux échelles de score incomparables) et
sa mécanique en une phrase. Aucun terme retiré ; tous expliqués.

Les leçons à traiter en premier, mesurées : `rag-fundamentals` (12),
`react-accessibility` (12), `resilience-patterns` (12), `sql-foundations` (12),
`ai-evaluation` (11), `ai-security` (11), `data-structures-intro` (11),
`database-transactions-concurrency` (11), `javascript-basics` (11),
`llm-fundamentals` (11).

`npm run` → `node scripts/v67-glossaire.mjs` donne le classement complet.

---

## 4. Chantier 3 — décider du sort des 25 leçons hors parcours

Elles sont déclarées dans `REFERENCE_LIBRE`, donc assumées et non plus
accidentelles. Mais la compétence `cloud` n'a **toujours aucune journée sur 365**,
et Kubernetes, les fournisseurs cloud, l'IaC, Next.js et CSS ne sont enseignés
nulle part dans le parcours.

**C'est une décision sur le programme, pas une correction technique.** Trois
options, à trancher explicitement :

1. Ajouter des journées — modifie les 365, ce que V67 s'est interdit.
2. Assumer définitivement l'étagère de référence et le dire à l'apprenant dans le
   produit, pas seulement dans un fichier de données.
3. Remplacer des journées existantes — le plus risqué, et à ne faire que sur
   preuve qu'une journée existante n'apporte rien.

**Ne pas trancher silencieusement.** Si l'option 1 est retenue, elle sort du
périmètre « hardening » et mérite son propre sprint.

---

## 5. Chantier 4 — ce que la validation navigateur doit devenir

V67 a trouvé au navigateur, en 40 vérifications, un défaut que dix checkpoints de
lecture avaient manqué : les 52 revues ne liaient aucune leçon.

**Faire la validation navigateur AU CP3, pas au CP13.** Et l'étendre :
- les 25 leçons hors parcours sont-elles réellement atteignables depuis
  `/lessons` ? (V67 l'affirme sans l'avoir vérifié en navigateur) ;
- un apprenant peut-il, depuis une revue, atteindre puis revenir ? ;
- que voit-il quand il arrive sur une leçon de l'étagère de référence — sait-il
  qu'elle est hors parcours ?

---

## 6. L'échantillon — attention, celui de V67 est brûlé

`docs/V67-RANDOM-SAMPLE-FROZEN.md` a été **rejoué au CP14** et son contenu
aveugle a été **ouvert**. Les deux échantillons de V67 sont donc connus.

**V68 doit tirer deux échantillons neufs**, avec des seeds publiées dans son CP1,
selon la même méthode : stratification AVANT tirage, `mulberry32`, aucun
`Math.random`. Réutiliser ceux de V67 ne mesurerait plus rien.

Conserver la comparaison avec les scores V67 par dimension — c'est la seule
continuité qui compte.

---

## 7. Ce que V68 NE doit PAS faire

- Rouvrir les 12 principes ou les 17 conditions.
- Réajuster une sonde après avoir vu son résultat.
- Allonger une leçon pour atteindre un seuil de mots.
- Générer des leçons de structure identique en série.
- Modifier `data/progress.json` (hash publié dans le rapport final ; pré/post).
- Réordonner les 365 journées sans décision explicite au titre du §4.
- Créer le Retention Engine II, l'IDE, ou refondre l'interface.
- Prononcer `ACADEMIC_QUALITY_READY` sans que **les dix-sept** conditions passent.

---

## 8. Verdicts autorisés pour V68

`ACADEMIC_QUALITY_NOT_READY` · `ACADEMIC_QUALITY_CANDIDATE` ·
`ACADEMIC_QUALITY_READY`

Le verdict d'entrée est `CANDIDATE`. **Régresser est possible** : si les mesures
de V68 montrent que V67 a surestimé quelque chose, le dire et redescendre.

---

## 9. Autonomie

Exécuter CP0 → CP15 sans demander de confirmation entre les checkpoints.
S'arrêter uniquement si : une décision détruirait ou réordonnerait le curriculum ;
une donnée métier est indéterminable ; une opération destructive irréversible est
nécessaire ; deux exigences gelées se contredisent réellement.

Une difficulté technique n'est pas une raison d'interrompre.

En fin de session : terminer le checkpoint en cours, valider, commiter, pousser,
et écrire `docs/V68-RESUME.md` (HEAD, branche, CP terminé, CP suivant,
changements, tests, anomalies, commandes de reprise, fichiers à lire, décisions
gelées, dette restante).

**Ne pas lancer V69.**
