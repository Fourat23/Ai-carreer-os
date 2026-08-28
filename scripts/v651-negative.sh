#!/bin/bash
# Tests négatifs du gate v651 : chaque règle DOIT être vue échouer.
cd /home/user/Ai-carreer-os
pass=0; hole=0
run() { # $1 = libellé, $2 = motif attendu dans l'erreur
  out=$(node scripts/v651-check.mjs 2>&1)
  if echo "$out" | grep -q "$2"; then echo "  ✅ $1 — vu échouer"; pass=$((pass+1));
  else echo "  ❌ $1 — LA RÈGLE N'A RIEN VU (trou)"; hole=$((hole+1)); fi
}
snap() { cp "$1" "/tmp/$(basename $1).neg"; }
back() { cp "/tmp/$(basename $1).neg" "$1"; }

echo "N1 — une surface réimporte l'ancien modèle"
cat > lib/skill-state.mjs <<'EOF'
export const SKILL_STATES = ['a'];
export const SKILL_STATE_LABEL = { a: 'A' };
EOF
run "N1" "\[C1\]"
rm -f lib/skill-state.mjs

echo "N5 — le décompte redevient une somme de crédits"
snap lib/learner-read-models.ts
python3 - <<'PY'
p='lib/learner-read-models.ts'; s=open(p,encoding='utf-8').read()
s=s.replace("qualifyingEvidenceCount: all.filter(isQualifying).length,","qualifyingEvidenceCount: competencies.reduce((n, c) => n + c.qualifyingEvidenceCount, 0),")
open(p,'w',encoding='utf-8').write(s)
PY
run "N5" "\[C5\]"
back lib/learner-read-models.ts

echo "N3 — l'historique cesse de traduire les identifiants"
snap app/history/page.tsx
python3 - <<'PY'
p='app/history/page.tsx'; s=open(p,encoding='utf-8').read()
s=s.replace("{e.competencyIds.map((c) => skillName.get(c) ?? c).join(' · ')}","{e.competencyIds.join(' · ')}")
open(p,'w',encoding='utf-8').write(s)
PY
run "N3" "\[C3\]"
back app/history/page.tsx

echo "N6 — l'explication est réécrite en dur dans l'UI"
snap "app/skills/[id]/page.tsx"
python3 - <<'PY'
p='app/skills/[id]/page.tsx'; s=open(p,encoding='utf-8').read()
s=s.replace("<p className=\"cmpd-rule\">{why.rule}</p>","<p className=\"cmpd-rule\">Au moins une preuve qualifiante.</p>")
open(p,'w',encoding='utf-8').write(s)
PY
run "N6" "\[C6\]"
back "app/skills/[id]/page.tsx"

echo "N8 — la clé métier de dédoublonnage est retirée"
snap lib/evidence.mjs
python3 - <<'PY'
p='lib/evidence.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("""  const comps = [...(evidence.competencyIds ?? [])].sort().join('+');
  return `${evidence.sourceType}:${evidence.sourceId}:${comps}:${isQualifying(evidence) ? 'q' : 'n'}`;""",
"""  return `${evidence.id}`;""")
open(p,'w',encoding='utf-8').write(s)
PY
run "N8" "\[C12\]"
back lib/evidence.mjs

echo "N8b — l'identifiant perd le discriminant qualifiant (régression du CP12)"
snap lib/evidence.mjs
python3 - <<'PY'
p='lib/evidence.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("  return qualifying ? `ev-${sourceType}-${sourceId}` : `ev-${sourceType}-${sourceId}-n`;",
            "  return `ev-${sourceType}-${sourceId}`;")
open(p,'w',encoding='utf-8').write(s)
PY
run "N8b" "\[C12\]"
back lib/evidence.mjs

echo "N9 — une révision peut porter une validation réussie"
snap lib/evidence.mjs
python3 - <<'PY'
p='lib/evidence.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("""  if (!QUALIFYING_SOURCE_TYPES.has(sourceType) && validation?.status === 'passed') {
    return fail('UNQUALIFIABLE_SOURCE', `Une preuve « ${sourceType} » ne peut pas porter une validation réussie.`);
  }""","")
open(p,'w',encoding='utf-8').write(s)
PY
run "N9" "\[C11\]"
back lib/evidence.mjs

echo "N7 — la taxonomie se met à deviner"
snap lib/skill-taxonomy.mjs
python3 - <<'PY'
p='lib/skill-taxonomy.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("export function programSkill(id) {","export function programSkill(id) {\n  return 'algo';")
open(p,'w',encoding='utf-8').write(s)
PY
run "N7" "\[C15\]"
back lib/skill-taxonomy.mjs

echo "N10 — la surface de détail disparaît"
mv "app/skills/[id]/page.tsx" /tmp/detail.neg
run "N10" "\[C8\]"
mv /tmp/detail.neg "app/skills/[id]/page.tsx"

echo "N11 — les diagnostics redeviennent aveugles"
snap app/diagnostics/page.tsx
python3 - <<'PY'
p='app/diagnostics/page.tsx'; s=open(p,encoding='utf-8').read()
s=s.replace("getHistoryBySource('assessment')","({})")
open(p,'w',encoding='utf-8').write(s)
PY
run "N11" "\[C9\]"
back app/diagnostics/page.tsx

echo "N12 — l'historique perd ses filtres"
snap app/history/page.tsx
python3 - <<'PY'
p='app/history/page.tsx'; s=open(p,encoding='utf-8').read()
s=s.replace("searchParams","spX")
open(p,'w',encoding='utf-8').write(s)
PY
run "N12" "\[C10\]"
back app/history/page.tsx

echo "N13 — de la gamification réapparaît"
cat > lib/__neg-xp.mjs <<'EOF'
export const XP_PAR_JOUR = 10;
export function leaderboard() { return []; }
EOF
run "N13" "\[C17\]"
rm -f lib/__neg-xp.mjs

echo ""
echo "── $pass règle(s) vue(s) échouer, $hole trou(s)"
node scripts/v651-check.mjs 2>&1 | tail -2
exit $hole
