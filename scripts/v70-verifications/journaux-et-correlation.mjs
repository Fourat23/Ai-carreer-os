// V70 — vérification exécutée pour observability-logging, logging-structured
// et distributed-tracing.
// Question : « on a des logs, donc on est observables. » On fabrique des
// journaux dans les deux formes, on pose UNE question précise, et on mesure
// combien de réponses chaque forme permet d'obtenir.
import { randomUUID } from 'node:crypto';

const N = 5000;
const CLIENTS = Array.from({ length: 400 }, (_, i) => `cli-${1000 + i}`);
const ROUTES = ['/commande', '/panier', '/paiement', '/profil'];
// Générateur pseudo-aléatoire à graine fixe : les chiffres publiés dans les
// leçons doivent être reproductibles à l identique par le lecteur.
let graine = 0x5eed70;
const alea = () => {
  graine ^= graine << 13; graine ^= graine >>> 17; graine ^= graine << 5;
  return ((graine >>> 0) % 1e6) / 1e6;
};
const rnd = (a) => a[Math.floor(alea() * a.length)];

// ── on fabrique la MÊME réalité sous deux formes ────────────────────────
const evenements = [];
for (let i = 0; i < N; i++) {
  const err = alea() < 0.012;                      // 1,2 % d erreurs
  evenements.push({
    ts: new Date(Date.UTC(2026, 2, 14, 9, 0, 0) + i * 37).toISOString(),
    niveau: err ? 'error' : 'info',
    client: rnd(CLIENTS),
    route: rnd(ROUTES),
    ms: Math.round(5 + alea() * 400),
    // 1 erreur sur 3 rapporte un motif fourni par un tiers, qui contient un
    // retour a la ligne. Ce n est pas un cas tordu : un message d erreur de
    // fournisseur, une adresse saisie par un client ou une pile d execution
    // en contiennent tous. C est la donnee reelle, pas une donnee piegee.
    message: err
      ? (i % 3 === 0
          ? 'echec du paiement\nmotif renvoye par la banque: fonds insuffisants'
          : 'echec du paiement, motif: fonds insuffisants, ref: 12-34')
      : 'requete servie',
  });
}
const enJson = evenements.map((e) => JSON.stringify(e));
// La forme texte, écrite comme on l écrit vraiment : lisible par un humain.
// En texte, un message multiligne produit PLUSIEURS lignes de journal : rien
// dans le format ne permet de dire que la seconde appartient a la premiere.
const enTexte = evenements.flatMap((e) =>
  `${e.ts} [${e.niveau.toUpperCase()}] ${e.client} ${e.route} ${e.ms}ms - ${e.message}`
    .split('\n'));

// Une trace d exception sur plusieurs lignes, comme il en existe toujours.
// Un evenement d erreur accompagne de sa pile d execution. Il est present dans
// LES DEUX journaux et compte donc dans la verite : la seule difference est sa
// FORME. En texte il occupe trois lignes ; en JSON il occupe une ligne dont un
// champ contient des retours a la ligne.
const pile = ['Error: connexion refusee', '    at Socket.onError (net.js:1483:12)',
              '    at emitErrorNT (internal/streams:151:8)'];
const avecPile = {
  ts: new Date(Date.UTC(2026, 2, 14, 9, 1, 32)).toISOString(), niveau: 'error',
  client: rnd(CLIENTS), route: '/paiement', ms: 30001,
  message: 'connexion refusee', pile: pile.join('\n') };
evenements.push(avecPile);
enTexte.splice(2500, 0,
  `${avecPile.ts} [ERROR] ${avecPile.client} /paiement 30001ms - connexion refusee`,
  ...pile);
enJson.splice(2500, 0, JSON.stringify(avecPile));

// ── LA QUESTION : combien d erreurs sur /paiement au dela de 300 ms ? ───
console.log('== Question posée aux deux journaux ==');
console.log('   « combien d erreurs sur /paiement ont dépassé 300 ms ? »');

