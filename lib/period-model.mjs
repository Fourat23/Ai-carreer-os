// V57 — Read-model PUR d'une période du curriculum (un mois, une semaine).
//
// Aucune donnée nouvelle, aucune seconde source de vérité : tout est DÉRIVÉ
// des champs déjà portés par `data/program.json` (`day`, `week`, `month`,
// `skill`, `skillName`, `difficulty`, `hours`, `isReview`, `deliverable`,
// `project`) et de `data/progress.json`. Le curriculum reste gelé : ce module
// lit, il ne réécrit rien et ne réordonne rien.
//
// Motivation : `/month/[id]` et `/week/[id]` ne rendaient qu'un `article.prose`
// nu — mesuré au CP0 de V57 à 2 fonds, 1 ombre, amplitude typographique 1,65,
// alors qu'elles sont sur le chemin quotidien. Elles avaient l'intention
// éditoriale du mois mais aucun des faits que le programme contient déjà.

const STATUSES = ['done', 'in-progress', 'to-review'];

function statusOf(progress, day) {
  const s = progress?.days?.[String(day)]?.status;
  return STATUSES.includes(s) ? s : 'todo';
}

/**
 * Faits d'une période, tous dérivés de données réelles.
 * @param {object} program  data/program.json
 * @param {object} progress data/progress.json
 * @param {'month'|'week'} unit
 * @param {number} n numéro de la période
 */
export function periodModel(program, progress, unit, n) {
  const days = (program?.days ?? [])
    .filter((d) => d[unit] === n)
    .sort((a, b) => a.day - b.day)
    .map((d) => ({
      day: d.day, title: d.title, week: d.week, month: d.month,
      skill: d.skill, skillName: d.skillName,
      difficulty: Number(d.difficulty) || 0,
      hours: Number(d.hours) || 0,
      isReview: !!d.isReview,
      deliverable: d.deliverable || null,
      project: d.project || null,
      status: statusOf(progress, d.day),
    }));

  if (!days.length) return null;

  // Répartition par compétence : le nombre de journées que chaque compétence
  // occupe réellement dans la période, décroissant.
  const bySkill = new Map();
  for (const d of days) {
    const k = d.skillName || d.skill || '—';
    const cur = bySkill.get(k) ?? { name: k, id: d.skill, days: 0, hours: 0, done: 0 };
    cur.days += 1; cur.hours += d.hours; if (d.status === 'done') cur.done += 1;
    bySkill.set(k, cur);
  }
  const skills = [...bySkill.values()].sort((a, b) => b.days - a.days || a.name.localeCompare(b.name));

  // Nature des journées. Les catégories sont EXCLUSIVES et dérivées de champs
  // réels : une journée de révision est marquée `isReview` ; une journée de
  // projet porte un `project` ; une journée qui produit un artefact porte un
  // `deliverable`. Le reste est de l'étude sans livrable attendu. Aucune
  // heuristique inventée, aucun ratio « théorie / pratique » fabriqué.
  const nature = { review: 0, project: 0, deliverable: 0, study: 0 };
  for (const d of days) {
    if (d.isReview) nature.review += 1;
    else if (d.project) nature.project += 1;
    else if (d.deliverable) nature.deliverable += 1;
    else nature.study += 1;
  }

  const difficulty = [1, 2, 3, 4, 5].map((lvl) => ({ lvl, days: days.filter((d) => d.difficulty === lvl).length }));
  const done = days.filter((d) => d.status === 'done').length;
  const started = days.filter((d) => d.status === 'in-progress').length;
  const toReview = days.filter((d) => d.status === 'to-review').length;

  // Prochaine action RÉELLE : la première journée non terminée de la période.
  // `null` quand tout est fait — la page le dit alors, elle n'invente pas.
  const next = days.find((d) => d.status !== 'done') ?? null;

  const weeks = unit === 'month'
    ? [...new Set(days.map((d) => d.week))].sort((a, b) => a - b)
      .map((w) => {
        const wd = days.filter((d) => d.week === w);
        return {
          week: w, days: wd.length, hours: +wd.reduce((s, d) => s + d.hours, 0).toFixed(1),
          done: wd.filter((d) => d.status === 'done').length,
          first: wd[0].day, last: wd[wd.length - 1].day,
          skills: [...new Set(wd.map((d) => d.skillName))],
        };
      })
    : [];

  return {
    unit, n,
    days, weeks, skills, nature, difficulty,
    count: days.length,
    hours: +days.reduce((s, d) => s + d.hours, 0).toFixed(1),
    first: days[0].day, last: days[days.length - 1].day,
    done, started, toReview, todo: days.length - done - started - toReview,
    percent: Math.round((done / days.length) * 100),
    // `project` porte un NUMÉRO de projet, pas un intitulé : les journées sont
    // donc regroupées par projet, avec la liste réelle des jours concernés.
    // Afficher le numéro brut en face de chaque jour (« Jour 61 · 2 ») ne
    // voulait rien dire — défaut vu en ouvrant la capture, pas dans la mesure.
    projects: [...days.filter((d) => d.project)
      .reduce((m, d) => {
        const k = String(d.project);
        const cur = m.get(k) ?? { project: d.project, days: [] };
        cur.days.push(d.day); m.set(k, cur);
        return m;
      }, new Map()).values()],
    deliverables: days.filter((d) => d.deliverable).length,
    next,
  };
}

/** Bornes réelles d'une unité, pour une navigation qui ne propose jamais un vide. */
export function periodBounds(program, unit) {
  const all = (program?.days ?? []).map((d) => d[unit]).filter((v) => Number.isFinite(v));
  return all.length ? { min: Math.min(...all), max: Math.max(...all) } : { min: 1, max: 1 };
}
