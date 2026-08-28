// Learning Experience — READ-MODEL PUR et DÉRIVÉ.
//
// V41 l'a créé au-dessus de `skill-state.mjs`. V65 a introduit le modèle
// canonique (preuve → projection) et l'a câblé sur `/skills` et `/history`,
// mais a laissé CE module — donc le Dashboard et la Synthèse — sur l'ancien.
// Le produit affichait alors deux réponses à la même question : au CP0 de
// V65.1, **20 compétences sur 20 divergeaient, dont 8 sémantiquement**, et
// quatre compétences réellement démontrées étaient annoncées « Non abordée »
// sur le tableau de bord.
//
// V65.1 · CP2 : ce module ne détient plus aucun modèle. Il COMPOSE le modèle
// canonique (`competency.mjs` au-dessus de `evidence.mjs`) en réponses
// actionnables :
//   - nextBestActions  : quoi faire ensuite, avec raison et preuve attendue ;
//   - evidenceTimeline : d'où vient la progression — LE LEDGER, pas les
//                        preuves héritées par journée ;
//   - milestones       : jalons reliés à de VRAIES preuves.
//
// `explainSkillState` a été SUPPRIMÉ : expliquer un état est le travail de
// `whyCompetencyState` (competency.mjs), et deux explicateurs sont deux
// vérités. La prochaine action vit désormais dans `nextActionForCompetency`,
// à côté de l'état qu'elle commente.
//
// AUCUNE « IA », aucun XP, aucun second moteur. PUR : aucune I/O, aucune
// horloge implicite (injectée), aucune écriture.

import { createLedger, projectCompetencies, nextActionForCompetency } from './competency.mjs';
import { isQualifying } from './evidence.mjs';
import { getDueReviews } from './review.mjs';

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const isStr = (v) => typeof v === 'string';

// Priorités documentées de « next best action », du plus urgent au moins urgent.
// `consolidate` couvre une révision due ; `demonstrate` une compétence dont les
// traces n'ont pas encore été validées ; `practice` une compétence sans trace.
export const NEXT_ACTION_PRIORITIES = ['remediation', 'review', 'consolidate', 'demonstrate', 'practice', 'resume'];

/** Le « kind » d'une action se déduit de l'état projeté, pas d'un compteur. */
const KIND_BY_STATE = {
  unassessed: 'practice',
  practiced: 'demonstrate',
  demonstrated: 'consolidate',
  reinforced: null, // une compétence consolidée n'appelle pas d'action inventée
};

/**
 * Projette les compétences du programme depuis le ledger canonique.
 * Un seul endroit fait ce travail dans ce module.
 */
function project(program, progress, ctx = {}) {
  const ledger = createLedger(progress?.evidence ?? []);
  const skills = Array.isArray(program?.skills) ? program.skills : [];
  return { ledger, competencies: projectCompetencies(skills, ledger, ctx) };
}

/**
 * Liste priorisée et EXPLICABLE de « prochaines actions ». Chaque action porte
 * une raison, un objectif pédagogique et la preuve attendue. Déterministe.
 * Jamais une « recommandation IA ».
 * `ctx` optionnel : { reviews, resume, remediations, now, limit, dueDays,
 * reviewFlaggedDays }.
 */
