# Sprint V27 — Cloud/DevOps Practice Studio & Pedagogical Hardening

Rapport de sprint (français). AI Career OS reste **local, mono-utilisateur, sans
authentification, sans SaaS, sans réseau requis**. V27 n'introduit **aucun nouveau
moteur** (progression, exercices, missions, preuves, compétences, catalogue restent
uniques). **Aucun appel Docker/Kubernetes/AWS/Azure réel, aucune credential, aucun
provisionnement** : toute exécution reste simulée et étiquetée.

## 1. État initial audité (CP0)
HEAD initial `f63bcb1` (fin V26), branche `claude/ai-career-os-saas-phfg49`,
local == origin, working tree propre, aucun stash, aucun artefact V27, aucun serveur
résiduel. `progress.json` gitignoré (SHA `598f27c2…`). 913 tests verts, tsc propre,
build propre, gates:active vert, génération déterministe. 92 leçons de fond, 6
parcours disponibles dont `cloud-devops-engineer-v1` (29 jours dérivés).

## 2. HEAD initial
`f63bcb1` — rien de V27 n'était commencé.

## 3. Diagnostic pédagogique (CP0)
Les 32 leçons V26 sont **techniquement excellentes** mais, pour un **néophyte
complet**, présentent trois faiblesses systématiques : (a) pas d'on-ramp jargon-free
avant l'Objectif ; (b) prérequis réduits à un lien nu ; (c) graphe leçon → pratique
ROMPU (les ~75 exercices et ~30 missions Cloud/DevOps n'étaient reliés à aucune
leçon). Le problème n'était donc PAS l'exactitude ni la quantité de pratique, mais
l'accessibilité et l'intégration.

## 4. Architecture retenue (ADR/HSD/TSD-027)
Durcissement ADDITIF (pas de réécriture) : section « 🌍 Le problème d'abord » +
prérequis explicités + vocabulaire au premier usage. Graphe leçon → pratique via un
champ optionnel `practiceRefs` (référence vers des artefacts EXISTANTS), recopié tel
quel dans `program.json`. Extension du modèle d'audit existant
(`lib/pedagogy-audit.mjs`) + ledger V27. Gate `v27:check` structurel. CP11 actif.

## 5. Checkpoints et commits
| CP | Commit | Objet |
|---|---|---|
| CP1 | `4b8bb27` | ADR/HSD/TSD-027 |
| CP2 | `fe1bca5` | gate v27:check + practiceRefs + ledger + tests |
| CP3 | `41fd62a` | durcissement Linux (5) & réseau (5) |
| CP4 | `50fd9a8` | durcissement Docker (5) & CI/CD (4) |
| CP5 | `089fdce` | durcissement Kubernetes (6) |
| CP6 | `32f6a7a` | durcissement Cloud/AWS/Azure/IaC/FinOps (7) |
| CP7 | `1a2ad2f` | 12 exercices comblant les trous réels |
| CP8 | `e6e54b4` | mission drift IaC + graphe leçon → mission |
| CP9 | `3313e06` | matrice de cohérence du parcours + E2E |
| CP10 | `5c730b6` | surface « Pratique associée » + hardening + rapport |
| CP11 | `e9ae7d7` | Pedagogical Hardening & Beginner Validation |

## 6. Leçons auditées
Les **32** leçons de fond Cloud/DevOps V26 ont été auditées (grille 16 dimensions,
0-4) et **toutes durcies** (on-ramp + prérequis explicités ; vocabulaire vérifié).
Détail avant/après dans `docs/PEDAGOGICAL-AUDIT-V27.md` (CP11).

## 7. Corrections notables
- `linux-ssh-remote` : ajout d'un « Exemple guidé » (première connexion par clé) qui
  manquait.
- `linux-filesystem-permissions` & `docker-production-hardening` : reformulations pour
  passer le scan réel/simulé (mises en garde chmod 777 ; conteneur ≠ VM) sans changer
  le sens.
- Cas « 🚑 Que faire dans ce cas ? » ajoutés (Docker/CI-CD) : build lent, image OK en
  local mais pas en CI, pipeline qui échoue seulement en prod, pipeline vert mais
  appli qui ne démarre pas.

## 8. Exercices ajoutés (CP7)
12 exercices déterministes et distincts, comblant des trous réels (aucun doublon ;
`linux-symbolic-to-octal` écarté car dupliquant `sys-perms-to-octal`) :
`linux-path-traversal-x`, `linux-signal-choice`, `systemd-restart-loop`,
`linux-fd-ulimit`, `ssh-key-perms-accepted`, `dns-record-type-choice`,
`dns-ttl-still-cached`, `tls-cert-usable`, `http-method-idempotent`,
`iac-plan-destructive`, `iac-idempotent-changes`, `compose-depends-ready`. Contrat
vérifié par exécution (starter faux échouant ≥1 test public, référence 100% verte,
≥1 test privé, aucune fuite de solution).

