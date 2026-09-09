// V72 — CP9. Une leçon cite-t-elle un exercice, un playbook ou un diagnostic qui n existe pas ?
// Aucun gate ne le voit : les gates verifient les CATALOGUES, pas la prose des lecons.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
const DOSSIERS = ['exercises', 'missions', 'capstones', 'terminal-tasks', 'playbooks', 'pipelines',
  'security', 'cloud', 'topologies', 'manifests', 'transfer-challenges', 'assessments'];
const connus = new Set();
for (const d of DOSSIERS) { const p = `data/${d}`; if (existsSync(p)) for (const f of readdirSync(p)) if (f.endsWith('.json')) connus.add(f.slice(0, -5)); }
const lecons = new Set(readdirSync('curriculum/lessons').filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)));
// termes techniques ecrits en code, qui ressemblent a un identifiant sans en etre un
const TERME = /^(aria-|auto-fill|auto-fit|grid-template|cherry-pick|pre-commit|pas-un-|box-sizing|border-box|min-width|max-width|flex-|align-|justify-)/;
// Renvoie le contenu des sections « ## … Pratique … » ou « ## … Exercice … » d'une leçon.
function sectionsPratique(md) {
  const out = []; let dedans = false, buf = [];
  for (const l of md.split('\n')) {
    if (l.startsWith('## ')) {
      if (dedans) { out.push(buf.join('\n')); buf = []; }
      dedans = /Pratique|Exercice/.test(l);
    } else if (dedans) buf.push(l);
  }
  if (dedans) out.push(buf.join('\n'));
  return out;
}

const ID = /`([a-z][a-z0-9]+(?:-[a-z0-9]+){1,4})`/g;
const mortes = new Map();
for (const f of readdirSync('curriculum/lessons').filter((x) => x.endsWith('.md')).sort()) {
  const md = readFileSync(`curriculum/lessons/${f}`, 'utf8');
  // Découpage par titre plutôt que par expression régulière : avec le drapeau `m`,
  // `$` marque la fin de LIGNE, donc `([\s\S]*?)(?=^## |$)` capturait une chaîne VIDE.
  // Le contrôle passait sur du néant et annonçait « 0 référence morte ». Trouvé par le
  // test négatif n° 8 du CP12, qui est exactement ce à quoi sert un test négatif.
  for (const bloc of sectionsPratique(md))
    for (const [, c] of bloc.matchAll(ID)) {
      if (connus.has(c) || lecons.has(c) || TERME.test(c)) continue;
      if (!mortes.has(c)) mortes.set(c, new Set());
      mortes.get(c).add(f.slice(0, -3));
    }
}
console.log(`identifiants connus : ${connus.size} · leçons : ${lecons.size}`);
console.log(`RÉFÉRENCES MORTES dans une section de pratique : ${mortes.size}`);
for (const [c, l] of mortes) console.log(`  ${c.padEnd(30)} cité par ${[...l].join(', ')}`);
process.exit(mortes.size ? 1 : 0);
