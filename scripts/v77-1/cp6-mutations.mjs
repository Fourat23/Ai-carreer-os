// V77.1 · CP6 — LES MENSONGES PLAUSIBLES DE CE SPRINT.
//
// Le harnais ne mesure pas si V77.1 est bon. Il mesure si **ses gardes le
// verraient devenir mauvais** — la seule question qu'une suite de tests puisse
// honnêtement se poser sur elle-même.
//
// ── CE QUE CE HARNAIS FAIT DE PLUS QUE CELUI DE V77 · CP14 ─────────────────
//
// Le cycle complet, pour CHAQUE mutation :
//
//   1. VERT AVANT   le juge passe sur le fichier intact
//   2. ROUGE MUTÉ   le juge échoue sur le fichier muté
//   3. RESTAURÉ     le fichier retrouve son contenu, octet pour octet
//   4. VERT APRÈS   le juge repasse
//
// Sans l'étape 1, une mutation « vue » pourrait l'être parce que le juge était
// DÉJÀ rouge — on aurait mesuré une panne, pas une garde. Sans l'étape 4, un
// harnais qui abîme le dépôt en sortirait sans le dire.
//
// Une mutation dont le motif a disparu est REFUSÉE, jamais appliquée à vide :
// c'est le défaut que V77 · CP3 avait trouvé dans les harnais de V75 et V76.
//
// Usage :  node scripts/v77-1/cp6-mutations.mjs [--json] [--only=X07]

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const ROOT = process.cwd();
const JSON_SEUL = process.argv.includes('--json');
const only = (process.argv.find((a) => a.startsWith('--only=')) ?? '').split('=')[1] ?? null;
const dire = (...a) => { if (!JSON_SEUL) console.log(...a); };

const T = (...f) => ({ juge: 'test', fichiers: f });
const PORTE_V66 = { juge: 'porte-v66' };

const LEARNER = 'tests/v771-learner-data.test.mjs';
const UX = 'tests/v771-data-rights-ux.test.mjs';
const SCOPE = 'tests/v771-pilot-scope.test.mjs';
const TRACE = 'tests/v771-session-trace.test.mjs';
const CONF = 'tests/v771-confusion-taxonomy.test.mjs';

