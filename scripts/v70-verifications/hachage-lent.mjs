/**
 * V70 — vérification exécutée des chiffres publiés dans
 * curriculum/lessons/authentication.md (correction : pourquoi un hachage lent).
 *
 * Compare le débit d'un hachage rapide (SHA-256) et d'un hachage lent
 * (scrypt, paramètres proches des recommandations courantes), puis en déduit
 * le temps qu'il faudrait pour essayer un dictionnaire de 10 millions de mots
 * de passe sur une seule machine.
 *
 * Node fournit scrypt en standard ; bcrypt et argon2 sont des dépendances
 * externes non installées ici. Limite déclarée : les ordres de grandeur sont
 * ceux de scrypt sur CETTE machine, sans GPU. Un attaquant équipé fait
 * beaucoup mieux — ce qui renforce la conclusion au lieu de l'affaiblir.
 *
 * Exécution : node scripts/v70-verifications/hachage-lent.mjs
 */
import { createHash, scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

const MDP = 'correct horse battery staple';
const chrono = (f, n) => { const t = process.hrtime.bigint(); for (let i = 0; i < n; i++) f(i); return Number(process.hrtime.bigint() - t) / 1e6; };

// --- rapide ---
const N_RAPIDE = 200_000;
const msRapide = chrono((i) => createHash('sha256').update(MDP + i).digest('hex'), N_RAPIDE);
const parSecRapide = Math.round(N_RAPIDE / (msRapide / 1000));

// --- lent ---
const sel = randomBytes(16);
const N_LENT = 30;
const msLent = chrono((i) => scryptSync(MDP + i, sel, 64, { N: 16384, r: 8, p: 1 }), N_LENT);
const parSecLent = +(N_LENT / (msLent / 1000)).toFixed(1);

const DICO = 10_000_000;
const fmt = (s) => s < 60 ? `${s.toFixed(1)} s`
  : s < 3600 ? `${(s / 60).toFixed(1)} min`
  : s < 86400 ? `${(s / 3600).toFixed(1)} h`
  : `${(s / 86400).toFixed(1)} jours`;

console.log('=== débit de hachage, une seule machine, sans GPU ===');
console.log('SHA-256  :', parSecRapide.toLocaleString('fr-FR'), 'hachages/s   (', (msRapide / N_RAPIDE).toFixed(4), 'ms chacun )');
console.log('scrypt   :', parSecLent, 'hachages/s   (', (msLent / N_LENT).toFixed(1), 'ms chacun )');
console.log('rapport  :', Math.round(parSecRapide / parSecLent).toLocaleString('fr-FR'), 'fois plus lent');
console.log();
console.log(`=== essayer un dictionnaire de ${DICO.toLocaleString('fr-FR')} mots de passe ===`);
console.log('contre SHA-256 :', fmt(DICO / parSecRapide));
console.log('contre scrypt  :', fmt(DICO / parSecLent));
console.log();

// --- comparaison à temps constant ---
const a = Buffer.from('a'.repeat(64)), b = Buffer.from('a'.repeat(63) + 'b');
console.log('=== comparaison ===');
console.log('timingSafeEqual(a, b) :', timingSafeEqual(a, b), '— compare toujours tous les octets');
console.log("a === b (naïf)        :", a.toString() === b.toString(), '— peut s\'arrêter au premier octet différent');
