# V69 CP14 — Inspection humaine simulée

Lecture critique, sans barème et sans compteur, de 5 leçons lourdement réécrites,
3 moyennement réécrites et 3 intouchées. Le but n'est pas de confirmer le sprint :
c'est de trouver ce que les sondes ne peuvent pas voir. Le barème gelé (§5) nomme
quatre défauts qui relèvent de la lecture seule ; ils sont traités un par un ci-dessous.

---

## 1. LE DÉFAUT PRINCIPAL — la forme est devenue un moule

**C'est le constat le plus important de ce sprint, et il porte sur mon propre travail.**

Mesure sur les 40 exemples guidés réécrits :

| motif | leçons concernées |
|---|---|
| étiquette « **Décision N** » | **33 / 40 (83 %)** |
| titre « **Variante qui déplace le problème** » | **40 / 40 (100 %)** |
| exactement 3 ou 4 unités étiquetées | **36 / 40 (90 %)** |
| épigramme en gras de forme « **X n'est pas Y** » | 20 / 40 (50 %) |

Le brief V69 §7 interdit explicitement « même nombre de sections ; mêmes titres ».
**J'ai produit quarante exemples au même nombre de sections et aux mêmes titres.**
Il faut le dire sans atténuation : le contenu de chacun est différent, vérifié et
non interchangeable — mais le *rythme* est identique d'un bout à l'autre du corpus.
Un lecteur qui enchaîne trois leçons reconnaît le gabarit avant d'avoir lu la
première phrase.

**Ce qui est excusable et ce qui ne l'est pas, séparément.**

*Excusable* — le titre « Variante qui déplace le problème » apparaît dans 100 % des
leçons parce que le standard éditorial gelé en CP2 en fait un élément **obligatoire**.
Un élément obligatoire apparaît par construction partout, comme la section
« Exercices » d'un manuel. Ce n'est pas du remplissage automatique, c'est un
appareil pédagogique.

*Pas excusable* — les 83 % de « Décision N » et surtout les 90 % à exactement trois
ou quatre unités. Ce rythme, je l'ai imposé ; il ne vient pas du contenu. Certains
sujets appellent deux décisions creusées, d'autres six brèves. Avoir toujours
atterri sur trois ou quatre est le signe d'une cadence d'écriture, pas d'une analyse
au cas par cas. C'est très exactement ce que §7 appelle « varier la forme en
fonction du contenu », et je ne l'ai fait qu'à moitié.

**Ce qui a été fait autrement, et qui montre que c'était possible.** Sept leçons
échappent au moule et prouvent que le contenu peut dicter la forme :

- `api-design-basics` — quatre questions posées par le consommateur de l'API ;
- `express-backend` — une enquête sur deux symptômes, en temps réel ;
- `clean-code` — quatre passes successives sur le même code ;
- `error-handling` — un tableau de pannes, puis les conséquences ;
- `docker-containers` — quatre **candidats** pesés puis éliminés ;
- `prompt-injection-defense` — quatre **couches** qu'on regarde échouer ;
- `transformers` — un calcul déroulé, pas une narration.

**Pourquoi je ne corrige pas ça maintenant.** Le correctif honnête n'est pas de
renommer « Décision 2 » en « Deuxième question » dans trente fichiers : ce serait
précisément le geste cosmétique que le brief §1 interdit — modifier la surface pour
faire passer une mesure. Le vrai correctif consiste à **re-décider la forme de chaque
exemple en fonction de son sujet**, ce qui est une passe éditoriale complète, de la
taille d'un sprint. Elle est portée au V70 comme chantier n°1.

---

## 2. Les quatre angles morts nommés par le barème gelé (§5)

### a) Une erreur probable *juste* contre une erreur probable *inventée*

Vérifié leçon par leçon sur les 8 lourdement réécrites. Les erreurs présentées comme
« ce que tout le monde fait » sont soit **exécutées** (la coche qui saute avec
`key={index}`, `to_numeric` qui perd trois valeurs, `SUM(DISTINCT)` qui ment,
`UNIQUE(livre_id, rendu_le)` qui autorise trois emprunts), soit des erreurs de
raisonnement dont le mécanisme est démontré dans le texte (le budget par essai
contre le budget total). **Aucune erreur « probable » n'est affirmée sans preuve ni
mécanisme.** C'est le seul point où V69 est nettement au-dessus du reste du corpus.

Un cas mérite une réserve explicite : dans `express-backend`, j'affirme que
supprimer le paramètre `next` inutilisé est « un geste que ton éditeur te
suggérera ». C'est plausible et couramment observé, mais je ne l'ai pas mesuré sur
un éditeur donné. La formulation reste au conditionnel d'usage ; elle ne prétend
pas à une mesure.

### b) Un catalogue au lieu d'une méthode

Le défaut trouvé en V68 sur `k8s-troubleshooting`. Relu sur les leçons réécrites :

