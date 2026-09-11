// V75 · CP9 — LES 25 DÉFIS, VÉRIFIÉS UN PAR UN.
//
// ── POURQUOI « UN PAR UN » EST DANS LE BRIEF ─────────────────────────────
//
// *« vérifier les 25 défis individuellement »* — et l'exigence est fondée :
// un agrégat vert cache un défi mort. Le CP7 vient d'en donner la preuve à mes
// dépens, avec une mesure qui affichait **« invariants ✅ 20/20 »** sur zéro
// élément. Ici chaque défi est nommé, et un seul échec fait rougir la sortie.
//
// ── CE QUI EST VÉRIFIÉ POUR CHACUN ──────────────────────────────────────
//
//   1. **structure** — `validateTransferChallenge` l'accepte ;
//   2. **atteignabilité** — sa route répond `200` (serveur lancé) ;
//   3. **correction juste** — avec les bonnes réponses il passe, avec les
//      mauvaises il échoue. Un correcteur qui dit toujours oui ne corrige pas ;
//   4. **preuve recevable** — `makeEvidence` accepte le résultat, avec le type
//      `transfer-challenge` et une provenance ;
//   5. **observabilité** — la preuve, une fois dans le registre, est comptée
//      par `projectLearnerMemory` comme un TRANSFERT. C'est le seul point qui
//      prouve que `D10` est réellement levée : le reste pourrait exister sans
//      que le moteur ne voie jamais rien.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { listTransferChallenges } from '../../lib/transfer-challenges-server.ts';
import { validateTransferChallenge, gradeTransferChallenge } from '../../lib/transfer-challenge.mjs';
import { makeEvidence } from '../../lib/evidence.mjs';
import { projectLearnerMemory } from '../../lib/learner-memory.mjs';

const ROOT = process.cwd();
const NOW = '2026-09-01T10:00:00.000Z';

/** Les réponses ATTENDUES d'un défi, lues dans la fixture. */
function bonnesReponses(c) {
  const r = {};
  for (const q of c.questions) {
    if (q.kind === 'multi') r[q.id] = Array.isArray(q.answer) ? [...q.answer] : [q.answer];
    else if (q.kind === 'predict') r[q.id] = String(q.answer);
    else r[q.id] = q.answer;
  }
  return r;
}

/** Des réponses volontairement FAUSSES : le correcteur doit les refuser. */
function mauvaisesReponses(c) {
  const r = {};
  for (const q of c.questions) {
    if (q.kind === 'multi') r[q.id] = [];
    else if (q.kind === 'predict') r[q.id] = '— réponse volontairement fausse —';
    else {
      const n = (q.options ?? []).length || 2;
      const bon = typeof q.answer === 'number' ? q.answer : 0;
      r[q.id] = (bon + 1) % n;
    }
  }
  return r;
}

export async function verifier(base = null) {
  const defis = listTransferChallenges();
  const lignes = [];

  for (const c of defis) {
    const v = validateTransferChallenge(c);
    const bon = gradeTransferChallenge(c, bonnesReponses(c));
    const mauvais = gradeTransferChallenge(c, mauvaisesReponses(c));

    const ev = makeEvidence({
      sourceType: 'transfer-challenge', sourceId: c.id,
      competencyIds: c.skills ?? [], conceptIds: c.lessonRefs ?? [],
      validation: {
        status: bon.passedOverall ? 'passed' : 'failed', kind: 'assessment-grade',
        checkedAt: NOW, detail: `${bon.passed}/${bon.total}`,
        score: { passed: bon.passed, total: bon.total },
      },
      title: `Défi de transfert : ${c.title}`,
      provenance: { producer: 'transfer-grader', method: 'transfer-challenge' },
    }, { now: NOW });

    // ── Le point qui prouve que D10 est levée ──
    // Une preuve qui existe mais que le moteur ne compte pas ne lève rien.
    let compte = 0;
    if (ev.ok) {
      const proj = projectLearnerMemory({
        facts: { days: {}, evidence: [ev.evidence] },
        context: { conceptDays: {}, conceptSkills: {}, skills: c.skills ?? [] },
        now: NOW,
      });
      compte = proj.competencies.reduce((n, f) => n + (f.transfers ?? 0), 0);
    }

    let http = null;
    if (base) {
      try {
        const res = await fetch(`${base}/transfer/${encodeURIComponent(c.id)}`);
        http = res.status;
      } catch { http = 0; }
    }

    lignes.push({
      id: c.id, titre: c.title, niveau: c.transferLevel,
      questions: c.questions.length,
      structure: v.ok,
      reussitAvecLesBonnes: bon.passedOverall,
      echoueAvecLesFausses: !mauvais.passedOverall,
      preuve: ev.ok,
      compteCommeTransfert: compte > 0,
      http,
      ok: v.ok && bon.passedOverall && !mauvais.passedOverall && ev.ok && compte > 0
        && (base == null || http === 200),
      erreur: v.ok ? (ev.ok ? null : ev.error) : v.errors.join(' ; '),
    });
  }
  return lignes;
}

if (process.argv[1] && process.argv[1].endsWith('cp9-transfert.mjs')) {
  const base = process.argv[2] ?? null;
  const lignes = await verifier(base);

  console.log('# V75 · CP9 — LES 25 DÉFIS DE TRANSFERT, UN PAR UN\n');
  console.log('> Un agrégat vert cache un défi mort. Chaque défi est nommé ci-dessous, et un');
  console.log('> seul échec fait rougir la sortie.\n');
  console.log(`> Route HTTP ${base ? `testée sur ${base}` : '**non testée** (aucune base fournie)'}\n`);
  console.log('| # | défi | niv. | q. | structure | réussit | échoue | preuve | compté | HTTP | |');
  console.log('|---|---|---|---|---|---|---|---|---|---|---|');
  const oui = (b) => (b ? '✅' : '❌');
  lignes.forEach((l, i) => {
    console.log(`| ${i + 1} | ${l.titre} | ${l.niveau} | ${l.questions} | ${oui(l.structure)} | ${oui(l.reussitAvecLesBonnes)} | ${oui(l.echoueAvecLesFausses)} | ${oui(l.preuve)} | ${oui(l.compteCommeTransfert)} | ${l.http ?? '—'} | ${oui(l.ok)} |`);
  });

  const ko = lignes.filter((l) => !l.ok);
  console.log('\n## Résultat\n');
  console.log(`**${lignes.length - ko.length} / ${lignes.length}** défis complètement vérifiés.`);
  if (ko.length) {
    console.log('\n**ÉCHECS :**');
    for (const l of ko) console.log(`· **${l.id}** — ${l.erreur ?? 'voir colonnes ci-dessus'}`);
  } else {
    console.log('\nChacun est **structurellement valide**, **atteignable**, **corrigé**');
    console.log('(il réussit avec les bonnes réponses et échoue avec les mauvaises), il **produit**');
    console.log('une preuve recevable, et cette preuve est **comptée comme un transfert** par le');
    console.log('moteur de rétention — ce dernier point étant le seul qui prouve que `D10` est levée.');
  }

  writeFileSync(join(ROOT, 'docs', 'v75', 'cp9-transfert.json'), `${JSON.stringify(lignes, null, 1)}\n`);
  console.log('\nécrit : docs/v75/cp9-transfert.json');
  if (ko.length) process.exitCode = 1;
}
