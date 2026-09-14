// V75 · CP13 — SIMULATION ADVERSARIALE : les 20 profils, AVANT et APRÈS.
//
// ── CE QUE CE SCRIPT CHERCHE ─────────────────────────────────────────────
//
// Pas « est-ce que les chiffres sont beaux ». Le brief est explicite sur le
// piège qu'il faut refuser :
//
//   > total backlog = 100 · active = 5 · parked = 95
//   > **n'est PAS automatiquement bon.**
//
// Un moteur qui gare 95 notions sur 100 a l'air excellent et n'a rien résolu.
// Ce script mesure donc, pour chaque profil, **ce qui distingue un tri d'une
// dissimulation** :
//
//   · **pourquoi** les notions garées le sont (la condition est-elle nommée ?) ;
//   · **combien de temps** elles le restent ;
//   · la **famine** : une notion rencontrée que rien ne propose jamais ;
//   · le **besoin futur** : une notion garée dont le parcours a besoin ;
//   · la **possibilité de réactivation** : le garage peut-il se lever ?
//
// Et sur le mode de récupération, il teste le CYCLE COMPLET — entrée, séjour,
// sortie — en cherchant quatre pathologies nommées :
//
//   1. récupération dont **on ne sort jamais** ;
//   2. sortie **trop facile** (un seul bon jour suffit) ;
//   3. **oscillation** NORMAL/RECOVERY quotidienne ;
//   4. arriéré **repoussé indéfiniment**.
//
// ── CE QU'UNE SIMULATION N'EST PAS ──────────────────────────────────────
//
// **Une simulation n'est pas une preuve d'apprentissage.** Les profils sont des
// automates : ils réussissent selon une probabilité fixe, ils n'apprennent pas,
// ils n'oublient pas vraiment. Ce script mesure le COMPORTEMENT DU MOTEUR face
// à des trajectoires plausibles — rien de plus, et c'est déjà beaucoup, parce
// que c'est la seule chose qu'on puisse vérifier sans participants.
import { writeFileSync } from 'node:fs';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { PROFILS, simuler, CTX, formatsDe, DEBUT, DAY_MS } from './cp0-backlog.mjs';
import { projectLearnerMemory } from '../../lib/learner-memory.mjs';
import { statutDe, prioriteDe } from '../../lib/retention-priority.mjs';
import { echeanceDe, formeDe, MINUTES_PAR_FORME, PLAFOND_UNITES } from '../../lib/retention-scheduler.mjs';
import { projectRecall, normalizeAttempts } from '../../lib/retention.mjs';
import { trierArriere, notionsEssentielles } from '../../lib/backlog-triage.mjs';
import { modeDe, arbitrerLaJournee } from '../../lib/recovery-mode.mjs';
import { planUnifie } from '../../lib/plan-unifie.mjs';
import { CIBLE_REACTIVATION, BUDGET_JOURNEE } from '../../lib/daily-plan.mjs';

const ROOT = process.cwd();
const HORIZON = 14;

const prereq = new Map();
{
  const p = join(ROOT, 'docs', 'v73', 'curriculum-graph.json');
  if (existsSync(p)) {
    const g = JSON.parse(readFileSync(p, 'utf8'));
    for (const [k, v] of Object.entries(g.prereq?.requis ?? {})) prereq.set(k, Array.isArray(v) ? v : []);
  }
}
const prerequisDe = (id) => prereq.get(id) ?? [];

/** Coupe les faits au jour `j` inclus — ils sont horodatés et append-only. */
function couper(faits, j) {
  const limite = DEBUT + j * DAY_MS;
  const days = {};
  for (const [k, v] of Object.entries(faits.days)) if (Number(k) <= j) days[k] = v;
  const avant = (l) => l.filter((x) => Date.parse(x.at ?? x.createdAt) < limite);
  return {
    days,
    recallAttempts: avant(faits.recallAttempts),
    exerciseAttempts: avant(faits.exerciseAttempts),
    evidence: avant(faits.evidence),
  };
}

/** Position : la règle du produit (`resolveResume`). */
function positionDe(days, total = 365) {
  let derniere = 0;
  for (let j = 1; j <= total; j += 1) if (days[j]?.status === 'done') derniere = j;
  for (let j = derniere + 1; j <= total; j += 1) if (days[j]?.status !== 'done') return j;
  return total + 1;
}

