import Link from 'next/link';
import { getProgram } from '@/lib/program';

export const dynamic = 'force-dynamic';

// Regroupement thématique des leçons (par préfixe de slug connu).
function groupOf(slug: string): string {
  if (['terminal-shell-filesystem', 'git-fundamentals', 'git-advanced', 'javascript-basics', 'typescript-basics', 'async-javascript', 'algorithmic-thinking', 'recursion', 'data-structures-intro'].includes(slug)) return 'Fondations';
  if (['http-rest-json', 'api-design-basics', 'sql-foundations', 'express-backend', 'authentication', 'caching-performance', 'react-fundamentals', 'react-hooks-effects'].includes(slug)) return 'Web / API / Data';
  if (['clean-code', 'testing-foundations', 'debugging-methodology', 'refactoring', 'architecture-basics', 'design-patterns-intro', 'observability-logging', 'error-handling'].includes(slug)) return 'Software engineering / Architecture';
  if (['python-foundations', 'pandas-data-wrangling', 'data-cleaning-quality', 'etl-pipelines', 'statistics-for-ml', 'machine-learning-basics', 'feature-engineering', 'model-evaluation', 'neural-networks', 'transformers'].includes(slug)) return 'Python / Data / ML';
  if (['docker-containers', 'ci-cd', 'deployment-secrets', 'monitoring-production'].includes(slug)) return 'DevOps / Cloud / Production';
  if (['readme-documentation', 'technical-storytelling', 'portfolio-github', 'cv-linkedin', 'interview-preparation', 'system-design-interview'].includes(slug)) return 'Portfolio / Carrière';
  return 'IA appliquée (LLM / RAG / agents / éval / sécurité)';
}

const ORDER = [
  'Fondations', 'Web / API / Data', 'Software engineering / Architecture',
  'Python / Data / ML', 'IA appliquée (LLM / RAG / agents / éval / sécurité)',
  'DevOps / Cloud / Production', 'Portfolio / Carrière',
];

export default function LessonsPage() {
  const lessons = getProgram().lessons ?? [];
  const groups = new Map<string, { slug: string; title: string }[]>();
  for (const l of lessons) {
    const g = groupOf(l.slug);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(l);
  }
  const sorted = ORDER.filter((g) => groups.has(g));

  return (
    <>
      <h1>Leçons de fond</h1>
      <p className="subtitle">
        {lessons.length} leçons approfondies et réutilisables. Chaque jour renvoie vers la ou les leçons
        correspondantes dans son bloc « Cours approfondi ». À lire pour la profondeur, à relire pour consolider.
      </p>
      {sorted.map((g) => (
        <div key={g} className="card" style={{ marginBottom: 14 }}>
          <h3>{g}</h3>
          {groups.get(g)!.map((l) => (
            <div key={l.slug} style={{ padding: '5px 0' }}>
              <Link href={`/doc/lessons/${l.slug}`}>{l.title}</Link>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
