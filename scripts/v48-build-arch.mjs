// V48 CP8 — Architecture & patterns : DÉCISIONS sous contraintes (pas de trivia).
// Chaque exercice reçoit les CONTRAINTES d'une situation et renvoie l'approche
// recommandée ; la référence encode une règle de décision défendable, énoncée
// dans le résumé. node-js, déterministe. « choisir une structure adaptée ».
import { buildAndVerify } from './v46-build-lib.mjs';

const js = (id, difficulty, title, summary, skills, starter, reference, tests) => ({
  id, title, difficulty, summary, runtime: 'node-js', language: 'javascript',
  skills, sprint: 'v48', activeFile: 'solution.mjs',
  workspace: { entry: 'solution.mjs', files: [{ path: 'solution.mjs', content: starter }] },
  reference: { 'solution.mjs': reference }, tests,
});
const EX = [];

// 1 — composition vs héritage (D3)
EX.push(js('patterns-composition-vs-inheritance', 3, 'Choix : composition ou héritage',
  "Règle : héritage seulement pour une vraie relation « est-un » STABLE ; si le comportement VARIE selon plusieurs axes ou change souvent, préférer la composition. Renvoie 'inheritance' si isA && !behaviorVaries, sinon 'composition'.",
  ['patterns', 'archi'],
  "export function choose({ isA, behaviorVaries }) {\n  // TODO: 'inheritance' | 'composition'\n  return 'composition';\n}\n",
  "export function choose({ isA, behaviorVaries }) {\n  return (isA && !behaviorVaries) ? 'inheritance' : 'composition';\n}\n",
  [
    { id: 't1', name: 'est-un stable', kind: 'call-equals', export: 'choose', args: [{ isA: true, behaviorVaries: false }], expected: 'inheritance' },
    { id: 't2', name: 'comportement varie', kind: 'call-equals', export: 'choose', args: [{ isA: true, behaviorVaries: true }], expected: 'composition' },
    { id: 't3', name: 'pas est-un (privé)', kind: 'call-equals', export: 'choose', args: [{ isA: false, behaviorVaries: false }], expected: 'composition', private: true },
  ]));

// 2 — strategy vs conditionnel inline (D3)
EX.push(js('patterns-strategy-vs-conditional', 3, 'Choix : strategy ou simple if',
  "Règle : un simple if/switch suffit pour 2 variantes stables ; au-delà de 3 variantes OU si elles changent souvent, extraire une table de stratégies. Renvoie 'strategy' si variants>3 || changesOften, sinon 'inline-if'.",
  ['patterns', 'archi'],
  "export function choose({ variants, changesOften }) {\n  // TODO: 'strategy' | 'inline-if'\n  return 'inline-if';\n}\n",
  "export function choose({ variants, changesOften }) {\n  return (variants > 3 || changesOften) ? 'strategy' : 'inline-if';\n}\n",
  [
    { id: 't1', name: '5 variantes', kind: 'call-equals', export: 'choose', args: [{ variants: 5, changesOften: false }], expected: 'strategy' },
    { id: 't2', name: '2 stables', kind: 'call-equals', export: 'choose', args: [{ variants: 2, changesOften: false }], expected: 'inline-if' },
    { id: 't3', name: 'peu mais changeant (privé)', kind: 'call-equals', export: 'choose', args: [{ variants: 2, changesOften: true }], expected: 'strategy', private: true },
  ]));

