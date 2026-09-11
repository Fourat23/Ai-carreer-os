// V75 · CP0.A — BACKLOG FORENSICS SUR 20 PROFILS. LECTURE SEULE.
//
// Rejoue les 8 profils de V74 (A→H) et en ajoute 12 plus sévères (I→T), tous
// passant par la VRAIE chaîne du produit : learner-memory → priorité →
// scheduler → plan de journée. Aucun simulateur parallèle.
//
// ── CE QUE CETTE SONDE NE FAIT PAS ───────────────────────────────────────
//
// Elle ne conclut PAS ce qu'est un arriéré « acceptable ». Le brief l'interdit
// explicitement avant le CP1 : *mesurer*, puis geler les seuils au CP1, et
// seulement ensuite juger. Poser le seuil après avoir vu les chiffres serait
// exactement le contournement que V74 a nommé G11.
//
// Déterminisme : générateur à graine, aucun `Math.random`.
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { projectLearnerMemory } from '../../lib/learner-memory.mjs';
import { planifier, echeanceDe } from '../../lib/retention-scheduler.mjs';
import { comptesParStatut } from '../../lib/retention-priority.mjs';
import { planDuJour } from '../../lib/daily-plan.mjs';
import { remedier } from '../../lib/remediation.mjs';
import { availableFormats, projectRecall, normalizeAttempts } from '../../lib/retention.mjs';

