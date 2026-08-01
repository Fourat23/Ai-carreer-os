// Tests de la recherche locale pure (lib/search.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, tokenize, buildIndex, parseJump, search } from '../lib/search.mjs';

const program = {
  days: [
    { day: 241, title: 'Chunking : comparaison objective', skillName: 'RAG', week: 35, month: 9 },
    { day: 7, title: 'Revue hebdomadaire', skillName: 'Git / Linux', week: 1, month: 1 },
  ],
  weeks: [{ week: 35, theme: 'RAG avancé', month: 9 }],
  months: [{ month: 9, title: 'RAG en production', summary: 'Retrieval', project: { id: 6, name: 'DocQA' } }],
  skills: [{ id: 'rag', name: 'RAG' }, { id: 'py', name: 'Python' }],
  lessons: [{ slug: 'embeddings', title: 'Embeddings', cat: 'IA appliquée' }],
};

test('normalize / tokenize', () => {
  assert.equal(normalize('  Évaluation   IA '), 'evaluation ia');
  assert.deepEqual(tokenize('RAG : chunking'), ['rag', 'chunking']);
});

test('buildIndex : couvre pages, commandes et contenu (statique)', () => {
  const idx = buildIndex(program);
  const types = new Set(idx.map((i) => i.type));
  for (const t of ['command', 'page', 'day', 'week', 'month', 'skill', 'project', 'lesson']) assert.ok(types.has(t), `type ${t} présent`);
  // L'index statique NE contient PAS la commande dynamique de reprise.
  assert.equal(idx.some((i) => /Reprendre le jour/.test(i.title)), false);
});

const catalogue = {
  technologies: [{ id: 'rag', name: 'RAG' }, { id: 'git', name: 'Git' }],
  modules: { 'mod-m9': { id: 'mod-m9', title: 'RAG en production', dayRefs: [241, 242, 243] } },
  tracks: [
    { id: 'ai-engineer-foundations-v1', title: 'AI Engineer — Fondations', status: 'available', technologies: ['rag', 'git'] },
    { id: 'backend-engineer-v1', title: 'Backend Engineer', status: 'announced', technologies: ['git'] },
  ],
};

test('buildIndex : le catalogue ajoute parcours, modules et technologies', () => {
  const idx = buildIndex(program, catalogue);
  const types = new Set(idx.map((i) => i.type));
  for (const t of ['track', 'module', 'technology']) assert.ok(types.has(t), `type ${t} présent`);
  const track = idx.find((i) => i.type === 'track' && /Fondations/.test(i.title));
  assert.equal(track.href, '/parcours#ai-engineer-foundations-v1');
  const mod = idx.find((i) => i.type === 'module');
  assert.equal(mod.href, '/day/241'); // module → son premier jour
  // ids uniques parmi les entrées du catalogue (technologies → hrefs distincts)
  const catIds = idx.filter((i) => ['track', 'module', 'technology'].includes(i.type)).map((i) => i.id);
  assert.equal(new Set(catIds).size, catIds.length);
});

test('buildIndex : n’indexe JAMAIS de données privées (réponses/notes)', () => {
  const privateProgram = { days: [{ day: 1, title: 'Terminal', skillName: 'Git', week: 1, month: 1 }] };
  // même si une progression contient des réponses, buildIndex ne la reçoit pas :
  // il n'accepte que programme + catalogue publics.
  const idx = buildIndex(privateProgram, catalogue);
  const blob = JSON.stringify(idx).toLowerCase();
  assert.equal(blob.includes('answer'), false);
  assert.equal(blob.includes('reponse'), false);
  for (const it of idx) assert.equal('answer' in it, false);
});

test('search : trouve un parcours et une technologie via le catalogue', () => {
  const idx = buildIndex(program, catalogue);
  assert.ok(search(idx, 'fondations').some((r) => r.type === 'track'));
  assert.ok(search(idx, 'rag').some((r) => r.type === 'technology' || r.type === 'skill'));
});

test('parseJump : jour / semaine / mois', () => {
  assert.equal(parseJump('jour 241').href, '/day/241');
  assert.equal(parseJump('j241').href, '/day/241');
  assert.equal(parseJump('semaine 35').href, '/week/35');
  assert.equal(parseJump('mois 9').href, '/month/9');
  assert.equal(parseJump('jour 999'), null); // hors bornes
  assert.equal(parseJump('rag'), null);
});

test('search : jump placé en tête', () => {
  const idx = buildIndex(program);
  const r = search(idx, 'jour 241');
  assert.equal(r[0].href, '/day/241');
  assert.equal(r[0].id.startsWith('jump:'), true);
  // pas de doublon du même href
  assert.equal(r.filter((x) => x.href === '/day/241' && x.id.startsWith('jump:')).length, 1);
});

test('search : par titre et par compétence', () => {
  const idx = buildIndex(program);
  const chunk = search(idx, 'chunking');
  assert.ok(chunk.some((r) => r.href === '/day/241'));
  const rag = search(idx, 'rag');
  assert.ok(rag.some((r) => r.type === 'skill' && r.href === '/skills'));
});

test('search : correspondance exacte avant partielle', () => {
  const idx = buildIndex(program);
  const r = search(idx, 'python');
  assert.equal(normalize(r[0].title), 'python'); // le skill exact d'abord
});

test('search : requête vide → commandes seulement', () => {
  const idx = buildIndex(program);
  const r = search(idx, '');
  assert.ok(r.length > 0);
  assert.ok(r.every((i) => i.type === 'command'));
});

