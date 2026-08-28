<!-- keep -->
# Leçon — Tester son code

## 🌍 Le problème d'abord
Tu modifies une ligne de code pour corriger un bug… et tu en crées trois autres ailleurs,
sans le savoir. Comment être SÛR qu'un changement n'a rien cassé, sans re-cliquer
manuellement dans toute l'application à chaque fois ? La réponse : des **tests automatisés**
— de petits programmes qui vérifient que ton code fait ce qu'il promet, et que tu peux
relancer en une seconde autant de fois que tu veux. Sans eux, chaque modification est un pari
et tu finis par avoir PEUR de toucher ton propre code. Cette leçon t'apprend à écrire des
tests qui te rendent la liberté de modifier sereinement.

## 🎯 Objectif
Savoir écrire des tests utiles selon le schéma **Arrange/Act/Assert**, choisir le bon niveau
(unitaire / intégration / bout-en-bout), tester le **comportement** plutôt que
l'implémentation, isoler l'extérieur par des **doubles** (mocks/fakes), et garantir qu'un test
peut réellement ÉCHOUER.

## 🧩 Prérequis
Tu dois savoir écrire des fonctions et, idéalement, viser des fonctions pures (mêmes entrées →
mêmes sorties), car ce sont les plus faciles à tester (`/doc/lessons/javascript-basics`,
`/doc/lessons/clean-code`). Aucune bibliothèque de test particulière n'est supposée : les
concepts (assertion, fixture, mock) sont construits ici et valent pour tous les frameworks.

## 🧠 Modèle mental
Un test est une PHRASE vérifiable : « pour telle entrée, le code doit produire tel résultat ».
Il suit trois temps — **Arrange** (préparer des données connues), **Act** (exécuter la
fonction), **Assert** (vérifier le résultat attendu). Et il n'a de valeur que s'il peut
ÉCHOUER : un test qui reste vert quand tu casses le code ne teste rien. Le but n'est pas
d'atteindre un pourcentage, mais d'attraper les régressions sur ce qui compte.

