// V74 · CP8 — ORCHESTRATION DE L'ESPACEMENT. Simulation, lecture seule.
//
// ── CE QUE CE CP MESURE, ET POURQUOI CE N'EST PAS CE QU'A MESURÉ LE CP6 ───
//
// Le CP6 a traité les **52 revues du curriculum** : un objet STATIQUE, identique
// pour tous, dont l'espacement se lit dans les fichiers. Le CP8 traite autre
// chose : ce que l'ARBITRE (CP3 + CP4) propose réellement à UN apprenant, à
// partir de SES faits. Cet espacement-là ne se lit nulle part — il faut faire
// tourner le moteur pour l'observer.
//
// ── LA QUESTION ──────────────────────────────────────────────────────────
//
// `echeanceDe` calcule une échéance NOMINALE (INTERVALS de V66, indexé par les
// réussites consécutives). Mais `planifier` sélectionne par PRIORITÉ, sous un
// plafond de 8 unités et un budget de 20 minutes. Rien ne garantit qu'une unité
// due soit proposée le jour de son échéance : une unité peut être évincée jour
// après jour par des unités mieux classées.
//
// La question du CP8 est donc : **l'espacement RÉALISÉ ressemble-t-il à
// l'espacement PRESCRIT, ou le budget le déforme-t-il ?** Et surtout :
// **quelque chose meurt-il de faim ?**
//
// ── CE QUE CE SCRIPT NE FAIT PAS ─────────────────────────────────────────
//
// Il ne cherche PAS « 7 jours partout ». Le brief l'interdit nommément, et
// c'est une bonne interdiction : un espacement uniforme serait le signe que le
// moteur ignore l'apprenant, pas qu'il l'a compris. Un apprenant qui réussit
// doit voir ses intervalles S'ÉTIRER (1 → 3 → 7 → 16 → 35…), un apprenant qui
// échoue doit les voir REVENIR à 1. La DISPERSION est le résultat attendu ;
// elle est publiée telle quelle.
//
// Aucune écriture. Aucun `Math.random` : générateur à graine, sortie rejouable.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { projectLearnerMemory } from '../../lib/learner-memory.mjs';
import { planifier, echeanceDe } from '../../lib/retention-scheduler.mjs';
import { statutDe, comptesParStatut } from '../../lib/retention-priority.mjs';
import { availableFormats, nextFormat, projectRecall, normalizeAttempts } from '../../lib/retention.mjs';

const ROOT = process.cwd();
const DAY_MS = 86_400_000;
const pad3 = (n) => String(n).padStart(3, '0');

