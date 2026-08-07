# Matrice pédagogique — parcours Cloud / DevOps Engineer (V27)

Matrice module → jours → leçons de fond → pratique (exercices / Labs / missions),
produite au CP9. Le parcours `cloud-devops-engineer-v1` réutilise des journées
EXISTANTES (durée dérivée : **29 jours**) ; la profondeur canonique est portée par
les 32 Leçons de fond Cloud/DevOps (V26, durcies en V27), reliées à la pratique par
`practiceRefs`. Les leçons sont rattachées à un module par DOMAINE (catégorie
d'affichage), pas par un couplage rigide jour↔leçon.

Cadrage honnête : parcours de niveau **junior / entrée**. La dette de journées de
pratique dédiées (au-delà des jours réutilisés) reste documentée pour V28+.

| Module (ordre) | Jours réutilisés | Domaine de leçons | Leçons liées | practiceRefs |
|---|---|---|---|---|
| cde-01 Fondations système, shell & Git | 1–7 (7) | Systèmes & Linux | 5 | 9 |
| cde-02 Réseau, HTTP & services | 50–56, 71 (8) | Réseau | 5 | 15 |
| cde-03 Sécurité & secrets | 67–68 (2) | Réseau + Cloud/IaC | 12 | 45 |
| cde-04 Architecture, cloud & HA | 78–81 (4) | Cloud, AWS, Azure & IaC | 7 | 30 |
| cde-05 Durcissement & fiabilité | 83–86 (4) | Conteneurs & Docker | 5 | 13 |
| cde-06 Conteneurs & Kubernetes | 320–321 (2) | Docker + Kubernetes | 11 | 39 |
| cde-07 CI/CD & livraison continue | 307, 326 (2) | CI/CD & livraison | 4 | 17 |

**Couverture pratique** : les **32/32** leçons Cloud/DevOps V26 possèdent au moins
un `practiceRef` résolu (exercice, Lab ou mission existant). Aucun artefact n'est
dupliqué : les ~75 exercices et ~30 missions Cloud/DevOps préexistants sont
RÉUTILISÉS, complétés par 12 exercices ciblés (CP7) et 1 mission IaC (CP8) comblant
des trous réels.

## Graphe pédagogique (par leçon)

Chaque leçon de fond expose : `🌍 Le problème d'abord` (on-ramp néophyte) →
`🧩 Prérequis` explicités → contenu → `practiceRefs` vers la pratique. Le graphe de
prérequis inter-leçons (validé acyclique par `v27:check`) suit l'ordre :

- Linux : terminal → permissions → processus → {services, ressources} ; ssh dépend
  de permissions + réseau.
- Réseau : modèle en couches → adressage → dns ; http-tls → proxy/LB.
- Docker : conteneurs → images/couches → build ; réseau/volumes → compose ;
  hardening dépend de build + processus Linux.
- CI/CD : pipeline → portes qualité → stratégies de déploiement → reprise incident.
- Kubernetes : why/archi → workloads → {services, config/probes} → {troubleshooting,
  sécurité}.
- Cloud : fundamentals → {networking, compute-storage} → {aws, azure} ; iac dépend
  de fundamentals + k8s (déclaratif) ; finops dépend de compute-storage + probes.

## Chemin « néophyte complet » recommandé

1. terminal & permissions → 2. processus/services/ressources → 3. réseau (couches →
adressage → DNS → HTTP/TLS → proxy/LB) → 4. conteneurs → images → build → réseau/
volumes → compose → hardening → 5. CI/CD (pipeline → portes → déploiement → incident)
→ 6. Kubernetes (why → workloads → services → config/probes → troubleshooting →
sécurité) → 7. cloud (fundamentals → networking → compute/storage → AWS → Azure) →
8. IaC → 9. FinOps. Chaque étape : lire l'on-ramp, faire les `practiceRefs`, vérifier
sa compréhension avec le mini-exercice.
