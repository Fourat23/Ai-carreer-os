<!-- keep -->
# Leçon — LLM : comprendre les grands modèles de langage

## 🌍 Le problème d'abord
Tu poses une question à ChatGPT, il répond avec aplomb… et parfois invente une référence qui
n'existe pas, avec la même assurance que pour une réponse juste. Comment un outil aussi
impressionnant peut-il se tromper aussi sûrement ? Le débutant croit qu'un LLM « sait » des
choses, comme une encyclopédie ; en réalité, il fait une chose beaucoup plus simple et
surprenante — deviner le prochain morceau de texte le plus plausible. Comprendre CE que fait
vraiment un modèle change tout : tu sais alors prédire quand il échouera, concevoir autour de
ses limites (sources, validation), et maîtriser ses coûts. Cette leçon ouvre la boîte noire —
c'est ce qui sépare un « prompteur » d'un ingénieur IA.

## 🎯 Objectif
Comprendre ce qu'un LLM FAIT réellement (prédire le token suivant), pourquoi il **hallucine**
par construction, ce qu'est la **fenêtre de contexte**, le rôle de la **température**, la
structure des **coûts**, et comment traiter le LLM comme un **composant d'ingénierie**
faillible à encadrer.

## 🧩 Prérequis
Tu dois avoir l'intuition de ce qu'est le machine learning — apprendre des régularités à
partir d'exemples, généralisation, le fait qu'un modèle produit des sorties probabilistes
(`/doc/lessons/machine-learning-basics`). Une notion d'appel d'API (requête/réponse, coût,
latence, `/doc/lessons/http-rest-json`) aide pour la partie ingénierie. Aucune connaissance
d'architecture de réseaux de neurones n'est requise ici.

## 🧠 Modèle mental
Un LLM fait UNE chose : étant donné un texte, prédire le prochain **token** (un morceau de
mot) le plus probable, l'ajouter, et recommencer. Tout — dialogue, code, « raisonnement » —
ÉMERGE de cette mécanique à très grande échelle. Conséquence à graver : le modèle produit du
texte STATISTIQUEMENT PLAUSIBLE, pas du texte VRAI. La vérité n'est pas dans ce qu'il optimise ;
c'est pourquoi il faut l'ancrer dans des sources et valider ses sorties, plutôt que lui faire
confiance parce qu'il « a l'air sûr ».

## 💡 Pourquoi c'est important
Les LLM sont l'outil central de ton futur métier — et la différence entre un « prompteur » et un ingénieur IA tient à UNE chose : comprendre ce que le modèle FAIT réellement. Cette compréhension te permet de prédire quand il échouera, de concevoir autour de ses limites (RAG, validation, guardrails), d'en maîtriser les coûts, et de répondre aux questions d'entretien qui trient les candidats (« pourquoi les LLM hallucinent-ils ? »).

## Explication complète

### Ce qu'un LLM fait vraiment : prédire le token suivant
Un LLM est un réseau de neurones entraîné sur d'immenses corpus de texte à UNE tâche : étant donné une séquence, prédire le **token** suivant (un token ≈ un morceau de mot, ~4 caractères en anglais). Génération = prédire un token, l'ajouter à la séquence, recommencer. Tout le reste — dialogue, raisonnement apparent, code — ÉMERGE de cette mécanique entraînée à très grande échelle.

**Conséquence capitale** : le modèle produit du texte STATISTIQUEMENT PLAUSIBLE, pas du texte vrai. La vérité n'est pas dans sa fonction objectif.

### Pourquoi il hallucine (mécanisme, pas morale)
Quand la réponse exacte n'est pas fortement représentée dans ce qu'il a appris, le modèle produit quand même la suite LA PLUS PLAUSIBLE — une référence inventée mais bien formée, une API plausible mais inexistante. Il ne « ment » pas : il complète. L'hallucination n'est pas un bug à corriger mais une PROPRIÉTÉ à concevoir autour : ancrer les réponses dans des sources (RAG), exiger des citations, valider en aval, permettre le refus (« je ne sais pas »).

### Le contexte : la mémoire de travail (et rien d'autre)
Le modèle ne voit QUE la fenêtre de contexte de la requête courante : le system prompt, l'historique qu'ON lui renvoie, les documents qu'on y insère. Pas de mémoire entre les appels (c'est ton code qui renvoie l'historique), pas d'accès au monde (sauf outils). La fenêtre est bornée (des centaines de kilotokens au mieux) → « connaître 10 000 documents » exige d'en SÉLECTIONNER les extraits pertinents à chaque question : c'est la raison d'être du RAG.

