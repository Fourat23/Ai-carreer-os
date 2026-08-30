<!-- keep -->
# Leçon — Intégration continue (CI/CD)

## 🌍 Le problème d'abord
Tu pousses une modification un vendredi soir. Elle casse une fonctionnalité que tu n'avais pas pensé à retester, et personne ne s'en aperçoit avant lundi — en production, devant les utilisateurs. Retester TOUT à la main à chaque changement est impossible ; compter sur sa mémoire est illusoire. Il te faut un ROBOT qui rejoue automatiquement toutes tes vérifications (lint, tests, build) à chaque push et t'arrête AVANT que la casse n'atteigne les autres. C'est l'intégration continue. Cette leçon te montre pourquoi elle attrape les régressions tôt et comment écrire un pipeline simple — le signe qu'un projet est « sérieux ».

## 🎯 Objectif
Comprendre ce qu'est une CI, pourquoi elle attrape les régressions avant qu'elles n'arrivent en production, et savoir écrire un pipeline simple (lint + tests + build, et pour l'IA une éval smoke). C'est ce qui rend un projet « sérieux » aux yeux d'un recruteur et d'une équipe.

## 🧩 Prérequis
Tu dois savoir écrire et lancer des tests automatisés (`/doc/lessons/testing-foundations`) et
travailler par branches avec `git push` (`/doc/lessons/git-fundamentals`), car la CI se
déclenche sur ces événements.

Trois mots sont supposés ailleurs et définis ICI, parce que la leçon les emploie sans arrêt :
**lint**, **build**, **pull request**. Aucun fournisseur de CI particulier n'est supposé : on
raisonne sur les étapes, pas sur un outil.

## 🧠 Modèle mental
La CI, c'est **un robot qui rejoue tes vérifications à chaque push** : il lint, teste, construit. Si quelque chose casse, il te le dit AVANT que ça n'atteigne les autres ou la prod. C'est ton filet de sécurité, automatisé et impartial.

## 📖 Explication complète

**Les trois mots que la suite emploie partout.**
- **Linter** un projet, c'est le faire relire par un programme qui connaît les conventions du
  langage : variable déclarée jamais utilisée, `import` oublié, comparaison suspecte,
  indentation incohérente. Un linter ne teste RIEN — il ne lance pas ton code, il le lit. Il
  attrape la faute d'inattention avant qu'elle ne devienne un bug.
- **Construire** (*build*) un projet, c'est transformer le code source en ce qui sera
  réellement exécuté : compiler du TypeScript en JavaScript, regrouper les fichiers, produire
  le dossier livrable. Beaucoup d'erreurs n'apparaissent qu'à ce moment-là.
- Une **pull request** est une proposition de fusionner une branche dans une autre, ouverte à
  la relecture avant d'être acceptée. C'est l'événement sur lequel la CI se déclenche le plus
  souvent, parce que c'est le dernier moment où arrêter quelque chose coûte peu.

**La CI est un robot qui rejoue tes vérifications sur une machine neuve.** À chaque `push` ou
pull request, un service (GitHub Actions, par exemple) démarre une machine VIERGE, y récupère
ton dépôt, et exécute une suite d'étapes dans l'ordre : installer les dépendances, linter,
tester, construire. Si une étape sort en erreur, la suite s'arrête et la fusion est bloquée.

**Ce que la machine neuve apporte, et que ta machine ne peut pas apporter.** Ton poste porte
des années d'installations : un outil global, une variable d'environnement définie une fois,
un fichier créé à la main et jamais commité. Ton code peut dépendre de tout cela sans que tu
le saches — c'est exactement le mécanisme du « ça marche chez moi ». Une machine qui ne
possède QUE ton dépôt ne peut pas s'appuyer sur ce qui n'y est pas. Elle ne détecte pas la
dépendance oubliée : elle rend impossible de ne pas la voir.

**Un effet secondaire précieux : la recette devient exécutable.** Le fichier de CI énonce, pas
à pas, comment ce projet s'installe et se construit. C'est la seule documentation qui ne peut
pas devenir fausse sans qu'on s'en aperçoive — si elle ment, la CI rougit.

