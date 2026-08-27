import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDocHtml, getProgram } from '@/lib/program';
import { annotateDayHtml, deriveDayPhases } from '@/lib/section-family';
import { decodeEntities } from '@/lib/doc-sections';
import { SurfaceHead, PhaseRail, ContextLine } from '@/app/ui';
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
  // V59 · CP11 — Le `h1` du document est retiré de la prose : la page en
  // expose déjà un (accessible) et le hero affiche le même texte juste
  // au-dessus. Il était donc écrit deux fois, à deux rangs différents.
  const html = annotateDayHtml(raw).replace(/<h1\b[^>]*>[\s\S]*?<\/h1>\s*/, '');
  const phases = deriveDayPhases(html);
  // Titre et accroche : extraits du document réel, jamais inventés.
  // V59 · CP11 — Le CP2 avait décodé les entités des intitulés de sections mais
  // PAS celles du hero : l'accroche affichait « qu&#39;est-ce que c&#39;est »
  // en toutes lettres sur les leçons de fond. Même fonction, même endroit :
  // le texte est décodé une fois, après le retrait des balises.
  const h1 = raw.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const docTitle = h1
    ? decodeEntities(h1[1].replace(/<[^>]+>/g, '')).trim()
    : slug[slug.length - 1].replace(/-/g, ' ');
  const p1 = raw.replace(/<h1[\s\S]*?<\/h1>/, '').match(/<p[^>]*>([\s\S]*?)<\/p>/);
  const docLead = p1 ? decodeEntities(p1[1].replace(/<[^>]+>/g, '')).trim().slice(0, 240) : null;
  const words = raw.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

  // Pour une leçon de fond, expose la pratique associée (lecture seule, minimale).
  let practice: PracticeRef[] = [];
  if (slug[0] === 'lessons' && slug.length === 2) {
    const lesson = (getProgram().lessons ?? []).find((l) => l.slug === slug[1]);
    practice = lesson?.practiceRefs ?? [];
  }

  // ── V62 · CP10 — LA SEULE ROUTE DE CLASSE C DU PRODUIT ─────────────────
  //
  // Mesuré au CP0, et vu sur la capture avant d'être mesuré : le hero flottait
  // dans une carte d'environ 630 px au milieu d'un canevas de 1 170, titre
  // cassé sur quatre lignes, corps du document dessous à une autre mesure.
  // Le `h1` était HORS ÉCRAN (`sr-only`) — exactement le défaut que V59 avait
  // introduit sur /capstones et que V61 y a corrigé ; il avait survécu ici.
  // Conséquence chiffrée : ratio typographique 2,24, seule route du produit
  // sous 3,3, parce que le titre visible n'était qu'un h2 à l'étroit.
  //
  // Elle reçoit la bande d'identité partagée — donc un h1 RÉEL et visible à
  // l'échelle display — la ligne de contexte, et une suite.
  //
  // La suite d'un document dépend de ce qu'il est : une leçon de fond mène à
  // sa pratique associée, qui est une donnée réelle du corpus ; les autres
  // documents ramènent à l'index de leur famille. Aucun lien inventé : une
  // référence sans route (playbook) n'en produit pas.
  const firstPractice = practice.map((r) => ({ ref: r, href: hrefFor(r) }))
    .find((x) => x.href !== null);
  const FAMILY_INDEX: Record<string, { href: string; label: string }> = {
    lessons: { href: '/lessons', label: 'Toutes les leçons de fond' },
    methodology: { href: '/guide', label: 'Le mode d’emploi du programme' },
    resources: { href: '/resources', label: 'Toutes les ressources' },
    career: { href: '/career', label: 'Les documents de carrière' },
    rubrics: { href: '/reviews', label: 'Les évaluations' },
    'year-overview': { href: '/parcours', label: 'Le parcours complet' },
  };
  const family = FAMILY_INDEX[slug[0]];
  const next = firstPractice
    ? { href: firstPractice.href!, label: `${KIND_LABEL[firstPractice.ref.kind]} · ${firstPractice.ref.id}`,
        hint: 'Mettre cette leçon en pratique tout de suite.' }
    : family
      ? { href: family.href, label: family.label, hint: 'Revenir à la séquence.' }
      : null;

  return (
    <div className="doc-view">
      <div className="doc-main">
        <ContextLine
          label="Position dans le corpus"
          facts={[
            { k: 'Document', v: KIND[slug[0]] ?? 'Document', here: true },
            { k: 'Longueur', v: `${words.toLocaleString('fr-FR')} mots` },
            { k: 'Lecture', v: `≈ ${Math.max(1, Math.round(words / 200))} min` },
            ...(phases.length > 1 ? [{ k: 'Sections', v: `${phases.length}` }] : []),
            ...(practice.length > 0 ? [{ k: 'Pratique associée', v: `${practice.length}` }] : []),
          ]}
        />
        <SurfaceHead
          kind="editorial"
          eyebrow={KIND[slug[0]] ?? 'Document'}
          title={docTitle}
          lead={docLead}
          facts={[
            { k: 'Longueur', v: `${words.toLocaleString('fr-FR')} mots` },
            { k: 'Lecture', v: `≈ ${Math.max(1, Math.round(words / 200))} min` },
            ...(phases.length > 1 ? [{ k: 'Sections', v: phases.length }] : []),
          ]}
        />

        {next && (
          <section className="tb-next" aria-label="Prochaine action">
            <div className="tb-next-body">
              <span className="tb-next-k">Ensuite</span>
              <p className="tb-next-t">{next.label}</p>
              <p className="tb-next-d">{next.hint}</p>
            </div>
            <Link className="btn cta" href={next.href}>Ouvrir</Link>
          </section>
        )}

        <PhaseRail phases={phases} variant="strip" title="Sections" />

        <article className="prose reading" dangerouslySetInnerHTML={{ __html: html }} />
      {practice.length > 0 && (
        <aside className="lesson-practice" aria-label="Pratique associée">
          <h2>Pratique associée</h2>
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
