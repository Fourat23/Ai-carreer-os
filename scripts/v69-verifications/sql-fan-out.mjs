import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync(':memory:');
db.exec(`
create table clients (id integer primary key, nom text);
create table commandes (id integer primary key, client_id int, montant real);
create table avis (id integer primary key, client_id int, note int);
insert into clients values (1,'Dupont'),(2,'Martin'),(3,'Nkolo');
insert into commandes values (10,1,100),(11,1,200),(12,2,500),(13,3,50);
insert into avis values (20,1,5),(21,1,3),(22,1,4),(23,2,2);
`);
const q = (sql) => db.prepare(sql).all();
const show = (t, rows) => { console.log('\n' + t); console.table(rows); };

show('VERITE : total commande par client (une seule jointure)',
  q(`select c.nom, sum(cmd.montant) as total, count(cmd.id) as nb
     from clients c join commandes cmd on cmd.client_id = c.id
     group by c.id order by total desc`));

show('VERITE : nombre d avis par client',
  q(`select c.nom, count(a.id) as nb_avis
     from clients c left join avis a on a.client_id = c.id group by c.id`));

show('LA REQUETE QUI SEMBLE JUSTE : les deux en une fois',
  q(`select c.nom, sum(cmd.montant) as total, count(a.id) as nb_avis
     from clients c
     join commandes cmd on cmd.client_id = c.id
     left join avis a on a.client_id = c.id
     group by c.id order by total desc`));

show('POURQUOI : les lignes reellement produites par la double jointure (Dupont)',
  q(`select c.nom, cmd.id as commande, cmd.montant, a.id as avis
     from clients c
     join commandes cmd on cmd.client_id = c.id
     left join avis a on a.client_id = c.id
     where c.id = 1`));

show('CORRECTIF 1 : DISTINCT ne repare que le comptage, pas la somme',
  q(`select c.nom, sum(distinct cmd.montant) as total_distinct, count(distinct a.id) as avis_distinct
     from clients c
     join commandes cmd on cmd.client_id = c.id
     left join avis a on a.client_id = c.id
     group by c.id order by total_distinct desc`));

show('CORRECTIF 2 : agreger AVANT de joindre (sous-requetes)',
  q(`select c.nom, coalesce(t.total,0) as total, coalesce(v.nb_avis,0) as nb_avis
     from clients c
     left join (select client_id, sum(montant) total from commandes group by client_id) t on t.client_id = c.id
     left join (select client_id, count(*) nb_avis from avis group by client_id) v on v.client_id = c.id
     order by total desc`));

// piege du DISTINCT sur la somme : deux commandes de meme montant
db.exec(`insert into clients values (4,'Sow'); insert into commandes values (14,4,100),(15,4,100);
         insert into avis values (24,4,5),(25,4,4);`);
show('LE PIEGE DU DISTINCT : Sow a DEUX commandes de 100 (vrai total = 200)',
  q(`select c.nom, sum(cmd.montant) as somme_gonflee, sum(distinct cmd.montant) as somme_distinct
     from clients c join commandes cmd on cmd.client_id=c.id
     left join avis a on a.client_id=c.id where c.id=4 group by c.id`));
