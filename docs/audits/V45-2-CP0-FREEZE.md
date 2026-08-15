# V45.2 — CP0 FORENSIC FREEZE (lecture seule)

## Contrat de sprint
« V45.2 ne certifie jamais une leçon parce qu'elle ressemble à une bonne leçon. Il la certifie
uniquement après lecture intégrale et preuves positives de sa capacité à enseigner correctement son
sujet. »

## État Git & système
| Élément | Valeur |
|---|---|
| Branche | `claude/ai-career-os-saas-phfg49` ✅ |
| HEAD / origin | `78c0a07` / `78c0a07` — **local == origin** ✅ |
| Working tree / stash / serveurs | propre / vide / 0 ✅ |
| `progress.json` | blob `323604021055588a9528a86875f36598dbdc7758` ✅ |
| `npm test` / tsc / gates | 1205 ✅ / exit 0 ✅ / 24 verts ✅ |
| Leçons | 128 |
| **Hash corpus (128 .md concaténés, ordre trié)** | **`4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3`** |

Ce hash de corpus est la PREUVE d'immutabilité : il doit être IDENTIQUE à la clôture. Aucune leçon ne
doit changer pendant V45.2.

## Périmètre réel (motivation V45.2)
V45.1 a produit un ledger 128/128 CERTIFIED, mais sa profondeur documentée était : **13 leçons lues
intégralement** (calibration) + **115 lues via cœur + sections + signaux structurels** (Markdown réel,
pas seulement métadonnées). Le présent sprint considère que « structural/core » ≠ « deep ». **V45.2
full-lit les 128** (les 13 servant de calibration croisée au CP12), avec preuve de lecture spécifique
par leçon (≥ 2 éléments propres au contenu) interdisant toute certification générique.

## Méthode
- Double échelle par leçon : **académique A/B/C/D/E** + **transférabilité T0-T4** (jugeant le CONTENU,
  pas la dette de pratique plateforme).
- Rubrique 18 dimensions (0-4) comme INDICE, jamais comme verdict.
- Lecture intégrale (intro→…→fin du fichier) obligatoire ; grep/AST/wordcount/score = préparation
  seulement.
- Lots de ~13 leçons en ordre curriculaire ; ledger persistant `V45-2-LESSON-LEDGER.json` (floor
  128/128 fullRead=true).
- **Audit-only** : seuls `docs/audits/**`, scripts `scripts/v45-2-*.mjs` read-only, et tests d'intégrité
  d'audit. Aucune source métier modifiée.

Aucune modification au CP0. Poursuite automatique CP1→CP15.
