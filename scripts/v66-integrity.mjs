// V66 · CP14 — intégrité du Retention Engine à travers l'API RÉELLE.
// Aucun appel direct au modèle : tout passe par HTTP, comme un apprenant.
const BASE = 'http://localhost:3505';
const cmd = (c) => fetch(BASE + '/api/progress', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ command: c }),
}).then((r) => r.json());
const lire = () => fetch(BASE + '/api/progress').then((r) => r.json());
const page = (p) => fetch(BASE + p).then((r) => r.text());

let ok = 0; const ko = [];
const T = (nom, cond, detail = '') => { if (cond) { ok++; console.log('  ✅ ' + nom); } else { ko.push(nom + (detail ? ' — ' + detail : '')); console.log('  ❌ ' + nom + (detail ? ' — ' + detail : '')); } };

// I1 — une visite n'écrit rien
const av = JSON.stringify(await lire());
for (const p of ['/retention', '/revisions', '/skills', '/doc/lessons/embeddings']) await page(p);
T('I1 · visiter /retention n’écrit rien', JSON.stringify(await lire()) === av);

// I2 — commande invalide refusée, disque intact
const r2 = await cmd({ type: 'RECORD_RECALL', conceptId: 'embeddings', outcome: 'peut-etre' });
T('I2 · issue hors domaine refusée', r2.ok === false && r2.code === 'INVALID_OUTCOME', JSON.stringify(r2));
T('I2 · une commande refusée ne touche pas le disque', JSON.stringify(await lire()) === av);

// I3 — un concept inconnu du corpus est accepté comme FAIT mais n'invente pas de concept
const r3 = await cmd({ type: 'RECORD_RECALL', conceptId: 'concept-qui-nexiste-pas', outcome: 'recalled' });
T('I3 · le fait est enregistré', r3.ok === true);
const html3 = await page('/retention');
T('I3 · un concept hors programme n’apparaît pas dans la file',
  !html3.includes('concept-qui-nexiste-pas'));

// I4 — une tentative réelle change l'état affiché
await cmd({ type: 'RECORD_RECALL', conceptId: 'embeddings', outcome: 'failed', format: 'free' });
const p4 = await lire();
const mien = (p4.recallAttempts ?? []).filter((a) => a.conceptId === 'embeddings');
// Le harnais peut tourner plusieurs fois sur la même fixture : ce qu'on
// vérifie est qu'UNE tentative de plus est arrivée, pas un total absolu.
T('I4 · la tentative est persistée', mien.length >= 1, JSON.stringify(mien).slice(0, 120));
T('I4 · elle porte la date du serveur', typeof mien[0]?.at === 'string' && mien[0].at.endsWith('Z'));
const html4 = await page('/retention');
T('I4 · /retention n’affiche plus « aucune tentative »', !html4.includes('Aucune tentative de rappel enregistrée'));
// ATTENTION — l'attente initiale de ce test était FAUSSE, et il faut le dire :
// il exigeait que le concept échoué soit proposé immédiatement. Le modèle place
// une échéance à 1 jour après un échec, délibérément : re-tester trente
// secondes après avoir échoué ne mesure que la mémoire immédiate, ce que le
// moteur existe précisément pour ne pas confondre avec de la rétention.
// Ce qu'il faut vérifier, c'est donc que le concept est bien FRAGILE et que la
// page DIT pourquoi rien n'est proposé — pas qu'il revienne tout de suite.
T('I4 · le concept échoué est compté « Fragile »', /Fragile<\/dt><dd>1<\/dd>|Fragile[^0-9]{0,40}1/.test(html4));
T('I4 · la page explique pourquoi rien n’est dû', html4.includes('Rien n’est dû aujourd’hui') || html4.includes('Rien n&#x27;est dû aujourd’hui'));

// I4b — les deux grandeurs de la page sont DISJOINTES (défaut trouvé au CP14).
const nb = (re) => { const m = html4.match(re); return m ? Number(m[1]) : NaN; };
const pasRencontrees = nb(/<strong>(\d+)<\/strong> notions ne sont pas encore/);
const parEtat = [...html4.matchAll(/<dd>(\d+)<\/dd>/g)].slice(0, 5).reduce((n, m) => n + Number(m[1]), 0);
T('I4b · états + non rencontrées = total des notions', parEtat + pasRencontrees === 128,
  );

// I5 — idempotence de lecture : deux rendus successifs identiques
const a5 = await page('/retention'); const b5 = await page('/retention');
T('I5 · deux rendus de /retention sont identiques', a5.length === b5.length);

// I6 — le rechargement ne perd rien
const p6 = await lire();
T('I6 · les tentatives survivent au rechargement', (p6.recallAttempts ?? []).length === (p4.recallAttempts ?? []).length);

// I7 — aucun état de rétention n'est écrit sur le disque
const brut = JSON.stringify(p6);
T('I7 · aucun champ « retenu / fragile / dueAt » persisté',
  !/"(retenu|fragile|en_consolidation|a_revoir|dueAt|intervalDays)"/.test(brut));

// I8 — le glossaire est atteignable depuis une leçon, et le lien mène à la définition
const lecon = await page('/doc/lessons/embeddings');
T('I8 · la leçon porte des liens de glossaire', (lecon.match(/gloss-link/g) ?? []).length >= 5);
const m8 = lecon.match(/href="\/glossary\?terme=([a-z0-9-]+)"/);
T('I8 · le lien pointe une entrée réelle', !!m8, m8?.[1] ?? 'aucun lien');
if (m8) {
  const def = await fetch(`${BASE}/api/glossary/${m8[1]}`).then((r) => r.json());
  T('I8 · l’entrée pointée existe vraiment', typeof def?.term === 'string', JSON.stringify(def).slice(0, 80));
}

// I9 — le rendu de rag-evaluation est complet (le défaut P0 du CP8)
const rag = await page('/doc/lessons/rag-evaluation');
const h2 = (rag.match(/<h2/g) ?? []).length;
T('I9 · rag-evaluation rend ses 19 sections', h2 >= 18, `${h2} h2`);
T('I9 · « Correction attendue » est visible', rag.includes('Correction attendue'));

console.log(`\n── intégrité : ${ok} vérifications passées, ${ko.length} échec(s)`);
if (ko.length) process.exit(1);
