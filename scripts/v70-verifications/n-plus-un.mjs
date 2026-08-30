/**
 * V70 — vérification exécutée des chiffres publiés dans
 * curriculum/lessons/caching-performance.md (exemple guidé).
 *
 * Le même écran « 50 dernières commandes avec le nom du client », rendu de
 * quatre façons, sur une base de 200 000 commandes et 20 000 clients :
 *   1. N+1        — une requête pour la liste, une par ligne
 *   2. N+1 « caché » avec un cache mémoire
 *   3. lot        — une requête pour la liste, UNE pour tous les clients
 *   4. jointure   — une seule requête
 *
 * On compte les requêtes ET on chronomètre, parce que les deux ne disent
 * pas la même chose : ici la base est locale, donc chaque requête coûte
 * quelques microsecondes. Sur une base distante à 1 ms de latence réseau,
 * le nombre de requêtes EST le temps ; c'est calculé et publié aussi.
 *
 * Exécution : node scripts/v70-verifications/n-plus-un.mjs
 */
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec(`CREATE TABLE clients (id INTEGER PRIMARY KEY, nom TEXT NOT NULL);
         CREATE TABLE commandes (id INTEGER PRIMARY KEY, client_id INTEGER NOT NULL,
                                 montant REAL NOT NULL, creee_le TEXT NOT NULL)`);
db.exec('BEGIN');
const insC = db.prepare('INSERT INTO clients (id, nom) VALUES (?, ?)');
for (let i = 1; i <= 20_000; i++) insC.run(i, `Client ${i}`);
const insCo = db.prepare('INSERT INTO commandes (client_id, montant, creee_le) VALUES (?,?,?)');
for (let i = 0; i < 200_000; i++) insCo.run((i % 20_000) + 1, (i % 500) + 1, `2026-01-${(i % 28) + 1}`);
db.exec('COMMIT');
db.exec('CREATE INDEX idx_cmd_date ON commandes(creee_le DESC)');
db.exec('ANALYZE');

let requetes = 0;
const q = (sql, p = []) => { requetes++; return db.prepare(sql).all(...p); };

const LISTE = 'SELECT id, client_id, montant FROM commandes ORDER BY creee_le DESC LIMIT 50';
const chrono = (f) => { const t = process.hrtime.bigint(); const r = f(); return [r, +(Number(process.hrtime.bigint() - t) / 1e6).toFixed(3)]; };

const strategies = {
  '1. N+1': () => {
    const lignes = q(LISTE);
    return lignes.map((l) => ({ ...l, nom: q('SELECT nom FROM clients WHERE id = ?', [l.client_id])[0].nom }));
  },
  '2. N+1 + cache mémoire': () => {
    const cache = new Map();
    const lignes = q(LISTE);
    return lignes.map((l) => {
      if (!cache.has(l.client_id)) cache.set(l.client_id, q('SELECT nom FROM clients WHERE id = ?', [l.client_id])[0].nom);
      return { ...l, nom: cache.get(l.client_id) };
    });
  },
  '3. lot (une requête IN)': () => {
    const lignes = q(LISTE);
    const ids = [...new Set(lignes.map((l) => l.client_id))];
    const noms = new Map(
      q(`SELECT id, nom FROM clients WHERE id IN (${ids.map(() => '?').join(',')})`, ids).map((c) => [c.id, c.nom]),
    );
    return lignes.map((l) => ({ ...l, nom: noms.get(l.client_id) }));
  },
  '4. jointure': () =>
    q(`SELECT co.id, co.montant, cl.nom FROM commandes co
       JOIN clients cl ON cl.id = co.client_id
       ORDER BY co.creee_le DESC LIMIT 50`),
};

console.log('200 000 commandes, 20 000 clients — écran « 50 dernières commandes »\n');
console.log('stratégie                | requêtes | durée locale | durée estimée si 1 ms de latence');
console.log('-------------------------|----------|--------------|---------------------------------');
for (const [nom, f] of Object.entries(strategies)) {
  requetes = 0;
  f();                                        // chauffe
  requetes = 0;
  const [res, ms] = chrono(f);
  const distant = (ms + requetes * 1).toFixed(1);
  console.log(
    `${nom.padEnd(24)} | ${String(requetes).padStart(8)} | ${String(ms).padStart(9)} ms | ${String(distant).padStart(8)} ms   (${res.length} lignes)`,
  );
}
