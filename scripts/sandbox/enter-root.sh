#!/bin/sh
# V76 · CP5 — Entrée dans la racine minimale, pour les runtimes que le modèle de
# permissions de Node ne peut pas protéger (Python).
#
# APPELÉ UNIQUEMENT via :
#   unshare --user --map-root-user --mount --net --propagation private \
#           /bin/sh <ce fichier> <racine> <espace-de-travail> <interpréteur> [args…]
#
# Les quatre premiers paramètres sont des chemins construits par le serveur et
# passés en ARGUMENTS ($1…$4) — jamais concaténés dans une commande. Aucune
# entrée d'apprenant n'atteint ce script.
#
# Ce qu'il monte, et ce qu'il ne monte PAS :
#   · `/usr` en lecture seule  → l'interpréteur et sa bibliothèque standard ;
#   · l'espace de travail      → les fichiers de l'exercice, en écriture ;
#   · RIEN D'AUTRE             → ni `/etc`, ni `/home`, ni le dépôt, donc ni les
#                                corrections (`SEC5`), ni `/etc/passwd` (`SEC1`).
set -eu

# ── POURQUOI DES CHEMINS ABSOLUS ────────────────────────────────────────
#
# Ce script hérite du `PATH` MINIMAL du runner (`/usr/bin:/bin`), qui ne
# contient pas `/usr/sbin`. Le CP5 a d'abord échoué sur un laconique
# « exec: chroot: not found » : l'isolation fonctionnait, seul l'outil qui la
# ferme était introuvable. Les binaires sont donc nommés en absolu, et cherchés
# parmi leurs emplacements usuels — on ne suppose pas une distribution.
CHROOT=""
for c in /usr/sbin/chroot /sbin/chroot /usr/bin/chroot; do [ -x "$c" ] && CHROOT="$c" && break; done
[ -n "$CHROOT" ] || { echo "chroot introuvable" >&2; exit 127; }
MOUNT=""
for m in /usr/bin/mount /bin/mount /sbin/mount; do [ -x "$m" ] && MOUNT="$m" && break; done
[ -n "$MOUNT" ] || { echo "mount introuvable" >&2; exit 127; }
ENV=""
for e in /usr/bin/env /bin/env; do [ -x "$e" ] && ENV="$e" && break; done
[ -n "$ENV" ] || { echo "env introuvable" >&2; exit 127; }

RACINE="$1"; shift
WS="$1"; shift
INTERP="$1"; shift

"$MOUNT" --bind -o ro /usr "$RACINE/usr" 2>/dev/null || "$MOUNT" --bind /usr "$RACINE/usr"
"$MOUNT" --bind "$WS" "$RACINE/ws"

# ── BIBLIOTHÈQUES SUPPLÉMENTAIRES, EN LECTURE SEULE ─────────────────────
#
# Certaines bibliothèques Python ne vivent pas sous `/usr` : sur cette
# installation, `python-dateutil` — dont `pandas` dépend — est sous
# `/root/.local/lib/...`. Sans elles, 18 exercices `python-ds` cessent de
# fonctionner ; avec `/root` monté en entier, on rouvrirait `SEC1`.
#
# On monte donc EXACTEMENT les répertoires de bibliothèques annoncés par
# `AICOS_LIBS`, en LECTURE SEULE, à leur chemin d'origine. C'est le pendant de
# `LECTURES_BIBLIOTHEQUES` côté Node : du code de bibliothèque, jamais des
# données d'apprenant, jamais le corpus de corrections.
if [ -n "${AICOS_LIBS:-}" ]; then
  OLDIFS=$IFS; IFS=:
  for L in $AICOS_LIBS; do
    [ -d "$L" ] || continue
    mkdir -p "$RACINE$L" 2>/dev/null || continue
    "$MOUNT" --bind -o ro "$L" "$RACINE$L" 2>/dev/null || "$MOUNT" --bind "$L" "$RACINE$L" 2>/dev/null || true
  done
  IFS=$OLDIFS
fi
# `/proc` est nécessaire à l'interpréteur ; il ne révèle que les processus de
# cet espace de noms, qui n'en contient aucun autre.
"$MOUNT" -t proc proc "$RACINE/proc" 2>/dev/null || true

# `chroot` ferme la racine : au-delà de ce point, `/` EST la racine minimale.
# `cd /ws` avant d'exécuter : le harnais résout ses chemins relativement à
# l'espace de travail, exactement comme hors bac à sable.
# `env --chdir` place le processus dans `/ws` SANS passer par un shell : le
# harnais résout ses chemins relatifs exactement comme hors bac à sable.
exec "$CHROOT" "$RACINE" "$ENV" --chdir=/ws "$INTERP" "$@"
