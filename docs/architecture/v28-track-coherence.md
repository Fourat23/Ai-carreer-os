# Cohérence des parcours — audit V28

Audit CP9 des 6 parcours disponibles : promesse vs contenu réel, honnêteté du niveau,
durée dérivée. Question directrice : « le parcours promet-il quelque chose que son
graphe pédagogique n'enseigne pas ? ». Réponse : non — chaque parcours est cadré
honnêtement junior/fondation, et sa durée est DÉRIVÉE des jours réellement résolus
(aucun nombre magique).

| Parcours | Statut | Modules | Jours dérivés | Rôles annoncés (honnêtes) | Cohérent |
|---|---|---|---|---|---|
| ai-engineer-foundations-v1 | available | 12 | 365 | Programme complet 12 mois (fondation → IA appliquée) | ✅ |
| fullstack-typescript | available | 11 | 119 | Full-Stack / Backend / Frontend **junior** | ✅ |
| backend-engineer-v1 | available | 8 | 85 | Backend Node.js / API TypeScript **junior** | ✅ |
| systems-cloud-foundations-v1 | available | 8 | 31 | back-end orienté exploitation / futur DevOps-SRE **junior** | ✅ |
| appsec-cloud-security-v1 | available | 7 | 15 | AppSec / DevSecOps **junior** | ✅ |
| cloud-devops-engineer-v1 | available | 7 | 29 | Ingénieur DevOps / cloud / futur SRE **junior** | ✅ |

Cohérent = `totalDays` déclaré == jours réellement résolus par le catalogue (vérifié
programmatiquement).

## Intégration de la fondation Observabilité/SRE (V28)

Les 8 nouvelles Leçons de fond (observability-fundamentals, logging-structured,
distributed-tracing, metrics-percentiles, slo-error-budget, incident-response,
postmortem-rca, resilience-patterns) enrichissent la bibliothèque « Leçons de fond »
(catégorie « Observabilité, SRE & fiabilité ») et se rattachent aux parcours
`cloud-devops-engineer-v1` et `systems-cloud-foundations-v1` par les compétences
(archi/cloud) — ces parcours annoncent déjà un profil « futur SRE junior », que ces
leçons servent directement. Elles ne modifient PAS la structure en jours des parcours
(qui réutilisent des journées existantes) : c'est un enrichissement de la connaissance
canonique, relié à la pratique par `practiceRefs`.

## Honnêteté (pas de greenwashing pédagogique)

- Aucun parcours n'est présenté comme « senior » ou « clé en main » : tous les rôles
  sont explicitement **junior / débutant / fondation**.
- `ai-engineer-foundations-v1` est le programme complet (365 jours) ; les autres sont
  des curations honnêtes d'un sous-ensemble de jours pour un objectif métier donné.
- La dette (journées de PRATIQUE dédiées pour faire mûrir un parcours au-delà du
  niveau junior) reste documentée pour les sprints suivants.

## Graphe pédagogique Observabilité/SRE

Chemin recommandé : observability-fundamentals → logging-structured →
distributed-tracing → metrics-percentiles → slo-error-budget → incident-response →
postmortem-rca ; resilience-patterns se rattache à metrics-percentiles et au réseau
(proxy/LB). Chaque leçon porte on-ramp, prérequis explicités et `practiceRefs` vers la
pratique existante — graphe de prérequis validé acyclique par `v28:check`.
