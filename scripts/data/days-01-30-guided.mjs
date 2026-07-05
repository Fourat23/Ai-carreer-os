// Suppléments jours 1-30 : « Exemple guidé » (pas-à-pas AVANT l'exercice autonome)
// + « À retenir » + éventuel « Pourquoi ça comptera plus tard » spécifique.
// Fusionné par le générateur. Les jours de revue (7,14,21,28) sont exclus.

export const GUIDED_01_30 = {
  1: {
    guidedExample: `**Énoncé simple** : crée un dossier \`demo\`, mets-y un fichier \`bonjour.js\` qui affiche « Salut », et exécute-le — le tout au terminal.

**Raisonnement** : je décompose en 4 gestes (créer le dossier → y entrer → créer le fichier avec du contenu → l'exécuter), et à chaque geste je me demande *où suis-je dans l'arbre ?*

**Solution** :
\`\`\`bash
mkdir demo
cd demo
echo 'console.log("Salut");' > bonjour.js
node bonjour.js
\`\`\`

**Explication ligne par ligne** :
- \`mkdir demo\` crée le dossier (depuis ma position actuelle).
- \`cd demo\` m'y déplace : mon répertoire courant est maintenant \`demo\`.
- \`echo '...' > bonjour.js\` écrit le texte dans un fichier (le \`>\` redirige la sortie de echo vers le fichier, qu'il crée).
- \`node bonjour.js\` lance Node, qui lit le fichier et exécute le JS → affiche « Salut ».

**Variante** : \`node ../demo/bonjour.js\` depuis le dossier parent (chemin relatif remontant d'un cran avec \`..\`). Essaie et observe : le résultat est identique, seule l'adresse change.`,
    takeaways: [
      "Le système de fichiers est un arbre ; à tout instant, ton terminal est positionné quelque part (`pwd`).",
      "Une commande = un programme + des arguments, exécuté depuis ta position courante.",
      "`node fichier.js` exécute du JavaScript hors navigateur ; `>` redirige une sortie vers un fichier.",
      "Chemin absolu (depuis `/`) vs relatif (depuis ici, avec `.` et `..`) : la source du trajet change tout.",
    ],
  },
  2: {
    guidedExample: `**Énoncé** : écris \`double.js\` qui prend un nombre en argument et affiche son double ; sans argument, affiche un mode d'emploi et sort en erreur.

**Raisonnement** : pattern universel *parser → valider → traiter*. Les arguments sont dans \`process.argv\` (à partir de l'index 2).

**Solution** :
\`\`\`js
const n = Number(process.argv[2]);
if (Number.isNaN(n)) {
  console.error("Usage : node double.js <nombre>");
  process.exit(1);
}
console.log(n * 2);
\`\`\`

**Explication** :
- \`process.argv[2]\` = le premier vrai argument (0 = node, 1 = le script).
- \`Number(...)\` convertit ; \`Number.isNaN\` détecte l'échec (« abc » → NaN).
- \`process.exit(1)\` signale un échec au shell (utile en CI et pour enchaîner des commandes).

**Variante** : accepter PLUSIEURS nombres et tous les doubler — remplace \`argv[2]\` par \`argv.slice(2)\` et boucle.`,
    takeaways: [
      "`process.argv` transforme un script en outil paramétrable (les arguments commencent à l'index 2).",
      "Toujours *parser → valider → traiter* : valider AVANT de traiter évite la moitié des bugs.",
      "Un code de sortie non nul (`process.exit(1)`) signale un échec — indispensable pour la CI plus tard.",
    ],
  },
  3: {
    guidedExample: `**Énoncé** : versionne un petit projet en deux commits cohérents.

**Raisonnement** : un commit = un changement cohérent. Deux modifications de nature différente → deux commits, grâce au staging sélectif.

**Solution** :
\`\`\`bash
git init
echo "# Mon projet" > README.md
git add README.md
git commit -m "Ajoute le README initial"
echo "console.log('v1');" > app.js
git add app.js
git commit -m "Ajoute le script principal app.js"
git log --oneline
\`\`\`

**Explication** : \`git add\` place dans la zone de staging (la sélection) ; \`git commit\` fige la photo. En committant SÉPARÉMENT README et app.js, l'historique raconte deux étapes distinctes et lisibles.

**Variante** : \`git add -p\` te montre chaque bloc modifié et te demande de le stager ou non — le meilleur exercice pour comprendre le staging.`,
    takeaways: [
      "Trois zones : working directory → (add) → staging → (commit) → historique.",
      "Un commit = un changement cohérent + un message impératif clair.",
      "`.gitignore` exclut dépendances et secrets ; `git status` explique toujours quoi faire.",
    ],
  },
  4: {
    guidedExample: `**Énoncé** : prédis puis vérifie ce qu'affichent \`"3" + 4\` et \`"3" * 4\`.

**Raisonnement** : le \`+\` est ambigu (addition OU concaténation) ; dès qu'une string est présente, il CONCATÈNE. Le \`*\` n'existe que pour les nombres, donc il CONVERTIT.

**Solution & explication** :
\`\`\`js
console.log("3" + 4); // "34"  → concaténation (une string présente)
console.log("3" * 4); // 12    → "3" converti en nombre 3, puis 3*4
console.log(typeof ("3" + 4)); // "string"
console.log(typeof ("3" * 4)); // "number"
\`\`\`
Le type du RÉSULTAT change selon l'opérateur : c'est le piège central de JS, et la raison pour laquelle on compare toujours avec \`===\`.

**Variante** : teste \`"3" - 1\`, \`"3" == 3\`, \`"3" === 3\`. Note lesquels te surprennent — ce sont tes points à consolider.`,
    takeaways: [
      "Les conversions implicites sont le piège fondateur de JS : `+` concatène, `-`/`*` convertissent.",
      "Toujours comparer avec `===` (valeur ET type), jamais `==`.",
      "`const` par défaut, `let` seulement si réassignation ; `typeof` révèle le type.",
    ],
  },
  5: {
    guidedExample: `**Énoncé** : une fonction \`categorieAge(age)\` qui renvoie "enfant" (<12), "ado" (12-17), "adulte" (≥18).

**Raisonnement** : l'ordre des conditions EST la logique — du cas le plus spécifique au plus général. J'utilise des guard clauses (retours anticipés) pour rester à plat.

**Solution** :
\`\`\`js
function categorieAge(age) {
  if (age < 0) return "invalide";   // guard : cas aberrant d'abord
  if (age < 12) return "enfant";
  if (age < 18) return "ado";
  return "adulte";
}
\`\`\`

**Explication** : chaque \`return\` sort dès qu'un cas matche — pas besoin de \`else\`. L'ordre garantit qu'à la ligne « ado », on sait déjà que age ≥ 12. Zéro imbrication : lisible de haut en bas.

**Variante** : ajoute "senior" (≥65). Où insères-tu le test ? (Avant le \`return "adulte"\` final — l'ordre décide de l'atteignabilité.)`,
    takeaways: [
      "Les 6 valeurs falsy : `false, 0, \"\", null, undefined, NaN` — tout le reste est truthy.",
      "Guard clauses (retours anticipés) : elles évacuent les cas invalides et gardent le code à plat.",
      "L'ordre des conditions est la logique ; un cas placé après un `else` général devient inatteignable.",
    ],
  },
  6: {
    guidedExample: `**Énoncé** : somme des nombres de 1 à n avec une boucle.

**Raisonnement** : pattern accumulateur — une variable qui grandit à chaque tour. Attention à l'off-by-one : je veux INCLURE n, donc \`<= n\`.

**Solution** :
\`\`\`js
function somme(n) {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total += i;
  }
  return total;
}
somme(3); // 1 + 2 + 3 = 6
\`\`\`

**Explication ligne par ligne** : \`total\` démarre à 0 ; la boucle va de 1 à n INCLUS (\`<=\`) ; \`total += i\` ajoute chaque nombre. Teste mentalement les bornes : i=1 (premier), i=n (dernier) — c'est là que se cachent les off-by-one.

**Variante** : avec un \`while\`, ou avec la formule \`n*(n+1)/2\` (O(1) au lieu de O(n) — un avant-goût du jour 15).`,
    takeaways: [
      "Trois boucles : `for` (index connu), `for...of` (chaque élément), `while` (condition).",
      "Pattern accumulateur : une variable initialisée avant, mise à jour dans la boucle.",
      "L'off-by-one (`<` vs `<=`) est l'erreur n°1 : teste toujours la première et la dernière itération.",
    ],
  },
  8: {
    guidedExample: `**Énoncé** : ajouter un élément à une copie d'un tableau, sans toucher l'original.

**Raisonnement** : \`const b = a\` NE copie pas (référence partagée). Pour une vraie copie : le spread \`[...a]\`.

**Solution & explication** :
\`\`\`js
const a = [1, 2, 3];
const b = [...a];   // copie superficielle : b est un NOUVEAU tableau
b.push(4);
console.log(a);     // [1, 2, 3]  → intact
console.log(b);     // [1, 2, 3, 4]
\`\`\`
Compare avec le piège : \`const c = a; c.push(9)\` → \`a\` contient 9 aussi (même tableau, deux étiquettes).

**Variante** : essaie \`slice()\` (\`const b = a.slice()\`) — équivalent. Puis observe que la copie est SUPERFICIELLE : un objet imbriqué dans le tableau reste partagé.`,
    takeaways: [
      "`const b = a` sur un tableau/objet ne copie RIEN : les deux pointent le même (référence).",
      "Copier : `[...a]` ou `a.slice()` — mais copie SUPERFICIELLE (un seul niveau).",
      "`slice` copie sans muter ; `splice` mute sur place — ne pas les confondre.",
    ],
  },
  9: {
    guidedExample: `**Énoncé** : séparer un calcul de son affichage.

**Raisonnement** : une fonction = une responsabilité. Le CALCUL retourne une valeur (testable), l'AFFICHAGE la présente (se regarde).

**Solution** :
\`\`\`js
const prixTTC = (ht, taux = 0.2) => ht * (1 + taux);   // pur : entrée → sortie
function afficherPrix(ht) {                             // effet : affiche
  console.log(\`\${ht} € HT = \${prixTTC(ht).toFixed(2)} € TTC\`);
}
afficherPrix(100); // 100 € HT = 120.00 € TTC
\`\`\`

**Explication** : \`prixTTC\` est PURE (même entrée → même sortie, aucun effet) — je peux la tester d'un simple \`prixTTC(100) === 120\`. \`afficherPrix\` compose le calcul et le présente. Cette frontière calcul/présentation est le germe de toutes les architectures.

**Variante** : \`prixTTC\` avec un taux différent (\`prixTTC(100, 0.055)\`) grâce au paramètre par défaut.`,
    takeaways: [
      "Une fonction = une responsabilité, un type de retour cohérent.",
      "Séparer le calcul (pur, testable) de l'affichage (effet de bord) : frontière fondatrice.",
      "Paramètres par défaut et fonctions fléchées : la syntaxe idiomatique moderne.",
    ],
  },
  10: {
    guidedExample: `**Énoncé** : modifier un champ d'un objet sans muter l'original.

**Raisonnement** : comme les tableaux, les objets sont des références. Pour une version modifiée neuve : le spread \`{ ...obj, champ: valeur }\`.

**Solution & explication** :
\`\`\`js
const user = { nom: "Lina", ville: "Tunis" };
const demenage = { ...user, ville: "Paris" }; // nouvel objet
console.log(user.ville);     // "Tunis" → intact
console.log(demenage.ville); // "Paris"
\`\`\`
Le spread copie toutes les clés, puis \`ville\` écrase la valeur. L'ordre compte : la clé de droite gagne.

**Variante — l'optional chaining** : \`user.adresse?.rue\` renvoie \`undefined\` au lieu de crasher si \`adresse\` est absente. À utiliser aux FRONTIÈRES (données externes), pas partout.`,
    takeaways: [
      "Accès objet : `.cle` (connue) ou `[variable]` (dynamique — la porte vers les hash maps).",
      "Modifier immuablement : `{ ...obj, cle: val }` (l'ordre décide qui écrase qui).",
      "`?.` évite le crash sur un chemin absent — aux frontières uniquement, pas pour masquer des bugs.",
    ],
  },
  11: {
    guidedExample: `**Énoncé** : sur un tableau d'objets, trouver le plus cher.

**Raisonnement** : parcourir en gardant le « meilleur vu jusqu'ici » (pattern accumulateur appliqué à des objets).

**Solution** :
\`\`\`js
const produits = [{ nom: "A", prix: 30 }, { nom: "B", prix: 50 }, { nom: "C", prix: 20 }];
let meilleur = produits[0];
for (const p of produits) {
  if (p.prix > meilleur.prix) meilleur = p;
}
console.log(meilleur); // { nom: "B", prix: 50 }
\`\`\`

**Explication** : on garde l'OBJET complet (pas juste le prix), pour pouvoir renvoyer son nom. Le \`for...of\` parcourt chaque élément ; la condition met à jour le champion.

**Variante** : trie par prix décroissant SANS muter l'original : \`[...produits].sort((a, b) => b.prix - a.prix)[0]\`. Attention : \`sort\` sans comparateur trierait alphabétiquement !`,
    takeaways: [
      "Le monde réel est fait de tableaux d'objets (APIs, bases, fichiers) — 6 gestes : chercher, filtrer, transformer, agréger, trier, regrouper.",
      "`sort` MUTE et trie alphabétiquement sans comparateur : `[...arr].sort((a,b) => a-b)` pour des nombres.",
      "Regrouper par clé : un objet accumulateur `groupes[cle] ??= []; groupes[cle].push(x)`.",
    ],
  },
  12: {
    guidedExample: `**Énoncé** : lire un compteur dans un fichier JSON, l'incrémenter, le réécrire.

**Raisonnement** : le cycle canonique de persistance = lire → parser → modifier → sérialiser → écrire. Et distinguer « fichier absent » (normal au 1er lancement) d'une vraie erreur.

**Solution** :
\`\`\`js
const fs = require("node:fs");
let n = 0;
try {
  n = JSON.parse(fs.readFileSync("compteur.json", "utf8")).n;
} catch (err) {
  if (err.code !== "ENOENT") throw err; // absent = ok ; autre = vrai bug
}
n++;
fs.writeFileSync("compteur.json", JSON.stringify({ n }, null, 2));
console.log("Lancement n°" + n);
\`\`\`

**Explication** : le \`try/catch\` isole la lecture ; \`ENOENT\` (fichier absent) est le cas normal au premier run → on part de 0. Toute autre erreur est relancée (ne jamais l'avaler). \`null, 2\` indente le JSON (lisible, diffable).

**Variante** : centralise \`charger()\` et \`sauvegarder()\` en deux fonctions — c'est la couche de persistance isolée du projet 1.`,
    takeaways: [
      "Cycle de persistance : lire → parser → modifier → sérialiser → écrire.",
      "Distinguer erreur ATTENDUE (fichier absent → on initialise) de BUG (JSON corrompu → on s'arrête sans écraser).",
      "`catch {}` vide est l'anti-pattern absolu ; `JSON.stringify(obj, null, 2)` produit du JSON lisible.",
    ],
  },
  13: {
    guidedExample: `**Énoncé (méthode, pas code)** : avant de coder l'annuaire, découper le projet.

**Raisonnement** : lire la spec 2×, puis lister les tâches ORDONNÉES, chacune = un commit. On commence par le squelette qui tourne.

**Découpage type** :
1. Squelette : routing des commandes + \`charger/sauvegarder\` (recyclés du jour 12). → *commit 1*
2. \`ajouter\` + validation email + refus des doublons. → *commit 2*
3. \`lister\` (trié). → *commit 3*
4. \`chercher\`, \`modifier\`, \`supprimer\`. → *commits 4-5*
5. Les 10 cas méchants (id inconnu, email invalide…). → *commit 6*

**Explication** : le squelette d'abord donne une boucle de feedback immédiate (chaque ajout est testable en 5 s). Un commit par tâche rend l'historique lisible et le debug chirurgical.

**Variante** : écris ce découpage sur PAPIER avant de coder, puis compare à la réalité en fin de journée — l'écart mesure ta capacité d'estimation.`,
    takeaways: [
      "Méthode de projet : lire 2× → découper en tâches ordonnées → squelette d'abord → tester au fil → un commit par étape.",
      "Réutiliser ses patterns passés (persistance, validation) EST une compétence, pas de la triche.",
      "Valider à CHAQUE porte d'entrée (ajout ET modification) ; liste blanche > liste noire.",
    ],
  },
  15: {
    guidedExample: `**Énoncé** : classer la complexité de deux extraits.

**Raisonnement** : compter les boucles et leur imbrication. Successives → on additionne. Imbriquées → on multiplie. Les méthodes cachent parfois des boucles.

**Solution & explication** :
\`\`\`js
// Extrait A
for (const x of arr) total += x;        // une boucle → O(n)

// Extrait B
for (const x of arr)
  if (autre.includes(x)) hits++;        // includes est O(n) DANS une boucle O(n)
                                        // → O(n²) caché !
\`\`\`
A parcourt une fois : O(n). B semble simple mais \`includes\` re-parcourt \`autre\` à chaque tour → O(n×n) = O(n²). C'est LE piège : les méthodes ont un coût invisible.

**Variante** : réécris B en O(n) avec un Set (\`const s = new Set(autre)\` puis \`s.has(x)\` en O(1)) — l'échange mémoire contre temps, formalisé au jour 30.`,
    takeaways: [
      "Big O décrit la CROISSANCE du coût, pas la vitesse absolue ; les constantes s'ignorent.",
      "Boucles imbriquées se multiplient (O(n²)), successives s'additionnent (O(n)).",
      "Les méthodes cachent des boucles : `includes`/`indexOf` sont O(n) — un `includes` dans une boucle = O(n²).",
    ],
  },
  16: {
    guidedExample: `**Énoncé** : chercher 7 dans \`[1,3,5,7,9,11]\` par recherche binaire.

**Raisonnement** : l'invariant — « si 7 existe, il est entre low et high ». On regarde le milieu, on élimine une moitié à chaque tour.

**Trace** (low, mid, high) :
\`\`\`
[1,3,5,7,9,11]  low=0 high=5 → mid=2 (arr[2]=5 < 7) → low=3
                low=3 high=5 → mid=4 (arr[4]=9 > 7) → high=3
                low=3 high=3 → mid=3 (arr[3]=7) → TROUVÉ, index 3
\`\`\`

**Solution** :
\`\`\`js
function rechercheBinaire(arr, cible) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === cible) return mid;
    if (arr[mid] < cible) low = mid + 1; else high = mid - 1;
  }
  return -1;
}
\`\`\`

**Explication** : \`low <= high\` (pas \`<\`) pour traiter les zones d'un seul élément ; \`mid + 1\`/\`mid - 1\` excluent le milieu déjà testé (sinon boucle infinie). **Variante** : cherche 8 (absent) et suis la trace jusqu'à \`low > high\` → -1.`,
    takeaways: [
      "Recherche binaire : O(log n), mais EXIGE un tableau trié.",
      "L'invariant (« la cible est entre low et high ») guide chaque décision ; `mid±1` évitent la boucle infinie.",
      "Diviser par 2 à chaque étape → O(log n) : ~30 comparaisons pour un milliard d'éléments.",
    ],
  },
  17: {
    guidedExample: `**Énoncé** : trier \`[3,1,2]\` par insertion, à la main.

**Raisonnement** : comme des cartes en main — chaque nouvel élément est INSÉRÉ à sa place dans la partie déjà triée (à gauche).

**Trace** :
\`\`\`
[3 | 1, 2]   on prend 1 → il passe avant 3 → [1, 3 | 2]
[1, 3 | 2]   on prend 2 → il s'insère entre 1 et 3 → [1, 2, 3]
\`\`\`

**Solution** :
\`\`\`js
function triInsertion(arr) {
  const a = [...arr];
  for (let i = 1; i < a.length; i++) {
    const v = a[i]; let j = i - 1;
    while (j >= 0 && a[j] > v) { a[j + 1] = a[j]; j--; } // décale à droite
    a[j + 1] = v;                                        // pose dans le trou
  }
  return a;
}
\`\`\`

**Explication** : l'invariant est « la gauche (a[0..i-1]) est déjà triée ». On décale les plus grands vers la droite, puis on pose la valeur. **Variante** : sur un tableau DÉJÀ trié, la boucle interne ne tourne jamais → O(n) (pourquoi l'insertion survit en pratique).`,
    takeaways: [
      "Tris simples : O(n²), essentiellement pédagogiques ; le `sort` natif (O(n log n)) gagne en production.",
      "Le tri par insertion est O(n) sur des données presque triées — d'où sa survie dans les vrais moteurs.",
      "Test par oracle : comparer son tri au `sort` natif sur des entrées aléatoires.",
    ],
  },
  18: {
    guidedExample: `**Énoncé** : provoquer et résoudre un conflit de merge.

**Raisonnement** : un conflit survient quand deux branches modifient LA MÊME ligne. Git ne peut pas choisir → il te pose la question.

**Déroulé** :
\`\`\`bash
git switch -c feat/titre
# modifier ligne 1 → "Version A"
git commit -am "Titre version A"
git switch main
# modifier ligne 1 → "Version B"
git commit -am "Titre version B"
git merge feat/titre        # CONFLICT
\`\`\`
Le fichier contient alors :
\`\`\`
<<<<<<< HEAD
Version B
=======
Version A
>>>>>>> feat/titre
\`\`\`

**Résolution** : édite pour garder la bonne version (ou fusionner), SUPPRIME les marqueurs, puis \`git add fichier && git commit\`.

**Explication** : entre \`<<<\` et \`===\` = ta branche courante (main) ; entre \`===\` et \`>>>\` = la branche mergée. Rien n'est perdu : \`git merge --abort\` annule tout. **Variante** : garde LES DEUX idées en une ligne fusionnée.`,
    takeaways: [
      "Une branche est une étiquette mobile gratuite ; le workflow feature-branch garde `main` toujours stable.",
      "Un conflit est une question légitime, pas une catastrophe : édite, retire les marqueurs, add + commit.",
      "`git merge --abort` est la sortie de secours ; ne jamais committer les marqueurs `<<<<<<<`.",
    ],
  },
  19: {
    guidedExample: `**Énoncé** : appliquer la méthode en 6 étapes à « inverser une chaîne ».

**Déroulé complet** :
1. **Comprendre** : entrée = string, sortie = string à l'envers. Cas limites : "" (vide), "a" (un seul).
2. **Exemples** : "abc" → "cba" ; "" → "" ; "ab" → "ba".
3. **Décomposer** : parcourir de la fin au début, accumuler.
4. **Pseudo-code** : \`resultat = "" ; pour i de fin à début : resultat += str[i] ; renvoyer resultat\`.
5. **Coder** :
\`\`\`js
function inverser(str) {
  let r = "";
  for (let i = str.length - 1; i >= 0; i--) r += str[i];
  return r;
}
\`\`\`
6. **Vérifier** : dérouler sur "abc" → r="c", "cb", "cba". ✓

**Explication** : la méthode paraît lente sur un problème facile — mais c'est l'ENTRAÎNEMENT pour les problèmes durs, où sauter les exemples à la main mène droit au mur. **Variante** : version récursive (\`str === "" ? "" : inverser(str.slice(1)) + str[0]\`).`,
    takeaways: [
      "La méthode : comprendre → exemples À LA MAIN → décomposer → pseudo-code → coder → vérifier.",
      "Les exemples calculés à la main FONT découvrir l'algorithme et deviennent tes tests.",
      "En entretien, dérouler cette méthode à voix haute vaut plus que la solution elle-même.",
    ],
  },
  20: {
    guidedExample: `**Énoncé (échauffement du format kata)** : \`compterOccurrences(["a","b","a"])\` → \`{a: 2, b: 1}\`, en 8 minutes chrono.

**Raisonnement** : geste « compter » = une Map (ou un objet) de compteurs, parcours en O(n).

**Solution** :
\`\`\`js
function compterOccurrences(arr) {
  const compte = {};
  for (const x of arr) compte[x] = (compte[x] ?? 0) + 1;
  return compte;
}
\`\`\`

**Explication** : \`compte[x] ?? 0\` initialise à 0 au premier passage d'une valeur (sans le \`??\`, \`undefined + 1\` = NaN). Une seule passe → O(n).

**Rappel du jour** : les katas se font SANS aide et CHRONOMÉTRÉS — c'est un diagnostic de ce qui est ancré, pas un cours. Si tu dépasses le temps de 50 %, passe au suivant et note-le comme lacune. **Variante** : renvoie plutôt le mot le plus fréquent (parcours du dict résultat).`,
    takeaways: [
      "Le rappel actif chronométré révèle ce qui est ANCRÉ (produisible sans aide) vs seulement « vu ».",
      "Geste compter = objet/Map de compteurs avec initialisation `?? 0`, en O(n).",
      "Gérer le budget temps global (passer au suivant) bat l'acharnement local — vrai en entretien.",
    ],
  },
  22: {
    guidedExample: `**Énoncé** : écrire \`appliquerDeuxFois(fn, x)\` qui renvoie \`fn(fn(x))\`.

**Raisonnement** : une fonction est une VALEUR — on peut la recevoir en paramètre et l'appeler.

**Solution & explication** :
\`\`\`js
const appliquerDeuxFois = (fn, x) => fn(fn(x));
const inc = (n) => n + 1;
appliquerDeuxFois(inc, 5); // inc(inc(5)) = inc(6) = 7
\`\`\`
\`fn\` est une fonction reçue ; on l'appelle sur x, puis sur le résultat. C'est une fonction d'ordre supérieur (elle PREND une fonction).

**Variante — une closure** :
\`\`\`js
function compteur() { let n = 0; return () => ++n; }
const c = compteur();
c(); c(); // 1 puis 2 — la fonction se SOUVIENT de n (état privé)
\`\`\`
Deux compteurs créés séparément sont indépendants : chaque appel de \`compteur()\` crée sa propre variable \`n\`.`,
    takeaways: [
      "Une fonction est une valeur : stockable, passable (callback), retournable.",
      "Fonction d'ordre supérieur = sépare le squelette (parcourir, répéter) du comportement (quoi faire).",
      "Une closure se souvient des variables de sa fabrique : c'est l'état privé de JS (et le cœur de React).",
    ],
  },
  23: {
    guidedExample: `**Énoncé** : à partir d'employés, obtenir les noms de ceux du service "tech".

**Raisonnement** : filter (sélectionner) puis map (transformer) — ça se lit comme une phrase.

**Solution & explication** :
\`\`\`js
const nomsTech = employes
  .filter((e) => e.service === "tech")  // garde les tech
  .map((e) => e.nom);                    // extrait le nom
\`\`\`
« les employés tech, leurs noms » : le style déclaratif dit QUOI, pas COMMENT. Les deux méthodes retournent des tableaux NEUFS — l'original est intact.

**Variante — quand la boucle gagne** : pour trouver le PREMIER tech (arrêt anticipé), \`filter().map()[0]\` parcourt tout inutilement ; une boucle avec \`break\` (ou \`.find\`) est meilleure. La maturité n'est pas « tout en map/filter » mais choisir l'outil le plus LISIBLE.`,
    takeaways: [
      "map transforme 1-pour-1, filter sélectionne ; les deux retournent des tableaux neufs (immutabilité gratuite).",
      "Le chaînage se lit comme une phrase (style déclaratif : QUOI, pas COMMENT).",
      "La boucle reste préférable pour l'arrêt anticipé ou les effets de bord — la lisibilité juge.",
    ],
  },
  24: {
    guidedExample: `**Énoncé** : somme d'un panier \`[{prix, qte}]\` avec reduce.

**Raisonnement** : reduce replie un tableau en UNE valeur via un accumulateur. Valeur initiale OBLIGATOIRE.

**Solution & explication** :
\`\`\`js
const panier = [{ prix: 10, qte: 2 }, { prix: 5, qte: 3 }];
const total = panier.reduce((acc, item) => acc + item.prix * item.qte, 0);
// déroulé : 0 → 0+20=20 → 20+15=35
\`\`\`
\`acc\` démarre à 0 (la valeur initiale) ; à chaque item, la callback retourne le PROCHAIN acc. Le dernier acc est le résultat.

**Le piège** : oublier la valeur initiale → reduce prend le premier élément comme acc (ici un OBJET, pas un nombre → NaN). Toujours la valeur initiale.

**Variante** : regrouper avec reduce vers un OBJET : \`reduce((acc, x) => { (acc[x.cle] ??= []).push(x); return acc; }, {})\` — n'oublie pas de \`return acc\`.`,
    takeaways: [
      "reduce = pattern accumulateur généralisé : `(acc, x) => nouvelAcc`, avec valeur initiale TOUJOURS.",
      "Oublier la valeur initiale ou le `return acc` (callback à accolades) sont les deux bugs classiques.",
      "map et filter sont des reduce déguisés ; mais un reduce de 15 lignes doit redevenir une boucle.",
    ],
  },
  25: {
    guidedExample: `**Énoncé** : \`factorielle(n)\` en récursif, avec la pile dessinée.

**Raisonnement** : un cas de base (n≤1 → 1) et un cas récursif qui se rapproche du base (n × factorielle(n-1)).

**Solution & pile** :
\`\`\`js
function factorielle(n) {
  if (n <= 1) return 1;          // cas de base
  return n * factorielle(n - 1); // cas récursif
}
\`\`\`
\`\`\`
factorielle(3) = 3 * factorielle(2)
                     factorielle(2) = 2 * factorielle(1)
                                          factorielle(1) = 1   ← base
puis on DÉPILE : f(2)=2*1=2 → f(3)=3*2=6
\`\`\`

**Explication** : chaque appel EMPILE un contexte en attente ; le cas de base atteint, on dépile en remontant les résultats. La « confiance récursive » : suppose que \`factorielle(n-1)\` marche, écris juste \`n × ça\`.

**Variante** : \`sommeTableau(arr)\` = \`arr.length === 0 ? 0 : arr[0] + sommeTableau(arr.slice(1))\`.`,
    takeaways: [
      "Récursion : un cas de base (sans appel) + chaque appel se rapproche du base (sinon stack overflow).",
      "La pile d'appels empile les contextes, puis les dépile en remontant les résultats — dessine-la.",
      "La récursion épouse les structures imbriquées (arbres, JSON) où les boucles se contorsionnent.",
    ],
  },
  26: {
    guidedExample: `**Énoncé** : rendre \`subirDegats\` PURE (l'original du jour 10 mutait le personnage).

**Raisonnement** : au lieu de modifier, retourner un NOUVEAU personnage. Bénéfice : historique et undo gratuits.

**Solution & explication** :
\`\`\`js
const subirDegats = (perso, n) => ({ ...perso, pv: Math.max(0, perso.pv - n) });
const p0 = { nom: "Kael", pv: 100, pvMax: 100 };
const p1 = subirDegats(p0, 30); // p1.pv = 70
console.log(p0.pv);             // 100 → INTACT
\`\`\`
La fonction ne touche pas \`perso\` : elle construit une copie avec le pv modifié. Comme \`p0\` n'a pas bougé, on peut garder TOUT l'historique des états.

**Variante — undo gratuit** :
\`\`\`js
const etats = [p0, p1];
etats.push(subirDegats(etats.at(-1), 20)); // nouvel état
etats.pop();                                // annuler = revenir en arrière
\`\`\`
Impossible avec la version mutante : c'est la démonstration concrète de ce que l'immutabilité achète.`,
    takeaways: [
      "Fonction pure : même entrée → même sortie, zéro effet de bord → testable, cachable, prévisible.",
      "Immutabilité : retourner du neuf (`{ ...obj, cle: val }`) au lieu de muter ; spread à CHAQUE niveau imbriqué.",
      "Architecture cœur pur (logique) / coquille impure (I/O, affichage) : undo, rejeu et tests en découlent.",
    ],
  },
  27: {
    guidedExample: `**Énoncé (synthèse)** : structurer stats.js en cœur pur + coquille.

**Raisonnement** : la coquille (impure) lit le fichier et affiche ; le cœur (pur) calcule. Chaque métrique est une fonction \`(ventes) => résultat\`, testable seule.

**Squelette** :
\`\`\`js
// COQUILLE (bords)
const ventes = JSON.parse(fs.readFileSync("ventes.json", "utf8"));
// CŒUR (pur, testable)
const caTotal = (v) => v.reduce((t, x) => t + x.montant, 0);
const caParMois = (v) => { /* regrouper par mois → sommer */ };
// COQUILLE (affichage)
console.log(genererRapport({ caTotal: caTotal(ventes) /* ... */ }));
\`\`\`

**Explication** : cette frontière rend chaque métrique vérifiable dans le REPL sans fichier, et permet demain de sortir le rapport en HTML sans toucher au cœur. C'est le jour 9 (calcul/affichage) et le jour 26 (pureté) appliqués à un vrai mini-projet.

**Variante** : ajoute un filtre CLI (\`--mois 2024-03\`) : s'il ne touche QUE le chargement et pas les métriques, ta séparation est réussie.`,
    takeaways: [
      "Jour d'autonomie : lire la spec 2×, découper, squelette d'abord, tester au fil, un commit par étape.",
      "Cœur pur (métriques testables) / coquille impure (lecture, affichage) : la frontière du jour 9 et 26, en grand.",
      "Vérification d'intégrité : les totaux se recoupent (CA total = Σ par mois = Σ par vendeur).",
    ],
  },
  29: {
    guidedExample: `**Énoncé** : compter les feuilles d'une structure mixte (objets + tableaux imbriqués).

**Raisonnement** : le moule à 3 branches — tableau ? objet ? feuille ? — appliqué récursivement.

**Solution & explication** :
\`\`\`js
function compterFeuilles(x) {
  if (Array.isArray(x)) return x.reduce((n, e) => n + compterFeuilles(e), 0);
  if (x !== null && typeof x === "object")
    return Object.values(x).reduce((n, v) => n + compterFeuilles(v), 0);
  return 1; // feuille
}
compterFeuilles({ a: [1, { b: 2 }], c: 3 }); // 3
\`\`\`
Trois branches : un tableau → récurse sur chaque élément ; un objet → récurse sur chaque valeur ; sinon c'est une feuille (compte 1). Le \`x !== null\` AVANT le \`typeof\` est vital (\`typeof null === "object"\`).

**Variante** : \`deepMap(x, fn)\` applique fn à toutes les feuilles en préservant la structure — même moule, on remplace \`return 1\` par \`return fn(x)\`.`,
    takeaways: [
      "Le moule à 3 branches (tableau / objet / feuille) traite toute donnée mixte imbriquée.",
      "`x !== null && typeof x === 'object'` : la garde contre le bug historique `typeof null === 'object'`.",
      "Documents à chunker, JSON d'API, DOM : des arbres mixtes — ce moule ressert au mois 8.",
    ],
  },
  30: {
    guidedExample: `**Énoncé** : rendre \`sansDoublons\` O(n) avec un Set (l'ancienne version était O(n²)).

**Raisonnement** : \`includes\` dans une boucle = O(n²). Un Set teste l'appartenance en O(1) → O(n) total. On échange de la mémoire contre du temps.

**Solution & explication** :
\`\`\`js
// Avant, O(n²) : if (!resultat.includes(x)) resultat.push(x)
// Après, O(n) :
const sansDoublons = (arr) => [...new Set(arr)];
// ou, geste "compter" :
const freq = (arr) => arr.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map());
\`\`\`
\`new Set(arr)\` dédoublonne (le Set n'accepte pas les doublons), \`[...]\` le reconvertit en tableau. Le hachage rend \`has\`/\`add\` en O(1).

**Variante — l'index inversé** : \`Map<mot, Set<indices>>\` — construis-le sur 20 phrases, puis intersecte les Sets pour chercher plusieurs mots. Tu viens d'écrire le cœur d'un moteur de recherche (et le cousin de BM25, mois 9).`,
    takeaways: [
      "Le hachage rend get/has/add en O(1) : Map pour associer/compter, Set pour l'appartenance/l'unicité.",
      "Les 3 réflexes : COMPTER (Map de compteurs), DÉDOUBLONNER (Set), CROISER (intersection en O(n+m)).",
      "L'index inversé (mot → documents) est le cœur d'un moteur de recherche et de la recherche lexicale RAG.",
    ],
  },
};
