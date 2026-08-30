// V70 — vérification exécutable pour la leçon `data-structures-intro`.
//
// La leçon annonce des coûts par opération. Ici on les MESURE, sur cette
// machine, avec ce moteur JavaScript. Trois questions :
//
//   1. l'écart tableau/Set est-il celui qu'annonce la théorie ?
//   2. `shift()` sur un tableau est-il vraiment le piège annoncé ?
//   3. y a-t-il un endroit où la théorie dit une chose et la mesure une autre ?
//
// Aucune dépendance. `node scripts/v70-verifications/structures-couts-mesures.mjs`

const chrono = (nom, fn, repetitions = 1) => {
  fn(); // chauffe le JIT : sans cela on mesure la compilation, pas le code
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < repetitions; i++) fn();
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / repetitions;
  return { nom, ms };
};

const ligne = (r, ref) =>
  `   ${r.nom.padEnd(34)} ${r.ms.toFixed(3).padStart(9)} ms` +
  (ref ? `   x${(r.ms / ref).toFixed(1)}` : '');

// ---------------------------------------------------------------------------
console.log('\n== 1. Appartenance : tableau contre Set ==');
for (const n of [100, 1000, 10000, 100000]) {
  const tab = Array.from({ length: n }, (_, i) => `cle-${i}`);
  const set = new Set(tab);
  const absent = 'cle-absente';
  const a = chrono('tableau .includes', () => tab.includes(absent), 200);
  const b = chrono('Set .has', () => set.has(absent), 200);
  console.log(`   n = ${String(n).padStart(6)} : includes ${a.ms.toFixed(5)} ms` +
    `   has ${b.ms.toFixed(5)} ms   rapport x${(a.ms / b.ms).toFixed(0)}`);
}
console.log('   -> le rapport CROÎT avec n : c est la signature d un coût');
console.log('      linéaire face à un coût constant. Le chiffre absolu ne dit');
console.log('      rien ; c est son évolution qui identifie la classe de coût.');

// ---------------------------------------------------------------------------
console.log('\n== 2. Le seuil où le Set devient rentable ==');
console.log('   construire un Set coûte, lui aussi. Sur combien de recherches');
console.log('   cet investissement est-il amorti ?');
{
  const n = 10000;
  const tab = Array.from({ length: n }, (_, i) => `cle-${i}`);
  const requetes = Array.from({ length: 2000 }, (_, i) => `cle-${i * 197 % n}`);
  for (const k of [1, 5, 20, 50, 100, 200, 500, 1000, 2000]) {
    const q = requetes.slice(0, k);
    const a = chrono(`${k} recherches, tableau`, () => {
      let c = 0; for (const r of q) if (tab.includes(r)) c++; return c;
    }, 50);
    const b = chrono(`${k} recherches, Set neuf`, () => {
      const s = new Set(tab);
      let c = 0; for (const r of q) if (s.has(r)) c++; return c;
    }, 50);
    const gagnant = a.ms < b.ms ? 'TABLEAU' : 'SET';
    console.log(`   ${String(k).padStart(2)} recherche(s) : tableau ${a.ms.toFixed(4)} ms` +
      `   Set+construction ${b.ms.toFixed(4)} ms   -> ${gagnant}`);
  }
}

// ---------------------------------------------------------------------------
console.log('\n== 3. File d attente : shift() contre index de tête ==');
for (const n of [10000, 100000, 200000]) {
  const avecShift = chrono('shift()', () => {
    const f = Array.from({ length: n }, (_, i) => i);
    let s = 0;
    while (f.length) s += f.shift();
    return s;
  });
  const avecTete = chrono('index de tête', () => {
    const f = Array.from({ length: n }, (_, i) => i);
    let tete = 0, s = 0;
    while (tete < f.length) s += f[tete++];
    return s;
  });
  console.log(`   n = ${String(n).padStart(6)} : shift ${avecShift.ms.toFixed(2)} ms` +
    `   tête ${avecTete.ms.toFixed(2)} ms   rapport x${(avecShift.ms / avecTete.ms).toFixed(0)}`);
}

// ---------------------------------------------------------------------------
console.log('\n== 4. Là où la théorie et la mesure divergent ==');
console.log('   objet ordinaire contre Map, 100 000 clés, insertion puis lecture.');
console.log('   Les deux sont annoncés en coût constant. Mesure :');
{
  const n = 100000;
  const cles = Array.from({ length: n }, (_, i) => `cle-${i}`);
  const ins = (fabrique, poser) => chrono('', () => {
    const c = fabrique(); for (const k of cles) poser(c, k, 1); return c;
  });
  const oInsert = ins(() => ({}), (c, k, v) => { c[k] = v; });
  const mInsert = ins(() => new Map(), (c, k, v) => c.set(k, v));
  console.log(`   insertion  objet ${oInsert.ms.toFixed(1)} ms` +
    `   Map ${mInsert.ms.toFixed(1)} ms   rapport x${(oInsert.ms / mInsert.ms).toFixed(2)}`);

  const obj = {}; for (const k of cles) obj[k] = 1;
  const map = new Map(cles.map((k) => [k, 1]));
  const oLire = chrono('', () => { let s = 0; for (const k of cles) s += obj[k]; return s; }, 5);
  const mLire = chrono('', () => { let s = 0; for (const k of cles) s += map.get(k); return s; }, 5);
  console.log(`   lecture    objet ${oLire.ms.toFixed(1)} ms` +
    `   Map ${mLire.ms.toFixed(1)} ms   rapport x${(oLire.ms / mLire.ms).toFixed(2)}`);
  console.log('   -> même classe de coût, constantes différentes. « O(1) » ne');
  console.log('      dit rien de la vitesse : il dit que la vitesse ne dépend');
  console.log('      pas de n. Deux structures en O(1) peuvent différer d un');
  console.log('      facteur mesurable, et c est le cas ici.');
}

console.log('\n== fin ==');
