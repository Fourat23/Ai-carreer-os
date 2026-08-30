#!/usr/bin/env bash
# V70 — vérification exécutée pour linux-resources-io.
# Question : « le serveur rame, et free dit qu il n y a plus de memoire. »
# On mesure ce que disent reellement free, /proc/loadavg et le cache de pages.
set -u
W=$(mktemp -d)

echo "== 1. « Il ne reste plus de memoire » — que dit free ? =="
free -m | sed 's/^/   /'
LIBRE=$(free -m | awk '/^Mem:/{print $4}')
DISPO=$(free -m | awk '/^Mem:/{print $7}')
CACHE=$(free -m | awk '/^Mem:/{print $6}')
echo "   free (libre) : ${LIBRE} Mio   |   available (disponible) : ${DISPO} Mio"
echo "   buff/cache   : ${CACHE} Mio"
echo "   -> ces deux colonnes ne mesurent pas la meme chose. « free » compte la"
echo "      memoire qui ne sert a RIEN. « available » compte celle qu une"
echo "      nouvelle application peut obtenir, cache compris, car le noyau"
echo "      liberera le cache s il le faut. C est « available » qu il faut lire."

echo
echo "== 2. Le cache de pages, mesure =="
dd if=/dev/urandom of="$W/gros.bin" bs=1M count=400 status=none
sync
if echo 3 > /proc/sys/vm/drop_caches 2>/dev/null; then
  VIDE=oui
else
  VIDE=non
fi
T0=$(date +%s%N); cat "$W/gros.bin" > /dev/null; T1=$(date +%s%N)
T2=$(date +%s%N); cat "$W/gros.bin" > /dev/null; T3=$(date +%s%N)
R1=$(( (T1-T0)/1000000 )); R2=$(( (T3-T2)/1000000 ))
echo "   fichier de 400 Mio ; cache vide avant la 1re lecture : $VIDE"
echo "   1re lecture (disque) : ${R1} ms"
echo "   2e lecture  (cache)  : ${R2} ms"
if [ "$VIDE" = oui ] && [ "$R2" -gt 0 ]; then
  echo "   rapport              : x$(( R1 / R2 ))"
else
  echo "   LIMITE DECLAREE : le vidage du cache n a pas pu etre effectue dans"
  echo "   cet environnement, les deux lectures partent donc du cache. L ecart"
  echo "   mesure ici NE MESURE PAS l effet du cache et n est pas publie comme"
  echo "   tel."
fi
echo "   -> la memoire « consommee » par le cache est ce qui rend une relecture"
echo "      rapide. La vider pour « recuperer de la memoire » echange de la"
echo "      memoire inutilisee contre des lectures lentes."

echo
echo "== 3. La charge (load average) ne mesure pas le pourcentage de processeur =="
N=$(nproc)
echo "   coeurs disponibles : $N"
echo "   charge au repos    : $(cut -d\  -f1-3 /proc/loadavg)"
echo "   on lance $(( N * 3 )) processus de calcul pur pendant 120 s..."
for i in $(seq 1 $(( N * 3 ))); do
  ( timeout 120 sh -c 'while :; do :; done' ) &
done
for t in 30 60 90; do
  sleep 30
  echo "     apres ${t} s : charge $(cut -d\  -f1 /proc/loadavg)"
       \
    echo "                  executables/total : $(cut -d\  -f4 /proc/loadavg)"
done
wait 2>/dev/null
echo "   -> la charge tend vers le NOMBRE DE PROCESSUS qui veulent tourner,"
echo "      soit $(( N * 3 )) ici, et non vers 100 %. Une charge de $(( N * 3 ))"
echo "      sur $N coeurs veut dire « trois fois plus de travail que de"
echo "      coeurs », donc trois fois plus lent, pas « 300 % de processeur »."
echo "      La charge n a pas de maximum : elle se lit RELATIVEMENT a nproc."
echo
echo "   MECANISME NON REPRODUIT ICI, declare comme tel : sous Linux — et"
echo "   contrairement aux autres systemes UNIX — la charge compte aussi les"
echo "   processus bloques en attente d entrees-sorties ininterruptibles"
echo "   (etat D). Le stockage de cet environnement est trop rapide pour"
echo "   maintenir un processus en etat D assez longtemps pour le mesurer ;"
echo "   la tentative a donne une charge de 2,19 sans aucun dd en etat D."
echo "   Consequence pratique a retenir malgre l absence de mesure : une"
echo "   charge elevee avec un pourcentage de processeur bas designe une"
echo "   attente (disque, reseau, verrou), pas un manque de puissance."

echo "== 4. La bonne question n est pas « combien » mais « qui attend quoi » =="
echo "   %CPU eleve + charge elevee        -> calcul  : profiler le code"
echo "   %CPU bas   + charge elevee        -> attente : disque, reseau, verrous"
echo "   available bas + cache bas         -> memoire reellement consommee"
echo "   available haut + free bas         -> situation NORMALE, ne rien faire"
rm -rf "$W"

echo
echo "== 5. Le fichier supprime qui occupe encore le disque =="
W2=$(mktemp -d)
AV=$(df -k "$W2" | awk 'NR==2{print $3}')
dd if=/dev/zero of="$W2/gros.log" bs=1M count=300 status=none
tail -f "$W2/gros.log" > /dev/null &
PID=$!
sleep 1
PLEIN=$(df -k "$W2" | awk 'NR==2{print $3}')
rm "$W2/gros.log"
APRES_RM=$(df -k "$W2" | awk 'NR==2{print $3}')
DU=$(du -sk "$W2" | cut -f1)
echo "   utilise avant creation   : $(( AV / 1024 )) Mio"
echo "   apres creation de 300 Mio: $(( PLEIN / 1024 )) Mio"
echo "   apres rm (fichier ouvert): $(( APRES_RM / 1024 )) Mio   <- df"
echo "   du sur le repertoire     : $(( DU / 1024 )) Mio          <- du"
echo "   le fichier est-il visible ? $(ls "$W2" | wc -l) entree(s)"
echo "   descripteur encore ouvert :"
ls -l /proc/$PID/fd 2>/dev/null | grep deleted | sed 's/^/     /'
kill $PID 2>/dev/null; wait $PID 2>/dev/null
sleep 1
FIN=$(df -k "$W2" | awk 'NR==2{print $3}')
echo "   apres fermeture du processus : $(( FIN / 1024 )) Mio"
echo "   -> tant qu un processus garde le descripteur ouvert, l espace n est"
echo "      PAS rendu. du dit 0, df dit 300 Mio, et les deux ont raison : du"
echo "      parcourt l arborescence, df interroge le systeme de fichiers."
echo "      C est pourquoi « j ai supprime les logs et df affiche toujours"
echo "      100 % » : il faut redemarrer ou recharger le processus qui ecrit."
rm -rf "$W2"
