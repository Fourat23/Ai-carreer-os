// V60.1 · CAREER WORKSTATION — DAY. La surface critique du sprint.
//
// COUCHE 2 · TRAVAIL. La question est : qu'est-ce que je lis, qu'est-ce que je
// fais, et où en suis-je ?
//
// EXIGENCE DU BARÈME GELÉ — à 1440 × 900, SANS DÉFILER, on doit comprendre :
//   1. quel jour je fais          → ligne de système + eyebrow
//   2. quel est son objectif      → extrait de la section `objective` et
//                                   remonté dans l'en-tête (donc dit UNE fois)
//   3. où je suis dans la séquence→ PhaseRail dans la colonne de contexte
//   4. ce que je LIS              → colonne LIRE, en-tête de zone explicite
//   5. ce que je dois FAIRE       → colonne FAIRE, matière différente
//   6. quelle preuve est attendue → bloc de preuve, en tête de la colonne FAIRE
//
// COMPOSITION :
//
//   ligne de système                                            ← A
//   ┌──────────┬──────────────────────────────────────────────┐
//   │ CONTEXTE │ EN-TÊTE : jour, titre display, objectif       │ ← C
//   │  250 px  ├─────────────────────┬────────────────────────┤
//   │ semaine  │  LIRE   (1,35 fr)   ║  FAIRE   (1 fr)        │ ← B
//   │ PhaseRail│  fond du canvas     ║  MATIÈRE DIFFÉRENTE    │ ← C
//   └──────────┴─────────────────────┴────────────────────────┘
//   ligne de faits : sections, répartition, YearBand            ← B
//
// Les trois colonnes défilent INDÉPENDAMMENT : la page reste bornée à la
// hauteur de la fenêtre. C'est ce qui évite les 9 331 px de A et les
// 11 720 px de C, mesurés au CP0.
//
// La séparation lecture / action n'est pas décrétée : elle lit `data-family`,
// que le corpus porte déjà. Aucune seconde taxonomie n'est créée.
import { notFound } from 'next/navigation';
import { cwData, cwDay, ACTION_FAMILIES, FAMILY_LABEL } from '../../data';
import { SystemLine, FactsLine, ProtoNotice, Inline, isBlind } from '../../shell';
import { PhaseRail, YearBand, EvidenceMark } from '../../motifs';

export const dynamic = 'force-dynamic';

/** Preuve attendue → nature. Correspondance déjà en place dans le produit. */
const EVIDENCE: { kind: string; label: string; from: string }[] = [
  { kind: 'practice', label: 'Exercices de la journée', from: 'corrigés localement' },
  { kind: 'produce', label: 'Livrable', from: 'décrit par le corpus' },
  { kind: 'verify', label: 'Critères de validation', from: 'section « vérifier »' },
];

