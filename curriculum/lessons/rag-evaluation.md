<!-- keep -->
# Leçon — Évaluation RAG avancée

## 🎯 Objectif
Construire un harnais d'évaluation RAG complet et l'utiliser pour PILOTER les améliorations : golden set exigeant, métriques par étage (retrieval/génération), juge calibré, ablation, scores versionnés. C'est le différenciateur n°1 d'un profil RAG sur le marché.

## 🧠 Modèle mental
Un RAG sans éval, c'est **naviguer sans instruments** : chaque « amélioration » est un pari. Le harnais transforme le pilotage au feeling en pilotage aux instruments — et chaque étage du pipeline a SON cadran.

## 📖 Explication complète
- **Le golden set exigeant** : 30-50 questions sur TON corpus, avec pour chacune la réponse attendue ET l'identifiant du/des chunks qui la contiennent. Varié par construction : factuelles, synthèse multi-passages, ambiguës, pièges lexicaux (mots partagés/sens différent), et SANS réponse dans le corpus (pour tester le refus). Vivant : chaque échec réel devient un cas.
- **Étage retrieval (programmatique, sans LLM)** : rappel@k (le bon chunk est-il dans le top-k ?), MRR (à quel rang ?). Rapide, fiable, gratuit — la métrique au meilleur rendement du domaine. C'est ici que se diagnostiquent 80 % des échecs.
- **Étage génération (LLM-as-judge calibré)** : fidélité (fondée sur les sources ?), pertinence (répond à la question ?), exactitude (conforme à l'attendu ?). Le juge se CALIBRE : juger à la main 20-30 cas, mesurer l'accord juge/humain, ajuster le prompt de jugement (critères binaires étroits > note sur 10) jusqu'à un accord acceptable. Un juge non calibré produit des chiffres précis et faux.
- **La boucle d'amélioration** : baseline chiffrée → UN changement (chunking, hybride, rerank, prompt) → re-mesure → adopter/rejeter SUR LES CHIFFRES → versionner le score (score ↔ commit ↔ config). L'**ablation** (mesurer chaque étage isolément) révèle la contribution réelle de chaque composant.
- **Le bruit** : ±2 points sur 30 questions peut être du hasard. Relancer, regarder QUELLES questions ont basculé, agrandir le set avant de conclure.

## 🔧 Exemple simple
Rapport en 4 lignes : `rappel@5 = 84 % (26/31, échecs : Q7 Q12 Q19 Q23 Q28) · fidélité 91 % (juge calibré, accord humain 88 %) · refus corrects 5/6 · vs v0.9 : rappel +7 pts (chunking structure)`.

## 🧭 Exemple guidé
**Énoncé** : diagnostiquer « le RAG répond mal à Q12 ».
**Raisonnement** : arbre binaire — retrieval d'abord.
**Solution** :
```
1. Le chunk contenant la réponse de Q12 est-il dans le top-5 ?
   NON → problème retrieval. Creuse : la requête et le chunk partagent-ils
         du vocabulaire (lexical) ? Le sens est-il proche (embedding) ?
         → tester hybride / autre chunking sur CE cas, puis re-mesurer TOUT.
   OUI → problème génération. Le chunk était là mais la réponse le trahit :
         prompt de génération, fidélité, format.
2. Le fix validé sur Q12 est adopté SEULEMENT si le score GLOBAL ne régresse pas.
\```
**Explication** : le cas individuel guide, le golden set décide — jamais l'inverse (sur-adapter à un cas dégrade le reste). **Variante** : fais ce diagnostic sur un vrai échec de ton DocQA.

## 🤖 Exemple appliqué (IA / data / architecture)
Le dashboard qualité de DocSense affiche l'HISTOIRE des scores par version : « chunking structure : rappel +9 · hybride : +6 · rerank : fidélité +4 ». Ce tableau EST ta réponse à « comment sais-tu que ton système marche ? » — la question d'entretien qui trie les candidats RAG.

## ⚠️ Erreurs fréquentes
- Golden set sans cas « sans réponse » (le refus n'est jamais testé).
- Juge non calibré (chiffres précis, faux).
- Changer trois choses puis mesurer (effet indémêlable).
- Conclure sur ±2 points de bruit.
- Sur-adapter au golden set (c'est un échantillon, pas la vérité).

## 🚫 Anti-patterns
- « L'éval, on la fera à la fin » (elle doit piloter dès le début).
- Optimiser rappel@k en montant k à 50 (la génération se noie — les métriques se lisent ensemble).

## ✍️ Mini-exercice
Ajoute à ton golden set 3 questions pièges (lexical trompeur, multi-passages, sans réponse) et mesure ce qu'elles révèlent.

## 🔥 Exercice plus difficile
Calibre ton juge : juge 20 cas à la main, mesure l'accord, améliore le prompt de jugement (critères binaires), re-mesure. Documente l'accord avant/après.

## ✅ Correction attendue
La logique : set exigeant et vivant → étages séparés → juge calibré → un changement à la fois → scores versionnés → prudence face au bruit. Vérifie : ton set contient les 5 types de questions, ton juge a un accord humain mesuré, chaque adoption d'amélioration cite son avant/après.

## 🎤 Questions d'entretien
- « Comment évalues-tu un RAG ? » → Golden set typé, rappel@k programmatique pour le retrieval, juge calibré pour la génération, ablation, versionnement.
- « Comment fais-tu confiance à ton juge LLM ? » → Accord mesuré avec des jugements humains sur un échantillon ; critères binaires étroits.
- « +2 points après ton changement : tu conclus quoi ? » → Rien encore : bruit possible — relancer, regarder quelles questions ont basculé.

## 🧾 À retenir
- Évaluer PAR ÉTAGE : rappel@k d'abord (gratuit, fiable), fidélité ensuite (juge calibré).
- Un changement à la fois, scores versionnés, prudence face au bruit.
- Le golden set est vivant : chaque échec réel devient un cas.

## 📚 Vocabulaire
**golden set** · **rappel@k / MRR** · **fidélité / pertinence / exactitude** · **LLM-as-judge / calibration / accord** · **ablation** · **baseline** · **bruit statistique** · **sur-adaptation**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Mon harnais tourne en une commande et sort un rapport par étage.
- [ ] Mon juge est calibré (accord humain mesuré).
- [ ] Chaque amélioration adoptée a son avant/après versionné.

## 🔗 Liens avec le programme
Mois 9 (jours ~253-266), projet 6, projet final. Leçons liées : `ai-evaluation`, `retrieval-reranking`, `model-evaluation`, `llm-observability`.
