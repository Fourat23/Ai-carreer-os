# Prompt V67 — proposé, **à ne pas lancer sans décision humaine**

> Le brief V66 interdit explicitement de lancer V67. Ce document est une
> proposition argumentée, fondée sur ce que V66 a mesuré et sur ce qu'il a
> laissé ouvert. Rien ici n'a été commencé.

---

## Ce que V66 laisse sur la table, par ordre de gravité mesurée

| | Dette | Mesure | Traité en V66 ? |
|---|---|---|---|
| **1** | La charge annoncée ne correspond à rien | contenu fourni = **25 %** des 4 h 30 ; **267 / 365** journées sans budget d'activité ; **52 revues** à 3 % | **non** |
| **2** | 62 leçons de famille A gardent un noyau qui nomme au lieu d'expliquer | noyau médian **265 mots**, sans structure interne | **non** |
| **3** | Le moteur de rétention n'a jamais tourné sur des tentatives humaines | 0 tentative réelle | **non** (hors de portée) |
| **4** | La correction pédagogique se dégrade au fil de l'année | 100 % (M1-M3) → **42 %** (M10-M12) | **non** |
| **5** | `detailed` de `program.json` ne recouvre aucune différence réelle | 4 079 vs 3 727 mots | documenté seulement |

---

## Le sujet que je proposerais pour V67

**« LEARNING LOAD ENGINE — dire ce qu'on fait, combien de temps, et à quoi on
reconnaît qu'on a fini. »**

C'est la dette n°1, c'est la seule que l'apprenant subit **tous les jours**, et
c'est celle qui bloque la réponse à la question du §26 de V66 bien plus que la
densité des textes. Le produit annonce 1 642 heures et en décrit environ 400.

Ce sprint ne demanderait **aucune réécriture de cours**. Il demanderait au
produit de rendre explicite ce que le corpus laisse implicite.

### Ce qu'il faudrait mesurer d'abord (CP0, lecture seule)

1. Pour chaque journée, la liste des **activités réellement demandées** —
   déduite du corpus, pas inventée : livrable annoncé, exercice lié, critères de
   validation, questions de réflexion.
2. Combien d'entre elles portent un **critère d'arrêt** vérifiable (« c'est fini
   quand… ») plutôt qu'une intention (« comprendre X »).
3. Ce que les **52 revues hebdomadaires** demandent réellement, et pourquoi
   elles annoncent 4 h 30 pour 9 minutes de matière. Deux hypothèses à départager
   par lecture : soit la revue attend un travail personnel non décrit, soit la
   durée de 4,5 h est appliquée mécaniquement à toutes les journées.
4. Un échantillon gelé, une seed publiée, un barème gelé — même discipline
   qu'en V66, et les mêmes règles absolues sur les métriques.

### Ce qu'il faudrait construire

- Un **modèle de charge** dérivé du corpus, jamais déclaré à la main, qui
  distingue le temps de CONSOMMATION (calculable) du temps de PRODUCTION
  (à décrire, pas à deviner).
- Une **surface honnête sur la journée** : ce qui est fourni, ce qui est
  attendu, et — quand le produit ne sait pas — le dire, au lieu d'afficher
  « 4,5 h » sur les 365 journées.
- Un **critère d'arrêt par activité**, dérivé des critères de validation qui
  existent déjà dans le corpus, et signalé quand il manque.

### Ce qu'il ne faudrait PAS faire

- Ne pas fabriquer des durées par règle de trois pour remplir la case. Une durée
  inventée est pire que pas de durée : elle a l'air d'un engagement.
- Ne pas retoucher les 365 journées pour y écrire des minutes. Le corpus est le
  matériau ; c'est le produit qui doit devenir honnête sur ce qu'il en sait.
- Ne pas déclarer `ACADEMIC_QUALITY_READY`. Il resterait 62 leçons de famille A.

---

## Alternative défendable, si la priorité est la pédagogie plutôt que la charge

**« FLAGSHIP HARDENING II — les 62 leçons de famille A restantes. »**

Le modèle éditorial est désormais prouvé sur neuf leçons, avec un avant/après
mesuré et deux tests (mots-clés, Feynman). Le travail est répétitif, long, et
sans risque de conception. Il faudrait le faire par lots, chaque lot passant les
mêmes tests, et **jamais en génération massive** — la règle 12 de V66 vaut
toujours, et la preuve qu'elle exigeait ne couvre que le format, pas le contenu
de 62 sujets différents.

Je recommande la charge (n°1) avant le durcissement (n°2) : un cours excellent
dans un cadre horaire mensonger reste un cursus qu'on abandonne au bout de trois
semaines.

---

## Ce qui doit rester intact, quel que soit le sujet retenu

- Le Curriculum 1.0 : 365 journées, ordre strict, aucune suppression.
- Le modèle de compétence de V65/V65.1 : un état se projette depuis des preuves.
- Le modèle de rétention de V66 : un seul fait écrit, tout le reste projeté,
  aucun état fabricable.
- L'absence de toute mécanique de récompense.
- La discipline de mesure : échantillon et barème gelés avant lecture, faux
  positifs publiés, chaque règle de gate vue échouer.
