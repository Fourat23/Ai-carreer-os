// V73 · CP0 — audit forensique du curriculum. LECTURE SEULE, aucune écriture hors du JSON.
//
// Principe directeur du sprint : mesurer une PROPRIÉTÉ, pas un marqueur. Chaque sortie de ce
// script est une donnée à interpréter par lecture, jamais un verdict. Les sondes qui se sont
// révélées fausses lors des sprints précédents sont signalées dans les commentaires.
//
// Usage : node scripts/v73/cp0-forensique.mjs [--json]
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const prog = JSON.parse(readFileSync('data/program.json', 'utf8'));
const { LESSONS, LESSON_BY_SKILL } = await import('../data/lessons-map.mjs');
const { LESSONS_V67 } = await import('../data/days-lessons-v67.mjs');
const n3 = (n) => String(n).padStart(3, '0');
const lire = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');

// ───────────────────────────────────────────── inventaire des identifiants du produit
const idsExistants = new Set();
for (const d of ['exercises', 'playbooks', 'assessments', 'capstones', 'missions', 'pipelines',
                 'topologies', 'lab-workspaces', 'terminal-tasks', 'transfer-challenges',
                 'security', 'cloud', 'manifests']) {
  const dir = `data/${d}`;
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) if (f.endsWith('.json')) idsExistants.add(f.slice(0, -5));
}
const slugsLecons = new Set(readdirSync('curriculum/lessons').filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)));

// ───────────────────────────────────────────── journées : texte, leçons, sections
const jours = [];
for (const d of prog.days) {
  const md = lire(`curriculum/days/day-${n3(d.day)}.md`);
  const sol = lire(`curriculum/solutions/day-${n3(d.day)}-solution.md`);
  const slugs = [...new Set([...md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))];
  jours.push({ ...d, md, sol, lecons: slugs.filter((s) => slugsLecons.has(s)), leconsMortes: slugs.filter((s) => !slugsLecons.has(s)) });
}

// première journée qui programme chaque leçon
const premiereExposition = new Map();
for (const j of jours) for (const s of j.lecons) if (!premiereExposition.has(s)) premiereExposition.set(s, j.day);
// première journée NON-REVUE (une revue ne compte pas comme enseignement)
const premierEnseignement = new Map();
for (const j of jours) if (!j.isReview) for (const s of j.lecons) if (!premierEnseignement.has(s)) premierEnseignement.set(s, j.day);

// ───────────────────────────────────────────── A. carte des compétences
const parSkillJours = new Map();
for (const j of jours) { if (!parSkillJours.has(j.skill)) parSkillJours.set(j.skill, []); parSkillJours.get(j.skill).push(j.day); }

const skillsDeLecon = new Map();          // skill -> [slug] d'après lessons-map
for (const e of LESSONS) for (const s of e.skills ?? []) {
  if (!skillsDeLecon.has(s)) skillsDeLecon.set(s, []);
  skillsDeLecon.get(s).push(e.file.replace(/\.md$/, ''));
}

// exercices rattachés à une compétence via les leçons qui la portent
const exercicesDeLecon = new Map(LESSONS.map((e) => [e.file.replace(/\.md$/, ''), (e.practiceRefs ?? [])]));

