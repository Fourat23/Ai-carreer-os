// V73 · CP2 — GRAPHE CANONIQUE DU CURRICULUM.
//
// Ce module N'EST PAS un second graphe. `lib/curriculum-graph.mjs` (V31) existe déjà, est
// pur, et est utilisé par les portes v39/v40/v42 : il porte l'axe
// leçon → prérequis → pratique → compétence → évaluation. On le RÉUTILISE tel quel.
//
// Ce que le CP2 ajoute, et qui manquait : **l'axe TEMPOREL**. Le graphe V31 ignore les
// 365 journées. Or toutes les questions de V73 sont temporelles — quand une compétence
// est-elle introduite, pratiquée, appliquée, révisée ; un prérequis arrive-t-il avant ;
// une revue révise-t-elle quelque chose de déjà vu.
//
// RÈGLE S1 DU CONTRAT, appliquée ici. Tout ce qui suit se lit dans des DÉCLARATIONS :
//   - `scripts/data/lessons-map.mjs`  → quelles compétences une leçon porte, ses pratiques
//   - `data/program.json`             → les 365 journées, leurs semaines, mois, projets
//   - `curriculum/days/day-NNN.md`    → les liens `/doc/lessons/<slug>` (déclaration de lien)
//   - `data/day-exercises.json`       → les exercices d'une journée
//   - `app/doc/[...slug]/page.tsx`    → `LAB_ROUTES`, la table des labs réels
// Aucune propriété du graphe n'est déduite d'une analyse de prose.
//
// RÈGLE I4 DU CONTRAT, appliquée ici. La source d'enseignement d'une compétence n'est PAS
// `day.skill` — le CP0 a montré que cette lecture produit un faux positif (le mois 6
// enseigne l'évaluation sous l'étiquette `ml`). Une compétence est ENSEIGNÉE au premier
// jour non-revue qui lie une LEÇON DÉCLARANT cette compétence.
//
// Usage : node scripts/v73/cp2-graphe.mjs [--json] [--ecrire]
import { readFileSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { buildCurriculumGraph, auditCurriculumGraph, findPrereqCycles } from '../../lib/curriculum-graph.mjs';

const prog = JSON.parse(readFileSync('data/program.json', 'utf8'));
const { LESSONS } = await import('../data/lessons-map.mjs');
const n3 = (n) => String(n).padStart(3, '0');
const lire = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');

// ─────────────────────────────────────────── inventaire déclaré des artefacts
const idsDe = (d) => (existsSync(`data/${d}`) ? readdirSync(`data/${d}`).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)) : []);
const knownEx = new Set(idsDe('exercises'));
const knownPb = new Set(idsDe('playbooks'));
const knownMi = new Set(idsDe('missions'));
const labRoutes = new Set([...lire('app/doc/[...slug]/page.tsx').match(/const LAB_ROUTES[^}]*}/s)?.[0]
  .matchAll(/^\s*'?([a-z0-9-]+)'?\s*:/gm) ?? []].map((m) => m[1]).filter((x) => x !== 'const'));
const slugsLecons = new Set(readdirSync('curriculum/lessons').filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)));

