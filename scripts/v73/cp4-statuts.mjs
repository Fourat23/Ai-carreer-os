// V73 · CP4 — STATUT EXPLICITE DES 128 LEÇONS.
//
// Règle I5 du contrat : « toute leçon a un statut ». Aucune zone grise : pas une seule leçon
// dont on ne sache pas quand elle sert.
//
// Le classement est DÉRIVÉ de propriétés déclarées (règle S1), jamais d'une impression :
//   - programmée ou non          → liens `/doc/lessons/` des 365 journées générées
//   - compétence déclarée        → champ `skills` de `scripts/data/lessons-map.mjs`
//   - exigée par une leçon CORE  → section « Prérequis », citation NON annoncée
//   - supposée par un livrable   → la leçon est programmée sur une journée de projet
//   - ancre depuis le parcours   → citée quelque part par une leçon programmée
//   - encadré d'étagère          → présence du bandeau de référence dans son propre texte
//
// Le statut n'est pas un jugement de valeur : `ADVANCED` ne veut pas dire « meilleure », et
// `REFERENCE` ne veut pas dire « moins bonne ». Le CP0 a lu huit leçons intégralement, dont
// quatre hors parcours, et les a trouvées excellentes.
//
// Usage : node scripts/v73/cp4-statuts.mjs [--json]
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const { LESSONS } = await import('../data/lessons-map.mjs');
const g = JSON.parse(readFileSync('docs/v73/curriculum-graph.json', 'utf8'));
const lire = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const slugs = readdirSync('curriculum/lessons').filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3));
const META = new Map(LESSONS.map((l) => [l.file.replace(/\.md$/, ''), l]));

// ── propriétés déclarées
const joursTravail = new Map(), joursRevue = new Map();
const estProjet = new Set(g.jours.filter((d) => /^Projet \d/.test(d.titre)).map((d) => d.j));
for (const d of g.jours)
  for (const s of d.lecons) {
    const m = d.revue ? joursRevue : joursTravail;
    if (!m.has(s)) m.set(s, []);
    m.get(s).push(d.j);
  }

