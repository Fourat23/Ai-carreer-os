// V75 · CP4 — D8 : RÉDUIRE L'AMBIGUÏTÉ, JAMAIS LA CACHER.
//
// Le danger de ce checkpoint est simple à énoncer : il est trivial de faire
// tomber le compteur `AMBIGUOUS` de 137 à 0 en désignant la première leçon
// candidate. La métrique serait verte et la donnée fausse — une preuve
// créditerait une notion que l'apprenant n'a pas travaillée, et le moteur de
// rétention construirait tout son plan là-dessus.
//
// Ces tests gardent donc la propriété INVERSE de celle qu'on mesure :
//   · un exercice ne quitte `AMBIGUOUS` qu'en RECEVANT un concept réel ;
//   · un exercice ambigu rend une liste VIDE, jamais un candidat au hasard ;
//   · les multi-concepts PAR CONCEPTION gardent TOUS leurs déclarants ;
//   · la mesure publiée et le produit passent par le MÊME code.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { resoudreExercice, CLASSES_EXERCICE, CLASSES_RATTACHEES } from '../lib/exercise-mapping.mjs';
import { resoudre } from '../scripts/v75/cp4-mapping.mjs';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');

// ── LA CASCADE, RÈGLE PAR RÈGLE ─────────────────────────────────────────

test('V75 · CP4 — R1 : un déclarant unique tranche, et prime sur le contexte', () => {
  const r = resoudreExercice({
    declarants: ['boucles'],
    // La journée en enseigne trois : si l'ordre de la cascade s'inversait, on
    // basculerait sur une inférence là où un auteur avait écrit la réponse.
    leconsDuJour: ['boucles', 'tableaux', 'objets'],
    skillsExercice: ['loops'],
    skillsDeLecon: () => ['jsts'],
  });
  assert.equal(r.classe, 'UNAMBIGUOUS');
  assert.deepEqual(r.concepts, ['boucles']);
});

test('V75 · CP4 — R2 : plusieurs déclarants sont un FAIT, pas une ambiguïté', () => {
  // Le CP0 a mesuré 67 exercices déclarés par plusieurs leçons. N'en garder
  // qu'un serait perdre une information d'auteur, pas en gagner une.
  const r = resoudreExercice({ declarants: ['boucles', 'tableaux', 'hof'] });
  assert.equal(r.classe, 'MULTI_CONCEPT_BY_DESIGN');
  assert.deepEqual(r.concepts, ['boucles', 'tableaux', 'hof'], 'aucun déclarant ne doit être perdu');
});

test('V75 · CP4 — R3 : une journée à leçon unique ne laisse rien à choisir', () => {
  const r = resoudreExercice({ declarants: [], leconsDuJour: ['sql-jointures'] });
  assert.equal(r.classe, 'RESOLVABLE_FROM_CONTEXT');
  assert.deepEqual(r.concepts, ['sql-jointures']);
});

test('V75 · CP4 — R4 : une seule leçon compatible, la donnée désigne seule', () => {
  const r = resoudreExercice({
    declarants: [],
    leconsDuJour: ['sql-jointures', 'react-hooks'],
    skillsExercice: ['hooks'],
    skillsDeLecon: (s) => (s === 'react-hooks' ? ['jsts'] : ['sql']),
  });
  assert.equal(r.classe, 'RESOLVED_BY_SKILL');
  assert.deepEqual(r.concepts, ['react-hooks']);
});

test('V75 · CP4 — R4 traduit les DEUX vocabulaires avant de les croiser', () => {
  // Le bug qui a coûté trois exercices : `ex.skills` parle le vocabulaire fin
  // (51 termes), les leçons parlent les 20 compétences du programme.
  // `['react','state','events','hooks'] → ['jsts']`. Sans la traduction,
  // l'intersection est vide et la règle ne résout rien.
  const args = {
    declarants: [],
    leconsDuJour: ['react-hooks', 'sql-jointures'],
    skillsExercice: ['react', 'state', 'events', 'hooks'],
    skillsDeLecon: (s) => (s === 'react-hooks' ? ['jsts'] : ['sql']),
  };
  assert.equal(resoudreExercice(args).classe, 'RESOLVED_BY_SKILL');
});

// ── CE QUE LE MODULE REFUSE DE FAIRE ────────────────────────────────────

