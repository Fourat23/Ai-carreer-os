// V67 · CP3-CP8 — État d'une leçon en une ligne. LECTURE SEULE.
//
// Sert à ne pas retravailler à l'aveugle : famille, taille du noyau, échec
// objectif, drapeaux, densité de termes, fonctions absentes, journées qui la
// programment. Ne dit PAS si la leçon enseigne — c'est la lecture qui le dit.

import { readFileSync } from 'node:fs';
import { famille, grammaire, keywordSoup, echecContrat } from './v67-audit.mjs';
import { joursDe } from './v67-stock.mjs';

export function etat(slug) {
  const md = readFileSync(`curriculum/lessons/${slug}.md`, 'utf8');
  const f = famille(md); const e = echecContrat(md); const g = grammaire(md);
  return {
    slug,
    famille: f.famille,
    core: f.core,
    echoue: e.echoue,
    drapeaux: [e.F1 && 'F1', e.F4 && 'F4'].filter(Boolean),
    soupe: keywordSoup(md).pireFenetre,
    absentes: Object.entries(g).filter(([, v]) => !v).map(([x]) => x),
    jours: joursDe.get(slug) ?? [],
  };
}

export function ligne(x) {
  return `${x.slug.padEnd(32)} ${x.famille} ${String(x.core).padStart(4)}m `
    + `${x.echoue ? '⛔' : '  '} ${(x.drapeaux.join('+') || '—').padEnd(5)} `
    + `soupe ${String(x.soupe).padStart(2)}  j.${x.jours.length}  `
    + `${x.absentes.length ? 'manque: ' + x.absentes.join(' ') : ''}`;
}

if (process.argv[1]?.endsWith('v67-lesson.mjs')) {
  for (const s of process.argv.slice(2)) console.log(ligne(etat(s)));
}
