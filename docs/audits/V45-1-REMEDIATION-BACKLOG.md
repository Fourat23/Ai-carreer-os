# V45.1 — REMEDIATION BACKLOG (dérivé des preuves)

Audit **lecture seule**. Backlog V46 DÉRIVÉ des résultats V45.1. Ordre : CORRIGER > AJOUTER > DÉPLACER >
SUPPRIMER. Rien ici n'est implémenté en V45.1.

## Priorité 0 — Aucune correction de PROSE requise
Les 128 leçons sont CERTIFIED (115) / USABLE (13). **Aucune leçon REWORK/BLOCKED/MISSING.** V46 ne doit
PAS réécrire de prose certifiée (interdit : diff pour le diff).

## Priorité 1 — AJOUTER la pratique de code manquante (dette n°1, barre B)
La rupture systématique des chaînes est APPLICATION (pratique de code) hors JS/TS. Par ordre de
faisabilité locale (ce qui S'EXÉCUTE sans LLM/infra) :
1. **evalia** : métriques (précision/rappel/F1, matrice de confusion) — exécutable pur. → OPERATIONAL.
2. **ml** : split train/test, détection de fuite, encodage catégoriel — exécutable pur (Python).
3. **rag** : cosinus top-k, RRF, chunking à recouvrement (exos existants à re-tagguer `rag` après
   extension taxonomie). → OPERATIONAL.
4. **data/pandas** : agrégations, jointures, nettoyage — exécutable (Python).
5. **sql** : étoffer (5 exos → davantage), notamment fenêtres/index.
Prérequis technique : **extension de la taxonomie** (`isKnownSkill` rejette ml/rag/evalia/…), déjà
identifiée en V44/V45 — c'est le CP1 de V46.

## Priorité 2 — CORRIGER les défauts secondaires (USABLE → CERTIFIED+praticable)
- 13 leçons USABLE : ajouter une pratique exécutable là où c'est pertinent — recursion, design-patterns,
  git-advanced, pandas, observability-logging, deployment-secrets. (Next.js/system-design-interview :
  pratique difficile localement — accepter inline/simulé, documenter.)
- **24 exercices de code sans test privé** (V45) : ajouter ≥ 1 test privé chacun.
- **Diagnostic Python manquant** : ajouter misconception(s)/assessment Python.

## Priorité 3 — Cohérence 365 jours (AJOUTER, ne pas restructurer)
- **Réactivation espacée** : intercaler des jours de réactivation JS/React/backend sur M6-M12 pour
  contrer l'oubli (ajout additif, pas déplacement). MIGRATION IMPACT à produire.
- **Projets-jour IA** : ancrer des projets dans les jours M6-M12 quand la pratique IA existera.

## Priorité 4 — Reconnaître les limites (documenter, ne pas simuler faussement)
- Cloud/K8s/Docker/infra réseau : pas d'exécution locale réaliste → renforcer labs + capstones NOTÉS
  plutôt que du faux code. Le dire clairement à l'apprenant.
- Génération LLM réelle : hors périmètre local → rester sur raisonnement + validation de sorties.

## NON au backlog (à ne pas faire)
- Réécrire les leçons CERTIFIED. · Restructurer l'ordre du programme (aucune RESTRUCTURE justifiée). ·
  Créer un second moteur/taxonomie concurrente. · Simuler une exécution LLM/infra en la présentant comme
  réelle. · Gonfler le nombre d'exercices sans qualité de pratique.

## Séquencement proposé V46→V50
V46 Practice Remediation I (taxonomie + pratique ml/rag/evalia/data + 24 tests privés + diagnostic
Python). V47 Practice cloud/sécurité/archi (ou reconnaissance honnête des limites + labs notés).
V48 Profondeur cognitive (D3-D5 hors JS/TS) + réactivation espacée. V49 Stabilité (freeze appliqué,
idempotence generate). V50 UX/A11y de rendu (Playwright+axe) avant tout IDE intégré.
