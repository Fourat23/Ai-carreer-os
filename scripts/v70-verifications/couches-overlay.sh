#!/usr/bin/env bash
# V70 — vérification exécutée pour docker-containers.
# LIMITE DÉCLARÉE : le démon Docker n'est pas disponible dans cet
# environnement, aucune commande `docker` n'est exécutée ici. En revanche le
# MÉCANISME sur lequel repose une image Docker — le système de fichiers
# superposé (overlay) — est disponible dans le noyau Linux et est exercé
# réellement ci-dessous. Ce que montre ce script n'est pas une analogie de ce
# que fait Docker : c'est la couche du noyau que Docker utilise.
set -u
W=$(mktemp -d)
mkdir -p "$W"/{couche1,couche2,couche3,travail,fusion}

echo "== 1. Trois couches, comme trois instructions d un Dockerfile =="
echo "SECRET=sk_live_abc123"        > "$W/couche1/.env"
echo "console.log('v1')"            > "$W/couche1/app.js"
echo "   couche 1 (COPY . .)        : .env  app.js"
echo "console.log('v2')"            > "$W/couche2/app.js"
echo "   couche 2 (COPY app.js .)   : app.js modifie"

mount -t overlay overlay \
  -o lowerdir="$W/couche2:$W/couche1",upperdir="$W/couche3",workdir="$W/travail" \
  "$W/fusion" || { echo "montage impossible dans cet environnement"; exit 1; }

echo
echo "== 2. Ce que voit le conteneur (la fusion des couches) =="
ls -a "$W/fusion" | grep -v '^\.$\|^\.\.$' | sed 's/^/   /'
echo "   app.js contient : $(cat "$W/fusion/app.js")"
echo "   -> la couche superieure gagne : c est ce que fait une instruction qui"
echo "      remplace un fichier deja copie."

echo
echo "== 3. On supprime le secret, comme le ferait un RUN rm .env =="
rm "$W/fusion/.env"
echo "   vu depuis le conteneur :"
ls -a "$W/fusion" | grep -c '^\.env$' | sed 's/^/     fichiers .env visibles : /'
cat "$W/fusion/.env" 2>&1 | sed 's/^/     lecture : /'

echo
echo "== 4. Ce que la suppression a REELLEMENT ecrit =="
echo "   contenu de la couche superieure (celle que le rm a modifiee) :"
ls -la "$W/couche3" | grep -v '^total\|^d' | sed 's/^/     /'
echo "   -> ce n est pas une suppression : c est un fichier special de type"
echo "      caractere, majeur 0 mineur 0, appele « whiteout ». Il MASQUE le"
echo "      fichier des couches inferieures. Il ne l efface pas."

echo
echo "== 5. Le secret est-il encore la ? =="
echo "   contenu de la couche 1, inchangee :"
cat "$W/couche1/.env" | sed 's/^/     /'
echo "   -> le secret est intact dans la couche inferieure. Quiconque obtient"
echo "      l image obtient les couches, donc le secret — meme si aucun"
echo "      conteneur demarre a partir de cette image ne le montre."

echo
echo "== 6. Le poids ne diminue pas non plus =="
head -c 5242880 /dev/urandom > "$W/couche1/cache-de-build.bin"
echo "   on ajoute un fichier de 5 Mio dans la couche 1 (un cache de build)"
echo "   taille des couches AVANT suppression (Kio) :"
du -sk "$W/couche1" "$W/couche2" "$W/couche3" | sed 's/^/     /'
rm "$W/fusion/cache-de-build.bin"
echo "   on le supprime depuis le conteneur, comme un RUN rm ulterieur."
echo "   taille des couches APRES suppression (Kio) :"
du -sk "$W/couche1" "$W/couche2" "$W/couche3" | sed 's/^/     /'
echo "   total des couches : $(du -sk "$W/couche1" "$W/couche2" "$W/couche3" | awk '{t+=$1} END {print t}') Kio"
echo "   -> la couche 1 pese toujours 5 Mio et la couche superieure a GROSSI"
echo "      d un fichier de masquage. Supprimer un fichier volumineux dans une"
echo "      instruction ULTERIEURE ne retire rien : cela ajoute. Pour que le"
echo "      fichier ne pese pas, il ne doit jamais entrer dans une couche —"
echo "      d ou le telechargement, l usage et la suppression dans UNE SEULE"
echo "      instruction, ou une construction multi-etapes."

umount "$W/fusion" 2>/dev/null
rm -rf "$W"
