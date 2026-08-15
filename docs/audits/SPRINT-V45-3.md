# SPRINT V45.3 — Academic Red Team : falsification de la certification V45.2

**Type** : audit contradictoire (red team), audit-only. **Langue** : français.
**Branche** : `claude/ai-career-os-saas-phfg49`.

## 0. Question du sprint

La conclusion V45.2 « 128/128 leçons = niveau académique A » résiste-t-elle à une
tentative sérieuse de falsification ? Aucun résultat n'était préféré.

## 1. État Git (constaté en clôture)

- Branche `claude/ai-career-os-saas-phfg49` ; HEAD local == origin ; tree
  **propre** ; stash **vide** ; aucun serveur résiduel.

## 2. Preuve d'immutabilité

- **Hash corpus initial == final == `4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3`**
  (sha1sum des 128 `.md` triés).
- `git diff 979edfb..HEAD -- curriculum/ program.json` = **vide**.
- `data/progress.json` == blob `323604021055588a9528a86875f36598dbdc7758`
  (jamais commité).

## 3. Méthode d'échantillonnage

Échantillon stratifié **déterministe** (seed `45032025`, mulberry32) : **38
leçons uniques**, 15 domaines. Contient les 7 MINOR_FIX, les nœuds centraux, les
fondamentaux premier-contact, les domaines avancés (ML/DL/RAG/agents/security/
K8s/system-design), 3 plus courtes/longues/denses/excellentes, 4 aléatoires.

## 4. Nombre réellement full-read

**38 / 38** lues intégralement (blind PASS A), au-delà du floor de 24. Aucun
verdict sans ≥ 2 preuves textuelles.

## 5. Répartition A/B/C/D/E (V45.3, échantillon)

| A | B | C | D | E |
|:-:|:-:|:-:|:-:|:-:|
| 34 | 4 | 0 | 0 | 0 |

Downgrades A→B : `pandas-data-wrangling`, `observability-logging`,
`docker-containers`, `ci-cd`.

## 6. Comparaison avec « 128/128 A » de V45.2

Sur l'échantillon, V45.2 = 38/38 A ; V45.3 = 34/38 A (89 %). Matrice A→A=34,
A→B=4, A→(C/D/E)=0. **Le « 128/128 A » ne résiste pas entièrement** à la grille
REFERENCE-GRADE, mais aucune leçon ne descend sous B.

## 7. Distribution T0-T5