export default async function CwDay({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const dayNum = Number(id);
  if (!Number.isInteger(dayNum) || dayNum < 1 || dayNum > 365) notFound();
  const blind = isBlind(await searchParams);

  const d = cwData();
  const { meta, sections, read, act, week, month } = cwDay(dayNum);
  if (!meta) notFound();

  // L'objectif est REMONTÉ dans l'en-tête et retiré de la colonne de lecture :
  // il est dit une fois, et il est dit au premier écran.
  const objective = read.find((s) => s.family === 'objective') ?? null;
  const readBody = read.filter((s) => s !== objective);

  const weekDays = d.days.filter((x) => x.week === meta.week);
  const prev = d.days.find((x) => x.day === dayNum - 1);
  const nextDay = d.days.find((x) => x.day === dayNum + 1);
  const objText = objective
    ? objective.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    : null;

  return (
    <div className="cw-app">
      <ProtoNotice blind={blind} screen={`Day · journée ${dayNum}`} />
      <SystemLine
        items={[
          { k: 'Journée', v: `${dayNum} / ${d.totalDays}`, pos: true },
          { k: 'Position', v: `M${meta.month} · S${meta.week}` },
          { k: 'Compétence', v: meta.skillName },
          { k: 'Difficulté', v: `${meta.difficulty} / 5` },
          { k: 'Durée', v: `${meta.hours} h` },
        ]}
        tail={week?.theme}
      />

      <div className="cw-body cw-day">
        {/* ── CONTEXTE — étroit, persistant, navigable ─────────────────── */}
        <aside className="cw-day-ctx" aria-label="Contexte de la journée">
          <div className="cw-zh">
            <span>Semaine {meta.week}</span>
            <em>{weekDays.length} journées</em>
          </div>
          <ol className="cw-day-week">
            {weekDays.map((x) => (
              <li key={x.day}>
                <a href={`/design-spike/v60-1/day/${x.day}`}
                   className={`cw-day-wd${x.day === dayNum ? ' cw-on' : ''}`}
                   aria-current={x.day === dayNum ? 'page' : undefined}>
                  <span className="cw-mono cw-n">J{x.day}</span>
                  <span className="cw-t">{x.title}</span>
                </a>
              </li>
            ))}
          </ol>

          <div className="cw-zh">
            <span>Plan de la journée</span>
            <em>{sections.length}</em>
          </div>
          <PhaseRail
            sections={sections}
            current={objective ? objective.id : sections[0]?.id ?? null}
            actionSet={ACTION_FAMILIES}
            familyLabel={FAMILY_LABEL}
          />
        </aside>

        {/* ── TRAVAIL — en-tête, puis deux colonnes de matières différentes ── */}
        <div className="cw-day-work">
          <header className="cw-day-head">
            <p className="cw-eyebrow">
              Jour {dayNum} · {month?.title}
            </p>
            <h1 className="cw-day-title">{meta.title}</h1>
            {objText && (
              <p className="cw-day-obj">
                <span className="cw-day-obj-k cw-mono">Objectif</span>
                {objText}
              </p>
            )}
            <nav className="cw-day-nav" aria-label="Journées voisines">
              {prev && <a className="cw-go2" href={`/design-spike/v60-1/day/${prev.day}`}>← J{prev.day}</a>}
              {nextDay && <a className="cw-go2" href={`/design-spike/v60-1/day/${nextDay.day}`}>J{nextDay.day} →</a>}
              <span className="cw-day-nav-sp" />
              <span className="cw-eyebrow">{meta.deliverable ? 'livrable attendu' : 'sans livrable déclaré'}</span>
            </nav>
          </header>

          <div className="cw-day-split">
            {/* LIRE — fond du canvas, mesure de lecture confortable */}
            <section className="cw-day-read" aria-labelledby="day-read-h">
              <div className="cw-zh">
                <span id="day-read-h">Lire · référence</span>
                <em>{readBody.length} sections</em>
              </div>
              <div className="cw-day-prose">
                {readBody.map((s, i) => (
                  <article key={s.id} id={s.id}>
                    <h2 className="cw-day-sec">
                      <span className="cw-mono cw-n">{String(i + 1).padStart(2, '0')}</span>
                      <span className="cw-t">{s.label}</span>
                      {s.family && <span className="cw-mono cw-f">{FAMILY_LABEL[s.family]}</span>}
                    </h2>
                    <div dangerouslySetInnerHTML={{ __html: s.body }} />
                  </article>
                ))}
              </div>
            </section>

            {/* FAIRE — MATIÈRE DIFFÉRENTE : autre fond, arête d'accent,
                affordances propres. Le changement de geste est porté par la
                surface, pas par une étiquette. */}
            <section className="cw-day-do" aria-labelledby="day-do-h">
              <div className="cw-zh cw-do">
                <span id="day-do-h"><b>Faire</b> · produire</span>
                <em>{act.length} sections</em>
              </div>

              <div className="cw-day-proof">
                <p className="cw-day-proof-h cw-mono">Preuve attendue</p>
                {meta.deliverable && (
                  <p className="cw-day-proof-d"><Inline text={meta.deliverable} /></p>
                )}
                <ul className="cw-day-proof-l">
                  {EVIDENCE.map((e) => (
                    <li key={e.kind}>
                      <span className="cw-g"><EvidenceMark kind={e.kind} size={20} /></span>
                      <span className="cw-b">{e.label}<i>{e.from}</i></span>
                    </li>
                  ))}
                </ul>
              </div>

              {act.map((s, i) => (
                <article key={s.id} id={s.id} className="cw-day-task">
                  <h2 className="cw-day-task-h">
                    <span className="cw-mono cw-n">{String(i + 1).padStart(2, '0')}</span>
                    <span className="cw-t">{s.label}</span>
                    {s.family && <span className="cw-mono cw-f">{FAMILY_LABEL[s.family]}</span>}
                  </h2>
                  <div className="cw-day-task-b" dangerouslySetInnerHTML={{ __html: s.body }} />
                </article>
              ))}

              {act.length === 0 && (
                <p className="cw-day-empty">
                  Cette journée ne déclare aucune section de pratique, de
                  production ou de vérification. Rien n’est ajouté à sa place.
                </p>
              )}
            </section>
          </div>
        </div>
      </div>

      <FactsLine
        facts={[
          `J${dayNum} / ${d.totalDays}`,
          `${sections.length} sections`,
          `lire ${readBody.length} · faire ${act.length}`,
          `${meta.hours} h`,
        ]}
        band={<YearBand days={d.days} now={dayNum} />}
        tail={blind ? 'lecture seule' : 'prototype — aucune action n’écrit sur disque'}
      />
    </div>
  );
}
