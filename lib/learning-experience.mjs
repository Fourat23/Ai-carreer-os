// Learning Experience — READ-MODEL PUR et DÉRIVÉ (V41). Ce module ne détient AUCUNE
// vérité propre : il COMPOSE les sorties existantes (skill-state, evidence des jours,
// review) en réponses actionnables et EXPLICABLES pour l'apprenant :
//   - explainSkillState : pourquoi une compétence est dans tel état ;
//   - nextBestActions  : quoi faire ensuite (déterministe, avec raison + preuve attendue) ;
//   - evidenceTimeline : d'où vient la progression (historique des preuves) ;
//   - milestones       : jalons qualitatifs reliés à de VRAIES preuves.
// AUCUNE « IA », aucun XP/score inventé, aucun second moteur. PUR : aucun I/O, aucune
// horloge implicite (injectée), aucune écriture. Les états restent ceux de skill-state.
import { skillStats, SKILL_STATES, SKILL_STATE_LABEL } from './skill-state.mjs';
import { getDueReviews } from './review.mjs';

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const isStr = (v) => typeof v === 'string';

// Priorités documentées de « next best action » (cf. ADR-041 D3), du plus urgent au moins urgent.
export const NEXT_ACTION_PRIORITIES = ['remediation', 'review', 'consolidate', 'demonstrate', 'practice', 'resume'];

/**
 * Explique l'état d'UNE compétence à partir d'un élément de skillStats. Dérive des
 * RAISONS textuelles des signaux existants (jours, preuves, révision) ; ne change
 * aucune règle d'état. Renvoie aussi la prochaine action pour progresser.
 * @param {{id,name,daysDone,evidenceCount,state,daysAssociated,lastActivityAt}} stat
 */
export function explainSkillState(stat) {
  const s = isObj(stat) ? stat : {};
  const state = SKILL_STATES.includes(s.state) ? s.state : 'not-started';
  const label = SKILL_STATE_LABEL[state] ?? state;
  const daysDone = Number.isFinite(s.daysDone) ? s.daysDone : 0;
  const evidenceCount = Number.isFinite(s.evidenceCount) ? s.evidenceCount : 0;
  const reasons = [];

  if (state === 'not-started') {
    reasons.push('aucune activité enregistrée pour l\'instant');
  } else {
    if (daysDone > 0) reasons.push(`${daysDone} journée${daysDone > 1 ? 's' : ''} terminée${daysDone > 1 ? 's' : ''}`);
    if (evidenceCount > 0) reasons.push(`${evidenceCount} preuve${evidenceCount > 1 ? 's' : ''} concrète${evidenceCount > 1 ? 's' : ''} enregistrée${evidenceCount > 1 ? 's' : ''}`);
    if (state === 'discovered') reasons.push('abordée, mais moins de 3 journées terminées et aucune preuve');
    if (state === 'practiced') reasons.push('pratiquée (≥ 3 journées) mais aucune preuve concrète encore');
    if (state === 'to-consolidate') reasons.push('au moins une révision est en attente sur ce sujet');
    if (state === 'demonstrated' && evidenceCount === 0) reasons.push('preuve enregistrée');
  }

  return {
    id: isStr(s.id) ? s.id : '',
    name: isStr(s.name) ? s.name : (isStr(s.id) ? s.id : ''),
    state,
    label,
    reasons,
    toConsolidate: state === 'to-consolidate',
    nextAction: nextActionForState(state, s),
  };
}

/** Prochaine action pour faire progresser une compétence donnée. Déterministe. */
function nextActionForState(state, s) {
  const name = isStr(s.name) ? s.name : (isStr(s.id) ? s.id : 'cette compétence');
  switch (state) {
    case 'not-started':
      return { action: `Commencer une leçon liée à ${name}`, reason: 'aucune activité enregistrée', goal: 'not-started → discovered', expectedEvidence: 'journée travaillée', href: '/lessons' };
    case 'discovered':
      return { action: `Pratiquer ${name} sur un exercice ou un Lab`, reason: 'abordée mais peu pratiquée', goal: 'discovered → practiced', expectedEvidence: 'exercice réussi (preuve)', href: '/lab' };
    case 'practiced':
      return { action: `Démontrer ${name} via un diagnostic ou un capstone`, reason: 'pratiquée mais jamais démontrée par une preuve', goal: 'practiced → demonstrated', expectedEvidence: 'preuve de type diagnostic/capstone', href: '/diagnostics' };
    case 'to-consolidate':
      return { action: `Réviser ${name} maintenant`, reason: 'une révision est arrivée à échéance', goal: 'to-consolidate → demonstrated', expectedEvidence: 'révision honorée', href: '/revisions' };
    case 'demonstrated':
      return { action: `Entretenir ${name} par une révision espacée`, reason: 'compétence démontrée : maintenir l\'acquis', goal: 'maintenir demonstrated', expectedEvidence: 'révision honorée', href: '/revisions' };
    default:
      return null;
  }
}