// ── Générateur déterministe (LCG). Pas de `Math.random` : le critère B2
// exige qu'une même graine rende exactement la même simulation.
const rng = (graine) => {
  let s = graine >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

// ── CONTEXTE CURRICULAIRE, dérivé des mêmes sources que le module serveur.
const program = JSON.parse(readFileSync(join(ROOT, 'data', 'program.json'), 'utf8'));
const lessons = program.lessons ?? [];
const connus = new Set(lessons.map((l) => l.slug));

const conceptDays = {};
for (const l of lessons) conceptDays[l.slug] = [];
const titresDe = new Map();
for (const l of lessons) {
  const p = join(ROOT, 'curriculum', 'lessons', `${l.slug}.md`);
  titresDe.set(l.slug, existsSync(p)
    ? [...readFileSync(p, 'utf8').matchAll(/^## +(.+)$/gm)].map((m) => m[1]) : []);
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

const DEBUT = Date.parse('2026-01-05T08:00:00.000Z');

/**
 * Une simulation : l'apprenant ouvre une journée de curriculum par jour, puis
 * tente ce que le scheduler lui propose. Un rappel réussi avec la probabilité
 * `pReussite`, sinon échoué.
 *
 * `variante` permet de rejouer la MÊME simulation avec un scheduler modifié —
 * c'est ce qui rend le AFTER comparable au BEFORE.
 */
function simuler({ jours = 180, budget = 20, pReussite = 0.75, graine = 42, variante = null } = {}) {
  const alea = rng(graine);
  const recallAttempts = [];
  const days = {};

  const intervallesRealises = new Map();   // concept → [écarts observés]
  const dernierRappel = new Map();
  const retards = [];                      // (proposé le) − (dû le), en jours
  const backlog = [];
  const propositions = new Map();          // concept → nombre de fois proposé
  let jamaisPropose = 0;

  for (let j = 1; j <= jours; j += 1) {
    const now = new Date(DEBUT + (j - 1) * DAY_MS).toISOString();
    days[j] = { status: 'in-progress', startedAt: now, updatedAt: now };

    const proj = projectLearnerMemory({
      facts: { days, recallAttempts, exerciseAttempts: [], evidence: [] },
      context: { conceptDays, conceptSkills, dayConcepts, projectDays, skills: [], startDate: new Date(DEBUT).toISOString() },
      now,
    });

    // Seules les notions DÉJÀ RENCONTRÉES peuvent être réactivées : proposer
    // un rappel sur une notion jamais vue serait inventer un contact (G1).
    const fiches = proj.concepts.filter((f) => f.firstExposureAt);
    if (!fiches.length) continue;

    const attemptsDe = new Map();
    for (const a of recallAttempts) {
      if (!attemptsDe.has(a.conceptId)) attemptsDe.set(a.conceptId, []);
      attemptsDe.get(a.conceptId).push(a);
    }

    const plan = (variante ?? planifier)(fiches, {
      now,
      budgetMinutes: budget,
      formatsOf: (id) => formatsDe.get(id) ?? [],
      recallOf: (id) => projectRecall(id, normalizeAttempts(attemptsDe.get(id) ?? [])),
    });

    const cptStatuts = comptesParStatut(fiches, {
      dueAtOf: (id) => echeanceDe(fiches.find((f) => f.id === id))?.dueAt ?? null,
      now,
    });
    backlog.push((cptStatuts.DUE ?? 0) + (cptStatuts.OVERDUE ?? 0));

    for (const item of plan.items) {
      propositions.set(item.id, (propositions.get(item.id) ?? 0) + 1);

      if (item.dueAt) {
        retards.push(Math.round((Date.parse(now) - Date.parse(item.dueAt)) / DAY_MS));
      }
      const precedent = dernierRappel.get(item.id);
      if (precedent) {
        if (!intervallesRealises.has(item.id)) intervallesRealises.set(item.id, []);
        intervallesRealises.get(item.id).push(Math.round((Date.parse(now) - Date.parse(precedent)) / DAY_MS));
      }
      dernierRappel.set(item.id, now);

      recallAttempts.push({
        conceptId: item.id, at: now, format: item.format,
        outcome: alea() < pReussite ? 'recalled' : 'failed',
        provenance: { producer: 'cp8-simulation', method: 'synthetique' },
      });
    }
  }

  const vues = new Set();
  const projFinal = projectLearnerMemory({
    facts: { days, recallAttempts, exerciseAttempts: [], evidence: [] },
    context: { conceptDays, conceptSkills, dayConcepts, projectDays, skills: [], startDate: new Date(DEBUT).toISOString() },
    now: new Date(DEBUT + jours * DAY_MS).toISOString(),
  });
  for (const f of projFinal.concepts) if (f.firstExposureAt) vues.add(f.id);
  for (const id of vues) if (!propositions.has(id)) jamaisPropose += 1;

  return {
    intervalles: [...intervallesRealises.values()].flat(),
    retards, backlog, propositions, vues, jamaisPropose, recallAttempts,
    projFinal,
  };
}

// ── Statistiques, publiées en nombres bruts.
const stats = (a) => {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y);
  const q = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  return { n: s.length, min: s[0], p25: q(0.25), med: q(0.5), p75: q(0.75), p90: q(0.9), max: s[s.length - 1] };
};
const ligne = (nom, st) => (st
  ? `${nom.padEnd(28)} n=${String(st.n).padStart(5)} · min ${st.min} · p25 ${st.p25} · **méd ${st.med}** · p75 ${st.p75} · p90 ${st.p90} · max ${st.max}`
  : `${nom.padEnd(28)} (aucune donnée)`);

const distrib = (a) => {
  const m = new Map();
  for (const x of a) m.set(x, (m.get(x) ?? 0) + 1);
  return [...m].sort((x, y) => x[0] - y[0]).map(([v, n]) => `${v}j→${n}`).join(' · ');
};

export { simuler, stats, ligne, distrib, planifier, echeanceDe, statutDe };

if (process.argv[1] && process.argv[1].endsWith('cp8-espacement.mjs')) {
  console.log('# V74 · CP8 — ESPACEMENT RÉALISÉ PAR L’ARBITRE (simulation déterministe)\n');
  for (const p of [0.9, 0.75, 0.5]) {
    const r = simuler({ pReussite: p });
    console.log(`## Apprenant à ${Math.round(p * 100)} % de réussite — 180 jours, budget 20 min`);
    console.log(ligne('intervalles RÉALISÉS', stats(r.intervalles)));
    console.log(ligne('retard sur l’échéance', stats(r.retards)));
    console.log(ligne('arriéré DUE+OVERDUE', stats(r.backlog)));
    console.log(`notions rencontrées : ${r.vues.size} · JAMAIS proposées : ${r.jamaisPropose}`);
    console.log(`distribution des intervalles : ${distrib(r.intervalles)}`);
    console.log(`arriéré au jour 1 / 60 / 120 / 180 : ${r.backlog[0]} / ${r.backlog[59]} / ${r.backlog[119]} / ${r.backlog[179]}\n`);
  }
}
