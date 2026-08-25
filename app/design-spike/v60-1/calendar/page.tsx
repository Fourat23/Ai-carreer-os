// V60.1 · CAREER WORKSTATION — CALENDAR.
//
// COUCHE 3 · STRUCTURE. La question est : comment cette année est-elle bâtie,
// et où se situe une semaine donnée dedans ?
//
// RÈGLE D'ARCHITECTURE DU CP8 — aucune donnée n'est dite deux fois. Les trois
// registres travaillent à TROIS GRANULARITÉS DIFFÉRENTES :
//
//   RÈGLE DE L'ANNÉE   la JOURNÉE   365 traits, seul endroit où les journées
//                                   sont dessinées — YearBand à l'échelle
//                                   `rule`, motif principal de cet écran
//   GRILLE             la SEMAINE   52 cellules, thème réel, aucune barre de
//                                   journée : le jour appartient à la règle
//   PANNEAU            le MOIS      un seul mois, éditorial, prose du corpus
//
// C'est le défaut central des deux calendriers de V60 : B dessinait 7 barres
// de journée dans chaque cellule de semaine (365 marques) PUIS un pavé de
// totaux dérivés de ces mêmes marques ; C dessinait les 365 journées en
// portées mensuelles PUIS répétait chaque mois en prose. Ici, chaque fait
// appartient à un seul registre.
//
// De B : la page BORNÉE, la grille dense, le pied factuel.
// De C : les mois RESTENT INÉGAUX — 28, 35 ou 36 journées, aucun remplissage
//        pour égaliser la grille — et le panneau de mois est composé comme un
//        texte, pas comme une fiche.
//
// Le motif YearBand n'apparaît PAS dans la ligne de faits de cet écran : il y
// est promu en tête, à grande échelle. Un motif, un rôle, une occurrence.
import { cwData } from '../data';
import { SystemLine, FactsLine, ProtoNotice, isBlind, PaneSwitch, paneOf } from '../shell';
import { YearRule } from '../motifs';

export const dynamic = 'force-dynamic';

