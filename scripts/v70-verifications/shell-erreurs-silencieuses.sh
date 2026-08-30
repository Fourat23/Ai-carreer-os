#!/usr/bin/env bash
# V70 CP13 — vérification exécutée pour terminal-shell-filesystem.
# La leçon affirme : « le cd échoue, et le shell, par défaut, continue à la
# ligne suivante ». On ne le croit pas : on l exécute.
W=$(mktemp -d); cd "$W" || exit 1
mkdir -p reel && echo "fichier-precieux" > reel/important.txt

echo "== 1. L affirmation de la lecon, mise a l epreuve =="
mkdir -p sim && cd sim && : > temoin.txt
cat > script.sh <<'EOS'
cd /repertoire-qui-nexiste-pas
echo "LIGNE SUIVANTE EXECUTEE, repertoire courant = $(pwd)"
EOS
bash script.sh 2>&1 | sed 's/^/   /'
echo "   -> confirme : le cd echoue et le script CONTINUE."

echo
echo "== 2. Le code de sortie du script global ment aussi =="
bash script.sh >/dev/null 2>&1
echo "   code de sortie du script entier : $?"
echo "   -> zero. Un appelant — une tache planifiee, une CI — conclut au succes."

echo
echo "== 3. Les trois protections, mesurees separement =="
for garde in "aucune" "set -e" "cd || exit"; do
  case "$garde" in
    "aucune")     entete="";                     cmd="cd /nexiste-pas" ;;
    "set -e")     entete="set -e";               cmd="cd /nexiste-pas" ;;
    "cd || exit") entete="";                     cmd="cd /nexiste-pas || exit 1" ;;
  esac
  cat > s2.sh <<EOS
$entete
$cmd
echo "  ATTEINT : la suite s est executee"
EOS
  SORTIE=$(bash s2.sh 2>&1); CODE=$?
  ATTEINT=$(echo "$SORTIE" | grep -c 'ATTEINT')
  printf "   %-12s : suite executee = %s | code de sortie = %s\n" \
    "$garde" "$([ "$ATTEINT" -gt 0 ] && echo OUI || echo non)" "$CODE"
done
echo "   -> set -e ET le || exit arretent le script ET rendent un code non nul."
echo "      Sans l un des deux, l echec est invisible des deux cotes."

echo
echo "== 4. Ce que set -e ne protege PAS =="
cat > s3.sh <<'EOS'
set -e
faux_calcul() { return 1; }
if faux_calcul; then echo "branche vraie"; else echo "  branche fausse prise"; fi
faux_calcul || echo "  echec attrape par ||"
echo "  ATTEINT quand meme : set -e ne s applique pas dans une condition"
EOS
bash s3.sh 2>&1 | sed 's/^/  /'
echo "   -> set -e est desactive dans une condition, apres && ou ||, et dans un"
echo "      pipeline sauf la derniere commande. Ce n est pas un filet universel."

echo
echo "== 5. Le pipeline qui cache l echec =="
cat > s4.sh <<'EOS'
set -e
cat /fichier-inexistant | wc -l
echo "  ATTEINT : le pipeline a rendu 0 alors que cat a echoue"
EOS
bash s4.sh 2>&1 | sed 's/^/  /'
echo "   code de sortie du pipeline : $(bash -c 'cat /nexiste 2>/dev/null | wc -l >/dev/null; echo $?')"
echo "   avec pipefail                : $(bash -c 'set -o pipefail; cat /nexiste 2>/dev/null | wc -l >/dev/null; echo $?')"
echo "   -> par defaut, le code d un pipeline est celui de la DERNIERE commande."
echo "      wc a reussi, donc le pipeline reussit, alors que cat a echoue."
cd /; rm -rf "$W"
