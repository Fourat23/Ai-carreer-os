import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Index des leçons de fond (curriculum/lessons/). Réutilisées par les jours.
const LESSONS = [
  { file: 'terminal-shell-filesystem', title: 'Terminal, shell et système de fichiers', group: 'Fondations' },
  { file: 'git-fundamentals', title: 'Git : les fondamentaux', group: 'Fondations' },
  { file: 'javascript-basics', title: 'JavaScript : les bases solides', group: 'Fondations' },
  { file: 'typescript-basics', title: 'TypeScript : typer pour fiabiliser', group: 'Fondations' },
  { file: 'algorithmic-thinking', title: 'La pensée algorithmique', group: 'Fondations' },
  { file: 'data-structures-intro', title: 'Structures de données : choisir son outil', group: 'Fondations' },
  { file: 'http-rest-json', title: 'HTTP, REST et JSON', group: 'Web & data' },
  { file: 'api-design-basics', title: 'Concevoir une API', group: 'Web & data' },
  { file: 'sql-foundations', title: 'SQL : les fondations', group: 'Web & data' },
  { file: 'clean-code', title: 'Clean code', group: 'Software engineering' },
  { file: 'testing-foundations', title: 'Tester son code', group: 'Software engineering' },
  { file: 'architecture-basics', title: 'Architecture logicielle : les bases', group: 'Software engineering' },
  { file: 'design-patterns-intro', title: 'Design patterns : introduction', group: 'Software engineering' },
  { file: 'python-foundations', title: 'Python : les fondations', group: 'Data / ML' },
  { file: 'statistics-for-ml', title: 'Statistiques pour le ML', group: 'Data / ML' },
  { file: 'machine-learning-basics', title: 'Machine learning : les bases', group: 'Data / ML' },
  { file: 'llm-fundamentals', title: 'LLM : comprendre les grands modèles', group: 'IA appliquée' },
  { file: 'rag-fundamentals', title: 'RAG : retrieval-augmented generation', group: 'IA appliquée' },
  { file: 'agents-fundamentals', title: 'Agents IA : fondamentaux', group: 'IA appliquée' },
  { file: 'ai-evaluation', title: 'Évaluer un système IA', group: 'IA appliquée' },
  { file: 'ai-security', title: 'Sécurité des systèmes IA', group: 'IA appliquée' },
];

export default function LessonsPage() {
  const groups = [...new Set(LESSONS.map((l) => l.group))];
  return (
    <>
      <h1>Leçons de fond</h1>
      <p className="subtitle">
        21 leçons approfondies et réutilisables. Chaque jour renvoie vers la leçon correspondante
        dans son bloc « Cours approfondi ». À lire pour la profondeur, à relire pour consolider.
      </p>
      {groups.map((g) => (
        <div key={g} className="card" style={{ marginBottom: 14 }}>
          <h3>{g}</h3>
          {LESSONS.filter((l) => l.group === g).map((l) => (
            <div key={l.file} style={{ padding: '5px 0' }}>
              <Link href={`/doc/lessons/${l.file}`}>{l.title}</Link>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
