// Simule la fonction appelRobuste telle qu'ecrite dans la lecon, en temps virtuel.
function simuler({ essaisMax = 3, timeout = 30_000, backoff = (e) => 1000 * 2 ** e, comportement }) {
  let t = 0; const journal = [];
  for (let essai = 1; essai <= essaisMax; essai++) {
    const r = comportement(essai);
    t += r.duree; journal.push(`essai ${essai}: ${r.type} apres ${r.duree} ms (t=${t})`);
    if (r.type === 'succes') return { t, journal, issue: 'succes' };
    if (!r.transitoire || essai === essaisMax) return { t, journal, issue: 'degrade' };
    const w = backoff(essai); t += w; journal.push(`  attente ${w} ms (t=${t})`);
  }
  return { t, journal, issue: 'degrade' };
}

const cas = {
  'A. le service ne repond plus du tout (3 timeouts)':
    () => ({ type: 'timeout', duree: 30_000, transitoire: true }),
  'B. service sature, refuse vite (3x 503 immediats)':
    () => ({ type: '503', duree: 50, transitoire: true }),
  'C. cle invalide (401, non transitoire)':
    () => ({ type: '401', duree: 50, transitoire: false }),
  'D. hoquet: echoue 1 fois puis repond en 2 s':
    (e) => e === 1 ? { type: '503', duree: 50, transitoire: true } : { type: 'succes', duree: 2000 },
  'E. lent mais vivant: repond en 29 s au 1er essai':
    () => ({ type: 'succes', duree: 29_000 }),
};

for (const [nom, comportement] of Object.entries(cas)) {
  const r = simuler({ comportement });
  console.log(`${nom}\n   -> ${r.issue} en ${(r.t / 1000).toFixed(1)} s`);
  r.journal.forEach((l) => console.log('      ' + l));
}

console.log('\n--- budget total contre budget par essai ---');
const pire = simuler({ comportement: () => ({ type: 'timeout', duree: 30_000, transitoire: true }) }).t;
console.log('pire cas de la fonction telle qu ecrite :', pire, 'ms =', (pire / 1000).toFixed(0), 's');
console.log('si l appelant HTTP coupe a 30 s, la fonction depasse des l essai 2 : ', pire > 30_000);
console.log('nb de requetes envoyees au service en panne, par appel client :', 3);
console.log('avec 200 clients simultanes qui reessaient :', 200 * 3, 'requetes vers un service deja tombe');
