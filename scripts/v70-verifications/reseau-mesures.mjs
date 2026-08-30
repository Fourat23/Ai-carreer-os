// V70 — vérification exécutée pour les cinq leçons réseau.
// On mesure ce qui se passe réellement lors d une requête, étape par étape.
// LIMITE DÉCLARÉE : cet environnement passe par un mandataire sortant. Les
// durées absolues en dépendent ; ce sont les RAPPORTS entre étapes et entre
// scénarios qui sont exploitables, et c est ainsi qu ils sont présentés.
import { lookup, resolve4, Resolver } from 'node:dns';
import { promisify } from 'node:util';
import { connect } from 'node:net';
import tls from 'node:tls';
import https from 'node:https';
import { performance } from 'node:perf_hooks';

const dnsLookup = promisify(lookup);
const ms = (t) => `${t.toFixed(1)} ms`;

console.log('== 1. La résolution de nom : ce que « lookup » cache ==');
const noms = ['registry.npmjs.org', 'github.com', 'example.com'];
for (const n of noms) {
  const t0 = performance.now();
  let r;
  try { r = await dnsLookup(n); } catch (e) { console.log(`   ${n} : ${e.code}`); continue; }
  const t1 = performance.now();
  const t2 = performance.now();
  await dnsLookup(n);                       // deuxième fois : le cache joue
  const t3 = performance.now();
  console.log(`   ${n.padEnd(20)} -> ${r.address.padEnd(15)} `
    + `1re ${ms(t1 - t0).padStart(9)}  2e ${ms(t3 - t2).padStart(9)}`);
}
console.log('   -> la deuxième résolution est servie par un cache (système ou');
console.log('      résolveur). C est pourquoi une panne de DNS se manifeste');
console.log('      souvent en DIFFÉRÉ : tant que les caches tiennent, tout va');
console.log('      bien, et la panne apparaît à l expiration.');

console.log('\n== 2. Un nom, plusieurs adresses ==');
const res4 = promisify(new Resolver().resolve4.bind(new Resolver()));
for (const n of noms) {
  try {
    const adrs = await res4(n);
    console.log(`   ${n.padEnd(20)} : ${adrs.length} adresse(s) — ${adrs.slice(0, 3).join(', ')}`);
  } catch (e) { console.log(`   ${n.padEnd(20)} : ${e.code}`); }
}
console.log('   -> plusieurs adresses pour un nom, c est la forme la plus simple');
console.log('      de répartition de charge : le résolveur en rend une liste et');
console.log('      le client en choisit une. Sans état, sans équipement dédié —');
console.log('      et sans aucun contrôle de santé : une adresse morte reste');
console.log('      distribuée jusqu à ce qu on retire l enregistrement.');

console.log('\n== 3. Le coût de chaque étape d une requête sécurisée ==');
async function etapes(hote) {
  const t = {};
  let t0 = performance.now();
  const { address } = await dnsLookup(hote);
  t.dns = performance.now() - t0;

  t0 = performance.now();
  await new Promise((ok, ko) => {
    const s = connect(443, address, () => { s.destroy(); ok(); });
    s.on('error', ko); s.setTimeout(5000, () => { s.destroy(); ko(new Error('délai')); });
  });
  t.tcp = performance.now() - t0;

  t0 = performance.now();
  const infos = await new Promise((ok, ko) => {
    const s = tls.connect({ host: hote, port: 443, servername: hote }, () => {
      const i = { protocole: s.getProtocol(), chiffre: s.getCipher().name,
                  cert: s.getPeerCertificate().subject?.CN };
      s.destroy(); ok(i);
    });
    s.on('error', ko); s.setTimeout(5000, () => { s.destroy(); ko(new Error('délai')); });
  });
  t.tls = performance.now() - t0;
  return { t, infos };
}
try {
  const { t, infos } = await etapes('example.com');
  const total = t.dns + t.tcp + t.tls;
  console.log(`   résolution du nom       : ${ms(t.dns).padStart(9)}  (${(t.dns / total * 100).toFixed(0).padStart(2)} %)`);
  console.log(`   établissement TCP       : ${ms(t.tcp).padStart(9)}  (${(t.tcp / total * 100).toFixed(0).padStart(2)} %)`);
  console.log(`   poignée de main TLS     : ${ms(t.tls).padStart(9)}  (${(t.tls / total * 100).toFixed(0).padStart(2)} %)`);
  console.log(`   total avant le 1er octet: ${ms(total)}`);
  console.log(`   protocole négocié : ${infos.protocole} · chiffrement : ${infos.chiffre}`);
  console.log(`   certificat présenté pour : ${infos.cert}`);
  console.log('   -> AUCUN octet applicatif n a encore circulé. Ce temps est payé');
  console.log('      AVANT la première requête, et il est payé À NOUVEAU à chaque');
  console.log('      nouvelle connexion. D où la réutilisation de connexion.');
} catch (e) {
  console.log(`   mesure impossible dans cet environnement : ${e.message}`);
}

