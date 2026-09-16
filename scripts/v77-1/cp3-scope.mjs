// V77.1 · CP3 — CHOISIR LE SCOPE DU PILOTE SUR MESURE, PAS SUR SOUVENIR.
//
// Le CP0 avait comparé trois LEÇONS. Le CP1 a gelé un outcome primaire qui
// exige que le concept de chaque étape soit lisible dans l'export SEUL. Or,
// dans ce produit, un « concept » EST une leçon (`getConceptCatalogue` : un
// concept par `slug`), et un exercice déclaré par plusieurs leçons se résout en
// PLUSIEURS concepts (`R2 · MULTI_CONCEPT_BY_DESIGN`).
//
// Un tel exercice n'est pas « mal rangé » : il est multi-concept PAR CHOIX
// D'AUTEUR. Mais pour CE protocole, sa trace ne dit pas quel concept a été
// pratiqué. Il est donc écarté du pilote — et pas corrigé, pas tranché,
// pas déclaré de force. Le corpus reste intact.
//
// Ce script mesure, pour chaque leçon : ses exercices STRICTEMENT à elle, ses
// formes de rappel, son niveau, sa durée, et les défis de transfert qui la
// citent. Puis il compose des groupes de 3 à 6 concepts.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { availableFormats } from '../../lib/retention.mjs';

const JSON_SEUL = process.argv.includes('--json');
const dire = (...a) => { if (!JSON_SEUL) console.log(...a); };

const program = JSON.parse(readFileSync('data/program.json', 'utf8'));
const lecons = program.lessons ?? [];
const joursExercices = JSON.parse(readFileSync('data/day-exercises.json', 'utf8'));

// ── qui déclare quel exercice ──
const declarants = new Map();
for (const l of lecons) {
  for (const r of l.practiceRefs ?? []) {
    if (r.kind !== 'exercise') continue;
    if (!declarants.has(r.id)) declarants.set(r.id, []);
    declarants.get(r.id).push(l.slug);
  }
}

const joursDe = new Map();
for (const [j, ids] of Object.entries(joursExercices)) {
  for (const id of ids) {
    if (!joursDe.has(id)) joursDe.set(id, []);
    joursDe.get(id).push(Number(j));
  }
}

function exercice(id) {
  const f = `data/exercises/${id}.json`;
  if (!existsSync(f)) return null;
  const ex = JSON.parse(readFileSync(f, 'utf8'));
  return {
    id,
    difficulty: ex.difficulty ?? null,
    runtime: ex.runtime ?? null,
    tests: (ex.tests ?? ex.cases ?? []).length,
    hints: (ex.hints ?? []).length,
  };
}

// ── les défis de transfert, et les leçons qu'ils citent ──
const transferts = [];
for (const f of readdirSync('data/transfer-challenges')) {
  const t = JSON.parse(readFileSync(`data/transfer-challenges/${f}`, 'utf8'));
  transferts.push({
    id: t.id,
    title: t.title,
    lessonRefs: t.lessonRefs ?? [],
    sourceSkill: t.sourceSkill ?? null,
    transferLevel: t.transferLevel ?? null,
    crossDomain: t.crossDomain ?? null,
    passThreshold: t.passThreshold ?? null,
    questions: (t.questions ?? []).length,
  });
}

