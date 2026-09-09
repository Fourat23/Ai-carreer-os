// V72 CP8 — pour chaque domaine historiquement hors parcours : que promet le programme,
// qu enseigne-t-il, que reference-t-il seulement, que fait-il PRATIQUER ?
import { readFileSync, readdirSync, existsSync } from 'node:fs';
const prog = JSON.parse(readFileSync('data/program.json', 'utf8'));
const n3 = (n) => String(n).padStart(3, '0');
const cite = new Map();
const contenuJours = new Map();
for (const d of prog.days) {
  const f = `curriculum/days/day-${n3(d.day)}.md`; if (!existsSync(f)) continue;
  const md = readFileSync(f, 'utf8'); contenuJours.set(d.day, md);
  for (const m of md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)) { if (!cite.has(m[1])) cite.set(m[1], []); cite.get(m[1]).push(d.day); }
}
const DOM = {
  Cloud: { lecons: /^cloud-/, mots: /\bcloud\b|\baws\b|\bazure\b|\bs3\b|\biam\b|\bec2\b|vpc|serverless/i },
  Kubernetes: { lecons: /^k8s-/, mots: /kubernetes|kubectl|\bpod\b|cluster|helm/i },
  'Next.js': { lecons: /^nextjs-/, mots: /next\.?js|ssr|rendu (c[oô]t[eé] )?serveur|hydrat/i },
  CSS: { lecons: /^css-|^responsive-/, mots: /\bcss\b|flexbox|grid-template|media quer|responsive|box model/i },
  'Linux/livraison': { lecons: /^linux-services|^linux-ssh|^deployment-strategies|^iac-|^release-incident/, mots: /systemd|systemctl|\bssh\b|terraform|blue-?green|canary|rollback|iac\b/i },
  Docker: { lecons: /^docker-/, mots: /docker|conteneur|dockerfile|compose/i },
};
const lecons = readdirSync('curriculum/lessons').filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
console.log(`${'domaine'.padEnd(17)}${'lecons'.padEnd(8)}${'sur parcours'.padEnd(14)}${'jours citant'.padEnd(13)}${'jours parlant du sujet'.padEnd(23)}pratique`);
for (const [nom, d] of Object.entries(DOM)) {
  const L = lecons.filter((s) => d.lecons.test(s));
  const surP = L.filter((s) => cite.has(s));
  const joursCitant = new Set(); for (const s of surP) for (const j of cite.get(s)) joursCitant.add(j);
  // jours dont le CONTENU parle du sujet (hors simple lien)
  const joursParlant = [...contenuJours].filter(([, md]) => (md.replace(/\/doc\/lessons\/[a-z0-9-]+/g, '').match(d.mots) ?? []).length).map(([j]) => j);
  // pratique reelle : le mot apparait dans un livrable de journee
  const prat = prog.days.filter((x) => x.deliverable && d.mots.test(x.deliverable)).map((x) => x.day);
  console.log(`${nom.padEnd(17)}${String(L.length).padEnd(8)}${String(surP.length).padEnd(14)}${String(joursCitant.size).padEnd(13)}${String(joursParlant.length).padEnd(23)}${prat.length ? prat.join(',') : 'AUCUN LIVRABLE'}`);
}
