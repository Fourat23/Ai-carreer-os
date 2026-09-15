// V77 · CP8 — LES 125 EXERCICES AMBIGUS : DÉCLARER L'ÉTAT, PAS LE MAQUILLER.
//
// ── LA RÈGLE DU CHECKPOINT ───────────────────────────────────────────────
//
// **125 → 0 n'est PAS un objectif.** Rester `AMBIGUOUS` est un résultat valide ;
// résoudre par heuristique arbitraire est nommément interdit. La précision prime
// sur la couverture.
//
// Ce script fait donc deux choses, et pas une troisième :
//
//   1. il AUDITE les sources qui pourraient légitimement trancher, et publie
//      leur rendement mesuré — pour que personne n'ait à refaire l'exercice ;
//   2. il SOUS-CLASSE les 125 selon une distinction qui a des conséquences
//      réelles, mesurée et non devinée ;
//   3. il ne devine rien.
//
// Usage :  node scripts/v77/cp8-ambiguite.mjs [--json]
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { resoudre, exercices, declarantsDe, leconsDuJourDe, skillsDeLeconMap } from '../v75/cp4-mapping.mjs';
import { programSkills } from '../../lib/skill-taxonomy.mjs';
import { normaliserDeclarations, CHEMIN_DECLARATIONS } from '../../lib/exercise-declarations.mjs';

/** La mesure lit le fichier elle-même — le module pur ne touche pas au disque. */
function declarationsHorsCorpus() {
  const p = join(process.cwd(), CHEMIN_DECLARATIONS);
  if (!existsSync(p)) return {};
  try { return normaliserDeclarations(JSON.parse(readFileSync(p, 'utf8'))); } catch { return {}; }
}

const ROOT = process.cwd();

// ── 1 · L'ÉTAT ACTUEL ───────────────────────────────────────────────────
const lignes = exercices.map((ex) => ({ id: ex.id, skills: ex.skills ?? [], ...resoudre(ex) }));
const ambigus = lignes.filter((l) => l.classe === 'AMBIGUOUS');

// ── 2 · AUDIT DES SOURCES CANDIDATES ────────────────────────────────────
//
// Chaque piste est ÉVALUÉE et son rendement publié, y compris quand il est nul.
// Un rendement nul mesuré vaut mieux qu'une piste jamais essayée : c'est ce qui
// permet d'affirmer que le blocage est dans la DONNÉE et non dans l'effort.
const lecons = {};
for (const f of existsSync(join(ROOT, 'curriculum', 'lessons')) ? readdirSync(join(ROOT, 'curriculum', 'lessons')) : []) {
  if (f.endsWith('.md')) lecons[basename(f, '.md')] = readFileSync(join(ROOT, 'curriculum', 'lessons', f), 'utf8');
}
const jours = {};
for (const f of existsSync(join(ROOT, 'curriculum', 'days')) ? readdirSync(join(ROOT, 'curriculum', 'days')) : []) {
  if (f.endsWith('.md')) jours[basename(f, '.md')] = readFileSync(join(ROOT, 'curriculum', 'days', f), 'utf8');
}

const sources = [
  {
    nom: 'S1 · l’identifiant de l’exercice est CITÉ dans le texte d’une leçon',
    note: 'un auteur qui nomme un exercice dans sa leçon le déclare, même hors `practiceRefs`',
    resout: (l) => Object.keys(lecons).filter((s) => lecons[s].includes(l.id)),
  },
  {
    nom: 'S2 · l’exercice est LIÉ depuis le Markdown d’une journée (`/lab/<id>`)',
    note: 'la proximité éditoriale serait un acte d’auteur, si elle existait',
    resout: (l) => {
      const dedans = Object.values(jours).filter((t) => t.includes(`/lab/${l.id}`));
      if (dedans.length === 0) return [];
      const slugs = new Set();
      for (const t of dedans) for (const m of t.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)) slugs.add(m[1]);
      return [...slugs];
    },
  },
  {
    nom: 'S3 · le titre de l’exercice est EXACTEMENT celui d’une leçon',
    note: 'coïncidence d’auteur, pas ressemblance de texte — comparaison stricte',
    resout: (l) => {
      const ex = exercices.find((e) => e.id === l.id);
      const titre = String(ex?.title ?? '').trim().toLowerCase();
      if (!titre) return [];
      return Object.keys(lecons).filter((s) => {
        const m = lecons[s].match(/^#\s+(.+)$/m);
        return m && m[1].trim().toLowerCase() === titre;
      });
    },
  },
  {
    nom: 'S4 · déclaration explicite HORS CORPUS (`data/exercise-declarations.json`)',
    note: 'le mécanisme du CP8 : un auteur déclare sans toucher au corpus gelé',
    resout: (l) => declarationsHorsCorpus()[l.id]?.lessons ?? [],
  },
];

