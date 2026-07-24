# Plugin & Skills Integration Audit — AI Career OS (2026-07-24)

> **Phase d'audit d'intégration uniquement.** Aucun plugin installé, aucun Skill créé/modifié, aucun
> fichier `app/`, `lib/`, `curriculum/`, `scripts/`, `data/` ni générateur touché. AI Career OS reste un
> outil **personnel, local (localhost)**. Rapport produit **sans** rien installer ; décision d'installation
> laissée à l'utilisateur.

---

## 1. État Git initial

- Branche : `claude/ai-career-os-saas-phfg49` · **HEAD `d9f8dc8`** (conforme) · working tree **propre** ·
  `local == origin` (0/0) · baseline `local-v1-content-stable` → `0362993` intacte.
- Commit `d9f8dc8` = exactement les 7 fichiers `.claude/skills/**` (les 4 Skills projet). Aucun autre
  fichier.
- **Gates ré-exécutées** : `curriculum-guard local-v1-content-stable` → ✅ (0 changement pédagogique) ;
  `local-verify` → ✅ (365/365, 60 leçons, 43/43 tests, build OK, 0 lien cassé, 0 glyphe, tree propre).

## 2. Inventaire des 4 Skills projet (existants, à conserver)

| Skill | Fonction | Frontières | Dépendances | Chevauchements |
|---|---|---|---|---|
| **local-verify** | Lance+synthétise le pipeline réel (git, generate idempotent, checks, tests, build/lint/typecheck, liens, glyphes, dérive program.json). Ne répare jamais. | Lecture seule nette ; ne committe pas. | `bash`, `node`, scripts npm du dépôt. | Aucun avec les 3 autres (c'est la validation finale). |
| **curriculum-guard** | Détecte toute dérive pédagogique vs une base ; classe source/généré/rédigé-main ; alerte sur généré édité à la main. | `scripts/data/`, `curriculum/`, `data/program.json`. Lecture seule. | `git`. | Aucun (protection, pas d'exécution UI). |
| **ux-audit** | Audit UI **lecture seule** (hiérarchie, densité, responsive 375/768/1024/1440, a11y, états vide/chargement/erreur, « AI slop »). Classe bloquant/majeur/mineur. | `app/`, `lib/`, rendu. **Aucune écriture.** | `curl` ; `playwright-core` en `--no-save` (dégradation gracieuse) + Chromium présent. | Frontière avec ui-implement (constat vs exécution). |
| **ui-implement** | Implémente **une** amélioration UI **validée**, écran par écran ; appelle guard+verify avant commit ; refuse refonte globale. | Écrit **uniquement** `app/`, `lib/`. | Les deux gates ci-dessus. | Consomme ux-audit ; gardé par curriculum-guard + local-verify. |

**Constat clé** : ces 4 Skills couvrent **validation, protection, audit et exécution disciplinée**. Ils
**ne fournissent pas** : (a) une *direction esthétique* frontend, (b) une *intelligence TypeScript*
temps réel (diagnostics/navigation), (c) un *pilotage de navigateur interactif* (captures, E2E). C'est
exactement là que des plugins existants peuvent compléter — sans réinventer les 4 Skills.

## 3. Capacités réellement observées dans l'environnement

- **Claude Code `2.1.218`** ; `/plugin` (gestionnaire complet : `install/marketplace/details/…`) disponible.
- **0 plugin installé**, **0 marketplace configurée** (`claude plugin list` / `marketplace list` vides).
- **Marketplace officielle** : `claude-plugins-official` (ajout : `claude plugin marketplace add anthropics/claude-plugins-official` ; auto-enregistrée au 1er lancement interactif, **pas** en session cloud). Communauté : `anthropics/claude-plugins-community`.
- **Catalogue claude.ai** (marketplace org « knowledge-work-plugins », via recherche) : `figma`, `design`,
  `browser-use`, `vibe-prospecting`. `ListPlugins` = **aucun activé**.
- **Binaire LSP** : `typescript-language-server` **ABSENT** (`tsc` présent via devDep, `tsserver` à
  `/opt/node22/bin`). **Chromium** présent (`/opt/pw-browsers/...`).
- **Skills intégrés de l'environnement** (sans install) : `run` (`/run`), `review` (PR GitHub),
  `security-review`, `simplify`, `skill-creator`, `init`, `update-config`, `dataviz`, `loop`,
  `claude-api`, + commande `/code-review` (revue du diff de travail).

### Solutions demandées — analyse détaillée

Légende « installe » : Skill · Agent · Hook · MCP · LSP · Command.

| # | Solution | Origine / confiance | Installe | Fonction exacte | Utilité AI Career OS local | Dépendances / permissions / réseau | Coût (contexte/complexité/maintenance) | Chevauchement 4 Skills | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **frontend-design** | Anthropic officiel (`claude-plugins-official`) | Skill | Produire un frontend **production-grade, distinctif, non générique** (évite l'« AI slop ») : principes de design, hiérarchie, typographie, couleur, sobriété. | **Direction visuelle** — comble le vrai manque. Cœur du chantier UI/UX. | Aucune ; pas de réseau (prompt-skill). | Faible (skill model-invoked, chargé à la demande). | **Complète** ui-implement (direction ≠ exécution). Aucun conflit. | **INSTALLER MAINTENANT** |
| 2 | **design** (Cowork) | Anthropic (knowledge-work-plugins) | Skill/Commands (`/design:critique`, `:handoff`, `:accessibility`, `:ux-copy`, `:research-synthesis`) | Critique de design, handoff Figma, audit WCAG, UX copy, synthèse recherche. | Audit UX + a11y + copy. | Handoff = Figma. | Moyen (bundle de commandes). | **Redondant** avec frontend-design (direction) et **ux-audit** (a11y/critique). | **REDONDANT** (plus tard, ciblé) |
| 3 | **playwright** | Anthropic catalog **enveloppant** MCP Microsoft (officiel éditeur) | MCP | Pilotage navigateur : navigation, clic, formulaires, **captures**, réseau, assertions E2E. | **Tests navigateur / visuels** interactifs. | Node + Chromium (présents) ; pilote un navigateur **local** (pas d'egress vers un tiers). | Moyen-élevé (nombreux outils MCP → contexte ; atténué par tool-search). Maintenance faible. | **Chevauche `ux-audit`** (qui mesure déjà débordement/superposition via playwright-core). Ajoute captures/interaction. | **INSTALLER PLUS TARD** (sur besoin de captures/E2E) |
| 4 | **typescript-lsp** | Anthropic officiel | LSP | Diagnostics temps réel après édition + navigation (définitions/références/types) sur code TS/React. | **Navigation TypeScript** fiable pendant l'édition `app/`,`lib/`. | **Binaire `typescript-language-server` requis (ABSENT)** → `npm i -g typescript-language-server`. Local, pas de réseau. | Faible-moyen (mémoire du serveur ; diagnostics ajoutés au contexte). | **Aucun** (les 4 Skills ne font pas d'intelligence TS). Complète ui-implement/local-verify (feedback plus tôt qu'au build). | **INSTALLER MAINTENANT** (avec le binaire) |
| 5 | **code-review** | Anthropic (built-in `/code-review` ; `pr-review-toolkit` = agents) | Command (built-in) / Agents (pr-review-toolkit) | Revue du **diff de travail** (built-in) ; pr-review-toolkit = agents de revue de **PR**. | Revue de code du diff UI. | Aucune (built-in). | Nul (built-in) ; pr-review-toolkit = agents (contexte). | Complète local-verify (qualité vs intégrité). pr-review-toolkit **inutile** (pas de PR). | **INUTILE d'installer** (utiliser `/code-review` built-in) |
| 6 | **security-guidance** | Anthropic officiel | Hook + Agent/Skill | Revoit **chaque** changement pour vulnérabilités et demande la correction en session. | Sécurité — surface **faible** (local, sans auth/DB/egress). | Hook s'exécute à chaque changement. | Moyen (bruit possible pendant ui-implement). | Recouvre le skill built-in **`security-review`** (à la demande). | **INSTALLER PLUS TARD** (ou `security-review` à la demande) |
| 7 | **skill-creator** | Anthropic (built-in) | Skill | Créer/éditer/évaluer des Skills. | Nul pour ce chantier (création de Skill **interdite** cette phase). | Aucune. | Faible. | Hors périmètre. | **INUTILE (cette phase)** |
| 8 | **superpowers** | **Tiers** (communauté, ex. `obra/superpowers`) — non présent dans les catalogues configurés | Skills/Commands (large bundle) | Collection générique très large de « super-pouvoirs ». | Diffuse, non ciblée. | Marketplace tiers à ajouter ; exécution de code tiers. | **Élevé** (contexte, déclenchements abusifs, maintenance). | Risque de **conflit/redondance** générique. | **À ÉVITER** (tiers, lourd, générique — contraire à « pas de plugin générique ») |
| 9 | **figma** | Anthropic officiel (2 catalogues) | MCP | Accès aux fichiers Figma / handoff design. | Intégration Figma — **aucune source Figma** pour AI Career OS. | Compte Figma + **egress réseau** (auth). | Moyen (MCP + connexion externe). | Aucun. | **INUTILE** (pas de design Figma ; à revoir si adoption) |
| 10 | **playground** | **Inconnu / incertain** (probablement skill de « playgrounds HTML interactifs » lié au design, ou via Artifacts) | Skill (probable) | Générer des playgrounds HTML interactifs (design/critique). | Prototypage — **déjà couvert par Artifacts** + frontend-design. | Indéterminées. | Faible-moyen. | Chevauche Artifacts/frontend-design. | **INUTILE / PLUS TARD** (provenance à confirmer) |
| — | **browser-use** (trouvé) | Cowork (Anthropic) | MCP/Agent | Automatisation navigateur. | Redondant avec playwright. | Navigateur local. | Moyen. | Chevauche ux-audit/playwright. | **REDONDANT** |
| — | **chrome-devtools(-mcp)** | **Tiers** Google (ChromeDevTools), listé au catalogue | MCP (29 outils) | Perf, réseau, **Lighthouse**, profilage CDP. | Perf/debug — **priorité basse** (app locale d'apprentissage). | Chrome + CDP local. | **Élevé** (29 outils → contexte). | Navigation chevauche playwright. | **INSTALLER PLUS TARD** (audit perf si besoin) |

## 4. Tableau comparatif — synthèse des verdicts

| Solution | Type | Trust | Verdict |
|---|---|---|---|
| frontend-design | Skill | Anthropic | **INSTALLER MAINTENANT** |
| typescript-lsp | LSP | Anthropic | **INSTALLER MAINTENANT** (binaire requis) |
| playwright | MCP | Officiel/Microsoft | **INSTALLER PLUS TARD** |
| chrome-devtools | MCP | Tiers/Google | **INSTALLER PLUS TARD** |
| security-guidance | Hook+Agent | Anthropic | **INSTALLER PLUS TARD** (ou `security-review`) |
| design (Cowork) | Skill | Anthropic | **REDONDANT** |
| browser-use | MCP | Anthropic | **REDONDANT** |
| playground | Skill? | Inconnu | **INUTILE / PLUS TARD** |
| figma | MCP | Anthropic | **INUTILE** (pas de source Figma) |
| pr-review-toolkit / code-review | Agents / Command | Anthropic | **INUTILE** (utiliser `/code-review` built-in) |
| skill-creator | Skill | Anthropic | **INUTILE (cette phase)** |
| superpowers | Skills | **Tiers** | **À ÉVITER** |

## 5. Risques et permissions

- **Exécution de code arbitraire** : plugins et marketplaces s'exécutent avec vos privilèges. N'ajouter
  que des sources **de confiance** → ici, **`claude-plugins-official` (Anthropic) uniquement**. **Éviter**
  superpowers et toute marketplace tierce non nécessaire.
- **Egress réseau** : `figma` (connexion Figma). `playwright`/`chrome-devtools` pilotent un navigateur
  **local** (pas d'egress vers un tiers, sauf si on navigue vers Internet). frontend-design et
  typescript-lsp = **aucun réseau**.
- **Coût de contexte** : les MCP ajoutent des outils au contexte à chaque tour (atténué par
  *tool-search*). Les Skills (frontend-design) sont chargés à la demande (coût faible). Le LSP ajoute des
  diagnostics au contexte + mémoire.
- **Hooks bruyants** : `security-guidance` s'exécute à **chaque** changement → risque de bruit pendant
  `ui-implement`. Préférer `security-review` à la demande, ou scoper le hook.
- **Binaire système** : `typescript-lsp` exige `typescript-language-server` (install globale) — hors
  dépôt, pas un fichier versionné.
- **Session cloud** : `/plugin` interactif peut être indisponible ; l'activation passe alors par
  `.claude/settings.json` (`enabledPlugins`) — **fichier de configuration Claude, pas de contenu
  applicatif/pédagogique**.

## 6. Lot minimal recommandé

**Comparaison des stratégies** :

| | Contenu | Couvre direction visuelle | Navigateur réel / responsive | Navigation TS | Verdict |
|---|---|---|---|---|---|
| **A** | frontend-design seul | ✅ | ⚠️ (via ux-audit existant) | ❌ | Insuffisant (pas d'intelligence TS pour éditer sûrement) |
| **B** | frontend-design + navigateur (playwright) | ✅ | ✅ (interactif) | ❌ | Bien, mais MCP navigateur redonde partiellement ux-audit et coûte du contexte |
| **C** | frontend-design + navigateur + typescript-lsp | ✅ | ✅ | ✅ | **Meilleur équilibre pour le chantier UI/UX** |
| **D** | Lot large (+chrome-devtools/security-guidance/design/figma) | ✅ | ✅✅ | ✅ | Surdimensionné ; à réserver à un besoin perf/sécurité/Figma **démontré** |

**➡️ Recommandation : Stratégie C, en version *lean*.**

- **Installer maintenant** (2 seulement) :
  1. **frontend-design** — la direction esthétique (le vrai manque des 4 Skills).
  2. **typescript-lsp** (+ binaire) — diagnostics/navigation TS/React fiables pendant l'édition.
- **Couche navigateur** : **déjà assurée par `ux-audit`** (playwright-core `--no-save` + Chromium) pour
  la mesure responsive et les captures ponctuelles → **ne pas installer Playwright MCP tout de suite**.
  L'ajouter **plus tard** *seulement si* le chantier exige de l'interaction/E2E ou des captures
  systématiques (`playwright@claude-plugins-official`).
- **Tout le reste** : plus tard / inutile / à éviter (cf. §4). Aucun SaaS, aucune infra de production,
  aucune connexion externe injustifiée.

Ce lot satisfait : direction non générique ✅ · observation navigateur ✅ (ux-audit) · tests responsive/
visuels ✅ (ux-audit) · navigation TS fiable ✅ · **curriculum protégé** (curriculum-guard) ✅ · **strictement
local** ✅ · aucun egress injustifié ✅.

## 7. Ordre d'utilisation proposé (intégration avec les 4 Skills)

Pipeline pour **chaque** amélioration d'écran :

1. **curriculum-guard** (base = `local-v1-content-stable`) → pédagogie intacte **avant** de toucher l'UI.
2. **local-verify** → baseline verte.
3. **ux-audit** (lecture seule) → mesurer l'état de l'écran (hiérarchie, responsive, états) → constats
   priorisés **à valider**.
4. **frontend-design** → fournit la **direction** (principes, hiérarchie, sobriété) pour répondre aux
   constats validés. *Ne génère pas de refonte ; oriente.*
5. **ui-implement** → exécute **le** changement validé, écran/périmètre unique ; **typescript-lsp**
   fournit les diagnostics en direct ; réutilise les composants existants.
6. **curriculum-guard** (après) → pédagogie **toujours** intacte (exit 0 obligatoire).
7. **local-verify** (après) → pipeline vert.
8. **`/code-review`** (diff) + au besoin **`security-review`** / **`simplify`** → qualité/sécurité.
9. Commit via le flux de `ui-implement` (message ciblé), sur validation.

**Duplications / ordres dangereux à éviter** :
- **frontend-design ≠ ui-implement** : direction d'abord, exécution ensuite ; ne pas laisser
  frontend-design produire du code massif (risque de refonte).
- **playwright MCP vs ux-audit** : ne pas exécuter les deux en doublon ; `ux-audit` reste la mesure
  **canonique** du projet ; Playwright MCP = extras interactifs seulement.
- **design (Cowork) vs ux-audit** : l'axe a11y/critique est déjà dans `ux-audit` → ne pas double-auditer.
- **security-guidance (hook à chaque édition)** : s'il est installé, il peut interrompre `ui-implement` →
  préférer `security-review` à la demande.
- **Jamais** faire écrire un plugin dans `curriculum/`, `scripts/`, `data/` : `curriculum-guard` bloque,
  mais l'ordre correct l'évite en amont.

## 8. Commandes exactes d'installation **envisagées** (non exécutées)

```bash
# 0) (si nécessaire en session cloud) enregistrer la marketplace officielle Anthropic :
claude plugin marketplace add anthropics/claude-plugins-official

# 1) Direction esthétique (Skill) :
claude plugin install frontend-design@claude-plugins-official

# 2) Intelligence TypeScript (LSP) + binaire requis :
claude plugin install typescript-lsp@claude-plugins-official
npm install -g typescript-language-server        # binaire système requis (absent actuellement)

# 3) PLUS TARD, seulement si captures/E2E nécessaires (couche navigateur au-delà d'ux-audit) :
# claude plugin install playwright@claude-plugins-official

# Vérifier le coût de contexte AVANT d'activer :
claude plugin details frontend-design@claude-plugins-official
claude plugin details typescript-lsp@claude-plugins-official

# Session cloud sans /plugin interactif : déclarer dans .claude/settings.json → "enabledPlugins".
```

## 9. Fichiers qui seraient modifiés par l'installation

- **`.claude/settings.json`** (créé/mis à jour) : `extraKnownMarketplaces` et/ou `enabledPlugins`
  (portée projet) — **fichier de configuration Claude, pas de contenu app/pédagogique**.
- **`~/.claude/…`** (hors dépôt) : cache des plugins si portée utilisateur.
- **Binaire global** `typescript-language-server` (hors dépôt, non versionné).
- **Aucune** modification de `app/`, `lib/`, `curriculum/`, `scripts/`, `data/program.json`, ni du
  générateur. `package.json`/`package-lock.json` **inchangés** (LSP = binaire global, pas une dépendance
  du projet ; frontend-design/playwright = plugins Claude, hors `node_modules` du projet).

## 10. Plan du futur écran pilote UI/UX (sans design ni code)

- **Écran pilote proposé : la Vue Jour** (`app/day/[id]/` — `page.tsx` + `DayPanel.tsx`). Justification :
  écran le plus fréquenté et le plus dense (objectif, cours, exemple guidé, pratique, correction masquée,
  panneau de suivi) ; c'est là qu'une meilleure hiérarchie/lisibilité a le plus d'impact pédagogique, et
  son responsive a déjà été fiabilisé (baseline).
- **Déroulé prévu** (à exécuter dans une session ultérieure, après validation du lot) :
  1. `curriculum-guard` + `local-verify` → baseline.
  2. `ux-audit` de la Vue Jour → constats priorisés (hiérarchie, densité, états, mobile).
  3. **Validation humaine** des constats à corriger (1–2 max pour le pilote).
  4. `frontend-design` → direction pour ces constats précis.
  5. `ui-implement` → **un** changement scopé (ex. hiérarchie du panneau de suivi *ou* lisibilité des
     blocs), composants réutilisés, `typescript-lsp` en appui.
  6. `curriculum-guard` + `local-verify` + `/code-review` → non-régression pédagogique + qualité.
  7. Commit ciblé sur validation.
- **Non produit ici** : aucun mockup, aucune maquette, aucun CSS/JSX, aucun audit visuel de la Vue Jour
  (explicitement hors périmètre de cette phase).

---

### Sources (documentation officielle)
- Créer des plugins — https://code.claude.com/docs/en/plugins
- Découvrir/installer des plugins (marketplace officielle, table LSP, security-guidance, intégrations) —
  https://code.claude.com/docs/en/discover-plugins
- Catalogue officiel — https://claude.com/plugins (frontend-design, playwright, chrome-devtools-mcp)
- Playwright MCP (Microsoft) ; Chrome DevTools MCP (ChromeDevTools/Google) — pages catalogue ci-dessus.

**Statut : diagnostic terminé. Aucun plugin installé, aucun Skill créé/modifié. En attente de votre
décision sur le lot à installer (recommandation : Stratégie C *lean* — frontend-design + typescript-lsp,
navigateur via ux-audit).**
