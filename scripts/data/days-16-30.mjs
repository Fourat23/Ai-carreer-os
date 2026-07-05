// Jours 16 à 30 — contenu TRÈS détaillé (fin mois 1, début mois 2).
// Les jours 21 et 28 (revues hebdo) sont générés depuis WEEKS.

export const DAYS_16_30 = [
  {
    day: 16, title: "Recherche linéaire vs binaire : ta première vraie victoire algorithmique",
    skill: 'algo', difficulty: 3, hours: 4.5,
    objective: "Implémenter la recherche binaire correctement (bornes comprises), prouver expérimentalement sa supériorité, et comprendre le prérequis du tri.",
    concepts: ['Recherche linéaire O(n)', 'Recherche binaire O(log n)', 'Invariants de boucle', 'Le piège des bornes (low/high/mid)', 'Prérequis : données triées', 'Diviser pour régner'],
    theory: `**Recherche linéaire** : parcourir jusqu'à trouver — O(n), marche partout, aucune condition.

**Recherche binaire** : SI le tableau est TRIÉ, on regarde le milieu : trop grand ? La moitié droite est éliminée d'un coup. Trop petit ? La gauche. On recommence sur la moitié restante. À chaque étape, la zone de recherche est divisée par 2 → O(log n). Sur 1 milliard d'éléments : ~30 comparaisons au lieu d'un milliard.

L'algorithme (à comprendre, pas mémoriser) :
- Deux bornes \`low\` et \`high\` délimitent la zone où la cible PEUT être (l'« invariant » : elle n'est jamais ailleurs).
- \`mid = Math.floor((low + high) / 2)\` ; comparer arr[mid] à la cible.
- Trouvé → fini. Trop petit → \`low = mid + 1\`. Trop grand → \`high = mid - 1\`.
- \`low > high\` → la zone est vide, la cible n'existe pas.

Les +1/-1 sont VITAUX : sans eux, boucle infinie quand la zone se réduit à un élément. La recherche binaire est célèbre pour ça : un algorithme de 10 lignes que la majorité des développeurs écrit faux du premier coup. Ta mission : faire partie de la minorité, en TRAÇANT sur papier.

« Diviser pour régner » (couper le problème en deux à chaque étape) est un des grands schémas de pensée algorithmique — tu le retrouveras dans les bons tris et les arbres (semaine 6).`,
    schedule: [
      "0:00-0:45 — Théorie + trace PAPIER : cherche 7 dans [1,3,5,7,9,11,13] en notant low/mid/high à chaque étape. Puis cherche 8 (absent).",
      "0:45-1:45 — Implémente rechercheLineaire puis rechercheBinaire. Teste sur tes traces papier.",
      "1:45-2:00 — Pause.",
      "2:00-3:00 — La batterie de tests limites (exercice A) — c'est là que les bugs sortent.",
      "3:00-3:45 — Benchmark comparatif (exercice B).",
      "3:45-4:30 — Bonus, quiz, auto-correction, commit, journal.",
    ],
    exercise: `**A — Implémentation + batterie limite** (\`scripts/recherche.js\`) :
\`rechercheLineaire(arr, cible)\` et \`rechercheBinaire(arrTrie, cible)\` — les deux renvoient l'INDEX ou -1.
Batterie obligatoire (écris chaque résultat attendu AVANT d'exécuter) :
tableau vide ; un seul élément (présent / absent) ; cible = premier élément ; cible = dernier ; cible absente mais DANS la plage (ex: 8 dans [1..13]) ; cible plus petite que tout ; plus grande que tout ; tableau à 2 éléments (4 cas).

**B — Le duel** (\`scripts/duel-recherche.js\`) : tableau trié de 10 millions d'entiers (génère [0, 2, 4, 6...] — pourquoi des pairs ? Pour pouvoir chercher des IMPAIRS : cibles absentes, pire cas). Mesure 1 000 recherches aléatoires avec chaque méthode. Rapporte : temps total, et le ratio. Relie au log : log2(10 000 000) ≈ 23 comparaisons max par recherche binaire.`,
    bonus: "`rechercheBinaireRecursive(arr, cible, low, high)` : la même en récursif (avant-goût du jour 25). Puis : que renvoie ta version si le tableau N'EST PAS trié ? Teste. Moralité sur les préconditions : qui doit vérifier, l'appelant ou la fonction ? (Il n'y a pas de réponse unique — écris les deux options et leur coût.)",
    quiz: [
      { q: "Pourquoi low = mid + 1 et pas low = mid ?", a: "arr[mid] vient d'être testé et éliminé ; le garder dans la zone crée une boucle infinie quand low et high se touchent." },
      { q: "Combien de comparaisons max pour 1 milliard d'éléments triés ?", a: "log2(10⁹) ≈ 30. C'est la magie du log : diviser par 2 à chaque coup écrase n'importe quel n." },
      { q: "La recherche binaire sur un tableau non trié renvoie quoi ?", a: "N'importe quoi (parfois juste par chance) — la précondition 'trié' est ce qui rend l'élimination de moitiés VALIDE." },
      { q: "Quand préférer la linéaire malgré tout ?", a: "Données non triées qu'on ne cherche qu'une fois (trier coûte O(n log n) > une recherche O(n)), ou tableaux minuscules." },
    ],
    deliverable: "recherche.js avec la batterie complète et ses résultats en commentaires, duel-recherche.js et ses mesures dans notes/big-o.md (à la suite d'hier), commit.",
    criteria: ['La batterie limite passe à 100% (les 12 cas)', 'Ta trace papier correspond à l\'exécution réelle (ajoute des console.log temporaires pour vérifier)', 'Le duel montre un ratio conforme (des milliers de fois plus rapide)', 'Tu peux réciter l\'invariant : "la cible, si elle existe, est toujours entre low et high"'],
    mistakes: ['while (low < high) au lieu de low <= high : rate les zones à 1 élément — LE bug classique', '(low + high) / 2 sans Math.floor : mid fractionnaire, arr[3.5] = undefined', 'Benchmarker avec des cibles PRÉSENTES seulement : la linéaire s\'arrête tôt en moyenne, ton duel sous-estime l\'écart'],
    resources: ['Visualisation : cherche "binary search visualization" (voir les bornes bouger aide énormément)', 'khanacademy — "Binary search" (gratuit, avec exercices)'],
    aiRule: "INTERDICTION de regarder une implémentation avant d'avoir fait ta trace papier ET une tentative complète. La recherche binaire est un exercice d'entretien : tu dois pouvoir l'écrire de mémoire au jour 20, puis au mois 12. Si tu la copies aujourd'hui, tu la copieras toujours.",
    solution: {
      logic: "Tout tient dans l'invariant : « si la cible existe, elle est dans [low, high] ». Chaque branche du if doit PRÉSERVER cet invariant en rétrécissant la zone. La condition d'arrêt low > high signifie « zone vide, donc absente ». Quand tu doutes d'un +1, demande : « arr[mid] peut-il encore contenir la cible ? » Non (testé) → exclure mid.",
      simple: `\`\`\`js
function rechercheBinaire(arr, cible) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {                       // <= : une zone d'UN élément est valide
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === cible) return mid;
    if (arr[mid] < cible) low = mid + 1;      // mid testé → exclu
    else high = mid - 1;
  }
  return -1;                                  // zone vide : absent
}
\`\`\``,
      improved: `Version récursive (bonus) — même logique, la boucle devient des appels :
\`\`\`js
function rechercheBinaireRec(arr, cible, low = 0, high = arr.length - 1) {
  if (low > high) return -1;                  // cas de base : zone vide
  const mid = Math.floor((low + high) / 2);
  if (arr[mid] === cible) return mid;
  return arr[mid] < cible
    ? rechercheBinaireRec(arr, cible, mid + 1, high)
    : rechercheBinaireRec(arr, cible, low, mid - 1);
}
\`\`\`
Compare : la version itérative est préférée en production JS (pas de limite de stack), la récursive exprime plus directement « diviser pour régner ». Savoir écrire LES DEUX et argumenter, c'est le niveau attendu en entretien.`,
      pitfalls: ['Le tableau à 2 éléments est le meilleur détecteur de bug de bornes : [5,7] cherche 5, 7, 4, 8 — les 4 cas', 'Sur d\'immenses tableaux dans d\'autres langages, low+high peut déborder (overflow) — en JS pas de souci avant 2^53, mais la question tombe en entretien : mid = low + Math.floor((high-low)/2)', 'Ta batterie doit tester l\'INDEX exact retourné, pas juste "trouvé/pas trouvé"'],
      checks: ['Les 12 cas de la batterie : résultats notés avant, vérifiés après', 'Duel : ratio > 1000x sur 10M d\'éléments', 'La version cassée (low = mid) boucle-t-elle vraiment ? Teste 30 secondes pour VOIR le bug de tes yeux'],
      reflection: ["L'invariant t'a servi de fil rouge : où as-tu déjà utilisé ce genre de raisonnement sans le nommer (pense aux bornes pv/pvMax du jour 10) ?", "Git bisect retrouve un commit fautif par recherche binaire dans l'historique : explique comment, en 3 phrases."],
    },
  },
  {
    day: 17, title: "Les tris simples : comprendre le coût en le payant soi-même",
    skill: 'algo', difficulty: 3, hours: 4.5,
    objective: "Implémenter tri à bulles et tri par insertion, comprendre pourquoi ils sont O(n²), et savoir quand le sort natif (O(n log n)) les écrase — et pourquoi on les apprend quand même.",
    concepts: ['Tri à bulles', 'Tri par insertion', 'Comparaisons et échanges', 'Stabilité d\'un tri', 'O(n²) vs O(n log n)', 'Le sort natif et son comparateur'],
    theory: `Pourquoi implémenter des tris que tu n'utiliseras jamais en production (le sort natif est meilleur) ? Trois raisons : (1) c'est LE terrain d'entraînement classique du raisonnement algorithmique (boucles imbriquées, invariants, analyse de coût), (2) les questions d'entretien adorent, (3) comprendre ce que le sort natif te fait GAGNER donne le respect des bons outils.

**Tri à bulles** : parcourir en échangeant chaque paire mal ordonnée ; répéter jusqu'à un parcours sans échange. Les grandes valeurs « remontent » comme des bulles. Simple, O(n²), essentiellement pédagogique.

**Tri par insertion** : comme trier des cartes en main — chaque nouvel élément est INSÉRÉ à sa place dans la partie déjà triée (à gauche). O(n²) au pire, MAIS O(n) sur un tableau déjà presque trié — c'est pour ça qu'il survit en pratique (les vrais moteurs de tri l'utilisent sur les petits segments).

**Stabilité** : un tri est stable si deux éléments ÉGAUX gardent leur ordre relatif. Crucial pour les tris successifs (trier par nom PUIS par service : si le tri par service est stable, l'ordre par nom survit à l'intérieur de chaque service — c'est ton tri à 2 critères du jour 11, vu autrement).

Le sort natif de JS : O(n log n), stable (garanti depuis ES2019). Ta règle de vie : sort natif TOUJOURS en production, tris manuels pour apprendre et pour les entretiens.`,
    schedule: [
      "0:00-0:45 — Théorie + simulation PAPIER : trie [5,2,9,1,7] à bulles (note chaque échange) puis par insertion (note chaque insertion).",
      "0:45-2:00 — Implémente les deux tris + les compteurs d'opérations (exercice A).",
      "2:00-2:15 — Pause.",
      "2:15-3:15 — Exercice B : l'expérience « presque trié ».",
      "3:15-3:45 — Bonus + quiz.",
      "3:45-4:30 — Auto-correction, commit, journal.",
    ],
    exercise: `**A — Les deux tris instrumentés** (\`scripts/tris.js\`) :
\`triBulles(arr)\` et \`triInsertion(arr)\` — chacun retourne \`{ resultat, comparaisons, echanges }\` (compteurs incrémentés à CHAQUE comparaison/échange) et ne modifie PAS l'entrée. Vérifie contre \`[...arr].sort((a,b)=>a-b)\` sur 20 tableaux aléatoires (un mini-testeur automatique : génère, trie avec les deux, compare avec JSON.stringify).

**B — L'expérience « presque trié »** : mesure les compteurs des deux tris sur : (1) un tableau aléatoire de 2000 éléments, (2) le même DÉJÀ trié, (3) le même trié puis 10 éléments échangés au hasard, (4) le même trié à l'envers (pire cas). Tableau de résultats + 5 lignes de conclusions : quel tri profite du désordre faible, et pourquoi ?`,
    bonus: "Optimise le tri à bulles : (1) arrêt anticipé si un parcours ne fait aucun échange, (2) réduire la zone parcourue (les k derniers éléments sont déjà en place après k parcours). Mesure le gain sur tes 4 scénarios. Le gain change-t-il la CLASSE O(n²) ? (Non — comprends bien pourquoi : les constantes s'améliorent, la croissance reste quadratique.)",
    quiz: [
      { q: "Pourquoi le tri par insertion est-il rapide sur un tableau presque trié ?", a: "Chaque élément est déjà (presque) à sa place : la boucle interne s'arrête immédiatement → proche de O(n)." },
      { q: "Qu'est-ce qu'un tri stable et un cas où ça compte ?", a: "Les égaux gardent leur ordre relatif. Tris successifs : trier par nom puis (stable) par service = groupes de service triés par nom à l'intérieur." },
      { q: "Ton tri à bulles optimisé reste O(n²) : pourquoi ?", a: "Les optimisations réduisent les constantes, pas la croissance : sur un tableau aléatoire, le nombre d'opérations reste proportionnel à n². Big O ignore les constantes." },
      { q: "Que garantit le sort natif de JS moderne ?", a: "O(n log n), stable, et il mute le tableau (copier avant si besoin). Comparateur obligatoire pour les nombres." },
    ],
    deliverable: "tris.js avec le mini-testeur (20 tableaux) et les compteurs, le tableau de l'expérience B dans notes/big-o.md, commit.",
    criteria: ['Les deux tris passent le testeur automatique 20/20', 'Les compteurs racontent l\'histoire attendue (insertion « presque trié » ≈ n comparaisons)', 'Entrées non modifiées (vérifié)', 'Conclusions écrites reliant mesures et théorie'],
    mistakes: ['Boucle interne de l\'insertion : décaler les éléments vers la droite PUIS poser — beaucoup écrasent une valeur avant de l\'avoir déplacée (trace papier obligatoire au premier bug)', 'Oublier de copier l\'entrée ([...arr]) : tes tris successifs de l\'expérience B travaillent alors sur du déjà-trié sans le savoir — résultats absurdes', 'Compter les échanges dans la comparaison (ou l\'inverse) : place les compteurs EXACTEMENT sur l\'opération'],
    resources: ['visualgo.net — visualisation animée des tris (règle la vitesse au minimum et PRÉDIS chaque étape)', 'Ton benchmark du jour 15 : même méthode, nouveaux algos'],
    aiRule: "Trace papier d'abord, code ensuite, IA jamais pendant. Ces deux tris sont un rite de passage : les avoir VRAIMENT écrits soi-même (avec les bugs et les traces) est ce qui les grave. Après auto-correction : demande à l'IA de te faire trier [4,2,4,1] à la main par insertion pour vérifier ta compréhension de la stabilité.",
    solution: {
      logic: "Insertion : l'invariant est « à l'entrée de l'itération i, arr[0..i-1] est trié ». On prend arr[i], on décale vers la droite tous les éléments triés qui lui sont supérieurs, on le pose dans le trou. Bulles : l'invariant est « après k parcours, les k plus grands sont à leur place finale à droite ».",
      simple: `\`\`\`js
function triInsertion(entree) {
  const arr = [...entree];
  let comparaisons = 0, echanges = 0;
  for (let i = 1; i < arr.length; i++) {
    const valeur = arr[i];
    let j = i - 1;
    while (j >= 0 && (comparaisons++, arr[j] > valeur)) {
      arr[j + 1] = arr[j];                    // décalage vers la droite
      echanges++;
      j--;
    }
    arr[j + 1] = valeur;                      // insertion dans le trou
  }
  return { resultat: arr, comparaisons, echanges };
}
\`\`\``,
      improved: `Le mini-testeur — ta première suite de tests automatisée digne de ce nom :
\`\`\`js
function testerTri(fnTri, nbTests = 20) {
  for (let t = 0; t < nbTests; t++) {
    const arr = Array.from({ length: 50 }, () => Math.floor(Math.random() * 100));
    const attendu = [...arr].sort((a, b) => a - b);
    const obtenu = fnTri(arr).resultat;
    if (JSON.stringify(obtenu) !== JSON.stringify(attendu)) {
      console.error("ÉCHEC sur :", arr);
      return false;
    }
  }
  console.log("20/20 ✓");
  return true;
}
\`\`\`
Le principe (comparer à une référence fiable sur des entrées aléatoires) s'appelle le test par oracle — tu le réutiliseras pour valider des optimisations toute ta carrière.`,
      pitfalls: ['(comparaisons++, arr[j] > valeur) : l\'opérateur virgule permet de compter DANS la condition — si c\'est illisible pour toi, compte dans le corps de boucle avec une structure légèrement différente, la lisibilité prime', 'Expérience B scénario 2 : si l\'insertion ne montre PAS ~n comparaisons sur du trié, ton compteur ou ta boucle a un bug', 'Le pire cas de l\'insertion est le tableau inversé : chaque élément traverse TOUT le trié — vérifie que tes chiffres explosent bien là'],
      checks: ['Testeur : 20/20 pour les deux tris', 'Insertion sur trié : comparaisons ≈ n-1, échanges = 0', 'Bulles avec arrêt anticipé sur trié : UN parcours seulement'],
      reflection: ["L'invariant de l'insertion (« la gauche est toujours triée ») ressemble à celui de la recherche binaire d'hier : formule ce que ces raisonnements ont en commun (une propriété VRAIE à chaque itération qui GARANTIT le résultat final).", "Le test par oracle exige une référence fiable : que fais-tu quand il n'y en a pas (indice : propriétés — un tableau trié a chaque élément ≤ au suivant) ?"],
    },
  },
  {
    day: 18, title: "Git branches et merges : travailler comme une équipe (même seul)",
    skill: 'gitlinux', difficulty: 2, hours: 4.5,
    objective: "Créer, fusionner et supprimer des branches ; provoquer et résoudre un conflit de merge en confiance ; adopter le workflow branche-par-fonctionnalité pour tous tes projets.",
    concepts: ['branch, checkout/switch', 'merge (fast-forward vs vrai merge)', 'Conflits : anatomie et résolution', 'Workflow feature branch', 'log --graph', 'stash (dépannage)'],
    theory: `Une **branche** est une ligne d'historique parallèle. La réalité physique est simple : une branche n'est qu'une ÉTIQUETTE mobile qui pointe sur un commit — créer une branche est instantané et gratuit.

Le workflow **feature branch** (standard mondial, même en solo) :
1. \`git switch -c feat/recherche\` : nouvelle branche pour la fonctionnalité.
2. Commits sur la branche — main reste STABLE et démontrable à tout moment.
3. Fini et testé ? \`git switch main\` puis \`git merge feat/recherche\`.
4. \`git branch -d feat/recherche\` : l'étiquette disparaît, les commits restent.

**Deux types de merge** : si main n'a pas bougé, Git avance juste l'étiquette (*fast-forward*, pas de commit de merge). Si main a AUSSI avancé, Git crée un commit de fusion à deux parents.

**Le conflit** : si les deux branches ont modifié LES MÊMES LIGNES, Git ne peut pas décider seul. Il marque le fichier :
\`\`\`
<<<<<<< HEAD
version de main
=======
version de ta branche
>>>>>>> feat/x
\`\`\`
Résoudre = ÉDITER le fichier pour garder la bonne version (ou un mélange), retirer les marqueurs, \`git add\`, \`git commit\`. Un conflit n'est PAS une erreur : c'est Git qui te pose une question légitime. La peur du conflit disparaît en en résolvant dix — c'est le programme du jour.`,
    schedule: [
      "0:00-0:45 — Théorie + premier cycle branche→commits→merge fast-forward sur ia-lab.",
      "0:45-1:45 — Exercice A : le triple scénario de merge.",
      "1:45-2:00 — Pause.",
      "2:00-3:15 — Exercice B : l'usine à conflits (5 conflits provoqués et résolus).",
      "3:15-3:45 — Bonus + quiz.",
      "3:45-4:30 — Adopte officiellement le workflow : note tes règles dans notes/git-workflow.md, commit, journal.",
    ],
    exercise: `**A — Triple scénario** (dans ia-lab) :
1. *Fast-forward* : branche \`feat/readme-badges\`, 2 commits (améliore ton README), merge dans main. Observe : \`git log --oneline --graph\` — ligne DROITE, pas de commit de merge.
2. *Vrai merge* : branche \`feat/aide\` (ajoute une commande d'aide à ton annuaire) ; AVANT de merger, retourne sur main et fais un commit (corrige une typo ailleurs) ; merge. Observe le graphe : un LOSANGE et un commit de fusion.
3. *Abandon* : branche \`experiment/idee-bizarre\`, 1 commit, puis décide que c'était nul : supprime la branche SANS merger (-D). Vérifie que main est intact.

**B — L'usine à conflits** : crée \`conflits.md\` avec 5 lignes numérotées, commite sur main. Puis 5 rounds : à chaque round, branche + modifie la ligne N + retour sur main + modifie la MÊME ligne différemment + merge + résous. Round 1-2 : garde la version de main. Round 3 : garde la branche. Round 4 : fusionne les deux idées en une nouvelle ligne. Round 5 : conflit sur DEUX lignes à la fois. Après chaque résolution : \`git log --graph\` pour ancrer la représentation.`,
    bonus: "Explore `git stash` : commence une modification, `stash` pour la mettre de côté, change de branche, reviens, `stash pop`. Dans quel scénario réel est-ce vital (indice : « urgence sur main pendant que je bosse sur une feature ») ? Note-le dans git-workflow.md.",
    quiz: [
      { q: "Qu'est-ce qu'une branche, physiquement ?", a: "Une simple étiquette (référence) qui pointe vers un commit et avance à chaque nouveau commit. Créer une branche ne copie rien." },
      { q: "Fast-forward vs vrai merge ?", a: "FF : main n'a pas bougé, Git avance l'étiquette (historique linéaire). Vrai merge : les deux ont avancé, Git crée un commit de fusion à 2 parents." },
      { q: "Que signifient les marqueurs <<<<<<< ======= >>>>>>> ?", a: "La zone en conflit : entre <<< et === la version de la branche courante (HEAD), entre === et >>> celle de la branche mergée. On édite, on retire les marqueurs, add + commit." },
      { q: "Pourquoi des branches même en solo ?", a: "main reste toujours stable/démontrable ; on peut abandonner une idée sans dégât ; l'historique par fonctionnalité se relit ; et c'est le réflexe attendu en entreprise dès le jour 1." },
    ],
    deliverable: "L'historique ia-lab montrant les 3 scénarios + 5 conflits résolus (git log --graph en atteste), notes/git-workflow.md avec TES règles (5 minimum), push.",
    criteria: ['Le graphe montre au moins un FF et un losange', '5/5 conflits résolus sans panique ni fichier cassé (le programme marche après chaque merge)', 'Aucun marqueur <<<<<<< oublié dans un fichier commité (git grep "<<<<<<<" pour vérifier)', 'git-workflow.md écrit avec tes mots'],
    mistakes: ['Committer les marqueurs de conflit — le classique absolu ; toujours relire le fichier ET relancer le programme avant le commit de résolution', 'Résoudre en gardant « les deux versions » par flemme de choisir : un conflit est une QUESTION, réponds-y vraiment', 'Nommer les branches "test", "truc", "branche2" : adopte un préfixe (feat/, fix/, experiment/) dès aujourd\'hui'],
    resources: ['learngitbranching.js.org — fais les niveaux "branches" et "merge" (interactif, parfait pour aujourd\'hui)', 'git-scm.com/book — chapitre 3 (Branching), en français'],
    aiRule: "Aucune IA pour résoudre les conflits : le but est précisément d'apprivoiser la friction. git status et le contenu du fichier disent TOUT ce qu'il faut savoir. En fin de journée, tu peux demander à l'IA des scénarios de conflit plus tordus à te fabriquer.",
    solution: {
      logic: "Le point conceptuel : un conflit n'implique aucune perte — les DEUX versions sont dans l'historique, le fichier de travail montre juste la question posée. Tu peux toujours annuler une résolution ratée (git merge --abort pendant, git revert après). Une fois ça intégré, la peur disparaît : le pire cas est « je recommence le merge ».",
      simple: `Le déroulé type d'un round de l'usine :
\`\`\`bash
git switch -c feat/ligne3
# éditer la ligne 3 → "version branche"
git commit -am "Modifie la ligne 3 (version branche)"
git switch main
# éditer la ligne 3 → "version main"
git commit -am "Modifie la ligne 3 (version main)"
git merge feat/ligne3        # CONFLICT!
git status                   # « both modified: conflits.md » — tout est dit
# éditer conflits.md : choisir, retirer les marqueurs
git add conflits.md
git commit                   # message de merge proposé par défaut : OK
git log --oneline --graph    # ancrer la forme du losange
git branch -d feat/ligne3
\`\`\``,
      improved: "En cas de doute PENDANT un merge : git merge --abort ramène à l'état d'avant, proprement. Connaître la sortie de secours AVANT d'entrer est ce qui permet d'expérimenter sereinement — c'est un principe général (transactions SQL au mois 5, feature flags plus tard).",
      pitfalls: ['git switch échoue si des modifications non commitées seraient écrasées : c\'est une PROTECTION — commite ou stash, ne force pas', 'Le scénario 3 : -d refuse de supprimer une branche non mergée, -D force — comprends pourquoi cette double sécurité existe', 'commit -am ne stage que les fichiers DÉJÀ suivis : un nouveau fichier exige toujours git add'],
      checks: ['git grep "<<<<<<<" ne renvoie rien', 'git log --graph : tu peux pointer du doigt chaque FF, chaque losange, et raconter ce qui s\'est passé', 'Ton annuaire fonctionne toujours (les merges n\'ont rien cassé)'],
      reflection: ["À partir de quel moment un conflit devient-il PROBABLE ? (Deux modifications proches dans le temps sur la même zone.) Qu'est-ce que ça implique sur la taille des branches et la fréquence des merges ?", "Ton futur projet 1 : quelles branches prévois-tu ? Écris leur liste dans git-workflow.md."],
    },
  },
  {
    day: 19, title: "La méthode de résolution de problèmes : ton algorithme pour créer des algorithmes",
    skill: 'algo', difficulty: 3, hours: 4.5,
    objective: "Acquérir LA méthode en 6 étapes (comprendre → exemples → décomposer → pseudo-code → coder → vérifier) et l'appliquer à 3 problèmes de difficulté croissante, chronométré.",
    concepts: ['Reformulation d\'énoncé', 'Exemples et cas limites AVANT de coder', 'Décomposition', 'Pseudo-code', 'Trace d\'exécution manuelle', 'La méthode comme protection anti-panique'],
    theory: `Face à un problème nouveau, le débutant code immédiatement et s'enlise. Le professionnel déroule une MÉTHODE. La voici — elle est le vrai sujet des entretiens d'algo (le recruteur évalue ta démarche plus que ta solution) :

1. **COMPRENDRE** : reformule l'énoncé avec tes mots. Entrées ? Sorties ? Que fait-on des cas dégénérés (vide, null, négatif) ? Si tu ne peux pas reformuler, tu ne peux pas coder.
2. **EXEMPLES** : fabrique 3 exemples entrée→sortie À LA MAIN, dont un cas limite. C'est en les calculant à la main que ton cerveau DÉCOUVRE l'algorithme.
3. **DÉCOMPOSER** : quelles étapes ? Quelles sous-fonctions ? Chaque morceau doit être trivial ou déjà connu.
4. **PSEUDO-CODE** : écris la logique en français structuré, SANS syntaxe. Le pseudo-code se corrige en 10 secondes, le code en 10 minutes.
5. **CODER** : traduis. Si une ligne de pseudo-code devient 15 lignes de code, retourne à l'étape 3.
6. **VÉRIFIER** : déroule ton code À LA MAIN sur tes exemples de l'étape 2, ligne par ligne, en notant les variables. PUIS exécute.

En entretien, dérouler ces étapes À VOIX HAUTE est exactement ce qu'on attend (« walk me through your thinking »). La méthode est aussi ton antidote au stress : quand tu paniques, tu sais toujours quelle est la prochaine petite étape.`,
    schedule: [
      "0:00-0:30 — Théorie + affiche la méthode sur un post-it (vraiment : elle doit être devant toi jusqu'à devenir un réflexe).",
      "0:30-1:30 — Problème 1 (échauffement) avec la méthode COMPLÈTE, sans sauter d'étape, même si ça semble lent.",
      "1:30-2:30 — Problème 2 (le plat principal), méthode complète, chronométré.",
      "2:30-2:45 — Pause.",
      "2:45-3:45 — Problème 3 (le défi), méthode complète.",
      "3:45-4:30 — Quiz, auto-correction (compare surtout tes PSEUDO-CODES aux solutions), commit, journal.",
    ],
    exercise: `Pour CHAQUE problème, tu rends : la reformulation, 3 exemples à la main, le pseudo-code, le code, la trace manuelle. Le tout dans \`scripts/methode/\` (un fichier .md + un .js par problème).

**P1 — César** : \`chiffrer(texte, decalage)\` — décale chaque lettre de N positions dans l'alphabet ("abc", 2 → "cde"), en bouclant après z, en préservant majuscules/espaces/ponctuation. Et \`dechiffrer\`.

**P2 — Le rendu de monnaie** : \`rendreMonnaie(montantDu, montantPaye)\` — renvoie le rendu en pièces/billets [50, 20, 10, 5, 2, 1] sous forme { billet: quantité }, en minimisant le nombre de pièces (approche gourmande : toujours la plus grosse coupure possible). Gère : paiement insuffisant, rendu nul.

**P3 — La plage la plus chaude** : \`meilleurePeriode(temperatures, k)\` — dans un tableau de températures journalières, trouve l'index de début de la période de k jours CONSÉCUTIFS la plus chaude (somme maximale). Version naïve O(n×k) d'abord ; PUIS améliore en O(n) avec la fenêtre glissante (indice : en avançant d'un jour, la somme perd le premier élément et gagne le suivant — inutile de tout resommer).`,
    bonus: "P3 en O(n) : gère les égalités (renvoyer le premier index), k > longueur du tableau, k = 0. Puis explique par écrit pourquoi la fenêtre glissante généralise (moyennes mobiles en finance, lissage de courbes, débit réseau). Ce pattern reviendra dans le traitement de données du mois 5.",
    quiz: [
      { q: "Pourquoi fabriquer les exemples AVANT de coder ?", a: "Les calculer à la main force ton cerveau à découvrir l'algorithme, et ils deviennent tes tests de l'étape 6. Coder d'abord, c'est naviguer sans carte." },
      { q: "Quel est le signe qu'il faut retourner du code au pseudo-code ?", a: "Une ligne de pseudo-code qui explose en 15 lignes de code : la décomposition était trop grossière." },
      { q: "L'approche gourmande du rendu de monnaie est-elle toujours optimale ?", a: "Avec [50,20,10,5,2,1] oui, mais PAS avec n'importe quel système (ex: pièces [1,3,4] pour rendre 6 : gourmand donne 4+1+1, optimal 3+3). À savoir : gourmand = simple mais à valider." },
      { q: "Que gagne la fenêtre glissante par rapport au recalcul naïf ?", a: "O(n) au lieu de O(n×k) : chaque pas met à jour la somme en 2 opérations (retirer l'entrant, ajouter le sortant) au lieu de resommer k éléments." },
    ],
    deliverable: "Les 3 dossiers complets (reformulation, exemples, pseudo-code, code, trace), temps notés par problème, commit.",
    criteria: ['Méthode COMPLÈTE déroulée 3 fois (aucune étape sautée, même sur César)', 'P2 : les cas limites gérés (insuffisant, nul)', 'P3 : les deux versions, et la O(n) validée contre la naïve (test par oracle du jour 17 !)', 'Les traces manuelles correspondent aux exécutions'],
    mistakes: ['Sauter le pseudo-code parce que « je vois la solution » — c\'est exactement quand on croit voir qu\'on tombe dans les pièges (César : le bouclage après z, l\'as-tu VU d\'avance ?)', 'César avec les codes ASCII sans gérer le débordement au-delà de "z" : le modulo est la clé, trace "z"+2 à la main', 'P3 naïve avec resommation : boucle j de i à i+k-1 — l\'erreur off-by-one sur la borne est quasi garantie sans exemple à la main'],
    resources: ['Le livre "Think Like a Programmer" (V. Anton Spraul) si tu veux prolonger — mais la pratique d\'aujourd\'hui vaut tous les livres', 'À partir d\'aujourd\'hui : 1 kata par jour sur codewars.com (niveau 8kyu puis 7kyu), AVEC la méthode, 20 min max'],
    aiRule: "Méthode entière SEUL sur les 3 problèmes — c'est non négociable, c'est le muscle du jour. Après auto-correction, usage IA vertueux : donne-lui ton pseudo-code RATÉ et demande « où mon raisonnement dérape-t-il ? » (analyse de démarche, pas production de solution).",
    solution: {
      logic: "P2 (le plus riche pédagogiquement) : le pseudo-code attendu ≈ « rendu = payé - dû ; si négatif → erreur ; pour chaque coupure de la plus grosse à la plus petite : quantité = rendu divisé entièrement par la coupure ; si > 0, l'enregistrer ; rendu = le reste ; à la fin, rendu vaut 0 ». Deux idées clés : parcourir les coupures TRIÉES décroissantes, et la paire division entière / modulo.",
      simple: `\`\`\`js
function rendreMonnaie(montantDu, montantPaye) {
  if (montantPaye < montantDu) return { erreur: "Paiement insuffisant" };
  let reste = montantPaye - montantDu;
  const COUPURES = [50, 20, 10, 5, 2, 1];
  const rendu = {};
  for (const coupure of COUPURES) {
    const quantite = Math.floor(reste / coupure);
    if (quantite > 0) { rendu[coupure] = quantite; reste = reste % coupure; }
  }
  return rendu;   // {} si rendu nul : un objet vide EST la bonne réponse
}
\`\`\`
P3 fenêtre glissante :
\`\`\`js
function meilleurePeriode(temp, k) {
  if (k <= 0 || k > temp.length) return -1;
  let somme = 0;
  for (let i = 0; i < k; i++) somme += temp[i];   // première fenêtre
  let meilleureSomme = somme, meilleurIndex = 0;
  for (let i = k; i < temp.length; i++) {
    somme += temp[i] - temp[i - k];               // glisse : +entrant -sortant
    if (somme > meilleureSomme) { meilleureSomme = somme; meilleurIndex = i - k + 1; }
  }
  return meilleurIndex;
}
\`\`\``,
      improved: "César élégant : construis l'alphabet une fois (\"abcdefghijklmnopqrstuvwxyz\"), et pour chaque caractère : index dans l'alphabet ; si -1 (espace, ponctuation) → inchangé ; sinon alphabet[(index + decalage) % 26]. Les majuscules : détecte, traite en minuscule, re-capitalise. Le modulo gère le bouclage ET les décalages négatifs si tu ajoutes 26 : ((i + d) % 26 + 26) % 26 — le « modulo positif », astuce à connaître.",
      pitfalls: ['P2 : renvoyer { erreur } d\'un côté et { 20: 2 } de l\'autre = deux FORMES de retour différentes — le défaut signalé au jour 9 ; une meilleure API lancerait une exception ou renverrait null : note cette critique de la solution elle-même', 'P3 : meilleurIndex = i - k + 1, pas i — dessine la fenêtre pour t\'en convaincre', 'dechiffrer(texte, d) === chiffrer(texte, -d) SI ton modulo gère les négatifs — le test parfait de ton César'],
      checks: ['César : chiffrer puis déchiffrer redonne le texte EXACT (ponctuation comprise) sur 3 phrases', 'P2 : rendreMonnaie(37, 100) → {50:1, 10:1, 2:1, 1:1} — vérifie à la main', 'P3 : la O(n) et la naïve d\'accord sur 20 tableaux aléatoires (oracle)'],
      reflection: ["Sur quel problème as-tu été tenté de sauter des étapes ? Que s'est-il passé ? (Si tout s'est bien passé en sautant : tu ne le sauras qu'au premier problème VRAIMENT dur — la méthode est une assurance.)", "La fenêtre glissante transforme un recalcul en mise à jour incrémentale : trouve un autre endroit du programme où cette idée s'appliquera (indice : les stats de ton dashboard au mois 5, les agrégats SQL)."],
    },
  },
  {
    day: 20, title: "Journée katas : consolider sous chrono",
    skill: 'algo', difficulty: 3, hours: 4.5,
    objective: "Enchaîner 8 katas chronométrés couvrant les 3 semaines (boucles, tableaux, objets, méthode), de mémoire et sans aide — le premier vrai test de ce qui est ANCRÉ vs ce qui est seulement « vu ».",
    concepts: ['Rappel actif (la technique d\'apprentissage n°1)', 'Gestion du temps sous contrainte', 'Auto-diagnostic des lacunes', 'Ré-implémentation de mémoire'],
    theory: `Aujourd'hui, pas de nouveau concept : une **séance d'entraînement**. La science de l'apprentissage est sans appel : le **rappel actif** (produire de mémoire) ancre 5 à 10 fois mieux que la relecture. Tu as « vu » beaucoup en 3 semaines ; aujourd'hui on mesure ce qui est DISPONIBLE dans tes doigts sans documentation.

Règles de la séance :
- **Chronomètre** par kata (le temps cible est indiqué). Dépassé de 50% → passe au suivant, tu y reviendras. Un mur de 40 minutes sur un kata n'apprend rien ; l'identifier comme lacune, si.
- **Zéro doc, zéro IA, zéro relecture de tes anciens fichiers** pendant les katas. C'est un diagnostic : fausser le thermomètre ne soigne pas.
- **La méthode d'hier s'applique** même sous chrono — SURTOUT sous chrono : 3 minutes d'exemples à la main sauvent 15 minutes d'errance.
- Après chaque kata : note ton temps et un ressenti (fluide / laborieux / échec). Ces notes pilotent la revue de demain.

Le format ressemble volontairement à un entretien technique : cette familiarité, construite tôt et répétée (jours 20, 84, 175, 280, 351...), est ce qui te rendra CALME le jour J. Le stress d'entretien est surtout du non-entraînement.`,
    schedule: [
      "0:00-0:15 — Prépare : un dossier scripts/katas-j20/, le chrono, les règles relues. Pas d'échauffement : en entretien, il n'y en a pas.",
      "0:15-2:15 — Katas 1 à 5 (les temps cibles totalisent ~1h40, la marge est ta respiration).",
      "2:15-2:30 — Pause OBLIGATOIRE même si tu es lancé.",
      "2:30-3:45 — Katas 6 à 8.",
      "3:45-4:30 — L'heure VÉRITÉ : auto-correction des 8, tableau des scores, plan de rattrapage écrit pour demain (revue hebdo).",
    ],
    exercise: `Les 8 katas (temps cible entre parenthèses) :
1. **FizzBuzz de mémoire** (8 min) — celui du jour 6, règle Lucky comprise. Tu l'as fait il y a 2 semaines : qu'en reste-t-il ?
2. **inverserChaine(str)** sans .reverse() (7 min) — boucle ou récursion, au choix.
3. **estPalindrome(str)** (10 min) — "Ésope reste ici et se repose" → true (ignore casse, espaces, accents… au minimum casse et espaces).
4. **compterOccurrences(arr)** (10 min) — ["a","b","a"] → {a: 2, b: 1}. Le geste du jour 11.
5. **deuxiemePlusGrand(arr)** (12 min) — SANS trier. Cas limites : doublons du max, tableau de 2.
6. **fusionnerTrie(arr1, arr2)** (20 min) — deux tableaux TRIÉS → un tableau trié, en UNE passe (deux curseurs). Le classique d'entretien par excellence.
7. **Recherche binaire de mémoire** (15 min) — celle du jour 16, batterie limite comprise (vide, un élément, 2 éléments).
8. **chiffresRomains(n)** (25 min) — 1994 → "MCMXCIV". Méthode complète recommandée (les exemples à la main révèlent le pattern soustractif).`,
    bonus: "Si les 8 sont finis dans les temps (bravo) : `anagrammes(str1, str2)` (10 min) puis `premierNonRepete(str)` (10 min). Sinon : le bonus est de REFAIRE le kata le plus raté, après avoir relu sa solution — la boucle rapide échec→correction→refaite est le meilleur apprentissage de la journée.",
    quiz: [
      { q: "Pourquoi le rappel actif bat-il la relecture ?", a: "La récupération en mémoire EST ce qui renforce le souvenir ; relire donne une illusion de maîtrise (familiarité ≠ disponibilité)." },
      { q: "Le pattern des deux curseurs de fusionnerTrie, en une phrase ?", a: "Un index par tableau ; à chaque tour, on prend le plus petit des deux éléments courants et on avance SON curseur ; puis on vide le tableau restant." },
      { q: "Pourquoi deuxiemePlusGrand sans tri est-il plus intéressant qu'avec ?", a: "Le tri coûte O(n log n) pour un besoin O(n) (une passe, deux variables max1/max2) — et gérer « doublon du max » force à préciser la spec : 2e valeur DISTINCTE ou 2e position ?" },
      { q: "Que fais-tu à la minute 12 d'un kata prévu en 10 ?", a: "Je note où j'en suis, je passe au suivant, j'y reviens à la fin. Gérer le budget temps global > s'acharner localement (vrai en entretien, vrai en poste)." },
    ],
    deliverable: "Les 8 fichiers katas + le tableau de scores (kata, temps cible, temps réel, ressenti, verdict) dans notes/bilan-j20.md + le plan de rattrapage (3 lignes : quoi refaire, quand).",
    criteria: ['8 katas TENTÉS (même inachevés — l\'échec documenté vaut mieux que l\'évitement)', '≥ 6/8 fonctionnels après la séance', 'Zéro aide pendant les katas (ton honnêteté est l\'instrument de mesure)', 'Tableau de scores rempli et plan de rattrapage écrit'],
    mistakes: ['Relire ses anciens fichiers « juste pour vérifier une syntaxe » : c\'est exactement la béquille que le jour teste — note la syntaxe manquante comme LACUNE, c\'est une donnée', 'Palindrome : comparer avec reverse() que tu viens d\'interdire au kata 2 — cohérence : boucle deux curseurs (début/fin qui convergent)', 'Chiffres romains sans exemples à la main : le cas soustractif (IV, IX, XC, CM) ne se devine pas, il se DÉCOUVRE en écrivant 4, 9, 40, 90'],
    resources: ['Aucune pendant. Après : tes propres solutions des jours 6-19 sont ta référence de comparaison (et c\'est un plaisir de voir le chemin parcouru).'],
    aiRule: "Diagnostic = zéro IA, zéro doc, zéro archive personnelle pendant les 8 katas. C'est la règle la plus stricte du mois, et elle est le POINT du jour. Après l'auto-correction complète : débriefe avec l'IA si tu veux (« voici mon code et mon temps sur X, comment un senior l'aborderait-il ? »).",
    solution: {
      logic: "Chiffres romains (le seul vraiment nouveau) : le déclic vient des exemples — la table doit contenir les formes soustractives COMME des valeurs à part entière : [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]. Ensuite c'est EXACTEMENT le rendu de monnaie d'hier : parcourir les « coupures » décroissantes, soustraire tant que possible. Deux problèmes en apparence différents, UN algorithme — c'est ça, progresser en algo.",
      simple: `\`\`\`js
function chiffresRomains(n) {
  const TABLE = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],
                 [50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
  let resultat = "";
  for (const [valeur, symbole] of TABLE) {
    while (n >= valeur) { resultat += symbole; n -= valeur; }
  }
  return resultat;
}
function fusionnerTrie(a, b) {
  const resultat = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) resultat.push(a[i++]);
    else resultat.push(b[j++]);
  }
  while (i < a.length) resultat.push(a[i++]);   // vider le restant
  while (j < b.length) resultat.push(b[j++]);
  return resultat;
}
\`\`\``,
      improved: "deuxiemePlusGrand en une passe : deux variables max1 ≥ max2 ; pour chaque x : si x > max1 → max2 = max1, max1 = x ; sinon si x > max2 ET x !== max1 (si la spec veut des valeurs distinctes) → max2 = x. La subtilité « doublons du max » est le genre de détail qu'un entretien sonde : avoir POSÉ la question de spec vaut des points même avant de coder.",
      pitfalls: ['fusionnerTrie : oublier de vider le tableau restant après la boucle principale — teste fusionnerTrie([1,2],[5,6,7,8])', 'Palindrome deux curseurs : la condition est gauche < droite, pas <= (le centre d\'un impair se compare à lui-même : inutile mais pas faux — sais-tu le justifier ?)', 'Le <= dans fusionnerTrie (vs <) rend la fusion STABLE (les égaux de a passent avant ceux de b) — clin d\'œil au jour 17'],
      checks: ['fizzBuzz : recompare à ta version du jour 6 — meilleure, identique, pire ?', 'chiffresRomains : 4→IV, 9→IX, 14→XIV, 40→XL, 1994→MCMXCIV, 3999→MMMCMXCIX', 'Le tableau de scores est rempli SANS complaisance (un « fluide » menti aujourd\'hui = une lacune découverte en entretien)'],
      reflection: ["Quels katas ont convoqué des patterns d'autres jours (romains→monnaie, occurrences→regroupement) ? La compétence algo N'EST PAS une liste de solutions mémorisées mais un stock de PATTERNS transférables : lesquels possèdes-tu désormais ?", "Ton temps au kata 7 (recherche binaire revue) vs le jour 16 : l'écart mesure la consolidation. Note-le — tu referas l'exercice au jour 84."],
    },
  },
  // Jour 21 = revue hebdo semaine 3 (généré automatiquement).
  {
    day: 22, title: "Les fonctions comme valeurs : callbacks et fonctions d'ordre supérieur",
    skill: 'jsts', difficulty: 3, hours: 4.5,
    objective: "Comprendre qu'une fonction EST une valeur (stockable, passable, retournable), écrire des fonctions d'ordre supérieur, et préparer le terrain de map/filter/reduce.",
    concepts: ['Fonctions = valeurs de première classe', 'Callbacks', 'Fonctions d\'ordre supérieur', 'Closures (première rencontre)', 'Fabriques de fonctions', 'Le contrat d\'une callback'],
    theory: `L'idée qui change tout : en JS, une fonction est une VALEUR comme 42 ou "texte". On peut la mettre dans une variable, dans un tableau, la PASSER à une autre fonction, la RETOURNER d'une fonction.

- Une **callback** est une fonction passée en argument pour que l'autre l'appelle : \`arr.sort((a, b) => a - b)\` — tu en utilises depuis le jour 11 sans le nom.
- Une **fonction d'ordre supérieur** prend ou retourne des fonctions. Elle sépare le SQUELETTE (parcourir, répéter, mesurer) du COMPORTEMENT (quoi faire) : le squelette est écrit une fois, le comportement injecté à la demande.
- Une **closure** : une fonction retournée qui SE SOUVIENT des variables de sa fabrique :
\`\`\`js
function creerCompteur() {
  let compte = 0;                 // privée : personne d'autre n'y touche
  return () => ++compte;          // s'en souvient pour toujours
}
const compteurA = creerCompteur(); // compteurA() → 1, 2, 3...
const compteurB = creerCompteur(); // indépendant : sa PROPRE variable compte
\`\`\`
Les closures sont LE mécanisme d'état privé de JS (React les utilise massivement, mois 4) et une question d'entretien garantie.

Pourquoi ce détour avant map/filter/reduce (demain) : ces méthodes SONT des fonctions d'ordre supérieur. Les comprendre par en dessous (en les réécrivant toi-même aujourd'hui) transforme « de la magie qu'on recopie » en « un pattern qu'on possède ».`,
    schedule: [
      "0:00-0:45 — Théorie + REPL : stocke une fonction, passe-la, retourne-en une, fabrique deux compteurs indépendants et VÉRIFIE leur indépendance.",
      "0:45-1:45 — Exercice A : réécrire les outils (monMap, monFilter...).",
      "1:45-2:00 — Pause.",
      "2:00-3:15 — Exercice B : la boîte à outils d'ordre supérieur.",
      "3:15-3:45 — Bonus (closures) + quiz.",
      "3:45-4:30 — Auto-correction, commit, journal.",
    ],
    exercise: `**A — Réécris les outils toi-même** (\`scripts/mes-outils.js\`) — chacun avec une boucle for...of, sans utiliser la méthode native correspondante :
1. \`monMap(arr, fn)\` → nouveau tableau des fn(x).
2. \`monFilter(arr, fn)\` → nouveau tableau des x où fn(x) est truthy.
3. \`monFind(arr, fn)\` → premier x où fn(x), sinon undefined.
4. \`monEvery(arr, fn)\` / \`monSome(arr, fn)\` → booléens (avec arrêt anticipé : dès que la réponse est connue, stop).
5. \`monForEach(arr, fn)\` → appelle fn(x, index) pour chaque élément.
Teste chaque outil sur les employés du jour 11 (recharge le JSON) : les requêtes 1, 3, 4 réécrites avec TES outils.

**B — La boîte à outils** (\`scripts/boite-outils.js\`) :
1. \`chronometrer(fn)\` → exécute fn, retourne { resultat, dureeMs }.
2. \`repeter(n, fn)\` → appelle fn(i) n fois.
3. \`memoriser(fn)\` → retourne une version de fn qui CACHE ses résultats (si déjà appelée avec cet argument, renvoie le résultat stocké sans recalculer). Closure + objet cache. Teste sur une fonction lente artificielle.
4. \`creerValidateur(regles)\` → prend un tableau de fonctions {test, message} et retourne UNE fonction qui valide (le validateur du jour 5, version industrialisée).
5. \`composer(f, g)\` → retourne x => f(g(x)). Puis \`pipeline(...fns)\` → enchaîne n fonctions de gauche à droite.`,
    bonus: "memoriser avec plusieurs arguments : la clé du cache devient JSON.stringify(args). Limites de cette approche (ordre des clés d'objets, fonctions en argument) ? Puis : que se passe-t-il si on mémorise une fonction NON pure (Math.random) ? Écris la réponse — elle justifie à elle seule la notion de pureté (jour 26).",
    quiz: [
      { q: "Qu'est-ce qu'une fonction de première classe ?", a: "Une valeur à part entière : stockable dans une variable, passable en argument, retournable — le statut des fonctions en JS." },
      { q: "Deux compteurs de la même fabrique partagent-ils leur variable compte ?", a: "Non : chaque APPEL de la fabrique crée une nouvelle portée, donc une nouvelle variable capturée. Indépendance totale." },
      { q: "Pourquoi monEvery doit-il s'arrêter au premier false ?", a: "La réponse est déjà connue (un seul contre-exemple suffit) : continuer est du gaspillage — et sur un tableau infini/coûteux, la différence entre marche et gèle." },
      { q: "memoriser échange quoi contre quoi ?", a: "De la mémoire (le cache grossit) contre du temps (zéro recalcul). Le compromis fondamental du jour 15, incarné — et le principe du cache LLM que tu construiras au mois 10." },
    ],
    deliverable: "mes-outils.js (5 outils testés sur les employés), boite-outils.js (5 outils démontrés), commit.",
    criteria: ['Les 5 réécritures se comportent comme les natives (compare sur 3 cas chacune)', 'memoriser DÉMONTRÉ : deux appels identiques, le second instantané (chronometrer le prouve — tes outils se composent déjà !)', 'Les deux compteurs indépendants vérifiés', 'composer et pipeline testés avec 3 fonctions'],
    mistakes: ['monFilter qui pousse fn(x) au lieu de x : on filtre les ÉLÉMENTS, la fonction ne sert qu\'à décider', 'memoriser sans closure (cache global) : deux fonctions mémorisées partageraient le cache — dessine pourquoi c\'est cassé', 'Confondre passer une fonction (sans parenthèses : fn) et l\'appeler (avec : fn()) — l\'erreur de syntaxe LA plus fréquente du chapitre'],
    resources: ['javascript.info — "Function expressions", "Closure" (LA référence sur le sujet)', 'Ton propre appliquerDeuxFois du jour 9 : tu avais déjà écrit une fonction d\'ordre supérieur sans le savoir'],
    aiRule: "Les réécritures (A) : strictement seul — c'est une reconstruction de fondations. La boîte (B) : 30 min de blocage par outil, puis indices. Excellent usage après coup : demande à l'IA « quels bugs subtils dans mon memoriser ? » (il y en a souvent : undefined cachable, etc.).",
    solution: {
      logic: "Le fil des 10 outils : séparer squelette et comportement. monMap = squelette « parcourir et collecter » + comportement fn. memoriser = squelette « vérifier le cache, sinon calculer et stocker » AUTOUR de n'importe quelle fn. Une fois ce découpage vu, tu le verras partout — middlewares Express (mois 3), hooks React (mois 4), decorators Python (mois 5).",
      simple: `\`\`\`js
function monMap(arr, fn) {
  const resultat = [];
  for (const x of arr) resultat.push(fn(x));
  return resultat;
}
function memoriser(fn) {
  const cache = {};                       // capturée par la closure : privée, persistante
  return (arg) => {
    if (arg in cache) return cache[arg];  // hit : zéro calcul
    cache[arg] = fn(arg);                 // miss : calcule et stocke
    return cache[arg];
  };
}
const composer = (f, g) => (x) => f(g(x));
const pipeline = (...fns) => (x) => {
  let valeur = x;
  for (const fn of fns) valeur = fn(valeur);
  return valeur;
};
\`\`\``,
      improved: "creerValidateur relie trois jours d'un coup : les règles données-pilotées du jour 5, monFilter d'aujourd'hui, et la closure qui capture les règles : const creerValidateur = (regles) => (valeur) => regles.filter((r) => !r.test(valeur)).map((r) => r.message); — trois lignes qui remplacent le validateur entier du jour 5. QUAND cette ligne te paraîtra limpide, le chapitre sera acquis (relis-la après demain si besoin).",
      pitfalls: ['arg in cache vs cache[arg] !== undefined : si fn retourne undefined légitimement, la 2e version recalcule à chaque fois — subtilité de vrai code de prod', 'pipeline(...fns) : le rest capture les fonctions en tableau — pipeline(double, incrementer)(5) doit donner 11 (double d\'abord) ; composer(double, incrementer)(5) donne 12 (incrementer d\'abord, ordre mathématique) — la CONVENTION d\'ordre diffère, documente la tienne', 'monSome/monEvery sur tableau vide : some→false, every→true (vérité vide) — comportement natif à reproduire, et question piège d\'entretien'],
      checks: ['Chaque outil comparé au natif sur 3 cas (dont le tableau vide)', 'memoriser : 2e appel < 1ms là où le 1er prenait 100ms+', 'pipeline(x => x+1, x => x*2)(5) === 12 et l\'ordre est celui que TU as documenté'],
      reflection: ["La closure donne un état PRIVÉ sans classe ni objet : compare avec le personnage du jour 10 (état public, modifiable par tous). Quand veut-on l'un, quand l'autre ?", "memoriser ne marche QUE sur les fonctions pures : tu tiens là ta première raison DE FOND de préférer les fonctions pures (testables + cachables). Le jour 26 en ajoutera d'autres."],
    },
  },
  {
    day: 23, title: "map et filter : penser en transformations",
    skill: 'jsts', difficulty: 2, hours: 4.5,
    objective: "Remplacer les boucles de transformation et de sélection par map/filter avec naturel, chaîner proprement, et savoir quand une boucle reste préférable.",
    concepts: ['map : transformer 1-pour-1', 'filter : sélectionner', 'Chaînage', 'Immutabilité de ces méthodes', 'Lisibilité déclarative vs impérative', 'Quand préférer la boucle'],
    theory: `Hier tu as ÉCRIT monMap et monFilter. Aujourd'hui tu utilises les vrais, en comprenant exactement ce qu'ils font (puisque tu les as faits).

- **map** : transformation 1-pour-1. n éléments entrent, n sortent, chacun transformé. \`prix.map(p => p * 1.2)\`. Si ta callback ne TRANSFORME pas (elle affiche, elle pousse ailleurs), map est le mauvais outil (forEach, ou boucle).
- **filter** : sélection. n entrent, 0 à n sortent, inchangés. La callback est un PRÉDICAT (retourne un booléen honnête).
- **Chaînage** : \`employes.filter(e => e.service === "tech").map(e => e.nom)\` se lit comme une phrase : « les employés tech, leurs noms ». C'est le style déclaratif : on dit QUOI, pas COMMENT (la boucle dit comment).
- Les deux retournent des tableaux NEUFS : l'original est intact — l'immutabilité du jour 8, gratuite.

**Quand garder une boucle** : arrêt anticipé (break), transformation + effet de bord mêlés, performance critique sur données énormes (chaque étage de chaîne reparcourt tout), ou logique d'index complexe. La maturité n'est pas « tout en map/filter » mais choisir l'outil qui rend le code le PLUS LISIBLE.

Ce style est universel : SQL (SELECT/WHERE), pandas (mois 5), les pipelines de données — partout, la même paire transformation/sélection.`,
    schedule: [
      "0:00-0:30 — Théorie + REPL : 5 map, 5 filter, 3 chaînages sur des données jouets.",
      "0:30-1:30 — Exercice A : la conversion des 10 requêtes.",
      "1:30-1:45 — Pause.",
      "1:45-3:00 — Exercice B : le catalogue e-commerce.",
      "3:00-3:30 — Exercice C : les 3 cas où la boucle gagne.",
      "3:30-4:00 — Bonus + quiz.",
      "4:00-4:30 — Auto-correction, commit, journal.",
    ],
    exercise: `**A — Conversion** : reprends tes 10 requêtes du jour 11 (requetes.js). Réécris en map/filter TOUTES celles qui s'y prêtent (spoiler : les requêtes 1-4, 6-7 en tout ou partie ; les agrégations 5, 9, 10 attendent reduce demain). Garde les deux versions côte à côte : le fichier devient un document de comparaison.

**B — Le catalogue** (\`scripts/catalogue.js\`) : crée 15 produits {nom, prix, categorie, stock, note (sur 5)}. En chaînages map/filter uniquement :
1. Les noms des produits en rupture (stock 0).
2. Les produits < 20€ avec au moins 4 de note, formatés "Nom — 19,99 € ★4.5".
3. Appliquer -30% sur la catégorie "hiver" (nouveau catalogue, l'original INTACT — prouve-le).
4. Les catégories distinctes (map + filtre d'unicité : indexOf(x) === index — comprends cette astuce avant de l'utiliser).
5. Une fonction \`rechercher(catalogue, options)\` où options = {texte?, categorieVoulue?, prixMax?} — chaque critère ne filtre QUE s'il est fourni (les filtres facultatifs d'une vraie barre de recherche).

**C — Contre-exercices** : trois problèmes où map/filter est le MAUVAIS choix — écris la version boucle et UNE ligne de justification : (1) trouver le premier produit > 100€ (arrêt anticipé), (2) sommer les stocks (accumulation — attends demain ou boucle), (3) transformer en s'arrêtant à la première erreur.`,
    bonus: "flatMap : 5 commandes contenant chacune des lignes [{produit, quantite}] → la liste À PLAT de tous les produits commandés. D'abord avec map (observe le tableau de tableaux — le problème), puis flatMap (la solution). Où as-tu déjà rencontré ce besoin d'aplatissement (indice : jour 29 à venir, aplatir récursif) ?",
    quiz: [
      { q: "map sur 10 éléments retourne combien d'éléments, toujours ?", a: "Exactement 10 : map est 1-pour-1 par contrat. Si tu veux en écarter, c'est filter (avant ou après)." },
      { q: "Pourquoi filter(e => e.salaire) est-il un prédicat malhonnête ?", a: "Il repose sur la truthiness : un salaire de 0 serait écarté par accident. Un prédicat honnête compare : e => e.salaire > 0." },
      { q: "catalogue.filter(...).map(...) : combien de parcours du tableau ?", a: "Deux (un par étage). Acceptable presque toujours ; sur des millions d'éléments en boucle chaude, une boucle unique fusionne les deux passes." },
      { q: "Cite deux situations où la boucle bat map/filter.", a: "Arrêt anticipé (break impossible en map/filter) et accumulation complexe multi-variables ; aussi : effets de bord assumés (forEach ou boucle, pas map)." },
    ],
    deliverable: "requetes.js enrichi (versions côte à côte), catalogue.js (5 chaînages + rechercher), les 3 contre-exercices justifiés, commit.",
    criteria: ['Conversions correctes ET plus lisibles que les boucles (sinon, questionne)', 'rechercher : les 8 combinaisons d\'options marchent (aucune, une, deux, trois)', 'Point 3 : original prouvé intact', 'Contre-exercices : justifications qui tiennent en une phrase claire'],
    mistakes: ['map utilisé pour ses effets de bord (map(x => console.log(x))) : le tableau retourné part à la poubelle — c\'est forEach ou une boucle', 'rechercher : options.prixMax === undefined traité comme prixMax 0 — le piège falsy du jour 5 revient ; teste chaque critère avec !== undefined', 'Chaîner 5 étages illisibles pour éviter UNE boucle claire : la lisibilité est le juge, pas le dogme'],
    resources: ['MDN — Array.prototype.map / filter / flatMap (lis les signatures complètes : le 2e paramètre index existe)', 'Tes mes-outils.js d\'hier : en cas de doute sur un comportement, relis TA propre implémentation'],
    aiRule: "Conversions et catalogue : seul (c'est de l'entraînement de gamme). Usage IA malin en fin de session : montre tes chaînages et demande « lesquels un senior trouverait-il trop denses ? » — calibrer sa propre lisibilité est une compétence qui s'acquiert par feedback.",
    solution: {
      logic: "rechercher est le morceau de choix : le pattern « filtre conditionnel » — chaque critère absent laisse passer tout le monde. Deux styles : un filter par critère (simple, plusieurs passes) ou un filter unique dont le prédicat combine les critères fournis. Le second est montré ci-dessous ; le premier est tout aussi valable aujourd'hui.",
      simple: `\`\`\`js
function rechercher(catalogue, options = {}) {
  return catalogue.filter((p) => {
    if (options.texte !== undefined &&
        !p.nom.toLowerCase().includes(options.texte.toLowerCase())) return false;
    if (options.categorieVoulue !== undefined &&
        p.categorie !== options.categorieVoulue) return false;
    if (options.prixMax !== undefined && p.prix > options.prixMax) return false;
    return true;   // aucun critère ne l'a écarté
  });
}
// Le -30% immuable : nouveau tableau, nouveaux objets (spread !)
const soldes = catalogue.map((p) =>
  p.categorie === "hiver" ? { ...p, prix: +(p.prix * 0.7).toFixed(2) } : p
);
\`\`\``,
      improved: "Le piège PROFOND du point 3 : map crée un nouveau TABLEAU, mais les OBJETS dedans restent partagés (référence, jour 8). Sans le { ...p }, modifier soldes[0].prix modifierait AUSSI catalogue[0].prix. La copie superficielle ne protège qu'un niveau. Vérifie-le expérimentalement : c'est un des bugs les plus vicieux de React (mois 4), autant le rencontrer aujourd'hui dans un contexte calme.",
      pitfalls: ['L\'astuce d\'unicité indexOf(x) === index est en O(n²) — parfaite ici, à remplacer par Set (jour 30) au-delà de quelques milliers d\'éléments : tu as maintenant le vocabulaire pour dire POURQUOI', '+(x).toFixed(2) : toFixed retourne une string (jour 4 !), le + la reconvertit — ou mieux : Math.round(x * 100) / 100', 'options = {} par défaut : sans elle, rechercher(catalogue) crashe sur options.texte — la valeur par défaut du jour 9 en action'],
      checks: ['rechercher({}) retourne tout ; rechercher({prixMax: 0}) retourne les gratuits (PAS tout — le test du falsy)', 'catalogue[i].prix inchangé après soldes (vérifié sur un produit hiver)', 'Chaque version map/filter donne LE MÊME résultat que sa version boucle (oracle, encore)'],
      reflection: ["« Les employés tech, leurs noms » : le chaînage se LIT. Trouve dans ton annuaire (jour 13) deux endroits qui gagneraient à ce style, et un qui n'y gagnerait pas.", "SQL dira SELECT nom FROM employes WHERE service = 'tech'. Même structure ? Presque : quel étage SQL correspond à map, lequel à filter ? (Tu vérifieras ton intuition au jour 78.)"],
    },
  },
  {
    day: 24, title: "reduce : l'outil universel d'agrégation",
    skill: 'jsts', difficulty: 3, hours: 4.5,
    objective: "Maîtriser reduce pour les agrégations (somme, min/max, comptage, regroupement), comprendre l'accumulateur en profondeur, et savoir quand reduce clarifie vs obscurcit.",
    concepts: ['L\'accumulateur', 'Valeur initiale (et le piège sans elle)', 'reduce vers un nombre, un objet, un tableau', 'Regroupement en reduce', 'reduce vs boucle : le juge lisibilité', 'map et filter SONT des reduce'],
    theory: `**reduce** replie un tableau en UNE valeur (nombre, objet, tableau, n'importe quoi) : \`arr.reduce((acc, x) => nouvelAcc, valeurInitiale)\`.

Le mécanisme, pas à pas : l'accumulateur démarre à la valeur initiale ; pour chaque élément, ta callback reçoit (acc, x) et retourne le PROCHAIN acc ; le dernier acc est le résultat. \`[1,2,3].reduce((acc, x) => acc + x, 0)\` déroule : 0+1=1 → 1+2=3 → 3+3=6.

C'est EXACTEMENT ton pattern accumulateur du jour 6 (\`let total = 0; for...\`) : reduce en est la version fonction d'ordre supérieur — la variable déclarée avant la boucle devient la valeur initiale, le corps de boucle devient la callback.

**Le piège n°1** : omettre la valeur initiale. Sans elle, reduce prend arr[0] comme acc de départ — ça marche par accident sur une somme de nombres, ça EXPLOSE sur un tableau vide (TypeError) et ça produit n'importe quoi si l'acc doit être d'un autre type que les éléments. Règle : TOUJOURS la valeur initiale.

**Puissance et danger** : reduce peut tout faire (map = reduce qui pousse fn(x), filter = reduce qui pousse conditionnellement — tu le prouveras en exercice). Justement : « peut tout faire » = « peut tout obscurcir ». Un reduce de 15 lignes avec 3 niveaux de logique est une boucle qui s'ignore. Juge : si la callback ne tient pas en ~3 lignes limpides, écris une boucle.`,
    schedule: [
      "0:00-0:45 — Théorie + déroule À LA MAIN (papier, colonne acc / colonne x) : somme, max, comptage d'occurrences. Le déroulé manuel est ce qui fait « cliquer » reduce.",
      "0:45-1:45 — Exercice A : la gamme reduce.",
      "1:45-2:00 — Pause.",
      "2:00-3:00 — Exercice B : les requêtes 5, 9, 10 enfin réécrites + le rapport de ventes.",
      "3:00-3:30 — Exercice C : les preuves (map et filter en reduce).",
      "3:30-4:00 — Bonus + quiz.",
      "4:00-4:30 — Auto-correction, commit, journal.",
    ],
    exercise: `**A — La gamme** (\`scripts/reduce.js\`), chaque exercice avec sa valeur initiale explicite :
1. Somme et produit d'un tableau de nombres.
2. Le max SANS Math.max (acc = le plus grand vu jusqu'ici — et quelle valeur initiale honnête ? Réfléchis : -Infinity, ou arr[0] avec garde sur le vide).
3. compterOccurrences(mots) → {mot: n} (ton kata du jour 20, en reduce).
4. grouperPar(arr, cle) → le regroupement du jour 11, en reduce.
5. Le total du panier {prix, quantite} en une passe.

**B — Fin de la conversion** : les requêtes 5 (masse salariale + moyenne), 9 (regroupement) et 10 (moyenne par service) du jour 11, en reduce (la 10 : reduce PUIS transformation — ou deux reduce, compare). Puis le **rapport de ventes** : sur 20 ventes {produit, montant, mois, vendeur}, produis EN UN SEUL PIPELINE (chaîne de map/filter/reduce) : le CA par vendeur du 2e trimestre, trié décroissant, format [{vendeur, ca}].

**C — Les preuves** : implémente \`mapAvecReduce(arr, fn)\` et \`filterAvecReduce(arr, fn)\`. Si tu y arrives, tu as VRAIMENT compris reduce (et au passage : pourquoi [...acc, x] à chaque tour est O(n²) — push muté sur l'acc est OK ici, explique pourquoi cette mutation est inoffensive).`,
    bonus: "pipeline(...fns) du jour 22, réécrit en reduce (fns.reduce((valeur, fn) => fn(valeur), x)) — trois jours de concepts en une ligne. Puis un vrai défi : `equilibrerParentheses(str)` avec reduce (acc = compteur de profondeur, négatif = déséquilibre immédiat). Le reduce peut-il s'ARRÊTER tôt ? Non — et c'est une de ses limites documentées (contre-exercice d'hier).",
    quiz: [
      { q: "Que reçoit et que retourne la callback de reduce ?", a: "Elle reçoit (accumulateur, élément) et DOIT retourner le prochain accumulateur — l'oubli du return est le bug n°1 (acc devient undefined au tour suivant)." },
      { q: "[].reduce((a, x) => a + x) : que se passe-t-il ?", a: "TypeError : sans valeur initiale ni élément, reduce ne peut pas démarrer. Avec 0 en initial : retourne 0 proprement. D'où la règle." },
      { q: "Regrouper par clé en reduce : la callback en une ligne ?", a: "(acc, x) => { (acc[x.cle] ??= []).push(x); return acc; } avec {} initial — ou version sans mutation, plus verbeuse." },
      { q: "Quand un reduce doit-il redevenir une boucle ?", a: "Quand la callback dépasse ~3 lignes claires, accumule plusieurs choses à la fois, ou qu'on a besoin d'un arrêt anticipé — la lisibilité juge, pas le style." },
    ],
    deliverable: "reduce.js (gamme), requetes.js complété (les 10 requêtes ont maintenant leur meilleure version), rapport de ventes, les 2 preuves, commit.",
    criteria: ['Gamme 5/5 avec valeurs initiales explicites et justes', 'Le rapport de ventes en un pipeline lisible (montre-le à voix haute : il doit se raconter)', 'Les preuves C fonctionnent (comparées aux natives)', 'Déroulé papier fait pour au moins 2 exercices (colonnes acc/x)'],
    mistakes: ['Oublier le return dans une callback à accolades : (acc, x) => { acc[x] = 1 } retourne undefined — soit ajoute return acc, soit style expression', 'Le max avec 0 comme valeur initiale : FAUX sur un tableau de négatifs — le genre de bug qui passe les tests naïfs et explose en prod', 'Un reduce qui fait le travail de map+filter+reduce à la fois : sépare les étages, chaque outil son travail'],
    resources: ['MDN — Array.prototype.reduce (lis la section « comment reduce fonctionne » avec le tableau de déroulé)', 'Ton pattern accumulateur du jour 6 et le regroupement du jour 11 : reduce n\'est QUE leur généralisation — relis-les avec tes yeux d\'aujourd\'hui'],
    aiRule: "Le déroulé papier et la gamme : seuls (c'est là que reduce « clique » ou pas). Si reduce résiste encore en fin de journée : demande à l'IA de te générer 5 déroulés pas-à-pas à COMPLÉTER (elle donne le tableau, des cases vides pour acc) — un exerciseur, pas un solveur.",
    solution: {
      logic: "Le rapport de ventes, étage par étage : filter (trimestre 2 : mois 4-6) → reduce (regrouper-sommer par vendeur : {vendeur: ca}) → Object.entries + map (vers [{vendeur, ca}]) → sort (décroissant). Quatre étages, chacun trivial — la complexité totale est maîtrisée par la décomposition, exactement le message du jour 9 appliqué aux données.",
      simple: `\`\`\`js
const rapport = Object.entries(
    ventes
      .filter((v) => v.mois >= 4 && v.mois <= 6)
      .reduce((acc, v) => {
        acc[v.vendeur] = (acc[v.vendeur] ?? 0) + v.montant;
        return acc;
      }, {})
  )
  .map(([vendeur, ca]) => ({ vendeur, ca }))
  .sort((a, b) => b.ca - a.ca);
\`\`\`
Les preuves :
\`\`\`js
const mapAvecReduce = (arr, fn) =>
  arr.reduce((acc, x) => { acc.push(fn(x)); return acc; }, []);
const filterAvecReduce = (arr, fn) =>
  arr.reduce((acc, x) => { if (fn(x)) acc.push(x); return acc; }, []);
\`\`\``,
      improved: "Pourquoi muter l'acc avec push est ici inoffensif : l'acc ([]) est NÉ dans le reduce — personne d'autre ne le référence, la mutation est invisible de l'extérieur (« mutation locale, pureté externe »). La version [...acc, x] recopie tout le tableau à chaque tour : O(n²) pour le style. Retiens la nuance : l'immutabilité protège les données PARTAGÉES ; une donnée privée en cours de construction peut se muter sans péché. C'est une réponse d'entretien qui distingue.",
      pitfalls: ['acc[v.vendeur] ?? 0 : le premier passage d\'un vendeur n\'a pas de clé — le ?? (ou ||, mais ?? est plus juste : jour 10) initialise ; sans lui, undefined + montant = NaN qui se propage partout', 'Object.entries donne [[clé, valeur], ...] : la destructuration ([vendeur, ca]) dans le map — relis le jour 11 si ce détour objet→tableau reste flou', 'La requête 10 (moyenne par service) : somme ET compte par groupe — un acc de forme {service: {somme, n}} PUIS une passe de division ; tenter la moyenne en un seul reduce est le sur-reduce typique'],
      checks: ['Rapport : recalcule le CA d\'UN vendeur à la calculatrice', 'mapAvecReduce([Vide]) → [], filterAvecReduce comparé au natif sur 3 cas', 'Ton max sur [-5, -2, -9] → -2 (le test qui tue la mauvaise valeur initiale)'],
      reflection: ["Tu as maintenant les 3 outils (map/filter/reduce) ET leurs équivalents boucle ET leurs versions maison : quelle version choisis-tu par défaut, et qu'est-ce qui te ferait changer ? Écris ta doctrine en 3 lignes dans tes notes — elle évoluera, et c'est le but.", "SQL : SELECT vendeur, SUM(montant) ... GROUP BY vendeur ORDER BY 2 DESC — ton pipeline EST cette requête. Au jour 80, tu traduiras dans l'autre sens."],
    },
  },
  {
    day: 25, title: "La récursion : les fonctions qui s'appellent elles-mêmes",
    skill: 'algo', difficulty: 4, hours: 4.5,
    objective: "Comprendre la récursion par la pile d'appels (dessinée), écrire les récursions classiques sans modèle, et savoir convertir récursif ↔ itératif.",
    concepts: ['Cas de base / cas récursif', 'La pile d\'appels (call stack)', 'Stack overflow', 'La confiance récursive (leap of faith)', 'Récursif vs itératif : conversion', 'Où la récursion brille (structures imbriquées)'],
    theory: `Une fonction **récursive** s'appelle elle-même sur un problème PLUS PETIT, jusqu'à un **cas de base** résoluble sans appel. Les deux règles absolues :
1. Un cas de base qui N'appelle PAS (sinon : appels infinis → stack overflow).
2. Chaque appel doit se RAPPROCHER du cas de base (un problème strictement plus petit).

**La pile d'appels** : chaque appel empile un contexte (ses variables à lui) ; le cas de base atteint, les contextes se dépilent en remontant les résultats. \`factorielle(3)\` : empile f(3) → empile f(2) → empile f(1)=1 (base) → dépile : f(2)=2×1=2 → dépile : f(3)=3×2=6. DESSINE cette pile aujourd'hui, plusieurs fois — c'est LE geste qui démystifie la récursion.

**La confiance récursive** : pour écrire sommeTableau(arr), tu SUPPOSES que sommeTableau(arr.slice(1)) marche (c'est un problème plus petit), et tu écris juste : arr[0] + ce résultat. Ne déroule pas mentalement les 15 niveaux — vérifie le cas de base, vérifie que le pas rapproche, fais confiance. C'est contre-intuitif et c'est la clé.

**Quand la récursion gagne** : les structures IMBRIQUÉES à profondeur inconnue — arborescences de fichiers, JSON imbriqué, arbres (semaine 6), le DOM. Une boucle y devient contorsionnée ; la récursion y est naturelle (la structure EST récursive : un dossier contient des dossiers). Pour du linéaire (somme, compte), l'itératif est souvent plus simple et sans limite de pile — savoir convertir dans les deux sens est la vraie maîtrise.`,
    schedule: [
      "0:00-1:00 — Théorie + dessine la pile pour factorielle(4) et compteARebours(3). Code-les. Provoque un stack overflow VOLONTAIRE (retire le cas de base) : lis l'erreur, elle est instructive.",
      "1:00-2:00 — Exercice A : la gamme récursive.",
      "2:00-2:15 — Pause.",
      "2:15-3:15 — Exercice B : les conversions (récursif ↔ itératif).",
      "3:15-3:45 — Exercice C : là où la récursion brille (l'arborescence).",
      "3:45-4:30 — Bonus, quiz, auto-correction, commit, journal.",
    ],
    exercise: `**A — La gamme** (\`scripts/recursion.js\`), chaque fonction avec son cas de base COMMENTÉ :
1. \`factorielle(n)\` (avec la pile dessinée pour n=4, photo/texte dans les notes).
2. \`sommeTableau(arr)\` — base : tableau vide → 0 ; pas : arr[0] + somme du reste.
3. \`puissance(base, exp)\` — puis la version RAPIDE : si exp pair, puissance(base², exp/2) — compare le nombre d'appels pour exp=16 (log !).
4. \`compteARebours(n)\` puis \`compteAEndroit(n)\` — l'ordre affichage/appel récursif inversé : COMPRENDS pourquoi (avant ou après le dépilage).
5. \`fibonacci(n)\` naïf — chronomètre fib(30), fib(35)… explosion ? Explique (dessine l'arbre d'appels : les mêmes calculs refaits des millions de fois). Puis mémorise-le avec TON memoriser du jour 22 : fib(35) instantané. Trois jours qui se rejoignent.",
6. \`inverserChaine(str)\` récursif (ton kata du jour 20, autre angle).

**B — Conversions** : (1) sommeTableau en itératif (tu l'as depuis le jour 6 — mets-les côte à côte), (2) la recherche binaire itérative du jour 16 : tu as DÉJÀ sa jumelle récursive en bonus — compare-les ligne à ligne, (3) compteARebours en boucle. Conclus : qu'est-ce qui se correspond ? (accumulateur ↔ valeur remontée, variable de boucle ↔ paramètre).

**C — L'arborescence** (le clou du jour) : \`tailleTotale(dossier)\` sur cette structure : { nom, type: "fichier", taille } ou { nom, type: "dossier", enfants: [...] } — profondeur QUELCONQUE. Construis un exemple à 4 niveaux. Puis \`chercherFichier(dossier, nom)\` → le chemin complet ("racine/src/utils/helpers.js") ou null. Essaie d'imaginer la version boucle (n'insiste pas : c'est le point — elle exige de gérer une pile TOI-MÊME, ce que la récursion fait gratuitement).`,
    bonus: "aplatir(tableauImbriqué) récursif ([1,[2,[3,[4]]]] → [1,2,3,4]) — il t'attend officiellement au jour 29, prends une longueur d'avance. Et le vrai défi : `genererCombinaisons(arr)` — tous les sous-ensembles de [1,2,3] (8 résultats). Indice : chaque élément est soit dedans, soit dehors → deux appels récursifs. C'est ton premier backtracking, sois patient.",
    quiz: [
      { q: "Les deux règles d'une récursion valide ?", a: "Un cas de base sans appel récursif, et chaque appel travaille sur un problème strictement plus proche de ce cas de base." },
      { q: "Que contient la pile d'appels pendant factorielle(4), au plus profond ?", a: "4 contextes empilés : f(4), f(3), f(2), f(1) — chacun avec SA valeur de n, attendant le résultat du suivant." },
      { q: "Pourquoi fibonacci naïf est-il exponentiel ?", a: "fib(n) appelle fib(n-1) ET fib(n-2), qui recalculent chacun les mêmes sous-problèmes : l'arbre d'appels double à chaque niveau (~2^n appels pour n)." },
      { q: "Pourquoi la récursion est-elle naturelle sur un dossier de fichiers ?", a: "La structure est elle-même récursive (un dossier contient des dossiers) : le code épouse la donnée — cas de base = fichier, cas récursif = dossier." },
    ],
    deliverable: "recursion.js (gamme + conversions), arborescence.js (les 2 fonctions + ta structure de test), les dessins de pile dans les notes, commit.",
    criteria: ['Pile dessinée pour 2 fonctions minimum (l\'exercice qui compte VRAIMENT aujourd\'hui)', 'Gamme 6/6 avec cas de base commentés', 'fib mémorisé démontré (chronos avant/après dans les notes)', 'chercherFichier retourne le CHEMIN (pas juste trouvé/pas trouvé) — la remontée de résultat à travers la pile'],
    mistakes: ['Cas de base absent ou inatteignable (puissance(2, -1) : exp descend-il vers 0 ? GARDE-FOU sur les entrées)', 'compteAEndroit : si tu affiches AVANT l\'appel récursif, tu comptes à rebours — l\'ordre code/appel EST le concept, expérimente les deux', 'chercherFichier qui retourne le nom au lieu de CONSTRUIRE le chemin en remontant : la valeur de retour se transforme à chaque niveau (nom → sousChemin → dossier.nom + "/" + sousChemin)'],
    resources: ['javascript.info — "Recursion and stack" (avec les schémas de pile animés)', 'Ton memoriser du jour 22 — le brancher sur fib aujourd\'hui est le plus beau réinvestissement du mois'],
    aiRule: "Les dessins de pile : à la main, seul, sans exception — c'est le geste qui construit le modèle mental, personne ne peut le faire à ta place. Gamme : 30 min de blocage avant indices. L'arborescence : autorise-toi 45 min de vrai combat avant toute aide (c'est un cap, le franchir seul vaut de l'or).",
    solution: {
      logic: "chercherFichier — la logique de remontée : cas de base 1 : c'est un fichier du bon nom → retourne son nom (début du chemin). Cas de base 2 : fichier du mauvais nom → null. Cas récursif : pour chaque enfant, chercher ; si un enfant retourne un chemin NON null → retourne dossier.nom + \"/\" + cheminEnfant (on PRÉFIXE en remontant la pile — le chemin se construit à l'envers, du fichier vers la racine).",
      simple: `\`\`\`js
function tailleTotale(noeud) {
  if (noeud.type === "fichier") return noeud.taille;        // cas de base
  let total = 0;
  for (const enfant of noeud.enfants) total += tailleTotale(enfant); // confiance
  return total;
}
function chercherFichier(noeud, nom) {
  if (noeud.type === "fichier") {
    return noeud.nom === nom ? noeud.nom : null;            // 2 cas de base
  }
  for (const enfant of noeud.enfants) {
    const chemin = chercherFichier(enfant, nom);
    if (chemin !== null) return noeud.nom + "/" + chemin;   // préfixe en remontant
  }
  return null;                                              // pas dans ce sous-arbre
}
\`\`\``,
      improved: `Puissance rapide (exponentiation par carré) — le log en action :
\`\`\`js
function puissanceRapide(base, exp) {
  if (exp === 0) return 1;
  if (exp % 2 === 0) return puissanceRapide(base * base, exp / 2);
  return base * puissanceRapide(base, exp - 1);
}
\`\`\`
puissance(2, 16) naïve : 16 appels. Rapide : 5 (16→8→4→2→1→0). Même idée que la recherche binaire : DIVISER l'exposant plutôt que le décrémenter. Quand tu vois « divise par 2 à chaque étape », ton réflexe doit désormais être : O(log n).`,
      pitfalls: ['tailleTotale avec reduce au lieu de la boucle : noeud.enfants.reduce((t, e) => t + tailleTotale(e), 0) — parfaitement valide, montre que récursion et reduce se marient (hier + aujourd\'hui)', 'fib mémorisé : ton memoriser du jour 22 cache par argument — MAIS la récursion INTERNE de fib appelle le fib nu, pas le mémorisé ! Il faut que fib s\'appelle via la référence mémorisée (déclare const fib = memoriser((n) => n <= 1 ? n : fib(n-1) + fib(n-2))) — subtilité de haut niveau, si tu l\'as vue seul : chapeau', 'genererCombinaisons : la taille du résultat (2^n) te dit d\'avance que l\'algo est exponentiel — parfois c\'est le PROBLÈME qui l\'est, pas ta solution'],
      checks: ['tailleTotale vérifiée à la main sur ta structure 4 niveaux', 'chercherFichier : présent en profondeur → chemin complet correct ; absent → null ; présent à la racine → cas limite testé', 'fib(35) : > 1s naïf, < 1ms mémorisé (chiffres réels notés)'],
      reflection: ["La « confiance récursive » t'a-t-elle résisté ? C'est normal : elle contredit l'instinct de tout dérouler. Note où tu en es honnêtement — le jour 29 la re-musclera.", "L'arborescence de fichiers, le JSON imbriqué, le DOM du navigateur, l'arbre de composants React (mois 4), les arbres de décision ML (mois 6) : UNE structure, la récursion partout. Qu'est-ce que ça te dit de l'investissement d'aujourd'hui ?"],
    },
  },
  {
    day: 26, title: "Fonctions pures et immutabilité : écrire du code prévisible",
    skill: 'jsts', difficulty: 3, hours: 4.5,
    objective: "Distinguer fonctions pures et effets de bord, pratiquer l'immutabilité (spread, patterns de mise à jour), et restructurer un programme en cœur pur + coquille impure.",
    concepts: ['Fonction pure (2 critères)', 'Effets de bord', 'Pourquoi pur = testable + cachable + prévisible', 'Immutabilité : patterns objet/tableau', 'Copie superficielle vs profonde', 'Architecture cœur pur / coquille impure'],
    theory: `Une fonction **pure** : (1) même entrée → même sortie, TOUJOURS ; (2) aucun **effet de bord** (ne modifie rien dehors : pas d'écriture fichier, pas de console.log, pas de mutation d'argument, pas de Math.random ni Date.now dedans).

Pourquoi c'est précieux — tu as déjà TOUT vécu :
- **Testable** : appelle, compare, fini (ta facture du jour 9 : le calcul se teste, l'affichage se regarde).
- **Cachable** : ton memoriser du jour 22 ne marche QUE sur du pur.
- **Prévisible** : pas de « ça marche chez moi » — rien de caché n'influence le résultat.

**L'immutabilité** est la discipline jumelle : ne jamais MODIFIER les données reçues, retourner des VERSIONS NEUVES. Les patterns à automatiser :
\`\`\`js
{ ...obj, prix: 20 }                    // objet : changer un champ
{ ...obj, stats: { ...obj.stats, pv: 50 } }  // imbriqué : spread à CHAQUE niveau
[...arr, x]  /  arr.filter(...)          // ajouter / retirer
arr.map(o => o.id === id ? { ...o, done: true } : o)  // modifier UN élément
\`\`\`
Le spread est SUPERFICIEL (un niveau) — tu l'as vu au jour 23 avec le catalogue : les objets imbriqués exigent un spread par niveau.

**L'architecture qui en découle** (le vrai sujet du jour) : un **cœur pur** (toute la logique : calculs, décisions, transformations — massivement testable) entouré d'une **coquille impure** (lecture fichier, affichage, horloge, aléatoire — le minimum vital aux frontières). Ton journal du jour 12 avait déjà cette forme (charger/sauvegarder vs logique). React (mois 4) l'impose, les tests (mois 4) la récompensent, l'hexagonal (mois 10) la généralise. Aujourd'hui : tu la pratiques consciemment.`,
    schedule: [
      "0:00-0:45 — Théorie + le tri pur/impur (exercice A, à l'oral rapide) : 12 fonctions de TES fichiers passés — pure ou pas, pourquoi ?",
      "0:45-1:30 — Exercice B : la gamme immutabilité.",
      "1:30-1:45 — Pause.",
      "1:45-3:15 — Exercice C : la purification du personnage (le morceau central).",
      "3:15-3:45 — Bonus + quiz.",
      "3:45-4:30 — Auto-correction, commit, journal.",
    ],
    exercise: `**A — Le tri** : parcours tes fichiers des jours 9-13 et classe 12 fonctions : pure / impure (et POURQUOI : quel critère est violé). Note dans les notes du jour. Surprise attendue : la plupart de tes fonctions « logiques » sont déjà presque pures.

**B — La gamme immutabilité** (\`scripts/immutable.js\`) — INTERDICTION de muter l'entrée, vérifie après chaque fonction :
1. \`appliquerRemise(produit, pct)\` → produit neuf au prix remisé.
2. \`ajouterTag(article, tag)\` → tags neufs (et pas de doublon).
3. \`incrementerStat(perso, stat)\` → le perso du jour 10, stats imbriquées (double spread !).
4. \`retirerParId(liste, id)\` / \`mettreAJourParId(liste, id, changements)\` — les 2 gestes de TOUTE app (React te les redemandera mot pour mot).
5. \`deplacerElement(arr, de, vers)\` → nouvel ordre, original intact.

**C — La purification** : reprends TON personnage du jour 10 (qui mute : subirDegats modifie perso). Réécris le TOUT en pur : chaque fonction retourne un NOUVEAU personnage, l'historique complet devient possible : \`const etats = [perso0]; etats.push(subirDegats(etats.at(-1), 20)); ...\` — implémente le scénario de 10 actions en gardant TOUS les états intermédiaires, puis écris \`rejouer(etats)\` qui affiche l'histoire complète, et \`annuler(etats)\` qui revient en arrière (pop). Tu viens d'implémenter undo/redo GRATUITEMENT — impossible avec la version mutante. C'est la démonstration par la pratique de ce que l'immutabilité achète.`,
    bonus: "Le générateur de personnage aléatoire : creerPersonnageAleatoire() utilise Math.random — impure par nature. Purifie-la en PASSANT l'aléa en paramètre : creerPersonnage(des) où des = un tableau de nombres pré-tirés (la coquille tire, le cœur construit). Ce pattern (injecter l'impureté) est EXACTEMENT comment on teste du code « aléatoire » — et comment tu mockeras les appels LLM au mois 11.",
    quiz: [
      { q: "Les 2 critères d'une fonction pure ?", a: "Déterminisme (même entrée → même sortie) et zéro effet de bord (ne modifie ni ne lit rien d'extérieur changeant : fichiers, console, horloge, aléa, arguments mutés)." },
      { q: "console.log rend-il une fonction impure ? Et est-ce grave ?", a: "Oui, techniquement (effet de bord). Gravité contextuelle : un log de debug temporaire, non ; un affichage qui EST le travail de la fonction, oui — sépare calcul et affichage." },
      { q: "Pourquoi { ...perso, stats: { ...perso.stats, pv: 50 } } et pas { ...perso, stats.pv: 50 } ?", a: "Le spread est superficiel : sans le second spread, le nouvel objet PARTAGERAIT l'ancien stats — le muter muterait les deux. Un spread par niveau modifié." },
      { q: "Qu'est-ce que l'historique d'états rend possible ?", a: "Undo/redo, rejeu, debugging par comparaison d'états, time-travel — gratuits si chaque état est un objet neuf ; impossibles si tout mute le même objet." },
    ],
    deliverable: "Le tri A dans les notes, immutable.js (gamme vérifiée), personnage-pur.js avec historique + rejouer + annuler, commit.",
    criteria: ['Gamme : ZÉRO mutation (chaque fonction suivie de sa vérification originale-intact)', 'Purification complète : les 6 fonctions du personnage retournent du neuf', 'Le scénario historique fonctionne, annuler() revient réellement en arrière', 'Tri A : 12/12 classées avec le critère violé nommé'],
    mistakes: ['Le spread manquant au niveau imbriqué (stats) : la gamme 3 est là POUR ça — vérifie que l\'ancien perso.stats.pv n\'a pas bougé', 'sort/reverse/splice dans une fonction « pure » : ils mutent — copie d\'abord ([...arr].sort())', 'Purifier AUSSI l\'affichage : non — rejouer() AFFICHE, c\'est sa raison d\'être, il est la coquille ; la pureté est une discipline du CŒUR, pas une religion totale'],
    resources: ['Tes propres fichiers des jours 9-13 (l\'exercice A est une relecture active)', 'Cherche « pure functions side effects » — mais franchement, la pratique d\'aujourd\'hui EST le cours'],
    aiRule: "Tout en solo aujourd'hui : chaque exercice réinvestit du déjà-vu sous un angle neuf, tu as TOUS les outils. Fin de journée, dialogue utile avec l'IA : « voici mon personnage-pur.js — quelle mutation m'a échappé ? » (il en reste souvent une, cachée dans un push ou un sort).",
    solution: {
      logic: "La purification : chaque fonction suit le même moule — valider (guards, jour 5), construire le nouvel état (spreads aux bons niveaux), le retourner. subirDegats devient : (perso, n) => ({ ...perso, pv: Math.max(0, perso.pv - n) }). Le « KO » (affichage) SORT de la fonction : le cœur calcule l'état, la coquille (rejouer) constate pv === 0 et raconte. Cette séparation est LE geste du jour.",
      simple: `\`\`\`js
const subirDegats = (perso, n) => ({ ...perso, pv: Math.max(0, perso.pv - n) });
const soigner = (perso, n) => ({ ...perso, pv: Math.min(perso.pvMax, perso.pv + n) });
const ramasser = (perso, objet) =>
  poidsTotal(perso) + objet.poids > 50
    ? perso                                          // refus : l'état INCHANGÉ est retourné
    : { ...perso, inventaire: [...perso.inventaire, objet] };

// L'historique — la récompense :
let etats = [persoInitial];
const agir = (fn, ...args) => { etats.push(fn(etats.at(-1), ...args)); };
agir(subirDegats, 20);
agir(soigner, 10);
const annuler = () => { if (etats.length > 1) etats.pop(); };
const rejouer = () => etats.forEach((e, i) => console.log(\`État \${i} : \${e.pv} pv\`));
\`\`\``,
      improved: "Le retour de « perso inchangé » en cas de refus (ramasser, sac plein) mérite débat : l'appelant ne SAIT PAS que ça a échoué (l'état est identique, silencieusement). Alternatives : retourner { etat, succes } (plus riche, plus verbeux), ou lancer une exception (brutal). Il n'y a pas de réponse unique — mais REMARQUER le problème et choisir consciemment, c'est exactement la maturité de conception qu'on évalue. Note ton choix et son pourquoi.",
      pitfalls: ['etats.at(-1) : le dernier état — si .at() est nouveau pour toi : etats[etats.length - 1], identique', 'agir mute etats (push) : OUI — etats est la coquille, le journal de bord ; les ÉTATS eux sont immuables ; mutation de la structure d\'accueil vs mutation des données : la nuance du jour 24 (acc privé) encore à l\'œuvre', 'Purifier equiper : l\'arme référence un objet de l\'inventaire (jour 10)… du NOUVEL inventaire ou de l\'ancien ? Piège profond : référencer par NOM (string) plutôt que par objet évite la question — parfois le modèle de données doit changer pour servir l\'immutabilité'],
      checks: ['Après 10 actions : etats.length === 11, et etats[0] est INTACT (le test ultime : perso0.pv d\'origine)', 'annuler() × 3 puis rejouer() : l\'histoire raccourcit correctement', 'Chaque fonction de la gamme : appel, puis JSON.stringify(original) identique à avant'],
      reflection: ["undo/redo est tombé gratuitement : liste 3 applications que tu utilises où cette capacité existe (éditeur, Git lui-même — chaque commit est un état immuable ! — Photoshop) : l'immutabilité est partout où l'historique compte.", "Le coût : chaque action copie l'objet. À quelle échelle (combien d'états, quelle taille d'objet) faudrait-il s'en soucier, et que ferait-on (structures persistantes, deltas) ? Question ouverte — y penser suffit aujourd'hui."],
    },
  },
  {
    day: 27, title: "Mini-projet stats.js : le pipeline de données complet",
    skill: 'jsts', difficulty: 3, hours: 4.5,
    objective: "Construire seul un analyseur de ventes complet en style fonctionnel pur (map/filter/reduce, immutabilité, cœur pur/coquille impure) — la synthèse de la semaine 4, et l'échauffement du projet 1.",
    concepts: ['Synthèse : tout le fonctionnel de la semaine', 'Pipeline de données bout-en-bout', 'Séparation cœur/coquille appliquée', 'Rapport lisible (le livrable compte autant que le code)'],
    theory: `Deuxième jour d'autonomie méthodique (après le jour 13) — cette fois en style fonctionnel. Rappel du protocole, qui doit devenir un rituel :

1. Lire la spec DEUX fois. 2. Découper en tâches (papier, avec l'ordre des commits). 3. Squelette d'abord. 4. Tester au fil de l'eau. 5. Committer chaque étape. 6. Relire avant de finir.

Contraintes de style du jour (c'est un exercice de GAMME, les contraintes sont l'entraînement) :
- Le cœur : fonctions PURES uniquement — map/filter/reduce en priorité, boucles autorisées où elles sont plus claires (ta doctrine d'hier s'applique).
- La coquille : UN seul endroit qui lit le fichier, UN seul qui affiche.
- Zéro mutation des données chargées.
- Chaque fonction du cœur : testable par un simple appel dans le REPL.

La leçon cachée du jour : tu vas constater que le style fonctionnel rend le découpage ÉVIDENT — chaque question du rapport devient une composition de 2-3 gestes connus. Quand la spec dit « CA par mois », ta tête doit dire « regrouper puis sommer » avant même de penser syntaxe. Si c'est le cas : la semaine 4 est gagnée.`,
    schedule: [
      "0:00-0:20 — Spec lue 2×, découpage papier, plan de commits.",
      "0:20-0:50 — Génère le jeu de données (script fourni dans l'énoncé) + squelette (charger → analyser → afficher, vide mais branché). Commit 1.",
      "0:50-2:00 — Les métriques 1 à 4. Commits au fil de l'eau.",
      "2:00-2:15 — Pause.",
      "2:15-3:15 — Métriques 5 à 7 + le rapport formaté. Commits.",
      "3:15-3:45 — Le test de mutation (relis TOUT : rien ne mute ?) + polish du rapport.",
      "3:45-4:30 — Bonus si le temps, quiz, auto-évaluation, commit final, journal.",
    ],
    exercise: `**La spec stats.js** : d'abord, génère \`data/ventes.json\` : 60 ventes sur 6 mois — {id, date (ISO), produit, categorie, montant, vendeur, quantite}. Écris un petit générateur (20 lignes : tableaux de valeurs possibles + tirage aléatoire — la coquille peut être impure, c'est un outil).

Le rapport à produire (chaque métrique = une fonction pure nommée) :
1. **CA total** et panier moyen (montant moyen par vente).
2. **CA par mois** (trié chronologiquement) — avec l'évolution en % d'un mois à l'autre.
3. **Top 3 produits** par CA, format podium.
4. **CA par vendeur** avec leur % du total — et le vendeur du semestre.
5. **Répartition par catégorie** : CA, nombre de ventes, panier moyen PAR catégorie.
6. **Le mois record** de chaque vendeur (le mois où il a fait son meilleur CA).
7. **Détection d'anomalies** : les ventes dont le montant dépasse 3× le panier moyen de LEUR catégorie (tes premiers outliers — le mois 6 formalisera).

L'affichage final : un rapport structuré et LISIBLE dans le terminal (titres, alignements — ton padEnd du jour 9), généré par UNE fonction qui reçoit toutes les métriques calculées.`,
    bonus: "Ajoute un argument CLI : `node stats.js --mois 2024-03` filtre tout le rapport sur un mois ; `--vendeur Alice` idem par vendeur. Remarque : si ton cœur est bien conçu, ce filtre est UN filter ajouté au chargement — les métriques ne changent PAS d'une ligne. Si tu dois toucher aux métriques, ta séparation fuit : c'est le test d'architecture du jour.",
    quiz: [
      { q: "« CA par mois » : quels gestes composés ?", a: "Regrouper par mois (reduce) puis sommer chaque groupe — ou reduce direct {mois: total}. Puis Object.entries + sort pour l'ordre chronologique." },
      { q: "Pourquoi le générateur de données peut-il être impure sans remords ?", a: "C'est un OUTIL de la coquille, exécuté une fois pour produire un fichier : l'aléa est sa fonction même. La pureté est la discipline du cœur analytique." },
      { q: "L'évolution en % entre mois : quel piège au premier mois ?", a: "Pas de mois précédent → division par rien : le premier mois n'a pas d'évolution (null/\"—\"), et divisions par zéro si un mois est à 0 — les cas limites des données réelles." },
      { q: "Pourquoi une fonction d'affichage UNIQUE qui reçoit tout ?", a: "Le format se change en un endroit ; les métriques restent testables sans rien afficher ; et demain le « rapport » peut devenir un fichier HTML sans toucher au cœur — la frontière du jour 9/26, en grand." },
    ],
    deliverable: "generateur.js, data/ventes.json, stats.js complet (cœur pur + coquille), le rapport affiché (copie dans les notes), historique Git progressif (5+ commits), auto-évaluation.",
    criteria: ['Les 7 métriques justes (vérifie 2 d\'entre elles à la main sur un sous-ensemble)', 'Test de mutation passé : les données chargées sont INTACTES après le rapport complet', 'Chaque métrique appelable seule dans le REPL (prouve-le pour 3)', 'Rapport final digne d\'être montré (c\'est un LIVRABLE, pas un debug)', 'Autonomie : combien de fois as-tu eu besoin d\'aide ? (note-le, compare au jour 13)'],
    mistakes: ['Les dates : "2024-03-15" → le mois est date.slice(0, 7) ("2024-03") — pas besoin d\'objets Date pour regrouper, les strings ISO trient chronologiquement (jour 12)', 'L\'anomalie par catégorie calculée avec le panier moyen GLOBAL : relis la spec (« de LEUR catégorie ») — lire précisément est LA compétence testée par cette métrique', 'Tout écrire puis tout tester : le squelette-d\'abord existe pour l\'éviter — chaque métrique se vérifie dans les 2 minutes qui suivent son écriture'],
    resources: ['Tes fichiers des jours 22-26 : ils contiennent CHAQUE pattern nécessaire (c\'est volontaire)', 'Le rapport de ventes du jour 24 : la métrique 4 en est la sœur — pars de là'],
    aiRule: "Comme au jour 13 : 3 premières heures SANS IA (tes propres fichiers sont ta doc — apprendre à y puiser est le but). Dernière heure : aide possible sur UN blocage, noté au journal. L'auto-évaluation d'autonomie du soir est une donnée clé de ta progression : sois exact.",
    solution: {
      logic: "Pas de correction ligne à ligne (jour d'autonomie) — les questions d'auto-revue : (1) Chaque métrique est-elle une fonction (ventes) => resultat, sans affichage dedans ? (2) La 6 (mois record par vendeur) — la plus dure — compose-t-elle un double regroupement (vendeur PUIS mois) ou un reduce à clé composée (\"Alice|2024-03\") ? Les deux marchent : as-tu CHOISI ou subi ? (3) La 7 calcule-t-elle les paniers moyens par catégorie UNE fois (Map de moyennes) ou re-parcourt-elle tout PAR vente (O(n²) silencieux) ? Ton jour 15 doit tinter.",
      simple: `Le squelette attendu (la forme, pas le remplissage) :
\`\`\`js
// ===== COQUILLE (impure, aux extrémités) =====
const ventes = JSON.parse(fs.readFileSync("data/ventes.json", "utf8"));
// ===== CŒUR (pur, testable, le corps du fichier) =====
const caTotal = (ventes) => ventes.reduce((t, v) => t + v.montant, 0);
const caParMois = (ventes) => { /* regrouper (slice(0,7)) → sommer → trier */ };
const topProduits = (ventes, n = 3) => { /* regrouper → sommer → entries → sort → slice */ };
const anomalies = (ventes) => {
  const moyennes = panierMoyenParCategorie(ventes);      // calculé UNE fois
  return ventes.filter((v) => v.montant > 3 * moyennes[v.categorie]);
};
// ===== COQUILLE (affichage, la dernière fonction) =====
console.log(genererRapport({ caTotal: caTotal(ventes), /* ... */ }));
\`\`\``,
      improved: "La métrique 6 en double regroupement lisible : d'abord caParVendeurParMois = reduce vers { Alice: { \"2024-03\": 1200, ... }, ... }, puis un map sur les entries qui prend le max de chaque sous-objet. Deux étapes NOMMÉES battent un reduce-monstre : si quelqu'un (toi dans 3 mois) lit « moisRecordParVendeur(ventes) » et comprend en 10 secondes, c'est gagné.",
      pitfalls: ['L\'évolution % : ((mois - precedent) / precedent) * 100 — précédent nul ou premier mois : garde. Et l\'ARRONDI d\'affichage (toFixed) dans la coquille, pas dans le calcul', 'Les % par vendeur doivent sommer à ~100 (arrondis) : vérification d\'intégrité gratuite — un rapport qui somme à 87% a un bug quelque part', 'Si generateur.js produit des montants à 15 décimales (Math.random pur) : arrondis À LA GÉNÉRATION — des données propres en amont épargnent tous les avals (leçon ETL du mois 5, en avance)'],
      checks: ['CA total = somme des CA par mois = somme des CA par vendeur (LA triple vérification d\'intégrité — si ça diverge, un regroupement perd des ventes)', 'Le test de mutation : JSON.stringify(ventes) avant/après le rapport, identique', 'Le rapport relu à voix haute : chaque ligne se comprend sans regarder le code ?'],
      reflection: ["Compare ton autonomie à celle du jour 13 (tes notes en font foi) : où est le progrès, où est le plateau ? Le projet 1 (dans 8 jours) est calibré sur cette trajectoire.", "Ta triple vérification d'intégrité (total = Σ mois = Σ vendeurs) : c'est un INVARIANT de données (jour 16, encore lui). Les pipelines du mois 5 et les évaluations RAG du mois 9 vivront de ces vérifications croisées — tu viens d'inventer le test de cohérence."],
    },
  },
  // Jour 28 = revue hebdo semaine 4 + revue mensuelle mois 1 (généré automatiquement).
  {
    day: 29, title: "Récursion niveau 2 : structures imbriquées réelles",
    skill: 'algo', difficulty: 4, hours: 4.5,
    objective: "Muscler la récursion sur les cas réels : aplatir, fouiller et transformer du JSON profond, compter dans des structures mixtes — le pont entre l'algo et les données du monde réel.",
    concepts: ['Récursion sur structures mixtes (tableaux + objets)', 'Array.isArray / typeof', 'Aplatissement', 'Recherche en profondeur dans du JSON', 'Transformation récursive (deep map)', 'Copie profonde maison'],
    theory: `La récursion du jour 25 travaillait sur des structures HOMOGÈNES (que des nombres, un seul type de nœud). Le monde réel est MIXTE : un JSON d'API contient des objets dans des tableaux dans des objets, à profondeur imprévisible. La config d'une app, la réponse d'une API, l'état d'une interface : tout est arbre mixte.

Le kit de discernement (les trois questions à poser à chaque valeur) :
\`\`\`js
if (Array.isArray(x)) { /* un tableau : récurse sur chaque élément */ }
else if (x !== null && typeof x === "object") { /* un objet : récurse sur chaque valeur */ }
else { /* une feuille (string, number, bool, null) : cas de base */ }
\`\`\`
ATTENTION : typeof null === "object" (le bug historique du jour 4 — il MORD ici, d'où le x !== null AVANT).

Ce squelette à trois branches est LE moule de toute fonction récursive sur données mixtes : aplatir, chercher, transformer, copier, compter — tout le programme du jour est ce moule avec des remplissages différents. L'objectif : qu'en fin de journée, tu écrives ce moule les yeux fermés.

Pourquoi ça compte pour la suite : les documents que tu chunkeras au mois 8 (RAG) sont des arbres (sections/sous-sections), les réponses structurées des LLM sont du JSON profond à valider, le DOM est un arbre. La récursion mixte est l'outil de base de TOUTE manipulation de données semi-structurées.`,
    schedule: [
      "0:00-0:30 — Théorie + écris le moule à 3 branches de mémoire, 2 fois, jusqu'à fluidité.",
      "0:30-1:30 — Exercice A : aplatir (les 2 versions) + compter les feuilles.",
      "1:30-1:45 — Pause.",
      "1:45-3:00 — Exercice B : la fouille du JSON (le plat principal).",
      "3:00-3:45 — Exercice C : deep map et copie profonde.",
      "3:45-4:30 — Bonus, quiz, auto-correction, commit, journal.",
    ],
    exercise: `**A — Aplatissements** (\`scripts/recursion2.js\`) :
1. \`aplatir(arr)\` : [1,[2,[3,[4]]],5] → [1,2,3,4,5] (profondeur quelconque).
2. \`aplatirNiveau(arr, n)\` : n'aplatit que n niveaux (comme flat(n) natif — compare tes résultats aux siens : oracle gratuit).
3. \`compterFeuilles(structure)\` : combien de valeurs « feuilles » dans une structure mixte quelconque ? ({a: [1, {b: 2}], c: 3} → 3 feuilles).

**B — La fouille** : construis (ou récupère d'une vraie API si tu veux) un JSON riche : une entreprise avec départements, équipes, employés, chacun avec des champs variés, 4+ niveaux. Puis :
1. \`chercherCle(obj, cle)\` → TOUTES les valeurs portant cette clé, où qu'elles soient ({...} → chercherCle(data, "email") → toutes les adresses du JSON).
2. \`cheminsVers(obj, cle)\` → les CHEMINS complets ("entreprise.departements[0].equipes[1].lead.email") — la remontée de chemin du jour 25, en mixte.
3. \`sommeDesCles(obj, cle)\` → la somme de toutes les valeurs numériques de cette clé (tous les "salaire" du JSON, où qu'ils soient).

**C — Transformations** :
1. \`deepMap(structure, fn)\` → applique fn à TOUTES les feuilles, structure préservée ({a: [1, 2]} avec x2 → {a: [2, 4]}).
2. \`copieProfonde(structure)\` → la vraie copie intégrale (compare avec le spread superficiel : modifie l'imbriqué de la copie, l'original doit rester INTACT — le test qui distingue). Puis compare à structuredClone natif et à ton JSON.parse(JSON.stringify(...)) du jour 11 : trois outils, quelles différences (fonctions ? dates ? références circulaires ?) ?`,
    bonus: "`chercherCle` sur une structure CIRCULAIRE (a.ref = a — construis-la) : stack overflow. Répare avec un Set de « déjà visités » (avant-goût du jour 30 ET des parcours de graphes de la semaine 6). C'est la différence entre un outil jouet et un outil robuste.",
    quiz: [
      { q: "Le moule à 3 branches, de mémoire ?", a: "Array.isArray(x) → récurse éléments ; sinon x !== null && typeof x === 'object' → récurse valeurs (Object.values) ; sinon → feuille, cas de base." },
      { q: "Pourquoi le x !== null AVANT le typeof === 'object' ?", a: "typeof null === 'object' (bug historique JS) : sans la garde, on tenterait Object.values(null) → crash." },
      { q: "deepMap préserve la structure : qu'est-ce que ça implique pour les objets ?", a: "Reconstruire un objet NEUF avec les mêmes clés (entries → map → fromEntries, ou boucle), pas un tableau — la forme suit la branche du moule." },
      { q: "Quand copieProfonde maison vs structuredClone ?", a: "structuredClone en production (natif, robuste, gère les cycles) ; la version maison pour COMPRENDRE — et dans les entretiens, où on te la demandera telle quelle." },
    ],
    deliverable: "recursion2.js (les 8 fonctions testées sur ta structure d'entreprise), le JSON de test riche, notes sur les 3 comparaisons de copie, commit.",
    criteria: ['Le moule écrit de mémoire en fin de journée (teste-toi vraiment)', 'cheminsVers : chemins EXACTS vérifiés à la main sur 3 cas', 'copieProfonde : le test de l\'imbriqué modifié passé', 'Tout fonctionne sur TA structure ET sur un JSON que tu n\'as pas construit (échange : prends-en un d\'une API publique)'],
    mistakes: ['Oublier la branche objet (ne gérer que tableaux) : compterFeuilles({a: 1}) → 0 au lieu de 1 — teste les DEUX types de conteneurs', 'cheminsVers : construire le chemin en DESCENDANT (accumulateur en paramètre) ou en REMONTANT (préfixage au retour) — les deux marchent, mais les mélanger donne des chemins fantaisistes ; choisis UN style', 'La notation [0] vs .0 dans les chemins : décide d\'une convention (crochets pour les index de tableaux) et tiens-la — la cohérence du format EST une partie de l\'exercice'],
    resources: ['javascript.info — "Recursion" section objets imbriqués', 'MDN — structuredClone (lis ce qu\'il ne peut PAS cloner : la liste est instructive)'],
    aiRule: "Le moule à 3 branches : reconstruis-le seul autant de fois que nécessaire — c'est LE livrable mental du jour. Les 8 fonctions : 30-45 min de combat chacune avant indice. Bon usage IA du soir : « génère-moi un JSON tordu de 6 niveaux avec des pièges (null, tableaux vides, clés homonymes) » puis fouille-le avec TES outils — l'IA fabrique le terrain d'entraînement, pas les réponses.",
    solution: {
      logic: "Tout le jour tient dans le moule. chercherCle l'illustre entièrement : brancher selon le type, et dans la branche objet, AVANT de récurser sur les valeurs, regarder si la clé cherchée est LÀ (Object.entries donne les deux). L'accumulation des résultats : soit un tableau passé en paramètre (style accumulateur), soit concaténer les retours (style remontée) — mêmes deux styles qu'au jour 25, choisis et assume.",
      simple: `\`\`\`js
function chercherCle(x, cle) {
  if (Array.isArray(x)) {
    return x.flatMap((element) => chercherCle(element, cle));
  }
  if (x !== null && typeof x === "object") {
    const resultats = [];
    for (const [k, v] of Object.entries(x)) {
      if (k === cle) resultats.push(v);            // trouvée ICI
      resultats.push(...chercherCle(v, cle));       // ET on continue en dessous
    }
    return resultats;
  }
  return [];                                        // feuille : rien à trouver dedans
}
function deepMap(x, fn) {
  if (Array.isArray(x)) return x.map((e) => deepMap(e, fn));
  if (x !== null && typeof x === "object")
    return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, deepMap(v, fn)]));
  return fn(x);                                     // feuille : ENFIN on applique
}
\`\`\``,
      improved: `La version robuste aux cycles (bonus) — le pattern « déjà visité » :
\`\`\`js
function chercherCleSure(x, cle, vus = new Set()) {
  if (x !== null && typeof x === "object") {
    if (vus.has(x)) return [];                      // déjà exploré : cycle coupé
    vus.add(x);
  }
  // ... le reste du moule, en passant vus aux appels récursifs
}
\`\`\`
Le Set mémorise les RÉFÉRENCES d'objets visités. Ce pattern exact (marquer les visités) est le cœur de BFS/DFS sur les graphes (semaine 6) — tu viens de le rencontrer par nécessité, la meilleure façon.`,
      pitfalls: ['flatMap dans la branche tableau : map donnerait des tableaux de tableaux de résultats (le problème du bonus jour 23 — boucle bouclée)', 'Object.fromEntries : l\'inverse d\'entries — si inconnu, la boucle qui construit un objet neuf est équivalente', 'copieProfonde sur une Date : typeof === "object" → ta fonction la traverse comme un objet vide ({}). structuredClone la gère. Ta version maison a le droit d\'être limitée SI tu sais dire où (documenter les limites > prétendre l\'universalité)'],
      checks: ['chercherCle(data, "email").length correspond au comptage manuel', 'deepMap(data, x => x) reproduit la structure À L\'IDENTIQUE (le test miroir : fn neutre = clone !)', 'La circulaire (bonus) : plus de crash, résultats corrects'],
      reflection: ["deepMap avec fn neutre EST une copie profonde : deux fonctions du jour n'en sont qu'une — quelle généralisation vois-tu (indice : chercherCle est-il un deepReduce déguisé ?) ?", "Les chunks de documents du mois 8 seront des arbres (doc → sections → paragraphes) à aplatir intelligemment : reformule aplatirNiveau dans ce vocabulaire (« aplatir jusqu'aux sections, pas jusqu'aux phrases »)."],
    },
  },
  {
    day: 30, title: "Map et Set : les structures du O(1)",
    skill: 'ds', difficulty: 3, hours: 4.5,
    objective: "Maîtriser Map et Set, comprendre le hachage (l'idée, pas les détails), et réécrire en O(n) trois de tes anciennes solutions O(n²) — la journée où le mois 1 boucle sa boucle.",
    concepts: ['Le hachage : l\'intuition', 'Map vs objet (clés de tout type, size, itération)', 'Set : appartenance O(1), unicité', 'Le refactor O(n²) → O(n)', 'Compter, dédoublonner, croiser : les 3 gestes en O(n)', 'Quand l\'objet suffit encore'],
    theory: `Comment retrouver une valeur en O(1) parmi des millions ? Le **hachage** : une fonction transforme la clé en position mémoire ("Alice" → case 7). Chercher = recalculer la position = direct, sans parcourir. C'est l'idée derrière Map, Set, les objets JS, les index de bases de données (mois 5), les caches — la moitié de l'informatique repose sur cette astuce.

**Map** vs objet simple :
- Clés de N'IMPORTE quel type (objets, nombres VRAIS — l'objet convertit tout en string).
- \`.size\` direct, itération dans l'ordre d'insertion, \`.has()\` explicite.
- API : \`set(k, v)\`, \`get(k)\`, \`has(k)\`, \`delete(k)\`, itérable en [k, v].
- L'objet reste PARFAIT pour des données structurées à clés connues ({nom, prix}) : Map est pour les COLLECTIONS dynamiques clé→valeur.

**Set** : une collection de valeurs UNIQUES avec appartenance O(1) : \`add\`, \`has\`, \`delete\`. Dédoublonner devient \`[...new Set(arr)]\` — une ligne.

**Le geste du jour** : le refactor O(n²) → O(n). Ton sansDoublons du jour 8 (boucle + includes = O(n²)) devient O(n) avec un Set : on ÉCHANGE de la mémoire (la structure auxiliaire) contre du temps (plus de re-parcours). Annoncé au jour 15, incarné aujourd'hui. Les trois gestes à automatiser : COMPTER (Map de compteurs), DÉDOUBLONNER (Set), CROISER deux collections (Set de l'une, parcours de l'autre — l'intersection en O(n+m) au lieu de O(n×m)).`,
    schedule: [
      "0:00-0:45 — Théorie + REPL : toute l'API Map et Set, un objet comme clé de Map (impossible avec {}), l'ordre d'itération.",
      "0:45-1:45 — Exercice A : les 3 refactors chronométrés (avant/après mesurés).",
      "1:45-2:00 — Pause.",
      "2:00-3:00 — Exercice B : la gamme Map/Set.",
      "3:00-3:45 — Exercice C : l'index inversé (le mini-moteur de recherche).",
      "3:45-4:30 — Bonus, quiz, auto-correction, commit, journal — et clôture du premier mois : relis tes notes du jour 1.",
    ],
    exercise: `**A — Les 3 refactors** (reprends TES fichiers, mesure avant/après sur 100 000 éléments) :
1. \`sansDoublons\` (jour 8) : boucle+includes → Set. Ratio de temps ?
2. \`contientDoublon\` (jour 15, le benchmark) : double boucle → Set avec arrêt anticipé (return true dès qu'un has() répond oui). Ratio ?
3. \`anagrammes\` (kata jour 20 si fait, sinon écris-la) : version tri (O(n log n)) vs version Map de compteurs (O(n)) — laquelle est la plus LISIBLE ? (Les deux réponses se défendent : note la tienne.)

**B — La gamme** (\`scripts/map-set.js\`) :
1. \`frequences(arr)\` → Map valeur→count (le geste COMPTER, définitif).
2. \`premierUnique(str)\` → le premier caractère non répété, en DEUX passes O(n) (compter, puis rechercher) — pourquoi pas en une ?
3. \`intersection(arr1, arr2)\` et \`difference(arr1, arr2)\` → en O(n+m) (le geste CROISER).
4. \`grouperAnagrammes(mots)\` → [["chien","niche"],["arbre"],...] — l'astuce : la clé de groupe est le mot TRIÉ ("chien"→"cehin") ; Map signature→groupe.
5. \`caches = new Map()\` : réécris ton memoriser du jour 22 avec une Map (que gagne-t-on vs l'objet ? Les clés non-string, size pour limiter le cache...).

**C — L'index inversé** : sur 20 phrases (tableau de strings), construis \`index = Map mot→Set d'indices de phrases\`. Puis \`rechercher(mots...)\` → les phrases contenant TOUS les mots (intersection de Sets !). C'est — littéralement — le cœur d'un moteur de recherche, et le cousin direct de la recherche lexicale que tu ajouteras à ton RAG au mois 9 (BM25 est un index inversé sophistiqué). 30 lignes de code, une idée immense.`,
    bonus: "LRU cache (Least Recently Used) : un memoriser à capacité limitée (100 entrées max) qui évicte la MOINS récemment utilisée. L'astuce Map : l'ordre d'insertion est garanti — delete + re-set déplace une clé en fin, la première clé de l'itération est la plus ancienne. C'est une VRAIE question d'entretien (et le vrai fonctionnement des caches partout).",
    quiz: [
      { q: "Pourquoi Map.has est-il O(1) là où arr.includes est O(n) ?", a: "Le hachage calcule directement OÙ regarder (position dérivée de la clé) ; includes doit parcourir jusqu'à trouver. Structure vs parcours." },
      { q: "Map ou objet simple : le critère de choix ?", a: "Collection dynamique clé→valeur (clés inconnues d'avance, de tout type, besoin de size/itération) → Map. Donnée structurée à champs connus → objet." },
      { q: "L'intersection en O(n+m) : le déroulé ?", a: "Set du premier tableau (O(n)), puis parcours du second en testant has() (O(m) × O(1)). La version double-boucle : O(n×m)." },
      { q: "Le grand compromis illustré par tous les refactors du jour ?", a: "Mémoire contre temps : la structure auxiliaire (Set/Map) coûte de l'espace mais supprime les re-parcours. Presque toujours rentable — sauf mémoire contrainte ou n minuscule." },
    ],
    deliverable: "Les 3 refactors avec mesures avant/après (notes/big-o.md, section finale — le fichier du mois 1 se referme en beauté), map-set.js, index-inverse.js, commit.",
    criteria: ['Refactors : ratios mesurés et conformes (des centaines de fois plus rapide sur 100k)', 'Gamme 5/5, dont grouperAnagrammes (le plus subtil)', 'Index inversé : rechercher("mot1", "mot2") vérifié à la main', 'Tu sais raconter le hachage en 30 secondes (teste-toi à voix haute — question d\'entretien direct)'],
    mistakes: ['new Map(arr) vs new Set(arr) : Map attend des PAIRES [[k,v],...] — l\'erreur de construction classique', 'premierUnique en tentant UNE passe : au moment où tu lis un caractère, tu ne sais pas encore s\'il se répétera PLUS LOIN — les deux passes sont NÉCESSAIRES, comprendre pourquoi vaut l\'exercice', 'L\'index inversé sans normalisation (minuscules, ponctuation) : "Chien" et "chien." deviennent deux mots — le nettoyage AVANT l\'indexation (leçon data du mois 5, en germe)'],
    resources: ['javascript.info — "Map and Set"', 'Curiosité récompensée : cherche "how do hash tables work" (10 min de vidéo suffisent — l\'intuition des collisions et du redimensionnement)'],
    aiRule: "Refactors et gamme : seul — c'est du réinvestissement pur, tout est dans tes fichiers. L'index inversé : combat de 45 min autorisé avant indice (le déclic Set-dans-Map vaut la lutte). Clôture du mois : demande à l'IA un quiz de 20 questions sur TOUT le mois 1 (donne-lui la liste des concepts) — ton premier examen blanc auto-organisé.",
    solution: {
      logic: "L'index inversé : à la construction, pour chaque phrase i, pour chaque mot normalisé → index.get(mot).add(i) (avec l'initialisation si absent). À la recherche : récupérer le Set de chaque mot cherché (un mot inconnu → résultat vide, court-circuit), puis intersecter les Sets (commencer par le plus PETIT : optimisation gratuite). Deux Map/Set imbriqués, et c'est un moteur de recherche.",
      simple: `\`\`\`js
function construireIndex(phrases) {
  const index = new Map();
  phrases.forEach((phrase, i) => {
    const mots = phrase.toLowerCase().replace(/[.,!?]/g, "").split(/\\s+/);
    for (const mot of mots) {
      if (!index.has(mot)) index.set(mot, new Set());
      index.get(mot).add(i);
    }
  });
  return index;
}
function rechercher(index, phrases, ...motsCherches) {
  const sets = motsCherches.map((m) => index.get(m.toLowerCase()) ?? new Set());
  if (sets.some((s) => s.size === 0)) return [];        // un mot inconnu : personne
  sets.sort((a, b) => a.size - b.size);                  // partir du plus petit
  let resultat = [...sets[0]];
  for (const s of sets.slice(1)) resultat = resultat.filter((i) => s.has(i));
  return resultat.map((i) => phrases[i]);
}
\`\`\``,
      improved: `Le LRU (bonus) — l'élégance de l'ordre d'insertion garanti :
\`\`\`js
function creerLRU(capacite) {
  const cache = new Map();
  return {
    get(k) {
      if (!cache.has(k)) return undefined;
      const v = cache.get(k);
      cache.delete(k); cache.set(k, v);        // touché → déplacé en fin (récent)
      return v;
    },
    set(k, v) {
      if (cache.has(k)) cache.delete(k);
      cache.set(k, v);
      if (cache.size > capacite)
        cache.delete(cache.keys().next().value); // la 1re clé = la plus ancienne
    },
  };
}
\`\`\`
Closure (jour 22) + Map (aujourd'hui) + la politique d'éviction : trois briques, un composant de niveau production. Ton cache LLM du mois 10 sera EXACTEMENT ceci, avec un disque derrière.`,
      pitfalls: ['split(/\\s+/) vs split(" ") : les espaces multiples créent des mots vides "" avec la version naïve — les données réelles sont sales, toujours', 'sets.sort par size : muter l\'ordre des sets est ici inoffensif (tableau local) — ton radar mutation (jour 26) doit avoir tiqué PUIS validé : c\'est exactement le réflexe visé', '?? new Set() pour un mot inconnu : sans ça, undefined.size crashe — la frontière (entrée utilisateur) se garde toujours (jour 5, jour 12, toujours)'],
      checks: ['frequences(["a","b","a"]) : Map {a→2, b→1} et .size === 2', 'intersection mesurée : 100k × 100k éléments en < 100ms (la double boucle : minutes)', 'rechercher avec 2 mots : vérifié contre un comptage manuel sur tes 20 phrases'],
      reflection: ["Regarde le chemin : jour 4 (un objet {} pour les taux), jour 11 (regrouper), jour 22 (cache), jour 30 (index inversé) — la MÊME structure clé→valeur, de plus en plus puissante. Qu'est-ce qui a changé : l'outil, ou ta capacité à VOIR où il s'applique ?", "Demain commence le mois 2 (structures et TypeScript). Relis tes notes du jour 1 : écris 5 lignes à celui que tu étais — c'est ton premier bilan de transformation, il y en aura 11 autres."],
    },
  },
];
