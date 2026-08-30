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

## 🧭 Exemple guidé — deux tests du même comportement, et un remaniement

« Teste le comportement, pas l'implémentation » est le conseil le plus répété du domaine, et
le plus difficile à appliquer, parce que la différence entre les deux ne se voit pas quand on
écrit le test : **les deux passent au vert.** Elle ne se voit que le jour où on modifie le
code.

Alors modifions-le, et regardons.

> Les résultats de cette section sont **exécutés** : le script
> `scripts/v70-verifications/frontend-testing-refactor.mjs` rend ces composants dans Chromium,
> joue les deux tests, et imprime chaque verdict.

### Le composant, et son comportement

Un champ de recherche qui filtre une liste de personnes.

```jsx
function Recherche({ personnes }) {
  const [terme, setTerme] = useState('');
  const resultats = personnes.filter((p) =>
    p.nom.toLowerCase().includes(terme.toLowerCase()));
  return (
    <div className="recherche-bloc">
      <label htmlFor="q">Rechercher une personne</label>
      <input id="q" className="input-recherche"
             value={terme} onChange={(e) => setTerme(e.target.value)} />
      <ul className="liste-resultats">
        {resultats.map((p) => <li key={p.id} className="ligne">{p.nom}</li>)}
      </ul>
    </div>
  );
}
```

Le comportement à garantir tient en une phrase, et il est utile de l'écrire avant le test :
*quand l'utilisateur tape « ad », il voit « Ada » et ne voit plus « Alan ».*

### Test A — couplé à l'implémentation

```js
const champ = document.querySelector('.input-recherche');
await taper(champ, 'ad');
const lignes = document.querySelectorAll('.liste-resultats .ligne');
expect(lignes).toHaveLength(1);
expect(lignes[0].textContent).toBe('Ada');
```

C'est le test qu'on écrit naturellement, parce qu'on a le code sous les yeux et qu'on y lit
des noms de classes commodes. Verdict mesuré : **PASSE**.

### Test B — couplé au comportement observable

```js
const champ = ecranParNom(/rechercher une personne/i);   // trouvé par son libellé
await taper(champ, 'ad');
expect(texteVisible()).toContain('Ada');
expect(texteVisible()).not.toContain('Alan');
```

Le champ est trouvé par **le texte que l'utilisateur lit à côté**, et le résultat est vérifié
sur **ce qui est affiché**, pas sur la structure qui le porte. Verdict mesuré : **PASSE**.

Deux tests verts. À ce stade, rien ne les distingue, et un relecteur pressé préférera même le
premier — il est plus court et plus précis.

### Le remaniement

Six mois plus tard, quelqu'un adopte une convention de classes CSS et remplace la liste par un
tableau, pour l'aligner sur les autres écrans. Aucune modification du comportement.

```jsx
function Recherche({ personnes }) {
  const [terme, setTerme] = useState('');
  const resultats = personnes.filter((p) =>
    p.nom.toLowerCase().includes(terme.toLowerCase()));
  return (
    <>
      <label htmlFor="q">Rechercher une personne</label>
      <input id="q" className="champ"
             value={terme} onChange={(e) => setTerme(e.target.value)} />
      <table><tbody>
        {resultats.map((p) => <tr key={p.id}><td>{p.nom}</td></tr>)}
      </tbody></table>
    </>
  );
}
```

Le `<div>` enveloppant a disparu, `.input-recherche` est devenu `.champ`, `<ul>/<li>` sont
devenus `<table>/<tr>/<td>`.

**Ce que voit l'utilisateur, mesuré dans les deux versions :**

```
"Rechercher une personne\nAda"
```

Identique, caractère pour caractère. Du point de vue de la personne qui utilise le produit,
**rien n'a changé**.

### Les verdicts après remaniement

| | Version 1 | Version 2 |
|---|---|---|
| Test A (implémentation) | PASSE | **ÉCHOUE — sélecteur `.input-recherche` introuvable** |
| Test B (comportement) | PASSE | **PASSE** |

Voilà la différence, et elle n'était visible d'aucune autre manière.

### Ce que coûte réellement le test A