/** L'état COMPLET du moteur à un jour donné. La chaîne entière, comme en production. */
export function etatAuJour(faits, j) {
  const coupe = couper(faits, j);
  const now = new Date(DEBUT + j * DAY_MS).toISOString();
  const proj = projectLearnerMemory({ facts: coupe, context: CTX, now });
  const fiches = proj.concepts.filter((f) => f.firstExposureAt);
  const ficheDe = new Map(fiches.map((f) => [f.id, f]));
  const jourCourant = positionDe(coupe.days);

  const essentielles = notionsEssentielles({
    jourCourant, horizon: HORIZON,
    leconsDuJour: (d) => CTX.dayConcepts[d] ?? [],
    prerequisDe,
  });

  const parConcept = new Map();
  for (const a of coupe.recallAttempts) {
    if (!parConcept.has(a.conceptId)) parConcept.set(a.conceptId, []);
    parConcept.get(a.conceptId).push(a);
  }
  const minutesDe = (id) => {
    const f = ficheDe.get(id);
    if (!f) return 0;
    const forme = formeDe(f, formatsDe.get(id) ?? [], projectRecall(id, normalizeAttempts(parConcept.get(id) ?? [])));
    return forme ? MINUTES_PAR_FORME[forme.format] ?? 0 : 0;
  };
  const dueAtOf = (id) => (ficheDe.has(id) ? echeanceDe(ficheDe.get(id))?.dueAt ?? null : null);

  const triage = trierArriere({
    fiches, dueAtOf, statutDe, minutesDe,
    estEssentielle: (id) => essentielles.has(id),
    prerequisDe,
    scoreDe: (id) => (ficheDe.has(id) ? prioriteDe(ficheDe.get(id), { dueAt: dueAtOf(id), now }).score : 0),
    besoinDe: (id) => ficheDe.get(id)?.nextCurriculumNeed ?? null,
    capaciteActive: PLAFOND_UNITES,
    libelleDe: (id) => id,
    now,
  });

  return { now, jourCourant, fiches, triage, essentielles };
}

/** Le mode à un jour donné, avec `E4` vérifié sur le jour actif précédent. */
export function modeAuJour(faits, j, cacheMode) {
  const e = cacheMode.get(j) ?? etatAuJour(faits, j);
  cacheMode.set(j, e);
  const veille = cacheMode.get(j - 1) ?? (j > 1 ? etatAuJour(faits, j - 1) : null);
  if (veille) cacheMode.set(j - 1, veille);
  return modeDe(e.triage.pression, {
    budget: CIBLE_REACTIVATION,
    pressionJourActifPrecedent: veille ? veille.triage.pression : null,
  });
}

/**
 * ── UN PROFIL, MESURÉ SUR TOUTE SA TRAJECTOIRE ───────────────────────────
 *
 * Les instantanés sont échantillonnés (tous les `pas` jours) : rejouer la
 * chaîne complète 365 fois par profil coûterait des heures pour une précision
 * que la question ne demande pas. Le pas est DÉCLARÉ, et les phases critiques
 * (entrée/sortie de récupération) sont détectées à cette granularité — c'est
 * une limite, elle est écrite.
 */
