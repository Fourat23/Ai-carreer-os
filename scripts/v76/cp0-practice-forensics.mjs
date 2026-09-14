// V76 · CP0 — AUDIT FORENSIQUE DE L'ENVIRONNEMENT DE PRATIQUE. LECTURE SEULE.
//
// ── LA LEÇON QUI COMMANDE CE CHECKPOINT ─────────────────────────────────
//
// V74 : nous pensions devoir créer un Retention Engine — il existait déjà.
// V75 : des fonctionnalités vivaient dans `lib/` sans être branchées au produit.
//
// Ce script ne suppose donc RIEN sur ce qui manque. Il compte, il classe, et il
// distingue trois choses qu'on confond facilement :
//
//   · ce qui EXISTE dans le dépôt ;
//   · ce qui est BRANCHÉ au produit (une surface l'atteint) ;
//   · ce qui est RÉELLEMENT EXÉCUTABLE (le runtime existe et répond).
//
// La taxonomie des familles d'exercices est DÉDUITE des données. Aucune famille
// n'est inventée avant lecture : c'est la consigne du brief, et c'est aussi la
// seule façon de ne pas construire un SQL_WORKBENCH pour zéro exercice SQL.
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const jlire = (p) => { try { return JSON.parse(lire(p)); } catch { return null; } };

// ── A · LES 376 EXERCICES, RECOMPTÉS ────────────────────────────────────

const DIR = 'data/exercises';
export function inventaire() {
  const fichiers = readdirSync(join(ROOT, DIR)).filter((f) => f.endsWith('.json'));
  return fichiers.map((f) => {
    const j = jlire(`${DIR}/${f}`) ?? {};
    const files = j.workspace?.files ?? [];
    const visibles = files.filter((x) => !x.hidden && !x.readOnly);
    return {
      fichier: f,
      id: j.id ?? null,
      title: j.title ?? null,
      runtime: j.runtime ?? null,
      language: j.language ?? null,
      practiceMode: j.practiceMode ?? null,
      difficulty: j.difficulty ?? null,
      skills: j.skills ?? [],
      trackRefs: j.trackRefs ?? [],
      sprint: j.sprint ?? null,
      /** Fichiers du workspace, par nature — la question du multi-fichier. */
      nbFichiers: files.length,
      nbVisibles: visibles.length,
      nbReadOnly: files.filter((x) => x.readOnly).length,
      nbCaches: files.filter((x) => x.hidden).length,
      multiFichier: visibles.length > 1,
      entry: j.workspace?.entry ?? null,
      activeFile: j.activeFile ?? null,
      /** Tests : combien, de quels genres, combien privés. */
      nbTests: (j.tests ?? []).length,
      testKinds: [...new Set((j.tests ?? []).map((t) => t.kind ?? '(absent)'))],
      nbTestsPrives: (j.tests ?? []).filter((t) => t.private).length,
      /** La solution de référence existe-t-elle, et pour quels fichiers ? */
      aReference: !!j.reference && Object.keys(j.reference).length > 0,
      refFichiers: j.reference ? Object.keys(j.reference) : [],
      reusedBy: j.reusedBy ?? null,
    };
  });
}

/** Familles DÉDUITES : (runtime × présence de tests × multi-fichier). */
export function familles(ex) {
  const m = new Map();
  for (const e of ex) {
    const k = e.practiceMode ? `${e.runtime} · ${e.practiceMode}` : e.runtime ?? '(sans runtime)';
    if (!m.has(k)) m.set(k, { famille: k, n: 0, tests: 0, sansTest: 0, multi: 0, prives: 0, avecRef: 0, kinds: new Set() });
    const f = m.get(k);
    f.n += 1; f.tests += e.nbTests;
    if (e.nbTests === 0) f.sansTest += 1;
    if (e.multiFichier) f.multi += 1;
    if (e.nbTestsPrives > 0) f.prives += 1;
    if (e.aReference) f.avecRef += 1;
    for (const k2 of e.testKinds) f.kinds.add(k2);
  }
  return [...m.values()].map((f) => ({ ...f, kinds: [...f.kinds].sort() })).sort((a, b) => b.n - a.n);
}

