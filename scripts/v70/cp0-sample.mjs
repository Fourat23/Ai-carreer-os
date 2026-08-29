// V70 CP0 — échantillon aveugle PRÉ-ENREGISTRÉ. Graine : V70-ACADEMIC-CORPUS-24.
// Tiré AVANT toute réécriture. Ne doit jamais être modifié (utilisé au CP13).
import fs from 'node:fs';
import { CORPUS } from './extract.mjs';

// PRNG déterministe amorcé par la chaîne de graine (FNV-1a puis xorshift32).
const SEED = 'V70-ACADEMIC-CORPUS-24';
let h = 2166136261 >>> 0;
for (const c of SEED) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
let s = h || 1;
const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
const melange = (a) => { const p = [...a]; for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } return p; };

// --- domaine déduit du slug (aucune donnée inventée : simple regroupement) ---
const DOM = (s) =>
  /^(cloud|iac|k8s|docker|linux|networking|ci-cd|deployment|release|observability|slo|incident|postmortem|metrics|sre)/.test(s) ? 'Systèmes & Cloud' :
  /^(react|css|html|web-|frontend|nextjs|responsive|browser|accessib)/.test(s) ? 'Frontend' :
  /^(sql|database|data-|etl|pandas|statistics|feature|model-|machine|neural|deep)/.test(s) ? 'Données & ML' :
  /^(llm|prompt|embeddings|rag|transformers|agent|ai-)/.test(s) ? 'IA appliquée' :
  /^(http|api|express|auth|caching|async-mess|breaking|architecture|error-handl|security|owasp)/.test(s) ? 'Web & Backend' :
  'Fondations';

const enrichi = CORPUS.map((l) => ({
  slug: l.slug, dom: DOM(l.slug), prog: l.programmee,
  guide: l.lGuide, total: l.total,
  // « note superficielle » : ce que verrait quelqu'un qui ne regarde que les compteurs
  superficiel: (l.lGuide >= 250 ? 2 : 0) + (l.lExo >= 40 ? 1 : 0) + (l.aCorr ? 1 : 0) + (l.aMetier ? 1 : 0),
}));

// --- stratification : domaine × (court/long) × (programmée/hors) × (bon/mauvais compteur)
const strate = (l) => `${l.dom}|${l.guide >= 250 ? 'long' : 'court'}|${l.prog ? 'prog' : 'hors'}|${l.superficiel >= 3 ? 'bon' : 'faible'}`;
const groupes = new Map();
for (const l of enrichi) { const k = strate(l); if (!groupes.has(k)) groupes.set(k, []); groupes.get(k).push(l); }

// tirage : un par strate dans l'ordre des strates mélangé, puis complétion uniforme
const cles = melange([...groupes.keys()].sort());
const choisis = [];
for (const k of cles) { if (choisis.length >= 24) break; choisis.push(melange(groupes.get(k))[0]); }
if (choisis.length < 24) {
  const reste = melange(enrichi.filter((l) => !choisis.some((c) => c.slug === l.slug)));
  while (choisis.length < 24) choisis.push(reste.pop());
}
choisis.sort((a, b) => a.slug.localeCompare(b.slug));

let md = `# V70 — Échantillon aveugle pré-enregistré

**Graine :** \`${SEED}\`
**Tiré le :** avant toute réécriture (CP0), publié tel quel.
**Usage :** CP13 uniquement. **Cet échantillon ne doit jamais être modifié.**

Stratification sur quatre axes simultanés : domaine · exemple guidé long/court ·
leçon programmée ou hors parcours · « bonne ou faible » selon les compteurs
superficiels. Le dernier axe est volontaire : il force l'échantillon à contenir des
leçons que les métriques automatiques jugent bonnes, pour pouvoir les contredire.

${groupes.size} strates non vides ; ${choisis.length} leçons tirées.

| # | leçon | domaine | exemple guidé | parcours | note superficielle |
|---|---|---|---:|---|---:|
`;
choisis.forEach((l, i) => {
  md += `| ${i + 1} | \`${l.slug}\` | ${l.dom} | ${l.guide} mots | ${l.prog ? 'programmée' : 'hors parcours'} | ${l.superficiel}/5 |\n`;
});
md += `
## Répartition obtenue

| axe | répartition |
|---|---|
| domaines | ${[...new Set(choisis.map((l) => l.dom))].map((d) => `${d} ${choisis.filter((l) => l.dom === d).length}`).join(' · ')} |
| exemple guidé | long ${choisis.filter((l) => l.guide >= 250).length} · court ${choisis.filter((l) => l.guide < 250).length} |
| parcours | programmées ${choisis.filter((l) => l.prog).length} · hors ${choisis.filter((l) => !l.prog).length} |
| compteurs | « bonnes » ${choisis.filter((l) => l.superficiel >= 3).length} · « faibles » ${choisis.filter((l) => l.superficiel < 3).length} |
`;
fs.writeFileSync('docs/V70-BLIND-SAMPLE.md', md);
console.log(md.split('## Répartition')[1]);
console.log('→ docs/V70-BLIND-SAMPLE.md');
