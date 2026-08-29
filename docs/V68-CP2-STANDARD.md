# V68 · CP2 — Le standard d'une leçon excellente

> **Ce document n'est pas un gabarit.** Il ne sera pas appliqué à 128 leçons. Le
> brief l'interdit et le CP0 a montré pourquoi : six des leçons lues n'ont besoin
> de rien, et deux formats différents y réussissent aussi bien.
>
> C'est un **contrat pédagogique** : la liste de ce qu'une leçon doit accomplir,
> pas la liste des sections qu'elle doit porter.

---

## 1. Pourquoi ce standard n'est pas inventé

Le CP0 a trouvé, dans ce dépôt, **24 leçons qui enseignent réellement**. Elles
n'ont pas été écrites d'après un modèle ; elles ont convergé vers les mêmes gestes
parce que ces gestes sont ce qu'exige un lecteur humain.

Écrire un standard neuf aurait été plus rapide et aurait produit exactement ce que
le brief appelle « une usine à Markdown ». Ce standard est donc **extrait** :
chaque exigence ci-dessous est illustrée par un passage qui existe déjà, et qui a
été écrit sans connaître ce document.

La conséquence pratique est importante : **le projet n'a pas à apprendre une voix
nouvelle.** Il a à étendre la sienne.

---

## 2. Les six obligations d'une leçon

Une leçon doit accomplir ces six choses. **L'ordre et la forme varient selon le
concept** — une leçon de CSS et une leçon de statistiques n'ont aucune raison de
se ressembler.

### Obligation 1 — Faire naître le besoin avant le nom

Le concept doit apparaître comme la réponse à un problème que le lecteur a déjà
ressenti, ou qu'il peut ressentir en trois phrases. Le mot technique arrive
**après** le problème, jamais avant.

C'est la seule obligation que le corpus remplit déjà presque partout :

> « Le serveur est lent. » C'est la plainte la plus fréquente… et la plus vague.
> Lent POURQUOI ? — `linux-resources-io`

**État actuel : acquis.** Ne pas y toucher.

### Obligation 2 — Expliquer le mécanisme, pas seulement la règle

Il ne suffit pas de dire *quoi faire*. Il faut dire **pourquoi ça marche comme
ça**, à un niveau où le lecteur peut prédire le comportement dans un cas qu'on ne
lui a pas montré.

Le test : *le lecteur peut-il, à partir de l'explication, deviner ce qui se passe
dans une situation voisine dont on ne lui a pas parlé ?*

> Par défaut, un enfant flex a `min-width: auto` : il refuse de rétrécir sous la
> taille de son contenu (un long mot, un bloc de code). Résultat : il FORCE le
> conteneur à déborder, malgré `flex-shrink: 1`. — `css-flexbox`

Ce paragraphe permet de prédire le débordement dans un cas jamais montré. Une
règle (« mets `min-width: 0` ») ne l'aurait pas permis.

Les sept questions à se poser sur tout concept structurant — **toutes n'appellent
pas toujours une réponse écrite**, mais aucune ne doit rester sans réponse
possible pour le lecteur :

**QUOI ? · POURQUOI ? · COMMENT ? · QUAND ? · QUAND PAS ? · QUE SE PASSE-T-IL
SOUS LE CAPOT ? · COMMENT SAURAIS-JE QUE JE ME TROMPE ?**

La dernière est celle que le corpus omet le plus souvent, et c'est la plus utile.

### Obligation 3 — Montrer une version fausse, crédible, et dire pourquoi elle séduit

Une liste d'interdits (« ne pas mémoïser au hasard ») n'enseigne rien : elle
suppose déjà acquis le jugement qu'elle prétend transmettre.

Ce qui enseigne, c'est de **montrer** le code ou le raisonnement qu'un débutant
compétent produirait vraiment, puis d'expliquer précisément pourquoi il échoue —
et surtout **pourquoi il avait l'air juste**.

> Les deux modèles rendent des vecteurs de dimensions compatibles, la requête
> passe, la base répond cinq documents. Mais les coordonnées produites par deux
> modèles différents ne désignent pas les mêmes directions […] Les résultats sont
> plausibles, ordonnés, et faux. Aucune exception ne sera levée.
> — `vector-databases`

La valeur de ce passage tient à un mot : **silencieux**. Il enseigne un mode de
défaillance qui ne proteste pas — ce qu'aucune liste d'erreurs ne peut faire.

**État actuel : 7 leçons sur 128.** C'est la dimension la plus basse du corpus
(D6 = 1,5).

### Obligation 4 — Guider un exemple, pas énumérer une procédure

Un exemple guidé montre **quelqu'un qui réfléchit**, pas une suite d'étapes qui
réussissent. Il comporte au minimum : une situation de départ, une décision et sa
raison, et ce qu'on apprend qui dépasse le cas.

> 2. On code, et **on ne commite pas tout d'un bloc**. `git add -p` présente
>    chaque morceau modifié et demande si on le prend. Deux bénéfices, dont le
>    second est le vrai : on compose un commit cohérent, et surtout on **relit son
>    propre code** avant de le figer. C'est la revue de code la moins chère du
>    métier. — `git-fundamentals`

Chaque étape porte sa raison. Comparer avec le format dominant :

> 1. Les deux conteneurs sont-ils sur le MÊME réseau ?
> 2. L'URL utilise-t-elle le nom de service et le port interne ?
> — `docker-networking-volumes`

La seconde forme est une **check-list de diagnostic**, et une bonne. Elle a sa
place — mais sous son vrai nom, et pas à la place d'un exemple guidé.

