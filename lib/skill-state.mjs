// États de compétence PURS et dérivés par règles explicites (aucun faux score).
// Une compétence progresse selon l'exposition réelle (jours travaillés/terminés),
// les révisions en attente et les PREUVES concrètes enregistrées.

export const SKILL_STATES = ['not-started', 'discovered', 'practiced', 'demonstrated', 'to-consolidate'];

export const SKILL_STATE_LABEL = {
  'not-started': 'Non abordée',
  discovered: 'Découverte',
  practiced: 'Pratiquée',
  demonstrated: 'Démontrée',
  'to-consolidate': 'À consolider',
};

/**
 * État d'une compétence à partir de signaux bruts. Règles ordonnées, documentées :
 *  - aucune activité → non abordée
 *  - au moins une journée à revoir → à consolider (on surface le besoin de révision)
 *  - au moins une preuve concrète → démontrée
 *  - ≥ 3 journées terminées → pratiquée
 *  - sinon (au moins commencée) → découverte
 */
export function skillState({ daysDone = 0, daysStarted = 0, evidenceCount = 0, hasToReview = false } = {}) {
  if (daysDone === 0 && daysStarted === 0 && evidenceCount === 0) return 'not-started';
  if (hasToReview) return 'to-consolidate';
  if (evidenceCount >= 1) return 'demonstrated';
  if (daysDone >= 3) return 'practiced';
  return 'discovered';
}

/**
 * Statistiques par compétence dérivées du programme + progression.
 * @returns {Array<{id,name,daysAssociated,daysDone,evidenceCount,lastActivityAt,state}>}
 */
export function skillStats(program, progress) {
  const days = program?.days ?? [];
  const skills = program?.skills ?? [];
  const prog = (progress && typeof progress.days === 'object' && progress.days) || {};

  // Index des preuves par compétence (toutes journées confondues).
  const evBySkill = new Map();
  for (const k of Object.keys(prog)) {
    const d = prog[k];
    for (const e of (d?.evidence ?? [])) {
      for (const s of (e?.skills ?? [])) {
        const cur = evBySkill.get(s) ?? { count: 0, lastAt: '' };
        cur.count += 1;
        if (typeof e.createdAt === 'string' && e.createdAt > cur.lastAt) cur.lastAt = e.createdAt;
        evBySkill.set(s, cur);
      }
    }
  }

  return skills.map((sk) => {
    const sdays = days.filter((d) => d.skill === sk.id);
    let done = 0, started = 0, toReview = 0, lastAt = '';
    for (const d of sdays) {
      const p = prog[String(d.day)];
      const st = p?.status;
      if (st === 'done') done += 1;
      if (st && st !== 'not-started') started += 1;
      if (st === 'to-review') toReview += 1;
      if (typeof p?.updatedAt === 'string' && p.updatedAt > lastAt) lastAt = p.updatedAt;
    }
    const ev = evBySkill.get(sk.id) ?? { count: 0, lastAt: '' };
    if (ev.lastAt > lastAt) lastAt = ev.lastAt;
    return {
      id: sk.id,
      name: sk.name,
      daysAssociated: sdays.length,
      daysDone: done,
      evidenceCount: ev.count,
      lastActivityAt: lastAt || null,
      state: skillState({ daysDone: done, daysStarted: started, evidenceCount: ev.count, hasToReview: toReview > 0 }),
    };
  });
}
