// V68 · CP0 — SONDES DÉRIVÉES DE LA LECTURE, PAS L'INVERSE.
//
// Ces mesures n'ont pas été imaginées avant d'ouvrir les leçons. Elles nomment
// des défauts et des qualités RENCONTRÉS pendant la lecture des 32 leçons de
// l'échantillon d'audit, puis demandent : combien de fois sur 128 ?
//
// Leur seul rôle est de dire OÙ LIRE ENSUITE. Aucune ne note une leçon : le
// barème gelé note par lecture. V67 a produit treize sondes fausses sur ce
// projet ; la leçon retenue est qu'un compteur ne remplace jamais un lecteur,
// il l'oriente.

import { readFileSync, readdirSync } from 'node:fs';

const DIR = 'curriculum/lessons';
export const slugs = readdirSync(DIR).filter((f) => f.endsWith('.md'))
  .map((f) => f.replace(/\.md$/, '')).sort();

export const lire = (s) => readFileSync(`${DIR}/${s}.md`, 'utf8');

/**
 * Découpe en sections de niveau 2. V67 s'est trompé deux fois ici : un
 * `[\s\S]*?` avec le drapeau `m` s'arrête au bout du titre lui-même, et non de
 * la section. On tranche donc entre deux `^## ` consécutifs, sans regex
 * paresseuse.
 */
