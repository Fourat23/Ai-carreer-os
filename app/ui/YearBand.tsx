// V56 — MOTIF PROPRIÉTAIRE : bande d'année.
//
// Raison informationnelle d'origine : douze blocs de mois, si justes
// soient-ils, cassent la CONTINUITÉ temporelle — mesuré en V55, dominance 0,18
// et douze blocs de poids équivalent. La bande rétablit une lecture d'ensemble :
// une année entière en un objet, les mois à leur longueur réelle, et les mois
// peu couverts visibles comme COURTS plutôt que comme de grands panneaux vides.
//
// V61 révise UN point de cette note : « la position courante évidente » n'est
// plus un objectif de ce motif. La position appartient à TrajectoryMap. Voir le
// contrat V61 ci-dessous.
//
// 100 % dérivée des journées réelles du parcours. Aucune journée inventée :
// un mois de 5 journées occupe cinq segments, pas un douzième de la bande.
//
// Réutilisée sur : /calendar (continuité de l'année), /parcours (trajectoire).

import { bandMarkHeight } from '@/lib/day-view';

export type BandDay = {
  day: number; month: number; status: string;
  /**
   * Difficulté déclarée de la journée, 1 à 5. C'est elle qui donne son RELIEF
   * à la bande — voir le contrat V61 ci-dessous. Optionnelle : sans elle, la
   * bande retombe sur une hauteur uniforme et redevient une frise.
   */
  difficulty?: number;
};

/**
 * ── CONTRAT V61 · YearBand = LA TEXTURE, PAS LE CHEMIN ─────────────────────
 *
 * Mesuré au CP0 de V61 : `.year-band` rendait 1138 × 82 px, ratio 13,9, toutes
 * ses marques à la MÊME hauteur. Une ligne continue de marques identiques lue
 * de gauche à droite, c'est une FRISE — l'objet le plus directionnel du
 * produit. Or la direction est le rôle de TrajectoryMap, et le rôle de
 * YearBand est l'inverse : « à quoi ressemble mon année ».
 *
 * Deux corrections, et deux seulement :
 *
 *  1. la hauteur de chaque marque porte la DIFFICULTÉ RÉELLE de la journée.
 *     La bande cesse d'être une ligne et devient un relief : on y lit une
 *     distribution, une charge, des paliers — pas un trajet ;
 *  2. la position courante n'est plus la marque dominante. Elle reste
 *     indiquée, discrètement, sous la bande : savoir où l'on est reste utile,
 *     mais ce n'est pas ce que cet objet raconte.
 *
 * Aucune donnée nouvelle : `difficulty` vient de `program.json`, comme le
 * reste. Aucun sixième motif.
 */
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

  // Le relief n'existe que si le programme déclare des difficultés. Sinon on
  // le dit — on ne dessine pas un relief plat en prétendant qu'il en est un.
  const hasRelief = days.some((d) => typeof d.difficulty === 'number' && d.difficulty > 0);
  const peak = hasRelief ? Math.max(...days.map((d) => d.difficulty ?? 0)) : 0;
  const heaviest = hasRelief
    ? groups.reduce((a, b) => (avgDiff(a.days) >= avgDiff(b.days) ? a : b))
    : null;

  return (
    <div className={`year-band${hasRelief ? ' has-relief' : ''}`} role="img"
      aria-label={
        `${label} : ${days.length} journées réparties sur ${groups.length} mois de longueurs réelles`
        + (hasRelief ? `, hauteur proportionnelle à la difficulté déclarée, maximum ${peak} sur 5, mois le plus chargé M${heaviest!.month}` : '')
        + `, ${done} terminées${currentDay ? `, position jour ${currentDay}` : ''}`
      }>
      <div className="year-band-track">
        {groups.map((g) => (
          <div key={g.month} className="year-band-month" style={{ flexGrow: g.days.length }}>
            <div className="year-band-days">
              {g.days.map((d) => (
                <span key={d.day}
                  className={`year-band-day s-${d.status}${d.day === currentDay ? ' at' : ''}`}
                  /* La hauteur EST l'information : 1/5 occupe 20 % de la
                     bande, 5/5 l'occupe entièrement. Sans difficulté déclarée,
                     la marque reste pleine hauteur et la bande n'annonce
                     aucun relief. */
                  style={hasRelief
                    ? { height: `${bandMarkHeight(d.difficulty ?? 1)}%` }
                    : undefined}
                  title={`Jour ${d.day}${monthTitles?.get(d.month) ? ` — ${monthTitles.get(d.month)}` : ''}`
                    + (d.difficulty ? ` · difficulté ${d.difficulty}/5` : '')}
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

function avgDiff(ds: BandDay[]) {
  const xs = ds.map((d) => d.difficulty ?? 0);
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}
