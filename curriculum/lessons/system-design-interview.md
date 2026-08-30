<!-- keep -->
# Leçon — L'entretien de design système

## 🌍 Le problème d'abord
En entretien, on te lance : « conçois un système pour raccourcir des URLs » (ou un fil d'actualité, ou un RAG à l'échelle). Panique : par où commencer ? Le piège du débutant est de foncer coder une solution, ou de rester muet en cherchant LA bonne réponse. Or il n'y en a pas : le recruteur teste ta FAÇON de raisonner sous incertitude — poses-tu les bonnes questions, structures-tu, arbitres-tu ? Une question ouverte ne se devine pas, elle se DÉROULE avec une méthode. Cette leçon te donne cette méthode (clarifier → composants/flux → trade-offs → échelle/pannes) pour ne jamais rester sans réponse — décisif pour les rôles AI Engineer.

## 🎯 Objectif
Savoir aborder une question ouverte (« conçois un système pour X ») avec une méthode qui ne laisse jamais sans réponse : clarifier → composants/flux → trade-offs → échelle/pannes. Décisif pour les rôles AI Engineer junior+, où l'on teste ton RAISONNEMENT plus qu'une solution.

## 🧩 Prérequis
Tu dois avoir des bases d'architecture logicielle — composants, couches, compromis (`/doc/lessons/architecture-basics`) — et une idée de la mise à l'échelle, de la disponibilité et des pannes (vues en observabilité/cloud). Connaître les grands blocs (API, base de données, cache, file) aide à peupler un schéma. Aucune connaissance d'un système précis n'est exigée : c'est la MÉTHODE qui compte.

## 🧠 Modèle mental
Le design système ne se DEVINE pas, il se DÉROULE. Le recruteur n'attend pas LA bonne réponse (il n'y en a pas) : il regarde si tu poses les bonnes questions, structures, et arbitres. **Ta méthode visible est la vraie réponse.**

