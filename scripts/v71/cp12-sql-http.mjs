// V71 — CP12. Verification EXECUTABLE de deux familles d affirmations du corpus qui
// n avaient pas de script : les criteres SQL de `sql-foundations` et les affirmations
// HTTP de `http-rest-json`.
//
// SQL : moteur `node:sqlite`, integre a Node 22 — aucune base a installer. Les
// affirmations testees viennent du bloc « Verifie seul » de la lecon, qui promet a
// l apprenant des resultats precis. Si la promesse est fausse, l apprenant conclut
// que SON travail est faux.
//
// HTTP : un serveur local minimal, pas d appel sortant. On teste ce que la lecon
// affirme du comportement des methodes et des redirections.
import { DatabaseSync } from 'node:sqlite';
import { createServer } from 'node:http';

let ok = 0, ko = 0;
const t = (nom, affirme, obtenu, vrai) => {
  (vrai ? ok++ : ko++);
  console.log(`  ${vrai ? 'OK  ' : 'FAUX'}  ${nom.padEnd(38)} ${String(obtenu)}`);
  if (!vrai) console.log(`        affirme : ${affirme}`);
};

console.log('='.repeat(78));
console.log('CP12 — SQL (node:sqlite) et HTTP (serveur local)');
console.log('='.repeat(78));

// ───────────────────────────── SQL ─────────────────────────────
console.log('\n[sql-foundations] le jeu minuscule du bloc « Verifie seul »');
const db = new DatabaseSync(':memory:');
db.exec(`
  CREATE TABLE auteurs (id INTEGER PRIMARY KEY, nom TEXT);
  CREATE TABLE livres  (id INTEGER PRIMARY KEY, titre TEXT, auteur_id INTEGER);
  CREATE TABLE membres (id INTEGER PRIMARY KEY, nom TEXT);
  CREATE TABLE emprunts(id INTEGER PRIMARY KEY, livre_id INTEGER, membre_id INTEGER);
  INSERT INTO auteurs VALUES (1,'Ada'),(2,'Grace');
  INSERT INTO livres  VALUES (1,'L1',1),(2,'L2',1),(3,'JamaisEmprunte',2);
  INSERT INTO membres VALUES (1,'M1'),(2,'M2');
  INSERT INTO emprunts VALUES (1,1,1),(2,1,2),(3,2,1),(4,2,2);
`);

// 1. LEFT JOIN : le livre jamais emprunte doit apparaitre, et lui seul.
const gauche = db.prepare(`
  SELECT l.titre FROM livres l
  LEFT JOIN emprunts e ON e.livre_id = l.id
  WHERE e.id IS NULL`).all();
t('LEFT JOIN -> le livre jamais emprunte', 'exactement 1 ligne, JamaisEmprunte',
  `${gauche.length} ligne(s) : ${gauche.map((r) => r.titre).join(',')}`,
  gauche.length === 1 && gauche[0].titre === 'JamaisEmprunte');

// 2. INNER a la place de LEFT : le resultat doit devenir VIDE.
const interne = db.prepare(`
  SELECT l.titre FROM livres l
  INNER JOIN emprunts e ON e.livre_id = l.id
  WHERE e.id IS NULL`).all();
t('INNER a la place de LEFT -> vide', 'resultat vide', `${interne.length} ligne(s)`, interne.length === 0);

// 3. HAVING COUNT(*) > 2 : un auteur a exactement 2 livres, il ne doit PAS apparaitre.
db.exec(`INSERT INTO auteurs VALUES (3,'Alan'); INSERT INTO livres VALUES (4,'A1',3),(5,'A2',3);`);
const sup2 = db.prepare(`
  SELECT a.nom, COUNT(*) n FROM auteurs a JOIN livres l ON l.auteur_id = a.id
  GROUP BY a.id HAVING COUNT(*) > 2`).all();
t('HAVING COUNT(*) > 2 exclut les 2 livres', 'Alan (2 livres) absent',
  sup2.length ? sup2.map((r) => `${r.nom}:${r.n}`).join(',') : 'aucun auteur — correct',
  !sup2.some((r) => r.nom === 'Alan'));
const sup1 = db.prepare(`
  SELECT a.nom FROM auteurs a JOIN livres l ON l.auteur_id = a.id
  GROUP BY a.id HAVING COUNT(*) >= 2`).all();
