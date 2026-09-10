// V73 · CP6 — MODÈLE DE CHARGE DÉCOMPOSÉ DES 365 JOURNÉES.
//
// Ce que le CP6 ajoute au modèle du CP0 : la DÉCOMPOSITION par poste. Le CP0 produisait une
// fourchette globale ; on ne pouvait donc pas dire d'où venait un dépassement, ni si le
// remède était de retirer de la lecture, de la pratique ou de la relecture.
//
// Les hypothèses sont DÉCLARÉES, pas cachées :
//   - lecture : mots ÷ vitesse, plus lignes de code ÷ 20 — trois vitesses gelées au CP1
//   - exemple guidé : le suivre coûte entre 0,5 et 1,5 relecture
//   - pratique : fourchette par difficulté, +8/+15 min par étape au-delà de trois ;
//                le MINUTAGE EXPLICITE de la journée fait foi quand il existe
//   - correction : comptée dans la lecture de la journée
//   - projet : pas de poste séparé — une journée de projet est une pratique
//   - revue : la relecture des leçons est affectée d'un coefficient (plein tarif / mi-tarif)
//   - setup : NON MESURÉ, et déclaré tel quel — rien dans le texte ne permet de l'estimer
//
// Budget gelé au CP1 : fourchette [240, 300] minutes, JAMAIS un point à 270.
// Une journée n'est « structurellement impossible » que si elle l'est sous ≥ 4 des
// 6 hypothèses (§5.6 du contrat).
//
// Usage : node scripts/v73/cp6-charge.mjs [--json] [--ecrire]
import { readFileSync, existsSync, writeFileSync } from 'node:fs';

const g = JSON.parse(readFileSync('docs/v73/curriculum-graph.json', 'utf8'));
const n3 = (n) => String(n).padStart(3, '0');
const lire = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const cache = new Map();
const lecon = (s) => { if (!cache.has(s)) cache.set(s, lire(`curriculum/lessons/${s}.md`)); return cache.get(s); };

const minutes = (md, v) => {
  const s = md.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' ');
  const mots = s.split(/\s+/).filter(Boolean).length;
  const code = [...md.matchAll(/```[\s\S]*?```/g)].map((x) => Math.max(0, x[0].split('\n').length - 2)).reduce((a, b) => a + b, 0);
  return mots / v + code / 20;
};
const section = (md, titre) => {
  const i = md.indexOf(titre); if (i < 0) return '';
  const j = md.indexOf('\n## ', i + 1);
  return md.slice(i, j < 0 ? md.length : j);
};
const BASE = { 1: [25, 45], 2: [35, 60], 3: [50, 90], 4: [70, 120], 5: [90, 150] };
const BUDGET = [240, 300];
const VITESSES = { rapide: 220, normale: 150, attentive: 110 };
const HYPOTHESES = [];
for (const [nom, v] of Object.entries(VITESSES)) for (const coef of [1, 0.5]) HYPOTHESES.push({ nom: `${nom}·relecture${coef}`, v, coef });

