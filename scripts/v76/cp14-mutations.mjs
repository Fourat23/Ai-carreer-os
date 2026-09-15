// V76 · CP14 — LE GANTELET : TRENTE-TROIS MENSONGES PLAUSIBLES.
//
// ── CE QU'UNE MUTATION PROUVE, ET CE QU'ELLE NE PROUVE PAS ──────────────
//
// Une suite verte prouve que rien ne casse. Elle ne prouve pas qu'elle
// REMARQUERAIT quelque chose. Le seul moyen de le savoir est de casser le
// produit exprès et de regarder qui s'en aperçoit.
//
// Chaque mutation ci-dessous est **plausible** : c'est un raccourci qu'un
// développeur pressé prendrait, pas une absurdité. Les familles viennent du
// brief, dans son ordre.
//
// ── LA RÈGLE QUI NE SE NÉGOCIE PAS ──────────────────────────────────────
//
// Une mutation qui survit ne s'affaiblit JAMAIS. On renforce le test ou la
// sonde, on rejoue, et si elle survit encore on l'écrit comme telle. Affaiblir
// une mutation pour obtenir une ligne verte est le contournement `G12`.
//
// ── TROIS NIVEAUX DE DÉFENSE, ET C'EST VOULU ────────────────────────────
//
//   · `test`  — `npm test` : le moins cher, le plus rapide ;
//   · `gate`  — `npm run v76:check` : ce qui se dégrade sans rien casser ;
//   · `sonde` — le produit reconstruit et servi : ce qu'aucune lecture de
//               source ne peut prouver.
//
// Le CP9 a payé pour apprendre que le troisième est irremplaçable :
// `if (false && conflits.length)` laisse tous les tests verts.
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = process.cwd();
const SP = process.env.V76_SCRATCH ?? '/tmp';
const PROGRESS = process.env.AICOS_PROGRESS_FILE;

const R = 'app/api/lab/[exerciseId]/route.ts';
const WFS = 'lib/workspace-fs.mjs';
const SB = 'lib/sandbox.mjs';
const W = 'lib/workspace.mjs';
const WC = 'lib/workspace-conflit.mjs';
const AJ = 'lib/attempt-journal.mjs';
const AD = 'lib/attempt-diff.mjs';
const AJS = 'lib/attempt-journal-server.ts';
const LE = 'lib/learning-engine.mjs';
const EV = 'lib/evidence.mjs';
const TC = 'lib/transfer-challenge.mjs';
const CR = 'app/transfer/[id]/ChallengeRunner.tsx';
const HV = 'lib/hint-view.mjs';
const PS = 'lib/progress-store.mjs';
const GATE = 'scripts/v76-check.mjs';

/**
 * ── LES TRENTE-TROIS ─────────────────────────────────────────────────────
 *
 * `garde` dit QUI doit s'en apercevoir : `test`, `gate`, ou `sonde`.
 * Les mutations `sonde` exigent une reconstruction complète — coûteuses, donc
 * réservées à ce qu'aucune lecture de source ne peut prouver.
 */
