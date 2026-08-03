# Audit pédagogique V23 — Kubernetes & Orchestration

Rapport d'audit (CP8). Fondé sur l'exécution réelle du modèle
`lib/pedagogy-audit.mjs` (scan de danger + registre de notes humaines) et sur la
**lecture effective** des contenus Kubernetes livrés en V23. **Aucun contenu n'a
été modifié pour améliorer une note.** Les faiblesses réelles sont documentées ;
aucune note complaisante.

## 1. Méthodologie

- **Niveau A** — audit des ajouts V23 : jours d'ancrage 320-321 (enrichis
  additivement), 16 exercices `k8s-*`, 6 missions `k8s-*`, le code du laboratoire
  (`lib/manifest*.mjs`), l'adaptateur `manifest-kubectl.mjs`, les 3 scénarios de
  manifests.
- **Niveau B** — scan de danger sur l'ensemble des contenus (0 bloquant).
- **Niveau C** — relecture comparative des vagues V19→V22 (rejouées pour
  non-régression).

16 dimensions notées 0-4 (notes **humaines** ; l'automatisation ne fournit que des
signaux structurels et de danger). Registre vivant `v20-pedagogy-audit.json`
étendu à **91 items** (85 récents), tous ≥ seuil. Moyennes V23 : jours ≈ 3,50/4,
exercices 3,56/4, missions 3,50/4.

## 2. Périmètre V23

- **2 journées** d'ancrage enrichies : 320 (dockerisation → orchestration : objets,
  control plane, état désiré/observé) ; 321 (reproductibilité → exploitation :
  probes, rollout/rollback, incidents, méthode « Que faire dans ce cas ? »).
- **16 exercices déterministes** (`k8s-*`), **6 missions** (`k8s-*` : 2
  documentation, 1 performance, 3 incident, dont une à 4 livrables avec runbook +
  post-mortem + plan de rollback).
- **Scan de danger : 31 fichiers V23 → 0 signal bloquant.**

## 3. Limites de l'audit (honnêtes)

- Audit **statique** : il ne mesure pas la qualité d'un raisonnement (d'où les
  notes humaines) ni n'observe un apprenant réel.
- La qualité **sémantique** des livrables de mission (runbook, post-mortem, plan de
  rollback) relève de la **revue humaine**.
- V23 n'ajoute **aucune** revendication de cluster réel : le Manifest Lab est
  déterministe et local (état `kubectl` réel : **absent**).

## 4. Comparaison V19 → V23 (par bloc)

| Bloc | Profondeur | Exactitude | Progression | Exemples | Exercices | Missions | Pertinence pro | Simulé / réel |
|---|---|---|---|---|---|---|---|---|
| **V19 Linux/réseau** | élevée | élevée | forte | guidés | déterministes | incidents réalistes | forte | terminal borné (réel restreint) |
| **V20 Docker** | élevée | élevée | forte | Dockerfile commentés | 10 déterministes | 3 (conteneur) | forte | Docker désactivé proprement si absent |
| **V21 CI/CD** | élevée | élevée | forte | pipelines | 12 déterministes | 4 (livraison) | forte | pipeline simulé (pas de runner réel) |
| **V22 Cloud** | élevée | élevée | forte | topologies | 14 déterministes | 6 (archi/incident) | forte | topologie simulée (pas de cloud réel) |
| **V23 Kubernetes** | élevée | élevée | forte | manifests + incidents | 16 déterministes | 6 (dont runbook/post-mortem) | forte | manifest analysé/simulé (pas de cluster) |

