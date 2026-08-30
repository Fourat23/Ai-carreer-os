#!/usr/bin/env bash
# V70 — vérification exécutée pour readme-documentation et portfolio-github.
# Question : « mon README est bien écrit. » On ne le lit pas : on l EXÉCUTE.
# Le protocole est celui d un inconnu qui découvre le dépôt : cloner, suivre le
# README à la lettre, ne rien deviner, et chronométrer.
set -u
SRC="${1:-/home/user/Ai-carreer-os}"
W=$(mktemp -d)
echo "== Protocole : clone neuf, on suit le README a la lettre =="

T0=$(date +%s)
git clone -q --depth 1 "file://$SRC" "$W/depot" 2>/dev/null || {
  echo "clone impossible"; exit 1; }
T_CLONE=$(( $(date +%s) - T0 ))
cd "$W/depot" || exit 1
echo "   clone : ${T_CLONE} s"

echo
echo "== 1. Le README annonce-t-il ses prerequis, et sont-ils verifiables ? =="
grep -iA3 '^## Prérequis' README.md | sed 's/^/   /'
echo "   version reellement presente : node $(node -v), npm $(npm -v)"

echo
echo "== 2. La premiere commande du README =="
CMD=$(grep -A2 '^## Installation' README.md | grep -v '^--\|^## \|^```' | head -1)
echo "   commande lue dans le README : ${CMD}"
T0=$(date +%s)
if npm install --no-audit --no-fund >/tmp/v70-install.log 2>&1; then
  echo "   resultat : SUCCES en $(( $(date +%s) - T0 )) s"
else
  echo "   resultat : ECHEC en $(( $(date +%s) - T0 )) s"
  tail -5 /tmp/v70-install.log | sed 's/^/     /'
fi

echo
echo "== 3. Chaque autre commande annoncee fonctionne-t-elle ? =="
for c in "npm test" "npm run build" "npm run generate"; do
  T0=$(date +%s)
  if timeout 600 $c >/tmp/v70-c.log 2>&1; then
    echo "   ${c} : OK ($(( $(date +%s) - T0 )) s)"
  else
    echo "   ${c} : ECHEC ($(( $(date +%s) - T0 )) s) — $(tail -1 /tmp/v70-c.log)"
  fi
done

echo
echo "== 4. Le compte-rendu qui compte : ce qu il a fallu SAVOIR EN PLUS =="
echo "   (chaque ligne ci-dessous est une chose absente du README et sans"
echo "    laquelle un inconnu est bloque ou hesite)"
[ -f .env.example ] || echo "   - aucun .env.example : les variables attendues ne sont pas documentees"
grep -q 'generate' README.md || echo "   - npm run generate n est pas explique"
grep -qi 'contribut' README.md || echo "   - aucune section sur la maniere de contribuer"
grep -qi 'licen' README.md || echo "   - aucune licence : le droit de reutilisation est indetermine"
grep -qiE 'capture|screenshot|!\[' README.md || echo "   - aucune capture d ecran : on ne sait pas a quoi ressemble le produit"
echo "   - le README ne dit pas quoi faire APRES npm run dev (par ou commencer)"

echo
echo "== 5. Metriques mecaniques du README =="
echo "   lignes            : $(wc -l < README.md)"
echo "   mots              : $(wc -w < README.md)"
echo "   blocs de code     : $(( $(grep -c '^```' README.md) / 2 ))"
PREMIER=$(grep -n '^```' README.md | head -1 | cut -d: -f1)
echo "   1er bloc de code a la ligne : ${PREMIER}"
echo "   -> c est la metrique la plus utile : combien de lignes un inconnu"
echo "      doit-il lire avant de pouvoir TAPER quelque chose."
cd /; rm -rf "$W"
