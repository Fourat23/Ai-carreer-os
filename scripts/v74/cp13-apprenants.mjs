// V74 · CP13 — HUIT APPRENANTS SYNTHÉTIQUES.
//
// ── UNE SIMULATION N'EST PAS UNE PREUVE D'APPRENTISSAGE ──────────────────
//
// Cette phrase est dans le titre du rapport, et elle doit l'être. Aucun
// apprenant humain n'a suivi ce parcours sous mesure
// (`REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED`, §8.2 du contrat gelé).
// Ce que ce script vérifie n'est donc PAS « le moteur fait apprendre » — cette
// question reste hors de portée. Il vérifie que **le moteur ne se casse pas**
// sur des trajectoires plausibles : pas de boucle, pas d'arriéré explosif, pas
// de répétition quotidienne éternelle, aucune notion abandonnée à jamais.
//
// C'est une propriété de ROBUSTESSE, pas d'efficacité pédagogique. Les
// confondre serait précisément « transformer une heuristique en vérité
// scientifique ».
//
// ── CE QUE LE CP8 N'AVAIT PAS COUVERT ────────────────────────────────────
//
// Les trois apprenants du CP8 ne différaient que par un TAUX DE RÉUSSITE
// CONSTANT. Cela laissait hors champ tout ce qui fait la vie réelle d'un
// parcours : l'irrégularité, l'arrêt puis la reprise, l'oubli sélectif d'un
// domaine, et l'apprenant qui avance sans jamais rien produire. Les profils
// B, D, F, G et H existent pour ça.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { projectLearnerMemory } from '../../lib/learner-memory.mjs';
import { planifier, echeanceDe } from '../../lib/retention-scheduler.mjs';
import { comptesParStatut } from '../../lib/retention-priority.mjs';
import { planDuJour } from '../../lib/daily-plan.mjs';
import { availableFormats, projectRecall, normalizeAttempts } from '../../lib/retention.mjs';

