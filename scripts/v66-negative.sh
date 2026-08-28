#!/bin/bash
# Tests négatifs du gate v66 : chaque règle DOIT être vue échouer.
#
# Un gate vert ne prouve rien tant qu'on ne l'a pas vu rougir sur la faute qu'il
# prétend attraper. Chaque bloc ci-dessous CASSE délibérément une règle, vérifie
# que le gate la voit, puis restaure. Un « trou » signifie que la règle est
# décorative : elle passe pour de bonnes raisons qui n'ont rien à voir avec elle.
cd /home/user/Ai-carreer-os || exit 1
pass=0; hole=0

run() { # $1 = libellé, $2 = motif attendu dans l'erreur
  out=$(node scripts/v66-check.mjs 2>&1)
  if echo "$out" | grep -q "$2"; then echo "  ✅ $1 — vu échouer"; pass=$((pass+1));
  else echo "  ❌ $1 — LA RÈGLE N'A RIEN VU (trou)"; hole=$((hole+1)); fi
}
snap() { cp "$1" "/tmp/$(basename "$1").v66neg"; }
back() { cp "/tmp/$(basename "$1").v66neg" "$1"; }

echo "N1 — une commande capable d'écrire un état de rétention apparaît"
snap lib/learning-engine.mjs
python3 - <<'PY'
p='lib/learning-engine.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("  'RECORD_RECALL',","  'RECORD_RECALL', 'MARK_RETAINED',")
open(p,'w',encoding='utf-8').write(s)
PY
run "N1" "\[R1\] aucune commande"
back lib/learning-engine.mjs

echo "N2 — la tentative se met à porter un champ dérivé"
snap lib/retention.mjs
python3 - <<'PY'
p='lib/retention.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("    sourceRef: typeof raw.sourceRef === 'string' ? raw.sourceRef.slice(0, 120) : null,",
            "    sourceRef: typeof raw.sourceRef === 'string' ? raw.sourceRef.slice(0, 120) : null,\n    state: 'retenu',")
open(p,'w',encoding='utf-8').write(s)
PY
run "N2" "\[R1\] une tentative ne porte QUE des faits"
back lib/retention.mjs

echo "N3 — la date d'une tentative redevient celle du client"
snap lib/learning-engine.mjs
python3 - <<'PY'
p='lib/learning-engine.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("    conceptId,\n    at: nowIso,","    conceptId,\n    at: typeof cmd.at === 'string' ? cmd.at : nowIso,")
open(p,'w',encoding='utf-8').write(s)
PY
run "N3" "\[R1\] la date d’une tentative"
back lib/learning-engine.mjs

echo "N4 — répéter dans la même journée suffit à consolider"
snap lib/retention.mjs
python3 - <<'PY'
p='lib/retention.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("      successDates.add(utcDay(a.at));","      successDates.add(a.at);")
open(p,'w',encoding='utf-8').write(s)
PY
run "N4" "\[R2\] les réussites sont comptées par DATE"
back lib/retention.mjs

echo "N4b — le seuil d'étalement disparaît (seconde garde de « retenu »)"
# La première version de N4 est restée INVISIBLE : casser le comptage par date
# laissait le gate vert, parce que l'étalement, lui, tenait encore. Deux gardes
# protégeaient le même invariant, et une seule travaillait dans le test. Elles
# sont donc cassées séparément — même trou de forme qu'en V65 (N2) et en V65.1.
snap lib/retention.mjs
python3 - <<'PY'
p='lib/retention.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("export const RETAINED_MIN_SPAN_DAYS = 21;","export const RETAINED_MIN_SPAN_DAYS = 0;")
s=s.replace("      successDates.add(utcDay(a.at));","      successDates.add(a.at);")
open(p,'w',encoding='utf-8').write(s)
PY
run "N4b" "\[R2\] répéter dans la même journée"
back lib/retention.mjs

echo "N5 — l'issue cesse d'être un domaine fermé"
snap lib/retention.mjs
python3 - <<'PY'
p='lib/retention.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("  if (!OUTCOME_SET.has(raw.outcome)) return null;","  if (typeof raw.outcome !== 'string') return null;")
open(p,'w',encoding='utf-8').write(s)
PY
run "N5" "\[R3\] une issue hors domaine est refusée"
back lib/retention.mjs