// exigences réelles (non annoncées) — même règle qu'au CP2
const normaliser = (t) => t.replace(/^\s*>\s?/gm, '').replace(/[*`]/g, '').replace(/\s+/g, ' ');
const ANNONCE = /programmées? plus loin|programmées? au mois|plus loin dans le parcours|rien ici ne suppose|viendra plus loin|étagère de référence|n'est programmée par aucune|sans l'avoir lue|se suit sans|tu y reviendras|n'en dépend pas|est approfondie? dans|sont approfondis dans|si tu l'as vue|d'abord.{0,40}ensuite/i;
const exigePar = new Map();           // slug -> [leçons qui l'EXIGENT réellement]
const citePar = new Map();            // slug -> [leçons qui la citent, où que ce soit]
for (const s of slugs) {
  const md = lire(`curriculum/lessons/${s}.md`);
  for (const m of md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)) {
    if (m[1] === s) continue;
    if (!citePar.has(m[1])) citePar.set(m[1], []);
    if (!citePar.get(m[1]).includes(s)) citePar.get(m[1]).push(s);
  }
  const i = md.indexOf('## 🧩 Prérequis'); if (i < 0) continue;
  const j = md.indexOf('\n## ', i + 1);
  const bloc = md.slice(i, j < 0 ? md.length : j);
  const lignes = bloc.split('\n');
  for (const dep of [...new Set([...bloc.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))]) {
    if (dep === s) continue;
    const cite = `/doc/lessons/${dep}`;
    let portee = null;
    for (let k = 0; k < lignes.length; k++) {
      if (!/^\s*>/.test(lignes[k]) || !lignes[k].includes(cite)) continue;
      let a = k, b = k;
      while (a > 0 && /^\s*>/.test(lignes[a - 1])) a--;
      while (b < lignes.length - 1 && /^\s*>/.test(lignes[b + 1])) b++;
      portee = normaliser(lignes.slice(a, b + 1).join('\n')); break;
    }
    if (portee === null) {
      const plat = normaliser(bloc); const pos = plat.indexOf(cite);
      const deb = Math.max(0, plat.lastIndexOf('. ', pos) + 1); const fin = plat.indexOf('. ', pos);
      portee = plat.slice(deb, fin < 0 ? plat.length : fin + 1);
    }
    if (ANNONCE.test(portee)) continue;
    if (!exigePar.has(dep)) exigePar.set(dep, []);
    exigePar.get(dep).push(s);
  }
}

// ── classement, en deux passes : CORE d'abord, puis le reste (CORE dépend de CORE)
const fiche = (s) => {
  const m = META.get(s) ?? {};
  const jt = joursTravail.get(s) ?? [];
  return {
    slug: s, titre: m.title ?? s, domaine: m.cat ?? '?', niveau: m.level ?? null,
    competences: m.skills ?? [], pratiques: (m.practiceRefs ?? []).length,
    programmee: jt.length > 0, jours: jt, revues: joursRevue.get(s) ?? [],
    surProjet: jt.filter((j) => estProjet.has(j)),
    exigeePar: exigePar.get(s) ?? [], citeePar: citePar.get(s) ?? [],
    etagere: /Étagère de référence/i.test(lire(`curriculum/lessons/${s}.md`)),
  };
};
const fiches = new Map(slugs.map((s) => [s, fiche(s)]));

// passe 1 — noyau : programmée, portant une compétence déclarée
const core = new Set();
for (const f of fiches.values())
  if (f.programmee && f.competences.length) core.add(f.slug);
// passe 2 — POINT FIXE, et non une passe unique. La troisième condition du contrat
// (« un livrable la suppose OU une leçon CORE la cite en prérequis ») est récursive : retirer
// une leçon du noyau peut en priver une autre de son seul appui. Une passe unique donnerait
// donc un résultat qui dépend de l'ordre de parcours. On itère jusqu'à stabilité.
//
// Interprétation déclarée, et elle est PLUS INDULGENTE que la lettre du contrat : une leçon
// programmée sur DEUX journées ou plus, ou reprise par une revue, est conservée au noyau même
// si aucune leçon CORE ne l'exige — être enseignée deux fois ou révisée est une preuve
// d'intention suffisante. Sans cette indulgence, le noyau se réduirait bien au-delà de ce que
// le contrat vise.
for (let bouge = true; bouge; ) {
  bouge = false;
  for (const f of fiches.values()) {
    if (!core.has(f.slug)) continue;
    const exigeeParCore = f.exigeePar.some((x) => core.has(x));
    if (!f.surProjet.length && !exigeeParCore && f.jours.length <= 1 && !f.revues.length) { core.delete(f.slug); bouge = true; }
  }
}

const statut = (f) => {
  if (core.has(f.slug)) return ['CORE', 'programmée, porte une compétence déclarée, et sert un livrable ou une leçon du noyau'];
  if (f.programmee) return ['OPTIONAL', 'programmée, mais aucun livrable ni leçon du noyau ne la suppose'];
  const ancres = f.citeePar.filter((x) => fiches.get(x)?.programmee);
  if (ancres.length && f.competences.length)
    return ['ADVANCED', `approfondissement d'une compétence déclarée, ancré depuis ${ancres.length} leçon(s) programmée(s) : ${ancres.join(', ')}`];
  if (f.etagere) return ['REFERENCE', 'non programmée, déclarée « étagère de référence » dans son propre texte'];
  return ['ZONE GRISE', 'non programmée, sans ancre depuis le parcours — INTERDIT par la règle I5'];
};

const sortie = [];
for (const s of slugs) {
  const f = fiches.get(s); const [st, raison] = statut(f);
  sortie.push({ ...f, statut: st, raison });
}

if (process.argv.includes('--json')) { process.stdout.write(JSON.stringify(sortie, null, 1)); }
else {
  const cnt = {};
  for (const r of sortie) cnt[r.statut] = (cnt[r.statut] ?? 0) + 1;
  console.log(`128 leçons · statuts : ${JSON.stringify(cnt)}`);
  const grise = sortie.filter((r) => r.statut === 'ZONE GRISE');
  console.log(`\nZONE GRISE (interdite par I5) : ${grise.length}`);
  for (const r of grise) console.log(`   ❌ ${r.slug}`);
  console.log('\n— non programmées —');
  for (const r of sortie.filter((x) => !x.programmee))
    console.log(`  ${r.statut.padEnd(9)} ${r.slug.padEnd(30)} ${r.raison.slice(0, 96)}`);
  console.log('\n— OPTIONAL programmées —');
  for (const r of sortie.filter((x) => x.statut === 'OPTIONAL'))
    console.log(`  ${r.slug.padEnd(30)} j${r.jours.join(',')} · ${r.competences.join('/')}`);
  process.exit(grise.length ? 1 : 0);
}