**État actuel : 53 mots de médiane.** Les dix étapes attendues n'y tiennent pas.

### Obligation 5 — Corriger en enseignant, pas en donnant la réponse

Une correction utile fait quatre choses :

1. elle donne le raisonnement attendu, pas seulement le résultat ;
2. elle **nomme l'erreur probable** — celle que fera vraiment le lecteur ;
3. elle explique **pourquoi cette erreur séduit** ;
4. elle dit **comment reconnaître le problème la prochaine fois**.

Et quand c'est vrai, elle ajoute une **alternative défendable**, parce que la
plupart des questions professionnelles ont plusieurs bonnes réponses.

> Le piège séduit parce que la résolution *ressemble* à une opération Git, alors
> que c'est une décision de code : on choisit ce que le programme doit faire, pas
> quelle version du texte garder. — `git-fundamentals`

> Le piège séduit parce qu'écrire des questions en lisant la source est mille fois
> plus rapide, et parce que le résultat est flatteur. — `ai-evaluation`

Le geste commun : **la correction prend le lecteur au sérieux.** Elle admet que
son erreur était raisonnable. C'est ce qui la rend lisible sans humiliation, et
donc mémorable.

**État actuel : 24 profondes, 37 plates, 67 absentes.**

### Obligation 6 — Laisser l'apprenant produire avant de lui donner la réponse

Une question dont la réponse est sur la même ligne n'est pas une question.

Le corpus a déjà les deux formes. La bonne :

> ## 🧪 Vérification de compréhension
> - Pourquoi un `POST` de création a-t-il besoin d'une clé d'idempotence, mais pas
>   un `PUT` ? — `api-production-contracts`

Et la forme que G1 a inventée, qui est meilleure encore parce qu'elle donne un
**critère** au lieu d'une réponse :

> **Vérifie seul, sans corrigé** :
> 1. Ton histogramme et ton résumé racontent-ils la même histoire ? Si la moyenne
>    tombe dans une zone où il n'y a presque aucune observation, ton résumé ment.
> […]
> 4. Sur ta variable asymétrique : retire les 1 % de valeurs les plus hautes et
>    recalcule. La moyenne bouge beaucoup, la médiane à peine. **Voir ce
>    déplacement vaut mieux que lire « robuste aux extrêmes ».**
> — `statistics-for-ml`

Cette dernière phrase est le standard en une ligne.

**État actuel : 114 leçons sur 128 collent la réponse à leur question.**

---

## 3. La progression cognitive, et pourquoi elle n'est pas un ordre

Le brief énumère : intuition → vocabulaire → mécanisme → exemple → raisonnement →
pratique → erreur → correction → transfert → synthèse. Il précise que l'ordre et
la forme varient selon le sujet. Le CP0 le confirme par la lecture :

- `css-flexbox` place son contre-exemple **après** l'exemple guidé, parce que le
  lecteur doit d'abord savoir ce qui marche pour comprendre pourquoi la marge fixe
  ne marche pas.
- `vector-databases` place le sien **dans** les erreurs fréquentes, parce que le
  défaut n'apparaît qu'en exploitation, pas à l'écriture.
- `statistics-for-ml` fait le calcul de Bayes **deux fois** — une fois dans le
  cours, une fois dans la correction avec une autre prévalence — parce que
  l'intuition ne vient qu'à la seconde.

**Ce qui est obligatoire, ce sont les six accomplissements. Leur ordonnancement
est une décision d'auteur, prise concept par concept.**

Un exemple de ce que ce standard interdit explicitement : ajouter à
`docker-networking-volumes` une section « Contre-exemple » vide de substance pour
faire monter D6. La bonne question n'est pas « quelle section manque ? » mais
« quelle erreur un débutant fait-il vraiment ici, et pourquoi lui semble-t-elle
juste ? ». Pour cette leçon, la réponse existe : il écrit `localhost:5432` parce
que c'est ce qui marchait sur sa machine. Voilà le contre-exemple à écrire.

---

## 4. Ce qui ne doit PAS changer

Le CP0 a identifié des leçons qui remplissent déjà le contrat. Les toucher serait
une perte nette.

| Leçon | Ce qu'elle réussit |
|---|---|
| `statistics-for-ml` | les six obligations, sans exception |
| `git-fundamentals` | la meilleure correction du corpus |
| `ai-evaluation`, `agents-fundamentals` | corrections qui contredisent leur propre leçon quand il le faut |
| `vector-databases` | le meilleur contre-exemple du corpus |
| `css-flexbox` | mécanisme + contre-exemple, en 900 mots |
| `database-transactions-concurrency` | exemple SQL reproductible, exercice ouvert |
| `linux-resources-io` | mécanismes expliqués, diagnostic honnête |
| `api-production-contracts` | la seule vraie section de vérification muette |

**Aucune de ces huit ne sera réécrite.** Trois recevront une correction ou une
vérification muette là où elles n'en ont pas — un ajout, pas une réécriture.

---

## 5. Le principe de proportion

> « Ne transforme pas toutes les leçons en tutoriels interminables. »

Une leçon de 900 mots qui remplit les six obligations vaut mieux qu'une de 2 500
qui en remplit quatre. `css-flexbox` fait 901 mots et enseigne mieux que
`agent-workflows-orchestration` qui en fait 1 071.

**Aucune cible de longueur n'est fixée par ce standard.** La seule cible est
fonctionnelle : les six obligations remplies, dans la forme que le concept
réclame.

Corollaire, qui sera vérifié au CP15 : si la longueur moyenne du corpus augmente
beaucoup plus que ses notes, c'est du remplissage, et le §4-1 du CP1 s'applique.