echo "N5b — la COMMANDE cesse de filtrer l'issue (seconde garde, cassée séparément)"
# Deux mécanismes protègent le même invariant : la normalisation du modèle et la
# validation de la commande. Chacun doit être vu échouer SEUL, sinon on ne sait
# pas lequel travaille réellement — c'est le trou trouvé au CP12 de V65.1.
snap lib/learning-engine.mjs
python3 - <<'PY'
p='lib/learning-engine.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("  if (!RECALL_OUTCOMES.includes(cmd.outcome)) {","  if (false) {")
open(p,'w',encoding='utf-8').write(s)
PY
run "N5b" "\[R3\] la commande refuse une issue hors domaine"
back lib/learning-engine.mjs

echo "N6 — la projection redevient dépendante de l'ordre d'insertion"
snap lib/retention.mjs
python3 - <<'PY'
p='lib/retention.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("  out.sort((x, y) => (x.at === y.at ? x.conceptId.localeCompare(y.conceptId) : x.at.localeCompare(y.at)));","  ")
open(p,'w',encoding='utf-8').write(s)
PY
run "N6" "\[R4\] la projection ne dépend pas de l’ordre"
back lib/retention.mjs

echo "N7 — l'échéance se met à consulter l'horloge courante"
snap lib/retention.mjs
python3 - <<'PY'
p='lib/retention.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("  const from = Date.parse(recall.lastAttempt.at);","  const from = Date.now();")
open(p,'w',encoding='utf-8').write(s)
PY
run "N7" "\[R4\] l’échéance se calcule depuis la dernière tentative"
back lib/retention.mjs

echo "N8 — les paliers d'espacement cessent d'être croissants"
snap lib/retention.mjs
python3 - <<'PY'
p='lib/retention.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("export const INTERVALS = [1, 3, 7, 16, 35, 75, 160];","export const INTERVALS = [1, 3, 3, 16, 35, 75, 160];")
open(p,'w',encoding='utf-8').write(s)
PY
run "N8" "\[R5\] les paliers sont strictement croissants"
back lib/retention.mjs

echo "N9 — un échec cesse de remettre la série à zéro"
snap lib/retention.mjs
python3 - <<'PY'
p='lib/retention.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("    } else if (a.outcome === 'failed') {\n      consecutiveSuccesses = 0;","    } else if (a.outcome === 'failed') {\n      consecutiveSuccesses += 0;")
open(p,'w',encoding='utf-8').write(s)
PY
run "N9" "\[R6\]"
back lib/retention.mjs

echo "N10 — une échéance dépassée cesse de primer"
snap lib/retention.mjs
python3 - <<'PY'
p='lib/retention.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("  if (schedule.dueAt && Number.isFinite(nowMs) && Date.parse(schedule.dueAt) <= nowMs) {","  if (false) {")
open(p,'w',encoding='utf-8').write(s)
PY
run "N10" "\[R7\] une échéance dépassée prime"
back lib/retention.mjs

echo "N11 — un concept jamais tenté entre dans la file de réactivation"
snap lib/retention.mjs
python3 - <<'PY'
p='lib/retention.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("    if (p.state === 'a_revoir') return true;","    if (p.state === 'a_revoir' || p.state === 'nouveau') return true;")
open(p,'w',encoding='utf-8').write(s)
PY
run "N11" "\[R7\] on ne réactive pas ce qui n’a jamais été activé"
back lib/retention.mjs

echo "N12 — l'entrelacement retombe en simple tri (les familles se groupent)"
snap lib/retention.mjs
python3 - <<'PY'
p='lib/retention.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("  const out = [];\n  let placed = 0;","  return [...sorted].sort((a, b) => String(key(a)).localeCompare(String(key(b))));\n  const out = [];\n  let placed = 0;")
open(p,'w',encoding='utf-8').write(s)
PY
run "N12" "\[R8\] deux notions de la même famille"
back lib/retention.mjs

echo "N13 — une forme de rappel est déclarée sans exister dans le corpus"
snap lib/retention.mjs
python3 - <<'PY'
p='lib/retention.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("export const RECALL_FORMATS = ['free', 'cued', 'applied', 'discrim', 'generate'];",
            "export const RECALL_FORMATS = ['free', 'cued', 'applied', 'discrim', 'generate', 'dictee'];")
open(p,'w',encoding='utf-8').write(s)
PY
run "N13" "\[R9\] aucune forme déclarée n’est morte"
back lib/retention.mjs

