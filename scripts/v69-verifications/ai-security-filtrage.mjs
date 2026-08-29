// 20 documents, dont seulement une partie est accessible a l utilisateur "alice".
const N = 20;
const corpus = Array.from({ length: N }, (_, i) => ({
  id: `doc-${String(i).padStart(2, '0')}',`.slice(0, 6),
  score: +(1 - i * 0.04).toFixed(2),                 // pertinence decroissante
  equipe: i % 3 === 0 ? 'alice' : 'autre',           // 7 docs sur 20 lui appartiennent
}));
const K = 5;

const parScore = [...corpus].sort((a, b) => b.score - a.score);

// A) filtrer APRES la recherche : on prend les K meilleurs, puis on retire ce qui est interdit
const apres = parScore.slice(0, K).filter((d) => d.equipe === 'alice');
// B) filtrer PENDANT la recherche : on ne cherche que dans ce qui est autorise
const pendant = parScore.filter((d) => d.equipe === 'alice').slice(0, K);

console.log(`corpus = ${N} documents, dont ${corpus.filter(d=>d.equipe==='alice').length} accessibles a alice. k = ${K}\n`);
console.log('A) filtrage APRES la recherche');
console.log('   documents remis au modele :', apres.length, '/', K, '-> scores', apres.map(d=>d.score).join(', ') || '(aucun)');
console.log('   documents interdits qui ont ete LUS par le systeme :', parScore.slice(0,K).filter(d=>d.equipe!=='alice').length);
console.log('\nB) filtrage PENDANT la recherche');
console.log('   documents remis au modele :', pendant.length, '/', K, '-> scores', pendant.map(d=>d.score).join(', '));
console.log('   documents interdits lus :', 0);

console.log('\nEt si on augmente k pour compenser le manque de resultats en A ?');
for (const k of [5, 10, 15, 20]) {
  const t = parScore.slice(0, k);
  console.log(`   k=${String(k).padStart(2)} -> ${t.filter(d=>d.equipe==='alice').length} autorises retenus, ${t.filter(d=>d.equipe!=='alice').length} interdits traverses`);
}
