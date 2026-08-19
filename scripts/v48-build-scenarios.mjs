// V48 CP9/CP10 — Scénarios professionnels multi-compétences.
// RÉUTILISE le moteur de capstone EXISTANT (lib/capstone.mjs) : divulgation
// progressive (context/signal → artefacts avec bruit → 7 phases → debrief).
// AUCUN nouveau moteur. Chaque scénario est vérifié : validateCapstone OK et
// gradeCapstone(reference) => passedOverall.
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCapstone, gradeCapstone } from '../lib/capstone.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Helper : chaque question porte sa bonne réponse ; on la collecte pour vérifier
// que la « copie de référence » réussit le capstone.
const CAPS = [];

// ─────────────────────────────────────────────────────────────────────────────
// 1 — Agent bloqué dans une boucle d'outil (agents, se) — D5
CAPS.push({
  id: 'agent-tool-loop-incident', title: 'Agent : boucle d’outil et budget consommé',
  domain: 'Applied AI / Agents', difficulty: 5, estimatedMinutes: 45,
  skills: ['agents', 'se'],
  lessonRefs: ['agent-workflows-orchestration', 'agents-fundamentals'],
  exerciseRefs: ['agent-cycle-index', 'agent-tool-failure-recovery', 'agent-excessive-agency', 'agent-transition-guard'],
  playbookRefs: [], dayRefs: [],
  simulationNote: 'Traces d’agent simulées, déterministes. Aucun appel de modèle réel.',
  passThreshold: 0.7,
  context: "Un agent « assistant de tickets » doit lire un ticket, chercher dans la base de connaissances, puis proposer une réponse. Depuis hier, certains tickets épuisent le budget d’étapes (20) sans jamais répondre, et la facture d’appels a triplé.",
  signal: "10 % des exécutions atteignent la limite de 20 étapes sans produire de réponse. Coût par exécution ×3 sur ces cas.",
  artifacts: [
    { id: 'trace', kind: 'trace', title: 'Trace d’un run qui échoue (simulée)', useful: true,
      content: "step1 (state=triage, action=search 'mot de passe')\nstep2 (state=triage, action=search 'mot de passe')\nstep3 (state=triage, action=search 'mot de passe')\n… répété jusqu’à step20 : LIMIT_REACHED, aucune réponse émise." },
    { id: 'tool', kind: 'log', title: 'Résultat de l’outil search (simulé)', useful: true,
      content: "search('mot de passe') -> [] (0 résultat). L’outil renvoie une liste vide, pas d’erreur. L’agent ne change pas d’état." },
    { id: 'diff', kind: 'diff', title: 'Changement récent de l’orchestrateur', useful: true,
      content: "- if results.empty(): go_to('ask_human')\n+ # (ligne supprimée par erreur lors d’un refactor)" },
    { id: 'infra', kind: 'metrics', title: 'CPU des workers (simulé)', useful: false,
      content: "CPU worker moyen 35 %, mémoire 40 %. Rien d’anormal côté ressources." },
    { id: 'model', kind: 'log', title: 'Latence du modèle (simulée)', useful: false,
      content: "Latence p50 420 ms, p95 900 ms, stable depuis 30 jours." },
  ],
  phases: [
    { id: 'hypotheses', kind: 'hypotheses', title: 'Hypothèses', prompt: "L’agent tourne en rond sur certains tickets. Quelles causes envisager ?",
      questions: [{ id: 'h1', taxonomy: 'APPLICATION', kind: 'multi', prompt: 'Hypothèses plausibles :',
        options: ['Aucune transition de sortie quand la recherche est vide', "Pas de garde-boucle (répétition état/action)", 'Le modèle est trop lent', 'Les workers manquent de CPU'],
        answer: [0, 1], explanation: "Une recherche vide sans transition + l’absence de garde-boucle produisent la répétition. Latence et CPU sont stables (faux indices)." }] },
    { id: 'investigation', kind: 'investigation', title: 'Investigation', prompt: "Quel artefact confirme la boucle ?",
      questions: [{ id: 'i1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'L’élément le plus révélateur est :',
        options: ['La trace répétant le même (état, action) 20 fois', 'Le CPU des workers', 'La latence p95 du modèle'],
        answer: 0, explanation: "La trace montre le même couple (triage, search) répété : boucle caractérisée. CPU/latence sont des diversions." }] },
    { id: 'diagnosis', kind: 'diagnosis', title: 'Diagnostic', prompt: "Cause racine ?",
      questions: [{ id: 'd1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'La cause racine est :',
        options: ["Le refactor a supprimé la transition « résultat vide → demander à un humain », et il n’existe aucun garde-boucle", 'Le modèle hallucine', 'La base de connaissances est corrompue'],
        answer: 0, explanation: "Le diff supprime la sortie sur résultat vide ; sans garde-boucle, l’agent répète la même action jusqu’à la limite. Le contenu de la base n’est pas en cause (0 résultat est légitime pour cette requête)." }] },
    { id: 'decision', kind: 'decision', title: 'Décision', prompt: "Quelle correction, sous contrainte de fiabilité ?",
      questions: [{ id: 'de1', taxonomy: 'APPLICATION', kind: 'multi', prompt: 'Mesures à prendre :',
        options: ['Rétablir la transition « résultat vide → escalade humaine (HITL) »', 'Ajouter un garde-boucle qui coupe si (état, action) se répète', 'Augmenter la limite d’étapes à 200', 'Supprimer la limite d’étapes'],
        answer: [0, 1], explanation: "On corrige la cause (transition) ET on ajoute une défense en profondeur (garde-boucle). Augmenter/supprimer la limite ne fait qu’aggraver le coût." }] },
    { id: 'remediation', kind: 'remediation', title: 'Remédiation', prompt: "Comment éviter la récidive ?",
      questions: [{ id: 'r1', taxonomy: 'APPLICATION', kind: 'mcq', prompt: 'La garde la plus générale est :',
        options: ['Détecter la répétition d’un (état, action) déjà vu et interrompre', 'Prier pour que la base ait toujours des résultats', 'Mettre un sleep entre les étapes'],
        answer: 0, explanation: "Un garde-boucle générique protège de toutes les variantes futures, indépendamment de la cause immédiate." }] },
    { id: 'validation', kind: 'validation', title: 'Validation', prompt: "Comment prouver que c’est réglé ?",
      questions: [{ id: 'v1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'Preuve de non-régression :',
        options: ['0 % d’exécutions atteignant la limite sur un jeu rejouant les tickets à recherche vide, et une escalade émise', 'Le CPU baisse', 'La latence baisse'],
        answer: 0, explanation: "On rejoue précisément les cas fautifs et on vérifie l’escalade + l’absence de boucle." }] },
    { id: 'communication', kind: 'communication', title: 'Communication', prompt: "Message au reste de l’équipe.",
      questions: [{ id: 'c1', taxonomy: 'UNDERSTANDING', kind: 'mcq', prompt: 'Le résumé honnête est :',
        options: ['Un refactor a retiré l’escalade sur résultat vide ; sans garde-boucle l’agent bouclait. Transition rétablie + garde-boucle ajouté ; cas fautifs au vert.', 'Le modèle était lent, on a mis à l’échelle.', 'La base était corrompue, on l’a restaurée.'],
        answer: 0, explanation: "Communication exacte : cause, correctif, preuve. Pas de récit erroné." }] },
  ],
  debrief: { expectedReasoning: "La trace montre le même (état, action) répété 20 fois : c’est une boucle, pas une lenteur. L’outil renvoie légitimement 0 résultat ; le diff a supprimé la transition « vide → escalade humaine », et il n’existe aucun garde-boucle. CPU et latence sont stables (faux indices). Correctif à deux niveaux : rétablir l’escalade (cause) et ajouter un garde-boucle générique détectant la répétition (défense en profondeur). Ne PAS augmenter/supprimer la limite d’étapes (aggrave le coût). Validation : rejouer les tickets à recherche vide → 0 boucle, escalade émise.",
    keySignals: ['même (état, action) répété jusqu’à la limite', 'search renvoie [] sans erreur', 'diff supprimant l’escalade sur résultat vide'],
    redHerrings: ['CPU des workers', 'latence du modèle'],
    alternatives: ['Base corrompue : écartée (0 résultat est légitime)', 'Modèle hallucinant : écarté (aucune réponse n’est émise)'],
    tradeoffs: ['Correctif ciblé (transition) vs garde générique (boucle) : faire les deux', 'Limite d’étapes basse (coût maîtrisé) vs haute (masque le bug)'] },
});

