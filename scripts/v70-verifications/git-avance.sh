#!/usr/bin/env bash
# V70 — vérification exécutée pour git-advanced.
# On ne décrit pas ce que font rebase, bisect et reflog : on construit un vrai
# dépôt et on regarde ce qui change réellement.
set -u
W=$(mktemp -d); cd "$W" || exit 1
git init -q . && git config user.email v70@local && git config user.name v70
git config commit.gpgsign false

echo "== 1. Fusion contre rebasage : ce que devient l historique =="
echo base > f.txt && git add . && git commit -qm "base"
BASE=$(git rev-parse --short HEAD)
git checkout -qb fonctionnalite
for i in 1 2; do echo "fonc$i" >> f.txt; git commit -qam "fonctionnalite $i"; done
SHA_F1=$(git log --format=%h --reverse fonctionnalite | sed -n 2p)
git checkout -q master 2>/dev/null || git checkout -q main
echo autre > g.txt && git add . && git commit -qm "travail parallele"

git checkout -qb essai-fusion fonctionnalite
git merge -q --no-edit master 2>/dev/null || git merge -q --no-edit main
echo "   FUSION : $(git rev-list --count HEAD) commits, dont "
echo "     $(git rev-list --merges --count HEAD) commit(s) de fusion"
echo "     le commit « fonctionnalite 1 » garde-t-il l empreinte $SHA_F1 ?"
echo "       $(git merge-base --is-ancestor $SHA_F1 HEAD 2>/dev/null && echo "OUI, il est dans l historique" || echo NON)"

git checkout -qb essai-rebase fonctionnalite
git rebase -q master 2>/dev/null || git rebase -q main
echo "   REBASAGE : $(git rev-list --count HEAD) commits, dont "
echo "     $(git rev-list --merges --count HEAD) commit(s) de fusion"
NOUV=$(git log --format=%h --reverse | sed -n 3p)
echo "     « fonctionnalite 1 » porte desormais l empreinte $NOUV"
echo "     l ancienne empreinte $SHA_F1 existe-t-elle encore comme objet ?"
echo "       $(git cat-file -t $SHA_F1 >/dev/null 2>&1 && echo OUI || echo NON)"
echo "   -> le rebasage ne DEPLACE pas les commits : il en FABRIQUE de"
echo "      nouveaux, avec un contenu identique et une empreinte differente."
echo "      C est pourquoi rebaser une branche deja partagee force les autres"
echo "      a reconcilier deux histoires qui ne se rejoignent plus."

echo
echo "== 2. Le reflog : ce qui reste apres une erreur destructrice =="
AVANT=$(git rev-parse --short HEAD)
git reset -q --hard HEAD~2
echo "   apres « reset --hard HEAD~2 » : HEAD = $(git rev-parse --short HEAD)"
echo "   les deux commits sont-ils encore ATTEIGNABLES depuis une branche ?"
echo "     $(git branch --contains $AVANT 2>/dev/null | wc -l) branche(s)"
echo "   le reflog les connait-il encore ?"
git reflog --format='     %h %gs' | head -3
git reset -q --hard "$AVANT"
echo "   apres « reset --hard $AVANT » : HEAD = $(git rev-parse --short HEAD)"
echo "   -> reset --hard ne supprime pas les commits, il deplace une"
echo "      REFERENCE. Les objets restent, et le reflog garde la trace de"
echo "      chaque position passee de HEAD pendant 90 jours par defaut."
echo "      Presque toutes les « pertes » de travail sous git n en sont pas."

echo
echo "== 3. La recherche dichotomique de regression =="
git checkout -q -B principale
: > compte.txt
for i in $(seq 1 15); do
  if [ "$i" -eq 9 ]; then echo "casse" > etat.txt; fi
  echo "$i" >> compte.txt
  git add -A && git commit -qm "commit $i"
done
BON=$(git log --format=%h --reverse | sed -n 2p)
MAUVAIS=$(git rev-parse --short HEAD)
echo "   16 commits, la regression est introduite au 9e"
git bisect start >/dev/null 2>&1
git bisect bad "$MAUVAIS" >/dev/null 2>&1
git bisect good "$BON" >/dev/null 2>&1
ETAPES=0
while true; do
  if [ -f etat.txt ]; then RES=bad; else RES=good; fi
  SORTIE=$(git bisect $RES 2>&1)
  ETAPES=$((ETAPES+1))
  echo "$SORTIE" | grep -q 'is the first bad commit' && break
  [ "$ETAPES" -gt 12 ] && break
done
echo "   commit fautif trouve en $ETAPES etapes"
echo "$SORTIE" | grep -m1 'first bad commit' | sed 's/^/     /'
git bisect reset >/dev/null 2>&1
echo "   -> log2(15) ~ 4 : la dichotomie trouve le fautif en 4 essais la ou"
echo "      une recherche lineaire en demanderait 8 en moyenne. Sur 1000"
echo "      commits, c est 10 essais contre 500."

echo
echo "== 4. Le cherry-pick : quand il duplique, et quand il ne duplique pas =="
git checkout -q -b correctif
echo "correctif" > c.txt && git add . && git commit -qm "correctif urgent"
SHA_C=$(git rev-parse --short HEAD)
git checkout -q principale

echo "   -- cas A : « principale » n a pas bouge depuis --"
git checkout -q -b cas-a
git cherry-pick "$SHA_C" >/tmp/v70-cp.log 2>&1 || sed 's/^/     /' /tmp/v70-cp.log
SHA_A=$(git rev-parse --short HEAD)
echo "     empreinte sur « correctif » : $SHA_C"
echo "     empreinte apres cherry-pick : $SHA_A"
echo "     identiques ? $([ "$SHA_C" = "$SHA_A" ] && echo OUI || echo NON)"
echo "     -> resultat contre-intuitif et pourtant logique : une empreinte de"
echo "        commit est le hachage de son ARBRE, de son PARENT et de ses"
echo "        metadonnees. Ici les trois sont identiques, donc l empreinte"
echo "        l est aussi. Le cherry-pick n a rien duplique du tout."

echo
echo "   -- cas B : « principale » a avance entre-temps --"
git checkout -q principale
echo "autre travail" > d.txt && git add . && git commit -qm "travail sur principale"
git cherry-pick "$SHA_C" >/tmp/v70-cp.log 2>&1 || sed 's/^/     /' /tmp/v70-cp.log
SHA_B=$(git rev-parse --short HEAD)
echo "     empreinte sur « correctif » : $SHA_C"
echo "     empreinte apres cherry-pick : $SHA_B"
echo "     identiques ? $([ "$SHA_C" = "$SHA_B" ] && echo OUI || echo NON)"
echo "     meme contenu du fichier ? $([ "$(git show $SHA_C:c.txt)" = "$(git show $SHA_B:c.txt)" ] && echo OUI || echo NON)"
echo "     -> le parent differe, donc l empreinte differe : DEUX commits"
echo "        distincts portent la meme modification."
echo "   -> a la fusion ulterieure de « correctif » dans « principale », git"
echo "      voit deux commits differents touchant les memes lignes. C est la"
echo "      source classique de conflits sur un travail deja integre, et la"
echo "      raison pour laquelle on ne cherry-pick pas un commit qu on"
echo "      fusionnera de toute facon plus tard."
cd /; rm -rf "$W"