test('V75 · CP4 — deux leçons compatibles : AUCUN choix arbitraire', () => {
  // Le cœur du checkpoint. « Prendre la première » ferait tomber la métrique
  // et fabriquerait de la donnée. La bonne réponse est de ne pas répondre.
  const r = resoudreExercice({
    declarants: [],
    leconsDuJour: ['boucles', 'tableaux'],
    skillsExercice: ['loops'],
    skillsDeLecon: () => ['jsts'],
  });
  assert.equal(r.classe, 'AMBIGUOUS');
  assert.deepEqual(r.concepts, [], 'un exercice ambigu ne doit désigner AUCUNE leçon');
});

test('V75 · CP4 — sans compétence déclarée, R4 ne peut pas trancher', () => {
  const r = resoudreExercice({
    declarants: [], leconsDuJour: ['a', 'b'], skillsExercice: [], skillsDeLecon: () => ['jsts'],
  });
  assert.equal(r.classe, 'AMBIGUOUS');
  assert.deepEqual(r.concepts, []);
});

test('V75 · CP4 — un exercice sans leçon ni journée est ORPHELIN, pas rattaché', () => {
  const r = resoudreExercice({ declarants: [], leconsDuJour: [] });
  assert.equal(r.classe, 'ORPHAN');
  assert.deepEqual(r.concepts, []);
});

test('V75 · CP4 — toute résolution EXPLIQUE sa règle', () => {
  // Une résolution muette est inauditable : personne ne peut contester un
  // rattachement dont la raison n'est écrite nulle part.
  const cas = [
    { declarants: ['a'] },
    { declarants: ['a', 'b'] },
    { leconsDuJour: ['a'] },
    { leconsDuJour: ['a', 'b'] },
    {},
  ];
  for (const c of cas) {
    const r = resoudreExercice(c);
    assert.ok(r.regle && r.regle.length > 5, `règle absente pour ${JSON.stringify(c)}`);
    assert.ok(CLASSES_EXERCICE.includes(r.classe), `classe inconnue : ${r.classe}`);
  }
});

// ── L'INVARIANT QUI REND LA RÉDUCTION VÉRIFIABLE ────────────────────────

test('V75 · CP4 — rattaché ⇔ au moins un concept, sur les 376 exercices RÉELS', () => {
  // C'est l'invariant qui interdit la triche : on ne peut pas sortir un
  // exercice d'`AMBIGUOUS` sans lui donner un concept, ni lui donner un
  // concept sans le sortir d'`AMBIGUOUS`. Faire baisser le compteur exige donc
  // de produire de la donnée vraie.
  const exercices = readdirSync(join(ROOT, 'data', 'exercises')).filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(join(ROOT, 'data', 'exercises', f), 'utf8')));
  assert.equal(exercices.length, 376, 'le corpus des exercices a changé : la mesure du CP4 est à refaire');

  const classes = {};
  for (const ex of exercices) {
    const r = resoudre(ex);
    classes[r.classe] = (classes[r.classe] ?? 0) + 1;
    if (CLASSES_RATTACHEES.includes(r.classe)) {
      assert.ok(r.concepts.length >= 1, `${ex.id} est classé ${r.classe} sans aucun concept`);
    } else {
      assert.equal(r.concepts.length, 0, `${ex.id} est classé ${r.classe} mais désigne ${r.concepts}`);
    }
  }

  // La mesure publiée, gelée ici. Si elle bouge, c'est soit le corpus qui a
  // changé, soit quelqu'un qui a touché à la cascade — dans les deux cas le
  // chiffre du rapport doit être refait, pas contourné.
  assert.deepEqual(classes, {
    UNAMBIGUOUS: 140, MULTI_CONCEPT_BY_DESIGN: 67, RESOLVABLE_FROM_CONTEXT: 32,
    RESOLVED_BY_SKILL: 12, AMBIGUOUS: 125,
  });
  assert.ok(classes.AMBIGUOUS < 137, 'le CP4 doit RÉDUIRE l’ambiguïté mesurée au CP0');
});

// ── UNE SEULE VÉRITÉ : LA MESURE ET LE PRODUIT PARTAGENT LE CODE ────────

