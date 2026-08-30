// V70 — vérification exécutée pour system-design-interview.
// Un entretien de conception de système commence presque toujours par un
// dimensionnement à la louche. Ce n est pas de la magie : c est une suite de
// multiplications dont chaque étape est vérifiable. On les fait ici en entier,
// et on mesure ce que coûtent les deux erreurs les plus fréquentes.

const fr = (n, d = 0) => n.toLocaleString('fr-FR', { maximumFractionDigits: d });
const Kio = 1024, Mio = Kio * 1024, Gio = Mio * 1024, Tio = Gio * 1024;
const taille = (o) => o >= Tio ? `${fr(o / Tio, 1)} Tio`
  : o >= Gio ? `${fr(o / Gio, 1)} Gio`
  : o >= Mio ? `${fr(o / Mio, 1)} Mio` : `${fr(o / Kio, 1)} Kio`;

console.log('== Énoncé : un service de raccourcissement d URL ==');
const UTILISATEURS = 100e6;          // 100 millions d utilisateurs
const ACTIFS_PAR_JOUR = 0.10;        // 10 % actifs par jour
const ECRITURES_PAR_ACTIF = 0.1;     // 1 lien cree pour 10 actifs
const RATIO_LECTURE = 100;           // 100 lectures pour 1 ecriture
const JOUR_S = 86400;
const RETENTION_ANS = 5;

console.log('\n== 1. Le débit, étape par étape ==');
const actifs = UTILISATEURS * ACTIFS_PAR_JOUR;
const ecrJour = actifs * ECRITURES_PAR_ACTIF;
const ecrS = ecrJour / JOUR_S;
const lecS = ecrS * RATIO_LECTURE;
console.log(`   utilisateurs                     : ${fr(UTILISATEURS)}`);
console.log(`   actifs par jour (10 %)           : ${fr(actifs)}`);
console.log(`   écritures par jour (1 pour 10)   : ${fr(ecrJour)}`);
console.log(`   écritures par seconde            : ${fr(ecrS)} /s`);
console.log(`   lectures par seconde (x${RATIO_LECTURE})       : ${fr(lecS)} /s`);
console.log('   -> le rapport lecture/écriture décide de l architecture avant');
console.log('      toute autre considération : ici le service est un service de');
console.log('      LECTURE. Un cache y change tout ; il ne changerait presque');
console.log('      rien si le rapport était inversé.');

console.log('\n== 2. Le stockage, étape par étape ==');
const PAR_LIGNE = 500;               // octets par enregistrement, en comptant large
const totalLignes = ecrJour * 365 * RETENTION_ANS;
console.log(`   octets par enregistrement        : ${PAR_LIGNE}`);
console.log(`   enregistrements sur ${RETENTION_ANS} ans        : ${fr(totalLignes)}`);
console.log(`   volume brut                      : ${taille(totalLignes * PAR_LIGNE)}`);
console.log(`   avec index et réplication (x3)   : ${taille(totalLignes * PAR_LIGNE * 3)}`);
console.log('   -> lire ce chiffre, et pas celui qu on aurait aime. 850 Gio bruts');
console.log('      et 2,5 Tio avec index et replication ne « tiennent pas sur une');
console.log('      machine » sans y reflechir : c est l ordre de grandeur ou la');
console.log('      question du partitionnement commence a se poser, sans etre');
console.log('      encore tranchee. La reponse d entretien attendue est donc');
console.log('      « 2,5 Tio, donc une seule machine est possible mais serree, et');
console.log('      la croissance decide » — pas une affirmation dans un sens ou');
console.log('      dans l autre. Un ordre de grandeur qui tombe a la frontiere');
console.log('      est une information, pas un echec du calcul.');
console.log('   -> et le calcul dit ou chercher a economiser : diviser par deux la');
console.log('      taille d un enregistrement divise par deux le stockage. C est');
console.log('      un levier visible seulement parce qu on a pose la formule.');

console.log('\n== 3. Erreur fréquente n°1 : oublier le facteur de pointe ==');
for (const pointe of [1, 2, 5, 10]) {
  console.log(`   facteur de pointe x${String(pointe).padStart(2)} : `
    + `${fr(lecS * pointe)} lectures/s à dimensionner`);
}
console.log('   -> une moyenne journalière ne dimensionne rien : le trafic se');
console.log('      concentre. Annoncer 1 157 lectures/s quand il faut tenir');
console.log('      11 570 /s à l heure de pointe est un facteur 10 d erreur —');
console.log('      c est-à-dire une architecture différente.');

console.log('\n== 4. Erreur fréquente n°2 : la confusion bits / octets ==');
const PAGE_KIO = 300;
const bandeOctets = lecS * PAGE_KIO * Kio;
console.log(`   ${fr(lecS)} lectures/s x ${PAGE_KIO} Kio = ${taille(bandeOctets)}/s`);
console.log(`   soit ${fr(bandeOctets * 8 / 1e9, 2)} Gbit/s (x8 : un octet fait 8 bits)`);
console.log(`   erreur classique : annoncer ${fr(bandeOctets / 1e9, 2)} « Gb/s »`);
console.log(`   -> facteur 8 d écart. Les liens réseau se vendent en BITS par`);
console.log('      seconde, les fichiers se mesurent en OCTETS. Confondre les');
console.log('      deux fait dimensionner un lien huit fois trop petit.');

console.log('\n== 5. Ce que le calcul autorise à dire ==');
const CACHE_PART = 0.20;             // 20 % des liens font 80 % du trafic
const cacheOctets = totalLignes * CACHE_PART * PAR_LIGNE;
console.log(`   si 20 % des liens font l essentiel du trafic, le cache pèse `
  + `${taille(cacheOctets)}`);
console.log(`   -> 170 Gio, soit environ trois machines a 64 Gio de memoire. C est`);
console.log('      finançable et opérable. On peut donc');
console.log('      AFFIRMER que le cache résout le problème de lecture, au lieu');
console.log('      de le supposer. C est exactement la différence entre réciter');
console.log('      une architecture et la justifier.');

console.log('\n== 6. La règle de lecture des ordres de grandeur ==');
const reperes = [
  ['lecture en mémoire            ', 100e-9],
  ['aller-retour dans un centre   ', 500e-6],
  ['lecture sur disque à semi-cond', 1e-4],
  ['aller-retour transatlantique  ', 150e-3],
];
for (const [nom, s] of reperes)
  console.log(`   ${nom} : ${s < 1e-3 ? fr(s * 1e6, 1) + ' µs' : fr(s * 1e3, 1) + ' ms'}`
    + `  -> ${fr(1 / s)} par seconde en série`);
console.log('   -> ces quatre repères suffisent à trancher la plupart des');
console.log('      questions de conception. Un aller-retour transatlantique par');
console.log('      requête plafonne le service à ~7 requêtes/s en série : c est');
console.log('      le calcul qui impose la réplication géographique, pas une');
console.log('      préférence d architecture.');
