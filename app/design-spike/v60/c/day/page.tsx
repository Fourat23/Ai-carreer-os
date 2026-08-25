// V60 · C — CAREER INTELLIGENCE · Day (journée 80, réelle).
//
// COMPOSITION : un manuel premium. Colonne de lecture large et calme, titres
// de section très grands, aucune carte.
//
// LA RUPTURE se fait par RENVERSEMENT DE FOND sur toute la largeur :
//   — lire      → fond du papier sombre, texte long
//   — travailler→ fond violacé, pleine largeur, encre plus froide
//   — prouver   → fond CLAIR inversé, encre sombre : on change littéralement
//                 de support quand on doit produire une preuve
//
// Trois encres pour trois gestes. C'est la manière la plus forte de dire
// « je lis ≠ je travaille ≠ je produis » sans mettre chaque phase en boîte.
import { spikeDay, splitDay } from '../../data';
import { SpikeFlag, FAMILY_LABEL, Inline } from '../../parts';

export const dynamic = 'force-dynamic';

const DAY = 80;
const WORK = new Set(['practice', 'observe']);
const PROVE = new Set(['apply', 'verify', 'prepare']);

export default function CDay() {
  const { meta, html, week, month } = spikeDay(DAY);
  if (!meta) return null;

  const parts = splitDay(html).map((p) => ({
    ...p,
    mode: p.family && PROVE.has(p.family) ? 'prove' : p.family && WORK.has(p.family) ? 'work' : 'read',
  }));

  // Regroupe les sections consécutives de même mode : une rupture par bloc,
  // pas une par section — sinon le renversement devient un clignotement.
  const runs: { mode: string; items: typeof parts }[] = [];
  for (const p of parts) {
    const last = runs[runs.length - 1];
    if (last && last.mode === p.mode) last.items.push(p);
    else runs.push({ mode: p.mode, items: [p] });
  }

  const MODE_TAG: Record<string, string> = {
    read: 'Lecture', work: 'Travail', prove: 'Preuve',
  };

  let n = 0;
  return (
    <main className="dir-c">
      <SpikeFlag dir="C — Career Intelligence" screen={`Day · journée ${DAY}`} />

      <div className="c-wrap">
        <header className="c-doc">
          <p className="c-eyebrow">Jour {DAY} · mois {meta.month} · semaine {meta.week} — {week?.theme}</p>
          <h1>{meta.title}</h1>
          <p className="obj"><Inline text={meta.deliverable ?? ''} /></p>
          <dl className="c-figs" style={{ marginTop: 38 }}>
            <div><dt>Compétence</dt><dd style={{ fontSize: 24 }}>{meta.skillName}</dd></div>
            <div><dt>Difficulté</dt><dd>{meta.difficulty}<small> / 5</small></dd></div>
            <div><dt>Durée</dt><dd>{meta.hours}<small> h</small></dd></div>
            <div><dt>Sections</dt><dd>{parts.length}</dd></div>
          </dl>
        </header>
      </div>
      <hr className="c-rule" />

      {runs.map((run, ri) => {
        const cls = run.mode === 'prove' ? 'c-prove' : run.mode === 'work' ? 'c-turn' : '';
        return (
          <section key={ri} className={cls}>
            <div className="c-wrap">
              {run.items.map((p) => {
                n += 1;
                return (
                  <div key={p.id} id={p.id}>
                    <div className="c-mark">
                      <span className="no">{String(n).padStart(2, '0')} · {MODE_TAG[run.mode]}{p.family ? ` · ${FAMILY_LABEL[p.family] ?? ''}` : ''}</span>
                      <h2>{p.label}</h2>
                    </div>
                    <div className="c-body" dangerouslySetInnerHTML={{ __html: p.body }} />
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="c-wrap">
        <section style={{ padding: '48px 0 80px', borderTop: '1px solid var(--rule)' }}>
          <p className="c-eyebrow">Suite du programme</p>
          <p style={{ marginTop: 16, fontSize: 19, lineHeight: 1.55, color: 'var(--txt-2)', maxWidth: '62ch' }}>
            {month?.summary}
          </p>
        </section>
      </div>
    </main>
  );
}
