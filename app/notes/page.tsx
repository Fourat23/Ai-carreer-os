import Link from 'next/link';
import { SurfaceHead } from '@/app/ui';
import { getProgram } from '@/lib/program';
import { readProgress } from '@/lib/progress-server';
import { computeStats } from '@/lib/progress-stats';

export const dynamic = 'force-dynamic';

// V58 · CP8 — JOURNAL D'APPRENTISSAGE.
//
// Constat du CP0 : un `HeroFocus` puis une pile de `.note-entry` — aucun bloc
// structurant, aucun groupement, et un état vide réduit à une phrase dans un
// cadre en pointillés.
//
// EditorialShell n'est PAS la bonne famille ici : le contenu n'est pas un
// document rédigé mais l'agrégation des saisies de l'apprenant. La grammaire
// retenue est donc celle d'un JOURNAL — un catalogue d'entrées personnelles,
// ordonné par le temps du parcours et groupé par mois du curriculum :
//
//   IDENTITÉ  → ce qu'est ce journal, et d'où viennent ses entrées
//   FLUX      → les entrées réelles, groupées par mois, sur une surface continue
//   (état vide) COMMENT UNE ENTRÉE ARRIVE ICI + reprise concrète
//
// L'état vide est traité comme un état de produit, pas comme une erreur : sur
// une sauvegarde neuve c'est l'état RÉEL de la page, et c'est là que le
// mécanisme doit être expliqué. Rien n'est fabriqué : les mois, titres et
// compétences proviennent du programme, les entrées de `data/progress.json`.
export default function NotesPage() {
  const program = getProgram();
  const progress = readProgress();

  const entries = Object.entries(progress.days)
    .filter(([, p]) => (p.notes && p.notes.trim()) || (p.answer && p.answer.trim()))
    .map(([day, p]) => ({ day: Number(day), ...p }))
    .sort((a, b) => a.day - b.day);

  // Groupement par mois du curriculum. Le mois vient du programme, jamais d'un
  // calcul approximatif sur le numéro de jour.
  const byMonth = new Map<number, typeof entries>();
  for (const e of entries) {
    const m = program.days.find((d) => d.day === e.day)?.month ?? 0;
    const bucket = byMonth.get(m);
    if (bucket) bucket.push(e);
    else byMonth.set(m, [e]);
  }
  const months = [...byMonth.keys()].sort((a, b) => a - b);

  const answers = entries.filter((e) => e.answer?.trim()).length;
  const resumeDay = computeStats(program.days, progress).currentDay;

  return (
    <div className="jn">
      <SurfaceHead
        kind="catalog"
        eyebrow={<>Journal <span className="sep">/</span> notes personnelles</>}
        title={entries.length
          ? `${entries.length} entrée${entries.length > 1 ? 's' : ''} de journal`
          : 'Journal d’apprentissage'}
        lead={entries.length
          ? <>Tes réponses et tes notes, agrégées depuis les vues Jour et relues dans l’ordre du
            parcours. Rien n’est ajouté automatiquement : tout ce qui est ici, tu l’as écrit.</>
          : <>Ce journal rassemble ce que tu écris toi-même dans une journée — « Ma réponse » et
            « Notes personnelles ». Il est encore vide : rien n’est généré à ta place.</>}
        facts={[
          entries.length > 0 && { k: 'Journées annotées', v: entries.length },
          answers > 0 && { k: 'Réponses rédigées', v: answers },
          entries.length > 0 && { k: 'Étendue', v: `jour ${entries[0].day} → ${entries[entries.length - 1].day}` },
        ]}
      />

      {entries.length === 0 ? (
        <>
          {/* ── ÉTAT VIDE UTILE : le mécanisme, puis une reprise concrète ──── */}
          <section className="jn-start" aria-label="Comment une entrée arrive dans le journal">
            <div className="jn-sec-head">
              <h2 className="jn-h">Comment une entrée arrive ici</h2>
              <span className="jn-h-note">trois étapes, aucune automatique</span>
            </div>
            <ol className="jn-steps">
              <li>
                <span className="jn-step-n">1</span>
                <div>
                  <p className="jn-step-t">Ouvre une journée</p>
                  <p className="jn-step-d">Chaque jour du parcours a une vue dédiée : leçon, exercices, livrable.</p>
                </div>
              </li>
              <li>
                <span className="jn-step-n">2</span>
                <div>
                  <p className="jn-step-t">Écris dans « Ma réponse » ou « Notes personnelles »</p>
                  <p className="jn-step-d">Deux champs libres, en bas de la journée. Le premier sert à rédiger ta
                    solution ; le second à garder ce que tu ne veux pas réapprendre deux fois.</p>
                </div>
              </li>
              <li>
                <span className="jn-step-n">3</span>
                <div>
                  <p className="jn-step-t">L’entrée apparaît ici, groupée par mois</p>
                  <p className="jn-step-d">Le texte est enregistré dans <code>data/progress.json</code>, sur cette
                    machine. Ce journal ne fait que le relire.</p>
                </div>
              </li>
            </ol>
            <div className="jn-actions">
              <Link className="btn primary" href={`/day/${resumeDay}`}>Ouvrir le jour {resumeDay}</Link>
              <Link className="btn" href="/parcours">Voir le parcours</Link>
            </div>
          </section>

          <p className="jn-foot">
            À quoi ça sert plus tard : les bilans mensuels et les révisions renvoient vers les
            journées annotées. Un journal vide n’est pas un manque de progression — c’est
            simplement qu’aucune journée n’a encore été commentée.
          </p>
        </>
      ) : (
        <section className="jn-stream" aria-label="Entrées du journal">
          {months.map((m) => {
            const list = byMonth.get(m)!;
            const meta = program.months.find((x) => x.month === m);
            return (
              <section key={m} className="jn-month" aria-label={`Mois ${m}`}>
                <div className="jn-month-head">
                  <h2 className="jn-h">
                    {m > 0 ? <>Mois {m}{meta?.title ? <span className="jn-month-t"> — {meta.title}</span> : null}</> : 'Hors parcours'}
                  </h2>
                  <span className="jn-h-note">{list.length} entrée{list.length > 1 ? 's' : ''}</span>
                </div>
                <div className="jn-entries">
                  {list.map((e) => {
                    const day = program.days.find((d) => d.day === e.day);
                    return (
                      <article key={e.day} className="jn-entry">
                        <div className="jn-entry-head">
                          <Link className="jn-entry-day" href={`/day/${e.day}`}>
                            <span className="jn-entry-n">Jour {e.day}</span>
                            <span className="jn-entry-t">{day?.title}</span>
                          </Link>
                          {day?.skillName && <span className="badge">{day.skillName}</span>}
                        </div>
                        {e.answer?.trim() && (
                          <div className="jn-field">
                            <p className="jn-field-k">Ma réponse</p>
                            <pre>{e.answer}</pre>
                          </div>
                        )}
                        {e.notes?.trim() && (
                          <div className="jn-field">
                            <p className="jn-field-k">Notes</p>
                            <pre>{e.notes}</pre>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </section>
      )}
    </div>
  );
}