// ── fiche par concept (= par leçon) ──
const fiches = lecons.map((l) => {
  const md = `curriculum/lessons/${l.slug}.md`;
  const texte = existsSync(md) ? readFileSync(md, 'utf8') : '';
  const sections = [...texte.matchAll(/^## +(.+)$/gm)].map((m) => m[1].trim());
  const refs = (l.practiceRefs ?? []).filter((r) => r.kind === 'exercise');
  const exclusifs = [];
  const partages = [];
  for (const r of refs) {
    const d = declarants.get(r.id) ?? [];
    (d.length === 1 ? exclusifs : partages).push({ ...exercice(r.id), declarants: d.length, jours: joursDe.get(r.id) ?? [] });
  }
  return {
    conceptId: l.slug,
    titre: l.title,
    niveau: l.level ?? null,
    minutes: l.min ?? null,
    skills: l.skills ?? [],
    mots: texte ? texte.split(/\s+/).filter(Boolean).length : 0,
    sections: sections.length,
    formats: texte ? availableFormats(sections) : [],
    exercicesExclusifs: exclusifs.filter((e) => e.id),
    exercicesPartages: partages.filter((e) => e.id),
    transferts: transferts.filter((t) => t.lessonRefs.includes(l.slug)).map((t) => t.id),
  };
});

const parId = new Map(fiches.map((f) => [f.conceptId, f]));

// ── éligibilité d'un concept pour CE protocole ──
function eligibilite(f) {
  const manques = [];
  if (f.mots === 0) manques.push('aucun texte de leçon');
  if (f.exercicesExclusifs.length === 0) manques.push('aucun exercice exclusif');
  if (f.formats.length < 2) manques.push(`moins de 2 formes de rappel (${f.formats.length})`);
  return manques;
}

const eligibles = fiches.filter((f) => eligibilite(f).length === 0);

dire(`concepts du programme            ${fiches.length}`);
dire(`éligibles pour ce protocole      ${eligibles.length}`);
dire(`  · avec ≥1 exercice exclusif    ${fiches.filter((f) => f.exercicesExclusifs.length > 0).length}`);
dire(`  · avec ≥2 formes de rappel     ${fiches.filter((f) => f.formats.length >= 2).length}`);
dire(`  · cités par un transfert       ${fiches.filter((f) => f.transferts.length > 0).length}`);

// ── groupes candidats : une compétence, 3 à 6 concepts éligibles ──
const parSkill = new Map();
for (const f of eligibles) {
  for (const s of f.skills) {
    if (!parSkill.has(s)) parSkill.set(s, []);
    parSkill.get(s).push(f);
  }
}

const groupes = [];
for (const [skill, membres] of parSkill) {
  if (membres.length < 3) continue;
  const tries = [...membres].sort((a, b) => (a.niveau - b.niveau) || a.conceptId.localeCompare(b.conceptId));
  const choisis = tries.slice(0, 6);
  groupes.push({
    skill,
    taille: choisis.length,
    conceptsDisponibles: membres.length,
    minutesLecture: choisis.reduce((a, c) => a + (c.minutes ?? 0), 0),
    exercicesExclusifs: choisis.reduce((a, c) => a + c.exercicesExclusifs.length, 0),
    formatsUnion: [...new Set(choisis.flatMap((c) => c.formats))].sort(),
    niveaux: [...new Set(choisis.map((c) => c.niveau))].sort(),
    transferts: [...new Set(choisis.flatMap((c) => c.transferts))],
    concepts: choisis.map((c) => c.conceptId),
  });
}
groupes.sort((a, b) => b.transferts.length - a.transferts.length || a.minutesLecture - b.minutesLecture);

dire('\n== GROUPES CANDIDATS (une compétence, 3 à 6 concepts éligibles) ==');
for (const g of groupes.slice(0, 12)) {
  dire(` ${g.skill.padEnd(14)} ${String(g.taille).padStart(2)} concepts · ${String(g.minutesLecture).padStart(3)} min de lecture · ${String(g.exercicesExclusifs).padStart(2)} exercices exclusifs · ${g.formatsUnion.length} formats · ${g.transferts.length} transfert(s) · niveaux ${JSON.stringify(g.niveaux)}`);
  dire(`                ${g.concepts.join(', ')}`);
}

// ── les deux candidats du CP0, remesurés avec la règle stricte ──
dire('\n== LES CANDIDATS DU CP0, REMESURÉS ==');
for (const slug of ['api-production-contracts', 'algorithmic-thinking', 'javascript-basics']) {
  const f = parId.get(slug);
  if (!f) { dire(` ${slug} — introuvable`); continue; }
  const m = eligibilite(f);
  dire(` ${slug.padEnd(26)} exclusifs=${f.exercicesExclusifs.length} partagés=${f.exercicesPartages.length} formats=${f.formats.length} transferts=${JSON.stringify(f.transferts)} ${m.length ? 'MANQUE: ' + m.join(' · ') : 'ÉLIGIBLE'}`);
  for (const e of f.exercicesExclusifs) dire(`      exclusif  ${e.id.padEnd(26)} d=${e.difficulty} tests=${e.tests} indices=${e.hints} jours=${JSON.stringify(e.jours)}`);
  for (const e of f.exercicesPartages) dire(`      PARTAGÉ   ${e.id.padEnd(26)} d=${e.difficulty} déclarants=${e.declarants} — ÉCARTÉ du pilote`);
}

if (JSON_SEUL) {
  console.log(JSON.stringify({
    conceptsDuProgramme: fiches.length,
    eligibles: eligibles.length,
    groupes,
    candidatsCP0: ['api-production-contracts', 'algorithmic-thinking', 'javascript-basics'].map((s) => {
      const f = parId.get(s);
      return f ? { ...f, manques: eligibilite(f) } : { conceptId: s, introuvable: true };
    }),
    transferts,
  }, null, 2));
}
