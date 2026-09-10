// V73 · CP8 — DONNÉES DE RÉTENTION. Le moteur n'est PAS construit ici.
//
// Ce que produit ce script, et rien d'autre : le modèle de CONTACTS pédagogiques que le futur
// Retention Engine consommera. Aucune planification adaptative, aucun calendrier de révision,
// aucun score de mémoire — ce serait construire le moteur, ce que le brief interdit.
//
// Un CONTACT est un moment où le parcours met l'apprenant devant une notion. Quatre natures,
// toutes lues dans des DÉCLARATIONS (règle S1) :
//   firstExposure       première journée de travail qui lie une leçon portant la notion
//   guidedPractice      journée de travail portant un exemple guidé sur cette notion
//   independentPractice journée de travail portant au moins un exercice
//   application         journée de projet
//   reviewContact       journée de revue (depuis le CP7 : rappel actif, pas relecture)
//
// Les cinq anomalies cherchées sont celles du brief, et chacune a une définition opposable :
//   ABANDON_PRÉMATURÉ    aucun contact pendant les N derniers jours, N ≥ 180
//   RÉPÉTITION_LOCALE    ≥ 80 % des contacts tiennent dans une fenêtre ≤ 45 jours
//   SILENCE_EXCESSIF     un intervalle entre deux contacts ≥ 120 jours
//   RAPPEL_TROP_PROCHE   médiane des écarts revue ↔ dernier contact ≤ 2 jours
//   ABSENCE_DE_TRANSFERT aucune application (journée de projet) sur toute la compétence
//
// Usage : node scripts/v73/cp8-retention.mjs [--json] [--ecrire]
import { readFileSync, existsSync, writeFileSync } from 'node:fs';

const g = JSON.parse(readFileSync('docs/v73/curriculum-graph.json', 'utf8'));
const statuts = JSON.parse(readFileSync('docs/v73/V73-STATUTS-128.json', 'utf8'));
const prog = JSON.parse(readFileSync('data/program.json', 'utf8'));
const n3 = (n) => String(n).padStart(3, '0');
const lire = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const SKILLS = new Map(prog.skills.map((s) => [s.id, s.name]));
const skillsDe = new Map(statuts.map((l) => [l.slug, l.competences]));

// une compétence qu'aucune leçon ne déclare n'a d'autre déclaration que l'étiquette de journée
const sansLecon = new Set([...SKILLS.keys()].filter((id) => !statuts.some((l) => l.competences.includes(id))));

