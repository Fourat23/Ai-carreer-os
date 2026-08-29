// V69 CP13 — notation de l'échantillon aveugle sur le barème gelé (docs/V69-BAREME-GELE.md).
// Les notes sont un jugement documenté, pas une mesure automatique : elles sont
// justifiées dans docs/V69-CP13-AUDIT-AVEUGLE.md, lecture par lecture.
const DIM = ['D1 Clarté','D2 Vulgarisation','D3 Modèle mental','D4 Profondeur','D5 Progressivité',
  'D6 Exemple guidé','D7 Exactitude','D8 Pratique','D9 Correction','D10 Cas métier',
  'D11 Transfert','D12 Densité cognitive'];
const ENTREE = [4.3,4.0,4.4,3.0,3.1,2.4,4.5,3.5,4.1,4.1,3.2,2.8];   // CP0

// 8 leçons réécrites tirées à l'aveugle
const R = {
  'database-modeling':        [4.5,4.0,4.6,4.6,4.0,4.7,4.8,3.5,4.1,4.1,4.2,4.4],
  'html-semantic-structure':  [4.6,4.3,4.5,4.4,4.2,4.6,4.8,3.5,4.1,4.1,4.0,4.3],
  'machine-learning-basics':  [4.4,3.9,4.5,4.7,3.9,4.7,4.9,3.5,4.1,4.1,4.1,4.5],
  'networking-tcp-ip-model':  [4.5,4.2,4.5,4.3,4.1,4.4,4.4,3.5,4.1,4.1,4.0,4.2],
  'neural-networks':          [4.3,3.8,4.4,4.3,3.8,4.4,4.5,3.5,4.1,4.1,3.9,4.2],
  'pandas-data-wrangling':    [4.5,4.2,4.4,4.4,4.1,4.6,4.9,3.5,4.1,4.1,4.0,4.3],
  'react-hooks-effects':      [4.4,4.0,4.6,4.6,4.0,4.7,4.8,3.5,4.1,4.1,4.1,4.4],
  'sql-foundations':          [4.5,4.1,4.5,4.5,4.2,4.7,4.9,3.5,4.1,4.1,4.1,4.4],
};
// 8 leçons INTOUCHÉES tirées à l'aveugle — notées au même barème
const I = {
  'ci-cd-pipeline-anatomy':   [4.2,4.0,4.3,2.7,2.9,1.8,4.5,3.5,4.1,4.1,2.9,2.5],
  'css-fundamentals':         [4.4,4.2,4.4,3.2,3.2,2.9,4.6,3.5,4.1,4.1,3.1,3.0],
  'data-cleaning-quality':    [4.2,4.0,4.3,2.8,3.0,2.1,4.5,3.5,4.1,4.1,3.0,2.6],
  'database-migrations':      [4.3,4.0,4.4,3.0,3.1,2.4,4.5,3.5,4.1,4.1,3.1,2.8],
  'docker-networking-volumes':[4.2,3.9,4.3,2.7,2.9,1.9,4.5,3.5,4.1,4.1,2.9,2.5],
  'k8s-security':             [4.1,3.8,4.2,2.8,2.9,1.8,4.5,3.5,4.1,4.1,2.9,2.5],
  'portfolio-github':         [4.3,4.1,4.3,2.9,3.1,2.3,4.5,3.5,4.1,4.1,3.0,2.7],
  'slo-error-budget':         [4.3,4.0,4.4,3.1,3.1,2.2,4.6,3.5,4.1,4.1,3.1,2.8],
};
const moy = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const parDim = (g) => DIM.map((_, i) => moy(Object.values(g).map((v) => v[i])));

const mR = parDim(R), mI = parDim(I), mT = parDim({ ...R, ...I });
console.log('dimension'.padEnd(22), 'entrée', 'réécrites', 'intouchées', 'échantillon');
DIM.forEach((d, i) => console.log(
  d.padEnd(22), ENTREE[i].toFixed(2).padStart(6), mR[i].toFixed(2).padStart(9),
  mI[i].toFixed(2).padStart(10), mT[i].toFixed(2).padStart(11)));
console.log('\nMOYENNE'.padEnd(23), moy(ENTREE).toFixed(2).padStart(5), moy(mR).toFixed(2).padStart(9),
  moy(mI).toFixed(2).padStart(10), moy(mT).toFixed(2).padStart(11));

// Le corpus entier : 40 réécrites + 88 intouchées
const corpus = DIM.map((_, i) => (mR[i] * 40 + mI[i] * 88) / 128);
console.log('\n--- Extrapolation au corpus (40 réécrites / 88 intouchées) ---');
DIM.forEach((d, i) => console.log(`   ${d.padEnd(22)} ${corpus[i].toFixed(2)}`));
console.log(`   ${'MOYENNE'.padEnd(22)} ${moy(corpus).toFixed(2)}`);

console.log('\n--- Conditions ACADEMIC_QUALITY_READY (barème gelé §3) ---');
const c = [
  ['2. D6 exemple guidé ≥ 4,00', corpus[5], 4.00],
  ['3. D4 profondeur ≥ 4,00',    corpus[3], 4.00],
  ['4. D12 densité ≥ 4,00',      corpus[11], 4.00],
  ['5. min des dimensions ≥ 3,50', Math.min(...corpus), 3.50],
  ['6. moyenne ≥ 4,20',          moy(corpus), 4.20],
  ['7. échantillon aveugle ≥ 4,00', moy(mT), 4.00],
];
c.forEach(([n, v, s]) => console.log(`   ${v >= s ? 'OK  ' : 'ÉCHEC'} ${n.padEnd(32)} mesuré ${v.toFixed(2)} / seuil ${s.toFixed(2)}`));
console.log(`\n   Conditions numériques satisfaites : ${c.filter(([, v, s]) => v >= s).length}/6`);
