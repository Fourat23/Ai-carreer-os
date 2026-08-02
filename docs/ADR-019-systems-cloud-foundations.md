# ADR-019 — Fondations opérationnelles Linux/système/réseau & 4ᵉ parcours

Statut : accepté (Sprint V19). Décision fondée sur l'audit CP0 réel. Étend
l'existant ; aucun second moteur de progression, aucun second catalogue, aucun
nouveau runtime, aucun shell arbitraire, aucune refonte graphique.

## Problème produit

Avant d'aborder Docker, Kubernetes, AWS et Azure (sprints ultérieurs), l'apprenant
doit posséder des **fondations opérationnelles sérieuses** : terminal/shell/CLI,
système Linux (permissions, processus, services, ressources), réseau (DNS, TCP/TLS,
HTTP, ports, sockets), SSH, et une **méthode de diagnostic** reproductible. L'audit
CP0 montre que ces notions sont surtout **mentionnées ou expliquées en prose**
(j1, j2, j50, j71, j72) mais **jamais pratiquées ni évaluées**, et que plusieurs
sujets clés (systemd/journalctl, SSH, inode/descripteurs de fichiers, rwx↔octal,
umask) sont **absents**. Il n'existe aucun parcours orienté systèmes/exploitation.

## Périmètre V19

- Enrichir réellement Linux/terminal/système/réseau/SSH/diagnostic (au moins
  « pratiqué » sur les sujets centraux, « évalué » sur les sujets critiques).
- Créer un **4ᵉ parcours disponible** `systems-cloud-foundations-v1`
  (« Systems & Cloud Foundations »).
- Ajouter ≥ 10 exercices déterministes et ≥ 4 missions professionnelles.
- Relier cours ↔ exercices ↔ missions ↔ compétences ↔ glossaire ↔ recherche ↔
  révisions ↔ progression, sans casser les 3 parcours existants.
- **Hors périmètre** : Docker/K8s/AWS/Azure en profondeur, terminal d'exécution
  réel, WSL, comptes cloud, réseau externe — ce sont les prérequis, pas les cibles.

## Source de vérité & stratégie d'enrichissement éditorial

La source de vérité reste **`scripts/data/*.mjs`** → génère `curriculum/**/*.md`
et `data/program.json`. On modifie **uniquement** les modules sources concernés
(homes identifiés : `days-enrich-61-90.mjs` pour j71/j72 ; le module des jours 1-2
pour le terminal), puis on régénère et on **audite la dérive exacte** (aucun autre
jour, semaine, mois, projet ou solution ne doit changer ; marqueurs `keep`
respectés ; `generatedAt` volatil ignoré). Une gate `v19:check` verrouille le
périmètre (plan explicite des jours modifiés), comme ADR-017 pour V17.

## 4ᵉ parcours

`systems-cloud-foundations-v1` est défini dans `lib/catalogue.mjs` par de nouveaux
`SYSTEMS_CLOUD_MODULE_SPECS` (plages de jours `[id,title,summary,from,to]`), qui
**réutilisent des journées existantes réellement pertinentes** (terminal/CLI,
HTTP, réseau, Linux avancé, observabilité, sécurité/durcissement) — enrichies par
V19. **Aucun jour n'est créé, aucun curriculum n'est copié.** Sa durée est
**dérivée** des jours réellement sélectionnés (`resolveTrackDays`). Il réutilise
`buildCatalogue`/`validateCatalogue`/`resolveTrackDays` et tous les helpers
génériques ; il apparaît dans `/parcours`, fonctionne avec Dashboard, calendrier,
trajectoire, Vue Jour, Lab, Missions, Compétences, Révisions, recherche et
Synthèse ; il s'active/se quitte sans perte de données et **n'en contamine aucun
autre** (isolation native de la progression v3).

## Exercices déterministes