// ─────────────────────────────────────────────────────────────────────────────
// 2 — Régression d'un feature LLM après grossissement du contexte (llm, evalia) — D4
CAPS.push({
  id: 'llm-context-budget-regression', title: 'LLM : régression après un contexte trop gros',
  domain: 'Applied AI / LLM', difficulty: 4, estimatedMinutes: 40,
  skills: ['llm', 'evalia'],
  lessonRefs: ['llm-cost-optimization', 'llm-fundamentals', 'ai-evaluation'],
  exerciseRefs: ['llm-context-budget-truncate', 'llm-cost-budget-plan', 'eval-regression-gate'],
  playbookRefs: [], dayRefs: [],
  simulationNote: 'Sorties et coûts fournis, déterministes. Aucun appel de modèle réel.',
  passThreshold: 0.7,
  context: "Un assistant de support résume les échanges d’un client. Pour « améliorer la qualité », on a augmenté le nombre de messages injectés dans le prompt de 6 à 40. Depuis, la qualité a BAISSÉ et la facture a explosé.",
  signal: "Exact-match sur le jeu de référence : 0.82 → 0.67. Coût par requête ×5. Aucune erreur applicative.",
  artifacts: [
    { id: 'diff', kind: 'diff', title: 'Changement du prompt builder', useful: true,
      content: "- history = messages[-6:]\n+ history = messages[:]  # on met tout l’historique" },
    { id: 'eval', kind: 'metrics', title: 'Évaluation avant/après (simulée)', useful: true,
      content: "exact_match: 0.82 -> 0.67\ntokens_prompt moyen: 900 -> 6200\ncoût/req: 0.004$ -> 0.020$" },
    { id: 'sample', kind: 'log', title: 'Exemple de sortie dégradée (simulé)', useful: true,
      content: "Le résumé cite un incident vieux de 8 mois, sans rapport avec la demande actuelle. Les messages récents pertinents sont noyés." },
    { id: 'infra', kind: 'metrics', title: 'Disponibilité de l’API modèle (simulée)', useful: false,
      content: "Uptime 99.98 %, aucune erreur 5xx. Rien à signaler." },
  ],
  phases: [
    { id: 'hypotheses', kind: 'hypotheses', title: 'Hypothèses', prompt: "Qualité en baisse ET coût en hausse. Causes ?",
      questions: [{ id: 'h1', taxonomy: 'APPLICATION', kind: 'multi', prompt: 'Hypothèses plausibles :',
        options: ['Trop de contexte noie l’information récente pertinente', 'Le coût suit la taille du prompt', 'Le modèle a été rétrogradé', 'L’API est en panne'],
        answer: [0, 1], explanation: "Injecter tout l’historique dilue le signal et multiplie les tokens d’entrée. L’API est saine (faux indice)." }] },
    { id: 'investigation', kind: 'investigation', title: 'Investigation', prompt: "Quel artefact relie qualité et coût ?",
      questions: [{ id: 'i1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'L’élément décisif :',
        options: ['Le diff passant de messages[-6:] à tout l’historique + tokens 900→6200', 'L’uptime de l’API', 'Le nombre de clients'],
        answer: 0, explanation: "Le diff explique simultanément la hausse de tokens (coût) et la dilution (qualité)." }] },
    { id: 'diagnosis', kind: 'diagnosis', title: 'Diagnostic', prompt: "Cause racine ?",
      questions: [{ id: 'd1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'La cause est :',
        options: ['Injecter tout l’historique noie les messages récents pertinents et gonfle les tokens', 'Le modèle est cassé', 'Le jeu de référence est faux'],
        answer: 0, explanation: "« Plus de contexte » n’est pas « meilleur » : au-delà du pertinent, on dilue et on paie. Le modèle et l’éval sont sains." }] },
    { id: 'decision', kind: 'decision', title: 'Décision', prompt: "Quelle stratégie de contexte ?",
      questions: [{ id: 'de1', taxonomy: 'APPLICATION', kind: 'multi', prompt: 'Mesures :',
        options: ['Garder le système + les N messages récents qui tiennent dans un budget', 'Poser une porte de non-régression sur exact-match', 'Remettre tout l’historique mais avec un modèle plus cher', 'Désactiver l’évaluation'],
        answer: [0, 1], explanation: "On borne le contexte au budget (récence) et on protège par une gate. Rajouter du contexte cher est l’inverse de la solution." }] },
    { id: 'remediation', kind: 'remediation', title: 'Remédiation', prompt: "Éviter la récidive ?",
      questions: [{ id: 'r1', taxonomy: 'APPLICATION', kind: 'mcq', prompt: 'Le garde-fou durable :',
        options: ['Une gate qui refuse une baisse d’exact-match > tolérance avant déploiement', 'Augmenter le budget mensuel', 'Supprimer les tests'],
        answer: 0, explanation: "Une porte de non-régression aurait bloqué le passage 0.82→0.67 avant la prod." }] },
    { id: 'validation', kind: 'validation', title: 'Validation', prompt: "Preuve que c’est réglé ?",
      questions: [{ id: 'v1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'Preuve :',
        options: ['exact-match rétabli ≥ 0.82 ET coût/req revenu proche de 0.004$', 'L’uptime reste bon', 'Le nombre de clients augmente'],
        answer: 0, explanation: "On prouve les deux axes dégradés : qualité rétablie et coût maîtrisé." }] },
    { id: 'communication', kind: 'communication', title: 'Communication', prompt: "Note à l’équipe produit.",
      questions: [{ id: 'c1', taxonomy: 'UNDERSTANDING', kind: 'mcq', prompt: 'Le résumé honnête :',
        options: ['« Tout l’historique » a dilué le pertinent et quintuplé le coût ; on borne au budget de récence + gate de non-régression ; qualité et coût rétablis.', 'L’API était en panne.', 'Le modèle a été rétrogradé par le fournisseur.'],
        answer: 0, explanation: "Exact et actionnable ; pas de fausse cause." }] },
  ],
  debrief: { expectedReasoning: "Le seul changement corrélé est le prompt builder passant de 6 messages à TOUT l’historique. Effet double : les tokens d’entrée passent de 900 à 6200 (coût ×5) et l’information récente pertinente est noyée sous du vieux contexte (exact-match 0.82→0.67). L’API est saine (faux indice). « Plus de contexte » n’est pas « meilleur ». Correctif : borner le contexte (système + N récents tenant dans un budget) et poser une porte de non-régression qui aurait bloqué la dégradation. Validation : exact-match ≥ 0.82 et coût/req ~0.004$.",
    keySignals: ['diff messages[-6:] → tout l’historique', 'tokens 900→6200, coût ×5', 'exact-match 0.82→0.67', 'sortie citant un incident hors sujet'],
    redHerrings: ['uptime de l’API', 'nombre de clients'],
    alternatives: ['Modèle rétrogradé : écarté (aucun changement côté fournisseur)', 'Éval fausse : écartée (jeu de référence stable)'],
    tradeoffs: ['Récence bornée (simple, efficace) vs résumé hiérarchique de l’historique (plus riche, plus complexe)'] },
});

