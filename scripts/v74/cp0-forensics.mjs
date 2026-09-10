// V74 · CP0 — RETENTION FORENSICS. LECTURE SEULE, aucun comportement modifié.
//
// Deux grains sont mesurés, et c'est délibéré :
//   COMPÉTENCE (20)  — le grain de V73, celui des `expectedScores` et du calendrier
//   CONCEPT (128)    — le grain du Retention Engine V66, une leçon = une idée enseignable
// Un défaut visible à un grain peut être invisible à l'autre. Les deux sont publiés.
//
// Un CONTACT est une journée non-revue qui porte la notion, ou une revue qui la relie.
// Sa NATURE est lue dans des déclarations (règle S1 héritée de V73) :
//   exposition  — la journée lie la notion, sans exercice ni projet
//   pratique    — la journée porte au moins un exercice de la banque
//   application — la journée porte `project: N`
//   revue       — la journée est une revue hebdomadaire
//
// AUCUNE valeur n'est déclarée « bonne » ou « mauvaise » ici. CP0 mesure.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';

const g = JSON.parse(readFileSync('docs/v73/curriculum-graph.json', 'utf8'));
const prog = JSON.parse(readFileSync('data/program.json', 'utf8'));
const statuts = JSON.parse(readFileSync('docs/v73/V73-STATUTS-128.json', 'utf8'));
const n3 = (n) => String(n).padStart(3, '0');
const lire = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');

const skillsDeLecon = new Map(statuts.map((l) => [l.slug, l.competences]));
const sansLecon = new Set(prog.skills.map((s) => s.id).filter((id) => !statuts.some((l) => l.competences.includes(id))));
const projetDe = new Map(prog.days.map((d) => [d.day, d.project ?? null]));

// ── contacts, aux deux grains ────────────────────────────────────────────
function natureDe(d) {
  if (d.revue) return 'revue';
  if (projetDe.get(d.j)) return 'application';
  if (d.exercices.length) return 'pratique';
  return 'exposition';
}
const contactsCompetence = new Map(prog.skills.map((s) => [s.id, []]));
const contactsConcept = new Map(statuts.map((l) => [l.slug, []]));
for (const d of g.jours) {
  const nature = natureDe(d);
  for (const slug of d.lecons) contactsConcept.get(slug)?.push({ j: d.j, nature });
  const cs = new Set(d.lecons.flatMap((s) => skillsDeLecon.get(s) ?? []));
  if (sansLecon.has(d.etiquette)) cs.add(d.etiquette);
  for (const c of cs) contactsCompetence.get(c)?.push({ j: d.j, nature });
}

const q = (a, p) => { if (!a.length) return null; const t = [...a].sort((x, y) => x - y); return t[Math.min(t.length - 1, Math.floor(p * t.length))]; };
const med = (a) => q(a, 0.5);