≥ 10 exercices distincts sur les runtimes déjà sécurisés (Node, TypeScript,
Python). **Aucun shell arbitraire** : on n'exécute jamais une commande fournie par
l'apprenant via `shell:true`/`eval`/`exec`. Les exercices reposent sur des
**fonctions pures** et des **fixtures déterministes** : permissions rwx↔octal,
umask, listes de processus, conflits de port, logs synthétiques, classement
d'erreurs par couche (DNS/TCP/HTTP/TLS), reconstruction de pipeline, codes de
sortie/retry, utilisation disque/mémoire, table DNS simulée, filtrage type grep,
diagnostic de service. Contrat existant respecté (starter non trivial, référence
100 % verte, ≥ 1 test public échoue sur le starter, tests privés réellement
privés, limites explicites, journée liée, compétences, anti-fuite).

## Missions

≥ 4 missions via le **moteur V18 inchangé** (`data/missions/*.json`,
`lib/mission*.mjs`) : port occupé & service indisponible ; permissions & secret
exposé ; incident DNS/TLS/HTTP par couches ; saturation de ressources. Livrables
mixtes (code auto + documents structurels + revue humaine).

## Séparation simulation / réalité

Toute représentation (processus, permissions, logs, table DNS, réponses HTTP,
sorties de commandes) est une **simulation déterministe explicitement étiquetée**
comme telle dans l'énoncé. L'application **ne prétend jamais** simuler un système
Linux réel ni offrir une isolation OS. Le terminal d'exécution réel et
l'environnement Docker sécurisé sont **explicitement renvoyés à V20**.

## Intégration progression

Une seule `progress.json` (schéma v3). Le 4ᵉ parcours réutilise l'isolation par
parcours native (preuves, compétences, révisions, état des missions). Aucune
seconde progression, aucun schéma parallèle. La sauvegarde v3 préserve l'état du
nouveau parcours.

## Sécurité & performance

Application locale mono-utilisateur, sans réseau/CDN/auth/SaaS. Pas d'exécution
arbitraire du shell. Aucune solution, code apprenant, secret ou test privé indexé
ou envoyé au client. Sorties et historiques bornés. CodeMirror, compilateurs et
previews restent **lazy et limités aux routes `/lab/[id]`** ; aucun runtime lourd
n'entre dans les bundles des routes non-Lab.

## Migrations

Additif : le 4ᵉ parcours est un nouvel identifiant de track ; les progressions
existantes (sans lui) restent valides (migration = no-op). Aucun retrait ni
réécriture de données. `data/progress.json` sauvegardé avant les tests mutateurs
et restauré exactement après.

## Limites honnêtes

- Les exercices « système » sont des **modèles déterministes**, pas un vrai OS :
  ils enseignent le raisonnement (calcul de permissions, lecture de signaux,
  diagnostic par couches), pas l'exécution réelle.
- Les missions documentaires restent évaluées honnêtement : validation
  **structurelle** automatique + **revue humaine** obligatoire pour le fond ;
  aucun pseudo-score de qualité, aucune fausse IA.
- Certains outils/noms diffèrent selon le système (ex. `ss`/`netstat`,
  `traceroute`/`tracert`, `dig`/`nslookup`) — signalé explicitement dans le contenu.

## Préparation de V20

V19 pose les prérequis. **V20** traitera « Environnement d'exécution terminal
sécurisé + Docker Foundations » (bac à sable réel borné, isolation explicitement
qualifiée). Rien de V20 n'est démarré ici.

## Alternatives rejetées

- **Shell réel piloté par l'apprenant** : rejeté (surface d'exécution arbitraire,
  hors périmètre, dangereux) → simulations déterministes.
- **Copier des jours dans un nouveau curriculum** : rejeté (seconde source de
  vérité) → réutilisation des jours existants via modules.
- **Nouveau moteur de missions/progression** : rejeté → réutilisation V18/v3.

## Conséquences

- Positives : fondations opérationnelles réellement pratiquées et évaluées ; 4ᵉ
  parcours cohérent ; réutilisation intégrale de l'infrastructure existante.
- Coûts : une gate de plus (`v19:check`) ; discipline de périmètre éditorial ; le
  catalogue passe de 3 à 4 parcours disponibles (tests de comptage à mettre à jour).
- Non-objectifs : pas de shell réel, pas de Docker/cloud, pas de refonte, pas de
  notation sémantique automatique.