export const MUTATIONS = [
  // ══ FAMILLE 1 · LA SUPPRESSION DEVIENT UN MENSONGE (CP2) ═══════════════
  {
    id: 'X01', famille: 'suppression mensongère', fichier: 'lib/learner-data.mjs',
    avant: '  return CATEGORIES_DONNEES_APPRENANT.every((c) => {',
    apres: '  if (operation) return true;\n  return CATEGORIES_DONNEES_APPRENANT.every((c) => {',
    note: 'toute opération a le droit de dire « toutes mes données »', ...T(LEARNER, UX),
  },
  {
    id: 'X02', famille: 'suppression mensongère', fichier: 'lib/learner-data.mjs',
    avant: "export const REPERTOIRES_DU_PRODUIT = [\n  '.git',",
    apres: 'export const REPERTOIRES_DU_PRODUIT = [\n  // vidé',
    note: 'la liste des répertoires du produit est vidée', ...T(LEARNER),
  },
  {
    id: 'X03', famille: 'suppression mensongère', fichier: 'lib/learner-data.mjs',
    avant: 'export function violationsDuPlan(plan, racineProjet) {\n  const v = [];',
    apres: 'export function violationsDuPlan(plan, racineProjet) {\n  if (plan) return [];\n  const v = [];',
    note: 'le garde-fou ne refuse plus rien', ...T(LEARNER),
  },
  {
    id: 'X04', famille: 'suppression mensongère', fichier: 'lib/learner-data.mjs',
    avant: "    if (relatif === 'data') {",
    apres: "    if (relatif === 'data' && false) {",
    note: '« data » entier redevient supprimable — le curriculum avec', ...T(LEARNER),
  },
  {
    id: 'X05', famille: 'suppression mensongère', fichier: 'lib/learner-data.mjs',
    avant: 'export function estSousLeChemin(parent, enfant) {\n  const p = segments(parent);',
    apres: 'export function estSousLeChemin(parent, enfant) {\n  return String(enfant).startsWith(String(parent));\n  const p = segments(parent);',
    note: 'l’appartenance se compare en préfixe de texte : /a/data attrape /a/database', ...T(LEARNER),
  },
  {
    id: 'X06', famille: 'suppression mensongère', fichier: 'lib/learner-data-fs.mjs',
    avant: '  if (violations.length) return { ok: false, violations, supprime: [] };',
    apres: '  if (violations.length && false) return { ok: false, violations, supprime: [] };',
    note: 'un plan refusé est appliqué quand même', ...T(LEARNER),
  },
  {
    id: 'X07', famille: 'suppression mensongère', fichier: 'lib/learner-data-fs.mjs',
    avant: "      if (existsSync(etape.chemin)) rmSync(etape.chemin, { recursive: true, force: true });",
    apres: "      if (existsSync(etape.chemin) && etape.id !== 'lab-journals') rmSync(etape.chemin, { recursive: true, force: true });",
    note: 'le code de l’apprenant survit à une suppression annoncée totale', ...T(LEARNER),
  },
  {
    id: 'X08', famille: 'suppression mensongère', fichier: 'lib/learner-data.mjs',
    avant: "  return l.every((x) => x && x.resteSurLeDisque === false && !x.erreur);",
    apres: '  return true;',
    note: 'le rapport annonce une réussite sans regarder le disque', ...T(LEARNER),
  },
  {
    id: 'X09', famille: 'suppression mensongère', fichier: 'lib/learner-data.mjs',
    avant: "export const CONFIRMATION_DE_SUPPRESSION = 'SUPPRIMER';",
    apres: "export const CONFIRMATION_DE_SUPPRESSION = '';",
    note: 'le mot de confirmation est vidé : un POST vide suffirait', ...T(UX),
  },
  {
    id: 'X10', famille: 'suppression mensongère', fichier: 'app/api/progress/delete-all/route.ts',
    avant: '  if (confirmation !== CONFIRMATION_DE_SUPPRESSION) {',
    apres: '  if (false && confirmation !== CONFIRMATION_DE_SUPPRESSION) {',
    note: 'la route supprime sans confirmation', ...T(UX),
  },
  {
    id: 'X11', famille: 'suppression mensongère', fichier: 'app/api/progress/delete-all/route.ts',
    avant: "import { CONFIRMATION_DE_SUPPRESSION } from '@/lib/learner-data';",
    apres: "import { CONFIRMATION_DE_SUPPRESSION } from '@/lib/learner-data';\nimport { snapshotProgress } from '@/lib/progress-server';",
    note: 'la suppression totale se remet à créer un filet', ...T(UX),
  },

  // ══ FAMILLE 2 · L'EXPORT REDEVIENT INCOMPLET (CP2) ═════════════════════
  {
    id: 'X12', famille: 'export incomplet', fichier: 'lib/learner-data.mjs',
    avant: "    sauvegardeRestaurable: 'ABSENT',\n    archiveComplete: 'INCLUS',\n  },\n];",
    apres: "    sauvegardeRestaurable: 'ABSENT',\n    archiveComplete: 'ABSENT',\n  },\n];",
    note: 'l’archive « complète » cesse d’inclure le code de l’apprenant', ...T(LEARNER, UX),
  },
  {
    id: 'X13', famille: 'export incomplet', fichier: 'app/api/progress/export-all/route.ts',
    avant: '    journauxDeTentatives: tousLesJournaux(),',
    apres: '    journauxDeTentatives: {},',
    note: 'l’archive n’embarque plus les journaux', ...T(UX),
  },
  {
    id: 'X14', famille: 'export incomplet', fichier: 'app/api/progress/export-all/route.ts',
    avant: "    categories: CATEGORIES_DONNEES_APPRENANT.map((c) => ({ id: c.id, libelle: c.libelle, present: c.archiveComplete })),",
    apres: "    categories: [{ id: 'progress', libelle: 'Progression', present: 'INCLUS' }],",
    note: 'la route recopie la liste des catégories au lieu de la lire', ...T(UX),
  },
  {
    id: 'X15', famille: 'export incomplet', fichier: 'app/settings/SettingsPanel.tsx',
    avant: '        <h3>Exporter une sauvegarde restaurable</h3>',
    apres: '        <h3>Exporter toutes mes données locales</h3>',
    note: 'le panneau reprend la phrase mensongère mesurée au CP0', ...T(UX),
  },
  {
    id: 'X16', famille: 'export incomplet', fichier: 'app/api/progress/reset/route.ts',
    avant: '  snapshotProgress();',
    apres: '  // snapshotProgress();',
    note: 'la réinitialisation cesse de créer son filet, mais continue de le promettre', ...T(UX),
  },

  // ══ FAMILLE 3 · LE SCOPE DU PILOTE REDEVIENT AMBIGU (CP3) ══════════════
  {
    id: 'X17', famille: 'scope ambigu', fichier: 'lib/pilot-scope.mjs',
    avant: 'export function incoherencesDuScope(fixture, corpus, protocolVersionAttendue) {\n  const v = [];',
    apres: 'export function incoherencesDuScope(fixture, corpus, protocolVersionAttendue) {\n  if (fixture) return [];\n  const v = [];',
    note: 'la vérification du scope ne trouve plus jamais rien', ...T(SCOPE),
  },
  {
    id: 'X18', famille: 'scope ambigu', fichier: 'lib/pilot-scope.mjs',
    avant: "      if (d.length !== 1) v.push(`exercice « ${eid} » : ${d.length} déclarants — AMBIGU pour ce protocole`);",
    apres: "      if (d.length !== 1 && false) v.push(`exercice « ${eid} » : ${d.length} déclarants — AMBIGU pour ce protocole`);",
    note: 'un exercice multi-concept redevient admissible dans le pilote', ...T(SCOPE),
  },
  {
    id: 'X19', famille: 'scope ambigu', fichier: 'lib/pilot-scope.mjs',
    avant: '    if (d.length === 1) v.push(`exercice « ${x.exerciseId} » écarté alors qu\'il n\'a qu\'un déclarant`);',
    apres: '    if (d.length === 0) v.push(`exercice « ${x.exerciseId} » écarté alors qu\'il n\'a qu\'un déclarant`);',
    note: 'un exercice peut être écarté sans raison mesurable', ...T(SCOPE),
  },
  {
    id: 'X20', famille: 'scope ambigu', fichier: 'lib/pilot-scope.mjs',
    avant: '  if (concepts.length < 3 || concepts.length > 6) {',
    apres: '  if (concepts.length < 1 || concepts.length > 99) {',
    note: 'le scope n’est plus tenu à 3-6 concepts', ...T(SCOPE),
  },
  {
    id: 'X21', famille: 'scope ambigu', fichier: 'data/pilot/v78-pilot-1.json',
    avant: '"exerciseId": "http-rate-limit-decide",\n          "role": "PRINCIPAL",',
    apres: '"exerciseId": "http-method-idempotent",\n          "role": "PRINCIPAL",',
    note: 'la fixture réintègre un exercice déclaré par trois leçons', ...T(SCOPE),
  },
  {
    id: 'X22', famille: 'scope ambigu', fichier: 'data/pilot/v78-pilot-1.json',
    avant: '"protocolVersion": "V78-PILOT-PROTOCOL-1",',
    apres: '"protocolVersion": "V78-PILOT-PROTOCOL-0",',
    note: 'la version de protocole de la fixture dérive', ...T(SCOPE, TRACE, CONF),
  },

  // ══ FAMILLE 4 · LA RECONSTRUCTION DEVIENT INDULGENTE (CP4) ═════════════
  {
    id: 'X23', famille: 'reconstruction indulgente', fichier: 'lib/session-trace.mjs',
    avant: '    reconstructible: manques.length === 0,',
    apres: '    reconstructible: true,',
    note: 'une session est déclarée reconstructible quoi qu’il manque', ...T(TRACE),
  },
  {
    id: 'X24', famille: 'reconstruction indulgente', fichier: 'lib/session-trace.mjs',
    avant: "    if (instant == null) manques.push(manque('CHAMP_ABSENT', decl.id, 'aucun instant : on ne sait pas quand'));",
    apres: '    if (false) manques.push(null);',
    note: 'un fait sans instant passe sans un mot', ...T(TRACE),
  },
  {
    id: 'X25', famille: 'reconstruction indulgente', fichier: 'lib/session-trace.mjs',
    avant: "    if (!f.provenance || typeof f.provenance.producer !== 'string') {",
    apres: '    if (false) {',
    note: 'un fait sans producteur ne gêne plus personne', ...T(TRACE),
  },
  {
    id: 'X26', famille: 'reconstruction indulgente', fichier: 'lib/session-trace.mjs',
    avant: "  if (genre === 'evidence') return f?.createdAt ?? null;",
    apres: "  if (genre === 'evidence') return f?.at ?? null;",
    note: 'l’instant d’une preuve est cherché dans le mauvais champ', ...T(TRACE),
  },
  {
    id: 'X27', famille: 'reconstruction indulgente', fichier: 'lib/session-trace.mjs',
    avant: "      .filter((f) => (decl.cle == null ? true : cleDuFait(decl.fait, f) === decl.cle))",
    apres: '      .filter(() => true)',
    note: 'n’importe quel exercice peut tenir lieu de l’étape attendue', ...T(TRACE),
  },
  {
    id: 'X28', famille: 'reconstruction indulgente', fichier: 'lib/session-trace.mjs',
    avant: "  if (!identite.sessionId) manques.push(manque('IDENTITE_ABSENTE', null, 'aucun identifiant de session dans l’archive'));",
    apres: '  if (false) manques.push(null);',
    note: 'une archive anonyme devient acceptable', ...T(TRACE),
  },
  {
    id: 'X29', famille: 'reconstruction indulgente', fichier: 'lib/session-trace.mjs',
    avant: "  if (heures == null) return 'NOT_OBSERVED';",
    apres: "  if (heures == null) return 'DANS_LA_FENETRE';",
    note: 'un délai non mesuré est compté comme un délai respecté', ...T(TRACE),
  },
  {
    id: 'X30', famille: 'reconstruction indulgente', fichier: 'lib/session-trace.mjs',
    avant: '  return heures >= min && heures <= max ? \'DANS_LA_FENETRE\' : \'DELAY_OUT_OF_WINDOW\';',
    apres: "  return 'DANS_LA_FENETRE';",
    note: 'tout délai tombe dans la fenêtre', ...T(TRACE),
  },
  {
    id: 'X31', famille: 'reconstruction indulgente', fichier: 'lib/session-trace.mjs',
    avant: '  if (!a || !b) return null;',
    apres: '  if (!a || !b) return 0;',
    note: 'un délai non mesurable devient zéro heure', ...T(TRACE),
  },
  {
    id: 'X32', famille: 'reconstruction indulgente', fichier: 'lib/session-trace.mjs',
    avant: "    return f.passed === f.total ? 'reussi' : `echoue ${f.passed}/${f.total}`;",
    apres: "    return 'reussi';",
    note: 'toute tentative est lue comme réussie', ...T(TRACE),
  },
  {
    id: 'X33', famille: 'reconstruction indulgente', fichier: 'data/pilot/v78-pilot-1.json',
    avant: '"conceptsAttendus": [\n        "api-production-contracts",\n        "authentication"\n      ]',
    apres: '"conceptsAttendus": []',
    note: 'le transfert cesse de déclarer les deux concepts qu’il relie', ...T(TRACE),
  },
  {
    id: 'X34', famille: 'reconstruction indulgente', fichier: 'data/pilot/v78-pilot-1.json',
    avant: '"id": "PRETEST",\n      "concept": "networking-http-tls",',
    apres: '"id": "PRETEST_AUTRE",\n      "concept": "networking-http-tls",',
    note: 'une étape du protocole est renommée sans que rien ne bronche', ...T(SCOPE),
  },

  // ══ FAMILLE 5 · LA PROVENANCE DU RAPPEL DISPARAÎT (CP4) ════════════════
  {
    id: 'X35', famille: 'provenance perdue', fichier: 'lib/retention.mjs',
    avant: '    provenance: normalizeProvenance(raw.provenance, { legacy: true }),',
    apres: '    // provenance retirée',
    note: 'la tentative de rappel cesse de dire qui l’a constatée', ...PORTE_V66,
  },
  {
    id: 'X36', famille: 'provenance perdue', fichier: 'lib/retention.mjs',
    avant: '    provenance: normalizeProvenance(raw.provenance, { legacy: true }),',
    apres: '    provenance: normalizeProvenance(raw.provenance, { legacy: false }),',
    note: 'la provenance devient obligatoire — et l’historique de rappel disparaît',
    ...T(TRACE),
  },
  {
    id: 'X37', famille: 'provenance perdue', fichier: 'lib/learning-engine.mjs',
    avant: "    provenance: cmd.provenance ?? { producer: 'recall-station', method: 'auto-report' },",
    apres: '    provenance: cmd.provenance ?? null,',
    note: 'la commande de rappel n’a plus de producteur par défaut', ...T(TRACE),
  },

  // ══ FAMILLE 6 · LA TAXONOMIE DE CONFUSION S'EFFONDRE (CP5) ═════════════
  {
    id: 'X38', famille: 'taxonomie effondrée', fichier: 'lib/confusion-taxonomy.mjs',
    avant: "    porte: 'le TEXTE de l’énoncé',",
    apres: "    porte: 'la NOTION',",
    note: 'consigne peu claire et notion mal comprise portent sur la même chose', ...T(CONF),
  },
  {
    id: 'X39', famille: 'taxonomie effondrée', fichier: 'lib/confusion-taxonomy.mjs',
    avant: "  if (raw.categorie === 'OTHER' && !verbatim) return null;",
    apres: '  if (false) return null;',
    note: '« Autre » sans verbatim redevient collectable', ...T(CONF),
  },
  {
    id: 'X40', famille: 'taxonomie effondrée', fichier: 'lib/confusion-taxonomy.mjs',
    avant: '  const out = Object.fromEntries(IDS_DE_CONFUSION.map((id) => [id, 0]));',
    apres: '  const out = {};',
    note: 'les catégories à zéro disparaissent du décompte', ...T(CONF),
  },
  {
    id: 'X41', famille: 'taxonomie effondrée', fichier: 'lib/confusion-taxonomy.mjs',
    avant: "  if (valides.length === 0) return { verdict: 'NOT_OBSERVED', part: null, total: 0 };",
    apres: "  if (valides.length === 0) return { verdict: 'H6_TIENT', part: 0, total: 0 };",
    note: 'une hypothèse jamais éprouvée est déclarée vérifiée', ...T(CONF),
  },
  {
    id: 'X42', famille: 'taxonomie effondrée', fichier: 'lib/confusion-taxonomy.mjs',
    avant: 'export const PART_MAX_EN_AUTRE = 1 / 3;',
    apres: 'export const PART_MAX_EN_AUTRE = 1;',
    note: 'le seuil de falsification de H6 est remonté après coup', ...T(CONF),
  },
  {
    id: 'X43', famille: 'taxonomie effondrée', fichier: 'lib/confusion-taxonomy.mjs',
    avant: "  if (!MOMENTS.includes(raw.moment)) return null;",
    apres: '  if (false) return null;',
    note: 'un moment inventé est accepté', ...T(CONF),
  },

  // ══ FAMILLE 7 · LES DOCUMENTS DU PILOTE PERDENT L'ESSENTIEL (CP5) ══════
  {
    id: 'X44', famille: 'documents amputés', fichier: 'docs/v77-1/V78-FACILITATOR-SCRIPT.md',
    avant: '{ "command": { "type": "RECORD_RECALL",',
    apres: '{ "command": { "type": "AUTRE_CHOSE",',
    note: 'le script perd le chemin de repli du risque R8', ...T(CONF),
  },
  {
    id: 'X45', famille: 'documents amputés', fichier: 'docs/v77-1/V78-PILOT-CHECKLIST.md',
    avant: 'PRETEST prérequis  networking-http-tls        [ ] [ ]        exactement 2',
    apres: 'PRETEST prérequis  networking-http-tls        [ ] [ ]',
    note: 'la liste de contrôle perd le compte exact des amorces', ...T(CONF),
  },
  {
    id: 'X46', famille: 'documents amputés', fichier: 'docs/v77-1/V78-PILOT-CHECKLIST.md',
    avant: '□ A5  version de protocole appliquée ≠ version gelée',
    apres: '□ (retiré)',
    note: 'une règle d’arrêt du pilote disparaît de la liste', ...T(CONF),
  },
  {
    id: 'X47', famille: 'documents amputés', fichier: 'docs/v77-1/V78-PARTICIPANT-PROCEDURE.md',
    avant: '**Personne ne verra une note.** Il n\'y en a pas',
    apres: 'Les résultats seront comparés entre participants',
    note: 'la procédure se met à promettre une comparaison', ...T(CONF),
  },
  // ══ FAMILLE 8 · LA LISTE PRESCRITE AU CP6, POINT PAR POINT ═════════════
  {
    id: 'X48', famille: 'suppression partielle', fichier: 'lib/learner-data-fs.mjs',
    avant: "      if (existsSync(etape.chemin)) rmSync(etape.chemin, { recursive: true, force: true });",
    apres: "      if (existsSync(etape.chemin) && etape.id !== 'progress') rmSync(etape.chemin, { recursive: true, force: true });",
    note: 'delete-all laisse la PROGRESSION sur le disque', ...T(LEARNER),
  },
  {
    id: 'X49', famille: 'suppression partielle', fichier: 'lib/learner-data-fs.mjs',
    avant: "      if (existsSync(etape.chemin)) rmSync(etape.chemin, { recursive: true, force: true });",
    apres: "      if (existsSync(etape.chemin) && etape.id !== 'progress-snapshot') rmSync(etape.chemin, { recursive: true, force: true });",
    note: 'delete-all laisse l’INSTANTANÉ de secours', ...T(LEARNER),
  },
  {
    id: 'X50', famille: 'suppression partielle', fichier: 'lib/learner-data-fs.mjs',
    avant: "      if (existsSync(etape.chemin)) rmSync(etape.chemin, { recursive: true, force: true });",
    apres: "      if (existsSync(etape.chemin) && etape.id !== 'lab-workspaces') rmSync(etape.chemin, { recursive: true, force: true });",
    note: 'delete-all laisse les ESPACES DE TRAVAIL', ...T(LEARNER),
  },
  {
    id: 'X51', famille: 'outcome primaire altéré', fichier: 'data/pilot/v78-pilot-1.json',
    avant: '"primaryOutcome": "SESSION_TRACE_RECONSTRUCTABILITY",',
    apres: '"primaryOutcome": "TAUX_DE_REUSSITE",',
    note: 'l’outcome primaire est remplacé après coup', ...T(SCOPE),
  },
  {
    id: 'X52', famille: 'outcome primaire altéré', fichier: 'data/pilot/v78-pilot-1.json',
    avant: '"primaryOutcome": "SESSION_TRACE_RECONSTRUCTABILITY",',
    apres: '"primaryOutcomeAbsent": true,',
    note: 'l’outcome primaire disparaît de la fixture', ...T(SCOPE),
  },
  {
    id: 'X53', famille: 'délai altéré', fichier: 'data/pilot/v78-pilot-1.json',
    avant: '"delayedRetrievalDelayHours": 24,',
    apres: '"delayedRetrievalDelayHours": 2,',
    note: 'le délai de rappel est raccourci après coup', ...T(SCOPE, CONF),
  },
  {
    id: 'X54', famille: 'délai altéré', fichier: 'data/pilot/v78-pilot-1.json',
    avant: '"delayedRetrievalWindowHours": [\n    18,\n    36\n  ],',
    apres: '"delayedRetrievalWindowHours": [\n    0,\n    999\n  ],',
    note: 'la fenêtre du délai est élargie jusqu’à ne plus rien exclure', ...T(SCOPE, TRACE, CONF),
  },
  {
    id: 'X55', famille: 'horloge client', fichier: 'lib/learning-engine.mjs',
    avant: "  const attempt = normalizeAttempt({\n    conceptId,\n    at: nowIso,",
    apres: "  const attempt = normalizeAttempt({\n    conceptId,\n    at: typeof cmd.at === 'string' ? cmd.at : nowIso,",
    note: 'un horodatage fourni par le client est accepté — H12 tombe', ...T(TRACE),
  },
  {
    id: 'X56', famille: 'étape du protocole perdue', fichier: 'data/pilot/v78-pilot-1.json',
    avant: '"id": "EXERCISE_ATTEMPT_FAIL",', apres: '"id": "EXERCISE_ATTEMPT_RATE",',
    note: 'l’ÉCHEC disparaît du protocole', ...T(SCOPE),
  },
  {
    id: 'X57', famille: 'étape du protocole perdue', fichier: 'data/pilot/v78-pilot-1.json',
    avant: '"id": "HINT_VIEW",', apres: '"id": "HINT_SEEN",',
    note: 'l’AIDE disparaît du protocole', ...T(SCOPE),
  },
  {
    id: 'X58', famille: 'étape du protocole perdue', fichier: 'data/pilot/v78-pilot-1.json',
    avant: '"id": "EXERCISE_ATTEMPT_RETRY",', apres: '"id": "EXERCISE_RETRY",',
    note: 'la NOUVELLE TENTATIVE disparaît du protocole', ...T(SCOPE),
  },
  {
    id: 'X59', famille: 'étape du protocole perdue', fichier: 'data/pilot/v78-pilot-1.json',
    avant: '"id": "TRANSFER",', apres: '"id": "TRANSFERT",',
    note: 'le TRANSFERT disparaît du protocole', ...T(SCOPE),
  },
  {
    id: 'X60', famille: 'étape du protocole perdue', fichier: 'data/pilot/v78-pilot-1.json',
    avant: '"id": "CONFUSION_REPORT",', apres: '"id": "CONFUSION",',
    note: 'le RAPPORT DE CONFUSION disparaît du protocole', ...T(SCOPE),
  },
  {
    id: 'X61', famille: 'fait dupliqué', fichier: 'lib/session-trace.mjs',
    avant: '      .filter((f) => !utilises.has(f));',
    apres: '      .filter(() => true);',
    note: 'un même fait sert à DEUX étapes : la session paraît complète sans l’être', ...T(TRACE),
  },
  {
    id: 'X62', famille: 'identité mélangée', fichier: 'lib/pilot-session-server.ts',
    avant: '  ) as { protocolVersion: string; scopeId: string };',
    apres: "  ) as { protocolVersion: string; scopeId: string };\n  fixture.protocolVersion = process.env['AICOS_PILOT_PROTOCOL'] ?? 'V78-PILOT-PROTOCOL-1';",
    note: 'la version de protocole se déclare par l’environnement', ...T(TRACE),
  },
  {
    id: 'X63', famille: 'identité mélangée', fichier: 'lib/pilot-session-server.ts',
    avant: '    sessionId,\n    protocolVersion: fixture.protocolVersion,',
    apres: "    sessionId,\n    participantEmail: process.env['AICOS_PILOT_EMAIL'] ?? '',\n    protocolVersion: fixture.protocolVersion,",
    note: 'un identifiant personnel inutile entre dans l’archive', ...T(TRACE),
  },
  {
    id: 'X64', famille: 'tiers introduit', fichier: 'app/api/progress/export-all/route.ts',
    avant: "export const dynamic = 'force-dynamic';",
    apres: "export const dynamic = 'force-dynamic';\nconst ANALYTICS = 'https://analytics.example.com/collect';",
    note: 'un service d’analytique tiers apparaît dans la route d’export', ...T(TRACE),
  },
  {
    id: 'X65', famille: 'tiers introduit', fichier: 'lib/session-trace.mjs',
    avant: 'const tab = (v) => (Array.isArray(v) ? v : []);',
    apres: "const tab = (v) => (Array.isArray(v) ? v : []);\nexport function writeFileSync() { /* le reconstructeur se met à écrire */ }",
    note: 'le reconstructeur se met à écrire — l’observation modifie l’observé', ...T(TRACE),
  },
];


