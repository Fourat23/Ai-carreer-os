// V49 CP10 — 3 scénarios professionnels fermant les dernières ruptures PROFESSIONAL
// (algo/ds/python, secu/gitlinux, dl). RÉUTILISE lib/capstone.mjs (aucun 2e moteur).
// Vérifiés : validateCapstone OK + gradeCapstone(référence) => passedOverall.
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCapstone, gradeCapstone } from '../lib/capstone.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CAPS = [];

// ── 1 — Incident de performance : O(n²) + mauvaise structure (algo, ds, python) D5
CAPS.push({
  id: 'perf-quadratic-incident', title: 'Perf : un endpoint qui s’effondre à l’échelle',
  domain: 'Backend / Performance', difficulty: 5, estimatedMinutes: 45,
  skills: ['algo', 'ds', 'python'],
  lessonRefs: ['algorithmic-thinking', 'data-structures-intro'],
  exerciseRefs: ['perf-pair-count', 'ds-lru-cache', 'ml-confusion-cost'],
  playbookRefs: [], dayRefs: [],
  simulationNote: 'Profils et mesures fournis, déterministes.',
  passThreshold: 0.7,
  context: "Un endpoint « suggestions » (Python) répond en 40 ms pour 100 utilisateurs de test. En production, à 20 000 utilisateurs, il prend 12 s et sature un CPU. Le code compare chaque utilisateur à tous les autres pour trouver des paires d’intérêts communs.",
  signal: "Latence ×300 quand les données ×200. CPU à 100 % sur un cœur. Aucune erreur.",
  artifacts: [
    { id: 'code', kind: 'code', title: 'Boucle de comparaison (simulée)', useful: true,
      content: "for u in users:\n  for v in users:      # O(n^2)\n    if shared_interests(u, v) >= 3:\n      pairs.append((u, v))" },
    { id: 'scaling', kind: 'metrics', title: 'Mesures d’échelle (simulées)', useful: true,
      content: "n=100 -> 40ms ; n=1000 -> 3.9s ; n=2000 -> 15.6s. Le temps quadruple quand n double : signature O(n^2)." },
    { id: 'profile', kind: 'trace', title: 'Profil CPU (simulé)', useful: true,
      content: "98 % du temps dans la double boucle ; shared_interests appelé n*n fois. La sérialisation JSON est négligeable (0.5 %)." },
    { id: 'infra', kind: 'metrics', title: 'Mémoire (simulée)', useful: false,
      content: "Mémoire stable à 300 Mo, pas de fuite. Le GC n’est pas en cause." },
    { id: 'net', kind: 'log', title: 'Latence réseau (simulée)', useful: false,
      content: "RTT base de données 2 ms, stable. Aucune requête N+1 détectée." },
  ],
  phases: [
    { id: 'hypotheses', kind: 'hypotheses', title: 'Hypothèses', prompt: "Latence explose avec la taille. Causes ?",
      questions: [{ id: 'h1', taxonomy: 'APPLICATION', kind: 'multi', prompt: 'Hypothèses plausibles :',
        options: ['Complexité algorithmique O(n²)', 'Mauvaise structure (parcours linéaire au lieu d’index/hash)', 'Fuite mémoire', 'Latence réseau'],
        answer: [0, 1], explanation: "Le temps quadruple quand n double → O(n²) ; une hash map par intérêt éviterait la double boucle. Mémoire et réseau sont stables (faux indices)." }] },
    { id: 'investigation', kind: 'investigation', title: 'Investigation', prompt: "Quel artefact confirme la complexité ?",
      questions: [{ id: 'i1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'Le signe décisif :',
        options: ['Le temps quadruple quand n double (40ms→3.9s→15.6s)', 'La mémoire stable', 'Le RTT base de données'],
        answer: 0, explanation: "Quadruplement pour un doublement = O(n²). Les autres métriques sont saines." }] },
    { id: 'diagnosis', kind: 'diagnosis', title: 'Diagnostic', prompt: "Cause racine ?",
      questions: [{ id: 'd1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'La cause est :',
        options: ['Une double boucle O(n²) ; on peut indexer les utilisateurs par intérêt (hash) pour ne comparer que les candidats pertinents', 'Un manque de CPU', 'Une fuite mémoire'],
        answer: 0, explanation: "Le profil montre 98 % dans la double boucle. Un index par intérêt réduit à ~O(n·k). Ajouter du CPU ne corrige pas la complexité." }] },
    { id: 'decision', kind: 'decision', title: 'Décision', prompt: "Quelle correction sous contrainte (déploiement rapide, exactitude préservée) ?",
      questions: [{ id: 'de1', taxonomy: 'APPLICATION', kind: 'multi', prompt: 'Mesures :',
        options: ['Construire un index intérêt → utilisateurs (hash) et ne comparer que les co-occurrents', 'Mettre en cache les résultats stables (LRU) si recalcul fréquent', 'Ajouter des cœurs CPU sans changer l’algo', 'Paralléliser la double boucle O(n²)'],
        answer: [0, 1], explanation: "On change la COMPLEXITÉ (index) et on cache si utile. Paralléliser/ajouter du CPU ne fait que repousser le mur quadratique." }] },
    { id: 'remediation', kind: 'remediation', title: 'Remédiation', prompt: "Éviter la récidive ?",
      questions: [{ id: 'r1', taxonomy: 'APPLICATION', kind: 'mcq', prompt: 'Le garde-fou :',
        options: ['Un test de charge qui mesure la croissance du temps avec n (détecte une régression O(n²))', 'Prier pour que n reste petit', 'Augmenter le timeout'],
        answer: 0, explanation: "Un test qui vérifie la mise à l’échelle attrape une complexité quadratique avant la prod." }] },
    { id: 'validation', kind: 'validation', title: 'Validation', prompt: "Preuve que c’est réglé ?",
      questions: [{ id: 'v1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'Preuve :',
        options: ['Le temps croît ~linéairement avec n après correction, ET les paires trouvées sont identiques à l’ancienne version', 'Le CPU baisse', 'La mémoire baisse'],
        answer: 0, explanation: "On prouve la nouvelle complexité ET l’équivalence des résultats (pas de régression fonctionnelle)." }] },
    { id: 'communication', kind: 'communication', title: 'Communication', prompt: "Note à l’équipe.",
      questions: [{ id: 'c1', taxonomy: 'UNDERSTANDING', kind: 'mcq', prompt: 'Le résumé honnête :',
        options: ['La double boucle O(n²) s’effondrait à l’échelle ; un index par intérêt la ramène à ~linéaire, résultats identiques, test de charge ajouté.', 'Le serveur manquait de CPU, on a scalé.', 'Fuite mémoire corrigée.'],
        answer: 0, explanation: "Cause, correctif, preuve, prévention. Pas de fausse cause." }] },
  ],
  debrief: { expectedReasoning: "La signature est nette : le temps QUADRUPLE quand n double → O(n²), confirmé par le profil (98 % dans la double boucle). Mémoire et réseau sont sains (faux indices). Ajouter du CPU ou paralléliser ne change pas la complexité : il faut un meilleur ALGORITHME/structure — indexer les utilisateurs par intérêt (hash map) pour ne comparer que les candidats partageant un intérêt, ramenant à ~O(n·k). Cacher (LRU) si recalcul fréquent. Validation : croissance ~linéaire + résultats identiques. Prévention : test de charge mesurant la mise à l’échelle.",
    keySignals: ['temps ×4 quand n ×2 (O(n²))', '98 % du temps dans la double boucle', 'mémoire et réseau stables'],
    redHerrings: ['mémoire / GC', 'latence réseau / N+1'],
    alternatives: ['Manque de CPU : écarté (le problème est la complexité, pas la puissance)', 'Fuite mémoire : écartée (mémoire stable)'],
    tradeoffs: ['Index en mémoire (rapide, un peu de RAM) vs recalcul (lent)', 'Cache LRU (réponses rapides, risque de péremption) vs calcul frais'] },
});