test('V75 · CP4 — la mesure et le serveur appellent la MÊME cascade', () => {
  const script = lire('scripts/v75/cp4-mapping.mjs');
  const serveur = lire('lib/exercise-concepts-server.ts');
  for (const [src, nom] of [[script, 'scripts/v75/cp4-mapping.mjs'], [serveur, 'lib/exercise-concepts-server.ts']]) {
    assert.match(src, /from '[^']*exercise-mapping\.mjs'/, `${nom} doit déléguer à lib/exercise-mapping.mjs`);
    assert.match(src, /resoudreExercice\s*\(/, `${nom} doit appeler resoudreExercice`);
  }
  // Et personne ne réimplémente la cascade à côté.
  assert.doesNotMatch(script, /classe:\s*'RESOLVED_BY_SKILL'/, 'la cascade ne doit exister qu’une fois');
  assert.doesNotMatch(serveur, /classe:\s*'RESOLVED_BY_SKILL'/, 'la cascade ne doit exister qu’une fois');
});

test('V75 · CP4 — les deux contextes « leçons de la journée » sont la MÊME donnée', () => {
  // Le script lit les Markdown des journées ; le serveur lit le catalogue de
  // concepts. Ce sont deux chemins vers la même dérivation (`/doc/lessons/<slug>`
  // filtré par les leçons connues). Ce test le vérifie plutôt que de le croire.
  const program = JSON.parse(readFileSync(join(ROOT, 'data', 'program.json'), 'utf8'));
  const connus = new Set((program.lessons ?? []).map((l) => l.slug));
  const pad3 = (n) => String(n).padStart(3, '0');

  const parMarkdown = new Map();
  for (const d of program.days) {
    const p = join(ROOT, 'curriculum', 'days', `day-${pad3(d.day)}.md`);
    if (!existsSync(p)) continue;
    const slugs = [...new Set([...readFileSync(p, 'utf8').matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))]
      .filter((s) => connus.has(s));
    if (slugs.length) parMarkdown.set(d.day, slugs.sort());
  }

  // Reconstruction du catalogue façon `retention-server.ts` : concept → jours,
  // puis renversé en jour → concepts.
  const conceptDays = {};
  for (const s of connus) conceptDays[s] = [];
  for (const d of program.days) {
    const p = join(ROOT, 'curriculum', 'days', `day-${pad3(d.day)}.md`);
    if (!existsSync(p)) continue;
    for (const s of new Set([...readFileSync(p, 'utf8').matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))) {
      if (connus.has(s)) conceptDays[s].push(d.day);
    }
  }
  const parCatalogue = new Map();
  for (const [slug, jours] of Object.entries(conceptDays)) {
    for (const j of jours) parCatalogue.set(j, [...(parCatalogue.get(j) ?? []), slug]);
  }
  for (const [j, l] of parCatalogue) parCatalogue.set(j, l.sort());

  assert.equal(parCatalogue.size, parMarkdown.size, 'les deux dérivations ne couvrent pas les mêmes journées');
  for (const [j, attendu] of parMarkdown) {
    assert.deepEqual(parCatalogue.get(j), attendu, `journée ${j} : les deux sources divergent`);
  }
});

// ── LE BRANCHEMENT : SANS LUI, LE CHECKPOINT N'EXISTE PAS ───────────────

test('V75 · CP4 — le laboratoire utilise le résolveur, pour les DEUX preuves', () => {
  // Une réussite au laboratoire écrit deux preuves au registre, avec des
  // `sourceId` différents (`<ex>` et `lab-<ex>`) : le dédoublonnage ne les
  // fusionne pas. Le CP3 n'en instrumentait qu'une ; la seconde retombait sur
  // le rattachement par journée et annulait le gain pour le même exercice.
  const route = lire('app/api/lab/[exerciseId]/route.ts');
  assert.match(route, /conceptsDeLExerciceResolu\s*\(/, 'le résolveur du CP4 doit être appelé');
  assert.match(route, /recordExerciseSuccess\([^)]*[\s\S]{0,900}?conceptIds:\s*concepts/,
    'la preuve du lab-runner doit porter les concepts résolus');
  assert.match(route, /type:\s*'SUBMIT'[\s\S]{0,900}?conceptIds:\s*concepts/,
    'la preuve canonique de la soumission doit porter les mêmes concepts');
});

test('V75 · CP4 — le moteur transmet `conceptIds` à la preuve canonique', () => {
  const moteur = lire('lib/learning-engine.mjs');
  assert.match(moteur, /conceptIds:\s*Array\.isArray\(cmd\.conceptIds\)/,
    'canonicalEvidenceFor doit lire cmd.conceptIds');
});
