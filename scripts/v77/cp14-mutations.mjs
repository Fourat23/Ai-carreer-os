// V77 · CP14 — TRENTE-CINQ MENSONGES PLAUSIBLES.
//
// ── CE QUE CE HARNAIS MESURE, ET CE QU'IL NE MESURE PAS ────────────────
//
// Il ne mesure pas si le produit est bon. Il mesure si **les gardes le
// verraient devenir mauvais** — ce qui est la seule question qu'une suite de
// tests puisse honnêtement se poser sur elle-même.
//
// Chaque mutation est un mensonge PLAUSIBLE : le genre de ligne qu'on écrirait
// de bonne foi, un vendredi soir, pour simplifier. Une mutation qui SURVIT est
// un trou dans les gardes, et le harnais le dit.
//
// ── LA LEÇON DE V76 · CP14, APPLIQUÉE ──────────────────────────────────
//
// Trois mutations y avaient produit de FAUX survivants parce qu'un serveur
// périmé répondait à leur place. Ici, aucune mutation n'a besoin d'un serveur :
// chacune est jugée par des tests ou par la porte, tous deux lancés **après**
// l'écriture du fichier muté et sur le disque réel.
//
// Et deux mutations visent la PORTE elle-même — jugées par
// `tests/v77-gate.test.mjs`, jamais par la porte, qui ne peut pas détecter sa
// propre neutralisation.
//
// Usage :  node scripts/v77/cp14-mutations.mjs [--json] [--only=M07]
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = process.cwd();
const T = (...f) => ({ juge: 'test', fichiers: f });
const GATE = { juge: 'gate' };
const JUGE_EXTERNE = { juge: 'juge-externe' };

/**
 * Les 35 familles. `avant` doit exister TEL QUEL dans le fichier : une mutation
 * dont le motif a disparu s'appliquerait sans effet et conclurait à tort que la
 * garde tient — c'est le défaut que V77 · CP3 a trouvé dans les harnais de V75
 * et V76.
 */
