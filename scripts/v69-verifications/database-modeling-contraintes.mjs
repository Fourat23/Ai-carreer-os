import { DatabaseSync } from 'node:sqlite';
const essai = (titre, fn) => { console.log('\n### ' + titre); try { fn(); } catch (e) { console.log('   ERREUR SQL -> ' + e.message); } };

function base(contrainte) {
  const db = new DatabaseSync(':memory:');
  db.exec(`create table livres(id integer primary key);
           create table emprunts(id integer primary key, livre_id int not null references livres(id),
                                 membre_id int not null, emprunte_le text not null, rendu_le text);
           insert into livres values (1);`);
  if (contrainte) db.exec(contrainte);
  return db;
}

essai('A. AUCUNE contrainte : deux emprunts simultanes du meme livre', () => {
  const db = base(null);
  db.exec(`insert into emprunts (livre_id,membre_id,emprunte_le) values (1,7,'2026-08-01')`);
  db.exec(`insert into emprunts (livre_id,membre_id,emprunte_le) values (1,9,'2026-08-02')`);
  console.log('   emprunts en cours :', db.prepare('select count(*) n from emprunts where rendu_le is null').get().n, '(attendu 1, la base a accepte 2)');
});

essai('B. LE FAUX CORRECTIF : UNIQUE(livre_id, rendu_le)', () => {
  const db = base(`create unique index u on emprunts(livre_id, rendu_le)`);
  db.exec(`insert into emprunts (livre_id,membre_id,emprunte_le) values (1,7,'2026-08-01')`);
  db.exec(`insert into emprunts (livre_id,membre_id,emprunte_le) values (1,9,'2026-08-02')`);
  db.exec(`insert into emprunts (livre_id,membre_id,emprunte_le) values (1,11,'2026-08-03')`);
  console.log('   emprunts en cours :', db.prepare('select count(*) n from emprunts where rendu_le is null').get().n, '-> la contrainte n a rien empeche');
});

essai('B bis. la meme contrainte SUR DES LIGNES RENDUES (rendu_le non NULL)', () => {
  const db = base(`create unique index u on emprunts(livre_id, rendu_le)`);
  db.exec(`insert into emprunts (livre_id,membre_id,emprunte_le,rendu_le) values (1,7,'2026-08-01','2026-08-10')`);
  db.exec(`insert into emprunts (livre_id,membre_id,emprunte_le,rendu_le) values (1,9,'2026-08-02','2026-08-10')`);
  console.log('   -> deux retours le meme jour ont ete refuses ? non, on est arrive ici sans erreur');
});

essai('C. LE BON CORRECTIF : index unique PARTIEL', () => {
  const db = base(`create unique index u on emprunts(livre_id) where rendu_le is null`);
  db.exec(`insert into emprunts (livre_id,membre_id,emprunte_le) values (1,7,'2026-08-01')`);
  console.log('   1er emprunt : accepte');
  db.exec(`insert into emprunts (livre_id,membre_id,emprunte_le) values (1,9,'2026-08-02')`);
  console.log('   2e emprunt : accepte (ANOMALIE)');
});

essai('C bis. index partiel : le livre redevient empruntable APRES retour', () => {
  const db = base(`create unique index u on emprunts(livre_id) where rendu_le is null`);
  db.exec(`insert into emprunts (livre_id,membre_id,emprunte_le) values (1,7,'2026-08-01')`);
  db.exec(`update emprunts set rendu_le='2026-08-10' where id=1`);
  db.exec(`insert into emprunts (livre_id,membre_id,emprunte_le) values (1,9,'2026-08-11')`);
  const n = db.prepare('select count(*) n from emprunts').get().n;
  console.log('   total emprunts historises :', n, '| en cours :', db.prepare('select count(*) n from emprunts where rendu_le is null').get().n);
  console.log('   -> l historique est conserve ET la regle tient');
});

essai('D. la contrainte de cle etrangere est-elle active par defaut ?', () => {
  const db = base(null);
  console.log('   foreign_keys =', db.prepare('pragma foreign_keys').get().foreign_keys);
  db.exec(`insert into emprunts (livre_id,membre_id,emprunte_le) values (999,7,'2026-08-01')`);
  console.log('   insertion vers un livre INEXISTANT (999) : acceptee');
});

essai('D bis. avec PRAGMA foreign_keys = ON', () => {
  const db = base(null); db.exec('pragma foreign_keys = ON');
  db.exec(`insert into emprunts (livre_id,membre_id,emprunte_le) values (999,7,'2026-08-01')`);
  console.log('   insertion vers un livre inexistant : acceptee (anomalie)');
});