// ─────────────────────────────────────────── graphe V31 réutilisé, non redéfini
const leconsPourGraphe = LESSONS.map((e) => ({
  slug: e.file.replace(/\.md$/, ''), title: e.title, cat: e.cat, level: e.level,
  skills: e.skills ?? [], practiceRefs: e.practiceRefs ?? [],
}));
// ANOMALIE DE SONDE PUBLIÉE (n° 7 de V73). Un premier jet mettait TOUS les liens de la
// section « Prérequis » dans le graphe REQUIRES, renvois d'approfondissement compris. Il en
// résultait QUATRE « cycles de prérequis » (ai-security↔authentication,
// api-design-basics↔breaking-changes-compatibility, rag-evaluation↔retrieval-reranking,
// technical-documentation↔readme-documentation) qui n'en sont pas : dans chaque paire, au
// moins un des deux liens est un renvoi ANNONCÉ (« Où trouver le détail… rien ici ne suppose
// que tu l'as lue »). Une exigence et un renvoi ne sont pas la même arête.
// Le plan est donc SCINDÉ : REQUIS (exigence réelle) et LOOKAHEAD (renvoi annoncé).
//
// ÉLARGISSEMENT DÉCLARÉ du motif d'annonce, et sa justification — la règle S4 interdit
// d'élargir une regex « dans le seul but d'obtenir du vert », elle n'interdit pas de corriger
// un classifieur démontré incomplet. Après le premier passage, un cycle subsistait :
// `retrieval-reranking` → `rag-evaluation`. La phrase a été LUE : « La notion de rappel@k,
// centrale ici, est APPROFONDIE dans l'évaluation ». C'est la seconde tournure d'annonce
// employée par le corpus (V71 · CP11 en emploie deux : « Où trouver le détail » et
// « approfondi dans »), et le premier motif ne couvrait que la première. « est approfondie
// dans » est donc ajouté. Les deux leçons sont par ailleurs enseignées LE MÊME JOUR (j218),
// donc aucun ordre n'est violé. Le CP5 notera que cette annonce est plus faible que les
// autres et mérite d'être rendue explicite dans le texte.
// Règle S6 du contrat, étendue. Le préfixe `>` des encadrés coupe les phrases ; l'emphase
// Markdown les coupe aussi : « sont **programmées plus loin** dans le parcours » ne contient
// PAS la chaîne « plus loin dans le parcours », à cause des astérisques. Quatre annonces
// parfaitement explicites étaient ainsi classées « exigence non annoncée » (13ᵉ anomalie de
// sonde de V73). On retire donc aussi l'emphase et les accents graves avant toute recherche.
const normaliser = (t) => t.replace(/^\s*>\s?/gm, '').replace(/[*`]/g, '').replace(/\s+/g, ' ');
//
// ANOMALIE DE SONDE PUBLIÉE (n° 12 de V73 — la plus grave, et trouvée par un test négatif).
// Un premier jet cherchait le marqueur d'annonce dans tout le PARAGRAPHE contenant la
// citation, et acceptait « Aucune X n'est supposée » comme marqueur. Or cette phrase parle
// du SUJET PROPRE de la leçon, pas de la leçon citée : « Tu dois connaître le box model
// (`css-fundamentals`) … Aucune notion de disposition n'est supposée. » Résultat : QUATRE-
// VINGT-TROIS exigences réelles étaient classées « renvoi annoncé », dont
// `css-flexbox → css-fundamentals`, et le graphe REQUIRES perdait 129 arêtes. Le contrôle de
// cycles portait donc sur un graphe tronqué.
//
// RÈGLE CORRIGÉE, et elle porte sur la propriété : une annonce doit désigner LA LEÇON CITÉE
// comme venant plus tard. La portée est donc le bloc de citation `>` s'il y en a un — ces
// encadrés sont dédiés à une citation — sinon la PHRASE contenant la citation. Et le motif ne
// retient que les marqueurs de POSTÉRIORITÉ ou d'ÉTAGÈRE, jamais « n'est supposé ».
const ANNONCE = /programmées? plus loin|programmées? au mois|plus loin dans le parcours|rien ici ne suppose|viendra plus loin|étagère de référence|n'est programmée par aucune|rien ici ne suppose que tu l'as lue|sans l'avoir lue|se suit sans|tu y reviendras|n'en dépend pas|est approfondie? dans|sont approfondis dans|si tu l'as vue|d'abord.{0,40}ensuite/i;
const prereqPlan = {};      // exigences réelles → graphe REQUIRES, contrôle de cycles
const lookaheadPlan = {};   // renvois annoncés → jamais un cycle, jamais un défaut d'ordre
for (const s of slugsLecons) {
  const md = lire(`curriculum/lessons/${s}.md`);
  const i = md.indexOf('## 🧩 Prérequis'); if (i < 0) continue;
  const j = md.indexOf('\n## ', i + 1);
  const bloc = md.slice(i, j < 0 ? md.length : j);
  const lignes = bloc.split('\n');
  for (const dep of [...new Set([...bloc.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))]) {
    if (dep === s || !slugsLecons.has(dep)) continue;
    const cite = `/doc/lessons/${dep}`;
    // portée : le bloc `>` contenant la citation, s'il existe
    let portee = null;
    for (let k = 0; k < lignes.length; k++) {
      if (!/^\s*>/.test(lignes[k]) || !lignes[k].includes(cite)) continue;
      let a = k, b = k;
      while (a > 0 && /^\s*>/.test(lignes[a - 1])) a--;
      while (b < lignes.length - 1 && /^\s*>/.test(lignes[b + 1])) b++;
      portee = normaliser(lignes.slice(a, b + 1).join('\n'));
      break;
    }
    if (portee === null) {                       // sinon : la phrase contenant la citation
      const plat = normaliser(bloc);
      const pos = plat.indexOf(cite);
      const deb = Math.max(0, plat.lastIndexOf('. ', pos) + 1);
      const fin = plat.indexOf('. ', pos);
      portee = plat.slice(deb, fin < 0 ? plat.length : fin + 1);
    }
    const cible = ANNONCE.test(portee) ? lookaheadPlan : prereqPlan;
    (cible[s] ??= []).push(dep);
  }
}
const dayEx = existsSync('data/day-exercises.json') ? JSON.parse(readFileSync('data/day-exercises.json', 'utf8')) : {};
const exAtteignables = new Set(Object.values(dayEx).flat().filter((x) => typeof x === 'string'));

const graphe31 = buildCurriculumGraph({
  lessons: leconsPourGraphe,
  prereqPlans: [prereqPlan],
  known: { exercises: knownEx, playbooks: knownPb, missions: knownMi, labs: labRoutes,
           skills: new Set(prog.skills.map((s) => s.id)), reachableExercises: exAtteignables },
});
const audit31 = auditCurriculumGraph(graphe31);

// ─────────────────────────────────────────── COUCHE TEMPORELLE (l'apport du CP2)
const skillsDeLecon = new Map(leconsPourGraphe.map((l) => [l.slug, new Set(l.skills)]));
const jours = prog.days.map((d) => {
  const md = lire(`curriculum/days/day-${n3(d.day)}.md`);
  const liees = [...new Set([...md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))].filter((s) => slugsLecons.has(s));
  return {
    j: d.day, semaine: d.week, mois: d.month, etiquette: d.skill, revue: !!d.isReview,
    titre: d.title, livrable: d.deliverable ?? null, projet: d.project?.id ?? null,
    difficulte: d.difficulty, lecons: liees,
    // ANOMALIE DE SONDE PUBLIÉE (n° 8 de V73). `day.project` n'est renseigné que sur
    // 10 journées sur 365, alors que 34 journées portent un titre « Projet N — … ».
    // Compter les productions sur `day.project` donnait ZÉRO application pour les vingt
    // compétences. Le marqueur déclaratif fiable est le titre normalisé de `program.json`.
    estProduction: /^Projet \d/.test(d.title),
    exercices: (dayEx[String(d.day)] ?? []).filter((x) => typeof x === 'string'),
    // compétences RÉELLEMENT portées par la journée = union des compétences de ses leçons
    competencesPortees: [...new Set(liees.flatMap((s) => [...(skillsDeLecon.get(s) ?? [])]))],
  };
});

// contacts par compétence, en respectant I4 (déclaration de leçon, pas `day.skill`)
const CONTACT = { EXPOSITION: 'exposition', PRATIQUE: 'pratique', PRODUCTION: 'production', REVUE: 'revue' };
const contactsParCompetence = new Map(prog.skills.map((s) => [s.id, []]));
// Une compétence qu'AUCUNE leçon ne déclare (`autonomy`) n'a pas d'autre déclaration que
// l'étiquette de journée. Le repli est donc lui aussi déclaratif, et il est nommé.
const sansLeconDeclarante = new Set(prog.skills.map((s) => s.id)
  .filter((id) => !leconsPourGraphe.some((l) => l.skills.includes(id))));
for (const d of jours) {
  const portees = [...new Set([...d.competencesPortees,
    ...(sansLeconDeclarante.has(d.etiquette) ? [d.etiquette] : [])])];
  for (const c of portees) {
    const l = contactsParCompetence.get(c); if (!l) continue;
    let type = d.revue ? CONTACT.REVUE : CONTACT.EXPOSITION;
    if (!d.revue && (d.projet || d.estProduction)) type = CONTACT.PRODUCTION;
    else if (!d.revue && d.exercices.length) type = CONTACT.PRATIQUE;
    l.push({ j: d.j, type, projet: d.projet, exercices: d.exercices.length, revue: d.revue });
  }
}

// évaluations déclarées : `expectedScores` par mois
const finDeMois = new Map(prog.months.map((m) => [m.month, Math.max(...prog.days.filter((d) => d.month === m.month).map((d) => d.day))]));
const evaluations = [];
for (const m of prog.months)
  for (const [c, score] of Object.entries(m.expectedScores ?? {}))
    evaluations.push({ mois: m.month, competence: c, niveauAttendu: score, finJour: finDeMois.get(m.month) });

// ─────────────────────────────────────────── ARC PÉDAGOGIQUE PAR COMPÉTENCE
const arcs = prog.skills.map((s) => {
  const cs = contactsParCompetence.get(s.id) ?? [];
  const trav = cs.filter((c) => !c.revue);
  const ecarts = []; for (let i = 1; i < cs.length; i++) ecarts.push(cs[i].j - cs[i - 1].j);
  const evals = evaluations.filter((e) => e.competence === s.id);
  const leconsDeclarantes = leconsPourGraphe.filter((l) => l.skills.includes(s.id)).map((l) => l.slug);
  const leconsProgrammees = leconsDeclarantes.filter((l) => jours.some((d) => !d.revue && d.lecons.includes(l)));
  const pratiques = new Set();
  for (const l of leconsDeclarantes) for (const r of (LESSONS.find((e) => e.file === `${l}.md`)?.practiceRefs ?? [])) pratiques.add(`${r.kind}:${r.id}`);
  return {
    id: s.id, nom: s.name,
    // les six moments de l'arc
    // ANOMALIE DE SONDE PUBLIÉE (n° 6 de V73). Un premier jet définissait l'introduction
    // comme le premier contact de type EXPOSITION, EXPOSITION excluant par construction les
    // journées portant un exercice ou un projet. Résultat : `algo` introduit au jour 48,
    // `jsts` au jour 110, `gitlinux` au jour 73 — et treize fausses « évaluations sans
    // source » en I4. L'introduction est le PREMIER CONTACT DE TRAVAIL, quel que soit son
    // type ; le développement est l'ensemble des contacts de travail.
    introduction: trav[0]?.j ?? null,
    developpement: trav.map((c) => c.j),
    pratique: trav.filter((c) => c.type === CONTACT.PRATIQUE).map((c) => c.j),
    application: trav.filter((c) => c.type === CONTACT.PRODUCTION).map((c) => c.j),
    revues: cs.filter((c) => c.revue).map((c) => c.j),
    evaluations: evals.map((e) => ({ mois: e.mois, niveau: e.niveauAttendu, finJour: e.finJour })),
    niveauAttenduFinal: evals.length ? Math.max(...evals.map((e) => e.niveauAttendu)) : null,
    // métriques
    joursEtiquetes: prog.days.filter((d) => d.skill === s.id).length,
    joursPortants: new Set(cs.map((c) => c.j)).size,
    leconsDeclarantes: leconsDeclarantes.length,
    leconsProgrammees: leconsProgrammees.length,
    leconsHorsParcours: leconsDeclarantes.filter((l) => !leconsProgrammees.includes(l)),
    artefactsPratique: pratiques.size,
    premierContact: cs[0]?.j ?? null, dernierContact: cs.at(-1)?.j ?? null,
    plusGrandSilence: ecarts.length ? Math.max(...ecarts) : null,
    silenceFinal: cs.length ? 365 - cs.at(-1).j : null,
  };
});

// ─────────────────────────────────────────── CONTRÔLES D'INTÉGRITÉ (I1→I10 mesurables ici)
const controles = {};

// I2 — prérequis réellement futurs et NON annoncés
const premierEnseignement = new Map();
for (const d of jours) if (!d.revue) for (const s of d.lecons) if (!premierEnseignement.has(s)) premierEnseignement.set(s, d.j);
const prereqInvalides = [];
for (const [slug, deps] of Object.entries(prereqPlan)) {
  const jL = premierEnseignement.get(slug); if (jL === undefined) continue;
  const md = lire(`curriculum/lessons/${slug}.md`);
  const i = md.indexOf('## 🧩 Prérequis'); const jj = md.indexOf('\n## ', i + 1);
  const bloc = md.slice(i, jj < 0 ? md.length : jj);
  for (const dep of deps) {
    const jD = premierEnseignement.get(dep);
    if (jD !== undefined && jD <= jL) continue;             // enseigné avant : conforme
    const pos = bloc.indexOf(`/doc/lessons/${dep}`);
    const deb = Math.max(0, bloc.lastIndexOf('\n\n', pos)); const fin = bloc.indexOf('\n\n', pos);
    const para = normaliser(bloc.slice(deb, fin < 0 ? bloc.length : fin));
    if (!ANNONCE.test(para)) prereqInvalides.push({ lecon: slug, jourLecon: jL, prerequis: dep, jourPrerequis: jD ?? null, extrait: para.slice(0, 180) });
  }
}
controles.I2_prerequis_invalides = prereqInvalides;

// I3 — une revue introduit-elle une leçon jamais enseignée avant ?
const revuesFautives = [];
for (const d of jours.filter((x) => x.revue)) {
  const inedites = d.lecons.filter((s) => { const p = premierEnseignement.get(s); return p === undefined || p >= d.j; });
  if (inedites.length) revuesFautives.push({ j: d.j, inedites });
}
controles.I3_revues_introduisant = revuesFautives;

// I4 — un `expectedScores` sans source d'enseignement antérieure
const i4 = [];
for (const e of evaluations) {
  const arc = arcs.find((a) => a.id === e.competence);
  const source = arc?.developpement.find((j) => j <= e.finJour) ?? null;
  if (source === null) i4.push({ mois: e.mois, competence: e.competence, niveau: e.niveauAttendu, finJour: e.finJour });
}
controles.I4_evaluations_sans_source = i4;

// I6 / I9 — invariants de calendrier
controles.I6_invariants = {
  jours: prog.days.length, lecons: slugsLecons.size,
  corrections: readdirSync('curriculum/solutions').filter((f) => f.endsWith('.md')).length,
  semaines: prog.weeks.length, mois: prog.months.length,
  ordre: prog.days.every((d, i) => d.day === i + 1),
  doublons: prog.days.length - new Set(prog.days.map((d) => d.day)).size,
};

// I7 — progress.json ne doit pas exister
controles.I7_progress_absent = !existsSync('data/progress.json');

// I8 — cycles
controles.I8_cycles = findPrereqCycles(graphe31.requires);

// C9 — références mortes (déclarations uniquement, règle S1)
const refsMortes = [];
for (const p of graphe31.practices) if (!p.resolved) refsMortes.push({ source: `lesson:${p.lesson}`, kind: p.kind, id: p.id });
for (const [j, ids] of Object.entries(dayEx)) for (const id of (Array.isArray(ids) ? ids : [])) if (!knownEx.has(id)) refsMortes.push({ source: `day:${j}`, kind: 'exercise', id });
for (const d of jours) for (const m of lire(`curriculum/days/day-${n3(d.j)}.md`).matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)) if (!slugsLecons.has(m[1])) refsMortes.push({ source: `day:${d.j}`, kind: 'lesson', id: m[1] });
controles.C9_refs_mortes = refsMortes;

// I10 — leçons orphelines : ni programmées, ni déclarées référence dans leur texte
const orphelines = [];
for (const s of slugsLecons) {
  if (premierEnseignement.has(s)) continue;
  const md = lire(`curriculum/lessons/${s}.md`);
  if (!/Étagère de référence/i.test(md)) orphelines.push(s);
}
controles.I10_orphelines_non_declarees = orphelines;

const sortie = {
  version: 'V73-CP2',
  source: 'lib/curriculum-graph.mjs (V31, réutilisé) + couche temporelle V73',
  invariants: controles.I6_invariants,
  graphe31: {
    lecons: graphe31.lessons.size, competences: [...graphe31.skills].sort(),
    aretes: graphe31.edges.length, pratiques: graphe31.practices.length,
    pratiquesNonResolues: graphe31.practices.filter((p) => !p.resolved).length,
    anomaliesBloquantes: audit31.blocking?.length ?? 0,
  },
  jours, arcs, evaluations, controles,
};

if (process.argv.includes('--ecrire')) {
  writeFileSync('docs/v73/curriculum-graph.json', JSON.stringify(sortie, null, 1));
  console.log('écrit : docs/v73/curriculum-graph.json');
}
// `process.exit(0)` juste après un `console.log` TRONQUE la sortie au-delà de 64 Kio :
// l'écriture de stdout est asynchrone. Le graphe fait 200 Kio. On sort donc par retour
// normal, et la porte lit de préférence le fichier écrit par `--ecrire`.
if (process.argv.includes('--json')) { process.stdout.write(JSON.stringify(sortie)); }
else {

const P = (x, n) => String(x).padStart(n);
console.log(`GRAPHE V31 réutilisé : ${graphe31.lessons.size} leçons · ${graphe31.edges.length} arêtes · ${graphe31.practices.length} pratiques (${graphe31.practices.filter((p) => !p.resolved).length} non résolues)`);
console.log(`COUCHE TEMPORELLE V73 : ${jours.length} journées · ${evaluations.length} niveaux attendus déclarés\n`);
console.log('ARC PÉDAGOGIQUE PAR COMPÉTENCE  (I4 : source = leçon DÉCLARANTE, jamais day.skill)');
console.log('id         intro  dévelop  prat  appli  revues  éval(mois:niv)          jours porteurs / étiquetés');
for (const a of arcs) {
  const ev = a.evaluations.map((e) => `m${e.mois}:${e.niveau}`).join(' ');
  console.log(`${a.id.padEnd(10)} ${a.introduction ? 'j' + P(a.introduction, 3) : ' —  '} ${P(a.developpement.length, 6)} ${P(a.pratique.length, 5)} ${P(a.application.length, 6)} ${P(a.revues.length, 6)}  ${ev.padEnd(22)} ${P(a.joursPortants, 4)} / ${P(a.joursEtiquetes, 3)}`);
}
console.log('\nCONTRÔLES D\'INTÉGRITÉ');
console.log(`  I2 prérequis futurs non annoncés  : ${prereqInvalides.length}`);
for (const p of prereqInvalides) console.log(`       ${p.lecon} (j${p.jourLecon}) → ${p.prerequis} (j${p.jourPrerequis}) — « ${p.extrait.slice(0, 110)} »`);
console.log(`  I3 revues introduisant une leçon  : ${revuesFautives.length}`);
console.log(`  I4 évaluations sans source        : ${i4.length}`);
for (const e of i4) console.log(`       mois ${e.mois} attend ${e.competence} = ${e.niveau} · aucune journée porteuse avant j${e.finJour}`);
console.log(`  I6 invariants                     : ${JSON.stringify(controles.I6_invariants)}`);
console.log(`  I7 progress.json absent           : ${controles.I7_progress_absent}`);
console.log(`  I8 cycles de prérequis            : ${controles.I8_cycles.length}`);
console.log(`  I10 orphelines non déclarées      : ${orphelines.length}${orphelines.length ? ' — ' + orphelines.join(', ') : ''}`);
console.log(`  C9 références mortes              : ${refsMortes.length}`);
for (const r of refsMortes) console.log(`       ${r.source} → ${r.kind}:${r.id}`);
console.log(`\n  anomalies bloquantes du graphe V31 : ${audit31.blocking?.length ?? 0}`);
for (const b of (audit31.blocking ?? []).slice(0, 12)) console.log(`       [${b.type}] ${b.subject} — ${b.detail}`);
}
