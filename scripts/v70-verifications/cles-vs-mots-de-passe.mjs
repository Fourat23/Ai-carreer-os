// V70 — vérification exécutée pour linux-ssh-remote.
// LIMITE DÉCLARÉE : ni le client ni le serveur OpenSSH ne sont installés dans
// cet environnement (`which ssh` : introuvable ; l installation par le
// gestionnaire de paquets échoue). AUCUNE commande ssh ni ssh-keygen n a été
// exécutée pour produire ce cours. En revanche, la question de fond — pourquoi
// une paire de clés remplace un mot de passe — repose sur de la cryptographie
// et de l arithmétique, toutes deux vérifiables ici.
import { generateKeyPairSync, sign, verify, createPublicKey, randomBytes } from 'node:crypto';

console.log('== 1. Ce qu est une paire de clés, en pratique ==');
const { publicKey, privateKey } = generateKeyPairSync('ed25519');
const pub = publicKey.export({ type: 'spki', format: 'der' });
const priv = privateKey.export({ type: 'pkcs8', format: 'der' });
console.log(`   clé publique  : ${pub.length} octets`);
console.log(`   clé privée    : ${priv.length} octets`);
console.log('   la clé publique se dépose sur le serveur ; la privée ne bouge jamais.');

console.log('\n== 2. Le serveur vérifie sans jamais connaître le secret ==');
const defi = randomBytes(32);                       // le serveur tire un défi
const signature = sign(null, defi, privateKey);     // le client le signe
// Le serveur ne dispose QUE des octets de la clé publique — on le reconstruit
// depuis ces octets pour qu il n y ait aucun doute sur ce qu il connaît.
const depuisPublique = createPublicKey({ key: pub, type: 'spki', format: 'der' });
console.log(`   défi envoyé par le serveur : ${defi.toString('hex').slice(0, 24)}…`);
console.log(`   signature renvoyée         : ${signature.length} octets`);
console.log(`   vérification par le serveur : ${verify(null, defi, depuisPublique, signature)}`);
const autreDefi = randomBytes(32);
console.log(`   la même signature sur un AUTRE défi : `
  + `${verify(null, autreDefi, depuisPublique, signature)}`);
console.log('   -> le secret ne traverse jamais le réseau. Un serveur compromis');
console.log('      apprend la clé publique et une signature valable pour UN défi');
console.log('      déjà utilisé. Avec un mot de passe, il apprend le mot de passe.');

console.log('\n== 3. Peut-on retrouver la clé privée à partir de la publique ? ==');
const { publicKey: pub2 } = generateKeyPairSync('ed25519');
console.log(`   deux clés publiques différentes ? `
  + `${!pub.equals(pub2.export({ type: 'spki', format: 'der' }))}`);
console.log('   Ed25519 repose sur le logarithme discret sur courbe elliptique :');
console.log('   niveau de sécurité ~2^128 opérations. Aucun calcul de ce script ne');
console.log('   le démontre — c est une hypothèse cryptographique, pas une mesure,');
console.log('   et elle est présentée comme telle.');

console.log('\n== 4. Arithmétique : mot de passe contre clé ==');
// Deux cadences, parce qu elles conduisent a des conclusions differentes.
//  - EN LIGNE : le serveur repond, donc il limite. 100 essais/s est genereux.
//  - HORS LIGNE : l empreinte du mot de passe a fuite. La cadence est celle du
//    materiel. On reutilise ici la valeur MESUREE par la verification
//    scripts/v70-verifications/hachage-lent.mjs sur cette machine :
//    681 015 empreintes SHA-256 par seconde. C est le cas realiste apres fuite.
const ANNEE = 365 * 24 * 3600;
const cas = [
  ['8 car. minuscules      ', Math.pow(26, 8)],
  ['8 car. mixtes+chiffres ', Math.pow(62, 8)],
  ['12 car. mixtes         ', Math.pow(62, 12)],
  ['clé Ed25519 (2^128)    ', Math.pow(2, 128)],
];
const duree = (secondes) => {
  if (secondes < 3600) return `${(secondes / 60).toFixed(1)} min`;
  if (secondes < 86400) return `${(secondes / 3600).toFixed(1)} h`;
  if (secondes < ANNEE) return `${(secondes / 86400).toFixed(1)} jours`;
  const ans = secondes / ANNEE;
  return ans < 1e4 ? `${ans.toFixed(0)} ans` : `${ans.toExponential(1)} ans`;
};
console.log('   secret                    | possibilités | en ligne (100/s) | hors ligne (681015/s)');
for (const [nom, espace] of cas) {
  console.log(`   ${nom} | ${espace.toExponential(2).padStart(12)} `
    + `| ${duree(espace / 2 / 100).padStart(16)} `
    + `| ${duree(espace / 2 / 681015).padStart(20)}`);
}
console.log('   (la moitie de l espace parcourue en moyenne)');
console.log('');
console.log('   CE QUE CES CHIFFRES DISENT, ET CE QU ILS NE DISENT PAS.');
console.log('   En ligne, meme 8 caracteres minuscules tiennent 33 ans a 100');
console.log('   essais/s : la force brute EN LIGNE n est pas la menace, et il');
console.log('   serait faux de dire le contraire. Ce qui rend les mots de passe');
console.log('   dangereux est ailleurs, et se lit dans les deux colonnes :');
console.log('     1. HORS LIGNE, apres fuite d une base d empreintes, les memes');
console.log('        8 caracteres minuscules tombent en 1,8 jour. Le secret que');
console.log('        vous tapez sur ce serveur protege AUSSI vos autres comptes.');
console.log('     2. Personne n attaque par force brute : on attaque par');
console.log('        DICTIONNAIRE. La verification hachage-lent.mjs a mesure');
console.log('        14,7 secondes pour un mot de passe courant contre 4,9 jours');
console.log('        de force brute — les chiffres ci-dessus sont donc des');
console.log('        MAJORANTS tres optimistes pour un mot de passe humain.');
console.log('     3. Une cle Ed25519 n a rien a deviner du tout : la colonne');
console.log('        « hors ligne » y est sans objet, puisqu il n existe aucune');
console.log('        empreinte a faire fuir. C est un changement de nature, pas');
console.log('        un deplacement de curseur.');

console.log('\n== 5. Ce que la clé ne protège PAS ==');
console.log('   - la clé privée est un FICHIER. Copié, il donne l accès. C est');
console.log('     pourquoi elle est chiffrée par une phrase de passe.');
console.log('   - un serveur qui accepte encore les mots de passe garde la porte');
console.log('     ouverte : déposer une clé n en ferme aucune. Il faut désactiver');
console.log('     explicitement l authentification par mot de passe.');
console.log('   - la clé authentifie le CLIENT. Elle ne dit rien du serveur :');
console.log('     c est l empreinte du serveur (known_hosts) qui protège de');
console.log('     l interception, et c est ce que l on accepte à l aveugle la');
console.log('     première fois.');
