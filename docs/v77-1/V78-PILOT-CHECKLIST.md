# V78 — LISTE DE CONTRÔLE DU PILOTE

> Une page, à imprimer. Une copie **par participant**.
> `protocolVersion = V78-PILOT-PROTOCOL-1` · scope `V78-SCOPE-HTTP-PRODUCTION`

```
PARTICIPANT ______________________   SESSION_ID ______________________
SÉANCE 1 : ____/____/____  début ____:____   fin ____:____
SÉANCE 2 : ____/____/____  début ____:____   fin ____:____
DÉLAI RÉEL ENTRE ÉTAPE 7 ET ÉTAPE 8 : ______ h    (fenêtre 18–36 h)
```

---

## A · Avant l'arrivée

```
□ AICOS_PROGRESS_FILE pointe un fichier NEUF, hors du dépôt
     chemin : ______________________________________________
□ Ce fichier n'existe pas encore, ou vient d'être supprimé        (N5)
□ AICOS_PILOT_SESSION_ID = ______________________________
□ curl /api/progress → 200
□ /settings affiche les CINQ boutons
□ Aucun déploiement, aucun commit prévu pendant la session        (N8)
□ Script du facilitateur relu                                     (N1)
□ Cette liste imprimée, un stylo
```

---

## B · Accueil

```
□ « On teste le logiciel, pas toi »                        dit
□ « Rater est utile »                                      dit
□ « Je ne pourrai pas t'aider à résoudre »                 dit
□ « Tu peux arrêter quand tu veux, sans te justifier »     dit
□ Procédure participant remise et lue
□ Questions du participant : sur le PROTOCOLE uniquement
```

---

## C · Le compteur d'amorces — **le point le plus fragile du protocole**

> Rien dans un fait de rappel ne dit à quelle étape il appartient. La
> reconstruction ne les distingue que par leur **ordre** et par leur **nombre
> attendu**. Une amorce de trop décale tout, **et rien ne le signale.**

```
PRETEST prérequis  networking-http-tls        [ ] [ ]        exactement 2
PRETEST focal      api-production-contracts   [ ] [ ]        exactement 2
Rappel immédiat    api-production-contracts   [ ]            exactement 1
Rappel différé     api-production-contracts   [ ]            exactement 1

□ Aucune case en trop.  Si débordement → NOTER ICI, ne pas rattraper :
  ______________________________________________________________
```

---

## D · Séance 1

```
ÉTAPE 1 — PRETEST  (oral, enregistré par commande directe : /retention ne propose rien)
  □ amorce 1  discrim   HTTP 404 vs 500              → recalled / partial / failed
  □ amorce 2  cued      méthodes HTTP                → recalled / partial / failed
  □ amorce 3  free      requête de paiement rejouée  → recalled / partial / failed
  □ amorce 4  discrim   compteur vs fenêtre glissante→ recalled / partial / failed
  □ Réponse ÉNONCÉE À VOIX HAUTE avant révélation, pour les quatre
  □ Écart entre ce qui est dit et ce qui est déclaré : ____________________

  DÉCISION :
  □ amorces 3 ET 4 recalled   → PRETEST_HIGH → repli V78-SCOPE-ALGO
      □ le repli plafonne aussi → INVALID (N6), PAS ABORTED — stop
  □ amorces 1 ET 2 failed     → MISSING_PREREQUISITE → INVALID (N7) — stop
  □ ni l'un ni l'autre        → continuer

ÉTAPE 2 — LEÇON  /doc/lessons/api-production-contracts
  □ ouverte      heure ____:____
  □ lue          heure ____:____
  □ aucun commentaire du facilitateur
  ⚠ cette étape ne laisse AUCUN fait — c'est prévu, ce n'est pas un incident

ÉTAPES 3-6 — EXERCICE  /lab/http-rate-limit-decide
  □ premier lancement                        résultat ____/4
  □ échec ?   □ oui → continuer normalement
              □ non → passer à api-pagination-choice
                      □ réussi du premier coup aussi
                        → étapes 3, 4, 5 = NOT_OBSERVED (jamais FAILED)
  □ indice affiché (onglet « Aide »)         □ oui  □ non
  □ nombre de tentatives : ______
  □ double-clic sur « Lancer » observé ?     □ oui → noter  □ non
  □ réussite finale  □ oui  □ non (abandon — ce n'est pas un échec de session)

ÉTAPE 7 — RAPPEL IMMÉDIAT
  □ UNE amorce, format free                  → recalled / partial / failed
  □ heure de fin de séance 1 : ____:____     ← le délai part d'ici
```

---

## E · Séance 2

