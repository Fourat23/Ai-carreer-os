<!-- keep -->
# Leçon — Coûts d'inférence : estimer et optimiser

## 🌍 Le problème d'abord
Ton prototype d'assistant IA marche à merveille sur ton écran. Tu le mets en ligne, quelques
centaines d'utilisateurs l'essaient… et à la fin du mois, la facture te fait tomber de ta
chaise. Ce qui semblait « gratuit » en démo se paie, à chaque appel, dans les deux sens :
chaque mot envoyé au modèle ET chaque mot qu'il répond coûte. Un RAG qui injecte trois pages
de contexte à chaque question peut coûter cent fois plus qu'une simple question. Le vrai
enjeu n'est pas « comment payer moins » en aveugle, mais savoir ESTIMER le coût AVANT de
lancer, comprendre OÙ partent les tokens, et arbitrer sciemment entre qualité, coût et
latence. Cette leçon te donne cette compétence d'ingénieur que peu de juniors possèdent.

## 🎯 Objectif
Savoir ESTIMER le coût d'un système LLM avant de le lancer, identifier où partent les tokens, et appliquer les leviers d'optimisation (contexte, cache, modèle, batch). La maîtrise des coûts est une compétence d'ingénieur que peu de juniors ont — et une question d'entretien de plus en plus fréquente.

## 🧠 Modèle mental
Un appel LLM, c'est **un compteur de taxi : tu paies au token, dans les deux sens** (entrée ET sortie). L'entrée domine presque toujours dans un RAG (le contexte injecté est gros). Optimiser les coûts = raccourcir les trajets, pas supprimer les courses.

## 🧩 Prérequis
Tu dois savoir ce qu'est un LLM, un token et la fenêtre de contexte
(`/doc/lessons/llm-fundamentals`), et comment un RAG injecte du contexte récupéré dans le
prompt — la principale source de tokens d'entrée (`/doc/lessons/rag-fundamentals`). Des bases
d'arithmétique suffisent : le coût est une multiplication (tokens × prix) sommée sur les
appels. Aucun fournisseur particulier n'est supposé ; les prix sont des paramètres.

## 📖 Explication complète
- **La formule** : coût = tokens_entrée × prix_entrée + tokens_sortie × prix_sortie, sommé sur les appels. Les prix (par million de tokens) varient fortement selon le modèle — et la sortie coûte typiquement plus cher que l'entrée.
- **Estimer AVANT** : nb requêtes/jour × tokens moyens par requête × prix. Un ordre de grandeur en 5 lignes évite la facture surprise. Compter les tokens réels (tiktoken/API usage) sur un échantillon, pas au doigt mouillé.
- **Les leviers, par ordre de rendement habituel** :
  1. **Réduire le contexte** : meilleur retrieval → moins de chunks injectés (5 pertinents > 20 moyens). C'est le levier n°1 d'un RAG.
  2. **Cacher** : mêmes questions → mêmes réponses ; cache applicatif (hash du prompt) + prompt caching côté fournisseur pour les préfixes stables (system prompt, exemples).
  3. **Adapter le modèle à la tâche** : un petit modèle pour classifier/router, le gros pour générer. Le routage par difficulté économise sans perte visible.
  4. **Contraindre la sortie** : formats courts, max_tokens borné.
  5. **Batch / asynchrone** : regrouper les traitements non urgents (tarifs réduits).
- **Le garde-fou** : un budget/jour avec alerte (ou coupure). Une boucle d'agent buguée à 0,02 €/appel peut coûter une fortune en une nuit.

## 🔧 Exemple simple
500 questions/jour × (4000 tokens in + 300 out). Entrée : 2 M tokens/jour. À ~3 $/M in et ~15 $/M out : ~6 $ + ~2,25 $ ≈ **8 $/jour**, ~250 $/mois. Cinq lignes, zéro surprise.

## 🧭 Exemple guidé
Un assistant de support répond à **40 000 requêtes par mois**. Combien coûte-t-il ?

La question n'a pas une réponse, elle en a douze — et l'écart entre la plus haute et la plus
basse est d'un **facteur 196**. C'est ce que ce calcul montre, et c'est pourquoi « optimiser le
coût d'un LLM » n'est pas un réglage mais une décision de conception.

> Les montants sont **calculés** par `scripts/v70-verifications/llm-cout-et-vecteurs.py` à
> partir de tarifs **illustratifs et déclarés**. Les prix changent sans cesse et diffèrent
> selon les fournisseurs : ce qui s'apprend ici est la **structure** du calcul et les rapports
> entre les postes, jamais un prix.

