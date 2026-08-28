# V65 · CP0 — Audit forensique Competency / Evidence / History

> **LECTURE SEULE.** Aucun fichier produit modifié avant ce rapport.
> Tout ce qui suit est constaté ou mesuré, jamais déduit de l'intention.

---

## A. Invariants d'entrée

| Objet | Valeur |
|---|---|
| Branche | `claude/ai-career-os-saas-phfg49` |
| HEAD | `75b42c16927a9e9367e8fe8d66d3fb080822aa68` |
| local == origin | **oui** |
| Arbre de travail | propre — 0 fichier |
| Stash | 0 |
| Serveurs résiduels | **4 trouvés (3485-3488), tués par PID** |
| `curriculum/` | `176ecde82cfd156fec0aa146ae0aeae8e75481d3e4e76220f5e8922812b80cec` (951 fichiers) |
| `data/` hors progression | `27c1e532036c4f086cdd917e2d606908c8b1a48ffd55d96c7b18ec2062432968` (546 fichiers) |
| `data/progress.json` | sha256 `73c1ee39…1fc6e7a6` · blob `323604021055588a` · 371 octets |
| Journées | **365**, ordre strict `1..365` vérifié, md5 `20be438d43c38549fb8b1fda8680a1d9` |
| Compétences de programme | **20** : `algo ds jsts python gitlinux http sql se archi patterns ml dl llm rag agents evalia secu cloud comm autonomy` |
| tsc | 0 erreur |
| Tests | **1 330 / 1 330** |
| Gates | 42 gates, 48 lignes vertes |

---

## B. CURRENT WRITE GRAPH

```
                       ┌──────────────────────────────────────────┐
UI (7 composants) ────▶│  POST /api/progress   (commandes V64)    │
                       └───────────────┬──────────────────────────┘
                                       │ applyCommand()
                                       ▼
POST /api/lab/[id]  ──▶ recordExerciseSuccess() ──┐
POST /api/missions/[id] ─▶ recordMissionCompletion()─┤
POST /api/assessments/[id] ─▶ applyCommand(SUBMIT) ─┤
                                                    ▼
                            ┌────────────────────────────────────┐
                            │  progress.days[N].evidence[]       │  ← preuve
                            │  progress.days[N].submissions[]    │
                            │  progress.days[N].session          │
                            │  progress.skills[id] = 0..5        │  ← ✗ 2ᵉ vérité
                            └────────────────────────────────────┘
                                       │ writeProgress()
                                       ▼
                              data/progress.json
```

**Trois producteurs de preuve**, avec **deux clés de déduplication différentes** :

| Producteur | Identifiant | Dédup | Portée |
|---|---|---|---|
| `lab-progress.mjs` | `lab-<exerciseId>` | par **URL** dans une journée | écrit dans **chaque** `dayRef` |
| `mission-state.mjs` | `mission-<id>` | par **URL** dans une journée | écrit dans **chaque** `dayRef` |
| `learning-engine.mjs` | `sub-ev-<stepId>` | par **id** dans une journée | **une seule** journée |

## C. CURRENT READ GRAPH

```
progress.days[*].evidence[]  ─┐
progress.days[*].status      ─┼─▶ skillStats()  ──▶ /skills ──▶ explainSkillState()
program.days[*].skill        ─┘      (dérivé)

progress.skills[id] 0..5     ─────▶ /skills (curseurs d'auto-évaluation)
                                     ↑ jamais réconcilié avec skillStats()

progress.days[*].review      ─────▶ getDueReviews() ──▶ /revisions
progress.days[*].session     ─────▶ sessionView()   ──▶ /day/[id]
```

---

## D. Les trois défauts structurels

### D1 — Une visite, une complétion et une note libre créditent une compétence

Mesuré en exécutant `skillState()` directement :

```
3 journées terminées, 0 preuve  →  practiced
1 journée commencée, 0 preuve   →  discovered
0 journée, 1 preuve quelconque  →  demonstrated
note libre, aucune validation   →  demonstrated  | preuves: 1
```

