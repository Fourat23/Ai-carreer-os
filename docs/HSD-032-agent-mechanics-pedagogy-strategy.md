# HSD-032 — Stratégie pédagogique : mécanique des agents & sûreté IA

Document de conception haut niveau (Sprint V32). Complète l'ADR-032. Décrit COMMENT enseigner la
mécanique d'ingénierie d'un système agentique à un néophyte, par la pratique déterministe.

## 1. Principe directeur

Un agent n'est pas « un LLM plus intelligent » : c'est une **boucle d'ingénierie** autour d'un
modèle faillible. La compétence recherchée n'est pas de coder un framework, c'est de **raisonner
sur les mécanismes et leurs pannes** : quel outil, quels arguments valides, quand s'arrêter,
quand réessayer, quand escalader à un humain, quelle donnée est une instruction et laquelle ne
l'est pas. Ces mécanismes sont DÉTERMINISTES et donc pratiquables sans aucun LLM réel.

## 2. La chaîne à rendre franchissable

```
intention utilisateur
  → plan
  → CHOIX D'OUTIL              (règles : capacité requise, moindre privilège)
  → VALIDATION D'ARGUMENTS     (requis, types, enum, champs inconnus, source non fiable)
  → action
  → observation
  → MISE À JOUR D'ÉTAT         (machine à états : THINK→SELECT→VALIDATE→EXECUTE→OBSERVE→…)
  → décision                    (continuer / réessayer / escalader / terminer)
  → TERMINAISON                 (succès / échec / budget épuisé / boucle détectée)
  → évaluation
```

Chaque maillon en MAJUSCULES devient un exercice déterministe (CP7).

## 3. Modèles mentaux imposés (intuition avant formalisme)

- **Outil = API dont le consommateur est un LLM** : la description EST la doc ; moindre
  privilège (lecture, pas « exécute du shell »).
- **Validation d'arguments = frontière de confiance** : le modèle PROPOSE des arguments, ton
  code les VÉRIFIE (type, enum, champs inconnus) avant d'exécuter — comme la validation d'entrée
  d'une API.
- **Machine à états = plan de vol** : un agent bien conçu n'est pas un `while` flou mais une
  suite d'états explicites avec transitions légales ; un état illégal = un bug rattrapable.
- **Boucle = coût qui court** : une boucle non bornée est une facture ; on borne par maxSteps,
  budget, et détection d'état répété (A→B→A→B).
- **Retry = tri des erreurs** : réessayer une erreur non-retryable (argument invalide,
  permission refusée) est inutile et dangereux ; seules les erreurs transitoires (rate limit,
  timeout) se réessaient, avec backoff.
- **HITL = frein sur action irréversible** : on escalade à un humain quand l'action est
  irréversible, coûteuse, sensible, ou la confiance basse.
- **Injection indirecte = donnée déguisée en instruction** : un texte récupéré n'est JAMAIS une
  instruction, même s'il en a la forme.

## 4. Maths / logique honnêtes

- Détection de boucle : notion d'état déjà visité (ensemble) avant toute formalisation.
- Backoff : intuition « attendre de plus en plus longtemps » avant la formule exponentielle.
- Aucun « magic happens here » : la logique de décision est toujours visible et testable.

## 5. Frontière réel/simulé dans les exercices

Chaque exercice porte la mention **SIMULATION** dans son résumé et n'expose que du calcul
déterministe. Ce qui viendrait d'un modèle (réponse, embedding, résultat d'outil externe) est
fourni en donnée d'entrée, jamais « exécuté ». Aucun résultat fictif présenté comme mesure
réelle.

## 6. Contrat de leçon (rappel V27→V31)

On-ramp « 🌍 Le problème d'abord » → 🎯 Objectif → 🧩 Prérequis rédigés → 🧠 Modèle mental →
explication progressive → exemples gradués → ⚠️ erreurs fréquentes → pratique reliée
(practiceRefs) → 🧾 À retenir → 📚 Vocabulaire → 🔗 Liens. Les 4 leçons agent/sécurité étant
déjà au standard (CP0), V32 ajoute surtout la **pratique reliée** et de légers renforts, sans
réécrire une théorie saine.

## 7. Anti-slop

Pas de remplissage, pas de jargon non introduit, pas de longueur prise pour de la profondeur,
pas d'exercice créé sans trou réel. Une excellente pratique reliée vaut mieux que cinq
exercices artificiels.
