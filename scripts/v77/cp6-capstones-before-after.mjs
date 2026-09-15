// V77 · CP6 — BEFORE / AFTER sur les 13 capstones.
//
// Le CP0 a mesuré la dette `D4` : `capstone-grade` est absent du vocabulaire
// `VALIDATION_KINDS`, et `normalizeValidation` retombe alors sur `self`. Une
// correction SERVEUR, déterministe, contre un corrigé déclaré d'avance, était
// donc archivée comme une **auto-déclaration de l'apprenant**.
//
// C'est l'erreur de sens INVERSE de celle du CP5 : la mission était
// surclassée, le capstone est dégradé. Les deux venaient du même endroit — un
// vocabulaire incomplet, jamais vérifié de bout en bout.
//
// Le script rejoue les 13 capstones réels avec le CORRIGÉ, c'est-à-dire le
// meilleur cas, et regarde ce que le produit en écrit.
//
// Usage :  node scripts/v77/cp6-capstones-before-after.mjs [--json]
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gradeCapstone } from '../../lib/capstone.mjs';
import { makeEvidence, isQualifying, VALIDATION_KINDS } from '../../lib/evidence.mjs';
import { projectCompetency } from '../../lib/competency.mjs';

const ROOT = process.cwd();
const DIR = join(ROOT, 'data', 'capstones');
const NOW = '2026-09-15T12:00:00.000Z';

const capstones = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort()
  .map((f) => JSON.parse(readFileSync(join(DIR, f), 'utf8')));

/** Les réponses du CORRIGÉ : le meilleur cas, pas une simulation d'apprenant. */
function reponsesCorrectes(c) {
  const out = {};
  for (const p of c.phases ?? []) {
    for (const q of p.questions ?? []) {
      if (q.answer !== undefined) out[q.id] = q.answer;
      else if (Array.isArray(q.expected)) out[q.id] = q.expected;
      else if (q.expected !== undefined) out[q.id] = q.expected;
    }
  }
  return out;
}

function preuveDe(c, kind) {
  const r = gradeCapstone(c, reponsesCorrectes(c));
  const ev = makeEvidence({
    sourceType: 'capstone',
    sourceId: c.id,
    competencyIds: c.skills ?? [],
    validation: {
      status: r.passedOverall ? 'passed' : 'failed',
      kind,
      checkedAt: NOW,
      detail: `${r.passed}/${r.total}`,
      score: { passed: r.passed, total: r.total },
    },
    title: `Capstone : ${c.title}`,
    provenance: { producer: 'capstone-grader', method: 'capstone-grade' },
    simulation: true,
  }, { now: NOW });
  return { note: r, ev };
}

const lignes = capstones.map((c) => {
  // AVANT : ce que le produit écrivait. `capstone-grade` n'étant pas dans le
  // vocabulaire, `normalizeValidation` le remplaçait par `self`. On reproduit
  // le mécanisme en passant un genre hors vocabulaire — si le vocabulaire
  // changeait, cette ligne bougerait avec lui.
  const avant = preuveDe(c, 'genre-hors-vocabulaire');
  const apres = preuveDe(c, 'capstone-grade');
  return {
    id: c.id,
    phases: (c.phases ?? []).length,
    questions: avant.note.total,
    corrigeAtteintLeSeuil: avant.note.passedOverall,
    avant: avant.ev.ok ? {
      kind: avant.ev.evidence.validation.kind,
      status: avant.ev.evidence.validation.status,
      niveau: avant.ev.evidence.evidenceLevel,
      qualifiante: isQualifying(avant.ev.evidence),
      simulation: avant.ev.evidence.simulation ?? null,
    } : { refus: avant.ev.code },
    apres: apres.ev.ok ? {
      kind: apres.ev.evidence.validation.kind,
      status: apres.ev.evidence.validation.status,
      niveau: apres.ev.evidence.evidenceLevel,
      qualifiante: isQualifying(apres.ev.evidence),
      simulation: apres.ev.evidence.simulation ?? null,
    } : { refus: apres.ev.code },
    competenceAvant: avant.ev.ok ? projectCompetency((c.skills ?? [])[0] ?? 'x', [avant.ev.evidence]).state : null,
    competenceApres: apres.ev.ok ? projectCompetency((c.skills ?? [])[0] ?? 'x', [apres.ev.evidence]).state : null,
  };
});

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ generatedAt: NOW, vocabulaire: VALIDATION_KINDS, capstones: lignes }, null, 2));
} else {
  const compte = (f) => Object.entries(lignes.reduce((a, l) => { const k = f(l); a[k] = (a[k] ?? 0) + 1; return a; }, {}))
    .map(([k, n]) => `${n} × ${k}`).join(' · ');
  console.log(`\n── V77 · CP6 — BEFORE / AFTER sur ${lignes.length} capstones\n`);
  console.log(`  corrigé atteignant le seuil            : ${lignes.filter((l) => l.corrigeAtteintLeSeuil).length} / ${lignes.length}`);
  console.log(`  AVANT — genre archivé                  : ${compte((l) => l.avant.kind)}`);
  console.log(`  AVANT — niveau de preuve               : ${compte((l) => l.avant.niveau)}`);
  console.log(`  AVANT — compétence projetée            : ${compte((l) => l.competenceAvant)}`);
  console.log(`  APRÈS — genre archivé                  : ${compte((l) => l.apres.kind)}`);
  console.log(`  APRÈS — niveau de preuve               : ${compte((l) => l.apres.niveau)}`);
  console.log(`  APRÈS — compétence projetée            : ${compte((l) => l.competenceApres)}`);
  console.log(`  marque de SIMULATION (champ, pas texte): ${compte((l) => String(l.apres.simulation))}`);
  console.log('\n  détail (4 premiers) :');
  for (const l of lignes.slice(0, 4)) {
    console.log(`    ${l.id.padEnd(30)} ${String(l.questions).padStart(3)} q · avant=${l.avant.kind}/${l.avant.niveau} → après=${l.apres.kind}/${l.apres.niveau}`);
  }
  console.log('');
}