/**
 * Liste priorisée et EXPLICABLE de « prochaines actions ». Chaque action porte une
 * raison, un objectif pédagogique et la preuve attendue. Déterministe. Jamais une
 * « recommandation IA ». `ctx` optionnel : { reviews, resume, remediations, now, limit }.
 */
export function nextBestActions(program, progress, ctx = {}) {
  const out = [];
  const days = isObj(progress?.days) ? progress.days : {};
  const now = ctx.now instanceof Date ? ctx.now : new Date();
  const limit = Number.isFinite(ctx.limit) ? ctx.limit : 6;

  // 1. Remédiation explicite (issue d'un échec de diagnostic/capstone) — seulement si fournie.
  for (const r of Array.isArray(ctx.remediations) ? ctx.remediations : []) {
    if (!isObj(r) || !isStr(r.action)) continue;
    out.push({ kind: 'remediation', action: r.action, reason: r.reason ?? 'échec récent à remédier', goal: r.goal ?? 'combler une lacune identifiée', expectedEvidence: r.expectedEvidence ?? 'nouvelle tentative réussie', href: r.href ?? '/capstones' });
  }

  // 2. Révisions arrivées à échéance.
  const due = (ctx.reviews ?? getDueReviews(days, now)).slice(0, 3);
  for (const d of due) {
    out.push({ kind: 'review', action: `Réviser le jour ${d.day}`, reason: d.overdueDays > 0 ? `révision en retard de ${d.overdueDays} j` : 'révision arrivée à échéance aujourd\'hui', goal: 'consolider un acquis par rappel espacé', expectedEvidence: 'révision honorée (prochaine échéance recalculée)', href: '/revisions' });
  }

  // 3-5. Signaux dérivés des états de compétence.
  const stats = skillStats(program, progress);
  const pushSkill = (kind, stat) => {
    const ex = explainSkillState(stat);
    if (ex.nextAction) out.push({ kind, ...ex.nextAction });
  };
  for (const st of stats) if (st.state === 'to-consolidate') pushSkill('consolidate', st);
  for (const st of stats) if (st.state === 'practiced') pushSkill('demonstrate', st);
  for (const st of stats) if (st.state === 'discovered') pushSkill('practice', st);

  // 6. Reprise du parcours actif (si fournie).
  if (isObj(ctx.resume) && Number.isFinite(ctx.resume.day)) {
    out.push({ kind: 'resume', action: `Reprendre le jour ${ctx.resume.day}${ctx.resume.title ? ` — ${ctx.resume.title}` : ''}`, reason: 'progression du parcours actif', goal: 'avancer dans le parcours', expectedEvidence: 'journée terminée', href: `/day/${ctx.resume.day}` });
  }

  // Ordonner par priorité documentée, dédupliquer par (kind, action), borner.
  out.sort((a, b) => NEXT_ACTION_PRIORITIES.indexOf(a.kind) - NEXT_ACTION_PRIORITIES.indexOf(b.kind));
  const seen = new Set();
  const deduped = [];
  for (const a of out) {
    const key = `${a.kind}|${a.action}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(a);
  }
  return deduped.slice(0, limit);
}

/**
 * Historique des preuves, dérivé des evidence déjà stockées dans les jours. Tri
 * décroissant par date. AUCUNE écriture, aucun store nouveau. `limit` borne la sortie.
 */
export function evidenceTimeline(progress, _program, ctx = {}) {
  const days = isObj(progress?.days) ? progress.days : {};
  const limit = Number.isFinite(ctx.limit) ? ctx.limit : 100;
  const items = [];
  for (const k of Object.keys(days)) {
    if (!/^\d+$/.test(k)) continue;
    for (const e of Array.isArray(days[k]?.evidence) ? days[k].evidence : []) {
      if (!isObj(e)) continue;
      items.push({
        createdAt: isStr(e.createdAt) ? e.createdAt : '',
        type: isStr(e.type) ? e.type : 'other',
        title: isStr(e.title) ? e.title : '',
        skills: Array.isArray(e.skills) ? e.skills.filter(isStr) : [],
        day: Number(k),
      });
    }
  }
  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : a.day - b.day));
  return items.slice(0, limit);
}

// Jalons DÉTERMINISTES fondés sur des faits de progression réels. Chacun a un prédicat
// sur la timeline/les états. AUCUN XP, aucune monnaie, aucun niveau numérique.
export const MILESTONE_DEFS = [
  { id: 'first-evidence', label: 'Première preuve enregistrée', description: 'Une première preuve concrète (exercice, diagnostic, mission ou capstone) est enregistrée.' },
  { id: 'first-skill-demonstrated', label: 'Première compétence démontrée', description: 'Une compétence atteint l\'état « Démontrée ».' },
  { id: 'first-diagnostic', label: 'Premier diagnostic passé', description: 'Une preuve de type diagnostic est enregistrée.' },
  { id: 'first-capstone', label: 'Premier capstone terminé', description: 'Une simulation professionnelle (capstone) est réussie.' },
  { id: 'multi-domain', label: 'Transfert multi-domaines', description: 'Des preuves couvrent des compétences de plusieurs domaines.' },
];

/**
 * Jalons atteints/à atteindre, dérivés des preuves et des états. Un jalon `achieved`
 * porte toujours un `why` et un `achievedAt` issus d'un fait réel. PUR.
 */
export function milestones(program, progress, ctx = {}) {
  const timeline = evidenceTimeline(progress, program, { limit: 1000 });
  const stats = skillStats(program, progress);
  const firstOf = (pred) => [...timeline].reverse().find(pred) || null; // plus ancienne correspondance
  const out = [];

  const add = (def, achieved, achievedAt, why) =>
    out.push({ id: def.id, label: def.label, description: def.description, achieved: !!achieved, achievedAt: achieved ? (achievedAt || null) : null, why: achieved ? why : '' });

  const firstEv = firstOf(() => true);
  add(MILESTONE_DEFS[0], !!firstEv, firstEv?.createdAt, firstEv ? `preuve « ${firstEv.title || firstEv.type} »` : '');

  const demonstrated = stats.find((s) => s.state === 'demonstrated');
  add(MILESTONE_DEFS[1], !!demonstrated, demonstrated?.lastActivityAt, demonstrated ? `${demonstrated.name} atteint l'état Démontrée` : '');

  const firstDiag = firstOf((e) => e.type === 'assessment');
  add(MILESTONE_DEFS[2], !!firstDiag, firstDiag?.createdAt, firstDiag ? `diagnostic « ${firstDiag.title} »` : '');

  const firstCap = firstOf((e) => e.type === 'capstone');
  add(MILESTONE_DEFS[3], !!firstCap, firstCap?.createdAt, firstCap ? `capstone « ${firstCap.title} »` : '');

  const domainSkills = new Set();
  for (const e of timeline) for (const sk of e.skills) domainSkills.add(sk);
  const multi = domainSkills.size >= 2 && timeline.length >= 2;
  add(MILESTONE_DEFS[4], multi, multi ? timeline[0]?.createdAt : null, multi ? `preuves couvrant ${domainSkills.size} compétences` : '');

  return out;
}

/** Synthèse compacte de l'expérience (pour un bloc « Aujourd'hui »). Dérivée. */
export function experienceSummary(program, progress, ctx = {}) {
  const actions = nextBestActions(program, progress, ctx);
  const ms = milestones(program, progress, ctx);
  const nextMilestone = ms.find((m) => !m.achieved) ?? null;
  const achieved = ms.filter((m) => m.achieved).length;
  return { actions, nextMilestone, milestonesAchieved: achieved, milestonesTotal: ms.length };
}