On pourrait hausser les épaules : il suffit de mettre à jour le sélecteur, c'est deux minutes.
C'est vrai une fois. Ce qui coûte, c'est ce que le rouge **fait croire**.

Un test qui échoue transmet un message : *tu as cassé quelque chose*. Ici, le message est
faux — rien n'est cassé. Le développeur perd d'abord du temps à chercher une régression qui
n'existe pas, puis apprend quelque chose de bien plus dommageable : **que le rouge ne veut pas
forcément dire qu'il y a un problème.**

À partir de là, la suite de tests perd sa fonction. On corrige les tests pour qu'ils passent
au lieu de les lire ; on en désactive un « le temps de finir » ; et le jour où un test échoue
pour une vraie régression, il ressemble exactement aux dix précédents qui ne signalaient rien.

Un test couplé à l'implémentation ne se contente pas d'être inutile : il **consomme la
confiance** accordée à tous les autres.

### La règle utilisable

Écris ton assertion comme tu décrirais le comportement **à quelqu'un qui n'a pas lu le code**.

- « L'utilisateur voit Ada » → une assertion sur le texte visible. ✅
- « Le tableau `.liste-resultats` contient un `li.ligne` » → une assertion sur ton HTML. ❌

Et le test de solidité, qui tient en une question : **si je réécris entièrement l'intérieur du
composant sans changer ce que l'utilisateur voit, mon test doit-il rester vert ?** Si la
réponse est non, le test n'exprime pas un comportement — il photographie une implémentation.

### La limite honnête de cette règle

Elle n'est pas absolue. Certaines choses ne sont pas visibles et méritent d'être testées : un
appel réseau émis avec les bons paramètres, une donnée écrite en base, un événement d'analyse
déclenché. On teste alors un **contrat** — ce que le composant promet à son environnement —
et c'est légitime.

La ligne de partage : est-ce un contrat que quelqu'un d'autre consomme, ou un détail que
personne n'observe ? Le nom d'une classe CSS n'est le contrat de personne. La forme du corps
d'une requête envoyée à une API en est un.

## 🧪 Vérification de compréhension
À traiter avant de lire la correction.

1. `expect(queryByText('Alan')).toBeNull()` passe. Le filtrage fonctionne-t-il ?
2. Ton composant charge des données. Le test cherche le résultat juste après le rendu et
   ne le trouve pas. Que fais-tu, et qu'est-ce que tu ne fais surtout pas ?
3. Ton test cherche le bouton par `getByRole('button', { name: /ajouter/i })` et échoue.
   Que t'apprend cet échec, au-delà du test ?
4. Tu as 400 tests unitaires et zéro test bout-en-bout. Que ne sais-tu pas ?

## ✅ Correction attendue

**La démarche.** Un test doit échouer pour la bonne raison et passer pour la bonne
raison. Le second point est le plus souvent négligé, parce qu'un test vert ne se relit
jamais.

**L'erreur probable : croire qu'une assertion négative qui passe prouve quelque chose.**
`queryByText('Alan')).toBeNull()` passe si « Alan » n'est pas affiché. Elle passe donc
aussi si :

- le composant a levé une exception et n'a **rien** rendu ;
- la liste est vide parce que les données n'ont jamais été passées ;
- le nom est mal orthographié dans le test ;
- le composant affiche un état de chargement à la place, indéfiniment.

Autrement dit, **elle passe brillamment sur un composant entièrement cassé.** Un test
qui n'affirme que des absences ne peut pas distinguer « le filtrage marche » de « rien ne
s'affiche ».

La parade tient en une règle : **toute assertion négative doit être accompagnée d'une
assertion positive.** Vérifier qu'« Alan » a disparu **et** qu'« Ada » est toujours là.
La seconde échoue immédiatement si le composant est mort, et c'est elle qui donne son
sens à la première.