**Cohérence de la série** : les cinq vagues partagent la même philosophie —
**comprendre par la simulation locale et honnête**, jamais de fausse promesse (pas
de runner CI, pas de cloud réel, pas de cluster réel, pas d'isolation OS). V23
prolonge V20 (conteneur → orchestration) et V22 (déploiement → orchestration
opérationnelle), et introduit une **méthode d'intervention réutilisable**
(« Que faire dans ce cas ? ») qui manquait aux vagues précédentes.

## 5. Résultat & matrice V23

- **Sécurité/exactitude : 0 signal bloquant.** Aucune promesse d'isolation OS
  (Namespace explicitement présenté comme cloisonnement logique, pas OS), aucun
  chiffre inventé, aucun secret réel, vues publiques anti-fuite (`v23:check`).
- Jours 320-321 : structure complète conservée (enrichissement additif) ; charge
  cognitive **3** (denses).
- Exercices `k8s-*` : `depth` **3** assumée (micro-compétences déterministes ; la
  profondeur vit dans les jours).
- Missions : évaluation honnête ; `k8s-rolling-regression` va jusqu'au post-mortem
  sans blâme et à la distinction action corrective/préventive.

## 6. Défauts

### Bloquants
**Aucun.**

### Majeurs
**Aucun** dans le périmètre V23.

### Mineurs (faiblesses réelles, documentées)
- **Densité des jours 320-321** : ce sont désormais des journées longues (objets +
  exploitation + méthode d'intervention). Charge cognitive 3. Un fractionnement
  visuel (sous-titres) améliorerait le confort — sans retirer de contenu.
- **etcd / control plane / RBAC** sont introduits **conceptuellement** : c'est
  volontaire (fondation, pas expertise), mais un apprenant visant l'exploitation
  avancée devra aller plus loin (piste V24 sécurité/RBAC).
- **Pas d'exécution réelle** : aucun `kubectl apply` contre un vrai cluster
  (indisponible). Assumé et dit — mais la compétence « opérer un vrai cluster »
  reste hors de portée du Lab (observation d'apprenants + cluster réel requis).

## 7. Contenu excellent à préserver

- **Méthode « Que faire dans ce cas ? »** (jour 321) : démarche professionnelle en
  10 étapes (symptômes → risque → à ne pas faire → vérifications → hypothèses →
  données → décision → validation → communication → documentation/prévention) +
  cas types. Réutilisable, honnête, rare dans un contenu de portfolio.
- **Modèle mental état désiré/observé + réconciliation** (jour 320) : le bon
  niveau d'abstraction pour comprendre Kubernetes sans se noyer dans l'API.
- **Laboratoire** : modèle pur, analyse (règles avec preuve + recommandation +
  compromis), simulation d'incidents/rollout déterministe, adaptateur kubectl
  **honnête** (absent/cli-only/cluster/denied).

## 8. Plan de correction priorisé

### À corriger dans V23 (CP8)
**Rien.** Aucun défaut démontré n'appelle de modification de contenu.

### À reporter (hors périmètre V23)
- Sécurité/RBAC approfondie, gestion des secrets, supply chain → **cible V24**.
- Observation d'apprenants réels sur le Manifest Lab.
- Exécution réelle optionnelle si un cluster (kind/minikube) devient disponible.
- Fractionnement visuel des jours 320-321 (confort).

## 9. Bilan avant/après V23

| Dimension | Avant V23 | Après V23 |
|---|---|---|
| Orchestration/Kubernetes | absent | jours 320-321 approfondis |
| Pratique k8s | aucune | 16 exercices + Kubernetes Manifest Lab |
| Missions k8s | aucune | 6 (dont runbook + post-mortem) |
| Laboratoire | — | modèle pur + ~29 règles + 16 incidents + rollout |
| Glossaire | 440 termes | 483 (+43 k8s) |
| Méthode d'intervention | — | « Que faire dans ce cas ? » réutilisable |
| Danger (scan) | 0 bloquant | 0 bloquant |
| Moyenne notes récentes | ~3,52 | ~3,52 (maintenue en ajoutant 23 éléments) |

**Ce qui nécessite encore une revue humaine** : la qualité sémantique des livrables
documentaires des missions (runbook, post-mortem, plan de rollback). **Reporté** :
sécurité/RBAC avancée (V24), exécution réelle, observation d'apprenants.
