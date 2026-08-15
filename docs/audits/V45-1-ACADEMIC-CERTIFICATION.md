# V45.1 — ACADEMIC CERTIFICATION (128/128)

Audit **lecture seule**. Résultat de la lecture intégrale des 128 leçons (ledger
`V45-1-LESSON-LEDGER.json`, test 128/128 vert). Pas d'auto-congratulation : verdict clinique, à deux
barres explicites pour éviter toute lecture faussement rassurante.

## Deux barres de certification (honnêteté)

- **Barre A — QUALITÉ DE LEÇON (prose)** : la leçon enseigne-t-elle bien son concept ? (exactitude,
  modèle mental, accessibilité, progression, prérequis — les 7 dimensions du seuil CERTIFIED).
- **Barre B — PRATICABILITÉ DE COMPÉTENCE** : l'apprenant peut-il PRATIQUER le geste en code exécutable ?

Ces deux barres NE coïncident PAS. Une leçon peut être CERTIFIED (barre A) tout en étant théorie-seule
(barre B échouée). Confondre les deux serait la malhonnêteté principale à éviter.

## Distribution (barre A — qualité de leçon)

| Classe | Nombre | Sens |
|---|---|---|
| **CERTIFIED** | **115** | prose solide, complète, bien placée ; utilisable immédiatement (action KEEP) |
| **USABLE** | **13** | bonne leçon, apprentissage réel possible ; défaut SECONDAIRE non bloquant = pratique exécutable manquante (action DEEPEN) : recursion, git-advanced, nextjs-foundations, nextjs-server-client-components, nextjs-rendering, design-patterns-intro, pandas-data-wrangling, observability-logging, logging-structured, deployment-secrets, ci-cd, monitoring-production, system-design-interview |
| **REWORK** | 0 | aucune leçon avec défaut de prose/exactitude bloquant |
| **RESTRUCTURE** | 0 | aucun problème de découpage/ordre cognitivement justifié (léger recouvrement docker-containers/ci-cd/monitoring avec leurs versions approfondies — rôle d'intro « Production & DevOps », pas de MERGE justifié) |
| **BLOCKED** | 0 | aucune leçon bloquée par un prérequis manquant |
| **MISSING** | 0 confirmé | couverture de domaine large (V45) ; aucun concept junior essentiel sans leçon satisfaisante détecté |

**128/128 lues et classées.** Aucune extrapolation.

## Distribution (barre B — praticabilité, la vérité qui compte)

La pratique de CODE EXÉCUTABLE réelle n'existe que pour **8 des 20 compétences** (V45, inchangé). Le
champ `practicable` des contrats (112/128 « avec exercice relié ») SURESTIME la pratique de domaine :
beaucoup de leçons IA/cloud sont reliées à des exercices THÉMATIQUES projetés vers `jsts` (ex. cloud-*
→ exos taggés arrays/conditions), pas à du code du domaine. La barre B honnête :

| Barre B | Domaines | Verdict |
|---|---|---|
| **Praticable (code réel)** | Fondations, Web Platform, Frontend/React, Web&backend, Data/SQL (mince), Python, Systèmes/Linux | ✅ |
| **Théorie-seule (pratique SIMULÉE ou absente)** | ML, IA appliquée, Cloud/AWS/Azure/IaC, Kubernetes, Docker, CI/CD, SRE, Sécurité, archi/patterns, DL, réseau | ◐/✗ |

## Par domaine (barre A)

| Domaine | Leçons | CERTIFIED | USABLE | Barre B (pratique code) |
|---|---|---|---|---|
| Fondations | 9 | 7 | 2 | ✅ (sauf recursion/git-advanced) |
| Web & backend | 6 | 6 | 0 | ✅ |
| Frontend : Web Platform | 7 | 7 | 0 | ✅ |
| Frontend & React | 12 | 9 | 3 | ✅ React / ◐ Next.js |
| Data & SQL | 8 | 7 | 1 | ✅ SQL (mince) / ◐ pandas |
| Software eng & architecture | 13 | 11 | 2 | ◐ (testing oui, patterns/archi non) |
| Python & ML | 8 | 8 | 0 | ✅ Python / ✗ ML |
| IA appliquée | 15 | 15 | 0 | ✗ (SIMULÉ) |
| Observabilité/SRE | 8 | 7 | 1 | ◐ (percentiles oui) |
| Systèmes & Linux | 5 | 5 | 0 | ✅ |
| Réseau | 5 | 5 | 0 | ◐ (exos projetés jsts) |
| Conteneurs & Docker | 5 | 5 | 0 | ✗ (labs SIMULÉS) |
| CI/CD & livraison | 4 | 4 | 0 | ◐ |
| Kubernetes | 6 | 6 | 0 | ✗ (labs SIMULÉS) |
| Cloud/AWS/Azure/IaC | 7 | 7 | 0 | ✗ (labs SIMULÉS) |
| Production & DevOps | 5 | 2 | 3 | ✗ |
| Portfolio & carrière | 5 | 4 | 1 | inline (narratif, OK) |

## Technologies majeures — GREEN / AMBER / RED

GREEN = apprendre maintenant (théorie + pratique code + niveau de sortie réel).
AMBER = bon pour apprendre, lacune identifiée (pratique code partielle/absente).
RED = ne pas utiliser encore comme cursus principal.

| Technologie | Théorie | Pratique | Ordre | Sortie | Verdict |
|---|---|---|---|---|---|
| JavaScript | FORT | FORT | ✅ | junior | **GREEN** |
| TypeScript | FORT | FORT | ✅ | junior | **GREEN** |
| React | FORT | BON | ✅ | junior | **GREEN** |
| Node/Express | FORT | BON | ✅ | junior | **GREEN** |
| Git | FORT | BON | ✅ | junior | **GREEN** |
| Linux | FORT | BON | ✅ | junior | **GREEN** |
| SQL/PostgreSQL | FORT | CORRECT (mince) | ✅ | junior- | **AMBER** |
| Python | FORT | BON | ✅ | junior | **GREEN** |
| Next.js | FORT | ✗ | ✅ | — | **AMBER** |
| Docker | FORT | SIMULÉ | ✅ | — | **AMBER** |
| Kubernetes | FORT | SIMULÉ | ✅ | — | **AMBER** |
| CI/CD | FORT | SIMULÉ | ✅ | — | **AMBER** |
| AWS / Azure | BON | SIMULÉ | ✅ | — | **AMBER** |
| Networking | BON | ◐ | ✅ | — | **AMBER** |
| Security | FORT | SIMULÉ | ✅ | — | **AMBER** |
| Machine Learning | FORT | ✗ | ✅ | — | **AMBER** |
| RAG | FORT | ✗ | ✅ | — | **AMBER** |
| LLM | FORT | ✗ | ✅ | — | **AMBER** |
| Agents | FORT | ✗ | ✅ | — | **AMBER** |
| Deep Learning | BON (intro) | ✗ | ✅ | — | **RED** |

## Definition of CERTIFIED (rappel, vérifié par test)
technicalAccuracy, conceptualAccuracy, mentalModelQuality, beginnerAccessibility, progression,
prerequisites, professionalUsefulness ≥ 3 ET aucune faiblesse bloquante. Les 128 la satisfont
(`tests/v45-1-ledger.test.mjs`). La barre B (pratique) n'est PAS dans cette définition — d'où les deux
barres.

## Conclusion clinique
Le CORPUS DE LEÇONS est certifié : 115 CERTIFIED + 13 USABLE, 0 REWORK/BLOCKED/MISSING. C'est un résultat
réel, pas complaisant : les 128 ont été lues et satisfont un seuil explicite. **MAIS** la certification
de LEÇON ne vaut pas certification de COMPÉTENCE : sur la barre B, seuls ~8 domaines sont réellement
praticables en code. Le corpus est un excellent support de COMPRÉHENSION sur tout le spectre, et un
support d'ACQUISITION complète (comprendre + faire) uniquement sur le tronc ingénierie logicielle.
