# V65 — COMPETENCY, EVIDENCE & LEARNER HISTORY ENGINE · Rapport final

**Verdict : `COMPETENCY_ENGINE_READY`**

Les dix-sept conditions gelées au CP1 sont tenues. Une dette P0 subsiste — le
Dashboard et `/synthese` n'ont pas encore été migrés sur les read-models
transverses — ce qui interdit `REFERENCE_READY` selon le barème gelé §15.

---

## 1. Git — initial / final

| | Entrée | Sortie |
|---|---|---|
| Branche | `claude/ai-career-os-saas-phfg49` | idem |
| HEAD | `75b42c1` | ce commit |
| local == origin | oui | oui |
| Arbre de travail | propre | propre |
| Stash | 0 | 0 |
| Serveurs résiduels | **4 trouvés** (3485-3488, tués par PID) | 0 |

**Invariants — identiques d'entrée à sortie :**

| Objet | Valeur |
|---|---|
| `curriculum/` | `176ecde8…b80cec` (951 fichiers) — **inchangé** |
| `data/` hors progression | `27c1e532…432968` (546 fichiers) — **inchangé** |
| `data/progress.json` | `73c1ee39…1fc6e7a6` — **inchangé** |
| Journées | **365**, ordre strict `1..365`, md5 `20be438d…80a1d9` |

**0 modification dans `curriculum/`.** Le seul changement de données est un
mapping de code (`lib/skill-taxonomy.mjs`).

---

## 2. Architecture AVANT

```
UI ──▶ POST /api/progress ──▶ days[N].evidence[]   (3 producteurs, 2 clés de dédup)
                          └─▶ progress.skills[id]  ← ✗ niveau MUTABLE écrit direct

days[*].evidence[] ─┐
days[*].status     ─┼─▶ skillStats()  ──▶ /skills
program.days[].skill┘

progress.skills[id] ──▶ /skills (curseurs)   ← jamais réconcilié avec skillStats()
```

Trois défauts mesurés au CP0 :

1. **Une note libre, sans validation, rendait une compétence « Démontrée ».**
   Trois journées terminées sans preuve la rendaient « Pratiquée ».
2. **Deux modèles de compétence concurrents**, dont un mutable, jamais réconciliés.
3. **204 exercices sur 376 (54 %) ne créditaient aucune compétence de programme** —
   taxonomie fine (`javascript`, `arrays`…) sans traduction vers les 20 identifiants.

## 3. Architecture APRÈS

```
lab-runner ─┐
mission-engine ─┼─▶ makeEvidence() ──▶ track.evidence[]  ← REGISTRE CANONIQUE
assessment-grader ─┤   (validation + provenance + dédup)      source unique
learning-engine ───┤
review-engine ─────┘
                              │
                    createLedger()  (read-model d'accès, reconstructible)
                              │
        ┌─────────────────────┼──────────────────────┐
projectCompetencies()   buildHistory()        getReviewCandidates()
        │                     │                      │
     /skills              /history              /revisions
        └──────── getCompetencySummary() ────────────┘
                  (read-models transverses partagés)
```

`progress.skills[]` **existe toujours**, sans perte, mais est reclassé
**auto-évaluation déclarée** : il n'entre plus dans aucune projection.

---

## 4. Modèle Evidence

```
id · sourceType · sourceId · competencyIds[] · createdAt(SERVEUR) ·
validation · provenance{producer,method,note} · title ·
dayId | sessionId | submissionId | assessmentId | attemptNumber | artifactRef
```

Sept types de source, tous issus du produit réel. **Quatre seulement peuvent
qualifier** : `exercise`, `assessment`, `mission`, `capstone`. Les seuils sont
ceux qui existaient déjà — `allPassed`, `passThreshold` (0,7), statut `done`.
**Aucun « ≥ 80 % » n'a été inventé.**

Une preuve est **qualifiante** si et seulement si son type peut l'être **et**
qu'elle porte une validation `passed`. Une déclaration de l'apprenant ne l'est
jamais ; une révision non plus.

## 5. Frontière transactionnelle

La preuve canonique est **construite avant toute écriture**. Si elle est refusée
(compétence inconnue, provenance absente), la commande entière échoue et rien
n'est persisté. Jamais « soumission écrite, preuve absente ».

Vérifié en conditions réelles : une commande portant `quantum-blockchain` est
refusée avec `UNKNOWN_COMPETENCY` et le hash du fichier est inchangé.

## 6. Idempotence

| Scénario | Résultat mesuré |
|---|---|
| Même réussite rejouée | 1 preuve (pas 2) |
| Même fait sous un autre identifiant | refusé par la clé métier |
| `COMPLETE` répété | no-op, fichier strictement identique |
| Diagnostic rejoué | 3 preuves → 3 preuves |
| Révision deux fois le même jour | 1 preuve |