### Température et non-déterminisme
À chaque étape, le modèle a une distribution de probabilités sur les tokens suivants. **Température 0** : toujours le plus probable (quasi déterministe — pour l'extraction, la classification). **Température élevée** : échantillonnage plus libre (créativité, diversité — et plus d'erreurs). Même à température 0, ne JAMAIS supposer un déterminisme parfait : ton code doit valider.

### Les coûts : des tokens, dans les deux sens
Tu paies les tokens d'ENTRÉE (prompt + contexte + documents) et de SORTIE. Un RAG qui injecte 20 chunks de 500 tokens paie 10 000 tokens d'entrée PAR question. Réflexes d'ingénieur : compter (tiktoken), estimer AVANT de lancer (n appels × tokens moyens × prix), réduire (cache, contexte plus court, modèle plus petit quand ça suffit).

### Le LLM comme composant d'ingénierie
Cinq propriétés qui dictent ton code appelant : **non-déterministe** (→ valider les sorties), **faillible** (→ retry, fallback, refus), **latent** (des secondes → streaming, async), **coûteux par appel** (→ cache, batch), **sujet à dérive** (le fournisseur met à jour le modèle → évaluations versionnées). Un LLM n'est ni une base de données, ni un moteur de règles : c'est un composant probabiliste à encadrer.

## Concepts clés
Token · fenêtre de contexte · system/user prompts · prédiction du token suivant · hallucination (mécanisme) · température, top-p · structured outputs (JSON contraint + validation côté code) · function calling (le modèle DEMANDE, ton code EXÉCUTE) · coûts entrée/sortie · streaming · dérive.

## 🧭 Exemple guidé

D'abord le mécanisme, en deux lignes qui disent l'essentiel :

```
Entrée : "La capitale de la France est"
  → P("Paris") = 0,92, P("une") = 0,03, …   température 0 → "Paris"
Entrée : "La capitale de la Zorbaquie est"
  → le modèle produit un nom PLAUSIBLE, avec le même aplomb
```

Même calcul dans les deux cas. Le modèle ne distingue pas « je sais » de « je complète » :
c'est pourquoi son assurance n'est jamais un signal de vérité.

**Maintenant, la conséquence en ingénierie**, car c'est là que ce cours te sera utile. Tu
construis un assistant interne : 5 000 questions par jour sur un manuel de 80 000 tokens. Le
modèle accepte un contexte largement suffisant pour tout avaler. **Faut-il le faire ?**

**Décision 1 — la fenêtre de contexte est un budget, pas une capacité.** Avec des tarifs
illustratifs de 3 € par million de tokens en entrée et 15 € en sortie — vérifie toujours les
tarifs courants, ils changent souvent :

| ce qu'on envoie | tokens/appel | coût/appel | coût/mois |
|---|---|---|---|
| tout le manuel | 80 300 | 0,24 € | **36 675 €** |
| les 6 passages pertinents | 3 300 | 0,01 € | **2 025 €** |
| les 6 passages + l'historique | 5 300 | 0,02 € | 2 925 € |

**Dix-huit fois plus cher pour répondre à la même question.** Un choix d'architecture qui
tient en une ligne de code — quoi mettre dans le contexte — se lit directement sur la facture
mensuelle, à hauteur de 34 000 € par mois. Retiens la reformulation : **« ça rentre dans la
fenêtre » ne veut pas dire « c'est une bonne idée de l'y mettre »**. C'est la même différence
qu'entre « la requête SQL fonctionne » et « la requête SQL passe à l'échelle ».

**Décision 2 — et ce n'est pas seulement une question d'argent.** Trois autres coûts
s'ajoutent, dans le même sens. La **latence** croît avec le contexte : l'utilisateur attend.
La **qualité** peut se dégrader — sur de très longs contextes, l'information utile noyée au
milieu est moins bien exploitée que la même information isolée ; c'est contre-intuitif et
c'est mesuré. Et la **confidentialité** : tout ce qui entre dans le contexte quitte ton
infrastructure. Le fait remarquable est que les quatre critères — coût, latence, qualité,
sécurité — pointent ici dans la même direction. Quand cela arrive, la décision est facile ;
c'est justement le moment de la prendre explicitement plutôt que par défaut.