## 📖 Explication complète
Les 4 étapes, à énoncer à voix haute :
1. **Clarifier les besoins et contraintes** : combien d'utilisateurs / de documents ? lecture ou écriture intensive ? latence acceptable ? budget ? local ou cloud ? Et le **hors-scope**. Concevoir sans questions est éliminatoire.
2. **Composants et flux de données** : dessiner les grands blocs (client, API, base, cache, file, service LLM…) et le trajet d'une donnée de bout en bout. Un schéma structure la discussion.
3. **Choisir en TRADE-OFFS** : pour chaque décision, exposer les options et choisir selon les contraintes de l'étape 1 (« monolithe modulaire car le volume ne justifie pas le distribué »).
4. **Échelle et pannes** : « et à 10× le trafic ? » (cache, réplicas, file), « et si ce composant tombe ? » (résilience, dégradation), et les **coûts** (l'**inférence** — le calcul qui produit une réponse à partir du modèle — coûte).
Pour un système IA, ajouter les spécificités : le LLM est non déterministe/coûteux/faillible (validation, cache, fallback), le RAG quand la connaissance dépasse le contexte, workflow vs agent selon le besoin, l'évaluation intégrée dès le début, la sécurité (prompt injection).

**L'estimation à la louche, qui est la compétence réellement testée à l'étape 1.** Un candidat qui répond « beaucoup d'utilisateurs » a perdu ; un candidat qui convertit en ordres de grandeur a gagné, même avec des chiffres approximatifs. La conversion se fait toujours dans le même sens — d'un chiffre annoncé vers une **charge par seconde** :

> 1 million d'utilisateurs, dont 10 % actifs par jour, chacun faisant 5 requêtes :
> 500 000 requêtes/jour ÷ 86 400 s ≈ **6 requêtes/seconde** en moyenne.
> Le trafic n'est jamais uniforme : on applique un facteur de pointe de 3 à 5 → **20 à 30 req/s**.

Ce petit calcul change tout le reste de l'entretien. Trente requêtes par seconde tiennent sur une machine ; on n'a besoin ni de microservices, ni de file, ni de sharding, et le dire est un point pour toi, pas contre toi. Les deux repères à retenir pour ne pas être perdu : une journée fait ~**86 400 secondes** (arrondir à 100 000 est parfaitement acceptable et se calcule de tête), et un service web ordinaire encaisse quelques **centaines** de requêtes par seconde par instance.

**Le calcul de volume se fait sur le même modèle** : 500 000 requêtes/jour × 2 Ko journalisés = 1 Go/jour, soit ~365 Go/an — ce qui décide de la rétention bien mieux qu'une intuition. Et pour un système IA, un troisième calcul s'ajoute, souvent décisif : 500 000 requêtes × 4 000 jetons de contexte, c'est 2 milliards de jetons par jour. **Le goulot d'un système IA est presque toujours le coût ou la latence de l'inférence, jamais le débit HTTP** — le dire spontanément montre qu'on a déjà construit quelque chose.

**Le piège classique de cette étape** : donner un chiffre précis. Personne n'attend l'exactitude, et prétendre à la précision sur des hypothèses inventées est un mauvais signal. On annonce ses hypothèses à voix haute (« je pars sur 10 % d'actifs quotidiens, dites-moi si c'est loin de la réalité »), on arrondit franchement, et on garde l'**ordre de grandeur** — c'est lui qui décide de l'architecture, pas la deuxième décimale.

## 🔧 Exemple simple
« Conçois un système de recherche documentaire » → clarifier (combien de docs ? quelle fraîcheur ?) AVANT de dessiner ingestion → index → retrieval → génération.

## 🧭 Exemple guidé — le dimensionnement à la louche, fait en entier

La partie d'un entretien de conception qui départage le plus n'est ni le schéma
ni le vocabulaire : c'est le **dimensionnement**. Non parce qu'il faut un chiffre
exact — personne ne l'attend — mais parce qu'il transforme une architecture
récitée en une architecture justifiée. Le script
`scripts/v70-verifications/dimensionnement.mjs` déroule le calcul complet sur un
énoncé classique : un service de raccourcissement d'URL, cent millions
d'utilisateurs.

### 1. Le débit, une multiplication à la fois

```
utilisateurs                    : 100 000 000
actifs par jour (10 %)          :  10 000 000
écritures par jour (1 pour 10)  :   1 000 000
écritures par seconde           :          12 /s
lectures par seconde (×100)     :       1 157 /s
```

Chaque ligne est une hypothèse **annoncée** suivie d'une multiplication. C'est ce
qu'on attend : pas un chiffre sorti de nulle part, mais une chaîne qu'un
interlocuteur peut interrompre pour dire « je dirais plutôt 20 % d'actifs » — et
tu recalcules en dix secondes.

Le résultat le plus important n'est aucun des deux nombres : c'est leur
**rapport**. Cent lectures pour une écriture fait de ce service un service de
**lecture**, et cela décide de l'architecture avant toute autre considération. Un
cache y change tout. Il ne changerait presque rien si le rapport était inversé.

Commencer par là évite l'erreur la plus commune en entretien : décrire une
architecture avant de savoir de quel problème on parle.

### 2. Le stockage, et un résultat qui ne tranche pas

```
octets par enregistrement       : 500
enregistrements sur 5 ans       : 1 825 000 000
volume brut                     : 849,8 Gio
avec index et réplication (×3)  : 2,5 Tio
```

Il faut lire ce chiffre, et pas celui qu'on aurait aimé. 2,5 Tio n'autorise ni
« ça tient sur une machine, pas besoin de partitionner » ni « il faut
partitionner ». C'est l'ordre de grandeur où la question **commence à se poser**.

La réponse attendue est donc : « 2,5 Tio — une seule machine reste possible mais
serrée, et c'est la croissance qui décide. » **Un ordre de grandeur qui tombe à
la frontière est une information, pas un échec du calcul.** Un candidat qui force
la conclusion dans un sens pour avoir l'air décidé perd plus qu'il ne gagne.

Et le calcul montre où chercher : diviser par deux la taille d'un enregistrement
divise par deux le stockage. C'est un levier qu'on ne voit que parce qu'on a posé
la formule.

### 3. La première erreur qui coûte cher : oublier la pointe

```
facteur de pointe × 1 :  1 157 lectures/s à dimensionner
facteur de pointe × 2 :  2 315 lectures/s
facteur de pointe × 5 :  5 787 lectures/s
facteur de pointe ×10 : 11 574 lectures/s
```

Une moyenne journalière ne dimensionne rien : le trafic se concentre — heures de
bureau, fuseaux horaires, campagnes. Annoncer 1 157 lectures par seconde quand il
faut en tenir 11 570 est un **facteur dix**, c'est-à-dire une architecture
différente.

Le réflexe attendu : après chaque débit moyen, une phrase sur le facteur de
pointe et sa justification. « Je prends ×5, parce que l'essentiel du trafic est
sur douze heures et concentré sur trois » vaut mieux que n'importe quel chiffre
non justifié.

### 4. La seconde : confondre bits et octets

```
1 157 lectures/s × 300 Kio = 339,1 Mio/s
soit 2,84 Gbit/s  (×8 : un octet fait 8 bits)
erreur classique : annoncer 0,36 « Gb/s »
```

Facteur huit. Les liens réseau se vendent en **bits** par seconde, les fichiers
se mesurent en **octets**. Confondre les deux fait dimensionner un lien huit fois
trop petit — et c'est une erreur qui se voit immédiatement, parce que
l'interlocuteur connaît les ordres de grandeur des liens réseau.

### 5. Ce que le calcul autorise à affirmer

```
si 20 % des liens font l essentiel du trafic, le cache pèse 170 Gio
```

Environ trois machines à 64 Gio de mémoire : finançable et opérable. On peut donc
**affirmer** que le cache résout le problème de lecture, au lieu de le supposer.

C'est exactement la différence entre réciter une architecture et la justifier. La
phrase « j'ajoute un cache » ne vaut rien ; « le cache pèse 170 Gio, soit trois
machines, et il absorbe l'essentiel des 11 570 lectures par seconde de pointe »
vaut l'entretien.

### 6. Les quatre repères qui suffisent

```
lecture en mémoire              :   0,1 µs -> 10 000 000 /s en série
lecture sur disque à semi-cond. : 100   µs ->     10 000 /s en série
aller-retour dans un centre     : 500   µs ->      2 000 /s en série
aller-retour transatlantique    : 150   ms ->          7 /s en série
```

Ces quatre nombres tranchent la majorité des questions de conception. Le dernier
est le plus parlant : un aller-retour transatlantique par requête plafonne le
service à **sept requêtes par seconde en série**. C'est ce calcul qui impose la
réplication géographique, et non une préférence d'architecture.

La compétence à acquérir n'est pas de mémoriser une table de trente valeurs :
c'est de connaître ces quatre-là et de savoir dire « cette opération est de
l'ordre du microseconde, celle-là de la milliseconde ». Un facteur mille se
raisonne ; une valeur exacte ne sert à rien.

### 7. La démarche complète

1. **Clarifier l'énoncé.** Qui l'utilise, pour quoi, combien. Une question posée
   vaut mieux qu'une hypothèse silencieuse.
2. **Poser les hypothèses à voix haute**, sous forme de chiffres qu'on peut
   contester.
3. **Calculer débit, stockage, bande passante**, dans cet ordre, en annonçant
   chaque multiplication.
4. **Appliquer le facteur de pointe**, et le justifier.
5. **Lire les résultats et en tirer l'architecture** — pas l'inverse.
6. **Nommer ce qui tombe à la frontière** au lieu de trancher artificiellement.
7. **Dire les limites** de ce qu'on a conçu : ce qui casse si le trafic est
   multiplié par dix, ce qu'on n'a pas traité, ce qu'on mesurerait en premier.

Le point 7 est celui qui distingue un candidat expérimenté. Personne n'attend une
architecture parfaite en quarante minutes ; on cherche quelqu'un qui sait où sont
les fragilités de sa propre proposition.

## 🤖 Exemple appliqué (IA / data / architecture)
C'est exactement le raisonnement de conception de DocSense (projet final). Avoir CONSTRUIT un tel système te donne des exemples concrets à citer — un énorme avantage sur un candidat qui n'a que de la théorie.

## ⚠️ Erreurs fréquentes
- Concevoir sans clarifier (foncer sur une solution).
- Choisir la techno à la mode sans justifier (microservices « parce que »).
- Oublier l'échelle, les pannes et les coûts.
- Rester silencieux : le recruteur évalue ta pensée, verbalise-la.

## 🚫 Anti-patterns
- Sur-ingénierie (répondre à des contraintes qu'on n'a pas).
- Le schéma fouillis sans légende ni flux clair.

## ✍️ Mini-exercice
Sans relire : tu annonces 1 157 lectures/s de moyenne. Quelle question l'examinateur
va-t-il poser, et par quel facteur ta réponse va-t-elle changer ?

## 🔥 Pratique — s'entraîner sur des calculs vérifiables

Un entretien de conception ne se prépare pas en lisant des architectures : il se
prépare en faisant des calculs jusqu'à ce qu'ils deviennent rapides.

**A. Refaire le calcul complet.** Sur l'énoncé du raccourcisseur d'URL, écris un
script qui produit débit, stockage, bande passante et taille de cache à partir des
hypothèses en paramètres. Fais varier une hypothèse (le rapport lecture/écriture)
et regarde ce que l'architecture devient. Livrable : le script et deux jeux de
résultats.

**B. Trois énoncés, trois profils.** Applique le même calcul à trois systèmes de
profils différents : un service dominé par la lecture, un dominé par l'écriture,
un dominé par le volume de données. Livrable : pour chacun, le rapport
lecture/écriture, le stockage à cinq ans, et **la décision d'architecture que le
calcul impose**.

**C. Se chronométrer à l'oral.** Déroule un énoncé complet en quarante-cinq
minutes, à voix haute, en t'enregistrant : clarification, hypothèses chiffrées,
calculs, architecture, compromis, montée en charge, pannes. Réécoute et note
combien de fois tu as affirmé quelque chose sans l'avoir calculé.

**D. Le paragraphe « à dix fois le volume ».** Sur ton énoncé de C, écris ce qui
casse en premier si le trafic est multiplié par dix, et **par quel calcul** tu le
sais. Livrable : le composant qui casse, le chiffre, et la correction.

**E. Les repères, sans les regarder.** Écris de mémoire les quatre ordres de
grandeur de latence et vérifie-les. Puis réponds sans calculatrice : combien
d'allers-retours transatlantiques peut-on faire en série dans une seconde ?

## ✅ Correction attendue

**A — le calcul paramétré.** Ce qu'on attend n'est pas le résultat mais la
**chaîne** : chaque hypothèse est une variable nommée, chaque nombre découle
d'une multiplication visible. C'est ce qui permet de recalculer en direct quand
l'examinateur conteste une hypothèse — et il le fera, c'est le but de l'exercice.

En faisant varier le rapport lecture/écriture, tu dois constater un basculement
d'architecture. À cent lectures pour une écriture, le cache est la réponse. À
une lecture pour cent écritures, le cache ne sert à rien et le problème devient
l'absorption des écritures : file d'attente, écriture séquentielle, traitement
différé. **Ce n'est pas la même conception**, et c'est un seul nombre qui les
sépare.

**B — les trois profils.** La réponse attendue nomme, pour chaque profil, la
décision que le calcul **impose** et non celle qu'on préfère :

- dominé par la lecture → cache, réplicas de lecture ; le stockage est rarement
  le problème ;
- dominé par l'écriture → file d'attente pour absorber la pointe, écriture
  séquentielle, agrégation ; le cache est hors sujet ;
- dominé par le volume → partitionnement, hiérarchie de stockage, politique de
  rétention. Et souvent : la vraie question devient « faut-il vraiment tout
  garder ? », qui est une question produit, pas technique.

**C — l'enregistrement.** Le décompte des affirmations non calculées est le
résultat de l'exercice. Il est toujours plus élevé qu'on ne croit, parce qu'on
récite ce qu'on a lu — « je mets un équilibreur de charge », « je passe en
microservices » — sans qu'aucun chiffre ne le justifie.

Le repère à viser : **chaque composant ajouté répond à un nombre que tu as
calculé.** Si tu ne peux pas dire quel chiffre a rendu ce composant nécessaire,
tu l'as ajouté par habitude, et un examinateur le verra en une question.

Corollaire important pour la préparation : l'objectif n'est pas de connaître plus
d'architectures. C'est de calculer plus vite. Un candidat qui connaît trois
architectures et sait chiffrer bat un candidat qui en connaît vingt et récite.

**D — ce qui casse en premier.** La réponse est presque toujours le composant le
plus proche de la saturation dans **ton** calcul, et c'est pour cela qu'il faut
l'avoir fait. Sur l'exemple : à ×10, les lectures de pointe passent de 11 570 à
115 740 par seconde, et la question devient celle du nombre de réplicas de cache
et de la bande passante — 28,4 Gbit/s, ce qui n'est plus un lien ordinaire.

Ce qu'on attend en plus : **ce qui ne casse pas.** Le stockage passe de 2,5 à
25 Tio, ce qui reste gérable et tranche enfin la question laissée ouverte au
point 2. Savoir dire ce qui tient est aussi utile que savoir dire ce qui cède.

**E — les repères.** Les quatre valeurs : lecture en mémoire ~0,1 µs,
lecture sur disque à semi-conducteurs ~100 µs, aller-retour dans un centre de
données ~500 µs, aller-retour transatlantique ~150 ms.

La réponse à la question : environ **sept**. C'est le nombre à retenir parce
qu'il est brutal — il rend immédiatement évident qu'un appel synchrone
transatlantique par requête est disqualifiant, et il fait de la réplication
géographique une conséquence arithmétique plutôt qu'une préférence.

Ce qui compte n'est pas la précision de ces valeurs, qui évoluent avec le
matériel, mais les **rapports** entre elles : un facteur mille entre la mémoire
et le disque, un facteur trois cents entre le centre de données et le
transatlantique. Ces rapports sont stables, et ce sont eux qui tranchent.

## 🎤 Questions d'entretien
- « Conçois un système pour {besoin}. » → Dérouler les 4 étapes à voix haute.
- « Monolithe ou microservices ? » → Par défaut monolithe modulaire ; le distribué se justifie par des contraintes précises.
- « Et si le trafic ×10 ? » → Cache, réplicas, files, budget, dégradation gracieuse.

## 🧾 À retenir
- Clarifier → composants/flux → trade-offs → échelle/pannes.
- La méthode VISIBLE est la réponse ; verbalise ton raisonnement.
- Un système IA construit (DocSense) te donne des exemples concrets décisifs.

## 📚 Vocabulaire
**exigences / contraintes / hors-scope** · **flux de données** · **trade-off** · **scalabilité (verticale/horizontale)** · **cache / file / réplicas** · **résilience** · **dégradation gracieuse** · **coût d'inférence**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je clarifie toujours avant de concevoir.
- [ ] Je dessine composants + flux et justifie chaque choix en trade-offs.
- [ ] J'aborde échelle, pannes et coûts, à voix haute.

## 🔗 Liens avec le programme
Mois 10-12 (jours ~280-360), projet final. Leçons liées : `architecture-basics`, `technical-storytelling`, `agents-fundamentals`.