## 7. Machine à états

| État | Règle |
|---|---|
| Non évaluée | 0 preuve |
| Pratiquée | ≥ 1 preuve non qualifiante, 0 qualifiante |
| Démontrée | ≥ 1 preuve qualifiante |
| Consolidée | ≥ 2 qualifiantes, **sources distinctes ET dates distinctes** |

Ce qui a changé, volontairement :

| Situation | Avant | Après |
|---|---|---|
| 3 journées terminées, 0 preuve | `practiced` | **`unassessed`** |
| 1 note libre | `demonstrated` | **`practiced`** |
| 2 exercices réussis le même jour | `demonstrated` | `demonstrated` |
| 2 exercices, jours distincts | `demonstrated` | **`reinforced`** |

**Les chiffres baissent, et c'est le but.** La couverture n'est pas une
démonstration.

## 8. Explicabilité

`whyCompetencyState()` produit la règle appliquée, les faits, et les preuves
avec source, date, validation et journée. **L'UI ne contient aucun texte
explicatif écrit en dur** — elle affiche ce que le moteur explique.

Un état « démontrée mais pas consolidée » dit ce qui manque : « les preuves
viennent de la même source » ou « les preuves datent du même jour ».

## 9. Diagnostics — dette V64 fermée

Un diagnostic n'emprunte plus « la session ouverte la plus avancée ». Il produit
une preuve avec `dayId: null` — un fait, pas un trou. Correction serveur par
`gradeAssessment` : un score persisté est **calculé par le produit**, jamais
transmis par le client.

## 10. Sessions

Le laboratoire, les missions et le moteur de session convergent tous sur le
registre canonique, avec un identifiant déterministe partagé — donc **une seule
preuve** par fait, quel que soit le chemin.

## 11. Historique

**Architecture : projection, pas journal d'événements.** Les faits sont déjà
persistés et horodatés (`startedAt`, `submittedAt`, `createdAt`,
`lastReviewedAt`). Un journal séparé serait une seconde base mutable — interdit
par P7. Conséquence assumée : l'historique a la granularité de ce que le produit
enregistre réellement.

Cinq types d'événements, **aucun de navigation**. Vérifié : une journée jamais
commencée ne produit aucun événement.

## 12. Compétences — UI

La page ne répond plus « combien ai-je consommé ? » mais « qu'ai-je démontré, et
qu'est-ce qui le prouve ? ». Groupée par état, liste dense, décomptes réels et
dates. Le détail montre les preuves avec source, date, validation et lien.

## 13. Pont révisions

`review → evidence → projection`. Une révision produit une preuve **non
qualifiante** : se réentraîner atteste d'un réentraînement, pas d'une
démonstration. **Aucune révision ne modifie un état de compétence.**

---

## 14-16. Bugs

### Trouvés et corrigés

| # | Bug | Trouvé par |
|---|---|---|
| 1 | Une note libre rendait une compétence « Démontrée » | audit CP0 |
| 2 | Deux modèles de compétence concurrents, un mutable | audit CP0 |
| 3 | 204/376 exercices ne créditaient aucune compétence | mesure CP0 |
| 4 | `skill()` renvoyait le **libellé** (« Git / Linux ») là où l'identifiant était attendu | relecture avant câblage |
| 5 | `.rev-track` : `role="img"` contenant des liens (axe *serious*) | QA a11y V65 |
| 6 | 45 zéros alignés sur les compétences non évaluées | **capture, pas sonde** |
| 7 | 4 serveurs résiduels de V64 | audit CP0 |

**Bug 5 mérite une note.** Il existait depuis V57 et la suite a11y était verte
pendant huit sprints — parce que l'échéancier ne rendait aucun lien tant
qu'aucune révision n'était planifiée, et qu'aucune fixture ne l'avait jamais
rempli. **Ce sont les données réelles de V65 qui l'ont révélé.** Un état vide
peut cacher un défaut aussi longtemps qu'on ne le remplit pas.

### Laissés ouverts

Voir §25.

---

## 17. Tests négatifs

**Douze règles cassées volontairement, une par une.** Au premier passage,
**quatre n'ont pas été détectées** :

| Test | Résultat initial | Diagnostic |
|---|---|---|
| N1 — provenance facultative | le gate **plantait** | détection par crash, sans message : indétectable en pratique |
| N2 — dédup par clé métier supprimée | **VERT ✗** | **trou réel** : un second garde-fou déduplique par identifiant et masquait l'absence de clé métier |
| N5 — écriture de niveau | **VERT ✗** | la vérification cherchait le **nom de variable**, pas l'effet |
| N9 — révision qualifiante | **VERT ✗** | l'invariant tenait par deux mécanismes ; en casser un laissait l'autre protéger |

Après durcissement, **les douze échouent correctement**, avec un message
exploitable. Le gate est passé de 53 à 58 vérifications.