function decomposer(d, v, coef) {
  const md = lire(`curriculum/days/day-${n3(d.j)}.md`);
  const sol = lire(`curriculum/solutions/day-${n3(d.j)}-solution.md`);
  const guide = section(md, '## 🧭 Exemple guidé');
  // ANOMALIE DE SONDE PUBLIÉE (n° 15 de V73). Le bloc de rappel actif introduit au CP7 contient
  // ses propres minutes (« rappel actif (18 min) », « environ 25 min par leçon »). Le scan de
  // minutage de la PRATIQUE les a d'abord ramassées : la pratique moyenne des revues est passée
  // de 129 à 180 minutes sans qu'aucun exercice n'ait changé, et six revues sont devenues HEAVY
  // pour cette seule raison. Le bloc de rappel est donc RETIRÉ de la portée du minutage de
  // pratique — il est compté à part, une fois, dans le poste de relecture.
  let prat = section(md, '## ✍️ Pratique autonome') || section(md, '## 🔁 Revue hebdomadaire');
  const iRappel = prat.indexOf('### Rappel actif');
  if (iRappel >= 0) {
    const fin = prat.indexOf('\n### ', iRappel + 1);
    prat = prat.slice(0, iRappel) + (fin < 0 ? '' : prat.slice(fin));
  }

  const pLectureJour = minutes(md, v) - minutes(guide, v);   // le guidé est compté à part
  const pCorrection = minutes(sol, v);
  // V73 · CP7 — une revue qui MINUTE explicitement sa révision est comptée sur ce qu'elle
  // demande, exactement comme une pratique qui minute ses étapes. Le texte dit : rappel actif
  // de N minutes, leçons fermées, puis relecture ciblée d'AU PLUS DEUX leçons à ~25 min.
  // Relire la liste entière n'est plus ce qui est demandé — et le texte le dit explicitement.
  // Les deux lectures sont publiées : `lectureLeconsSiToutRelu` conserve l'ancien calcul.
  const brut = d.lecons.map((s) => minutes(lecon(s), v)).reduce((a, b) => a + b, 0) * (d.revue ? coef : 1);
  const mRappel = d.revue ? (md.match(/rappel actif \((\d+) min\)/i)?.[1] ?? null) : null;
  const pLecons = mRappel ? +mRappel + 25 : brut;          // borne basse : une leçon rouverte
  const pLeconsHaut = mRappel ? +mRappel + 50 : brut;      // borne haute : deux leçons
  const pGuideBas = minutes(guide, v) * 0.5, pGuideHaut = minutes(guide, v) * 1.5;

  const etapes = Math.max((prat.match(/^\s*\d+[.)]\s/gm) ?? []).length, (prat.match(/^\s*\*\*[A-E][.)]/gm) ?? []).length);
  // ANOMALIE DE SONDE PUBLIÉE (n° 16 de V73) — et c'est une règle que le contrat V72 portait
  // déjà : le MINUTAGE À PORTÉE HEBDOMADAIRE ne se compte pas sur une journée. La revue j357
  // écrit « Chaque jour : 2 exercices algo de 25 min … Fin de semaine : simulation de 60 min » :
  // le modèle sommait 190 minutes sur la seule journée de revue, et j357 restait la dernière
  // revue en dépassement pour cette seule raison. Une phrase qui dit « chaque jour » décrit la
  // semaine, pas le jour. La portée hebdomadaire est donc exclue du minutage journalier.
  const portéeHebdo = /[Cc]haque jour|[Pp]ar jour|dans la semaine|sur la semaine|[Ff]in de semaine/.test(prat);
  const minute = portéeHebdo ? 0 : [...prat.matchAll(/(\d{2,3})\s*min/g)].map((m) => +m[1]).reduce((a, b) => a + b, 0);
  const [b0, b1] = BASE[d.difficulte] ?? BASE[3];
  const sup = Math.max(0, etapes - 3);
  let pPratBas = b0 + sup * 8, pPratHaut = b1 + sup * 15;
  const source = portéeHebdo ? 'portée hebdomadaire — minutage journalier exclu' : minute >= 30 ? 'minutage explicite' : 'fourchette par difficulté';
  if (minute >= 30) { pPratBas = Math.max(pPratBas, minute); pPratHaut = Math.max(pPratHaut, Math.round(minute * 1.4)); }
  const pReflexBas = /Questions de réflexion/.test(md) ? 10 : 0;
  const pReflexHaut = /Questions de réflexion/.test(md) ? 20 : 0;

  const bas = Math.round(pLectureJour + pCorrection + pLecons + pGuideBas + pPratBas + pReflexBas);
  const haut = Math.round(pLectureJour + pCorrection + pLeconsHaut + pGuideHaut + pPratHaut + pReflexHaut);
  const cat = bas > BUDGET[1] ? 'IMPOSSIBLE' : haut > BUDGET[1] ? 'HEAVY' : haut >= BUDGET[0] * 0.55 ? 'BALANCED' : 'UNDERLOADED';
  return {
    postes: {
      lectureJour: Math.round(pLectureJour), correction: Math.round(pCorrection),
      lectureLecons: Math.round(pLecons), lectureLeconsHaut: Math.round(pLeconsHaut),
      lectureLeconsSiToutRelu: Math.round(brut), rappelActifMinute: mRappel ? +mRappel : null, guide: [Math.round(pGuideBas), Math.round(pGuideHaut)],
      pratique: [pPratBas, pPratHaut], sourcePratique: source, etapes, minuteAnnonce: minute,
      reflexion: [pReflexBas, pReflexHaut], setup: 'NON MESURÉ',
    },
    bas, haut, cat,
  };
}

const parJour = g.jours.map((d) => {
  const ref = decomposer(d, VITESSES.normale, 1);
  const cats = HYPOTHESES.map((h) => decomposer(d, h.v, h.coef).cat);
  const nImpossible = cats.filter((c) => c === 'IMPOSSIBLE').length;
  return { j: d.j, revue: d.revue, titre: d.titre, nlec: d.lecons.length, difficulte: d.difficulte,
           ...ref, catsParHypothese: Object.fromEntries(HYPOTHESES.map((h, i) => [h.nom, cats[i]])),
           structurellementImpossible: nImpossible >= 4, nImpossible };
});

