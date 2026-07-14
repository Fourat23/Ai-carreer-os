# Correction — Jour 260 : Prompt injection : attaque

[← Retour au jour 260](../days/day-260.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
Le red teaming couvre les deux surfaces (directe et surtout indirecte via document piégé) et plusieurs objectifs (exfiltration, détournement, DoS, désinformation), documente chaque tentative objectivement (payload, résultat, réussite), et réussit au moins une injection — car la défense de demain se conçoit contre des attaques VUES fonctionner. L'injection indirecte est la menace spécifique du RAG à démontrer absolument.

## ⚠️ Erreurs probables et points à vérifier
- Ne tester que l'injection directe (dans la question) : c'est la surface évidente ; l'INDIRECTE (document piégé) est la vraie menace RAG, et celle que tout le monde oublie.
- Se contenter d'attaques qui échouent et conclure « mon système est sûr » : sans réussite, tu n'as pas trouvé les limites — insiste jusqu'à en réussir une, c'est le but.
- Juger le succès subjectivement : définis l'objectif AVANT (exfiltration = le system prompt apparaît ; détournement = le comportement change) pour un verdict objectif.
- Attaquer un système de production sans autorisation : le red teaming se fait sur TON système, dans un cadre autorisé — la même éthique que le pentesting.

## 🔍 Comment vérifier ta solution
- 5 tentatives documentées couvrant directe ET indirecte, plusieurs objectifs.
- Au moins un document piégé créé, indexé, et son injection indirecte testée sur une question normale.
- Au moins une injection RÉUSSIT (sinon les payloads sont trop faibles — durcis-les).
- Chaque tentative a un verdict objectif basé sur un objectif défini a priori.
- La profondeur de l'injection indirecte (payload noyé dans un long doc) est testée (variante).

## 🎤 À savoir expliquer à l'oral
Explique l'injection indirecte avec un scénario concret : « je n'accède pas à ton assistant RH ; je fais juste indexer un PDF anodin contenant, en bas, une instruction cachée — elle dort dans l'index jusqu'à ce qu'une question la réveille ». Puis le parallèle SQL : « données non fiables prises pour des instructions ». Cette menace, bien racontée, montre que tu penses en attaquant — rare et précieux.