// 3 — null object (D3)
EX.push(js('patterns-null-object', 3, 'Choix : Null Object ou null',
  "Règle : si les appelants répètent le même null-check pour un comportement « ne rien faire », un Null Object supprime les branches ; si l'absence exige un traitement distinct, garder null explicite. Renvoie 'null-object' si repeatedNullChecks && !absenceIsMeaningful, sinon 'keep-null'.",
  ['patterns', 'archi'],
  "export function choose({ repeatedNullChecks, absenceIsMeaningful }) {\n  // TODO: 'null-object' | 'keep-null'\n  return 'keep-null';\n}\n",
  "export function choose({ repeatedNullChecks, absenceIsMeaningful }) {\n  return (repeatedNullChecks && !absenceIsMeaningful) ? 'null-object' : 'keep-null';\n}\n",
  [
    { id: 't1', name: 'checks répétés', kind: 'call-equals', export: 'choose', args: [{ repeatedNullChecks: true, absenceIsMeaningful: false }], expected: 'null-object' },
    { id: 't2', name: 'absence signifiante', kind: 'call-equals', export: 'choose', args: [{ repeatedNullChecks: true, absenceIsMeaningful: true }], expected: 'keep-null' },
    { id: 't3', name: 'pas de répétition (privé)', kind: 'call-equals', export: 'choose', args: [{ repeatedNullChecks: false, absenceIsMeaningful: false }], expected: 'keep-null', private: true },
  ]));

// 4 — injection de dépendance (D3)
EX.push(js('patterns-dependency-injection', 3, 'Choix : injecter une dépendance',
  "Règle : une dépendance instanciée en dur (new) qui doit être remplacée en test ou selon l'environnement doit être INJECTÉE ; une dépendance pure/déterministe sans variation peut rester locale. Renvoie 'inject' si (hardCoded && (neededInTest || variesByEnv)), sinon 'keep'.",
  ['patterns', 'se'],
  "export function choose({ hardCoded, neededInTest, variesByEnv }) {\n  // TODO: 'inject' | 'keep'\n  return 'keep';\n}\n",
  "export function choose({ hardCoded, neededInTest, variesByEnv }) {\n  return (hardCoded && (neededInTest || variesByEnv)) ? 'inject' : 'keep';\n}\n",
  [
    { id: 't1', name: 'clock à mocker', kind: 'call-equals', export: 'choose', args: [{ hardCoded: true, neededInTest: true, variesByEnv: false }], expected: 'inject' },
    { id: 't2', name: 'fonction pure', kind: 'call-equals', export: 'choose', args: [{ hardCoded: true, neededInTest: false, variesByEnv: false }], expected: 'keep' },
    { id: 't3', name: 'varie par env (privé)', kind: 'call-equals', export: 'choose', args: [{ hardCoded: true, neededInTest: false, variesByEnv: true }], expected: 'inject', private: true },
  ]));

// 5 — repository boundary (D4)
EX.push(js('arch-repository-boundary', 4, 'Choix : introduire un Repository',
  "Règle : si l'accès aux données est dispersé dans plusieurs points d'appel ET qu'on doit pouvoir changer de stockage ou tester sans base, isoler derrière un Repository ; pour un seul point d'accès trivial, l'abstraction est prématurée. Renvoie 'repository' si callSites>=2 && (swappableStore || testWithoutDb), sinon 'direct'.",
  ['archi', 'se'],
  "export function choose({ callSites, swappableStore, testWithoutDb }) {\n  // TODO: 'repository' | 'direct'\n  return 'direct';\n}\n",
  "export function choose({ callSites, swappableStore, testWithoutDb }) {\n  return (callSites >= 2 && (swappableStore || testWithoutDb)) ? 'repository' : 'direct';\n}\n",
  [
    { id: 't1', name: 'dispersé + testable', kind: 'call-equals', export: 'choose', args: [{ callSites: 4, swappableStore: false, testWithoutDb: true }], expected: 'repository' },
    { id: 't2', name: 'un seul accès', kind: 'call-equals', export: 'choose', args: [{ callSites: 1, swappableStore: true, testWithoutDb: true }], expected: 'direct' },
    { id: 't3', name: 'dispersé mais rien à isoler (privé)', kind: 'call-equals', export: 'choose', args: [{ callSites: 3, swappableStore: false, testWithoutDb: false }], expected: 'direct', private: true },
  ]));

