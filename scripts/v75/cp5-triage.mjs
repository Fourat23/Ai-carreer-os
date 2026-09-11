// V75 · CP5 — LE TRIAGE, MESURÉ SUR LES 20 PROFILS DU CP0.
//
// ── CE QUE CETTE MESURE CHERCHE, ET CE QU'ELLE REFUSE DE MONTRER ─────────
//
// Elle ne cherche PAS à faire baisser l'arriéré. Le triage n'en a pas le
// pouvoir et n'en a pas le droit (`R1`, `R2`, `R6`) : le total après triage est
// exactement le total avant. Ce qu'elle vérifie, c'est que la **décomposition**
// est honnête :
//
//   · `I2` — `total = actif + différé + garé`, à l'égalité stricte, 20/20 ;
//   · la part **garée** reste minoritaire et **justifiée** — le brief prévient
//     explicitement : *« ne pas gagner en mettant 90 % dans PARKED sans
//     logique »*. On publie donc le pourcentage garé pour chaque profil, y
//     compris s'il est gênant ;
//   · aucune notion `URGENT` ni aucun échec non repris n'est garé.
//
// ── LA LIMITE, DÉCLARÉE ─────────────────────────────────────────────────
//
// `jourCourant` est calculé comme le produit le calcule : **la première journée
// non terminée** (`computeStats`). Chez un apprenant irrégulier, c'est un jour
// très précoce même après un an — il a sauté la journée 2 et ne l'a jamais
// reprise. Ce n'est pas un artefact de la sonde : c'est ce que le produit
// utilisera. On publie les deux nombres (`jourCourant` et la journée la plus
// avancée) pour que l'écart soit visible plutôt que supposé.
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PROFILS, simuler, CTX, formatsDe, DEBUT, DAY_MS } from './cp0-backlog.mjs';
import { projectLearnerMemory } from '../../lib/learner-memory.mjs';
import { statutDe, prioriteDe } from '../../lib/retention-priority.mjs';
import { echeanceDe, formeDe, MINUTES_PAR_FORME } from '../../lib/retention-scheduler.mjs';
import { projectRecall, normalizeAttempts } from '../../lib/retention.mjs';
import { trierArriere, notionsEssentielles } from '../../lib/backlog-triage.mjs';

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

/**
 * Coupe les faits au jour `jusqu'à` inclus. Les faits sont horodatés et
 * append-only : tronquer sur la date donne exactement l'état qu'avait
 * l'apprenant ce jour-là, sans re-simuler.
 */
function couper(faits, jusqua) {
  const limite = DEBUT + jusqua * DAY_MS;
  const days = {};
  for (const [k, v] of Object.entries(faits.days)) if (Number(k) <= jusqua) days[k] = v;
  const avant = (l) => l.filter((x) => Date.parse(x.at ?? x.createdAt) < limite);
  return {
    days,
    recallAttempts: avant(faits.recallAttempts),
    exerciseAttempts: avant(faits.exerciseAttempts),
    evidence: avant(faits.evidence),
  };
}

/**
 * ── LA POSITION, ET L'ANOMALIE QU'ELLE A RÉVÉLÉE ─────────────────────────
 *
 * Règle du produit (`resolveResume`) : **la première journée non terminée
 * APRÈS la dernière terminée**. Prendre la première non terminée tout court
 * décrirait « au jour 2 » un apprenant irrégulier qui travaille la journée 300.
 */
function positionDe(days, total = 365) {
  let derniereFaite = 0;
  for (let j = 1; j <= total; j += 1) if (days[j]?.status === 'done') derniereFaite = j;
  for (let j = derniereFaite + 1; j <= total; j += 1) if (days[j]?.status !== 'done') return j;
  return total + 1;
}

