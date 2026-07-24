#!/usr/bin/env bash
# local-verify — pipeline de vérification du dépôt AI Career OS (lecture seule NETTE).
# N'auto-répare RIEN. Restaure uniquement l'horodatage de data/program.json (effet cosmétique
# de `npm run generate`), et signale bruyamment tout diff réel. Sort en code != 0 si un contrôle échoue.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || { echo "PAS un dépôt git"; exit 2; }

FAIL=0
pass() { printf '  ✅ %s\n' "$1"; }
fail() { printf '  ❌ %s\n' "$1"; FAIL=1; }
hr()   { printf '\n== %s ==\n' "$1"; }

hr "Git"
echo "  branche : $(git branch --show-current)"
echo "  HEAD    : $(git rev-parse --short HEAD)"
if git rev-parse '@{u}' >/dev/null 2>&1; then
  read -r behind ahead < <(git rev-list --left-right --count HEAD...'@{u}' | awk '{print $2" "$1}')
  echo "  origin  : $(git rev-parse --short '@{u}')  (ahead $ahead / behind $behind)"
else
  echo "  origin  : (pas d'upstream configuré)"
fi
DIRTY_BEFORE="$(git status --porcelain)"
[ -z "$DIRTY_BEFORE" ] && pass "working tree propre" || echo "  ℹ️ working tree non vide (voir liste finale)"

hr "Génération idempotente (npm run generate)"
if npm run generate >/tmp/lv_gen.log 2>&1; then
  # Seul program.json doit varier, et seulement par l'horodatage.
  CHANGED="$(git status --porcelain -- curriculum data/program.json | awk '{print $2}')"
  NONPROG="$(echo "$CHANGED" | grep -v '^data/program.json$' || true)"
  if [ -n "$NONPROG" ]; then
    fail "generate a modifié des fichiers autres que program.json (source non régénérée ou fichier généré édité à la main) :"
    echo "$NONPROG" | sed 's/^/       /'
  else
    PROGDIFF="$(git diff -- data/program.json | grep -E '^[+-]' | grep -vE '^(\+\+\+|---)' || true)"
    ONLYTS="$(echo "$PROGDIFF" | grep -vE 'generatedAt' || true)"
    if [ -z "$ONLYTS" ]; then
      git checkout -- data/program.json 2>/dev/null
      pass "generate idempotent (program.json : horodatage seul, restauré — non significatif)"
    else
      fail "program.json a un diff RÉEL (pas seulement l'horodatage) — NON restauré, à examiner :"
      echo "$ONLYTS" | sed 's/^/       /'
    fi
  fi
else
  fail "npm run generate a échoué (voir /tmp/lv_gen.log)"
fi

hr "Intégrité curriculum (curriculum:check)"
npm run curriculum:check >/tmp/lv_check.log 2>&1 && pass "curriculum:check OK" || { fail "curriculum:check KO"; tail -5 /tmp/lv_check.log | sed 's/^/       /'; }

hr "Profondeur (curriculum:depth-check)"
npm run curriculum:depth-check >/tmp/lv_depth.log 2>&1 && pass "depth-check OK" || { fail "depth-check KO"; tail -5 /tmp/lv_depth.log | sed 's/^/       /'; }

hr "Glossaire (glossary:check)"
npm run glossary:check >/tmp/lv_gloss.log 2>&1 && pass "glossary:check OK" || { fail "glossary:check KO"; tail -5 /tmp/lv_gloss.log | sed 's/^/       /'; }

hr "Tests (npm test)"
if npm test >/tmp/lv_test.log 2>&1; then
  pass "tests $(grep -E '^# pass' /tmp/lv_test.log | awk '{print $3}')/$(grep -E '^# tests' /tmp/lv_test.log | awk '{print $3}')"
else
  fail "tests en échec"; grep -E '^# (tests|pass|fail)' /tmp/lv_test.log | sed 's/^/       /'
fi

hr "Build + lint + typecheck (npm run build)"
# Le dépôt n'a PAS de script lint/typecheck autonome : next build exécute les deux.
if npm run build >/tmp/lv_build.log 2>&1; then
  grep -qiE 'warn' /tmp/lv_build.log && echo "  ⚠️ warnings de build (voir /tmp/lv_build.log)"
  pass "build OK (lint + typecheck inclus)"
else
  fail "build KO"; grep -iE 'error|failed' /tmp/lv_build.log | head -5 | sed 's/^/       /'
fi

hr "Liens de leçons"
BROKEN="$(node -e '
const fs=require("fs"),g=require("path");
const dir="curriculum/lessons"; const slugs=new Set(fs.readdirSync(dir).filter(f=>f.endsWith(".md")).map(f=>f.slice(0,-3)));
let n=0; for(const f of fs.readdirSync("curriculum/days")){const t=fs.readFileSync("curriculum/days/"+f,"utf8");
for(const m of t.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)) if(!slugs.has(m[1])) n++;} console.log(n);')"
[ "$BROKEN" = "0" ] && pass "0 lien de leçon cassé" || fail "$BROKEN lien(s) de leçon cassé(s)"

hr "Caractères invalides (U+FFFD / cyrillique / géorgien)"
GLY="$(node -e '
const fs=require("fs"),p=require("path");
function walk(d){let r=[];for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=p.join(d,e.name);
if(e.isDirectory())r=r.concat(walk(f));else if(f.endsWith(".md"))r.push(f);}return r;}
const bad=/[�Ѐ-ӿႠ-ჿ]/; let n=0;
for(const f of walk("curriculum")) if(bad.test(fs.readFileSync(f,"utf8"))) n++; console.log(n);')"
[ "$GLY" = "0" ] && pass "0 caractère invalide" || fail "$GLY fichier(s) avec caractères invalides"

hr "Compteurs"
echo "  jours=$(ls curriculum/days/*.md 2>/dev/null | wc -l) solutions=$(ls curriculum/solutions/*-solution.md 2>/dev/null | wc -l) semaines=$(ls curriculum/week-*.md 2>/dev/null | wc -l) mois=$(ls curriculum/month-*.md 2>/dev/null | wc -l) leçons=$(ls curriculum/lessons/*.md 2>/dev/null | wc -l)"

hr "Fichiers modifiés (working tree)"
git status --porcelain | sed 's/^/  /' || true
[ -z "$(git status --porcelain)" ] && echo "  (aucun)"

hr "RÉSULTAT"
if [ "$FAIL" -eq 0 ]; then echo "  ✅ TOUS LES CONTRÔLES SONT VERTS"; exit 0
else echo "  ❌ AU MOINS UN CONTRÔLE A ÉCHOUÉ (voir ci-dessus) — aucune réparation automatique effectuée"; exit 1; fi
