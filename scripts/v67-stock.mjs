// V67 · CP2 — INVENTAIRE DU STOCK. LECTURE SEULE.
//
// Le brief demande de « traiter le stock », pas de produire neuf leçons
// vitrines. Ce script dit, pour chacune des 128 leçons : sa famille, la taille
// de son noyau, les fonctions pédagogiques absentes, les échecs objectifs
// (F2/F3), les drapeaux de lecture (F1/F4), sa densité de termes marqués, et —
// constat du CP0 — si une journée la programme.
//
// Il ne décide rien. Il dit OÙ LIRE, et dans quel ordre.

import { readFileSync, readdirSync } from 'node:fs';
import { famille, grammaire, keywordSoup, echecContrat } from './v67-audit.mjs';

const P = JSON.parse(readFileSync('data/program.json', 'utf8'));
const slugs = readdirSync('curriculum/lessons').filter((f) => f.endsWith('.md'))
  .map((f) => f.replace(/\.md$/, '')).sort();

/** Journées qui référencent chaque leçon. */
export const joursDe = new Map(slugs.map((s) => [s, []]));
for (const d of P.days) {
  let md = '';
  try { md = readFileSync(`curriculum/days/day-${String(d.day).padStart(3, '0')}.md`, 'utf8'); } catch { continue; }
  for (const s of new Set([...md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))) {
    if (joursDe.has(s)) joursDe.get(s).push(d.day);
  }
}

/** Compétences déclarées par le front-matter de la leçon, si présent. */
function skillsDe(md) {
  const m = /^skills?\s*:\s*(.+)$/im.exec(md.slice(0, 600));
  return m ? m[1].split(/[,;]/).map((x) => x.trim().replace(/^\[|\]$/g, '')).filter(Boolean) : [];
}

export function stock() {
  return slugs.map((slug) => {
    const md = readFileSync(`curriculum/lessons/${slug}.md`, 'utf8');
    const f = famille(md);
    const g = grammaire(md);
    const e = echecContrat(md);
    const k = keywordSoup(md);
    const jours = joursDe.get(slug);
    return {
      slug,
      famille: f.famille,
      core: f.core,
      mots: md.split(/\s+/).filter(Boolean).length,
      absentes: Object.entries(g).filter(([, v]) => !v).map(([x]) => x),
      echoue: e.echoue,
      drapeaux: [e.F1 && 'F1', e.F4 && 'F4'].filter(Boolean),
      soupe: k.pireFenetre,
      jours,
      orpheline: jours.length === 0,
      skills: skillsDe(md),
    };
  });
}

if (process.argv[1]?.endsWith('v67-stock.mjs')) {
  const S = stock();
  if (process.argv.includes('--json')) { console.log(JSON.stringify(S, null, 1)); process.exit(0); }
  const orph = S.filter((x) => x.orpheline);
  const ech = S.filter((x) => x.echoue);
  console.log(`128 leçons · ${orph.length} orphelines · ${ech.length} échecs objectifs · ${S.filter((x) => x.drapeaux.length).length} drapeaux`);
  console.log('\nPRIORITÉ 1 — orphelines (aucune journée ne les programme) :');
  for (const x of orph) console.log(`  ${x.famille} ${String(x.core).padStart(4)}m  soupe ${String(x.soupe).padStart(2)}  ${x.slug}${x.echoue ? '  ⛔' : ''}`);
  console.log('\nPRIORITÉ 2 — échecs objectifs sur le chemin :');
  for (const x of ech.filter((x) => !x.orpheline)) console.log(`  ${x.famille} ${String(x.core).padStart(4)}m  j.${x.jours.join(',')}  ${x.slug}  manque: ${x.absentes.join(' ')}`);
  console.log('\nPRIORITÉ 3 — drapeaux de lecture sur le chemin :');
  for (const x of S.filter((x) => !x.orpheline && !x.echoue && x.drapeaux.length)) {
    console.log(`  ${x.famille} ${String(x.core).padStart(4)}m  ${x.drapeaux.join('+')}  ${x.slug}`);
  }
}
