// V49 CP4/5/7/8 — Far transfer T4/T5 pour les ruptures (llm, patterns, dl,
// gitlinux) + archi « la bonne architecture change quand une contrainte apparaît ».
// Chaque défi : pont conceptuel explicite, changement de domaine (T5), question
// discriminante, ≥2 étapes. Vérifié : validateTransferChallenge + référence gagnante.
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateTransferChallenge, gradeTransferChallenge } from '../lib/transfer-challenge.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const C = [];

// 1 — LLM : budget de contexte → éviction mémoire bornée (llm → archi/ds) T5
C.push({
  id: 'llm-context-to-eviction', title: 'Du budget de contexte à l’éviction bornée',
  sourceSkill: 'llm', skills: ['llm', 'archi'], transferLevel: 'T5',
  bridge: "garder le système + les éléments les plus utiles dans une capacité bornée (budget de tokens) → toute ressource à capacité fixe qu'il faut peupler par priorité et faire déborder proprement : cache LRU, buffer, fenêtre glissante",
  crossDomain: true,
  targetContext: "On conçoit un cache en mémoire de taille fixe pour des profils utilisateurs — sans parler de LLM ni de tokens. Quand le cache est plein, il faut décider quoi garder.",
  lessonRefs: ['llm-cost-optimization', 'architecture-basics'],
  simulationNote: 'Situations décrites pour le raisonnement ; aucune exécution.',
  passThreshold: 0.7,
  questions: [
    { id: 'q1', taxonomy: 'TRANSFER', kind: 'mcq', prompt: "Le cache de profils est plein. Quelle transposition du « budget de contexte » est correcte ?",
      options: ['Garder les entrées prioritaires/récentes et évincer les moins utiles quand la capacité est atteinte', 'Refuser toute nouvelle entrée dès que le cache est plein', 'Vider entièrement le cache à chaque ajout', 'Agrandir le cache indéfiniment'],
      answer: 0, explanation: "Comme le contexte LLM : capacité bornée, on peuple par priorité et on évince le moins utile — pas de refus global ni de croissance infinie." },
    { id: 'q2', taxonomy: 'TRANSFER', kind: 'multi', prompt: "Quels éléments du raisonnement « budget » se transfèrent ?",
      options: ['Une capacité fixe force un arbitrage', 'On protège les éléments indispensables (comme le message système)', 'Le débordement doit être géré explicitement (éviction)', 'Plus on remplit, mieux c’est'],
      answer: [0, 1, 2], explanation: "Capacité fixe → arbitrage ; on épingle l’indispensable ; on gère l’éviction. « Plus = mieux » est justement l’erreur." },
  ],
});

// 2 — Patterns : yagni → sous-provisionnement infra (patterns → cloud/archi) T5
C.push({
  id: 'patterns-yagni-to-infra', title: 'De « pas de pattern inutile » à « pas de sur-architecture »',
  sourceSkill: 'patterns', skills: ['patterns', 'archi'], transferLevel: 'T5',
  bridge: "n'introduire un pattern que si une CONTRAINTE le justifie (variantes, changement fréquent) → n'introduire une complexité d'infrastructure (micro-services, sharding, multi-région) que si une contrainte réelle (charge, isolement, latence) l'exige ; sinon c'est de la sur-ingénierie coûteuse",
  crossDomain: true,
  targetContext: "Une petite équipe démarre un produit et hésite à découper d'emblée en 8 micro-services « pour être prêt » — sans parler de design patterns.",
  lessonRefs: ['design-patterns-intro', 'system-design-scaling'],
  simulationNote: 'Décisions décrites pour le raisonnement ; aucune infra réelle.',
  passThreshold: 0.7,
  questions: [
    { id: 'q1', taxonomy: 'TRANSFER', kind: 'mcq', prompt: "Comment transposer le principe « yagni des patterns » à l’infrastructure ?",
      options: ['Commencer simple (monolithe) et découper quand une contrainte mesurée l’exige', 'Découper en micro-services dès le départ par précaution', 'Ne jamais découper', 'Choisir l’architecture la plus complexe pour être prêt'],
      answer: 0, explanation: "Comme pour un pattern : la structure se justifie par une contrainte réelle, pas par anticipation spéculative." },
    { id: 'q2', taxonomy: 'TRANSFER', kind: 'predict', prompt: "En un mot : quel principe commun relie « strategy inutile » et « micro-services prématurés » ? (réponds : sur-ingénierie)",
      answer: 'sur-ingénierie', explanation: "Les deux ajoutent une complexité non justifiée par une contrainte : sur-ingénierie." },
  ],
});

