// V75 · CP13 — Ce que la simulation adversariale doit garantir.
//
// ── POURQUOI DES TESTS SUR UNE MESURE ────────────────────────────────────
//
// L'anomalie n° 7 de ce sprint reste la plus instructive : une sonde du CP7 a
// rendu **zéro pour les vingt profils** tout en imprimant « invariants ✅ 20/20 ».
// *Une mesure faite sur rien valide tout.*
//
// Ces tests existent donc en deux moitiés, et la seconde est la plus importante :
//
//   1. les invariants tiennent sur les trajectoires ;
//   2. **les détecteurs ne sont pas vides** — au moins un profil les fait rougir.
//
// Un détecteur toujours vert ne prouve rien ; il faut montrer qu'il sait crier.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PROFILS } from '../scripts/v75/cp0-backlog.mjs';
import { trajectoire } from '../scripts/v75/cp13-adversarial.mjs';
import { apresLaReprise } from '../scripts/v75/cp13-sortie.mjs';
import { rotation } from '../scripts/v75/cp13-rotation.mjs';
import { PLAFOND_UNITES } from '../lib/retention-scheduler.mjs';

const profil = (id) => PROFILS.find((p) => p.id === id);
/** Les trois plus endettés : si un invariant casse quelque part, c'est là. */
const PIRES = ['C', 'L', 'M'];

// ── 1 · LA SONDE MESURE-T-ELLE QUELQUE CHOSE ? ──────────────────────────

test('V75 · CP13 — la sonde refuse de conclure sur rien', () => {
  const t = trajectoire(profil('C'), { pas: 60 });
  assert.ok(t.points.length >= 5, 'aucun instantané : la sonde ne mesure rien');
  assert.ok(t.rencontrees > 50, `seulement ${t.rencontrees} notions rencontrées`);
  assert.ok(t.apres.totalMax > 0, 'arriéré nul partout : la sonde ne voit pas la dette');
  assert.ok(t.apres.notionsVues > 0, 'aucune notion suivie au fil des instantanés');
});

// ── 2 · LES INVARIANTS ──────────────────────────────────────────────────

test('V75 · CP13 — `I2` tient à chaque instantané : total = actif + différé + garé', () => {
  for (const id of PIRES) {
    const t = trajectoire(profil(id), { pas: 60 });
    for (const p of t.points) {
      assert.equal(p.actif + p.differe + p.gare, p.total, `${id} au jour ${p.j}`);
    }
    assert.equal(t.apres.invariantI2, true, id);
  }
});

test('V75 · CP13 — la séance reste bornée par `PLAFOND_UNITES`, quelle que soit la dette', () => {
  for (const id of PIRES) {
    const t = trajectoire(profil(id), { pas: 60 });
    for (const p of t.points) {
      assert.ok(p.actif <= PLAFOND_UNITES, `${id} au jour ${p.j} : ${p.actif} unités actives`);
    }
    // Et la dette, elle, n'est PAS bornée — sinon le produit la cacherait.
    assert.ok(t.apres.totalMax > PLAFOND_UNITES, `${id} : arriéré plafonné, donc dissimulé`);
  }
});

test('V75 · CP13 — le budget quotidien n’est jamais dépassé', () => {
  for (const id of PIRES) {
    const t = trajectoire(profil(id), { pas: 60 });
    for (const p of t.points) {
      assert.ok(p.budgetAccorde <= p.budgetPlafond, `${id} au jour ${p.j}`);
    }
  }
});

test('V75 · CP13 — rien n’est garé sans condition, ni essentiel, ni en échec vivant', () => {
  for (const id of PIRES) {
    const t = trajectoire(profil(id), { pas: 60 });
    assert.equal(t.apres.gareesSansCondition, 0, `${id} : garage sans condition de retour`);
    assert.equal(t.apres.gareesEssentielles, 0, `${id} : notion essentielle garée`);
    assert.equal(t.apres.gareesAvecEchec, 0, `${id} : échec non repris garé`);
  }
});

