// V77 · CP12 — LE DOCUMENT DE PRÉPARATION NE DOIT RIEN PROMETTRE DE FAUX.
//
// Un document de « readiness » est le plus facile à écrire et le plus facile à
// laisser mentir : il vieillit sans rougir. Ces tests le rattachent au code, de
// sorte qu'une promesse qui cesserait d'être vraie casse quelque chose.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { SURFACES, SURFACES_DE_LECTURE } from '../lib/practice-model.mjs';
import { combinaisonsQualifiantes, matriceDesPreuves } from '../lib/evidence-matrix.mjs';
import { FAITS_DU_PRODUIT } from '../lib/progress-store.mjs';

const ROOT = process.cwd();
const DOC = readFileSync(join(ROOT, 'docs', 'v77', 'V78-PILOT-READINESS.md'), 'utf8');

test('V77 · CP12 — le tableau des surfaces correspond à la carte du CP2', () => {
  // Une ligne manquante ferait croire à un pilote qu'une surface n'existe pas.
  for (const [id, e] of Object.entries(SURFACES)) {
    assert.ok(DOC.includes(`\`${id}\``), `la surface ${id} manque au document`);
    if (e.typeFait) assert.ok(DOC.includes(e.typeFait), `le fait ${e.typeFait} manque`);
  }
  assert.ok(DOC.includes(`${SURFACES_DE_LECTURE.length} surfaces de lecture`),
    'le nombre de surfaces de lecture doit être celui de la carte');
});

test('V77 · CP12 — les nombres annoncés sont ceux que le code produit', () => {
  assert.ok(DOC.includes(`${combinaisonsQualifiantes().length} qualifiantes`),
    'le nombre de combinaisons qualifiantes doit venir de la matrice');
  assert.ok(DOC.includes(`${matriceDesPreuves().length} combinaisons`),
    'le nombre de combinaisons doit venir de la matrice');
});

test('V77 · CP12 — les neuf faits du produit sont bien ceux annoncés à l’export', () => {
  for (const f of FAITS_DU_PRODUIT) {
    assert.ok(DOC.includes(f), `le fait ${f} manque à la description de l’export`);
  }
});

test('V77 · CP12 — le document énonce les TROIS réserves de suppression', () => {
  // Elles sont mesurées, et ce sont les seules du document qu'un protocole
  // humain doit absolument reprendre.
  assert.ok(DOC.includes('progress.backup.json'), 'l’instantané de secours');
  assert.ok(DOC.includes('lab-journals'), 'les journaux de laboratoire');
  // Apostrophes typographiques normalisées : une assertion de texte ne doit pas
  // rougir pour un caractère, et V76 a payé deux fois pour l'apprendre.
  // Apostrophes NORMALISÉES et retours à la ligne APLATIS : la citation vit dans
  // un bloc `>` sur deux lignes, et une assertion qui l'ignorerait rougirait pour
  // une mise en forme. V76 a payé deux fois pour cette leçon.
  const plat = DOC.replace(/[’‘]/g, "'").replace(/\n>\s*/g, ' ').replace(/\s+/g, ' ');
  assert.match(plat, /n'efface ni l'instantané de secours, ni le code que j'ai écrit/);
  assert.ok(DOC.includes('lab-workspaces'), 'les espaces de travail');
});

test('V77 · CP12 — le document ne promet PAS de mesurer l’apprentissage', () => {
  // La phrase interdite est nommée dans le document lui-même ; ce test vérifie
  // qu'elle n'y est pas affirmée ailleurs.
  const sansCitation = DOC.replace(/> « Le système mesure l[’']apprentissage\. »/g, '');
  for (const interdit of [
    "mesure l'apprentissage", "score d'apprentissage", 'probabilité de mémorisation',
    'percentile', "score d'employabilité", 'classement',
  ].map((x) => x.replace(/'/g, '’'))) {
    assert.equal(sansCitation.includes(interdit), false, `« ${interdit} » ne doit pas être promis`);
  }
});

test('V77 · CP12 — le document énonce ce qu’un pilote NE pourra PAS trancher', () => {
  // Un document de readiness qui n'énumère que des capacités est un argumentaire,
  // pas une préparation.
  assert.match(DOC, /Les six questions qu'un pilote ne pourra PAS trancher/);
  for (const attendu of ['125 exercices sur 376', 'hors ligne', 'Progresse-t-il']) {
    assert.ok(DOC.includes(attendu), `la limite « ${attendu} » manque`);
  }
});
