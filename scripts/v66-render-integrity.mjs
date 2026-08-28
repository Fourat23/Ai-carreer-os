// V66 — INTÉGRITÉ DE RENDU du corpus.
//
// Pourquoi ce script existe : au CP8, une seule barre oblique inverse devant une
// clôture de bloc de code (`\``` `) empêchait le bloc de se fermer dans
// `curriculum/lessons/rag-evaluation.md`. Conséquence, sur la leçon que
// CINQUANTE-QUATRE journées enseignent : **11 sections sur 18 disparaissaient**,
// 3 509 caractères rendus en monospace brut — Erreurs fréquentes, Correction
// attendue, Questions d'entretien, À retenir, Vocabulaire, Checklist, tout.
//
// Aucun gate ne l'a vu. Ni `curriculum:check`, ni les 44 portes actives : elles
// vérifient la SOURCE, jamais le RENDU. Ce script comble exactement ce trou.
//
// Le principe est le plus simple possible, et c'est ce qui le rend fiable : on
// compte les titres dans la source, on compte ceux qui sortent du moteur de
// rendu réel du produit, et on exige l'égalité. Aucune heuristique.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CUR = join(ROOT, 'curriculum');

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.md')) out.push(p);
  }
  return out;
}

const problems = [];
let scanned = 0;

for (const path of walk(CUR)) {
  const src = readFileSync(path, 'utf8');
  scanned += 1;
  const rel = path.slice(ROOT.length + 1);

  // 1. Titres de niveau 2 : autant dans la source que dans le rendu.
  //    Un titre absorbé par un bloc non fermé disparaît de la page.
  //
  //    PREMIER JET FAUX, conservé en mémoire. Compter tous les `## ` de la
  //    source accusait 17 fichiers. Vérification par lecture : la plupart
  //    montrent du markdown DANS un bloc de code — `readme-documentation`
  //    affiche « ## Installation (5 minutes) » comme exemple de README, et
  //    `documentation-technique` en contient 90. Ce ne sont pas des titres
  //    avalés, ce sont des titres qui n'en ont jamais été. Le détecteur
  //    accusait le corpus de son propre défaut.
  //    Règle corrigée : on ne compte que les `## ` HORS bloc de code.
  const inSource = (() => {
    let n = 0; let fence = false;
    for (const line of src.split('\n')) {
      if (/^\s*```/.test(line)) { fence = !fence; continue; }
      if (!fence && /^## +\S/.test(line)) n += 1;
    }
    return n;
  })();
  const html = marked.parse(src.replace(/^<!-- keep -->\n?/, ''), { async: false });
  const inHtml = (html.match(/<h2[ >]/g) ?? []).length;
  if (inSource !== inHtml) {
    problems.push(`${rel} — ${inSource} sections dans la source, ${inHtml} rendues (${inSource - inHtml} avalées)`);
  }

  // 2. LE BLOC QUI NE SE FERME JAMAIS.
  //
  //    DEUXIÈME JET. Le premier cherchait « une clôture échappée alors qu'aucun
  //    bloc n'est ouvert » — et il n'a RIEN vu quand on a réintroduit le défaut
  //    exprès. Normal : la clôture échappée de `rag-evaluation` tombait alors
  //    qu'un bloc ÉTAIT ouvert, exactement comme la clôture échappée
  //    parfaitement légitime de `readme-documentation`. La parité au moment de
  //    la ligne ne distingue pas les deux cas.
  //
  //    Pire : la règle 1, « corrigée » pour ne plus compter les `## ` dans un
  //    bloc, était devenue AVEUGLE au même défaut — puisque le bloc restait
  //    ouvert, les titres avalés étaient exclus des DEUX côtés de l'égalité.
  //    Une règle cohérente avec elle-même et sans rapport avec la réalité.
  //
  //    Ce qui sépare réellement les deux cas : dans le fichier légitime, le bloc
  //    englobant FINIT par se fermer ; dans le fichier fautif, il court jusqu'à
  //    la fin du fichier. On teste donc la parité À LA FIN, et rien d'autre.
  let fenceOpen = false;
  let openedAt = 0;
  for (const [i, line] of src.split('\n').entries()) {
    if (/^\s*```/.test(line)) { if (!fenceOpen) openedAt = i + 1; fenceOpen = !fenceOpen; }
  }
  if (fenceOpen) {
    problems.push(`${rel} — bloc de code ouvert ligne ${openedAt} et JAMAIS fermé : tout ce qui suit est rendu en monospace`);
  }
}

console.log(`── v66:render — ${scanned} fichiers du curriculum rendus et vérifiés`);
if (problems.length) {
  console.error(`\n❌ ${problems.length} fichier(s) dont le rendu perd du contenu :\n`);
  for (const p of problems) console.error(`  • ${p}`);
  process.exit(1);
}
console.log('\n✅ Aucun contenu perdu au rendu : chaque section de chaque fichier atteint la page.');
