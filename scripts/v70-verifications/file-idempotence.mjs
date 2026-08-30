/**
 * V70 — vérification exécutée des chiffres publiés dans
 * curriculum/lessons/async-messaging-queues.md (exemple guidé).
 *
 * Une file en mémoire à livraison « au moins une fois », un consommateur qui
 * tombe entre l'effet et l'accusé de réception, et une base SQLite qui garde
 * le solde. Quatre variantes :
 *   A. consommateur non idempotent          → combien de fois le client est-il débité ?
 *   B. consommateur idempotent (table des messages traités)
 *   C. idempotent mais effet et marquage HORS transaction, panne entre les deux
 *   D. idempotent, effet et marquage DANS la même transaction
 * Plus : un message toujours en échec, avec et sans file d'attente d'échecs.
 *
 * Exécution : node scripts/v70-verifications/file-idempotence.mjs
 */
import { DatabaseSync } from 'node:sqlite';

const nouvelleBase = () => {
  const d = new DatabaseSync(':memory:');
  d.exec(`CREATE TABLE comptes (id INTEGER PRIMARY KEY, solde INTEGER);
          CREATE TABLE traites (message_id TEXT PRIMARY KEY);
          INSERT INTO comptes VALUES (1, 100);`);
  return d;
};
const solde = (d) => d.prepare('SELECT solde FROM comptes WHERE id = 1').get().solde;

/** File à livraison « au moins une fois » : tant qu'un message n'est pas
 *  acquitté, il est re-livré. */
function file(messages) {
  const enAttente = [...messages];
  const echecs = new Map();
  return {
    reste: () => enAttente.length,
    consommer(traiter, { maxTentatives = 5 } = {}) {
      const dlq = [];
      let livraisons = 0;
      while (enAttente.length) {
        const m = enAttente[0];
        livraisons++;
        let acquitte = false;
        try {
          traiter(m);
          acquitte = true;
        } catch (e) {
          if (e.message !== 'PANNE') {
            const n = (echecs.get(m.id) || 0) + 1;
            echecs.set(m.id, n);
            if (n >= maxTentatives) { enAttente.shift(); dlq.push({ ...m, tentatives: n }); continue; }
          }
          // panne ou erreur : PAS d'accusé → le message est re-livré
        }
        if (acquitte) enAttente.shift();
      }
      return { livraisons, dlq };
    },
  };
}

const MESSAGES = [{ id: 'p-42', montant: 30 }];

function scenario(nom, { idempotent, transaction, pannesRestantes }) {
  const db = nouvelleBase();
  let pannes = pannesRestantes;
  const dejaTraite = (id) => !!db.prepare('SELECT 1 FROM traites WHERE message_id = ?').get(id);

  const r = file(MESSAGES).consommer((m) => {
    if (idempotent && dejaTraite(m.id)) return;              // rien à refaire
    if (transaction) {
      db.exec('BEGIN');
      db.prepare('UPDATE comptes SET solde = solde - ? WHERE id = 1').run(m.montant);
      db.prepare('INSERT INTO traites VALUES (?)').run(m.id);
      if (pannes-- > 0) { db.exec('ROLLBACK'); throw new Error('PANNE'); }
      db.exec('COMMIT');
    } else {
      db.prepare('UPDATE comptes SET solde = solde - ? WHERE id = 1').run(m.montant);  // l'effet
      if (pannes-- > 0) throw new Error('PANNE');                                       // la panne
      if (idempotent) db.prepare('INSERT INTO traites VALUES (?)').run(m.id);           // le marquage
    }
  });

  console.log(
    `${nom.padEnd(52)} livraisons=${r.livraisons}  solde=${String(solde(db)).padStart(4)}` +
      `  ${solde(db) === 70 ? '' : '← DÉBIT MULTIPLE'}`,
  );
  db.close();
}

console.log('Solde initial 100, un paiement de 30 → attendu 70, quel que soit le nombre de re-livraisons\n');
scenario('A. non idempotent, 2 pannes après l\'effet', { idempotent: false, transaction: false, pannesRestantes: 2 });
scenario('B. idempotent, aucune panne', { idempotent: true, transaction: false, pannesRestantes: 0 });
scenario('C. idempotent, panne ENTRE l\'effet et le marquage', { idempotent: true, transaction: false, pannesRestantes: 1 });
scenario('D. idempotent, effet + marquage dans UNE transaction', { idempotent: true, transaction: true, pannesRestantes: 1 });

console.log('\n--- message toujours en échec (donnée corrompue) ---');
const db = nouvelleBase();
const f = file([{ id: 'p-99', montant: 10 }, { id: 'p-100', montant: 20 }]);
const r = f.consommer((m) => {
  if (m.id === 'p-99') throw new Error('donnée corrompue');
  db.prepare('UPDATE comptes SET solde = solde - ? WHERE id = 1').run(m.montant);
}, { maxTentatives: 5 });
console.log(`livraisons=${r.livraisons}  file d'attente d'échecs=${JSON.stringify(r.dlq)}  solde=${solde(db)}`);
console.log("→ le message sain p-100 a bien été traité : le poison n'a pas bloqué la file.");
