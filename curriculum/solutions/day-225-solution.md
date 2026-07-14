# Correction — Jour 225 : DocQA v0 sur ton corpus

[← Retour au jour 225](../days/day-225.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
La valeur de v0 n'est pas son score (il sera moyen — c'est attendu) mais la qualité de la récolte : 15 questions variées écrites avant, trois verdicts par question dont le décisif « bon chunk dans top-k », et un journal brut. Le tri retrieval/génération est ce qui rend l'amélioration PILOTABLE.

## ⚠️ Erreurs probables et points à vérifier
- Corriger au fil de l'eau : chaque retouche invalide les mesures précédentes — la passe se fait à système GELÉ.
- Des questions calquées sur les documents (mêmes mots) : tu testes la mémorisation, pas l'usage réel — les reformulées sont là pour ça.
- Juger « réponse OK » sans vérifier les citations : une bonne réponse avec citations fausses est un échec de confiance.
- Conclure « le RAG est mauvais » au lieu de compter OÙ il échoue : v0 sert à localiser, pas à noter.

## 🔍 Comment vérifier ta solution
- 15/15 lignes de grille remplies, les 3 verdicts partout.
- Le compte final sépare échecs retrieval / échecs génération / refus corrects.
- Au moins une surprise notée au journal (il y en a toujours).
- Le système n'a pas changé d'un octet pendant la passe.

## 🎤 À savoir expliquer à l'oral
Présente ta grille comme un résultat d'audit : « 9/15 correctes ; 4 échecs, dont 3 de retrieval concentrés sur les questions reformulées — le chantier prioritaire est donc le retrieval, pas le prompt ». Diagnostiquer avant de traiter : c'est LA posture qui te vend.
