// Un "serveur" qui a du travail en cours et veut finir proprement.
import net from 'node:net';
let enCours = 0;
const srv = net.createServer((s) => { enCours++; s.on('close', () => enCours--); });
srv.listen(Number(process.argv[2] || 3999));
console.log(`[serveur] demarre, pid=${process.pid}`);
if (process.argv[3] === 'propre') {
  process.on('SIGTERM', () => {
    console.log(`[serveur] SIGTERM recu. Je termine ${enCours} connexion(s) puis je ferme.`);
    setTimeout(() => { console.log('[serveur] arret propre.'); process.exit(0); }, 300);
  });
}
if (process.argv[3] === 'sourd') {
  process.on('SIGTERM', () => console.log('[serveur] SIGTERM recu... et ignore.'));
}
setInterval(() => {}, 1000);