```
ÉTAPE 8 — RAPPEL DIFFÉRÉ
  □ délai réel : ______ h
      □ dans [18, 36] h
      □ hors fenêtre → enregistrer QUAND MÊME, noter le délai réel
                        (DELAY_OUT_OF_WINDOW — jamais décaler une heure)
      □ > 72 h → session PARTIAL
  □ MÊME question qu'à l'étape 7, mot pour mot, format discrim
  □ résultat → recalled / partial / failed

ÉTAPE 9 — TRANSFERT  /transfer/throttling-everywhere
  □ 3 questions répondues (4 radios · 4 cases · 1 champ libre)
  □ « Corriger mes réponses » cliqué
  □ résultat ____/3            (seuil 0,7)
  □ aucun commentaire du facilitateur, même après correction

ÉTAPE 10 — CONFUSION
  INSTRUCTION_UNCLEAR  ___   moment(s) ______________________________
  UI_CONFUSION         ___   moment(s) ______________________________
  CONCEPT_CONFUSION    ___   moment(s) ______________________________
  TOOL_CONFUSION       ___   moment(s) ______________________________
  BUG                  ___   moment(s) ______________________________
  FATIGUE              ___   moment(s) ______________________________
  OTHER                ___   VERBATIM COMPLET OBLIGATOIRE :
     ___________________________________________________________
  □ part de OTHER ≤ 1/3 ?   □ oui   □ non → H6 FALSIFIÉE (c'est un résultat)

ÉTAPE 11 — DONNÉES
  □ « Télécharger l'archive complète » → fichier remis
  □ suppression demandée ?  □ oui  □ non
      si oui : □ SUPPRIMER saisi   □ archive re-téléchargée DEVANT la personne
               □ elle est vide
```

---

## F · Après — la reconstruction

```
□ Archive de session conservée hors du dépôt
□ node → reconstruireLaSession(archive, fixture)
     manques : ______
     □ 0 manque  → session RECONSTRUCTIBLE
     □ ≥1 manque → NON reconstructible, LISTER lesquels :
        ______________________________________________________
□ Concepts dérivés de la fixture (attendu : EXERCISE_ATTEMPT_FAIL,
  EXERCISE_ATTEMPT_RETRY — un échec d'exercice ne porte aucun concept)
```

---

## G · Statut de la session — **un seul**

```
□ COMPLETE   étapes 1 → 11, dans l'ordre, délai dans la fenêtre
□ PARTIAL    étapes 1 → 7 faites, pas de rappel différé sous 72 h
□ ABORTED    interrompue (§H) — hors du dénominateur, COMPTÉE ET DÉCRITE
□ INVALID    non interprétable (§I) — hors du dénominateur, COMPTÉE ET DÉCRITE

Raison (si ABORTED ou INVALID) : ________________________________
```

> Une session écartée **sort du dénominateur, jamais du rapport**. Un pilote qui
> ne publie que ses sessions réussies ne publie rien.

---

## H · Arrêt de la session → `ABORTED`

```
□ la personne demande à s'arrêter (sans justification)
□ fatigue ou gêne manifestée
□ défaut produit non contournable sans sortir du script en 10 min
□ perte de données constatée
□ LE FACILITATEUR A DONNÉ UNE AIDE HORS SCRIPT
```

## I · Session non interprétable → `INVALID`

```
□ N1  aide, explication ou correction hors script
□ N2  le participant connaissait déjà ces exercices exacts
□ N3  protocolVersion différente de V78-PILOT-PROTOCOL-1
□ N4  anomalie d'horloge serveur
□ N5  fichier de progression partagé ou non réinitialisé
□ N6  plafond au PRETEST sur le scope principal ET sur le repli
□ N7  prérequis absent
□ N8  le produit a été modifié entre deux étapes
```

## J · Arrêt de TOUT le pilote

```
□ A1  2 des 3 premières sessions ABORTED pour défaut produit
□ A2  l'instrumentation modifie ce qu'elle observe
□ A3  une donnée d'apprenant non supprimable ou non exportable comme promis
□ A4  une donnée d'apprenant perdue ou exposée
□ A5  version de protocole appliquée ≠ version gelée

A2, A3, A4 → les sessions déjà conduites sous cette version sont
             RÉTROACTIVEMENT invalidées.
```

---

## K · Ce que cette session NE permettra PAS de conclure

```
✗ que le participant a appris
✗ que la rétention s'améliore
✗ que le transfert fonctionne
✗ un gain, un effet, un pourcentage

✓ « la trace de cette session était / n'était pas intégralement
    reconstructible à partir du seul export — et voici ce qui manquait »
```