// 3 — DL : taux d’apprentissage → pas d’une optimisation itérative (dl → algo) T5
C.push({
  id: 'dl-lr-to-stepsize', title: 'Du learning rate au pas d’une optimisation',
  sourceSkill: 'dl', skills: ['dl', 'algo'], transferLevel: 'T5',
  bridge: "le taux d'apprentissage contrôle la taille du pas d'une descente de gradient (trop grand → divergence/oscillation ; trop petit → lenteur) → tout processus itératif à pas réglable : recherche de racine, ajustement d'un contrôleur, tâtonnement dichotomique du bon incrément",
  crossDomain: true,
  targetContext: "On règle manuellement un paramètre d'un système par essais successifs : à chaque essai on ajuste d'un certain pas — sans parler de réseau de neurones.",
  lessonRefs: ['neural-networks', 'algorithmic-thinking'],
  simulationNote: 'Comportements décrits pour le raisonnement ; aucun entraînement réel.',
  passThreshold: 0.7,
  questions: [
    { id: 'q1', taxonomy: 'TRANSFER', kind: 'mcq', prompt: "Les ajustements oscillent autour de la cible sans converger. Que dit l’analogie du learning rate ?",
      options: ['Le pas est trop grand : le réduire pour converger', 'Le pas est trop petit : l’augmenter', 'Le système est cassé', 'Il faut changer complètement de méthode'],
      answer: 0, explanation: "Oscillation = pas trop grand, exactement comme un learning rate trop élevé qui fait diverger la descente." },
    { id: 'q2', taxonomy: 'TRANSFER', kind: 'multi', prompt: "Quels symptômes se transfèrent du learning rate au réglage par pas ?",
      options: ['Pas trop grand → oscillation/divergence', 'Pas trop petit → convergence très lente', 'Un bon pas peut décroître au fil des itérations', 'Le pas n’a aucune influence'],
      answer: [0, 1, 2], explanation: "Divergence si trop grand, lenteur si trop petit, décroissance du pas utile (learning rate schedule). Le pas est déterminant." },
  ],
});

// 4 — DL : écart train/val → généralisation partout (dl → evalia) T4
C.push({
  id: 'dl-overfit-to-generalization', title: 'De l’écart train/val à la généralisation',
  sourceSkill: 'dl', skills: ['dl', 'evalia'], transferLevel: 'T4',
  bridge: "un écart train↑/val↓ signale un surapprentissage : le modèle mémorise au lieu de généraliser → tout système jugé sur les données qui l'ont produit surestime sa performance ; il faut une évaluation hors échantillon",
  crossDomain: true,
  targetContext: "Une règle métier est « validée » sur les mêmes cas qui ont servi à l’écrire, et marche mal ensuite — sans parler de réseau de neurones.",
  lessonRefs: ['neural-networks', 'model-evaluation'],
  simulationNote: 'Cas décrits pour le raisonnement.',
  passThreshold: 0.7,
  questions: [
    { id: 'q1', taxonomy: 'TRANSFER', kind: 'mcq', prompt: "Pourquoi la règle « validée » échoue-t-elle en vrai, par analogie avec le surapprentissage ?",
      options: ['Elle a été évaluée sur les données qui l’ont produite (in-sample) et ne généralise pas', 'Elle est trop simple', 'Le hasard', 'Les utilisateurs se trompent'],
      answer: 0, explanation: "Évaluer sur les données d’entraînement surestime la performance : il faut un jeu hors échantillon, comme la validation en DL." },
    { id: 'q2', taxonomy: 'TRANSFER', kind: 'multi', prompt: "Quels remèdes se transfèrent ?",
      options: ['Tester sur des cas jamais vus', 'Séparer données de conception et d’évaluation', 'Se méfier d’un score parfait sur les données sources', 'Ajouter plus de règles au hasard'],
      answer: [0, 1, 2], explanation: "Hold-out, séparation conception/éval, méfiance du score in-sample : le cœur de la généralisation." },
  ],
});

