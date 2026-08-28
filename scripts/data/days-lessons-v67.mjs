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
  291: ['system-design-scaling.md', 'distributed-systems-failures.md'], // « Monolithe modulaire vs microservices »

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
  307: ['ci-cd-pipeline-anatomy.md'],                  // « DocSense : setup et CI vide »
  326: ['ci-cd-quality-gates-artifacts.md'],           // « DocSense : CI complète »
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