export default async function CwCalendar({
  searchParams,
}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const blind = isBlind(sp);
  const pane = paneOf(sp, ['grille', 'mois']);
  const d = cwData();
  const now = d.progress.resumeDay;

  const raw = Array.isArray(sp?.m) ? sp.m[0] : sp?.m;
  const asked = Number(raw);
  const sel = Number.isInteger(asked) && asked >= 1 && asked <= d.months.length
    ? asked
    : (d.days.find((x) => x.day === now)?.month ?? 1);
  const month = d.months.find((m) => m.month === sel)!;

  // Les semaines réelles, groupées par mois. Un mois porte 4 ou 5 semaines
  // selon le programme : la ligne s'arrête où le mois s'arrête.
  const weekTheme = new Map(d.weeks.map((w) => [w.week, w.theme] as const));
  const rows = d.months.map((m) => ({
    m,
    weeks: m.weeks.map((wk) => {
      const wd = d.days.filter((x) => x.week === wk);
      return {
        week: wk,
        theme: weekTheme.get(wk) ?? '',
        days: wd.length,
        hours: Math.round(wd.reduce((s, x) => s + x.hours, 0)),
        review: wd.filter((x) => x.isReview).length,
        project: wd.some((x) => x.project != null),
        holdsNow: wd.some((x) => x.day === now),
      };
    }),
  }));

  const widest = Math.max(...rows.map((r) => r.weeks.length));
  const shortest = d.months.reduce((a, b) => (a.days.length <= b.days.length ? a : b));
  const longest = d.months.reduce((a, b) => (a.days.length >= b.days.length ? a : b));

  /**
   * LA RÉGULARITÉ EST DITE UNE FOIS, L'ÉCART EST DIT SUR PLACE.
   *
   * Mesure du CP9 : sur 52 semaines, la charge vaut 32 h dans 51 cas et 36 h
   * dans un seul ; le nombre de journées vaut 7 dans 51 cas et 8 dans un seul
   * (S52) ; et le nombre de révisions vaut 1 dans les 52 cas.
   *
   * La première version imprimait « 32 h » et « 1 RÉVISION » dans chaque
   * cellule : 103 étiquettes portant zéro information, et masquant les deux
   * seules cellules qui en portaient. La norme est donc énoncée une fois dans
   * l'en-tête de zone, et une cellule ne porte un chiffre que lorsqu'elle
   * s'écarte de cette norme.
   */
  const flat = <T,>(xs: T[]) => new Set(xs).size === 1;
  const allWeeks = rows.flatMap((r) => r.weeks);
  const normHours = allWeeks[0]?.hours ?? 0;
  const normDays = allWeeks[0]?.days ?? 0;
  const uniformReview = flat(allWeeks.map((w) => w.review));
  const reviewPerWeek = allWeeks[0]?.review ?? 0;
  const odd = allWeeks.filter((w) => w.hours !== normHours || w.days !== normDays);
  const norm = [
    `${normDays} journées`,
    `${normHours} h par semaine`,
    uniformReview
      ? `${reviewPerWeek} révision${reviewPerWeek > 1 ? 's' : ''} par semaine`
      : `${d.reviewDays} révisions au total`,
  ].join(' · ');

  return (
    <div className="cw-app">
      <ProtoNotice blind={blind} screen="Calendar" />
      <SystemLine
        items={[
          { k: 'Structure', v: `${d.months.length} mois · ${d.weeks.length} semaines` },
          { k: 'Journées', v: `${d.totalDays}`, pos: true },
          { k: 'Charge', v: `${d.hours.toLocaleString('fr-FR')} h` },
          { k: 'Mois affiché', v: `M${sel}` },
        ]}
        tail={`mois le plus court ${shortest.days.length} j · le plus long ${longest.days.length} j`}
      />

      <div className="cw-body cw-cal">
        {/* ── REGISTRE 1 · la règle de l'année. Granularité : la JOURNÉE. ── */}
        <section className="cw-cal-rule" aria-labelledby="cal-rule-h">
          <div className="cw-cal-rule-h">
            <h1 id="cal-rule-h" className="cw-cal-h1">La règle de l’année</h1>
            <div className="cw-cal-rule-sub">
              <p className="cw-eyebrow cw-cal-rule-cap">
                un trait = une journée · la largeur d’un mois = son nombre réel de journées
              </p>
              <ul className="cw-legend">
                <li><span className="cw-lg cw-dy" />journée</li>
                <li><span className="cw-lg cw-rv" />révision</li>
                <li><span className="cw-lg cw-pj" />jalon de projet</li>
                <li><span className="cw-lg cw-nw" />position</li>
              </ul>
            </div>
          </div>
          <YearRule days={d.days} now={now} months={d.months} selected={sel} />
        </section>

        <PaneSwitch
          base={`/design-spike/v60-1/calendar?m=${sel}${blind ? '&blind=1' : ''}`}
          current={pane}
          panes={[
            { v: 'grille', label: 'Semaines', n: d.weeks.length },
            { v: 'mois', label: `Mois ${sel}`, n: month.days.length },
          ]}
        />

        {/* ── REGISTRE 2+3 · grille de semaines et panneau de mois. ──────── */}
        <div className={`cw-cal-body cw-v-${pane}`}>
          <section className="cw-cal-grid-w" aria-labelledby="cal-grid-h">
            <div className="cw-zh">
              <span id="cal-grid-h">Les {d.weeks.length} semaines</span>
              <em>
                {norm}
                {odd.length > 0 && ` — sauf ${odd.map((w) => `S${w.week}`).join(', ')}`}
              </em>
            </div>
            <div className="cw-cal-grid" tabIndex={0}>
              {rows.map(({ m, weeks }) => (
                <div key={m.month} className={`cw-cal-row${m.month === sel ? ' cw-on' : ''}`}>
                  {/* Le nombre de journées du mois est déjà porté par la
                      largeur de son segment dans la règle ET par le pavé de
                      faits du panneau. L'étiquette de ligne ne porte donc que
                      l'identité du mois : le nombre de cellules dit déjà que
                      ce mois est plus long ou plus court. */}
                  <a href={`?m=${m.month}`} className="cw-cal-mo"
                     aria-label={`Afficher le mois ${m.month}`}>
                    <span className="cw-cal-mo-n cw-mono">{String(m.month).padStart(2, '0')}</span>
                  </a>
                  {/* Les cellules ne sont PAS complétées jusqu'à la largeur du
                      mois le plus long : un mois de 4 semaines occupe 4
                      cellules, la ligne s'arrête, et le vide restant dit la
                      chose exacte qu'il faut dire. */}
                  <div className="cw-cal-wks" style={{ gridTemplateColumns: `repeat(${widest}, minmax(0, 1fr))` }}>
                    {weeks.map((w) => (
                      <div key={w.week}
                           className={`cw-cal-wk${w.holdsNow ? ' cw-now' : ''}${w.project ? ' cw-pj' : ''}`}>
                        <span className="cw-cal-wk-h cw-mono">
                          <b>S{w.week}</b>
                          {/* Un chiffre n'apparaît que s'il s'écarte de la norme
                              énoncée en tête de zone. */}
                          {(w.hours !== normHours || w.days !== normDays) && (
                            <i className="cw-odd">{w.days} j · {w.hours} h</i>
                          )}
                          {w.project && <i className="cw-pj">jalon de projet</i>}
                        </span>
                        <span className="cw-cal-wk-t">{w.theme}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Panneau éditorial. Granularité : le MOIS. Il ne redit ni les
              journées (règle) ni les thèmes de semaine (grille) : il porte la
              prose du corpus, le projet, et la composition en compétences. */}
          <aside className="cw-cal-mopanel" aria-label={`Mois ${sel}`}>
            <div className="cw-zh">
              <span>Mois {sel}</span><em>sur {d.months.length}</em>
            </div>
            <div className="cw-cal-mp" tabIndex={0}>
              <h2 className="cw-cal-mp-t">{month.title}</h2>
              <p className="cw-cal-mp-s">{month.summary}</p>

              {month.project && (
                <p className="cw-cal-mp-pj">
                  <span className="cw-mono">Projet {month.project.id}</span>
                  {month.project.name}
                </p>
              )}

              <dl className="cw-figs cw-cal-mp-f">
                <div><dt>Journées</dt><dd>{month.days.length}</dd></div>
                <div><dt>Heures</dt><dd>{month.hours}</dd></div>
                <div><dt>Révisions</dt><dd>{month.reviewDays}</dd></div>
                <div><dt>Difficulté max</dt><dd>{month.peakDifficulty}<small> / 5</small></dd></div>
              </dl>

              <p className="cw-cal-mp-k cw-mono">Composition en compétences</p>
              <ul className="cw-cal-mp-sk">
                {month.skills.map((s) => (
                  <li key={s.id}>
                    <span className="cw-t">{s.name}</span>
                    <span className="cw-bar" style={{ width: `${(s.days / month.days.length) * 100}%` }} />
                    <span className="cw-mono cw-v">{s.days} j</span>
                  </li>
                ))}
              </ul>

              <a className="cw-go2 cw-cal-mp-go" href={`/day/${month.days[0]?.day ?? 1}`}>
                Ouvrir J{month.days[0]?.day ?? 1} — première journée du mois
              </a>
            </div>
          </aside>
        </div>
      </div>

      {/* La ligne de faits de cet écran NE PORTE PAS de YearBand : le motif
          est promu en tête, à l'échelle `rule`. Un motif, un rôle, une
          occurrence par écran. */}
      <FactsLine
        facts={[
          `${d.months.length} mois`,
          `${d.weeks.length} semaines`,
          `${d.totalDays} journées`,
          `${d.hours.toLocaleString('fr-FR')} h`,
        ]}
        tail={blind ? 'lecture seule' : 'ordre du programme · aucune date de calendrier civil'}
      />
    </div>
  );
}