export function sections(md) {
  const h = [...md.matchAll(/^## +(.+)$/gm)];
  return h.map((m, i) => ({
    titre: m[1].trim(),
    corps: md.slice(m.index + m[0].length, i + 1 < h.length ? h[i + 1].index : md.length).trim(),
  }));
}

const mots = (t) => (t.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []).length;
const sansCode = (t) => t.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');
const sec = (md, re) => sections(md).find((s) => re.test(s.titre));

/**
 * DÉFAUT 1 — la question qui donne sa réponse.
 *
 * Rencontré dans `metrics-percentiles` et `networking-addressing-routing` :
 *   « Combien d'adresses dans un /24 ? » → 256 (254 hôtes utilisables).
 * La flèche met la réponse à quinze caractères de la question. L'apprenant ne
 * peut PAS s'auto-tester : il lit une affirmation déguisée en question. C'est le
 * contraire de la récupération active, et c'est invisible pour toute sonde qui
 * compte des titres — la section « Questions d'entretien » est bien présente.
 *
 * On compte les lignes qui posent une question ET livrent la réponse sur la
 * même ligne, via `→`, `:` ou `?` suivi d'une réponse.
 */
export function reponseCollee(md) {
  const lignes = sansCode(md).split('\n');
  let n = 0;
  for (const l of lignes) {
    if (!/\?/.test(l)) continue;
    const apres = l.slice(l.lastIndexOf('?') + 1);
    if (/[→»]|^\s*[:-]/.test(apres) && mots(apres) >= 3) n += 1;
  }
  return n;
}

/**
 * QUALITÉ 1 — la version fausse crédible.
 *
 * `css-flexbox` a une section « 🚫 Contre-exemple » qui montre le CSS naïf
 * (`margin-left: 200px`), dit pourquoi il séduit (« ça marche sur ton écran »)
 * et pourquoi il casse. C'est exactement ce que le CP5 demande. La question est
 * : combien de leçons en ont une ?
 *
 * On cherche un contre-exemple EXPLICITE — pas une liste d'erreurs fréquentes,
 * qui nomme le défaut sans jamais le montrer.
 */
export function contreExemple(md) {
  return sections(md).some((s) => /contre-exemple|mauvaise version|version na[ïi]ve|ce qui ne marche pas/i.test(s.titre))
    || /```[^`]*\b(MAUVAIS|INCORRECT|NE PAS FAIRE|à ne pas faire)\b/i.test(md);
}

/**
 * QUALITÉ 2 — la vérification sans réponse.
 *
 * `api-production-contracts` pose trois questions et n'y répond pas. C'est la
 * seule forme qui permette réellement de se tester. On la distingue de la
 * précédente : une section de questions dont AUCUNE ligne ne colle sa réponse.
 */
export function verificationMuette(md) {
  const s = sec(md, /v[ée]rification de compr[ée]hension|auto-?test|teste-toi/i);
  if (!s) return false;
  return reponseCollee(`## x\n${s.corps}`) === 0;
}

/**
 * DÉFAUT 2 — la correction qui répète le cours.
 *
 * `agent-workflows-orchestration` : « La logique : patterns de workflow d'abord,
 * agent seulement si… ». C'est le résumé de la leçon, pas une correction. Le CP8
 * demande le raisonnement attendu, POURQUOI une réponse plausible est fausse, et
 * comment reconnaître le problème la prochaine fois.
 *
 * Signature mesurable : la correction ne contient aucune marque d'erreur
 * (« faux », « se trompe », « piège », « on croit souvent », « erreur »).
 */
export function correctionSansErreur(md) {
  const s = sec(md, /correction/i);
  if (!s) return null; // pas de correction du tout — autre défaut, compté ailleurs
  return !/\b(faux|fausse|se trompe|erreur|pi[èe]ge|on croit|tentant|s[ée]duit|incorrect|confond)/i.test(s.corps);
}

/** Longueur de l'exemple guidé, en mots de prose — un exemple de 40 mots ne guide rien. */
export function tailleExempleGuide(md) {
  const s = sec(md, /exemple guid[ée]/i);
  return s ? mots(sansCode(s.corps)) : null;
}

// ---------------------------------------------------------------------------
// DEUX SONDES ÉCARTÉES. Elles sont conservées ici en toutes lettres parce que
// publier une sonde fausse coûte moins cher que de la supprimer discrètement —
// et parce que ce projet en a produit treize, dont quatre pendant V67.
//
// ÉCARTÉE 1 — `vocabulaireOrphelin`, première version.
//   Elle cherchait chaque libellé **en gras** du Vocabulaire dans le reste de la
//   leçon, littéralement. Résultat annoncé : 108/128 (84 %). Vérification par
//   lecture sur quatre leçons déjà lues :
//     · « conteneur flex » manquant dans css-flexbox — FAUX : la leçon dit
//       « un **conteneur** (`display: flex`) », l'idée y est, pas la chaîne.
//     · « contrat d'API » manquant dans api-production-contracts — FAUX : la
//       leçon dit « c'est un **contrat** avec des clients ».
//     · « moyenne vs\npercentile » — la chaîne contenait un RETOUR À LA LIGNE du
//       fichier source. La sonde cherchait un texte qui ne peut exister.
//   Elle mesurait donc la coïncidence typographique, pas l'explication. Les 84 %
//   ne veulent rien dire et ne sont repris nulle part.
//   Un VRAI positif s'y cachait, trouvé par lecture et non par elle :
//   `metrics-percentiles` liste **cardinalité** au Vocabulaire et ne prononce ce
//   mot nulle part ailleurs. C'est ce cas que `termeJamaisExplique` reprend, avec
//   une définition assez étroite pour être défendable.
//
// ÉCARTÉE 2 — `exempleSansEchec`.
//   Elle cherchait dans « Exemple guidé » des mots d'échec (« casse »,
//   « corrig », « échoue »…). Vérification par lecture :
//     · `linux-resources-io` classé « comporte un échec » — FAUX : son exemple
//       est une procédure de diagnostic qui réussit ; le mot « corriger » y
//       apparaît dans « puis corriger la cause ».
//     · `api-production-contracts` classé pareil sur « migrer un champ sans
//       casser » — c'est le SUJET de la leçon, pas une tentative ratée.
//   Elle repérait un champ lexical, pas une tentative. Écartée. Ce que le CP5
//   veut vraiment voir — une version fausse crédible — est mesuré par
//   `contreExemple`, qui exige une section ou un bloc de code marqué comme tel.
// ---------------------------------------------------------------------------

/**
 * DÉFAUT 4 — le terme annoncé au Vocabulaire que le cours ne prononce jamais.
 *
 * Sonde NEUVE, pas un réglage de la précédente : elle change de définition.
 * Restreinte aux termes d'UN SEUL MOT (ou acronymes), comparés sur un texte dont
 * les retours à la ligne sont normalisés, et cherchés par racine de 5 caractères
 * pour tolérer le pluriel et l'accord. C'est étroit — donc ce qu'elle trouve est
 * vérifiable un par un, ce qui est le seul régime acceptable après treize
 * fausses sondes.
 */
export function termeJamaisExplique(md) {
  const s = sec(md, /vocabulaire/i);
  if (!s) return [];
  const plat = md.replace(/\s+/g, ' ');
  const voc = s.corps.replace(/\s+/g, ' ');
  const out = [];
  for (const m of voc.matchAll(/\*\*([^*]+)\*\*/g)) {
    for (const brut of m[1].split(/[/·]/)) {
      const mot = brut.replace(/[`().,]/g, '').trim();
      if (!/^[\p{L}][\p{L}-]{4,}$/u.test(mot)) continue; // un seul mot, ≥5 lettres
      const racine = mot.slice(0, Math.max(5, mot.length - 2));
      const re = new RegExp(racine.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      // ≥2 occurrences : une dans le Vocabulaire lui-même, une ailleurs.
      if ((plat.match(re) ?? []).length < 2) out.push(mot);
    }
  }
  return [...new Set(out)];
}

/**
 * DÉFAUT 5 — l'exercice sans correction.
 *
 * La mesure brute « correction absente : 52 % » ne dit rien seule : une leçon
 * sans exercice n'a pas à corriger quoi que ce soit. Ce qui compte est le
 * couple. Une leçon qui DEMANDE un travail et ne dit jamais ce qu'on attendait
 * laisse l'apprenant sans moyen de savoir s'il a compris — c'est le défaut que
 * le CP8 vise.
 */
export function exerciceSansCorrection(md) {
  const ex = sections(md).some((x) => /exercice|mise en pratique|pratique guid/i.test(x.titre));
  const co = sections(md).some((x) => /correction|solution attendue|r[ée]ponse attendue/i.test(x.titre));
  return ex && !co;
}

/** Densité : mots de prose par section de niveau 2 — le signal « fiche ». */
export function densite(md) {
  const s = sections(md);
  const total = mots(sansCode(md));
  return { sections: s.length, mots: total, parSection: s.length ? Math.round(total / s.length) : 0 };
}

if (process.argv[1]?.endsWith('v68-lecture.mjs')) {
  const cible = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const liste = cible.length ? cible : slugs;
  const agg = { rc: 0, ce: 0, vm: 0, corrPlate: 0, exSansCorr: 0, voc: 0 };
  const detail = [];
  for (const s of liste) {
    const md = lire(s);
    const x = {
      s,
      d: densite(md),
      rc: reponseCollee(md),
      ce: contreExemple(md),
      vm: verificationMuette(md),
      cs: correctionSansErreur(md),
      esc: exerciceSansCorrection(md),
      tg: tailleExempleGuide(md),
      vo: termeJamaisExplique(md),
    };
    agg.rc += x.rc > 0 ? 1 : 0;
    agg.ce += x.ce ? 1 : 0;
    agg.vm += x.vm ? 1 : 0;
    if (x.cs === true) agg.corrPlate += 1;
    agg.exSansCorr += x.esc ? 1 : 0;
    agg.voc += x.vo.length ? 1 : 0;
    detail.push(x);
  }
  if (cible.length) {
    for (const x of detail) {
      console.log(`\n${x.s}  —  ${x.d.mots} mots · ${x.d.sections} sections · ${x.d.parSection} mots/section`);
      console.log(`  réponses collées à leur question : ${x.rc}`);
      console.log(`  contre-exemple explicite         : ${x.ce ? 'oui' : 'NON'}`);
      console.log(`  vérification sans réponse        : ${x.vm ? 'oui' : 'NON'}`);
      console.log(`  correction                       : ${x.cs === null ? 'absente' : x.cs ? 'NE NOMME AUCUNE ERREUR' : 'nomme une erreur'}`);
      console.log(`  exercice sans correction         : ${x.esc ? 'OUI' : 'non'}`);
      console.log(`  exemple guidé                    : ${x.tg === null ? 'ABSENT' : x.tg + ' mots'}`);
      if (x.vo.length) console.log(`  termes jamais expliqués          : ${x.vo.join(', ')}`);
    }
  }
  const n = liste.length;
  const pc = (x) => `${x}/${n} (${Math.round((x / n) * 100)} %)`;
  console.log(`\n=== ${n} leçons ===`);
  console.log(`  au moins une réponse collée à sa question : ${pc(agg.rc)}`);
  console.log(`  contre-exemple explicite                  : ${pc(agg.ce)}`);
  console.log(`  section de vérification sans réponses     : ${pc(agg.vm)}`);
  console.log(`  correction présente mais sans erreur      : ${pc(agg.corrPlate)}`);
  console.log(`  exercice posé, aucune correction          : ${pc(agg.exSansCorr)}`);
  console.log(`  terme du Vocabulaire jamais prononcé      : ${pc(agg.voc)}`);
  const q = (arr, p) => arr.sort((a, b) => a - b)[Math.floor((arr.length - 1) * p)];
  const ps = detail.map((x) => x.d.parSection);
  console.log(`  mots de prose par section : p10 ${q([...ps], 0.1)} · médiane ${q([...ps], 0.5)} · p90 ${q([...ps], 0.9)}`);
  const tg = detail.map((x) => x.tg).filter((v) => v !== null);
  console.log(`  taille de l'exemple guidé : p10 ${q([...tg], 0.1)} · médiane ${q([...tg], 0.5)} · p90 ${q([...tg], 0.9)} mots  (${tg.length} leçons en ont un)`);
}