const competences = prog.skills.map((s) => {
  const js = parSkillJours.get(s.id) ?? [];
  const jsTravail = js.filter((d) => !prog.days[d - 1].isReview);
  const jsRevue = js.filter((d) => prog.days[d - 1].isReview);
  const leconsDeclarees = skillsDeLecon.get(s.id) ?? [];
  const leconsProgrammees = leconsDeclarees.filter((l) => premiereExposition.has(l));
  const refsDefaut = (LESSON_BY_SKILL[s.id] ?? []).map((f) => f.replace(/\.md$/, ''));
  const ex = new Set();
  for (const l of leconsDeclarees) for (const r of exercicesDeLecon.get(l) ?? []) ex.add(`${r.kind}:${r.id}`);
  const moisAttendu = prog.months.filter((m) => m.expectedScores && s.id in m.expectedScores).map((m) => ({ m: m.month, score: m.expectedScores[s.id] }));
  const projets = [...new Set(jours.filter((j) => j.skill === s.id && j.project).map((j) => j.project.name))];
  return {
    id: s.id, nom: s.name,
    joursTotal: js.length, joursTravail: jsTravail.length, joursRevue: jsRevue.length,
    premier: js[0] ?? null, dernier: js.at(-1) ?? null,
    leconsQuiLaDeclarent: leconsDeclarees.length,
    leconsProgrammees: leconsProgrammees.length,
    leconsHorsParcours: leconsDeclarees.length - leconsProgrammees.length,
    refsParDefaut: refsDefaut.length,
    pratiques: ex.size,
    projets,
    moisAvecScoreAttendu: moisAttendu,
    // une compétence est « évaluée avant enseignement » si un mois lui fixe un score
    // avant sa première journée de travail
    evalueeAvantEnseignement: moisAttendu.filter((a) => {
      const finMois = Math.max(...jours.filter((j) => j.month === a.m).map((j) => j.day));
      return jsTravail.length === 0 || jsTravail[0] > finMois;
    }),
  };
});

// ───────────────────────────────────────────── B. leçons hors parcours
const horsParcours = [...slugsLecons].filter((s) => !premiereExposition.has(s)).sort();
const detailHors = horsParcours.map((s) => {
  const e = LESSONS.find((x) => x.file === `${s}.md`);
  const md = lire(`curriculum/lessons/${s}.md`);
  const cite = [...new Set([...md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))].filter((x) => x !== s);
  const citeePar = [...slugsLecons].filter((autre) => autre !== s && lire(`curriculum/lessons/${autre}.md`).includes(`/doc/lessons/${s}`));
  return { slug: s, cat: e?.cat ?? '?', level: e?.level ?? null, min: e?.min ?? null,
           skills: e?.skills ?? [], pratiques: (e?.practiceRefs ?? []).length,
           mots: md.split(/\s+/).length, cite, citeePar,
           citeeParProgrammee: citeePar.filter((x) => premiereExposition.has(x)) };
});

// ───────────────────────────────────────────── C. prérequis
// La section « Prérequis » d'une leçon programmée cite-t-elle une leçon enseignée APRÈS ?
// La classification finale se fait à la LECTURE ; ce script ne fait que produire les candidats
// avec leur formulation exacte, pour que le classement porte sur la phrase, pas sur un motif.
const candidatsPrereq = [];
for (const s of slugsLecons) {
  const jourL = premierEnseignement.get(s); if (jourL === undefined) continue;
  const md = lire(`curriculum/lessons/${s}.md`);
  const i = md.indexOf('## 🧩 Prérequis'); if (i < 0) continue;
  const fin = md.indexOf('\n## ', i + 1);
  const bloc = md.slice(i, fin < 0 ? md.length : fin);
  for (const m of bloc.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)) {
    const cible = m[1];
    const jourC = premierEnseignement.get(cible);
    const horsP = !premiereExposition.has(cible);
    if (!horsP && jourC !== undefined && jourC <= jourL) continue;   // enseigné avant : rien à dire
    // phrase entière contenant la citation, pour classer à la lecture
    const pos = m.index;
    const deb = Math.max(0, bloc.lastIndexOf('.', pos) + 1);
    const fin2 = bloc.indexOf('.', pos + 1);
    candidatsPrereq.push({
      lecon: s, jourLecon: jourL, prerequis: cible,
      jourPrerequis: horsP ? null : jourC, horsParcours: horsP,
      ecart: horsP ? null : jourC - jourL,
      phrase: bloc.slice(deb, fin2 < 0 ? bloc.length : fin2 + 1).replace(/\s+/g, ' ').trim(),
    });
  }
}

