// V76 · CP11 — LA CHAÎNE COMPLÈTE, MESURÉE SUR UN ÉTAT NEUF.
//
// ── CE QUE CE CHECKPOINT AUDITE, ET POURQUOI IL NE CONSTRUIT RIEN ───────
//
//   WORKBENCH → ExerciseAttempt → Evidence → concepts → compétence
//             → Rétention → Récupération
//
// Chacun de ces maillons a été construit par un sprint différent — V27 pour la
// preuve, V64 pour le moteur, V74 pour la tentative, V75 pour les concepts et la
// récupération. **Aucun sprint n'a jamais mesuré la chaîne entière d'un bout à
// l'autre sur un état NEUF.**
//
// Un état neuf est la condition qui rend la mesure possible : sur une fixture
// déjà remplie, « une preuve de plus » se noie dans le bruit. Ici, chaque
// scénario part de zéro et on compte exactement ce qui apparaît.
//
// ── LA QUESTION QUE LE BRIEF POSE EN PREMIER ────────────────────────────
//
//   > « CHASSER LE DOUBLE COMPTAGE — une réussite ne doit pas produire DEUX
//   >   preuves équivalentes par deux chemins. »
//
// Le code lui-même annonce la réponse, dans un commentaire de V75 · CP4 :
//
//   > « Une réussite au laboratoire écrit DEUX preuves au registre : celle de
//   >   `recordExerciseSuccess` (`sourceId: <exerciseId>`) et celle-ci
//   >   (`sourceId: lab-<exerciseId>`). Les identifiants diffèrent, donc le
//   >   dédoublonnage ne les fusionne pas. »
//
// C'est écrit, assumé, et **jamais mesuré**. Ce script mesure les conséquences.
import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = process.cwd();
const BASE = process.env.V76_BASE ?? 'http://127.0.0.1:3340';
const PROGRESS = process.env.AICOS_PROGRESS_FILE ?? null;

/** Un exercice `node-js` rattaché à des journées, avec des compétences. */
const CIBLE = process.env.V76_CIBLE ?? 'a11y-accessible-name';

const jlire = (p) => JSON.parse(readFileSync(p, 'utf8'));
const EX = (id) => jlire(join(ROOT, 'data/exercises', `${id}.json`));

const appel = async (chemin, body) => {
  const r = await fetch(`${BASE}${chemin}`, body
    ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }
    : undefined);
  let j = null;
  try { j = await r.json(); } catch { /* corps non-JSON */ }
  return { status: r.status, body: j };
};
const lab = (id, body) => appel(`/api/lab/${id}`, body);

const depart = (id) => {
  const out = {};
  for (const f of EX(id).workspace?.files ?? []) if (!f.hidden && !f.readOnly) out[f.path] = f.content ?? '';
  return out;
};
const reference = (id) => ({ ...depart(id), ...(EX(id).reference ?? {}) });

/**
 * ── REPARTIR DE ZÉRO, VRAIMENT ───────────────────────────────────────────
 *
 * Écrit une progression vide dans la fixture HORS DÉPÔT et efface l'espace de
 * travail + le journal de l'exercice. Sans cela, chaque scénario hériterait des
 * preuves du précédent et « une preuve de plus » deviendrait invisible.
 */
function remiseAZero() {
  if (!PROGRESS) throw new Error('AICOS_PROGRESS_FILE doit désigner une fixture hors dépôt.');
  mkdirSync(dirname(PROGRESS), { recursive: true });
  writeFileSync(PROGRESS, `${JSON.stringify({ startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {} }, null, 1)}\n`);
  rmSync(join(ROOT, 'data/lab-workspaces'), { recursive: true, force: true });
  rmSync(join(ROOT, 'data/lab-journals'), { recursive: true, force: true });
}

/** L'état persisté, piste active. */
function etat() {
  const p = jlire(PROGRESS);
  const t = p.tracks?.[p.activeTrackId] ?? p;
  return {
    exerciseAttempts: t.exerciseAttempts ?? [],
    transferAttempts: t.transferAttempts ?? [],
    evidence: t.evidence ?? [],
    hintViews: t.hintViews ?? [],
    days: t.days ?? {},
  };
}

/** Les preuves du registre canonique qui concernent cet exercice. */
const preuvesDe = (e, id) => e.evidence.filter((x) => String(x.sourceId ?? '') === id || String(x.sourceId ?? '') === `lab-${id}`);
/** Les preuves attachées aux JOURNÉES (structure V7, distincte du registre). */
const preuvesDeJour = (e, id) => Object.values(e.days)
  .flatMap((d) => (d?.evidence ?? []))
  .filter((x) => String(x?.url ?? '') === `/lab/${id}`);

