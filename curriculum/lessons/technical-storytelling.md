<!-- keep -->
# Leçon — Storytelling technique (raconter ses projets)

## 🌍 Le problème d'abord
En entretien, on te demande de parler d'un projet. Tu réponds : « j'ai fait une application avec React et une base de données ». Silence poli. Le recruteur n'a rien retenu, rien appris de ta façon de penser. Le problème : tu as décrit CE QUE tu as tapé, pas COMMENT tu as décidé. Un projet qu'on ne sait pas raconter n'existe pas aux yeux d'un employeur. Un bon récit technique montre un problème, des décisions arbitrées sous contraintes, des résultats chiffrés et des apprentissages — la « façon de penser » que le recruteur achète réellement. Cette leçon t'apprend à transformer ton travail en récit qui convertit en entretiens.

## 🎯 Objectif
Savoir transformer un projet technique en un RÉCIT qui convainc un recruteur : problème, décisions, résultats chiffrés, apprentissages. Un projet qu'on ne sait pas raconter n'existe pas pour un employeur — c'est LA compétence qui convertit ton travail en offres d'entretien.

## 🧩 Prérequis
Tu dois avoir **mené un projet technique avec de vraies décisions**, et savoir en tirer des résultats mesurables (avant/après, chiffres). C'est le seul prérequis réel : il ne s'apprend pas dans une leçon, il se constitue en travaillant — et n'importe quel projet du parcours convient, y compris le tien en cours. Les bases de la communication technique — adapter son propos à l'auditoire (`/doc/lessons/technical-documentation`) — **aident**. Aucune aisance orale préalable n'est supposée : le récit se prépare et se répète.

> **Où trouver le détail.** `/doc/lessons/portfolio-github` traite la mise en vitrine de ces projets — quels dépôts épingler, dans quel ordre, et ce que chacun doit prouver. Elle est **programmée plus loin** dans le parcours : le récit se prépare d'abord, la vitrine l'expose ensuite.

## 🧠 Modèle mental
Un recruteur n'achète pas des features, il achète une **façon de penser**. Raconter un projet, c'est montrer comment tu DÉCIDES sous contraintes — pas réciter ce que tu as tapé. « J'ai fait un CRUD » n'intéresse personne ; « j'ai arbitré X vs Y pour telle raison, et voici le résultat mesuré » recrute.

