/**
 * V70 — vérification exécutée des chiffres publiés dans
 * curriculum/lessons/etl-pipelines.md (exemple guidé et correction).
 *
 * Le même pipeline extract/transform/load, joué deux fois, en quatre
 * variantes :
 *   A. INSERT simple, deux exécutions        → doublons ?
 *   B. UPSERT sur clé naturelle, deux exéc.  → doublons ?
 *   C. chargement interrompu au milieu, SANS transaction → état de la base ?
 *   D. le même, DANS une transaction         → état de la base ?
 *
 * Exécution : node scripts/v70-verifications/etl-idempotence.mjs
 */
import { DatabaseSync } from 'node:sqlite';

const SOURCE = Array.from({ length: 1000 }, (_, i) => ({
  reference: `CMD-${1000 + i}`,
  client: `client${i % 50}@exemple.fr`,
  montant: (i % 300) + 10,
}));

const base = (cleNaturelle) => {
  const d = new DatabaseSync(':memory:');
  d.exec(`CREATE TABLE commandes (
            reference TEXT ${cleNaturelle ? 'PRIMARY KEY' : ''},
            client TEXT NOT NULL,
            montant INTEGER NOT NULL)`);
  return d;
};
const compter = (d) => d.prepare('SELECT COUNT(*) n, SUM(montant) s FROM commandes').get();

function charger(d, lignes, { upsert, transaction, casserApres = null }) {
  const sql = upsert
    ? `INSERT INTO commandes (reference, client, montant) VALUES (?,?,?)
       ON CONFLICT(reference) DO UPDATE SET client = excluded.client, montant = excluded.montant`
    : 'INSERT INTO commandes (reference, client, montant) VALUES (?,?,?)';
  const st = d.prepare(sql);
  if (transaction) d.exec('BEGIN');
  try {
    lignes.forEach((l, i) => {
      if (casserApres !== null && i === casserApres) throw new Error('PANNE au milieu du chargement');
      st.run(l.reference, l.client, l.montant);
    });
    if (transaction) d.exec('COMMIT');
  } catch (e) {
    if (transaction) d.exec('ROLLBACK');
    return e.message;
  }
  return null;
}

console.log(`Source : ${SOURCE.length} lignes, somme des montants = ${SOURCE.reduce((a, l) => a + l.montant, 0)}\n`);

// A
{
  const d = base(false);
  charger(d, SOURCE, { upsert: false, transaction: true });
  const un = compter(d);
  charger(d, SOURCE, { upsert: false, transaction: true });
  const deux = compter(d);
  console.log('A. INSERT simple');
  console.log(`   après 1 exécution : ${un.n} lignes, somme ${un.s}`);
  console.log(`   après 2 exécutions: ${deux.n} lignes, somme ${deux.s}  ${deux.n === un.n ? '' : '← DOUBLONS'}`);
  d.close();
}

// B
{
  const d = base(true);
  charger(d, SOURCE, { upsert: true, transaction: true });
  const un = compter(d);
  charger(d, SOURCE, { upsert: true, transaction: true });
  const deux = compter(d);
  console.log('\nB. UPSERT sur la référence (clé naturelle)');
  console.log(`   après 1 exécution : ${un.n} lignes, somme ${un.s}`);
  console.log(`   après 2 exécutions: ${deux.n} lignes, somme ${deux.s}  ${deux.n === un.n ? '← identique, le pipeline est rejouable' : '← DOUBLONS'}`);
  d.close();
}

// C / D
for (const [nom, transaction] of [['C. interruption SANS transaction', false], ['D. interruption AVEC transaction', true]]) {
  const d = base(true);
  const err = charger(d, SOURCE, { upsert: true, transaction, casserApres: 617 });
  const etat = compter(d);
  console.log(`\n${nom}`);
  console.log(`   erreur : ${err}`);
  console.log(`   base après la panne : ${etat.n} lignes, somme ${etat.s ?? 0}` +
    (etat.n === 0 ? '   ← rien à moitié écrit' : '   ← ÉTAT PARTIEL'));
  if (etat.n > 0 && etat.n < SOURCE.length) {
    // que se passe-t-il si on relance ?
    charger(d, SOURCE, { upsert: true, transaction: true });
    const apres = compter(d);
    console.log(`   après relance : ${apres.n} lignes, somme ${apres.s}` +
      (apres.n === SOURCE.length ? '   ← rattrapé grâce à l\'UPSERT' : ''));
  }
  d.close();
}