const verite = evenements.filter(
  (e) => e.niveau === 'error' && e.route === '/paiement' && e.ms > 300).length;
console.log(`   réponse vraie (calculée sur les objets) : ${verite}`);

// Réponse via JSON : une ligne, un objet.
let parJson = 0, jsonIllisibles = 0;
for (const l of enJson) {
  try {
    const o = JSON.parse(l);
    if (o.niveau === 'error' && o.route === '/paiement' && o.ms > 300) parJson++;
  } catch { jsonIllisibles++; }
}
console.log(`   réponse via JSON  : ${parJson}  (lignes illisibles : ${jsonIllisibles})`);

// Réponse via texte : il faut une expression régulière, écrite à la main.
const RE = /^(\S+) \[(\w+)\] (\S+) (\S+) (\d+)ms - (.*)$/;
let parTexte = 0, texteIllisibles = 0;
for (const l of enTexte) {
  const m = RE.exec(l);
  if (!m) { texteIllisibles++; continue; }
  if (m[2] === 'ERROR' && m[4] === '/paiement' && Number(m[5]) > 300) parTexte++;
}
console.log(`   réponse via texte : ${parTexte}  (lignes illisibles : ${texteIllisibles})`);
console.log(`   -> écart texte/vérité : ${parTexte - verite}`);
console.log(`      L expression régulière a rejeté ${texteIllisibles} lignes en silence.`);
console.log('      Une ligne rejetée ne lève aucune erreur : elle disparaît du');
console.log('      décompte. Le total est faux et rien ne le signale.');
console.log('      Le JSON, lui, échappe le retour à la ligne dans le champ :');
console.log('      un événement reste une ligne, quoi que contienne le message.');
console.log('      Ici le compte est pourtant JUSTE : les lignes rejetées étaient');
console.log('      des lignes de continuation, et la première ligne de chaque');
console.log('      événement portait déjà les champs interrogés. C est exactement');
console.log('      ce qui rend le format texte dangereux : il donne souvent la');
console.log('      bonne réponse, donc on lui fait confiance.');

// ── DEUXIÈME QUESTION : celle qui casse ─────────────────────────────────
console.log('\n== Deuxième question, sur le CONTENU du message ==');
console.log('   « combien d erreurs ont pour motif un refus de la banque ? »');
const verite2 = evenements.filter(
  (e) => e.niveau === 'error' && /fonds insuffisants/.test(e.message)).length;
let json2 = 0;
for (const l of enJson) {
  const o = JSON.parse(l);
  if (o.niveau === 'error' && /fonds insuffisants/.test(o.message || '')) json2++;
}
let texte2 = 0;
for (const l of enTexte) {
  const m = RE.exec(l);
  if (m && m[2] === 'ERROR' && /fonds insuffisants/.test(m[6])) texte2++;
}
console.log(`   réponse vraie     : ${verite2}`);
console.log(`   réponse via JSON  : ${json2}`);
console.log(`   réponse via texte : ${texte2}   (écart : ${texte2 - verite2})`);
console.log('   -> le motif est sur la ligne de continuation pour un tiers des');
console.log('      erreurs. Cette ligne n a ni horodatage ni niveau : elle est');
console.log('      rejetée, et ces erreurs deviennent invisibles. Le rapport');
console.log('      sous-estime les refus bancaires sans qu aucun signal ne le dise.');
console.log('   -> même défaut, même journal, deux questions : la première a');
console.log('      donné le bon résultat, la seconde non. La fiabilité du format');
console.log('      texte dépend de la question posée, ce qui revient à dire');
console.log('      qu on ne peut pas s y fier.');

// ── ce que le format coûte ─────────────────────────────────────────────
const oct = (a) => a.reduce((s, l) => s + Buffer.byteLength(l) + 1, 0);
console.log('\n== Ce que le format coûte ==');
console.log(`   texte : ${(oct(enTexte) / 1024).toFixed(1)} Kio`);
console.log(`   JSON  : ${(oct(enJson) / 1024).toFixed(1)} Kio`
  + `  (×${(oct(enJson) / oct(enTexte)).toFixed(2)})`);
