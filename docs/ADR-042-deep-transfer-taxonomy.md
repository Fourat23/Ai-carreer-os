# ADR-042 — Deep Transfer, taxonomie T0–T5 & variabilité des problèmes

Statut : accepté (Sprint V42). Décision fondée sur l'audit CP0 réel. **Priorité : pédagogie/acquisition >
pratique > transfert professionnel > évaluation > cohérence parcours > features > UI.** Local,
mono-utilisateur, **une seule source de vérité**, sans fausse « IA », sans infra réelle.

## Problème (établi au CP0)
Le corpus enseigne, fait pratiquer, évalue et propose des capstones. Mais l'audit V40 a montré que le
transfert reste **near** (single-hop) : sur 16 questions `TRANSFER`, 8 sont du near-transfert robuste et
7 sont de la reconnaissance d'analogie ; **aucune n'est du far-transfert (T5) multi-sauts**. De plus,
aucune **échelle de distance de transfert** explicite n'existe (la taxonomie assessment RECALL→TRANSFER
est une échelle de Bloom, pas de distance), et la remédiation pointe des leçons plutôt que des
**misconceptions** précises.

## Décisions

### D1 — Taxonomie T0–T5 explicite (échelle de DISTANCE de transfert)
`lib/transfer-taxonomy.mjs` (PUR) définit `TRANSFER_LEVELS = ['T0','T1','T2','T3','T4','T5']` :
T0 recall · T1 understanding · T2 application proche · T3 diagnostic · T4 near transfer · T5 deep/far
transfer. Distincte de la taxonomie de Bloom d'`assessment.mjs` (RECALL→TRANSFER) : c'est une **vue
complémentaire**, avec un mapping documenté. **Aucune** modification des états `SKILL_STATES` ni de la
taxonomie assessment existante.

### D2 — Rubrique de transfert (10 critères) + classificateur CONSERVATEUR
La rubrique note une tâche sur 10 dimensions (reconnaissance conceptuelle, nouveauté contextuelle, qualité
des distracteurs, compétition d'hypothèses, profondeur de raisonnement, exigence de justification, contrôle
de l'ambiguïté, authenticité pro, qualité du feedback, remédiabilité). Le classificateur
`suggestTransferLevel` dérive un niveau **plancher prudent** à partir de signaux structurels (kind,
nb d'options, présence d'un pont explicite, nb d'étapes déclaré) et **ne prétend JAMAIS « T5 »** sans
métadonnée `bridge` explicite + `crossDomain:true`. Un domaine différent NE suffit PAS à faire un T5.

### D3 — Défis de transfert : COMPOSITION du modèle assessment, pas 3e moteur
`data/transfer-challenges/*.json` réutilise **exactement** le modèle de question d'`assessment.mjs`
(`validateQuestion`, `gradeQuestion` — mcq/multi/predict, invariants déterministes) et ajoute, par
challenge : `transferLevel` (T4/T5), `bridge` (concept source → contexte cible, soutenu par le corpus),
`sourceSkill`/`targetContext`, `lessonRefs`. **Aucun** `gradeCapstone`/`gradeAssessment` dupliqué : un
mince module `lib/transfer-challenge.mjs` valide et note en appelant les fonctions existantes.

### D4 — Variété ≠ bruit (règle académique)
Un défi de transfert doit modifier au moins une **dimension cognitive** (hypothèses disponibles,
informations inutiles, contraintes, échelle, cause réelle, technologie, compromis, ambiguïté), pas
seulement les noms/nombres/domaine superficiel. Le gate vérifie la présence d'un `bridge` réel et
d'options concurrentes ; l'audit humain juge la profondeur.

### D5 — Misconceptions → remédiation ciblée (données pures)
`lib/misconceptions.mjs` (PUR) porte un petit registre d'idées fausses RÉELLES tirées du corpus
(retry ≠ idempotence, percentile ≠ moyenne, « un index accélère tout », « un Secret K8s est chiffré »,
« useEffect est un lifecycle générique », récupération ≠ génération…), chacune reliée à : la compétence,
la correction conceptuelle, les leçons/exercices de remédiation. Résolveur pur `remediateMisconception`.
Réutilisable par `learning-experience` (aucune écriture, aucun second moteur).

### D6 — Curriculum Graph : diagnostic `skill-without-transfer` (avertissement)
Le graphe accepte les `transfer-challenges` et émet un **avertissement** (jamais bloquant, jamais faux
positif) quand une compétence STRUCTURANTE (déclarée) est enseignée + pratiquée mais n'a aucun défi de
transfert relié. Toutes les micro-compétences n'ont PAS besoin d'un T5 : seule une liste explicite de
compétences structurantes est évaluée.

### D7 — Durcissement HONNÊTE des questions TRANSFER faibles
Les 7 questions « single-hop » sont traitées au mérite : **REWRITE** (2-3, en vrai T4 avec infos
concurrentes/multi-étapes), **RELABEL** (aligner honnêtement), ou **KEEP** (amorce de near-transfert
assumée). Aucun gonflage ; auto-cohérence préservée (le gate v39 et les tests restent verts).

### D8 — Gate `v42:check` + ledger + réel/simulé/proxy
Gate : refs valides (skills/leçons), `transferLevel` ∈ allowlist, `bridge` non vide pour T5, pas d'id
dupliqué, misconceptions résolues, graphe 0 bloquant. Un score de transfert reste un **PROXY** ; les
domaines d'infra/LLM/ML restent **SIMULÉS**. Jamais « compétence maîtrisée » sur un score.

## Conséquences
- **Positives** : le transfert devient explicitement défini et mesurable ; de vrais T4/T5 existent ; les
  erreurs mènent à des remédiations conceptuelles ; le graphe voit les ruptures de transfert.
- **Coûts** : périmètre volontairement borné (qualité > quantité) ; la variabilité à grande échelle et le
  hardening large de leçons sont reportés (dette V43, documentée).
- **Rejeté** : Transfer Engine autonome (D3), reclassement malhonnête (D7), quotas de contenu (D4),
  second state model (D1).
