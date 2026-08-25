import Link from 'next/link';
import { SurfaceHead } from '@/app/ui';
import { getProgram } from '@/lib/program';

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

  const slug = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // V58 · CP6 — Grammaire de catalogue `cat-*`, éprouvée en V57 sur
  // /diagnostics et /capstones. Le CP0 mesurait ici topBlocks 1, dominance 1
  // (dégénérée), 5 fonds, 2 ombres et 17 cartes `.card` — une par catégorie,
  // chacune contenant des lignes bricolées en styles en ligne.
  // Une catégorie n'a ni action autonome, ni cycle de vie propre : ce n'est
  // pas une carte, c'est un groupe. Une seule surface continue désormais.
  return (
    <div className="cat-view page-wide">
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

      <nav className="cat-index" aria-label="Catégories">
        <span className="cat-index-k">Catégories</span>
        <ul className="cat-index-list">
          {cats.map((c) => (
            <li key={c}>
              <a href={`#cat-${slug(c)}`}>{c} <span className="cat-index-n">{byCat.get(c)!.length}</span></a>
            </li>
          ))}
        </ul>
      </nav>

      <section className="cat" aria-label="Catalogue des leçons">
        {cats.map((cat) => (
          <div key={cat} className="cat-group" id={`cat-${slug(cat)}`}>
            <div className="cat-group-head">
              <h2 className="cat-group-name">{cat}</h2>
              <span className="cat-group-n">{byCat.get(cat)!.length} leçon{byCat.get(cat)!.length > 1 ? 's' : ''}</span>
            </div>
            <ul className="cat-rows">
              {byCat.get(cat)!.map((l, i) => {
                const lvl = LEVEL_LABEL[l.level ?? 2] ?? LEVEL_LABEL[2];
                return (
                  <li key={l.slug} className="cat-row">
                    <Link href={`/doc/lessons/${l.slug}`} className="cat-row-link">
                      <span className="cat-row-ord" aria-hidden="true">{i + 1}</span>
                      <span className="cat-row-body">
                        <span className="cat-row-title">{l.title}</span>
                        <span className="cat-row-sub">{(l.skills ?? []).map(skillName).join(' · ')}</span>
                      </span>
                      <span className="cat-row-tags">
                        <span className={`cat-tag l-${lvl.cls}`}>{lvl.label}</span>
                        <span className="cat-tag">~{l.min} min</span>
                      </span>
                      <span className="cat-row-n">Lire →</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
