// Registre de MISCONCEPTIONS (idées fausses) fréquentes — PUR. Chaque entrée relie
// une idée fausse RÉELLE (tirée du corpus enseigné) à sa correction conceptuelle et
// à des ressources de remédiation CIBLÉES (leçons/exercices précis), au lieu d'un
// vague « relis le cours ». Réutilisable par le read-model (learning-experience) ;
// aucune vérité propre, aucune écriture, aucun second moteur.

export const MISCONCEPTIONS = [
  {
    id: 'retry-equals-idempotence',
    skill: 'archi',
    wrong: 'Réessayer suffit ; pas besoin de rendre le traitement idempotent.',
    right: 'Un retry PEUT dupliquer un effet (livraison « au moins une fois »). L\'idempotence rend la répétition SANS effet supplémentaire (dédup par identifiant).',
    lessonRefs: ['async-messaging-queues', 'api-production-contracts'],
    exerciseRefs: ['queue-idempotent-consumer', 'retry-backoff-delay', 'dlq-routing'],
  },
  {
    id: 'percentile-equals-mean',
    skill: 'se',
    wrong: 'Le p95 est une sorte de moyenne de la latence.',
    right: 'Un percentile n\'est pas une moyenne : le p95 est la valeur sous laquelle tombent 95 % des mesures ; il révèle les pires cas que la moyenne masque.',
    lessonRefs: ['metrics-percentiles'],
    exerciseRefs: ['latency-percentiles'],
  },
  {
    id: 'index-speeds-everything',
    skill: 'sql',
    wrong: 'Ajouter un index accélère toutes les requêtes.',
    right: 'Un index accélère surtout les lectures ciblées sur la colonne indexée, au prix d\'un surcoût en écriture et en stockage ; il n\'aide pas un problème de VOLUME de requêtes (N+1).',
    lessonRefs: ['sql-performance-indexing'],
    exerciseRefs: ['fix-nplus1', 'sql-inner-join'],
  },
  {
    id: 'k8s-secret-encrypted',
    skill: 'secu',
    wrong: 'Un Secret Kubernetes est chiffré par défaut ; un secret et une configuration se gèrent pareil.',
    right: 'Un Secret Kubernetes est encodé en base64, PAS chiffré par défaut : il faut activer le chiffrement au repos et restreindre les accès (RBAC, moindre privilège). Une donnée sensible ne va jamais dans une ConfigMap.',
    lessonRefs: ['k8s-security', 'deployment-secrets'],
    exerciseRefs: ['k8s-secret-placement', 'sec-classify-sensitive'],
  },
  {
    id: 'useeffect-is-lifecycle',
    skill: 'jsts',
    wrong: 'useEffect est un « lifecycle » générique équivalent à componentDidMount/Update.',
    right: 'useEffect synchronise un EFFET avec des dépendances ; il se redéclenche à chaque changement de dépendance. Une dépendance instable relance l\'effet en boucle — ce n\'est pas un simple hook de cycle de vie.',
    lessonRefs: ['react-hooks-effects'],
    exerciseRefs: ['react-debug-list', 'react-debug-greeting'],
  },
  {
    id: 'retrieval-equals-generation',
    skill: 'rag',
    wrong: 'Si un RAG répond faux, c\'est le modèle de génération qu\'il faut corriger.',
    right: 'La panne peut être dans la RÉCUPÉRATION : si la bonne source n\'est pas remontée, une meilleure génération ne corrige rien. Séparer récupération et génération avant de conclure.',
    lessonRefs: ['rag-fundamentals', 'retrieval-reranking'],
    exerciseRefs: ['rag-failure-locate'],
  },
  {
    id: 'correlation-equals-causation',
    skill: 'ml',
    wrong: 'Deux variables corrélées prouvent que l\'une cause l\'autre ; un symptôme est la cause racine.',
    right: 'La corrélation n\'implique pas la causalité : une variable tierce, un biais de sélection ou une fuite peuvent expliquer la corrélation sans lien causal. De même, un symptôme observable n\'est pas la cause racine.',
    lessonRefs: ['statistics-for-ml', 'postmortem-rca'],
    exerciseRefs: ['rca-classify-cause'],
  },
  {
    id: 'wildcard-is-convenient',
    skill: 'secu',
    wrong: 'Une permission large (wildcard *) est acceptable si elle simplifie la configuration.',
    right: 'Le moindre privilège demande d\'accorder EXACTEMENT les actions nécessaires. Un wildcard élargit la surface d\'attaque : une identité compromise hérite de tout. On retire les actions superflues, on n\'ajoute pas de joker par confort.',
    lessonRefs: ['k8s-security', 'authentication'],
    exerciseRefs: ['cloud-iam-wildcard', 'cloud-iam-excess-actions', 'sec-rbac-wildcard', 'sec-least-privilege'],
  },
  {
    id: 'replicas-equals-ha',
    skill: 'cloud',
    wrong: 'Ajouter des réplicas garantit la haute disponibilité.',
    right: 'La disponibilité dépend des DOMAINES DE PANNE : trois réplicas dans une seule zone tombent ensemble. Il faut répartir (multi-AZ), éviter les SPOF et garantir une capacité minimale pendant les mises à jour.',
    lessonRefs: ['system-design-scaling', 'cloud-fundamentals'],
    exerciseRefs: ['k8s-replicas-ha', 'cloud-multi-az', 'cloud-spof-detect', 'k8s-rolling-available'],
  },
  {
    id: 'scaling-adds-resources',
    skill: 'cloud',
    wrong: 'Mettre à l\'échelle, c\'est ajouter de la RAM et du CPU à la machine.',
    right: 'C\'est le scaling VERTICAL (limité, avec redémarrage). Le scaling HORIZONTAL ajoute des instances mais suppose des composants sans état ; un composant à état mal réparti ne se met pas à l\'échelle horizontalement sans stratégie dédiée.',
    lessonRefs: ['system-design-scaling', 'cloud-compute-storage'],
    exerciseRefs: ['cloud-scaling-choice', 'cloud-scaling-kind', 'cloud-stateful-autoscale'],
  },
  {
    id: 'backup-equals-recovery',
    skill: 'cloud',
    wrong: 'Une sauvegarde qui existe suffit à couvrir la reprise après sinistre.',
    right: 'Ce qui compte est le RPO (perte de données tolérée) et le RTO (délai de reprise) : une sauvegarde trop ancienne viole le RPO, et une restauration jamais testée n\'est pas une garantie.',
    lessonRefs: ['release-incident-recovery', 'cloud-fundamentals'],
    exerciseRefs: ['cloud-rpo-meets', 'cloud-rpo-met'],
  },
  {
    id: 'latest-tag-is-fine',
    skill: 'secu',
    wrong: 'Utiliser une image :latest ou une dépendance non épinglée est sans conséquence.',
    right: 'Sans épinglage par digest/version, le build n\'est ni reproductible ni auditable : le contenu peut changer sous vos pieds. On épingle par digest et on surveille les diffs de lockfile pour la chaîne d\'approvisionnement.',
    lessonRefs: ['docker-production-hardening', 'k8s-security'],
    exerciseRefs: ['k8s-image-pinned', 'sec-image-digest', 'sec-lockfile-diff'],
  },
  {
    id: 'auth-401-equals-403',
    skill: 'http',
    wrong: '401 et 403 sont interchangeables quand l\'accès échoue.',
    right: '401 = non AUTHENTIFIÉ (identité inconnue) ; 403 = authentifié mais non AUTORISÉ. On renvoie parfois 404 pour ne pas révéler l\'existence d\'une ressource. Le code choisi dépend de ce que le client sait déjà.',
    lessonRefs: ['authentication', 'http-rest-json'],
    exerciseRefs: ['auth-status-decision'],
  },
  {
    id: 'offset-pagination-scales',
    skill: 'http',
    wrong: 'La pagination par offset (LIMIT/OFFSET) passe à l\'échelle comme n\'importe quelle autre.',
    right: 'Un grand offset force à parcourir puis jeter toutes les lignes précédentes (coût croissant), et une insertion concurrente décale les pages. La pagination par CURSEUR reste stable et bornée.',
    lessonRefs: ['api-production-contracts'],
    exerciseRefs: ['api-pagination-choice'],
  },
  {
    id: 'additive-change-is-safe',
    skill: 'http',
    wrong: 'Modifier un contrat d\'API ou un schéma est sans risque tant qu\'on « ajoute » quelque chose.',
    right: 'Ajouter un champ OPTIONNEL est compatible ; retirer/renommer un champ, rendre obligatoire, ou restreindre un type CASSE les clients existants. La compatibilité se raisonne côté consommateur, pas côté producteur.',
    lessonRefs: ['breaking-changes-compatibility', 'database-migrations'],
    exerciseRefs: ['breaking-change-classify', 'migration-compat'],
  },
  {
    id: 'overfit-equals-bad-data',
    skill: 'ml',
    wrong: 'Un mauvais score en test signifie forcément des données de mauvaise qualité.',
    right: 'L\'écart entre score d\'entraînement et score de validation distingue overfitting (mémorise, généralise mal) et underfitting (trop simple). Le diagnostic vient du GAP, pas d\'une intuition sur les données.',
    lessonRefs: ['machine-learning-basics', 'model-evaluation'],
    exerciseRefs: ['ml-overfit-diagnose'],
  },
  {
    id: 'leakage-is-rare',
    skill: 'ml',
    wrong: 'La fuite de données (leakage) est rare et facile à voir.',
    right: 'La fuite est fréquente et discrète : variable dérivée de la cible, information du futur, ou split mal choisi (aléatoire là où il faut un split temporel). Un score « trop beau » est un signal de fuite à investiguer.',
    lessonRefs: ['machine-learning-basics', 'feature-engineering'],
    exerciseRefs: ['ml-data-leakage', 'ml-split-choice'],
  },
  {
    id: 'accuracy-is-enough',
    skill: 'evalia',
    wrong: 'L\'accuracy suffit pour juger un modèle de classification.',
    right: 'Sur des classes déséquilibrées, l\'accuracy trompe (prédire « majorité » donne un score élevé et inutile). Précision, rappel, F1 et le COÛT des erreurs guident le choix selon l\'usage.',
    lessonRefs: ['model-evaluation', 'ai-evaluation'],
    exerciseRefs: ['ml-metric-choice'],
  },
  {
    id: 'breaker-equals-retry',
    skill: 'archi',
    wrong: 'Un circuit breaker, c\'est juste réessayer plusieurs fois.',
    right: 'Un breaker OUVRE le circuit pour ARRÊTER d\'appeler un service en panne et lui laisser récupérer (évite l\'effondrement). Le retry, lui, relance : les deux se complètent mais ne jouent pas le même rôle.',
    lessonRefs: ['resilience-patterns', 'distributed-systems-failures'],
    exerciseRefs: ['circuit-breaker-state', 'retry-should'],
  },
  {
    id: 'replica-reads-are-fresh',
    skill: 'archi',
    wrong: 'Une lecture sur une réplique renvoie toujours des données à jour.',
    right: 'La réplication a un DÉLAI : une réplique peut servir une valeur périmée juste après une écriture sur le primaire. Il faut choisir entre cohérence forte et lecture sur réplique selon le besoin.',
    lessonRefs: ['database-transactions-concurrency', 'system-design-scaling'],
    exerciseRefs: ['replication-lag-reason', 'db-concurrency-risk'],
  },
  {
    id: 'more-alerts-is-better',
    skill: 'se',
    wrong: 'Plus on a d\'alertes, meilleure est l\'observabilité.',
    right: 'Une alerte doit être ACTIONNABLE (elle exige une action précise). Trop d\'alertes bruyantes créent la fatigue d\'alerte et masquent les vrais incidents. On mesure d\'abord les bons signaux, on n\'accumule pas les notifications.',
    lessonRefs: ['observability-fundamentals', 'monitoring-production'],
    exerciseRefs: ['alert-actionable', 'cloud-observability-gap', 'incident-severity'],
  },
  {
    id: 'injection-is-input-filtering',
    skill: 'secu',
    wrong: 'Filtrer les entrées suffit à empêcher l\'injection de prompt.',
    right: 'Le cœur du problème est la confusion entre INSTRUCTIONS de confiance et DONNÉES non fiables : une donnée récupérée peut contenir des ordres. On isole les rôles et on valide les sorties structurées au lieu de faire confiance au texte.',
    lessonRefs: ['prompt-injection-defense', 'ai-security'],
    exerciseRefs: ['prompt-injection-classify', 'rag-structured-validate'],
  },
  {
    id: 'agent-loop-self-stops',
    skill: 'agents',
    wrong: 'Un agent qui boucle finira bien par s\'arrêter tout seul.',
    right: 'Rien ne borne une boucle par défaut : il faut un BUDGET (étapes/coût), une détection de boucle, et une escalade vers un humain (human-in-the-loop) quand la confiance ou le budget s\'épuisent.',
    lessonRefs: ['agents-fundamentals', 'agent-workflows-orchestration'],
    exerciseRefs: ['agent-loop-detect', 'agent-retry-policy', 'agent-hitl-decision'],
  },
  {
    id: 'exit-output-equals-success',
    skill: 'gitlinux',
    wrong: 'Une commande qui affiche un résultat a réussi.',
    right: 'Le SUCCÈS se lit dans le code de sortie (0 = ok), pas dans la sortie affichée. Un pipeline peut imprimer du texte puis échouer ; sans vérifier le code de sortie (et pipefail), on rate l\'erreur.',
    lessonRefs: ['terminal-shell-filesystem', 'ci-cd'],
    exerciseRefs: ['sh-exit-retry'],
  },
];

const isStr = (v) => typeof v === 'string';

/** Liste les misconceptions, optionnellement filtrées par compétence de programme. */
export function listMisconceptions(skill) {
  if (!isStr(skill)) return [...MISCONCEPTIONS];
  return MISCONCEPTIONS.filter((m) => m.skill === skill);
}

/** Remédiation ciblée pour une misconception donnée (ou null). PUR. */
export function remediateMisconception(id) {
  const m = MISCONCEPTIONS.find((x) => x.id === id);
  if (!m) return null;
  return { id: m.id, skill: m.skill, right: m.right, lessonRefs: [...m.lessonRefs], exerciseRefs: [...m.exerciseRefs] };
}