export const MUTATIONS = [
  // ── FAMILLE 1 · L'USAGE DEVIENT UNE RÉUSSITE (CP3) ────────────────────
  { id: 'M01', famille: 'usage devenu réussite', fichier: 'lib/usage-event.mjs',
    avant: "export const CHAMPS_INTERDITS = Object.freeze(['passed', 'success', 'outcome', 'score', 'allPassed', 'validation']);",
    apres: "export const CHAMPS_INTERDITS = Object.freeze([]);",
    note: 'la liste des champs interdits est vidée', ...T('v77-usage-event.test.mjs') },
  { id: 'M02', famille: 'usage devenu réussite', fichier: 'lib/usage-event.mjs',
    avant: '    vautReussite: false,', apres: '    vautReussite: tous.length > 0,',
    note: 'un usage se met à valoir une réussite', ...T('v77-usage-event.test.mjs') },
  { id: 'M03', famille: 'usage devenu réussite', fichier: 'lib/usage-event.mjs',
    avant: '  const disponible = typeof d.disponible === \'boolean\' ? d.disponible : null;',
    apres: '  const disponible = typeof d.disponible === \'boolean\' ? d.disponible : null;\n  if (d.passed !== undefined) detail.passed = d.passed;',
    note: 'le détail cesse d’être une liste blanche', ...T('v77-usage-event.test.mjs') },

  // ── FAMILLE 2 · LE FAIT PERD LE DISQUE (P7, quatre listes) ────────────
  { id: 'M04', famille: 'fait perdu par liste blanche', fichier: 'lib/progress-store.mjs',
    avant: '    usageEvents: normalizeUsageEvents(src?.usageEvents).slice(-MAX_USAGE_EVENTS),',
    apres: '    usageEvents: [],',
    note: 'l’usage n’atteint plus le disque', ...T('v77-usage-event.test.mjs', 'progress-store.test.mjs') },
  { id: 'M05', famille: 'fait perdu par liste blanche', fichier: 'lib/progress-store.mjs',
    avant: '    assessmentAttempts: normalizeAssessmentAttempts(src?.assessmentAttempts).slice(-MAX_ASSESSMENT_ATTEMPTS),',
    apres: '    assessmentAttempts: [],',
    note: 'les soumissions de diagnostic disparaissent', ...T('v77-assessment-attempt.test.mjs') },
  { id: 'M06', famille: 'fait perdu par liste blanche', fichier: 'lib/backup.mjs',
    avant: '  Object.assign(progress, normaliserLesFaits(src, { daysPourHeritage: days }));',
    apres: '  // 4ᵉ liste blanche retirée',
    note: 'les faits ne survivent plus à leur sauvegarde', ...T('v77-usage-event.test.mjs', 'v77-assessment-attempt.test.mjs') },
  { id: 'M07', famille: 'fait perdu par liste blanche', fichier: 'lib/progress-store.mjs',
    avant: "  'assessmentAttempts', 'missionSubmissions', 'artifactAnalyses', 'usageEvents',",
    apres: "  'assessmentAttempts', 'missionSubmissions', 'usageEvents',",
    note: 'un fait sort de l’énumération unique', ...GATE },

  // ── FAMILLE 3 · CINQ ÉCHECS REDEVIENNENT UNE TRACE (CP4) ──────────────
  { id: 'M08', famille: 'tentatives fusionnées', fichier: 'lib/assessment-attempt.mjs',
    avant: '  return `${a.assessmentId}|${String(a.at).slice(0, 19)}|${a.empreinte ?? \'∅\'}`;',
    apres: '  return `${a.assessmentId}`;',
    note: 'toutes les soumissions d’un diagnostic fusionnent', ...T('v77-assessment-attempt.test.mjs') },
  { id: 'M09', famille: 'tentatives fusionnées', fichier: 'lib/learning-engine.mjs',
    avant: '  if (estUnRejeuDeDiagnostic(tentative, derniere)) {',
    apres: '  if (derniere) {',
    note: 'toute reprise est prise pour un rejeu réseau', ...T('v77-assessment-attempt.test.mjs') },
  { id: 'M10', famille: 'tentative écrite trop tard', fichier: 'app/api/assessments/[id]/route.ts',
    avant: '  try {\n    const rt = applyCommand(readProgressFresh(), {',
    apres: '  try {\n    if (body.record !== true) throw new Error(\'skip\');\n    const rt = applyCommand(readProgressFresh(), {',
    note: 'la tentative n’est écrite QUE si l’apprenant conserve', ...T('v77-assessment-attempt.test.mjs') },

  // ── FAMILLE 4 · L'ISSUE EST REÇUE AU LIEU D'ÊTRE DÉRIVÉE ──────────────
  { id: 'M11', famille: 'issue reçue', fichier: 'lib/assessment-attempt.mjs',
    avant: '    outcome,', apres: '    outcome: r.outcome ?? outcome,',
    note: 'l’issue est fournie par celui qu’elle juge', ...T('v77-assessment-attempt.test.mjs') },
  { id: 'M12', famille: 'issue reçue', fichier: 'lib/assessment-attempt.mjs',
    avant: '    reussiteGlobale: total > 0 && passed / total >= seuil,',
    apres: '    reussiteGlobale: r.reussiteGlobale === true || (total > 0 && passed / total >= seuil),',
    note: 'la réussite globale est auto-déclarée', ...T('v77-assessment-attempt.test.mjs') },
  { id: 'M13', famille: 'seuil inventé', fichier: 'lib/assessment-attempt.mjs',
    avant: '  const seuil = Number.isFinite(s) && s > 0 && s <= 1 ? s : SEUIL_PAR_DEFAUT;',
    apres: '  const seuil = Number.isFinite(s) && s > 0 && s <= 1 ? s : 0;',
    note: 'un seuil absent devient 0 : tout réussit', ...T('v77-assessment-attempt.test.mjs') },

  // ── FAMILLE 5 · LA MISSION SE REDÉCLARE RÉUSSIE (CP5) ─────────────────
  { id: 'M14', famille: 'mission surclassée', fichier: 'lib/mission-state.mjs',
    avant: "      status: 'manual',", apres: "      status: 'passed',",
    note: 'une mission redevient une preuve qualifiante', ...T('v77-mission-submission.test.mjs', 'v77-double-comptage.test.mjs') },
  { id: 'M15', famille: 'mission surclassée', fichier: 'lib/evidence.mjs',
    avant: "  'mission-deliverables': 'DECLARED',", apres: "  'mission-deliverables': 'VALIDATED',",
    note: 'le moyen « livrables » se met à valoir une validation', ...GATE },
  { id: 'M16', famille: 'maillon faible ignoré', fichier: 'lib/mission-submission.mjs',
    avant: '  review: \'DECLARED\',', apres: '  review: \'VALIDATED\',',
    note: 'une revue auto-signée vaut une validation', ...T('v77-mission-submission.test.mjs') },
  { id: 'M17', famille: 'maillon faible ignoré', fichier: 'lib/mission-submission.mjs',
    avant: '    if (rang(n) < rang(pire)) pire = n;', apres: '    if (rang(n) > rang(pire)) pire = n;',
    note: 'le maillon faible devient le maillon FORT', ...T('v77-mission-submission.test.mjs') },
  { id: 'M18', famille: 'structure prise pour justesse', fichier: 'lib/mission-submission.mjs',
    avant: "    structureOk: mode === 'structural' ? r.structureOk === true : null,",
    apres: '    structureOk: r.structureOk === true,',
    note: '« non mesuré » devient « faux »', ...T('v77-mission-submission.test.mjs') },

  // ── FAMILLE 6 · LE CAPSTONE REDEVIENT UNE DÉCLARATION (CP6) ───────────
  { id: 'M19', famille: 'capstone dégradé', fichier: 'lib/evidence.mjs',
    avant: "  'exercise-tests', 'assessment-grade', 'mission-deliverables',\n  'capstone-grade', 'capstone-review', 'self',",
    apres: "  'exercise-tests', 'assessment-grade', 'mission-deliverables',\n  'capstone-review', 'self',",
    note: '`capstone-grade` sort du vocabulaire', ...T('v77-capstone.test.mjs') },
  { id: 'M20', famille: 'preuve héritée remontée', fichier: 'lib/evidence.mjs',
    avant: "  'capstone-review': 'OBSERVED',", apres: "  'capstone-review': 'VALIDATED',",
    note: 'une correction jamais rejouée se met à démontrer', ...GATE },
  { id: 'M21', famille: 'simulation effacée', fichier: 'lib/evidence.mjs',
    avant: '    simulation: input.simulation === true,', apres: '    simulation: false,',
    note: 'la marque de simulation disparaît', ...T('v77-capstone.test.mjs') },

  // ── FAMILLE 7 · UNE PAGE VUE DEVIENT UN TRAVAIL (CP7) ─────────────────
  { id: 'M22', famille: 'analyse sans artefact', fichier: 'lib/artifact-analysis.mjs',
    avant: '  if (r.artefactFourni !== true) return null;', apres: '  // garde retirée',
    note: 'analyser la fixture compte comme un travail', ...T('v77-artifact-analysis.test.mjs') },
  { id: 'M23', famille: 'analyse sans artefact', fichier: 'lib/artifact-analysis-server.ts',
    avant: '  if (!artefactFourni) return;', apres: '  if (false) return;',
    note: 'la seconde garde tombe aussi', ...GATE },
  { id: 'M24', famille: 'compte pris pour verdict', fichier: 'lib/artifact-analysis.mjs',
    avant: "    niveau: 'OBSERVED',", apres: "    niveau: total === 0 ? 'VALIDATED' : 'OBSERVED',",
    note: '`0 diagnostic` devient une réussite', ...T('v77-artifact-analysis.test.mjs') },
  { id: 'M25', famille: 'empreinte aveugle', fichier: 'lib/artifact-analysis.mjs',
    avant: '  const texte = stable(artefact);', apres: '  const texte = String(artefact);',
    note: 'deux artefacts différents ont la même empreinte', ...T('v77-artifact-analysis.test.mjs') },
  { id: 'M26', famille: 'pipeline surclassé', fichier: 'app/api/pipelines/[id]/route.ts',
    avant: "      detail: { adapter: kind },", apres: "      detail: { adapter: kind, exitCode: run.status === 'success' ? 0 : 1 },",
    note: 'le verdict de la fixture entre dans le fait', ...T('v77-artifact-analysis.test.mjs') },

  // ── FAMILLE 8 · L'AMBIGUÏTÉ EST RÉSOLUE PAR HEURISTIQUE (CP8) ─────────
  { id: 'M27', famille: 'ambiguïté devinée', fichier: 'lib/exercise-mapping.mjs',
    avant: "  return { concepts: [], classe: 'AMBIGUOUS', regle: `R5 · ${parJour.length} leçons candidates, aucune règle ne tranche` };",
    apres: "  return { concepts: [parJour[0]], classe: 'RESOLVABLE_FROM_CONTEXT', regle: 'R5 · première candidate' };",
    note: 'la première candidate est choisie au hasard', ...T('v77-ambiguite.test.mjs', 'v75-exercise-mapping.test.mjs') },
  { id: 'M28', famille: 'déclaration sans source', fichier: 'lib/exercise-declarations.mjs',
    avant: '    if (!SOURCES_DECLARATION.includes(e.source)) continue;', apres: '    // source non vérifiée',
    note: 'on peut déclarer sans dire pourquoi', ...T('v77-ambiguite.test.mjs') },
  { id: 'M29', famille: 'fichier annexe prioritaire', fichier: 'lib/exercise-mapping.mjs',
    avant: '  if (decl.length === 0 && hors.length === 1) {', apres: '  if (hors.length === 1) {',
    note: 'un fichier annexe contredit le corpus en silence', ...T('v77-ambiguite.test.mjs') },

  // ── FAMILLE 9 · LA QUALIFICATION REDEVIENT GÉNÉREUSE (CP9) ────────────
  { id: 'M30', famille: 'qualification généreuse', fichier: 'lib/evidence.mjs',
    avant: "  return niveauDePreuve(evidence.sourceType, evidence.validation) === 'VALIDATED';",
    apres: '  return true;',
    note: '`isQualifying` cesse de regarder le niveau', ...T('v77-evidence-matrix.test.mjs', 'v77-capstone.test.mjs') },
  { id: 'M31', famille: 'plafond levé', fichier: 'lib/evidence.mjs',
    avant: '  const plafond = rang(plafondSource) <= rang(plafondKind) ? plafondSource : plafondKind;',
    apres: '  const plafond = rang(plafondSource) >= rang(plafondKind) ? plafondSource : plafondKind;',
    note: 'le plafond le plus GÉNÉREUX gagne', ...T('v77-evidence-matrix.test.mjs') },
  { id: 'M32', famille: 'moteurs divergents', fichier: 'lib/evidence-matrix.mjs',
    avant: '          qualifiesFor: Object.fromEntries(MOTEURS.map((m) => [m, qualifie])),',
    apres: "          qualifiesFor: Object.fromEntries(MOTEURS.map((m) => [m, m === 'recovery' ? true : qualifie])),",
    note: 'un moteur qualifie ce que les autres refusent', ...T('v77-evidence-matrix.test.mjs') },

  // ── FAMILLE 10 · LA FILIATION ET LE COMPTAGE (CP10, CP11) ─────────────
  { id: 'M33', famille: 'filiation effacée', fichier: 'lib/mission-state.mjs',
    avant: "    derivedFrom: (missionDef.deliverables ?? [])\n      .filter((d) => d.validation === 'auto' && d.exerciseRef)\n      .map((d) => `exercise:${d.exerciseRef}`),",
    apres: '    derivedFrom: [],',
    note: 'la mission ne dit plus de quoi elle dérive', ...T('v77-double-comptage.test.mjs') },
  { id: 'M34', famille: 'usage compté comme travail', fichier: 'lib/learner-history.mjs',
    avant: '  const usage = list.filter((e) => HISTORY_USAGE_TYPES.includes(e.type)).length;',
    apres: '  const usage = 0;',
    note: 'l’usage est additionné au travail', ...T('v77-learner-state.test.mjs') },

  // ── FAMILLE 11 · LA PORTE ELLE-MÊME ──────────────────────────────────
  //
  // Jugées par le JUGE EXTERNE, jamais par la porte : V76 · CP14 a mesuré
  // qu'une porte ne détecte pas sa propre neutralisation.
  { id: 'M35', famille: 'porte neutralisée', fichier: 'scripts/v77-check.mjs',
    avant: 'if (violations.length) {', apres: 'if (false && violations.length) {',
    note: 'la porte sort toujours en 0', ...JUGE_EXTERNE },
  { id: 'M36', famille: 'porte vidée', fichier: 'scripts/v77-check.mjs',
    avant: 'const check = (ok, regle, detail = \'\') => { verifs += 1; if (!ok) violations.push({ regle, detail }); };',
    apres: 'const check = () => { verifs += 1; };',
    note: 'la porte n’enregistre plus rien', ...JUGE_EXTERNE },
];