// 6 — stratégie de cache (D4)
EX.push(js('arch-cache-invalidation', 4, 'Choix : stratégie de cache',
  "Règle : lectures >> écritures et tolérance à la péremption → 'cache-aside' ; données qui doivent rester fraîches mais écrites rarement → 'write-through' ; écritures fréquentes et fraîcheur stricte → 'no-cache' (le cache coûterait plus qu'il ne rapporte). Décision : readWriteRatio, stalenessOkSeconds.",
  ['archi'],
  "export function choose({ readWriteRatio, stalenessOkSeconds }) {\n  // TODO: 'cache-aside' | 'write-through' | 'no-cache'\n  return 'no-cache';\n}\n",
  "export function choose({ readWriteRatio, stalenessOkSeconds }) {\n  if (readWriteRatio < 2) return 'no-cache';\n  if (stalenessOkSeconds > 0) return 'cache-aside';\n  return 'write-through';\n}\n",
  [
    { id: 't1', name: 'lecture lourde tolérante', kind: 'call-equals', export: 'choose', args: [{ readWriteRatio: 50, stalenessOkSeconds: 30 }], expected: 'cache-aside' },
    { id: 't2', name: 'écriture lourde', kind: 'call-equals', export: 'choose', args: [{ readWriteRatio: 1, stalenessOkSeconds: 0 }], expected: 'no-cache' },
    { id: 't3', name: 'lecture lourde fraîche (privé)', kind: 'call-equals', export: 'choose', args: [{ readWriteRatio: 20, stalenessOkSeconds: 0 }], expected: 'write-through', private: true },
  ]));

// 7 — clé d'idempotence (D4)
EX.push(js('arch-idempotency-key', 4, 'Choix : exiger une clé d’idempotence',
  "Règle : une opération qui MODIFIE l'état et peut être réémise (retry réseau, webhook rejoué) doit exiger une clé d'idempotence ; une lecture pure ou une opération déjà naturellement idempotente n'en a pas besoin. Renvoie 'idempotency-key' si mutating && retriable && !naturallyIdempotent, sinon 'not-needed'.",
  ['archi', 'se'],
  "export function choose({ mutating, retriable, naturallyIdempotent }) {\n  // TODO: 'idempotency-key' | 'not-needed'\n  return 'not-needed';\n}\n",
  "export function choose({ mutating, retriable, naturallyIdempotent }) {\n  return (mutating && retriable && !naturallyIdempotent) ? 'idempotency-key' : 'not-needed';\n}\n",
  [
    { id: 't1', name: 'paiement rejoué', kind: 'call-equals', export: 'choose', args: [{ mutating: true, retriable: true, naturallyIdempotent: false }], expected: 'idempotency-key' },
    { id: 't2', name: 'lecture', kind: 'call-equals', export: 'choose', args: [{ mutating: false, retriable: true, naturallyIdempotent: false }], expected: 'not-needed' },
    { id: 't3', name: 'PUT idempotent (privé)', kind: 'call-equals', export: 'choose', args: [{ mutating: true, retriable: true, naturallyIdempotent: true }], expected: 'not-needed', private: true },
  ]));

// 8 — file vs synchrone (D4)
EX.push(js('arch-queue-vs-sync', 4, 'Choix : file asynchrone ou synchrone',
  "Règle : un travail qui peut être différé, avec des pics de charge et un traitement long, gagne à passer par une FILE (lisse la charge, isole les pannes) ; une réponse dont l'appelant a besoin immédiatement doit rester synchrone. Renvoie 'queue' si canDefer && (spiky || longRunning), sinon 'sync'.",
  ['archi'],
  "export function choose({ canDefer, spiky, longRunning }) {\n  // TODO: 'queue' | 'sync'\n  return 'sync';\n}\n",
  "export function choose({ canDefer, spiky, longRunning }) {\n  return (canDefer && (spiky || longRunning)) ? 'queue' : 'sync';\n}\n",
  [
    { id: 't1', name: 'envoi d’email en pic', kind: 'call-equals', export: 'choose', args: [{ canDefer: true, spiky: true, longRunning: false }], expected: 'queue' },
    { id: 't2', name: 'réponse immédiate requise', kind: 'call-equals', export: 'choose', args: [{ canDefer: false, spiky: true, longRunning: true }], expected: 'sync' },
    { id: 't3', name: 'différable mais court/stable (privé)', kind: 'call-equals', export: 'choose', args: [{ canDefer: true, spiky: false, longRunning: false }], expected: 'sync', private: true },
  ]));