const ROOT = process.cwd();
const DAY_MS = 86_400_000;
const pad3 = (n) => String(n).padStart(3, '0');
const rng = (g) => { let s = g >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

// ── Contexte curriculaire, dérivé des mêmes sources que le produit ───────
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
const CTX = { conceptDays, conceptSkills, dayConcepts, projectDays, skills: [], startDate: null };
const DEBUT = Date.parse('2026-01-05T08:00:00.000Z');

/**
 * ── LES HUIT PROFILS ─────────────────────────────────────────────────────
 *
 * Chaque profil répond à deux questions par jour :
 *   `ouvre(j)`      — l'apprenant travaille-t-il aujourd'hui ?
 *   `reussit(c, j)` — retrouve-t-il cette notion ?
 * et `produitPreuve` dit s'il laisse une trace validée de son travail.
 *
 * Aucun profil n'est « le bon ». Ils servent à casser le moteur, pas à le
 * flatter.
 */
export const PROFILS = [
  {
    id: 'A', nom: 'parfait', desc: 'travaille tous les jours, retrouve presque tout',
    ouvre: () => true, reussit: (_c, _j, a) => a() < 0.95, produitPreuve: true,
  },
  {
    id: 'B', nom: 'irrégulier', desc: 'trois jours sur sept, par à-coups',
    ouvre: (j) => j % 7 < 3, reussit: (_c, _j, a) => a() < 0.7, produitPreuve: true,
  },
  {
    id: 'C', nom: 'nombreux échecs', desc: 'assidu, mais échoue une fois sur deux',
    ouvre: () => true, reussit: (_c, _j, a) => a() < 0.45, produitPreuve: true,
  },
  {
    id: 'D', nom: 'très peu actif', desc: 'un jour sur dix',
    ouvre: (j) => j % 10 === 0, reussit: (_c, _j, a) => a() < 0.6, produitPreuve: false,
  },
  {
    id: 'E', nom: 'progression rapide', desc: 'commence moyen, s’améliore vite',
    ouvre: () => true,
    reussit: (_c, j, a) => a() < Math.min(0.95, 0.5 + j / 300), produitPreuve: true,
  },
  {
    id: 'F', nom: 'oublis sélectifs', desc: 'excellent partout, sauf sur un domaine',
    ouvre: () => true,
    // L'oubli porte sur une COMPÉTENCE entière, choisie par le corpus et non
    // par moi : la première compétence du programme par ordre alphabétique.
    reussit: (c, _j, a) => ((conceptSkills[c] ?? []).includes(CIBLE_FAIBLE) ? a() < 0.2 : a() < 0.9),
    produitPreuve: true,
  },
  {
    id: 'G', nom: 'reprend après 30 jours', desc: 'actif, s’arrête un mois, revient',
    ouvre: (j) => j < 90 || j > 120, reussit: (_c, _j, a) => a() < 0.8, produitPreuve: true,
  },
  {
    id: 'H', nom: 'termine sans preuves', desc: 'avance, mais ne produit jamais de trace validée',
    ouvre: () => true, reussit: (_c, _j, a) => a() < 0.85, produitPreuve: false,
  },
];

export const CIBLE_FAIBLE = [...new Set(Object.values(conceptSkills).flat())].sort()[0];

/** Simule un profil sur `jours` jours, en passant par le VRAI plan de journée. */
export function simulerProfil(profil, { jours = 240, budget = 20, graine = 77 } = {}) {
  const alea = rng(graine);
  const recallAttempts = [];
  const evidence = [];
  const days = {};

  const propositions = new Map();       // concept → [jours où il a été proposé]
  const backlog = [];
  const budgets = [];
  let sansPourquoi = 0;
  let horsBudget = 0;

  for (let j = 1; j <= jours; j += 1) {
    const now = new Date(DEBUT + (j - 1) * DAY_MS).toISOString();
    if (!profil.ouvre(j)) { backlog.push(backlog.at(-1) ?? 0); continue; }

    days[j] = { status: 'done', startedAt: now, completedAt: now, updatedAt: now };

    const proj = projectLearnerMemory({ facts: { days, recallAttempts, exerciseAttempts: [], evidence }, context: CTX, now });
    const fiches = proj.concepts.filter((f) => f.firstExposureAt);
    if (!fiches.length) { backlog.push(0); continue; }

    const cpt = comptesParStatut(fiches, { dueAtOf: (id) => echeanceDe(fiches.find((f) => f.id === id))?.dueAt ?? null, now });
    const arriere = (cpt.DUE ?? 0) + (cpt.OVERDUE ?? 0);
    backlog.push(arriere);

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

    budgets.push(plan.reactivation.minutesAccordees);
    // DEUX vérifications, et la seconde manquait.
    //
    // (a) la séance tient dans le budget qu'on lui a accordé ;
    // (b) le budget accordé tient lui-même dans ce que la JOURNÉE peut donner.
    //
    // La première seule ne mesure presque rien : en neutralisant le plancher du
    // CP10 (une journée déjà à 331 min recevait de nouveau 20 minutes), aucun
    // test du CP13 ne rougissait — la séance respectait toujours le budget
    // qu'on venait de lui donner, aussi faux fût-il. Le contrôle doit porter
    // sur la journée entière, pas sur la cohérence interne du plan.
    const ch = charge.get(j) ?? null;
    if (plan.seance.minutesPlanifiees > plan.reactivation.minutesAccordees) horsBudget += 1;
    else if (ch != null && ch <= 300 && ch + plan.reactivation.minutesAccordees > 300) horsBudget += 1;
    else if (ch != null && ch > 300 && plan.reactivation.minutesAccordees > 0) horsBudget += 1;

    for (const it of plan.seance.items) {
      if (!it.pourquoi || !it.pourquoi.trim()) sansPourquoi += 1;
      if (!propositions.has(it.id)) propositions.set(it.id, []);
      propositions.get(it.id).push(j);

      const ok = profil.reussit(it.id, j, alea);
      recallAttempts.push({
        conceptId: it.id, at: now, format: it.format,
        outcome: ok ? 'recalled' : 'failed',
        provenance: { producer: 'cp13', method: 'synthetique' },
      });
      if (ok && profil.produitPreuve && alea() < 0.3) {
        evidence.push({
          id: `ev-${it.id}-${j}`, sourceType: 'exercise', sourceId: it.id,
          competencyIds: conceptSkills[it.id] ?? [], createdAt: now, dayId: j,
          validation: { status: 'passed', kind: 'exercise-tests', checkedAt: now },
        });
      }
    }
  }

  // ── Les six propriétés à vérifier.
  const projFinal = projectLearnerMemory({
    facts: { days, recallAttempts, exerciseAttempts: [], evidence }, context: CTX,
    now: new Date(DEBUT + jours * DAY_MS).toISOString(),
  });
  const rencontrees = projFinal.concepts.filter((f) => f.firstExposureAt);

  // Une notion « abandonnée » : rencontrée, jamais proposée de toute la simulation.
  //
  // ATTENTION — ce décompte brut MÉLANGE deux choses très différentes, et les
  // confondre ferait conclure à un défaut là où il n'y en a pas :
  //   · une notion rencontrée l'AVANT-VEILLE n'a simplement pas encore eu son
  //     tour — la file la servira, il n'y a rien à corriger ;
  //   · une notion rencontrée il y a trois mois et jamais proposée est une
  //     VRAIE famine, et c'est ce que le CP8 prétend avoir supprimé.
  // On mesure donc le nombre de JOURS ACTIFS écoulés depuis la première
  // exposition de chaque notion jamais proposée.
  const abandonnees = rencontrees.filter((f) => !propositions.has(f.id));
  const joursActifs = Object.keys(days).map(Number).sort((a, b) => a - b);
  const actifsDepuis = (iso) => joursActifs.filter((j) => DEBUT + (j - 1) * DAY_MS >= Date.parse(iso)).length;
  const attentes = abandonnees.map((f) => actifsDepuis(f.firstExposureAt)).sort((a, b) => b - a);
  const famine = attentes.filter((n) => n > 30).length;

  // Répétition quotidienne permanente : proposée ≥ 20 jours CONSÉCUTIFS.
  let pireSerie = 0; let conceptSerie = null;
  for (const [id, js] of propositions) {
    let serie = 1;
    for (let i = 1; i < js.length; i += 1) {
      serie = js[i] === js[i - 1] + 1 ? serie + 1 : 1;
      if (serie > pireSerie) { pireSerie = serie; conceptSerie = id; }
    }
  }

  // Arriéré « explosif » : croissance plus que linéaire sur la seconde moitié.
  const moitie = Math.floor(backlog.length / 2);
  const croissance1 = (backlog[moitie] ?? 0) - (backlog[0] ?? 0);
  const croissance2 = (backlog.at(-1) ?? 0) - (backlog[moitie] ?? 0);

  return {
    rencontrees: rencontrees.length,
    proposees: propositions.size,
    abandonnees: abandonnees.length,
    attenteMax: attentes[0] ?? 0,
    famine,
    pireSerie, conceptSerie,
    arriereFinal: backlog.at(-1) ?? 0,
    arriereMax: Math.max(...backlog, 0),
    croissance1, croissance2,
    sansPourquoi,
    horsBudget,
    budgetMax: Math.max(...budgets, 0),
    tentatives: recallAttempts.length,
    jamaisTransferees: rencontrees.filter((f) => f.jamaisTransfere).length,
  };
}

// ─────────────────────────────────────────────────────────────────────────
const DIRECT = process.argv[1] && process.argv[1].endsWith('cp13-apprenants.mjs');
if (DIRECT) {
console.log('# V74 · CP13 — HUIT APPRENANTS SYNTHÉTIQUES\n');
console.log('**Une simulation n’est PAS une preuve d’apprentissage.** Ce qui est vérifié ici est');
console.log('la ROBUSTESSE du moteur, pas son efficacité pédagogique — celle-ci reste hors de');
console.log('portée (`REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED`).\n');
console.log(`240 jours · budget 20 min · compétence affaiblie du profil F : \`${CIBLE_FAIBLE}\`\n`);

const lignes = [];
for (const p of PROFILS) {
  const r = simulerProfil(p);
  lignes.push({ p, r });
  console.log(`## ${p.id} — ${p.nom} *(${p.desc})*`);
  console.log(`notions rencontrées ${r.rencontrees} · proposées ${r.proposees} · jamais proposées ${r.abandonnees}`);
  console.log(`  dont attendant depuis > 30 jours ACTIFS : **${r.famine}** · attente maximale ${r.attenteMax} jours actifs`);
  console.log(`arriéré final ${r.arriereFinal} · max ${r.arriereMax} · croissance 1ʳᵉ moitié ${r.croissance1} → 2ᵉ moitié ${r.croissance2}`);
  console.log(`plus longue série de jours consécutifs sur UNE notion : **${r.pireSerie}**${r.conceptSerie ? ` (${r.conceptSerie})` : ''}`);
  console.log(`tentatives ${r.tentatives} · unités sans « pourquoi » **${r.sansPourquoi}** · séances hors budget **${r.horsBudget}**\n`);
}

console.log('## Verdict des six propriétés\n');
console.log('| profil | pas de boucle | arriéré non explosif | pas de répétition permanente | aucune famine | priorité explicable | budget respecté |');
console.log('|---|---|---|---|---|---|---|');
let echecs = 0;
for (const { p, r } of lignes) {
  const c = [
    r.pireSerie < 20,
    r.croissance2 <= Math.max(5, r.croissance1 * 2),
    r.pireSerie < 20,
    r.famine === 0,
    r.sansPourquoi === 0,
    r.horsBudget === 0,
  ];
  if (c.some((x) => !x)) echecs += 1;
  console.log(`| **${p.id}** ${p.nom} | ${c.map((x) => (x ? '✅' : '❌')).join(' | ')} |`);
}
console.log(`\n**${lignes.length - echecs} profils sur ${lignes.length} satisfont les six propriétés.**`);
process.exitCode = echecs === 0 ? 0 : 1;
}