console.log('   -> le JSON coûte plus cher en octets. C est un vrai coût, à mettre');
console.log('      en face d une vraie contrepartie : une requête au lieu d une');
console.log('      expression régulière, et aucune ligne perdue en silence.');

// ── corrélation entre services ─────────────────────────────────────────
console.log('\n== Reconstituer UNE requête à travers trois services ==');
const SERVICES = ['passerelle', 'commandes', 'paiement'];
// Les requetes durent ~30 ms. On fait varier l ESPACEMENT entre leurs debuts :
// une nouvelle requete toutes les (30 / concurrence) ms. A concurrence 1 elles
// ne se chevauchent pas ; a 20 elles se chevauchent largement.
function fabriquer(concurrence) {
  const DUREE = 30;
  const pas = DUREE / concurrence;
  const lignes = [];
  const requetes = [];
  for (let r = 0; r < 200; r++) {
    const id = randomUUID();
    const debut = Math.round(r * pas);
    const spans = SERVICES.map((s, k) => ({
      service: s, trace: id, requete: r,
      debut: debut + Math.round(k * (DUREE / 3)),
    }));
    requetes.push({ id, r, spans });
    lignes.push(...spans);
  }
  lignes.sort((a, b) => a.debut - b.debut || a.requete - b.requete);
  return { lignes, requetes };
}
for (const conc of [1, 5, 20]) {
  const { lignes, requetes } = fabriquer(conc);
  // Méthode A : sans identifiant, on regroupe par proximité temporelle.
  let bonA = 0;
  for (const req of requetes) {
    const ancre = req.spans[0];
    const suite = SERVICES.slice(1).map((s) =>
      lignes.filter((l) => l.service === s && l.debut >= ancre.debut)
            .sort((a, b) => a.debut - b.debut)[0]);
    if (suite.every((l) => l && l.requete === req.r)) bonA++;
  }
  // Méthode B : avec un identifiant de corrélation, on filtre.
  let bonB = 0;
  for (const req of requetes) {
    const trouves = lignes.filter((l) => l.trace === req.id);
    if (trouves.length === 3 && trouves.every((l) => l.requete === req.r)) bonB++;
  }
  console.log(`   ${String(conc).padStart(2)} requêtes simultanées : `
    + `par proximité temporelle ${String(bonA).padStart(3)}/200 correctes · `
    + `par identifiant de corrélation ${bonB}/200`);
}
console.log('   -> à une requête à la fois, deviner par le temps fonctionne, et');
console.log('      c est pour cela que la méthode survit : elle marche en');
console.log('      développement. Sous concurrence réelle elle s effondre, et');
console.log('      surtout elle s effondre SILENCIEUSEMENT — on reconstitue une');
console.log('      requête qui n a jamais existé, puis on l analyse.');

// ── échantillonnage ────────────────────────────────────────────────────
console.log('\n== Échantillonner les journaux : ce qu on perd ==');
for (const taux of [1, 0.1, 0.01]) {
  for (const occurrences of [1, 5, 50]) {
    const p = 1 - Math.pow(1 - taux, occurrences);
    console.log(`   taux ${String(taux * 100).padStart(4)} % · défaut survenu `
      + `${String(occurrences).padStart(2)} fois -> capturé au moins une fois : `
      + `${(p * 100).toFixed(1)} %`);
  }
}
console.log('   -> un échantillonnage à 1 % rate 4 fois sur 5 un défaut survenu');
console.log('      50 fois. L échantillonnage uniforme est donc le mauvais outil :');
console.log('      ce qu on veut garder (les erreurs, les requêtes lentes) est');
console.log('      justement ce qui est rare. On échantillonne le succès, pas');
console.log('      l échec.');