export function trajectoire(profil, { pas = 15, jours = 365 } = {}) {
  const sim = simuler(profil, { avecFaits: true });
  const faits = sim.faits;
  const cache = new Map();

  const points = [];
  /**
   * ── COMBIEN DE TEMPS UNE NOTION RESTE-T-ELLE AU GARAGE ? ──────────────
   *
   * La question centrale de l'anti-gaming. « 95 garées sur 100 » est acceptable
   * si le garage se vide ; c'est une dissimulation s'il ne se vide jamais. On
   * enregistre donc, par notion, le placement à CHAQUE instantané.
   */
  const parcours = new Map();
  for (let j = pas; j <= jours; j += pas) {
    const e = etatAuJour(faits, j);
    cache.set(j, e);
    const m = modeAuJour(faits, j, cache);
    const arb = arbitrerLaJournee({
      mode: m.mode, chargeHaut: 240, minutesReactivation: CIBLE_REACTIVATION,
      pression: e.triage.pression, budgetJournee: BUDGET_JOURNEE.haut,
    });
    const pu = planUnifie({
      mode: m.mode, chargeHaut: 240, demande: { REVIEW: arb.propose.revision, REMEDIATION: arb.propose.remediation },
      arriere: { total: e.triage.total, actif: e.triage.placement.actif, differe: e.triage.placement.differe, gare: e.triage.placement.gare },
      pression: e.triage.pression, minutesTransfert: 12,
    });
    points.push({
      j, mode: m.mode, jourCourant: e.jourCourant,
      total: e.triage.total,
      actif: e.triage.placement.actif,
      differe: e.triage.placement.differe,
      gare: e.triage.placement.gare,
      bloquantes: e.triage.pression.bloquantes,
      echecsNonRepris: e.triage.pression.echecsNonRepris,
      minutesRequises: e.triage.pression.minutesRequises,
      anciennete: e.triage.pression.anciennete,
      budgetAccorde: pu.budget.accorde,
      budgetPlafond: pu.budget.journee,
      // ── ANTI-GAMING : POURQUOI les garées le sont ──
      gareesSansCondition: e.triage.notions.filter((n) => n.classe === 'PARKED' && !n.conditionDeRetour).length,
      gareesEssentielles: e.triage.notions.filter((n) => n.classe === 'PARKED' && e.essentielles.has(n.id)).length,
      gareesAvecEchec: e.triage.notions.filter((n) => n.classe === 'PARKED'
        && (() => { const f = e.fiches.find((x) => x.id === n.id); return f?.lastFailureAt && (!f.lastSuccessAt || f.lastSuccessAt < f.lastFailureAt); })()).length,
      // Le garage peut-il se lever ? Une notion garée dont le bloquant n'est
      // PAS lui-même garé pourra être débloquée en travaillant ce bloquant.
      gareesDebloquables: e.triage.notions.filter((n) => {
        if (n.classe !== 'PARKED') return null;
        const bloquant = (n.bloqueePar ?? [])[0];
        const b = e.triage.notions.find((x) => x.id === bloquant);
        return b && b.classe !== 'PARKED';
      }).length,
      soupape: e.triage.soupape,
    });
    for (const n of e.triage.notions) {
      if (!parcours.has(n.id)) parcours.set(n.id, []);
      parcours.get(n.id).push({ j, placement: n.placement });
    }
  }

  // ── SÉJOUR AU GARAGE, PAR NOTION ──
  //
  // `sejourGareMax` : le plus long séjour CONSÉCUTIF, en jours (instantanés
  // contigus × pas). `jamaisActive` : une notion vue en retard à au moins un
  // instantané et **jamais** placée en actif — la famine du garage.
  let sejourGareMax = 0;
  let jamaisActive = 0;
  let gareesToujours = 0;
  for (const [, hist] of parcours) {
    let courant = 0;
    let vueActive = false;
    let toujoursGaree = true;
    let precedent = null;
    for (const h of hist) {
      if (h.placement === 'actif') vueActive = true;
      if (h.placement !== 'gare') toujoursGaree = false;
      if (h.placement === 'gare') {
        courant = precedent != null && h.j - precedent === pas ? courant + pas : pas;
        if (courant > sejourGareMax) sejourGareMax = courant;
      } else {
        courant = 0;
      }
      precedent = h.j;
    }
    if (!vueActive) jamaisActive += 1;
    if (toujoursGaree) gareesToujours += 1;
  }

  // ── LE CYCLE DE RÉCUPÉRATION : ENTRÉE → SÉJOUR → SORTIE ──
  const modes = points.map((p) => p.mode);
  const enRecup = (m) => m === 'RECOVERY' || m === 'CRITICAL';
  let entrees = 0, sorties = 0, joursEnRecup = 0, bascules = 0;
  let premiereEntree = null, premiereSortie = null;
  for (let i = 0; i < modes.length; i += 1) {
    if (enRecup(modes[i])) joursEnRecup += pas;
    if (i > 0 && modes[i] !== modes[i - 1]) bascules += 1;
    if (i > 0 && enRecup(modes[i]) && !enRecup(modes[i - 1])) {
      entrees += 1; if (premiereEntree == null) premiereEntree = points[i].j;
    }
    if (i > 0 && !enRecup(modes[i]) && enRecup(modes[i - 1])) {
      sorties += 1; if (premiereSortie == null) premiereSortie = points[i].j;
    }
  }
  if (enRecup(modes[0])) { entrees += 1; if (premiereEntree == null) premiereEntree = points[0].j; }

  const fin = points.at(-1) ?? null;
  const maxDe = (k) => points.reduce((n, p) => Math.max(n, p[k]), 0);

  return {
    id: profil.id, nom: profil.nom,
    rencontrees: sim.rencontrees,
    // ── BEFORE (CP0) ──
    avant: {
      backlogMax: sim.backlogMax, backlogFinal: sim.backlogFinal,
      partDuCorpus: sim.partDuCorpus, retourSousControle: sim.retourSousControle,
      jamaisProposees: sim.jamaisProposees, starvationMax: sim.starvationMax,
      echecs: sim.echecs, reussites: sim.reussites, remediations: sim.remediations,
      minutesDemandees: sim.minutesDemandees, nouveauxContenus: sim.nouveauxContenus,
      joursActifs: sim.joursActifs,
    },
    // ── AFTER (V75) ──
    apres: {
      totalMax: maxDe('total'), actifMax: maxDe('actif'), gareMax: maxDe('gare'),
      totalFinal: fin?.total ?? 0, actifFinal: fin?.actif ?? 0,
      differeFinal: fin?.differe ?? 0, gareFinal: fin?.gare ?? 0,
      bloquantesMax: maxDe('bloquantes'), echecsNonReprisMax: maxDe('echecsNonRepris'),
      partGareeFinale: fin && fin.total ? Math.round((fin.gare / fin.total) * 100) : 0,
      budgetDepasse: points.filter((p) => p.budgetAccorde > p.budgetPlafond).length,
      // Anti-gaming
      gareesSansCondition: points.reduce((n, p) => n + p.gareesSansCondition, 0),
      gareesEssentielles: points.reduce((n, p) => n + p.gareesEssentielles, 0),
      gareesAvecEchec: points.reduce((n, p) => n + p.gareesAvecEchec, 0),
      gareesDebloquablesFin: fin?.gareesDebloquables ?? 0,
      soupapes: points.filter((p) => p.soupape).length,
      sejourGareMax, jamaisActive, gareesToujours,
      notionsVues: parcours.size,
      // Cycle de récupération
      modes: Object.fromEntries(['NORMAL', 'CATCH_UP', 'RECOVERY', 'CRITICAL']
        .map((m) => [m, modes.filter((x) => x === m).length])),
      entrees, sorties, joursEnRecup, bascules,
      premiereEntree, premiereSortie,
      /** Entré sans jamais ressortir : la pathologie n° 1. */
      recuperationSansSortie: entrees > 0 && sorties === 0,
      /** Bascules à chaque instantané : la pathologie n° 3. */
      oscillation: points.length > 2 && bascules >= points.length - 1,
      invariantI2: points.every((p) => p.actif + p.differe + p.gare === p.total),
    },
    points,
  };
}