function fiche(id, cs) {
  const trav = cs.filter((c) => c.nature !== 'revue');
  const gaps = []; for (let i = 1; i < cs.length; i++) gaps.push(cs[i].j - cs[i - 1].j);
  const premier = (n) => cs.find((c) => c.nature === n)?.j ?? null;
  const revues = cs.filter((c) => c.nature === 'revue').map((c) => c.j);
  // B — les quatre intervalles charnières
  const expo = cs.length ? cs[0].j : null;
  const prat = premier('pratique');
  const appli = premier('application');
  const revueApresAppli = appli === null ? null : (revues.find((j) => j > appli) ?? null);
  const ecartsRevueRevue = []; for (let i = 1; i < revues.length; i++) ecartsRevueRevue.push(revues[i] - revues[i - 1]);
  // écart revue ↔ dernier contact de TRAVAIL qui la précède
  const ecartsRevue = revues.map((r) => { const av = trav.filter((c) => c.j < r).map((c) => c.j); return av.length ? r - Math.max(...av) : null; }).filter((x) => x !== null);
  // E — concentration : plus petite fenêtre contenant 80 % des contacts
  const fen80 = (() => {
    if (cs.length < 3) return null;
    const js = cs.map((c) => c.j).sort((a, b) => a - b);
    const k = Math.ceil(js.length * 0.8);
    let best = Infinity;
    for (let i = 0; i + k - 1 < js.length; i++) best = Math.min(best, js[i + k - 1] - js[i]);
    return best;
  })();
  const dernier = cs.length ? cs.at(-1).j : null;
  return {
    id, nContacts: cs.length,
    parNature: Object.fromEntries(['exposition', 'pratique', 'application', 'revue'].map((n) => [n, cs.filter((c) => c.nature === n).length])),
    premiereExposition: expo, premierePratique: prat, premiereApplication: appli,
    expositionVersPratique: prat !== null && expo !== null ? prat - expo : null,
    pratiqueVersApplication: appli !== null && prat !== null ? appli - prat : null,
    applicationVersRevue: revueApresAppli !== null && appli !== null ? revueApresAppli - appli : null,
    ecartRevueRevueMedian: med(ecartsRevueRevue),
    ecartRevueDernierContactMedian: med(ecartsRevue),
    ecartsRevueDernierContact: ecartsRevue,
    derniereExposition: dernier, silenceFinal: dernier === null ? null : 365 - dernier,
    plusGrandSilence: gaps.length ? Math.max(...gaps) : null,
    fenetre80: fen80, gaps,
  };
}
const parCompetence = [...contactsCompetence].map(([id, cs]) => fiche(id, cs));
const parConcept = [...contactsConcept].map(([id, cs]) => fiche(id, cs));

// ── A · distribution de TOUS les intervalles entre contacts
const tousGaps = { competence: parCompetence.flatMap((f) => f.gaps), concept: parConcept.flatMap((f) => f.gaps) };
// I · répétitions immédiatement consécutives (intervalle de 1 jour)
// J · répartition par palier
const PALIERS = [[1, 1], [2, 3], [4, 7], [8, 14], [15, 30], [31, 60], [61, 90], [91, 9999]];
const repartition = (gaps) => Object.fromEntries(PALIERS.map(([a, b]) => [a === b ? `${a} j` : (b === 9999 ? `${a}+ j` : `${a}-${b} j`), gaps.filter((x) => x >= a && x <= b).length]));

// ── G/H · niveau attendu et prochain besoin curriculaire
const niveauMax = new Map();
const moisDuNiveau = new Map();
for (const m of prog.months) for (const [c, n] of Object.entries(m.expectedScores ?? {})) {
  if ((niveauMax.get(c) ?? 0) < n) { niveauMax.set(c, n); moisDuNiveau.set(c, m.month); }
}
for (const f of parCompetence) {
  f.niveauAttenduMax = niveauMax.get(f.id) ?? null;
  f.moisDuNiveauMax = moisDuNiveau.get(f.id) ?? null;
  // H · prochain endroit où la compétence redevient nécessaire APRÈS son dernier contact
  const apres = (g.jours.filter((d) => !d.revue && d.j > (f.derniereExposition ?? 0))
    .find((d) => projetDe.get(d.j) && [...new Set(d.lecons.flatMap((s) => skillsDeLecon.get(s) ?? []))].includes(f.id)));
  f.prochainBesoinProjet = apres?.j ?? null;
}

