# DIAGNOSTIC M2 — Audit manuel du mois 7 (jours 183-210)

> **Fichier de diagnostic ajouté** (chantier M2). Ne remplace aucun rapport historique
> (`AUDIT_PEDAGOGIQUE_365.md`, `audit-pedagogique-365.json` restent la référence).
> Aucune modification pédagogique n'a été appliquée au moment de la rédaction, à l'exception
> d'un brouillon non commité sur le jour 183 (voir §6), conservé et en attente de décision.

## 1. Récupération Git (vérifiée depuis le dépôt)

| Élément | Valeur |
|---|---|
| HEAD | `afb0699` (conforme à l'attendu) |
| Branche | `claude/ai-career-os-saas-phfg49` |
| Sync origin | 0 ahead / 0 behind |
| Working tree | 1 seul fichier modifié non commité : `scripts/data/days-enrich-181-196.mjs` (+2 lignes, jour 183 uniquement) |
| Origine du diff | Travail M2 partiel entamé avant la coupure de session (brouillon `simple`/`improved` sur le jour 183). **Préservé, non commité, non validé.** |
| Commits A/B | `b841946`→`25f5b5d` (A), `930a37a`→`afb0699` (B) présents et intacts |
| Anomalies audit dans 183-210 | **0** (sur 34 anomalies totales, aucune dans le périmètre M2) |

## 2. Périmètre M2 recalculé (depuis `data/program.json` + sources)

- **Mois 7 = jours 183-210**, 28 jours.
- **4 revues** : 189, 196, 203, 210 — enrichies au chantier A, **hors périmètre** (non réécrites sans anomalie démontrée). Vérifié : aucune anomalie.
- **24 journées d'apprentissage** : 183-188, 190-195 (DL), 197-202, 204-209 (LLM).
- **Split compétence confirmé** (champ `skill` de program.json) : `dl` sur 183-195, LLM sur 197-209.

## 3. Métriques recalculées (mots, mesurés depuis les sources)

| Tranche | Théorie (mots) | Correction (mots) |
|---|---|---|
| DL 183-195 (hors 183 brouillon) | 145-198 | **119-144** |
| LLM 197-209 | **191-245** | **151-208** |

**Rupture confirmée** mais **modérée** : la correction DL est la plus légère du curriculum (~130 mots médians) ; la partie LLM est nettement plus dense. Le jour 183 affiche 362 mots de correction **uniquement à cause du brouillon non commité**.

## 4. Vérité technique — verdict sur la loss/gradient (jours 183-184)

**Point soulevé** : la loss est affichée comme un carré `((pred - y)**2).mean()` (jour 184), mais la règle de mise à jour utilise `X.T @ (pred - y)` sans facteur `σ'(z)`.

**Vérification numérique** (Python, poids fixes `w=[0.5,-0.3], b=0.1`) :

| Gradient | dL/dw₀ |
|---|---|
| Règle utilisée dans le code | **0.055025** |
| Vrai gradient **BCE + sigmoïde** (dL/dz = pred − y) | **0.055025** → **identique** |
| Vrai gradient **MSE + sigmoïde** (facteur `pred·(1−pred)`) | 0.021842 → **différent** |

**Verdict** : la règle `pred - y` est **exactement** le gradient de l'entropie croisée binaire par rapport au logit `z` (le facteur sigmoïde s'annule analytiquement). Ce n'est **pas** le gradient de la MSE (qui porterait `pred·(1−pred)`).

- **Le code entraîne correctement** un classifieur BCE+sigmoïde : aucune erreur de calcul.
- **L'incohérence est un problème d'ÉTIQUETAGE** : le jour 184 affiche une quantité *MSE-like* comme « la loss » alors que la règle optimise la **BCE**. La grandeur affichée n'est pas la loss réellement minimisée.
- **Correction recommandée : CLARIFICATION** (une phrase dans la correction), **pas** de changement de code. Le code est juste ; c'est l'étiquette « loss » qui doit être précisée.

## 5. Tableau de diagnostic — 24 journées d'apprentissage

Lecture intégrale (théorie, modèle mental, exemple guidé, exercice, cas métier, entretien, correction). Notes argumentées.

