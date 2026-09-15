// V77 · CP0 — CE QUE LES SURFACES LAISSENT VRAIMENT, MESURÉ SUR LE PRODUIT.
//
// ── POURQUOI UNE SONDE EN PLUS DE L'INVENTAIRE ──────────────────────────
//
// `cp0-practice-forensics.mjs` lit le disque : quelles surfaces existent, quels
// appels d'écriture leur code contient. C'est nécessaire et insuffisant — V76 a
// payé quatre fois pour l'apprendre : un appel présent dans une source ne prouve
// pas qu'il s'exécute, et une absence d'appel ne prouve pas qu'aucun fait n'est
// écrit ailleurs dans la chaîne.
//
// Cette sonde parle au produit en marche, agit sur chaque surface, et **compte
// ce qui apparaît sur le disque**. Rien n'est déduit.
//
// STRICTEMENT EN LECTURE DU PRODUIT : elle n'écrit que dans la fixture de
// progression désignée par `AICOS_PROGRESS_FILE`, hors dépôt.
import { readFileSync, readdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const BASE = process.env.V77_BASE ?? 'http://127.0.0.1:3701';
const PROGRESS = process.env.AICOS_PROGRESS_FILE;

const jlire = (p) => JSON.parse(readFileSync(p, 'utf8'));
const D = (p) => jlire(join(ROOT, p));

const post = (u, b) => fetch(BASE + u, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b),
}).then(async (r) => ({ s: r.status, j: await r.json().catch(() => null) }));
const get = (u) => fetch(BASE + u).then(async (r) => ({ s: r.status, j: await r.json().catch(() => null) }));

/** L'état de l'apprenant, tel qu'il est sur le disque. */
function etat() {
  const p = jlire(PROGRESS);
  const t = p.tracks?.[p.activeTrackId] ?? p;
  return {
    evidence: t.evidence ?? [],
    exerciseAttempts: t.exerciseAttempts ?? [],
    transferAttempts: t.transferAttempts ?? [],
    recallAttempts: t.recallAttempts ?? [],
    hintViews: t.hintViews ?? [],
    days: t.days ?? {},
  };
}
const compte = () => {
  const e = etat();
  return {
    evidence: e.evidence.length,
    exerciseAttempts: e.exerciseAttempts.length,
    transferAttempts: e.transferAttempts.length,
    recallAttempts: e.recallAttempts.length,
    hintViews: e.hintViews.length,
    preuvesDeJour: Object.values(e.days).reduce((n, d) => n + ((d?.evidence ?? []).length), 0),
  };
};
const ecart = (a, b) => Object.keys(a).filter((k) => a[k] !== b[k]).map((k) => `${k} ${a[k]}→${b[k]}`);

function remiseAZero() {
  if (!PROGRESS) throw new Error('AICOS_PROGRESS_FILE doit désigner une fixture hors dépôt.');
  writeFileSync(PROGRESS, `${JSON.stringify({ startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} }, null, 1)}\n`);
  rmSync(join(ROOT, 'data/lab-workspaces'), { recursive: true, force: true });
  rmSync(join(ROOT, 'data/lab-journals'), { recursive: true, force: true });
}

const premier = (dir) => readdirSync(join(ROOT, dir)).filter((f) => f.endsWith('.json'))[0].replace(/\.json$/, '');