**Pour un système IA, le code juste ne suffit pas.** Une modification de prompt ne casse aucun
test et peut faire chuter la qualité des réponses. On ajoute donc une **éval smoke** : quelques
questions dont on connaît la bonne réponse, rejouées à chaque push, avec les appels au modèle
simulés à partir de réponses enregistrées (**mock/replay**) — ainsi la CI reste rapide,
gratuite et déterministe. Si le score passe sous un seuil, la CI échoue, comme pour un test.
`/doc/lessons/ai-evaluation` détaille la construction de ce jeu de questions.

## 🔎 Décomposition
- « Est-ce que mon code respecte les conventions ? » → le lint.
- « Est-ce qu'il fait ce qu'il doit ? » → les tests.
- « Est-ce qu'il se construit vraiment ? » → le build.
- « Est-ce qu'il dépend de MA machine ? » → la machine neuve de la CI, et elle seule.
- « Est-ce que sa QUALITÉ a régressé ? » → l'éval smoke, pour un système IA.

## 🔧 Exemple simple
Un workflow GitHub Actions qui, à chaque push : `npm ci` → `npm test` → `npm run build`. Si un test rougit, le badge passe au rouge.

## 🧭 Exemple guidé — « la CI est rouge une fois sur cinq, on relance »

C'est la phrase la plus dangereuse d'une équipe, parce qu'elle a l'air d'un
détail d'organisation alors qu'elle décrit la mort d'un dispositif de sécurité.
Le raisonnement se fait en trois temps : diagnostiquer, mesurer, calculer.

### 1. Rouge par intermittence ≠ défaut d'infrastructure

Le réflexe est d'accuser la machine. Le script
`scripts/v70-verifications/tests-instables.mjs` fabrique les deux causes
réelles les plus fréquentes et les mesure.

**Cause A — deux tests partagent un état.** Deux tests d'un même fichier
touchent un panier déclaré au niveau du module :

```js
const panier = { lignes: [] };            // état partagé au niveau du module
test('ajouter une ligne', () => {
  panier.lignes.push({ sku: 'A', qte: 1 });
  assert.equal(panier.lignes.length, 1);
});
test('le panier vide coute 0', () => {
  assert.equal(panier.lignes.reduce((s, l) => s + l.qte, 0), 0);
});
```

Mesure :

```
les deux tests ensemble  : ROUGE      # pass 1   # fail 1
le second test SEUL      : VERT
```

Le second test est vert quand on l'exécute seul et rouge quand il suit le
premier. Sur une machine de développement, on lance souvent un seul fichier ou
un seul test ; en CI, tout tourne. Le développeur qui reproduit en local voit du
vert et conclut « c'est la CI ». **Le défaut n'est pas dans la CI : il est dans
le partage d'état.** Ce test-là n'est pas instable au hasard — il est
déterministe, mais sa valeur dépend de l'ordre. Le jour où le lanceur de tests
parallélise ou change d'ordre, il change de couleur sans qu'une ligne de code
ait bougé.

**Cause B — le test attend une durée au lieu d'attendre l'événement.** Cette
fois l'instabilité est réelle. Le script mesure la durée d'un aller-retour
d'écriture-lecture de 64 Ko sur disque, machine au repos puis avec seize
travaux en parallèle, 320 mesures dans chaque cas :

```
machine au repos        : médiane 0,53 ms · p95 0,80 ms · max 2,73 ms
    un test qui attend  2 ms fixes : 319 vertes /   1 rouges sur 320
    un test qui attend  5 ms fixes : 320 vertes /   0 rouges sur 320

16 travaux en parallèle : médiane 3,10 ms · p95 3,69 ms · max 3,88 ms
    un test qui attend  2 ms fixes :   0 vertes / 320 rouges sur 320
    un test qui attend  5 ms fixes : 320 vertes /   0 rouges sur 320
```

