// V70 — vérification exécutée pour release-incident-recovery et
// deployment-strategies.
// Question : « on a un bouton rollback, donc on est couvert. » On mesure ce
// que le retour arrière rend réellement, et ce qu'il ne rend pas.
import { DatabaseSync } from 'node:sqlite';

const ligne = (t) => console.log('\n== ' + t + ' ==');
const db = new DatabaseSync(':memory:');

// ── état initial : schéma v1, code v1, données en production ─────────────
db.exec(`CREATE TABLE commande (
  id INTEGER PRIMARY KEY, client TEXT NOT NULL, total_cents INTEGER NOT NULL)`);
const insV1 = (c, t) =>
  db.prepare('INSERT INTO commande(client,total_cents) VALUES(?,?)').run(c, t);
for (let i = 0; i < 100; i++) insV1('client-' + i, 1000 + i);
const compte = () => db.prepare('SELECT count(*) n FROM commande').get().n;
console.log('état initial : ' + compte() + ' commandes, schéma v1');

// ── déploiement : migration + code v2 en même temps ─────────────────────
ligne('1. La migration part AVANT que tout le code v1 soit remplacé');
db.exec(`ALTER TABLE commande ADD COLUMN devise TEXT NOT NULL DEFAULT ''`);
console.log('   colonne devise ajoutée (NOT NULL, sans valeur métier)');
try {
  insV1('client-retardataire', 2000);           // une instance v1 encore vivante
  const d = db.prepare('SELECT devise FROM commande WHERE client=?')
              .get('client-retardataire').devise;
  console.log(`   une instance v1 écrit encore : ACCEPTÉ, devise = ${JSON.stringify(d)}`);
  console.log('   -> pas de plantage, mais une ligne sans devise entre en base.');
  console.log('      Le défaut est silencieux : il se verra à la facturation.');
} catch (e) { console.log('   une instance v1 écrit encore : REFUSÉ — ' + e.message); }

ligne('2. Le code v2 tourne et écrit dans la nouvelle colonne');
const insV2 = (c, t, d) =>
  db.prepare('INSERT INTO commande(client,total_cents,devise) VALUES(?,?,?)').run(c, t, d);
for (let i = 0; i < 50; i++) insV2('v2-client-' + i, 5000 + i, i % 2 ? 'EUR' : 'USD');
const avecDevise = () =>
  db.prepare("SELECT count(*) n FROM commande WHERE devise<>''").get().n;
console.log(`   ${compte()} commandes au total, dont ${avecDevise()} portent une devise`);

ligne('3. Incident. On revient au code v1. Que rend le retour arrière ?');
console.log('   le code v1 relit les commandes : il ignore la colonne devise.');
const total = db.prepare('SELECT sum(total_cents) s FROM commande').get().s;
console.log(`   somme facturée par v1 : ${(total / 100).toFixed(2)} (toutes devises confondues)`);
console.log('   -> le retour arrière du CODE réussit. Il n annule pas les');
console.log('      50 commandes déjà écrites avec deux devises différentes.');
console.log('      Le code v1 les additionne comme si elles étaient homogènes.');

ligne('4. On revient aussi en arrière sur le SCHÉMA');
const perdues = db.prepare("SELECT count(*) n FROM commande WHERE devise='USD'").get().n;
db.exec('ALTER TABLE commande DROP COLUMN devise');
console.log(`   colonne devise supprimée. Lignes qui portaient 'USD' : ${perdues}`);
let relire = 'ok';
try { db.prepare('SELECT devise FROM commande LIMIT 1').get(); }
catch (e) { relire = e.message; }
console.log(`   relire la colonne : ${relire}`);
console.log('   -> le retour arrière du SCHÉMA est destructif : la seule trace');
console.log('      de la devise de 50 commandes vient de disparaître. Aucune');
console.log('      commande n a été supprimée, mais l information l est.');

// ── la version réversible ───────────────────────────────────────────────
ligne('5. La même livraison en expand / contract');
const db2 = new DatabaseSync(':memory:');
db2.exec(`CREATE TABLE commande (
  id INTEGER PRIMARY KEY, client TEXT NOT NULL, total_cents INTEGER NOT NULL)`);
db2.exec(`ALTER TABLE commande ADD COLUMN devise TEXT`);   // nullable, expand
const insV1b = (c, t) =>
  db2.prepare('INSERT INTO commande(client,total_cents) VALUES(?,?)').run(c, t);
const insV2b = (c, t, d) =>
  db2.prepare('INSERT INTO commande(client,total_cents,devise) VALUES(?,?,?)').run(c, t, d);
insV1b('v1-pendant-migration', 1000);
insV2b('v2-apres-migration', 5000, 'EUR');
const nul = db2.prepare('SELECT count(*) n FROM commande WHERE devise IS NULL').get().n;
console.log(`   colonne ajoutée NULLABLE : v1 et v2 écrivent toutes les deux.`);
console.log(`   lignes sans devise : ${nul} — repérables par une requête, donc rattrapables.`);
console.log('   retour arrière du code v2 -> v1 : la colonne reste, rien n est perdu.');
console.log('   la suppression de colonne (contract) n arrive qu une fois que');
console.log('   plus aucun code v1 ne tourne, et elle n est alors plus urgente.');

ligne('6. Arithmétique de l exposition — combien de clients voient la panne');
const RPS = 200, DETECTION_S = 6 * 60;   // 6 minutes pour voir et décider
for (const [nom, part] of [['bascule globale (100 %)', 1],
                           ['canari 5 %            ', 0.05],
                           ['canari 1 %            ', 0.01]]) {
  const touchees = RPS * DETECTION_S * part;
  console.log(`   ${nom} : ${touchees.toLocaleString('fr-FR')} requêtes servies en erreur`
    + ` avant la décision`);
}
console.log('   (200 requêtes/s, 6 minutes de détection ; multiplication, pas simulation)');
console.log('   -> le canari ne rend pas le bug moins probable. Il divise le');
console.log('      nombre de personnes qui le rencontrent avant qu on le voie.');
console.log('   -> ce raisonnement ne vaut QUE pour les défauts réversibles.');
console.log('      Sur l étape 4 ci-dessus, 1 % de trafic suffit à perdre');
console.log('      définitivement la devise de 1 % des commandes.');
