# Audit pédagogique V20

Rapport d'audit (CP2). Fondé sur l'exécution réelle du modèle `lib/pedagogy-audit.mjs`
(CP1) et sur la lecture des contenus. **Aucun contenu pédagogique n'a été modifié
pendant l'audit** ; les corrections sont planifiées pour CP3.

## 1. Méthodologie

Trois niveaux, comme prescrit :

- **Niveau A** — audit des ajouts V17/V18/V19 (journées enrichies, exercices,
  missions, glossaire).
- **Niveau B** — audit **structurel automatique** des 365 journées (présence des
  composants pédagogiques + scan de danger), via `structuralSignals` et
  `detectDangerSignals`.
- **Niveau C** — **échantillon qualitatif** transverse (une journée par famille
  de module), noté à la main sur la rubrique.

La rubrique compte **16 dimensions** notées 0-4. Une note de qualité est
**humaine** ; l'automatisation ne fournit que des **signaux structurels**
(informatifs) et des **signaux de danger** (bloquants). Aucune note n'est dérivée
d'un comptage de mots. Le registre `docs/architecture/v20-pedagogy-audit.json`
consigne les notes ; la gate `v20:pedagogy-check` les valide contre les seuils.

## 2. Périmètre

- 365 journées (`curriculum/days/*.md`), 88 exercices, 8 missions, 353 termes de
  glossaire.
- 21 éléments notés à la main : 10 journées récentes (Niveau A), 6 journées
  d'échantillon (Niveau C), 3 exercices et 2 missions récents.
- Scan de danger : **461 fichiers** (curriculum + exercices + missions).

## 3. Limites de l'audit (honnêtes)

- L'audit **statique** détecte l'absence de composants et les dangers factuels ;
  il **ne mesure pas** la qualité d'un raisonnement — d'où des notes humaines.
- Un audit ne remplace pas **l'observation d'un apprenant réel**.
- Seules 16 journées sur 365 sont notées **en profondeur** ; les 349 autres ne
  sont couvertes que par le Niveau B (structurel). V20 **ne certifie donc pas**
  la qualité de l'ensemble des 365 jours.

## 4. Résultat global

- **Sécurité/exactitude factuelle : aucun signal bloquant sur 461 fichiers.**
  Aucun `chmod 777` présenté comme normal, aucun `rm -rf` destructif non encadré,
  aucune promesse d'isolation OS ou de sécurité absolue, aucun bloc de code non
  fermé, aucun placeholder d'auteur résiduel.
- **Structure (313 journées d'enseignement) : 0 journée structurellement pauvre**
  (< 70 % des composants). Les 52 journées « pauvres » détectées sont **toutes des
  journées de revue** (structure différente légitime : synthèse/grille/remédiation).
- **Aucune journée artificiellement vide** (0 journée < 250 mots).
- Moyenne des notes humaines : **3,50/4** (contenu récent V17-V19), **3,41/4**
  (échantillon base). Tous les éléments notés dépassent leur seuil (≥ 3,25 récent,
  ≥ 3,0 base).

## 5. Matrice des notes (extrait)

| Élément | Récent | Moyenne | Dimension la plus basse |
|---|---|---|---|
| day-1 (terminal) | oui | 3,56 | — (complet) |
| day-2 (redirections/pipes) | oui | 3,44 | **modèle mental (2)** |
| day-50 / 66 / 69 / 71 / 72 / 80 / 85 | oui | 3,50 | charge cognitive (3, denses) |
| day-102 (perf/observabilité) | oui | 3,44 | **erreurs fréquentes (2)** |
| day-45 (projet) | non | 3,56 | — (complet) |
| day-5 (débutant) | non | 3,44 | modèle mental (2) |
| day-95 / 160 / 340 | non | 3,44 | erreurs fréquentes (2) |
| day-205 (LLM structured) | non | 3,19 | erreurs/quiz absents, plus court |
| exercices V19 (×3) | oui | 3,56 | — |
| missions V19 (×2) | oui | 3,50 | évaluation (3, structurelle+revue) |

## 6. Défauts

### Bloquants
**Aucun.** Le scan de danger sur 461 fichiers ne remonte aucun signal bloquant.

### Majeurs
- **`common-mistakes` absent dans 235 journées d'enseignement** (sur 313). La
  section « Erreurs fréquentes » — diagnostic des erreurs réelles — est le
  composant le plus souvent manquant du curriculum de base. Fort levier
  pédagogique. *(Portée : base ; hors périmètre V20 sauf journées récentes.)*
- **`quiz` (rappel actif) absent dans 77 journées d'enseignement.** Moindre levier.

### Mineurs
- **day-2** (récent) : pas de section « modèle mental » explicite (concepts
  présents en prose) → **corrigible en CP3**.
- **day-102** (récent) : pas de section « erreurs fréquentes » explicite →
  **corrigible en CP3**.
- **Densité** des journées V19 réseau/Linux (j71, j72 ≈ 2300 mots) : charge
  cognitive élevée (note 3). Le contenu est excellent ; un léger fractionnement
  visuel améliorerait la lisibilité, sans rien retirer.
- `mental-model` absent dans 21 journées d'enseignement (dont day-5).

## 7. Contenu excellent à préserver

- Journées V19 réseau/Linux (j71, j72) : distinguent processus/service/démon,
  port/socket/connexion, DNS/TCP/TLS/HTTP ; méthode de **diagnostic par couches** ;
  `chmod 777` correctement présenté comme anti-pattern ; SIGTERM/SIGKILL honnêtes ;
  `ping` **non** présenté comme preuve générale que « le réseau fonctionne ».
- Missions V18/V19 : évaluation **honnête** (auto + structurelle + revue humaine),
  aucun pseudo-score de qualité.
- Exercices V19 : déterministes, référence verte, starter non trivial, tests
  privés non exposés, compétences alignées.
- Journées projet (ex. j45) : structure complète, exemplaires.

## 8. Superficiel / à surveiller

- **day-205** (LLM structured outputs) : plus court (968 mots), sans quiz ni
  erreurs fréquentes — le moins dense de l'échantillon. Acceptable (≥ seuil) mais
  perfectible. *(Hors périmètre récent ; noté pour suivi.)*

## 9. Progression, redondances, alignement

- **Progression** : cohérente sur l'échantillon (débutant → projet → avancé →
  IA). Aucune inversion de difficulté détectée.
