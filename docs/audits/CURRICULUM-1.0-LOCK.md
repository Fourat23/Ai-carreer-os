# CURRICULUM 1.0 — LOCKED (V51)

Les audits temporels V51 étant satisfaisants (rétention certifiée, progression
cohérente, charge maîtrisée, 11/12 mois GREEN + 1 AMBER justifié), le curriculum
d'AI Career OS est **VERROUILLÉ en version 1.0**. Ce document remplace et durcit
`CURRICULUM-1.0-FREEZE.md` (V50).

## IMMUABLE par défaut
- **Ordre des 365 jours** (`data/program.json`) — vérifié inchangé par `v51:check`.
- **Chaîne principale des prérequis** entre compétences.
- **Identité des 128 leçons** (corpus gelé, SHA-1 `4c1f3028…`).
- **Architecture globale des parcours**.

## AUTORISÉ sans version majeure
- Corrections factuelles ; amélioration d'un exemple sans changer le concept.
- Ajout de pratique, de diagnostic, de transfert, de misconception, de mission.
- Rattachement/réactivation d'exercices existants (mapping `day-exercises.json`).
- Corrections d'accessibilité, de bugs, enrichissement lexical, améliorations UI.

## RESTRUCTURATION
Uniquement si une **régression pédagogique démontrable** est accompagnée d'une
**preuve** et d'un **ADR explicite**. Une « meilleure idée » n'est plus une
justification suffisante.

## Garanties mesurées (V51)
- 365 jours, ordre inchangé ; corpus SHA-1 identique ; `progress.json` intact.
- 376/376 exercices atteignables, 0 orphelin.
- 0 écart de pratique > 90 j pour les compétences de code (rétention certifiée).
- 0 D5 isolé ; charge sans surcharge nouvelle.
- `curriculum:check` 365/365 ; `v50:check` et `v51:check` verts.

## Réponse à la question de stabilité
> « Puis-je commencer Jour 1 aujourd'hui sans craindre une future
> restructuration ? »

**OUI, avec certification temporelle.** Le contenu est gelé, l'ordre verrouillé,
la rétention et la progression sont mesurées et saines. Les sprints suivants
(à commencer par l'UI/UX en V52) se construisent AU-DESSUS de ce Curriculum 1.0
stable et ne doivent PAS provoquer de restructuration pédagogique.
