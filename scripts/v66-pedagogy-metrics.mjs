// V66 · CP0 — MÉTRIQUES PÉDAGOGIQUES : des SYMPTÔMES, pas un score de qualité.
//
// AVERTISSEMENT, à lire avant d'utiliser un seul de ces chiffres.
//
// Aucune regex ne mesure si un cours enseigne. Ce script détecte des symptômes
// OBJECTIFS et VÉRIFIABLES — un acronyme jamais développé, une correction qui
// ne corrige rien, un exemple annoncé mais absent. Chacun peut être un faux
// positif ; chacun doit être confirmé par lecture avant d'être appelé défaut.
//
// Ce qui N'EST PAS mesurable ici et reste qualitatif :
//   la justesse d'une analogie, la profondeur d'une explication, la qualité
//   d'un modèle mental, l'adéquation au niveau réel de l'apprenant.
//
// Le brief §20 l'exige explicitement : « ne prétends pas mesurer
// automatiquement la qualité d'un cours avec une regex ».

import { readFileSync, readdirSync, existsSync } from 'node:fs';

const R = (p) => readFileSync(p, 'utf8');
const dayPath = (n) => `curriculum/days/day-${String(n).padStart(3, '0')}.md`;
const solPath = (n) => `curriculum/solutions/day-${String(n).padStart(3, '0')}-solution.md`;

/** Texte hors blocs de code — le jargon d'un bloc de code EST du code. */
const prose = (t) => t.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');

// ── Acronymes ────────────────────────────────────────────────────────────
// Un acronyme « développé » l'est soit par une parenthèse, soit par une
// définition explicite à proximité. Les acronymes universels d'un programme
// d'ingénierie ne sont pas comptés : les exiger tous produirait du bruit.
const ACRONYM_ALLOWLIST = new Set([
  'API', 'HTTP', 'HTTPS', 'URL', 'URI', 'JSON', 'HTML', 'CSS', 'SQL', 'REST',
  'CPU', 'RAM', 'IO', 'OS', 'UI', 'UX', 'ID', 'IDE', 'CLI', 'GUI', 'PDF',
  'TCP', 'IP', 'DNS', 'TLS', 'SSL', 'SSH', 'FTP', 'JS', 'TS', 'CSV', 'XML',
  'IA', 'ML', 'DL', 'LLM', 'RAG', 'GPU', 'JWT', 'CRUD', 'ORM', 'CI', 'CD',
  'AWS', 'GCP', 'VM', 'DB', 'RGPD', 'OK', 'PR', 'MR', 'QA', 'SRE', 'TTL',
]);

/**
 * PREMIER ESSAI, FAUX — conservé en mémoire parce qu'il a failli produire un
 * titre de rapport entièrement inventé.
 *
 * La règle était `\\b[A-Z]{2,6}\\b`. Sur le jour 50 elle a rendu quinze
 * « acronymes non développés » :
 *   EST · SANS · TOUT · OUBLIE · PASSER · FERME  → des mots français que le
 *     corpus écrit en capitales pour insister ;
 *   TAT · REQU · TE · PONSE · CHELLE · SUCC · SUME · CR  → des FRAGMENTS de
 *     mots accentués : `\\b` casse sur É, È, Ê, donc ÉTAT devient TAT.
 * Un seul était réel : MDN.
 *
 * La métrique annonçait « 100 % des journées ont un acronyme jamais
 * développé ». C'était un artefact à 100 %.
 *
 * Règle corrigée, sur deux critères tirés du CORPUS lui-même :
 *   1. bornes conscientes des accents — aucune lettre, accentuée ou non,
 *      ne touche le candidat ;
 *   2. si les mêmes lettres apparaissent EN MINUSCULES ailleurs dans le
 *      corpus comme un mot, c'est un mot français mis en emphase, pas un
 *      acronyme. « est » oui, « mdn » non.
 */
const L = 'A-Za-zÀ-ÖØ-öø-ÿ';
let LOWER_WORDS = null;
function lowerWordsOfCorpus() {
  if (LOWER_WORDS) return LOWER_WORDS;
  LOWER_WORDS = new Set();
  for (const dir of ['curriculum/lessons', 'curriculum/days']) {
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.md')) continue;
      for (const m of R(`${dir}/${f}`).matchAll(new RegExp(`(?<![${L}])([a-zà-öø-ÿ]{2,6})(?![${L}])`, 'g'))) {
        LOWER_WORDS.add(m[1]);
      }
    }
  }
  return LOWER_WORDS;
}