**Décision 3 — les cinq propriétés, appliquées.** La liste plus haut n'est utile que
traduite en gestes de code. Non déterministe → je valide la sortie, je ne fais pas confiance
au format. Faillible → timeout, une relance bornée, une réponse dégradée utilisable.
Latent → je diffuse la réponse en flux plutôt que de faire attendre devant un écran vide.
Coûteux → je mets en cache ce qui se répète et je ne mets dans le contexte que le
nécessaire. Sujet à dérive → **j'ai un jeu d'évaluation versionné**, parce que le
fournisseur mettra à jour son modèle sans me demander mon avis, et que je dois pouvoir
répondre à « est-ce que ça s'est dégradé ? » autrement qu'à l'intuition.

Cette dernière propriété est la plus sous-estimée. Un composant logiciel ordinaire fait
demain ce qu'il faisait hier ; un modèle distant, non. **C'est la seule dépendance de ton
système qui peut changer de comportement sans que rien ne bouge dans ton dépôt.**

**Variante qui déplace le problème.** Ton assistant doit maintenant tenir une conversation :
il faut renvoyer l'historique à chaque tour, puisque le modèle n'a aucune mémoire entre deux
appels. Le contexte grandit donc à chaque échange, et le coût d'un tour de conversation
croît avec sa longueur — une discussion de trente messages coûte bien plus que trente fois
le premier. D'où les stratégies de troncature ou de résumé de l'historique, et une question
de conception que personne ne peut trancher à ta place : **qu'a-t-on le droit d'oublier ?**

## ⚠️ Erreurs fréquentes
- Traiter le LLM comme une base de connaissances fiable (il est un générateur plausible).
- « Réponds en JSON » sans validation : le parse échouera un jour — schéma validé + retry, toujours.
- Ignorer les coûts jusqu'à la facture.
- Croire que le modèle « se souvient » de la conversation (c'est TON code qui renvoie l'historique).
- Confondre function calling (le modèle demande) et exécution (ton code décide et exécute).

## 🔗 Liens avec le programme
Tout ton dernier trimestre est bâti sur cette leçon : le RAG (mois 8-9) contourne la fenêtre de contexte et ancre contre l'hallucination ; l'évaluation (mois 9) mesure ce que le non-déterminisme rend incertain ; les agents (mois 10) enchaînent des prédictions faillibles — d'où budgets et garde-fous ; les coûts pilotent l'architecture de DocSense. Et les questions d'entretien IA (tokens, température, hallucinations) viennent TOUTES d'ici.

## Mini-exercice
Avec une API LLM : (1) pose 5 fois la même question à température 0 puis 1 — observe ; (2) provoque une hallucination (question précise sur un sujet inventé plausible) et explique le mécanisme ; (3) compte les tokens d'un de tes prompts et calcule le coût de 10 000 appels/jour. Trois manipulations, trois piliers du métier.

## ✅ Correction attendue
**Ce que les trois manipulations doivent te montrer**, et ce n'est pas ce à quoi on s'attend.

Sur la température : à 0, les cinq réponses sont identiques ou presque. À 1, elles varient. Le piège de lecture est d'en conclure que « température 0 = réponse vraie ». Non : **température 0 rend le modèle reproductible, jamais correct**. Si le modèle se trompe, il se trompera cinq fois de la même façon — c'est même très exactement ce qui rend l'erreur difficile à repérer.

Sur l'hallucination : le point de l'exercice n'est pas d'obtenir une invention, c'est de constater que **rien dans la forme de la réponse ne la distingue** d'une réponse juste. Même assurance, même syntaxe, même absence d'hésitation. Le mécanisme est celui de l'exemple guidé : le modèle produit le mot suivant le plus plausible, et « plausible » n'a jamais voulu dire « vrai ». C'est de là que découle toute la suite du programme — sources, citations, refus, évaluation.

Sur les coûts, **l'erreur probable est presque universelle** : on compte les jetons du prompt, on multiplie par 10 000, et on obtient un chiffre rassurant. Trois oublis, chacun capable de multiplier la facture.
1. **La sortie coûte plus cher que l'entrée** chez la plupart des fournisseurs, souvent trois à cinq fois. Ne compter que l'entrée sous-estime systématiquement.
2. **Une conversation renvoie tout son historique à chaque tour.** Un échange de dix tours ne coûte pas dix fois un tour mais bien davantage, puisque le contexte grossit à chaque fois. Le coût d'une conversation est quadratique, pas linéaire.
3. **Le RAG injecte du contexte**, et c'est lui qui domine : 4 000 jetons de chunks pour une question de 20 jetons. Le levier d'économie n°1 n'est jamais de raccourcir les réponses, c'est d'injecter moins et mieux.