const joursDe = (id) => {
  const idx = jlire(join(ROOT, 'data/day-exercises.json'));
  const out = [];
  for (const [jour, liste] of Object.entries(idx)) {
    if (Array.isArray(liste) && liste.includes(id)) out.push(Number(jour));
  }
  return out.sort((a, b) => a - b);
};

/** Démarre la session d'une journée : sans elle, la SOUMISSION est refusée. */
const demarrerJour = (jour) => appel('/api/progress', { command: { type: 'START', day: jour } });

export const SONDES = [
  {
    id: 'I1', nom: 'ÉCHEC : la tentative est écrite, et AUCUNE preuve',
    async run() {
      remiseAZero();
      await lab(CIBLE, { action: 'run', files: depart(CIBLE) });
      const e = etat();
      const att = e.exerciseAttempts.filter((a) => a.exerciseId === CIBLE);
      return {
        ok: att.length === 1 && att[0].outcome !== 'success' && preuvesDe(e, CIBLE).length === 0,
        detail: `${att.length} tentative(s) · issue « ${att[0]?.outcome} » · ${preuvesDe(e, CIBLE).length} preuve(s)`,
      };
    },
  },
  {
    id: 'I2', nom: 'RÉUSSITE : combien de preuves pour UNE réussite ?',
    async run() {
      remiseAZero();
      const jours = joursDe(CIBLE);
      for (const j of jours) await demarrerJour(j);
      await lab(CIBLE, { action: 'run', files: reference(CIBLE) });
      const e = etat();
      const p = preuvesDe(e, CIBLE);
      const sources = [...new Set(p.map((x) => `${x.sourceType}:${x.sourceId}`))];
      return {
        // Une réussite = UN fait = UNE preuve. Deux preuves du même fait, ce
        // n'est pas deux preuves : c'est la même, comptée deux fois.
        ok: p.length === 1,
        detail: `**${p.length} preuve(s)** au registre · sources : ${sources.join(' + ') || '—'} · ${preuvesDeJour(e, CIBLE).length} preuve(s) de journée`,
      };
    },
  },
  {
    id: 'I3', nom: 'REPRISE : relancer une réussite n’ajoute rien',
    async run() {
      const avant = etat();
      await lab(CIBLE, { action: 'run', files: reference(CIBLE) });
      await new Promise((r) => setTimeout(r, 1100));
      await lab(CIBLE, { action: 'run', files: reference(CIBLE) });
      const apres = etat();
      const dP = preuvesDe(apres, CIBLE).length - preuvesDe(avant, CIBLE).length;
      return {
        ok: dP === 0,
        detail: `preuves ${preuvesDe(avant, CIBLE).length} → ${preuvesDe(apres, CIBLE).length} · tentatives ${avant.exerciseAttempts.length} → ${apres.exerciseAttempts.length}`,
      };
    },
  },
  {
    id: 'I4', nom: 'La PREUVE DE JOURNÉE converge, elle, sur UN identifiant',
    async run() {
      // Le chemin qui fonctionne : `recordExerciseSuccess` et la commande
      // `SUBMIT` nomment tous deux `lab-<id>`, donc la journée n'en garde qu'un.
      const e = etat();
      const pj = preuvesDeJour(e, CIBLE);
      const ids = [...new Set(pj.map((x) => x.id))];
      return { ok: pj.length === ids.length && ids.length <= 1, detail: `${pj.length} preuve(s) de journée · identifiants : ${ids.join(' ') || '—'}` };
    },
  },
  {
    id: 'I5', nom: 'DOUBLE COMPTAGE → la compétence monte-t-elle toute seule ?',
    async run() {
      // La règle de consolidation (`lib/competency.mjs`) exige DEUX SOURCES
      // DISTINCTES et DEUX DATES DISTINCTES pour passer à `reinforced` :
      //   « deux réussites le même jour sont une séance, pas un réancrage ».
      //
      // « Deux sources distinctes » veut dire deux exercices, deux évaluations —
      // deux occasions différentes de démontrer la même compétence. Si UN SEUL
      // exercice suffit à en fournir deux, la règle ne mesure plus rien.
      const e = etat();
      const p = preuvesDe(e, CIBLE).filter((x) => x.validation?.status === 'passed');
      const sources = new Set(p.map((x) => `${x.sourceType}:${x.sourceId}`));
      return {
        ok: sources.size <= 1,
        detail: `un seul exercice réussi fournit **${sources.size} source(s) distincte(s)** : ${[...sources].join(' + ')}`,
      };
    },
  },
  {
    id: 'I6', nom: 'RÉTENTION : combien de contacts pour UNE réussite ?',
    async run() {
      const e = etat();
      const { collectContacts } = await import(`${ROOT}/lib/learner-memory.mjs`);
      const contacts = collectContacts(e).filter((c) => c.ref === CIBLE || String(c.ref ?? '').includes(CIBLE));
      const parType = {};
      for (const c of contacts) parType[c.kind] = (parType[c.kind] ?? 0) + 1;
      // Attendu : 1 contact `exercise` par tentative (elles sont des faits
      // distincts, c'est voulu) et 1 seul contact `evidence` par réussite.
      return {
        ok: (parType.evidence ?? 0) <= 1,
        detail: `contacts : ${Object.entries(parType).map(([k, n]) => `${k}=${n}`).join(' · ') || '—'}`,
      };
    },
  },
  {
    id: 'I7', nom: 'CONCEPTS : les deux producteurs de preuves les portent-ils ?',
    async run() {
      const e = etat();
      const p = preuvesDe(e, CIBLE);
      const avec = p.filter((x) => (x.conceptIds ?? []).length > 0);
      return {
        ok: p.length > 0 && avec.length === p.length,
        detail: p.length
          ? `${avec.length}/${p.length} preuve(s) portent des concepts · ${[...new Set(p.flatMap((x) => x.conceptIds ?? []))].join(' ') || 'aucun'}`
          : 'aucune preuve',
      };
    },
  },
  {
    id: 'I8', nom: 'AIDE : une réussite après aide reste une réussite, et le DIT',
    async run() {
      remiseAZero();
      for (const j of joursDe(CIBLE)) await demarrerJour(j);
      // Trois échecs font monter l'échelle d'aide ; le produit consigne chaque
      // marche servie (CP7).
      for (let i = 0; i < 3; i += 1) {
        await lab(CIBLE, { action: 'run', files: depart(CIBLE) });
        await new Promise((r) => setTimeout(r, 1100));
      }
      const r = await lab(CIBLE, { action: 'run', files: reference(CIBLE) });
      const e = etat();
      const prov = r.body?.provenance;
      return {
        ok: !!prov && prov.reussite === true && prov.aidesConsultees > 0 && preuvesDe(e, CIBLE).length > 0,
        detail: prov
          ? `${e.hintViews.length} aide(s) consignée(s) · provenance : « ${prov.lecture} » · réussite conservée : ${prov.reussite}`
          : '❌ aucune provenance rendue',
      };
    },
  },
  {
    id: 'I9', nom: 'CORRECTION OUVERTE : la tentative suivante ne vaut PAS récupération',
    async run() {
      remiseAZero();
      const jours = joursDe(CIBLE);
      for (const j of jours) await demarrerJour(j);
      // On ouvre la correction de la journée, puis on réussit.
      await appel('/api/progress', { command: { type: 'SET_CORRECTION_STATE', day: jours[0], value: 'viewed' } });
      await lab(CIBLE, { action: 'run', files: reference(CIBLE) });
      const e = etat();
      const a = e.exerciseAttempts.filter((x) => x.exerciseId === CIBLE).pop();
      return {
        // `correctionSeen: true` est la condition R-b du contrat V74 : une
        // tentative postérieure à l'ouverture de la correction reste un contact
        // significatif, jamais un rappel.
        ok: a?.correctionSeen === true,
        detail: a ? `correctionSeen = ${a.correctionSeen} · issue « ${a.outcome} »` : 'aucune tentative',
      };
    },
  },
  {
    id: 'I10', nom: 'TRANSFERT : le défi écrit SON fait, distinct de la tentative d’exercice',
    async run() {
      remiseAZero();
      const dossier = join(ROOT, 'data/transfer-challenges');
      const { readdirSync } = await import('node:fs');
      const fichier = readdirSync(dossier).find((f) => f.endsWith('.json'));
      const defi = jlire(join(dossier, fichier));
      const bonnes = Object.fromEntries(defi.questions.map((q) => [q.id, q.answer]));
      await appel(`/api/transfer/${defi.id}`, { responses: bonnes });
      const e = etat();
      return {
        ok: e.transferAttempts.length === 1 && e.exerciseAttempts.length === 0,
        detail: `${e.transferAttempts.length} TransferAttempt · ${e.exerciseAttempts.length} ExerciseAttempt · ${e.evidence.length} preuve(s)`,
      };
    },
  },
  {
    id: 'I11', nom: 'MULTI-CONCEPTS : la preuve les porte TOUS, sans en choisir un',
    async run() {
      // Le CP0 de V75 avait mesuré **67 exercices multi-concepts PAR
      // CONCEPTION** : ce n'est pas un défaut à trancher, c'est une propriété du
      // corpus. La preuve doit donc porter la liste entière — en désigner un
      // seul crediterait une leçon au hasard.
      const mapping = jlire(join(ROOT, 'docs/v75/cp4-mapping.json'));
      const cas = mapping.find((m) => (m.concepts ?? []).length > 1
        && existsSync(join(ROOT, 'data/exercises', `${m.id}.json`)));
      if (!cas) return { ok: null, detail: 'aucun exercice multi-concepts dans le corpus' };

      remiseAZero();
      for (const j of joursDe(cas.id)) await demarrerJour(j);
      await lab(cas.id, { action: 'run', files: reference(cas.id) });
      const e = etat();
      const p = preuvesDe(e, cas.id);
      const portes = [...new Set(p.flatMap((x) => x.conceptIds ?? []))].sort();
      const attendus = [...cas.concepts].sort();
      const memes = JSON.stringify(portes) === JSON.stringify(attendus);
      return {
        ok: p.length === 1 && memes,
        detail: `\`${cas.id}\` · ${p.length} preuve(s) · ${portes.length}/${attendus.length} concepts portés`
          + (memes ? '' : ` — attendus ${attendus.join(' ')}, portés ${portes.join(' ') || 'aucun'}`),
      };
    },
  },
  {
    id: 'I13', nom: 'AMBIGU : aucune leçon n’est créditée au hasard',
    async run() {
      // La règle gelée de V75 · CP4 : quand aucune règle ne tranche, la liste
      // revient VIDE. Une preuve sans concept reste parfaitement valide —
      // « je ne sais pas » est une réponse, en désigner une au hasard n'en est
      // pas une.
      const mapping = jlire(join(ROOT, 'docs/v75/cp4-mapping.json'));
      const cas = mapping.find((m) => (m.concepts ?? []).length === 0
        && existsSync(join(ROOT, 'data/exercises', `${m.id}.json`)));
      if (!cas) return { ok: null, detail: 'aucun exercice ambigu dans le corpus' };

      remiseAZero();
      for (const j of joursDe(cas.id)) await demarrerJour(j);
      await lab(cas.id, { action: 'run', files: reference(cas.id) });
      const e = etat();
      const p = preuvesDe(e, cas.id);
      const portes = [...new Set(p.flatMap((x) => x.conceptIds ?? []))];
      return {
        ok: portes.length === 0,
        detail: `\`${cas.id}\` · ${p.length} preuve(s) · concepts portés : ${portes.join(' ') || 'aucun (correct)'}`,
      };
    },
  },
  {
    id: 'I12', nom: '`data/progress.json` n’est JAMAIS créé',
    async run() {
      const existe = existsSync(join(ROOT, 'data/progress.json'));
      return { ok: !existe, detail: existe ? '❌ le fichier a été créé dans le dépôt' : 'absent' };
    },
  },
];