// ── 2 — Fuite d'accès : sur-permission (secu, gitlinux, cloud) D5
CAPS.push({
  id: 'least-privilege-incident', title: 'Sécurité : une clé trop permissive fuit',
  domain: 'Security / Access', difficulty: 5, estimatedMinutes: 45,
  skills: ['secu', 'gitlinux'],
  lessonRefs: ['deployment-secrets', 'linux-filesystem-permissions'],
  exerciseRefs: ['sec-secret-placement', 'sec-redact-secret-log', 'sec-secret-vs-config'],
  playbookRefs: [], dayRefs: [],
  simulationNote: 'Journaux et politiques fournis, déterministes ; aucun cloud réel.',
  passThreshold: 0.7,
  context: "Une application n’a besoin que de LIRE un bucket de rapports. Un jeton d’accès applicatif, doté de droits d’administration complets, s’est retrouvé dans un log public. Un attaquant a pu lister et supprimer d’autres ressources.",
  signal: "Le jeton (droits admin *:*) est apparu en clair dans un log applicatif ; des ressources hors périmètre ont été touchées.",
  artifacts: [
    { id: 'policy', kind: 'config', title: 'Politique du jeton (simulée)', useful: true,
      content: "{ \"Effect\": \"Allow\", \"Action\": \"*\", \"Resource\": \"*\" }  # bien au-delà de « lire un bucket »" },
    { id: 'log', kind: 'log', title: 'Extrait de log (simulé)', useful: true,
      content: "INFO request headers: Authorization: Bearer AKIA...FULLKEY...  # secret loggué en clair" },
    { id: 'need', kind: 'ticket', title: 'Besoin réel (simulé)', useful: true,
      content: "L’app doit seulement GET les objets de s3://reports-readonly/. Rien d’autre." },
    { id: 'ui', kind: 'log', title: 'Retour cosmétique (simulé)', useful: false,
      content: "Des utilisateurs trouvent l’écran de connexion trop terne. Sans rapport avec l’incident." },
    { id: 'uptime', kind: 'metrics', title: 'Disponibilité (simulée)', useful: false,
      content: "Uptime 99.99 %. L’incident n’est pas une panne de disponibilité." },
  ],
  phases: [
    { id: 'hypotheses', kind: 'hypotheses', title: 'Hypothèses', prompt: "Une clé fuit et cause des dégâts larges. Quelles faiblesses ?",
      questions: [{ id: 'h1', taxonomy: 'APPLICATION', kind: 'multi', prompt: 'Faiblesses réelles :',
        options: ['Le jeton a des droits bien trop larges (admin au lieu de lecture d’un bucket)', 'Le secret est loggué en clair', 'L’écran de connexion est terne', 'L’uptime est insuffisant'],
        answer: [0, 1], explanation: "Sur-permission + secret loggué = la combinaison dangereuse. UI et uptime sont hors sujet." }] },
    { id: 'investigation', kind: 'investigation', title: 'Investigation', prompt: "Qu’est-ce qui transforme une fuite en catastrophe ?",
      questions: [{ id: 'i1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'L’élément aggravant :',
        options: ['La politique Action:* Resource:* (le jeton peut tout faire partout)', 'La couleur de l’écran', 'Le taux de disponibilité'],
        answer: 0, explanation: "Un jeton en lecture seule sur un seul bucket aurait limité les dégâts à… presque rien. L’admin universel fait la catastrophe." }] },
    { id: 'diagnosis', kind: 'diagnosis', title: 'Diagnostic', prompt: "Cause racine et facteur aggravant ?",
      questions: [{ id: 'd1', taxonomy: 'DIAGNOSIS', kind: 'multi', prompt: 'Les deux problèmes :',
        options: ['Violation du moindre privilège (droits trop larges)', 'Secret exposé (loggué en clair)', 'Manque de CPU', 'Thème d’interface'],
        answer: [0, 1], explanation: "Moindre privilège violé ET secret exposé : chacun aggrave l’autre." }] },
    { id: 'decision', kind: 'decision', title: 'Décision', prompt: "Quelles corrections, priorisées ?",
      questions: [{ id: 'de1', taxonomy: 'APPLICATION', kind: 'multi', prompt: 'Mesures :',
        options: ['Révoquer/rotationner le jeton immédiatement', 'Restreindre la politique à s3:GetObject sur ce seul bucket', 'Cesser de logguer les en-têtes d’autorisation (redaction)', 'Changer la couleur du thème'],
        answer: [0, 1, 2], explanation: "Rotation d’urgence, moindre privilège, arrêt du log de secrets. Le thème est hors sujet." }] },
    { id: 'remediation', kind: 'remediation', title: 'Remédiation', prompt: "Éviter la récidive ?",
      questions: [{ id: 'r1', taxonomy: 'APPLICATION', kind: 'mcq', prompt: 'Le garde-fou durable :',
        options: ['Politiques au moindre privilège par défaut + secrets hors du code/logs (gestionnaire de secrets, redaction)', 'Interdire les logs', 'Donner les droits admin à tout le monde pour uniformiser'],
        answer: 0, explanation: "Moindre privilège systématique + secrets jamais dans le code/les logs : le principe transféré des permissions Unix à IAM." }] },
    { id: 'validation', kind: 'validation', title: 'Validation', prompt: "Preuve que c’est réglé ?",
      questions: [{ id: 'v1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'Preuve :',
        options: ['Le nouveau jeton ne peut QUE GET ce bucket (accès hors périmètre refusé), et aucun secret n’apparaît dans les logs', 'L’uptime remonte', 'L’écran est plus joli'],
        answer: 0, explanation: "On prouve la restriction effective (AccessDenied ailleurs) et l’absence de secret loggué." }] },
    { id: 'communication', kind: 'communication', title: 'Communication', prompt: "Message de post-incident.",
      questions: [{ id: 'c1', taxonomy: 'UNDERSTANDING', kind: 'mcq', prompt: 'Le résumé honnête :',
        options: ['Un jeton admin (au lieu de lecture d’un bucket) a été loggué en clair ; rotation, moindre privilège et redaction appliqués ; accès hors périmètre désormais refusé.', 'C’était un problème d’affichage.', 'C’était une panne d’uptime.'],
        answer: 0, explanation: "Cause (sur-permission + secret loggué), correctifs, preuve. Communication de post-incident honnête." }] },
  ],
  debrief: { expectedReasoning: "Deux fautes se combinent : (1) violation du moindre privilège — le jeton a Action:* Resource:* alors que le besoin est GET sur un seul bucket ; (2) le secret est loggué en clair. Isolément gênantes, ensemble catastrophiques : la fuite d’un jeton tout-puissant permet de lister/supprimer hors périmètre. UI et uptime sont des faux indices. Priorité : révoquer/rotationner le jeton, restreindre la politique à s3:GetObject sur ce bucket, cesser de logguer les en-têtes d’autorisation. Prévention : moindre privilège par défaut + secrets hors code/logs. C’est le principe des permissions Unix restreintes transféré à IAM. Validation : accès hors périmètre refusé + aucun secret dans les logs.",
    keySignals: ['politique Action:* Resource:*', 'Authorization loggué en clair', 'besoin réel = GET un seul bucket'],
    redHerrings: ['écran de connexion terne', 'uptime'],
    alternatives: ['Problème de disponibilité : écarté (uptime intact)', 'Problème d’UI : écarté (sans rapport)'],
    tradeoffs: ['Rotation immédiate (coupe l’accès, petite interruption) vs analyse d’abord (risque prolongé)', 'Moindre privilège strict (plus de politiques à gérer) vs droits larges (dette de sécurité)'] },
});