## 📖 Explication complète
La structure **STAR** organise n'importe quel récit de projet :
- **Situation** : le problème, et pour QUI (le contexte donne du sens).
- **Tâche** : ce qu'il fallait accomplir, les contraintes.
- **Action** : tes DÉCISIONS clés et leurs trade-offs (c'est là que tes ADRs brillent). Le cœur du récit.
- **Résultat** : chiffré et démontrable (« fidélité +18 % », « 40 questions d'éval », « temps de réponse < 2 s »).
On y ajoute l'**apprentissage** : un vrai obstacle rencontré et comment tu l'as résolu — la preuve vivante de ta valeur.
Trois formats à préparer : 30 s (accroche), 90 s (standard), 3-5 min (détaillé avec schéma). Et un README qui raconte la même chose par écrit (problème → démo → chiffres → archi → install). Les CHIFFRES et les DÉCISIONS sont le signal ; « motivé et passionné » est du bruit.

**Un récit STAR complet, puisqu'une structure ne s'apprend pas en lisant ses initiales.** Voici la version 90 secondes, telle qu'elle se dit à voix haute :

> **[Situation]** « Dans mon projet DocSense, l'objectif était de répondre à des questions sur une documentation interne de 400 pages. La première version marchait en démonstration, mais dès que je posais des questions un peu détournées, elle inventait des réponses avec beaucoup d'aplomb.
>
> **[Tâche]** Il fallait que je sache d'abord *où* ça cassait, avant de tenter quoi que ce soit — je n'avais aucun moyen de dire si le problème venait de la recherche ou de la génération.
>
> **[Action]** J'ai construit un jeu d'évaluation de 40 questions, dont 8 volontairement sans réponse dans le corpus, pour tester le refus. J'ai mesuré séparément la récupération et la génération : le rappel@5 était à 61 %, la fidélité à 88 %. Le diagnostic était donc clair — huit fois sur dix, l'erreur venait de la récupération, pas du modèle. J'ai changé le découpage, en passant d'une taille fixe à un découpage par sections, parce que la documentation était très structurée et que je coupais des tableaux en deux. J'ai aussi ajouté une recherche par mots-clés en parallèle du vectoriel, les questions contenant souvent des références de procédure exactes que les vecteurs rataient.
>
> **[Résultat]** Le rappel@5 est passé de 61 % à 87 %, la fidélité de 88 % à 91 %, et le taux de refus correct sur les questions sans réponse de 3/8 à 7/8. Le tout mesuré sur le même jeu, à chaque version.
>
> **[Apprentissage]** Ce que j'en retiens, c'est que j'avais commencé par améliorer le prompt — c'était visible, gratifiant, et ça ne servait à rien : le bon passage n'était pas dans le contexte. Maintenant je mesure avant de toucher à quoi que ce soit. »

**Ce qu'il faut observer dans ce récit**, parce que c'est reproductible sur n'importe quel projet :
- La **Situation** dure deux phrases. C'est la partie que tout le monde étire, et celle qui intéresse le moins.
- L'**Action** occupe plus de la moitié, et elle est faite de **décisions justifiées** — « par sections *parce que* la documentation était structurée » — jamais d'une liste de technologies employées.
- Le **Résultat** donne un avant ET un après. « J'ai amélioré la qualité » ne vaut rien ; « 61 % à 87 % sur le même jeu » se vérifie et se discute.
- L'**Apprentissage** admet une erreur réelle. C'est contre-intuitif en entretien, et c'est pourtant le passage qui distingue le plus : il prouve qu'on sait diagnostiquer sa propre démarche.

**La version 30 secondes n'est pas ce récit raccourci**, c'est sa Situation plus son Résultat : « J'ai construit un assistant sur 400 pages de documentation interne ; en mesurant récupération et génération séparément, j'ai fait passer le rappel de 61 à 87 %. » On garde le problème et le chiffre, on laisse l'interlocuteur demander la suite.

## 🔧 Exemple simple
Faible : « J'ai créé un chatbot RAG. »
Fort : « J'ai construit un assistant Q&R sur des docs techniques ; en ajoutant un reranking mesuré sur un golden set de 40 questions, la fidélité est passée de 72 % à 90 %. »

## 🧭 Exemple guidé — la même histoire, racontée trois fois

Le conseil « raconte une histoire structurée » est juste et insuffisant, parce
qu'il ne dit pas ce qui fait la différence entre une histoire qui convainc et une
qui ennuie. La différence tient en une phrase : **on ne raconte pas ce qu'on a
fait, on raconte ce qu'on a décidé et ce qu'on a mesuré.**

Voici la même histoire — un incident de performance sur une base de données —
racontée trois fois. Aucune n'est fausse.

### Version 1 — le récit chronologique (à éviter)

> « Alors, j'avais une API qui était lente. J'ai regardé le code, j'ai testé
> plusieurs choses, j'ai lu de la doc sur les index. J'ai essayé d'ajouter un
> cache mais ça n'a pas trop marché. Après j'ai regardé les requêtes SQL et j'ai
> vu qu'il y en avait beaucoup. Du coup j'ai changé la requête et c'était mieux. »

Ce qui ne va pas n'est pas le manque de technique — le narrateur a manifestement
travaillé. C'est que **rien n'est décidable ni vérifiable**. Quatre-vingt-dix
secondes se sont écoulées et l'auditeur ne sait ni ce qui était lent, ni de
combien, ni pourquoi le cache a échoué, ni ce qui a fonctionné. Il ne peut ni
approuver ni contester : il n'a rien reçu.

### Version 2 — décisions et chiffres (90 secondes)

> « **[Situation]** Une page de liste mettait sept secondes à s'afficher pour
> cinquante commandes. **[Tâche]** Trouver la cause avant d'optimiser quoi que ce
> soit. **[Action]** J'ai d'abord compté les requêtes : cinquante et une pour
> cinquante commandes — un accès par ligne. J'ai testé un cache : le nombre de
> requêtes n'a pas bougé, cinquante et une, parce que chaque requête portait un
> identifiant différent et n'était jamais réutilisée. C'est ce résultat négatif
> qui m'a fait chercher ailleurs. J'ai remplacé les cinquante et un accès par une
> seule jointure. **[Résultat]** Une requête au lieu de cinquante et une, et
> l'analyse du plan d'exécution montre un parcours d'index à 0,012 ms au lieu
> d'un balayage complet à 7,8 ms. La page est passée sous les cent
> millisecondes. »

Chaque phrase porte une **décision** ou un **chiffre**. Et le passage qui
impressionne le plus n'est pas le résultat : c'est le cache qui n'a rien changé.
Raconter une tentative qui a échoué et **expliquer pourquoi** prouve qu'on a
compris le mécanisme, alors qu'un enchaînement de succès suggère qu'on récite.

### Version 3 — trente secondes

> « Une page à sept secondes : cinquante et une requêtes pour cinquante lignes.
> Le cache n'y changeait rien parce qu'aucune clé n'était réutilisée. Une
> jointure a suffi : une requête, page sous cent millisecondes. »

La version courte n'est pas la version longue tronquée : c'est **la situation et
le résultat**, plus la seule décision qui explique le passage de l'une à l'autre.
C'est le format qu'on utilise quand la question est « parle-moi rapidement d'un
projet » — et le bon réflexe est de finir en offrant la suite : « je peux
détailler la partie diagnostic si ça t'intéresse. »

### Ce qui rend la version 2 possible

On ne peut pas raconter la version 2 si on ne l'a pas mesurée. Les chiffres qui
la portent — 51 requêtes, 7,8 ms contre 0,012 ms — viennent d'une mesure
effectivement faite pendant le travail, pas d'un souvenir.

C'est la conséquence la plus concrète de cette leçon, et elle porte sur ta
**pratique**, pas sur ta prise de parole : **mesure pendant que tu construis, et
note le chiffre.** Le nombre de requêtes avant et après, le temps avant et après,
le taux d'erreur avant et après. Six mois plus tard, tu ne t'en souviendras pas,
et tu raconteras la version 1 — non par manque de rigueur, mais parce que
l'information n'existera plus.

Corollaire : les tentatives qui échouent se notent aussi. Elles sont la matière
des meilleures histoires, et ce sont les premières oubliées.

### La structure, et pourquoi cet ordre

Quatre temps, dans cet ordre, parce qu'il correspond à celui des questions de
l'auditeur :

1. **La situation** — un problème concret, avec un chiffre qui le rend réel.
   « Une page lente » n'est pas une situation ; « sept secondes pour cinquante
   lignes » en est une.
2. **La tâche** — ce qui t'incombait, en une phrase. Cela évite l'ambiguïté sur
   ce que **tu** as fait par rapport à l'équipe, qui est la question que
   l'auditeur se pose en silence.
3. **L'action** — les décisions, pas les gestes. Ce que tu as éliminé et
   pourquoi. C'est le corps de l'histoire et la partie qu'on écourte à tort.
4. **Le résultat** — un chiffre, et ce que tu en as retiré durablement.

Le test qui tranche : **si tu peux retirer une phrase sans rien perdre,
retire-la.** Applique-le à ton pitch enregistré, et compte combien de phrases
survivent.

## 🤖 Exemple appliqué (IA / data / architecture)
Pour un poste IA, les chiffres d'ÉVALUATION sont ton meilleur argument : ils prouvent que tu sais mesurer, pas seulement brancher une API. « Comment sais-tu que ton système marche ? » se répond par un tableau avant/après — c'est le différenciateur n°1 face aux autres juniors.

## ⚠️ Erreurs fréquentes
- Raconter les features (QUOI) au lieu des décisions (POURQUOI).
- Aucun chiffre (« ça marche bien »).
- Survendre (« architecture révolutionnaire ») au lieu d'être précis et honnête.
- Prétendre que « tout s'est bien passé » (aucun obstacle = aucune histoire).

## 🚫 Anti-patterns
- Le jargon pour impressionner sans rien clarifier.
- Le monologue de 10 minutes sans structure.

## ✍️ Mini-exercice
Sans relire : quelle partie d'une histoire technique impressionne le plus un
examinateur expérimenté, et pourquoi ?

## 🔥 Pratique — constituer et affûter sa banque d'histoires

**A. L'inventaire des chiffres.** Reprends les vérifications que tu as exécutées
au fil de ce programme et liste, pour chacune, le chiffre avant et le chiffre
après. Livrable : un tableau d'au moins dix lignes — sujet, chiffre avant,
chiffre après, décision qui explique l'écart.

**B. Trois histoires, trois formats.** Choisis trois de ces mesures et écris pour
chacune les versions 30 secondes et 90 secondes. Livrable : six textes.

**C. L'échec qui prouve la compréhension.** Pour chaque histoire, ajoute une
tentative qui n'a pas marché et l'explication mécanique de son échec. Si tu n'en
as pas, c'est que tu n'as pas noté tes essais — commence à le faire dès
aujourd'hui.

**D. L'enregistrement et la coupe.** Enregistre-toi sur les trois versions de
90 secondes. Réécoute avec la transcription et **barre toute phrase qui ne porte
ni décision ni chiffre**. Livrable : le nombre de phrases avant et après, et la
durée avant et après.

**E. Le test du non-technicien.** Fais écouter la partie « situation » à
quelqu'un qui ne connaît pas ton domaine et demande-lui de reformuler le
problème. Livrable : sa reformulation, mot pour mot.

## ✅ Correction attendue

**A — l'inventaire.** C'est l'exercice le plus rentable des cinq, et le plus
négligé. Si ton tableau est court, ce n'est pas que tu n'as rien fait : c'est que
tu n'as pas mesuré, ou que tu n'as pas noté. **Un travail non mesuré est un
travail que tu ne pourras pas raconter**, et cela vaut aussi bien pour un
entretien que pour une revue avec ton équipe.

Le format attendu impose une colonne « décision » à côté des deux chiffres. Sans
elle, tu as une liste de résultats ; avec elle, tu as des histoires. C'est la
décision qui rend l'écart intelligible, et c'est elle que l'examinateur cherche.

**B — les deux formats.** L'erreur systématique est de faire de la version
30 secondes une version 90 tronquée, qui s'arrête au milieu de l'action. La
version courte est **situation + résultat + la décision unique qui les relie**.
Elle se termine bien en offrant la suite, ce qui rend la main sans donner
l'impression d'avoir fini trop vite.

**C — l'échec.** La raison pour laquelle ce point compte tant : une suite de
succès ne distingue pas quelqu'un qui a compris de quelqu'un qui a appliqué une
recette trouvée en ligne. Une tentative échouée **avec son explication
mécanique** ne peut venir que de la compréhension.

L'exemple du guide en est une illustration exacte : « le cache n'a rien changé
parce qu'aucune clé n'était réutilisée » prouve qu'on sait ce qu'un cache fait,
bien mieux que « j'ai mis un cache et ça a marché ».

Erreur à éviter : présenter l'échec comme une faute (« j'ai perdu deux jours
bêtement »). Il se présente comme une **élimination d'hypothèse**, ce qu'il est
réellement dans une démarche de diagnostic.

**D — la coupe.** Le résultat typique est une réduction d'un tiers à la moitié
des phrases, et c'est le bon signe. Les phrases qui tombent sont toujours des
mêmes familles : les transitions (« du coup », « et donc après »), les
justifications d'existence (« c'était un projet personnel donc… »), et les
répétitions du problème déjà énoncé.

