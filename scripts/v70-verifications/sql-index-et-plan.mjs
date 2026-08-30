/**
 * V70 — vérification exécutée des chiffres publiés dans
 * curriculum/lessons/sql-performance-indexing.md (exemple guidé et correction).
 *
 * Une vraie base SQLite en mémoire, 200 000 lignes. On mesure, pour la même
 * requête : le plan d'exécution et la durée, sans index puis avec ; puis les
 * trois cas où un index existe mais ne sert à rien.
 *
 * node:sqlite est expérimental ; l'exécution affiche un avertissement Node
 * que l'on ne masque pas.
 *
 * Exécution : node scripts/v70-verifications/sql-index-et-plan.mjs
 */
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec(`CREATE TABLE commandes (
  id INTEGER PRIMARY KEY,
  client_id INTEGER NOT NULL,
  statut TEXT NOT NULL,
  email TEXT NOT NULL,
  montant REAL NOT NULL,
  creee_le TEXT NOT NULL
)`);

const N = 200_000;
const STATUTS = ['payee', 'en_attente', 'annulee', 'remboursee'];
db.exec('BEGIN');
const ins = db.prepare(
  'INSERT INTO commandes (client_id, statut, email, montant, creee_le) VALUES (?, ?, ?, ?, ?)',
);
for (let i = 0; i < N; i++) {
  ins.run(
    (i % 20_000) + 1,
    STATUTS[i % 4],
    `Client${i % 20_000}@Exemple.fr`,
    Math.round(Math.random() * 50_000) / 100,
    `2026-0${(i % 9) + 1}-15`,
  );
}
db.exec('COMMIT');
db.exec('ANALYZE');

const plan = (sql, p = []) =>
  db.prepare('EXPLAIN QUERY PLAN ' + sql).all(...p).map((r) => r.detail).join(' | ');

const chrono = (sql, p = [], tours = 30) => {
  const st = db.prepare(sql);
  st.all(...p);                                  // chauffe
  const t = process.hrtime.bigint();
  for (let i = 0; i < tours; i++) st.all(...p);
  return +(Number(process.hrtime.bigint() - t) / 1e6 / tours).toFixed(3);
};

const REQ = 'SELECT id, montant FROM commandes WHERE client_id = ? AND statut = ?';
const P = [12345, 'payee'];

console.log(`Table : ${N.toLocaleString('fr-FR')} lignes\n`);
console.log('=== 1. sans index ===');
console.log('plan  :', plan(REQ, P));
const sans = chrono(REQ, P);
console.log('durée :', sans, 'ms par requête\n');

db.exec('CREATE INDEX idx_cmd_client_statut ON commandes(client_id, statut)');
db.exec('ANALYZE');
console.log('=== 2. avec index (client_id, statut) ===');
console.log('plan  :', plan(REQ, P));
const avec = chrono(REQ, P);
console.log('durée :', avec, 'ms par requête');
console.log('rapport :', Math.round(sans / avec), 'fois plus rapide\n');

console.log('=== 3. trois requêtes où l\'index ne sert à rien ===');
const CAS = [
  ['fonction appliquée à la colonne',
   "SELECT id FROM commandes WHERE lower(email) = ?", ['client1@exemple.fr']],
  ['motif ouvert à gauche',
   "SELECT id FROM commandes WHERE email LIKE ?", ['%@Exemple.fr']],
  ['deuxième colonne de l\'index seule',
   'SELECT id FROM commandes WHERE statut = ?', ['payee']],
];
for (const [nom, sql, p] of CAS) {
  console.log(`- ${nom}\n    plan  : ${plan(sql, p)}\n    durée : ${chrono(sql, p, 10)} ms`);
}

console.log('\n=== 4. le même LIKE, ancré à gauche ===');
db.exec('CREATE INDEX idx_cmd_email ON commandes(email)');
db.exec('ANALYZE');
for (const [nom, sql, p] of [
  ['LIKE ancré  (Client1%)', "SELECT id FROM commandes WHERE email LIKE ?", ['Client1%']],
  ['LIKE ouvert (%Exemple)', "SELECT id FROM commandes WHERE email LIKE ?", ['%Exemple%']],
]) {
  console.log(`- ${nom}\n    plan  : ${plan(sql, p)}\n    durée : ${chrono(sql, p, 10)} ms`);
}

console.log('\n=== 5. coût en écriture ===');
const insTest = db.prepare('INSERT INTO commandes (client_id, statut, email, montant, creee_le) VALUES (?,?,?,?,?)');
const mesurerInsert = () => {
  const t = process.hrtime.bigint();
  db.exec('BEGIN');
  for (let i = 0; i < 20_000; i++) insTest.run(1, 'payee', 'x@y.fr', 1, '2026-01-01');
  db.exec('COMMIT');
  return +(Number(process.hrtime.bigint() - t) / 1e6).toFixed(0);
};
const avecIdx = mesurerInsert();
db.exec('DROP INDEX idx_cmd_client_statut');
db.exec('DROP INDEX idx_cmd_email');
const sansIdx = mesurerInsert();
console.log('20 000 insertions avec 2 index :', avecIdx, 'ms');
console.log('20 000 insertions sans index  :', sansIdx, 'ms');
console.log('surcoût :', (avecIdx / sansIdx).toFixed(2), 'fois');