Le piège séduit parce que **l'assertion exprime exactement l'intention**. On veut vérifier
que le filtrage retire les non-correspondants, on écrit qu'il n'y a plus de
non-correspondant, c'est littéralement ce qu'on voulait dire. Rien dans la formulation ne
signale qu'elle est satisfaite par un ensemble de causes bien plus large que celle qu'on
avait en tête. S'y ajoute le fait qu'**un test vert ne demande jamais d'explication** : on
ne relit que ceux qui échouent.

Le contrôle qui vaut pour toute la suite de tests : **casse volontairement le composant**
et regarde combien de tests rougissent. Ceux qui restent verts ne testaient rien.

**Sur les autres questions.** Face au résultat asynchrone absent, on **attend** avec une
requête asynchrone (`findBy…`, ou `waitFor`) qui réessaie jusqu'à apparition. Ce qu'il ne
faut surtout pas faire, c'est ajouter une **pause fixe** : elle rend la suite lente, et
surtout instable — trop courte sur une machine chargée, elle produit un test qui échoue
une fois sur vingt, et l'on finit par le désactiver.

Un `getByRole('button', { name: /ajouter/i })` qui échoue t'apprend quelque chose qui
dépasse le test : **si la requête ne trouve pas le bouton par son rôle et son nom, un
lecteur d'écran ne le trouvera pas non plus.** C'est un `<div>` cliquable, ou un bouton
sans nom accessible. Le test vient de détecter un défaut d'accessibilité, gratuitement,
et c'est la raison principale d'interroger le DOM comme un utilisateur plutôt que par
classes CSS.

Enfin, 400 tests unitaires et aucun test bout-en-bout laissent une ignorance précise : on
ne sait pas si **les pièces s'assemblent**. Chaque unité est correcte, le routage peut
être cassé, le formulaire peut ne rien envoyer, la variable d'environnement peut manquer,
le déploiement peut servir une version qui ne démarre pas. Trois tests bout-en-bout sur
les parcours critiques couvrent ce que quatre cents tests unitaires ne verront jamais.

**Alternative défendable.** Sur un composant purement visuel dont le rendu est le produit,
un **test de rendu de référence** (snapshot) est acceptable : il détecte tout changement
non voulu. Le prix est connu et il faut l'assumer : ces tests échouent à chaque
modification légitime, on prend l'habitude de les valider sans les lire, et ils cessent
alors de détecter quoi que ce soit.

**Vérifie seul, sans corrigé** :
1. Commente le corps de ton composant et relance la suite. Les tests qui passent encore
   ne testent rien.
2. Cherche tes assertions négatives. Chacune a-t-elle une assertion positive à côté ?
3. Cherche les pauses fixes dans tes tests. Chacune est un test instable en attente.

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

## 🛠️ Pratique — écris les tests, puis casse le composant exprès

**Contexte.** Un formulaire de connexion : champ courriel, champ mot de passe, bouton
« Se connecter », affichage des erreurs, et un appel `onConnexion({ email, motDePasse })`
quand tout est valide.

Cette pratique se fait en trois temps, et **le troisième est celui qui compte**. Écrire des
tests verts n'apprend rien : n'importe quel test est vert sur un code qui marche. Ce qui
enseigne, c'est de vérifier que tes tests **deviennent rouges pour les bonnes raisons et
restent verts pour les bonnes raisons**.

**Temps 1 — les comportements, en français.** Avant toute ligne de code, écris la liste
numérotée des comportements à garantir, chacun en une phrase du point de vue de
l'utilisateur. Quatre au minimum. Une phrase qui contient un nom de variable, de fonction ou
de classe CSS est à réécrire : elle décrit ton code, pas le produit.

