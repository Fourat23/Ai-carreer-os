#!/usr/bin/env bash
# V70 — vérification exécutée pour la leçon deployment-secrets.
# Question : « j'ai commité un secret puis je l'ai supprimé au commit
# suivant. Est-ce que le secret a disparu du dépôt ? »
# Ce script construit un vrai dépôt git jetable et interroge l'historique.
set -u
W=$(mktemp -d); cd "$W" || exit 1
git init -q . ; git config user.email v70@local ; git config user.name v70

echo "== 1. Le secret est commité par erreur =="
printf 'DB_PASSWORD=Tr0ub4dor-prod-2026\nSTRIPE_KEY=sk_live_51H8fQ2aNvR\n' > .env
git add .env && git commit -qm "config appli"
FAUTIF=$(git rev-parse --short HEAD)
echo "commit fautif : $FAUTIF"

echo
echo "== 2. On s'en aperçoit, on supprime le fichier et on commit =="
git rm -q .env
printf '.env\n' > .gitignore
git add .gitignore && git commit -qm "retire le .env du depot, ajoute gitignore"
echo "etat du repertoire de travail :"
ls -a | grep -c '^\.env$' | sed 's/^/  fichiers .env presents dans le working tree : /'

echo
echo "== 3. Le secret est-il encore lisible ? =="
echo "-- git show du commit fautif :"
git show "$FAUTIF:.env" 2>&1 | sed 's/^/     /'
echo "-- recherche dans tout l historique (git log -p) :"
git log -p --all 2>/dev/null | grep -c 'sk_live_51H8fQ2aNvR' | sed 's/^/     occurrences de la cle Stripe dans l historique : /'
echo "-- l objet blob existe-t-il toujours dans la base d objets ?"
BLOB=$(git rev-list --objects --all | grep '\.env$' | head -1 | cut -d' ' -f1)
echo "     blob : $BLOB"
git cat-file -p "$BLOB" | sed 's/^/     /'

echo
echo "== 4. Et si on force la suppression locale des objets ? =="
git reflog expire --expire=now --all >/dev/null 2>&1
git gc --prune=now -q 2>/dev/null
echo "-- apres reflog expire + gc --prune=now :"
git cat-file -p "$BLOB" 2>&1 | head -2 | sed 's/^/     /'
echo "     (le commit fautif est toujours dans la branche : rien ne peut etre"
echo "      elague tant qu un commit atteignable le reference)"

echo
echo "== 5. Ce que coute une reecriture d historique =="
echo "     (on simule d abord un push : le secret est deja parti chez l hebergeur)"
git init -q --bare "$W/remote.git"
git remote add origin "$W/remote.git" && git push -q origin HEAD 2>/dev/null
SHA_AVANT=$(git rev-parse HEAD)
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f --index-filter \
  'git rm -q --cached --ignore-unmatch .env' HEAD >/dev/null 2>&1
SHA_APRES=$(git rev-parse HEAD)
echo "     HEAD avant : $SHA_AVANT"
echo "     HEAD apres : $SHA_APRES"
echo "     identiques ? $([ "$SHA_AVANT" = "$SHA_APRES" ] && echo OUI || echo NON)"
echo "     -> tous les identifiants de commit changent : chaque personne ayant"
echo "        cloné doit re-cloner, et toute branche non fusionnée doit etre rebasee."
echo "-- le secret est-il encore atteignable depuis la branche courante ?"
git log -p 2>/dev/null | grep -c 'sk_live_51H8fQ2aNvR' | sed 's/^/     occurrences (branche) : /'
echo "-- et depuis TOUTES les references du depot local ?"
git log -p --all 2>/dev/null | grep -c 'sk_live_51H8fQ2aNvR' | sed 's/^/     occurrences (--all)  : /'
echo "     references presentes :"
git for-each-ref --format='       %(refname)'
echo "     -> filter-branch conserve une sauvegarde sous refs/original/."
echo "        Tant qu elle existe, rien n est efface."
git update-ref -d refs/original/refs/heads/master 2>/dev/null
git update-ref -d refs/original/refs/heads/main 2>/dev/null
git reflog expire --expire=now --all >/dev/null 2>&1 ; git gc --prune=now -q 2>/dev/null
echo "-- apres suppression de refs/original + reflog expire + gc :"
git log -p --all 2>/dev/null | grep -c 'sk_live_51H8fQ2aNvR' | sed 's/^/     occurrences (--all)  : /'
echo "-- et dans le depot distant, qui n a rien recu de tout cela ?"
git --git-dir="$W/remote.git" log -p --all 2>/dev/null | grep -c 'sk_live_51H8fQ2aNvR' | sed 's/^/     occurrences chez origin : /'

echo "== 6. Le secret a-t-il ete lu entre temps ? =="
echo "     git ne le sait pas et ne peut pas le savoir."
echo "     Aucune commande ci-dessus ne repond a cette question."
cd / && rm -rf "$W"
