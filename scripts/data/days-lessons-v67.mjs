// V67 · P0 — RATTACHEMENT DES LEÇONS NON PROGRAMMÉES.
//
// Le CP0 a établi que 68 des 128 leçons ne sont programmées par AUCUNE des 365
// journées, dont les douze leçons de famille B — les mieux écrites du corpus.
// La cause est mécanique : `LESSON_BY_SKILL` ne couvre que 56 leçons, et
// aucune journée ne porte la compétence `cloud`.
//
// CE FICHIER EST ADDITIF. Le générateur fait l'UNION de cette liste avec les
// leçons que la journée liait déjà : aucune de ces entrées ne peut retirer un
// lien existant. C'est délibéré — un rattachement qui casserait un lien
// existant serait une régression déguisée en correction.
//
// ── RÈGLE DE RATTACHEMENT, ÉNONCÉE AVANT D'OUVRIR LES RÉSULTATS ──────────
//
//   Une leçon n'est rattachée qu'à une journée dont le SUJET est déjà le sien.
//   Aucune journée n'est déplacée, réécrite ou renommée pour accueillir une
//   leçon. Aucun thème n'est inventé.
//
// Ce que cette règle interdit, et qui aurait été facile : répartir les 68
// leçons sur les 365 journées jusqu'à ce que le compteur d'orphelines tombe à
// zéro. `scripts/v67-match.mjs` classait les journées par recouvrement de
// vocabulaire et proposait `cloud-fundamentals` → jour 78 « Architecture
// 3-tiers et MVC » à 82 %, `css-fundamentals` → jour 157 « Train/test split »
// et `html-semantic-structure` → jour 240 « Chunking avancé ». Trois
// coïncidences lexicales. Le rattachement ci-dessous est décidé par le TITRE
// et le sujet de la journée ; le score n'a servi qu'à confirmer.
//
// ── CE QUI RESTE NON PROGRAMMÉ, ET POURQUOI ─────────────────────────────
//
// 23 leçons ne trouvent aucune journée dont le sujet soit le leur, parce que
// le plan des 365 journées ne traite tout simplement pas ces sujets :
// Kubernetes (6), fournisseurs cloud et IaC (7), Next.js (4), CSS et
// responsive (4), stratégies de déploiement et reprise d'incident (2).
// Elles sont déclarées dans `REFERENCE_LIBRE` plus bas, en application du
// principe 10 du contrat gelé : « atteignable depuis au moins une journée, ou
// explicitement déclarée comme référence facultative — jamais orpheline par
// accident ». Les inventer une place aurait été le contraire de ce principe.

