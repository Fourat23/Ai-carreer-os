# Cohérence des parcours — audit V30 (CP10)

Audit des 6 parcours disponibles et des 3 annoncés après l'enrichissement V30 (Backend/API,
documentation SE, dette AI/ML historique). Comme en V29, V30 ajoute de la **profondeur de
connaissance et des liens de pratique**, pas des journées : la structure en jours des parcours
est inchangée, et leur durée dérivée reste cohérente.

## 1. Parcours disponibles (6) — durée dérivée inchangée
| Parcours | Statut | Jours dérivés | Cohérent |
|---|---|---|---|
| ai-engineer-foundations-v1 | available | 365 | ✅ |
| fullstack-typescript | available | 119 | ✅ |
| backend-engineer-v1 | available | 85 | ✅ |
| systems-cloud-foundations-v1 | available | 31 | ✅ |
| appsec-cloud-security-v1 | available | 15 | ✅ |
| cloud-devops-engineer-v1 | available | 29 | ✅ |

Cohérent = `totalDays` déclaré == jours réellement résolus (vérifié programmatiquement, non
modifié par V30). Aucune journée ajoutée/retirée.

## 2. Impact V30 par parcours (connaissance, pas jours)
- **ai-engineer-foundations-v1** (parcours phare) : le plus concerné. Les fondations IA/ML
  historiques (statistics-for-ml, machine-learning-basics, model-evaluation, llm-fundamentals,
  agents-fundamentals, ai-security) passent de P0/P1 à un standard accessible au néophyte, avec
  maths expliquées par l'intuition et pratique reliée (ml-metric-choice, prompt-injection-classify).
  Le déséquilibre « Cloud/SRE excellents, fondations IA médiocres » est corrigé sur le socle.
- **backend-engineer-v1** : chaîne Backend/API renforcée (api-design-basics, express-backend,
  authentication, async-javascript durcies + reliées à api-router/http-status/validate-user/
  auth-status-decision) + documentation technique (nouvelle leçon).
- **fullstack-typescript** : bénéficie du Backend/API et de la documentation SE ; le frontend
  était déjà complet (V29).
- Les 3 parcours cloud/systèmes/sécurité : inchangés (domaines déjà au standard).

## 3. Enrichissement transversal
- **Documentation SE** : nouvelle leçon `technical-documentation` (ADR/RFC/HLD/HSD/TSD/LLD/
  runbook/post-mortem/changelog + 4 maintenances) — utile à tous les parcours.
- **Pratique** : +3 exercices (auth-status-decision, ml-metric-choice, prompt-injection-classify),
  +3 playbooks (ci-passes-locally-fails, intermittent-incident, third-party-outage).
- **Glossaire** : +14 termes réellement enseignés.
- **SQL** : note « réel vs simulé » ajoutée aux 5 leçons Data (décision runtime = Option A).

## 4. Parcours annoncés (Frontend / Data) — restent `announced`
`frontend-engineer-v1` et `data-ml-v1` restent **annoncés** : V30 renforce la connaissance
(Backend, AI/ML) mais n'ajoute pas la curation jour-par-jour dédiée qui ferait un parcours
autonome à durée crédible. Les promouvoir sans cette curation serait du greenwashing. Dette
cadrée pour V31.

## 5. Honnêteté
- Aucune durée de parcours modifiée ; V30 = profondeur + liens, pas de journées.
- Aucun parcours annoncé promu sans curation réelle.
- Bascule/isolation/recherche/backup restent couverts par les tests existants (track-aggregate,
  backup-multitrack, v2x-e2e) ; V30 n'y touche pas.
