# Correction — Jour 1 : Installation de l'environnement et premiers pas au terminal

[← Retour au jour 1](../days/day-001.md)

> ⛔ **Ne lis cette correction qu'après avoir vraiment tenté seul.** Une correction n'est pas une réponse à copier : c'est un outil pour comprendre ta démarche.

## 🧠 La logique attendue
L'exercice teste une seule chose : ton modèle mental de l'arbre de fichiers. À chaque commande, demande-toi : OÙ suis-je (`pwd`) ? OÙ est ma cible ? Le chemin que je tape part-il d'ici (relatif) ou de la racine (absolu) ?

## ✅ Une solution simple
```bash
mkdir -p ia-lab/notes ia-lab/scripts ia-lab/data
cd ia-lab
echo "Premier jour du programme AI Career OS" > notes/jour-01.md
cp notes/jour-01.md data/backup-jour-01.md
echo 'console.log("Jour 1 : environnement OK");' > scripts/hello.js
node scripts/hello.js
mv data archives
cat notes/jour-01.md
rm archives/backup-jour-01.md
rmdir archives        # ou rm -r archives s'il n'est pas vide
node scripts/hello.js # depuis ia-lab/ : chemin relatif scripts/hello.js
```

## 🚀 Une solution améliorée
Version pro : `mkdir -p` crée toute l'arborescence en une commande (le `-p` crée les parents manquants). `rmdir` ne marche que sur un dossier vide — c'est un garde-fou volontaire, préfère-le à `rm -r` quand tu t'attends à ce que ce soit vide.

## ⚠️ Erreurs probables et points à vérifier
- Étape 8 ratée = tu as fait `cd scripts` puis `node hello.js` : refais-la depuis `ia-lab/` avec `node scripts/hello.js`
- echo avec des guillemets simples vs doubles : les doubles interprètent les variables ($X), les simples non
- rm sans réfléchir : prends l'habitude de faire `ls` AVANT `rm`

## 🔍 Comment vérifier ta solution
- `find ia-lab` (ou `ls -R ia-lab`) montre exactement : notes/jour-01.md et scripts/hello.js
- Le script affiche bien le message
- `history | tail -30` raconte une session propre, pas 50 essais aléatoires

## ❓ Réponses du mini-quiz
1. **Quelle est la différence entre un chemin absolu et un chemin relatif ?**
   → L'absolu part de la racine `/` et est valable depuis n'importe où ; le relatif part du dossier courant et dépend d'où on se trouve.
2. **Que fait `cd ..` ?**
   → Remonte d'un niveau vers le dossier parent.
3. **Que fait `node script.js` exactement ?**
   → Lance le moteur Node.js, qui lit le fichier script.js, l'interprète comme du JavaScript et l'exécute ; la sortie (console.log) s'affiche dans le terminal.
4. **Comment créer un dossier `test` puis un fichier vide `a.txt` dedans, en 2 commandes ?**
   → `mkdir test` puis `touch test/a.txt`.

## 🧩 Questions de réflexion
- Pourquoi les développeurs préfèrent-ils le terminal à l'explorateur pour ces tâches ? (indice : répétabilité, scripts)
- Que se passerait-il si tu exécutais `node hello.js` depuis `ia-lab/` ? Pourquoi cette erreur est-elle en fait une bonne nouvelle (message clair) ?