const ROOT = process.cwd();
const DAY_MS = 86_400_000;
const pad3 = (n) => String(n).padStart(3, '0');
const rng = (g) => { let s = g >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

// ── Contexte curriculaire ────────────────────────────────────────────────
const program = JSON.parse(readFileSync(join(ROOT, 'data', 'program.json'), 'utf8'));
const lessons = program.lessons ?? [];
const connus = new Set(lessons.map((l) => l.slug));
const conceptDays = {};
for (const l of lessons) conceptDays[l.slug] = [];
const titresDe = new Map();
for (const l of lessons) {
  const p = join(ROOT, 'curriculum', 'lessons', `${l.slug}.md`);
  titresDe.set(l.slug, existsSync(p) ? [...readFileSync(p, 'utf8').matchAll(/^## +(.+)$/gm)].map((m) => m[1]) : []);
}
for (const d of program.days) {
  const p = join(ROOT, 'curriculum', 'days', `day-${pad3(d.day)}.md`);
  if (!existsSync(p)) continue;
  for (const s of new Set([...readFileSync(p, 'utf8').matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))) {
    if (connus.has(s)) conceptDays[s].push(d.day);
  }
}
const conceptSkills = Object.fromEntries(lessons.map((l) => [l.slug, l.skills ?? []]));
const dayConcepts = {};
for (const [c, ds] of Object.entries(conceptDays)) {
  for (const d of ds) { if (!dayConcepts[d]) dayConcepts[d] = []; dayConcepts[d].push(c); }
}
const projectDays = program.days.filter((d) => d.project != null).map((d) => d.day);
const formatsDe = new Map(lessons.map((l) => [l.slug, availableFormats(titresDe.get(l.slug) ?? [])]));
const charge = new Map();
{
  const p = join(ROOT, 'docs', 'v73', 'charge-365.json');
  if (existsSync(p)) for (const d of JSON.parse(readFileSync(p, 'utf8')).jours ?? []) charge.set(d.j, d.haut);
}
const DEBUT = Date.parse('2026-01-05T08:00:00.000Z');
const projectDaysBySkill = {};
for (const d of program.days) {
  if (d.project == null) continue;
  const sk = new Set();
  for (const c of dayConcepts[d.day] ?? []) for (const s of conceptSkills[c] ?? []) sk.add(s);
  for (const s of sk) { (projectDaysBySkill[s] ??= []).push(d.day); }
}
const SKILLS = [...new Set(Object.values(conceptSkills).flat())];
// `startDate` est INDISPENSABLE : sans lui, `positionDuJour` rend 0, tous les
// projets paraissent futurs et lointains, et le facteur « besoin proche » ne
// peut jamais s'allumer. Le lui passer est ce qui a permis de découvrir que le
// défaut est ailleurs (voir le rapport CP0, défaut P1).
const CTX = { conceptDays, conceptSkills, dayConcepts, projectDays, projectDaysBySkill,
  skills: SKILLS, startDate: new Date(DEBUT).toISOString() };
const FAIBLE = [...new Set(Object.values(conceptSkills).flat())].sort()[0];

// ── Les vingt profils ────────────────────────────────────────────────────
// `ouvre(j)` : travaille-t-il ce jour ? · `reussit(c,j,a)` : retrouve-t-il ?
// `preuve` : laisse-t-il une trace validée ? · `corrigeAvant` : lit-il la
// correction avant d'essayer (ce qui disqualifie la récupération, R-b) ?
export const PROFILS = [
  { id: 'A', nom: 'parfait', ouvre: () => true, reussit: (_c, _j, a) => a() < 0.95, preuve: true },
  { id: 'B', nom: 'irrégulier', ouvre: (j) => j % 7 < 3, reussit: (_c, _j, a) => a() < 0.7, preuve: true },
  { id: 'C', nom: 'nombreux échecs', ouvre: () => true, reussit: (_c, _j, a) => a() < 0.45, preuve: true },
  { id: 'D', nom: 'faible activité', ouvre: (j) => j % 10 === 0, reussit: (_c, _j, a) => a() < 0.6, preuve: false },
  { id: 'E', nom: 'rapide', ouvre: () => true, reussit: (_c, j, a) => a() < Math.min(0.95, 0.5 + j / 300), preuve: true },
  { id: 'F', nom: 'oublis sélectifs', ouvre: () => true, reussit: (c, _j, a) => ((conceptSkills[c] ?? []).includes(FAIBLE) ? a() < 0.2 : a() < 0.9), preuve: true },
  { id: 'G', nom: 'reprise après 30 j', ouvre: (j) => j < 90 || j > 120, reussit: (_c, _j, a) => a() < 0.8, preuve: true },
  { id: 'H', nom: 'sans preuves', ouvre: () => true, reussit: (_c, _j, a) => a() < 0.85, preuve: false },
  // ── Nouveaux, V75 ──
  { id: 'I', nom: 'absence 7 jours', ouvre: (j) => !(j > 100 && j <= 107), reussit: (_c, _j, a) => a() < 0.8, preuve: true },
  { id: 'J', nom: 'absence 14 jours', ouvre: (j) => !(j > 100 && j <= 114), reussit: (_c, _j, a) => a() < 0.8, preuve: true },
  { id: 'K', nom: 'absence 60 jours', ouvre: (j) => !(j > 100 && j <= 160), reussit: (_c, _j, a) => a() < 0.8, preuve: true },
  { id: 'L', nom: '30 % de réussite', ouvre: () => true, reussit: (_c, _j, a) => a() < 0.3, preuve: true },
  { id: 'M', nom: '50 % de réussite', ouvre: () => true, reussit: (_c, _j, a) => a() < 0.5, preuve: true },
  { id: 'N', nom: '70 % de réussite', ouvre: () => true, reussit: (_c, _j, a) => a() < 0.7, preuve: true },
  { id: 'O', nom: 'très fort mais intermittent', ouvre: (j) => j % 5 < 2, reussit: (_c, _j, a) => a() < 0.95, preuve: true },
  { id: 'P', nom: 'suit les jours, saute la pratique', ouvre: () => true, reussit: (_c, _j, a) => a() < 0.75, preuve: false, sautePratique: true },
  { id: 'Q', nom: 'lit la correction avant d’essayer', ouvre: () => true, reussit: (_c, _j, a) => a() < 0.75, preuve: true, corrigeAvant: true },
  { id: 'R', nom: 'recall OK, transfert KO', ouvre: () => true, reussit: (_c, _j, a) => a() < 0.9, preuve: true, transfertKO: true },
  { id: 'S', nom: 'rapide puis arrêt 90 j', ouvre: (j) => j <= 120 || j > 210, reussit: (_c, _j, a) => a() < 0.9, preuve: true },
  { id: 'T', nom: 'reprend au jour 250, fondations fragiles', ouvre: (j) => j <= 30 || j > 250, reussit: (_c, _j, a) => a() < 0.5, preuve: true },
];

export function simuler(profil, { jours = 365, budget = 20, graine = 1975 } = {}) {
  const alea = rng(graine);
  const recallAttempts = [];
  const exerciseAttempts = [];
  const evidence = [];
  const days = {};

  const propositions = new Map();
  const serieBacklog = [];
  let minutesDemandees = 0;
  let unitesDifferees = 0;
  let nouveauxContenus = 0;
  let echecs = 0;
  let reussites = 0;
  let remediations = 0;
  let joursActifs = 0;
  let dernierStatuts = {};
  let bloquantesMax = 0;

  for (let j = 1; j <= jours; j += 1) {
    const now = new Date(DEBUT + (j - 1) * DAY_MS).toISOString();
    if (!profil.ouvre(j)) { serieBacklog.push(serieBacklog.at(-1) ?? 0); continue; }
    joursActifs += 1;
    nouveauxContenus += 1;
    days[j] = { status: 'done', startedAt: now, completedAt: now, updatedAt: now,
      // Profil Q : la correction est ouverte AVANT la tentative (R-b).
      ...(profil.corrigeAvant ? { correctionState: 'viewed' } : {}) };

    const proj = projectLearnerMemory({ facts: { days, recallAttempts, exerciseAttempts, evidence }, context: CTX, now });
    const fiches = proj.concepts.filter((f) => f.firstExposureAt);
    if (!fiches.length) { serieBacklog.push(0); continue; }

    const cpt = comptesParStatut(fiches, { dueAtOf: (id) => echeanceDe(fiches.find((f) => f.id === id))?.dueAt ?? null, now });
    dernierStatuts = cpt;
    const arriere = (cpt.DUE ?? 0) + (cpt.OVERDUE ?? 0);
    serieBacklog.push(arriere);

    const parConcept = new Map();
    for (const a of recallAttempts) {
      if (!parConcept.has(a.conceptId)) parConcept.set(a.conceptId, []);
      parConcept.get(a.conceptId).push(a);
    }

    const plan = planDuJour({
      fiches, chargeHaut: charge.get(j) ?? null, arriere, tendance: null, now,
      planifierAvec: planifier,
      optionsScheduler: {
        formatsOf: (id) => formatsDe.get(id) ?? [],
        recallOf: (id) => projectRecall(id, normalizeAttempts(parConcept.get(id) ?? [])),
      },
    });
    // ── Compétences BLOQUANTES, mesurées PENDANT le parcours ──
    // Les mesurer à la fin donnait 0 partout, et pour une raison triviale : au
    // jour 365 aucun projet n'est plus « à venir ». C'est la troisième version
    // de cette sonde ; les deux premières mesuraient le mauvais grain, puis le
    // mauvais moment.
    {
      const enRetardSkills = new Set();
      for (const f of fiches) {
        const e = echeanceDe(f);
        if (e && Date.parse(e.dueAt) <= Date.parse(now)) {
          for (const sk of conceptSkills[f.id] ?? []) enRetardSkills.add(sk);
        }
      }
      let n = 0;
      for (const k of proj.competencies) {
        if (k.nextCurriculumNeed && k.nextCurriculumNeed.inDays <= 30 && enRetardSkills.has(k.id)) n += 1;
      }
      if (n > bloquantesMax) bloquantesMax = n;
    }
    minutesDemandees += plan.reactivation.minutesAccordees;
    unitesDifferees += plan.seance.differes.length;

    for (const it of plan.seance.items) {
      if (!propositions.has(it.id)) propositions.set(it.id, []);
      propositions.get(it.id).push(j);
      const ok = profil.reussit(it.id, j, alea);
      if (ok) reussites += 1; else echecs += 1;
      recallAttempts.push({
        conceptId: it.id, at: now, format: it.format,
        outcome: ok ? 'recalled' : 'failed', provenance: { producer: 'cp0-v75', method: 'sim' },
      });
      if (ok && profil.preuve && alea() < 0.3) {
        evidence.push({ id: `ev-${it.id}-${j}`, sourceType: 'exercise', sourceId: it.id,
          competencyIds: conceptSkills[it.id] ?? [], createdAt: now, dayId: j,
          validation: { status: 'passed', kind: 'exercise-tests', checkedAt: now } });
      }
      // Profil P : suit les journées mais ne pratique pas → aucune tentative
      // d'exercice, donc aucun verdict objectif.
      if (!profil.sautePratique && alea() < 0.25) {
        const passed = ok ? 3 : 1;
        exerciseAttempts.push({ exerciseId: `ex-${it.id}`, at: now, passed, total: 3, phase: 'run',
          dayRefs: [j], correctionSeen: !!profil.corrigeAvant,
          provenance: { producer: 'cp0-v75', method: 'sim' } });
        if (!ok) {
          const r = remedier({ attempts: exerciseAttempts, exerciseId: `ex-${it.id}`, now,
            sections: { modeleMental: true, erreurs: true, exempleGuide: true, correction: true },
            testsEchoues: [{ name: 'cas limite' }] });
          if (r) remediations += 1;
        }
      }
    }
  }

  const projFinal = projectLearnerMemory({
    facts: { days, recallAttempts, exerciseAttempts, evidence }, context: CTX,
    now: new Date(DEBUT + jours * DAY_MS).toISOString(),
  });
  const rencontrees = projFinal.concepts.filter((f) => f.firstExposureAt);

  // Starvation : jours ACTIFS écoulés depuis la 1ʳᵉ exposition d'une notion
  // jamais proposée. La distinction « pas encore son tour » / « famine » vient
  // de V74 · CP13 et reste valable.
  const joursOuverts = Object.keys(days).map(Number).sort((a, b) => a - b);
  const attente = rencontrees.filter((f) => !propositions.has(f.id))
    .map((f) => joursOuverts.filter((j) => DEBUT + (j - 1) * DAY_MS >= Date.parse(f.firstExposureAt)).length);

  // Compétences BLOQUANTES : celles dont au moins une notion est en retard ET
  // qu'un projet à venir exigera. Mesure, pas jugement.
  // ANOMALIE DE SONDE V75 n° 1, corrigée ici : cette mesure lisait
  // `nextCurriculumNeed` sur les CONCEPTS, où il vaut toujours `null` — le
  // champ n'est rempli que sur les COMPÉTENCES. Elle rendait 0 pour les vingt
  // profils et ne mesurait rien.



  // Temps pour « revenir sous contrôle » : nombre de jours actifs nécessaires
  // pour que l'arriéré redescende sous son quart maximal après le pic. `null`
  // s'il n'y redescend jamais — et `null` est une réponse, pas un manque.
  const pic = Math.max(...serieBacklog, 0);
  const iPic = serieBacklog.indexOf(pic);
  const cible = Math.floor(pic / 4);
  let retour = null;
  for (let i = iPic; i < serieBacklog.length; i += 1) {
    if (serieBacklog[i] <= cible) { retour = i - iPic; break; }
  }

  return {
    id: profil.id, nom: profil.nom,
    rencontrees: rencontrees.length,
    backlogMax: pic,
    backlogFinal: serieBacklog.at(-1) ?? 0,
    partDuCorpus: rencontrees.length ? Math.round(pic / rencontrees.length * 100) : 0,
    DUE: dernierStatuts.DUE ?? 0,
    OVERDUE: dernierStatuts.OVERDUE ?? 0,
    UNKNOWN: dernierStatuts.UNKNOWN ?? 0,
    minutesDemandees, unitesDifferees, nouveauxContenus,
    echecs, reussites, remediations, joursActifs,
    starvationMax: attente.length ? Math.max(...attente) : 0,
    jamaisProposees: attente.length,
    competencesBloquantes: bloquantesMax,
    retourSousControle: retour,
  };
}

if (process.argv[1] && process.argv[1].endsWith('cp0-backlog.mjs')) {
  console.log('# V75 · CP0.A — BACKLOG FORENSICS, 20 PROFILS (365 jours, budget 20 min)\n');
  console.log('> **Aucun seuil d’acceptabilité n’est posé ici.** Le brief l’interdit avant le CP1 :');
  console.log('> mesurer d’abord, geler les critères ensuite. Poser le seuil après avoir vu les');
  console.log('> chiffres serait le contournement G11.\n');
  console.log('| # | profil | rencontrées | backlog max | % corpus | final | DUE | OVERDUE | jamais prop. | famine max | retour sous contrôle |');
  console.log('|---|---|---|---|---|---|---|---|---|---|---|');
  const tous = [];
  for (const p of PROFILS) {
    const r = simuler(p);
    tous.push(r);
    console.log(`| ${r.id} | ${r.nom} | ${r.rencontrees} | **${r.backlogMax}** | **${r.partDuCorpus} %** | ${r.backlogFinal} | ${r.DUE} | ${r.OVERDUE} | ${r.jamaisProposees} | ${r.starvationMax} j | ${r.retourSousControle == null ? '**jamais**' : `${r.retourSousControle} j`} |`);
  }
  console.log('\n| # | jours actifs | nouveaux contenus | minutes demandées | unités écartées | réussites | échecs | remédiations | compétences bloquantes |');
  console.log('|---|---|---|---|---|---|---|---|---|');
  for (const r of tous) {
    console.log(`| ${r.id} | ${r.joursActifs} | ${r.nouveauxContenus} | ${r.minutesDemandees} | ${r.unitesDifferees} | ${r.reussites} | ${r.echecs} | ${r.remediations} | ${r.competencesBloquantes} |`);
  }
  const pires = [...tous].sort((a, b) => b.partDuCorpus - a.partDuCorpus).slice(0, 5);
  console.log(`\n**Cinq pires taux de saturation** : ${pires.map((r) => `${r.id} ${r.partDuCorpus} %`).join(' · ')}`);
  console.log(`**Profils ne revenant jamais sous contrôle** : ${tous.filter((r) => r.retourSousControle == null).map((r) => r.id).join(' ') || 'aucun'}`);
  mkdirSync(join(ROOT, 'docs', 'v75'), { recursive: true });
  writeFileSync(join(ROOT, 'docs', 'v75', 'cp0-backlog.json'), `${JSON.stringify(tous, null, 1)}\n`);
  console.log('\nécrit : docs/v75/cp0-backlog.json');
}
