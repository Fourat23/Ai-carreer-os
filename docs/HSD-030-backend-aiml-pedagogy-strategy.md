# HSD-030 — Spécification pédagogique : Backend/API, AI/ML historical debt, documentation SE

Document de spécification humaine du Sprint V30. Complète ADR-030 (décisions) et TSD-030
(spécification technique). Décrit CE QUE doivent enseigner les leçons corrigées/créées et
COMMENT on relie chaque leçon à une pratique réelle existante.

## 1. Contrat de leçon V30 (rappel V27–V29)
Chemin néophyte : **situation → intuition → vocabulaire → mécanisme → pratique**. Chaque
leçon importante vise : `🌍 Le problème d'abord` → `🎯 Objectif` → `🧩 Prérequis` →
`🧠 Modèle mental` → explication progressive (concret → abstrait) → exemple minimal →
`🧭 Exemple guidé` → variantes/contre-exemple → `⚠️ Erreurs fréquentes` →
(`🚨 Que faire dans ce cas ?` si pertinent) → `🧾 À retenir` → `📚 Vocabulaire` →
`🔗 Liens` + `practiceRefs`. La structure SERT la compréhension ; ce n'est pas un gabarit à
cocher. Une leçon longue n'est pas automatiquement profonde.

## 2. Critère « néophyte complet » (règle non négociable)
« Une personne qui ne connaît que les prérequis explicitement annoncés peut-elle réellement
suivre cette leçon, comprendre POURQUOI le concept existe, se construire un modèle mental
correct, puis l'appliquer sans recopier aveuglément ? » Si non, la leçon n'est pas au niveau.

## 3. Modèles mentaux à installer
- **API** : `contrat (requête attendue → réponse promise) ; route → validation → traitement → réponse`.
- **Async JS** : `la tâche longue ne bloque pas ; on promet un résultat futur et on réagit quand il arrive`.
- **Auth** : `authentification (qui es-tu ?) ≠ autorisation (as-tu le droit ?)`.
- **Statistiques ML** : `résumer/decrire l'incertitude d'un ensemble de données pour décider`.
- **ML** : `apprendre une fonction à partir d'exemples (données → motif → prédiction), pas coder des règles`.
- **LLM** : `un modèle qui prédit le prochain token ; puissant mais faillible, à cadrer et valider`.
- **Agents** : `un LLM qui choisit et enchaîne des OUTILS pour atteindre un but, avec des garde-fous`.
- **Sécurité IA** : `la sortie du modèle et les entrées sont non fiables par défaut ; défense en profondeur`.

## 4. Backend / API (CP3)
Durcir `api-design-basics` (P0), `express-backend`, `authentication`, `async-javascript`.
Chaîne cible : HTTP → contrat d'API → route → middleware → validation → traitement → async →
erreurs → authentification → autorisation → persistance → tests → compatibilité. Ne pas créer
10 leçons si les durcissements + 0–1 nouvelle suffisent. Relier aux exercices EXISTANTS
(`api-router`, `http-status`, `http-method-idempotent`, `net-http-status-class`,
`validate-user`).

## 5. AI / ML historical debt (CP8 — flagship)
Auditer les 23 leçons (Python & ML + IA appliquée), classer P0→P3, corriger un SOUS-ENSEMBLE
prioritaire (les P0 de premier contact + les plus fondamentales). Priorité pressentie
(le CP0/CP8 fait foi) : `statistics-for-ml`, `machine-learning-basics`, `llm-fundamentals`,
`agents-fundamentals`, `ai-security`, et 1–2 leçons pivots (`model-evaluation` et/ou
`prompt-engineering`). Exigences :
- **On-ramp sans jargon** : partir d'une situation concrète (« comment un filtre anti-spam
  décide-t-il ? », « pourquoi un modèle peut-il inventer une réponse fausse et sûre de lui ? »).
- **Mathématiques honnêtes** : expliquer l'intuition d'abord ; préciser le niveau requis ; ne
  jamais masquer un concept derrière une formule ; relier à un prérequis.
- **Réel vs simulé** : ne jamais prétendre entraîner un vrai modèle ni appeler un vrai LLM ;
  les exemples sont déterministes et étiquetés.
Documenter précisément la dette AI/ML restante pour V31/V32.

## 6. Software Engineering — documentation technique (CP6)
Créer une leçon de fond sur les **artefacts de documentation** : README (existe), ADR, RFC,
HLD, HSD, LLD, TSD, runbook, playbook, post-mortem, changelog — QUAND utiliser chacun et POUR
QUI il est écrit. Couvrir les **types de maintenance** (corrective/adaptative/préventive/
évolutive) si pédagogiquement manquant. Se référer aux docs d'architecture du projet lui-même
comme exemples réels.

## 7. Pratique et liaison (CP7 + practiceRefs partout)
Relier systématiquement chaque leçon durcie/créée à une pratique EXISTANTE. Ne créer un
exercice que pour un trou réel (backend décision/validation, raisonnement AI/ML). Les
exercices AI/ML sont des exercices de RAISONNEMENT déterministes (décision/classification),
jamais une fausse exécution de modèle. Contrat standard (starter faux, référence verte, test
privé, aucune fuite).

## 8. « Que faire dans ce cas ? » (CP9)
Auditer les 28 playbooks ; ajouter uniquement les scénarios absents. Méthode : symptômes →
gravité → premières vérifications → stabiliser → hypothèses → preuves → reproduction →
mitigation → correction → validation → livraison → surveillance → communication →
documentation → prévention. Jamais « redémarre au hasard » ni « rollback systématiquement ».

## 9. Anti-slop (qualité académique)
Interdits : texte de remplissage, plan répété sans adaptation, jargon artificiel, analogies
trompeuses, définitions circulaires, paragraphes gonflés, exemples pseudo-réalistes vides,
listes de concepts sans explication, « il suffit de » sur un sujet complexe, exercice qui
donne la solution, trivia d'entretien, faux environnement de production, prétendre exécuter
AWS/Azure/K8s/SQL/LLM si ce n'est pas réel.

## 10. Rôle de CP11 (quality gate pédagogique)
Ré-auditer : (A) toutes les leçons V30 ; (B) échantillon V29 ; (C) échantillon V26–V28 ;
(D) anciennes non modifiées (prochaines dettes) ; (E) leçons AI/ML de CP8. Walkthroughs
néophyte (« je ne connais que les prérequis annoncés »). Corriger les défauts V30 bloquants.
Produire `docs/PEDAGOGICAL-AUDIT-V30.md`, sans masquer la dette derrière une moyenne.

## 11. Honnêteté réel/simulé (non négociable)
Pratique SQL et AI/ML SIMULÉE en JS (raisonnement déterministe), étiquetée. Aucun vrai
SGBD/modèle/LLM. Aucun faux secret, aucune fuite de solution/test privé.
