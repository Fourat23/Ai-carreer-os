<!-- keep -->
# Leçon — Transformers : l'architecture derrière les LLM

## 🎯 Objectif
Comprendre le trajet d'une phrase dans un transformer — tokenisation → embeddings → attention → prédiction — au niveau INTUITION SOLIDE (schémas, pas équations). Objectif d'entretien : « explique-moi un transformer » en 3 minutes, avec tes propres mots.

## 🧠 Modèle mental
L'attention, c'est **une salle de réunion où chaque mot écoute tous les autres** et décide à qui prêter attention pour préciser son propre sens. Dans « la souris mange le fromage » vs « la souris ne répond plus », le mot « souris » construit son sens en regardant ses voisins. Le transformer, c'est cette réunion, répétée couche après couche.

## 📖 Explication complète
Le trajet d'une phrase, étape par étape :
1. **Tokenisation** : le texte devient des tokens (sous-mots, ~4 caractères). « anticonstitutionnellement » → plusieurs tokens ; « chat » → un seul.
2. **Embeddings** : chaque token devient un vecteur (son sens initial, hors contexte) + une information de POSITION (l'ordre des mots compte, et le transformer traite tout en parallèle — il faut lui dire qui est où).
3. **L'attention** : chaque token émet une **requête** (« qu'est-ce que je cherche ? »), une **clé** (« voici ce que j'offre ») et une **valeur** (« voici mon contenu »). Les requêtes se comparent aux clés → des poids d'attention → chaque token absorbe un mélange pondéré des valeurs des autres. Résultat : des représentations CONTEXTUELLES (le « souris » informatique ≠ le « souris » animal). Plusieurs **têtes** d'attention capturent des relations différentes (syntaxe, coréférence…) en parallèle.
4. **Les couches** : attention + petit réseau (feed-forward), empilés des dizaines de fois — le sens s'affine couche après couche, du local vers l'abstrait.
5. **La sortie** : pour le dernier token, le modèle produit un score pour CHAQUE token possible du vocabulaire → une distribution de probabilités → on échantillonne (température) → le token suivant. Boucle : générer, ajouter, recommencer.
Pourquoi le transformer a gagné : contrairement aux RNN qui lisaient mot à mot, l'attention traite TOUTE la séquence en parallèle (entraînement massivement accéléré) et relie directement des mots éloignés (dépendances longues).
La limite structurelle : l'attention compare chaque token à chaque autre — coût quadratique en longueur → la fenêtre de contexte est bornée. C'est LA raison d'être du RAG.

## 🔧 Exemple simple
« La banque a refusé mon prêt » vs « La banque du fleuve était boueuse » : le vecteur de « banque » diffère à la sortie, parce que l'attention l'a mélangé à « prêt » dans un cas, à « fleuve » dans l'autre. C'est ÇA, une représentation contextuelle.

## 🧭 Exemple guidé
**Énoncé** : dérouler le trajet de « Le chat dort » jusqu'au token suivant.
**Raisonnement** : suivre les 5 étapes, une par une.
**Solution (trace)** :
```
1. Tokens      : [Le] [chat] [dort]
2. Embeddings  : 3 vecteurs + positions (1,2,3)
3. Attention   : « dort » regarde « chat » (qui dort ?) → son vecteur
                 intègre l'idée « sommeil-d'un-chat »
4. ×N couches  : représentations de plus en plus contextuelles
5. Sortie      : distribution sur le vocabulaire pour le token suivant :
                 « paisiblement » 0.21, « profondément » 0.14, « . » 0.11, …
                 → température 0 : on prend le plus probable.
```
**Explication** : chaque étape est mécanique — aucune « compréhension » magique, une géométrie du contexte. **Variante** : dessine ce trajet À LA MAIN (c'est le livrable du mois 7, et ton support d'entretien).

## 🤖 Exemple appliqué (IA / data / architecture)
Cette leçon explique tes contraintes d'ingénieur : la fenêtre bornée (→ RAG, chunking), le coût par token (l'attention se paie), les embeddings réutilisés seuls pour le retrieval, et l'échantillonnage (température) comme source du non-déterminisme à encadrer. Comprendre le mécanisme = prédire les limites.

## ⚠️ Erreurs fréquentes
- Croire que le modèle « comprend » comme un humain (il géométrise le contexte).
- Confondre embeddings de tokens (dans le modèle) et modèles d'embeddings de phrases (pour le retrieval) — parents, mais usages différents.
- Réciter Q/K/V sans savoir les raconter avec une analogie à soi.
- Ignorer la position (sans elle, « chien mord homme » = « homme mord chien »).

## 🚫 Anti-patterns
- Apprendre les équations par cœur sans l'intuition (l'entretien teste l'intuition).
- Prétendre en entretien qu'on saurait implémenter un transformer si c'est faux — l'intuition solide et honnête vaut mieux.

## ✍️ Mini-exercice
Tokenise 5 phrases (tiktoken) et observe les surprises (mots coupés, accents, espaces). Compte les tokens d'un de tes prompts réels.

## 🔥 Exercice plus difficile
Rédige ta note illustrée « le trajet d'une phrase dans un transformer » avec TES schémas (tokenisation → embeddings+position → attention Q/K/V → couches → distribution), puis explique-la à voix haute en 3 minutes, enregistré.

## ✅ Correction attendue
La logique : 5 étapes mécaniques, l'attention comme mélange pondéré par pertinence, le sens affiné couche après couche, une distribution en sortie. Vérifie : ton analogie de l'attention tient debout face à « et pourquoi trois rôles Q/K/V ? » ; ta note explique POURQUOI la fenêtre est bornée ; tes 3 minutes tiennent sans jargon creux.

## 🎤 Questions d'entretien
- « Explique un transformer en 3 minutes. » → Les 5 étapes, avec l'analogie de l'attention et un exemple de mot ambigu.
- « Que calcule l'attention ? » → Pour chaque token, un mélange pondéré des autres tokens, poids donnés par l'affinité requête/clé — le sens en contexte.
- « Pourquoi la fenêtre de contexte est-elle limitée ? » → Coût quadratique de l'attention en longueur de séquence — d'où le RAG.

## 🧾 À retenir
- Trajet : tokens → embeddings+position → attention (Q/K/V) → couches → distribution.
- L'attention = mélange pondéré par pertinence ; le sens est contextuel et géométrique.
- Fenêtre bornée (attention quadratique) → la raison d'être du RAG.

## 📚 Vocabulaire
**token / tokenisation** · **embedding / position** · **attention / requête-clé-valeur** · **tête d'attention** · **couche / feed-forward** · **logits / distribution** · **température** · **fenêtre de contexte**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je déroule le trajet d'une phrase de tête, avec mes schémas.
- [ ] Mon analogie de l'attention survit aux questions de relance.
- [ ] Je relie chaque limite des LLM (fenêtre, coût, non-déterminisme) au mécanisme.

## 🔗 Liens avec le programme
Mois 7 (jours ~197-210), livrable « note transformer ». Leçons liées : `neural-networks`, `llm-fundamentals`, `embeddings`.
