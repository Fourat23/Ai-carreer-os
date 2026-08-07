# ADR-027 — Durcissement pédagogique débutant & graphe leçon → pratique

Statut : accepté (Sprint V27). Décision fondée sur l'audit CP0 réel.
**Priorité produit : qualité pédagogique réelle > accessibilité néophyte >
cohérence (leçons/parcours/jours/exercices/Labs/missions) > exactitude > pratique
délibérée > robustesse > nouvelles surfaces.** Local, mono-utilisateur, sans
réseau, sans cloud réel, **sans nouveau moteur** (progression, exercices, missions,
preuves, compétences, catalogue restent uniques).

## Problème produit (établi au CP0)

V26 a comblé la dette de CONNAISSANCE : 60 → 92 leçons de fond, dont 32 nouvelles
sur la colonne Cloud/DevOps (Linux, réseau, Docker, CI/CD, Kubernetes,
cloud/AWS/Azure/IaC/FinOps). L'audit CP0 de V27 établit trois faiblesses réelles,
cohérentes et systématiques, **pour un néophyte complet** :

1. **On-ramp débutant absent.** Les leçons ouvrent sur l'`Objectif` puis le
   `Modèle mental`, en introduisant du jargon (inode, PID, RSS, daemon, VPC,
   CrashLoopBackOff) AVANT toute situation concrète jargon-free. Dimensions
   faibles : `accessibility` (2–3), `progression` (3), `cognitive-load` (2–3).
2. **Prérequis trop maigres.** Un simple lien d'une ligne, sans expliciter ce
   qu'il faut déjà savoir ni pourquoi. Dimension `prerequisites` (2).
3. **Graphe leçon → pratique rompu.** Les 172 exercices (dont ~75 Cloud/DevOps),
   39 missions et Labs existants ne sont **reliés à aucune leçon** de façon
   exploitable (pas de `lessonRefs`, pas de `practiceRefs`). Dimensions
   `autonomous-practice` (2), `track-coherence` (3).

Les leçons sont techniquement excellentes (`technical-accuracy` ~4) : **le
problème n'est pas l'exactitude, mais l'accessibilité et l'intégration à la
pratique**. Corollaire : produire davantage de contenu ne résout rien ; il faut
DURCIR l'existant et TISSER le graphe pédagogique.

## Décision 1 — Durcissement pédagogique additif (pas de réécriture)

Chaque leçon V26 reçoit, de façon ADDITIVE (le contenu technique exact est
conservé) :

- **On-ramp « 🌍 Le problème d'abord »** en tête (avant l'Objectif) : une
  situation concrète, le problème qu'elle pose, et l'intuition — SANS jargon non
  défini. C'est l'étape 1-3 du chemin pédagogique néophyte.
- **Prérequis explicités** : « ce que tu dois déjà savoir + pourquoi », avec les
  liens existants conservés.
- **Vocabulaire défini au premier usage** ; termes importants absents ajoutés au
  glossaire (réutilisation du glossaire existant, pas de second glossaire).

Le contrat de leçon débutant complet est décrit dans HSD-027.

## Décision 2 — Graphe leçon → pratique par `practiceRefs` (extension minimale)

Plutôt que d'inventer un moteur d'activités guidées, on ajoute une **liaison
déclarative minimale** : chaque leçon peut déclarer, dans sa métadonnée `LESSONS`
(`scripts/data/lessons-map.mjs`), un champ optionnel **`practiceRefs`** listant des
artefacts EXISTANTS pertinents :

```
{ file, title, cat, level, min, skills, practiceRefs?: [
    { kind: 'exercise'|'lab'|'mission'|'playbook', id: '<id-existant>' }
] }
```

- Validé par le gate v27 : chaque `ref` doit résoudre vers un artefact réel
  (fichier `data/exercises/<id>.json`, `data/missions/<id>.json`,
  `data/playbooks/<id>.json`, ou un Lab connu). Aucun lien mort.
- Exposé (lecture seule) sur la page leçon via `program.json` (le générateur
  recopie `practiceRefs` tel quel, sans nouvelle source de vérité).
- **Aucun** nouveau moteur de progression/preuve : la preuve reste produite par
  le moteur d'exercices / Labs / missions existant lorsqu'on OUVRE l'artefact.

C'est le « modèle de pratique guidée » du prompt exprimé comme un GRAPHE de
références vers l'existant, l'extension minimale suffisante.

## Décision 3 — Audit pédagogique V27 : étendre le modèle existant

On réutilise `lib/pedagogy-audit.mjs` (16 dimensions 0-4, seuils, scan de danger)
et le format de ledger de `docs/architecture/v20-pedagogy-audit.json`. V27 ajoute
un **ledger dédié** `docs/architecture/v27-pedagogy-audit.json` (kind `content`,
`sourcePath` = `curriculum/lessons/<slug>.md`) portant les scores AVANT/APRÈS des
32 leçons + celles modifiées. Aucun second modèle d'audit.

## Décision 4 — Gate `v27:check` (structurel, jamais « longueur = profondeur »)

Nouveau gate `scripts/v27-check.mjs` (spec détaillée dans TSD-027) : structure
débutant obligatoire, prérequis, vocabulaire, on-ramp, absence de placeholders,
liens internes valides, `practiceRefs` résolus, graphe de prérequis sans cycle,
distinction réel/simulé. Intégré à `gates:active`. Le gate v26:check reste actif
(V27 ne réduit pas sa portée) ; on documente le cycle de vie dans TSD-027.

## Décision 5 — CP11 « Pedagogical Hardening & Beginner Validation »

CP11 est un checkpoint ACTIF (il peut modifier les leçons), exécuté après toutes
les intégrations : ré-audit, correction des contenus sous le seuil, échantillon
néophyte de bout en bout, `docs/PEDAGOGICAL-AUDIT-V27.md`.

## Alternatives rejetées

- **Réécrire les leçons** : rejeté — le contenu est exact ; réécrire risquerait des
  régressions et violerait « ne réécris rien arbitrairement ». On DURCIT en additif.
- **Créer un moteur d'« activités guidées »** dédié : rejeté — un graphe
  `practiceRefs` vers l'existant suffit et évite un second moteur.
- **Ajouter `lessonRefs` côté exercices** : rejeté comme source primaire — la
  relation est portée côté leçon (`practiceRefs`) pour garder les 172 exercices
  intacts ; l'inverse serait dérivable si besoin plus tard.
- **Produire 12+ nouveaux exercices pour un quota** : rejeté — ~75 exercices
  Cloud/DevOps existent ; on comble les TROUS réels et on relie, sans doublon.
- **Un « faux terminal / faux cloud / faux cluster »** : rejeté — toute exécution
  reste simulée et étiquetée ; aucune dépendance Docker/kubectl/compte cloud.

## Risques et limites

- Ajouter un on-ramp à 32 leçons est volumineux : maîtrisé par un patron commun et
  le ré-audit CP11.
- `practiceRefs` mal ciblés dégraderaient la pédagogie : le gate vérifie
  l'EXISTENCE, l'humain vérifie la PERTINENCE (ledger, CP11).
- Le scan de danger et les scores restent des PROXYS : ils ne prouvent pas la
  compréhension d'un apprenant ; d'où la validation néophyte manuelle en CP11.

## Migration additive

Aucune donnée existante détruite : ajout d'un champ optionnel `practiceRefs`, de
sections `.md` en tête, d'un ledger et d'un gate. Les 365 jours ne sont pas
réécrits. `progress.json` (runtime, gitignoré) est préservé.