// ─────────────────────────────────────────────────────────────────────────────
// 3 — Refactor d'un service historique (archi, patterns, se) — D5
CAPS.push({
  id: 'legacy-service-refactor', title: 'Architecture : refactor gouverné d’un service historique',
  domain: 'Architecture / Refactor', difficulty: 5, estimatedMinutes: 50,
  skills: ['archi', 'patterns', 'se'],
  lessonRefs: ['refactoring-legacy-code', 'architecture-basics', 'design-patterns-intro'],
  exerciseRefs: ['arch-repository-boundary', 'patterns-strategy-vs-conditional', 'arch-idempotency-key', 'arch-transactional-outbox'],
  playbookRefs: [], dayRefs: [],
  simulationNote: 'Code et contraintes fournis, déterministes.',
  passThreshold: 0.7,
  context: "Un service de commandes de 4000 lignes concentre tout dans un `switch(type)` géant, accède à la base directement depuis les contrôleurs, et publie un événement « commande payée » APRÈS le commit (parfois perdu si le process meurt). On vous demande de le rendre maintenable sans tout réécrire.",
  signal: "3 incidents en un mois : un webhook de paiement rejoué a créé une double commande ; un événement « payée » perdu a bloqué l’expédition ; ajouter un 6e type de commande a cassé deux autres.",
  artifacts: [
    { id: 'switch', kind: 'code', title: 'Le switch géant (extrait simulé)', useful: true,
      content: "switch(type){ case 'std': /*80 lignes*/ case 'gift': /*70*/ case 'sub': /*90*/ ... } // ajouter un type oblige à toucher ce bloc partagé" },
    { id: 'dao', kind: 'code', title: 'Accès base dans le contrôleur (simulé)', useful: true,
      content: "OrderController: db.query('INSERT ...'); db.query('SELECT ...'); // SQL dispersé dans 7 contrôleurs, impossible à tester sans base" },
    { id: 'publish', kind: 'code', title: 'Publication d’événement (simulée)', useful: true,
      content: "await db.commit(order);\nawait bus.publish('order.paid', order.id); // si crash entre les deux : événement perdu" },
    { id: 'retry', kind: 'log', title: 'Webhook de paiement (simulé)', useful: true,
      content: "Le fournisseur RÉÉMET le webhook 'payment.succeeded' en cas de timeout. handlePayment crée une nouvelle commande à chaque appel (pas de clé d’idempotence)." },
    { id: 'style', kind: 'ci', title: 'Rapport de style (simulé)', useful: false,
      content: "Lint : 42 avertissements de style (indentation, guillemets). Aucune erreur bloquante." },
  ],
  phases: [
    { id: 'hypotheses', kind: 'hypotheses', title: 'Hypothèses', prompt: "Trois familles d’incidents. Où sont les vraies faiblesses de conception ?",
      questions: [{ id: 'h1', taxonomy: 'APPLICATION', kind: 'multi', prompt: 'Faiblesses réelles :',
        options: ['Webhook rejoué sans clé d’idempotence → doublons', 'Événement publié après commit (dual-write) → pertes', 'switch partagé → couplage entre types', 'Avertissements de style du linter'],
        answer: [0, 1, 2], explanation: "Les trois incidents mappent sur idempotence, outbox et couplage. Le style n’est pas la cause (faux indice)." }] },
    { id: 'investigation', kind: 'investigation', title: 'Investigation', prompt: "Quel artefact explique la double commande ?",
      questions: [{ id: 'i1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'La double commande vient de :',
        options: ['handlePayment sans clé d’idempotence face à un webhook réémis', 'Le rapport de lint', 'Le switch géant'],
        answer: 0, explanation: "Le fournisseur réémet ; sans clé d’idempotence, chaque réémission recrée une commande." }] },
    { id: 'diagnosis', kind: 'diagnosis', title: 'Diagnostic', prompt: "Nommer les trois problèmes de conception.",
      questions: [{ id: 'd1', taxonomy: 'DIAGNOSIS', kind: 'multi', prompt: 'Les trois défauts :',
        options: ['Absence de clé d’idempotence sur une opération mutante rejouable', 'Dual-write commit→publish (perte d’événement possible)', 'Logique par type couplée dans un switch partagé', 'Trop de commentaires'],
        answer: [0, 1, 2], explanation: "Idempotence, outbox transactionnel, extraction de stratégies par type : trois décisions de conception justifiées par les incidents." }] },
    { id: 'decision', kind: 'decision', title: 'Décision', prompt: "Quels changements, JUSTIFIÉS par une contrainte, et lesquels ÉVITER ?",
      questions: [{ id: 'de1', taxonomy: 'APPLICATION', kind: 'multi', prompt: 'Décisions justifiées :',
        options: ['Clé d’idempotence sur handlePayment', 'Outbox : écrire l’événement dans la transaction, relais ensuite', 'Extraire une stratégie par type de commande (table)', 'Introduire des micro-services et du CQRS partout'],
        answer: [0, 1, 2], explanation: "On corrige ce que les incidents prouvent. Micro-services + CQRS partout = sur-ingénierie non justifiée (à éviter)." }] },
    { id: 'remediation', kind: 'remediation', title: 'Remédiation', prompt: "Isoler l’accès aux données ?",
      questions: [{ id: 'r1', taxonomy: 'APPLICATION', kind: 'mcq', prompt: 'Le SQL dispersé dans 7 contrôleurs devrait :',
        options: ['Passer derrière un Repository (testable sans base, un seul point de changement)', 'Rester tel quel', 'Être copié dans chaque contrôleur'],
        answer: 0, explanation: "Accès dispersé + besoin de tester sans base ⇒ Repository justifié (≥2 points d’appel)." }] },
    { id: 'validation', kind: 'validation', title: 'Validation', prompt: "Comment prouver le refactor sûr ?",
      questions: [{ id: 'v1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'Preuve de non-régression :',
        options: ['Rejouer un webhook → une seule commande ; tuer le process entre commit et relais → événement non perdu ; ajouter un type sans toucher aux autres', 'Le lint est vert', 'Le service démarre'],
        answer: 0, explanation: "On valide chaque incident par un test rejouant précisément le scénario." }] },
    { id: 'communication', kind: 'communication', title: 'Communication', prompt: "Note de décision pour la revue.",
      questions: [{ id: 'c1', taxonomy: 'UNDERSTANDING', kind: 'mcq', prompt: 'Le résumé honnête :',
        options: ['Trois défauts prouvés par incident : idempotence, outbox, stratégies par type ; Repository pour tester. On N’ajoute PAS micro-services/CQRS (non justifiés).', 'On réécrit tout en micro-services.', 'On corrige le style et on ferme.'],
        answer: 0, explanation: "Chaque changement est adossé à une contrainte ; on nomme aussi ce qu’on refuse." }] },
  ],
  debrief: { expectedReasoning: "Les trois incidents pointent trois décisions de conception : (1) le webhook de paiement est réémis et handlePayment n’a pas de clé d’idempotence → doublons ; (2) l’événement « payée » est publié APRÈS le commit (dual-write) et se perd si le process meurt → utiliser un outbox transactionnel ; (3) la logique par type vit dans un switch partagé → extraire une stratégie par type pour découpler. Le SQL dispersé dans 7 contrôleurs justifie un Repository (testable sans base). Ce qu’on ÉVITE : micro-services et CQRS partout, non justifiés par les contraintes (sur-ingénierie). Le lint est un faux indice. Validation : un test par incident rejoué.",
    keySignals: ['webhook réémis sans idempotence', 'publish après commit', 'switch partagé entre types', 'SQL dans 7 contrôleurs'],
    redHerrings: ['avertissements de style du linter'],
    alternatives: ['Tout réécrire en micro-services : rejeté (risque et coût sans contrainte le justifiant)', 'CQRS global : rejeté (pas d’asymétrie de charge démontrée)'],
    tradeoffs: ['Refactor incrémental ciblé (sûr) vs réécriture (risquée)', 'Outbox (fiable, un peu plus de code) vs dual-write (simple, fragile)'] },
});