const audit = sources.map((s) => {
  let touches = 0; let tranchent = 0; const exemples = [];
  for (const l of ambigus) {
    const r = s.resout(l);
    if (r.length > 0) touches += 1;
    if (r.length === 1) { tranchent += 1; if (exemples.length < 3) exemples.push({ id: l.id, lecon: r[0] }); }
  }
  return { nom: s.nom, note: s.note, touches, tranchent, exemples };
});

// ── 3 · SOUS-CLASSER LES 125, SUR UNE DISTINCTION QUI A DES CONSÉQUENCES ─
//
// `METADATA_MISSING` — la donnée source ne porte pas la déclaration. C'est le
// cas général, et le CP0 l'avait déjà dit.
//
// La distinction UTILE est ailleurs, et personne ne l'avait mesurée : les
// leçons candidates portent-elles la MÊME compétence de programme ?
//
//   · si OUI, l'ambiguïté est **sans conséquence pour la compétence** : quel que
//     soit le concept choisi, la même compétence serait créditée. Elle reste
//     réelle au grain du CONCEPT (rétention), et c'est tout ;
//   · si NON, elle est **conséquente** : choisir mal changerait la compétence
//     créditée. Ce sont ceux-là qu'un auteur devrait trancher en premier.
//
// Ce n'est pas une résolution déguisée : aucun exercice ne change de classe.
const sousClasses = [];
for (const l of ambigus) {
  const candidates = leconsDuJourDe(l.id);
  const comps = new Set();
  for (const s of candidates) for (const k of programSkills([...(skillsDeLeconMap().get(s) ?? [])])) comps.add(k);
  sousClasses.push({
    id: l.id,
    candidates: candidates.length,
    competences: [...comps].sort(),
    sousClasse: comps.size <= 1
      ? 'METADATA_MISSING_SANS_CONSEQUENCE_COMPETENCE'
      : 'METADATA_MISSING_CONSEQUENTE',
    declarantsConnus: declarantsDe(l.id).length,
  });
}

const parSousClasse = {};
for (const s of sousClasses) parSousClasse[s.sousClasse] = (parSousClasse[s.sousClasse] ?? 0) + 1;

const rapport = {
  generatedAt: '2026-09-15T12:00:00.000Z',
  total: lignes.length,
  avant: { AMBIGUOUS: 125, source: 'V75 · CP4, remesuré ici' },
  apres: lignes.reduce((a, l) => { a[l.classe] = (a[l.classe] ?? 0) + 1; return a; }, {}),
  fichierDeDeclaration: CHEMIN_DECLARATIONS,
  declarationsPresentes: Object.keys(declarationsHorsCorpus()).length,
  audit,
  parSousClasse,
  sousClasses,
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(rapport, null, 1));
} else {
  console.log('\n── V77 · CP8 — LES EXERCICES AMBIGUS\n');
  console.log(`  corpus : ${rapport.total} exercices`);
  console.log(`  AVANT (V75 · CP4) : AMBIGUOUS ${rapport.avant.AMBIGUOUS}`);
  console.log(`  APRÈS (CP8)       : ${Object.entries(rapport.apres).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
  console.log(`\n  déclarations hors corpus présentes : ${rapport.declarationsPresentes} (${CHEMIN_DECLARATIONS})`);
  console.log('\n  AUDIT DES SOURCES — rendement MESURÉ, y compris nul :');
  for (const a of audit) {
    console.log(`    ${a.nom}`);
    console.log(`       touche ${a.touches} des ${ambigus.length} · TRANCHE ${a.tranchent}`);
    for (const e of a.exemples) console.log(`       ex. ${e.id} → ${e.lecon}`);
  }
  console.log('\n  SOUS-CLASSES des ambigus (aucun changement de classe) :');
  for (const [k, v] of Object.entries(parSousClasse).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(v).padStart(4)} × ${k}`);
  }
  console.log('');
}
