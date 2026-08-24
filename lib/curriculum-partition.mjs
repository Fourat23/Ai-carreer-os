// Partition VÉRIFIABLE des 365 jours du programme par rapport à un parcours.
// Read-model PUR : ne lit aucun fichier, n'invente aucune donnée, ne détient
// aucune source de vérité. Reçoit le programme et les jours d'un parcours
// (déjà résolus par lib/catalogue.mjs) et répond à une seule question :
//
//     « où sont passés les 365 jours ? »
//
// Motivation (V54.2.1) : l'interface annonçait simultanément « programme de
// 12 mois / 365 jours », « parcours : 188 jours » et « 141 jour(s) hors
// parcours » — trois nombres exacts pris isolément mais dont la somme
// (188 + 141 = 329) ne fait pas 365, faute d'une catégorie affichée pour les
// jours situés APRÈS le dernier jour du parcours. Le contrat ci-dessous rend
// cette omission impossible : la somme des catégories DOIT valoir le total.
//
// Les catégories sont POSITIONNELLES (avant / intercalé / après), parce que
// c'est la seule décomposition réellement vérifiable dans les données : un jour
// hors parcours n'a pas d'attribut « transversal » ou « révision » qui le
// distinguerait — il appartient simplement à d'autres domaines du programme.

/**
 * @param {{days: {day:number}[]}} program  programme complet (365 jours)
 * @param {number[]} trackDayNums           jours du parcours (numéros, non triés acceptés)
 * @returns {{
 *   total:number, inTrack:number, before:number, interleaved:number, after:number,
 *   firstTrackDay:number|null, lastTrackDay:number|null,
 *   interleavedDays:number[], afterDays:number[], beforeDays:number[],
 *   monthsCovered:number[], monthsTotal:number,
 *   ok:boolean, sum:number
 * }}
 */
export function curriculumPartition(program, trackDayNums) {
  const all = (program?.days ?? []).map((d) => d.day);
  const total = all.length;
  const inSet = new Set(Array.isArray(trackDayNums) ? trackDayNums : []);
  // On ne compte QUE des jours réellement présents dans le programme : un
  // numéro fantôme ne doit pas gonfler la partition.
  const inTrack = all.filter((n) => inSet.has(n));
  const first = inTrack.length ? Math.min(...inTrack) : null;
  const last = inTrack.length ? Math.max(...inTrack) : null;

  const beforeDays = [];
  const interleavedDays = [];
  const afterDays = [];
  for (const n of all) {
    if (inSet.has(n)) continue;
    if (first === null) { afterDays.push(n); continue; } // parcours vide : tout est « hors »
    if (n < first) beforeDays.push(n);
    else if (n > last) afterDays.push(n);
    else interleavedDays.push(n);
  }

  const monthOf = new Map((program?.days ?? []).map((d) => [d.day, d.month]));
  const monthsCovered = [...new Set(inTrack.map((n) => monthOf.get(n)).filter((m) => m != null))].sort((a, b) => a - b);
  const monthsTotal = new Set((program?.days ?? []).map((d) => d.month)).size;

  const sum = inTrack.length + beforeDays.length + interleavedDays.length + afterDays.length;
  return {
    total,
    inTrack: inTrack.length,
    before: beforeDays.length,
    interleaved: interleavedDays.length,
    after: afterDays.length,
    firstTrackDay: first,
    lastTrackDay: last,
    beforeDays, interleavedDays, afterDays,
    monthsCovered, monthsTotal,
    sum,
    ok: sum === total,
  };
}

/**
 * Libellé produit UNIQUE de la couverture d'un parcours, dérivé de la partition.
 * Sert Dashboard / Parcours / Calendrier : un seul vocabulaire, un seul calcul.
 * @param {ReturnType<typeof curriculumPartition>} p
 * @returns {{ scope:string, coverage:string, outside:string|null }}
 */
export function partitionLabels(p) {
  const outsideCount = p.before + p.interleaved + p.after;
  return {
    // Le programme global ne change jamais : c'est le Curriculum 1.0.
    scope: `Programme global · ${p.total} jours`,
    // Ce que le parcours actif couvre RÉELLEMENT du programme global.
    coverage: `${p.inTrack} jours sur ${p.total} · ${p.monthsCovered.length} mois sur ${p.monthsTotal}`,
    // Le reste, nommé et compté — jamais implicite.
    outside: outsideCount === 0 ? null
      : `${outsideCount} jours hors parcours`
        + ` (${p.interleaved} intercalés${p.after ? `, ${p.after} au-delà du jour ${p.lastTrackDay}` : ''}${p.before ? `, ${p.before} avant le jour ${p.firstTrackDay}` : ''})`,
  };
}