// ─────────────────────────────────────────────────────────────────────────────
// 4 — Modèle de fraude : bon en validation, mauvais en prod (ml, evalia) — D4
CAPS.push({
  id: 'ml-imbalance-fraud-incident', title: 'ML : fraude — 0.98 en validation, inutile en prod',
  domain: 'Data / ML', difficulty: 4, estimatedMinutes: 45,
  skills: ['ml', 'evalia'],
  lessonRefs: ['machine-learning-basics', 'model-evaluation', 'ai-evaluation'],
  exerciseRefs: ['ml-imbalance-metric-trap', 'ml-confusion-cost', 'ml-baseline-vs-model', 'ml-calibration-ece'],
  playbookRefs: [], dayRefs: [],
  simulationNote: 'Chiffres et matrices fournis, déterministes. (pandas/sklearn dans la série d’exercices.)',
  passThreshold: 0.7,
  context: "Un modèle détecte des transactions frauduleuses (0,5 % de fraude). L’équipe annonce « 98 % d’accuracy » et met en prod. Les analystes se plaignent : presque aucune fraude n’est attrapée, et les rares alertes sont surtout fausses.",
  signal: "Accuracy validation 0.98. En prod : rappel fraude 0.06, et parmi les alertes, 1 sur 10 est réelle.",
  artifacts: [
    { id: 'cm', kind: 'metrics', title: 'Matrice de confusion (validation, simulée)', useful: true,
      content: "TN=9900 FP=20 FN=47 TP=33 (sur 10000). Accuracy=(9900+33)/10000=0.9933. Mais rappel fraude=33/80=0.41 en validation, pire en prod." },
    { id: 'baseline', kind: 'metrics', title: 'Baseline « tout légitime » (simulée)', useful: true,
      content: "Prédire toujours 'légitime' → accuracy 0.995 (car 99,5 % sont légitimes). Le modèle à 0.98 fait donc PIRE que ne rien faire, en accuracy." },
    { id: 'threshold', kind: 'metrics', title: 'Coût métier (simulé)', useful: true,
      content: "Une fraude ratée (FN) coûte 200€ ; une fausse alerte (FP) coûte 2€ de vérification. Le seuil actuel (0.5) est optimisé pour l’accuracy, pas pour le coût." },
    { id: 'infra', kind: 'log', title: 'Temps d’inférence (simulé)', useful: false,
      content: "Inférence 8 ms/transaction, throughput large. Aucune contrainte de performance." },
  ],
  phases: [
    { id: 'hypotheses', kind: 'hypotheses', title: 'Hypothèses', prompt: "Accuracy élevée mais fraude non attrapée. Pourquoi ?",
      questions: [{ id: 'h1', taxonomy: 'APPLICATION', kind: 'multi', prompt: 'Hypothèses plausibles :',
        options: ['L’accuracy est trompeuse sur données déséquilibrées', 'Le seuil est réglé pour l’accuracy, pas pour le coût métier', 'L’inférence est trop lente', 'La baseline triviale fait déjà 0.995'],
        answer: [0, 1, 3], explanation: "Le déséquilibre rend l’accuracy inutile ; le seuil ignore le coût ; la baseline expose le piège. La latence est un faux indice." }] },
    { id: 'investigation', kind: 'investigation', title: 'Investigation', prompt: "Quel chiffre disqualifie l’accuracy ?",
      questions: [{ id: 'i1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'Le chiffre décisif :',
        options: ['La baseline « tout légitime » atteint 0.995 (> 0.98 du modèle)', 'Le temps d’inférence de 8 ms', 'Le nombre de transactions'],
        answer: 0, explanation: "Si prédire toujours « légitime » bat le modèle en accuracy, l’accuracy ne mesure rien d’utile ici." }] },
    { id: 'diagnosis', kind: 'diagnosis', title: 'Diagnostic', prompt: "Cause racine du fiasco ?",
      questions: [{ id: 'd1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'La cause est :',
        options: ['Mauvaise métrique (accuracy) et mauvais seuil (accuracy) sur un problème déséquilibré à coûts asymétriques', 'Le modèle est trop lent', 'Les données sont corrompues'],
        answer: 0, explanation: "Le choix de métrique et de seuil est inadapté ; il faut rappel/précision et un seuil au coût métier." }] },
    { id: 'decision', kind: 'decision', title: 'Décision', prompt: "Quelles métriques et quel seuil ?",
      questions: [{ id: 'de1', taxonomy: 'APPLICATION', kind: 'multi', prompt: 'Décisions :',
        options: ['Suivre rappel fraude et précision (pas l’accuracy)', 'Choisir le seuil qui minimise FP·2€ + FN·200€', 'Garder l’accuracy comme métrique principale', 'Comparer systématiquement à la baseline majoritaire'],
        answer: [0, 1, 3], explanation: "On mesure ce qui compte (rappel/précision), on règle le seuil au coût, et on ancre par la baseline. Garder l’accuracy est l’erreur d’origine." }] },
    { id: 'remediation', kind: 'remediation', title: 'Remédiation', prompt: "Éviter la récidive ?",
      questions: [{ id: 'r1', taxonomy: 'APPLICATION', kind: 'mcq', prompt: 'Le garde-fou :',
        options: ['Une évaluation qui compare toujours à la baseline et interdit l’accuracy seule en déséquilibre', 'Acheter des GPU', 'Augmenter la taille du modèle'],
        answer: 0, explanation: "Le réflexe baseline + métriques adaptées aurait bloqué la mise en prod." }] },
    { id: 'validation', kind: 'validation', title: 'Validation', prompt: "Preuve d’un vrai progrès ?",
      questions: [{ id: 'v1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'Preuve :',
        options: ['Rappel fraude et coût total (FP·2€ + FN·200€) au seuil retenu, meilleurs que la baseline', 'L’accuracy repasse au-dessus de 0.98', 'La latence baisse'],
        answer: 0, explanation: "On prouve sur les métriques métier, pas sur l’accuracy trompeuse." }] },
    { id: 'communication', kind: 'communication', title: 'Communication', prompt: "Message aux parties prenantes.",
      questions: [{ id: 'c1', taxonomy: 'UNDERSTANDING', kind: 'mcq', prompt: 'Le résumé honnête :',
        options: ['« 98 % d’accuracy » était trompeur (la baseline fait 99,5 %). On suit désormais rappel/précision et un seuil au coût ; décision fondée sur le coût métier.', 'Le modèle était trop lent, on l’a accéléré.', 'Les données étaient corrompues.'],
        answer: 0, explanation: "On explique le piège et la correction en langage métier." }] },
  ],
  debrief: { expectedReasoning: "Sur 0,5 % de fraude, l’accuracy est trompeuse : la baseline « tout légitime » atteint 0.995, mieux que le modèle à 0.98. Le vrai problème est double : mauvaise métrique (accuracy au lieu de rappel/précision) et mauvais seuil (optimisé pour l’accuracy, pas pour le coût). Avec FN=200€ et FP=2€, il faut un seuil bas qui attrape la fraude quitte à générer des alertes. La latence est un faux indice. Correctif : suivre rappel/précision, choisir le seuil minimisant FP·2€+FN·200€, ancrer par la baseline, et poser ces règles en garde-fou. Validation : coût total et rappel meilleurs que la baseline.",
    keySignals: ['fraude 0,5 % (fort déséquilibre)', 'baseline triviale 0.995 > 0.98 du modèle', 'coûts asymétriques FN 200€ vs FP 2€'],
    redHerrings: ['temps d’inférence 8 ms', 'taille du modèle'],
    alternatives: ['Données corrompues : écartée (le problème est métrique/seuil)', 'Modèle plus gros : n’adresse pas le mauvais critère'],
    tradeoffs: ['Rappel élevé (attrape la fraude, plus de fausses alertes) vs précision élevée (moins d’alertes, plus de fraudes ratées) — arbitrer au coût'] },
});

