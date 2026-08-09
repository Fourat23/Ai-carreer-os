<!-- keep -->
# Leçon — La récursion en profondeur

## 🌍 Le problème d'abord
On te donne un dossier qui contient des fichiers ET d'autres dossiers, eux-mêmes contenant des
fichiers et des dossiers, sur une profondeur que tu ne connais pas d'avance. Comment compter
TOUS les fichiers ? Une boucle simple ne suffit pas : tu ne sais pas combien de niveaux il y a.
Le même problème revient partout — un JSON profondément imbriqué, un arbre de commentaires,
l'arborescence d'un site. La récursion est l'outil taillé pour ça : une fonction qui, pour
résoudre un gros problème, se rappelle elle-même sur un problème plus PETIT, jusqu'à un cas
trivial. Le piège du débutant est d'y voir une curiosité intimidante ; en réalité c'est un
outil quotidien, à condition de respecter deux règles simples. Cette leçon te les donne.

## 🎯 Objectif
Maîtriser la récursion comme OUTIL (pas comme curiosité) : pile d'appels, confiance récursive, structures imbriquées, backtracking d'introduction, et conversion récursif ↔ itératif. Indispensable pour les arbres, le JSON profond, et les entretiens.

## 🧠 Modèle mental
Une fonction récursive, c'est **des poupées russes** : chaque appel ouvre une poupée plus petite, jusqu'à la plus petite (le cas de base), puis on referme en remontant les résultats. Deux règles absolues : une poupée finale existe, et chaque ouverture rapproche d'elle.

## 🧩 Prérequis
Tu dois maîtriser les fonctions (paramètres, valeur de retour, portée) et les conditions
(`/doc/lessons/javascript-basics`), et avoir une intuition de la pensée algorithmique — découper
un problème en sous-problèmes (`/doc/lessons/algorithmic-thinking`). Comprendre qu'un appel de
fonction « met en pause » l'appelant jusqu'au retour aide à visualiser la pile d'appels. Aucune
structure de données avancée n'est supposée : on les aborde ici.

## 📖 Explication complète
- **La pile d'appels** : chaque appel empile un contexte (SES variables) ; le cas de base atteint, les contextes se dépilent en remontant les résultats. `factorielle(3)` : empile f(3)→f(2)→f(1)=1, puis dépile 2×1=2, 3×2=6. DESSINER cette pile une fois démystifie tout.
- **La confiance récursive (leap of faith)** : pour écrire `somme(arr)`, SUPPOSE que `somme(arr.slice(1))` marche (problème plus petit) et écris juste `arr[0] + ça`. Ne déroule pas 15 niveaux mentalement : vérifie le cas de base, vérifie que le pas rapproche, fais confiance.
- **Où la récursion brille** : les structures IMBRIQUÉES à profondeur inconnue — arborescences de fichiers, JSON profond, DOM, arbres. Le moule à 3 branches pour les données mixtes : tableau → récurse sur les éléments ; objet (non null !) → récurse sur les valeurs ; sinon → feuille (cas de base).
- **Backtracking (intro)** : générer les combinaisons = un arbre de choix (prendre/ne pas prendre → 2 appels), on essaie, on explore, on DÉFAIT. 2^n sous-ensembles : l'exponentiel vient du PROBLÈME, pas de la solution.
- **Récursif ↔ itératif** : tout récursif se convertit (la boucle + une pile explicite remplacent la call stack). Le linéaire (somme, compte) est souvent plus simple en itératif (et sans limite de pile) ; l'arborescent est plus naturel en récursif.
- **Les pièges** : cas de base absent/inatteignable → stack overflow ; recalculs exponentiels (fib naïf : fib(n-1) ET fib(n-2) recalculent les mêmes sous-problèmes) → mémoïsation.

## 🔧 Exemple simple
```js
const somme = (arr) => arr.length === 0 ? 0 : arr[0] + somme(arr.slice(1));
```
Cas de base : tableau vide → 0. Pas : premier + somme du reste.

