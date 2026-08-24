// V56 — MOTIF PROPRIÉTAIRE : bande d'année.
//
// Raison informationnelle : douze blocs de mois, si justes soient-ils, cassent
// la CONTINUITÉ temporelle — mesuré en V55, dominance 0,18 et douze blocs de
// poids équivalent. La bande rétablit la lecture continue : une année entière
// en une ligne, la position courante évidente, la densité de pratique
// perceptible, et les mois peu couverts visibles comme COURTS plutôt que comme
// de grands panneaux vides.
//
// 100 % dérivée des journées réelles du parcours. Aucune journée inventée :
// un mois de 5 journées occupe cinq segments, pas un douzième de la bande.
//
// Réutilisée sur : /calendar (continuité de l'année), /parcours (trajectoire).

export type BandDay = { day: number; month: number; status: string };

export function YearBand({
  days, currentDay, monthTitles, label = 'Année du parcours',
}: {
  days: BandDay[];
  currentDay?: number;
  monthTitles?: Map<number, string>;
  label?: string;
}) {
  if (!days.length) return null;
  // Groupement par mois, dans l'ordre d'arrivée (déjà chronologique — contrat
  // V54.2.1). Chaque mois pèse le nombre de journées qu'il contient RÉELLEMENT.
  const groups: { month: number; days: BandDay[] }[] = [];
  for (const d of days) {
    const last = groups[groups.length - 1];
    if (last && last.month === d.month) last.days.push(d);
    else groups.push({ month: d.month, days: [d] });
  }
  const done = days.filter((d) => d.status === 'done').length;

  return (
    <div className="year-band" role="img"
      aria-label={`${label} : ${days.length} journées, ${done} terminées${currentDay ? `, position jour ${currentDay}` : ''}`}>
      <div className="year-band-track">
        {groups.map((g) => (
          <div key={g.month} className="year-band-month" style={{ flexGrow: g.days.length }}>
            <div className="year-band-days">
              {g.days.map((d) => (
                <span key={d.day}
                  className={`year-band-day s-${d.status}${d.day === currentDay ? ' now' : ''}`}
                  title={`Jour ${d.day}${monthTitles?.get(d.month) ? ` — ${monthTitles.get(d.month)}` : ''}`}
                />
              ))}
            </div>
            <span className="year-band-label">
              <span className="year-band-m">M{g.month}</span>
              <span className="year-band-n">{g.days.length}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