Lis la ligne « 2 ms » deux fois. Au repos : **une rouge sur 320**, soit 0,3 %.
C'est exactement le profil « ça arrive de temps en temps, on relance » — assez
rare pour ne jamais être diagnostiqué, assez fréquent pour agacer. Sous charge :
**320 rouges sur 320**. Le même test, sans une ligne modifiée, passe de
« quasiment toujours vert » à « toujours rouge » selon ce qui tourne à côté. Un
agent de CI est partagé : il a par construction moins de marge qu'un poste de
développement au repos.

Ce qu'il faut refuser ici, c'est le correctif réflexe. Passer de 2 ms à 5 ms
rend la colonne verte dans les deux cas mesurés — et déplace simplement le seuil
jusqu'à la prochaine machine plus chargée. **Le correctif est d'attendre la fin
de l'opération (`await`) et non une durée.** Une attente fixe est une
supposition sur la vitesse de la machine ; elle sera fausse un jour.

### 2. Ce que « on relance » coûte réellement

Admettons qu'on renonce à diagnostiquer. Un pipeline est vert quand **tous** ses
tests passent, donc les probabilités se multiplient. Pour 300 tests dont une
fraction *p* est instable :

```
 2 % de tests instables sur 300 tests -> pipeline vert du premier coup : 0,2333 %
 5 % de tests instables sur 300 tests -> pipeline vert du premier coup : 0,0000 %
10 % de tests instables sur 300 tests -> pipeline vert du premier coup : 0,0000 %
```

À 2 % — un taux que personne ne qualifierait d'alarmant — un pipeline vert du
premier coup arrive **deux fois sur mille**. Ce n'est pas une gêne : c'est un
pipeline qui ne dit plus rien. Le taux de tests instables tolérable n'est pas
« faible » ; il est proche de zéro, et c'est la multiplication qui l'impose, pas
une exigence de perfectionniste.

### 3. La conséquence humaine, qui est la vraie

Quand relancer devient l'habitude, l'équipe apprend à ne plus lire le rouge.
Le jour où le rouge est un vrai bug, il est relancé lui aussi — deux fois, puis
fusionné parce que « ça passe parfois ». **Une CI instable n'est pas une CI
dégradée : c'est une CI absente, avec en plus le coût de l'attente et la
confiance en moins.** C'est pourquoi un test instable se traite comme un
incident et non comme une dette : on le corrige, ou on le retire du chemin
bloquant en assumant explicitement qu'il ne protège plus rien.

**Variante à faire toi-même** : prends ta propre suite de tests, lance-la avec
un ordre inversé (`--test-shuffle` sur Node, `-p randomly` sur pytest). Le
nombre d'échecs nouveaux mesure ta dépendance à l'ordre. C'est cinq minutes, et
le résultat est rarement zéro.

## 🤖 Exemple appliqué (IA / data / architecture)
La CI de DocSense lance lint + tests + une éval smoke (5 questions en replay) à chaque push : elle attrape autant les bugs de code que les régressions de QUALITÉ (une modif de prompt qui fait chuter la fidélité). C'est ce qui rend un système IA maintenable dans le temps.

## ⚠️ Erreurs fréquentes

**La CI décorative, montrée.** Ce workflow existe dans beaucoup de dépôts. Il tourne, il
affiche un badge vert, et il ne protège de RIEN :

```yaml
# ❌ INUTILE : deux façons différentes de toujours réussir.
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install          # ← peut installer d'autres versions que les tiennes
      - run: npm test || true     # ← l'échec est avalé : le job réussit toujours
      - run: npm run build
        continue-on-error: true   # ← idem, en plus explicite
```

`|| true` transforme n'importe quel échec en succès ; `continue-on-error` fait la même chose
pour l'étape suivante. Le badge reste vert pendant que les tests échouent depuis trois
semaines. Et `npm install` peut installer une version de dépendance différente de celle que tu
as testée, ce qui rend la CI verte sur un code que personne n'a réellement vérifié.