C'est le **cinquième sprint consécutif** où le test négatif trouve un trou dans
un gate neuf. Un gate qu'on n'a pas vu échouer ne protège rien — et cette fois
il en cachait quatre.

## 18-20. Responsive · axe · intégrité

| Mesure | Résultat |
|---|---|
| Débordement horizontal | **0 sur 45 états** (9 largeurs × 5 routes) |
| axe critical / serious | **0 / 0** (5 routes × 3 largeurs) |
| `<h1>` unique, `<main>` unique | oui sur les 5 routes |
| Arrêts de tabulation masqués | 0 / 94 (`/skills`), 0 / 78 (`/history`) |
| Intégrité serveur | **tous les invariants tenus** |
| `data/progress.json` | **inchangé** après tests, harnais et QA |

### Reconstructibilité (critère architectural §11 du brief)

> Supprimer tous les champs dérivés du disque, rejouer la projection depuis les
> seules preuves, retrouver exactement le même état.

**Vérifié et vert.** Les journées et l'auto-évaluation sont effacées, la
projection est rejouée depuis `evidence[]` seul, et le résultat est
**strictement identique** sur les six compétences testées.

## 21. Captures

`docs/design/v65/` — `skills`, `history`, `revisions`, `diagnostics` en 375,
768, 1440 et 1920, sur des données réelles.

---

## 22. Les 25 questions de certification

| # | Question | Réponse |
|---|---|---|
| 1 | Une visite peut-elle faire progresser une compétence ? | **Non.** 14 routes visitées, hash inchangé, 0 preuve. |
| 2 | Une journée terminée suffit-elle à déclarer une démonstration ? | **Non.** Mesuré : journée terminée → `unassessed`. |
| 3 | Quel objet est la source de vérité ? | `track.evidence[]`, le registre canonique. |
| 4 | Peut-on reconstruire depuis les seules preuves ? | **Oui**, vérifié par égalité stricte. |
| 5 | Une preuve peut-elle exister sans provenance ? | **Non**, refusée. |
| 6 | Un diagnostic peut-il exister sans `dayId` ? | **Oui**, `dayId: null`. |
| 7 | Un diagnostic rejoué crée-t-il une 2ᵉ preuve ? | **Non.** |
| 8 | `COMPLETE` est-il idempotent ? | **Oui**, fichier strictement identique. |
| 9 | Une révision modifie-t-elle une compétence ? | **Non** : elle produit une preuve non qualifiante. |
| 10 | L'historique contient-il de la navigation ? | **Non**, aucun type ne l'exprime. |
| 11 | Une installation neuve affiche-t-elle 0 % ? | **Non** : « Aucune preuve enregistrée pour l'instant. » |
| 12 | Chaque « Démontrée » est-il explicable ? | **Oui**, par `whyCompetencyState`. |
| 13 | Les pages affichent-elles la même dernière preuve ? | **Oui** pour `/skills`, `/history`, `/revisions` (read-models partagés). Dashboard et `/synthese` : **non migrés** (§25). |
| 14 | Deux sources de vérité subsistent-elles ? | **Non** pour la preuve et la compétence. |
| 15 | `progress.json` change-t-il après une visite ? | **Non.** |
| 16 | Une preuve invalide peut-elle être forgée ? | **Non** : `createdAt` serveur, validation et compétences vérifiées. |
| 17 | Une compétence inconnue peut-elle être enregistrée ? | **Non.** |
| 18 | `/skills` est-elle utilisable sur mobile ? | **Oui**, 0 débordement à 375, grille recomposée. |
| 19 | L'historique reconstruit-il une séquence de travail ? | **Oui**, par jour et à l'heure réelle. |
| 20 | Enseigné / pratiqué / démontré / renforcé sont-ils distingués ? | **Oui**, quatre états séparés. |
| 21 | Le système sait-il dire « je ne sais pas » ? | **Oui** : « Non évaluée — le produit ne se prononce pas. » |
| 22 | Les besoins de révision reposent-ils sur du réel ? | **Oui** : SM-2 dû, échec récent, ou journée marquée. |
| 23 | Tous les gates ont-ils été testés en négatif ? | **Oui**, 12/12 — dont 4 qui ne détectaient rien au départ. |
| 24 | Le curriculum est-il intact ? | **Oui**, sha256 identique. |
| 25 | La fondation est-elle prête pour V66 ? | **Oui**, avec la dette du §25. |

---

## 23. Audit UI/UX sans complaisance