export const LESSONS_V67 = {
  // ── V73 · CP3 — le bloc Cloud / DevOps ──────────────────────────────────
  // Le CP0 et le CP2 ont montré le vrai trou : `cloud` est portée par 41 journées et
  // étiquetée par ZÉRO, et le cloud PROPREMENT DIT (fondamentaux, réseau, calcul et
  // stockage, fournisseurs, IaC, FinOps) était entièrement hors parcours. La chaîne de
  // prérequis de ces sept leçons est stricte : fondamentaux → {réseau, calcul/stockage}
  // → AWS → Azure → {IaC, FinOps}, et IaC/FinOps exigent en plus les leçons Kubernetes
  // du jour 321. Le bloc est donc posé là où le SUJET DE LA JOURNÉE le porte, dans cet
  // ordre, et nulle part ailleurs.
  //
  // j291 « Monolithe modulaire vs microservices » — le découpage pose la question « où
  // ça tourne, et qui l'exploite ». `docker-containers` y entre aussi : l'unité de
  // déploiement EST un conteneur, et cela corrige au passage un défaut relevé par V72,
  // où la totalité du curriculum Docker tombait sur la seule journée 320.
  // j293 « Exercice d'architecture » — un exercice d'architecture place du calcul, du
  // stockage et du réseau. Ce sont exactement ces deux leçons.
  293: ['cloud-networking.md', 'cloud-compute-storage.md'],
  // j303 « DocSense : architecture (ADRs) » — choisir un fournisseur EST une décision
  // d'architecture, et un ADR est l'endroit où on l'écrit avec ses alternatives.
  303: ['cloud-aws-core.md', 'cloud-azure-core.md'],
  // j325 « DocSense : coûts et observabilité » — le FinOps est la lecture économique de
  // l'observabilité. Prérequis `k8s-config-probes` enseigné au jour 321.
  325: ['cloud-finops.md'],
  // j326 « DocSense : CI complète » — une CI complète provisionne son environnement.
  // Prérequis `k8s-why-architecture` enseigné au jour 321.
  // ── Systèmes, Linux, réseau ────────────────────────────────────────────
  // Jour 72 « Terminal et Linux avancés : scripts, permissions, processus ».
  // Les trois leçons retenues SONT ce que la journée annonce. `linux-ssh-remote`
  // et `linux-services-systemd` ne le sont pas et ne sont pas rattachées ici.
  72: ['linux-filesystem-permissions.md', 'linux-processes-signals.md', 'linux-resources-io.md'],
  // Jour 71 « Réseau et web : DNS, TCP, TLS, HTTP/2 (culture solide) » —
  // correspondance de sujet terme à terme.
  71: ['networking-tcp-ip-model.md', 'networking-dns.md', 'networking-http-tls.md',
    'networking-addressing-routing.md'],
  // Jour 78 « Architecture 3-tiers et MVC » : le répartiteur de charge est le
  // composant qui sépare le tiers web du tiers applicatif. Rattachement unique.
  78: ['networking-proxy-loadbalancing.md'],

  // ── Web, API, contrats ─────────────────────────────────────────────────
  51: ['api-production-contracts.md'],                 // « REST design : concevoir une API qu'on comprend »
  76: ['breaking-changes-compatibility.md'],           // « Modularité et API design : concevoir des interfaces propres »

  // ── Données ────────────────────────────────────────────────────────────
  135: ['sql-performance-indexing.md'],                // « SQL avancé : index »
  136: ['database-transactions-concurrency.md'],       // « SQL avancé : transactions (ACID) »
  139: ['database-migrations.md'],                     // « ETL : robustesse et rejouabilité »

  // ── Plateforme web et front ────────────────────────────────────────────
  87: ['browser-dom-rendering.md'],                    // « Full-stack : introduction à React » — le DOM est le prérequis déclaré de react-fundamentals
  96: ['web-forms-validation.md'],                     // « Formulaires contrôlés et validation »
  97: ['typescript-frontend.md'],                      // « Module api.ts et gestion d'erreur centralisée »
  95: ['react-application-states.md'],                 // « Effets et fetch (useEffect) » — les quatre états d'écran
  102: ['frontend-performance.md'],                    // « Performance React : re-renders »
  103: ['react-accessibility.md', 'html-semantic-structure.md'], // « Accessibilité et UX de base » — le HTML sémantique EST le socle de l'a11y
  104: ['react-composition-architecture.md'],          // « Consolidation front + préparation Projet 3 »
  107: ['frontend-testing.md'],                        // « Tester des composants React »

  // ── Ingénierie logicielle et architecture ──────────────────────────────
  69: ['refactoring-legacy-code.md'],                  // « Consolidation mois 3 : refactor complet d'une API »
  74: ['technical-documentation.md'],                  // « Documentation technique : écrire pour être compris »
  81: ['technical-debt.md'],                           // « Trade-offs et anti-patterns : penser en ingénieur »
  290: ['async-messaging-queues.md'],                  // « Event-driven et queues »
  // V73 · CP3 — le découpage pose la question « où ça tourne, et qui l'exploite » : les
  // fondamentaux cloud entrent ici. `docker-containers` aussi — l'unité de déploiement EST
  // un conteneur — ce qui corrige au passage le défaut relevé par V72, où la TOTALITÉ du
  // curriculum Docker tombait sur la seule journée 320.
  291: ['system-design-scaling.md', 'distributed-systems-failures.md', 'docker-containers.md', 'cloud-fundamentals.md'], // « Monolithe modulaire vs microservices »

  // ── Observabilité et fiabilité ─────────────────────────────────────────
  // Le jour 79 enseigne déjà, dans son propre cours, les trois piliers, les
  // logs structurés, le correlation id, les SPOF, les health checks ET le
  // couple SLO / budget d'erreur. Les cinq leçons rattachées sont exactement
  // les sujets qu'il traite — et `observability-fundamentals` est la leçon qui
  // pose l'analogie bornée dont le CP2 a fait un modèle.
  79: ['observability-fundamentals.md', 'logging-structured.md', 'metrics-percentiles.md',
    'distributed-tracing.md', 'slo-error-budget.md'],
  297: ['distributed-tracing.md', 'metrics-percentiles.md'],  // « Observabilité d'une app IA »
  331: ['resilience-patterns.md'],                     // « DocSense : gestion d'erreur bout-en-bout »
  332: ['incident-response.md', 'postmortem-rca.md'],  // « DocSense : observabilité finale » — le seul point du parcours où l'exploitation est traitée

  // ── Conteneurs et livraison ────────────────────────────────────────────
  320: ['docker-build-dockerfile.md', 'docker-images-layers.md', 'docker-compose.md',
    'docker-networking-volumes.md', 'docker-production-hardening.md'], // « DocSense : dockerisation »

  // V72 · CP8 — le jour 321 fait PRATIQUER Kubernetes sans que rien ne l ENSEIGNE.
  //
  // Mesuré : `data/day-exercises.json` affecte à cette journée DIX exercices Kubernetes
  // (k8s-oom-risk, k8s-probe-role, k8s-rolling-available, k8s-pod-phase,
  // k8s-recovery-decision, k8s-ingress-backends…), alors que les seules leçons qu'elle
  // liait sont les trois leçons d'évaluation IA. Aucune des 365 journées n'enseignait
  // Kubernetes : l'apprenant devait répondre sur les sondes et les phases d'un Pod sans
  // avoir jamais lu ce qu'est un Pod.
  //
  // Les trois leçons ajoutées sont les seules du bloc Kubernetes dont TOUS les prérequis
  // sont satisfaits AVANT le jour 321 : `k8s-why-architecture` exige `docker-compose` et
  // `docker-production-hardening`, enseignés la veille au jour 320 ; `k8s-workloads` exige
  // `k8s-why-architecture` ; `k8s-config-probes` exige `k8s-workloads` et
  // `linux-resources-io`, enseigné au jour 72. L'ordre de la liste suit la chaîne.
  //
  // Les quatre autres insertions candidates ont été REFUSÉES par la même vérification :
  // le bloc cloud dépend de `cloud-fundamentals`, qui dépend de `docker-containers`,
  // enseigné seulement au jour 320 — le cloud n'est donc insérable nulle part avant.
  321: ['k8s-why-architecture.md', 'k8s-workloads.md', 'k8s-config-probes.md'], // « DocSense : jalon évaluation et reproductibilité »
  307: ['ci-cd-pipeline-anatomy.md'],                  // « DocSense : setup et CI vide »
  // V73 · CP3 — une CI complète provisionne son environnement : `iac-fundamentals` entre
  // ici. Son prérequis `k8s-why-architecture` est enseigné au jour 321.
  326: ['ci-cd-quality-gates-artifacts.md', 'iac-fundamentals.md'], // « DocSense : CI complète »
};

