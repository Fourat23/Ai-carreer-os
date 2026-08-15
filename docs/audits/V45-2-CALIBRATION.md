# V45.2 — Test de calibration (re-évaluation à l'aveugle)

> **But** : vérifier que la grille V45.2 est **stable et reproductible**, et
> confronter ses verdicts à ceux de V45.1. On re-lit intégralement **6 leçons**
> parmi les **16** que V45.1 déclarait avoir lues « en profondeur », on rend un
> verdict SANS relire la fiche V45.1 d'abord, puis on compare.
>
> Read-only. Aucune leçon modifiée.

## Protocole

1. Sélection de 6 anchors couvrant tout le spectre de difficulté et de domaine
   (fondations → ML → deep learning → IA appliquée → carrière).
2. Lecture intégrale FRAÎCHE du corps de chaque leçon (fait à CP12, traces dans
   la session : bodies relus ligne à ligne).
3. Verdict académique (A-E) + transfert (T0-T4) rendu à partir de la lecture
   seule, avec ≥2 preuves positives spécifiques.
4. Comparaison au verdict V45.1 correspondant et analyse de la divergence.

## Anchors sélectionnés (6/16)

| Pos | Leçon | Domaine | Niveau |
|----|-------|---------|:---:|
| 001 | terminal-shell-filesystem | Fondations | L1 |
| 004 | algorithmic-thinking | Fondations | L1 |
| 058 | machine-learning-basics | Stats/ML | L2 |
| 062 | neural-networks | Deep Learning | L3 |
| 067 | embeddings | LLM/RAG | L2 |
| 128 | interview-preparation | Carrière | L2 |

---

## 001 — terminal-shell-filesystem

- **Verdict V45.2 (aveugle)** : **A / CERTIFIED**, transfert **T4**.
- **Preuves positives** :
  - Deux objets fondateurs posés d'emblée (« le système de fichiers est un arbre,
    le shell est un interprète ») puis TOUT en découle — modèle mental économe.
  - Analogie chemin absolu/relatif = adresse postale complète vs « deuxième porte
    à gauche », avec la conséquence opérationnelle (`pwd` avant toute commande
    douteuse).
  - Philosophie Unix composable enseignée par un exemple réel :
    `cat log.txt | grep ERROR | wc -l`.
- **Verdict V45.1** : fort / certifié (prose). **Divergence : aucune.**

## 004 — algorithmic-thinking

- **Verdict V45.2 (aveugle)** : **A / CERTIFIED**, transfert **T4**.
- **Preuves positives** :
  - Méthode en 6 étapes explicite (comprendre → exemples → décomposer →
    pseudo-code → coder → vérifier) présentée comme « ton algorithme pour créer
    des algorithmes » — combat frontalement le « mémoriser des solutions ».
  - Big-O construite par l'intuition avec le piège n°1 nommé : `arr.includes(x)`
    dans une boucle = O(n²) invisible.
  - Fenêtre glissante démontrée sur « période de k jours la plus chaude »
    (O(n×k) → O(n)) comme question transférable, pas comme astuce.
- **Verdict V45.1** : fort / certifié. **Divergence : aucune.**

## 058 — machine-learning-basics

- **Verdict V45.2 (aveugle)** : **A / CERTIFIED**, transfert **T3** (contenu
  fort ; pratique ML exécutable partielle en plateforme).
- **Preuves positives** :
  - Renversement conceptuel clair (règles+données→réponses vs données+réponses→
    RÈGLES) + les deux dangers permanents (overfitting, évaluation malhonnête).
  - Protocole d'honnêteté outillé : split AVANT tout, leakage nommé
    (normaliser avant de splitter), baseline « à battre », cross-validation.
  - Choix de métrique par coût métier : dépistage médical → rappel, anti-spam →
    précision ; « l'accuracy ment sur le déséquilibré ».
- **Verdict V45.1** : fort / certifié. **Divergence : nuance de transfert**
  (V45.2 abaisse le transfert à T3 en explicitant la dette de pratique ML, là où
  V45.1 restait au seul niveau prose). Voir analyse ci-dessous.

## 062 — neural-networks

- **Verdict V45.2 (aveugle)** : **A / CERTIFIED**, transfert **T3** (prose
  excellente ; l'entraînement DL n'est pas exécuté en plateforme).
- **Preuves positives** :
  - Modèle mental « machine à régler des boutons » (poids/loss/gradient) tenu de
    bout en bout, avec la justification de la non-linéarité (« sinon empiler des
    couches ne sert à rien »).
  - Boucle PyTorch canonique en 5 gestes AVEC le bug classique nommé : oublier
    `zero_grad()` accumule les gradients.
  - Diagnostic par courbes train/val (overfitting = train baisse, val remonte) +
    pathologies du learning rate (trop grand diverge, trop petit stagne).
