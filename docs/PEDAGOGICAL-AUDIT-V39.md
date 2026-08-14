# Audit pédagogique — Sprint V39 (Maîtrise, évaluation de transfert & révisions adaptatives)

> Ajout d'une couche d'ÉVALUATION diagnostique à taxonomie (RECALL → TRANSFER), correction 100 %
> déterministe et locale, reliée aux moteurs EXISTANTS de maîtrise (skill-state) et de révision
> (review) — sans second moteur. Document en français, factuel, sans langage promotionnel. Un score
> de diagnostic est un PROXY d'apprentissage, jamais une preuve de maîtrise humaine.

## 1. Méthodologie
Audit CP0 lecture seule d'abord (états/révision/compétences existants), puis conception (ADR/HSD/TSD-039),
implémentation, tests, gate. Rubrique v20 (16 dimensions 0-4) pour re-auditer les 4 leçons denses de V38
touchées par la reliure. Registre `docs/architecture/v39-pedagogy-audit.json` validé par
`validateAuditLedger`. Gate `v39:check` = structure du catalogue d'évaluations, jamais profondeur par
longueur.

## 2. Constat CP0 décisif : ne pas construire un second moteur
L'audit CP0 a établi que l'essentiel demandé EXISTE déjà :
- **États de maîtrise** : `lib/skill-state.mjs` (5 états dérivés par règles, aucun faux score).
- **Révision espacée** : `lib/review.mjs` (SM-2 déterministe, sans « IA »).
- **Preuves & compréhension** : `lib/learning.mjs`. **Pages** : `/skills`, `/revisions`, `/synthese`.

Le SEUL trou authentique : aucune couche d'ÉVALUATION structurée à taxonomie. V39 comble exactement ce
trou, en **alimentant** les moteurs existants (une évaluation réussie → preuve → état dérivé), au lieu
d'introduire un vocabulaire de maîtrise concurrent (`fragile/opérationnel/solide`) qui aurait été une
seconde source de vérité.

## 3. Ce qui a été fait
- **Modèle pur** `lib/assessment.mjs` : `validateAssessment`, `gradeAssessment` (mcq/multi/predict,
  correction par comparaison de données), `assessmentToEvidence` (pont vers les preuves).
- **Catalogue** `data/assessments/*.json` : **16 évaluations, 83 questions**, couvrant fondations,
  web/backend, System Design, données, sécurité, Git/Linux, cloud/k8s, SRE, ML, LLM/RAG, React.
- **Taxonomie** couverte : RECALL 16 · UNDERSTANDING 25 · APPLICATION 9 · DIAGNOSIS 17 · TRANSFER 16.
- **Reliure** : `EVIDENCE_TYPES` += `assessment` ; Curriculum Graph += nœud `assessment` + arêtes
  `ASSESSES`/`REMEDIATES` + anomalie bloquante `dead-assessment-ref`.
- **UX** : page `/diagnostics` (prise interactive, correction locale, restitution par niveau,
  remédiation), reliures depuis `/skills` et `/revisions` (rappel actif).
- **Gate** `v39:check` câblé dans `gates:active`.
- **4 leçons V38** re-auditées après reliure (verdict densité **KEEP**).

## 4. Verdict densité des 4 leçons V38 (demandé au CP0)
| Leçon | Lignes | Sous-sections | Verdict | Justification |
|---|---|---|---|---|
| api-production-contracts | 133 | 4 | **KEEP** | thème unique cohérent, complet |
| async-messaging-queues | 144 | 7 | **KEEP** | récit unique producteur→DLQ→ordering ; SPLIT fragmenterait |
| system-design-scaling | 154 | 8 | **KEEP** | échelle progressive « 1 machine → 1M », guidée |
| distributed-systems-failures | 146 | 6 | **KEEP** | niveau junior assumé, cohérent |

Aucune ne justifie **SPLIT** (chacune = un thème, pas cinq superficiels) ni **DEEPEN** urgent : async et
distribués sont déjà à charge cognitive 3 ; approfondir **augmenterait** la charge. Décision honnête :
**stabiliser + relier**, ne pas gonfler. Chaque leçon gagne une ligne « Auto-évaluation » vers son
diagnostic — la seule modification de contenu.