// ── 3 — Entraînement DL qui diverge (dl, ml) D4
CAPS.push({
  id: 'dl-training-diverges', title: 'DL : la perte part en NaN',
  domain: 'Applied AI / Deep Learning', difficulty: 4, estimatedMinutes: 40,
  skills: ['dl', 'ml'],
  lessonRefs: ['neural-networks', 'machine-learning-basics'],
  exerciseRefs: ['dl-lr-stability', 'dl-sgd-linear-step', 'dl-he-init-std', 'dl-generalization-gap'],
  playbookRefs: [], dayRefs: [],
  simulationNote: 'Courbes et réglages fournis, déterministes ; aucun entraînement réel.',
  passThreshold: 0.7,
  context: "Un petit réseau entraîné sur des données tabulaires voit sa perte descendre quelques itérations puis exploser en NaN. Un collègue propose « d’ajouter des couches ». Les features vont de 0 à 100 000, non normalisées.",
  signal: "Loss : 2.1 → 1.8 → 1.5 → 3e4 → NaN. Le learning rate est 0.5. Les entrées ne sont pas normalisées.",
  artifacts: [
    { id: 'curve', kind: 'metrics', title: 'Courbe de perte (simulée)', useful: true,
      content: "step0 2.10 ; step1 1.80 ; step2 1.50 ; step3 31000 ; step4 NaN. Divergence brutale, pas un plateau." },
    { id: 'cfg', kind: 'config', title: 'Configuration (simulée)', useful: true,
      content: "learning_rate=0.5 ; init=uniform(-1,1) ; input_scaling=none ; features range [0, 1e5]" },
    { id: 'data', kind: 'metrics', title: 'Statistiques des features (simulées)', useful: true,
      content: "revenu: 0..100000 ; age: 18..90 ; solde: -5000..250000. Échelles très hétérogènes, non normalisées." },
    { id: 'depth', kind: 'ticket', title: 'Proposition d’un collègue (simulée)', useful: false,
      content: "« Ajoutons 5 couches, le modèle sera plus puissant. » — ne traite pas la divergence." },
  ],
  phases: [
    { id: 'hypotheses', kind: 'hypotheses', title: 'Hypothèses', prompt: "La perte diverge en NaN. Causes probables ?",
      questions: [{ id: 'h1', taxonomy: 'APPLICATION', kind: 'multi', prompt: 'Hypothèses plausibles :',
        options: ['Learning rate trop grand (pas qui diverge)', 'Features non normalisées (gradients énormes)', 'Réseau pas assez profond', 'Trop peu d’époques'],
        answer: [0, 1], explanation: "LR élevé + entrées à grande échelle font exploser les gradients. La profondeur n’a rien à voir avec une divergence (faux indice)." }] },
    { id: 'investigation', kind: 'investigation', title: 'Investigation', prompt: "Quel signe distingue divergence et surapprentissage ?",
      questions: [{ id: 'i1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'Le signe décisif :',
        options: ['La perte AUGMENTE brutalement puis NaN (divergence), au lieu de baisser puis se dégrader en val (overfit)', 'La perte stagne', 'La val baisse'],
        answer: 0, explanation: "Explosion en NaN = divergence numérique, pas surapprentissage. Cause : pas trop grand et/ou entrées non normalisées." }] },
    { id: 'diagnosis', kind: 'diagnosis', title: 'Diagnostic', prompt: "Cause racine ?",
      questions: [{ id: 'd1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'La cause est :',
        options: ['Un pas trop grand (lr=0.5) sur des features non normalisées (0..1e5) fait exploser les gradients', 'Le réseau manque de couches', 'Les données sont insuffisantes'],
        answer: 0, explanation: "La combinaison lr élevé × grande échelle d’entrée amplifie chaque pas jusqu’au NaN. Ni la profondeur ni la quantité de données ne sont en cause." }] },
    { id: 'decision', kind: 'decision', title: 'Décision', prompt: "Quelles corrections, avant de toucher à l’architecture ?",
      questions: [{ id: 'de1', taxonomy: 'APPLICATION', kind: 'multi', prompt: 'Mesures :',
        options: ['Normaliser/standardiser les features', 'Réduire le learning rate (ex. 0.5 → 0.01)', 'Utiliser une init adaptée (He) au lieu de uniform(-1,1)', 'Ajouter 5 couches'],
        answer: [0, 1, 2], explanation: "On stabilise d’abord : normalisation, pas plus petit, init adaptée. Ajouter des couches n’adresse pas la divergence (et l’aggrave)." }] },
    { id: 'remediation', kind: 'remediation', title: 'Remédiation', prompt: "Éviter la récidive ?",
      questions: [{ id: 'r1', taxonomy: 'APPLICATION', kind: 'mcq', prompt: 'Le réflexe durable :',
        options: ['Toujours normaliser les entrées et régler le learning rate avant d’ajouter de la capacité', 'Toujours ajouter des couches', 'Augmenter le learning rate pour aller plus vite'],
        answer: 0, explanation: "Normalisation + réglage du pas sont les fondations ; la capacité vient après, une fois l’entraînement stable." }] },
    { id: 'validation', kind: 'validation', title: 'Validation', prompt: "Preuve que c’est réglé ?",
      questions: [{ id: 'v1', taxonomy: 'DIAGNOSIS', kind: 'mcq', prompt: 'Preuve :',
        options: ['La perte décroît régulièrement sans NaN sur plusieurs époques, et l’écart train/val reste raisonnable', 'La perte est NaN plus tard', 'Le modèle a plus de couches'],
        answer: 0, explanation: "On prouve la stabilité (pas de NaN, décroissance) et une généralisation saine." }] },
    { id: 'communication', kind: 'communication', title: 'Communication', prompt: "Message à l’équipe.",
      questions: [{ id: 'c1', taxonomy: 'UNDERSTANDING', kind: 'mcq', prompt: 'Le résumé honnête :',
        options: ['La divergence venait d’un pas trop grand sur des entrées non normalisées ; normalisation + lr réduit + init He stabilisent. « Ajouter des couches » n’était pas la solution.', 'Le modèle manquait de profondeur, on a ajouté des couches.', 'Il manquait des données.'],
        answer: 0, explanation: "Cause (lr × échelle), correctifs (normalisation/lr/init), et rejet explicite de la fausse solution." }] },
  ],
  debrief: { expectedReasoning: "La perte baisse quelques pas puis EXPLOSE en NaN : c’est une divergence numérique, pas du surapprentissage. Deux causes se conjuguent : un learning rate trop grand (0.5) et des features non normalisées (0..1e5), qui produisent des gradients énormes amplifiés à chaque pas. La proposition « ajouter des couches » est un faux indice : la profondeur ne stabilise pas une divergence (elle l’aggrave). Correctifs, avant toute architecture : normaliser/standardiser les entrées, réduire le pas (0.5→0.01), utiliser une init adaptée (He). Validation : perte qui décroît sans NaN + écart train/val raisonnable.",
    keySignals: ['perte qui explose en NaN (divergence)', 'lr=0.5', 'features 0..1e5 non normalisées'],
    redHerrings: ['« ajouter des couches »', 'quantité de données'],
    alternatives: ['Surapprentissage : écarté (la perte diverge, elle ne se dégrade pas en validation)', 'Manque de profondeur : écarté (n’explique pas un NaN)'],
    tradeoffs: ['LR petit (stable, plus lent) vs grand (rapide, risque de divergence)', 'Normalisation (étape en plus, entraînement stable) vs données brutes (fragile)'] },
});

const collect = (c) => { const r = {}; for (const p of c.phases) for (const q of p.questions) r[q.id] = q.answer; return r; };
let failed = false;
for (const c of CAPS) {
  const v = validateCapstone(c);
  if (!v.ok) { console.error(`❌ ${c.id} INVALIDE : ${v.errors.join(' ; ')}`); failed = true; continue; }
  const res = gradeCapstone(c, collect(c));
  if (!res.passedOverall) { console.error(`❌ ${c.id} : référence ne passe pas (ratio ${res.ratio})`); failed = true; continue; }
  writeFileSync(join(ROOT, 'data/capstones', `${c.id}.json`), JSON.stringify({ ...c, sprint: 'v49' }, null, 2) + '\n');
  console.log('OK', c.id, `(D${c.difficulty}, ${c.phases.length} phases, ratio ${res.ratio})`);
}
if (failed) process.exit(1);