- **Verdict V45.1** : fort / certifié. **Divergence : nuance de transfert**
  (même logique : T3 car DL non exécuté in-situ).

## 067 — embeddings

- **Verdict V45.2 (aveugle)** : **A / CERTIFIED**, transfert **T4**.
- **Preuves positives** :
  - Problème d'abord parfait (« comment poser mes congés ? » vs « procédure de
    demande de vacances » — aucun mot commun, même sens) qui MOTIVE la géométrie.
  - Limite d'analogie honnête : « on ne peut pas VISUALISER 384 dimensions ;
    chaque dimension n'a pas de signification lisible ».
  - `cos("chat","félin")` élevé vs `cos("chat","boulon")` faible ; piège
    « similaire ≠ pertinent » → justifie le reranking (continuité chaîne 15).
- **Verdict V45.1** : fort / certifié. **Divergence : aucune.**

## 128 — interview-preparation

- **Verdict V45.2 (aveugle)** : **A / CERTIFIED**, transfert **T4**.
- **Preuves positives** :
  - Préparation traitée comme un SYSTÈME (dossier d'entretien semaine 51,
    simulations enregistrées, post-mortems) — pas de l'improvisation.
  - Réponse d'or à la question inconnue : « Je ne sais pas, voici comment je
    chercherais » + raisonnement à voix haute (bat le bluff).
  - Histoire STAR chiffrée réutilisable (rappel@5 61→84 %, « diagnostiquer par
    étage ») ; checklist « grille ≥ 3,5/5 » sur simulations.
- **Verdict V45.1** : fort / certifié. **Divergence : aucune.**

---

## Tableau de comparaison

| Leçon | V45.1 (prose) | V45.2 académique | V45.2 transfert | Divergence |
|-------|:---:|:---:|:---:|---|
| terminal-shell-filesystem | fort | **A** | T4 | nulle |
| algorithmic-thinking | fort | **A** | T4 | nulle |
| machine-learning-basics | fort | **A** | T3 | transfert abaissé (dette B explicitée) |
| neural-networks | fort | **A** | T3 | transfert abaissé (DL non exécuté) |
| embeddings | fort | **A** | T4 | nulle |
| interview-preparation | fort | **A** | T4 | nulle |

**Concordance du verdict académique (A-E) : 6/6 (100 %).**
**Divergences de transfert : 2/6**, toutes dans le même sens (V45.2 plus
conservateur sur la Barre B pour ML/DL).

## Analyse de la divergence

1. **Sur la note académique (contenu/prose), V45.2 confirme V45.1 à 100 %.**
   Les 6 anchors re-lus à l'aveugle donnent A/CERTIFIED avec des preuves
   positives spécifiques et non recyclées. La grille est **stable** : relire
   sans le verdict antérieur produit le même verdict.

2. **La seule divergence est de TRANSFERT, jamais de qualité**, et elle est
   **voulue** : V45.2 sépare explicitement la **Barre A** (comprendre/raisonner
   — forte partout) de la **Barre B** (produire du code exécutable pour la
   compétence). Pour `machine-learning-basics` et `neural-networks`, le contenu
   reste A, mais le transfert réel est T3 parce que la pratique ML/DL exécutable
   n'est pas outillée en plateforme (pas d'environnement Python/PyTorch garanti,
   entraînement illustré/SIMULÉ). V45.1 ne faisait pas cette distinction (son
   drapeau « practicable » comptait tout exercice lié comme pratique, ce qui
   surévaluait la pratique IA/ML — corrigé par V45.2).

3. **Aucune régression, aucune sur-note détectée** : la re-lecture n'a trouvé ni
   leçon plus faible qu'annoncée, ni preuve fabriquée, ni « bonne apparence »
   prise pour une bonne leçon. Le contrat V45.2 tient sur l'échantillon.

## Conclusion de calibration

- **Grille reproductible** : 6/6 verdicts académiques identiques en aveugle →
  la certification V45.2 n'est pas un artefact de l'ordre de lecture.
- **V45.2 est strictement plus honnête que V45.1** sur un point unique et
  documenté : le transfert, où il refuse de confondre « comprendre » et
  « savoir faire en code exécutable ». Cette divergence renforce la crédibilité
  du corpus plutôt qu'elle ne l'entame — elle nomme une dette réelle (Barre B
  ML/DL/infra) au lieu de la masquer.
- **Décision** : la certification 128/128 A du ledger est **fiable**. Les 7
  MINOR_FIX et la dette B sont consignés (CP14) ; ils n'invalident aucun verdict
  académique.