if (process.argv[1] && process.argv[1].endsWith('cp11-integration.mjs')) {
  console.log('# V76 · CP11 — Audit d’intégration au moteur d’apprentissage\n');
  console.log(`> Serveur : \`${BASE}\` · fixture hors dépôt, **remise à zéro à chaque scénario** · cible \`${CIBLE}\`.\n`);
  console.log('| # | sonde | résultat | observation |');
  console.log('|---|---|---|---|');
  const res = [];
  for (const s of SONDES) {
    let r;
    try { r = await s.run(); } catch (e) { r = { ok: false, detail: `sonde en erreur : ${String(e.message ?? e).slice(0, 90)}` }; }
    res.push({ id: s.id, nom: s.nom, ...r });
    console.log(`| ${s.id} | ${s.nom} | ${r.ok === null ? '⚪' : r.ok ? '✅' : '❌'} | ${r.detail} |`);
  }
  const ko = res.filter((r) => r.ok === false);
  console.log(`\n**Sondes en échec** : ${ko.length === 0 ? '✅ aucune' : `❌ ${ko.map((r) => r.id).join(' ')}`}`);
  writeFileSync(join(ROOT, 'docs', 'v76', 'cp11-integration.json'), `${JSON.stringify(res, null, 1)}\n`);
  console.log('\nécrit : docs/v76/cp11-integration.json');
}
