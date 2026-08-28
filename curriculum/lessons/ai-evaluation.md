<!-- keep -->
# Leçon — Évaluer un système IA

## 🌍 Le problème d'abord
Tu as construit un système RAG. Il « a l'air de marcher » sur les deux ou trois questions que
tu lui poses. Puis tu changes le découpage des documents pour l'améliorer… et tu n'as AUCUNE
idée si tu l'as rendu meilleur ou pire. Avec du code classique, un test vérifie une égalité
(`total === 42`). Mais « la réponse de l'IA est-elle bonne ? » n'a pas UNE seule bonne réponse :
c'est du texte libre, nuancé. Comment mesurer objectivement la qualité d'un système dont la
sortie est ouverte, pour améliorer sur des CHIFFRES et non au feeling ? C'est tout l'enjeu de
l'**évaluation**. Cette leçon te donne le harnais qui transforme le bricolage en ingénierie —
et le différenciateur n°1 en entretien IA.

## 🎯 Objectif
Savoir construire un **golden set**, **évaluer par étage** (retrieval programmatique d'abord —
rappel@k ; génération ensuite — fidélité/pertinence), utiliser un **LLM-as-judge calibré**, et
piloter une **boucle d'amélioration** sur les chiffres (baseline → un changement → re-mesure →
décision).

## 🧩 Prérequis
Tu dois avoir les réflexes d'évaluation ML — jeu de test, métriques choisies selon le coût des
erreurs, précision/rappel (`/doc/lessons/model-evaluation`, `/doc/lessons/machine-learning-basics`)
— et comprendre le pipeline RAG dont on évalue chaque étage (`/doc/lessons/rag-fundamentals`).
Les réflexes statistiques (échantillon représentatif, bruit vs signal,
`/doc/lessons/statistics-for-ml`) sont réutilisés. Aucun outil d'évaluation particulier n'est
supposé.

