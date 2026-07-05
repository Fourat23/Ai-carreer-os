<!-- keep -->
# Leçon — Évaluer un système IA

## Pourquoi c'est important
Un système IA sans évaluation est un pari : tu ne sais ni s'il marche, ni si ta dernière « amélioration » l'a dégradé. L'évaluation est LA compétence la plus rare chez les candidats juniors IA — 90 % des projets RAG de portfolio n'en ont aucune. Tes chiffres avant/après seront ton différenciateur n°1 en entretien, et le harnais d'évaluation est ce qui transforme le bricolage en ingénierie : on n'améliore que ce qu'on mesure.

## Explication complète

### Le problème : la sortie est ouverte
Un test classique vérifie une égalité (`assert total === 42`). Mais « la réponse du RAG est-elle bonne ? » n'a pas UNE bonne réponse : la sortie est du texte libre, variable, nuancé. L'évaluation IA invente donc d'autres juges — programmatiques quand c'est possible, des modèles quand il le faut, des humains pour calibrer le tout.

### Le golden set : ton jeu d'examen
Un **golden set** = des questions + réponses attendues (ou critères d'acceptation), construits À LA MAIN sur TON corpus. Sa qualité fait celle de toute l'évaluation :
- **Varié** : questions factuelles, de synthèse (multi-passages), ambiguës, et — crucial — SANS réponse dans le corpus (pour tester le refus).
- **Représentatif** des vraies questions des utilisateurs (c'est un ÉCHANTILLON — les biais d'échantillonnage de la leçon de stats s'appliquent).
- **Vivant** : chaque échec réel rencontré devient un nouveau cas.
30 à 50 questions suffisent pour piloter un projet solo.

### Évaluer par étage (le principe le plus important)
Un pipeline s'évalue ÉTAGE PAR ÉTAGE, sinon on ne sait pas quoi corriger :
- **Le retrieval, seul, programmatiquement** : pour chaque question du golden set, on sait quel(s) chunk(s) contiennent la réponse → « est-il dans le top-k ? » = **rappel@k**, sans aucun LLM juge, rapide et fiable. C'est la métrique la plus rentable de tout le domaine.
- **La génération, ensuite** : la réponse est-elle **fidèle** (fondée sur les sources fournies — l'anti-hallucination), **pertinente** (répond-elle à la question ?), **exacte** (conforme à la référence) ? Trois dimensions DISTINCTES : une réponse peut être fidèle mais hors sujet, pertinente mais inventée.

### LLM-as-judge : puissant et piégeux
Pour juger du texte libre à l'échelle, on utilise... un LLM, avec un prompt de jugement strict (critère précis, échelle définie, justification exigée, format contraint). Ses **biais documentés** : position (préfère la première réponse comparée), verbosité (préfère les longues), auto-préférence (préfère son propre style). Les parades : critères étroits et binaires plutôt que « note sur 10 », randomiser les ordres, et surtout **CALIBRER : évaluer l'évaluateur** — juger à la main un échantillon (20-30 cas), mesurer l'accord juge/humain, et ne faire confiance au juge que là où il concorde. Un juge non calibré produit des chiffres précis et faux.

### La boucle d'amélioration pilotée
Le rituel qui rend tout le reste utile : (1) BASELINE chiffrée ; (2) UN changement à la fois (chunking, hybride, reranking...) ; (3) re-mesure ; (4) garder ou rejeter SUR LES CHIFFRES ; (5) versionner les scores (ce score ↔ cette version du code). C'est le journal d'expériences du ML (mois 6), appliqué aux systèmes LLM. Attention au bruit : +2 % sur 30 questions peut être du hasard — re-lance, regarde QUELLES questions ont changé.

## Concepts clés
Golden set (varié, représentatif, vivant) · évaluation par étage · rappel@k / précision@k · fidélité / pertinence / exactitude · LLM-as-judge, biais (position, verbosité, auto-préférence) · calibration juge/humain · baseline · ablation (mesurer chaque étage) · versionnement des scores · tests adverses (les cas hostiles DANS le harnais).

## Exemple
Ton harnais en une commande :
```
$ npm run eval
Retrieval  : rappel@5 = 82 % (25/30 — échecs : Q7, Q12, Q19, Q23, Q28)
Fidélité   : 90 % (juge calibré : accord humain 87 % sur 20 cas)
Refus      : 4/5 questions hors corpus correctement refusées
vs baseline (v0.3) : rappel +9 pts (chunking par structure), fidélité stable
```
Quatre lignes qui changent tout : tu sais OÙ ça pèche (les 5 questions d'échec sont tes prochaines investigations), tu sais si la dernière modif a payé, et tu as des chiffres pour l'entretien.

## Pièges classiques
- Évaluer « au feeling » sur 3 questions mémorisées : tu optimises ton biais.
- Un golden set sans questions « sans réponse » : le refus n'est jamais testé, l'hallucination passe.
- Faire confiance au juge LLM sans calibration humaine.
- Changer trois choses puis mesurer : l'effet est indémêlable.
- Optimiser UNE métrique en aveugle : le rappel@k monte si k=50... et la génération se noie. Les métriques se lisent ENSEMBLE.

## Lien avec l'IA / le futur
C'est le transfert direct du ML (mois 6) : golden set = jeu de test, fidélité = métrique choisie selon le coût d'erreur, biais du juge = biais de mesure, ablation = expériences contrôlées. Le dashboard qualité de DocSense (mois 11-12) affichera l'HISTOIRE de ces scores — la pièce que tu montreras en entretien. Et « comment sais-tu que ton système marche ? » est LA question qui sépare l'ingénieur du prompteur : ta réponse tiendra en quatre lignes de rapport.

## Mini-exercice
Construis un golden set de 10 questions sur un mini-corpus (3 documents) : 5 factuelles, 2 de synthèse, 1 ambiguë, 2 sans réponse. Pour chacune, note le chunk qui contient la réponse. Écris le script qui mesure le rappel@3 de ton retrieval. Tu as un harnais minimal — le reste n'est que de l'extension.

## Vocabulaire à retenir
**golden set** · **rappel@k** · **fidélité (groundedness)** · **pertinence** · **LLM-as-judge** · **calibration** · **biais de position / verbosité** · **baseline** · **ablation** · **régression de qualité** · **éval smoke** (version rapide en CI).

## Résumé
Évaluer un système IA = un golden set varié (avec des cas sans réponse), une évaluation PAR ÉTAGE (retrieval programmatique d'abord — rappel@k ; génération ensuite — fidélité/pertinence via un juge CALIBRÉ sur l'humain), et une boucle d'amélioration pilotée : baseline, un changement, re-mesure, décision sur les chiffres, scores versionnés. C'est ce qui transforme « ça a l'air de marcher » en ingénierie — et un candidat en recrue évidente.