// ─────────────────────────────────────────────────────────────────────────────
// 5 — RAG qui hallucine sur certaines requêtes (rag, llm, evalia) — D4
CAPS.push({
  id: 'rag-hallucination-grounding', title: 'RAG : réponses plausibles mais non ancrées',
  domain: 'Applied AI / RAG', difficulty: 4, estimatedMinutes: 40,
  skills: ['rag', 'llm', 'evalia'],
  lessonRefs: ['rag-fundamentals', 'rag-evaluation', 'ai-evaluation'],
  exerciseRefs: ['rag-retrieval-vs-generation', 'rag-recall-precision-at-k', 'eval-groundedness-proxy'],
  playbookRefs: [], dayRefs: [],
  simulationNote: 'Récupérations et réponses fournies, déterministes. Ancrage mesuré par PROXY.',
  passThreshold: 0.7,
  context: "Un assistant documentaire répond bien à la plupart des questions, mais sur certaines il invente des chiffres précis et faux, avec un ton assuré. Les utilisateurs perdent confiance.",
  signal: "Sur 12 % des questions, la réponse contient une affirmation chiffrée introuvable dans les sources fournies. Les autres réponses sont correctes.",
  artifacts: [
    { id: 'case', kind: 'log', title: 'Cas d’hallucination (simulé)', useful: true,
      content: "Q: « Quel est le délai de rétractation ? »\nTop-k récupéré: [chunk sur les frais, chunk sur la livraison] (le chunk « rétractation » N’EST PAS remonté).\nRéponse: « Le délai est de 30 jours. » (aucune source ne le dit)" },
    { id: 'recall', kind: 'metrics', title: 'Évaluation de récupération (simulée)', useful: true,
      content: "recall@5 global 0.88, mais sur les questions qui hallucinent : recall@5 = 0.10 (le bon passage n’est presque jamais remonté)." },
    { id: 'ground', kind: 'metrics', title: 'Ancrage PROXY (simulé)', useful: true,
      content: "Fraction d’affirmations ancrées dans un chunk fourni : 0.98 sur les bonnes réponses, 0.20 sur les cas problématiques." },
    { id: 'ui', kind: 'log', title: 'Retour cosmétique (simulé)', useful: false,
      content: "Des utilisateurs trouvent la police trop petite. Sans rapport avec l’exactitude." },
  ],
  phases: [
    { id: 'hypotheses', kind: 'hypotheses', title: 'Hypothèses', prompt: "Bonnes réponses en général, hallucinations ciblées. Causes ?",
      questions: [{ id: 'h1', taxonomy: 'APPLICATION', kind: 'multi', prompt: 'Hypothèses plausibles :',
        options: ['La récupération rate le bon passage sur ces questions', 'Le modèle répond sans passage à l’appui (non ancré)', 'La police d’écriture est trop petite', 'Le modèle est globalement cassé'],
        answer: [0, 1], explanation: "recall bas sur ces cas + ancrage bas expliquent l’hallucination. La typo est un faux indice ; le modèle marche ailleurs." }] },
    { id: 'investigation', kind: 'investigation', title: 'Investigation', prompt: "Retrieval ou génération ?",
      questions: [{ id: 'i1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'Sur les cas fautifs, le signe décisif :',
        options: ['recall@5 = 0.10 : le bon passage n’est pas remonté', 'La police trop petite', 'Le throughput'],
        answer: 0, explanation: "Le bon passage n’étant pas remonté, la génération n’a rien pour s’ancrer." }] },
    { id: 'diagnosis', kind: 'diagnosis', title: 'Diagnostic', prompt: "Étage fautif et mécanisme ?",
      questions: [{ id: 'd1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'La cause est :',
        options: ['Échec de RÉCUPÉRATION sur ces questions ; faute de passage, le modèle comble par une invention plausible', 'Échec pur de génération alors que le bon passage est fourni', 'Données corrompues'],
        answer: 0, explanation: "gold non récupéré + ancrage bas ⇒ diagnostic « retrieval » (pas génération). Le modèle devrait refuser plutôt qu’inventer." }] },
    { id: 'decision', kind: 'decision', title: 'Décision', prompt: "Quelles corrections ?",
      questions: [{ id: 'de1', taxonomy: 'APPLICATION', kind: 'multi', prompt: 'Mesures :',
        options: ['Améliorer la récupération sur ces requêtes (découpage/fusion hybride)', 'Exiger une citation : sans passage ancré, répondre « je ne sais pas »', 'Augmenter la taille de police', 'Laisser le modèle deviner'],
        answer: [0, 1], explanation: "On corrige le retrieval ET on impose l’ancrage (refus si non ancré). Deviner est précisément le défaut." }] },
    { id: 'remediation', kind: 'remediation', title: 'Remédiation', prompt: "Éviter la récidive ?",
      questions: [{ id: 'r1', taxonomy: 'APPLICATION', kind: 'mcq', prompt: 'Le garde-fou durable :',
        options: ['Une éval d’ancrage (PROXY) qui bloque les réponses non citées', 'Changer la couleur du thème', 'Désactiver les logs'],
        answer: 0, explanation: "Mesurer l’ancrage et refuser le non-ancré empêche l’hallucination assurée." }] },
    { id: 'validation', kind: 'validation', title: 'Validation', prompt: "Preuve que c’est réglé ?",
      questions: [{ id: 'v1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'Preuve :',
        options: ['recall@5 rétabli sur les cas fautifs ET ancrage ≥ seuil (sinon refus), 0 affirmation non sourcée', 'La police est plus grande', 'Le débit augmente'],
        answer: 0, explanation: "On prouve les deux : récupération rétablie et ancrage garanti." }] },
    { id: 'communication', kind: 'communication', title: 'Communication', prompt: "Message aux utilisateurs.",
      questions: [{ id: 'c1', taxonomy: 'UNDERSTANDING', kind: 'mcq', prompt: 'Le résumé honnête :',
        options: ['Sur certaines questions, le bon passage n’était pas retrouvé et le modèle inventait ; on a amélioré la récupération et imposé la citation (refus si non ancré).', 'Le modèle était cassé, on l’a remplacé.', 'C’était un problème d’affichage.'],
        answer: 0, explanation: "Explication exacte et rétablissement de la confiance." }] },
  ],
  debrief: { expectedReasoning: "Les hallucinations sont ciblées : sur ces 12 % de questions, recall@5 tombe à 0.10 (le bon passage n’est pas remonté) et l’ancrage PROXY chute à 0.20. C’est un échec de RÉCUPÉRATION, pas de génération : faute de passage, le modèle comble avec une invention plausible et assurée. La typo est un faux indice ; le modèle répond bien quand le passage est là. Correctif à deux niveaux : améliorer la récupération sur ces requêtes (découpage plus fin, fusion hybride) ET imposer l’ancrage — exiger une citation, refuser (« je ne sais pas ») si aucun passage n’étaye la réponse. Validation : recall rétabli sur les cas fautifs et 0 affirmation non sourcée.",
    keySignals: ['hallucinations seulement sur 12 % des questions', 'recall@5 0.10 sur ces cas', 'ancrage PROXY 0.20 vs 0.98'],
    redHerrings: ['taille de la police', 'débit/throughput'],
    alternatives: ['Échec de génération : écarté (le modèle répond bien avec le bon passage)', 'Modèle cassé : écarté (98 % des réponses correctes)'],
    tradeoffs: ['Refuser si non ancré (moins de couverture, zéro invention) vs répondre quand même (plus de couverture, risque d’hallucination)'] },
});

// ── Vérification + écriture ──────────────────────────────────────────────────
const collectAnswers = (c) => {
  const resp = {};
  for (const p of c.phases) for (const q of p.questions) resp[q.id] = q.answer;
  return resp;
};

let failed = false;
for (const c of CAPS) {
  const v = validateCapstone(c);
  if (!v.ok) { console.error(`❌ ${c.id} INVALIDE : ${v.errors.join(' ; ')}`); failed = true; continue; }
  const res = gradeCapstone(c, collectAnswers(c));
  if (!res.passedOverall) { console.error(`❌ ${c.id} : la copie de référence NE PASSE PAS (ratio ${res.ratio}).`); failed = true; continue; }
  const out = { ...c, sprint: 'v48' };
  writeFileSync(join(ROOT, 'data/capstones', `${c.id}.json`), JSON.stringify(out, null, 2) + '\n');
  console.log('OK', c.id, `(D${c.difficulty}, ${c.phases.length} phases, ref ratio ${res.ratio})`);
}
if (failed) process.exit(1);