// ───────────────────────────────────────────── D. charge (méthode identique pour les 365)
const minutesLecture = (md, vitesse) => {
  const s = md.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' ');
  const mots = s.split(/\s+/).filter(Boolean).length;
  const lignesCode = [...md.matchAll(/```[\s\S]*?```/g)].map((x) => Math.max(0, x[0].split('\n').length - 2)).reduce((a, b) => a + b, 0);
  return mots / vitesse + lignesCode / 20;
};
const section = (md, titre) => {
  const i = md.indexOf(titre); if (i < 0) return '';
  const j = md.indexOf('\n## ', i + 1);
  return md.slice(i, j < 0 ? md.length : j);
};
const BASE = { 1: [25, 45], 2: [35, 60], 3: [50, 90], 4: [70, 120] };
const VITESSES = { rapide: 220, normale: 150, attentive: 110 };

function chargeJour(j, vitesse, coefRelecture) {
  const tJour = minutesLecture([j.md, j.sol].join('\n'), vitesse);
  const tLecons = j.lecons.map((s) => minutesLecture(lire(`curriculum/lessons/${s}.md`), vitesse)).reduce((a, b) => a + b, 0);
  const guide = minutesLecture(section(j.md, '## 🧭 Exemple guidé'), vitesse);
  const prat = section(j.md, '## ✍️ Pratique autonome') || section(j.md, '## 🔁 Revue hebdomadaire');
  const etapes = Math.max((prat.match(/^\s*\d+[.)]\s/gm) ?? []).length, (prat.match(/^\s*\*\*[A-E][.)]/gm) ?? []).length);
  const minute = [...prat.matchAll(/(\d{2,3})\s*min/g)].map((m) => +m[1]).reduce((a, b) => a + b, 0);
  const [b0, b1] = BASE[j.difficulty] ?? BASE[3];
  const sup = Math.max(0, etapes - 3);
  let pBas = b0 + sup * 8, pHaut = b1 + sup * 15;
  if (minute >= 30) { pBas = Math.max(pBas, minute); pHaut = Math.max(pHaut, Math.round(minute * 1.4)); }
  const reflex = /Questions de réflexion/.test(j.md) ? [10, 20] : [0, 0];
  const lect = tJour + tLecons * (j.isReview ? coefRelecture : 1);
  return {
    lecture: Math.round(lect), lectureJour: Math.round(tJour), lectureLecons: Math.round(tLecons),
    minute, etapes,
    bas: Math.round(lect + guide * 0.5 + pBas + reflex[0]),
    haut: Math.round(lect + guide * 1.5 + pHaut + reflex[1]),
    budget: Math.round(j.hours * 60),
  };
}
const categorie = (c) => (c.bas > c.budget ? 'IMPOSSIBLE' : c.haut > c.budget ? 'HEAVY' : c.haut < c.budget * 0.55 ? 'UNDERLOADED' : 'BALANCED');

const charge = jours.map((j) => {
  const ref = chargeJour(j, VITESSES.normale, 1);
  return { j: j.day, revue: j.isReview, titre: j.title, nlec: j.lecons.length, ...ref, cat: categorie(ref) };
});
const sensibilite = {};
for (const [nomV, v] of Object.entries(VITESSES))
  for (const coef of [1, 0.5]) {
    const cnt = { IMPOSSIBLE: 0, HEAVY: 0, BALANCED: 0, UNDERLOADED: 0 };
    for (const j of jours) cnt[categorie(chargeJour(j, v, coef))]++;
    sensibilite[`${nomV}·relecture${coef}`] = cnt;
  }

