# Correction — Jour 270 : Projet 6 — Guardrails et robustesse

[← Retour au jour 270](../days/day-270.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
L'intégration vérifie que qualité et sécurité coexistent : suite adverse re-jouée sur le système amélioré (une optimisation peut rouvrir une faille), qualité re-mesurée avec guardrails actifs (ils ne doivent pas bloquer les bonnes réponses), refus re-calibré. Le critère est CONJOINT — verte ET maintenue ET fonctionnel — et c'est le passage de la pensée-feature à la pensée-système.

## ⚠️ Erreurs probables et points à vérifier
- Tester qualité et sécurité séparément : le conflit (guardrail qui bloque une bonne réponse, amélioration qui rouvre une faille) n'apparaît qu'au test CONJOINT.
- Oublier de re-jouer la suite adverse après les améliorations de qualité : le nouveau prompt peut être plus vulnérable — la non-régression de sécurité s'applique à CHAQUE changement.
- Ne pas re-calibrer le refus après un meilleur retrieval : les scores ont changé, le seuil du jour 263 peut ne plus être optimal.
- Négliger la robustesse aux cas limites (vide, langue, longueur) : un système qui casse sur une entrée bizarre n'est pas déployable, même s'il est sûr et de qualité.

## 🔍 Comment vérifier ta solution
- La suite adverse est verte sur le système AMÉLIORÉ (rien rouvert par les améliorations).
- La qualité est re-mesurée avec guardrails actifs et n'a pas régressé (les guardrails ne bloquent pas les bonnes réponses).
- Le refus est re-calibré post-amélioration (hors corpus refusés, couvertes non refusées).
- La robustesse aux cas limites (vide, long, autre langue, ambigu) est testée : dégradation propre.
- Le critère conjoint (sécurité + qualité + refus) est atteint et DocQA v1 déclaré déployable.

## 🎤 À savoir expliquer à l'oral
Explique la pensée-système : « chaque partie marchait isolément ; l'intégration vérifie qu'elles ne se sabotent pas — les guardrails ne bloquent pas les bonnes réponses, les améliorations n'ont pas rouvert de faille ; mon critère est CONJOINT ». Puis le cas de tension qualité/sécurité (synthèse légitime avec fragment suspect). Penser en système, pas en features, est ce qui fait un livrable professionnel.
