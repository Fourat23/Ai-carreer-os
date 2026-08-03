// CP1 (V20) — modèle d'audit pédagogique pur : rubrique, seuils, signaux de
// danger (bloquants), signaux structurels (informatifs), registre.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AUDIT_SCALE, DIMENSIONS, DIMENSION_IDS, evaluateScores,
  detectDangerSignals, blockingSignals, structuralSignals,
  validateAuditItem, validateAuditLedger,
} from '../lib/pedagogy-audit.mjs';

const fullScores = (v) => Object.fromEntries(DIMENSIONS.map((d) => [d.id, v]));

test('rubrique : 16 dimensions, échelle 0-4, dimensions critiques', () => {
  assert.equal(DIMENSIONS.length, 16);
  assert.deepEqual(AUDIT_SCALE, [0, 1, 2, 3, 4]);
  assert.ok(DIMENSION_IDS.has('technical-accuracy'));
  const crit = DIMENSIONS.filter((d) => d.critical).map((d) => d.id);
  assert.deepEqual(crit, ['technical-accuracy']);
});

test('seuils : contenu excellent passe ; contenu récent exige une moyenne plus haute', () => {
  assert.equal(evaluateScores(fullScores(4)).ok, true);
  // Moyenne 3.0 pile : passe en global, mais un contenu récent exige 3.25.
  assert.equal(evaluateScores(fullScores(3)).ok, true);
  assert.equal(evaluateScores(fullScores(3), { recent: true }).ok, false);
});

test('seuils : une dimension à 1 rend le contenu non exploitable', () => {
  const r = evaluateScores({ ...fullScores(4), 'accessibility': 1 });
  assert.equal(r.ok, false);
  assert.ok(r.failures.some((f) => /accessibility/.test(f) && /non exploitable/.test(f)));
});

test('seuils : exactitude technique < 3 est bloquante (critique) ; objectif/progression/pratique ≥ 3 obligatoires', () => {
  assert.equal(evaluateScores({ ...fullScores(4), 'technical-accuracy': 2 }).ok, false);
  assert.equal(evaluateScores({ ...fullScores(4), 'objective': 2 }).ok, false);
  assert.equal(evaluateScores({ ...fullScores(4), 'progression': 2 }).ok, false);
  assert.equal(evaluateScores({ ...fullScores(4), 'autonomous-practice': 2 }).ok, false);
});

test('seuils : notes manquantes détectées', () => {
  const r = evaluateScores({ 'technical-accuracy': 4 });
  assert.equal(r.ok, false);
  assert.ok(r.missing.length === 15);
});

test('danger : chmod 777 sans mise en garde = bloquant ; avec « éviter » = sain', () => {
  assert.ok(blockingSignals('On fait `chmod 777 fichier` et voilà.').some((s) => s.code === 'chmod-777-unwarned'));
  assert.equal(blockingSignals('Éviter `chmod 777` : c’est un anti-pattern, préférer chmod 644.').length, 0);
});

test('danger : rm -rf destructif, isolation OS surévaluée, sécurité absolue = bloquants', () => {
  assert.ok(blockingSignals('lance `rm -rf /` pour nettoyer').some((s) => s.code === 'rm-rf-destructive'));
  assert.ok(blockingSignals('Docker fournit une isolation OS complète.').some((s) => s.code === 'os-isolation-overclaim'));
  // Nié → sain.
  assert.equal(blockingSignals('Un conteneur ne constitue pas une isolation OS absolue.').length, 0);
  assert.ok(blockingSignals('Cela garantit une sécurité absolue.').some((s) => s.code === 'absolute-security-claim'));
  // Idiome légitime : « règle de sécurité absolue » (règle cardinale) n'est PAS une promesse.
  assert.equal(blockingSignals('LA règle de sécurité absolue : on ne rebase jamais un commit poussé.').length, 0);
});

test('danger : code non fermé = bloquant ; ping-overclaim et placeholder = warn', () => {
  assert.ok(blockingSignals('```bash\nls\n(pas de fermeture)').some((s) => s.code === 'unclosed-code-fence'));
  const w = detectDangerSignals('Si le ping passe, le réseau fonctionne. Contenu à venir.');
  assert.ok(w.some((s) => s.code === 'ping-overclaim' && s.severity === 'warn'));
  assert.ok(w.some((s) => s.code === 'placeholder' && s.severity === 'warn'));
  // Un TODO dans un exemple de code, un attribut HTML placeholder="…", et une
  // consigne « à compléter » ne sont PAS des placeholders d'auteur.
  assert.equal(detectDangerSignals('`grep TODO fichier.txt`').some((s) => s.code === 'placeholder'), false);
  assert.equal(detectDangerSignals('<input placeholder="Rechercher">').some((s) => s.code === 'placeholder'), false);
  assert.equal(detectDangerSignals('Tableau à compléter par l’apprenant.').some((s) => s.code === 'placeholder'), false);
});

test('structurel : présence/absence des composants (informatif, pas une note)', () => {
  const rich = '## 🎯 Objectif\n## 📖 Cours\nmodèle mental\n## 🧭 Exemple guidé\n## ✍️ Pratique autonome\n## ❓ Mini-quiz\n## ⚠️ Erreurs fréquentes\n## ✅ Critères de validation\n## 🏢 Cas métier\n## 🧠 À retenir';
  const s = structuralSignals(rich);
  assert.equal(s.missing.length, 0);
  assert.equal(s.completeness, 1);
  const poor = structuralSignals('## 🎯 Objectif\nun peu de texte');
  assert.ok(poor.missing.includes('autonomous-practice'));
});

test('registre : entrée valide, dimension inconnue rejetée, danger bloquant via loadSource', () => {
  assert.equal(validateAuditItem({ id: 'day-72', kind: 'day', recent: true, scores: fullScores(4) }).ok, true);
  assert.ok(validateAuditItem({ id: 'x', kind: 'day', scores: { bidon: 4 } }).errors.some((e) => /dimension inconnue/.test(e)));

  const ledger = { items: [{ id: 'day-1', kind: 'day', scores: fullScores(4) }] };
  const clean = validateAuditLedger(ledger, () => '## 🎯 Objectif\ntexte sain');
  assert.equal(clean.ok, true);
  const dirty = validateAuditLedger(ledger, () => 'Docker fournit une isolation OS totale.');
  assert.equal(dirty.ok, false);
  assert.ok(dirty.errors.some((e) => /os-isolation-overclaim/.test(e)));
});

test('registre vide → valide (scaffold)', () => {
  assert.equal(validateAuditLedger({ items: [] }).ok, true);
});