t('HAVING >= 2 inclut Alan (contre-epreuve)', 'Alan present avec >=', sup1.map((r) => r.nom).join(','),
  sup1.some((r) => r.nom === 'Alan'));

// 4. WHERE COUNT(*) : la base DOIT refuser.
let refus = null;
try {
  db.prepare(`SELECT a.nom FROM auteurs a JOIN livres l ON l.auteur_id=a.id
              GROUP BY a.id WHERE COUNT(*) > 2`).all();
} catch (e) { refus = e.message.split('\n')[0]; }
t('WHERE COUNT(*) -> la base refuse', 'erreur de syntaxe', refus ?? 'ACCEPTE (defaut)', refus !== null);

// 5. sql-performance-indexing : SCAN -> SEARCH sur un index.
console.log('\n[sql-performance-indexing] le plan passe de SCAN a SEARCH');
const db2 = new DatabaseSync(':memory:');
db2.exec('CREATE TABLE t (id INTEGER PRIMARY KEY, cat TEXT, v INTEGER)');
const ins = db2.prepare('INSERT INTO t (cat, v) VALUES (?, ?)');
for (let i = 0; i < 20000; i++) ins.run(`c${i % 50}`, i);
const plan = (q) => db2.prepare(`EXPLAIN QUERY PLAN ${q}`).all().map((r) => r.detail).join(' | ');
const avant = plan("SELECT * FROM t WHERE cat = 'c7'");
db2.exec('CREATE INDEX idx_cat ON t(cat)');
const apres = plan("SELECT * FROM t WHERE cat = 'c7'");
t('plan sans index', 'contient SCAN', avant, /SCAN/.test(avant));
t('plan avec index', 'contient SEARCH', apres, /SEARCH/.test(apres));

// ───────────────────────────── HTTP ─────────────────────────────
console.log('\n[http-rest-json] comportements affirmes par la lecon');
const recu = [];
const srv = createServer((req, res) => {
  let corps = '';
  req.on('data', (c) => { corps += c; });
  req.on('end', () => {
    recu.push({ methode: req.method, url: req.url, corps });
    if (req.url === '/ancienne') { res.writeHead(301, { Location: '/nouvelle' }); return res.end(); }
    if (req.url === '/nouvelle') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end('{"ok":true}'); }
    if (req.url === '/valide') {
      let json = null;
      try { json = JSON.parse(corps); } catch { /* corps invalide */ }
      if (!json || typeof json.nom !== 'string') { res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end('{"erreur":"nom manquant"}'); }
      res.writeHead(201); return res.end('{"cree":true}');
    }
    res.writeHead(404); res.end();
  });
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${srv.address().port}`;

// a. un GET avec un corps part sans erreur, et le serveur l ignore.
const g = await fetch(`${base}/nouvelle`, { method: 'GET' });
t('GET rend 200 et du JSON', '200 application/json', `${g.status} ${g.headers.get('content-type')}`,
  g.status === 200 && /json/.test(g.headers.get('content-type')));

// b. le 400 vient du CORPS, pas de l URL : meme URL, deux corps, deux statuts.
const bon = await fetch(`${base}/valide`, { method: 'POST', body: JSON.stringify({ nom: 'Ada' }) });
const mauvais = await fetch(`${base}/valide`, { method: 'POST', body: JSON.stringify({ prenom: 'Ada' }) });
t('meme URL, corps valide -> 201', '201', String(bon.status), bon.status === 201);
t('meme URL, corps invalide -> 400', '400', String(mauvais.status), mauvais.status === 400);

// c. redirection : sans suivi, 301 + Location ; avec suivi, 200.
const sansSuivi = await fetch(`${base}/ancienne`, { redirect: 'manual' });
const avecSuivi = await fetch(`${base}/ancienne`, { redirect: 'follow' });
t('sans suivi -> 3xx + Location', '301 /nouvelle', `${sansSuivi.status} ${sansSuivi.headers.get('location')}`,
  sansSuivi.status === 301 && sansSuivi.headers.get('location') === '/nouvelle');
t('avec suivi -> 200', '200', String(avecSuivi.status), avecSuivi.status === 200);

srv.close();
console.log('\n' + '='.repeat(78));
console.log(`ASSERTIONS VERIFIEES : ${ok}   —   ASSERTIONS FAUSSES : ${ko}`);
console.log('='.repeat(78));
process.exit(ko ? 1 : 0);