// 5 — gitlinux : permissions fichier → moindre privilège IAM (gitlinux → secu) T5
C.push({
  id: 'gitlinux-perms-to-iam', title: 'Des permissions de fichier au moindre privilège IAM',
  sourceSkill: 'gitlinux', skills: ['gitlinux', 'secu'], transferLevel: 'T5',
  bridge: "n'accorder que les droits nécessaires sur un fichier (lecture/écriture/exécution, propriétaire/groupe/autres) → n'accorder à un rôle cloud que les actions strictement nécessaires sur les ressources strictement nécessaires (moindre privilège IAM)",
  crossDomain: true,
  targetContext: "On rédige une politique d’accès pour une application qui doit lire un seul bucket — sans parler de chmod ni de fichiers Unix.",
  lessonRefs: ['linux-filesystem-permissions', 'deployment-secrets'],
  simulationNote: 'Politiques décrites pour le raisonnement ; aucun cloud réel.',
  passThreshold: 0.7,
  questions: [
    { id: 'q1', taxonomy: 'TRANSFER', kind: 'mcq', prompt: "Comment transposer « chmod minimal » à une politique IAM ?",
      options: ['Autoriser seulement l’action requise (lecture) sur la ressource requise (ce bucket)', 'Donner les pleins droits « pour éviter les problèmes »', 'Autoriser toutes les actions sur toutes les ressources', 'Ne donner aucun droit et contourner par une clé en dur'],
      answer: 0, explanation: "Moindre privilège : la plus petite permission sur la plus petite portée, exactement comme des droits Unix restreints." },
    { id: 'q2', taxonomy: 'TRANSFER', kind: 'multi', prompt: "Quels principes se transfèrent des permissions Unix à IAM ?",
      options: ['Restreindre la portée (une ressource, pas *)', 'Restreindre l’action (lecture, pas tout)', 'Éviter les droits « autres » trop larges (équivalent 0.0.0.0/0 / public)', 'Mettre un secret en dur pour simplifier'],
      answer: [0, 1, 2], explanation: "Portée, action, éviter le « monde entier » : le secret en dur est l’anti-pattern à rejeter." },
  ],
});

// 6 — Architecture : la bonne archi à T0 devient mauvaise à T1 (archi) T5 — CP7
C.push({
  id: 'archi-scale-shift', title: 'Quand une contrainte nouvelle rend l’architecture correcte… mauvaise',
  sourceSkill: 'archi', skills: ['archi', 'sql'], transferLevel: 'T5',
  bridge: "une décision d'architecture est correcte SOUS des contraintes données ; quand une contrainte change (charge ×100, nouvelle exigence de fraîcheur, SPOF inacceptable), la même décision devient mauvaise → savoir expliquer pourquoi T0 était juste et T1 ne l'est plus",
  crossDomain: true,
  targetContext: "Un compteur global en une seule ligne de base de données marchait très bien au lancement (T0). À T1, le trafic est multiplié par 100 et ce compteur devient un point de contention.",
  lessonRefs: ['system-design-scaling', 'architecture-basics'],
  simulationNote: 'Évolution décrite pour le raisonnement ; aucune infra réelle.',
  passThreshold: 0.7,
  questions: [
    { id: 'q1', taxonomy: 'TRANSFER', kind: 'mcq', prompt: "Pourquoi le compteur mono-ligne, correct à T0, devient-il mauvais à T1 ?",
      options: ['À T1 la charge en fait un point de contention (écritures concurrentes sérialisées) ; à T0 la charge était trop faible pour que ça compte', 'Il était déjà mauvais à T0', 'La base est cassée', 'Le code a changé'],
      answer: 0, explanation: "La décision dépend de la contrainte de charge. Correcte sous faible charge, mauvaise sous forte charge (contention) : c’est la contrainte qui bascule, pas le code." },
    { id: 'q2', taxonomy: 'TRANSFER', kind: 'multi', prompt: "Quelles transpositions du principe « la contrainte fait la décision » sont justes ?",
      options: ['Un compteur peut être fragmenté (sharded counters) quand la charge monte', 'Une lecture synchrone peut devoir passer en cache/asynchrone quand la latence devient critique', 'Un monolithe correct au départ peut devoir se découper quand une partie doit scaler seule', 'Il faut toujours choisir dès le départ l’architecture la plus scalable'],
      answer: [0, 1, 2], explanation: "La bonne réponse CHANGE avec la contrainte (charge, latence, isolement). « Toujours le plus scalable » nie le coût de la sur-ingénierie précoce." },
  ],
});