const guideDe = new Map(g.jours.map((d) => [d.j, /## .*Exemple guid/.test(lire(`curriculum/days/day-${n3(d.j)}.md`))]));
const dayEx = existsSync('data/day-exercises.json') ? JSON.parse(readFileSync('data/day-exercises.json', 'utf8')) : {};

const contacts = new Map([...SKILLS.keys()].map((id) => [id, []]));
for (const d of g.jours) {
  const portees = new Set(d.lecons.flatMap((s) => skillsDe.get(s) ?? []));
  if (sansLecon.has(d.etiquette)) portees.add(d.etiquette);
  // ANOMALIE DE SONDE PUBLIÉE (n° 17 de V73). Le marqueur de journée de PRODUCTION était
  // `^Projet \d`. Il rate les **30 journées « DocSense : … »**, qui sont pourtant le projet
  // final — le plus gros livrable des 365 jours. Résultat : `dl`, `llm` et `agents` étaient
  // signalées « aucune application » alors que DocSense est une application de bout en bout.
  const estProjet = /^Projet \d/.test(d.titre) || /^DocSense\s*:/.test(d.titre) || d.projet != null;
  const aExercice = (dayEx[String(d.j)] ?? []).length > 0;
  for (const c of portees) {
    const l = contacts.get(c); if (!l) continue;
    const nature = d.revue ? 'reviewContact'
      : estProjet ? 'application'
      : aExercice ? 'independentPractice'
      : guideDe.get(d.j) ? 'guidedPractice'
      : 'firstExposure';
    l.push({ j: d.j, nature, semaine: d.semaine, mois: d.mois });
  }
}

const niveauAttendu = new Map();
for (const m of prog.months)
  for (const [c, n] of Object.entries(m.expectedScores ?? {}))
    niveauAttendu.set(c, Math.max(niveauAttendu.get(c) ?? 0, n));

const fiches = [...SKILLS.entries()].map(([id, nom]) => {
  const cs = contacts.get(id) ?? [];
  const trav = cs.filter((c) => c.nature !== 'reviewContact');
  const gaps = []; for (let i = 1; i < cs.length; i++) gaps.push(cs[i].j - cs[i - 1].j);
  const premierDe = (n) => cs.find((c) => c.nature === n)?.j ?? null;
  const revues = cs.filter((c) => c.nature === 'reviewContact');
  // écart entre chaque revue et le dernier contact de travail qui la précède
  const ecartsRevue = revues.map((r) => {
    const av = trav.filter((c) => c.j < r.j).map((c) => c.j);
    return av.length ? r.j - Math.max(...av) : null;
  }).filter((x) => x !== null);
  const med = (a) => { if (!a.length) return null; const t = [...a].sort((x, y) => x - y); return t[Math.floor(t.length / 2)]; };
  const dernier = cs.length ? cs.at(-1).j : null;
  const fenetre80 = (() => {
    if (cs.length < 3) return null;
    const js = cs.map((c) => c.j).sort((a, b) => a - b);
    const k = Math.ceil(js.length * 0.8);
    let best = Infinity;
    for (let i = 0; i + k - 1 < js.length; i++) best = Math.min(best, js[i + k - 1] - js[i]);
    return best;
  })();

  const f = {
    competence: id, nom,
    firstExposure: cs.length ? cs[0].j : null,
    guidedPractice: premierDe('guidedPractice'),
    independentPractice: premierDe('independentPractice'),
    application: premierDe('application'),
    reviewContacts: revues.map((c) => c.j),
    projectContacts: cs.filter((c) => c.nature === 'application').map((c) => c.j),
    lastContact: dernier,
    gapSequence: gaps,
    maxGap: gaps.length ? Math.max(...gaps) : null,
    expectedLevel: niveauAttendu.get(id) ?? null,
    nContacts: cs.length, nTravail: trav.length,
    silenceFinal: dernier === null ? null : 365 - dernier,
    fenetre80pourcent: fenetre80,
    ecartRevueMedian: med(ecartsRevue),
  };
  f.anomalies = [];
  if (f.silenceFinal !== null && f.silenceFinal >= 180) f.anomalies.push(`ABANDON_PRÉMATURÉ (${f.silenceFinal} j sans contact après j${dernier})`);
  if (fenetre80 !== null && fenetre80 <= 45) f.anomalies.push(`RÉPÉTITION_LOCALE (80 % des contacts en ${fenetre80} j)`);
  if (f.maxGap !== null && f.maxGap >= 120) f.anomalies.push(`SILENCE_EXCESSIF (${f.maxGap} j entre deux contacts)`);
  if (f.ecartRevueMedian !== null && f.ecartRevueMedian <= 2) f.anomalies.push(`RAPPEL_TROP_PROCHE (médiane ${f.ecartRevueMedian} j)`);
  if (!f.projectContacts.length) f.anomalies.push('ABSENCE_DE_TRANSFERT (aucune journée de projet)');
  return f;
});

const sortie = {
  avertissement: "Ce fichier décrit des CONTACTS PROGRAMMÉS par le curriculum. Il ne contient aucune donnée d'apprenant, aucune progression, aucun score de mémoire — et ne doit jamais en contenir.",
  definitions: {
    ABANDON_PRÉMATURÉ: 'aucun contact pendant les ≥ 180 derniers jours',
    RÉPÉTITION_LOCALE: '≥ 80 % des contacts tiennent dans une fenêtre ≤ 45 jours',
    SILENCE_EXCESSIF: 'un intervalle ≥ 120 jours entre deux contacts',
    RAPPEL_TROP_PROCHE: 'médiane des écarts revue ↔ dernier contact de travail ≤ 2 jours',
    ABSENCE_DE_TRANSFERT: 'aucune journée de projet sur toute la compétence',
  },
  competences: fiches,
};
if (process.argv.includes('--ecrire')) writeFileSync('docs/v73/retention-contacts.json', JSON.stringify(sortie, null, 1));
if (process.argv.includes('--json')) { process.stdout.write(JSON.stringify(sortie)); }
else {
  const P = (x, n) => String(x).padStart(n);
  console.log('CONTACTS PÉDAGOGIQUES PROGRAMMÉS — aucune donnée d’apprenant\n');
  console.log('compétence  1er  guidé  prat  appli  rev  dernier  silence  maxGap  fen80  écartRev  niv');
  for (const f of fiches)
    console.log(`${f.competence.padEnd(10)} ${P(f.firstExposure ?? '—', 4)} ${P(f.guidedPractice ?? '—', 6)} ${P(f.independentPractice ?? '—', 5)} ${P(f.application ?? '—', 6)} ${P(f.reviewContacts.length, 4)} ${P(f.lastContact ?? '—', 8)} ${P(f.silenceFinal ?? '—', 8)} ${P(f.maxGap ?? '—', 7)} ${P(f.fenetre80pourcent ?? '—', 6)} ${P(f.ecartRevueMedian ?? '—', 9)} ${P(f.expectedLevel ?? '—', 4)}`);
  console.log('\nANOMALIES');
  const par = {};
  for (const f of fiches) for (const a of f.anomalies) { const k = a.split(' ')[0]; (par[k] ??= []).push(f.competence); }
  for (const [k, v] of Object.entries(par)) console.log(`  ${k.padEnd(22)} ${v.length} — ${v.join(', ')}`);
  console.log('\nDÉTAIL');
  for (const f of fiches) if (f.anomalies.length) console.log(`  ${f.competence.padEnd(10)} ${f.anomalies.join(' · ')}`);
}
