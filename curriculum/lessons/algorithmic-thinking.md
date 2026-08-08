<!-- keep -->
# Leçon — La pensée algorithmique

## 🌍 Le problème d'abord
On te donne un problème que tu n'as jamais vu : « trouve les deux nombres d'une liste
dont la somme vaut 100 ». Panique ? Non : l'algorithmique, c'est justement la méthode
pour attaquer un problème INCONNU — le découper en petites étapes que la machine peut
exécuter, puis se demander « est-ce que ça tiendra sur 10 millions d'éléments ? ».
Le débutant croit qu'il faut MÉMORISER des solutions ; en réalité, on apprend une
DÉMARCHE (décomposer, résoudre simplement, puis estimer le coût). Cette leçon t'apprend
à penser un problème avant de coder, et à raisonner sur la performance.

## 🎯 Objectif
Savoir **décomposer** un problème en étapes, écrire une première solution correcte,
puis **raisonner sur son coût** (complexité, notation Big-O) pour choisir une approche
qui passe à l'échelle.

## 🧩 Prérequis
Tu dois savoir écrire des **boucles**, des **conditions** et des **fonctions**
(`/doc/lessons/javascript-basics`), car un algorithme s'exprime avec ces briques.
Aucune notion de « complexité » n'est supposée : la notation Big-O est introduite ici,
par l'intuition (« combien d'opérations quand la donnée grossit ? »).

## 🧠 Modèle mental
Un algorithme est une RECETTE : une suite finie d'étapes qui transforme une entrée en
sortie. Deux questions le jugent : est-il CORRECT (bonne réponse sur tous les cas) et
est-il EFFICACE (combien d'opérations quand l'entrée grossit) ? La complexité (Big-O)
répond à la seconde : elle décrit comment le temps grandit avec la taille de l'entrée,
pas en secondes mais en « ordre de grandeur ».

## 💡 Pourquoi c'est important
L'algorithmique n'est pas une collection de solutions à mémoriser : c'est la capacité à DÉCOMPOSER un problème inconnu en étapes exécutables, et à RAISONNER sur le coût d'une solution avant de la subir en production. C'est la compétence testée dans quasi tous les entretiens techniques — et le recruteur y évalue ta *démarche à voix haute* bien plus que ta solution. C'est aussi ce qui sépare « ça marche en démo » de « ça tient à l'échelle ».

## Explication complète

### La méthode en 6 étapes (ton algorithme pour créer des algorithmes)
1. **COMPRENDRE** : reformule l'énoncé avec tes mots. Entrées ? Sorties ? Cas dégénérés (vide, null, négatif, géant) ? Si tu ne peux pas reformuler, tu ne peux pas coder.
2. **EXEMPLES** : fabrique 3 exemples entrée→sortie À LA MAIN, dont un cas limite. C'est en les calculant manuellement que ton cerveau DÉCOUVRE l'algorithme — c'est l'étape magique que les débutants sautent.
3. **DÉCOMPOSER** : quelles étapes ? Chaque morceau doit être trivial ou déjà connu.
4. **PSEUDO-CODE** : la logique en français structuré. Se corrige en 10 secondes, contre 10 minutes pour du code.
5. **CODER** : traduire. Si une ligne de pseudo-code explose en 15 lignes de code, retour à l'étape 3.
6. **VÉRIFIER** : dérouler le code À LA MAIN sur les exemples de l'étape 2, ligne par ligne. Puis exécuter.

Cette méthode est aussi ton antidote au stress : en panique, tu sais toujours quelle est la prochaine petite étape.

### Big O : le langage du coût
**Big O décrit comment le temps grandit quand les données grandissent** — indépendamment de la machine. Les classes à connaître :
- **O(1)** constant : accès par index/clé. n double → rien ne change.
- **O(log n)** : recherche binaire. n double → UNE opération de plus. Quasi gratuit sur des milliards.
- **O(n)** linéaire : une boucle. Honnête.
- **O(n log n)** : les bons tris.
- **O(n²)** : boucle dans une boucle. n double → temps ×4. À 1 million d'éléments : là où les programmes gèlent.