**Alternative défendable** au comptage manuel : demander l'usage réel au fournisseur, que la réponse d'API renvoie systématiquement. Plus fiable qu'une estimation — les jetons ne se comptent pas en mots — et c'est ce qu'on branche en production. L'estimation manuelle reste utile pour dimensionner AVANT d'écrire le code.

**Vérifie seul, sans corrigé** :
1. À température 0, tes cinq réponses sont-elles vraiment identiques ? Souvent elles ne le sont pas tout à fait : l'inférence distribuée n'est pas parfaitement déterministe. Constater cela vaut mieux que croire à une garantie qui n'existe pas.
2. Montre ton hallucination à quelqu'un qui ignore le sujet. S'il ne peut pas dire laquelle des deux réponses est inventée, tu as compris le problème.
3. Ton calcul de coût distingue-t-il entrée et sortie ? Sinon, refais-le.
4. Estime le coût d'une conversation de 10 tours et compare-le à 10 fois le coût d'un tour. L'écart est l'information.

## 🏢 Cas professionnel
Une équipe met en production un assistant et fixe `temperature: 0` « pour la fiabilité ». Six mois plus tard, le fournisseur met à jour le modèle sous le même nom. Les prompts n'ont pas changé, la température non plus, et pourtant les sorties changent : un format légèrement différent casse un parsing, une consigne autrefois bien suivie l'est moins.

C'est la **dérive de modèle**, et elle rappelle une chose que le vocabulaire de cette leçon nomme sans qu'on en mesure la portée : un appel LLM est une **dépendance externe versionnée par quelqu'un d'autre**. On ne traite pas cela autrement qu'une autre dépendance critique — on épingle une version du modèle quand le fournisseur le permet, on garde un jeu d'évaluation qu'on rejoue avant et après tout changement, et on valide les sorties côté code plutôt que d'espérer un format.

La contrepartie, elle aussi réelle : épingler une version indéfiniment finit par coûter cher, en argent comme en qualité, puisque les modèles récents sont souvent meilleurs et moins chers. La bonne pratique n'est pas de figer, c'est de pouvoir **mesurer** ce qu'un changement de modèle fait à ton système. Sans jeu d'évaluation, tu ne peux ni migrer sereinement ni rester immobile en confiance.

## 🔥 Pratique — chiffrer avant de construire

**A. Compter les unités.** Prends trois textes réels de ton domaine et compte
leurs unités de découpage. Compare au nombre de mots et au nombre de caractères.
Livrable : les trois rapports, et le facteur que tu retiens pour estimer.

**B. Le coût mensuel.** Pour un service à mille requêtes par jour, avec une
entrée et une sortie de tailles typiques, calcule le coût mensuel. Puis fais
varier la taille de l'entrée. Livrable : le tableau, et la part de l'entrée dans
le coût.

**C. Entrée contre sortie.** Calcule la part des unités d'entrée et de sortie
dans le volume total, puis leur part dans le coût. Livrable : les quatre
pourcentages, et l'explication de l'écart.

**D. Les deux leviers.** Applique deux réductions de coût — une mise en cache des
requêtes répétées, et un modèle plus petit sur les cas simples — et chiffre
chacune séparément puis ensemble. Livrable : les trois montants.

**E. La limite de contexte.** Calcule ce que coûte, en calcul d'attention, un
contexte de 128 000 unités par rapport à un contexte de 512. Livrable : le
facteur, et ce que tu en déduis sur la recherche documentaire.

## ✅ Correction attendue

> Les valeurs de C, D et E sont **mesurées** ou **calculées** par
> `scripts/v70-verifications/llm-cout-et-vecteurs.py` et
> `scripts/v70-verifications/reseaux-et-attention.py`.

**A — les unités.** Le rapport dépend fortement de la langue et du contenu : un
texte français ordinaire, du code, ou des identifiants ne se découpent pas de la
même façon. Le facteur que tu retiens doit venir de **tes** textes, pas d'une
règle générale — et c'est le seul enseignement de A.

Une conséquence pratique souvent ignorée : les langues autres que l'anglais
consomment généralement plus d'unités pour le même contenu, ce qui renchérit le
même service à contenu égal.