- **Redondances** : les journées V19 réutilisent des rappels inter-journées
  (« jour N ») — liens **cohérents**, pas de duplication de contenu.
- **Exercices ↔ compétences** : alignés (les exercices V19 portent les
  micro-compétences enseignées le jour lié).
- **Missions** : réalistes (incident EADDRINUSE, secret exposé, diagnostic par
  couches, saturation) — ressemblent à du vrai travail d'ingénierie ; l'évaluation
  distingue auto-validable / structurel / revue humaine.
- **Glossaire** : 353 termes ; les 56 termes opérationnels V19 (chmod, umask,
  inode, SIGTERM, systemd, socket, SNI, clé SSH, moindre privilège…) comblent le
  vocabulaire systèmes/réseau. Manques identifiés **côté Docker** (container,
  image, layer, volume…) → **cible CP9**.

## 10. Comparaison V17 / V18 / V19

- **V17** (dette, maintenance, perf, doc, incident) : théorie profonde, bien liée
  aux exercices/missions ; quelques journées sans « erreurs fréquentes » explicite
  (j102).
- **V18** (missions d'ingénierie) : évaluation honnête exemplaire ; réutilisation
  stricte du moteur.
- **V19** (Linux/système/réseau) : le plus dense et le plus complet
  structurellement (j1, j50, j66, j69, j71, j72, j80, j85 à 100 %) ; seul écart
  mineur : j2 sans section « modèle mental ». Qualité technique et honnêteté
  sécurité élevées.

Les trois vagues dépassent les seuils. V19 est la plus riche mais aussi la plus
**dense** (charge cognitive à surveiller).

## 11. Plan de correction priorisé

### À corriger dans V20 (CP3) — ciblé, additif, contenu récent
1. **day-2** : ajouter une section/paragraphe « modèle mental » explicite
   (le shell découpe → protège → développe → exécute ; les flux comme des tuyaux).
2. **day-102** : ajouter une section « Erreurs fréquentes » explicite (perf/observabilité).
3. **j71 / j72** : léger fractionnement visuel des blocs de théorie les plus
   longs (sous-titres/espaces), **sans retirer de contenu**, pour abaisser la
   charge cognitive.
4. Vérifier après coup que les dimensions concernées remontent à ≥ 3 et que la
   gate reste verte.

### À reporter (hors périmètre V20)
- Ajout systématique d'« Erreurs fréquentes » aux ~235 journées de base : levier
  réel mais chantier éditorial de masse, **différé** (non ciblé V19-récent).
- Ajout de quiz aux 77 journées sans rappel actif.
- Enrichissement de day-205 (LLM) : hors thème V20 (terminal/Docker).

### À ne pas modifier
- Les 313 journées d'enseignement structurellement solides.
- La structure spécifique des 52 journées de revue.
- Le contenu V19 réseau/Linux (excellent) — hors léger fractionnement.

## 12. Réponses aux questions clés

- **Les cours récents sont-ils exploitables ?** Oui : moyenne 3,50/4, tous
  au-dessus du seuil récent (3,25), 0 danger.
- **Trop superficiels ?** day-205 (base, hors périmètre). Aucun contenu récent.
- **Trop longs/denses ?** j71/j72 (dense) — à fractionner visuellement, pas à couper.
- **Exercices alignés aux compétences ?** Oui.
- **Missions crédibles ?** Oui — incidents réalistes, évaluation honnête.
- **Apprend-on de ses erreurs ?** Partiellement : forte sur les récents (feedback,
  tests, revue) ; faible sur la base (235 journées sans « erreurs fréquentes »).
- **Contenus techniques exacts ?** Oui (0 signal bloquant).
- **Risques/limites explicités ?** Oui (chmod 777, ping, isolation).
- **Parcours Systems/Cloud cohérent ?** Oui pour les fondations ; Docker à ajouter
  (CP8).
- **Docker assez profond ?** **Pas encore** — c'est l'objet de CP8.
- **Ce qui manque avant crédibilité pro complète ?** Docker/CI/CD et
  l'observation d'apprenants réels.

## 13. Mise à jour CP3 (corrections appliquées)

L'audit CP2 avait classé « ajouter *Erreurs fréquentes* aux ~235 journées » comme
**reporté** (chantier de masse supposé). CP3 a révélé la vraie cause : un
**bug de cohérence du générateur** — la branche des journées planifiées (91-365)
ne câblait pas le champ `mistakes`, alors que la branche des jours 1-90 rend déjà
les `solution.pitfalls` comme « Erreurs fréquentes ». Les pièges étaient donc
**déjà rédigés** mais **masqués**. Correctif : **une ligne** dans
`scripts/generate-curriculum.mjs`, **purement additive** (aucune ligne retirée,
aucune autre section modifiée), qui **surface du contenu existant**.

Résultat mesuré :
- couverture « Erreurs fréquentes » (journées d'enseignement) : **78 → 312 / 313**.
- **0 signal de danger** introduit (scan des 235 journées modifiées).
- day-2 : section « modèle mental » ajoutée (source, additif).
- day-102/95/160/205/340 : dimensions concernées remontées à ≥ 3 dans le registre.

Restent volontairement **non traités** (hors périmètre V20) : la généralisation
des **quiz** (77 journées) et l'enrichissement de day-205 (thème LLM). La journée
sans pitfalls rédigés (1/313) n'a pas de section ajoutée : pas de contenu fabriqué.

## 14. Audit final CP9 — contenu Docker (CP8) & bilan avant/après

Le moteur d'audit a été rejoué après CP8 (Docker) sur l'ensemble du corpus
(474 fichiers scannés) et le registre étendu à **27 éléments notés** (21 récents).

- **Danger** : **0 signal bloquant** sur les 13 fichiers Docker (10 exercices +
  3 missions) et sur le jour 320 enrichi.
- **Jour 320** (dockerisation) : fondations profondes ajoutées (image/couches/
  cache, CMD vs ENTRYPOINT, multi-stage, durcissement non-root/read-only/network
  none, PID 1/signaux, healthcheck, diagnostic par couches). Limite honnête
  **noyau partagé ≠ isolation OS** explicitée → moyenne 3,50 (dense, charge
  cognitive 3).
- **Exercices Docker** : déterministes, statiques (exécutables **sans daemon**),
  réf verte / starter échoue / tests privés → alignés aux compétences.
- **Missions Docker** : évaluation honnête (auto + structurel + revue humaine),
  aucun pseudo-score.

**Avant/après (dimensions clés)** :

| Dimension | Avant V20 | Après V20 |
|---|---|---|
| Erreurs fréquentes (couverture) | 78/313 journées | **312/313** (CP3, contenu authored surfacé) |
| Modèle mental (j2) | absent | **présent** (CP3) |
| Pratique du terminal | théorie seule | **terminal borné exécutable** (CP4-CP7) |
| Docker | mentionné (j320 projet) | **fondations + 10 exercices + 3 missions + 35 termes** |
| Exécutabilité honnête | — | Docker **désactivé proprement** si daemon absent, jamais de faux succès |
| Moyenne notes récentes | 3,50 | **3,51** (maintenue en ajoutant du contenu) |

**Ce qui nécessite encore une revue humaine** : la qualité SÉMANTIQUE des livrables
documentaires des missions (post-mortems, plans) — validée structurellement, jamais
notée automatiquement. **Reporté** : quiz sur 77 journées de base, exercices Docker
RÉELS (build/run) exécutables uniquement si un daemon est disponible, observation
d'apprenants réels.