Ce que la réduction achète n'est pas de la brièveté : c'est de la **densité**.
Sur un budget d'attention fixe, chaque phrase supprimée laisse de la place à une
décision ou à un chiffre.

**E — le non-technicien.** Le résultat utile est sa reformulation exacte, pas
« oui, j'ai compris ». Si elle diffère de ton intention, c'est ta formulation
qu'il faut changer.

L'écart le plus fréquent : tu décris la **cause technique** (« il y avait un
problème de N+1 ») alors que la situation doit décrire le **symptôme
observable** (« la page mettait sept secondes »). La cause technique appartient à
la partie action, où elle devient une révélation ; placée dans la situation, elle
perd son effet et perd l'auditeur non spécialiste — y compris le responsable de
recrutement présent dans la pièce.

## 🎤 Questions d'entretien
- « Parle-moi d'un de tes projets. » → STAR : problème/pour qui → décisions et trade-offs → résultats chiffrés → apprentissage.
- « Quelle a été la difficulté la plus dure ? » → Un vrai obstacle + ta démarche de résolution.
- « Pourquoi ce choix technique ? » → Répondre en trade-offs (ADR), pas en dogme.

## 🧾 À retenir
- On recrute une façon de PENSER : raconte tes décisions, pas tes features.
- Les chiffres et les trade-offs sont le signal ; les adjectifs sont du bruit.
- Prépare 30 s / 90 s / 3 min, et un README qui raconte pareil.

## 📚 Vocabulaire
**STAR** · **trade-off / ADR** · **pitch** · **résultat chiffré** · **portfolio** · **apprentissage** · **README** · **honnêteté (limites)**.

## 🟢 Checklist « quand suis-je prêt ? »
- [ ] Je peux pitcher chaque projet en 90 s avec un chiffre.
- [ ] Je raconte mes décisions et trade-offs, pas la liste des features.
- [ ] J'ai un obstacle réel et son apprentissage prêts pour chaque projet.

## 🔗 Liens avec le programme
Mois 12 (jours ~340-360), tous les projets. Leçons liées : `readme-documentation`, `interview-preparation`, `system-design-interview`.
