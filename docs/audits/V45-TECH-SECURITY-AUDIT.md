# V45 — TECH / SÉCURITÉ AUDIT

Audit **lecture seule**. Contexte : application LOCALE, mono-utilisateur, sans réseau applicatif.

## CP12 — Technique / qualité / performance

### Santé mesurée (TESTÉ)
| Contrôle | Résultat |
|---|---|
| `npm test` | 1202/1202 ✅ |
| `tsc --noEmit` | exit 0 ✅ |
| `npm run build` | Compiled successfully ✅ |
| `gates:active` | 24 gates verts ✅ |
| First Load JS (build) | ~103-109 kB par route (échantillon) — **raisonnable** |
| Curriculum Graph | 0 blocking |

### Architecture / qualité (INSPECTÉ)
- **Modularité** : 70 modules `lib/`, séparation pure/impure nette (ex. `workspace` pur vs
  `workspace-fs` impur ; read-models purs `practice-coverage`/`practice-ladder`/`learning-experience`).
  **BON.**
- **Sources de vérité** : uniques par artefact ; read-models dérivés sans état concurrent. **BON.**
- **Types** : `.d.ts` pour les modules `lib` clés ; tsc strict vert. **BON.**
- **Tests** : 137 fichiers, 1202 assertions ; exécution réelle des exercices via harnais. **FORT.**
- **Duplication / familles labs** : 8 familles de moteurs SIMULÉS (manifest*, security*, topology*,
  pipeline*, terminal*, cloud-*) — cohérentes mais volumineuses ; recouvrement fonctionnel modéré
  (chacune son domaine). **CORRECT.**
- **Idempotence de génération** : `generate` réécrit `generatedAt` à chaque run (diff cosmétique).
  **FRAGILE (mineur)** — à figer (timestamp déterministe ou exclu du diff).
- **I/O fichier** : lecture synchrone des `.md`/`.json` côté serveur (rendu par requête). Acceptable en
  local ; à surveiller si volume/latence augmentent. **CORRECT.**
- **Dette technique** : faible ; pas de dead code massif détecté à l'inspection ; pas de cycle bloquant.

### Verdict technique : **BON→FORT** pour un projet local mono-utilisateur.

## CP13 — Sécurité

Classement : CRITICAL / HIGH / MEDIUM / LOW / INFORMATIONAL. **Aucune correction (audit-only).**

| # | Sujet | Constat | Sévérité |
|---|---|---|---|
| S1 | **Exécution de code utilisateur (exercise runtime)** | `execFile` **sans shell**, binaire = ce Node, `cwd` isolé (workspace mkdtemp gitignoré), `timeout` + `SIGKILL`, `maxBuffer` plafonné, **env minimal sans secret** (`PATH` réduit, `NODE_ENV=production`). Sandbox correcte pour usage local. | **LOW** (local) — à réévaluer HIGH si multi-utilisateur/IDE hébergé |
| S2 | **`dangerouslySetInnerHTML` (12 sites)** | Alimenté par du Markdown CURRICULUM (fichiers repo de confiance) via `marked` ; `marked` v15 **ne sanitize pas** par défaut. Le contenu UTILISATEUR (notes, réponses) est rendu comme TEXTE échappé (aucun `dangerouslySetInnerHTML`), donc pas de vecteur XSS utilisateur. | **LOW** — INFORMATIONAL tant que la source Markdown reste de confiance ; **MEDIUM** à revisiter si contenu non fiable ou multi-utilisateur |
| S3 | **Path traversal (workspace)** | `resolveWithinRoot` + `isSafeRelPath` (rejette `..`, absolu, backslash) ; allowlist de fichiers éditables ; tests dédiés. | **LOW** |
| S4 | **Manifest/topology parsing** | `sanitize()` retire les clés dangereuses (prototype pollution) sur les entrées de labs. | **LOW** |
| S5 | **Épuisement de ressources** | timeout + maxBuffer + taille de workspace bornée (`MAX_TOTAL_BYTES`). | **LOW** |
| S6 | **Secrets / env** | env d'exécution minimal ; pas de secret exposé au code utilisateur ; app locale sans variables sensibles détectées. | **INFORMATIONAL** |
| S7 | **Exposition réseau** | aucune surface réseau applicative (pas de serveur d'API exposé au-delà de Next local). | **INFORMATIONAL** |
| S8 | **Dépendances / supply chain** | deps applicatives peu nombreuses (next, react, codemirror, marked, lucide, typescript) ; pas d'audit `npm audit` exécuté ici (éviterait de modifier l'état). | **INFORMATIONAL** — planifier `npm audit` en V46 |
| S9 | **`eval`** | **aucun** `eval(` dans `lib/`/`app/`. | — |
| S10 | **npm scripts** | scripts de gates/generate en Node local, pas de commande réseau cachée. | **INFORMATIONAL** |

### Verdict sécurité : **CORRECT pour un usage LOCAL mono-utilisateur.**
Aucune vulnérabilité CRITICAL/HIGH dans le contexte actuel. Les deux points à porter AVANT tout usage
partagé / IDE intégré : (S2) sanitiser le rendu Markdown si la source cesse d'être de confiance, et
(S1) durcir/reconfiner la sandbox si du code non fiable multi-utilisateur est exécuté. Ce sont des
**pré-requis de changement de contexte**, pas des failles du produit local actuel.

## Limites de l'audit tech/sécurité
- Pas de `npm audit`, pas de scan SAST tiers, pas de test de charge — non exécutés pour ne pas modifier
  l'état du dépôt / l'environnement.
- Performance jugée sur la sortie de build (First Load JS) et l'inspection, pas sur un profilage runtime.