export const MUTATIONS = [
  // ── FAMILLE 1 · ÉVASION DU BAC À SABLE (brief : 1–10) ────────────────
  { id: 'M01', famille: 'lecture du disque hôte', garde: 'gate', fichier: WFS,
    avant: 'execIsole(', apres: 'execFileP(', note: 'un point d’exécution contourne la frontière' },
  { id: 'M02', famille: 'repli vers l’hôte', garde: 'gate', fichier: SB,
    avant: "  throw new Error(`Mode d’exécution refusé", "apres": null,
    remplacer: "  if (mode === 'HOTE') return { file: binaire, args: argsRuntime };\n  throw new Error(`Mode d’exécution refusé",
    note: 'le mode hôte devient un repli silencieux' },
  { id: 'M03', famille: '`SEC3` maquillé en total', garde: 'gate', fichier: SB,
    avant: "SEC3: 'partiel'", apres: "SEC3: 'total'", note: 'le produit ment sur son isolation Python' },
  { id: 'M04', famille: 'runtime sans frontière', garde: 'gate', fichier: SB,
    avant: "  python3: 'NAMESPACE_CHROOT',", apres: "  python3: 'HOTE',", note: '101 exercices repassent sur l’hôte' },
  { id: 'M05', famille: 'écriture hors bac à sable', garde: 'gate', fichier: SB,
    avant: "SEC2: 'total', SEC3: 'total'", apres: "SEC2: 'aucun', SEC3: 'total'",
    note: 'PERMISSION_NET cesse de tenir l’écriture' },

  // ── FAMILLE 2 · FUITE PÉDAGOGIQUE (brief : 11–14, 26) ────────────────
  { id: 'M06', famille: 'fuite de correction (transfert)', garde: 'test', fichier: TC,
    avant: 'const { answer, explanation, ...question } = q ?? {};',
    apres: 'const { explanation, ...question } = q ?? {};', note: '`answer` revient dans la charge utile' },
  { id: 'M07', famille: 'le client se corrige seul', garde: 'test', fichier: CR,
    avant: 'la correction n’a pas pu être faite', apres: 'correction indisponible',
    note: 'le message honnête disparaît' },
  { id: 'M08', famille: 'tests cachés journalisés', garde: 'test', fichier: R,
    avant: '          resultats: publicResults,', apres: '          resultats: attempt.results,',
    note: 'les résultats privés entrent au journal' },
  { id: 'M09', famille: 'fichiers cachés journalisés', garde: 'test', fichier: R,
    avant: '            Object.entries(files).filter(([p]) => editables.has(p)).map(([p, c]) => [p, String(c)]),',
    apres: '            Object.entries(files).map(([p, c]) => [p, String(c)]),',
    note: 'un test caché finirait archivé puis relu' },
  { id: 'M10', famille: 'attendu archivé', garde: 'test', fichier: AJ,
    avant: '      passed: r.passed === true,\n    }))',
    apres: '      passed: r.passed === true,\n      expected: r.expected,\n    }))',
    note: 'l’attendu d’un test entre au journal' },

  // ── FAMILLE 3 · BROUILLON, CONCURRENCE, RÉINITIALISATION (15–19) ─────
  { id: 'M11', famille: 'brouillon périmé qui écrase', garde: 'sonde', fichier: R,
    avant: '        if (conflits.length) {', apres: '        if (false && conflits.length) {',
    note: 'la vérification de révision devient décorative', sondes: ['cp9'] },
  { id: 'M12', famille: 'écriture avant vérification', garde: 'sonde', fichier: R,
    avant: '      const revs = (body as { revs?: Record<string, string> }).revs;',
    apres: '      const revs = (body as { revs?: Record<string, string> }).revs;\n      for (const [path, content] of Object.entries(files)) writeWorkspaceFile(ex, path, String(content));',
    note: 'le fichier est écrasé avant le 409', sondes: ['cp9'] },
  { id: 'M13', famille: 'révision fondée sur l’horloge', garde: 'test', fichier: WFS,
    avant: "  return createHash('sha1').update(String(contenu ?? ''), 'utf8').digest('hex').slice(0, 12);",
    apres: "  return String(Date.now()).slice(0, 12);", note: 'deux sauvegardes identiques deviennent un conflit' },
  { id: 'M14', famille: 'refus invisible', garde: 'test', fichier: WC,
    avant: '  if (r.conflit !== true) return null;', apres: '  if (r.conflit !== true) return null;\n  return null;',
    note: 'la surface n’annonce plus rien' },
  { id: 'M15', famille: '`RESET` destructeur', garde: 'gate', fichier: R,
    avant: '      resetWorkspace(ex);\n      return NextResponse.json({ ok: true, files: readWorkspaceTree(ex) });',
    apres: '      resetWorkspace(ex); writeProgress({ ...readProgress(), exerciseAttempts: [] });\n      return NextResponse.json({ ok: true, files: readWorkspaceTree(ex) });',
    note: 'la réinitialisation efface l’histoire d’un échec' },
  { id: 'M16', famille: '`RESET_EXERCISE` inventé', garde: 'gate', fichier: R,
    avant: "    if (action === 'reset-file') {",
    apres: "    if (action === 'reset-exercise') { resetWorkspace(ex); return NextResponse.json({ ok: true }); }\n    if (action === 'reset-file') {",
    note: 'la sémantique gelée comme inexistante est créée' },
  { id: 'M17', famille: 'journal effaçable par `RESET`', garde: 'gate', fichier: AJS,
    avant: "const ROOT = join(process.cwd(), 'data', 'lab-journals');",
    apres: "const ROOT = join(process.cwd(), 'data', 'lab-workspaces');",
    note: 'le journal rejoint ce qu’un `RESET` balaie' },

  // ── FAMILLE 4 · FAITS FABRIQUÉS OU PERDUS (20–25, 27–28) ─────────────
  { id: 'M18', famille: 'échec non persisté', garde: 'sonde', fichier: LE,
    avant: "  if (!attempt) return fail('INVALID_EXERCISE_ATTEMPT', 'Tentative d’exercice invalide.');",
    apres: "  if (!attempt) return fail('INVALID_EXERCISE_ATTEMPT', 'Tentative d’exercice invalide.');\n  if (attempt.outcome !== 'success') return { ok: true, progress, effects: [] };",
    note: 'le défaut V74 · CP0 ressuscité', sondes: ['cp11'] },
  { id: 'M19', famille: 'preuve dupliquée', garde: 'gate', fichier: R,
    avant: '              canonicalSourceId: ex.id,', apres: '              canonicalSourceId: `lab-${ex.id}`,',
    note: 'le double comptage du CP11 revient' },
  { id: 'M20', famille: 'preuve dupliquée (moteur)', garde: 'test', fichier: LE,
    avant: '  const nomDuFait = validId(cmd.canonicalSourceId, 64) ?? cmd.evidenceId;',
    apres: '  const nomDuFait = cmd.evidenceId;', note: 'le moteur ignore le nom du fait' },
  { id: 'M21', famille: 'registres hérités non réparés', garde: 'gate', fichier: EV,
    avant: '  return fusionnerPreuvesDeLaboratoire(out)', apres: '  return out',
    note: 'les doublons déjà écrits restent comptés deux fois' },
  { id: 'M22', famille: 'fusion qui perd une preuve', garde: 'test', fichier: EV,
    avant: '    return !(parSource.has(nu) && parSource.get(nu) === comps(e));',
    apres: '    void nu; return false;', note: 'la réparation devient une suppression' },
  { id: 'M23', famille: 'provenance perdue', garde: 'gate', fichier: HV,
    avant: '    reussite: true,', apres: '    reussite: aides.length === 0,',
    note: 'une réussite après aide cesse d’être une réussite' },
  { id: 'M24', famille: 'aide devenue une note', garde: 'gate', fichier: HV,
    avant: '    aidesConsultees: aides.length,', apres: '    aidesConsultees: aides.length,\n    score: Math.max(0, 100 - aides.length * 20),',
    note: 'un score fabriqué apparaît' },
  { id: 'M25', famille: 'fait perdu par liste blanche', garde: 'gate', fichier: PS,
    // V77 · CP3 — l'énumération des faits du store vit désormais à UN endroit ;
    // la mutation vise cette déclaration, faute de quoi elle serait sans effet et
    // le harnais conclurait à tort que la porte tient.
    avant: '    hintViews: normalizeHintViews(src?.hintViews).slice(-MAX_HINT_VIEWS),', apres: '    // hintViews retiré',
    note: 'le défaut P7 de V75 rejoué sur `hintViews`' },

  // ── FAMILLE 5 · HISTORIQUE ET COMPARAISON (29–32) ────────────────────
  { id: 'M26', famille: 'reprise qui écrase l’historique', garde: 'test', fichier: AJ,
    avant: '  const base = (Array.isArray(journal) ? journal : []).filter((e) => isObj(e) && e.cle !== entree.cle);',
    apres: '  const base = [];', note: 'chaque lancement remplace tout l’historique' },
  { id: 'M27', famille: 'tentative masquée', garde: 'test', fichier: AJ,
    avant: '      conserve: !!j,', apres: '      conserve: true,',
    note: 'une tentative sans code se prétend conservée' },
  { id: 'M28', famille: 'compteurs venus du journal', garde: 'test', fichier: AJ,
    avant: '      passed: f.passed,\n      total: f.total,',
    apres: '      passed: j?.passed ?? f.passed,\n      total: j?.total ?? f.total,',
    note: 'le journal fait autorité sur le fait' },
  { id: 'M29', famille: 'régression masquée', garde: 'test', fichier: AD,
    avant: '    else if (!t.passed && av.passed) casses.push(nom);',
    apres: '    else if (!t.passed && av.passed) toujoursKO.push(nom);',
    note: 'un test cassé n’est plus signalé' },
  { id: 'M30', famille: 'comparaison inversée', garde: 'sonde', fichier: R,
    avant: '      const [ancien, recent] = ea && eb && String(ea.at) > String(eb.at) ? [eb, ea] : [ea, eb];',
    apres: '      const [ancien, recent] = [ea, eb];',
    note: 'un progrès se lit comme une régression', sondes: ['cp10'] },
  { id: 'M31', famille: 'journal non écrit', garde: 'sonde', fichier: AJS,
    avant: '  return consignerTentative(ROOT, exerciseId, donnees);',
    apres: '  void ROOT; void exerciseId; void donnees; return false;',
    note: 'plus aucune comparaison possible', sondes: ['cp10'] },

  // ── FAMILLE 6 · LA PORTE ELLE-MÊME (exigence explicite du brief) ─────
  //
  // « TESTER LA PORTE V76 ELLE-MÊME PAR MUTATION. » Une porte qui ne peut pas
  // échouer est un décor, et elle rassure d'autant plus qu'elle est verte.
  { id: 'M32', famille: 'la porte ne compte plus les violations', garde: 'autoporte', fichier: GATE,
    avant: 'if (violations.length) {', apres: 'if (false && violations.length) {',
    note: 'la porte rend vert quoi qu’il arrive' },
  { id: 'M33', famille: 'la porte n’enregistre plus rien', garde: 'autoporte', fichier: GATE,
    avant: 'const check = (ok, regle, detail = \'\') => { verifs += 1; if (!ok) violations.push({ regle, detail }); };',
    apres: 'const check = (ok, regle, detail = \'\') => { verifs += 1; void ok; void regle; void detail; };',
    note: 'chaque vérification devient un no-op' },
];