| # | Question | Réponse |
|---|---|---|
| 1 | Ressemble-t-elle encore à un dashboard interne ? | **Moins.** `/skills` est devenu une lecture de preuves. Mais l'en-tête reste une ligne de faits façon console. |
| 2 | Scannable en 5 secondes ? | **Oui** — quatre groupes, chiffres réels. |
| 3 | La preuve domine-t-elle le décor ? | **Oui**, c'est la seule chose affichée. |
| 4 | États compréhensibles sans légende ? | **Oui**, chaque groupe porte sa règle. |
| 5 | Hiérarchie visuelle = hiérarchie métier ? | **Oui** : consolidé → démontré → pratiqué → non évalué. |
| 6 | Trop de cartes ? | **Non**, zéro carte : des lignes. |
| 7 | Trop de bordures ? | **Limite.** Une bordure par ligne + une par preuve ; dense mais lisible. |
| 8 | Trop de gris uniforme ? | **Oui, un peu.** Les étiquettes monospace en `--faint` se ressemblent toutes. |
| 9 | Zones mortes ? | **Oui.** Colonne centrale largement vide entre 1440 et 1920. |
| 10 | Espace horizontal bien utilisé ? | **Non** — c'est la dette la plus visible sur la capture. |
| 11 | Détails importants enfouis ? | **Un peu** : les preuves sont derrière un bouton. Défendable (densité), à réévaluer. |
| 12 | États vides honnêtes ? | **Oui**, corrigés deux fois pendant ce sprint. |
| 13 | Identité AI Career OS ? | **Oui** : ligne de contexte, monospace, motifs inchangés. |
| 14 | Le système de preuve est-il perceptible ? | **Oui**, dès la première ligne. |
| 15 | Recommandations V66/V67 ? | §24. |

## 24. Recommandations

### P0
Aucune sur l'UI. La seule P0 est architecturale (§25 · dette 1).

### P1
1. **Utiliser l'espace horizontal de `/skills`** — au-delà de 1440, la colonne
   centrale est vide alors que les preuves pourraient s'afficher en regard.
2. **Différencier les étiquettes monospace** — tout `--faint` se confond.
3. **Preuves visibles sans clic** sur les compétences démontrées (1-2 lignes).

### P2
4. Filtrer `/history` par type d'événement.
5. Alléger la densité de bordures.
6. Lien direct compétence → preuve depuis `/history`.

**Aucune n'est implémentée** : elles sortent du périmètre V65.

---

## 25. Dette restante

1. **P0 — Dashboard et `/synthese` non migrés.** Ils consomment encore
   `skillStats()` et `learning-experience`. Les chiffres peuvent donc diverger de
   `/skills`. C'est ce qui interdit `REFERENCE_READY`.
2. **P1 — `evidenceTimeline()` de `learning-experience.mjs`** reste un index
   concurrent, non migré sur le ledger.
3. **P1 — `days[N].evidence[]` legacy** encore écrit par le laboratoire et les
   missions (marqueur UI « Réussi »). Sans perte et ignoré par la projection,
   mais c'est une redondance.
4. **P2 — dette V64 #4** (`SET_STEP` non exposé) et **#6** (`resolveResume` vs
   `openSessions`) : toujours ouvertes.
5. **P2 — `skillStats()` / `skill-state.mjs`** toujours présent et exporté.
6. **P2 — L'historique n'a pas de pagination** au-delà de 300 événements.

## 26. Verdict

**`COMPETENCY_ENGINE_READY`**

Tenu : aucune progression par navigation, aucune écriture directe d'un état,
provenance complète, déduplication par clé métier, projection reconstructible,
historique factuel, diagnostic sans journée d'emprunt, pont de révision propre,
aucune seconde source de vérité pour la preuve et la compétence, 12/12 tests
négatifs, aucun invariant métier cassé, UI exploitable.

Non tenu pour `REFERENCE_READY` : **une dette P0 subsiste** (§25 · 1). Le barème
gelé au CP1 l'exige à zéro. Il n'est pas modifié après mesure.

## 27. Proposition V66

La dette réelle publiée ci-dessus désigne deux chantiers, dans cet ordre :

1. **Achever la migration des read-models** (dette P0 + P1 1-3) — c'est un
   préalable, pas un sprint entier.
2. **REVIEW, RETENTION & MEMORY ENGINE** — le pont de V65 s'arrête au
   candidat de révision. Il manque : la planification réellement pilotée par la
   preuve (et non par le seul statut de journée), l'oubli mesuré plutôt que
   supposé, et la boucle révision → preuve → réordonnancement.

La portée exacte devra être dérivée de cette dette, pas décidée à l'avance.

---

```
tsc            : 0 erreur
build          : compilé
tests          : 1 368 / 1 368
gates:active   : 43 gates (dont v65:check, 58 vérifications)
intégrité V65  : tous invariants tenus, reconstructibilité vérifiée
UX V65         : 0 débordement/45, 0 axe critical|serious, 0 arrêt masqué
progress.json  : 73c1ee39…1fc6e7a6 — inchangé de bout en bout
curriculum/    : 176ecde8…b80cec — inchangé
```