// ───────────────────────────────────────────── E. anatomie des 52 revues
const revues = jours.filter((j) => j.isReview).map((j) => {
  const debut = (j.week - 1) * 7 + 1;
  const semaine = jours.filter((x) => x.day >= debut && x.day < debut + 7 && !x.isReview);
  const vuesAvant = new Set();
  for (const x of jours) { if (x.day >= j.day) break; if (!x.isReview) for (const s of x.lecons) vuesAvant.add(s); }
  const inedites = j.lecons.filter((s) => !vuesAvant.has(s));
  const txt = j.md;
  const c = charge.find((x) => x.j === j.day);
  // espacement : distance depuis le dernier contact de chaque leçon revue
  const dernierContact = j.lecons.map((s) => {
    let d = null;
    for (const x of jours) { if (x.day >= j.day) break; if (!x.isReview && x.lecons.includes(s)) d = x.day; }
    return d === null ? null : j.day - d;
  }).filter((x) => x !== null);
  return {
    j: j.day, semaine: j.week, competence: j.skill,
    nlec: j.lecons.length, inedites,
    testPratique: /### Test pratique/.test(txt),
    testTheorique: /### Test théorique/.test(txt),
    grille: /### Grille de notation/.test(txt),
    remediation: /Plan de remédiation/.test(txt),
    entretien: /Questions d'entretien de la semaine/.test(txt),
    rappelSansNotes: /sans notes|de mémoire|sans support/i.test(txt),
    minuteAnnonce: c.minute,
    lectureLecons: c.lectureLecons, lectureJour: c.lectureJour,
    cat: c.cat, bas: c.bas, haut: c.haut, budget: c.budget,
    espacementMin: dernierContact.length ? Math.min(...dernierContact) : null,
    espacementMax: dernierContact.length ? Math.max(...dernierContact) : null,
  };
});

// ───────────────────────────────────────────── F. récurrence par compétence
const recurrence = prog.skills.map((s) => {
  const contacts = jours.filter((j) => j.skill === s.id).map((j) => j.day);
  const travail = jours.filter((j) => j.skill === s.id && !j.isReview).map((j) => j.day);
  const ecarts = []; for (let i = 1; i < contacts.length; i++) ecarts.push(contacts[i] - contacts[i - 1]);
  // productions : journées de cette compétence portant un livrable de projet
  const productions = jours.filter((j) => j.skill === s.id && /Projet|projet/.test(j.title)).length;
  return { id: s.id, expositions: travail.length, revues: contacts.length - travail.length,
           productions, premier: contacts[0] ?? null, dernier: contacts.at(-1) ?? null,
           plusGrandSilence: ecarts.length ? Math.max(...ecarts) : null,
           silenceApresDernier: contacts.length ? 365 - contacts.at(-1) : null };
});

