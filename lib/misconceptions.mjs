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
    wrong: 'Un Secret Kubernetes est chiffré par défaut.',
    right: 'Un Secret Kubernetes est encodé en base64, PAS chiffré par défaut : il faut activer le chiffrement au repos et restreindre les accès (RBAC, moindre privilège).',
    lessonRefs: ['k8s-security', 'deployment-secrets'],
    exerciseRefs: [],
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
    wrong: 'Deux variables corrélées prouvent que l\'une cause l\'autre.',
    right: 'La corrélation n\'implique pas la causalité : une variable tierce, un biais de sélection ou une fuite peuvent expliquer la corrélation sans lien causal.',
    lessonRefs: ['statistics-for-ml', 'machine-learning-basics'],
    exerciseRefs: [],
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
