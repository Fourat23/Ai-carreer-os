import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDocHtml, getProgram } from '@/lib/program';
import { annotateDayHtml, deriveDayPhases } from '@/lib/section-family';
import { HeroFocus, HeroFact, PhaseRail } from '@/app/ui';
import type { PracticeRef } from '@/lib/types';

// Libellés des dossiers de contenu, pour situer le document lu.
const KIND: Record<string, string> = {
  lessons: 'Leçon de fond', methodology: 'Méthodologie', rubrics: 'Grille d’évaluation',
  resources: 'Ressource', career: 'Carrière', 'year-overview': 'Vue d’ensemble',
};

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
  const raw = getDocHtml(rel);
  if (!raw) notFound();
  // V56 — le document reçoit la même annotation de sections que la Journée :
  // le PhaseRail y devient utilisable, et les leçons de fond (documents longs)
  // gagnent le repérage qui leur manquait. Le CONTENU n'est pas touché.
  const html = annotateDayHtml(raw);
  const phases = deriveDayPhases(html);
  // Titre et accroche : extraits du document réel, jamais inventés.
  const h1 = raw.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const docTitle = h1 ? h1[1].replace(/<[^>]+>/g, '').trim() : slug[slug.length - 1].replace(/-/g, ' ');
  const p1 = raw.replace(/<h1[\s\S]*?<\/h1>/, '').match(/<p[^>]*>([\s\S]*?)<\/p>/);
  const docLead = p1 ? p1[1].replace(/<[^>]+>/g, '').trim().slice(0, 240) : null;
  const words = raw.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

  // Pour une leçon de fond, expose la pratique associée (lecture seule, minimale).
  let practice: PracticeRef[] = [];
  if (slug[0] === 'lessons' && slug.length === 2) {
    const lesson = (getProgram().lessons ?? []).find((l) => l.slug === slug[1]);
    practice = lesson?.practiceRefs ?? [];
  }

  return (
    <div className="doc-view">
      <div className="doc-main">
        {/* Le titre visible vit dans le hero (h2) : un h1 accessible est exposé
            pour que la page garde une hiérarchie de titres correcte. */}
        <h1 className="sr-only">{docTitle}</h1>
        {/* Hero de document : le lecteur sait ce qu'il lit, d'où ça vient et
            combien de temps ça prend, avant la première ligne. */}
        <HeroFocus
          tone="calm"
          eyebrow={KIND[slug[0]] ?? 'Document'}
          title={docTitle}
          lead={docLead}
          meta={
            <>
              <HeroFact k="Longueur">{words.toLocaleString('fr-FR')} mots</HeroFact>
              <HeroFact k="Lecture">≈ {Math.max(1, Math.round(words / 200))} min</HeroFact>
              {phases.length > 1 && <HeroFact k="Sections">{phases.length}</HeroFact>}
              {practice.length > 0 && <HeroFact k="Pratique associée">{practice.length}</HeroFact>}
            </>
          }
        />

        <PhaseRail phases={phases} variant="strip" title="Sections" />

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
      </div>
      <aside className="doc-rail" aria-label="Sections du document">
        <PhaseRail phases={phases} variant="rail" title="Sections" />
      </aside>
    </div>
  );
}