export const SONDES = [
  {
    id: 'A1', nom: 'KUBERNETES — analyse un manifeste, écrit-il quelque chose ?',
    async run() {
      remiseAZero();
      const a = compte();
      const r = await post(`/api/kubernetes/${premier('data/manifests')}`, { action: 'analyze' });
      const b = compte();
      const diag = r.j?.analysis?.summary?.total ?? null;
      return {
        ok: null, // MESURE, pas conformité : le CP0 constate.
        detail: `HTTP ${r.s} · ${diag} diagnostic(s) rendus · état : ${ecart(a, b).join(' ') || '**aucun changement**'}`,
      };
    },
  },
  {
    id: 'A2', nom: 'CLOUD-LAB — analyse une topologie',
    async run() {
      const a = compte();
      const r = await post(`/api/cloud-lab/${premier('data/topologies')}`, { action: 'analyze' });
      const b = compte();
      return { ok: null, detail: `HTTP ${r.s} · ${r.j?.analysis?.summary?.total ?? '?'} diagnostic(s) · état : ${ecart(a, b).join(' ') || '**aucun changement**'}` };
    },
  },
  {
    id: 'A3', nom: 'CLOUD-FOUNDATIONS — analyse une architecture',
    async run() {
      const a = compte();
      const r = await post('/api/cloud-foundations/aws-ha-api', { action: 'analyze' });
      const b = compte();
      return { ok: null, detail: `HTTP ${r.s} · état : ${ecart(a, b).join(' ') || '**aucun changement**'}` };
    },
  },
  {
    id: 'A4', nom: 'SECURITY — analyse un scénario',
    async run() {
      const a = compte();
      const r = await post('/api/security/unhardened-workload', { action: 'analyze' });
      const b = compte();
      return { ok: null, detail: `HTTP ${r.s} · ${r.j?.analysis?.summary?.total ?? '?'} diagnostic(s) · état : ${ecart(a, b).join(' ') || '**aucun changement**'}` };
    },
  },
  {
    id: 'A5', nom: 'PIPELINES — exécute un pipeline (verdict OBJECTIF)',
    async run() {
      const a = compte();
      const id = premier('data/pipelines');
      // Le déclencheur doit correspondre à celui du pipeline, sinon le run est
      // « skipped » et la sonde mesure sa propre erreur, pas le produit.
      const p = D(`data/pipelines/${id}.json`);
      const kind = (p.trigger ?? ['manual'])[0];
      const r = await post(`/api/pipelines/${id}`, { action: 'run', event: { kind, branch: 'main' } });
      const b = compte();
      const st = r.j?.run?.status ?? r.j?.run?.conclusion ?? null;
      return { ok: null, detail: `HTTP ${r.s} · statut du run : **${st}** · état : ${ecart(a, b).join(' ') || '**aucun changement**'}` };
    },
  },
  {
    id: 'A6', nom: 'TERMINAL — exécute réellement une commande',
    async run() {
      const a = compte();
      const r = await post('/api/terminal/term-list-files', { action: 'run', args: { format: '-la' } });
      const b = compte();
      const run = r.j?.run ?? {};
      return {
        ok: null,
        detail: `HTTP ${r.s} · exitCode **${run.exitCode}** · ${String(run.stdout ?? '').length} o de sortie · état : ${ecart(a, b).join(' ') || '**aucun changement**'}`,
      };
    },
  },
  {
    id: 'A7', nom: 'ASSESSMENT — un échec puis une réussite',
    async run() {
      remiseAZero();
      const id = premier('data/assessments');
      const a = D(`data/assessments/${id}.json`);
      const bonnes = Object.fromEntries((a.questions ?? []).map((q) => [q.id, q.answer]));
      const fausses = Object.fromEntries((a.questions ?? []).map((q) => [q.id, Array.isArray(q.answer) ? [] : (q.answer === 0 ? 1 : 0)]));
      const c0 = compte();
      await post(`/api/assessments/${id}`, { responses: fausses, record: true });
      const c1 = compte();
      await post(`/api/assessments/${id}`, { responses: bonnes, record: true });
      const c2 = compte();
      return {
        ok: null,
        detail: `échec : ${ecart(c0, c1).join(' ') || 'rien'} · réussite : ${ecart(c1, c2).join(' ') || 'rien'}`,
      };
    },
  },
  {
    id: 'A8', nom: 'ASSESSMENT — trois échecs de plus : combien de traces ?',
    async run() {
      const id = premier('data/assessments');
      const a = D(`data/assessments/${id}.json`);
      const fausses = Object.fromEntries((a.questions ?? []).map((q) => [q.id, Array.isArray(q.answer) ? [] : (q.answer === 0 ? 1 : 0)]));
      const c0 = compte();
      for (let i = 0; i < 3; i += 1) await post(`/api/assessments/${id}`, { responses: fausses, record: true });
      const c1 = compte();
      return {
        ok: null,
        detail: ecart(c0, c1).length
          ? ecart(c0, c1).join(' ')
          : '**aucune trace supplémentaire** — trois échecs de plus sont invisibles',
      };
    },
  },
  {
    id: 'A9', nom: 'MISSION — un document STRUCTURELLEMENT conforme et FAUX suffit-il ?',
    async run() {
      // ── LE POINT LE PLUS DÉLICAT DU CP0 ──
      //
      // Le document ci-dessous est grammatical, sans texte de remplissage, et
      // décrit une conception **délibérément mauvaise** : pas de label, largeur
      // fixe, état vide muet. Si la mission le déclare `passed`, alors le
      // produit valide une FORME, pas un TRAVAIL — et l'écrit `passed` quand
      // même.
      remiseAZero();
      const M = 'frontend-accessible-search';
      const mi = D(`data/missions/${M}.json`);
      for (const d of mi.dayRefs ?? []) await post('/api/progress', { command: { type: 'START', day: d } });
      const doc = mi.deliverables.find((d) => d.validation === 'structural');
      const rev = mi.deliverables.find((d) => d.validation === 'review');
      const faux = {
        Structure: 'Le composant fait tout dans un seul fichier de mille lignes, sans separation entre affichage et donnees.',
        'États': 'Un seul booleen global sert a tout. Le chargement et l erreur partagent la meme variable.',
        // ── ANOMALIE DE SONDE V77 n° 1 ──
        // La première version écrivait « le placeholder suffit ». Le mot
        // « placeholder » figure dans la liste noire des marqueurs de
        // remplissage du validateur, qui a donc rejeté le document — et ma
        // sonde en a conclu que la structure était refusée pour une bonne
        // raison. Elle ne l'était pas. Le mot est ici un TERME DU DOMAINE
        // (l'attribut HTML), pas un texte à compléter.
        'Accessibilité': 'On retire le label pour gagner de la place ; le texte grise suffit.',
        Responsive: 'La largeur est fixee a 1200 pixels. Sur mobile la page defile horizontalement.',
        'État': 'L etat vide affiche une page blanche sans explication.',
        Limites: 'Aucune limite connue a ce jour.',
      };
      let contenu = Object.entries(faux).map(([s, p]) => `## ${s}\n\n${p} ${p} ${p}`).join('\n\n');
      contenu += `\n\n${(doc.docSpec.requireMentions ?? []).join(', ')}.`;
      const c0 = compte();
      const r1 = await post(`/api/missions/${M}`, { action: 'submit-doc', deliverableId: doc.id, content: contenu });
      await post(`/api/missions/${M}`, { action: 'self-assess', deliverableId: rev.id, selfAssessment: { note: 'je me donne tout bon' } });
      const r3 = await post(`/api/missions/${M}`, { action: 'validate-review', deliverableId: rev.id });
      const c1 = compte();
      const evs = etat().evidence.filter((e) => e.sourceId === M);
      return {
        ok: null,
        detail: `structure ok : **${r1.j?.structure?.ok}** · mission : **${r3.j?.progress?.status}** · `
          + `état : ${ecart(c0, c1).join(' ') || 'rien'} · preuve : ${evs.map((e) => `${e.sourceType}:${e.validation?.status}/${e.validation?.kind} [${e.competencyIds}]`).join(' ') || 'aucune'}`,
      };
    },
  },
  {
    id: 'A10', nom: 'MISSION — un exercice résolu avance-t-il une mission ?',
    async run() {
      remiseAZero();
      const M = 'frontend-accessible-search'; const X = 'react-search';
      const mi = D(`data/missions/${M}.json`); const ex = D(`data/exercises/${X}.json`);
      const idx = D('data/day-exercises.json');
      for (const [j, l] of Object.entries(idx)) if (l.includes(X)) await post('/api/progress', { command: { type: 'START', day: Number(j) } });
      for (const d of mi.dayRefs ?? []) await post('/api/progress', { command: { type: 'START', day: d } });
      const files = {};
      for (const f of ex.workspace.files) if (!f.hidden && !f.readOnly) files[f.path] = f.content ?? '';
      const c0 = compte();
      await post(`/api/lab/${X}`, { action: 'run', files: { ...files, ...(ex.reference ?? {}) } });
      const c1 = compte();
      const snap = await get(`/api/missions/${M}`);
      const auto = mi.deliverables.find((d) => d.validation === 'auto');
      const st = snap.j?.state?.deliverables?.[auto.id]?.status ?? 'aucun';
      return {
        ok: null,
        detail: `exercice résolu : ${ecart(c0, c1).join(' ')} · livrable auto « ${auto.id} » de la mission : **${st}** · `
          + `avancement : ${snap.j?.progress?.requiredDone}/${snap.j?.progress?.requiredTotal}`,
      };
    },
  },
  {
    id: 'A11', nom: 'CAPSTONE — réussite : quelles preuves ?',
    async run() {
      remiseAZero();
      const id = premier('data/capstones');
      const c = D(`data/capstones/${id}.json`);
      const rep = {};
      for (const ph of c.phases ?? []) for (const q of ph.questions ?? []) rep[q.id] = q.answer;
      const c0 = compte();
      const r = await post(`/api/capstones/${id}`, { responses: rep, record: true });
      const c1 = compte();
      const evs = etat().evidence.filter((e) => e.sourceId === id);
      return {
        ok: null,
        detail: `\`${id}\` · ${r.j?.result?.passed}/${r.j?.result?.total} · réussi : **${r.j?.result?.passedOverall}** · `
          + `état : ${ecart(c0, c1).join(' ') || 'rien'} · preuve : ${evs.map((e) => `${e.validation?.status}/${e.validation?.kind}`).join(' ') || 'aucune'} · `
          + `simulation déclarée dans la preuve : **${evs.some((e) => JSON.stringify(e).toLowerCase().includes('simul'))}**`,
      };
    },
  },
  {
    id: 'A12', nom: 'PAGES DE LECTURE — une visite laisse-t-elle une trace ?',
    async run() {
      // Le brief l'exige : « ne pas considérer page visitée = activité ».
      // On vérifie que ce n'est PAS le cas aujourd'hui.
      remiseAZero();
      const c0 = compte();
      for (const u of ['/lessons', '/resources', '/retention', '/parcours', '/glossary', '/skills']) {
        await fetch(BASE + u).catch(() => null);
      }
      const c1 = compte();
      return {
        ok: ecart(c0, c1).length === 0,
        detail: ecart(c0, c1).length ? `❌ ${ecart(c0, c1).join(' ')}` : 'six pages visitées, **aucune trace** — correct',
      };
    },
  },
  {
    id: 'A13', nom: 'MISSION — la CHAÎNE COMPLÈTE : que vaut la preuve produite ?',
    async run() {
      // `A9` montre qu'un document faux passe SA validation ; `A10` qu'un
      // exercice avance le livrable auto. Reste la question qui décide :
      // qu'écrit le produit quand les trois livrables sont satisfaits ainsi ?
      remiseAZero();
      const M = 'frontend-accessible-search'; const X = 'react-search';
      const mi = D(`data/missions/${M}.json`); const ex = D(`data/exercises/${X}.json`);
      const idx = D('data/day-exercises.json');
      for (const [j, l] of Object.entries(idx)) if (l.includes(X)) await post('/api/progress', { command: { type: 'START', day: Number(j) } });
      for (const d of mi.dayRefs ?? []) await post('/api/progress', { command: { type: 'START', day: d } });
      const files = {};
      for (const f of ex.workspace.files) if (!f.hidden && !f.readOnly) files[f.path] = f.content ?? '';
      await post(`/api/lab/${X}`, { action: 'run', files: { ...files, ...(ex.reference ?? {}) } });
      const doc = mi.deliverables.find((d) => d.validation === 'structural');
      const rev = mi.deliverables.find((d) => d.validation === 'review');
      const faux = {
        Structure: 'Le composant fait tout dans un seul fichier de mille lignes, sans separation entre affichage et donnees.',
        'États': 'Un seul booleen global sert a tout. Le chargement et l erreur partagent la meme variable.',
        'Accessibilité': 'On retire le label pour gagner de la place ; le texte grise suffit.',
        Responsive: 'La largeur est fixee a 1200 pixels. Sur mobile la page defile horizontalement.',
        'État': 'L etat vide affiche une page blanche sans explication.',
        Limites: 'Aucune limite connue a ce jour.',
      };
      let contenu = Object.entries(faux).map(([s2, p2]) => `## ${s2}\n\n${p2} ${p2} ${p2}`).join('\n\n');
      contenu += `\n\n${(doc.docSpec.requireMentions ?? []).join(', ')}.`;
      await post(`/api/missions/${M}`, { action: 'submit-doc', deliverableId: doc.id, content: contenu });
      await post(`/api/missions/${M}`, { action: 'self-assess', deliverableId: rev.id, selfAssessment: { note: 'je me donne tout bon' } });
      const r = await post(`/api/missions/${M}`, { action: 'validate-review', deliverableId: rev.id });
      const e = etat();
      const evs = e.evidence;
      return {
        ok: null,
        detail: `mission : **${r.j?.progress?.status}** · ${evs.length} preuve(s) au registre : `
          + evs.map((x) => `\`${x.sourceType}:${x.sourceId}\` ${x.validation?.status}/${x.validation?.kind} [${x.competencyIds}]`).join(' · '),
      };
    },
  },
];

if (process.argv[1] && process.argv[1].endsWith('cp0-observability-probe.mjs')) {
  console.log('# V77 · CP0 — Ce que chaque surface laisse réellement\n');
  console.log(`> Serveur : \`${BASE}\` · fixture hors dépôt, remise à zéro entre les groupes.`);
  console.log('> ⚪ = **mesure**, pas conformité : le CP0 constate, il ne juge pas encore.\n');
  console.log('| # | surface | observation |');
  console.log('|---|---|---|');
  const res = [];
  for (const s of SONDES) {
    let r;
    try { r = await s.run(); } catch (e) { r = { ok: false, detail: `sonde en erreur : ${String(e.message ?? e).slice(0, 110)}` }; }
    res.push({ id: s.id, nom: s.nom, ...r });
    console.log(`| ${s.id} | ${s.nom} | ${r.ok === false ? '❌ ' : ''}${r.detail} |`);
  }
  writeFileSync(join(ROOT, 'docs', 'v77', 'cp0-observability.json'), `${JSON.stringify(res, null, 1)}\n`);
  console.log('\nécrit : docs/v77/cp0-observability.json');
}
