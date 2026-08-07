import { notFound } from 'next/navigation';
import { getDocHtml, getProgram } from '@/lib/program';
import type { PracticeRef } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Rend n'importe quel document du curriculum : /doc/methodology/how-to-learn,
// /doc/rubrics/skills-scorecard, etc. Restreint aux dossiers de contenu connus.
const ALLOWED = new Set(['methodology', 'rubrics', 'resources', 'career', 'lessons', 'year-overview']);

// V27 : libellés et routes de la « Pratique associée » (practiceRefs). Les routes
// pointent vers des surfaces EXISTANTES ; un Lab inconnu n'est pas rendu comme lien.
const LAB_ROUTES: Record<string, string> = {
  kubernetes: '/kubernetes',
  security: '/security',
  'cloud-architecture': '/cloud-lab',
  pipeline: '/pipelines',
};
const KIND_LABEL: Record<PracticeRef['kind'], string> = {
  exercise: 'Exercice',
  lab: 'Lab',
  mission: 'Mission',
  playbook: 'Playbook',
};

function hrefFor(ref: PracticeRef): string | null {
  if (ref.kind === 'exercise') return `/lab/${ref.id}`;
  if (ref.kind === 'mission') return `/missions/${ref.id}`;
  if (ref.kind === 'lab') return LAB_ROUTES[ref.id] ?? null;
  return null; // playbook : pas de route dédiée → non lié
}

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (!slug || slug.length < 1 || !ALLOWED.has(slug[0])) notFound();
  // Empêche la traversée de répertoire.
  if (slug.some((s) => s.includes('..') || s.includes('/') || s.includes('\\'))) notFound();
  const rel = slug.join('/') + '.md';
  const html = getDocHtml(rel);
  if (!html) notFound();

  // Pour une leçon de fond, expose la pratique associée (lecture seule, minimale).
  let practice: PracticeRef[] = [];
  if (slug[0] === 'lessons' && slug.length === 2) {
    const lesson = (getProgram().lessons ?? []).find((l) => l.slug === slug[1]);
    practice = lesson?.practiceRefs ?? [];
  }

  return (
    <>
      <article className="prose reading" dangerouslySetInnerHTML={{ __html: html }} />
      {practice.length > 0 && (
        <aside className="lesson-practice" aria-label="Pratique associée">
          <h2>🎯 Pratique associée</h2>
          <p className="lesson-practice__hint">
            Mets en pratique cette leçon avec ces activités (exercices, Labs et missions existants).
          </p>
          <ul>
            {practice.map((ref, i) => {
              const href = hrefFor(ref);
              const label = `${KIND_LABEL[ref.kind]} · ${ref.id}`;
              return (
                <li key={`${ref.kind}-${ref.id}-${i}`}>
                  {href ? <a href={href}>{label}</a> : <span>{label}</span>}
                </li>
              );
            })}
          </ul>
        </aside>
      )}
    </>
  );
}