```yaml
# ✅ UTILE : chaque étape peut faire échouer le job, et les versions sont figées.
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci               # versions exactes du package-lock
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

La façon de vérifier qu'une CI sert à quelque chose tient en une manipulation : casse
volontairement un test, pousse, et regarde si elle rougit. Si elle reste verte, elle est
décorative.

Les autres :
- Ne tester qu'en local : on rate précisément ce que la machine neuve détecte.
- Étapes non déterministes (dépendances non figées) : la CI échoue au hasard, l'équipe
  apprend à relancer sans lire, et la CI cesse d'être crue.
- Afficher un secret dans les journaux : ils sont conservés et souvent publics.

## 🚫 Anti-patterns
- Désactiver les tests qui échouent au lieu de les corriger.
- Une CI lente de 40 min qui décourage les pushes fréquents.

## ✍️ Mini-exercice
Sans relire : un test passe seul et échoue dans la suite. Qu'est-ce que cela
prouve sur la CI, et qu'est-ce que cela prouve sur le test ?

## 🔥 Pratique — construire une CI, puis prouver qu'elle protège

Une CI qu'on n'a jamais vue rougir n'est pas vérifiée. Cette pratique produit un
fichier de workflow, une trace d'échec, et une mesure.

**A. La CI minimale, avec la preuve.** Sur un de tes projets, écris
`.github/workflows/ci.yml` qui installe des dépendances figées, lint, teste et
construit. Puis fais la seule vérification qui compte : **casse volontairement un
test, pousse, et garde la trace du pipeline rouge.** Restaure ensuite. Livrable :
le fichier, plus la capture ou le journal du rouge et du vert qui suit.

**B. Détecter la dépendance à l'ordre.** Lance ta suite trois fois avec un ordre
aléatoire. Note combien de tests changent de couleur. Pour chacun, identifie
l'état partagé responsable et corrige-le. Livrable : la liste des tests
concernés avant/après, et le mécanisme de partage identifié pour au moins un.

**C. Mesurer ton propre risque.** Écris un script qui lance ta suite N fois (N ≥
20), compte les échecs par test, et calcule la probabilité qu'un pipeline
complet soit vert du premier coup. Livrable : le tableau et le pourcentage.

**D. Rendre la CI utile à un système IA.** Ajoute une étape d'évaluation de
fumée sur un mini jeu de référence rejoué (appels au modèle simulés, donc
déterministes), qui échoue si un score descend sous un seuil. Puis dégrade
volontairement le prompt et montre que l'étape rougit.

## ✅ Correction attendue

**A — la CI minimale.** La forme attendue :

```yaml
on: [push, pull_request]
jobs:
  verifier:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci          # versions exactes du fichier de verrouillage
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

Trois points sur lesquels une réponse se juge. **`npm ci` et non `npm install`** :
`install` peut résoudre une version de dépendance différente de celle que tu as
testée, ce qui rend la CI verte sur un assemblage que personne n'a vérifié.
**Aucun `|| true` ni `continue-on-error`** : chacun transforme l'échec en
succès, et le badge reste vert pendant que les tests échouent depuis trois
semaines. **La preuve du rouge** : sans elle, tu as un fichier YAML, pas une CI.
La très grande majorité des CI décoratives que tu croiseras n'ont jamais été
testées en échec.

Une quatrième chose, moins évidente : `on: [push, pull_request]` et non `on:
[push]` seul. Une CI qui ne tourne pas sur les demandes de fusion ne peut pas
bloquer une fusion, et « bloquer » est toute sa raison d'être. Le blocage
lui-même ne vient pas du fichier YAML mais du réglage de branche protégée côté
plateforme — c'est une confusion fréquente en entretien.

**B — la dépendance à l'ordre.** Les mécanismes de partage à chercher, par ordre
de fréquence : une variable déclarée au niveau du module (le cas mesuré plus
haut), une base de données ou un fichier non réinitialisé entre les tests, une
horloge ou un générateur aléatoire figé par un test et pas restauré, un module
simulé installé globalement et jamais démonté, une variable d'environnement
posée par un test.

Le correctif n'est pas « lancer les tests dans le bon ordre » — c'est retirer
la dépendance. Chaque test doit construire son état et le détruire :