// ── B · LES AUTRES FAMILLES DE PRATIQUE ─────────────────────────────────
//
// `data/exercises` n'est pas toute la pratique. Ces répertoires existent aussi,
// et il serait faux de conclure sur « la pratique » en n'en lisant qu'un.
const AUTRES = ['transfer-challenges', 'assessments', 'capstones', 'missions',
  'pipelines', 'security', 'cloud', 'playbooks', 'manifests', 'topologies',
  'terminal-tasks', 'lab-workspaces'];

export function autresFamilles() {
  return AUTRES.map((d) => {
    const abs = join(ROOT, 'data', d);
    if (!existsSync(abs)) return { dossier: d, n: 0, absent: true };
    const fl = readdirSync(abs).filter((f) => f.endsWith('.json'));
    const cles = new Set(); let executables = 0; let simules = 0; let questions = 0;
    for (const f of fl) {
      const j = jlire(`data/${d}/${f}`);
      if (!j) continue;
      for (const k of Object.keys(j)) cles.add(k);
      if (j.runtime || j.workspace) executables += 1;
      if (j.simulationNote) simules += 1;
      if (Array.isArray(j.questions)) questions += 1;
    }
    return {
      dossier: d, n: fl.length,
      avecRuntimeOuWorkspace: executables,
      declaresSimules: simules,
      aQuestions: questions,
      cles: [...cles].sort(),
    };
  });
}

// ── C · L'ARCHITECTURE DES RUNNERS, TRACÉE ──────────────────────────────
//
// Pour chaque surface de pratique : la page existe-t-elle, la route existe-t-elle,
// et surtout — **écrit-elle un `ExerciseAttempt` ?** C'est la question que V74
// avait dû poser pour découvrir qu'un échec ne laissait aucune trace.
const SURFACES = [
  { nom: 'lab', page: 'app/lab/[exerciseId]/page.tsx', route: 'app/api/lab/[exerciseId]/route.ts' },
  { nom: 'transfer', page: 'app/transfer/[id]/page.tsx', route: 'app/api/transfer/[id]/route.ts' },
  { nom: 'terminal', page: null, route: 'app/api/terminal/[taskId]/route.ts' },
  { nom: 'assessments', page: null, route: 'app/api/assessments/[id]/route.ts' },
  { nom: 'capstones', page: 'app/capstones/[id]/page.tsx', route: 'app/api/capstones/[id]/route.ts' },
  { nom: 'missions', page: 'app/missions/[id]/page.tsx', route: 'app/api/missions/[id]/route.ts' },
  { nom: 'cloud-lab', page: 'app/cloud-lab/[id]/page.tsx', route: 'app/api/cloud-lab/[id]/route.ts' },
  { nom: 'cloud-foundations', page: 'app/cloud-foundations/[id]/page.tsx', route: 'app/api/cloud-foundations/[id]/route.ts' },
  { nom: 'kubernetes', page: 'app/kubernetes/[id]/page.tsx', route: 'app/api/kubernetes/[id]/route.ts' },
  { nom: 'pipelines', page: 'app/pipelines/[id]/page.tsx', route: 'app/api/pipelines/[id]/route.ts' },
  { nom: 'security', page: null, route: 'app/api/security/[id]/route.ts' },
];

const FAITS = [
  ['ExerciseAttempt', 'RECORD_EXERCISE_ATTEMPT'],
  ['TransferAttempt', 'RECORD_TRANSFER_ATTEMPT'],
  ['RecallAttempt', 'RECORD_RECALL_ATTEMPT'],
  ['Evidence', 'ADD_EVIDENCE'],
];

export function architecture() {
  return SURFACES.map((s) => {
    const route = s.route ? lire(s.route) : '';
    const page = s.page ? lire(s.page) : '';
    const faits = FAITS.filter(([, cmd]) => route.includes(cmd)).map(([n]) => n);
    return {
      surface: s.nom,
      page: s.page, pageExiste: !!page,
      route: s.route, routeExiste: !!route,
      lignesRoute: route ? route.split('\n').length : 0,
      /** Passe-t-elle par le moteur de commandes, ou écrit-elle à côté ? */
      moteur: route.includes('applyCommand'),
      faits,
      /** Écrit-elle la tentative MÊME en cas d'échec ? (heuristique : pas de garde `allPassed` avant) */
      ecritQuandEchoue: route.includes('RECORD_EXERCISE_ATTEMPT') || route.includes('RECORD_TRANSFER_ATTEMPT'),
      remediation: route.includes('remedier'),
      sandbox: route.includes('runExercise') || route.includes('workspace-server'),
    };
  });
}

