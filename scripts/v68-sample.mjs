// V68 · CP0 — ÉCHANTILLONS GELÉS. Tirage déterministe, publié AVANT toute lecture
// et avant toute modification.
//
// Deux échantillons, et la séparation est le seul dispositif qui rende l'audit
// final honnête :
//
//   AUDIT   — lu au CP0, il GUIDE les réécritures. 32 leçons.
//   AVEUGLE — jamais ouvert avant le CP13. Il ne guide RIEN, et c'est ce qui lui
//             donne sa valeur : il mesure si le travail GÉNÉRALISE ou s'il s'est
//             contenté de traiter ce qu'on regardait.
//
// Les seeds de V67 sont brûlées : ses deux échantillons ont été rejoués et
// ouverts au CP14. V68 tire donc des seeds neuves, publiées ici.
//
// Aucun `Math.random`. mulberry32, comme V66 et V67.

import { readFileSync, readdirSync } from 'node:fs';

export const SEED_AUDIT = 20261101;
export const SEED_AVEUGLE = 20261102;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tirer(liste, n, r) {
  const pool = [...liste];
  const out = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  return out;
}

const P = JSON.parse(readFileSync('data/program.json', 'utf8'));
const slugs = readdirSync('curriculum/lessons').filter((f) => f.endsWith('.md'))
  .map((f) => f.replace(/\.md$/, '')).sort();

/**
 * Catégorie du catalogue — c'est le découpage par DOMAINE que le brief exige.
 *
 * L'index de `data/program.json` utilise `slug`, pas `file` : `file` est le nom
 * de champ de `scripts/data/lessons-map.mjs`, une AUTRE structure. Première
 * version écrite sur cette confusion, elle levait un TypeError au premier
 * appel — l'erreur la moins coûteuse de ce projet, parce qu'elle est bruyante.
 */
const CAT = new Map((P.lessons ?? []).map((l) => [l.slug, l.cat ?? 'Autres']));

/** Journée la plus précoce qui programme la leçon (pour stratifier par période). */
const premierJour = new Map();
for (const d of P.days) {
  let md = '';
  try { md = readFileSync(`curriculum/days/day-${String(d.day).padStart(3, '0')}.md`, 'utf8'); } catch { continue; }
  for (const s of new Set([...md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))) {
    if (!premierJour.has(s) || d.day < premierJour.get(s)) premierJour.set(s, d.day);
  }
}

/** Famille éditoriale — règle identique à V66/V67, non retouchée pour rester comparable. */
function famille(slug) {
  const md = readFileSync(`curriculum/lessons/${slug}.md`, 'utf8');
  const h = [...md.matchAll(/^## +(.+)$/gm)];
  const i = h.findIndex((m) => /explication (compl|progressive)/i.test(m[1]));
  if (i < 0) return '?';
  const b = md.slice(h[i].index, i + 1 < h.length ? h[i + 1].index : md.length);
  if (/progressive/i.test(h[i][1])) return 'B';
  return (b.match(/^### /gm) ?? []).length >= 2 ? 'C' : 'A';
}

const periode = (s) => {
  const j = premierJour.get(s);
  if (j === undefined) return 'hors-parcours';
  return j <= 120 ? 'debut' : j <= 245 ? 'milieu' : 'fin';
};

/**
 * Échantillon d'AUDIT : la stratification vient AVANT le tirage, pour qu'aucune
 * strate ne puisse manquer par malchance. Une leçon par catégorie du catalogue
 * (17 catégories), puis complétion pour garantir les trois familles, les trois
 * périodes et le hors-parcours.
 */
export function echantillonAudit() {
  const r = rng(SEED_AUDIT);
  const choisies = new Set();

  // 1. Une leçon de chaque catégorie du catalogue — couvre les 18 domaines du brief.
  const parCat = new Map();
  for (const s of slugs) {
    const c = CAT.get(s) ?? 'Autres';
    if (!parCat.has(c)) parCat.set(c, []);
    parCat.get(c).push(s);
  }
  for (const c of [...parCat.keys()].sort()) for (const s of tirer(parCat.get(c), 1, r)) choisies.add(s);

  // 2. Garantir les trois familles éditoriales (≥4 chacune).
  for (const f of ['A', 'B', 'C']) {
    const dans = [...choisies].filter((s) => famille(s) === f).length;
    if (dans >= 4) continue;
    const cand = slugs.filter((s) => famille(s) === f && !choisies.has(s));
    for (const s of tirer(cand, 4 - dans, r)) choisies.add(s);
  }

  // 3. Garantir les trois périodes ET le hors-parcours (≥3 chacun).
  for (const p of ['debut', 'milieu', 'fin', 'hors-parcours']) {
    const dans = [...choisies].filter((s) => periode(s) === p).length;
    if (dans >= 3) continue;
    const cand = slugs.filter((s) => periode(s) === p && !choisies.has(s));
    for (const s of tirer(cand, 3 - dans, r)) choisies.add(s);
  }

  // 4. Complétion jusqu'à 32 par tirage uniforme sur le reste.
  //
  // Les trois strates ci-dessus donnent 22 leçons — assez pour que chaque strate
  // existe, pas assez pour l'« échantillon représentatif important » que le brief
  // exige. La complétion est UNIFORME et non stratifiée, volontairement : les
  // strates garantissent la couverture, le tirage uniforme garantit qu'aucune
  // main ne choisit la suite. 32/128 = un quart du corpus lu au CP0.
  const reste = slugs.filter((s) => !choisies.has(s));
  for (const s of tirer(reste, 32 - choisies.size, r)) choisies.add(s);

  return { seed: SEED_AUDIT, lecons: [...choisies].sort() };
}

/**
 * Échantillon AVEUGLE — NE PAS OUVRIR avant le CP13.
 * Tiré parmi les leçons qui ne sont PAS dans l'échantillon d'audit, pour que les
 * deux mesures soient réellement indépendantes.
 */
export function echantillonAveugle() {
  const r = rng(SEED_AVEUGLE);
  const audit = new Set(echantillonAudit().lecons);
  const reste = slugs.filter((s) => !audit.has(s));
  return { seed: SEED_AVEUGLE, lecons: tirer(reste, 20, r).sort() };
}

if (process.argv[1]?.endsWith('v68-sample.mjs')) {
  if (process.argv.includes('--aveugle')) {
    console.log(JSON.stringify(echantillonAveugle(), null, 1));
  } else {
    const a = echantillonAudit();
    console.log(`ÉCHANTILLON D'AUDIT — seed ${a.seed} — ${a.lecons.length} leçons`);
    for (const s of a.lecons) {
      console.log(`  ${famille(s)}  ${periode(s).padEnd(13)} ${(CAT.get(s) ?? '?').padEnd(36)} ${s}`);
    }
    const f = a.lecons.map(famille);
    console.log(`  familles : A ${f.filter((x) => x === 'A').length} · B ${f.filter((x) => x === 'B').length} · C ${f.filter((x) => x === 'C').length}`);
    const p = a.lecons.map(periode);
    console.log(`  périodes : ${['debut', 'milieu', 'fin', 'hors-parcours'].map((x) => x + ' ' + p.filter((y) => y === x).length).join(' · ')}`);
    console.log(`  catégories couvertes : ${new Set(a.lecons.map((s) => CAT.get(s))).size} / ${new Set(slugs.map((s) => CAT.get(s))).size}`);
  }
}