export function nextBestActions(program, progress, ctx = {}) {
  const out = [];
  const days = isObj(progress?.days) ? progress.days : {};
  const now = ctx.now instanceof Date ? ctx.now : new Date();
  const limit = Number.isFinite(ctx.limit) ? ctx.limit : 6;

  // 1. Remédiation explicite (échec de diagnostic/capstone) — seulement si fournie.
  for (const r of Array.isArray(ctx.remediations) ? ctx.remediations : []) {
    if (!isObj(r) || !isStr(r.action)) continue;
    out.push({
      kind: 'remediation', action: r.action,
      reason: r.reason ?? 'échec récent à remédier',
      goal: r.goal ?? 'combler une lacune identifiée',
      expectedEvidence: r.expectedEvidence ?? 'nouvelle tentative réussie',
      href: r.href ?? '/capstones',
    });
  }

  // 2. Révisions arrivées à échéance — un fait daté, pas une suggestion.
  const due = (ctx.reviews ?? getDueReviews(days, now)).slice(0, 3);
  for (const d of due) {
    out.push({
      kind: 'review', action: `Réviser le jour ${d.day}`,
      reason: d.overdueDays > 0 ? `révision en retard de ${d.overdueDays} j` : 'révision arrivée à échéance aujourd’hui',
      goal: 'consolider un acquis par rappel espacé',
      expectedEvidence: 'révision honorée (prochaine échéance recalculée)',
      href: '/revisions',
    });
  }

  // 3. Signaux dérivés des ÉTATS PROJETÉS — le même calcul que /skills.
  const { competencies } = project(program, progress, ctx);
  for (const kind of ['consolidate', 'demonstrate', 'practice']) {
    for (const c of competencies) {
      if (KIND_BY_STATE[c.state] !== kind) continue;
      const a = nextActionForCompetency(c);
      if (a) out.push({ kind, ...a });
    }
  }

  // 4. Reprise du parcours actif (si fournie).
  if (isObj(ctx.resume) && Number.isFinite(ctx.resume.day)) {
    out.push({
      kind: 'resume',
      action: `Reprendre le jour ${ctx.resume.day}${ctx.resume.title ? ` — ${ctx.resume.title}` : ''}`,
      reason: 'progression du parcours actif',
      goal: 'avancer dans le parcours',
      expectedEvidence: 'journée terminée',
      href: `/day/${ctx.resume.day}`,
    });
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
 * Historique des preuves — LE LEDGER CANONIQUE, tri décroissant par date.
 *
 * Avant V65.1, cette fonction balayait `days[N].evidence[]`, c'est-à-dire les
 * preuves héritées par journée, étiquetées avec le vocabulaire FIN
 * (`javascript`, `linux`, `hashmap`). La Synthèse affichait donc
 * « javascript · algo » quand `/skills` affichait « JavaScript / TypeScript »,
 * et le jalon « transfert multi-domaines » comptait 12 compétences là où le
 * ledger en connaissait 8. Une seule liste, un seul vocabulaire.
 *
 * AUCUNE écriture, aucun store nouveau. `limit` borne la sortie.
 */
export function evidenceTimeline(progress, _program, ctx = {}) {
  const limit = Number.isFinite(ctx.limit) ? ctx.limit : 100;
  const ledger = createLedger(progress?.evidence ?? []);
  return ledger.all()
    .map((e) => ({
      id: e.id,
      createdAt: e.createdAt,
      type: e.sourceType,
      sourceId: e.sourceId,
      title: e.title,
      skills: e.competencyIds,
      day: e.dayId ?? null,
      qualifying: isQualifying(e),
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))
    .slice(0, limit);
}

// Jalons DÉTERMINISTES fondés sur des faits réels. Chacun a un prédicat sur le
// ledger ou les états projetés. AUCUN XP, aucune monnaie, aucun niveau.
export const MILESTONE_DEFS = [
  { id: 'first-evidence', label: 'Première preuve enregistrée', description: 'Une première trace concrète (exercice, diagnostic, mission, capstone, travail rendu) est enregistrée.' },
  { id: 'first-skill-demonstrated', label: 'Première compétence démontrée', description: 'Une compétence atteint l\'état « Démontrée » : au moins une validation réussie.' },
  { id: 'first-diagnostic', label: 'Premier diagnostic passé', description: 'Un diagnostic a été passé et son résultat conservé.' },
  { id: 'first-capstone', label: 'Premier capstone terminé', description: 'Une simulation professionnelle (capstone) est réussie.' },
  { id: 'multi-domain', label: 'Transfert multi-domaines', description: 'Des preuves qualifiantes couvrent plusieurs compétences du programme.' },
];

/**
 * Jalons atteints / à atteindre, dérivés des preuves et des états projetés. Un
 * jalon `achieved` porte toujours un `why` et un `achievedAt` issus d'un fait
 * réel. PUR.
 */
export function milestones(program, progress, ctx = {}) {
  const timeline = evidenceTimeline(progress, program, { limit: 10000 });
  const { competencies } = project(program, progress, ctx);
  const oldestWhere = (pred) => [...timeline].reverse().find(pred) || null;
  const out = [];

  const add = (def, achieved, achievedAt, why) => out.push({
    id: def.id, label: def.label, description: def.description,
    achieved: !!achieved,
    achievedAt: achieved ? (achievedAt || null) : null,
    why: achieved ? why : '',
  });

  const firstEv = oldestWhere(() => true);
  add(MILESTONE_DEFS[0], !!firstEv, firstEv?.createdAt, firstEv ? `preuve « ${firstEv.title || firstEv.sourceId} »` : '');

  // La PREMIÈRE démonstration est datée par la preuve qui l'a produite, pas par
  // la dernière activité de la compétence : V65 datait ce jalon au 27 août pour
  // une première démonstration du 16 (CP0).
  const firstQualified = oldestWhere((e) => e.qualifying);
  const demonstrated = competencies.find((c) => c.state === 'demonstrated' || c.state === 'reinforced');
  add(MILESTONE_DEFS[1], !!(demonstrated && firstQualified), firstQualified?.createdAt,
    demonstrated ? `${demonstrated.name ?? demonstrated.competencyId} repose sur au moins une validation réussie` : '');

  const firstDiag = oldestWhere((e) => e.type === 'assessment');
  add(MILESTONE_DEFS[2], !!firstDiag, firstDiag?.createdAt, firstDiag ? `diagnostic « ${firstDiag.title || firstDiag.sourceId} »` : '');

  const firstCap = oldestWhere((e) => e.type === 'capstone');
  add(MILESTONE_DEFS[3], !!firstCap, firstCap?.createdAt, firstCap ? `capstone « ${firstCap.title || firstCap.sourceId} »` : '');

  // « Multi-domaines » compte des COMPÉTENCES DU PROGRAMME réellement
  // démontrées, pas des étiquettes fines croisées.
  const covered = competencies.filter((c) => c.qualifyingEvidenceCount > 0);
  const multi = covered.length >= 2;
  add(MILESTONE_DEFS[4], multi, multi ? oldestWhere((e) => e.qualifying)?.createdAt : null,
    multi ? `preuves qualifiantes sur ${covered.length} compétences du programme` : '');

  return out;
}

/** Synthèse compacte de l'expérience (bloc « Aujourd'hui »). Dérivée. */
export function experienceSummary(program, progress, ctx = {}) {
  const actions = nextBestActions(program, progress, ctx);
  const ms = milestones(program, progress, ctx);
  const nextMilestone = ms.find((m) => !m.achieved) ?? null;
  return {
    actions,
    nextMilestone,
    milestonesAchieved: ms.filter((m) => m.achieved).length,
    milestonesTotal: ms.length,
  };
}