Règles d'analyse : boucles imbriquées se MULTIPLIENT, successives s'ADDITIONNENT (et on garde le pire terme). **Le piège n°1** : les méthodes cachent des boucles — `arr.includes(x)` est O(n), donc un `includes` dans une boucle = O(n²) invisible.

### Les grands schémas de pensée (les patterns, pas les solutions)
- **Diviser pour régner** : couper le problème en deux à chaque étape (recherche binaire, bons tris). Signature : « je divise par 2 » → pense O(log n).
- **Mémoriser le vu** : une Map/Set pour transformer « re-chercher à chaque fois » (O(n²)) en « demander au passé » (O(n)). Le grand échange : de la mémoire contre du temps.
- **Fenêtre glissante** : mettre à jour incrémentalement (+entrant, −sortant) au lieu de tout recalculer.
- **Accumulateur** : construire un résultat en agrégeant (somme, regroupement, reduce).
- **Récursion** : le problème contient des sous-problèmes de même forme (arbres, JSON imbriqué). Deux règles : un cas de base, et chaque appel s'en rapproche.
- **Invariant** : une propriété vraie à chaque itération qui GARANTIT le résultat (ex. recherche binaire : « la cible, si elle existe, est entre low et high »). Raisonner par invariants est ce qui rend un algo *prouvable* et pas juste « ça a l'air de marcher ».

## Concepts clés
La méthode en 6 étapes · Big O (O(1), O(log n), O(n), O(n log n), O(n²)) · pire cas · les 6 patterns · invariant · trace d'exécution manuelle · test par oracle (comparer à une référence fiable sur des entrées aléatoires).

## 🧭 Exemple guidé
« Trouver la période de k jours consécutifs la plus chaude » :
- Naïf : pour chaque position, resommer k éléments → O(n×k).
- Fenêtre glissante : première somme, puis à chaque pas `somme += temp[i] - temp[i-k]` → O(n).
La différence n'est pas de l'astuce : c'est la question « que puis-je RÉUTILISER du calcul précédent ? » — posable sur des dizaines de problèmes.

## ⚠️ Erreurs fréquentes
- Coder immédiatement sans exemples à la main : l'enlisement garanti sur tout problème non trivial.
- Confondre boucles successives (O(n)) et imbriquées (O(n²)).
- Optimiser sans mesurer, ou mesurer le meilleur cas (données triées, cible présente) au lieu du pire.
- Croire que « exponentiel » = mauvaise solution : parfois c'est le PROBLÈME qui l'est (générer 2^n sous-ensembles).

## 🔗 Liens avec le programme
Le retrieval RAG (mois 8-9) est un top-k par similarité : tri, sélection, structures d'index — de l'algorithmique pure. Estimer le coût d'un pipeline avant de le lancer (mois 10 : 500 docs × 3 appels LLM × prix du token) est du Big O appliqué aux euros. Et l'entretien algo reste le premier filtre de la plupart des recrutements.

## Mini-exercice
Avec la méthode COMPLÈTE (aucune étape sautée) : « renvoyer les deux nombres d'un tableau dont la somme vaut une cible ». Version naïve d'abord (double boucle), puis version Map. Donne le Big O des deux et vérifie par un mini-benchmark sur 100 000 éléments.

## 📚 Vocabulaire
**complexité** · **pire cas** · **pseudo-code** · **cas limite** · **invariant** · **diviser pour régner** · **fenêtre glissante** · **mémoïsation** · **oracle** · **trace**.

## 🧾 À retenir
Penser algorithmiquement = dérouler une méthode (comprendre → exemples → décomposer → pseudo-code → coder → vérifier) et raisonner en coût (Big O). Les solutions s'oublient ; les PATTERNS (diviser pour régner, mémoriser le vu, fenêtre glissante, accumulateur, récursion, invariant) se transfèrent à l'infini — y compris vers le RAG, l'évaluation IA et les entretiens.
