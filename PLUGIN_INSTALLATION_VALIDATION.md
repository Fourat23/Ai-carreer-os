# Plugin Installation & Validation — AI Career OS (2026-07-24)

> Installation contrôlée du **lot minimal « Stratégie C lean »** (frontend-design + typescript-lsp) et
> sa validation. **Aucune page, aucun composant, aucun contenu pédagogique modifié.** Aucun audit visuel,
> aucun mockup, aucune direction graphique produite (hors périmètre). Ce rapport **n'est pas encore
> commité** (en attente de validation).

---

## 1. État Git initial

- Branche `claude/ai-career-os-saas-phfg49` · **HEAD de départ `d9f8dc8`** · working tree propre ·
  `local == origin` · baseline `local-v1-content-stable` (`0362993`) intacte.
- Seul fichier non suivi au départ : `PLUGIN_SKILLS_INTEGRATION_AUDIT.md`.
- Gates avant action : `curriculum-guard` ✅ (0 dérive) · `local-verify` ✅ (365/365, 60 leçons, 43/43).

## 2. Commit du rapport d'audit (Phase 1)

- **Commit `17962e6`** — `docs: add plugin and skills integration audit` — un seul fichier
  (`PLUGIN_SKILLS_INTEGRATION_AUDIT.md`). Poussé ; working tree propre ; `local == origin`.

## 3. Marketplace utilisée

- **`claude-plugins-official`** (officielle Anthropic), source GitHub `anthropics/claude-plugins-official`.
- Ajoutée en **user settings** (`~/.claude/settings.json → extraKnownMarketplaces`). 273 plugins au
  catalogue ; identifiants réels vérifiés **avant** installation (pas déduits du rapport).

## 4. Identifiants exacts des plugins installés

| Plugin (id réel) | Auteur | Type réel (manifeste) | Dépendance |
|---|---|---|---|
| `frontend-design@claude-plugins-official` | Anthropic | **Skill** (`SKILL.md`, `name: frontend-design`) — aucune LSP/MCP | aucune |
| `typescript-lsp@claude-plugins-official` | Anthropic | **LSP** (`lspServers.typescript` → `typescript-language-server --stdio`, ext .ts/.tsx/.js/.jsx/.mts/.cts/.mjs/.cjs) | binaire `typescript-language-server` |

Description réelle de frontend-design (frontmatter) : *« Guidance for distinctive, intentional visual
design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and
making choices that don't read as templated defaults. »*

## 5. Versions et scopes

| Plugin | Version | Scope | Statut |
|---|---|---|---|
| frontend-design | `66799ffb4611` (SHA du commit) | user | √ enabled |
| typescript-lsp | `1.0.0` | user | √ enabled |

*Scope **user** (`~/.claude`), pas projet : les plugins ne sont pas ajoutés au dépôt Git (conforme à
« aucune modification de app/lib/curriculum/scripts/data ni des 4 Skills »).*

## 6. Commandes réellement exécutées

```bash
# Marketplace officielle
claude plugin marketplace add anthropics/claude-plugins-official
# Vérification des identifiants réels (lecture du marketplace.json en cache) — avant install
# Installation des 2 plugins retenus
claude plugin install frontend-design@claude-plugins-official
claude plugin install typescript-lsp@claude-plugins-official
# Binaire requis par typescript-lsp (absent → installé globalement)
npm install -g typescript-language-server
```

## 7. Dépendances globales installées

- **`typescript-language-server` 5.3.0** → `/opt/node22/bin/typescript-language-server` (**global**, hors
  dépôt). Requis par la config LSP du plugin (`lspServers.typescript.command`). `tsc`/`tsserver` étaient
  présents mais ne fournissent pas l'interface LSP `--stdio`.
- **Aucune** dépendance npm ajoutée au **projet** : `package.json` et `package-lock.json` **inchangés**
  (vérifié).

## 8. Fichiers modifiés (classés)

| Fichier / chemin | Catégorie | Statut |
|---|---|---|
| `~/.claude/settings.json` (`enabledPlugins`, `extraKnownMarketplaces`) | Config Claude attendue | ✅ |
| `~/.claude/plugins/**` (marketplace + cache, ~11 Mo) | Fichiers Claude-managed | ✅ |
| `/opt/node22/bin/typescript-language-server` | Installation globale | ✅ |
| Dépôt (`app/`, `lib/`, `curriculum/`, `scripts/`, `data/`, `package*.json`, `.claude/skills/`) | — | **AUCUN changement** (working tree propre) — pas d'anomalie |