// ── D · LES COMPOSANTS D'INTERFACE DE PRATIQUE ──────────────────────────
export function composants() {
  const dirs = ['app/lab/[exerciseId]', 'app/transfer/[id]'];
  const out = [];
  for (const d of dirs) {
    const abs = join(ROOT, d);
    if (!existsSync(abs)) continue;
    for (const f of readdirSync(abs)) {
      const rel = `${d}/${f}`;
      if (!statSync(join(ROOT, rel)).isFile()) continue;
      const src = lire(rel);
      out.push({
        fichier: rel,
        lignes: src.split('\n').length,
        client: src.includes("'use client'"),
        /** Cité par quelqu'un d'autre ? Un composant orphelin est du code mort. */
        importePar: [...dirs, 'app'].flatMap(() => []),
      });
    }
  }
  // Recherche des importateurs, pour détecter les composants ORPHELINS.
  const tousFichiers = [];
  const walk = (d) => {
    const abs = join(ROOT, d);
    if (!existsSync(abs)) return;
    for (const e of readdirSync(abs)) {
      const rel = `${d}/${e}`;
      if (statSync(join(ROOT, rel)).isDirectory()) walk(rel);
      else if (/\.(tsx?|mjs)$/.test(e)) tousFichiers.push(rel);
    }
  };
  walk('app'); walk('lib'); walk('components');
  for (const c of out) {
    const base = c.fichier.split('/').pop().replace(/\.tsx?$/, '');
    c.importePar = tousFichiers.filter((f) => f !== c.fichier && new RegExp(`['"\`][^'"\`]*${base}['"\`]`).test(lire(f)));
    c.orphelin = c.importePar.length === 0 && !/\bpage\b/.test(base);
  }
  return out;
}

// ── E · LES BIBLIOTHÈQUES DE PRATIQUE : EXISTENT / BRANCHÉES ────────────
//
// La question V75 : un module qui n'est importé par aucune surface est du code
// qui rassure. On la repose ici sur toutes les briques de pratique.
const LIBS = [
  'lib/runtime.mjs', 'lib/runtime-detect.mjs', 'lib/workspace.mjs', 'lib/workspace-fs.mjs',
  'lib/workspace-server.ts', 'lib/exercise.mjs', 'lib/exercise-files.mjs', 'lib/exercise-context.mjs',
  'lib/exercise-attempt.mjs', 'lib/lab-feedback.mjs', 'lib/lab-progress.mjs',
  'lib/frontend-preview.mjs', 'lib/react-preview.mjs', 'lib/frontend-dom.mjs',
  'lib/terminal.mjs', 'lib/terminal-local.mjs', 'lib/terminal-docker.mjs', 'lib/terminal-tasks-server.ts',
  'lib/test-diff.mjs', 'lib/ts-hints.mjs', 'lib/remediation.mjs',
];

