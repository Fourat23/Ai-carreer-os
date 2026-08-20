// Modèle de calendrier PUR (V54.1). Transforme une liste de jours (déjà résolue
// pour un parcours) en structure mois → semaines → jours, et fournit un contrat
// vérifiable (aucun jour perdu, aucun doublon, ordre chronologique strict).
// Aucune source de vérité propre : reçoit les jours, ne les invente pas.

/**
 * @param {{day:number, month:number, week:number, title?:string, isReview?:boolean}[]} days
 * @returns {{ months: {month:number, weeks:{week:number, days:object[]}[]}[],
 *             expected:number, rendered:number, missing:number[], duplicates:number[],
 *             ordered:boolean, weekOrderOk:boolean, monthOrderOk:boolean, ok:boolean }}
 */
export function buildCalendar(days) {
  const list = Array.isArray(days) ? days : [];
  // Doublons + ensemble des jours rendus.
  const seen = new Set();
  const duplicates = [];
  for (const d of list) {
    if (seen.has(d.day)) duplicates.push(d.day);
    seen.add(d.day);
  }
  const dayNums = [...seen].sort((a, b) => a - b);
  // Jours manquants : trous dans l'intervalle [min..max] réellement couvert.
  const missing = [];
  if (dayNums.length) {
    for (let n = dayNums[0]; n <= dayNums[dayNums.length - 1]; n++) {
      if (!seen.has(n)) missing.push(n);
    }
  }
  // Ordre chronologique strict de la liste fournie (rendu = ordre d'entrée).
  const ordered = list.every((d, i) => i === 0 || d.day > list[i - 1].day);

  // Groupement mois → semaines, en PRÉSERVANT l'ordre d'apparition (chronologique).
  const months = [];
  const monthIndex = new Map();
  for (const d of list) {
    let mb = monthIndex.get(d.month);
    if (!mb) { mb = { month: d.month, weeks: [], _wi: new Map() }; monthIndex.set(d.month, mb); months.push(mb); }
    let wb = mb._wi.get(d.week);
    if (!wb) { wb = { week: d.week, days: [] }; mb._wi.set(d.week, wb); mb.weeks.push(wb); }
    wb.days.push(d);
  }
  for (const mb of months) delete mb._wi;

  // Ordre des mois et des semaines strictement croissant tel qu'affiché.
  const monthOrderOk = months.every((m, i) => i === 0 || m.month > months[i - 1].month);
  const weekOrderOk = months.every((m) => m.weeks.every((w, i) => i === 0 || w.week > m.weeks[i - 1].week));
  // Chaque semaine appartient à un seul mois (pas de chevauchement).
  const weekToMonth = new Map();
  let weekSpanOk = true;
  for (const m of months) for (const w of m.weeks) {
    if (weekToMonth.has(w.week) && weekToMonth.get(w.week) !== m.month) weekSpanOk = false;
    weekToMonth.set(w.week, m.month);
  }

  const rendered = dayNums.length;
  const expected = list.length; // un jour attendu par entrée fournie
  const ok = duplicates.length === 0 && missing.length === 0 && ordered
    && monthOrderOk && weekOrderOk && weekSpanOk && rendered === expected;

  return { months, expected, rendered, missing, duplicates, ordered, weekOrderOk, monthOrderOk, weekSpanOk, ok };
}