```js
let panier;
beforeEach(() => { panier = { lignes: [] }; });   // état neuf à chaque test
```

Si un test ne peut pas être exécuté seul, ce n'est pas un test : c'est la
seconde moitié d'un autre test.

**C — la probabilité.** Le calcul attendu est le produit, pas la moyenne. Si le
test *i* est vert avec la probabilité *pᵢ*, le pipeline est vert avec ∏*pᵢ*.
C'est ce produit qui explique le tableau mesuré : 0,98³⁰⁰ ≈ 0,0023. La
conclusion qu'on attend de toi n'est pas « il faut moins de tests instables »
mais **« un test instable coûte à toute la suite, pas à lui seul »** — ce qui
justifie de le traiter en priorité plutôt que de l'accumuler.

Un piège dans la mesure : si tu lances les N exécutions sur une machine au
repos, tu obtiendras un taux d'instabilité proche de zéro et tu concluras à
tort que tout va bien. Les mesures de la section guidée montrent l'écart entre
repos et charge (0,3 % contre 100 % pour le même test). Lance au moins une
série avec une charge concurrente pour approcher les conditions de la CI.

**D — l'évaluation de fumée.** Le point de conception : les appels au modèle
doivent être **rejoués** et non réels. Un appel réel rend l'étape non
déterministe (la réponse varie), lente, payante, et dépendante de la
disponibilité d'un service tiers — soit exactement les quatre propriétés qu'on
refuse à une porte bloquante. On enregistre donc un petit jeu de réponses, et la
CI compare les scores calculés sur ces réponses figées.

Ce que cette étape attrape et que les tests unitaires n'attrapent pas : une
modification de prompt qui ne casse aucun test mais fait chuter la fidélité des
réponses. Le seuil doit être posé **avant** de voir le résultat, sans quoi il
n'est qu'une description de l'état actuel. Et la dégradation volontaire du
prompt joue ici le même rôle que le test cassé en A : elle prouve que la porte
peut refuser.

## 🎤 Questions d'entretien
- « Qu'est-ce que la CI et pourquoi c'est utile ? » → Rejouer les vérifs sur une machine propre à chaque push ; attrape régressions et « ça marche chez moi ».
- « Comment testes-tu un système qui appelle un LLM en CI ? » → Mock/replay des appels + éval smoke sur un mini golden set.
- « CI vs CD ? » → CI vérifie, CD livre automatiquement quand c'est vert.

## 🧾 À retenir
- La CI rejoue tes vérifications sur une machine neuve à chaque envoi. Sa
  valeur vient uniquement de sa capacité à **bloquer**.
- Une CI qu'on n'a jamais vue rougir n'est pas vérifiée. La manipulation qui la
  qualifie : casser un test, pousser, regarder.
- Un test vert seul et rouge en suite ne dénonce pas la CI : il dénonce un état
  partagé entre tests. Mesuré : `# pass 1 # fail 1` ensemble, vert isolé.
- Un test qui attend une durée fixe change de couleur avec la charge de la
  machine. Mesuré : 319/320 vertes au repos, 0/320 sous charge, pour le même code.
- Les probabilités se multiplient : 2 % de tests instables sur 300 tests
  donnent 0,23 % de pipelines verts du premier coup.
- `npm ci` et non `npm install` ; jamais `|| true` ni `continue-on-error` sur
  une étape qui doit protéger.

## 📚 Vocabulaire
**CI / CD** · **pipeline / workflow** · **runner** (la machine neuve qui exécute le workflow) ·
**lint** · **build** · **pull request** · **éval smoke** · **mock / replay** · **badge** (la
pastille verte ou rouge affichée sur le dépôt) · **npm ci** (dépendances figées).

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] J'ai une CI qui lint, teste et construit à chaque push.
- [ ] Ma CI bloque le merge en cas d'échec.
- [ ] Je sais y ajouter une éval smoke pour un système IA.

## 🔗 Liens avec le programme
Mois 11 (jours ~305-325), projet final. Leçons liées : `testing-foundations`, `docker-containers`, `ai-evaluation`.