/**
 * Leçons que le plan des 365 journées ne traite nulle part.
 *
 * Elles restent listées et navigables sur `/lessons` : « non programmée » ne
 * veut pas dire « invisible ». Ce qui est vrai, c'est qu'un apprenant qui suit
 * les journées ne les rencontrera pas. Les déclarer ici les fait passer
 * d'orphelines PAR ACCIDENT à référence facultative ASSUMÉE — et les laisse
 * visibles comme dette, au lieu de les dissoudre dans une journée qui ne parle
 * pas de leur sujet.
 *
 * Combler ces cinq trous demanderait d'ajouter des journées au parcours. C'est
 * hors du périmètre de V67, que le contrat gelé interdit explicitement de
 * réordonner, et cela relève d'une décision sur le programme lui-même.
 */
export const REFERENCE_LIBRE = {
  'Kubernetes — aucune journée du parcours ne traite l\'orchestration': [
    'k8s-why-architecture.md', 'k8s-workloads.md', 'k8s-config-probes.md',
    'k8s-networking-services.md', 'k8s-security.md', 'k8s-troubleshooting.md',
  ],
  'Fournisseurs cloud et infrastructure as code — aucune journée ne porte la compétence cloud': [
    'cloud-fundamentals.md', 'cloud-compute-storage.md', 'cloud-networking.md',
    'cloud-aws-core.md', 'cloud-azure-core.md', 'cloud-finops.md', 'iac-fundamentals.md',
  ],
  'Next.js — le parcours enseigne React sans framework applicatif': [
    'nextjs-foundations.md', 'nextjs-rendering.md',
    'nextjs-server-client-components.md', 'nextjs-data-production.md',
  ],
  'CSS et mise en page — le parcours passe du DOM à React sans journée de style': [
    'css-fundamentals.md', 'css-flexbox.md', 'css-grid.md', 'responsive-design.md',
  ],
  'Exploitation — déploiement progressif et reprise après incident': [
    'deployment-strategies.md', 'release-incident-recovery.md',
  ],
  'Administration système — services et accès distant': [
    'linux-services-systemd.md', 'linux-ssh-remote.md',
  ],
};