La dernière ligne est la plus grave. `DayEvidence.tsx` laisse l'apprenant saisir
une preuve de type `note`, titre libre, **sans aucune validation** — et la
compétence bascule immédiatement en **« Démontrée »**.

C'est exactement ce que les principes P1 et P2 de V65 interdisent. Le produit ne
distingue aujourd'hui ni *enseigné*, ni *pratiqué*, ni *démontré* : il compte des
lignes.

### D2 — Deux modèles de compétence concurrents, dont un mutable

| Modèle | Nature | Écrit par |
|---|---|---|
| `progress.skills[id]` : nombre 0-5 | **mutable, persisté** | `recordExerciseSuccess` (plancher 3), `recordMissionCompletion`, `SET_SKILL` depuis l'UI |
| `skillStats()` → `state` | dérivé | personne (calculé) |

Les deux vivent côte à côte sur `/skills` : les curseurs affichent le premier,
les groupes affichent le second. **Ils ne sont jamais réconciliés.** C'est la
seconde source de vérité que le brief interdit, et deux écritures directes de
niveau de compétence contournent toute notion de preuve.

### D3 — 54 % des exercices ne créditent aucune compétence de programme

Le défaut le plus coûteux, et il était invisible jusqu'ici.

Les 376 exercices déclarent leurs compétences dans une taxonomie **fine**
(`javascript`, `arrays`, `conditions`, `linux`, `react`…). Le programme, lui,
définit **20 compétences** (`jsts`, `algo`, `ds`, `gitlinux`…). `skillStats()`
apparie les `evidence.skills` avec `program.skills[].id` **sans traduction**.

`lib/skill-taxonomy.mjs` existe et résout des synonymes — mais **à l'intérieur de
la taxonomie fine** : `canonicalSkill('javascript')` renvoie `'javascript'`, qui
n'est pas un identifiant de programme. Il manque le palier fin → programme.

Mesuré après canonicalisation :

```
exercices créditant ≥1 compétence de programme : 172 / 376
exercices ne créditant AUCUNE compétence       : 204   (54 %)

top orphelins : conditions (74) · functions (57) · arrays (46) ·
                javascript (29) · linux (17) · react (15) ·
                typescript (15) · objects (11) · hashmap (10)
```

**Conséquence :** un apprenant peut réussir 204 exercices sur 376 — tests verts,
preuve créée, écrite sur disque — et voir `/skills` afficher « non abordée ».

C'est aussi la vraie explication de l'incident du CP0 de V64 : mon parcours de
test avait échoué avec l'identifiant `javascript`, et j'avais conclu à une donnée
de test fabriquée. C'était vrai — mais **incomplet** : le produit fait exactement
la même chose pour 204 exercices réels. La sonde avait raison pour une mauvaise
raison, et je n'avais pas creusé.

Nature du défaut : **mapping de données**, pas contenu pédagogique. Il se corrige
dans `lib/skill-taxonomy.mjs`. `curriculum/` reste intact (P5).

---

## E. Statut des six dettes publiées par V64

| # | Dette V64 | Statut | Preuve |
|---|---|---|---|
| 1 | Pas de surface d'historique | **OPEN** | `app/history` inexistant ; aucun modèle d'événement |
| 2 | Rattachement diagnostic approximatif | **OPEN** | `route.ts:59` — `open[open.length-1].day`, la session ouverte la plus avancée |
| 3 | Rangées `0/5` des compétences non abordées | **PARTIAL** | la moyenne affiche « non renseigné » (corrigé V64) ; les curseurs `{val}/5` restent (`SkillsBoard:124`) |
| 4 | `SET_STEP` non exposé | **OPEN** | 0 appel dans `app/**/*.tsx` |
| 5 | `missions` hors de `types.ts::Progress` | **OPEN** | `types.ts` porte `session` et `submissions`, pas `missions` |
| 6 | Reprise via `resolveResume`, pas `openSessions` | **OPEN** | `api/search-index` utilise `resolveResume` ; `openSessions` n'est utilisé que par `api/assessments` |