export function brancheAuProduit() {
  const surfaces = [];
  const walk = (d) => {
    const abs = join(ROOT, d);
    if (!existsSync(abs)) return;
    for (const e of readdirSync(abs)) {
      const rel = `${d}/${e}`;
      if (statSync(join(ROOT, rel)).isDirectory()) walk(rel);
      else if (/\.(tsx?|mjs)$/.test(e)) surfaces.push(rel);
    }
  };
  walk('app');
  const sourcesApp = new Map(surfaces.map((f) => [f, lire(f)]));

  return LIBS.map((l) => {
    const base = l.split('/').pop().replace(/\.(mjs|ts)$/, '');
    const dansApp = [...sourcesApp.entries()].filter(([, s]) => new RegExp(`@/lib/${base}['"\`]`).test(s)).map(([f]) => f);
    // Indirect : une lib de `lib/` importée par une lib elle-même atteinte.
    const dansLib = existsSync(join(ROOT, 'lib'))
      ? readdirSync(join(ROOT, 'lib')).filter((f) => /\.(mjs|ts)$/.test(f) && f !== l.split('/').pop()
        && new RegExp(`['"\`][./]*${base}(\\.mjs)?['"\`]`).test(lire(`lib/${f}`))).map((f) => `lib/${f}`)
      : [];
    const src = lire(l);
    return {
      lib: l,
      existe: !!src,
      lignes: src ? src.split('\n').length : 0,
      /** Directement importée par une surface du produit. */
      surfacesDirectes: dansApp,
      /** Atteinte indirectement, par une autre bibliothèque. */
      viaLib: dansLib.slice(0, 6),
      branche: dansApp.length > 0 || dansLib.length > 0,
      pur: src ? !/from ['"]node:(fs|child_process|os|net|http)/.test(src) : null,
    };
  });
}

// ── F · FUITE DE SOLUTION ───────────────────────────────────────────────
//
// Le produit n'a pas besoin d'une sécurité anti-pirate. Il ne doit pas
// **donner accidentellement la réponse avant l'exercice**. Trois questions :
// la référence quitte-t-elle le serveur ? les tests privés ? les attendus ?
export function fuiteSolution() {
  const route = lire('app/api/lab/[exerciseId]/route.ts');
  const meta = route.slice(route.indexOf('function exerciseMeta'), route.indexOf('export async function GET'));
  return {
    /** `reference` (la solution) est-elle exclue de la méta renvoyée ? */
    referenceExclueDeLaMeta: !/reference/.test(meta),
    /** Les tests PRIVÉS sont-ils filtrés à la sortie ? */
    testsPrivesFiltres: /filter\(\(t\) => !t\.private\)/.test(meta),
    /** Les ATTENDUS (`expected`, `args`) quittent-ils le serveur ? */
    attendusExclus: !/expected/.test(meta) && !/\bargs\b/.test(meta),
    /** Le détail des tests privés est-il agrégé après exécution ? */
    resultatsPrivesAgreges: route.includes('splitAttempt') && route.includes('privateSummary'),
    /** La consultation de la correction est-elle ENREGISTRÉE ? */
    correctionTracee: route.includes('correctionSeen'),
    /** Et influence-t-elle la valeur pédagogique du résultat ? */
    correctionInfluenceLeFait: /correctionSeen[,\s]/.test(route) && route.includes('RECORD_EXERCISE_ATTEMPT'),
  };
}

// ── G · SÉCURITÉ : CE QUI EST DÉJÀ CONTRÔLÉ ─────────────────────────────
export function securite() {
  const fs_ = lire('lib/workspace-fs.mjs');
  const rt = lire('lib/runtime.mjs');
  const term = lire('lib/terminal.mjs');
  const timeouts = [...rt.matchAll(/timeoutMs:\s*(\d+)/g)].map((m) => Number(m[1]));
  return {
    execSansShell: /execFile/.test(fs_) && !/\bexec\(/.test(fs_) && !/shell:\s*true/.test(fs_),
    shellExplicitementDesactive: /shell:\s*false/.test(fs_),
    timeoutsDeclares: timeouts,
    sortieBornee: /maxBuffer/.test(fs_),
    maxBuffer: (/maxBuffer:\s*([^,\n]+)/.exec(fs_) ?? [])[1]?.trim() ?? null,
    envFiltre: /\benv:\s*\{/.test(fs_),
    racineWorkspace: (/WORKSPACE_ROOT[^\n]*=([^\n]+)/.exec(fs_) ?? [])[1]?.trim() ?? null,
    traversalGarde: /\.\.\//.test(fs_) || /normalize|resolve/.test(fs_),
    terminalAllowlist: /ALLOW|allowlist|autorisé/i.test(term),
    terminalDocker: existsSync(join(ROOT, 'lib/terminal-docker.mjs')),
  };
}

// ── SORTIE ──────────────────────────────────────────────────────────────

if (process.argv[1] && process.argv[1].endsWith('cp0-practice-forensics.mjs')) {
  const ex = inventaire();
  const fam = familles(ex);
  const autres = autresFamilles();
  const arch = architecture();
  const comps = composants();
  const libs = brancheAuProduit();
  const fuite = fuiteSolution();
  const sec = securite();

  console.log('# V76 · CP0 — AUDIT FORENSIQUE DE L’ENVIRONNEMENT DE PRATIQUE\n');
  console.log(`## A · Les exercices, recomptés : **${ex.length}**\n`);
  console.log('| famille (runtime · mode) | n | tests | sans test | multi-fichier | tests privés | avec référence |');
  console.log('|---|---|---|---|---|---|---|');
  for (const f of fam) {
    console.log(`| \`${f.famille}\` | **${f.n}** | ${f.tests} | ${f.sansTest} | ${f.multi} | ${f.prives} | ${f.avecRef} |`);
  }
  const kinds = {};
  for (const e of ex) for (const k of e.testKinds) kinds[k] = (kinds[k] ?? 0) + 1;
  console.log(`\n**Genres de test** (${Object.keys(kinds).length} distincts, sur ${ex.reduce((s, e) => s + e.nbTests, 0)} tests) :`);
  console.log(Object.entries(kinds).sort((a, b) => b[1] - a[1]).map(([k, v]) => `\`${k}\` ${v}`).join(' · '));

  console.log('\n## B · Les autres familles de pratique\n');
  console.log('| dossier | fichiers | runtime/workspace | déclarés simulés | à questions |');
  console.log('|---|---|---|---|---|');
  for (const a of autres) {
    console.log(`| \`data/${a.dossier}\` | ${a.n} | ${a.avecRuntimeOuWorkspace ?? 0} | ${a.declaresSimules ?? 0} | ${a.aQuestions ?? 0} |`);
  }

  console.log('\n## C · Les surfaces de pratique, et ce qu’elles écrivent\n');
  console.log('| surface | page | route | moteur | faits écrits | remédiation | bac à sable |');
  console.log('|---|---|---|---|---|---|---|');
  for (const a of arch) {
    console.log(`| \`${a.surface}\` | ${a.pageExiste ? '✅' : '—'} | ${a.routeExiste ? `✅ ${a.lignesRoute} l.` : '—'} | ${a.moteur ? '✅' : '❌'} | ${a.faits.join(' · ') || '**aucun**'} | ${a.remediation ? '✅' : '—'} | ${a.sandbox ? '✅' : '—'} |`);
  }

  console.log('\n## D · Les composants d’interface de pratique\n');
  console.log('| fichier | lignes | client | importé par | orphelin |');
  console.log('|---|---|---|---|---|');
  for (const c of comps) {
    console.log(`| \`${c.fichier}\` | ${c.lignes} | ${c.client ? '✅' : '—'} | ${c.importePar.length} | ${c.orphelin ? '⚠️ **oui**' : 'non'} |`);
  }

  console.log('\n## E · Les bibliothèques de pratique : existent, et branchées ?\n');
  console.log('| bibliothèque | lignes | pure | branchée | surfaces directes |');
  console.log('|---|---|---|---|---|');
  for (const l of libs) {
    console.log(`| \`${l.lib}\` | ${l.lignes} | ${l.pur === null ? '—' : l.pur ? '✅' : 'I/O'} | ${l.branche ? '✅' : '❌ **non**'} | ${l.surfacesDirectes.length ? l.surfacesDirectes.map((s) => `\`${s.replace('app/', '')}\``).join(' ') : '—'} |`);
  }

  console.log('\n## F · Fuite de solution\n');
  for (const [k, v] of Object.entries(fuite)) console.log(`- ${v ? '✅' : '❌'} \`${k}\``);

  console.log('\n## G · Sécurité déjà en place\n');
  for (const [k, v] of Object.entries(sec)) console.log(`- \`${k}\` : ${JSON.stringify(v)}`);

  writeFileSync(join(ROOT, 'docs', 'v76', 'cp0-inventory.json'),
    `${JSON.stringify({ exercices: ex, familles: fam, autres, architecture: arch, composants: comps, libs, fuite, securite: sec }, null, 1)}\n`);
  console.log('\nécrit : docs/v76/cp0-inventory.json');
}
