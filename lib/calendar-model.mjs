// Modèle de calendrier PUR (V54.1, durci en V54.2.1). Transforme une liste de
// jours (déjà résolue pour un parcours) en structure mois → semaines → jours,
// et fournit un contrat vérifiable (aucun jour perdu, aucun doublon, ordre
// chronologique strict). Aucune source de vérité propre : reçoit les jours,
// ne les invente pas.
//
// V54.2.1 — changement de contrat assumé. La version V54.1 PRÉSERVAIT l'ordre
// d'apparition de la liste reçue : un appelant fournissant une liste désordonnée
// obtenait un calendrier désordonné, et le drapeau `ok` passait à false sans que
// rien n'empêche l'affichage. Un calendrier est une structure TEMPORELLE : son
// ordre de rendu ne peut pas dépendre de la qualité de l'entrée. La sortie est
// désormais TOUJOURS triée (mois, puis semaines, puis jours), et le désordre de
// l'entrée reste signalé — mais comme diagnostic (`inputOrdered`), plus comme
// conséquence visible.
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
  // Diagnostic : la liste REÇUE était-elle déjà chronologique ? (n'influence
  // plus le rendu, mais reste exposé pour détecter un appelant fautif en amont.)
  const inputOrdered = list.every((d, i) => i === 0 || d.day > list[i - 1].day);

  // Groupement mois → semaines, puis TRI DÉTERMINISTE à chaque niveau.
  const months = [];
  const monthIndex = new Map();
  for (const d of list) {
    let mb = monthIndex.get(d.month);
    if (!mb) { mb = { month: d.month, weeks: [], _wi: new Map() }; monthIndex.set(d.month, mb); months.push(mb); }
    let wb = mb._wi.get(d.week);
    if (!wb) { wb = { week: d.week, days: [] }; mb._wi.set(d.week, wb); mb.weeks.push(wb); }
    wb.days.push(d);
  }
  months.sort((a, b) => a.month - b.month);
  for (const mb of months) {
    delete mb._wi;
    mb.weeks.sort((a, b) => a.week - b.week);
    for (const wb of mb.weeks) wb.days.sort((a, b) => a.day - b.day);
  }

  // Ordre RENDU (vérifié, pas supposé : le tri ci-dessus doit être prouvé).
  const monthOrderOk = months.every((m, i) => i === 0 || m.month > months[i - 1].month);
  const weekOrderOk = months.every((m) => m.weeks.every((w, i) => i === 0 || w.week > m.weeks[i - 1].week));
  const dayOrderOk = months.every((m) => m.weeks.every((w) => w.days.every((d, i) => i === 0 || d.day > w.days[i - 1].day)));
  // Les semaines forment aussi une suite croissante d'un mois au suivant.
  const weekChainOk = (() => {
    const all = months.flatMap((m) => m.weeks.map((w) => w.week));
    return all.every((w, i) => i === 0 || w > all[i - 1]);
  })();
  // Chaque semaine appartient à un seul mois (pas de chevauchement).
  const weekToMonth = new Map();
  let weekSpanOk = true;
  for (const m of months) for (const w of m.weeks) {
    if (weekToMonth.has(w.week) && weekToMonth.get(w.week) !== m.month) weekSpanOk = false;
    weekToMonth.set(w.week, m.month);
  }

  const rendered = dayNums.length;
  const expected = list.length; // un jour attendu par entrée fournie
  // `ordered` décrit désormais l'ORDRE RENDU (toujours chronologique) — c'est
  // ce que l'utilisateur voit. `inputOrdered` décrit l'entrée.
  const ordered = monthOrderOk && weekOrderOk && dayOrderOk && weekChainOk;
  const ok = duplicates.length === 0 && missing.length === 0 && ordered
    && weekSpanOk && rendered === expected;

  return {
    months, expected, rendered, missing, duplicates,
    ordered, inputOrdered, weekOrderOk, monthOrderOk, dayOrderOk, weekChainOk, weekSpanOk, ok,
  };
}