Aucune n'est CLOSED. Une est PARTIAL. **Cinq sont ouvertes** — et trois d'entre
elles (1, 2, 6) sont dans le périmètre direct de V65.

---

## F. Métriques AVANT

| Métrique | Valeur d'entrée |
|---|--:|
| Modèles de compétence concurrents | **3** |
| Écritures directes d'un niveau de compétence | **3** (lab, mission, `SET_SKILL`) |
| Producteurs de preuve | **3** |
| Clés de déduplication distinctes | **2** |
| Preuves portant une provenance structurée | **0** |
| Preuves ayant une identité hors de leur journée | **0** |
| Types d'événements d'historique | **0** |
| Routes `/history` | **0** |
| Exercices ne créditant aucune compétence | **204 / 376** |
| Compétences pouvant être « Démontrée » sans validation | **20 / 20** |

---

## G. Réponse à la question centrale du CP0

> *« Une preuve possède-t-elle aujourd'hui une identité métier réellement
> exploitable indépendamment de la page qui l'a produite ? »*

**NON.**

Une preuve est aujourd'hui un objet **encapsulé dans une journée**, sans
existence propre :

1. **Pas d'identité globale.** L'id `lab-greeting` est unique *dans une journée*.
   Un exercice lié à trois journées produit **trois objets distincts portant le
   même id**, dans trois seaux différents. Il n'existe aucun moyen de dire
   « cette preuve-là » sans dire d'abord « dans cette journée-là ».
2. **Pas de provenance.** Aucun champ `sourceType` / `sourceId` / `sessionId` /
   `submissionId`. La provenance est **encodée dans une chaîne d'URL**
   (`/lab/<id>`, `/missions/<id>`) et dans un préfixe d'identifiant
   (`lab-`, `mission-`, `sub-ev-`) — deux conventions implicites, jamais validées.
3. **Pas de validation attachée.** Une preuve issue de tests verts et une note
   tapée à la main sont **structurellement identiques**. Rien ne les distingue
   à la lecture, et `skillState()` les compte à l'identique.
4. **Pas de requête possible.** Aucun `getEvidenceBySkill` / `BySession` /
   `Timeline` : chaque consommateur re-balaye `progress.days` et réimplémente son
   propre index (`skillStats` en construit un, `evidenceTimeline` un autre).
5. **Une preuve ne peut pas exister sans journée.** Le diagnostic en est la
   démonstration : il doit emprunter la session ouverte la plus avancée pour
   exister — le rattachement est une commodité de stockage, pas un fait.

C'est précisément ce que V65 doit construire : **une preuve qui est un fait
autonome, daté, tracé et validé**, dont la compétence n'est qu'une projection.

---

## H. Ce que CP1 doit geler

1. **La définition d'une preuve qualifiante** — et le fait qu'une note libre n'en
   est pas une.
2. **La machine à états de compétence** (`UNASSESSED / PRACTICED / DEMONSTRATED /
   REINFORCED`), avec des règles écrites **avant** toute mesure.
3. **La séparation stricte** couverture curriculum ≠ tentative ≠ preuve ≠
   compétence.
4. **La politique par type de source** — les seuils existants (`passThreshold`
   des diagnostics, `allPassed` du laboratoire) sont réutilisés, pas réinventés.
5. **Le sort de `progress.skills[]`** : le niveau auto-déclaré doit cesser d'être
   un concurrent de l'état projeté.
6. **La règle de renforcement** — séparation réelle exigée, jamais deux
   événements immédiats.
7. **Le mapping fin → compétence de programme**, sans toucher `curriculum/`.

---

**Fin du CP0. Aucun fichier produit modifié. Enchaînement automatique sur CP1.**
