import Link from 'next/link';
import { SurfaceHead, ContextLine } from '@/app/ui';
import { getProgram } from '@/lib/program';
import { readProgress } from '@/lib/progress-server';
import LessonsCatalog, { type LessonRow } from './LessonsCatalog';

export const dynamic = 'force-dynamic';

// Ordre recommandé des catégories (suit la progression du programme).
const CAT_ORDER = [
  'Fondations',
  'Web & backend',
  'Frontend : Web Platform',
  'Frontend & React',
  'Data & SQL',
  'Software engineering & architecture',
  'Python & ML',
  'IA appliquée',
  'Production & DevOps',
  'Portfolio & carrière',
];

// V58 · CP6 — Grammaire de catalogue `cat-*`. Une catégorie n'a ni action
// autonome ni cycle de vie propre : ce n'est pas une carte, c'est un groupe.
//
// V62 · CP3 — La page recevait la bonne composition mais aucune navigation :
// 18 762 px à 375 px, dominance 0,90, et rien pour remonter vers l'index une
// fois entré dans les 128 leçons. Elle gagne une ligne de contexte, une SUITE
// réelle et un catalogue navigable (`LessonsCatalog`). Le corpus est intact :
// les 128 leçons restent rendues et atteignables.
export default function LessonsPage() {
  const program = getProgram();
  const lessons = program.lessons ?? [];
  const progress = readProgress();
  const skillName = (id: string) => program.skills.find((s) => s.id === id)?.name ?? id;

  const byCat = new Map<string, typeof lessons>();
  for (const l of lessons) {
    const cat = l.cat ?? 'Autres';
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat)!.push(l);
  }
  const cats = [
    ...CAT_ORDER.filter((c) => byCat.has(c)),
    ...[...byCat.keys()].filter((c) => !CAT_ORDER.includes(c)),
  ];
  const totalMin = lessons.reduce((t, l) => t + (l.min ?? 0), 0);

  // ── LA SUITE, DÉRIVÉE DU CORPUS ────────────────────────────────────────
  // La journée courante porte une compétence ; la leçon suivante est la
  // première leçon de cette compétence, dans l'ordre recommandé. Rien n'est
  // inventé : si aucune leçon ne couvre la compétence du jour, on retombe sur
  // la première leçon de la première catégorie — l'ordre que la page annonce
  // déjà comme « l'ordre recommandé ».
  const days = program.days ?? [];
  const currentDay = days.find(
    (d: { day: number }) => (progress.days?.[String(d.day)]?.status ?? 'todo') !== 'done',
  ) ?? days[0];
  const daySkill = currentDay?.skill;
  const nextLesson = (daySkill && lessons.find((l) => (l.skills ?? []).includes(daySkill)))
    ?? (cats[0] ? byCat.get(cats[0])![0] : undefined);
  const nextReason = daySkill && nextLesson && (nextLesson.skills ?? []).includes(daySkill)
    ? `compétence du jour ${currentDay.day} — ${currentDay.skillName ?? daySkill}`
    : 'première leçon de l’ordre recommandé';

  const rows: LessonRow[] = lessons.map((l) => ({
    slug: l.slug, title: l.title, cat: l.cat ?? 'Autres',
    level: l.level ?? 2, min: l.min ?? 0,
    skillNames: (l.skills ?? []).map(skillName),
  }));

  return (
    <div className="cat-view page-wide">
      <ContextLine
        label="État du corpus de leçons"
        facts={[
          { k: 'Leçons', v: `${lessons.length}`, here: true },
          { k: 'Catégories', v: `${cats.length}` },
          { k: 'Volume', v: `≈ ${Math.round(totalMin / 60)} h` },
          { k: 'Durée moyenne', v: `${Math.round(totalMin / Math.max(1, lessons.length))} min` },
        ]}
      />

      <SurfaceHead
        kind="catalog"
        eyebrow={<>Apprendre <span className="sep">/</span> théorie réutilisable</>}
        title={`${lessons.length} leçons de fond`}
        lead="L'ordre dans chaque catégorie est l'ordre recommandé — il suit la progression des douze mois. Chaque journée renvoie vers les siennes."
        facts={[
          { k: 'Volume', v: `≈ ${Math.round(totalMin / 60)} h` },
          { k: 'Catégories', v: cats.length },
          { k: 'Durée moyenne', v: `${Math.round(totalMin / Math.max(1, lessons.length))} min` },
        ]}
      />

      {nextLesson && (
        <section className="tb-next" aria-label="Prochaine action">
          <div className="tb-next-body">
            <span className="tb-next-k">Par où commencer</span>
            <p className="tb-next-t">{nextLesson.title}</p>
            <p className="tb-next-d">
              {nextReason} <span className="sep">/</span> ~{nextLesson.min} min
            </p>
          </div>
          <Link className="btn cta" href={`/doc/lessons/${nextLesson.slug}`}>Lire la leçon</Link>
        </section>
      )}

      <LessonsCatalog lessons={rows} cats={cats} />
    </div>
  );
}
