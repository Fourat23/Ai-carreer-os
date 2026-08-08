<!-- keep -->
# Leçon — Évaluer un modèle ML

## 🌍 Le problème d'abord
Un collègue annonce fièrement : « mon modèle de détection de fraude a 99 % d'exactitude ! ».
Impressionnant… jusqu'à ce que tu réalises que 99 % des transactions sont légitimes : un
modèle qui répond TOUJOURS « pas de fraude » atteint aussi 99 % — et ne détecte aucune fraude.
Le chiffre était juste, mais la QUESTION posée aux prédictions était la mauvaise. Évaluer un
modèle, ce n'est pas lire un score, c'est choisir la bonne mesure selon ce qu'une erreur COÛTE
vraiment. C'est la compétence ML la plus interrogée en entretien, et celle qui distingue un
profil sérieux d'un récitant de chiffres. Cette leçon t'apprend à ne plus te faire avoir par
une belle métrique.

## 🎯 Objectif
Savoir choisir et interpréter la bonne métrique selon le problème et le COÛT MÉTIER des erreurs, lire une matrice de confusion, et éviter les pièges (accuracy trompeuse, évaluation sur le train). C'est la compétence ML la plus interrogée en entretien — et celle qui distingue un profil sérieux.

## 🧠 Modèle mental
Une métrique, c'est **la question précise qu'on pose aux prédictions**. La mauvaise question donne une bonne note à un mauvais modèle. « 99 % d'accuracy » ne veut rien dire sans savoir QUELLE question elle répond et à quoi elle se compare.

## 🧩 Prérequis
Tu dois maîtriser les bases du ML — train/test split, baseline, overfitting, matrice de
confusion, précision/rappel (`/doc/lessons/machine-learning-basics`) — et avoir les réflexes
statistiques (l'intuition de Bayes, pourquoi l'accuracy ment sur les classes déséquilibrées,
`/doc/lessons/statistics-for-ml`). Cette leçon approfondit le CHOIX de la métrique selon le
coût métier ; aucune notion nouvelle de modélisation n'est requise.

## 📖 Explication complète
- **Toujours une baseline** : la prédiction naïve (moyenne, classe majoritaire). Un modèle qui ne la bat pas ne sert à rien. Une baseline à 95 % (classes déséquilibrées) recadre tout.
- **Régression** : MAE (erreur moyenne, robuste), RMSE (pénalise les grosses erreurs) — en UNITÉS réelles (euros, degrés), donc interprétables.
- **Classification** : l'**accuracy MENT** sur le déséquilibre (prédire « jamais fraude » = 99,9 %). La **matrice de confusion** détaille vrais/faux positifs/négatifs. De là :
  - **Précision** = des positifs PRÉDITS, combien sont vrais ? (coût des fausses alertes)
  - **Rappel** = des vrais positifs, combien TROUVÉS ? (coût des ratés)
  - **F1** = compromis des deux ; **AUC** = qualité sur tous les seuils.
- Le choix dépend du **coût métier** : dépistage médical → rappel (ne rater aucun malade) ; filtre anti-spam → précision (ne pas bloquer un vrai mail). Le **seuil de décision** s'ajuste selon ce coût.
- Toujours évaluer sur un **jeu de test intact** (jamais le train), idéalement par **cross-validation** (robuste au hasard d'un split).

## 🔧 Exemple simple
Détecteur de fraude : 1 % de fraudes. Un modèle qui prédit toujours « pas de fraude » a 99 % d'accuracy et 0 % de rappel — inutile. La matrice de confusion le révèle immédiatement.

## 🧭 Exemple guidé
**Énoncé** : choisir la métrique pour un test médical (maladie rare).
**Raisonnement** : le coût d'un MALADE raté (faux négatif) est énorme ; on privilégie le rappel.
**Solution** : optimiser le **rappel** (quitte à baisser la précision), en abaissant le seuil de décision, et surveiller la précision pour ne pas alerter tout le monde. **Explication** : le coût asymétrique des erreurs dicte la métrique. **Variante** : pour un filtre anti-spam, inverse le raisonnement (précision d'abord).

## 🤖 Exemple appliqué (IA / data / architecture)
C'est le socle de l'évaluation des systèmes LLM/RAG (mois 9) : le rappel@k du retrieval est un RAPPEL classique ; choisir « fidélité » comme métrique clé d'un RAG, c'est choisir selon le coût d'erreur (une réponse inventée est pire qu'une réponse prudente). Même raisonnement, autre objet.

## ⚠️ Erreurs fréquentes
- Rapporter l'accuracy sur des classes déséquilibrées.
- Évaluer sur le train (score illusoire).
- Ignorer le coût métier des erreurs.
- Un seul split (chanceux) au lieu de cross-validation.

## 🚫 Anti-patterns
- Optimiser une métrique en aveugle sans regarder les erreurs réelles.
- Choisir la métrique après coup pour flatter le modèle.

## ✍️ Mini-exercice
Sur un dataset déséquilibré, calcule accuracy, précision, rappel et F1, et explique laquelle est trompeuse et pourquoi.

## 🔥 Exercice plus difficile
Trace la matrice de confusion, fais varier le seuil de décision, et montre l'arbitrage précision/rappel. Choisis un seuil justifié par un coût métier que tu définis.

## ✅ Correction attendue
La logique : baseline → métrique choisie selon le coût d'erreur → matrice de confusion → seuil ajusté → évaluation sur test/cross-validation. Vérifie : tu n'évalues jamais sur le train, ta métrique correspond au coût métier, et tu regardes des ERREURS réelles, pas que des chiffres agrégés.

## 🎤 Questions d'entretien
- « Ton modèle fait 99 % d'accuracy, content ? » → Pas sans baseline ni équilibre des classes ; regarder précision/rappel selon le coût.
- « Précision ou rappel pour un dépistage médical ? » → Rappel (ne rater aucun malade).
- « Pourquoi la cross-validation ? » → Évaluation robuste au hasard d'un seul split.

## 🧾 À retenir
- Toujours une baseline ; l'accuracy ment sur le déséquilibre.
- Précision vs rappel = arbitrer le coût des erreurs (faux positifs vs faux négatifs).
- Évaluer sur test intact / cross-validation ; regarder les erreurs réelles.

## 📚 Vocabulaire
**baseline** · **matrice de confusion** · **précision / rappel / F1 / AUC** · **MAE / RMSE** · **seuil de décision** · **cross-validation** · **coût métier** · **déséquilibre de classes**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je choisis une métrique selon le coût métier et je la justifie.
- [ ] Je lis une matrice de confusion et j'ajuste un seuil.
- [ ] Je n'évalue jamais sur le train et j'utilise la cross-validation.

## 🔗 Liens avec le programme
Mois 6 (jours ~155-180), projet 5 (ChurnScope) ; mois 9 (éval RAG). Leçons liées : `machine-learning-basics`, `feature-engineering`, `ai-evaluation`.