console.log('\n== 4. Ce que la réutilisation de connexion fait gagner ==');
function requete(agent) {
  return new Promise((ok, ko) => {
    const t0 = performance.now();
    const r = https.get({ host: 'example.com', path: '/', agent }, (rep) => {
      rep.resume();
      rep.on('end', () => ok(performance.now() - t0));
    });
    r.on('error', ko);
    r.setTimeout(8000, () => { r.destroy(); ko(new Error('délai')); });
  });
}
try {
  const sansGarde = new https.Agent({ keepAlive: false });
  const avecGarde = new https.Agent({ keepAlive: true, maxSockets: 1 });
  const a = []; for (let i = 0; i < 5; i++) a.push(await requete(sansGarde));
  const b = []; for (let i = 0; i < 5; i++) b.push(await requete(avecGarde));
  const moy = (x) => x.reduce((s, v) => s + v) / x.length;
  console.log(`   5 requêtes SANS réutilisation : ${a.map((x) => x.toFixed(0)).join(', ')} ms`
    + ` — moyenne ${moy(a).toFixed(1)} ms`);
  console.log(`   5 requêtes AVEC réutilisation : ${b.map((x) => x.toFixed(0)).join(', ')} ms`
    + ` — moyenne ${moy(b).toFixed(1)} ms`);
  console.log(`   la 1re avec réutilisation : ${b[0].toFixed(0)} ms · les suivantes : `
    + `${moy(b.slice(1)).toFixed(1)} ms en moyenne`);
  console.log('   -> la première requête paie la mise en place ; les suivantes ne');
  console.log('      la paient plus. C est le même mécanisme qui explique pourquoi');
  console.log('      un client HTTP recréé à chaque appel est lent sans qu aucune');
  console.log('      requête ne soit lente.');
} catch (e) {
  console.log(`   mesure impossible : ${e.message}`);
}

console.log('\n== 5. Les tailles qui décident du découpage ==');
const MTU = 1500, ENTETES = 40;
console.log(`   MTU Ethernet usuelle          : ${MTU} octets`);
console.log(`   moins les en-têtes IP + TCP   : ${MTU - ENTETES} octets utiles par segment`);
for (const [nom, taille] of [['une réponse JSON courte', 800],
                             ['une page HTML moyenne  ', 60_000],
                             ['une image              ', 400_000]]) {
  console.log(`   ${nom} (${taille.toLocaleString('fr-FR')} o) -> `
    + `${Math.ceil(taille / (MTU - ENTETES))} segment(s)`);
}
console.log('   -> une réponse de 800 octets tient dans UN segment ; une de');
console.log('      60 Ko en demande 42. C est la raison pour laquelle réduire');
console.log('      une réponse sous le seuil du segment a un effet mesurable');
console.log('      alors que la réduire de 60 à 55 Ko n en a presque aucun.');