| J | Titre | Comp. | Théo. | Corr. | Guidé | Exo | Cas | Tech | /10 | Classe | Modif ? |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 183 | Le neurone en NumPy | DL | 145 | 130* | Excellent (AND) | Clair | Bon | ✓ étiquette loss | 8 | À consolider | **OUI** (clarif. loss) |
| 184 | Descente de gradient | DL | 155 | 135 | Excellent (LR, seed) | Clair | Bon | ✓ étiquette loss | 7.5 | À consolider | **OUI** (clarif. loss) |
| 185 | PyTorch / autograd | DL | 154 | 141 | Excellent (grad manuel vérifié) | Clair | Bon | ✓ | 8 | Solide | non |
| 186 | MLP (XOR) | DL | 152 | 144 | Excellent (ablation) | Clair | Bon | ✓ | 8.5 | Solide | non |
| 187 | Entraînement MNIST | DL | 161 | 119 | Solide (boucle complète) | Clair | Bon | ✓ | 8 | Solide | non |
| 188 | Régularisation | DL | 154 | 127 | Solide (4 runs) | Clair | Bon | ✓ | 8 | Solide | non |
| 190 | Tokenisation | LLM/NLP | 171 | 119 | Solide (tiktoken) | Clair | Bon | ✓ | 8 | Solide | non |
| 191 | Embeddings | LLM/NLP | 181 | 139 | Solide (cosinus main) | Clair | Bon | ✓ | 8 | Solide | non |
| 192 | Attention | LLM/NLP | 198 | 136 | Excellent (calcul 3 tokens) | Clair | Bon | ✓ | 9 | Solide | non |
| 193 | Transformer | LLM/NLP | 187 | 140 | Excellent (schéma trajet) | Clair | Bon | ✓ | 8.5 | Solide | non |
| 194 | Classification texte | LLM/NLP | 177 | 129 | Solide (embeddings+logreg) | Clair | Bon | ✓ | 8 | Solide | non |
| 195 | Note « LLM expliqué » | LLM/NLP | 170 | 143 | Solide (plan) | Clair | Bon | ✓ | 8 | Solide (jour rédaction) | non |
| 197 | Fonctionnement LLM | LLM | 240 | 208 | Solide (3 expériences) | Clair | Bon | ✓ | 8.5 | Solide | non |
| 198 | Appeler une API | LLM | 213 | 151 | Solide (script propre) | Clair | Bon | ✓ | 8.5 | Solide | non |
| 199 | Température | LLM | 191 | 186 | Excellent (30 runs) | Clair | Bon | ✓ | 9 | Solide | non |
| 200 | Tokens & coûts | LLM | 232 | 156 | Excellent (calcul chiffré) | Clair | Bon | ✓ | 9 | Solide | non |
| 201 | Hallucinations | LLM | 241 | 197 | Excellent (3 cas + grounding) | Clair | Bon (cas 2023) | ✓ | 9 | Solide | non |
| 202 | Banc d'essai | LLM | 206 | 198 | Solide (10×2) | Clair | Bon | ✓ | 8.5 | Solide | non |
| 204 | Prompt engineering | LLM | 225 | 186 | Excellent (v0→v4) | Clair | Bon | ✓ | 9 | Solide | non |
| 205 | Structured outputs | LLM | 245 | 200 | Excellent (contrat/retry) | Clair | Bon | ✓ | 9 | Solide | non |
| 206 | Few-shot / patterns | LLM | 215 | 190 | Excellent (0-shot vs few) | Clair | Bon | ✓ | 9 | Solide | non |
| 207 | Function calling | LLM | 235 | 207 | Excellent (boucle, sécurité) | Clair | Bon | ✓ | 9 | Solide | non |
| 208 | Intégration app | LLM | 218 | 182 | Excellent (dégradation) | Clair | Bon | ✓ | 9 | Solide | non |
| 209 | Consolidation LLM | LLM | 199 | 181 | Solide (5 propriétés) | Clair | Bon | ✓ | 8.5 | Solide | non |

\* Jour 183 : 130 mots = correction hors brouillon non commité. Avec le brouillon actuel : 362.

## 6. Synthèse et décisions

### Journées SOLIDES (à ne pas modifier) — 22 sur 24
185, 186, 187, 188, 190, 191, 192, 193, 194, 195 (DL) + **toute la tranche LLM 197-209**.
Modèles mentaux distincts et justes, exemples guidés exécutables, cas métier spécifiques, corrections fonctionnelles, exactitude technique vérifiée. La partie LLM est la plus riche du mois.

### Journées À CONSOLIDER — 2 sur 24
**183 et 184**, et **uniquement** pour la **clarification technique loss/gradient** (§4). Le reste de ces deux jours est solide.

### Journées INSUFFISANTES — 0
Aucune. La légèreté des corrections DL est **relative** (elles sont compactes car **code-centrées** : l'exemple guidé porte l'enseignement), pas une insuffisance pédagogique. L'audit automatique ne signale rien.

### Erreurs techniques confirmées — 1
Étiquetage loss/gradient (183/184) : grandeur affichée *MSE-like* vs loss réellement optimisée (BCE). **Clarification**, pas correction de code.