## 9. Missions ajoutées (CP8)
1 mission comblant le seul trou réel : `iac-drift-remediation` (diagnostic +
remédiation de dérive IaC, simulation déterministe). Les ~30 missions Cloud/DevOps
préexistantes couvraient déjà les autres scénarios.

## 10. Cas professionnels « Que faire dans ce cas ? »
Étendus dans les leçons Docker/CI-CD (CP4) et via la mission IaC (CP8), sans
dupliquer les playbooks V24/V25.

## 11. Matrice du parcours Cloud/DevOps
`docs/architecture/v27-track-matrix.md` : module → jours → leçons → practiceRefs. 7
modules, 29 jours dérivés ; **32/32** leçons Cloud/DevOps reliées à la pratique.
Cadrage honnête junior/entrée.

## 12. Validations réelles
- `npm test` : **926** tests, 0 échec (dont v27-pedagogy, v27-exercises exécutés,
  v27-e2e).
- `gates:active` : vert (curriculum, depth, glossary, v18, v20-pedagogy, v26, v27).
- `npx tsc --noEmit` : propre. `npm run build` : propre.
- Génération déterministe (seul `generatedAt` varie).
- Validation navigateur (Chromium pré-installé) : leçon durcie (avec on-ramp +
  « Pratique associée ») et Lab d'exercice — **aucun débordement horizontal, aucune
  erreur console** à 375/768/1024/1440/1920. La section pratique rend des liens
  cliquables (/lab, /missions, /kubernetes).

## 13. Validations non réalisées
- Interaction utilisateur pilotée réelle (soumettre un exercice via l'UI et vérifier
  la preuve) : NON exécutée en navigateur (couverte au niveau logique par les tests
  d'exécution et l'E2E, pas par un clic piloté).
- Tests d'accessibilité automatisés (axe) : non exécutés ; contrôles manuels
  basiques uniquement (contraste hérité des tokens, navigation, absence d'erreurs).

## 14. Réel vs simulé
Tout est simulé et étiqueté : aucune exécution réelle de Docker/K8s/AWS/Azure/IaC.
Les moteurs d'exécution (runner d'exercices, Labs terminal/kubectl/docker/pipeline)
sont PRÉEXISTANTS et sandboxés ; V27 n'ajoute aucun `eval`/`exec` de runtime.