// ── AUDIT DES 52 REVUES
const REV = /^## 🔁 Revue hebdomadaire/;
const revues52 = g.jours.filter((d) => d.revue).map((d) => {
  const md = lire(`curriculum/days/day-${n3(d.j)}.md`);
  const sec = (re) => { const i = md.search(re); if (i < 0) return ''; const j = md.indexOf('\n### ', i + 1); const k = md.indexOf('\n## ', i + 1); const fin = Math.min(...[j, k].filter((x) => x > 0).concat([md.length])); return md.slice(i, fin); };
  const debut = (d.semaine - 1) * 7 + 1;
  const joursSemaine = g.jours.filter((x) => x.j >= debut && x.j < d.j && !x.revue);
  // dernière exposition de chaque leçon reliée, AVANT la revue
  const derniers = d.lecons.map((s) => {
    const av = (contactsConcept.get(s) ?? []).filter((c) => c.j < d.j && c.nature !== 'revue');
    return av.length ? { slug: s, j: av.at(-1).j, nature: av.at(-1).nature } : { slug: s, j: null, nature: null };
  });
  const ecarts = derniers.filter((x) => x.j !== null).map((x) => d.j - x.j);
  const rappelActif = /rappel actif \((\d+) min\)/i.exec(md);
  return {
    j: d.j, semaine: d.semaine, nLecons: d.lecons.length, lecons: d.lecons,
    derniersContacts: derniers, ecartMin: ecarts.length ? Math.min(...ecarts) : null,
    ecartMedian: med(ecarts), ecartMax: ecarts.length ? Math.max(...ecarts) : null,
    rappelActifMin: rappelActif ? +rappelActif[1] : null,
    aTestPratique: /### Test pratique/.test(md), aTestTheorique: /### Test théorique/.test(md),
    aGrille: /### Grille de notation/.test(md), aRemediation: /### Plan de remédiation/.test(md),
    aRelecture: /relecture ciblée/i.test(md),
    // les leçons de la revue viennent-elles de SA semaine ?
    leconsDeSaSemaine: d.lecons.filter((s) => joursSemaine.some((x) => x.lecons.includes(s))).length,
  };
});

// ── AUDIT DES FORMES DE RÉVISION (taxonomie du brief)
// Chaque forme est reconnue par une DÉCLARATION de section, jamais par un mot isolé.
const FORMES = {
  PASSIVE_REVIEW: /relecture ciblée|à lire\/relire/i,
  RECOGNITION: /Mini-quiz/i,
  FREE_RECALL: /rappel actif \(\d+ min\), leçons FERMÉES/i,
  CUED_RECALL: /### Test théorique|Question d'entretien/i,
  RECONSTRUCTION: /### Exercice de réflexion architecturale/i,
  DIAGNOSIS: /### Plan de remédiation|Erreurs fréquentes/i,
  APPLICATION: /### Mini-projet|Livrable attendu/i,
  TRANSFER: /Cas métier|Pourquoi ça comptera plus tard/i,
  PRODUCTION: /### Test pratique|Pratique autonome/i,
};
const formes = Object.fromEntries(Object.keys(FORMES).map((k) => [k, { jours: [], revues: 0, travail: 0 }]));
for (const d of g.jours) {
  const md = lire(`curriculum/days/day-${n3(d.j)}.md`);
  for (const [k, re] of Object.entries(FORMES)) if (re.test(md)) { formes[k].jours.push(d.j); if (d.revue) formes[k].revues++; else formes[k].travail++; }
}

// ── INVENTAIRE DE L'ÉTAT APPRENANT — lu dans le code, jamais inventé
const champsApprenant = JSON.parse(readFileSync('scripts/v74/cp0-learner-fields.json', 'utf8'));

const sortie = {
  avertissement: "CP0 MESURE. Aucune valeur n'est ici déclarée bonne ou mauvaise.",
  A_distributionIntervalles: {
    competence: { n: tousGaps.competence.length, min: Math.min(...tousGaps.competence), P10: q(tousGaps.competence, 0.1), P25: q(tousGaps.competence, 0.25), median: med(tousGaps.competence), P75: q(tousGaps.competence, 0.75), P90: q(tousGaps.competence, 0.9), max: Math.max(...tousGaps.competence) },
    concept: { n: tousGaps.concept.length, min: Math.min(...tousGaps.concept), P10: q(tousGaps.concept, 0.1), P25: q(tousGaps.concept, 0.25), median: med(tousGaps.concept), P75: q(tousGaps.concept, 0.75), P90: q(tousGaps.concept, 0.9), max: Math.max(...tousGaps.concept) },
  },
  IJ_repartitionParPalier: { competence: repartition(tousGaps.competence), concept: repartition(tousGaps.concept) },
  competences: parCompetence, concepts: parConcept,
  revues52, formes: Object.fromEntries(Object.entries(formes).map(([k, v]) => [k, { total: v.jours.length, revues: v.revues, travail: v.travail }])),
  etatApprenant: champsApprenant,
};
writeFileSync('docs/v74/cp0-forensics.json', JSON.stringify(sortie, null, 1));
console.log('écrit : docs/v74/cp0-forensics.json');
