# Correction — Jour 282 : Les 4 patterns de workflow

[← Retour au jour 282](../days/day-282.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Solution simple : implémenter chaque pattern isolément (chaînage, parallélisation, routage, évaluateur-optimiseur). Solution améliorée : associer chaque pattern à son SIGNAL de choix (complexité/indépendance/hétérogénéité/qualité itérable), comprendre pourquoi chacun garde les vertus du workflow (prévisibilité, testabilité), et les COMBINER sur un cas réel. La compétence est la reconnaissance du pattern adapté, pas la récitation des quatre.

## ⚠️ Erreurs probables et points à vérifier
- Tout résoudre avec un seul pattern (souvent le chaînage) : un système réel COMBINE les patterns selon les besoins de chaque partie.
- Confondre évaluateur-optimiseur et agent : dans le premier les rôles sont FIXES et la boucle bornée — pas de décision libre de flux.
- Paralléliser des appels dépendants : si l'étape B a besoin de la sortie de A, la parallélisation casse — elle exige l'INDÉPENDANCE.
- Ne pas reconnaître le signal de choix : appliquer un pattern par habitude au lieu de le choisir sur la nature de la tâche.

## 🔍 Comment vérifier ta solution
- Les 4 patterns sont implémentés sur des cas minimaux.
- Chaque pattern est associé à son signal de déclenchement.
- Une COMPOSITION de deux patterns sur un cas réel est réalisée (variante).
- La distinction évaluateur-optimiseur vs agent (rôles fixes, boucle bornée) est claire.
- Le choix du pattern se fait sur la nature de la tâche, pas par habitude.

## 🎤 À savoir expliquer à l'oral
Déroule les 4 patterns avec leur signal en 60 secondes : « complexité → chaînage, indépendance → parallélisation, hétérogénéité → routage, qualité itérable → évaluateur-optimiseur ». Puis la clé : « les systèmes réels les COMPOSENT, et chacun garde la prévisibilité du workflow ». Un vocabulaire de composition, c'est ce qui distingue l'architecte du bricoleur de prompts.