## 9. Validation de frontend-design

- Installé, **enabled**, scope user (`claude plugin list`).
- **Skill présent et valide** : `SKILL.md` avec `name: frontend-design` + description ciblée « direction
  visuelle / typographie / éviter les défauts templatisés » → composant **découvrable**.
- Aucune LSP/MCP/hook (skill pur, coût de contexte faible, chargé à la demande).
- **Limite de vérification** : la découverte *runtime* effective (auto-invocation ou `/frontend-design`)
  s'active au prochain chargement de session / `/reload-plugins`. Ici, confirmé : plugin **activé** +
  manifeste de skill **valide** — les deux conditions de découvrabilité. Aucune demande d'implémentation
  ne lui a été faite.

## 10. Validation de typescript-lsp (test LSP réel, lecture seule)

Test via un client LSP minimal (`initialize` → `didOpen` → `documentSymbol`) contre `lib/program.ts` :
- **Binaire trouvé** : `typescript-language-server` 5.3.0.
- **Démarre sans erreur** : réponse à `initialize` reçue.
- **Reconnaît le projet TypeScript** : `documentSymbol` a renvoyé des **symboles réels** du fichier
  (`getDay`, `getDayChecklist`, `cached`, `CUR`, …).
- **Lit un symbole sans modifier de fichier** : working tree resté **propre** après le test.
- Extensions couvertes : `.ts/.tsx/.js/.jsx/.mts/.cts/.mjs/.cjs`.

## 11. Résultats curriculum-guard et local-verify (post-installation)

- **curriculum-guard** (vs `local-v1-content-stable`) : ✅ **0 changement pédagogique**.
- **local-verify** : ✅ HEAD `17962e6` · working tree propre · **generate idempotent** ·
  **curriculum:check 365/365, 60 leçons** · depth-check ✅ · glossary ✅ · **tests 43/43** ·
  **build (lint+typecheck) OK** · **0 lien de leçon cassé** · **0 caractère invalide**.
- **4 Skills projet intacts** : `.claude/` inchangé depuis `d9f8dc8`.

Confirmations explicites : 365/365 jours ✅ · 60 leçons ✅ · 43/43 tests ✅ · build vert ✅ · zéro dérive
pédagogique ✅ · aucun changement applicatif ou UI ✅ · les 4 Skills projet intacts ✅.

## 12. Limites / problèmes constatés

- **Scope user + environnement éphémère** : les plugins sont en `~/.claude` (user scope). Dans un conteneur
  distant éphémère, `~/.claude` peut ne pas persister vers une **session neuve** ; le cas échéant, ré-exécuter
  les commandes de la §6 (ou déclarer les plugins en portée projet via `.claude/settings.json` du dépôt, ce
  qui **n'a pas** été fait pour ne rien committer côté dépôt sans validation).
- **Découverte runtime** : confirmée au niveau *enabled + manifeste valide* ; l'activation effective dans le
  fil se fait au prochain `/reload-plugins` ou nouvelle session (non déclenché ici volontairement).
- **Binaire global** : `typescript-language-server` doit être présent sur la machine ; réinstaller si le
  conteneur est recréé.
- Aucun MCP, aucun accès SaaS, aucun plugin différé (Playwright/Chrome DevTools/Figma/Design/Browser-use/
  Superpowers/Skill-creator) n'a été installé.

## 13. Ordre d'usage validé pour la prochaine session

```
curriculum-guard          # pédagogie intacte AVANT
  → local-verify          # baseline verte
  → ux-audit              # mesure de l'écran (lecture seule) → constats à valider
  → frontend-design       # direction esthétique sur les constats validés
  → [VALIDATION HUMAINE]  # choix du/des changements (1–2 max pour le pilote)
  → ui-implement          # exécution scopée, avec support typescript-lsp (diagnostics live)
  → curriculum-guard      # pédagogie toujours intacte APRÈS
  → local-verify          # pipeline vert
```

---

**Statut : installation + validation terminées et documentées. `frontend-design` et `typescript-lsp`
installés (user scope), activés, fonctionnels ; dépôt et curriculum intacts. Ce rapport n'est pas commité —
en attente de votre validation.** Je ne lance ni ux-audit, ni frontend-design sur la Vue Jour, ni aucun
audit visuel, et ne propose aucune direction graphique tant que vous n'avez pas validé.
