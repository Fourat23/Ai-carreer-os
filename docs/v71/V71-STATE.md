# V71 — ÉTAT D'AVANCEMENT

> Fichier de reprise. Mis à jour après **chaque** CP. En cas d'interruption,
> relire ce fichier, vérifier Git, et reprendre au CP indiqué. NE PAS refaire CP0.

## Position

- **dernier CP terminé** : CP0
- **CP actuel** : CP1
- **prochaine action EXACTE** : rédiger `docs/v71/V71-ACADEMIC-CONTRACT-FROZEN.md`
  (ancres objectives 0→5 pour D1→D14, seuils numériques des agrégats, conditions
  READY), le committer, puis enchaîner CP2 sans demander de validation.

## Invariants contrôlés à l'entrée (CP0)

| invariant | attendu | mesuré | état |
|---|---|---|---|
| leçons | 128 | 128 | OK |
| journées | 365 | 365 | OK |
| solutions | 365 | 365 | OK |
| semaines / mois | 52 / 12 | 52 / 12 | OK |
| `data/progress.json` | inchangé | dernier commit `1dad5d4`, antérieur à V64 | OK |
| mapping 365 jours (`scripts/data`) | inchangé depuis V68 | dernier commit `305ba40` (V68) | OK |
| working tree | propre | 0 fichier modifié | OK |
| stash | vide | 0 | OK |
| local == origin | oui | `c825950` des deux côtés | OK |

## Empreintes (snapshot CP0)

- HEAD au démarrage V71 : `c8259501dcbf92c9601b9605bb49d5b5762f2bf4`
- corpus des 128 leçons : `edbfecdff1d3e4c320cedd51ede95601fd94750d`
- `data/progress.json` : `598f27c2ade43f4a7d2778536ce7cf5236ae81dd`
- `data/program.json` : `5ac3da304994c298ab964a4b03e13da336bb8935`
- snapshot par leçon : `docs/v71/SNAPSHOT-CP0.json`
- échantillon aveugle : `docs/v71/ECHANTILLON-AVEUGLE.json` — **graine 20260831**

## Validation à l'entrée

`gates:active` 0 · `npm test` 1420/1420 · `tsc --noEmit` 0 · `npm run build` 0

## Avancement de la notation

- leçons lues intégralement au CP0 : **3** (`k8s-workloads`, `javascript-basics`,
  `docker-production-hardening`) + sections ciblées de 5 autres
- leçons notées D1→D14 : **0 / 128**
- P0 ouverts : non recensé (CP3)
- P1 ouverts : non recensé (CP3)

## Lots

| CP | objet | état |
|---|---|---|
| CP0 | audit forensique + snapshot + rapport | **terminé** |
| CP1 | contrat académique gelé, ancres D1→D14, seuils READY | en cours |
| CP2 | standard humain + archétypes + règles anti-template | à faire |
| CP3 | lecture et notation des 128 + ledger initial | à faire |
| CP4 | P0+P1 fondations / systèmes / cloud / Kubernetes | à faire |
| CP5 | P0+P1 frontend / CSS / React / Next.js | à faire |
| CP6 | P0+P1 web / backend / API / SQL / data | à faire |
| CP7 | P0+P1 ML / IA appliquée / LLM / RAG / agents | à faire |
| CP8 | P0+P1 architecture / perf / sécurité / observabilité / incidents | à faire |
| CP9 | P0+P1 carrière / Git / pratiques pro / documentation | à faire |
| CP10 | passe transversale PRATIQUE (128) | à faire |
| CP11 | passe corrections + vulgarisation + jargon + prérequis | à faire |
| CP12 | validation factuelle et assertions exécutables | à faire |
| CP13 | audit aveugle (32 leçons, graine 20260831) | à faire |
| CP14 | tests négatifs + gauntlet + budget temps | à faire |
| CP15 | notation finale 128×14 + rapport + recommandation V72 | à faire |

## Commits V71

- CP0 : (ce commit)