// 9 — backpressure (D4)
EX.push(js('arch-backpressure', 4, 'Choix : gérer un producteur trop rapide',
  "Règle : si le producteur dépasse durablement le consommateur avec mémoire BORNÉE, il faut soit ralentir la source ('backpressure') si elle est contrôlable, soit 'drop' (échantillonner/jeter) si les données sont périssables, soit 'scale' le consommateur si la charge est légitime et durable. Décision : sourceControllable, dataPerishable.",
  ['archi'],
  "export function choose({ sourceControllable, dataPerishable }) {\n  // TODO: 'backpressure' | 'drop' | 'scale'\n  return 'scale';\n}\n",
  "export function choose({ sourceControllable, dataPerishable }) {\n  if (sourceControllable) return 'backpressure';\n  if (dataPerishable) return 'drop';\n  return 'scale';\n}\n",
  [
    { id: 't1', name: 'source contrôlable', kind: 'call-equals', export: 'choose', args: [{ sourceControllable: true, dataPerishable: false }], expected: 'backpressure' },
    { id: 't2', name: 'métriques périssables', kind: 'call-equals', export: 'choose', args: [{ sourceControllable: false, dataPerishable: true }], expected: 'drop' },
    { id: 't3', name: 'charge légitime (privé)', kind: 'call-equals', export: 'choose', args: [{ sourceControllable: false, dataPerishable: false }], expected: 'scale', private: true },
  ]));

// 10 — circuit breaker (D5)
EX.push(js('arch-circuit-breaker', 5, 'Choix : circuit breaker, retry ou fail-fast',
  "Règle : face à une dépendance en panne, si les tentatives AMPLIFIENT la charge sur un service déjà à terre, ouvrir un 'circuit-breaker' (couper, laisser respirer) ; si la panne est transitoire ET isolée (pas d'amplification), 'retry' avec backoff ; si aucune valeur à réessayer et pas de repli, 'fail-fast'. Décision : failing, retriesAmplify, transient.",
  ['archi', 'se'],
  "export function choose({ failing, retriesAmplify, transient }) {\n  // TODO: 'circuit-breaker' | 'retry' | 'fail-fast'\n  return 'fail-fast';\n}\n",
  "export function choose({ failing, retriesAmplify, transient }) {\n  if (!failing) return 'fail-fast';\n  if (retriesAmplify) return 'circuit-breaker';\n  if (transient) return 'retry';\n  return 'fail-fast';\n}\n",
  [
    { id: 't1', name: 'retries aggravent', kind: 'call-equals', export: 'choose', args: [{ failing: true, retriesAmplify: true, transient: true }], expected: 'circuit-breaker' },
    { id: 't2', name: 'transitoire isolé', kind: 'call-equals', export: 'choose', args: [{ failing: true, retriesAmplify: false, transient: true }], expected: 'retry' },
    { id: 't3', name: 'panne dure non amplifiante (privé)', kind: 'call-equals', export: 'choose', args: [{ failing: true, retriesAmplify: false, transient: false }], expected: 'fail-fast', private: true },
  ]));