if (process.argv[1] && process.argv[1].endsWith('cp13-adversarial.mjs')) {
  const pas = Number(process.argv[2] ?? 15);
  console.log('# V75 · CP13 — SIMULATION ADVERSARIALE, 20 PROFILS\n');
  console.log('> **Une simulation n’est pas une preuve d’apprentissage.** Les profils sont des');
  console.log('> automates : ils réussissent selon une probabilité fixe, ils n’apprennent pas.');
  console.log('> Ce qui est mesuré ici est le COMPORTEMENT DU MOTEUR face à des trajectoires');
  console.log('> plausibles — la seule chose vérifiable sans participants.\n');
  console.log(`> Instantanés tous les **${pas} jours** sur 365. Le pas est déclaré : rejouer la`);
  console.log('> chaîne complète 365 fois par profil coûterait des heures pour une précision que');
  console.log('> la question ne demande pas. C’est une limite, elle est écrite.\n');

  const tous = [];
  for (const p of PROFILS) tous.push(trajectoire(p, { pas }));

  console.log('## BEFORE → AFTER\n');
  console.log('| # | profil | renc. | arriéré max AV | arriéré max AP | actif max | garé max | final AV | final AP | retour AV |');
  console.log('|---|---|---|---|---|---|---|---|---|---|');
  for (const r of tous) {
    console.log(`| ${r.id} | ${r.nom} | ${r.rencontrees} | ${r.avant.backlogMax} | ${r.apres.totalMax} | ${r.apres.actifMax} | ${r.apres.gareMax} | ${r.avant.backlogFinal} | ${r.apres.totalFinal} | ${r.avant.retourSousControle == null ? '**jamais**' : `${r.avant.retourSousControle} j`} |`);
  }

  console.log('\n## Décomposition finale — total / actif / différé / garé, SÉPARÉMENT\n');
  console.log('| # | total | actif | différé | garé | % garé | I2 |');
  console.log('|---|---|---|---|---|---|---|');
  for (const r of tous) {
    const a = r.apres;
    console.log(`| ${r.id} | **${a.totalFinal}** | ${a.actifFinal} | ${a.differeFinal} | ${a.gareFinal} | ${a.partGareeFinale} % | ${a.invariantI2 ? '✅' : '❌'} |`);
  }

  console.log('\n## Anti-gaming — POURQUOI les notions sont garées\n');
  console.log('> *« total 100 · actif 5 · garé 95 n’est PAS automatiquement bon. »*\n');
  console.log('| # | garé max | sans condition | essentielles garées | échecs garés | débloquables (fin) | soupape |');
  console.log('|---|---|---|---|---|---|---|');
  for (const r of tous) {
    const a = r.apres;
    console.log(`| ${r.id} | ${a.gareMax} | ${a.gareesSansCondition} | ${a.gareesEssentielles} | ${a.gareesAvecEchec} | ${a.gareesDebloquablesFin}/${a.gareFinal} | ${a.soupapes} |`);
  }

  console.log('\n## Cycle de récupération — entrée → séjour → sortie\n');
  console.log('| # | NORMAL | CATCH_UP | RECOVERY | CRITICAL | entrées | sorties | jours en récup. | bascules | 1ʳᵉ entrée | 1ʳᵉ sortie |');
  console.log('|---|---|---|---|---|---|---|---|---|---|---|');
  for (const r of tous) {
    const a = r.apres;
    console.log(`| ${r.id} | ${a.modes.NORMAL} | ${a.modes.CATCH_UP} | ${a.modes.RECOVERY} | ${a.modes.CRITICAL} | ${a.entrees} | ${a.sorties} | ${a.joursEnRecup} | ${a.bascules} | ${a.premiereEntree ?? '—'} | ${a.premiereSortie ?? '—'} |`);
  }

  console.log('\n## Famine et besoin futur\n');
  console.log('| # | jamais proposées (AV) | famine max (AV) | bloquantes max (AP) | échecs non repris max (AP) |');
  console.log('|---|---|---|---|---|');
  for (const r of tous) {
    console.log(`| ${r.id} | ${r.avant.jamaisProposees} | ${r.avant.starvationMax} j | ${r.apres.bloquantesMax} | ${r.apres.echecsNonReprisMax} |`);
  }

  console.log('\n## COMBIEN DE TEMPS une notion reste-t-elle au garage\n');
  console.log('> Un garage acceptable **se vide**. Un garage qui ne se vide jamais est une');
  console.log('> dissimulation, quel que soit le nombre affiché à côté.\n');
  console.log('| # | notions vues en retard | séjour garé le plus long | garées à TOUS les instantanés | jamais placées en actif |');
  console.log('|---|---|---|---|---|');
  for (const r of tous) {
    const a = r.apres;
    console.log(`| ${r.id} | ${a.notionsVues} | ${a.sejourGareMax} j | ${a.gareesToujours} | ${a.jamaisActive} |`);
  }

  // ── LES PATHOLOGIES NOMMÉES PAR LE BRIEF ──
  const sansSortie = tous.filter((r) => r.apres.recuperationSansSortie);
  const oscillants = tous.filter((r) => r.apres.oscillation);
  const i2KO = tous.filter((r) => !r.apres.invariantI2);
  const budgetKO = tous.filter((r) => r.apres.budgetDepasse > 0);
  const gareSansRaison = tous.filter((r) => r.apres.gareesSansCondition > 0);
  const essentiellesGarees = tous.filter((r) => r.apres.gareesEssentielles > 0);
  const echecsGares = tous.filter((r) => r.apres.gareesAvecEchec > 0);
  const pireGare = [...tous].sort((a, b) => b.apres.partGareeFinale - a.apres.partGareeFinale)[0];

  console.log('\n## Pathologies recherchées\n');
  const ligne = (nom, liste, detail = '') => console.log(`**${nom}** : ${liste.length === 0 ? '✅ aucun profil' : `❌ ${liste.map((r) => r.id).join(' ')}`}${detail}`);
  ligne('Récupération dont on ne sort jamais (sur ces trajectoires)', sansSortie, ' → tranché par `cp13-sortie.mjs`');
  ligne('Oscillation à chaque instantané', oscillants);
  ligne('`I2` violé (total ≠ actif + différé + garé)', i2KO);
  ligne('Budget quotidien dépassé', budgetKO);
  ligne('Notions garées SANS condition de retour', gareSansRaison);
  ligne('Notions ESSENTIELLES garées', essentiellesGarees);
  ligne('Échecs non repris garés', echecsGares);
  console.log(`\n**Part garée la plus haute** : ${pireGare.id} à **${pireGare.apres.partGareeFinale} %** — ${pireGare.apres.gareesDebloquablesFin}/${pireGare.apres.gareFinal} sont débloquables en travaillant leur prérequis.`);

  writeFileSync(join(ROOT, 'docs', 'v75', 'cp13-adversarial.json'),
    `${JSON.stringify(tous.map(({ points, ...r }) => ({ ...r, points })), null, 1)}\n`);
  console.log('\nécrit : docs/v75/cp13-adversarial.json');

  if (i2KO.length || budgetKO.length || gareSansRaison.length || essentiellesGarees.length || echecsGares.length) {
    process.exitCode = 1;
  }
}