**B et C — le coût, et l'asymétrie.** Le résultat mesuré :

```
les unités de SORTIE représentent 12 % du volume et 41 % du coût
```

L'écart vient du prix unitaire : la sortie coûte plusieurs fois l'entrée. La
conséquence est contre-intuitive et gouverne toute l'optimisation : **réduire la
verbosité des réponses rapporte davantage que réduire la taille du contexte**,
alors que l'intuition pousse à l'inverse parce que le contexte est visiblement
plus gros.

D'où deux actions concrètes : demander explicitement des réponses courtes, et
imposer un format structuré plutôt qu'une prose explicative quand la sortie est
consommée par un programme.

**D — les deux leviers.** Mesuré : de **900 € à 5 € par mois**, un facteur 196.

Ce facteur ne vient pas d'une astuce mais de la combinaison, et il faut savoir la
décomposer. La mise en cache supprime le coût des requêtes **identiques**, dont
la proportion est bien plus élevée qu'on ne l'imagine dans un service réel. Le
routage vers un modèle plus petit sur les cas simples réduit le prix unitaire là
où la difficulté ne le justifie pas.

Le point de conception à formuler : **ces deux leviers supposent qu'on ait
mesuré la distribution des requêtes** — combien sont identiques, combien sont
simples. Sans cette mesure, on ne peut ni dimensionner le cache ni définir le
critère de routage, et l'optimisation reste une intention.

**E — le coût du contexte.** Calculé :

```
longueur | paires calculées | multiplication par rapport à 512
     512 |          262 144 | ×1
   2 048 |        4 194 304 | ×16
 131 072 |   17 179 869 184 | ×65 536
```

Doubler la longueur **quadruple** le calcul, puisque chaque unité est comparée à
chaque unité. Pour environ 128 000 unités, le facteur est de 65 536 par rapport à
512.

Ce que tu dois en déduire sur la recherche documentaire est la conclusion
attendue : si l'on peut ne soumettre que les cinq passages pertinents au lieu du
corpus entier, **on ne gagne pas un peu de coût, on en gagne des ordres de
grandeur**. La recherche documentaire n'est pas une astuce d'économie ; elle est
la conséquence arithmétique du coût quadratique de l'attention.

Réserve honnête : ce calcul porte sur le coût **de calcul** de l'attention, pas
directement sur le prix facturé, qui suit sa propre grille. Les deux évoluent
dans le même sens sans être proportionnels.

## 🎤 Questions d'entretien
- « Pourquoi un LLM hallucine-t-il ? » → Parce qu'il produit le jeton le plus plausible, sans notion de vérité ni accès à une source. La confiance apparente n'est pas un signal de fiabilité.
- « À quoi sert la température ? » → À régler l'aléa du choix des jetons. 0 rend reproductible, pas exact.
- « Un LLM se souvient-il de la conversation ? » → Non. C'est ton code qui renvoie l'historique à chaque appel — d'où le coût qui grimpe à mesure que l'échange s'allonge.
- « Où part l'argent dans une application LLM ? » → Presque toujours dans les jetons d'ENTRÉE, à cause du contexte injecté. Réduire le contexte rapporte plus que raccourcir les réponses.
- « Le modèle exécute-t-il les outils qu'il appelle ? » → Non : il demande. Ton code décide, valide et exécute.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je sais expliquer une hallucination par le mécanisme, pas par « le modèle s'est trompé ».
- [ ] Je ne confonds pas reproductible et correct.
- [ ] J'estime un coût en distinguant entrée et sortie, et je sais pourquoi une conversation coûte plus cher qu'elle n'en a l'air.
- [ ] Je traite un modèle comme une dépendance externe qui peut changer sans moi.

## 📚 Vocabulaire
**token** · **fenêtre de contexte** · **inférence** · **température / top-p** · **hallucination** · **system prompt** · **structured output** · **function calling / tool use** · **streaming** · **coût par token** · **dérive de modèle**.

## 🧾 À retenir
Un LLM prédit le token suivant le plus plausible — c'est tout, et c'est immense. Il n'a ni vérité, ni mémoire hors contexte, ni déterminisme garanti ; il hallucine par construction et coûte à chaque token. L'ingénierie LLM consiste à bâtir autour de ces propriétés : ancrer (RAG), contraindre et valider (structured outputs), outiller (function calling), mesurer (éval), encadrer (guardrails). Comprendre la mécanique, c'est cesser de subir la magie.