**Temps 2 — les tests.** Écris-les. Contraintes :
- chaque élément est trouvé par son **rôle et son nom accessible** (le libellé que
  l'utilisateur lit), jamais par une classe ni un identifiant technique ;
- chaque assertion porte sur ce qui est **visible**, ou sur l'appel de `onConnexion` avec les
  bons arguments ;
- aucun test ne mentionne un `useState`, un nom de composant interne, ni une structure DOM.

**Temps 3 — les deux épreuves.** C'est ta production principale, sous forme d'un tableau à
remplir.

**Épreuve du remaniement (les tests doivent rester VERTS).** Applique ces quatre changements,
un par un, et note le verdict de chaque test :

| # | Changement | Ce que voit l'utilisateur |
|---|---|---|
| R1 | renommer toutes les classes CSS | rien ne change |
| R2 | remplacer le `<div>` d'erreur par un `<p role="alert">` | rien ne change… sauf en mieux |
| R3 | passer de deux `useState` à un `useReducer` | rien ne change |
| R4 | extraire les champs dans un sous-composant `<ChampTexte>` | rien ne change |

**Épreuve de la mutation (les tests doivent devenir ROUGES).** Introduis ces quatre bugs, un
par un, et note quels tests les attrapent :

| # | Mutation | Bug introduit |
|---|---|---|
| M1 | supprimer la validation du format du courriel | un courriel invalide est accepté |
| M2 | inverser la condition d'affichage de l'erreur | l'erreur s'affiche quand tout va bien |
| M3 | appeler `onConnexion()` sans argument | la connexion part vide |
| M4 | appeler `onConnexion` même quand le formulaire est invalide | la validation ne sert à rien |

**Ta production :** le tableau des huit lignes, avec pour chacune le verdict obtenu, et deux
paragraphes :

- **A.** Chaque test qui a viré au rouge pendant l'épreuve du remaniement : pourquoi, et
  comment tu le réécris pour qu'il n'y soit plus sensible.
- **B.** Chaque mutation qu'aucun test n'a attrapée : c'est un **trou de couverture réel**, et
  c'est l'information la plus précieuse de tout l'exercice. Écris le test manquant.

**Critère de réussite.** (a) Les quatre remaniements laissent tous les tests verts ; (b) les
quatre mutations font rougir au moins un test chacune ; (c) si l'un des huit ne se comporte
pas ainsi, tu l'as écrit et tu as écrit la correction ; (d) aucun de tes tests ne contient de
sélecteur CSS.

**Durée.** 90 minutes environ. C'est long, et c'est la pratique de tout le lot dont le
bénéfice professionnel est le plus direct.

## ✅ Correction

### La démarche : pourquoi les deux épreuves, et pas une

Une suite de tests a deux qualités indépendantes, et la plupart des équipes n'en mesurent
aucune :

- la **sensibilité** : attrape-t-elle les vrais bugs ? — mesurée par l'épreuve de la mutation ;
- la **spécificité** : reste-t-elle silencieuse quand rien de significatif ne change ? —
  mesurée par l'épreuve du remaniement.

Le taux de couverture, la métrique qu'on affiche partout, ne mesure ni l'une ni l'autre. Il
compte les lignes **exécutées** pendant les tests, pas les lignes **vérifiées**. Un test qui
appelle une fonction sans rien affirmer sur son résultat produit une couverture parfaite et
une sensibilité nulle.

L'épreuve de la mutation est la seule qui répond vraiment à « mes tests servent-ils à quelque
chose ? », et elle ne demande aucun outil : casser son propre code à la main pendant un quart
d'heure suffit.

### Temps 1 — les comportements attendus

```
1. Soumettre le formulaire vide affiche « Le courriel est obligatoire ».
2. Saisir « ada » puis soumettre affiche « Format de courriel invalide ».
3. Un mot de passe de moins de 8 caractères affiche « Mot de passe trop court ».
4. Avec un courriel valide et un mot de passe valide, la connexion est demandée
   avec exactement ce qui a été saisi.
5. Tant qu'un champ est invalide, aucune connexion n'est demandée.
```

Le point 5 est celui qu'on oublie, et c'est précisément celui que la mutation M4 exploite.
Règle générale : **pour chaque comportement « quand X, alors Y », il existe un comportement
jumeau « quand pas X, alors pas Y »**, et c'est presque toujours le second qui manque.

### Temps 3 — l'épreuve du remaniement

Les quatre remaniements doivent tous rester verts, pour la même raison : **aucun ne modifie ce
que l'utilisateur perçoit**.

- **R1** ne casse que les tests qui interrogent par classe. Si tu as suivi la consigne, aucun.
- **R2** est intéressant : il *améliore* l'accessibilité, puisque `role="alert"` fait annoncer
  l'erreur par les lecteurs d'écran. Un test couplé au DOM (`querySelector('.erreur')`) punit
  cette amélioration. Un test couplé au comportement, qui cherche le texte de l'erreur, la
  laisse passer, et pourrait même la vérifier.
- **R3** est le test décisif de ta compréhension : `useState` ou `useReducer` est une décision
  strictement interne. Un test qui la remarque teste ton code, pas ton produit.
- **R4** ne change que l'arborescence des composants. Le libellé et le champ restent liés, donc
  la recherche par nom accessible continue de fonctionner.

**Si un test rougit ici**, la correction est toujours la même : remplacer l'ancrage structurel
par un ancrage sur ce que l'utilisateur perçoit — le texte d'un libellé, le rôle d'un élément,
le contenu visible.

### Temps 3 — l'épreuve de la mutation

| Mutation | Test qui doit l'attraper |
|---|---|
| M1 — plus de validation de format | comportement 2 |
| M2 — condition d'erreur inversée | comportement 1 **et** 4 |
| M3 — `onConnexion()` sans argument | comportement 4, s'il vérifie les **arguments** |
| M4 — connexion même si invalide | comportement 5 |

Deux d'entre elles méritent qu'on s'y arrête.

**M3 est la mutation qui révèle les assertions paresseuses.** Un test qui vérifie seulement
« `onConnexion` a été appelé » reste vert : elle a bien été appelée, sans rien. La connexion
part avec des identifiants vides et le test l'approuve. La correction est d'affirmer sur les
**arguments**, pas sur l'appel :

```js
expect(onConnexion).toHaveBeenCalledWith({
  email: 'ada@exemple.fr',
  motDePasse: 'motdepasse123',
});
```

C'est un défaut extrêmement répandu, parce que « la fonction a été appelée » ressemble déjà à
une vérification sérieuse.

**M4 est celle qu'aucun test n'attrape le plus souvent**, et pour une raison structurelle : on
écrit spontanément des tests du chemin qui marche. Sur les cinq comportements listés, quatre
décrivent ce qui *doit* se produire et un seul ce qui *ne doit pas*. Le test manquant :

```js
// formulaire invalide → aucune demande de connexion
remplir(courriel, 'ada');            // format invalide
cliquer(bouton);
expect(onConnexion).not.toHaveBeenCalled();
```

Si tu n'as attrapé aucune mutation avec un test existant, ce n'est pas un échec de l'exercice :
c'est son résultat. Tu viens de découvrir que ta suite ne testait que le succès, ce que la
couverture de lignes n'aurait jamais montré.

### La mauvaise solution plausible

Rendre les tests plus « robustes » en ajoutant des attributs dédiés partout :

```jsx
<input data-testid="champ-email" />
```

Le test ne casse plus au remaniement, l'épreuve R1 passe. Mais on n'a pas testé le
comportement : on a créé un **second contrat**, invisible à l'utilisateur, qu'il faut
maintenir en parallèle du premier. Et surtout, on perd une vérification gratuite : chercher le
champ par son libellé échoue si le libellé n'existe pas ou n'est pas associé — ce qui est un
vrai défaut d'accessibilité que le test signalait pour rien.

`data-testid` reste légitime là où il n'existe aucun texte accessible : un conteneur graphique,
une zone de dessin, une ligne de tableau sans identifiant naturel. C'est un dernier recours,
pas une convention par défaut.

### Généralisation

L'épreuve de la mutation n'a rien de spécifique au frontend, ni même aux tests
automatiques. C'est la question fondamentale de tout dispositif de contrôle : **si le défaut
que je crains survenait, mon dispositif le verrait-il ?**

Elle se pose à une alerte de supervision (déclenche-t-elle si le service tombe vraiment ?), à
une revue de code (attraperait-elle ce type de bug ?), à une sauvegarde (a-t-on déjà essayé de
restaurer ?). Dans les trois cas, la réponse est inconnue tant qu'on n'a pas provoqué la panne
soi-même — et dans les trois cas, on découvre le plus souvent qu'elle est non.

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