Tarifs retenus, en euros par million de jetons :

| Modèle | Entrée | Sortie |
|---|---:|---:|
| A (grand) | 3,00 | 15,00 |
| B (moyen) | 0,30 | 1,20 |
| C (petit) | 0,05 | 0,40 |

### Le tableau

| Scénario | Jetons entrée | sortie | Modèle A | Modèle B | Modèle C |
|---|---:|---:|---:|---:|---:|
| sans RAG, historique complet | 6 000 | 300 | **900 €** | 86 € | 17 € |
| avec RAG, top-5 morceaux | 2 200 | 300 | 444 € | 41 € | 9 € |
| top-3 + résumé d'historique | 1 100 | 300 | 312 € | 28 € | 7 € |
| top-3 + réponses plus courtes | 1 100 | 150 | 222 € | 20 € | **5 €** |

Neuf cents euros par mois contre cinq. Même produit, même nombre de requêtes.

### Les trois leviers, par ordre d'efficacité

**1. Le choix du modèle : facteur 60 à lui seul.** Passer de A à C divise la facture par
environ 60, sur n'importe quelle ligne du tableau. Aucune autre optimisation n'approche ce
rapport.

C'est aussi le levier le plus mal utilisé, parce qu'il est traité comme une décision unique —
« on prend le meilleur modèle » — alors que c'est une décision **par tâche**. Classer un
message dans dix catégories, extraire une date, reformuler une phrase : un petit modèle y
réussit aussi bien, et ces tâches représentent souvent la majorité des appels.

La bonne question n'est pas « quel modèle ? » mais **« quelles tâches ont vraiment besoin du
grand modèle ? »**. Sur un assistant de support réel, la réponse est en général : la génération
finale, et rien d'autre.

**2. Le contexte envoyé : facteur 5.** Passer de 6 000 à 1 100 jetons d'entrée divise la
facture par cinq environ. Et le RAG apparaît alors sous un jour qu'on mentionne rarement : sa
première justification est la **qualité** — donner au modèle les bons passages — mais son effet
sur le coût est du même ordre. Envoyer cinq morceaux pertinents plutôt que tout l'historique
coûte trois fois moins cher **et** répond mieux.

**3. La longueur des réponses : facteur 1,4.** Le plus petit levier du tableau, et pourtant :

```
modèle A, scénario RAG :
  entrée  2 200 jetons × 3 €   =  6 600 unités de coût
  sortie    300 jetons × 15 €  =  4 500 unités de coût
```

La sortie représente **12 % des jetons et 41 % du coût.** Parce qu'un jeton produit coûte cinq
fois un jeton lu — ce qui est vrai chez pratiquement tous les fournisseurs.

Conséquence pratique : demander explicitement « réponds en trois phrases maximum » n'est pas
seulement une amélioration de l'expérience utilisateur, c'est une ligne du budget. Et
inversement, un format de sortie verbeux — du JSON avec des noms de champs longs, une
explication systématique du raisonnement — coûte beaucoup plus que sa proportion en jetons ne
le suggère.

### L'ordre dans lequel on optimise

1. **Mesurer d'abord.** Combien de jetons en entrée, combien en sortie, par type de requête ?
   Sans ces deux nombres, on optimise à l'aveugle. Ils s'obtiennent en journalisant les
   compteurs que renvoie chaque appel.
2. **Router par tâche.** Le petit modèle pour ce qui est simple, le grand seulement pour ce qui
   le nécessite. C'est le levier de loin le plus fort.
3. **Réduire l'entrée.** RAG plutôt qu'historique complet, top-3 plutôt que top-10, résumé
   plutôt que transcription.
4. **Réduire la sortie.** Format contraint, longueur bornée, pas de raisonnement affiché quand
   il n'est pas lu.
5. **Cacher ce qui est déterministe** — voir `/doc/lessons/caching-performance` : sur un
   harnais d'évaluation qui rejoue les mêmes questions, le taux de succès du cache approche
   100 % dès la seconde exécution, et le coût tombe à zéro.

### Le piège du calcul

Une erreur récurrente : optimiser le **coût par requête** sans regarder le **volume**. Diviser
par deux le coût d'un appel exécuté cent fois par mois économise quelques euros ; le même effort
sur l'appel exécuté quarante mille fois économise des centaines.

