# V78 — CE QUE TU VAS FAIRE

> À lire avant de commencer. Deux pages, et rien à préparer.
>
> `protocolVersion = V78-PILOT-PROTOCOL-1`

---

## 1. Ce qu'on teste, et ce qu'on ne teste pas

**On teste un logiciel, pas toi.**

Plus précisément : on vérifie que le système sait **raconter fidèlement** ce qui
s'est passé pendant que tu travailles. Est-ce qu'il note ce que tu as tenté,
quand, sur quelle notion, avec quel résultat ? C'est tout.

| ce qui nous intéresse | ce qui ne nous intéresse pas |
|---|---|
| ce que le logiciel a noté de ta séance | si tu as réussi l'exercice |
| ce qui t'a bloqué, et où | ta vitesse |
| ce que tu n'as pas compris dans un énoncé | ton niveau |

**Rater un exercice est utile.** C'est même la partie du protocole qui apprend
le plus : un échec suivi d'un indice puis d'une nouvelle tentative est
exactement ce qu'on a besoin de voir passer. Si tout réussit du premier coup,
la séance nous apprend moins.

**Personne ne verra une note.** Il n'y en a pas : le produit ne calcule aucun
score, aucun classement, aucun pourcentage de maîtrise.

---

## 2. Combien de temps, et quand

**Deux séances.**

| | quand | durée | ce qui s'y passe |
|---|---|---|---|
| **Séance 1** | jour J | ~1 h 15 | tout, sauf la dernière question |
| **Séance 2** | **le lendemain** | ~15 min | une question de rappel, puis un dernier exercice de raisonnement |

L'écart entre les deux compte : on vise **24 heures**, et tout ce qui tombe
entre **18 h et 36 h** convient. Reviens à l'heure qui t'arrange le lendemain.

Si tu ne peux pas revenir, dis-le : la séance reste utile, elle sera simplement
notée comme incomplète. **Ce n'est pas un problème et ça ne se rattrape pas en
trichant sur l'heure.**

---

## 3. Le déroulé, étape par étape

### Séance 1

1. **Deux questions de départ** sur les bases de HTTP, puis **deux** sur le
   sujet du jour. Tu réponds **à voix haute** avant d'afficher la réponse, et tu
   dis honnêtement si tu savais, si tu savais à moitié, ou si tu ne savais pas.
   **« Je ne savais pas » est la réponse la plus utile de la journée** — c'est ce
   qui permettra de voir si quelque chose a changé demain.
2. **Tu lis une leçon** : *API de production — idempotence, pagination, limites
   et versions*. Environ 2 900 mots, quatorze sections. Lis normalement ; tu
   n'as pas à la mémoriser.
3. **Tu fais un exercice** dans le Laboratoire : un limiteur de débit à fenêtre
   glissante. Le code de départ contient **déjà un bug** — c'est voulu.
4. **Tu lances les tests.** Ils échoueront. Le produit affichera un **indice**.
5. **Tu réessaies.** Autant de fois que tu veux.
6. **Tu réussis** — ou tu t'arrêtes, et c'est une réponse aussi.
7. **Une question de rappel**, tout de suite après, sur ce que tu viens de voir.

### Séance 2, le lendemain

8. **La même question de rappel**, un jour plus tard.
9. **Un défi de transfert** : trois questions sur la même idée, dans un
   contexte qui n'a rien à voir avec une API. C'est fait pour être difficile,
   et se tromper n'est pas grave.
10. **On parle cinq minutes** de ce qui t'a bloqué.
11. **Tu récupères tes données** si tu le souhaites (§5).

---

## 4. Ce qu'on te demande de faire pendant

**Dis ce que tu penses à voix haute.** Surtout quand quelque chose te gêne.
Toutes ces phrases nous sont utiles :

> « Je ne comprends pas ce qu'on me demande. »
> « Je ne sais pas où cliquer. »
> « Je comprends la question, je ne sais pas la faire. »
> « Là, c'est mon éditeur qui m'embête, pas l'exercice. »
> « Je crois que ça a bugué. »
> « Je fatigue. »

Les six catégories ci-dessus sont celles que nous notons. **Dire laquelle
s'applique nous aide plus qu'une longue explication.**

**La personne qui t'accompagne ne t'aidera pas à résoudre l'exercice.** Ce n'est
pas de la sévérité : si elle t'explique quelque chose, la séance devient
ininterprétable et le temps que tu nous donnes est perdu. Elle peut en revanche
t'aider sur ton clavier, ton navigateur, ton éditeur — **ça, ce n'est pas
tricher.**

**Tu peux t'arrêter quand tu veux, sans te justifier.** Il suffit de le dire.

---

## 5. Tes données

Tout reste **sur cette machine**. Aucun compte, aucun envoi, aucun service tiers.

| ce que la machine garde | où |
|---|---|
| ta progression : ce que tu as tenté, quand, avec quel résultat | un fichier local |
| **le code que tu écris**, à chaque essai, réussi ou raté | un dossier local |

À tout moment, dans **Sauvegarde** :

- **« Exporter toutes mes données »** télécharge un fichier avec **tout** ce que
  cette machine détient de toi, **ton code compris** ;
- **« Supprimer toutes mes données »** efface tout, **définitivement**, sans
  copie de secours. Il faut saisir `SUPPRIMER` pour confirmer.

*(« Réinitialiser ma progression » est autre chose : ça remet les compteurs à
zéro mais garde une copie et ton code. Ce n'est pas une suppression, et
l'interface le dit.)*

Le détail est dans `V78-DATA-RIGHTS.md`, et tu peux le demander.

---

## 6. Les cinq choses à retenir

1. **On teste le logiciel, pas toi.**
2. **Rater est utile.** Rater puis réessayer l'est encore plus.
3. **Parle à voix haute**, surtout quand ça coince.
4. **Reviens le lendemain**, à l'heure que tu veux.
5. **Tu peux tout arrêter, tout emporter, tout effacer** — à tout moment, sans
   te justifier.