echo "N14 — le catalogue de concepts devient une liste codée en dur"
snap lib/retention-server.ts
python3 - <<'PY'
p='lib/retention-server.ts'; s=open(p,encoding='utf-8').read()
s=s.replace("let cached: ConceptCatalogue | null = null;",
            "const CONCEPTS_EN_DUR = ['embeddings', 'docker-containers', 'git-fundamentals'];\nlet cached: ConceptCatalogue | null = null;")
open(p,'w',encoding='utf-8').write(s)
PY
run "N14" "\[R10\] aucune liste de concepts codée en dur"
back lib/retention-server.ts

echo "N15 — le moteur de rétention se met à lire le moteur de révision"
snap lib/retention.mjs
python3 - <<'PY'
p='lib/retention.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("import ","import { baseInterval } from './review.mjs';\nimport ",1) if 'import ' in s else s
if "baseInterval" not in s:
    s = "import { baseInterval } from './review.mjs';\n" + s
open(p,'w',encoding='utf-8').write(s)
PY
run "N15" "\[R11\] le moteur de rétention ignore"
back lib/retention.mjs

echo "N16 — la seed de l'échantillon est modifiée après publication"
snap scripts/v66-sample.mjs
python3 - <<'PY'
p='scripts/v66-sample.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("export const SEED = 20260828;","export const SEED = 12345;")
open(p,'w',encoding='utf-8').write(s)
PY
run "N16" "\[R12\] la seed n’a pas été modifiée"
back scripts/v66-sample.mjs

echo "N17 — l'échantillon repasse à un tirage non reproductible"
snap scripts/v66-sample.mjs
python3 - <<'PY'
p='scripts/v66-sample.mjs'; s=open(p,encoding='utf-8').read()
s=s.replace("function rng(seed) {","function rng(seed) { if (seed) return Math.random;")
open(p,'w',encoding='utf-8').write(s)
PY
run "N17" "\[R12\] l’échantillon est tiré sans aléa"
back scripts/v66-sample.mjs

echo "N18 — la page recopie les paliers au lieu de les importer"
snap app/retention/page.tsx
python3 - <<'PY'
p='app/retention/page.tsx'; s=open(p,encoding='utf-8').read()
s=s.replace("{' '}{INTERVALS.join(' · ')} jours.","{' '}1, 3, 7, 16, 35 jours.")
open(p,'w',encoding='utf-8').write(s)
PY
run "N18" "\[R13\] aucun palier d’espacement recopié"
back app/retention/page.tsx

echo "N19 — les issues deviennent accessibles sans avoir tenté"
snap app/retention/RecallStation.tsx
python3 - <<'PY'
p='app/retention/RecallStation.tsx'; s=open(p,encoding='utf-8').read()
s=s.replace("  function reveal(id: string) {\n    setRevealed((prev) => new Set(prev).add(id));\n  }","")
s=s.replace("const open = revealed.has(row.conceptId);","const open = true;")
s=s.replace("  const [revealed, setRevealed] = useState<Set<string>>(new Set());","")
s=s.replace("onClick={() => reveal(row.conceptId)}","onClick={() => undefined}")
open(p,'w',encoding='utf-8').write(s)
PY
run "N19" "\[R13\] les issues ne sont accessibles qu’après"
back app/retention/RecallStation.tsx

echo "N20 — un échec d'enregistrement redevient silencieux"
snap app/retention/RecallStation.tsx
python3 - <<'PY'
p='app/retention/RecallStation.tsx'; s=open(p,encoding='utf-8').read()
s=s.replace("      setError(`${row.title} : ${r.error}`);\n      return;","      return;")
s=s.replace("  const [error, setError] = useState<string | null>(null);","  const error: string | null = null;")
s=s.replace("    setError(null);","")
s=s.replace('{error && <p className="ret-error" role="alert">{error}</p>}','{error && <p className="ret-error">{error}</p>}')
open(p,'w',encoding='utf-8').write(s)
PY
run "N20" "\[R13\] un échec d’enregistrement est visible"
back app/retention/RecallStation.tsx

echo
echo "── Tests négatifs v66 : $pass règle(s) vue(s) échouer, $hole trou(s)"
node scripts/v66-check.mjs > /dev/null 2>&1 \
  && echo "✅ gate restauré au vert après tous les tests négatifs" \
  || { echo "❌ LE GATE N'EST PAS REVENU AU VERT — restauration incomplète"; exit 1; }
[ "$hole" -eq 0 ] || exit 1