V45.3 : **T2=17, T3=19, T4=2**, T0/T1/T5=0. Contre ~53 % T4 dans le corpus V45.2.
**Le transfert V45.2 était matériellement surévalué** (en partie changement
d'échelle, en partie optimisme réel).

## 8. Résultats des adversarial attacks

Sur 38 leçons × 8 attaques (core claim, teach-back, novel case, counter-example,
misconception, dependency, professional decision, evidence) : **aucune erreur
technique**, **aucun risque de misconception non neutralisé**, **aucun prérequis
critique manquant**. Les seules failles trouvées sont : redondance curriculaire
(récaps) et pratique d'outil manquante (Barre B). Détail par leçon dans
`V45-3-LESSON-REDTEAM.json`.

## 9. Analyse des 7 MINOR_FIX

4/7 confirmés **B** sous REFERENCE-GRADE (pandas, observability-logging,
docker-containers, ci-cd) ; 3/7 restent **A** (rag-evaluation,
prompt-injection-defense : overlap défendable ; iac-fundamentals : coquille).
Aucun ne cache de TECHNICAL/MISCONCEPTION_RISK. (`V45-3-MINOR-FIX-REVIEW.md`)

## 10. Calibration PASS A / PASS B

PASS B (6 anchors, ordre différent, scores PASS A masqués) : **6/6 concordants**
sur grade ET transfert. Grille V45.3 reproductible.

## 11. Biais possibles de la grille

REFERENCE-GRADE pénalise structurellement les récaps (par définition non
« primaires ») ; les 2 dimensions inédites (counter-example / limits) désavantagent
les fondations minimalistes. La grille V45.3 est plus sévère par construction — ce
qui est le but d'un red team, mais doit être gardé à l'esprit.

## 12. Objections du challenger (subsistantes)

1. Pas de **second auditeur indépendant** (blind auto-administré).
2. Seules **38/128** relues sous la grille stricte → taux de B extrapolé (~10-15 %),
   non mesuré sur tout le corpus.
3. La chute du T4 est **en partie un changement d'échelle**, pas une erreur
   factuelle de V45.2. (`V45-3-CHALLENGER-REVIEW.md`)

## 13. Réponse directe à la question utilisateur

> « Si je commence à apprendre demain, puis-je faire confiance aux leçons sans
> craindre qu'on restructure sans cesse les fondations et rende mon apprentissage
> caduc ? »

**OUI AVEC RÉSERVES.**

- **OUI** : les fondations sont conceptuellement **solides et stables** — 0
  leçon fausse ou dangereuse (0 C/D/E), 34/38 tiennent le grade le plus strict,
  et elles sont désormais **gelées académiquement**. Ce que tu apprends ne
  deviendra pas caduc : les changements prévus sont **additifs** (pratique) ou de
  **déduplication** (récaps), jamais des réécritures de concepts.
- **RÉSERVES** : (1) quelques leçons de récap DevOps (docker-containers, ci-cd)
  et de log seront **consolidées** — sans invalider les concepts ; (2) la
  **pratique exécutable** de plusieurs compétences (ML/DL/infra/data) reste à
  construire : aujourd'hui tu COMPRENDS bien mais tu PRATIQUES parfois en simulé ;
  (3) ne te fie pas aux étiquettes de « transfert » de V45.2 (elles étaient
  optimistes) : le far transfer viendra surtout de la pratique et des projets.

## 14. Décision : freeze académique

**Fondations conceptuelles → `ACADEMICALLY_FROZEN`.** Chantiers ouverts (non
gelés) : consolidation des récaps + ajout de pratique exécutable (additif).
0 RESTRUCTURE_REQUIRED. (`V45-3-ACADEMIC-FREEZE.md`)

## 15. Dette restante exacte

- **Grade** : ~4/38 (extrapolé ~10-15 % du corpus) sont B, pas A — récaps
  redondants + pratique d'outil.
- **Transfert** : libellés V45.2 surévalués → à recalibrer T0-T5 à l'échelle du
  corpus.
- **Barre B (pratique exécutable)** : dette dominante, héritée de V45.2, inchangée.
- **Cosmétique** : coquille `iac-fundamentals`.

## 16. Ce qui n'a PAS été testé

- 90/128 leçons non relues sous la grille V45.3 (seules 38 échantillonnées).
- Pas de second auditeur humain indépendant.
- Pas d'exécution réelle des exercices (audit de contenu, pas de pratique).
- Le rendu UI/parcours réel de l'apprenant (hors périmètre).

## 17. Métriques avant/après

| | Avant (V45.2) | Après (V45.3, échantillon) |
|---|---|---|
| Grade A | 128/128 (100 %) | 34/38 (89 %) |
| Grade B | 0 | 4 |
| C/D/E | 0 | 0 |
| T4 (transfert) | ~53 % du corpus | 2/38 (~5 %) |
| Erreurs techniques | 0 | 0 |

## 18. Hash corpus initial / final

Initial = Final = **`4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3`**. Immutabilité
prouvée.

## 19. Tests / build / gates

`npm test` = **1217/1217** (dont 8 nouveaux tests d'audit V45.3) ;
`tsc --noEmit` = **0** ; `gates:active` = **0**.

## 20. HEAD final / sync / tree

HEAD == origin ; working tree **propre** ; stash vide.

## 21. Proposition V46

Voir `V45-3-PROMPT-V46.md` : **Executable Practice Remediation I** — construire
la pratique exécutable (Barre B) sur un socle conceptuel gelé, et consolider les
récaps DevOps. Substantiel, pas « +5 exercices ».

---

## Verdict global : **CERTIFICATION_PARTIALLY_CONFIRMED**

Le corpus est **académiquement fort et sans fausseté** ; V45.2 avait raison sur le
FOND. Mais deux affirmations étaient trop généreuses : le **grade A universel**
(~10-15 % relèvent de B sous une définition stricte) et le **niveau de transfert**
(inflation T4). La certification tient dans sa substance, pas dans sa forme
absolue « 128/128 A ». La grille V45.2 était **légèrement trop permissive** ; la
qualité pédagogique de fond, elle, est réelle.
