// Les 20 compétences évaluées de 0 à 5 pendant toute l'année.
// L'id est utilisé partout (jours, progress.json, UI). Ne pas renommer les ids.
export const SKILLS = [
  { id: 'algo', name: 'Algorithmie' },
  { id: 'ds', name: 'Structures de données' },
  { id: 'jsts', name: 'JavaScript / TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'gitlinux', name: 'Git / Linux' },
  { id: 'http', name: 'HTTP / API' },
  { id: 'sql', name: 'SQL / Data' },
  { id: 'se', name: 'Software engineering' },
  { id: 'archi', name: 'Architecture' },
  { id: 'patterns', name: 'Design patterns' },
  { id: 'ml', name: 'Machine learning' },
  { id: 'dl', name: 'Deep learning' },
  { id: 'llm', name: 'LLM' },
  { id: 'rag', name: 'RAG' },
  { id: 'agents', name: 'Agents' },
  { id: 'evalia', name: 'Évaluation IA' },
  { id: 'secu', name: 'Sécurité' },
  { id: 'cloud', name: 'Cloud / DevOps' },
  { id: 'comm', name: 'Communication technique' },
  { id: 'autonomy', name: 'Autonomie projet' },
];

// Niveaux génériques de la grille 0-5 (détaillée par compétence dans
// curriculum/rubrics/skills-scorecard.md).
export const SCORE_LEVELS = [
  '0 — Jamais pratiqué',
  '1 — Notions : je reconnais les concepts mais je ne produis rien seul',
  '2 — Guidé : je produis avec un tutoriel ou de l’aide',
  '3 — Autonome sur cas standard : je produis seul un résultat correct',
  '4 — Solide : je gère les cas non triviaux, je debugge, j’explique mes choix',
  '5 — Employable+ : je conçois, je justifie les trade-offs, je peux l’enseigner',
];