## 15. Sécurité
Aucun secret réel ; secrets d'exemple manifestement factices. Aucune fuite de
solution/test privé (testé). `practiceRefs` = simples références (pas d'exécution).
Aucun accès réseau distant ajouté.

## 16. Performance
Aucun moteur lourd ajouté aux routes globales ; la page leçon reste du rendu de
markdown + une petite liste statique. Pas de CodeMirror hors Lab.

## 17. Bundles
Build de production sans erreur ; la surface « Pratique associée » est un composant
serveur (aucun JS client ajouté).

## 18. Responsive
375/768/1024/1440/1920 validés sans débordement ni erreur console (CP10).

## 19. Accessibilité
Section pratique en `<aside aria-label>` + liste ; liens natifs (navigables au
clavier) ; couleurs issues des tokens existants. Audit a11y automatisé non exécuté
(déclaré en §13).

## 20. Tests
926 tests (dont V27 : intégrité audit/ledger, contrat d'exercices exécuté, E2E
graphe/parcours).

## 21. Gates
`gates:active` inclut désormais `v27:check`. Aucun gate retiré (v26 reste actif ;
v20-pedagogy actif). Historique inchangé.

## 22. État des données
`progress.json` (gitignoré) intact. `program.json` régénéré (practiceRefs injectés),
déterministe hors `generatedAt`.

## 23. État Git
Branche `claude/ai-career-os-saas-phfg49`, commits atomiques par CP, poussés.

## 24. Limites honnêtes
Le parcours Cloud/DevOps reste de niveau junior (jours réutilisés) ; l'audit
pédagogique s'appuie sur des proxys structurels + une revue humaine, il ne prouve pas
la compréhension d'un apprenant réel (d'où l'échantillon néophyte CP11).

## 25. Dette pédagogique restante
Voir `docs/PEDAGOGICAL-AUDIT-V27.md` (CP11) : journées/labs de pratique dédiés pour
faire mûrir le parcours ; domaines hors Cloud/DevOps (Data/Frontend) non traités.

## 26. Dette technique restante
Pas de route dédiée pour les Labs `terminal`/`cloud-topology` depuis la page leçon
(practiceRefs `lab` non utilisés pour ces deux-là) ; playbooks non liables (pas de
route). Audit a11y automatisé à ajouter.

## 27. Résumé avant/après
Avant : 32 leçons denses sans on-ramp, prérequis maigres, pratique déconnectée.
Après : 32 leçons avec on-ramp néophyte + prérequis explicités + 32/32 reliées à la
pratique ; +12 exercices ciblés, +1 mission IaC, gate v27, surface « Pratique
associée ».

## 28. CP11 — Pedagogical Hardening & Beginner Validation
Ré-audit des 32 leçons durcies (rubrique 16 dimensions) : moyenne globale ≈ **3,53
/ 4**, aucune dimension < 2, toutes les dimensions obligatoires ≥ 3, aucune leçon
sous le seuil. Ledger `docs/architecture/v27-pedagogy-audit.json` (32 items).
Validation « néophyte complet » sur un échantillon d'une leçon par domaine (10) :
on-ramp, exemple guidé, mini-exercice, vocabulaire et practiceRefs présents partout ;
12 questions de validation débutant répondues positivement. Rapport complet :
`docs/PEDAGOGICAL-AUDIT-V27.md`. Les 9 leçons denses passent le seuil mais restent
les plus exigeantes (dette V28). Aucune correction supplémentaire n'a été rendue
nécessaire par le ré-audit au-delà de celles des CP3→CP10.

## 29. HEAD final, Git, données
HEAD final et confirmations (local == origin, progress.json restauré, 0 workspace/
serveur/conteneur) : voir la synthèse finale en français.

---

## Prompt COMPLET V28 (à copier tel quel pour démarrer le prochain sprint)

```
SPRINT V28 — « Observabilité, incidents, SRE & fiabilité opérationnelle +
2ᵉ vague de durcissement pédagogique »

CONTEXTE PRODUIT (à ne jamais violer)
AI Career OS est une application d'apprentissage strictement LOCALE, mono-
utilisateur, SANS authentification, SANS SaaS, SANS multi-utilisateur, SANS
télémétrie externe, SANS cloud réel, SANS secrets réels, SANS réseau fournisseur
réel. Tout fonctionne hors ligne. Pipeline : leçons .md hand-authored + métadonnées
LESSONS (scripts/data/lessons-map.mjs) → data/program.json via `npm run generate`
(fichiers `<!-- keep -->` jamais régénérés). Progression = store v3 ; catalogue =
lib/catalogue.mjs ; audit pédagogique = lib/pedagogy-audit.mjs + ledgers ; gates =
package.json. NE RECRÉE AUCUN MOTEUR (progression, exercices, missions, preuves,
compétences, Labs, catalogue).

PRIORITÉ : qualité pédagogique réelle > accessibilité néophyte > cohérence
leçons/parcours/pratique > exactitude > pratique délibérée > robustesse > nouvelles
surfaces. Le nombre de fichiers/tests/exercices n'est pas un objectif.

COMMENCE PAR CP0. N'ÉCRIS RIEN AVANT D'AVOIR ÉTABLI L'ÉTAT RÉEL.

CP0 — Audit forensique + pédagogique (lecture seule). Établis l'état RÉEL (jamais
supposé) : branche, HEAD, local vs origin, working tree, stash, artefacts V28,
serveurs/process, baseline progress.json, tests, tsc, build, gates actifs/histo,
génération déterministe, nb leçons, nb parcours. Puis audite la COUVERTURE
OBSERVABILITÉ/SRE : quelles leçons de fond existent sur métriques, logs, traces,
SLI/SLO, error budget, alerting, incidents, runbooks, résilience ? (V26/V27 ont
couvert Linux/réseau/Docker/CI-CD/K8s/cloud/AWS/Azure/IaC/FinOps ; l'observabilité
n'a qu'une leçon `observability-logging` généraliste.) Identifie les trous réels et
les leçons DENSES V27 (networking-http-tls, cloud-aws-core, cloud-azure-core,
k8s-troubleshooting, iac-fundamentals, cloud-finops, ci-cd-quality-gates-artifacts,
linux-resources-io, docker-images-layers) candidates à un découpage progressif.
Produis une matrice + le plan CP1→CP11. Aucun commit sauf état corrompu.

CP1 — ADR/HSD/TSD-028 : stratégie (nouvelles leçons de fond observabilité/SRE +
2ᵉ vague de durcissement/découpage des leçons denses) ; réutilisation des Labs
existants (Cloud Architecture Lab pour SLO/observabilité, Pipeline/K8s pour
incidents) ; contrat de leçon débutant (repris de HSD-027) ; distinction réel/simulé ;
refus d'un 2ᵉ moteur ; migration additive.

CP2 — Gate v28:check (structurel) + extension du ledger d'audit (nouvelles leçons +
leçons re-durcies) + tests d'intégrité. Basculer v27:check en gates:historical SI
V28 enrichit légitimement son périmètre (lessons-map). Documenter le cycle de vie.

CP3-CP6 — Nouvelles Leçons de fond observabilité/SRE (qualité > quantité, ~+6 à +10) :
métriques (types, cardinalité, RED/USE), logs structurés & corrélation, traces &
spans, SLI/SLO/SLA & error budget, alerting (symptôme vs cause, fatigue d'alerte),
saturation/capacité/latence p50/p95/p99, disponibilité & résilience (redondance,
dégradation gracieuse, chaos SIMULÉ), incident command & post-mortem sans blâme,
runbooks. Chaque leçon : on-ramp « Le problème d'abord », prérequis explicités,
vocabulaire au premier usage, practiceRefs vers artefacts EXISTANTS (ou nouveaux si
trou réel). Relier au glossaire (compléter uniquement les termes réellement absents).

CP7 — Exercices ciblés observabilité/SRE (déterministes) : calcul d'error budget,
p95/p99 sur un échantillon, choix d'un SLI, tri alerte symptôme/cause, détection de
saturation, décision d'incident. Réutiliser le moteur ; contrat respecté (starter
faux échouant ≥1 test PUBLIC, référence verte, ≥1 test privé, taxonomie d'exercices,
aucune fuite). Ne pas dupliquer les ~75 exercices Cloud/DevOps existants.

CP8 — Missions/pratique guidée : combler les trous réels d'observabilité/SRE
(ex. définir des SLO pour un service, écrire un runbook d'alerte, conduire un
post-mortem). Réutiliser les Labs. Relier leçons ↔ jours ↔ exercices ↔ missions ↔
compétences ↔ preuves via practiceRefs.

CP9 — 2ᵉ vague de durcissement pédagogique : traiter les leçons DENSES V27 (découpage
progressif si pertinent, sans casser la cohérence ni les liens) et améliorer
`observability-logging`. Cohérence du parcours cloud-devops-engineer-v1 (l'observabilité
doit s'y insérer proprement). Matrice + E2E complet (enrôlement → progression →
preuve → isolation → export/import).

CP10 — Hardening technique : tests, tsc, build, gates actifs, génération déterministe,
bundles, absence d'eval/exec de runtime nouveau, anti-fuite, progress.json restauré,
nettoyage serveurs/workspaces, responsive 375/768/1024/1440/1920 (Chromium
pré-installé, PAS de « playwright install » — distinguer honnêtement testé/non testé).
docs/SPRINT-V28.md (sans déclarer terminé).

CP11 — Pedagogical Hardening & Beginner Validation : ré-audit des leçons nouvelles ET
re-durcies, scores avant/après, échantillon néophyte de bout en bout, corrections des
contenus sous le seuil, docs/PEDAGOGICAL-AUDIT-V28.md, prompt COMPLET V29. Rejouer
toute la batterie après modifications.

ANTI-SLOP (non négociable) : pas de contenu générique ni de gabarits répétés ; pas de
faux chiffres ; AWS distinct d'Azure ; ne jamais prétendre exécuter/observer un
système réel ; « chaos » toujours SIMULÉ et étiqueté ; conteneur ≠ VM ; Secret K8s =
base64 non chiffré ; secrets factices ; ne pas déclarer un domaine « couvert » sur la
seule présence d'une leçon — vérifier la pratique ATTEIGNABLE ; qualité > quantité.

HORS PÉRIMÈTRE V28 : refonte UI/UX globale, gamification, complétion Data/Frontend/
Game, exécution réelle (cloud/K8s/IaC/observabilité), réécriture des 365 jours.

RAPPELS : Chromium headless pré-installé ; progress.json gitignoré (ne pas committer) ;
tout en FRANÇAIS ; commits atomiques par CP (audit → implémentation → tests → tsc →
build → gates → commit → push sur la branche de développement). NE DÉMARRE PAS V29.
```

---

*Fin du rapport V27. V28 est préparé mais NON démarré.*
