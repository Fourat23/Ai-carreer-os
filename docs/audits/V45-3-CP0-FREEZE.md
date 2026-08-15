# V45.3 — CP0 : gel forensique & état réel vérifié

> Sprint **audit contradictoire** (red team). But unique : la conclusion V45.2
> « 128/128 = A » résiste-t-elle à une tentative sérieuse de falsification ?
> Aucun résultat n'est préféré. **Le dépôt réel fait foi** — les compteurs
> annoncés par V45.2 ont été re-dérivés indépendamment ci-dessous, pas crus.

## État Git réel (vérifié maintenant)

| Élément | Valeur constatée |
|---------|------------------|
| Branche | `claude/ai-career-os-saas-phfg49` |
| HEAD | `f5caff3be69563c62f88eb0cb031f5b4e8416c98` |
| origin (même branche) | `f5caff3be69563c62f88eb0cb031f5b4e8416c98` |
| local == origin | **OUI** |
| Working tree | **propre** (git status --porcelain vide) |
| Stash | **vide** |
| Serveurs/workspace résiduels | **aucun** |

## Immutabilité du corpus (référence d'entrée)

| Élément | Valeur |
|---------|--------|
| Nombre de leçons `.md` | **128** |
| **Hash corpus** (`find curriculum/lessons -name '*.md' \| sort \| xargs cat \| sha1sum`) | **`4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3`** |
| `data/progress.json` (blob) | `323604021055588a9528a86875f36598dbdc7758` |

Ce hash est la **référence d'entrée V45.3**. Il devra être **identique** à la
clôture (preuve que le red team n'a rien modifié). Il coïncide avec le hash de
gel V45.2 — le corpus n'a pas bougé depuis.

## Toolchain (baseline vert avant audit)

| Vérification | Résultat |
|--------------|----------|
| `npm test` | **1209 / 1209** pass, 0 fail |
| `npx tsc --noEmit` | exit **0** |
| `npm run gates:active` | exit **0** (V43 + V44 valides) |
| `npm run build` | exit **0** |
| `curriculum:check` / `depth-check` / `glossary:check` | verts (vérifiés en clôture V45.2) |

## Compteurs V45.2 re-dérivés INDÉPENDAMMENT du ledger (`V45-2-LESSON-LEDGER.json`)

Non pas crus sur parole — recalculés depuis le JSON :

| Métrique annoncée V45.2 | Re-dérivée V45.3 | Concorde ? |
|--------------------------|------------------|:---:|
| 128 leçons | count = 128 | ✅ |
| fullRead = 128 | fullRead:true = 128 | ✅ |
| A = 128/128 | grades = {A:128} | ✅ |
| KEEP = 121 | actions.KEEP = 121 | ✅ |
| MINOR_FIX = 7 | actions.MINOR_FIX = 7 | ✅ |
| T4=68, T3=60 | transfer = {T4:68, T3:60} | ✅ |
| slugs uniques | 128 uniques | ✅ |

Les **7 MINOR_FIX** (à re-tester en CP6) : `pandas-data-wrangling`,
`observability-logging`, `rag-evaluation`, `prompt-injection-defense`,
`iac-fundamentals`, `docker-containers`, `ci-cd`.

**Constat CP0** : les compteurs V45.2 sont arithmétiquement exacts vis-à-vis de
son propre ledger. Cela ne prouve PAS que les verdicts eux-mêmes sont justes —
c'est précisément ce que V45.3 attaque par blind review adversariale. Un ledger
peut être cohérent avec lui-même et néanmoins trop permissif.

## Périmètre de gel V45.3 (interdits)

Interdits : `curriculum/lessons/**`, programme, jours, parcours, exercices,
assessments, missions, playbooks, capstones, remediation, glossary métier, UI
learner, moteurs pédagogiques, skill-state, review, curriculum graph métier,
`progress.json`.

Autorisé : `docs/audits/**`, scripts d'audit strictement read-only, tests de
cohérence de l'audit.

Toute leçon jugée défaillante sera **consignée comme dette avec preuve textuelle
exacte**, jamais corrigée.

## Suite immédiate (sans confirmation)

CP1 rubric adversariale + protocole de falsification → CP2 échantillon
déterministe stratifié ≥ 24 leçons → CP3-CP5 full-reads en blind review.
