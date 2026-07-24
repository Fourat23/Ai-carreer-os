#!/usr/bin/env bash
# curriculum-guard — détecte toute dérive PÉDAGOGIQUE (lecture seule).
# Compare l'état courant à une base (défaut : HEAD) sur les chemins pédagogiques, classe chaque
# changement (source / généré / rédigé-main), et signale les fichiers générés édités à la main
# (perdus au prochain `npm run generate`). Sort en code 1 si un changement pédagogique réel existe.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || { echo "PAS un dépôt git"; exit 2; }
BASE="${1:-HEAD}"

# --- Ensembles de chemins pédagogiques (réels) ---
SRC='scripts/data/'
GEN_RE='^(curriculum/days/|curriculum/solutions/|curriculum/week-[0-9]|curriculum/month-[0-9]|curriculum/year-overview\.md|data/program\.json)'
HAND_RE='^curriculum/(lessons/|projects/|rubrics/|methodology/|career/|resources/|templates/|glossary/|how-to-use-12-months\.md|AUTHORING_GUIDE\.md|QUALITY_STANDARD\.md)'
PED_PATHS=(scripts/data curriculum data/program.json)

echo "== curriculum-guard : base = $BASE =="

# Union : diffs commités vs BASE + modifications non commitées (staged/unstaged/untracked)
CHANGED="$( { git diff --name-only "$BASE" -- "${PED_PATHS[@]}" 2>/dev/null;
              git status --porcelain -- "${PED_PATHS[@]}" 2>/dev/null | sed 's/^...//'; } \
            | sed 's/^"//; s/"$//' | sort -u | grep -vE '^$' || true)"

# program.json : ignorer un changement d'horodatage seul (cosmétique).
if echo "$CHANGED" | grep -qx 'data/program.json'; then
  PROGDIFF="$(git diff "$BASE" -- data/program.json | grep -E '^[+-]' | grep -vE '^(\+\+\+|---)' || true)"
  REAL="$(echo "$PROGDIFF" | grep -vE 'generatedAt' || true)"
  # s'il n'y a pas de diff commité, vérifier le working tree
  if [ -z "$PROGDIFF" ]; then
    WT="$(git diff -- data/program.json | grep -E '^[+-]' | grep -vE '^(\+\+\+|---)' || true)"
    REAL="$(echo "$WT" | grep -vE 'generatedAt' || true)"
  fi
  [ -z "$REAL" ] && CHANGED="$(echo "$CHANGED" | grep -vx 'data/program.json' || true)"
fi

if [ -z "$CHANGED" ]; then
  echo "  ✅ Aucun changement pédagogique par rapport à $BASE."
  echo "     (Le contenu — jours, corrections, leçons, revues, projets, réflexions Y2/Y3 — est intact.)"
  exit 0
fi

echo "  ⚠️ CHANGEMENTS PÉDAGOGIQUES DÉTECTÉS :"
n_src=0; n_gen=0; n_hand=0; n_genrisk=0
while IFS= read -r f; do
  [ -z "$f" ] && continue
  if [[ "$f" == $SRC* ]]; then
    printf '    [SOURCE éditable]     %s\n' "$f"; n_src=$((n_src+1))
  elif echo "$f" | grep -qE "$GEN_RE"; then
    # Généré : édité à la main = perdu au prochain generate, sauf keep-marker.
    keep=""
    [ -f "$f" ] && head -1 "$f" 2>/dev/null | grep -q '^<!-- keep -->' && keep=" (keep-marker présent)"
    printf '    [GÉNÉRÉ]              %s%s\n' "$f" "$keep"; n_gen=$((n_gen+1))
    [ -z "$keep" ] && n_genrisk=$((n_genrisk+1))
  elif echo "$f" | grep -qE "$HAND_RE"; then
    printf '    [RÉDIGÉ-MAIN]         %s\n' "$f"; n_hand=$((n_hand+1))
  else
    printf '    [PÉDAGOGIQUE ?]       %s\n' "$f"; n_hand=$((n_hand+1))
  fi
done <<< "$CHANGED"

echo
echo "  Récap : $n_src source(s) · $n_gen généré(s) · $n_hand rédigé(s)-main."
if [ "$n_genrisk" -gt 0 ]; then
  echo "  🚨 $n_genrisk fichier(s) GÉNÉRÉ(s) édité(s) à la main SANS keep-marker :"
  echo "     ils seront ÉCRASÉS au prochain \`npm run generate\`. La source réelle est dans scripts/data/*.mjs."
  echo "     → Ne pas committer tel quel : soit répercuter dans la source, soit ajouter <!-- keep -->, soit annuler."
fi
echo
echo "  ❌ Changement pédagogique présent — VALIDATION HUMAINE REQUISE avant de continuer/committer."
echo "     (En chantier UI/UX, ce périmètre doit rester à ZÉRO changement.)"
exit 1