### Constats provisoires INVALIDÉS
1. **« Objectifs trop courts »** → invalidé comme défaut M2 : les objectifs font 4-6 mots dans **toute** la tranche, DL **comme** LLM, et à l'échelle du curriculum (moyenne ~3,9 mots sur les jours planifiés). Style délibéré, présent même dans les jours SOLIDES. Modifier romprait la cohérence.
2. **« Théorie trop brève »** → nuancé : la théorie DL (145-198 mots) est plus courte que la LLM (191-245) mais **dense** et adossée à des exemples guidés excellents. Écart réel mais **mineur** ; ne justifie pas une réécriture (la longueur n'est pas un critère suffisant).
3. **« Ajouter `simple`/`improved` aux corrections DL »** (piste du brouillon 183) → **invalidé** : ces champs n'existent QUE dans les jours 1-90 (52 jours, palier « deep »). **Zéro** jour sur 91-365 n'en a — y compris les jours LLM 197-209, incontestablement solides. Les ajouter aux jours DL romprait la cohérence avec tout le reste des mois 4-12 et avec la tranche LLM voisine. **Le standard de référence pour M2 est le format des jours LLM** (logic + pitfalls + checks + oral).

### Sort du brouillon non commité (jour 183) — RÉSOLU
Le brouillon ajoutait `simple` + `improved` **et** la clarification technique. **Décision validée : conserver la clarification, retirer les champs `simple`/`improved`** pour rester au format des jours 91-365. Fait : la clarification est repliée dans `logic` + un `pitfall` du jour 183, format inchangé.

## 7. Périmètre de modification PROPOSÉ (minimal)

- **Fichier** : `scripts/data/days-enrich-181-196.mjs` uniquement.
- **Jours** : **183 et 184** seulement.
- **Nature** : clarification technique loss/gradient, **intégrée au format de correction existant** (dans `logic` et/ou un `pitfall`), **sans** nouveaux champs `simple`/`improved`.
- **Non touché** : théorie, exemples guidés, exercices, cas, entretiens, objectifs, les 22 jours solides, les 4 revues, le générateur, program.json, l'interface, les leçons.
- **Sous-batchs** : 1 seul sous-batch de 2 jours (183-184). Pipeline complet ensuite (generate/check/depth/test/build/scan).

## 8. Sources techniques
- Vérification loss/gradient : dérivation analytique + contrôle numérique (identité `dL_BCE/dz = pred − y`, principe stable, indépendant du fournisseur).
- Tokeniseur `tiktoken`/`cl100k_base` (jour 190) : encodeur réel, principe stable ; aucune affirmation de tarif/limite figée à corriger.
- Aucune affirmation dépendante d'une version/fournisseur volatile détectée dans la tranche (les jours restent au niveau des principes : coûts en ordres de grandeur, pas de tarifs figés).

## 9. Remédiation appliquée (après validation « minimal + théorie DL »)

Périmètre validé : clarification technique 183/184 **+** approfondissement léger de la théorie sur les jours DL vraiment denses, contenu réel uniquement, sans remplissage.

| Jour | Fichier | Changement |
|---|---|---|
| 183 | `days-enrich-181-196.mjs` (solution) | Clarification loss/gradient (BCE ≠ MSE) repliée dans `logic` + un `pitfall`. `simple`/`improved` du brouillon **retirés** (cohérence 91-365). Théorie/guidé/exercice/cas **inchangés**. |
| 184 | `days-enrich-181-196.mjs` (theory + solution) | Théorie : approfondissement réel de la **backpropagation** (dérivation en chaîne, réutilisation des valeurs de la passe avant, coût ≈ une passe avant) + clarification loss affichée vs loss optimisée. Correction : `pitfall` sur l'étiquette de la loss. |
| 187 | `days-enrich-181-196.mjs` (theory) | Théorie : anatomie réelle d'un pas d'entraînement (batch → forward → backward → step → zero_grad) + justification du batching (mémoire / qualité du gradient) et du `shuffle`. |

**Non modifié** : 22 jours solides, 4 revues, objectifs, exercices, cas métier, entretiens, leçons, générateur, program.json, interface.

**Pipeline vérifié** : `generate` (795 fichiers), `curriculum-check` (365/365), `depth-check` (OK), `npm test` (43/43), `npm run build` (OK), scan glyphes (propre), `program.json` restauré (diff timestamp seul). Portée Git limitée à 183/184/187 (md + solutions) + la source `.mjs` + ce diagnostic.

**Métriques après** : jour 184 théorie 155 → ~245 mots ; jour 187 théorie 161 → ~250 mots ; correction 183/184 enrichies de la précision technique. Aucun jour LLM touché.