// 11 — transactional outbox (D5)
EX.push(js('arch-transactional-outbox', 5, 'Choix : publier un événement de façon fiable',
  "Règle : écrire en base ET publier un événement doivent être atomiques. Le 'dual-write' (écrire puis publier) perd des événements si le process meurt entre les deux. Si un bus est présent et la cohérence exigée, utiliser l'« outbox » (événement écrit dans la même transaction, relayé ensuite). Si aucun consommateur ne dépend de l'événement, 'none'. Décision : needsEvent, mustNotLose.",
  ['archi', 'se'],
  "export function choose({ needsEvent, mustNotLose }) {\n  // TODO: 'outbox' | 'dual-write' | 'none'\n  return 'none';\n}\n",
  "export function choose({ needsEvent, mustNotLose }) {\n  if (!needsEvent) return 'none';\n  return mustNotLose ? 'outbox' : 'dual-write';\n}\n",
  [
    { id: 't1', name: 'cohérence exigée', kind: 'call-equals', export: 'choose', args: [{ needsEvent: true, mustNotLose: true }], expected: 'outbox' },
    { id: 't2', name: 'pas d’événement', kind: 'call-equals', export: 'choose', args: [{ needsEvent: false, mustNotLose: true }], expected: 'none' },
    { id: 't3', name: 'perte tolérable (privé)', kind: 'call-equals', export: 'choose', args: [{ needsEvent: true, mustNotLose: false }], expected: 'dual-write', private: true },
  ]));

// 12 — CQRS : quand NE PAS séparer (D5)
EX.push(js('arch-cqrs-when', 5, 'Choix : séparer lecture et écriture (CQRS) ?',
  "Règle (contre la sur-ingénierie) : ne séparer les modèles lecture/écriture que si les charges lecture et écriture divergent FORTEMENT et que les modèles de lecture sont réellement différents ; sinon un modèle unique reste plus simple et suffisant. Renvoie 'cqrs' si loadAsymmetryHigh && readModelsDiffer, sinon 'single-model'.",
  ['archi'],
  "export function choose({ loadAsymmetryHigh, readModelsDiffer }) {\n  // TODO: 'cqrs' | 'single-model'\n  return 'single-model';\n}\n",
  "export function choose({ loadAsymmetryHigh, readModelsDiffer }) {\n  return (loadAsymmetryHigh && readModelsDiffer) ? 'cqrs' : 'single-model';\n}\n",
  [
    { id: 't1', name: 'asymétrie + modèles distincts', kind: 'call-equals', export: 'choose', args: [{ loadAsymmetryHigh: true, readModelsDiffer: true }], expected: 'cqrs' },
    { id: 't2', name: 'charge symétrique', kind: 'call-equals', export: 'choose', args: [{ loadAsymmetryHigh: false, readModelsDiffer: true }], expected: 'single-model' },
    { id: 't3', name: 'asymétrique mais même modèle (privé)', kind: 'call-equals', export: 'choose', args: [{ loadAsymmetryHigh: true, readModelsDiffer: false }], expected: 'single-model', private: true },
  ]));

// 13 — cohérence vs disponibilité sous partition (D5)
EX.push(js('arch-consistency-tradeoff', 5, 'Choix : AP ou CP sous partition réseau',
  "Règle (CAP) : en cas de partition réseau, un système ne peut garantir à la fois cohérence et disponibilité. Si une réponse périmée est DANGEREUSE (solde bancaire, stock unique), choisir la cohérence ('CP', refuser plutôt que mentir) ; si l'indisponibilité est pire qu'une donnée légèrement périmée (fil d'actualité, panier), choisir la disponibilité ('AP'). Décision : staleReadHarmful.",
  ['archi'],
  "export function choose({ staleReadHarmful }) {\n  // TODO: 'CP' | 'AP'\n  return 'AP';\n}\n",
  "export function choose({ staleReadHarmful }) {\n  return staleReadHarmful ? 'CP' : 'AP';\n}\n",
  [
    { id: 't1', name: 'solde bancaire', kind: 'call-equals', export: 'choose', args: [{ staleReadHarmful: true }], expected: 'CP' },
    { id: 't2', name: 'fil d’actualité', kind: 'call-equals', export: 'choose', args: [{ staleReadHarmful: false }], expected: 'AP' },
    { id: 't3', name: 'stock unique (privé)', kind: 'call-equals', export: 'choose', args: [{ staleReadHarmful: true }], expected: 'CP', private: true },
  ]));

const run = async () => { for (const e of EX) { await buildAndVerify(e); console.log('OK', e.id, `(D${e.difficulty} ${e.runtime})`); } };
run().catch((e) => { console.error(e.message); process.exit(1); });