const sh = (c, timeout = 900000) => execSync(c, { stdio: 'pipe', timeout, cwd: ROOT });

/** Le test correspondant à la mutation, ou toute la suite si on ne sait pas. */
function commandeTest() { return 'npm test'; }

async function jouerSonde(nom, port) {
  process.env.V76_BASE = `http://127.0.0.1:${port}`;
  const chemin = join(ROOT, 'scripts', 'v76', `${nom === 'cp9' ? 'cp9-persistence' : nom === 'cp10' ? 'cp10-history' : 'cp11-integration'}.mjs`);
  const mod = await import(`${chemin}?t=${Date.now()}`);
  const ko = [];
  for (const s of mod.SONDES) {
    let r;
    try { r = await s.run(); } catch (e) { r = { ok: false, detail: String(e.message ?? e).slice(0, 60) }; }
    if (r.ok === false) ko.push(s.id);
  }
  return ko;
}

if (process.argv[1] && process.argv[1].endsWith('cp14-mutations.mjs')) {
  // Filtre : un niveau de garde (`test`, `gate`, `sonde`, `autoporte`), ou une
  // liste d'identifiants. Les lots existent parce qu'une exécution de trente
  // suites complètes à la file a été tuée pour épuisement mémoire : le gantelet
  // doit pouvoir se rejouer par morceaux sans perdre son sens.
  const filtre = process.argv[2] ?? null;
  const liste = !filtre ? MUTATIONS
    : /^M\d/.test(filtre) ? MUTATIONS.filter((m) => filtre.split(',').includes(m.id))
      : MUTATIONS.filter((m) => m.garde === filtre);
  const res = [];
  // ── PORT LIBRE, VÉRIFIÉ ──
  //
  // Un lot précédent a rendu trois mutations « survivantes » alors qu'elles
  // étaient parfaitement mortelles : un serveur resté en vie d'une exécution
  // tuée tenait encore le port, le nouveau `next start` échouait sur
  // `EADDRINUSE`, et les sondes interrogeaient donc du CODE NON MUTÉ. Un faux
  // négatif de gantelet est exactement ce que ce checkpoint existe pour
  // empêcher : on part d'un port aléatoire et on VÉRIFIE que le serveur qu'on
  // interroge est bien celui qu'on vient de lancer.
  let port = 3600 + Math.floor(Math.random() * 300);

  for (const m of liste) {
    const src = readFileSync(join(ROOT, m.fichier), 'utf8');
    const apres = m.remplacer ?? m.apres;
    if (!src.includes(m.avant)) { res.push({ ...m, verdict: 'MOTIF INTROUVABLE' }); continue; }
    writeFileSync(join(ROOT, m.fichier), src.replace(m.avant, apres));

    let verdict = '❌ SURVIT';
    let par = '';
    try {
      if (m.garde === 'test') {
        try { sh(commandeTest()); }
        catch (e) { verdict = 'TUÉE'; par = String(e.stdout ?? '').match(/not ok \d+ - (.+)/)?.[1]?.slice(0, 70) ?? 'npm test'; }
      } else if (m.garde === 'gate' || m.garde === 'autoporte') {
        // La porte d'abord — c'est elle qu'on prétend tester.
        try { sh('npm run v76:check', 180000); }
        catch (e) { verdict = 'TUÉE'; par = String(e.stdout ?? '').match(/• (\[[^\]]+\][^\n]*)/)?.[1]?.slice(0, 70) ?? 'v76:check'; }
        // Une mutation `gate` peut aussi être vue par les tests : on le note.
        if (verdict === '❌ SURVIT') {
          try { sh(commandeTest()); }
          catch (e) { verdict = 'TUÉE'; par = `npm test — ${String(e.stdout ?? '').match(/not ok \d+ - (.+)/)?.[1]?.slice(0, 50) ?? ''}`; }
        }
      } else {
        port += 1;
        sh('npx next build');
        // ── L'ÉTAT DOIT ÊTRE NEUF, SINON LA MUTATION SE CACHE DERRIÈRE ──
        //
        // `M31` (« le journal n'est plus écrit ») a d'abord SURVÉCU : les
        // entrées des exécutions précédentes étaient encore sur le disque, donc
        // les sondes trouvaient de quoi comparer et passaient. La mutation
        // n'empêche pas de LIRE un vieux journal, elle empêche d'en ÉCRIRE un
        // nouveau — et une sonde qui part d'un disque plein ne voit pas la
        // différence.
        rmSync(join(ROOT, 'data/lab-journals'), { recursive: true, force: true });
        rmSync(join(ROOT, 'data/lab-workspaces'), { recursive: true, force: true });
        sh(`(AICOS_PROGRESS_FILE=${PROGRESS} setsid npx next start -p ${port} > ${SP}/mut-${m.id}.log 2>&1 & echo $! > ${SP}/mut-${m.id}.pid)`);
        await new Promise((r) => setTimeout(r, 15000));
        // Le serveur répond-il, et est-ce bien LE NÔTRE ?
        const journal = readFileSync(join(SP, `mut-${m.id}.log`), 'utf8');
        // `SONDE_INVALIDE` est distinct d'une mutation tuée ET d'une survivante :
        // on ne sait simplement pas. Le compter comme un succès serait pire que
        // de ne rien mesurer.
        if (/EADDRINUSE/.test(journal)) throw new Error(`SONDE_INVALIDE — port ${port} déjà pris`);
        const vivant = await fetch(`http://127.0.0.1:${port}/api/lab/greeting`).then((r) => r.ok).catch(() => false);
        if (!vivant) throw new Error(`SONDE_INVALIDE — aucun serveur sur ${port}`);
        const ko = [];
        for (const s of m.sondes) ko.push(...(await jouerSonde(s, port)).map((x) => `${s}:${x}`));
        try { sh(`kill -9 $(cat ${SP}/mut-${m.id}.pid) 2>/dev/null; true`); } catch { /* déjà mort */ }
        if (ko.length) { verdict = 'TUÉE'; par = ko.join(' '); }
      }
    } catch (e) {
      const msg = String(e.message ?? e);
      if (msg.includes('SONDE_INVALIDE')) { verdict = 'SONDE INVALIDE'; par = msg.slice(0, 70); }
      else { verdict = 'TUÉE'; par = `compilation — ${msg.slice(0, 50)}`; }
    }
    writeFileSync(join(ROOT, m.fichier), src);
    res.push({ ...m, verdict, par });
    console.error(`${m.id} ${verdict} ${par}`);
  }

  console.log('# V76 · CP14 — Le gantelet de mutations\n');
  console.log(`> ${res.length} mutations appliquées une à une, produit restauré après chacune.\n`);
  console.log('| # | famille | mutation | gardée par | verdict |');
  console.log('|---|---|---|---|---|');
  for (const r of res) {
    console.log(`| ${r.id} | ${r.famille} | ${r.note} | \`${r.garde}\` | ${r.verdict === 'TUÉE' ? `✅ **tuée** — ${r.par}` : `❌ ${r.verdict}`} |`);
  }
  const survivantes = res.filter((r) => r.verdict !== 'TUÉE');
  console.log(`\n**Mutations tuées** : ${res.filter((r) => r.verdict === 'TUÉE').length} / ${res.length}`);
  console.log(`**Survivantes** : ${survivantes.length === 0 ? '✅ aucune' : `❌ ${survivantes.map((r) => r.id).join(' ')}`}`);
  // ── LE GANTELET SE REJOUE PAR LOTS, IL NE S'EFFACE PAS ──
  //
  // Trente-trois mutations d'affilée, c'est trente reconstructions et autant de
  // suites complètes : la première tentative a été tuée pour épuisement
  // mémoire. Les résultats FUSIONNENT donc avec ceux déjà consignés, le lot le
  // plus récent faisant foi pour une mutation rejouée après renforcement.
  const fichier = join(ROOT, 'docs', 'v76', 'cp14-mutations.json');
  const anciens = existsSync(fichier) ? JSON.parse(readFileSync(fichier, 'utf8')) : [];
  const parId = new Map((Array.isArray(anciens) ? anciens : []).map((r) => [r.id, r]));
  for (const r of res) parId.set(r.id, r);
  const tous = [...parId.values()].sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync(fichier, `${JSON.stringify(tous, null, 1)}\n`);
  const restantes = tous.filter((r) => r.verdict !== 'TUÉE');
  console.log(`\n**Cumul de tous les lots** : ${tous.filter((r) => r.verdict === 'TUÉE').length} / ${tous.length} tuées`
    + `${restantes.length ? ` · non tuées : ${restantes.map((r) => `${r.id} (${r.verdict})`).join(' ')}` : ' · aucune survivante'}`);
  console.log('\nécrit : docs/v76/cp14-mutations.json');
  if (survivantes.length) process.exitCode = 1;
}