test('search : aucun résultat', () => {
  const idx = buildIndex(program);
  assert.deepEqual(search(idx, 'zzzzxxxx'), []);
});

test('search : classement stable (même score → ordre déterministe)', () => {
  const idx = buildIndex(program);
  const a = search(idx, 'mois');
  const b = search(idx, 'mois');
  assert.deepEqual(a.map((x) => x.id), b.map((x) => x.id));
});

// ── Checkpoint V5 : index statique + métadonnées dynamiques ──
import { resumeCommand, mergeIndex } from '../lib/search.mjs';

test('resumeCommand : dynamique, hors index statique', () => {
  const c = resumeCommand(42);
  assert.equal(c.href, '/day/42');
  assert.match(c.title, /Reprendre le jour 42/);
  assert.equal(resumeCommand(0), null);
  assert.equal(resumeCommand(undefined), null);
});

test('mergeIndex : dynamique en tête, statique conservé', () => {
  const stat = buildIndex(program);
  const merged = mergeIndex(stat, [resumeCommand(7)]);
  assert.equal(merged[0].href, '/day/7');
  assert.equal(merged.length, stat.length + 1);
});

test('cohérence après changement de jour à reprendre (ré-enrichissement)', () => {
  const stat = buildIndex(program); // statique inchangé
  const before = search(mergeIndex(stat, [resumeCommand(41)]), '');
  const after = search(mergeIndex(stat, [resumeCommand(42)]), '');
  assert.match(before[0].title, /jour 41/);
  assert.match(after[0].title, /jour 42/);
  // l'index statique n'a pas été reconstruit (même référence d'items)
  assert.equal(stat, stat);
});

// ── V6 CP9 : révisions dues + confidentialité de la recherche ──
import { reviewsCommand } from '../lib/search.mjs';

test('reviewsCommand : compteur seulement', () => {
  const c = reviewsCommand(3);
  assert.equal(c.href, '/revisions');
  assert.match(c.title, /Révisions dues \(3\)/);
  assert.equal(reviewsCommand(0), null);
  assert.equal(reviewsCommand(-1), null);
});

test('mergeIndex : reprise + révisions dues en tête', () => {
  const stat = buildIndex(program);
  const merged = mergeIndex(stat, [resumeCommand(41), reviewsCommand(2)]);
  assert.equal(merged[0].href, '/day/41');
  assert.equal(merged[1].href, '/revisions');
});

test('confidentialité : l\'index statique ne contient aucun contenu de réponse privé', () => {
  // buildIndex ne prend QUE le programme : structurellement, il ne peut porter
  // aucun texte de réponse/notes de l'utilisateur (jamais de progress en entrée).
  const privateToken = 'mon-secret-de-reponse-privee-42';
  const idx = buildIndex(program); // aucune progression fournie
  const blob = JSON.stringify(idx);
  assert.equal(blob.includes(privateToken), false);
  // et buildIndex ignore tout second argument (pas de fuite via progress)
  const idx2 = buildIndex(program, { days: { '1': { answer: privateToken } } });
  assert.equal(JSON.stringify(idx2).includes(privateToken), false);
});

// ── CP8 (V14) : le second parcours est trouvable par métadonnées publiques ───
import { readFileSync } from 'node:fs';
import { buildCatalogue, FULLSTACK_TRACK_ID } from '../lib/catalogue.mjs';

const realProgram = JSON.parse(readFileSync(new URL('../data/program.json', import.meta.url), 'utf8'));
const realCat = buildCatalogue(realProgram);

test('recherche : le parcours Full-Stack TypeScript est trouvable', () => {
  const idx = buildIndex(realProgram, realCat);
  const fs = idx.find((i) => i.type === 'track' && /Full-Stack TypeScript/.test(i.title));
  assert.ok(fs, 'parcours Full-Stack indexé');
  assert.match(fs.href, /\/parcours#/);
  // Résultats de recherche effectifs.
  assert.ok(search(idx, 'full-stack typescript').some((r) => r.type === 'track'));
});

test('recherche : disponibilité distinguée (disponible vs à venir)', () => {
  const idx = buildIndex(realProgram, realCat);
  const fs = idx.find((i) => i.type === 'track' && i.href.includes(FULLSTACK_TRACK_ID));
  const announced = idx.find((i) => i.type === 'track' && /à venir/.test(i.subtitle));
  assert.equal(fs.subtitle, 'Parcours');            // disponible
  assert.ok(announced, 'au moins un parcours annoncé porte « à venir »');
});

test('recherche : aucune donnée privée du second parcours indexée', () => {
  const idx = buildIndex(realProgram, realCat);
  const blob = JSON.stringify(idx);
  // buildIndex ne reçoit QUE programme + catalogue publics (aucune progression) :
  // aucune structure de donnée privée ne peut donc apparaître dans l'index.
  assert.equal(/"answer"\s*:|"evidence"\s*:\s*\[|"workspace"\s*:|referenceSolution|"reference"\s*:/.test(blob), false);
  // Le parcours n'expose que des métadonnées publiques (titre, statut, href).
  const fs = idx.find((i) => i.href && i.href.includes(FULLSTACK_TRACK_ID));
  assert.deepEqual(Object.keys(fs).sort(), ['href', 'id', 'keywords', 'subtitle', 'title', 'type']);
});
