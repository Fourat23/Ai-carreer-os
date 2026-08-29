// V69 CP11 — audit du temps pédagogique des journées qui portent une leçon réécrite.
// Compte et compare. N'écrit aucun contenu.
import fs from 'node:fs';

const PERIMETRE = new Set(JSON.parse(fs.readFileSync('docs/v69/perimetre.json', 'utf8')));
const MOTS_PAR_MIN = 180;   // lecture technique attentive, francais, avec code
const mots = (s) => (s.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;

// 1. quelles journées référencent quelle leçon ?
const jours = fs.readdirSync('curriculum/days').filter((f) => f.endsWith('.md')).sort();
const parLecon = new Map();
const infoJour = new Map();
for (const f of jours) {
  const txt = fs.readFileSync(`curriculum/days/${f}`, 'utf8');
  const id = f.replace(/\.md$/, '');
  const refs = [...txt.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]);
  // Une journée de REVUE hebdomadaire LISTE les leçons de la semaine comme index de
  // référence ; elle ne demande pas de toutes les relire. Les compter comme lecture
  // obligatoire produit un faux positif : day-077 affichait 227 min pour 20 leçons
  // liées. Constaté puis corrigé — la sonde initiale mesurait des liens, pas du travail.
  const revue = /Revue hebdomadaire|Revue mensuelle/.test(txt);
  infoJour.set(id, { motsJour: mots(txt), refs: [...new Set(refs)], revue });
  for (const r of new Set(refs)) {
    if (!parLecon.has(r)) parLecon.set(r, []);
    parLecon.get(r).push(id);
  }
}

const motsLecon = new Map();
for (const f of fs.readdirSync('curriculum/lessons').filter((f) => f.endsWith('.md'))) {
  motsLecon.set(f.replace(/\.md$/, ''), mots(fs.readFileSync(`curriculum/lessons/${f}`, 'utf8')));
}

const cibles = [...PERIMETRE].sort();
const orphelines = cibles.filter((s) => !parLecon.has(s));
console.log(`Leçons du périmètre V69 : ${cibles.length}`);
console.log(`  rattachées à au moins une journée : ${cibles.length - orphelines.length}`);
if (orphelines.length) console.log(`  HORS PROGRAMME : ${orphelines.join(', ')}`);

const tous = [...new Set(cibles.flatMap((s) => parLecon.get(s) || []))].sort();
const joursRevue = tous.filter((j) => infoJour.get(j).revue);
const joursConcernes = tous.filter((j) => !infoJour.get(j).revue);
console.log(`\nJournées de revue exclues du calcul de lecture : ${joursRevue.length}`);
console.log(`\nJournées portant au moins une leçon réécrite : ${joursConcernes.length}\n`);

const lignes = [];
for (const j of joursConcernes) {
  const { motsJour, refs } = infoJour.get(j);
  const reecrites = refs.filter((r) => PERIMETRE.has(r));
  const motsLecons = refs.reduce((n, r) => n + (motsLecon.get(r) || 0), 0);
  const lectureMin = Math.round((motsJour + motsLecons) / MOTS_PAR_MIN);
  lignes.push({ j, reecrites: reecrites.length, refs: refs.length, motsJour, motsLecons, lectureMin });
}
lignes.sort((a, b) => b.lectureMin - a.lectureMin);

console.log('journée      leçons  dont V69   mots jour  mots leçons  lecture seule');
for (const l of lignes.slice(0, 12))
  console.log(`${l.j.padEnd(12)} ${String(l.refs).padStart(4)} ${String(l.reecrites).padStart(9)} ${String(l.motsJour).padStart(11)} ${String(l.motsLecons).padStart(12)} ${String(l.lectureMin).padStart(11)} min`);
if (lignes.length > 12) console.log(`… et ${lignes.length - 12} autres journées`);

const t = lignes.map((l) => l.lectureMin).sort((a, b) => a - b);
const med = t.length % 2 ? t[t.length >> 1] : (t[(t.length >> 1) - 1] + t[t.length >> 1]) / 2;
console.log(`\nLecture seule — médiane ${med} min | min ${t[0]} | max ${t[t.length - 1]}`);
console.log(`Journées où la lecture seule dépasse 90 min : ${t.filter((x) => x > 90).length}/${t.length}`);
console.log(`Journées où la lecture seule dépasse 120 min : ${t.filter((x) => x > 120).length}/${t.length}`);
console.log(`\nHypothèse déclarée : ${MOTS_PAR_MIN} mots/min (lecture technique attentive, code inclus).`);
console.log('Le temps de PRATIQUE n\'est pas mesuré ici : il n\'est pas déductible du texte.');