// 7 — LLM : validation de sortie structurée → validation d’entrée d’API (llm → http) T4
C.push({
  id: 'llm-schema-to-api-validation', title: 'De la validation de sortie LLM à la validation d’entrée d’API',
  sourceSkill: 'llm', skills: ['llm', 'http'], transferLevel: 'T4',
  bridge: "ne jamais consommer une sortie « structurée » d'un LLM sans la valider contre un schéma → ne jamais faire confiance à une entrée d'API cliente sans la valider (types, champs requis, bornes) : la frontière est la douane",
  crossDomain: true,
  targetContext: "On écrit un endpoint HTTP recevant un JSON d’un client externe — sans parler de LLM.",
  lessonRefs: ['api-design-basics', 'llm-fundamentals'],
  simulationNote: 'Cas décrits pour le raisonnement.',
  passThreshold: 0.7,
  questions: [
    { id: 'q1', taxonomy: 'TRANSFER', kind: 'mcq', prompt: "Quel principe de la validation de sortie LLM se transfère à l’entrée d’API ?",
      options: ['Valider à la frontière (schéma, types, champs requis) avant d’agir sur la donnée', 'Faire confiance au client s’il envoie du JSON', 'Valider seulement en cas d’erreur', 'Logguer sans valider'],
      answer: 0, explanation: "Sortie LLM comme entrée client : données non fiables ⇒ validation au schéma à la frontière avant tout usage." },
    { id: 'q2', taxonomy: 'TRANSFER', kind: 'multi', prompt: "Quelles vérifications se transfèrent ?",
      options: ['Champs requis présents', 'Types corrects', 'Valeurs dans des bornes acceptables', 'Aucune, le JSON est toujours sûr'],
      answer: [0, 1, 2], explanation: "Présence, type, bornes : la validation de schéma. « Toujours sûr » est l’erreur." },
  ],
});

const collect = (c) => { const r = {}; for (const q of c.questions) r[q.id] = q.answer; return r; };
let failed = false;
for (const c of C) {
  const v = validateTransferChallenge(c);
  if (!v.ok) { console.error(`❌ ${c.id} INVALIDE : ${v.errors.join(' ; ')}`); failed = true; continue; }
  const res = gradeTransferChallenge(c, collect(c));
  if (!res.passed && !(res.ratio >= (c.passThreshold ?? 0.7))) { console.error(`❌ ${c.id} : référence ne passe pas (ratio ${res.ratio})`); failed = true; continue; }
  writeFileSync(join(ROOT, 'data/transfer-challenges', `${c.id}.json`), JSON.stringify({ ...c, sprint: 'v49' }, null, 2) + '\n');
  console.log('OK', c.id, `(${c.transferLevel}, ratio ${res.ratio})`);
}
if (failed) process.exit(1);