Le tableau à construire n'a donc pas trois colonnes mais quatre : `type de requête` ·
`coût unitaire` · `volume mensuel` · **`coût mensuel`**. C'est la dernière colonne qui donne
l'ordre de travail, et elle réserve presque toujours une surprise — le poste le plus cher n'est
pas celui auquel on pense, parce que le volume ne se devine pas.


## 🤖 Exemple appliqué (IA / data / architecture)
Dans DocSense, le coût par analyse est AFFICHÉ (LLMOps) et le rapport final inclut « coût par question : 0,8 centime, −40 % après reranking ». En entretien, savoir dire « mon système coûte X par requête et voici comment je l'ai réduit » te classe immédiatement.

## ⚠️ Erreurs fréquentes
- Découvrir les coûts sur la facture (pas d'estimation préalable ni de traçage).
- Optimiser le coût sans re-mesurer la QUALITÉ (fidélité qui s'effondre).
- Réduire la sortie alors que l'entrée domine (mauvais levier).
- Pas de garde-fou budget sur les boucles d'agents.

## 🚫 Anti-patterns
- Le gros modèle partout « pour être sûr ».
- Injecter « tout le contexte au cas où ».

## ✍️ Mini-exercice
Estime le coût mensuel d'un assistant interne : 200 questions/jour, 6 chunks de 500 tokens injectés, réponses de 250 tokens. Quel poste domine ?

## 🔥 Exercice plus difficile
Sur un de tes scripts LLM : trace les tokens réels, calcule le coût de 1000 exécutions, applique DEUX leviers (contexte réduit + cache) et mesure le gain de coût ET l'effet qualité sur ton golden set.

## ✅ Correction attendue
### La démarche

*Formule → estimation avant → poste dominant → leviers par rendement décroissant →
re-mesurer coût **et** qualité → garde-fou.* Le « et qualité » est ce qui distingue une
optimisation d'une dégradation : diviser le coût par dix en donnant des réponses fausses est
une réussite comptable et un échec produit.

### La formule, et les deux nombres qu'on n'a pas

```
coût mensuel = requêtes × (jetons_entrée × prix_entrée + jetons_sortie × prix_sortie)
```

Les prix sont connus. Les deux inconnues sont **le nombre de jetons** et **le volume de
requêtes**, et aucune ne se devine.

Pour les jetons : chaque réponse d'API renvoie les compteurs réels. Les journaliser coûte une
ligne et donne, au bout d'une semaine, la distribution vraie — moyenne **et** centiles, car
c'est la queue qui surprend. Un centile 95 à 12 000 jetons d'entrée alors que la moyenne est à
2 000 signale qu'une minorité de requêtes emporte une part disproportionnée de la facture.

Pour le volume : la journalisation applicative, par **type** de requête. C'est le tableau à
quatre colonnes de l'exemple guidé, et c'est lui qui donne l'ordre de travail.

### « Ton estimation colle aux jetons réels à ±30 % »

Le critère peut sembler laxiste. Il ne l'est pas : une estimation à ±30 % suffit largement à
décider, et une estimation qui se trompe d'un facteur 3 conduit à optimiser le mauvais poste.

Les trois causes d'écart, par fréquence :

| Cause | Effet |
|---|---|
| avoir compté des mots au lieu de jetons | sous-estimation de **30 à 50 %** en français |
| avoir oublié le prompt système | il est envoyé à **chaque** appel, et fait souvent 500 à 1 500 jetons |
| avoir oublié l'historique de conversation | il croît à chaque tour ; au dixième tour, il domine tout le reste |

La deuxième est la plus coûteuse en pratique. Un prompt système de 1 200 jetons sur 40 000
requêtes, c'est 48 millions de jetons par mois — souvent le premier poste de la facture, pour
un texte que personne n'a relu depuis six mois.

La troisième explique pourquoi une conversation longue coûte de façon **quadratique** : à
chaque tour, on renvoie tout l'historique. Dix tours de 300 jetons ne coûtent pas 3 000 jetons
mais environ 16 500. C'est le calcul que personne ne fait avant de constater la facture.

### Le garde-fou, et pourquoi il n'est pas optionnel

Une application qui appelle un modèle facturé à l'usage, sans limite, est une application où
n'importe quel défaut devient une dépense. Trois garde-fous, du plus simple au plus complet :

1. **une limite de débit par utilisateur** — elle empêche qu'un seul compte, ou une boucle
   bogue, consomme le budget d'un mois en une nuit ;
2. **un plafond de jetons par requête** — `max_tokens` en sortie, et une troncature explicite
   de l'entrée. Sans lui, un document de 400 pages collé dans un champ de saisie part tel quel ;
3. **une alerte sur la dépense cumulée**, à 50 % et 80 % du budget mensuel. Une alerte
   déclenchée le 12 du mois est une information ; une facture découverte le 3 du mois suivant
   est un incident.

Le point 2 est aussi une protection de **sécurité** : c'est la même logique que la longueur
maximale d'un champ de formulaire dans `/doc/lessons/web-forms-validation`. Sans limite, une
seule requête peut coûter mille fois la normale.

### La mauvaise solution plausible

Réduire le coût en tronquant brutalement le contexte : passer de dix morceaux à deux, ou couper
l'historique à un tour.

Le coût baisse, immédiatement et visiblement. La qualité baisse aussi — et **elle ne se voit
pas dans le tableau de bord de coût**. On obtient un système moins cher et moins bon, sans
avoir jamais comparé les deux.

C'est pourquoi le protocole impose de re-mesurer **les deux** :

```
avant : 444 €/mois   rappel@5 = 0,81   satisfaction du jeu de test = 0,86
après : 222 €/mois   rappel@5 = 0,62   satisfaction du jeu de test = 0,71
```

Écrit ainsi, l'arbitrage devient discutable — c'est peut-être un bon échange, c'est peut-être un
mauvais, mais **quelqu'un peut trancher**. Sans la seconde et la troisième colonne, la décision
est prise par défaut, en faveur du moins cher.

### Auto-évaluation

| Vérification | Comment |
|---|---|
| estimation vérifiée | ton calcul et les compteurs réels s'accordent à ±30 % |
| prompt système compté | tu connais sa taille en jetons, et tu l'as relu récemment |
| poste dominant identifié | tu peux nommer le type de requête qui pèse le plus, **volume compris** |
| qualité mesurée avant/après | chaque optimisation adoptée cite ses deux chiffres |
| garde-fous en place | limite de débit, plafond par requête, alerte de dépense |
| coût par tâche, pas global | tu sais quelles tâches pourraient passer sur un petit modèle |

### Généralisation

Ce que cette leçon installe n'est pas propre aux modèles de langage : c'est la discipline de
toute ressource **facturée à l'usage** — un service infonuagique, une API tierce, un envoi de
messages. Trois règles y sont identiques :

- **le coût unitaire ne dit rien sans le volume** ;
- **le poste dominant n'est presque jamais celui qu'on croit**, et seul le tableau le révèle ;
- **une optimisation sans mesure de ce qu'elle dégrade n'est pas une optimisation**, c'est un
  arbitrage caché.

C'est le même raisonnement que la facture infonuagique de `/doc/lessons/cloud-finops`, appliqué
à une ressource différente — et c'est rassurant : la compétence se transporte.


## 🎤 Questions d'entretien
- « Comment estimes-tu le coût d'un système LLM ? » → requêtes × tokens moyens (in/out) × prix ; mesurer sur échantillon réel.
- « Ton RAG coûte trop cher, que fais-tu ? » → Réduire le contexte (meilleur retrieval), cacher, router vers un modèle plus petit — en re-mesurant la qualité.
- « Quel est le poste de coût dominant d'un RAG ? » → L'entrée (le contexte injecté), presque toujours.

## 🧾 À retenir
- Coût = tokens in × prix in + tokens out × prix out ; l'entrée domine en RAG.
- Leviers : contexte d'abord, puis cache, puis modèle adapté, puis batch.
- Toujours re-mesurer la qualité après une optimisation ; toujours un garde-fou budget.

## 📚 Vocabulaire
**token in/out** · **prix par million de tokens** · **prompt caching** · **routage de modèle** · **max_tokens** · **batch** · **coût par requête** · **garde-fou budget**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je peux estimer un coût mensuel en 5 lignes avant de coder.
- [ ] Je connais mes leviers dans l'ordre du rendement et je re-mesure la qualité.
- [ ] Mes systèmes ont un traçage de coût et un budget garde-fou.

## 🔗 Liens avec le programme
Mois 8 (jours ~214, 226), mois 10 (workflows/cache), projet final. Leçons liées : `llm-fundamentals`, `llm-observability`, `retrieval-reranking`.
