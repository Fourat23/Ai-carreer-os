#!/bin/bash
# Tests négatifs de la porte v76 : chaque règle DOIT être vue échouer.
#
# Une porte verte ne prouve rien tant qu'on ne l'a pas vue rougir sur la faute
# qu'elle prétend attraper. Chaque bloc ci-dessous CASSE délibérément une règle,
# vérifie que la porte la voit, puis restaure. Un « trou » signifie que la règle
# est décorative : elle passe pour de bonnes raisons qui n'ont rien à voir avec
# elle.
#
# Ce script MODIFIE des fichiers du produit et les restaure. Il ne fait pas
# partie de `npm test` pour cette raison — `tests/v76-gate.test.mjs` garde son
# existence, et `npm run v76:negative` l'exécute.
cd /home/user/Ai-carreer-os || exit 1
pass=0; hole=0

run() { # $1 = libellé, $2 = motif attendu dans l'erreur
  out=$(node scripts/v76-check.mjs 2>&1)
  if echo "$out" | grep -q "$2"; then echo "  ✅ $1 — vu échouer"; pass=$((pass+1));
  else echo "  ❌ $1 — LA RÈGLE N'A RIEN VU (trou)"; hole=$((hole+1)); fi
}
snap() { cp "$1" "/tmp/$(basename "$1").v76neg"; }
back() { cp "/tmp/$(basename "$1").v76neg" "$1"; }

echo "N1 — un point d'exécution contourne la frontière d'isolation"
snap lib/workspace-fs.mjs
python3 - <<'PY'
p='lib/workspace-fs.mjs'; s=open(p,encoding='utf-8').read()
# On vise un APPEL, pas la définition : remplacer le premier `execIsole(` du
# fichier renommait la fonction elle-même, ce qui ne teste pas la règle.
s=s.replace('await execIsole({','await execFileP({',1)
open(p,'w',encoding='utf-8').write(s)
PY
run "N1" "\[B2\] les TROIS points d’exécution"
back lib/workspace-fs.mjs

echo "N2 — SEC3 est maquillé en « total » sur Python"
snap lib/sandbox.mjs
python3 - <<'PY'
p='lib/sandbox.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("SEC3: 'partiel'","SEC3: 'total'")
open(p,'w',encoding='utf-8').write(s)
PY
run "N2" "\[B4\] .SEC3. vaut .partiel."
back lib/sandbox.mjs

echo "N3 — un runtime repasse sur l'hôte"
snap lib/sandbox.mjs
python3 - <<'PY'
p='lib/sandbox.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("  python3: 'NAMESPACE_CHROOT',","  python3: 'HOTE',")
open(p,'w',encoding='utf-8').write(s)
PY
run "N3" "\[B3\] le runtime .python3."
back lib/sandbox.mjs

echo "N4 — la preuve canonique reprend deux noms (double comptage du CP11)"
snap "app/api/lab/[exerciseId]/route.ts"
python3 - <<'PY'
p='app/api/lab/[exerciseId]/route.ts'; s=open(p,encoding='utf-8').read()
s=s.replace('canonicalSourceId: ex.id,','canonicalSourceId: `lab-${ex.id}`,')
open(p,'w',encoding='utf-8').write(s)
PY
run "N4" "\[B6\] la route nomme le FAIT"
back "app/api/lab/[exerciseId]/route.ts"

echo "N5 — une réinitialisation se met à écrire dans la progression"
snap "app/api/lab/[exerciseId]/route.ts"
python3 - <<'PY'
p='app/api/lab/[exerciseId]/route.ts'; s=open(p,encoding='utf-8').read()
s=s.replace("      resetWorkspace(ex);\n      return NextResponse.json({ ok: true, files: readWorkspaceTree(ex) });",
            "      resetWorkspace(ex); writeProgress(readProgress());\n      return NextResponse.json({ ok: true, files: readWorkspaceTree(ex) });")
open(p,'w',encoding='utf-8').write(s)
PY
run "N5" "\[B8\] .action === 'reset'. ne touche pas"
back "app/api/lab/[exerciseId]/route.ts"

echo "N6 — le journal est rangé là où un RESET l'effacerait"
snap lib/attempt-journal-server.ts
python3 - <<'PY'
p='lib/attempt-journal-server.ts'; s=open(p,encoding='utf-8').read()
s=s.replace("const ROOT = join(process.cwd(), 'data', 'lab-journals');",
            "const ROOT = join(process.cwd(), 'data', 'lab-workspaces');")
open(p,'w',encoding='utf-8').write(s)
PY
run "N6" "\[B8\] le journal vit HORS"
back lib/attempt-journal-server.ts

echo "N7 — le journal se met à archiver les résultats privés"
snap "app/api/lab/[exerciseId]/route.ts"
python3 - <<'PY'
p='app/api/lab/[exerciseId]/route.ts'; s=open(p,encoding='utf-8').read()
s=s.replace('          resultats: publicResults,','          resultats: attempt.results,')
open(p,'w',encoding='utf-8').write(s)
PY
run "N7" "\[B9\] le journal ne reçoit que"
back "app/api/lab/[exerciseId]/route.ts"

echo "N8 — la réussite après aide cesse d'être une réussite"
snap lib/hint-view.mjs
python3 - <<'PY'
p='lib/hint-view.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace('    reussite: true,','    reussite: aides.length === 0,')
open(p,'w',encoding='utf-8').write(s)
PY
run "N8" "\[B12\] .provenanceDeLaReussite."
back lib/hint-view.mjs

echo "N9 — le client de transfert se remet à corriger seul"
snap "app/transfer/[id]/ChallengeRunner.tsx"
python3 - <<'PY'
p='app/transfer/[id]/ChallengeRunner.tsx'; s=open(p,encoding='utf-8').read()
s=s.replace("  const [result, setResult]","  const _grade = gradeTransferChallenge;\n  const [result, setResult]",1)
open(p,'w',encoding='utf-8').write(s)
PY
run "N9" "\[B5\] le client ne corrige plus"
back "app/transfer/[id]/ChallengeRunner.tsx"

echo "N10 — un module « pur » se met à lire le disque"
snap lib/attempt-diff.mjs
python3 - <<'PY'
p='lib/attempt-diff.mjs'; s=open(p,encoding='utf-8').read()
s="import { readFileSync } from 'node:fs';\n"+s
open(p,'w',encoding='utf-8').write(s)
PY
run "N10" "\[B1\] lib/attempt-diff.mjs reste PUR"
back lib/attempt-diff.mjs

echo "N11 — hintViews disparaît d'une des deux listes blanches (défaut P7)"
snap lib/progress-store.mjs
python3 - <<'PY'
p='lib/progress-store.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace('  flat.hintViews = normalizeHintViews(t.hintViews);','  // retiré')
open(p,'w',encoding='utf-8').write(s)
PY
run "N11" "\[B7\] .hintViews. traverse"
back lib/progress-store.mjs

echo
echo "── v76:negative — $pass règle(s) vue(s) échouer, $hole trou(s)"
if [ "$hole" -gt 0 ]; then exit 1; fi
