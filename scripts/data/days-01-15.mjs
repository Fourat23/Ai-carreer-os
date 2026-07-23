// Jours 1 à 15 — contenu TRÈS détaillé (mois 1).
// Les jours 7 et 14 (revues hebdo) sont générés depuis WEEKS dans program-structure.mjs.
// Champs : voir generate-curriculum.mjs (en-tête) pour le schéma complet.

export const DAYS_01_15 = [
  {
    day: 1, title: "Installation de l'environnement et premiers pas au terminal",
    skill: 'gitlinux', difficulty: 1, hours: 4.5,
    objective: "Avoir un environnement de travail complet (terminal, Node.js, VS Code, Git) et savoir naviguer dans les fichiers au terminal sans interface graphique.",
    concepts: ['Terminal / shell', 'Système de fichiers (chemins absolus et relatifs)', 'Commandes : pwd, ls, cd, mkdir, touch, cat, rm, mv, cp', 'Node.js et npm : à quoi ça sert', 'Éditeur de code'],
    theory: `Le **terminal** est une interface texte pour parler à ton ordinateur. Tout développeur l'utilise quotidiennement : il est plus rapide, scriptable, et indispensable pour Git, Node, Docker, les serveurs.

Concepts clés :
- Le **système de fichiers** est un arbre : \`/\` (racine) → dossiers → fichiers. Ton dossier personnel est \`~\`.
- Un **chemin absolu** part de la racine (\`/home/toi/projets\`). Un **chemin relatif** part d'où tu es (\`./projets\` ou \`projets\`). \`..\` = dossier parent, \`.\` = dossier courant.
- Le terminal exécute des **commandes** : un programme + des arguments + des options (\`ls -la\` : programme \`ls\`, option \`-la\`).
- **Node.js** est un moteur qui exécute du JavaScript HORS du navigateur. \`node script.js\` lit ton fichier et l'exécute. **npm** installe des bibliothèques écrites par d'autres.

Pourquoi c'est utile en projet : tous tes futurs projets se lancent, se testent et se déploient au terminal. En entretien : "montre-moi comment tu lances ton projet" — la réponse est toujours une commande.`,
    schedule: [
      "0:00-0:45 — Installation : Node.js LTS (nodejs.org), VS Code, Git. Vérifie avec `node -v`, `git --version`.",
      "0:45-1:30 — Théorie : lis la section théorie, puis explore ton disque UNIQUEMENT au terminal pendant 20 min (pwd, ls, cd).",
      "1:30-2:30 — Pratique guidée : crée l'arborescence de l'exercice principal, manipule fichiers et dossiers.",
      "2:30-2:45 — Pause obligatoire (lève-toi).",
      "2:45-3:45 — Exercice principal (voir plus bas) SANS notes, puis exercice bonus.",
      "3:45-4:15 — Mini-quiz + auto-correction avec la solution.",
      "4:15-4:30 — Journal : 5 lignes sur ce qui t'a surpris + statut du jour dans l'app.",
    ],
    exercise: `**Parcours du combattant terminal** (sans interface graphique, tout au terminal) :
1. Crée cette arborescence : \`ia-lab/\` contenant \`notes/\`, \`scripts/\`, \`data/\`.
2. Dans \`notes/\`, crée \`jour-01.md\` contenant une ligne de texte (utilise \`echo "texte" > fichier\`).
3. Copie ce fichier vers \`data/backup-jour-01.md\`.
4. Crée \`scripts/hello.js\` contenant \`console.log("Jour 1 : environnement OK");\` et exécute-le avec \`node\`.
5. Renomme \`data/\` en \`archives/\`.
6. Affiche le contenu de \`jour-01.md\` sans l'ouvrir dans un éditeur.
7. Supprime \`archives/backup-jour-01.md\` puis le dossier \`archives/\`.
8. Depuis \`ia-lab/\`, exécute le script SANS te déplacer dans \`scripts/\` (chemin relatif).`,
    bonus: "Écris un fichier `commandes.md` qui documente, de mémoire, les 10 commandes apprises avec une phrase d'explication chacune. C'est ta première documentation.",
    quiz: [
      { q: "Quelle est la différence entre un chemin absolu et un chemin relatif ?", a: "L'absolu part de la racine `/` et est valable depuis n'importe où ; le relatif part du dossier courant et dépend d'où on se trouve." },
      { q: "Que fait `cd ..` ?", a: "Remonte d'un niveau vers le dossier parent." },
      { q: "Que fait `node script.js` exactement ?", a: "Lance le moteur Node.js, qui lit le fichier script.js, l'interprète comme du JavaScript et l'exécute ; la sortie (console.log) s'affiche dans le terminal." },
      { q: "Comment créer un dossier `test` puis un fichier vide `a.txt` dedans, en 2 commandes ?", a: "`mkdir test` puis `touch test/a.txt`." },
    ],
    deliverable: "Le dossier `ia-lab/` avec l'arborescence finale + `commandes.md` + une capture (ou copie du texte) de ton historique de commandes (`history`).",
    criteria: ['Toutes les étapes faites au terminal, zéro clic', 'Le script hello.js s\'exécute depuis ia-lab/ avec un chemin relatif', 'commandes.md écrit de mémoire (vérifié ensuite, pas pendant)', 'Tu sais expliquer chaque commande utilisée'],
    mistakes: ['Utiliser l\'explorateur de fichiers "juste pour vérifier" — résiste, utilise `ls`', 'Confondre `rm fichier` et `rm -r dossier` (le -r est pour les dossiers, et il est DÉFINITIF : pas de corbeille)', 'Espaces dans les noms de fichiers : évite-les toute l\'année (utilise des tirets)'],
    resources: ['MDN — "Ligne de commande : premiers pas" (developer.mozilla.org, en français)', 'Vidéo : cherche "terminal bases débutant" (Grafikart a d\'excellentes vidéos gratuites en français)'],
    aiRule: "Aujourd'hui : IA interdite pendant l'exercice. Si tu bloques 10 min sur une commande, cherche dans ta mémoire, puis dans `commandes.md`, puis SEULEMENT dans une doc. L'IA peut servir APRÈS l'auto-correction pour poser des questions de compréhension (\"pourquoi rm -r ?\").",
    solution: {
      logic: "L'exercice teste une seule chose : ton modèle mental de l'arbre de fichiers. À chaque commande, demande-toi : OÙ suis-je (`pwd`) ? OÙ est ma cible ? Le chemin que je tape part-il d'ici (relatif) ou de la racine (absolu) ?",
      simple: `\`\`\`bash
mkdir -p ia-lab/notes ia-lab/scripts ia-lab/data
cd ia-lab
echo "Premier jour du programme AI Career OS" > notes/jour-01.md
cp notes/jour-01.md data/backup-jour-01.md
echo 'console.log("Jour 1 : environnement OK");' > scripts/hello.js
node scripts/hello.js
mv data archives
cat notes/jour-01.md
rm archives/backup-jour-01.md
rmdir archives        # ou rm -r archives s'il n'est pas vide
node scripts/hello.js # depuis ia-lab/ : chemin relatif scripts/hello.js
\`\`\``,
      improved: "Version pro : `mkdir -p` crée toute l'arborescence en une commande (le `-p` crée les parents manquants). `rmdir` ne marche que sur un dossier vide — c'est un garde-fou volontaire, préfère-le à `rm -r` quand tu t'attends à ce que ce soit vide.",
      pitfalls: ['Étape 8 ratée = tu as fait `cd scripts` puis `node hello.js` : refais-la depuis `ia-lab/` avec `node scripts/hello.js`', 'echo avec des guillemets simples vs doubles : les doubles interprètent les variables ($X), les simples non', 'rm sans réfléchir : prends l\'habitude de faire `ls` AVANT `rm`'],
      checks: ['`find ia-lab` (ou `ls -R ia-lab`) montre exactement : notes/jour-01.md et scripts/hello.js', 'Le script affiche bien le message', '`history | tail -30` raconte une session propre, pas 50 essais aléatoires'],
      reflection: ["Pourquoi les développeurs préfèrent-ils le terminal à l'explorateur pour ces tâches ? (indice : répétabilité, scripts)", "Que se passerait-il si tu exécutais `node hello.js` depuis `ia-lab/` ? Pourquoi cette erreur est-elle en fait une bonne nouvelle (message clair) ?"],
    },
  },
  {
    day: 2, title: "Terminal avancé et premier vrai script JavaScript",
    skill: 'gitlinux', difficulty: 1, hours: 4.5,
    objective: "Être à l'aise avec les flux (>, >>, |), les droits, la recherche de fichiers, et écrire un premier script Node.js qui lit des arguments.",
    concepts: ['Redirections > et >>', 'Pipe |', 'grep, find, wc, head, tail', 'Variables d\'environnement (PATH)', 'process.argv dans Node', 'Codes de sortie'],
    theory: `Hier tu as appris à te déplacer. Aujourd'hui : faire COOPÉRER les commandes.

- **Redirection** : \`commande > fichier\` envoie la sortie dans un fichier (écrase) ; \`>>\` ajoute à la fin.
- **Pipe** : \`commande1 | commande2\` branche la sortie de la première sur l'entrée de la seconde. Exemple : \`ls | wc -l\` compte les fichiers. C'est LA grande idée d'Unix : des petits outils composables — tu retrouveras cette philosophie dans les fonctions pures (jour 26) et les pipelines de données (mois 5).
- **grep** cherche du texte : \`grep "erreur" log.txt\`. **find** cherche des fichiers : \`find . -name "*.js"\`.
- **Variables d'environnement** : des valeurs globales lues par les programmes (\`echo $PATH\`). Le PATH liste les dossiers où le shell cherche les commandes. Tu les utiliseras pour les clés d'API (mois 8) : les secrets vivent dans l'environnement, jamais dans le code.
- Côté Node : \`process.argv\` contient les arguments de la ligne de commande — c'est comme ça qu'un script devient un OUTIL paramétrable.`,
    schedule: [
      "0:00-0:45 — Théorie + tests libres : redirige, pipe, grep sur des fichiers de ton ia-lab.",
      "0:45-1:45 — Pratique guidée : crée un fichier de 20 lignes (notes fictives), entraîne-toi : head, tail, grep, wc, find.",
      "1:45-2:45 — Exercice principal partie terminal.",
      "2:45-3:00 — Pause.",
      "3:00-4:00 — Exercice principal partie Node (script salutations) + bonus.",
      "4:00-4:30 — Quiz, auto-correction, journal, statut dans l'app.",
    ],
    exercise: `**Partie A — terminal** : dans \`ia-lab/data/\`, crée \`inventaire.txt\` avec 10 lignes au format \`nom,quantite\` (ex: \`pommes,12\`). Puis, en UNE commande à chaque fois :
1. Affiche les 3 premières lignes.
2. Compte le nombre de lignes.
3. Affiche les lignes contenant un produit de ton choix.
4. Ajoute une 11e ligne SANS ouvrir d'éditeur.
5. Crée \`rapport.txt\` contenant le nombre de lignes suivi des 2 dernières lignes (2 commandes avec >> autorisées).

**Partie B — Node** : écris \`scripts/salut.js\` :
- \`node salut.js Fourat\` affiche \`Bonjour, Fourat !\`
- \`node salut.js\` (sans argument) affiche \`Usage : node salut.js <prenom>\` et se termine avec \`process.exit(1)\`.
- \`node salut.js Fourat Ali Sara\` salue chaque prénom sur sa propre ligne.`,
    bonus: "Ajoute une option `--crier` : `node salut.js --crier fourat` → `BONJOUR, FOURAT !` (indice : `toUpperCase()`, et il faut filtrer l'option hors de la liste des prénoms).",
    quiz: [
      { q: "Différence entre `>` et `>>` ?", a: "`>` écrase le fichier, `>>` ajoute à la fin sans effacer." },
      { q: "Que fait `cat notes.txt | grep TODO | wc -l` ?", a: "Compte le nombre de lignes de notes.txt contenant 'TODO' (cat lit, grep filtre, wc -l compte)." },
      { q: "Que contient `process.argv[2]` ?", a: "Le premier argument passé au script (argv[0] = chemin de node, argv[1] = chemin du script)." },
      { q: "À quoi sert un code de sortie non nul (`process.exit(1)`) ?", a: "À signaler un échec au shell : indispensable pour les scripts enchaînés et la CI (un `&&` s'arrête si le code ≠ 0)." },
    ],
    deliverable: "`inventaire.txt`, `rapport.txt`, `salut.js` fonctionnel avec les 3 comportements + le bonus si atteint.",
    criteria: ['Partie A : chaque tâche en une seule commande (sauf la 5)', 'salut.js gère les 3 cas SANS crasher', 'Tu peux réexpliquer chaque commande utilisée à voix haute', 'Code de sortie 1 vérifié (echo $? après exécution)'],
    mistakes: ['`>` au lieu de `>>` qui efface ton fichier — fais une copie avant d\'expérimenter', 'Oublier que argv commence à l\'index 2', 'Tester uniquement le cas "ça marche" : le cas SANS argument est la moitié de l\'exercice'],
    resources: ['MDN — process.argv (doc Node.js)', 'Le livre en ligne gratuit "The Linux Command Line" (chap. 1-6) si tu veux creuser'],
    aiRule: "30 minutes d'effort réel minimum avant toute aide. Si tu demandes de l'aide à l'IA, interdiction de coller sa réponse : lis, ferme, réécris de mémoire.",
    solution: {
      logic: "Partie A = composer des petits outils. Partie B = premier programme défensif : on valide l'entrée AVANT de traiter. Ce réflexe (valider puis traiter) est celui que tu appliqueras aux API (mois 3) et aux sorties de LLM (mois 8).",
      simple: `\`\`\`bash
head -3 data/inventaire.txt
wc -l data/inventaire.txt
grep "pommes" data/inventaire.txt
echo "kiwis,5" >> data/inventaire.txt
wc -l < data/inventaire.txt > data/rapport.txt
tail -2 data/inventaire.txt >> data/rapport.txt
\`\`\`
\`\`\`js
// scripts/salut.js
const prenoms = process.argv.slice(2);
if (prenoms.length === 0) {
  console.log("Usage : node salut.js <prenom>");
  process.exit(1);
}
for (const prenom of prenoms) {
  console.log(\`Bonjour, \${prenom} !\`);
}
\`\`\``,
      improved: `Bonus avec option :
\`\`\`js
const args = process.argv.slice(2);
const crier = args.includes("--crier");
const prenoms = args.filter((a) => a !== "--crier");
if (prenoms.length === 0) { console.log("Usage : node salut.js [--crier] <prenom>"); process.exit(1); }
for (const p of prenoms) {
  const msg = \`Bonjour, \${p} !\`;
  console.log(crier ? msg.toUpperCase() : msg);
}
\`\`\`
Remarque le pattern : séparer le *parsing* des arguments du *traitement*. Tous les CLI du monde sont construits ainsi.`,
      pitfalls: ['`wc -l fichier` affiche aussi le nom du fichier ; `wc -l < fichier` n\'affiche que le nombre', 'Oublier `slice(2)` et saluer "/usr/bin/node"', 'Le bonus : si tu ne filtres pas `--crier`, tu salues l\'option'],
      checks: ['`node scripts/salut.js` seul → message d\'usage ET `echo $?` affiche 1', 'Trois prénoms → trois lignes', 'rapport.txt : un nombre puis 2 lignes de données'],
      reflection: ["En quoi le pipe `|` ressemble-t-il à l'enchaînement de fonctions `f(g(x))` ?", "Pourquoi valider les entrées au DÉBUT du script plutôt qu'au milieu ?"],
    },
  },
  {
    day: 3, title: "Git : sauvegarder et raconter l'histoire de ton code",
    skill: 'gitlinux', difficulty: 2, hours: 4.5,
    objective: "Comprendre le modèle mental de Git (working directory → staging → commits) et l'utiliser pour versionner ia-lab, avec des messages de commit propres.",
    concepts: ['Pourquoi versionner', 'init, status, add, commit, log, diff', 'Le staging (zone de préparation)', '.gitignore', 'Bonnes pratiques de messages de commit'],
    theory: `**Git** enregistre des instantanés (commits) de ton projet. Chaque commit = une photo du code + un message + un auteur + un lien vers le commit précédent. L'historique est une chaîne de photos : tu peux revenir en arrière, comparer, travailler en parallèle (branches, jour 18).

Le modèle mental à 3 zones (INDISPENSABLE, dessine-le) :
1. **Working directory** : tes fichiers, ce que tu modifies.
2. **Staging area** : la sélection de ce qui ira dans la prochaine photo (\`git add\`).
3. **Historique** : les photos prises (\`git commit\`).

Pourquoi le staging existe : pour composer des commits COHÉRENTS. Tu as modifié 3 fichiers pour 2 raisons différentes ? Deux commits séparés — \`add\` te laisse choisir.

Un bon message de commit dit POURQUOI en une ligne à l'impératif : \`Ajoute la validation des arguments dans salut.js\` — pas \`update\`, pas \`fix stuff\`. En entretien comme en équipe, ton historique Git est ta carte de visite : on y lit ta rigueur.

\`.gitignore\` liste ce que Git doit ignorer : dépendances (node_modules), secrets (.env), fichiers générés.`,
    schedule: [
      "0:00-1:00 — Théorie + dessine le schéma des 3 zones. Initialise Git dans ia-lab, premier commit.",
      "1:00-2:00 — Pratique guidée : modifie, status, diff, add sélectif, commit — 5 cycles complets.",
      "2:00-2:15 — Pause.",
      "2:15-3:30 — Exercice principal.",
      "3:30-4:00 — Exercice bonus + quiz.",
      "4:00-4:30 — Auto-correction, journal, statut. À partir d'aujourd'hui : commit quotidien OBLIGATOIRE.",
    ],
    exercise: `**Le scénario du vrai projet** — dans \`ia-lab/\` :
1. \`git init\`, puis crée \`.gitignore\` contenant \`node_modules/\` et \`*.log\` ; premier commit : tout l'existant.
2. Modifie \`salut.js\` (ajoute un commentaire d'en-tête) ET crée \`notes/jour-03.md\`. Vérifie avec \`git status\` et \`git diff\` que tu comprends ce qu'il voit.
3. Commite les DEUX changements en DEUX commits séparés avec des messages corrects (add sélectif).
4. Crée \`debug.log\` avec du texte ; vérifie que \`git status\` l'ignore. Explique pourquoi dans jour-03.md.
5. Casse volontairement \`salut.js\` (supprime une ligne), constate avec \`git diff\`, puis restaure-le avec \`git restore\` (ou \`git checkout --\`).
6. \`git log --oneline\` : ton historique doit raconter une histoire lisible.`,
    bonus: "Explore `git log -p` (le détail de chaque commit) et `git show <hash>`. Puis renseigne-toi sur `git commit --amend` : dans quel cas est-ce utile et dans quel cas est-ce dangereux ? Écris la réponse dans jour-03.md.",
    quiz: [
      { q: "Cite les 3 zones de Git et la commande qui fait passer de l'une à l'autre.", a: "Working directory → (git add) → staging → (git commit) → historique." },
      { q: "Pourquoi ne JAMAIS committer node_modules ?", a: "Des milliers de fichiers regénérables par `npm install` : lourd, inutile, source de conflits. package.json suffit à les réinstaller." },
      { q: "Que montre `git diff` sans argument ?", a: "Les modifications du working directory PAS ENCORE stagées (pour le staging : git diff --staged)." },
      { q: "Qu'est-ce qu'un bon message de commit ?", a: "Une ligne impérative qui dit quoi/pourquoi : 'Ajoute la gestion du cas sans argument', pas 'update'." },
    ],
    deliverable: "Le dépôt ia-lab avec au moins 4 commits propres, un .gitignore fonctionnel, et jour-03.md contenant ton schéma des 3 zones (texte ou photo) + tes réponses.",
    criteria: ['git status "propre" en fin de journée (tout est commité)', 'Les 2 modifications de l\'étape 3 sont dans 2 commits distincts', 'debug.log ignoré, prouvé par git status', 'Historique lisible : git log --oneline raconte la journée'],
    mistakes: ['`git add .` systématique sans regarder — tu perds tout l\'intérêt du staging et tu finiras par committer un secret', 'Messages "update", "test", "aaa" — interdits à vie', 'Paniquer devant git status : LIS-le, il te dit littéralement quoi faire'],
    resources: ['Le site learngitbranching.js.org (gratuit, interactif, fais les 4 premiers niveaux)', 'git-scm.com/book (chapitres 1-2, disponible en français)'],
    aiRule: "Exercice sans IA. En cas de blocage : `git status` D'ABORD (il explique), puis la doc. L'IA en fin de journée uniquement pour des questions 'pourquoi', jamais 'fais-le pour moi'.",
    solution: {
      logic: "Tout l'exercice tourne autour d'un principe : un commit = un changement cohérent. L'étape 3 est le cœur : deux raisons de changer → deux commits. Si tu as fait `git add .` puis un seul commit, refais-la (git reset HEAD~1 déferait le dernier commit en gardant les fichiers — mais tu peux aussi simplement continuer proprement).",
      simple: `\`\`\`bash
git init
printf "node_modules/\\n*.log\\n" > .gitignore
git add . && git commit -m "Initialise ia-lab avec les scripts des jours 1-2"
# ... modifications ...
git add scripts/salut.js
git commit -m "Documente salut.js avec un commentaire d'en-tête"
git add notes/jour-03.md
git commit -m "Ajoute les notes du jour 3 sur Git"
echo "test" > debug.log && git status   # ignoré
git restore scripts/salut.js            # après l'avoir cassé
git log --oneline
\`\`\``,
      improved: "Prends l'habitude de `git add -p` (patch) : Git te montre chaque bloc modifié et te demande de le stager ou non. C'est le meilleur outil d'apprentissage du staging, et les pros l'utilisent pour relire leur propre code avant chaque commit.",
      pitfalls: ['Si debug.log apparaît quand même dans status : le .gitignore a une faute de frappe, ou le fichier était déjà suivi (git rm --cached debug.log)', 'git restore ne peut PAS restaurer ce qui n\'a jamais été commité — d\'où l\'importance de committer souvent', '--amend réécrit l\'histoire : sûr en local, dangereux après un push (réponse du bonus)'],
      checks: ['git log --oneline montre ≥ 4 messages clairs et distincts', 'git status : "nothing to commit, working tree clean"', 'Le schéma des 3 zones est refait de MÉMOIRE dans jour-03.md'],
      reflection: ["Pourquoi des commits fréquents et petits battent-ils un gros commit du soir ? (pense : retour arrière, relecture, message précis)", "Git te servira pour tes 7 projets portfolio : quel historique un recruteur préfère-t-il voir ?"],
    },
  },
  {
    day: 4, title: "JavaScript : variables, types et opérateurs — les fondations",
    skill: 'jsts', difficulty: 1, hours: 4.5,
    objective: "Maîtriser variables (let/const), types primitifs, conversions et opérateurs — et savoir prédire ce qu'affiche un bout de code AVANT de l'exécuter.",
    concepts: ['let vs const (et pourquoi pas var)', 'Types : string, number, boolean, null, undefined', 'typeof', 'Template literals', 'Conversions et pièges (== vs ===)', 'Opérateurs arithmétiques et logiques'],
    theory: `Une **variable** est une étiquette posée sur une valeur. \`const\` (par défaut : la valeur ne sera pas réassignée) ou \`let\` (si elle doit changer). \`var\` est un vestige : ne l'utilise jamais.

Les **types primitifs** essentiels : \`string\` ("texte"), \`number\` (42, 3.14 — un seul type pour entiers et décimaux), \`boolean\` (true/false), \`undefined\` (déclaré mais sans valeur), \`null\` (absence VOLONTAIRE de valeur). \`typeof x\` te dit le type.

**Le piège central de JS** : les conversions implicites. \`"5" + 2\` donne \`"52"\` (le + concatène si un côté est une string) mais \`"5" - 2\` donne \`3\` (le - force la conversion en nombre). C'est pour ça qu'on compare TOUJOURS avec \`===\` (strict : valeur ET type) et jamais \`==\` (qui convertit sournoisement : \`0 == ""\` est true !).

**Template literals** : \`\\\`Bonjour \${nom}\\\`\` — la façon moderne de construire des strings.

Pourquoi c'est évaluable en entretien : les questions pièges "qu'affiche ce code ?" testent exactement ça. Et TypeScript (semaine 6) existe précisément pour dompter ces conversions.`,
    schedule: [
      "0:00-1:00 — Théorie + expérimentation libre dans le REPL Node (tape `node` sans argument) : teste CHAQUE affirmation de la théorie.",
      "1:00-2:00 — Jeu de prédiction : le fichier de l'exercice A — écris ta prédiction AVANT d'exécuter.",
      "2:00-2:15 — Pause.",
      "2:15-3:30 — Exercice principal B (convertisseur).",
      "3:30-4:00 — Bonus + quiz.",
      "4:00-4:30 — Auto-correction, commit du jour, journal, statut.",
    ],
    exercise: `**A — Le jeu des prédictions** : crée \`scripts/predictions.js\`. Pour chaque ligne ci-dessous, écris en commentaire ta prédiction PUIS vérifie en exécutant :
\`\`\`js
console.log("5" + 2);
console.log("5" - 2);
console.log(2 + 2 + "2");
console.log("2" + 2 + 2);
console.log(0 == "");
console.log(0 === "");
console.log(typeof null);
console.log(typeof undefined);
console.log(10 / 3);
console.log(10 % 3);
console.log(!!"texte");
console.log(!!"");
\`\`\`
Score honnête sur 12 dans tes notes. Moins de 8 ? Relis la théorie et refais demain matin.

**B — Convertisseur d'unités** : \`scripts/convertisseur.js\` — trois constantes \`montant\`, \`de\`, \`vers\` (modifiables à la main), qui convertit entre "eur"/"usd"/"gbp" avec des taux fixés en constantes, et affiche \`150 EUR = 162.50 USD\` (2 décimales, indice : \`toFixed(2)\`). Si la devise est inconnue : message d'erreur clair et exit code 1.`,
    bonus: "Améliore le convertisseur pour lire montant/de/vers depuis process.argv (réutilise le pattern du jour 2). Valide que le montant est bien un nombre : que renvoie `Number(\"abc\")` et comment le détecter (indice : `Number.isNaN`) ?",
    quiz: [
      { q: "Pourquoi `\"5\" + 2` et `\"5\" - 2` donnent-ils des résultats de types différents ?", a: "`+` concatène dès qu'une string est présente (\"52\"), `-` n'existe que pour les nombres donc convertit (\"5\"→5, résultat 3)." },
      { q: "Quand utiliser let plutôt que const ?", a: "Uniquement quand la variable sera réassignée (compteur, accumulateur). Par défaut : const — ça documente l'intention." },
      { q: "Que vaut `typeof null` et pourquoi c'est surprenant ?", a: "\"object\" — un bug historique de JS jamais corrigé. À connaître pour les entretiens." },
      { q: "Différence entre null et undefined ?", a: "undefined = pas encore de valeur (défaut du langage) ; null = absence volontaire posée par le développeur." },
    ],
    deliverable: "predictions.js avec tes prédictions en commentaires + ton score, convertisseur.js fonctionnel, commit propre.",
    criteria: ['12 prédictions écrites AVANT exécution (l\'honnêteté est le muscle qu\'on entraîne)', 'Convertisseur : les 6 sens de conversion marchent', 'Devise inconnue → message clair + exit 1', 'Aucun == dans ton code'],
    mistakes: ['Exécuter avant de prédire — tu n\'apprends rien', 'toFixed retourne une STRING, pas un nombre (piège si tu recalcules ensuite)', 'Oublier le cas d\'erreur : un programme qui ne gère que le chemin heureux est un programme à moitié écrit'],
    resources: ['MDN JavaScript — "Types et structures de données" (français)', 'javascript.info chapitres 2.1-2.9 (référence claire, existe en français)'],
    aiRule: "Prédictions : évidemment sans IA (c'est un test de TON modèle mental). Convertisseur : 30 min seul minimum. Si l'IA t'aide, exige d'elle des INDICES, pas du code : dis-lui explicitement 'ne me donne pas le code'.",
    solution: {
      logic: "Le convertisseur = 3 étapes : valider les entrées → convertir via une devise pivot (tout en EUR d'abord) → formater la sortie. Le pivot évite d'écrire 6 taux (n devises = n taux au lieu de n×(n-1)).",
      simple: `\`\`\`js
// scripts/convertisseur.js — taux fixes par rapport à l'EUR (pivot)
const TAUX_VERS_EUR = { eur: 1, usd: 0.92, gbp: 1.17 };
const montant = 150, de = "eur", vers = "usd";

if (!(de in TAUX_VERS_EUR) || !(vers in TAUX_VERS_EUR)) {
  console.error(\`Devise inconnue. Devises supportées : \${Object.keys(TAUX_VERS_EUR).join(", ")}\`);
  process.exit(1);
}
const enEuros = montant * TAUX_VERS_EUR[de];
const resultat = enEuros / TAUX_VERS_EUR[vers];
console.log(\`\${montant} \${de.toUpperCase()} = \${resultat.toFixed(2)} \${vers.toUpperCase()}\`);
\`\`\``,
      improved: `Avec argv et validation numérique (bonus) :
\`\`\`js
const [montantBrut, de, vers] = process.argv.slice(2);
const montant = Number(montantBrut);
if (Number.isNaN(montant) || !de || !vers) {
  console.error("Usage : node convertisseur.js <montant> <de> <vers>");
  process.exit(1);
}
// ... suite identique
\`\`\`
Note le pattern déjà vu au jour 2 : parser → valider → traiter → formater. Quatre étapes, toujours dans cet ordre.`,
      pitfalls: ['Utiliser 6 if/else pour les 6 conversions au lieu d\'un pivot : ça marche mais ça n\'échelle pas (10 devises = 90 branches)', 'Number("") vaut 0, pas NaN — cas vicieux si tu pousses la validation', 'console.error vs console.log : les erreurs vont sur stderr, c\'est la convention'],
      checks: ['eur→usd, usd→eur, usd→gbp donnent des résultats cohérents (A→B puis B→A ≈ montant initial)', 'Devise "xyz" → message + echo $? affiche 1', 'Score prédictions noté honnêtement'],
      reflection: ["L'objet TAUX_VERS_EUR utilisé comme table de correspondance : c'est ta première 'hash map' (jour 30 formalise ça). Où as-tu déjà vu ce pattern ?", "Pourquoi une devise pivot ? Quel concept général y a-t-il derrière (réduire n² relations à n) ?"],
    },
  },
  {
    day: 5, title: "Conditions : apprendre à ton programme à décider",
    skill: 'jsts', difficulty: 1, hours: 4.5,
    objective: "Écrire des branchements corrects et lisibles : if/else if/else, opérateurs logiques, early return, et structurer une logique de décision à plusieurs critères.",
    concepts: ['if / else if / else', '&&, ||, !', 'Truthy / falsy', 'Ternaire (usage sobre)', 'Guard clauses (retours anticipés)', 'switch (et quand l\'éviter)'],
    theory: `Un programme utile prend des **décisions**. La condition évalue une expression booléenne et branche.

Les 6 valeurs **falsy** de JS à connaître par cœur : \`false, 0, "", null, undefined, NaN\`. TOUT le reste est truthy (y compris "0", [] et {} — pièges classiques d'entretien).

**Combiner** : \`&&\` (et), \`||\` (ou), \`!\` (non). Attention à la précédence : dans le doute, parenthèse. \`age >= 18 && (pays === "FR" || pays === "BE")\`.

**Le style qui te fera reconnaître comme quelqu'un de propre** : les *guard clauses*. Au lieu d'imbriquer :
\`\`\`js
// ❌ pyramide
if (user) { if (user.actif) { if (user.age >= 18) { /* enfin le vrai code */ } } }
// ✅ guards : on évacue les cas invalides d'abord
if (!user) return "utilisateur manquant";
if (!user.actif) return "compte inactif";
if (user.age < 18) return "âge insuffisant";
/* le vrai code, à plat */
\`\`\`
Moins d'imbrication = moins de bugs = relecture facile. C'est un critère direct de "clean code" (évaluable en entretien sur n'importe quel exercice).`,
    schedule: [
      "0:00-0:45 — Théorie + REPL : teste les 6 falsy, les combinaisons &&/||, 3 pyramides transformées en guards.",
      "0:45-1:45 — Exercice A (tarification) en style guards.",
      "1:45-2:00 — Pause.",
      "2:00-3:15 — Exercice B (validateur) — le gros morceau.",
      "3:15-3:45 — Bonus + quiz.",
      "3:45-4:30 — Auto-correction ligne à ligne avec la solution, commit, journal.",
    ],
    exercise: `**A — Tarif de cinéma** : fonction (ou script) qui calcule un tarif : base 12€ ; moins de 12 ans : 5€ ; 12-17 ans ou étudiant : 8€ ; plus de 65 ans : 7€ ; le mercredi : -2€ sur tous les tarifs (jamais en dessous de 0). Entrées : \`age\`, \`estEtudiant\`, \`jour\`. Écris d'abord les CAS DE TEST (au moins 8, avec les limites : 11/12 ans, 17/18, 65/66, mercredi + enfant) puis le code en guard clauses.

**B — Validateur de mot de passe** : script qui vérifie un mot de passe et affiche TOUTES les règles violées (pas juste la première) :
- ≥ 10 caractères ; ≥ 1 majuscule ; ≥ 1 chiffre ; ≥ 1 caractère spécial parmi !@#$%^&* ; ne contient pas "password" ni "123456".
Sortie exemple : \`❌ 2 problèmes : trop court (7/10), aucun chiffre\` ou \`✅ Mot de passe valide\`. Indice : accumule les erreurs dans un tableau.`,
    bonus: "Ajoute au validateur un score de force (faible/moyen/fort) selon le nombre de critères dépassés (longueur ≥ 14, majuscule ET minuscule, etc.). Définis TOI-même le barème et documente-le en commentaire.",
    quiz: [
      { q: "Liste les 6 valeurs falsy.", a: "false, 0, \"\" (chaîne vide), null, undefined, NaN." },
      { q: "`[] ? \"a\" : \"b\"` renvoie quoi ?", a: "\"a\" — un tableau vide est truthy (comme un objet vide). Seules les 6 falsy sont falsy." },
      { q: "Qu'est-ce qu'une guard clause et quel est son bénéfice ?", a: "Un retour anticipé qui évacue un cas invalide dès le début ; le code principal reste à plat, lisible, sans pyramide d'imbrications." },
      { q: "Pourquoi accumuler les erreurs du validateur dans un tableau plutôt que retourner à la première ?", a: "Expérience utilisateur : l'utilisateur corrige tout en une passe. Et le pattern collecte-puis-rapporte resservira partout (validation d'API, tests)." },
    ],
    deliverable: "tarif.js avec ses 8+ cas de test en commentaires (attendu vs obtenu), validateur.js complet, commit.",
    criteria: ['Cas limites testés (11 vs 12 ans, etc.) et corrects', 'Zéro pyramide : imbrication max 1 niveau', 'Validateur : toutes les violations listées en une exécution', 'Les tests étaient écrits AVANT le code (méthode)'],
    mistakes: ['Confondre && et || dans les conditions d\'âge (12-17 = age >= 12 && age <= 17)', 'Tester `mdp.includes("A")` au lieu d\'une vraie détection de majuscule (indice : comparer mdp à mdp.toLowerCase() ou boucler)', 'Le mercredi enfant : 5-2=3, pas de tarif négatif possible ici, mais as-tu VÉRIFIÉ ton garde-fou Math.max(0, ...) ?'],
    resources: ['javascript.info — "Logical operators" et "Conditional branching"', 'Article : cherche "guard clauses refactoring" (le concept vaut pour tous les langages)'],
    aiRule: "Écris tes cas de test SEUL — c'est le cœur de la compétence du jour. Le code peut être discuté avec l'IA après 30 min de blocage, mais les cas de test jamais : c'est ton cerveau qu'on muscle.",
    solution: {
      logic: "A : l'ordre des conditions EST la logique — du cas le plus spécifique au plus général, et la réduction du mercredi s'applique APRÈS le choix du tarif de base (deux étapes séparées, pas un if géant). B : le pattern collecteur — un tableau d'erreurs qu'on remplit règle par règle, puis UN affichage à la fin. Séparer 'détecter' de 'rapporter'.",
      simple: `\`\`\`js
function tarif(age, estEtudiant, jour) {
  let prix;
  if (age < 12) prix = 5;
  else if (age <= 17 || estEtudiant) prix = 8;
  else if (age > 65) prix = 7;
  else prix = 12;
  if (jour === "mercredi") prix = Math.max(0, prix - 2);
  return prix;
}
// Tests : tarif(11,false,"lundi")===5 ; tarif(12,false,"lundi")===8 ; ...
\`\`\`
\`\`\`js
const mdp = process.argv[2] ?? "";
const erreurs = [];
if (mdp.length < 10) erreurs.push(\`trop court (\${mdp.length}/10)\`);
if (!/[A-Z]/.test(mdp)) erreurs.push("aucune majuscule");
if (!/[0-9]/.test(mdp)) erreurs.push("aucun chiffre");
if (!/[!@#$%^&*]/.test(mdp)) erreurs.push("aucun caractère spécial");
if (mdp.toLowerCase().includes("password") || mdp.includes("123456"))
  erreurs.push("contient une séquence interdite");
if (erreurs.length > 0) console.log(\`❌ \${erreurs.length} problème(s) : \${erreurs.join(", ")}\`);
else console.log("✅ Mot de passe valide");
\`\`\`
(Les regex /[A-Z]/ etc. sont données ici en avance de phase — si tu as bouclé sur les caractères à la main, c'est PARFAITEMENT bien aussi, et même mieux pédagogiquement.)`,
      improved: `Version données-pilotées du validateur — les règles deviennent un tableau d'objets {test, message} qu'on parcourt :
\`\`\`js
const REGLES = [
  { test: (m) => m.length >= 10, message: "au moins 10 caractères" },
  { test: (m) => /[A-Z]/.test(m), message: "au moins une majuscule" },
  // ...
];
const erreurs = REGLES.filter((r) => !r.test(mdp)).map((r) => r.message);
\`\`\`
Ajouter une règle = ajouter une ligne de données, zéro modification de la logique. Ce principe (open/closed) reviendra au mois 2. Ne t'inquiète pas si filter/map sont flous : c'est le programme des jours 23-24.`,
      pitfalls: ['Ordre des if dans tarif : si `age > 65` est testé APRÈS le else final, il est inatteignable — l\'ordre est la logique', 'Étudiant de 70 ans : ton code donne quoi ? La spec est ambiguë — la VRAIE compétence est de remarquer l\'ambiguïté et de documenter ton choix', 'mdp undefined si aucun argument : le ?? "" le gère — l\'as-tu testé ?'],
      checks: ['Les 8 cas de test passent, Y COMPRIS les limites', 'validateur avec "abc" affiche 4 problèmes d\'un coup', 'Aucun if imbriqué de plus d\'un niveau'],
      reflection: ["Dans le tarif, pourquoi appliquer la réduction mercredi APRÈS le choix du tarif plutôt que dupliquer -2 dans chaque branche ? Quel principe général ?", "La version 'données-pilotées' du validateur : quel rapport avec le TAUX_VERS_EUR d'hier ?"],
    },
  },
  {
    day: 6, title: "Boucles + GitHub : ton premier code publié",
    skill: 'jsts', difficulty: 2, hours: 4.5,
    objective: "Maîtriser for, while, for...of, les compteurs et accumulateurs — et publier ia-lab sur GitHub (ton portfolio commence AUJOURD'HUI).",
    concepts: ['for classique', 'while', 'for...of', 'break / continue', 'Accumulateurs', 'Boucles imbriquées', 'GitHub : remote, push, README'],
    theory: `Une **boucle** répète un bloc. Trois formes à maîtriser :
- \`for (let i = 0; i < n; i++)\` : quand tu as besoin de l'INDEX ou d'un nombre d'itérations connu.
- \`for (const element of tableau)\` : quand tu veux juste chaque ÉLÉMENT (le plus courant, le plus lisible).
- \`while (condition)\` : quand tu ne sais pas COMBIEN d'itérations (lire jusqu'à trouver, réessayer jusqu'à réussir).

Les deux patterns fondamentaux (80% des boucles de ta vie) :
- **Accumulateur** : \`let total = 0; for (...) total += x;\` — construire un résultat en agrégeant.
- **Compteur/filtre** : compter ou collecter ce qui passe un critère.

\`break\` sort de la boucle, \`continue\` saute à l'itération suivante — les deux sont des guard clauses de boucle.

L'erreur n°1 mondiale : le **off-by-one** (\`<\` vs \`<=\`, partir de 0 ou 1). Réflexe : teste TOUJOURS mentalement la première et la dernière itération.

**GitHub** : Git est local, GitHub héberge tes dépôts en ligne. \`git remote add origin <url>\` relie ton dépôt local au dépôt distant, \`git push\` envoie tes commits. À partir d'aujourd'hui, ton travail est VISIBLE — c'est le début de ton portfolio.`,
    schedule: [
      "0:00-0:45 — Théorie + REPL : les 3 formes de boucle sur un même problème (somme de 1 à 100).",
      "0:45-2:00 — Exercice A : la gamme d'exercices boucles.",
      "2:00-2:15 — Pause.",
      "2:15-3:00 — Exercice B : FizzBuzz étendu (LE classique d'entretien).",
      "3:00-3:45 — GitHub : création de compte/dépôt, push de ia-lab, rédaction du README.",
      "3:45-4:30 — Bonus, quiz, auto-correction, journal.",
    ],
    exercise: `**A — La gamme** (dans \`scripts/boucles.js\`, chaque fonction affichée puis testée) :
1. \`somme(n)\` : somme de 1 à n avec un for.
2. \`table(n)\` : la table de multiplication de n (n×1 à n×10), affichage aligné.
3. \`compterPairs(tableau)\` : combien de nombres pairs (for...of).
4. \`premierNegatif(tableau)\` : l'index du premier nombre négatif, -1 sinon (avec break).
5. \`deviner()\` : un while qui tire des nombres aléatoires (Math.random) entre 1 et 100 jusqu'à tomber sur 42, et compte les essais.
6. \`pyramide(n)\` : affiche une pyramide de # de hauteur n (boucles imbriquées).

**B — FizzBuzz étendu** : de 1 à 100 — multiple de 3 : "Fizz" ; de 5 : "Buzz" ; des deux : "FizzBuzz" ; ET si le nombre contient le chiffre 7 (ex: 17, 71) : ajoute "Lucky" (ex: 21 → "FizzLucky"... vérifie : 21 contient-il un 7 ? Non ! Mais 27 → "Lucky" ? Non : 27 est multiple de 3 ET contient 7 → "FizzLucky"). Écris d'abord sur papier ce que doivent donner : 15, 17, 21, 27, 35, 70, 75.

**C — GitHub** : crée un compte GitHub (nom professionnel !), un dépôt public \`ia-lab\`, pousse tout, et écris un README.md : qui tu es (2 lignes), ce que contient ce dépôt, ton programme des 12 mois (3 lignes).`,
    bonus: "`pyramideInversee(n)` puis `losange(n)` (une pyramide + son reflet). Le losange force à décomposer : c'est le but.",
    quiz: [
      { q: "Quand while plutôt que for ?", a: "Quand le nombre d'itérations est inconnu à l'avance (attendre une condition, réessayer)." },
      { q: "Que fait break dans une boucle imbriquée ?", a: "Il ne sort QUE de la boucle la plus interne — piège classique." },
      { q: "Comment vérifier qu'un nombre contient le chiffre 7 ?", a: "Le convertir en string et tester String(n).includes(\"7\") — changer de représentation (nombre→texte) est une technique générale." },
      { q: "git push fait quoi exactement ?", a: "Envoie tes commits locaux vers le dépôt distant (GitHub). Sans push, ton travail n'existe que sur ta machine." },
    ],
    deliverable: "boucles.js (6 fonctions), fizzbuzz.js, et l'URL de ton dépôt GitHub public avec README — colle-la dans tes notes du jour dans l'app.",
    criteria: ['Les 6 fonctions passent tes tests manuels', 'FizzBuzz : les 7 valeurs papier vérifiées AVANT d\'exécuter', 'Dépôt GitHub public accessible avec README', 'Historique poussé propre (tes commits des jours 3-6)'],
    mistakes: ['Off-by-one dans somme(n) : somme(3) doit donner 6 (1+2+3), pas 3 ni 10', 'FizzBuzz : tester %3 puis %5 puis %15 dans le mauvais ordre — le cas combiné doit être traité EN PREMIER (ou par concaténation, plus élégant)', 'README bâclé : c\'est la première chose qu\'un recruteur verra de toi. 15 minutes dessus minimum'],
    resources: ['javascript.info — "Loops: while and for"', 'GitHub Docs — "Hello World" (guide officiel de premier dépôt, en français)'],
    aiRule: "FizzBuzz est LE test d'entretien : interdiction absolue d'IA dessus (tu le referas de mémoire au jour 20). La gamme : 30 min de blocage avant aide, et uniquement des indices.",
    solution: {
      logic: "FizzBuzz élégant : au lieu d'un arbre de if pour chaque combinaison (qui explose : 3 conditions = 8 cas), on CONSTRUIT la réponse par concaténation — chaque règle ajoute son mot si elle s'applique, et si rien ne s'est appliqué, on affiche le nombre. 3 règles = 3 if à plat, extensible à l'infini.",
      simple: `\`\`\`js
for (let i = 1; i <= 100; i++) {
  let sortie = "";
  if (i % 3 === 0) sortie += "Fizz";
  if (i % 5 === 0) sortie += "Buzz";
  if (String(i).includes("7")) sortie += "Lucky";
  console.log(sortie === "" ? i : sortie);
}
\`\`\`
Gamme — les deux fonctions les plus ratées :
\`\`\`js
function premierNegatif(tableau) {
  for (let i = 0; i < tableau.length; i++) {
    if (tableau[i] < 0) return i;   // return sort ET renvoie : break + valeur
  }
  return -1;
}
function pyramide(n) {
  for (let ligne = 1; ligne <= n; ligne++) {
    console.log(" ".repeat(n - ligne) + "#".repeat(2 * ligne - 1));
  }
}
\`\`\``,
      improved: "Remarque la version concaténation de FizzBuzz vs la version if/else if : ajoute une 4e règle ('Bang' pour les multiples de 11) mentalement dans chaque version. Concaténation : +1 ligne. If/else : le nombre de cas combinés double. C'est un argument de DESIGN que tu peux ressortir en entretien sur ce simple exercice.",
      pitfalls: ['pyramide sans les espaces de gauche = triangle, pas pyramide — relis l\'énoncé (compétence : lire VRAIMENT la spec)', 'deviner() : Math.floor(Math.random() * 100) + 1 pour 1-100 ; sans le +1 tu as 0-99', '27 → "FizzLucky" : si ton code donne "Fizz" ou "Lucky" seul, tes règles s\'excluent au lieu de se cumuler'],
      checks: ['somme(1)=1, somme(3)=6, somme(100)=5050', 'FizzBuzz : 15→FizzBuzz, 17→Lucky, 70→BuzzLucky, 75→FizzBuzz, 105 (si tu étends)→FizzBuzzLucky ? Non — 105 ne contient pas de 7. Vérifie ta propre trace !', 'Ton dépôt s\'ouvre en navigation privée (donc vraiment public)'],
      reflection: ["Le pattern 'construire par concaténation' vs 'arbre de cas' : où pourrais-tu le réutiliser (pense au validateur d'hier) ?", "Ton README : si un recruteur ne lit QUE lui, que retient-il de toi ?"],
    },
  },
  // Jour 7 = revue hebdo semaine 1 (généré automatiquement).
  {
    day: 8, title: "Tableaux : la structure de données que tu utiliseras chaque jour",
    skill: 'jsts', difficulty: 2, hours: 4.5,
    objective: "Manipuler les tableaux avec aisance : création, accès, ajout/retrait, recherche, découpage — et comprendre la différence mutation vs copie.",
    concepts: ['push/pop/shift/unshift', 'indexOf/includes/find', 'slice vs splice', 'Copie vs référence', 'join/split', 'Tableaux 2D'],
    theory: `Le **tableau** est une liste ordonnée indexée à partir de 0. Les opérations à connaître par cœur :
- Bout de tableau : \`push\` (ajoute à la fin), \`pop\` (retire la fin) — rapides. Début : \`unshift\`/\`shift\` — lents sur les gros tableaux (tout se décale, tu comprendras avec Big O au jour 15).
- Recherche : \`includes(x)\` (booléen), \`indexOf(x)\` (position ou -1), \`find(fn)\` (premier élément qui matche — attend une fonction, avant-goût du jour 22).
- **slice(début, fin)** : COPIE une portion (original intact, fin exclue). **splice(début, n)** : MODIFIE le tableau (retire/insère sur place). Les confondre est l'erreur classique — slice = ciseaux à photocopie, splice = chirurgie.

**LE concept fondamental du jour** : un tableau est stocké par **référence**. \`const b = a\` ne copie RIEN — a et b pointent vers le même tableau ; modifier b modifie a. Pour copier : \`const b = [...a]\` (copie superficielle). C'est la source du bug le plus vicieux du JS débutant, et une question d'entretien systématique.

\`split\`/\`join\` font le pont texte↔tableau : \`"a,b,c".split(",")\` → \`["a","b","c"]\`, et l'inverse avec join.`,
    schedule: [
      "0:00-0:45 — Théorie + REPL : vérifie CHAQUE méthode, puis reproduis le bug de la référence partagée et sa correction.",
      "0:45-2:00 — Exercice A : la gamme tableaux.",
      "2:00-2:15 — Pause.",
      "2:15-3:30 — Exercice B : le gestionnaire de playlist.",
      "3:30-4:00 — Bonus + quiz.",
      "4:00-4:30 — Auto-correction, commit, journal.",
    ],
    exercise: `**A — La gamme** (\`scripts/tableaux.js\`) :
1. \`dernierElement(arr)\` sans pop (ne pas modifier arr !).
2. \`sansDoublons(arr)\` : [1,2,2,3,1] → [1,2,3] (boucle + includes ; Set interdit aujourd'hui, il arrive au jour 30).
3. \`rotation(arr)\` : [1,2,3,4] → [4,1,2,3] SANS modifier l'original (slice + spread).
4. \`intercaler(arr, sep)\` : ([1,2,3], "-") → [1,"-",2,"-",3].
5. \`decouper(phrase)\` : "le chat dort" → nombre de mots, mot le plus long.
6. \`matrice(n)\` : génère la table de multiplication n×n en tableau 2D, puis affiche-la lisiblement.

**B — Playlist** : \`scripts/playlist.js\` — un tableau de titres (strings) et des fonctions : \`ajouter(titre)\` (refuse les doublons avec message), \`retirer(titre)\` (message si absent), \`monter(titre)\` (le déplace d'une position vers le début), \`melanger()\` (retourne une NOUVELLE playlist mélangée, l'originale intacte), \`afficher()\` (numérotée, "1. titre"). Scénario de test : construis une playlist de 6 titres, monte le 4e deux fois, tente un doublon, mélange, affiche l'originale ET la mélangée.`,
    bonus: "`melanger` uniforme : renseigne-toi sur l'algorithme de Fisher-Yates et implémente-le. Pourquoi `arr.sort(() => Math.random() - 0.5)` est-il un MAUVAIS mélange ? (Réponse dans la solution — mais cherche d'abord.)",
    quiz: [
      { q: "Différence slice / splice ?", a: "slice(a,b) copie sans toucher l'original (fin exclue) ; splice(a,n) modifie l'original en retirant/insérant. Copie vs mutation." },
      { q: "Après `const b = a; b.push(9)`, que contient a ?", a: "Le 9 aussi : a et b référencent le MÊME tableau. Il n'y a pas eu de copie." },
      { q: "Comment copier un tableau (2 façons) ?", a: "[...a] ou a.slice(). Attention : copie superficielle — les objets À L'INTÉRIEUR restent partagés." },
      { q: "Que renvoie indexOf pour un élément absent, et pourquoi c'est piégeux ?", a: "-1, qui est truthy ! `if (arr.indexOf(x))` bugge quand x est en position 0. Utiliser includes ou comparer !== -1." },
    ],
    deliverable: "tableaux.js (6 fonctions testées), playlist.js avec le scénario complet exécuté, commit.",
    criteria: ['rotation et melanger ne modifient PAS l\'original (prouve-le en affichant avant/après)', 'Doublons et absences gérés avec messages', 'Le bug de référence reproduit puis corrigé dans tes notes', 'Tests manuels visibles dans le code (appels + résultat attendu en commentaire)'],
    mistakes: ['Utiliser splice en pensant slice — relis chaque usage', 'monter(premierTitre) : que se passe-t-il ? Il ne doit PAS passer en dernière position ni crasher', 'Copier avec = puis s\'étonner que tout bouge ensemble'],
    resources: ['MDN — Array (garde cet onglet ouvert toute l\'année)', 'javascript.info — "Arrays" et "Array methods"'],
    aiRule: "Gamme sans IA (c'est de la mémoire musculaire). Playlist : 30 min par blocage, indices uniquement. Le bonus Fisher-Yates : cherche l'ALGORITHME (papier), pas le code.",
    solution: {
      logic: "Playlist : chaque fonction suit valider → agir → informer. `monter` = trouver l'index, vérifier qu'il est > 0, échanger arr[i] et arr[i-1]. `melanger` sans mutation = copier D'ABORD ([...]) puis mélanger la copie.",
      simple: `\`\`\`js
function monter(playlist, titre) {
  const i = playlist.indexOf(titre);
  if (i === -1) { console.log(\`"\${titre}" introuvable\`); return; }
  if (i === 0) { console.log(\`"\${titre}" est déjà en tête\`); return; }
  [playlist[i - 1], playlist[i]] = [playlist[i], playlist[i - 1]]; // échange
}
function melanger(playlist) {
  const copie = [...playlist];
  for (let i = copie.length - 1; i > 0; i--) {          // Fisher-Yates
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}
\`\`\``,
      improved: "Pourquoi sort(() => Math.random() - 0.5) est mauvais : sort attend un comparateur COHÉRENT (si a<b maintenant, a<b toujours). Un comparateur aléatoire viole ce contrat → le mélange est biaisé (certaines permutations sortent plus souvent) et dépend de l'implémentation du moteur. Fisher-Yates garantit l'uniformité en O(n). Moralité générale : respecter le CONTRAT d'une API, pas juste 'ça a l'air de marcher'.",
      pitfalls: ['sansDoublons avec includes est en O(n²) — parfaitement acceptable aujourd\'hui, et tu la réécriras en O(n) au jour 30 avec un Set : note-le', 'L\'échange par destructuration [a,b]=[b,a] : si tu ne le connais pas, la version avec variable temporaire est très bien', 'matrice : arr[ligne][colonne] — fixe une convention et tiens-t\'y'],
      checks: ['afficher() après le scénario : l\'ordre reflète exactement les opérations', 'L\'originale est intacte après melanger (compare les join(","))', 'monter du 1er élément → message, pas de crash'],
      reflection: ["Pourquoi préférer les fonctions qui RETOURNENT une nouvelle valeur à celles qui modifient (pense : tests, imprévisibilité) ? Où est-ce que muter reste OK ?", "La playlist est un tableau de strings. Demain, des objets {titre, artiste, durée} : qu'est-ce qui changerait dans chaque fonction ?"],
    },
  },
  {
    day: 9, title: "Fonctions : découper les problèmes en morceaux nommés",
    skill: 'jsts', difficulty: 2, hours: 4.5,
    objective: "Écrire des fonctions propres : signature claire, une responsabilité, valeurs de retour cohérentes ; comprendre portée et shadowing ; composer des petites fonctions en programmes.",
    concepts: ['Déclaration vs expression vs fléchée', 'Paramètres, valeurs par défaut, rest', 'return (et undefined implicite)', 'Portée (scope) et shadowing', 'Une fonction = une responsabilité', 'Composition'],
    theory: `Une **fonction** est un morceau de programme nommé et réutilisable : des entrées (paramètres), un traitement, une sortie (return). Trois écritures :
\`\`\`js
function aire(l, h) { return l * h; }        // déclaration (hissée)
const aire = function (l, h) { return l * h; }; // expression
const aire = (l, h) => l * h;                 // fléchée (concise)
\`\`\`
Les trois sont équivalentes pour l'essentiel — la fléchée est idiomatique pour les petites fonctions (et dominante à partir du jour 22).

Règles d'or :
- **Une fonction, une responsabilité.** Si tu la décris avec "et", découpe-la.
- **Un return cohérent** : toujours le même TYPE. Une fonction qui renvoie parfois un nombre, parfois undefined, parfois un message d'erreur est une usine à bugs.
- **La portée** : une variable déclarée dans une fonction n'existe QUE dedans. Une variable interne peut masquer (shadow) une externe du même nom — source de confusion, évite.
- **Paramètres par défaut** : \`function saluer(nom = "inconnu")\`. **Rest** : \`function somme(...nombres)\` capture tous les arguments en tableau.

Pourquoi c'est LE savoir-faire : la programmation consiste à décomposer un gros problème en petites fonctions composables. L'exercice du jour t'entraîne exactement à ça — et c'est aussi comme ça qu'on structure une pipeline RAG (mois 8) : ingest → chunk → embed → search → answer. Même discipline, autre échelle.`,
    schedule: [
      "0:00-0:45 — Théorie + REPL : les 3 écritures, portée, shadowing (reproduis un cas), rest et défauts.",
      "0:45-1:45 — Exercice A : la gamme fonctions.",
      "1:45-2:00 — Pause.",
      "2:00-3:30 — Exercice B : la facture (décomposition complète d'un problème).",
      "3:30-4:00 — Bonus + quiz.",
      "4:00-4:30 — Auto-correction (compare surtout ta DÉCOUPE à celle de la solution), commit, journal.",
    ],
    exercise: `**A — La gamme** (\`scripts/fonctions.js\`) :
1. \`estPair(n)\` → booléen (et rien d'autre !).
2. \`capitaliser(mot)\` → "bonjour" → "Bonjour".
3. \`aireRectangle(l, h = l)\` → avec un seul argument, c'est un carré.
4. \`maximum(...nombres)\` → le plus grand, sans Math.max, avec rest.
5. \`appliquerDeuxFois(fn, x)\` → fn(fn(x)) — ta première fonction qui PREND une fonction (vertige normal, jour 22 approfondit).

**B — Le générateur de facture** : un tableau d'achats \`{nom, prixUnitaire, quantite}\` est fourni (crée 5 lignes). Produis une facture affichée proprement : lignes formatées et alignées, sous-total, TVA 20%, remise (5% si sous-total > 100€), total final.
CONTRAINTE : décompose en fonctions d'UNE responsabilité chacune — au minimum \`totalLigne(achat)\`, \`sousTotal(achats)\`, \`calculerRemise(montant)\`, \`formaterLigne(achat)\`, \`genererFacture(achats)\`. La fonction principale ne fait QUE composer les autres. Écris les cas de test de calculerRemise AVANT (99, 100, 101, 150).`,
    bonus: "Ajoute `formaterMontant(n)` (12.5 → \"12,50 €\") utilisée PARTOUT, puis change le format (\"EUR 12.50\") en ne touchant QU'À elle. Si tu dois modifier ailleurs, ta décomposition fuit — corrige-la. C'est un test de design réel.",
    quiz: [
      { q: "Que renvoie une fonction sans return ?", a: "undefined — implicitement. D'où l'importance de returns explicites et cohérents." },
      { q: "Différence entre paramètre et argument ?", a: "Le paramètre est le nom dans la signature (l, h) ; l'argument est la valeur passée à l'appel (3, 4)." },
      { q: "Qu'est-ce que le shadowing ?", a: "Une variable interne qui porte le même nom qu'une externe et la masque dans sa portée. Légal mais source de confusion." },
      { q: "Pourquoi 'une fonction = une responsabilité' rend-il le code testable ?", a: "On peut tester chaque morceau isolément avec des entrées simples, au lieu de devoir exécuter tout le programme pour vérifier un calcul." },
    ],
    deliverable: "fonctions.js, facture.js avec sa sortie propre (colle un exemple de sortie en commentaire de fin de fichier), commit.",
    criteria: ['Chaque fonction : une responsabilité, un type de retour', 'La facture : genererFacture ne contient AUCUN calcul, que de la composition', 'calculerRemise : les 4 cas limites testés avant écriture', 'Le bonus : le changement de format n\'a touché qu\'une fonction'],
    mistakes: ['Fonction qui CALCULE et AFFICHE : sépare toujours (le calcul se teste, l\'affichage se regarde)', 'Remise sur 100 exactement : > ou >= ? L\'énoncé dit "si > 100" — l\'as-tu lu ou deviné ?', 'Variables globales modifiées depuis les fonctions : tout par paramètres et returns aujourd\'hui'],
    resources: ['javascript.info — "Functions" et "Arrow functions"', 'MDN — "Fonctions" (la page de référence)'],
    aiRule: "La DÉCOUPE en fonctions doit venir de toi (papier, 10 min, avant de coder). L'IA ne doit jamais choisir ta décomposition — c'est la compétence même qu'on entraîne. Blocage d'implémentation : 30 min puis indices.",
    solution: {
      logic: "La facture teste la SÉPARATION calcul/présentation : d'un côté des fonctions pures qui prennent des données et retournent des nombres, de l'autre des fonctions de formatage qui retournent des strings, et une composition finale. Cette frontière (logique ↔ présentation) est l'idée derrière TOUTES les architectures que tu verras (MVC, 3-tiers, hexagonal).",
      simple: `\`\`\`js
const totalLigne = (a) => a.prixUnitaire * a.quantite;
const sousTotal = (achats) => {
  let total = 0;
  for (const a of achats) total += totalLigne(a);
  return total;
};
const calculerRemise = (montant) => (montant > 100 ? montant * 0.05 : 0);
const formaterMontant = (n) => \`\${n.toFixed(2).replace(".", ",")} €\`;
const formaterLigne = (a) =>
  \`\${a.nom.padEnd(20)} \${String(a.quantite).padStart(3)} x \${formaterMontant(a.prixUnitaire).padStart(10)} = \${formaterMontant(totalLigne(a)).padStart(10)}\`;

function genererFacture(achats) {
  const st = sousTotal(achats);
  const remise = calculerRemise(st);
  const tva = (st - remise) * 0.2;
  const lignes = [];
  for (const a of achats) lignes.push(formaterLigne(a));
  lignes.push(\`Sous-total : \${formaterMontant(st)}\`);
  if (remise > 0) lignes.push(\`Remise 5%  : -\${formaterMontant(remise)}\`);
  lignes.push(\`TVA 20%    : \${formaterMontant(tva)}\`);
  lignes.push(\`TOTAL      : \${formaterMontant(st - remise + tva)}\`);
  return lignes.join("\\n");
}
console.log(genererFacture(ACHATS));
\`\`\``,
      improved: "Question de design laissée ouverte exprès : la TVA s'applique-t-elle avant ou après remise ? La solution choisit après (remise puis TVA sur le net) — un autre choix est défendable. Le POINT IMPORTANT : tu devais REMARQUER l'ambiguïté et documenter ton choix en commentaire. En entretien comme en poste, détecter les specs ambiguës vaut plus que coder vite.",
      pitfalls: ['maximum() sans argument : que renvoie ta version ? -Infinity ? undefined ? Documente ce choix', 'padEnd/padStart pour aligner : si tu ne les connaissais pas, tu as probablement aligné à la main — va voir ces méthodes, elles sont faites pour ça', 'appliquerDeuxFois(estPair, 4) : estPair(true) → piège conceptuel volontaire. fn doit renvoyer le même type qu\'elle prend pour être composable'],
      checks: ['calculerRemise(99)=0, (100)=0, (101)=5.05, (150)=7.5', 'genererFacture relue : zéro calcul dedans ?', 'Changer le taux de TVA = toucher UNE ligne ?'],
      reflection: ["genererFacture RETOURNE une string au lieu d'afficher : qu'est-ce que ça permet (tests, écrire dans un fichier, envoyer par mail) ?", "Ta découpe diffère de la solution ? Très bien — liste les différences et demande-toi : laquelle survivrait le mieux à 'ajoute une devise USD' ?"],
    },
  },
  {
    day: 10, title: "Objets : représenter le monde dans ton code",
    skill: 'jsts', difficulty: 2, hours: 4.5,
    objective: "Créer et manipuler des objets : accès, modification, parcours, imbrication, destructuring — et modéliser une entité du monde réel proprement.",
    concepts: ['Littéraux d\'objets', 'Accès point vs crochets', 'Object.keys/values/entries', 'Imbrication', 'Destructuring', 'Optional chaining ?.', 'Objets = références (comme les tableaux)'],
    theory: `Un **objet** regroupe des données liées sous des clés nommées : \`{ titre: "Dune", annee: 1965 }\`. Là où le tableau ordonne, l'objet NOMME.

- Accès : \`livre.titre\` (clé connue) ou \`livre["titre"]\` (clé dynamique : \`livre[maVariable]\` — c'est la porte vers les hash maps du jour 30).
- Parcours : \`Object.keys(o)\` (les clés), \`Object.values(o)\` (les valeurs), \`Object.entries(o)\` (paires [clé, valeur]) — les trois renvoient des TABLEAUX, donc tout ce que tu sais des tableaux s'applique.
- **Imbrication** : \`user.adresse.ville\` — et le crash célèbre : si adresse est undefined, BOOM. Parade moderne : \`user.adresse?.ville\` (undefined au lieu de crash). À utiliser aux FRONTIÈRES (données externes), pas partout (ça masquerait de vrais bugs).
- **Destructuring** : \`const { titre, annee } = livre\` extrait en une ligne. Idiomatique partout en React (mois 4).
- Comme les tableaux : les objets sont des **références**. Copie superficielle : \`{ ...o }\`.

Modéliser = choisir quoi représenter et comment. Un bon modèle rend le code évident ; un mauvais le rend tortueux. Tu passeras ta carrière à modéliser (bases de données mois 5, types TypeScript semaine 7, schémas de sortie LLM mois 8).`,
    schedule: [
      "0:00-0:45 — Théorie + REPL : construis, modifie, parcours, imbrique, destructure, reproduis le crash undefined et sa parade.",
      "0:45-1:45 — Exercice A : la gamme objets.",
      "1:45-2:00 — Pause.",
      "2:00-3:30 — Exercice B : la fiche de personnage (modélisation + manipulation).",
      "3:30-4:00 — Bonus + quiz.",
      "4:00-4:30 — Auto-correction, commit, journal.",
    ],
    exercise: `**A — La gamme** (\`scripts/objets.js\`) :
1. \`decrire(livre)\` → "Dune (1965), par Frank Herbert" via destructuring dans la signature.
2. \`compterProprietes(obj)\` → combien de clés ?
3. \`inverser(obj)\` → {a: 1, b: 2} → {1: "a", 2: "b"} (entries + boucle).
4. \`fusionner(defauts, options)\` → options écrase defauts (spread — dans quel ordre ?).
5. \`chercherVille(user)\` → la ville, ou "inconnue" si le chemin user.adresse.ville casse quelque part (optional chaining + ??).

**B — Le personnage de jeu** : modélise un personnage : identité (nom, classe), stats (force, agilité, pv, pvMax), inventaire (tableau d'objets {nom, poids, valeur}), équipement (arme équipée ou null). Puis les fonctions :
- \`subirDegats(perso, n)\` : réduit les pv (jamais < 0) ; à 0, affiche "X est KO".
- \`soigner(perso, n)\` : jamais au-dessus de pvMax.
- \`ramasser(perso, objet)\` : refuse si le poids total dépasserait 50.
- \`equiper(perso, nomObjet)\` : l'objet doit être dans l'inventaire ; sinon message.
- \`bilan(perso)\` : fiche complète lisible (pv, équipement, inventaire trié par valeur, poids total).
Scénario : crée un personnage, joue 10 actions dont les cas limites (soin au max, dégâts mortels, sac plein, équiper un objet absent).`,
    bonus: "`comparer(perso1, perso2)` : qui gagnerait un duel simple ? Définis TOI-même la formule (stats + arme), documente-la, et gère l'égalité. Le but : assumer un choix de modélisation et le défendre en commentaire.",
    quiz: [
      { q: "Quand utiliser les crochets plutôt que le point ?", a: "Quand la clé est dans une variable (obj[cle]) ou contient des caractères spéciaux. Le point exige une clé littérale connue." },
      { q: "Que fait { ...defauts, ...options } et pourquoi l'ordre compte ?", a: "Fusionne : les clés de droite écrasent celles de gauche. options après defauts = les options gagnent." },
      { q: "user.adresse?.ville quand adresse est undefined : résultat ?", a: "undefined, sans crash. Le ?. court-circuite toute la suite de la chaîne." },
      { q: "Pourquoi limiter l'optional chaining aux frontières du programme ?", a: "En interne, un undefined inattendu est un BUG à corriger, pas à masquer : le ?. partout cache les bugs au lieu de les révéler." },
    ],
    deliverable: "objets.js, personnage.js avec le scénario de 10 actions et sa sortie, commit.",
    criteria: ['Le personnage regroupe identité (nom, classe), stats (force, agilité, pv, pvMax), inventaire (objets {nom, poids, valeur}) et équipement (arme ou null) ; invariants respectés : pv ≤ pvMax, et poids total calculé depuis l\'inventaire (jamais stocké en double)', 'Tous les cas limites du scénario gérés (pv bornés, sac plein, objet absent)', 'bilan(perso) affiche les pv/pvMax, l\'équipement, l\'inventaire trié par valeur décroissante et le poids total (sortie vérifiable en la comparant au scénario de 10 actions)', 'Destructuring utilisé là où il clarifie'],
    mistakes: ['pv négatifs ou > pvMax : les BORNES sont l\'exercice (Math.max/Math.min sont tes amis)', 'equiper qui ne vérifie pas l\'inventaire : toute fonction qui reçoit un nom doit envisager qu\'il soit faux', 'Modéliser l\'arme équipée comme une string dupliquée de l\'inventaire : et si l\'objet est retiré du sac ? Réfléchis à CE QUE référence quoi'],
    resources: ['javascript.info — "Objects" (chapitres 4.1-4.7)', 'MDN — "Utiliser les objets"'],
    aiRule: "Le MODÈLE (quelles propriétés, quelles formes) doit être conçu sur papier par toi avant tout code. Compare ensuite avec la solution — les différences sont la matière à réflexion du jour. Implémentation : règle des 30 min.",
    solution: {
      logic: "Le cœur du jour est la MODÉLISATION : pv ET pvMax (sinon impossible de borner les soins), l'équipement comme RÉFÉRENCE vers un objet de l'inventaire (ou son nom — deux choix défendables aux conséquences différentes), le poids CALCULÉ depuis l'inventaire plutôt que stocké (une source de vérité, jamais désynchronisée).",
      simple: `\`\`\`js
const perso = {
  nom: "Kael", classe: "rôdeur",
  stats: { force: 12, agilite: 15 },
  pv: 80, pvMax: 100,
  inventaire: [{ nom: "épée courte", poids: 5, valeur: 30 }],
  armeEquipee: null,
};
const poidsTotal = (p) => {
  let total = 0;
  for (const objet of p.inventaire) total += objet.poids;
  return total;
};
function subirDegats(p, n) {
  p.pv = Math.max(0, p.pv - n);
  if (p.pv === 0) console.log(\`\${p.nom} est KO !\`);
}
function soigner(p, n) { p.pv = Math.min(p.pvMax, p.pv + n); }
function ramasser(p, objet) {
  if (poidsTotal(p) + objet.poids > 50) { console.log("Sac plein !"); return false; }
  p.inventaire.push(objet); return true;
}
function equiper(p, nomObjet) {
  const objet = p.inventaire.find((o) => o.nom === nomObjet);
  if (!objet) { console.log(\`\${nomObjet} n'est pas dans l'inventaire\`); return; }
  p.armeEquipee = objet;
}
\`\`\``,
      improved: "Deux choix de conception à comparer avec le tien : (1) poids CALCULÉ et non stocké — règle générale : ne stocke jamais ce qui se déduit, ça se désynchronise ; (2) armeEquipee référence l'objet de l'inventaire — donc si on ajoute retirerObjet(), il faudra déséquiper si l'arme part. Ta version a d'autres trade-offs : les identifier vaut mieux qu'avoir 'la bonne' réponse.",
      pitfalls: ['subirDegats appelé après KO : re-affiche "KO" ? Comportement à définir (guard : if (p.pv === 0) return)', 'find renvoie undefined si absent — le if (!objet) est OBLIGATOIRE', 'ramasser retourne true/false : tes autres fonctions signalent par console.log — INCOHÉRENCE volontaire de l\'énoncé, l\'as-tu remarquée ? Uniformise (toujours retourner un booléen est plus testable)'],
      checks: ['soigner(perso, 999) → pv === pvMax exactement', 'Scénario des 10 actions rejoué : chaque sortie correspond à ton attendu', 'poids : ajoute 2 objets, vérifie le total à la main'],
      reflection: ["Pourquoi 'ne jamais stocker ce qui se calcule' ? Trouve un contre-exemple où on stocke QUAND MÊME (indice : coût de calcul, jour 15).", "Ton modèle survivrait-il à 'un personnage peut équiper arme ET armure' ? Qu'est-ce qui devrait changer ?"],
    },
  },
  {
    day: 11, title: "Tableaux d'objets : le format de 90% des données réelles",
    skill: 'jsts', difficulty: 2, hours: 4.5,
    objective: "Croiser tableaux et objets avec fluidité : chercher, filtrer, trier, agréger des collections d'entités — le pain quotidien de tout développeur.",
    concepts: ['Collections d\'entités', 'find/filter à la boucle', 'Tri avec sort et comparateurs', 'Agrégations (somme, moyenne, min/max par critère)', 'Regroupement par clé', 'Données JSON'],
    theory: `Une API renvoie une liste d'utilisateurs. Une base renvoie des lignes. Un fichier contient des mesures. TOUT est **tableau d'objets** : \`[{...}, {...}]\`. Aujourd'hui tu automatises les 6 gestes universels :
1. **Chercher** un élément (boucle + condition, return dès trouvé).
2. **Filtrer** un sous-ensemble (boucle + push conditionnel).
3. **Transformer** chaque élément (boucle + push du transformé).
4. **Agréger** (accumulateur : somme, compte, min/max).
5. **Trier** : \`arr.sort((a, b) => a.prix - b.prix)\` — le comparateur renvoie négatif/zéro/positif. ATTENTION : sort MUTE le tableau (copie d'abord si besoin) et sans comparateur il trie ALPHABÉTIQUEMENT même les nombres ([10, 9, 1] → [1, 10, 9] !).
6. **Regrouper** par clé (un objet accumulateur : \`groupes[cle] ??= []; groupes[cle].push(x)\`).

Aujourd'hui tu fais tout EN BOUCLES — exprès. Aux jours 23-24, tu réécriras les mêmes gestes en map/filter/reduce et tu comprendras alors ce que ces méthodes t'ÉCONOMISENT. Comprendre avant d'abstraire.

**JSON** : le format texte universel des données (\`JSON.stringify(obj)\` ↔ \`JSON.parse(texte)\`). Tes données du jour viennent d'un fichier JSON, comme dans la vraie vie (fs.readFileSync + JSON.parse).`,
    schedule: [
      "0:00-0:30 — Théorie + REPL : sort et ses pièges (nombres sans comparateur !), JSON.parse/stringify aller-retour.",
      "0:30-1:00 — Prépare le jeu de données : crée data/employes.json (12 employés : nom, service, salaire, anciennete, teletravail).",
      "1:00-2:30 — Exercice principal : les 10 requêtes.",
      "2:30-2:45 — Pause.",
      "2:45-3:30 — Suite + exercice bonus.",
      "3:30-4:00 — Quiz + auto-correction.",
      "4:00-4:30 — Commit, journal, statut.",
    ],
    exercise: `**Les 10 requêtes** (\`scripts/requetes.js\` lit \`data/employes.json\`) — chacune est une fonction nommée + son affichage :
1. Tous les employés du service "tech".
2. Ceux qui gagnent plus de 40 000 ET sont en télétravail.
3. Le premier employé avec plus de 5 ans d'ancienneté (et le cas "aucun").
4. Les noms uniquement, en un tableau de strings.
5. La masse salariale totale et le salaire moyen (arrondi).
6. Le mieux payé (l'OBJET complet, pas juste le salaire).
7. Triés par salaire décroissant (SANS modifier l'original — prouve-le).
8. Triés par service puis par nom (tri à deux critères).
9. Regroupés par service : { tech: [...], rh: [...], ... }.
10. Le salaire moyen PAR service (combine 9 et 5).
Pour CHAQUE requête : écris d'abord en une phrase ce que tu vas faire, puis code.`,
    bonus: "Requête 11 : « les 3 services qui coûtent le plus cher, avec leur coût, triés » — elle combine regroupement + agrégation + transformation en tableau + tri + découpage. C'est une vraie requête de dashboard (tu referas EXACTEMENT ça en SQL au jour 80, compare alors).",
    quiz: [
      { q: "Que donne [10, 9, 1].sort() et pourquoi ?", a: "[1, 10, 9] — sans comparateur, sort convertit en strings et trie alphabétiquement. Toujours passer (a,b) => a-b pour des nombres." },
      { q: "Comment trier sans modifier l'original ?", a: "Copier d'abord : [...arr].sort(cmp) (ou arr.toSorted(cmp) en JS récent)." },
      { q: "Le pattern du regroupement par clé, de mémoire ?", a: "const groupes = {}; pour chaque x : groupes[x.cle] ??= []; groupes[x.cle].push(x)." },
      { q: "Pourquoi JSON.parse(JSON.stringify(obj)) est-il une technique de copie (et ses limites) ?", a: "L'aller-retour texte crée une copie PROFONDE — mais perd fonctions, dates (devenues strings), undefined. OK pour des données simples." },
    ],
    deliverable: "employes.json (12 entrées réalistes), requetes.js avec les 10 fonctions et leurs sorties, commit.",
    criteria: ['10/10 requêtes correctes (vérifiées à la main sur tes données)', 'Requête 7 : l\'original prouvé intact', 'Requête 8 : le second critère départage réellement (mets 2 employés dans le même service)', 'Chaque fonction précédée de sa phrase d\'intention'],
    mistakes: ['sort qui mute et fausse les requêtes suivantes — l\'ordre d\'exécution de ton script change les résultats : symptôme classique', 'Moyenne par service : diviser par le mauvais compte (le nombre TOTAL au lieu du nombre du service)', 'Oublier le cas "aucun résultat" de la requête 3'],
    resources: ['MDN — Array.prototype.sort (lis la section comparateur en entier)', 'javascript.info — "JSON methods"'],
    aiRule: "Ces 10 gestes sont le socle de TOUT ce qui suit (SQL, pandas, API) : fais-les seul, quitte à y passer plus de temps. IA uniquement en fin de session pour comparer les approches, jamais pour produire une requête.",
    solution: {
      logic: "Chaque requête = un des 6 gestes ou une combinaison. La 10 est la plus riche : regrouper (geste 6) PUIS agréger chaque groupe (geste 4). Quand tu combines des gestes simples et nommés, la complexité reste maîtrisée — c'est toute la philosophie.",
      simple: `\`\`\`js
const fs = require("node:fs");
const employes = JSON.parse(fs.readFileSync("data/employes.json", "utf8"));

// 8. tri à deux critères : le second départage quand le premier est ex æquo
const parServicePuisNom = [...employes].sort((a, b) => {
  if (a.service !== b.service) return a.service.localeCompare(b.service);
  return a.nom.localeCompare(b.nom);
});

// 9-10. regrouper puis agréger
const parService = {};
for (const e of employes) {
  parService[e.service] ??= [];
  parService[e.service].push(e);
}
const moyenneParService = {};
for (const [service, liste] of Object.entries(parService)) {
  let somme = 0;
  for (const e of liste) somme += e.salaire;
  moyenneParService[service] = Math.round(somme / liste.length);
}
\`\`\``,
      improved: `La requête bonus, geste par geste :
\`\`\`js
const couts = [];                                   // transformation groupes → tableau
for (const [service, liste] of Object.entries(parService)) {
  let cout = 0;
  for (const e of liste) cout += e.salaire;
  couts.push({ service, cout });
}
couts.sort((a, b) => b.cout - a.cout);              // tri décroissant
const top3 = couts.slice(0, 3);                     // découpage
\`\`\`
Garde ce fichier précieusement : au jour 24 tu le réécriras en reduce, au jour 80 en SQL (GROUP BY + ORDER BY + LIMIT), au jour 130 en pandas (groupby + sort_values + head). QUATRE syntaxes, UN SEUL modèle mental — c'est ça, apprendre en profondeur.`,
      pitfalls: ['localeCompare pour les strings (gère accents) vs soustraction pour les nombres — mélanger les deux est LE bug du tri multi-critères', 'Object.entries te donne [clé, valeur] : la destructuration const [service, liste] rend la boucle lisible', '??= (assigne si null/undefined) : si tu ne le connais pas, if (!groupes[cle]) groupes[cle] = [] est équivalent'],
      checks: ['Masse salariale recalculée à la calculatrice sur tes 12 entrées', 'Tri à 2 critères : les ex æquo de service sont bien par ordre alphabétique', 'Regroupement : la somme des tailles des groupes = 12'],
      reflection: ["Ces 10 requêtes existent dans TOUS les outils de données (SQL, pandas, MongoDB, Excel). Pourquoi l'humanité réinvente-t-elle sans cesse les mêmes 6 gestes ?", "Quelle requête a été la plus dure ? C'est probablement une combinaison de gestes — laquelle ?"],
    },
  },
  {
    day: 12, title: "Lire et écrire des fichiers : tes programmes deviennent persistants",
    skill: 'jsts', difficulty: 2, hours: 4.5,
    objective: "Lire/écrire des fichiers JSON et texte avec le module fs, gérer les erreurs de fichiers proprement (try/catch), et construire un programme dont les données survivent à l'exécution.",
    concepts: ['fs.readFileSync / writeFileSync', 'JSON comme format de persistance', 'try/catch et erreurs', 'Le cycle lire→modifier→réécrire', 'Chemins et __dirname', 'Séparation données/code'],
    theory: `Jusqu'ici, tes données mouraient avec le programme. La **persistance** change tout : un programme qui se souvient devient un OUTIL.

Le module **fs** (filesystem) de Node :
- \`fs.readFileSync(chemin, "utf8")\` → le contenu en string (sans "utf8" : des octets bruts).
- \`fs.writeFileSync(chemin, contenu)\` → écrit (écrase !).
- Le cycle canonique : **lire le JSON → parser → modifier l'objet en mémoire → stringifier → réécrire**. C'est une mini base de données, et TaskFlow (projet 1) fonctionnera exactement ainsi.

**Les erreurs** : un fichier peut être absent, corrompu, interdit. \`try/catch\` :
\`\`\`js
try {
  const data = JSON.parse(fs.readFileSync(CHEMIN, "utf8"));
} catch (err) {
  if (err.code === "ENOENT") { /* fichier absent : cas NORMAL au 1er lancement */ }
  else throw err;  // le reste est un vrai bug : ne pas l'avaler !
}
\`\`\`
Règle d'or : distinguer les erreurs ATTENDUES (absent au premier lancement → on crée) des INATTENDUES (JSON corrompu → on s'arrête avec un message clair). Avaler toutes les erreurs en silence est le pire anti-pattern du débutant.

\`JSON.stringify(obj, null, 2)\` : le \`2\` indente — fichiers lisibles par un humain, diffs Git propres.`,
    schedule: [
      "0:00-0:45 — Théorie + REPL : lis un fichier existant, écris-en un, provoque ENOENT, provoque un JSON corrompu, observe les deux erreurs.",
      "0:45-1:30 — Exercice A : compteur de lancements (le cycle complet en miniature).",
      "1:30-2:45 — Exercice B : le journal de bord (l'application réelle).",
      "2:45-3:00 — Pause.",
      "3:00-3:45 — Suite B + bonus.",
      "3:45-4:15 — Quiz + auto-correction.",
      "4:15-4:30 — Commit, journal, statut.",
    ],
    exercise: `**A — Compteur de lancements** : \`scripts/compteur.js\` — à chaque exécution, affiche "Lancement n°X" et persiste le compte dans \`data/compteur.json\`. Premier lancement (fichier absent) : X=1, sans erreur affichée. Fichier corrompu (écris "banane" dedans pour tester) : message clair et exit 1, SANS écraser le fichier (l'utilisateur pourrait vouloir le récupérer).

**B — Journal de bord CLI** : \`scripts/journal.js\`, données dans \`data/journal.json\` (tableau d'entrées {id, date, texte, humeur}) :
- \`node journal.js ajouter "texte" bonne|moyenne|mauvaise\` → ajoute avec id auto-incrémenté et date du jour (new Date().toISOString()).
- \`node journal.js lister\` → toutes les entrées, formatées, plus récentes d'abord.
- \`node journal.js chercher "mot"\` → les entrées contenant le mot (insensible à la casse).
- \`node journal.js stats\` → nombre d'entrées, répartition par humeur, longueur moyenne des textes.
- Commande inconnue ou arguments manquants → usage clair, exit 1.
Utilise-le pour de VRAI : ta première entrée est le bilan de ta journée d'hier.`,
    bonus: "`node journal.js supprimer <id>` avec confirmation : affiche l'entrée et exige un second lancement `supprimer <id> --confirmer`. Réfléchis : pourquoi les CLI destructives demandent-elles confirmation, et pourquoi via un flag plutôt qu'une question interactive (indice : scripts, CI) ?",
    quiz: [
      { q: "Pourquoi passer \"utf8\" à readFileSync ?", a: "Sans encodage, Node renvoie un Buffer (octets bruts) ; avec utf8, une string exploitable directement." },
      { q: "ENOENT au premier lancement du compteur : erreur ou cas normal ?", a: "Cas normal et ATTENDU : on initialise à zéro. Le try/catch sert à distinguer ce cas des vraies erreurs." },
      { q: "Pourquoi ne PAS écraser un fichier JSON corrompu ?", a: "C'est peut-être des données précieuses mal sauvées ; les écraser détruit toute chance de récupération. On s'arrête et on informe." },
      { q: "Que fait JSON.stringify(obj, null, 2) ?", a: "Sérialise avec indentation de 2 espaces : lisible par un humain et diffable proprement dans Git." },
    ],
    deliverable: "compteur.js (3 cas gérés), journal.js complet avec au moins 3 vraies entrées dans journal.json, commit.",
    criteria: ['Premier lancement sans fichier : aucune erreur visible', 'Fichier corrompu : message utile, fichier préservé, exit 1', 'Les 4 commandes du journal fonctionnent', 'journal.json indenté et lisible', 'Ids uniques même après suppressions (réfléchis : max+1, pas length+1)'],
    mistakes: ['catch (err) {} vide : l\'anti-pattern absolu — toujours traiter ou relancer', 'id = length + 1 : supprime l\'entrée 2 sur 3, ajoute → deux entrées avec l\'id 3. Utilise max(ids)+1', 'Réécrire le fichier À CHAQUE fonction : centralise charger() et sauvegarder(), appelées une fois chacune'],
    resources: ['Node.js docs — fs (lis readFileSync, writeFileSync, existsSync)', 'javascript.info — "Error handling, try...catch"'],
    aiRule: "Le try/catch et la distinction erreurs attendues/inattendues : raisonne seul, c'est le concept du jour. Pattern autorisé : demande à l'IA de te CASSER ton journal (\"trouve 5 entrées qui font planter ce programme\") APRÈS l'avoir fini — un avant-goût des tests adverses du mois 9.",
    solution: {
      logic: "Architecture en 3 couches dans UN fichier : (1) persistance — charger()/sauvegarder() qui isolent TOUT le fs, (2) logique — ajouter/chercher/stats qui travaillent sur des tableaux en mémoire (testables sans fichiers !), (3) interface — le parsing d'argv qui route vers les fonctions. C'est le 3-tiers du mois 3 en miniature. Si demain on remplace le JSON par SQLite, SEULE la couche 1 change.",
      simple: `\`\`\`js
const fs = require("node:fs");
const CHEMIN = "data/journal.json";

function charger() {
  try {
    return JSON.parse(fs.readFileSync(CHEMIN, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return [];          // premier lancement : normal
    console.error(\`Fichier \${CHEMIN} illisible : \${err.message}\`);
    process.exit(1);                                // corrompu : on n'écrase RIEN
  }
}
function sauvegarder(entrees) {
  fs.writeFileSync(CHEMIN, JSON.stringify(entrees, null, 2));
}
function prochainId(entrees) {
  let max = 0;
  for (const e of entrees) if (e.id > max) max = e.id;
  return max + 1;
}
// interface
const [commande, ...args] = process.argv.slice(2);
const entrees = charger();
if (commande === "ajouter") {
  const [texte, humeur = "moyenne"] = args;
  if (!texte) { console.error('Usage : ajouter "texte" [humeur]'); process.exit(1); }
  entrees.push({ id: prochainId(entrees), date: new Date().toISOString(), texte, humeur });
  sauvegarder(entrees);
  console.log("Entrée ajoutée.");
} // ... lister, chercher, stats sur le même modèle
\`\`\``,
      improved: "Pour les stats, réutilise le regroupement du jour 11 (par humeur). Pour lister 'plus récentes d'abord' : les dates ISO ont la propriété magique de se trier ALPHABÉTIQUEMENT dans l'ordre chronologique — c'est exactement pourquoi ce format existe. sort((a, b) => b.date.localeCompare(a.date)) suffit.",
      pitfalls: ['writeFileSync sur data/ inexistant → ENOENT à l\'écriture ! fs.mkdirSync("data", { recursive: true }) au démarrage', 'chercher insensible à la casse : toLowerCase() des DEUX côtés', 'La destructuration const [commande, ...args] : commande undefined si aucun argument — ton usage doit le gérer'],
      checks: ['rm data/journal.json puis ajouter → fonctionne (recrée tout)', 'echo "banane" > data/journal.json puis lister → message clair, banane intact', 'Supprime une entrée du milieu à la main, ajoute : pas de doublon d\'id'],
      reflection: ["charger/sauvegarder isolent la persistance : qu'est-ce que ça permet de tester SANS toucher au disque ?", "Ton journal.json est lisible et éditable à la main : avantage ou danger ? Dans quel contexte chacun ?"],
    },
  },
  {
    day: 13, title: "Mini-projet : l'annuaire — assembler tout ce que tu sais",
    skill: 'jsts', difficulty: 3, hours: 4.5,
    objective: "Construire seul un petit programme complet (CLI annuaire de contacts persistant) en mobilisant TOUT : fonctions, objets, tableaux, fichiers, erreurs, Git. Premier exercice d'autonomie totale.",
    concepts: ['Assemblage de toutes les briques', 'Découpage d\'un projet en tâches', 'Modélisation simple', 'Validation des entrées', 'Autonomie méthodique'],
    theory: `Aujourd'hui, presque pas de théorie nouvelle : c'est un jour de SYNTHÈSE, le premier "vrai" mini-projet en autonomie. La compétence entraînée est la MÉTHODE :

1. **Lire la spec en entier** (deux fois) avant d'écrire une ligne.
2. **Découper en tâches** ordonnées (papier) : modèle de données → persistance → chaque commande → validation → polish. Chaque tâche = un commit.
3. **Commencer par le squelette qui marche** : un CLI qui répond "commande inconnue" est un meilleur point de départ qu'une fonction ajouter parfaite dans un fichier qui ne se lance pas.
4. **Tester au fur et à mesure**, pas à la fin.
5. **Committer chaque étape** avec un message propre.

C'est exactement le déroulé que tu appliqueras aux 7 projets portfolio, en plus grand. Un recruteur qui regarde l'historique Git de ce mini-projet doit voir une progression méthodique, pas un unique commit "done".

Rappel du réflexe pro : quand tu hésites entre deux modélisations, choisis, NOTE pourquoi en commentaire, avance. Une décision documentée et révisable vaut mieux qu'une heure d'hésitation.`,
    schedule: [
      "0:00-0:30 — Lis la spec 2 fois. Écris ton découpage en tâches sur papier. Prévois l'ordre des commits.",
      "0:30-1:00 — Squelette : routing des commandes + charger/sauvegarder (recycle le pattern d'hier). Commit 1.",
      "1:00-2:00 — ajouter + lister + validation. Commits 2-3.",
      "2:00-2:15 — Pause.",
      "2:15-3:15 — chercher + modifier + supprimer. Commits 4-5.",
      "3:15-3:45 — Cas limites : teste les 10 scénarios méchants de la spec. Corrige. Commit 6.",
      "3:45-4:30 — Bonus si le temps, quiz, auto-évaluation honnête, journal.",
    ],
    exercise: `**Spec de l'annuaire** (\`scripts/annuaire.js\`, données dans \`data/contacts.json\`) :
Un contact = { id, nom, email, telephone, tags: [] } (tags libres : "travail", "famille"...).
Commandes :
- \`ajouter <nom> <email> [telephone]\` — email OBLIGATOIRE et vérifié plausible (contient @ et un point après), refus des doublons d'email, téléphone optionnel.
- \`lister [tag]\` — tous les contacts (triés par nom), ou seulement ceux du tag.
- \`chercher <terme>\` — dans nom ET email, insensible à la casse.
- \`taguer <id> <tag>\` — ajoute un tag (pas de doublon de tag sur un contact).
- \`modifier <id> <champ> <valeur>\` — champ ∈ {nom, email, telephone} ; email revalidé.
- \`supprimer <id>\` — avec l'entrée affichée avant suppression.
**Les 10 scénarios méchants à tester** : email sans @ ; doublon d'email ; id inexistant (x3 commandes) ; champ inconnu dans modifier ; tag en double ; lister un tag vide ; fichier absent ; commande inconnue. CHACUN doit donner un message clair, JAMAIS une stack trace.`,
    bonus: "`exporter` → génère `data/contacts.csv` (avec l'en-tête, et les tags joints par |). Piège à découvrir : que se passe-t-il si un nom contient une virgule ? Documente le problème même si tu ne le résous pas complètement — savoir NOMMER un problème connu (CSV escaping) est déjà de la compétence.",
    quiz: [
      { q: "Pourquoi commencer par le squelette plutôt que par la première fonctionnalité ?", a: "Un squelette qui tourne donne une boucle de feedback immédiate : chaque ajout est testable en 5 secondes. Sans lui, on code à l'aveugle." },
      { q: "Pourquoi valider l'email à l'ajout ET à la modification ?", a: "Toute PORTE D'ENTRÉE d'une donnée doit valider — sinon la validation se contourne par la porte oubliée. (Même principe pour les API au mois 3.)" },
      { q: "Un commit par tâche : qu'est-ce que ça permet en cas de bug découvert le soir ?", a: "Identifier dans quel commit le bug est né (git log, git diff), et revenir en arrière chirurgicalement au lieu de tout jeter." },
      { q: "Ta validation d'email (@ + point) laisse passer 'a@b.c' : est-ce grave ?", a: "Non : la validation parfaite d'email est un problème notoire ; une heuristique simple + honnêteté sur ses limites vaut mieux qu'une regex de 200 caractères copiée sans comprendre." },
    ],
    deliverable: "annuaire.js complet, contacts.json avec 5+ vrais contacts de test, historique Git de 5-6 commits progressifs, et dans tes notes : ton découpage papier initial vs ce qui s'est vraiment passé.",
    criteria: ['Les 6 commandes fonctionnent', 'Les 10 scénarios méchants : message clair, zéro stack trace', 'Historique Git : 5+ commits qui racontent la construction', 'Auto-évaluation honnête : as-tu tenu 80% du temps sans aide ? (c\'est l\'objectif du jour)'],
    mistakes: ['Coder 2h sans jamais lancer le programme — lance après CHAQUE fonction', 'Réinventer la persistance au lieu de recycler le pattern d\'hier (la réutilisation est une compétence, pas de la triche)', 'Passer 1h sur la validation email parfaite : plausible suffit (voir quiz), le temps est ta ressource rare'],
    resources: ['Aucune nouvelle ressource : c\'est voulu. Tes fichiers des jours 8-12 SONT ta documentation. Apprendre à chercher dans son propre code est la compétence.'],
    aiRule: "Jour d'autonomie : IA interdite pendant les 3 premières heures, MÊME en cas de blocage (utilise tes fichiers précédents, ils contiennent tous les patterns). Dernière heure : autorisée uniquement pour un blocage vraiment insoluble, et note dans ton journal ce qui t'a bloqué — c'est une donnée précieuse sur toi.",
    solution: {
      logic: "Rien de nouveau techniquement : journal d'hier + requêtes du jour 11 + validation du jour 5. La solution complète est volontairement ABSENTE de correction ligne à ligne : compare plutôt ta STRUCTURE aux questions suivantes. As-tu : (1) une seule fonction charger/sauvegarder ? (2) une fonction trouverParId(contacts, id) réutilisée par taguer/modifier/supprimer (3 commandes, même besoin) ? (3) une fonction validerEmail unique appelée aux 2 portes ? (4) un routing propre des commandes ?",
      simple: `Les deux briques que beaucoup ratent :
\`\`\`js
function trouverParId(contacts, idBrut) {
  const id = Number(idBrut);
  if (Number.isNaN(id)) { console.error("L'id doit être un nombre."); process.exit(1); }
  const contact = contacts.find((c) => c.id === id);
  if (!contact) { console.error(\`Aucun contact avec l'id \${id}.\`); process.exit(1); }
  return contact;   // 3 commandes réutilisent ces 6 lignes : c'est ça, factoriser
}
function validerEmail(email) {
  const arobase = email.indexOf("@");
  return arobase > 0 && email.indexOf(".", arobase) > arobase + 1;
}
\`\`\``,
      improved: "modifier avec champ dynamique : contact[champ] = valeur (accès crochets du jour 10 !) après avoir vérifié champ dans une liste blanche : const CHAMPS = [\"nom\", \"email\", \"telephone\"]; if (!CHAMPS.includes(champ)) ... — la LISTE BLANCHE (autoriser le connu) plutôt que la liste noire (interdire le connu-mauvais) est un principe de sécurité général que tu reverras au mois 9.",
      pitfalls: ['argv et les espaces : "Jean Dupont" doit être entre guillemets au shell — documente-le dans ton usage', 'Number("") vaut 0 : un id vide devient l\'id 0 — le NaN check ne suffit pas, vérifie aussi que l\'argument existe', 'supprimer : filter crée un NOUVEAU tableau — sauvegarde bien le résultat du filter, pas l\'ancien tableau'],
      checks: ['Les 10 scénarios méchants passés UN PAR UN avec sortie notée', 'git log --oneline : l\'histoire se lit', 'Un contact ajouté, modifié, tagué, retrouvé, supprimé : cycle de vie complet vérifié'],
      reflection: ["Compare ton découpage papier du matin à la réalité : où t'es-tu trompé d'estimation ? (Garde cette trace : tu referas cet exercice avant chaque projet, et ton écart se réduira.)", "Quelles fonctions de ce projet copierais-tu telles quelles dans TaskFlow (projet 1) ? C'est le début de TA bibliothèque personnelle de patterns."],
    },
  },
  // Jour 14 = revue hebdo semaine 2 (généré automatiquement).
  {
    day: 15, title: "Big O : apprendre à mesurer le coût d'un code",
    skill: 'algo', difficulty: 3, hours: 4.5,
    objective: "Comprendre la notation Big O avec les mains ET la tête : savoir classer un code en O(1), O(log n), O(n), O(n²), et PRÉDIRE l'effet d'un doublement des données.",
    concepts: ['Pourquoi mesurer le coût', 'O(1), O(log n), O(n), O(n log n), O(n²)', 'Analyse de boucles simples et imbriquées', 'Le coût caché des méthodes (includes, indexOf)', 'Mesurer avec console.time', 'Compromis temps/mémoire'],
    theory: `Deux codes corrects peuvent différer d'un facteur 1000 en vitesse. **Big O** décrit comment le temps de calcul GRANDIT quand les données grandissent — indépendamment de la machine.

Les classes à connaître (de la meilleure à la pire) :
- **O(1)** constant : accès tableau par index, accès objet par clé. n double → temps identique.
- **O(log n)** logarithmique : recherche binaire (demain). n double → UNE opération de plus. Quasi gratuit même sur des milliards.
- **O(n)** linéaire : une boucle sur tout. n double → temps double. Honnête.
- **O(n log n)** : les bons tris. Légèrement pire que linéaire.
- **O(n²)** quadratique : boucle DANS une boucle sur les mêmes données. n double → temps ×4. À 1 million d'éléments : 1000 milliards d'opérations. Là où les programmes "gèlent".

Règles d'analyse : les boucles se MULTIPLIENT si imbriquées, s'ADDITIONNENT si successives (et on garde le pire terme : O(n² + n) = O(n²)). Les constantes s'ignorent : O(2n) = O(n) — Big O parle de CROISSANCE, pas de vitesse absolue.

**Le piège du débutant** : les méthodes cachent des boucles ! \`arr.includes(x)\` est O(n). Donc une boucle qui fait un includes = O(n²) déguisé — ton sansDoublons du jour 8, exactement. Le corriger (jour 30, avec Set) illustrera le grand compromis : ÉCHANGER de la mémoire contre du temps.

En entretien, Big O est systématique ("quelle est la complexité de ta solution ?"). En poste, c'est ce qui t'évite de livrer un code qui marche en démo et gèle en production.`,
    schedule: [
      "0:00-1:00 — Théorie lue DEUX fois + pour chaque classe, écris ton propre exemple de code (pas ceux du texte).",
      "1:00-2:00 — Exercice A : le classement des 10 extraits.",
      "2:00-2:15 — Pause.",
      "2:15-3:15 — Exercice B : le benchmark (la théorie vérifiée par l'expérience).",
      "3:15-3:45 — Bonus + quiz.",
      "3:45-4:30 — Auto-correction approfondie (chaque erreur de classement = relire la règle), commit, journal.",
    ],
    exercise: `**A — Classe ces 10 extraits** (\`notes/big-o.md\` : ta réponse + UNE phrase de justification chacune) :
1. \`arr[arr.length - 1]\`
2. Une boucle qui somme un tableau.
3. Deux boucles SUCCESSIVES sur le même tableau.
4. Boucle sur arr1 contenant \`arr2.includes(x)\`.
5. Ton sansDoublons du jour 8 (va le relire !).
6. Une boucle de i=0 à 1000 (fixe, quel que soit n).
7. \`while (n > 1) n = n / 2\`.
8. Trouver le max d'un tableau.
9. Vérifier si un tableau contient un doublon (version naïve à deux boucles).
10. \`obj[cle]\` (accès par clé).

**B — Le benchmark** (\`scripts/benchmark.js\`) : génère des tableaux aléatoires de tailles 1 000, 10 000, 100 000 ; implémente \`contientDoublonNaif\` (deux boucles, O(n²)) et \`sommeTableau\` (O(n)) ; mesure chacune sur chaque taille avec \`console.time/timeEnd\` ; tableau de résultats dans big-o.md + réponds : quand n est ×10, le temps de chaque fonction est × combien ? Est-ce conforme à la théorie ?`,
    bonus: "Estime AVANT de tester : contientDoublonNaif sur 1 000 000 d'éléments prendrait combien de temps, par extrapolation de tes mesures ? Écris ta prédiction, teste (si tu oses), commente l'écart. Extrapoler un coût SANS exécuter est exactement ce qu'on te demandera en design d'architecture (mois 10).",
    quiz: [
      { q: "Boucle imbriquée sur le même tableau : complexité et pourquoi ?", a: "O(n²) : pour chacun des n éléments, on refait n opérations → n×n." },
      { q: "O(n² + n), on simplifie en quoi ?", a: "O(n²) : à grande échelle, le terme dominant écrase l'autre (à n=1000 : 1 000 000 vs 1 000)." },
      { q: "Pourquoi arr.includes dans une boucle est-il un piège ?", a: "includes cache une boucle O(n) ; dans une boucle, ça devient O(n²) invisible à l'œil nu." },
      { q: "n passe de 10 000 à 20 000 : temps d'un algo O(n²) ?", a: "×4. Doubler n quadruple le coût quadratique — la question d'entretien la plus classique du sujet." },
    ],
    deliverable: "big-o.md : les 10 classements justifiés, le tableau de benchmark, tes conclusions théorie vs mesures. Le score honnête : X/10 au classement.",
    criteria: ['≥ 8/10 au classement (sinon : relire et refaire les ratés demain matin)', 'Benchmark exécuté sur les 3 tailles', 'Le ×100 théorique du O(n²) (quand n×10) RETROUVÉ dans tes mesures (ordre de grandeur)', 'Chaque justification tient en une phrase claire'],
    mistakes: ['Confondre "deux boucles successives" (O(n+n)=O(n)) et "imbriquées" (O(n×n)=O(n²)) — LA confusion classique', 'Croire que la boucle fixe (extrait 6) dépend de n : elle est O(1), le n ne la traverse pas', 'Benchmarker avec des tableaux triés ou constants : le meilleur cas fausse tout (doublon trouvé immédiatement) — d\'où les tableaux ALÉATOIRES'],
    resources: ['Cherche "Big O notation explained" avec des graphiques (les courbes valent mille mots)', 'frontendmasters a un cours gratuit "Complete Intro to Computer Science" — la partie Big O est excellente'],
    aiRule: "Classement : 100% seul, c'est un diagnostic de TON modèle mental (le score honnête sert à ça). APRÈS l'auto-correction, l'IA est un excellent partenaire : demande-lui 5 NOUVEAUX extraits à classer et fais-les corriger. Génère des exercices, pas des réponses.",
    solution: {
      logic: "Réponses : 1→O(1) ; 2→O(n) ; 3→O(n) (addition, pas multiplication !) ; 4→O(n×m) (deux tableaux différents : on dit n×m, pas n²) ; 5→O(n²) (boucle + includes caché) ; 6→O(1) (1000 itérations FIXES, n ne change rien) ; 7→O(log n) (on divise par 2 : c'est la signature du log) ; 8→O(n) ; 9→O(n²) ; 10→O(1).",
      simple: `\`\`\`js
function contientDoublonNaif(arr) {
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)   // j = i+1 : ne pas se comparer à soi-même
      if (arr[i] === arr[j]) return true;
  return false;
}
const tailles = [1000, 10000, 100000];
for (const n of tailles) {
  const arr = Array.from({ length: n }, () => Math.floor(Math.random() * n * 10));
  console.time(\`doublon n=\${n}\`);
  contientDoublonNaif(arr);
  console.timeEnd(\`doublon n=\${n}\`);
}
\`\`\``,
      improved: "Note le * 10 dans la génération aléatoire : avec des valeurs entre 0 et 10n, les doublons sont rares → l'algo parcourt presque tout (pire cas). Avec des valeurs entre 0 et 10, un doublon arrive dans les premières itérations (meilleur cas) et tes mesures mentiraient. CHOISIR ses données de test pour viser le pire cas est une compétence de benchmarking à part entière.",
      pitfalls: ['Extrait 3 : si tu as répondu O(n²), tu as confondu succession et imbrication — c\'est l\'erreur la plus commune et la plus importante à corriger AUJOURD\'HUI', 'Extrait 4 : O(n²) accepté si tu as précisé "si les tableaux ont des tailles comparables", mais O(n×m) est la réponse rigoureuse', 'console.time : la première mesure d\'un process Node est souvent polluée (démarrage) — lance chaque mesure 2 fois, garde la seconde'],
      checks: ['Tes mesures O(n) : n×10 → temps ≈ ×10 (à la louche)', 'Tes mesures O(n²) : n×10 → temps ≈ ×100', 'Si tes mesures contredisent la théorie : c\'est TOI qui as un bug (données, mesure) — trouve-le, c\'est le meilleur exercice du jour'],
      reflection: ["Ton benchmark du jour 20 (semaine 3) mesurera recherche linéaire vs binaire : prédis DÈS MAINTENANT le résultat avec ton vocabulaire tout neuf.", "Cite un endroit de ton annuaire (jour 13) qui deviendrait lent avec 100 000 contacts. Comment le saurais-tu AVANT tes utilisateurs ?"],
    },
  },
];
