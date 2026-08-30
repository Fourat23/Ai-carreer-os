#!/usr/bin/env bash
# V70 — vérification exécutée des affirmations publiées dans
# curriculum/lessons/linux-filesystem-permissions.md (exemple guidé).
#
# On crée de vrais fichiers, on applique de vrais droits, et on tente de
# vraies opérations. Chaque « REFUSÉ » est un refus réel du noyau.
#
# IMPORTANT — root CONTOURNE les vérifications de permissions. Exécuté en
# root, ce script imprimerait « AUTORISÉ » partout et ne démontrerait rien.
# On se rabaisse donc à un utilisateur ordinaire (nobody) pour chaque
# tentative d'accès. C'est aussi le premier enseignement de la leçon.
#
# Exécution : bash scripts/v70-verifications/linux-permissions.sh
set -u

if [ "$(id -u)" -eq 0 ]; then
  comme() { setpriv --reuid=65534 --regid=65534 --clear-groups "$@"; }
  echo "(exécuté en root ; les accès sont tentés en tant que nobody)"
else
  comme() { "$@"; }
  echo "(exécuté en utilisateur ordinaire)"
fi

D=$(mktemp -d); chmod 755 "$D"; cd "$D"
essai() { if comme sh -c "$2" >/dev/null 2>&1; then echo "     $1 → AUTORISÉ"; else echo "     $1 → REFUSÉ"; fi; }

printf '#!/bin/sh\necho ok\n' > f.sh
echo
echo "=== 1. les trois bits sur un FICHIER (droits d'autrui) ==="
for mode in 000 004 002 006 001 005 007; do
  # on RECRÉE le script à chaque tour : sinon le test d'écriture du tour
  # précédent y a ajouté une ligne, et le test d'exécution échouerait pour
  # une erreur de script et non pour un refus de permission.
  printf '#!/bin/sh\necho ok\n' > f.sh
  chmod "$mode" f.sh
  printf "  %s (%s)\n" "$mode" "$(ls -l f.sh | cut -c1-10)"
  essai "lire    " "cat $PWD/f.sh"
  essai "écrire  " "echo x >> $PWD/f.sh"
  essai "exécuter" "$PWD/f.sh"
done

echo
echo "=== 2. les mêmes bits sur un RÉPERTOIRE : ils ne veulent pas la même chose ==="
mkdir -p d && echo secret > d/interieur.txt && chmod 644 d/interieur.txt
for mode in 000 004 001 005 003 007; do
  chmod "$mode" d
  printf "  %s (%s)\n" "$mode" "$(ls -ld d | cut -c1-10)"
  essai "lister le contenu     " "ls $PWD/d"
  essai "lire un fichier connu " "cat $PWD/d/interieur.txt"
  essai "créer un fichier      " "touch $PWD/d/n$mode"
done

echo
echo "=== 3. le cas qui surprend : r sans x, et x sans r ==="
chmod 004 d
echo "  répertoire en ---r-- : on voit les NOMS, on n'ouvre RIEN"
essai "ls d                  " "ls $PWD/d"
essai "cat d/interieur.txt   " "cat $PWD/d/interieur.txt"
chmod 001 d
echo "  répertoire en -----x : on ne LISTE pas, mais on ouvre si on connaît le nom"
essai "ls d                  " "ls $PWD/d"
essai "cat d/interieur.txt   " "cat $PWD/d/interieur.txt"

echo
echo "=== 4. umask : pourquoi un fichier neuf n'est jamais exécutable ==="
chmod 777 d
for u in 022 077 002 000; do
  ( umask "$u"; touch "d/um$u"; mkdir -p "d/dm$u" )
  printf "  umask %s → fichier %s   répertoire %s\n" "$u" \
    "$(stat -c %a "d/um$u")" "$(stat -c %a "d/dm$u")"
done
echo "  règle : fichier = 666 & ~umask,  répertoire = 777 & ~umask"

echo
echo "=== 5. supprimer un fichier : c'est le RÉPERTOIRE qui décide ==="
chmod 777 d
echo x > d/cible.txt && chmod 000 d/cible.txt
echo "  fichier en 000 (aucun droit pour personne), répertoire en 777 :"
essai "rm d/cible.txt        " "rm -f $PWD/d/cible.txt"
echo "  → supprimer un fichier modifie le RÉPERTOIRE, pas le fichier."
chmod 555 d
echo x > d/cible2.txt && chmod 666 d/cible2.txt
echo "  fichier en 666 (tout le monde peut écrire), répertoire en 555 (pas de w) :"
essai "écrire dans le fichier" "echo y >> $PWD/d/cible2.txt"
essai "supprimer le fichier  " "rm -f $PWD/d/cible2.txt"

cd /; rm -rf "$D"