export function trierProfil(profil, { auJour = null } = {}) {
  const r = simuler(profil, { avecFaits: true });
  const faits = auJour == null ? r.faits : couper(r.faits, auJour);
  const now = auJour == null ? r.finAt : new Date(DEBUT + auJour * DAY_MS).toISOString();

  const proj = projectLearnerMemory({ facts: faits, context: CTX, now });
  const fiches = proj.concepts.filter((f) => f.firstExposureAt);
  const ficheDe = new Map(fiches.map((f) => [f.id, f]));

  const ouverts = Object.keys(faits.days).map(Number);
  const jourCourant = positionDe(faits.days);
  const jourMax = ouverts.length ? Math.max(...ouverts) : 0;

  const essentielles = notionsEssentielles({
    jourCourant, horizon: HORIZON,
    // `dayConcepts` est un objet nu ici (le read-model serveur l'expose en Map).
    leconsDuJour: (j) => CTX.dayConcepts[j] ?? [],
    prerequisDe,
  });

  const parConcept = new Map();
  for (const a of faits.recallAttempts) {
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

  const commun = {
    fiches, dueAtOf, statutDe, minutesDe,
    estEssentielle: (id) => essentielles.has(id),
    scoreDe: (id) => (ficheDe.has(id) ? prioriteDe(ficheDe.get(id), { dueAt: dueAtOf(id), now }).score : 0),
    besoinDe: (id) => ficheDe.get(id)?.nextCurriculumNeed ?? null,
    now,
  };
  const t = trierArriere({ ...commun, prerequisDe });

  // ── LA CONTRE-MESURE QUI RÉPOND À L'ACCUSATION DU BRIEF ──
  //
  // *« Ne pas gagner en mettant 90 % dans PARKED. »* La question n'est donc pas
  // « combien sont garées » mais « **qu'est-ce que le garage FAIT GAGNER au
  // moteur ?** ». On rejoue le même triage avec le garage désactivé : si la
  // séance du jour est identique, garer ne rapporte rien — ni un arriéré plus
  // beau, ni une charge allégée. Ce n'est alors pas une triche, c'est un
  // classement.
  const sansGarage = trierArriere({ ...commun, prerequisDe: () => [] });

  // ── LES DEUX VIOLATIONS QUI COMPTENT ──
  // Une notion urgente garée cacherait ce qui bloque le parcours ; un échec
  // garé ferait disparaître un échec (R4). Comptées, pas supposées.
  const urgentesGarees = t.notions.filter((n) => n.classe === 'URGENT' && n.placement === 'gare').length;
  const echecsGares = t.notions.filter((n) => n.placement === 'gare'
    && ficheDe.get(n.id)?.lastFailureAt
    && (!ficheDe.get(n.id)?.lastSuccessAt || ficheDe.get(n.id).lastSuccessAt < ficheDe.get(n.id).lastFailureAt)).length;

  return {
    id: profil.id, nom: profil.nom,
    jourCourant, jourMax,
    total: t.total,
    actif: t.placement.actif, differe: t.placement.differe, gare: t.placement.gare,
    somme: t.placement.actif + t.placement.differe + t.placement.gare,
    URGENT: t.compte.URGENT, IMPORTANT: t.compte.IMPORTANT,
    DEFERRABLE: t.compte.DEFERRABLE, PARKED: t.compte.PARKED,
    partGaree: t.total ? Math.round((t.placement.gare / t.total) * 100) : 0,
    pression: t.pression,
    soupape: t.soupape,
    // Ce que le garage change RÉELLEMENT pour l'apprenant : le total est-il
    // différent ? la séance du jour est-elle plus courte ?
    totalSansGarage: sansGarage.total,
    actifSansGarage: sansGarage.placement.actif,
    urgentesGarees, echecsGares,
    sansRaison: t.notions.filter((n) => !n.raison).length,
    gareesSansCondition: t.notions.filter((n) => n.classe === 'PARKED' && !n.conditionDeRetour).length,
  };
}

function table(tous, titre) {
  console.log(`\n## ${titre}\n`);
  console.log('| # | profil | jour | total | actif | différé | garé | % garé | URG | IMP | DEF | I2 |');
  console.log('|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const r of tous) {
    console.log(`| ${r.id} | ${r.nom} | ${r.jourCourant} | **${r.total}** | ${r.actif} | ${r.differe} | ${r.gare} | ${r.partGaree} % | ${r.URGENT} | ${r.IMPORTANT} | ${r.DEFERRABLE} | ${r.somme === r.total ? '✅' : '❌'} |`);
  }
}

function invariants(tous, etiquette) {
  const viole = tous.filter((r) => r.somme !== r.total);
  const urg = tous.reduce((s, r) => s + r.urgentesGarees, 0);
  const ech = tous.reduce((s, r) => s + r.echecsGares, 0);
  const muettes = tous.reduce((s, r) => s + r.sansRaison + r.gareesSansCondition, 0);
  const pireGare = [...tous].sort((a, b) => b.partGaree - a.partGaree)[0];
  const totalChange = tous.filter((r) => r.totalSansGarage !== r.total);
  const actifChange = tous.filter((r) => r.actifSansGarage !== r.actif);

  console.log(`\n### Invariants — ${etiquette}\n`);
  console.log(`**I2 · total = actif + différé + garé** : ${tous.length - viole.length}/${tous.length}${viole.length ? ` — ÉCHECS : ${viole.map((r) => r.id).join(' ')}` : ''}`);
  console.log(`**Notions URGENTES garées** : ${urg} *(une notion qui bloque le parcours ne se gare jamais)*`);
  console.log(`**Échecs non repris garés** : ${ech} *(R4 : un échec ne disparaît pas au garage)*`);
  console.log(`**Notions sans raison, ou garées sans condition de retour** : ${muettes}`);
  console.log(`**Part garée la plus haute** : ${pireGare.id} à **${pireGare.partGaree} %**`);
  console.log('');
  console.log('**Ce que le garage fait gagner au moteur** — triage rejoué garage désactivé :');
  console.log(`· arriéré TOTAL modifié : **${totalChange.length}/${tous.length}** profils${totalChange.length ? ` (${totalChange.map((r) => r.id).join(' ')})` : ' — le garage ne retire donc rien de la mesure'}`);
  console.log(`· séance du jour modifiée : **${actifChange.length}/${tous.length}** profils${actifChange.length ? ` (${actifChange.map((r) => `${r.id} ${r.actifSansGarage}→${r.actif}`).join(' · ')})` : ''}`);
  console.log(`**Soupape déclenchée** : ${tous.filter((r) => r.soupape).map((r) => r.id).join(' ') || 'aucun profil'}`);
  return { viole: viole.length, urg, ech, muettes, pireGare: pireGare.partGaree, actifChange: actifChange.length };
}

if (process.argv[1] && process.argv[1].endsWith('cp5-triage.mjs')) {
  console.log('# V75 · CP5 — TRIAGE DE L’ARRIÉRÉ, 20 PROFILS\n');
  console.log('> **Le triage ne fait pas baisser l’arriéré, et il n’a pas le droit d’essayer.**');
  console.log('> `total` est identique à l’arriéré mesuré au CP0 : ce qui change, c’est qu’on');
  console.log('> sait enfin ce que le produit fait de chaque notion, et pourquoi.\n');
  console.log('> **Deux instantanés, et la raison est une anomalie de sonde.** Mesuré au seul');
  console.log('> jour 365, `URGENT` vaut 0 pour tout le monde — au dernier jour, aucune journée');
  console.log('> n’est « à venir », donc plus rien n’est prérequis de la suite. C’est exactement');
  console.log('> l’anomalie n° 1 du CP0, refaite à un autre endroit. On mesure donc aussi au');
  console.log('> **jour 180**, où un avenir existe.\n');

  const mi = PROFILS.map((p) => trierProfil(p, { auJour: 180 }));
  table(mi, 'Jour 180 — en cours de parcours, un avenir existe');
  const rMi = invariants(mi, 'jour 180');

  const fin = PROFILS.map((p) => trierProfil(p));
  table(fin, 'Jour 365 — fin de parcours');
  invariants(fin, 'jour 365');

  console.log('\n## Pression, au jour 180 — cinq facteurs, jamais additionnés\n');
  console.log('| # | bloquantes | échecs non repris | volume | minutes | ancienneté |');
  console.log('|---|---|---|---|---|---|');
  for (const r of mi) {
    console.log(`| ${r.id} | ${r.pression.bloquantes} | ${r.pression.echecsNonRepris} | ${r.pression.volume} | ${r.pression.minutesRequises} | ${r.pression.anciennete} j |`);
  }

  writeFileSync(join(ROOT, 'docs', 'v75', 'cp5-triage.json'),
    `${JSON.stringify({ jour180: mi, jour365: fin }, null, 1)}\n`);
  console.log('\nécrit : docs/v75/cp5-triage.json');
  if (rMi.viole || rMi.urg || rMi.ech || rMi.muettes) process.exitCode = 1;
}