// ── EXÉCUTION ───────────────────────────────────────────────────────────
const only = (process.argv.find((a) => a.startsWith('--only=')) ?? '').slice(7);
/** En mode `--json`, la sortie doit rester du JSON pur : rien d'autre ne s'imprime. */
const JSON_SEUL = process.argv.includes('--json');
const dire = (...a) => { if (!JSON_SEUL) console.log(...a); };
const liste = only ? MUTATIONS.filter((m) => m.id === only) : MUTATIONS;

function lancer(cmd, args) {
  try {
    execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8', timeout: 300000, stdio: 'pipe' });
    return { vert: true };
  } catch (e) {
    return { vert: false, sortie: `${e.stdout ?? ''}${e.stderr ?? ''}`.slice(-400) };
  }
}

const juger = (m) => {
  if (m.juge === 'gate') return lancer('node', ['scripts/v77-check.mjs']);
  if (m.juge === 'juge-externe') return lancer('node', ['--test', 'tests/v77-gate.test.mjs']);
  return lancer('node', ['--test', ...m.fichiers.map((f) => join('tests', f))]);
};

const resultats = [];
for (const m of liste) {
  const chemin = join(ROOT, m.fichier);
  const original = readFileSync(chemin, 'utf8');
  // Une mutation dont le motif a disparu s'appliquerait SANS EFFET et
  // conclurait à tort que la garde tient. On refuse plutôt que de conclure.
  if (!original.includes(m.avant)) {
    resultats.push({ ...m, verdict: 'MOTIF INTROUVABLE', vu: false });
    dire(`  ⚠️  ${m.id} — MOTIF INTROUVABLE dans ${m.fichier} (mutation NON appliquée)`);
    continue;
  }
  writeFileSync(chemin, original.replace(m.avant, m.apres));
  let r;
  try { r = juger(m); } finally { writeFileSync(chemin, original); }
  const vu = !r.vert;
  resultats.push({ id: m.id, famille: m.famille, fichier: m.fichier, note: m.note, juge: m.juge, verdict: vu ? 'VUE' : 'SURVIVANTE', vu });
  dire(`  ${vu ? '✅' : '❌'} ${m.id} [${m.juge}] ${m.note} — ${vu ? 'vue échouer' : 'A SURVÉCU'}`);
}

const survivantes = resultats.filter((r) => !r.vu);
const rapport = {
  generatedAt: new Date().toISOString(),
  total: resultats.length,
  vues: resultats.filter((r) => r.vu).length,
  survivantes: survivantes.map((r) => ({ id: r.id, note: r.note, verdict: r.verdict })),
  resultats,
};

if (JSON_SEUL) console.log(JSON.stringify(rapport, null, 1));
else console.log(`\n── v77:mutations — ${rapport.vues}/${rapport.total} vues échouer, ${survivantes.length} survivante(s)\n`);
if (survivantes.length) process.exitCode = 1;