## 5. Matrice d'audit — 4 leçons re-auditées
TA/Obj/Pré/MM/Prof/Prog/EG/PA/FB/EF/PP/Éval/CC/Acc/Rét/TC.

| Leçon | TA | Obj | Pré | MM | Prof | Prog | EG | PA | FB | EF | PP | Éval | CC | Acc | Rét | TC | Moy |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| api-production-contracts | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 3,88 |
| async-messaging-queues | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 3,88 |
| system-design-scaling | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 3,88 |
| distributed-systems-failures | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 3,88 |

**Moyenne du périmètre : 3,88.** Aucune dimension < 3 ; dimensions dures ≥ 3.

### Honnêteté des notes (ce qui a bougé et pourquoi)
- **evaluation 3 → 4** : la boucle *leçon → diagnostic (incl. transfert + diagnostic) → remédiation* est
  désormais fermée, avec correction déterministe. Amélioration réelle, pas cosmétique.
- **feedback 3 → 4** : chaque question porte une explication ; l'écart attendu/obtenu est montré.
- **retention 3 → 4** (distributed) : rappel actif via diagnostic interleavé dans `/revisions`.
- **autonomous-practice reste 3** : notation par modèle DÉTERMINISTE ; systèmes distribués SIMULÉS.
- **cognitive-load reste 3** : async et distribués restent volontairement denses (assumé).

## 6. Qualité de la couche d'évaluation (pas d'« excellent » automatique)
| Axe | Verdict | Justification |
|---|---|---|
| Déterminisme / honnêteté | EXCELLENT | correction par comparaison de données ; aucune « IA » ; flottants interdits (gate). |
| Taxonomie | FORT | 5 niveaux ordonnés ; DIAGNOSIS (17) et TRANSFER (16) largement présents. |
| Transfert réel | FORT | chaque diagnostic finit par une transposition à un contexte NOUVEAU sans nommer le concept. |
| Reliure aux moteurs | FORT | résultat → preuve → skill-state ; remédiation → leçons ; interleaving → révisions. |
| Frontière preuve/proxy | EXCELLENT | rappelée sur `/diagnostics` et dans le panneau de résultat ; rien n'est écrit d'office. |
| Couverture curriculaire | BON | 16 domaines clés ; consensus détaillé / streaming avancé restent hors périmètre (junior). |
| Accessibilité UX | BON | radios/cases/champ ; validé navigateur 5 largeurs (CP12). |

## 7. Frontière RÉEL / SIMULÉ / NON TESTÉ
- **RÉEL** : correction déterministe des 16 évaluations (auto-cohérence 100 % en test) ; dérivation d'état
  par règles ; révision SM-2 ; validation navigateur Playwright.
- **PROXY** : le score de diagnostic est un indice de compréhension, pas une mesure d'apprentissage.
- **SIMULÉ** : scénarios de systèmes distribués / files / cloud décrits pour le raisonnement (étiquetés
  SIMULATION) — aucun vrai broker/cluster/LLM.
- **NON TESTÉ** : aucun apprentissage humain mesuré ; aucune adaptation « intelligente ».

## 8. Dette restante
- **P2** : les avertissements du Curriculum Graph restent des dépendances conceptuelles légitimes (0
  bloquant) ; les évaluations n'en ajoutent aucun.
- **P3** : les diagnostics ne s'enregistrent pas encore automatiquement comme preuves dans la
  progression (choix de sûreté : `/diagnostics` n'écrit rien) — un bouton « enregistrer comme preuve »
  réutilisant le flux existant est un candidat V40+ ; taxonomie APPLICATION un peu moins fournie (9) que
  les autres niveaux ; pas de diagnostics par jour dédié (vivent en catalogue, comme V37/V38).

## 9. Limites de l'audit
Notes portées par un seul auteur ; proxys structurels/qualitatifs, non une mesure d'apprentissage. La
validation navigateur observe rendu/débordement/erreurs console. Aucune exécution distribuée réelle, par
conception (local/déterministe).
