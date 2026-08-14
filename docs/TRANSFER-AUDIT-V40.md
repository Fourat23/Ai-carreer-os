# Audit des questions TRANSFER (V39) — Sprint V40, CP3

> Audit honnête des 16 questions marquées `TRANSFER` dans `data/assessments/*.json`. Le nom `TRANSFER`
> n'est jamais une preuve : chaque question est notée contre une grille explicite. Objectif : ne pas
> gonfler artificiellement, et identifier ce que les capstones V40 doivent porter (transfert profond).

## Grille (4 critères, chacun oui/partiel/non)
1. **Contexte nouveau** — la situation change de domaine, sans reprendre le patron d'apprentissage.
2. **Informations concurrentes** — des distracteurs plausibles obligent à discriminer.
3. **Multi-étapes** — répondre demande plus d'une inférence (ex. identifier le phénomène ET la parade).
4. **Au-delà de la reconnaissance** — l'apprenant doit MOBILISER le principe, pas seulement reconnaître
   une analogie déjà formulée.

Verdicts : **T+** = transfert solide (near-transfer robuste) · **T–** = transfert léger (near-transfert
par reconnaissance d'analogie, single-hop) · **≠T** = à reclasser (aucune ici).

## Résultats

| Évaluation :: q | Contexte nouveau | Infos concurrentes | Multi-étapes | Au-delà reconnaissance | Verdict |
|---|---|---|---|---|---|
| foundations-algorithmic-thinking :: q5 | oui | oui | partiel | oui (principe non nommé) | **T+** |
| sql-data-integrity :: q5 | oui (hors BD) | oui | oui | oui | **T+** |
| security-fundamentals :: q5 | oui (prompt injection) | oui | oui | oui | **T+** |
| software-engineering-quality :: q5 | oui (décision business) | oui | oui | oui | **T+** |
| ml-foundations :: q5 | oui (école) | oui | oui (phénomène + parade) | oui | **T+** |
| distributed-systems-failures :: q5 | oui (agenda) | oui | oui (phénomène + parade) | oui | **T+** |
| js-language-foundations :: q6 | oui (autre langage) | oui | oui (principe + contrainte) | oui | **T+** |
| http-api-contracts :: q6 | oui (bibliothèque) | oui | partiel | oui | **T+** |
| cloud-devops-delivery :: q5 | oui (magasins) | partiel | partiel | oui | **T+/–** |
| async-messaging-queues :: q5 | oui (restaurant) | partiel | non | partiel (analogie fournie) | **T–** |
| system-design-scaling :: q6 | oui (supermarché) | partiel | non | partiel | **T–** |
| containers-kubernetes :: q5 | oui (thermostat) | non | non | partiel (analogie fournie) | **T–** |
| git-linux-workflow :: q5 | oui (document) | partiel | non | partiel | **T–** |
| observability-incident :: q5 | oui (atelier) | partiel | non | partiel | **T–** |
| react-frontend-state :: q5 | oui (autre outil) | partiel | non | partiel | **T–** |
| llm-rag-systems :: q5 | oui (examen livre ouvert) | partiel | non | partiel | **T–** |

**Synthèse : 8 T+ · 1 T+/– · 7 T–. 0 question mal étiquetée (aucune n'est en réalité RECALL/UNDERSTANDING/
APPLICATION-même-domaine).** Toutes opèrent un vrai changement de contexte (critère définitoire du
transfert) ; aucune n'est de la mémorisation déguisée.

## Décision (honnête, sans gonflage)
- **Aucun reclassement en RECALL/APPLICATION** : ce serait FAUX, car ces questions changent de domaine.
  Downgrader « transfert » en « application » (même domaine) serait moins exact, pas plus.
- **Constat de profondeur assumé** : les 7 **T–** sont du near-transfer *single-hop* — l'analogie est
  fournie, l'apprenant reconnaît le principe. C'est un transfert réel mais léger. Les 8 **T+** exigent de
  mobiliser le principe non nommé, de discriminer, ou de produire deux éléments (phénomène + parade).
- **Ce que V40 apporte** : le transfert PROFOND et MULTI-ÉTAPES (celui que ces questions isolées ne
  peuvent pas porter) est désormais assuré par les **capstones** — situations ambiguës où l'apprenant
  enchaîne hypothèses → investigation → diagnostic → décision → validation, avec artefacts (signal + bruit)
  et sans que la cause soit donnée. C'est là que se joue le transfert d'ingénieur, pas dans un MCQ.

## Amélioration appliquée
Plutôt que de réétiqueter (malhonnête), V40 **complète** le dispositif : chaque domaine T– dispose
désormais d'un capstone (ou d'un capstone couvrant le domaine) qui exige un transfert profond. Les
questions T– restent utiles comme amorce de near-transfert dans les diagnostics ; le poids du transfert
lourd bascule vers les capstones. Aucune inflation de compteur, aucune promesse trompeuse.

## Frontière honnête
Ces verdicts sont des jugements d'un seul auteur sur la base de la grille ; ils décrivent la STRUCTURE
des questions, pas un apprentissage mesuré. Le score reste un PROXY.
