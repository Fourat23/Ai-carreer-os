# V45.2 — Dette académique (backlog priorisé)

> Toute anomalie relevée pendant l'audit intégral devient une **entrée de
> backlog**, JAMAIS une correction (sprint audit-only). Priorités :
> - **P0** : bloquant pour la certification (fausseté, trou infranchissable).
> - **P1** : impact fort sur l'apprentissage/le transfert.
> - **P2** : amélioration nette, non bloquante.
> - **P3** : finition / cosmétique.
>
> Dettes séparées par nature (rubrique V45.2) :
> **A** contenu · **B** pédagogie · **C** curriculum · **D** pratique ·
> **E** transfert · **F** rétention · **G** outillage. V45.2 note A+B+C ;
> D/E/F/G sont recensés mais hors note académique.

## P0 — Bloquant

**Aucun.** Aucune leçon fausse, aucun trou infranchissable, aucun verdict
sous A. La certification 128/128 A n'est bloquée par rien.

## P1 — Impact fort

### P1.1 (D/E) — Pratique EXÉCUTABLE absente pour ML/DL/infra/systèmes
- **Constat** : Barre A (comprendre) forte partout ; Barre B (produire du code
  exécutable) réellement outillée pour ~8 compétences /20 (socle logiciel). Pour
  ML, DL, Linux, Réseau, Observabilité, Docker/K8s/Cloud, la pratique est
  conceptuelle ou simulée (exemples « illustratifs / non exécutés »).
- **Chaînes** : 08, 09, 11, 13, 14, 17 (infra).
- **Action V46** : introduire un banc de pratique exécutable (sandbox Python/
  scikit pour ML ; environnement Docker/Linux jouable ; harnais RAG replay déjà
  amorcé). **Nature D+E. Ne descend AUCUN verdict académique** (la note juge le
  contenu), mais c'est la dette n°1 pour le transfert réel.

### P1.2 (C) — Transition JS → Python → ML trop étroite
- **Constat** : une seule leçon `python-foundations` avant `statistics-for-ml` et
  `machine-learning-basics`. Palier le plus raide pour un néophyte.
- **Action V46** : ajouter une 2e leçon Python (environnements virtuels,
  packaging, numpy/idiomes data) — **ajout additif**, chaîne 12.

### P1.3 (C) — Doublons DevOps
- **Constat** : `docker-containers` (120) recouvre la série Docker profonde
  097-101 ; `ci-cd` (121) recouvre `ci-cd-pipeline-anatomy` (102) et
  `ci-cd-quality-gates-artifacts` (103). Un apprenant peut hésiter sur la source
  faisant foi.
- **Action V46** : fusionner l'apport propre des récaps (ex. l'éval smoke LLM en
  CI de la 121) dans la série profonde, puis repositionner/archiver les récaps —
  chaîne 17. **ORDER_FIX_NEEDED.**

## P2 — Amélioration nette, non bloquante

### P2.1 (C) — Triple couverture du logging structuré
- **Constat** : la notion de log/reçu structuré apparaît dans
  `observability-logging` (055), `logging-structured` (080) et
  `llm-observability` (123). Chevauchement réel (angles SW-eng / SRE / LLMOps).
- **Action V46** : consolider en une source canonique + renvois, garder les
  angles spécifiques. Chaînes 10-11.

### P2.2 (C) — Duplications fines dans le bloc IA
- **Constat** : `ai-evaluation` (072) / `rag-evaluation` (073) partagent le
  harnais rappel@5 ; `ai-security` (076) / `prompt-injection-defense` (077)
  partagent l'attaque « tout est conforme ». Frontières défendables mais floues.
- **Action V46** : clarifier explicitement la frontière (généraliste vs
  spécialisé) en tête de chaque paire. Chaînes 15-16.

### P2.3 (C) — Ordre des systèmes tardif
- **Constat** : Linux/réseau (mois 10-11) arrivent après l'observabilité/IA qui
  les mobilisent parfois. Pas de rupture (les leçons IA n'exigent pas Linux),
  mais un rappel réseau plus tôt fluidifierait.
- **Action V46** : évaluer un mini-rappel réseau/systèmes en amont. Chaînes 08-09.

### P2.4 (C) — NoSQL en modélisation sous-traité
- **Constat** : `database-modeling` reste relationnel ; le NoSQL n'apparaît que
  tard (DynamoDB/Cosmos côté cloud).
- **Action V46** : une section/leçon NoSQL au moment de la modélisation. Chaîne 06.

## P3 — Finition / cosmétique

### P3.1 (A) — Coquille dans `iac-fundamentals` (117)
- **Constat** : « réutation » pour « réutilisation » dans un titre de section.
- **Action V46** : correction typographique. **Non corrigé ici** (audit-only).

### P3.2 (B) — Densité de quelques leçons L3
- **Constat** : accessibilité débutant et profondeur à 3.80/4 de moyenne, tirées
  par des leçons denses (docker-production-hardening, k8s-security,
  resilience-patterns, cloud-azure-core, linux-ssh-remote).
- **Action V46** : envisager un fractionnement léger ou des encarts « pause » —
  toutes restent A, priorité basse.

## Tableau récapitulatif

| ID | Prio | Nature | Objet | Chaîne(s) |
|----|:---:|:---:|-------|-----------|
| P1.1 | P1 | D/E | Pratique exécutable ML/DL/infra absente | 08,09,11,13,14,17 |
| P1.2 | P1 | C | Palier JS→Python→ML étroit | 12 |
| P1.3 | P1 | C | Doublons Docker/CI-CD (120,121) | 17 |
| P2.1 | P2 | C | Log structuré éclaté (055/080/123) | 10,11 |
| P2.2 | P2 | C | Duplications fines IA (072/073, 076/077) | 15,16 |
| P2.3 | P2 | C | Ordre systèmes tardif | 08,09 |
| P2.4 | P2 | C | NoSQL modélisation sous-traité | 06 |
| P3.1 | P3 | A | Coquille « réutation » (117) | 17 |
| P3.2 | P3 | B | Densité leçons L3 | multiples |

## Conclusion

- **0 dette P0** : rien ne bloque la certification 128/128 A.
- **La dette dominante est D/E (pratique/transfert exécutable)**, hors note
  académique mais décisive pour le « savoir-faire » réel ML/DL/infra.
- **Les dettes C (curriculum)** sont des consolidations/ajouts, pas des refontes
  (cohérent avec `V45-2-CURRICULUM-STABILITY.md` : 0 RESTRUCTURE_REQUIRED).
- **Les dettes A/B** se réduisent à une coquille et à la densité de quelques L3.

Ce backlog alimente le prompt V46 (CP15).