## 🧭 Exemple guidé
**Énoncé** : taille totale d'une arborescence de fichiers.
**Raisonnement** : la structure est récursive (un dossier contient des dossiers) → le code l'épouse.
**Solution** :
```js
function tailleTotale(noeud) {
  if (noeud.type === "fichier") return noeud.taille;      // cas de base
  let total = 0;
  for (const enfant of noeud.enfants)
    total += tailleTotale(enfant);                         // confiance
  return total;
}
```
**Explication** : deux cas, aucun compteur global, la profondeur est gérée gratuitement par la pile. **Variante** : `chercherFichier(noeud, nom)` qui retourne le CHEMIN complet (préfixer en remontant : `noeud.nom + "/" + cheminEnfant`).

## 🤖 Exemple appliqué (IA / data / architecture)
Les documents d'un RAG sont des arbres (doc → sections → paragraphes) : le chunking par structure est un parcours récursif. Le JSON de sortie d'un LLM se valide récursivement. Les arbres de décision ML (mois 6) se parcourent récursivement. Une structure, l'outil partout.

## ⚠️ Erreurs fréquentes
- Cas de base absent ou jamais atteint (paramètre qui ne décroît pas) → stack overflow.
- Oublier `x !== null` avant `typeof x === "object"` (bug historique JS).
- Dérouler mentalement 10 niveaux au lieu de faire confiance (paralysie).
- fib naïf sur n > 35 (exponentiel) sans mémoïsation.

## 🚫 Anti-patterns
- La récursion pour du linéaire simple (une boucle est plus claire et sans limite de pile).
- L'état global muté depuis les appels récursifs (préférer paramètres et retours).

## ✍️ Mini-exercice
Écris `compterFeuilles(structure)` sur une donnée mixte (objets + tableaux imbriqués) avec le moule à 3 branches. Teste sur un JSON à 4 niveaux.

## 🔥 Exercice plus difficile
`sousEnsembles([1,2,3])` (8 résultats) par le choix binaire prendre/ne-pas-prendre, en dessinant l'arbre de décision. Puis `fib` mémoïsé : compare fib(35) avant/après.

## ✅ Correction attendue
La logique : cas de base + pas qui rapproche + confiance. Vérifie : ta pile dessinée correspond à l'exécution ; le moule à 3 branches gère null ; sousEnsembles retourne exactement 2^n résultats ; fib mémoïsé passe de secondes à millisecondes (chiffres notés).

## 🎤 Questions d'entretien
- « Explique la récursion et ses deux règles. » → Cas de base sans appel ; chaque appel s'en rapproche. Sinon : stack overflow.
- « Pourquoi fib naïf est-il lent ? » → Arbre d'appels exponentiel (recalculs) ; mémoïsation → linéaire.
- « Récursif ou itératif ? » → Itératif pour le linéaire ; récursif pour l'arborescent ; savoir convertir les deux sens.

## 🧾 À retenir
- Cas de base + rapprochement + confiance récursive.
- La récursion épouse les structures imbriquées (arbres, JSON, DOM).
- Moule à 3 branches pour les données mixtes ; mémoïsation contre les recalculs.

## 📚 Vocabulaire
**cas de base / cas récursif** · **pile d'appels** · **stack overflow** · **leap of faith** · **parcours en profondeur** · **backtracking** · **mémoïsation** · **profondeur**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je dessine la pile d'appels d'une récursion simple sans hésiter.
- [ ] J'applique le moule à 3 branches à tout JSON imbriqué.
- [ ] Je sais convertir récursif ↔ itératif et dire quand chacun gagne.

## 🔗 Liens avec le programme
Jours 25, 29, 32 (mois 1-2) ; arbres semaine 6 ; chunking mois 8. Leçons liées : `algorithmic-thinking`, `data-structures-intro`, `chunking-strategies`.
