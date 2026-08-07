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
| CP10 | *(ce commit)* | surface « Pratique associée » + hardening + rapport |
| CP11 | *(à venir)* | Pedagogical Hardening & Beginner Validation |

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

## 28. HEAD final, Git, données
Renseignés dans la synthèse finale (après CP11).