// ───────────────────────────────────────────── G. progression
const progression = [];
for (let b = 1; b <= 365; b += 30) {
  const seg = jours.filter((j) => j.day >= b && j.day < b + 30 && !j.isReview);
  const c = seg.map((j) => charge.find((x) => x.j === j.day));
  const med = (a) => { const t = [...a].sort((x, y) => x - y); return t[Math.floor(t.length / 2)]; };
  progression.push({
    de: b, a: Math.min(b + 29, 365),
    diffMoy: +(seg.reduce((a, j) => a + j.difficulty, 0) / seg.length).toFixed(2),
    diffDistinctes: [...new Set(seg.map((j) => j.difficulty))].sort(),
    lectureMed: med(c.map((x) => x.lecture)),
    hautMed: med(c.map((x) => x.haut)),
    sectionsMed: med(seg.map((j) => (j.md.match(/^## /gm) ?? []).length)),
    decoupageHoraire: seg.filter((j) => j.md.includes('Découpage horaire')).length,
    minuteExplicite: c.filter((x) => x.minute >= 30).length,
  });
}

// ───────────────────────────────────────────── H. semaines et mois
const motsUtiles = (t) => new Set((t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .split(/[^a-z0-9+#.]+/).filter((w) => w.length > 3 && !['pour', 'avec', 'dans', 'plus', 'sans', 'projet', 'revue', 'mensuelle', 'semaine', 'jour'].includes(w)));
const semaines = prog.weeks.map((w) => {
  const js = jours.filter((j) => j.week === w.week && !j.isReview);
  const motsTheme = motsUtiles(w.theme);
  const motsJours = motsUtiles(js.map((j) => j.title).join(' '));
  const inter = [...motsTheme].filter((m) => motsJours.has(m));
  const score = motsTheme.size ? +(inter.length / motsTheme.size).toFixed(2) : 1;
  // quelle autre semaine le thème décrit-il mieux ?
  let best = w.week, bestScore = score;
  for (const w2 of prog.weeks) {
    const j2 = motsUtiles(jours.filter((j) => j.week === w2.week && !j.isReview).map((j) => j.title).join(' '));
    const sc = motsTheme.size ? [...motsTheme].filter((m) => j2.has(m)).length / motsTheme.size : 1;
    if (sc > bestScore + 0.01) { bestScore = sc; best = w2.week; }
  }
  return { s: w.week, mois: w.month, theme: w.theme, score, mieux: best === w.week ? null : best,
           skillsDeclares: w.skills ?? [], skillsReels: [...new Set(js.map((j) => j.skill))] };
});

// ───────────────────────────────────────────── I. références mortes
// ANOMALIE DE SONDE PUBLIÉE (règle 6 du sprint) — une première version de ce contrôle
// cherchait tout identifiant entre accents graves dans un contexte « pratique » et signalait
// 24 faux positifs : `while`, `push`, `auto`, `main`, `email`, `express`, `healthcheck`… —
// c'est-à-dire des mots de code ordinaires, pas des références de produit. Le contrôle ci-
// dessous ne lit QUE la section « 🛠️ Pratique », découpée par titre (jamais par regex `$`
// en mode `m`, défaut trouvé au CP12 de V72), et n'y retient que les identifiants composés
// (au moins un tiret), qui sont la forme réelle des identifiants du produit.
const refsMortes = [];
const sectionsPratique = (md) => {
  const out = [];
  const lignes = md.split('\n');
  let dans = false, buf = [];
  for (const l of lignes) {
    if (/^## /.test(l)) { if (dans) { out.push(buf.join('\n')); buf = []; } dans = /Pratique|Exercice/i.test(l); }
    if (dans) buf.push(l);
  }
  if (dans && buf.length) out.push(buf.join('\n'));
  return out;
};
// SECONDE ANOMALIE PUBLIÉE — restreindre aux identifiants composés n'a pas suffi : la sonde
// signalait encore `min-width`, `grid-template-areas`, `auto-fill`, `cherry-pick`,
// `aria-describedby`, c'est-à-dire des propriétés CSS, des commandes Git et des attributs
// HTML. CONCLUSION : la propriété « référence morte » NE SE DÉTECTE PAS en scannant du texte.
// Elle se lit dans les DÉCLARATIONS : `practiceRefs` de `lessons-map.mjs` et
// `data/day-exercises.json` sont les endroits où le produit affirme qu'un identifiant existe.
// C'est ce qui est contrôlé ci-dessous.
// TROISIÈME ANOMALIE PUBLIÉE — contrôler les `practiceRefs` contre les fichiers de
// `data/` signalait 10 références de `kind: 'lab'` comme mortes. Or un LAB n'est PAS un
// fichier JSON : c'est une ROUTE, déclarée dans `LAB_ROUTES` de `app/doc/[...slug]/page.tsx`.
// Neuf des dix « morts » sont donc vivants. Le contrôle lit maintenant la vraie table.
const labRoutes = new Set([...lire('app/doc/[...slug]/page.tsx')
  .match(/const LAB_ROUTES[^}]*}/s)?.[0].matchAll(/^\s*'?([a-z0-9-]+)'?\s*:/gm) ?? []].map((m) => m[1])
  .filter((x) => x !== 'const'));
const resout = (kind, id) => (kind === 'lab' ? labRoutes.has(id) : idsExistants.has(id));
for (const e of LESSONS)
  for (const r of e.practiceRefs ?? [])
    if (!resout(r.kind, r.id)) refsMortes.push({ source: `lessons-map:${e.file.replace(/\.md$/, '')}`, id: r.id, type: `practiceRef ${r.kind}` });
const dayEx = existsSync('data/day-exercises.json') ? JSON.parse(readFileSync('data/day-exercises.json', 'utf8')) : {};
for (const [jour, ids] of Object.entries(dayEx))
  for (const id of (Array.isArray(ids) ? ids : []))
    if (!idsExistants.has(id)) refsMortes.push({ source: `day-exercises:${jour}`, id, type: 'exercice de journée' });
for (const s of slugsLecons) {
  const md = lire(`curriculum/lessons/${s}.md`);
  for (const m of md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g))
    if (!slugsLecons.has(m[1])) refsMortes.push({ source: `lesson:${s}`, id: m[1], type: 'leçon' });
  for (const m of md.matchAll(/\/day\/(\d+)/g))
    if (+m[1] < 1 || +m[1] > 365) refsMortes.push({ source: `lesson:${s}`, id: m[1], type: 'jour' });
}
for (const j of jours) {
  for (const s of j.leconsMortes) refsMortes.push({ source: `day:${j.day}`, id: s, type: 'leçon' });
  for (const m of j.md.matchAll(/\/day\/(\d+)/g))
    if (+m[1] < 1 || +m[1] > 365) refsMortes.push({ source: `day:${j.day}`, id: m[1], type: 'jour' });
}
// les deux références nommées par le brief
const nommees = ['api-idempotency', 'dlq-duplicate'].map((id) => ({
  id, existe: idsExistants.has(id),
  citeeDans: [...slugsLecons].filter((s) => lire(`curriculum/lessons/${s}.md`).includes(id)),
}));

const sortie = {
  date: new Date().toISOString().slice(0, 10),
  invariants: { lecons: slugsLecons.size, jours: jours.length, solutions: readdirSync('curriculum/solutions').filter((f) => f.endsWith('.md')).length,
                semaines: prog.weeks.length, mois: prog.months.length,
                identifiantsProduit: idsExistants.size },
  competences, horsParcours: detailHors, candidatsPrereq,
  charge, sensibilite, revues, recurrence, progression, semaines,
  refsMortes: refsMortes.filter((r, i, a) => a.findIndex((x) => x.source === r.source && x.id === r.id) === i),
  refsNommees: nommees,
};

if (process.argv.includes('--json')) { console.log(JSON.stringify(sortie)); process.exit(0); }

const P = (x, n) => String(x).padStart(n);
console.log(`INVARIANTS ${JSON.stringify(sortie.invariants)}`);
console.log('\n═══ A · COMPÉTENCES ═══');
console.log('id         jT  jR  lec  prg  hors  déf  prat  1er→der   scores attendus');
for (const c of competences)
  console.log(`${c.id.padEnd(10)} ${P(c.joursTravail, 3)} ${P(c.joursRevue, 3)} ${P(c.leconsQuiLaDeclarent, 4)} ${P(c.leconsProgrammees, 4)} ${P(c.leconsHorsParcours, 5)} ${P(c.refsParDefaut, 4)} ${P(c.pratiques, 5)}  ${c.premier ? `j${P(c.premier, 3)}→j${P(c.dernier, 3)}` : '  AUCUNE '}  ${c.moisAvecScoreAttendu.map((a) => `m${a.m}:${a.score}`).join(' ')}`);
console.log('\nÉVALUÉES AVANT ENSEIGNEMENT :');
for (const c of competences) for (const a of c.evalueeAvantEnseignement) console.log(`   ${c.id} — mois ${a.m} attend ${a.score}, 1re journée de travail : ${c.joursTravail ? 'j' + (jours.find((j) => j.skill === c.id && !j.isReview)?.day) : 'AUCUNE'}`);
console.log(`\n═══ B · HORS PARCOURS : ${detailHors.length} ═══`);
for (const h of detailHors) console.log(`   ${h.slug.padEnd(34)} ${h.cat.padEnd(28)} niv${h.level} ${P(h.mots, 5)} mots · citée par ${h.citeeParProgrammee.length} leçon(s) programmée(s)`);
console.log(`\n═══ C · CANDIDATS PRÉREQUIS : ${candidatsPrereq.length} ═══`);
console.log(`   dont hors parcours : ${candidatsPrereq.filter((c) => c.horsParcours).length} · en avance réelle : ${candidatsPrereq.filter((c) => !c.horsParcours).length}`);
console.log('\n═══ D · CHARGE ═══');
const cnt = {}; for (const c of charge) cnt[c.cat] = (cnt[c.cat] ?? 0) + 1;
console.log('   ' + JSON.stringify(cnt));
console.log('   sensibilité :'); for (const [k, v] of Object.entries(sensibilite)) console.log(`     ${k.padEnd(24)} ${JSON.stringify(v)}`);
console.log('\n═══ E · REVUES ═══');
const rc = {}; for (const r of revues) rc[r.cat] = (rc[r.cat] ?? 0) + 1;
console.log('   ' + JSON.stringify(rc));
console.log(`   avec test pratique ${revues.filter((r) => r.testPratique).length}/52 · test théorique ${revues.filter((r) => r.testTheorique).length}/52 · grille ${revues.filter((r) => r.grille).length}/52 · rappel sans notes ${revues.filter((r) => r.rappelSansNotes).length}/52`);
console.log(`   qui introduisent une leçon inédite : ${revues.filter((r) => r.inedites.length).length}`);
console.log(`   lecture des leçons reliées : médiane ${[...revues.map((r) => r.lectureLecons)].sort((a, b) => a - b)[26]} min · page de revue ${Math.round(revues.reduce((a, r) => a + r.lectureJour, 0) / 52)} min`);
console.log('\n═══ F · RÉCURRENCE ═══');
for (const r of recurrence) console.log(`   ${r.id.padEnd(10)} exp ${P(r.expositions, 3)} · rev ${P(r.revues, 3)} · prod ${P(r.productions, 2)} · silence max ${P(r.plusGrandSilence ?? 0, 3)} j · après le dernier ${P(r.silenceApresDernier ?? 0, 3)} j`);
console.log('\n═══ G · PROGRESSION ═══');
for (const p of progression) console.log(`   j${P(p.de, 3)}–${P(p.a, 3)} diff ${p.diffMoy} ${JSON.stringify(p.diffDistinctes)} · lecture ${P(p.lectureMed, 3)} · haut ${P(p.hautMed, 3)} · sections ${P(p.sectionsMed, 2)} · découpage ${P(p.decoupageHoraire, 2)}/30 · minuté ${P(p.minuteExplicite, 2)}/30`);
console.log('\n═══ H · SEMAINES ═══');
const mauvaises = semaines.filter((s) => s.score < 0.3);
console.log(`   thèmes recouvrant < 30 % de leurs journées : ${mauvaises.length}/52`);
for (const s of mauvaises) console.log(`     s${P(s.s, 2)} ${s.score} ${s.mieux ? '→ mieux s' + s.mieux : ''}  ${s.theme.slice(0, 58)}`);
console.log('\n═══ I · RÉFÉRENCES MORTES ═══');
console.log(`   total : ${sortie.refsMortes.length}`);
for (const r of sortie.refsMortes.slice(0, 20)) console.log(`     ${r.source} → ${r.id} (${r.type})`);
for (const n of nommees) console.log(`   ${n.id} : existe=${n.existe} · citée dans ${n.citeeDans.length} leçon(s) ${n.citeeDans.join(', ')}`);