export function acronyms(text) {
  const p = prose(text);
  const lower = lowerWordsOfCorpus();
  const found = new Map();
  const re = new RegExp(`(?<![${L}])([A-Z]{2,6})(?![${L}])`, 'g');
  for (const m of p.matchAll(re)) {
    const a = m[1];
    if (ACRONYM_ALLOWLIST.has(a)) continue;
    // Écrit en minuscules ailleurs dans le corpus → mot français en emphase.
    if (lower.has(a.toLowerCase())) continue;
    if (!found.has(a)) found.set(a, { count: 0, expanded: false });
    found.get(a).count += 1;
  }
  for (const a of found.keys()) {
    const rx = new RegExp(`(\\b${a}\\b\\s*\\([^)]{6,}\\))|(\\([^)]*\\b${a}\\b[^)]*\\))|([${L}'’\\- ]{8,}\\s*\\(\\s*${a}\\s*\\))`);
    if (rx.test(p)) found.get(a).expanded = true;
  }
  return [...found.entries()].map(([a, v]) => ({ acronym: a, ...v }));
}

// ── Exemple travaillé ────────────────────────────────────────────────────
// Un « exemple guidé » digne du nom porte un énoncé, un raisonnement et une
// solution. Une ligne de code sous un titre n'est pas un exemple pédagogique
// (brief §F).
export function workedExample(text) {
  const block = text.match(/^##[^\n]*[Ee]xemple guidé[\s\S]*?(?=^## |\Z)/m)?.[0] ?? '';
  if (!block) return { present: false, enonce: false, raisonnement: false, solution: false, words: 0 };
  return {
    present: true,
    enonce: /\*\*Énoncé\*\*|\*\*Situation\*\*|\*\*Problème\*\*/i.test(block),
    raisonnement: /\*\*Raisonnement|pas-à-pas|étape 1|\(1\)/i.test(block),
    solution: /\*\*Solution\*\*|```/.test(block),
    words: prose(block).split(/\s+/).filter(Boolean).length,
  };
}

// ── Contre-exemple ───────────────────────────────────────────────────────
//
// PREMIER ESSAI, FAUX. La règle cherchait la causalité par mots-clés
// (`parce que|car|pourquoi|conséquence`) dans « Erreurs fréquentes » et
// rendait 5 % — un titre de rapport dévastateur, et faux. Lecture directe des
// jours 232, 303 et 165 : la causalité est PARTOUT, exprimée par juxtaposition
// et par « : » —
//   « sans taxonomie, l'évaluation mélangera des choses incomparables et le
//     score global ne voudra rien dire »
//   « leakage qui surestime la performance »
//   « sans l'écart-type, on ignore si le modèle est stable »
// Aucune de ces phrases ne contient « parce que ». La règle mesurait le style
// d'écriture, pas la pédagogie.
//
// On ne raffine pas la regex jusqu'à obtenir le chiffre voulu (règle 4 du
// brief). On mesure à la place quelque chose de STRUCTUREL et vérifiable :
// le corpus MONTRE-t-il une mauvaise approche (code ou démarche affichée puis
// réfutée), ou se contente-t-il de la NOMMER ? C'est la distinction du §G.
//
// La qualité causale des « erreurs fréquentes » reste QUALITATIVE : elle est
// jugée par lecture dans le rapport, pas par ce script.
export function counterExample(text) {
  const sec = text.match(/^##[^\n]*(contre-exemple|anti-pattern|mauvaise approche|ce qui ne marche pas|à ne pas faire)[\s\S]*?(?=^## |\Z)/im)?.[0] ?? '';
  const errors = text.match(/^##[^\n]*[Ee]rreurs fréquentes[\s\S]*?(?=^## |\Z)/m)?.[0] ?? '';
  return {
    hasSection: !!sec,
    // MONTRÉ : du code ou une démarche est affichée avant d'être réfutée.
    shown: /```/.test(sec) || /^\s*(?:❌|🚫)/m.test(sec),
    // NOMMÉ : une liste de choses à éviter, sans démonstration.
    named: !!errors,
    errorsItems: (errors.match(/^\s*[-*]\s/gm) ?? []).length,
    errorsWords: prose(errors).split(/\s+/).filter(Boolean).length,
  };
}

// ── Correction ───────────────────────────────────────────────────────────
// « Réponse : B car B est correcte » est invalide (brief §16). Une correction
// utile dit pourquoi la bonne réponse est bonne ET pourquoi les autres non.
export function correction(day) {
  const f = solPath(day);
  if (!existsSync(f)) return { exists: false };
  const t = R(f);
  const p = prose(t);
  return {
    exists: true,
    words: p.split(/\s+/).filter(Boolean).length,
    explainsWhy: /parce que|car\b|la raison|pourquoi/i.test(p),
    explainsWrong: /erreur (courante|classique|fréquente)|piège|confusion|on confond|à tort|au lieu de|distracteur/i.test(p),
    hasCriteria: /critère|vérifie|attendu|checklist|réussi si/i.test(p),
  };
}

// ── Rappel actif ─────────────────────────────────────────────────────────
// Une question dont la réponse est visible juste en dessous n'est pas du
// rappel actif : c'est de la reconnaissance.
export function activeRecall(text) {
  const questions = (prose(text).match(/[^.!?\n]{10,}\?/g) ?? []).length;
  const hidden = /<details|FERME-le|de mémoire|sans regarder|cache la réponse|masque/i.test(text);
  const selfCheck = /^##[^\n]*(vérification|auto-évaluation|checklist|quiz|teste-toi)/im.test(text);
  return { questions, hidden, selfCheck };
}

// ── Densité de jargon ────────────────────────────────────────────────────
// On compare le nombre de termes techniques DISTINCTS au volume explicatif.
// Ce n'est PAS une mesure de qualité : un cours dense peut être excellent.
// C'est un signal à confirmer par lecture.
/**
 * PREMIER ESSAI, INSUFFISANT : compter les identifiants camelCase et
 * kebab-case. Médiane mesurée : 1 terme pour 100 mots — implausible, parce que
 * l'essentiel du jargon du corpus est en minuscules ordinaires (« embedding »,
 * « reranker », « conteneur », « idempotence ») et échappait à la règle.
 *
 * Règle corrigée : on lit le vocabulaire QUE LE CORPUS MARQUE LUI-MÊME —
 * termes entre backticks, termes en gras, et entrées de la section
 * « Vocabulaire ». C'est dérivé du corpus, pas deviné.
 *
 * Ce chiffre reste un SIGNAL, pas un verdict : un cours dense peut être
 * excellent. Il sert à repérer où lire, pas à conclure.
 */
export function jargon(text) {
  const p = prose(text);
  const words = p.split(/\s+/).filter(Boolean).length;
  const terms = new Set();
  for (const m of text.matchAll(/`([^`\n]{2,40})`/g)) terms.add(m[1].toLowerCase().trim());
  for (const m of p.matchAll(/\*\*([^*\n]{2,40})\*\*/g)) terms.add(m[1].toLowerCase().trim());
  const vocab = text.match(/^##[^\n]*Vocabulaire[\s\S]*?(?=^## |\Z)/m)?.[0] ?? '';
  for (const m of vocab.matchAll(/\*\*([^*\n]+)\*\*/g)) terms.add(m[1].toLowerCase().trim());
  // Termes cités dans le vocabulaire mais JAMAIS expliqués dans le corps :
  // le symptôme « keyword dump » (PED-13) sous sa forme la plus vérifiable.
  const body = p.replace(vocab, '');
  const vocabTerms = [...vocab.matchAll(/\*\*([^*\n]+)\*\*/g)].map((m) => m[1].trim());
  const orphans = vocabTerms.filter((t) => {
    const head = t.split(/[\s/·(]/)[0].toLowerCase();
    return head.length > 3 && !body.toLowerCase().includes(head);
  });
  return {
    words,
    distinctTerms: terms.size,
    per100: words ? +(terms.size * 100 / words).toFixed(1) : 0,
    vocabTerms: vocabTerms.length,
    vocabOrphans: orphans,
  };
}

// ── Assemblage ───────────────────────────────────────────────────────────
export function measureDay(day) {
  const dp = dayPath(day);
  if (!existsSync(dp)) return null;
  const t = R(dp);
  const slugs = [...new Set([...t.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))];
  const lessons = slugs.map((s) => `curriculum/lessons/${s}.md`).filter(existsSync);
  const full = [t, ...lessons.map(R)].join('\n');
  const ac = acronyms(full);
  return {
    day,
    words: prose(full).split(/\s+/).filter(Boolean).length,
    lessons: slugs.length,
    acronyms: ac.length,
    acronymsUnexpanded: ac.filter((a) => !a.expanded).map((a) => a.acronym),
    worked: workedExample(full),
    counter: counterExample(full),
    correction: correction(day),
    recall: activeRecall(full),
    jargon: jargon(full),
  };
}

if (process.argv[1]?.endsWith('v66-pedagogy-metrics.mjs')) {
  const arg = process.argv[2];
  const days = arg === '--sample'
    ? JSON.parse(
        (await import('node:child_process')).execSync('node scripts/v66-sample.mjs --json').toString(),
      ).days.map((d) => d.day)
    : arg === '--all'
      ? Array.from({ length: 365 }, (_, i) => i + 1)
      : [Number(arg)];

  const rows = days.map(measureDay).filter(Boolean);
  if (process.argv.includes('--json')) { console.log(JSON.stringify(rows, null, 2)); }
  else {
    console.log('jour  mots  acr!  exGuidé  contreEx  correction  recall  jargon/100');
    for (const r of rows) {
      console.log(
        String(r.day).padStart(4),
        String(r.words).padStart(5),
        String(r.acronymsUnexpanded.length).padStart(4),
        (r.worked.present ? (r.worked.enonce && r.worked.raisonnement && r.worked.solution ? 'complet' : 'partiel') : 'absent').padStart(8),
        (r.counter.shown ? 'montré' : r.counter.hasSection ? 'section' : r.counter.named ? 'nommé' : 'absent').padStart(9),
        (!r.correction.exists ? 'absente' : r.correction.explainsWrong ? 'pédago' : r.correction.explainsWhy ? 'partielle' : 'plate').padStart(11),
        (r.recall.hidden ? 'caché' : r.recall.selfCheck ? 'checklist' : 'passif').padStart(8),
        String(r.jargon.per100).padStart(10),
      );
    }
    const pct = (f) => Math.round(100 * rows.filter(f).length / rows.length);
    console.log('');
    console.log('SYMPTÔMES sur', rows.length, 'journées :');
    console.log('  exemple guidé COMPLET (énoncé+raisonnement+solution) :', pct((r) => r.worked.present && r.worked.enonce && r.worked.raisonnement && r.worked.solution) + ' %');
    console.log('  exemple guidé absent                                 :', pct((r) => !r.worked.present) + ' %');
    console.log('  mauvaise approche MONTRÉE (code/démarche réfutée)     :', pct((r) => r.counter.shown) + ' %');
    console.log('  erreurs seulement NOMMÉES (liste, sans démonstration) :', pct((r) => !r.counter.shown && r.counter.named) + ' %');
    console.log('  médiane d items dans « erreurs fréquentes »           :', [...rows.map((r) => r.counter.errorsItems)].sort((a, b) => a - b)[Math.floor(rows.length / 2)]);
    console.log('  correction expliquant l ERREUR MENTALE               :', pct((r) => r.correction.explainsWrong) + ' %');
    console.log('  correction absente ou plate                          :', pct((r) => !r.correction.exists || (!r.correction.explainsWhy && !r.correction.explainsWrong)) + ' %');
    console.log('  rappel actif à réponse CACHÉE                        :', pct((r) => r.recall.hidden) + ' %');
    console.log('  au moins un acronyme jamais développé                :', pct((r) => r.acronymsUnexpanded.length > 0) + ' %');
    const j = rows.map((r) => r.jargon.per100).sort((a, b) => a - b);
    console.log('  jargon / 100 mots — médiane', j[Math.floor(j.length / 2)], '· max', j[j.length - 1]);
  }
}
