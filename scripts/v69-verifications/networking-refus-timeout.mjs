import net from 'node:net';
import dns from 'node:dns/promises';

function essai(nom, host, port, timeout = 3000) {
  return new Promise((r) => {
    const t0 = Date.now();
    const s = new net.Socket();
    s.setTimeout(timeout);
    const fin = (issue) => { s.destroy(); console.log(`  ${nom.padEnd(46)} ${issue.padEnd(28)} ${Date.now() - t0} ms`); r(); };
    s.on('connect', () => fin('CONNECTE'));
    s.on('timeout', () => fin('aucune reponse (timeout)'));
    s.on('error', (e) => fin(e.code));
    s.connect(port, host);
  });
}

// un serveur bien vivant, pour comparer
const srv = net.createServer(() => {});
await new Promise((r) => srv.listen(3777, '127.0.0.1', r));

console.log('Connexion TCP — meme commande, quatre situations :\n');
console.log('  cible                                          verdict                      duree');
await essai('127.0.0.1:3777  (service en ecoute)', '127.0.0.1', 3777);
await essai('127.0.0.1:3778  (personne n ecoute)', '127.0.0.1', 3778);
await essai('10.255.255.1:80 (adresse non routee)', '10.255.255.1', 80);
srv.close();

console.log('\nResolution de noms :');
for (const n of ['localhost', 'nom-qui-nexiste-pas-42.invalid']) {
  try { const a = await dns.lookup(n); console.log(`  ${n.padEnd(34)} -> ${a.address}`); }
  catch (e) { console.log(`  ${n.padEnd(34)} -> ECHEC ${e.code}`); }
}
