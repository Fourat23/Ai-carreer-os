<!-- keep -->
# Leçon — Tester une interface : comportement, pas implémentation

## 🌍 Le problème d'abord
Tu as écrit un composant qui marche. Comment être SÛR qu'il marchera encore après ta prochaine
modification ? Tu écris un test… qui vérifie que « le state interne vaut 1 » ou que « tel composant
enfant a été rendu ». Puis tu renommes une variable ou tu réorganises le JSX : le composant marche
toujours pour l'utilisateur, mais dix tests explosent. Tu finis par croire que « les tests front, ça
casse tout le temps pour rien ». Le problème n'est pas le test : c'est QUOI il teste. Un bon test
d'interface vérifie ce que l'UTILISATEUR voit et fait — pas comment c'est codé à l'intérieur. Cette
leçon t'apprend à tester une interface pour qu'elle reste fiable ET modifiable.

## 🎯 Objectif
Savoir tester une interface par son COMPORTEMENT observable (ce que l'utilisateur voit et déclenche)
plutôt que par son implémentation, distinguer les niveaux (unitaire, composant, intégration,
bout-en-bout), interroger l'interface comme un utilisateur (par rôle/libellé, pas par classe CSS), et
reconnaître un test fragile pour ne pas en écrire.

## 🧩 Prérequis
Tu dois connaître les fondations du test — Arrange/Act/Assert, la pyramide, les mocks, « un test doit
pouvoir échouer » (`/doc/lessons/testing-foundations`) — et savoir écrire des composants React avec
état et événements (`/doc/lessons/react-fundamentals`, `/doc/lessons/react-hooks-effects`). Cette
leçon applique le test à l'INTERFACE ; elle ne réexplique pas les bases du test.

## 🧠 Modèle mental
Un test d'interface doit se comporter comme un UTILISATEUR, pas comme un développeur qui inspecte les
entrailles. L'utilisateur ne connaît ni ton `useState`, ni tes noms de composants : il voit un
bouton « Ajouter », tape dans un champ « E-mail », lit un message « Aucun résultat ». Un bon test
REND le composant, INTERAGIT comme un humain (cliquer, saisir) et VÉRIFIE ce qui s'affiche. La règle
qui découle de tout : **teste le contrat observable (entrées → sortie visible), pas les détails
internes**. Un test qui casse quand le comportement n'a pas changé est un mauvais test.

## 💡 Pourquoi c'est important
Des tests couplés à l'implémentation coûtent plus qu'ils ne rapportent : ils cassent à chaque refonte
sans détecter de vrai bug, et l'équipe finit par les ignorer ou les supprimer. Des tests centrés sur
le comportement, eux, autorisent le refactoring en confiance et attrapent les vraies régressions
(un bouton qui ne réagit plus, un message d'erreur qui disparaît). C'est ce qui rend une base de code
frontend durable — et un signal de maturité recherché en équipe.

## Explication complète

### Les niveaux, appliqués au frontend
- **Unitaire** : une fonction pure (un formatage, une dérivation d'état, un reducer) — rapide, isolé.
- **Composant** : on REND un composant et on vérifie son comportement visible (le cœur du test front).
- **Intégration** : plusieurs composants qui collaborent (un formulaire + sa liste), avec le réseau
  simulé (mock).
- **Bout-en-bout (E2E)** : l'application réelle dans un vrai navigateur (ex. Playwright), du point de
  vue utilisateur — précieux mais lent et coûteux : peu nombreux, sur les parcours critiques.
La pyramide reste valable : beaucoup d'unitaires et de tests de composant, quelques E2E.

### Interroger comme un utilisateur
Cherche les éléments par ce que l'utilisateur perçoit : leur **rôle** et leur **nom accessible**
(« bouton nommé Ajouter », « champ nommé E-mail »), ou leur texte visible — PAS par classe CSS ni par
structure interne. Bénéfice double : le test survit au refactoring, et il pousse à écrire un HTML
accessible (si le test ne trouve pas le bouton par son rôle, un lecteur d'écran non plus). C'est le
principe des bibliothèques de test de composants modernes (type Testing Library).
```tsx
// Idée (schématique) : rendre, agir comme un utilisateur, vérifier le visible.
render(<Compteur/>);
// trouver le bouton par son RÔLE et son NOM, pas par une classe
click(getByRole('button', { name: /ajouter/i }));
expect(getByText('Total : 1')).toBeVisible();
```

### Comportement vs implémentation
Teste : « après un clic sur Ajouter, la liste affiche un élément de plus » (comportement). Ne teste
PAS : « `setItems` a été appelé » ou « l'état interne vaut `[…]` » (implémentation). Le premier
survit à une réécriture ; le second casse pour rien. Corollaire : évite les snapshots massifs du DOM,
qui « échouent » au moindre changement cosmétique sans rien prouver.

### Simuler le réseau (mocks)
Un composant qui `fetch` ne doit pas taper un vrai serveur en test : on SIMULE la réponse (succès,
erreur, liste vide) pour vérifier les quatre états d'écran. On teste ainsi le cas d'erreur et le cas
vide — précisément ceux qu'on oublie en développant.

### Tests asynchrones et tests instables (flaky)
Une interface réelle est asynchrone : après un clic, le résultat apparaît PLUS TARD (fetch, état).
Un test correct **attend** que l'élément attendu apparaisse (une assertion « quand ce sera prêt »)
au lieu de vérifier immédiatement — sinon il échoue par hasard. Un test **flaky** (instable) passe
parfois, échoue parfois : causes classiques — attentes fixes en millisecondes (`sleep`), dépendance à
l'ordre d'exécution, état partagé entre tests, horloge/aléatoire réels non contrôlés, animation non
désactivée. Un test flaky est un test à RÉPARER (attendre une condition, isoler l'état, figer le
temps), pas à relancer jusqu'à ce qu'il passe.

### Régression : quand une feature en casse une autre
Le scénario le plus coûteux : ta modification marche sur SON écran, mais casse une AUTRE page après
le merge (état partagé, prop modifiée, style global). C'est exactement ce que les tests de
comportement attrapent — à condition d'en avoir sur les parcours clés. La discipline : après un bug,
on ajoute un **test de non-régression** qui reproduit le cas ; il échoue avant le correctif, passe
après, et empêche le retour du bug. Cette boucle rejoint les playbooks professionnels
`frontend-regression` (une modif React en casse une autre) et `feature-regression` (régression après
merge) : diagnostiquer, corriger la vraie cause, verrouiller par un test.

### Accessibilité dans les tests
Puisqu'on interroge par rôle et nom accessible, un test bien écrit VÉRIFIE indirectement
l'accessibilité de base : présence d'un nom sur les contrôles, structure atteignable. C'est un
bénéfice gratuit du bon style de test.

## Concepts clés
Niveaux (unitaire/composant/intégration/E2E) · requête par rôle/nom accessible (pas par classe) ·
comportement vs implémentation · test fragile (couplé à l'interne, snapshot massif) · mock réseau
(succès/erreur/vide) · pyramide appliquée au front · accessibilité comme sous-produit.

## 🧭 Exemple guidé
Tester un champ de recherche qui filtre une liste, par comportement :
```tsx
render(<Recherche personnes={[{id:1,nom:'Ada'},{id:2,nom:'Alan'}]} />);
// 1. état initial : les deux sont visibles
expect(getByText('Ada')).toBeVisible();
// 2. l'utilisateur tape
type(getByRole('textbox', { name: /rechercher/i }), 'ad');
// 3. comportement observable : seul "Ada" reste
expect(getByText('Ada')).toBeVisible();
expect(queryByText('Alan')).toBeNull();
```
Raisonnement : on rend, on agit comme un utilisateur (saisie dans le champ trouvé par son nom), on
vérifie le RÉSULTAT VISIBLE. Aucune mention de `useState`, de nom de composant ou de classe CSS : on
peut réécrire entièrement l'intérieur, le test tient tant que le comportement est correct.

## ⚠️ Erreurs fréquentes
- Tester l'état interne ou les appels de fonctions (`setX` appelé) → casse au refactoring, ne prouve rien.
- Sélectionner par classe CSS ou structure du DOM → fragile et illisible.
- Snapshots géants du rendu → « échecs » cosmétiques permanents, on finit par les regénérer sans lire.
- N'écrire que des E2E (lents, instables) ou que le cas heureux (oublier erreur/vide).
- Frapper un vrai serveur en test au lieu de simuler les réponses.

## 🔗 Liens avec le programme
Cette leçon prolonge `/doc/lessons/testing-foundations` (pyramide, mocks, oracle) côté interface, et
s'appuie sur `/doc/lessons/react-application-states` (les quatre états à tester) et
`/doc/lessons/react-accessibility` (interroger par rôle/nom = tester l'accessibilité). Les tests de
composants React du programme (jours ~106-108, Vitest) appliquent exactement ces principes ; les E2E
Playwright servent les parcours critiques du Projet 3.

## Mini-exercice
Prends un composant « formulaire de connexion ». Écris trois tests de COMPORTEMENT : (1) soumettre
vide affiche une erreur ; (2) saisir un e-mail invalide affiche une erreur ; (3) une saisie valide
appelle l'action d'envoi (mockée). Interroge les éléments par rôle/nom, jamais par classe. Vérifie
qu'aucun test ne casse si tu renommes une variable d'état interne. Pratique associée :
`react-debug-list`, `react-search`.

## 📚 Vocabulaire
**test de composant** · **requête par rôle / nom accessible** · **comportement vs implémentation** ·
**test fragile** · **test asynchrone (attente)** · **test instable (flaky)** · **test de
non-régression** · **snapshot** · **mock réseau** · **intégration / E2E** · **pyramide de tests**.

## 🧾 À retenir
Un bon test d'interface se comporte comme un utilisateur : il rend le composant, interagit (clic,
saisie) et vérifie ce qui s'AFFICHE — en interrogeant par rôle et nom accessible, jamais par classe
CSS ni par état interne. Teste le comportement observable, pas l'implémentation : ainsi tes tests
survivent au refactoring et attrapent les vraies régressions. Simule le réseau pour couvrir aussi
l'erreur et le vide, et garde la pyramide (beaucoup de tests de composant, peu d'E2E).
