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
const ID = /`([a-z][a-z0-9]+(?:-[a-z0-9]+){1,4})`/g;
const mortes = new Map();
for (const f of readdirSync('curriculum/lessons').filter((x) => x.endsWith('.md')).sort()) {
  const md = readFileSync(`curriculum/lessons/${f}`, 'utf8');
  for (const bloc of md.matchAll(/^## .*(?:Pratique|Exercice).*$([\s\S]*?)(?=^## |$)/gm))
    for (const [, c] of bloc[1].matchAll(ID)) {
      if (connus.has(c) || lecons.has(c) || TERME.test(c)) continue;
      if (!mortes.has(c)) mortes.set(c, new Set());
      mortes.get(c).add(f.slice(0, -3));
    }
}
console.log(`identifiants connus : ${connus.size} · leçons : ${lecons.size}`);
console.log(`RÉFÉRENCES MORTES dans une section de pratique : ${mortes.size}`);
for (const [c, l] of mortes) console.log(`  ${c.padEnd(30)} cité par ${[...l].join(', ')}`);
process.exit(mortes.size ? 1 : 0);
