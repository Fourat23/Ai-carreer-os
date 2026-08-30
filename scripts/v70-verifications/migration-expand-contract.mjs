/**
 * V70 — vérification exécutée des affirmations publiées dans
 * curriculum/lessons/database-migrations.md (exemple guidé).
 *
 * On simule ce que personne ne simule : l'ANCIEN code encore en ligne
 * pendant qu'on migre. À chaque étape, on exécute les requêtes de l'ancienne
 * ET de la nouvelle version, et on note laquelle échoue.
 *
 * Deux séquences comparées :
 *   A. la migration brutale : un seul RENAME
 *   B. expand / backfill / contract, en quatre étapes
 *
 * Exécution : node scripts/v70-verifications/migration-expand-contract.mjs
 */
import { DatabaseSync } from 'node:sqlite';

const baseInitiale = () => {
  const d = new DatabaseSync(':memory:');
  d.exec('CREATE TABLE clients (id INTEGER PRIMARY KEY, nom TEXT NOT NULL)');
  const ins = d.prepare('INSERT INTO clients (nom) VALUES (?)');
  for (let i = 1; i <= 5; i++) ins.run(`Client ${i}`);
  return d;
};

/** Les deux versions du code applicatif, telles qu'elles tournent en prod. */
const ANCIEN = {
  lire: (d) => d.prepare('SELECT nom FROM clients WHERE id = 1').get(),
  ecrire: (d) => d.prepare('INSERT INTO clients (nom) VALUES (?)').run('Nouveau via ancien'),
};
const NOUVEAU = {
  lire: (d) => d.prepare('SELECT nom_complet FROM clients WHERE id = 1').get(),
  ecrire: (d) => d.prepare('INSERT INTO clients (nom_complet) VALUES (?)').run('Nouveau via nouveau'),
};

const essayer = (f, d) => { try { f(d); return 'OK'; } catch (e) { return 'ÉCHEC — ' + (e.message.split('\n')[0]); } };

function etat(nom, d) {
  console.log(
    `  ${nom.padEnd(38)} ancien.lire=${essayer(ANCIEN.lire, d).padEnd(34)} ` +
    `ancien.ecrire=${essayer(ANCIEN.ecrire, d).padEnd(34)} nouveau.lire=${essayer(NOUVEAU.lire, d)}`,
  );
}

console.log('=== A. migration brutale : un seul RENAME ===');
{
  const d = baseInitiale();
  etat('avant', d);
  d.exec('ALTER TABLE clients RENAME COLUMN nom TO nom_complet');
  etat('après le RENAME', d);
  d.close();
}

console.log('\n=== B. expand / backfill / contract ===');
{
  const d = baseInitiale();
  etat('0. avant', d);

  d.exec('ALTER TABLE clients ADD COLUMN nom_complet TEXT');
  etat('1. expand (ADD COLUMN)', d);

  d.exec('UPDATE clients SET nom_complet = nom WHERE nom_complet IS NULL');
  etat('2. backfill', d);

  // ici : déploiement du code qui écrit les DEUX colonnes et lit nom_complet
  console.log('  3. déploiement du nouveau code (écrit nom ET nom_complet)');

  d.exec('ALTER TABLE clients DROP COLUMN nom');
  etat('4. contract (DROP COLUMN)', d);
  console.log('     ← attendu : l\'ancien code casse ICI, et seulement ici,');
  console.log('       après avoir été retiré de la production.');
  d.close();
}

console.log('\n=== C. le backfill sur une grosse table : un seul UPDATE ou par lots ? ===');
{
  const d = new DatabaseSync(':memory:');
  d.exec('CREATE TABLE gros (id INTEGER PRIMARY KEY, a TEXT, b TEXT)');
  d.exec('BEGIN');
  const ins = d.prepare('INSERT INTO gros (a) VALUES (?)');
  for (let i = 0; i < 500_000; i++) ins.run(`valeur ${i}`);
  d.exec('COMMIT');

  const chrono = (f) => { const t = process.hrtime.bigint(); f(); return Math.round(Number(process.hrtime.bigint() - t) / 1e6); };

  const enUnCoup = chrono(() => d.exec('UPDATE gros SET b = a'));
  d.exec('UPDATE gros SET b = NULL');
  const parLots = chrono(() => {
    let n;
    do {
      n = d.prepare('UPDATE gros SET b = a WHERE id IN (SELECT id FROM gros WHERE b IS NULL LIMIT 10000)').run().changes;
    } while (n > 0);
  });
  console.log(`  500 000 lignes — un seul UPDATE : ${enUnCoup} ms (une transaction, verrou tenu tout du long)`);
  console.log(`  500 000 lignes — par lots de 10 000 : ${parLots} ms (50 transactions courtes)`);
  console.log('  → le total est plus lent, mais aucune transaction ne dure plus de quelques dizaines de ms.');
  d.close();
}