## 🧠 Modèle mental
Évaluer un système IA, c'est lui faire passer un EXAMEN dont tu as le corrigé. Deux idées
portent tout : (1) un **golden set** (des questions + ce qu'une bonne réponse doit contenir),
construit à la main sur TON corpus, qui est ton examen ; (2) l'**évaluation par étage** — on ne
note pas « le système » en bloc, on note séparément le RETRIEVAL (a-t-on retrouvé le bon
passage ? mesurable sans LLM) puis la GÉNÉRATION (la réponse est-elle fidèle et pertinente ?),
car corriger exige de savoir QUEL étage a failli.

## 💡 Pourquoi c'est important
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

## 🧭 Exemple guidé
Ton harnais en une commande :
```
$ npm run eval
Retrieval  : rappel@5 = 82 % (25/30 — échecs : Q7, Q12, Q19, Q23, Q28)
Fidélité   : 90 % (juge calibré : accord humain 87 % sur 20 cas)
Refus      : 4/5 questions hors corpus correctement refusées
vs baseline (v0.3) : rappel +9 pts (chunking par structure), fidélité stable
```
Quatre lignes qui changent tout : tu sais OÙ ça pèche (les 5 questions d'échec sont tes prochaines investigations), tu sais si la dernière modif a payé, et tu as des chiffres pour l'entretien.

## ⚠️ Erreurs fréquentes
- Évaluer « au feeling » sur 3 questions mémorisées : tu optimises ton biais.
- Un golden set sans questions « sans réponse » : le refus n'est jamais testé, l'hallucination passe.
- Faire confiance au juge LLM sans calibration humaine.
- Changer trois choses puis mesurer : l'effet est indémêlable.
- Optimiser UNE métrique en aveugle : le rappel@k monte si k=50... et la génération se noie. Les métriques se lisent ENSEMBLE.

## 🔗 Liens avec le programme
C'est le transfert direct du ML (mois 6) : golden set = jeu de test, fidélité = métrique choisie selon le coût d'erreur, biais du juge = biais de mesure, ablation = expériences contrôlées. Le dashboard qualité de DocSense (mois 11-12) affichera l'HISTOIRE de ces scores — la pièce que tu montreras en entretien. Et « comment sais-tu que ton système marche ? » est LA question qui sépare l'ingénieur du prompteur : ta réponse tiendra en quatre lignes de rapport.

## Mini-exercice
Construis un golden set de 10 questions sur un mini-corpus (3 documents) : 5 factuelles, 2 de synthèse, 1 ambiguë, 2 sans réponse. Pour chacune, note le chunk qui contient la réponse. Écris le script qui mesure le rappel@3 de ton retrieval. Tu as un harnais minimal — le reste n'est que de l'extension.

## ✅ Correction attendue
**La démarche** : les 10 questions d'abord, le script ensuite. Et la composition demandée n'est pas arbitraire — 5 factuelles pour mesurer le cas normal, 2 de synthèse parce qu'elles exigent PLUSIEURS chunks et cassent les retrievals qui n'en ramènent qu'un bon, 1 ambiguë pour voir si le système demande une précision ou devine, **2 sans réponse parce que c'est le seul moyen de tester le refus**.

Le rappel@3 se mesure sans aucun LLM : pour chaque question, le chunk noté comme contenant la réponse est-il dans les trois retournés ? Un booléen, une moyenne. C'est délibérément la métrique la plus simple du harnais, et c'est celle qui explique 80 % des échecs.

**L'erreur probable, et elle vide le golden set de sa valeur.** On écrit les 10 questions **en lisant les documents**. Elles reprennent alors les mots exacts du corpus — « quelle est la durée du préavis de démission ? » quand le document dit « le préavis de démission est de deux mois ». Le retrieval affiche un rappel proche de 100 %, et l'on croit son système excellent.

Un vrai utilisateur écrira « si je pars, je dois rester combien de temps ? ». Aucun mot commun, et c'est précisément ce que le retrieval sémantique est censé résoudre — mais on ne l'a jamais testé. Le piège séduit parce qu'écrire des questions en lisant la source est mille fois plus rapide, et parce que le résultat est flatteur. La parade : formuler la question **avant** de vérifier où est la réponse, ou mieux, la faire écrire par quelqu'un qui n'a pas lu les documents.

**Alternative défendable** aux 10 questions écrites à la main : générer des questions avec un LLM à partir du corpus. Beaucoup plus rapide, et acceptable pour obtenir du volume — mais un LLM génère des questions calquées sur la formulation source, ce qui reproduit exactement le biais ci-dessus, en pire. Utilisable comme complément après avoir écrit à la main un noyau de questions réalistes ; jamais comme fondation.

**Vérifie seul, sans corrigé** :
1. Combien de tes 10 questions partagent trois mots consécutifs avec le document qui les contient ? Si c'est la majorité, ton golden set mesure une recherche par mots-clés déguisée.
2. Tes 2 questions sans réponse déclenchent-elles un refus, ou une réponse inventée ? C'est le test le plus rentable du harnais et le plus souvent absent.
3. Change **une seule** chose — la taille des chunks — et relance. Un seul chiffre doit bouger de façon explicable. Si trois bougent, tu ne sauras rien attribuer.
4. Ton script rend-il la LISTE des questions échouées, ou seulement un pourcentage ? Sans la liste, l'évaluation note mais n'enseigne rien.

## 🏢 Cas professionnel
Une équipe pilote son assistant sur un score de fidélité produit par un LLM juge. Au fil des semaines, le score monte de 0,78 à 0,91, et l'équipe communique sur l'amélioration. Une revue humaine sur trente réponses conclut pourtant que la qualité perçue n'a pas bougé.

L'enquête montre que les modifications successives ont surtout **raccourci et prudencié** les réponses. Or les juges LLM sont connus pour deux biais que le vocabulaire de cette leçon nomme : ils favorisent les réponses longues et bien structurées, et ils notent mieux ce qui ressemble à ce qu'ils auraient écrit. En optimisant le score du juge, l'équipe avait optimisé le juge, pas le produit.

C'est la loi de Goodhart, et elle s'applique brutalement aux systèmes IA : **une mesure qui devient un objectif cesse d'être une bonne mesure.** Trois pratiques la contiennent. Calibrer le juge en mesurant son accord avec des jugements humains sur un échantillon, et republier cet accord chaque fois que le juge change. Garder quelques métriques **non jugées par un LLM** — le rappel@k en est une, purement mécanique. Et relire périodiquement des réponses à la main : rien ne remplace vingt minutes de lecture pour découvrir que le système est devenu évasif.

## 🎤 Questions d'entretien
- « Comment évalues-tu un système RAG ? » → Séparément : rappel@k pour le retrieval, sans LLM ; fidélité et pertinence pour la génération. Sur un golden set qui contient des questions sans réponse.
- « Peut-on faire confiance à un LLM juge ? » → Seulement calibré : on mesure son accord avec l'humain sur un échantillon, et on connaît ses biais de verbosité et de position.
- « Tu as changé trois choses et le score a monté. Qu'as-tu appris ? » → Rien d'attribuable. Une modification à la fois, ou une ablation pour démêler.
- « Pourquoi des questions sans réponse dans un golden set ? » → Parce que c'est la seule façon de tester le refus, et que sans refus le système hallucine dès que le corpus est muet.
- « Le rappel@k monte quand k augmente. Est-ce une amélioration ? » → Non : on noie la génération sous du contexte. Les métriques se lisent ensemble, jamais isolément.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Mon golden set contient des questions sans réponse et des reformulations qui n'empruntent pas les mots de la source.
- [ ] Je change une chose à la fois et je sais attribuer chaque variation.
- [ ] Je calibre mes juges LLM contre un jugement humain, et je connais leurs biais.
- [ ] Mon harnais rend la liste des échecs, pas seulement une moyenne.

## 📚 Vocabulaire
**golden set** · **rappel@k** · **fidélité (groundedness)** · **pertinence** · **LLM-as-judge** · **calibration** · **biais de position / verbosité** · **baseline** · **ablation** · **régression de qualité** · **éval smoke** (version rapide en CI).

## 🧾 À retenir
Évaluer un système IA = un golden set varié (avec des cas sans réponse), une évaluation PAR ÉTAGE (retrieval programmatique d'abord — rappel@k ; génération ensuite — fidélité/pertinence via un juge CALIBRÉ sur l'humain), et une boucle d'amélioration pilotée : baseline, un changement, re-mesure, décision sur les chiffres, scores versionnés. C'est ce qui transforme « ça a l'air de marcher » en ingénierie — et un candidat en recrue évidente.