const liste = only ? MUTATIONS.filter((m) => m.id === only) : MUTATIONS;

function lancer(m) {
  const args = m.juge === 'porte-v66'
    ? ['scripts/v66-check.mjs']
    : ['--test', ...m.fichiers.map((f) => (f.startsWith('tests/') ? f : join('tests', f)))];
  try {
    execFileSync('node', args, { cwd: ROOT, encoding: 'utf8', timeout: 300000, stdio: 'pipe' });
    return { vert: true };
  } catch (e) {
    return { vert: false, sortie: `${e.stdout ?? ''}${e.stderr ?? ''}`.slice(-300) };
  }
}

const sha = (s) => createHash('sha256').update(s).digest('hex');

const resultats = [];
dire(`\n== V77.1 · CP6 — ${liste.length} mensonges plausibles ==\n`);

for (const m of liste) {
  const chemin = join(ROOT, m.fichier);
  const original = readFileSync(chemin, 'utf8');
  const empreinte = sha(original);

  // Une mutation dont le motif a disparu s'appliquerait SANS EFFET et
  // conclurait à tort que la garde tient. On refuse plutôt que de conclure.
  if (!original.includes(m.avant)) {
    resultats.push({ id: m.id, famille: m.famille, fichier: m.fichier, note: m.note, verdict: 'MOTIF INTROUVABLE', vu: false });
    dire(`  ⚠️  ${m.id} — MOTIF INTROUVABLE dans ${m.fichier} (mutation NON appliquée)`);
    continue;
  }

  // ── 1. VERT AVANT — sans quoi une mutation « vue » pourrait l'être parce
  //       que le juge était DÉJÀ rouge : on mesurerait une panne, pas une garde.
  const avant = lancer(m);
  if (!avant.vert) {
    resultats.push({ id: m.id, famille: m.famille, fichier: m.fichier, note: m.note, verdict: 'JUGE DÉJÀ ROUGE', vu: false, sortie: avant.sortie });
    dire(`  ⚠️  ${m.id} — LE JUGE ÉTAIT DÉJÀ ROUGE (mutation non concluante)`);
    continue;
  }

  // ── 2. ROUGE MUTÉ ──
  writeFileSync(chemin, original.replace(m.avant, m.apres));
  let mute;
  try { mute = lancer(m); } finally {
    // ── 3. RESTAURÉ, octet pour octet ──
    writeFileSync(chemin, original);
  }
  const restaure = sha(readFileSync(chemin, 'utf8')) === empreinte;

  // ── 4. VERT APRÈS — un harnais qui abîme le dépôt doit le dire ──
  const apres = lancer(m);

  const vu = !mute.vert && restaure && apres.vert;
  resultats.push({
    id: m.id, famille: m.famille, fichier: m.fichier, note: m.note, juge: m.juge,
    vertAvant: true, rougeMute: !mute.vert, restaure, vertApres: apres.vert,
    verdict: vu ? 'VUE' : (!mute.vert ? (restaure ? 'JUGE ROUGE APRÈS RESTAURATION' : 'FICHIER NON RESTAURÉ') : 'SURVIVANTE'),
    vu,
  });
  const etat = vu ? '✅' : '❌';
  dire(`  ${etat} ${m.id} [${m.juge}] ${m.note}`);
  if (!vu) dire(`       vert avant=oui · rouge muté=${!mute.vert} · restauré=${restaure} · vert après=${apres.vert}`);
}

const survivantes = resultats.filter((r) => !r.vu);
const rapport = {
  generatedAt: new Date().toISOString(),
  total: resultats.length,
  vues: resultats.filter((r) => r.vu).length,
  survivantes: survivantes.map((r) => ({ id: r.id, note: r.note, verdict: r.verdict })),
  familles: [...new Set(resultats.map((r) => r.famille))],
  resultats,
};

if (JSON_SEUL) console.log(JSON.stringify(rapport, null, 1));
else dire(`\n── v77-1:mutations — ${rapport.vues}/${rapport.total} vues échouer, ${survivantes.length} survivante(s)\n`);
if (survivantes.length) process.exitCode = 1;
