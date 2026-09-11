// V75 · CP4 — DÉSAMBIGUÏSATION DES 376 EXERCICES (D8). Mesure d'abord.
//
// ── LA RÈGLE DU CHECKPOINT ───────────────────────────────────────────────
//
// **Réduire l'ambiguïté RÉELLE, jamais la cacher.** Un exercice n'est reclassé
// que si une règle NOMMÉE le résout sans choix arbitraire. Reclasser pour
// verdir la métrique serait exactement ce que le brief interdit — et ce que
// V74 avait refusé en gardant `DERIVED_RECALL` qualifié plutôt qu'automatique.
//
// ── LES SOURCES DISPONIBLES, ET CE QU'ELLES VALENT ───────────────────────
//
// Mesuré au CP0 puis ici :
//   · `practiceRefs` d'une leçon — DÉCLARATION D'AUTEUR, la source la plus
//     fiable. 140 exercices ont exactement un déclarant, 67 en ont plusieurs ;
//   · rattachement par journée — coïncidence de calendrier, médiane 3
//     candidates, jusqu'à 15. Utilisable SEULEMENT quand elle donne un
//     candidat unique ;
//   · métadonnées explicites de l'exercice — **AUCUNE** : les 376 exercices ne
//     portent aucun champ `conceptIds`, `lessons` ni équivalent (vérifié) ;
//   · `trackRefs` — des PARCOURS DE CARRIÈRE (`backend-engineer-v1`…), pas des
//     leçons. Sans valeur pour ce problème ;
//   · `skills` de l'exercice croisés avec `skills` des leçons de sa journée —
//     la seule piste restante, évaluée ci-dessous.
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { resoudreExercice } from '../../lib/exercise-mapping.mjs';

const ROOT = process.cwd();
const pad3 = (n) => String(n).padStart(3, '0');
const pct = (n, d) => (d ? `${n}/${d} (${Math.round((n / d) * 100)} %)` : `${n}/0`);

const program = JSON.parse(readFileSync(join(ROOT, 'data', 'program.json'), 'utf8'));
const lessons = program.lessons ?? [];
const slugs = new Set(lessons.map((l) => l.slug));
const skillsDeLecon = new Map(lessons.map((l) => [l.slug, new Set(l.skills ?? [])]));

const exercices = readdirSync(join(ROOT, 'data', 'exercises')).filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(ROOT, 'data', 'exercises', f), 'utf8')));

const declarants = new Map();
for (const l of lessons) {
  for (const r of l.practiceRefs ?? []) {
    if (r.kind !== 'exercise') continue;
    if (!declarants.has(r.id)) declarants.set(r.id, []);
    declarants.get(r.id).push(l.slug);
  }
}

const dayExercises = JSON.parse(readFileSync(join(ROOT, 'data', 'day-exercises.json'), 'utf8'));
const joursDe = new Map();
for (const [j, ids] of Object.entries(dayExercises)) {
  for (const id of Array.isArray(ids) ? ids : []) {
    if (!joursDe.has(id)) joursDe.set(id, []);
    joursDe.get(id).push(Number(j));
  }
}
const leconsDuJour = new Map();
for (const d of program.days) {
  const p = join(ROOT, 'curriculum', 'days', `day-${pad3(d.day)}.md`);
  if (!existsSync(p)) continue;
  leconsDuJour.set(d.day, [...new Set([...readFileSync(p, 'utf8').matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))].filter((s) => slugs.has(s)));
}

/**
 * ── LA RÈGLE DE RÉSOLUTION ───────────────────────────────────────────────
 *
 * La cascade elle-même vit dans `lib/exercise-mapping.mjs` — le MÊME module
 * que celui branché sur le laboratoire. Ce script ne fait que lui fournir le
 * contexte lu du corpus : si la mesure publiée ci-dessous et le comportement
 * du produit venaient de deux implémentations, l'une des deux mentirait.
 *
 * Nuance sur les leçons de la journée : ce script les lit dans les Markdown
 * (`/doc/lessons/<slug>`), le serveur les lit dans le catalogue de concepts.
 * Les deux sources sont la même donnée — le catalogue est DÉRIVÉ de ces liens.
 */
export function resoudre(ex) {
  const jours = joursDe.get(ex.id) ?? [];
  return resoudreExercice({
    declarants: declarants.get(ex.id) ?? [],
    leconsDuJour: jours.flatMap((j) => leconsDuJour.get(j) ?? []),
    skillsExercice: ex.skills ?? [],
    skillsDeLecon: (s) => [...(skillsDeLecon.get(s) ?? [])],
  });
}

if (process.argv[1] && process.argv[1].endsWith('cp4-mapping.mjs')) {
  const classes = {};
  const table = [];
  for (const ex of exercices) {
    const r = resoudre(ex);
    classes[r.classe] = (classes[r.classe] ?? 0) + 1;
    table.push({ id: ex.id, ...r });
  }

  console.log('# V75 · CP4 — DÉSAMBIGUÏSATION DES 376 EXERCICES\n');
  console.log('## AVANT (mesure CP0)\n');
  console.log('`UNAMBIGUOUS` 140 · `RESOLVABLE_FROM_CONTEXT` 32 · `MULTI_CONCEPT_BY_DESIGN` 67 ·');
  console.log('`AMBIGUOUS` **137** · `ORPHAN` 0\n');
  console.log('## APRÈS (règles R1→R4)\n');
  for (const [k, v] of Object.entries(classes).sort((a, b) => b[1] - a[1])) {
    console.log(`${k.padEnd(26)} ${pct(v, exercices.length)}`);
  }
  const resolus = (classes.UNAMBIGUOUS ?? 0) + (classes.RESOLVABLE_FROM_CONTEXT ?? 0)
    + (classes.RESOLVED_BY_SKILL ?? 0) + (classes.MULTI_CONCEPT_BY_DESIGN ?? 0);
  console.log(`\n**rattachés à au moins un concept : ${pct(resolus, exercices.length)}**`);
  console.log(`**réellement ambigus : ${pct(classes.AMBIGUOUS ?? 0, exercices.length)}** (avant : 137)`);
  console.log(`\ngain de la règle R4 seule : ${classes.RESOLVED_BY_SKILL ?? 0} exercices`);

  writeFileSync(join(ROOT, 'docs', 'v75', 'cp4-mapping.json'), `${JSON.stringify(table, null, 1)}\n`);
  console.log('\nécrit : docs/v75/cp4-mapping.json');
}