## 💡 Pourquoi c'est important
Un test automatisé est un filet de sécurité rejouable à l'infini : il te permet de MODIFIER sans peur (refactoring, évolutions) — sans tests, tout changement est un pari. C'est aussi une documentation vivante (le test montre l'usage réel) et un détecteur de design (ce qui est dur à tester est mal découpé). En poste, « comment testes-tu ? » est une question d'entretien systématique, et un code non testé est un code qu'on n'ose plus toucher.

## Explication complète

### Arrange / Act / Assert en détail
Tout test suit trois temps : PRÉPARER des données connues, EXÉCUTER la fonction, VÉRIFIER le résultat attendu.
```js
test('la remise s'applique au-dessus de 100€', () => {
  const panier = { total: 150 };            // arrange
  const remise = calculerRemise(panier);    // act
  assert.equal(remise, 7.5);                // assert
});
```
Un test est une PHRASE : son nom dit le comportement vérifié, pas la fonction appelée (« la remise s'applique au-dessus de 100€ », pas « test calculerRemise 2 »).

### La pyramide : unitaire, intégration, bout-en-bout
- **Unitaire** : une fonction isolée, rapide, précis — quand il casse, tu sais OÙ. La masse de tes tests.
- **Intégration** : plusieurs composants assemblés (une requête HTTP → routes → services → base de test) — il attrape les bugs de CÂBLAGE que l'unitaire ne voit pas.
- **Bout-en-bout (e2e)** : le système complet du point de vue utilisateur — précieux et coûteux, en petit nombre.

### Que tester (et quoi pas)
Priorité aux **règles métier** (les calculs, les décisions, les validations), aux **cas limites** (vide, zéro, négatif, doublon, géant) et aux **cas d'erreur** (entrée invalide → le bon refus). Ne teste pas les trivialités (un getter) ni les détails d'implémentation (le test doit survivre à un refactoring interne : teste le COMPORTEMENT, pas le comment).

### La règle d'or : un test doit pouvoir échouer
Un test qui reste vert quand tu casses le code ne teste RIEN — il donne une fausse confiance, pire que pas de test. Vérification systématique : sabote la fonction (inverse une condition), constate le ROUGE, répare. C'est le « test du test ».

### Les mocks : isoler l'extérieur
Pour tester une logique qui dépend d'un fichier, d'une API, d'une horloge ou d'un LLM, on remplace la dépendance par un DOUBLE contrôlé (mock/fake) : un `Store` en mémoire au lieu du disque, une réponse d'API enregistrée au lieu du réseau. Corollaire de conception : plus ta logique est PURE (jour 26) et tes dépendances INJECTÉES (interface Store, jour 44), moins tu as besoin de mocker — le test facile est un symptôme de bonne architecture.

### Les tests par l'oracle et par propriétés
Quand une référence fiable existe (le sort natif face à ton tri maison), compare sur des entrées ALÉATOIRES : c'est le test par oracle. Sans référence, vérifie des PROPRIÉTÉS (un tableau trié a chaque élément ≤ au suivant ; total = Σ des sous-totaux). Ces invariants de données seront tes tests de cohérence de pipelines (mois 5) et d'évaluations RAG (mois 9).

## Concepts clés
Arrange/Act/Assert · test unitaire / intégration / e2e · cas limites et d'erreur · comportement vs implémentation · le test du test (rougir quand on sabote) · mock / fake / injection de dépendance · base de test isolée et réinitialisée · oracle et propriétés · TDD (écrire le test d'abord — à connaître, pratiquer à ta guise).

## 🧭 Exemple guidé
Tester la logique du projet 1 SANS toucher au disque :
```js
function fakeStore(initial = []) {          // un Store en mémoire
  let tasks = [...initial];
  return { all: () => tasks, save: (t) => { tasks = t; } };
}
test('done marque la tâche sans muter les autres', () => {
  const store = fakeStore([{ id: 1, statut: 'pending' }, { id: 2, statut: 'pending' }]);
  marquerFaite(store, 1);
  assert.equal(store.all()[0].statut, 'done');
  assert.equal(store.all()[1].statut, 'pending');
});
```
L'interface `Store` du jour 44 rend ce test possible : l'inversion de dépendance ET la testabilité sont la même médaille.

## ⚠️ Erreurs fréquentes
- Tester sur la base de dev (pollution, tests non rejouables) : toujours une base de test réinitialisée.
- Des tests qui dépendent de l'ordre d'exécution : chaque test doit être autonome.
- Courir après le % de couverture : 100 % de couverture avec des assertions creuses ne vaut rien ; 20 tests durs sur les règles métier valent de l'or.
- Ne tester que le chemin heureux : la moitié de la valeur est dans les cas d'erreur.

## 🔗 Liens avec le programme
Tester du code qui appelle un LLM (mois 11) = pousser le mock un cran plus loin : réponses ENREGISTRÉES (replay) pour les tests rapides, évaluation sur golden set pour la qualité réelle. Le harnais d'évaluation RAG (mois 9) EST une suite de tests dont les assertions sont des métriques. La CI de DocSense lancera lint + tests + éval smoke à chaque push : le filet de sécurité, automatisé.

## Mini-exercice
Écris 6 tests sur ta fonction de validation la plus riche (jour 5 ou mois 3) : 2 chemins heureux, 3 cas limites, 1 cas d'erreur. Puis sabote la fonction de 3 façons différentes et vérifie que la suite rougit à chaque fois. Si un sabotage passe : il te manque un test — écris-le.

## ✅ Correction attendue
**La démarche** : six tests, chacun nommé par le COMPORTEMENT qu'il vérifie. Puis trois sabotages, et la suite doit rougir trois fois. Ce second temps n'est pas une formalité — c'est lui qui dit si tes tests existent.

**L'erreur probable, et c'est la plus coûteuse du sujet.** Le sabotage qui passe au vert est presque toujours le même : on a testé que la fonction ne plante pas, au lieu de tester ce qu'elle répond.

```js
test('valide un email', () => {
  const r = valider({ email: 'a@b.fr' });
  assert.ok(r);                      // ⚠️ ne teste presque rien
});
```

`assert.ok(r)` est vrai pour `true`, pour `{ valide: false }`, pour `"erreur"`, pour n'importe quel objet. Inverse la condition dans `valider` : le test reste **vert**. Le piège séduit parce que le test a toutes les apparences d'un test — un nom, un appel, une assertion — et parce qu'il passe du premier coup, ce qu'on prend pour une bonne nouvelle. Un test qui n'a jamais été rouge n'a jamais rien prouvé.

L'assertion utile porte sur la valeur exacte attendue : `assert.deepEqual(r, { valide: true, erreurs: [] })`.

**Alternative défendable** : plutôt que six tests écrits à la main, un test paramétré parcourant un tableau de cas `{ entrée, attendu }`. Beaucoup plus dense, très agréable à étendre — mais quand il casse, le message dit « cas 4 » et non ce que le cas 4 signifiait. Table pour les validations nombreuses et régulières ; tests nommés pour les règles métier dont l'échec doit se lire sans réfléchir.

**Vérifie seul, sans corrigé** : le seul critère qui compte est le sabotage. Casse ta fonction de trois façons **différentes** — inverse une condition, renvoie une constante, supprime un cas limite. Trois rouges attendus. Un sabotage qui passe ne signifie pas que ton test est un peu faible : il désigne un comportement que **personne ne vérifie**. Écris le test manquant, et recommence.

## 🏢 Cas professionnel
Une équipe affiche fièrement 92 % de couverture. Une refonte du calcul de facturation passe la suite au vert et part en production ; les factures de fin de mois sont fausses. L'enquête montre que les tests appelaient bien le code de facturation — d'où les 92 % — mais que leurs assertions vérifiaient surtout que la fonction ne levait pas d'exception.

La couverture mesure **quelles lignes ont été exécutées**, jamais si quelqu'un a regardé le résultat. C'est une métrique utile pour repérer ce qui n'est pas testé du tout, et trompeuse dès qu'on la prend pour une mesure de qualité — d'autant qu'elle pousse à écrire des tests faciles sur du code trivial pour faire monter le chiffre. Les équipes qui ont vécu cet incident changent de question : elles ne demandent plus « quelle est notre couverture ? » mais « quand avons-nous vu ces tests rouges pour la dernière fois ? ». C'est le test du test, transformé en pratique d'équipe — et c'est exactement le genre de métrique-qui-ment que tu retrouveras en évaluation de systèmes IA.

## 🎤 Questions d'entretien
- « Comment sais-tu qu'un test est utile ? » → En le faisant échouer volontairement. Un test qui n'a jamais été rouge ne prouve rien.
- « Que penses-tu de la couverture de code ? » → Bon détecteur de zones non testées, mauvais indicateur de qualité : elle compte les lignes exécutées, pas les assertions pertinentes.
- « Unitaire, intégration ou e2e ? » → Beaucoup d'unitaires sur les règles métier, quelques intégrations sur le câblage — la classe de bugs que l'unitaire ne peut pas voir — et très peu de e2e, lents et fragiles.
- « Pourquoi mocker ? » → Pour isoler ce qu'on teste de ce qui est lent, distant ou non déterministe. Et si mocker est pénible, c'est en général le découpage qu'il faut corriger, pas le test.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Chacun de mes tests a déjà été vu rouge, au moins une fois, délibérément.
- [ ] Mes noms de test décrivent un comportement, pas un nom de fonction.
- [ ] J'assertie une valeur attendue, jamais seulement l'absence de plantage.
- [ ] Mes tests passent dans n'importe quel ordre, et sans base de données de développement.

## 📚 Vocabulaire
**assertion** · **cas limite** · **fixture** (données de test) · **mock / fake / stub** · **injection de dépendance** · **couverture** · **régression** · **oracle** · **propriété / invariant** · **TDD** · **replay**.

## 🧾 À retenir
Un test = arranger, agir, vérifier — et il doit pouvoir ÉCHOUER (sabote pour le prouver). Pyramide : beaucoup d'unitaires sur les règles métier et cas limites, quelques intégrations sur le câblage, peu de e2e. Les mocks isolent l'extérieur, et la facilité à tester mesure la qualité de ton découpage. Des tests aux évals LLM, c'est le même geste : vérifier automatiquement ce qu'on promet.
