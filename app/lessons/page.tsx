import Link from 'next/link';
import { getProgram } from '@/lib/program';

export const dynamic = 'force-dynamic';

// Ordre recommandé des catégories (suit la progression du programme).
const CAT_ORDER = [
  'Fondations',
  'Web & backend',
  'Data & SQL',
  'Software engineering & architecture',
  'Python & ML',
  'IA appliquée',
  'Production & DevOps',
  'Portfolio & carrière',
];

const LEVEL_LABEL: Record<number, { label: string; cls: string }> = {
  1: { label: 'débutant', cls: 'ok' },
  2: { label: 'intermédiaire', cls: 'accent' },
  3: { label: 'avancé', cls: 'review' },
};

export default function LessonsPage() {
  const program = getProgram();
  const lessons = program.lessons ?? [];
  const skillName = (id: string) => program.skills.find((s) => s.id === id)?.name ?? id;

  const byCat = new Map<string, typeof lessons>();
  for (const l of lessons) {
    const cat = l.cat ?? 'Autres';
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat)!.push(l);
  }
  const cats = [...CAT_ORDER.filter((c) => byCat.has(c)), ...[...byCat.keys()].filter((c) => !CAT_ORDER.includes(c))];
  const totalMin = lessons.reduce((t, l) => t + (l.min ?? 0), 0);

  return (
    <>
      <div className="page-head">
        <div className="page-head-main">
          <p className="page-eyebrow">Théorie <span className="sep">/</span> {lessons.length} leçons · ~{Math.round(totalMin / 60)} h</p>
          <h1 className="page-title">Leçons de fond</h1>
          <p className="page-sub">
            {lessons.length} leçons approfondies et réutilisables. L'ordre dans chaque catégorie est
            l'ordre recommandé — il suit la progression des 12 mois. Chaque jour renvoie vers ses
            leçons dans le bloc « Cours approfondi ».
          </p>
        </div>
      </div>
      {cats.map((cat) => (
        <div key={cat} className="card" style={{ marginBottom: 14 }}>
          <h3>{cat}</h3>
          {byCat.get(cat)!.map((l, i) => {
            const lvl = LEVEL_LABEL[l.level ?? 2] ?? LEVEL_LABEL[2];
            return (
              <div key={l.slug} className="row" style={{ padding: '6px 0', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
                <div className="row" style={{ gap: 10 }}>
                  <span className="muted" style={{ width: 18, textAlign: 'right' }}>{i + 1}.</span>
                  <Link href={`/doc/lessons/${l.slug}`}>{l.title}</Link>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  {(l.skills ?? []).map((s) => (
                    <span key={s} className="badge" title="Compétence associée">{skillName(s)}</span>
                  ))}
                  <span className={`badge ${lvl.cls}`}>{lvl.label}</span>
                  <span className="badge">~{l.min} min</span>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}