const q = (a, p) => { const t = [...a].sort((x, y) => x - y); return t[Math.min(t.length - 1, Math.floor(p * t.length))]; };
const trav = parJour.filter((x) => !x.revue), rev = parJour.filter((x) => x.revue);
const stats = (a, champ) => ({ P10: q(a.map((x) => x[champ]), 0.10), P25: q(a.map((x) => x[champ]), 0.25),
  mediane: q(a.map((x) => x[champ]), 0.50), P75: q(a.map((x) => x[champ]), 0.75),
  P90: q(a.map((x) => x[champ]), 0.90), max: Math.max(...a.map((x) => x[champ])) });

const sensibilite = {};
for (const h of HYPOTHESES) {
  const c = { IMPOSSIBLE: 0, HEAVY: 0, BALANCED: 0, UNDERLOADED: 0 };
  for (const d of g.jours) c[decomposer(d, h.v, h.coef).cat]++;
  sensibilite[h.nom] = c;
}
const cnt = {}; for (const x of parJour) cnt[x.cat] = (cnt[x.cat] ?? 0) + 1;

const sortie = { budget: BUDGET, hypotheses: HYPOTHESES.map((h) => h.nom), categories: cnt, sensibilite,
  statsTravail: { bas: stats(trav, 'bas'), haut: stats(trav, 'haut') },
  statsRevues: { bas: stats(rev, 'bas'), haut: stats(rev, 'haut') },
  structurellementImpossibles: parJour.filter((x) => x.structurellementImpossible).map((x) => ({ j: x.j, revue: x.revue, titre: x.titre, nImpossible: x.nImpossible, bas: x.bas, haut: x.haut, postes: x.postes })),
  jours: parJour };

if (process.argv.includes('--ecrire')) writeFileSync('docs/v73/charge-365.json', JSON.stringify(sortie, null, 1));
if (process.argv.includes('--json')) { process.stdout.write(JSON.stringify(sortie)); }
else {
  const P = (x, n) => String(x).padStart(n);
  console.log(`BUDGET GELÉ : [${BUDGET[0]}, ${BUDGET[1]}] min — jamais un point\n`);
  console.log('catégories (hypothèse de référence : lecture normale, relecture plein tarif)');
  console.log('  ' + JSON.stringify(cnt));
  console.log('\nDÉCILES — journées de travail (313)');
  console.log('  bas  : ' + JSON.stringify(stats(trav, 'bas')));
  console.log('  haut : ' + JSON.stringify(stats(trav, 'haut')));
  console.log('DÉCILES — revues (52)');
  console.log('  bas  : ' + JSON.stringify(stats(rev, 'bas')));
  console.log('  haut : ' + JSON.stringify(stats(rev, 'haut')));
  console.log('\nSENSIBILITÉ (six hypothèses gelées)');
  for (const [k, v] of Object.entries(sensibilite)) console.log(`  ${k.padEnd(24)} ${JSON.stringify(v)}`);
  console.log(`\nSTRUCTURELLEMENT IMPOSSIBLES (IMPOSSIBLE sous ≥ 4 des 6) : ${sortie.structurellementImpossibles.length}`);
  for (const x of sortie.structurellementImpossibles) {
    console.log(`  j${P(x.j, 3)} ${x.revue ? 'REV' : '   '} ${x.bas}-${x.haut} · impossible sous ${x.nImpossible}/6 · ${x.titre.slice(0, 40)}`);
    console.log(`        jour ${x.postes.lectureJour} + corr ${x.postes.correction} + leçons ${x.postes.lectureLecons} + guidé ${x.postes.guide.join('-')} + pratique ${x.postes.pratique.join('-')} (${x.postes.sourcePratique}${x.postes.minuteAnnonce ? ', ' + x.postes.minuteAnnonce + ' min annoncées' : ''})`);
  }
  console.log('\nPOSTE LE PLUS LOURD, par catégorie de journée');
  for (const [nom, a] of [['travail', trav], ['revue', rev]]) {
    const moy = (f) => Math.round(a.reduce((s, x) => s + f(x), 0) / a.length);
    console.log(`  ${nom.padEnd(8)} lecture jour ${P(moy((x) => x.postes.lectureJour), 3)} · correction ${P(moy((x) => x.postes.correction), 3)} · leçons ${P(moy((x) => x.postes.lectureLecons), 3)} · guidé ${P(moy((x) => x.postes.guide[1]), 3)} · pratique ${P(moy((x) => x.postes.pratique[1]), 3)}`);
  }
}
