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

## 🧭 Exemple guidé
**Énoncé** : écrire une CI minimale.
**Raisonnement** : une machine propre, les étapes dans l'ordre, échec = blocage.
**Solution** (`.github/workflows/ci.yml`) :
```yaml
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm test
      - run: npm run build
```
**Explication** : chaque `run` échoue → le job échoue → le merge est bloqué. **Variante** : ajoute une étape `npm run curriculum:check` ou une éval smoke.

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
Ajoute une CI (lint + test + build) à un de tes projets et provoque un échec (casse un test) pour voir le pipeline rougir.

## 🔥 Exercice plus difficile
Ajoute à ta CI une étape d'éval smoke pour un mini système LLM (mock des appels), qui échoue si un score descend sous un seuil.

## ✅ Correction attendue
La logique : machine propre + étapes ordonnées + échec bloquant. Vérifie : la CI rougit vraiment quand un test casse, elle installe des dépendances figées (`npm ci`), aucun secret n'apparaît dans les logs, et (pour l'IA) une régression de qualité est détectée.

## 🎤 Questions d'entretien
- « Qu'est-ce que la CI et pourquoi c'est utile ? » → Rejouer les vérifs sur une machine propre à chaque push ; attrape régressions et « ça marche chez moi ».
- « Comment testes-tu un système qui appelle un LLM en CI ? » → Mock/replay des appels + éval smoke sur un mini golden set.
- « CI vs CD ? » → CI vérifie, CD livre automatiquement quand c'est vert.

## 🧾 À retenir
- La CI rejoue tes vérifications sur une machine propre à chaque push.
- Un échec doit BLOQUER ; sinon la CI ne sert à rien.
- Pour l'IA : ajouter une éval smoke pour attraper les régressions de qualité.

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