// ── 3 · LES DÉTECTEURS SAVENT-ILS CRIER ? ───────────────────────────────
//
// Sans ces trois tests, les quatre précédents pourraient passer sur une sonde
// aveugle. Ils exigent qu'au moins un profil DÉCLENCHE ce qui est cherché.

test('V75 · CP13 — le détecteur de garage n’est pas vide : un profil gare massivement', () => {
  const t = trajectoire(profil('C'), { pas: 60 });
  assert.ok(t.apres.gareMax > 20, `garé max = ${t.apres.gareMax} : rien à expliquer, donc rien de vérifié`);
  assert.ok(t.apres.partGareeFinale > 50, `part garée = ${t.apres.partGareeFinale} %`);
});

test('V75 · CP13 — le détecteur de « récupération sans sortie » n’est pas vide', () => {
  // C échoue à 55 % pendant un an : il DOIT rester en récupération. Un détecteur
  // qui ne le voit pas ne verrait pas non plus un vrai piège.
  const t = trajectoire(profil('C'), { pas: 60 });
  assert.equal(t.apres.recuperationSansSortie, true);
  // Et le profil parfait, lui, ne doit pas y être enfermé.
  const a = trajectoire(profil('A'), { pas: 60 });
  assert.equal(a.apres.modes.NORMAL > 0, true, 'le profil parfait n’est jamais en NORMAL');
});

test('V75 · CP13 — le séjour au garage est mesuré en jours, pas supposé', () => {
  const t = trajectoire(profil('L'), { pas: 60 });
  assert.ok(t.apres.sejourGareMax >= 60, `séjour max = ${t.apres.sejourGareMax} j`);
  const a = trajectoire(profil('A'), { pas: 60 });
  assert.ok(a.apres.sejourGareMax < t.apres.sejourGareMax,
    'le profil parfait garerait aussi longtemps que le pire : la mesure ne discrimine pas');
});

// ── 4 · LA CONTRE-MESURE : LA SORTIE EXISTE ─────────────────────────────

test('V75 · CP13 — la récupération n’est pas un piège : une reprise réelle en sort', () => {
  const r = apresLaReprise(profil('P'), { reprise: 200, fin: 365, pas: 15 });
  assert.ok(r.joursPourQuitterRecup != null, 'entré en récupération, jamais ressorti malgré la reprise');
  assert.equal(r.modeFinal, 'NORMAL');
  assert.equal(r.totalFinal, 0);
});

test('V75 · CP13 — la sortie n’est jamais IMMÉDIATE : un bon jour n’efface pas une dette', () => {
  const r = apresLaReprise(profil('P'), { reprise: 200, fin: 365, pas: 15 });
  assert.equal(r.sortieImmediate, false);
  assert.ok(r.joursPourQuitterRecup > 0);
});

test('V75 · CP13 — le garage se vide quand l’apprenant revient', () => {
  const r = apresLaReprise(profil('P'), { reprise: 200, fin: 365, pas: 15 });
  assert.ok(r.gareesAuDepart > 0, 'aucune notion garée au départ : la contre-mesure ne prouve rien');
  assert.equal(r.encoreGarees, 0, `${r.encoreGarees} notions garées n’ont jamais été libérées`);
});

// ── 5 · « JAMAIS ACTIVE » N’EST PAS DE LA FAMINE ────────────────────────

test('V75 · CP13 — la sélection tourne : le moteur ne repropose pas les 8 mêmes', () => {
  const r = rotation(profil('L'), { debut: 200, jours: 15 });
  assert.ok(r.notionsEnRetardSurLaFenetre > 20, 'fenêtre sans dette : rien à départager');
  assert.ok(r.notionsDistinctesTravaillees > PLAFOND_UNITES,
    `${r.notionsDistinctesTravaillees} notions distinctes pour ${PLAFOND_UNITES} places : sélection figée`);
});
