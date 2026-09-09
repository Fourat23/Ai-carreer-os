// V72 — CP10. VALIDATION OPERATIONNELLE par niveaux, sur les blocs de code du corpus.
//
// N1 STATIQUE   : le bloc est-il syntaxiquement valide ? (YAML parse, shell `bash -n`,
//                 JSON parse, Dockerfile lu par un analyseur d instructions)
// N2 LOCAL      : la commande s execute-t-elle reellement ici ?
// N3 CONTENEUR  : mesure de ce que le demon Docker permet dans ce conteneur
// N4 NON EXECUTABLE ICI : declare comme tel, jamais presente comme verifie
//
// Regle : ne JAMAIS pretendre au niveau N2 ce qui n a atteint que N1.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';

const TMP = '/tmp/v72-op'; rmSync(TMP, { recursive: true, force: true }); mkdirSync(TMP, { recursive: true });
const lecons = readdirSync('curriculum/lessons').filter((f) => f.endsWith('.md')).sort();

// ── extraction des blocs de code, avec leur langage declare ────────────────
const blocs = [];
for (const f of lecons) {
  const md = readFileSync(`curriculum/lessons/${f}`, 'utf8');
  let i = 0;
  for (const m of md.matchAll(/```([a-zA-Z0-9+-]*)\n([\s\S]*?)```/g))
    blocs.push({ lecon: f.slice(0, -3), lang: (m[1] || '').toLowerCase(), code: m[2], n: i++ });
}
const parLang = {};
for (const b of blocs) parLang[b.lang || '(aucun)'] = (parLang[b.lang || '(aucun)'] ?? 0) + 1;
console.log(`blocs de code du corpus : ${blocs.length}`);
console.log('par langage declare : ' + Object.entries(parLang).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' · '));

const res = { N1: { ok: 0, ko: 0, det: [] }, N2: { ok: 0, ko: 0, det: [] } };

// ── N1 · YAML ─────────────────────────────────────────────────────────────
const yamls = blocs.filter((b) => /^ya?ml$/.test(b.lang));
console.log(`\n[N1] YAML — ${yamls.length} blocs`);
for (const b of yamls) {
  const p = `${TMP}/y.yaml`; writeFileSync(p, b.code);
  try { execSync(`yq -e 'type' ${p} > /dev/null 2>&1`); res.N1.ok++; }
  catch { res.N1.ko++; res.N1.det.push(`YAML invalide — ${b.lecon} bloc ${b.n}`); }
}
console.log(`     valides : ${yamls.length - res.N1.det.length} / ${yamls.length}`);

// ── N1 · shell (bash -n) ──────────────────────────────────────────────────
const shells = blocs.filter((b) => /^(bash|sh|shell|console)$/.test(b.lang));
let shOk = 0, shKo = [];
for (const b of shells) {
  // On retire les invites et les lignes de sortie attendue, ET on neutralise les
  // MARQUEURS DE SUBSTITUTION `<nom>` `<digest>` `<reseau>` : c'est une convention de
  // documentation, pas une erreur de syntaxe — `bash -n` y voit une redirection.
  const code = b.code.split('\n').filter((l) => !/^\s*[$#>]\s|^\s*→/.test(l))
    .join('\n').replace(/<[a-zA-Z0-9_.-]+>/g, 'MARQUEUR');
  const p = `${TMP}/s.sh`; writeFileSync(p, code);
  try { execSync(`bash -n ${p} 2>/dev/null`); shOk++; } catch { shKo.push(`${b.lecon} bloc ${b.n}`); }
}
console.log(`[N1] shell — ${shells.length} blocs · syntaxe valide : ${shOk} / ${shells.length}`);
if (shKo.length) console.log('     ' + shKo.slice(0, 8).join(' · '));

// ── N1 · JSON ─────────────────────────────────────────────────────────────
const jsons = blocs.filter((b) => b.lang === 'json');
let jOk = 0, jKo = [];
for (const b of jsons) { try { JSON.parse(b.code); jOk++; } catch { jKo.push(`${b.lecon} bloc ${b.n}`); } }
console.log(`[N1] JSON — ${jsons.length} blocs · valides : ${jOk} / ${jsons.length}`);
if (jKo.length) console.log('     ' + jKo.slice(0, 8).join(' · '));

// ── N1 · Dockerfile ───────────────────────────────────────────────────────
const INSTR = new Set(['FROM','RUN','CMD','LABEL','EXPOSE','ENV','ADD','COPY','ENTRYPOINT','VOLUME','USER','WORKDIR','ARG','ONBUILD','STOPSIGNAL','HEALTHCHECK','SHELL','MAINTAINER']);
// Seuls les blocs DÉCLARÉS `dockerfile` : chercher « FROM » dans le texte attrapait des
// requêtes SQL. Et un bloc peut être un FRAGMENT délibéré (montrer l'ordre des couches
// sans réécrire l'image entière) : on n'exige donc pas qu'il commence par FROM.
const dockers = blocs.filter((b) => /^dockerfile$/.test(b.lang));
let dOk = 0, dKo = [];
for (const b of dockers) {
  const lignes = b.code.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  const mauvaises = lignes.filter((l, i) => {
    if (/\\$/.test(lignes[i - 1] ?? '')) return false;          // continuation
    return !INSTR.has(l.split(/\s+/)[0].toUpperCase());
  });
  if (!mauvaises.length) dOk++;
  else dKo.push(`${b.lecon} bloc ${b.n} : ${mauvaises[0].slice(0, 46)}`);
}
console.log(`[N1] Dockerfile — ${dockers.length} blocs · structure valide : ${dOk} / ${dockers.length}`);
if (dKo.length) console.log('     ' + dKo.slice(0, 6).join(' · '));

// ── N2 · ce qui s execute reellement ici ──────────────────────────────────
console.log('\n[N2] exécution réelle');
const outils = { node: 'node -v', python3: 'python3 -V', git: 'git --version', bash: 'bash --version', sqlite: "node -e \"require('node:sqlite')\"" };
for (const [nom, cmd] of Object.entries(outils)) {
  try { execSync(cmd + ' >/dev/null 2>&1'); res.N2.ok++; console.log(`     ${nom.padEnd(9)} DISPONIBLE`); }
  catch { res.N2.ko++; console.log(`     ${nom.padEnd(9)} absent`); }
}

// ── N3 / N4 · l environnement ─────────────────────────────────────────────
console.log('\n[N3/N4] environnement');
const test = (nom, cmd) => { try { execSync(cmd + ' >/dev/null 2>&1'); return `${nom} : DISPONIBLE`; } catch { return `${nom} : absent`; } };
for (const l of [
  test('kubectl   ', 'command -v kubectl'),
  test('ssh       ', 'command -v ssh'),
  test('terraform ', 'command -v terraform'),
  test('aws / az  ', 'command -v aws || command -v az'),
  test('dockerd   ', 'command -v dockerd'),
]) console.log('     ' + l);
console.log('     systemd    : ' + (readFileSync('/proc/1/comm', 'utf8').trim() === 'systemd' ? 'PID 1' : `absent (PID 1 = ${readFileSync('/proc/1/comm', 'utf8').trim()})`));

rmSync(TMP, { recursive: true, force: true });
