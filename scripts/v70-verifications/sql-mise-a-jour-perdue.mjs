/**
 * V70 — vérification exécutée des chiffres publiés dans
 * curriculum/lessons/database-transactions-concurrency.md (exemple guidé).
 *
 * Deux connexions sur la même base, entrelacées à la main, sur un solde
 * initial de 100 :
 *   A. lire-modifier-écrire sans transaction     → mise à jour perdue ?
 *   B. UPDATE atomique (solde = solde - 30)      → ?
 *   C. lire-modifier-écrire dans BEGIN IMMEDIATE → ?
 *   D. verrouillage optimiste par version        → ?
 *
 * node:sqlite est expérimental ; l'avertissement de Node n'est pas masqué.
 * Limite déclarée : SQLite sérialise les écritures au niveau du fichier ;
 * les MÉCANISMES démontrés (perte de mise à jour, écriture atomique,
 * transaction, version) sont les mêmes sur PostgreSQL ou MySQL, les modes
 * d'isolation et les erreurs renvoyées diffèrent.
 *
 * Exécution : node scripts/v70-verifications/sql-mise-a-jour-perdue.mjs
 */
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const dossier = mkdtempSync(path.join(tmpdir(), 'v70-sql-'));
const fichier = path.join(dossier, 'banque.db');

const neuf = () => {
  const d = new DatabaseSync(fichier);
  d.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 2000;');
  return d;
};

function reinitialiser() {
  const d = neuf();
  d.exec('DROP TABLE IF EXISTS comptes');
  d.exec('CREATE TABLE comptes (id INTEGER PRIMARY KEY, solde INTEGER, version INTEGER DEFAULT 1)');
  d.prepare('INSERT INTO comptes (id, solde) VALUES (1, 100)').run();
  d.close();
}
const solde = () => { const d = neuf(); const s = d.prepare('SELECT solde FROM comptes WHERE id = 1').get().solde; d.close(); return s; };

// ---------- A. lire-modifier-écrire, sans transaction ----------
reinitialiser();
{
  const a = neuf(), b = neuf();
  const lireA = a.prepare('SELECT solde FROM comptes WHERE id = 1').get().solde;   // A lit 100
  const lireB = b.prepare('SELECT solde FROM comptes WHERE id = 1').get().solde;   // B lit 100
  a.prepare('UPDATE comptes SET solde = ? WHERE id = 1').run(lireA - 30);          // A écrit 70
  b.prepare('UPDATE comptes SET solde = ? WHERE id = 1').run(lireB - 50);          // B écrit 50
  a.close(); b.close();
  console.log('A. sans transaction   — A retire 30, B retire 50');
  console.log('   attendu : 20   |   obtenu :', solde(), solde() === 20 ? '' : '  ← MISE À JOUR PERDUE');
}

// ---------- B. UPDATE atomique ----------
reinitialiser();
{
  const a = neuf(), b = neuf();
  a.prepare('UPDATE comptes SET solde = solde - ? WHERE id = 1').run(30);
  b.prepare('UPDATE comptes SET solde = solde - ? WHERE id = 1').run(50);
  a.close(); b.close();
  console.log('\nB. UPDATE atomique    — solde = solde - ?');
  console.log('   attendu : 20   |   obtenu :', solde());
}

// ---------- C. transaction explicite ----------
reinitialiser();
{
  const a = neuf(), b = neuf();
  a.exec('BEGIN IMMEDIATE');                        // A prend le verrou d'écriture
  const lireA = a.prepare('SELECT solde FROM comptes WHERE id = 1').get().solde;
  let refusB = null;
  try { b.exec('BEGIN IMMEDIATE'); } catch (e) { refusB = e.code || e.message; }
  a.prepare('UPDATE comptes SET solde = ? WHERE id = 1').run(lireA - 30);
  a.exec('COMMIT');
  if (!refusB) {
    const lireB = b.prepare('SELECT solde FROM comptes WHERE id = 1').get().solde;
    b.prepare('UPDATE comptes SET solde = ? WHERE id = 1').run(lireB - 50);
    b.exec('COMMIT');
  } else {
    b.prepare('UPDATE comptes SET solde = solde - ? WHERE id = 1').run(50);   // B rejoue après
  }
  a.close(); b.close();
  console.log('\nC. BEGIN IMMEDIATE    — B pendant que A tient le verrou :', refusB || 'accepté (attente)');
  console.log('   attendu : 20   |   obtenu :', solde());
}

// ---------- D. verrouillage optimiste ----------
reinitialiser();
{
  const a = neuf(), b = neuf();
  const va = a.prepare('SELECT solde, version FROM comptes WHERE id = 1').get();
  const vb = b.prepare('SELECT solde, version FROM comptes WHERE id = 1').get();
  const maj = (d, v, nouveau) =>
    d.prepare('UPDATE comptes SET solde = ?, version = version + 1 WHERE id = 1 AND version = ?')
     .run(nouveau, v).changes;
  const okA = maj(a, va.version, va.solde - 30);
  const okB = maj(b, vb.version, vb.solde - 50);
  console.log('\nD. version optimiste  — lignes modifiées : A =', okA, ', B =', okB);
  console.log('   B doit être refusé (0 ligne) et rejouer sa lecture.');
  if (okB === 0) {
    const frais = b.prepare('SELECT solde, version FROM comptes WHERE id = 1').get();
    maj(b, frais.version, frais.solde - 50);
  }
  a.close(); b.close();
  console.log('   attendu : 20   |   obtenu :', solde());
}

rmSync(dossier, { recursive: true, force: true });