- **Guéri** là où j'ai travaillé. `networking-tcp-ip-model` était une liste de quatre
  commandes ; il porte maintenant un critère de décision réutilisable (la durée de
  l'échec sépare le problème de service du problème de chemin). `k8s-security`, en
  revanche, reste un catalogue de quatre points — il n'était pas dans le périmètre.
- **Non traité** ailleurs : `ci-cd-pipeline-anatomy`, `slo-error-budget`,
  `docker-networking-volumes` sont encore des listes de vérifications. C'est le
  défaut dominant des 88 leçons intouchées, et le lot le plus rentable pour V70.

### c) Une analogie qui *aide* contre une analogie dont la limite est simplement écrite

Peu d'analogies nouvelles ont été introduites en V69 — c'est un choix, pas un oubli :
le sprint a préféré les mécanismes aux images. Les deux que j'ai gardées sont
fonctionnelles plutôt que décoratives (« la fenêtre de contexte est un budget »,
« une image est une pile de différences »), et chacune est immédiatement suivie de
sa conséquence chiffrée ou opératoire. Aucune analogie du périmètre n'est là pour
faire joli.

### d) La répétition déguisée en profondeur

C'est le risque nommé par §30, et il faut être précis. Les exemples réécrits font
586 à 927 mots. **Ils ne répètent pas une même idée** : chaque unité de décision
apporte un fait nouveau, et le plus souvent un fait mesuré. J'ai relu
`react-hooks-effects` (927 mots, le plus long) en cherchant ce qu'on pourrait couper :
la réponse est environ 80 mots, pas 300.

En revanche, une répétition existe **entre** les leçons : le raisonnement « place
l'invariant là où on ne peut pas le sauter » apparaît dans `database-modeling`,
`authentication` et `react-application-states`. Trois occurrences délibérées, chaque
fois sur un mécanisme différent (contrainte SQL, couche d'accès, type somme) — c'est
de la consolidation transversale, pas du remplissage. Mais la frontière est mince, et
une quatrième occurrence l'aurait franchie.

---

## 3. Les trois leçons intouchées, lues comme un lecteur les rencontrerait

`css-fundamentals` — le meilleur des trois. L'exemple explique un mécanisme réel
(la spécificité) et refuse `!important` avec une raison. Il lui manque une seule
chose : un deuxième choix pesé. Il est à un cheveu du standard.

`slo-error-budget` — quatre étapes correctes, aucune décision. Le lecteur apprend
comment on calcule un budget d'erreur, pas comment on décide d'arrêter de livrer.
Or c'est la seule question intéressante du sujet.

`docker-networking-volumes` — 58 mots, une liste. Le contraste avec
`docker-containers` réécrit (753 mots, quatre candidats pesés) est brutal, et il est
visible pour n'importe quel lecteur qui ouvre les deux le même jour.

**Conséquence produit à assumer** : le corpus est aujourd'hui à deux vitesses. Ce
n'est pas un défaut de V69 — c'est son effet mécanique, et le périmètre était le bon.
Mais un apprenant qui traverse le programme le ressentira comme une irrégularité de
qualité, et il aura raison.

---

## 4. Les dix questions de l'inspection

1. **Aurais-je appris quelque chose ?** Sur les 40 réécrites, oui, et des choses
   précises : que `type="number"` déclare `abc` valide, qu'un test médical à 95 % de
   rappel convoque 10 850 personnes pour en trouver 950. Sur les intouchées, j'aurais
   révisé du vocabulaire.
2. **Le texte m'apprend-il à décider ou à réciter ?** À décider, sur le périmètre.
   À réciter, ailleurs.
3. **Une phrase est-elle vraie mais inutile ?** Oui, quelques-unes : les épigrammes
   finales en gras (« X n'est pas Y ») sont parfois une reformulation de ce que le
   paragraphe vient de démontrer. 20 leçons sur 40 en portent une.
4. **Le jargon arrive-t-il après le besoin ?** Oui sur le périmètre : « produit
   cartésien local », « masque causal », « index partiel » n'apparaissent qu'après
   que le problème est visible.
5. **Y a-t-il un exemple que je ne pourrais pas refaire seul ?** Non pour les
   exemples exécutés (les scripts sont publiés). Les deux leçons Docker demandent un
   démon, ce qui est déclaré.
6. **Une affirmation me ferait-elle honte en entretien ?** Une seule zone de
   prudence : les tarifs par million de tokens, qui vieillissent vite. Ils sont
   étiquetés « illustratifs, à revérifier » aux deux endroits où ils apparaissent.
7. **Le texte a-t-il l'air écrit par une IA ?** Le contenu, non. **La structure, oui**
   — voir §1. C'est la réponse honnête.
8. **Un débutant décrocherait-il ?** Risque réel sur `transformers` et
   `machine-learning-basics`, qui demandent de suivre un calcul. Les deux préviennent
   et donnent la conclusion avant le détail, ce qui limite la casse.
9. **Qu'est-ce qui manque encore ?** La pratique. D8 est resté à 3,50 : V69 n'a pas
   touché aux exercices, donc un apprenant lit mieux mais ne s'entraîne pas mieux.
10. **Si je ne devais garder qu'une leçon comme modèle ?** `model-evaluation` — elle
    part d'un chiffre rassurant, le démolit avec le modèle nul, chiffre le prix du
    choix recommandé, puis montre que la métrique dépend de la population. Quatre
    mouvements, aucun mot de trop.
