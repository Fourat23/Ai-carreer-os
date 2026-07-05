<!-- keep -->
# Leçon — Intégration continue (CI/CD)

## 🎯 Objectif
Comprendre ce qu'est une CI, pourquoi elle attrape les régressions avant qu'elles n'arrivent en production, et savoir écrire un pipeline simple (lint + tests + build, et pour l'IA une éval smoke). C'est ce qui rend un projet « sérieux » aux yeux d'un recruteur et d'une équipe.

## 🧠 Modèle mental
La CI, c'est **un robot qui rejoue tes vérifications à chaque push** : il lint, teste, construit. Si quelque chose casse, il te le dit AVANT que ça n'atteigne les autres ou la prod. C'est ton filet de sécurité, automatisé et impartial.

## 📖 Explication complète
- **CI (intégration continue)** : à chaque push/PR, un service (GitHub Actions) exécute automatiquement une série d'étapes dans un environnement PROPRE : installer les dépendances, linter, lancer les tests, construire. Un échec bloque le merge.
- **CD (déploiement/livraison continue)** : prolonge la CI en livrant automatiquement (image Docker publiée, déploiement) quand tout est vert.
La valeur : la CI tourne sur une machine NEUVE, donc elle attrape le « ça marche chez moi » (dépendance oubliée, fichier non commité). Elle documente aussi le « comment on construit ce projet » de façon exécutable.
Pour un système IA, on ajoute une **éval smoke** : quelques questions du golden set jouées en mode mock/replay, pour détecter une régression de qualité — pas seulement de code.

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
- Tester en local seulement (on rate le « ça marche chez moi »).
- Une CI qui ne bloque pas (verte quoi qu'il arrive) : inutile.
- Étapes non déterministes (dépendances non figées) → CI instable.
- Secrets exposés dans les logs de CI.

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
**CI / CD** · **pipeline / workflow** · **runner** · **lint** · **build** · **éval smoke** · **badge** · **npm ci (dépendances figées)**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] J'ai une CI qui lint, teste et construit à chaque push.
- [ ] Ma CI bloque le merge en cas d'échec.
- [ ] Je sais y ajouter une éval smoke pour un système IA.

## 🔗 Liens avec le programme
Mois 11 (jours ~305-325), projet final. Leçons liées : `testing-foundations`, `docker-containers`, `ai-evaluation`.
