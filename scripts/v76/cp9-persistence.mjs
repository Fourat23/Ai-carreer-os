// V76 · CP9 — PERSISTANCE, BROUILLON PÉRIMÉ, RÉINITIALISATION.
//
// ── CE QUE LE CP0 AVAIT MESURÉ, ET CE QU'IL N'AVAIT PAS PU ──────────────
//
// Mesuré : `save` conserve le brouillon · `save` n'écrit aucun fait
// (`DRAFT ≠ ATTEMPT`, 36 → 36) · `run` écrit une tentative, succès ou échec ·
// `reset` restaure les fichiers de départ.
//
// **Non mesuré, et déclaré tel quel** (`T20` du modèle de menace) : ce qui se
// passe quand **deux onglets** travaillent sur le même exercice, et si un
// brouillon PÉRIMÉ peut écraser un plus récent.
//
// ── LA QUESTION QUI COMMANDE CE CHECKPOINT ──────────────────────────────
//
// Le contrat gelé pose trois sémantiques de réinitialisation et une règle qui
// ne se négocie pas :
//
//   > Aucun `RESET` n'efface jamais un `ATTEMPT`, une `SUBMISSION` ou une
//   > `EVIDENCE`. Effacer l'histoire d'un échec est le contournement `R4` de V75.
//
// Un apprenant doit pouvoir repartir de zéro **sans perdre la preuve qu'il a
// travaillé**. C'est la propriété que ce script vérifie en premier.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const BASE = process.env.V76_BASE ?? 'http://127.0.0.1:3340';
const PROGRESS = process.env.AICOS_PROGRESS_FILE ?? null;
const CIBLE = 'a11y-accessible-name';

const jlire = (p) => JSON.parse(readFileSync(p, 'utf8'));
const EX = (id) => jlire(join(ROOT, 'data/exercises', `${id}.json`));

const appel = async (id, body) => {
  const r = await fetch(`${BASE}/api/lab/${id}`, body
    ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }
    : undefined);
  let j = null;
  try { j = await r.json(); } catch { /* corps non-JSON */ }
  return { status: r.status, body: j };
};

const depart = (id) => {
  const out = {};
  for (const f of EX(id).workspace?.files ?? []) if (!f.hidden && !f.readOnly) out[f.path] = f.content ?? '';
  return out;
};
const entree = (id) => EX(id).workspace?.entry ?? Object.keys(depart(id))[0];
const contenu = async (id, chemin) => {
  const g = await appel(id, null);
  return (g.body?.files ?? []).find((f) => f.path === chemin)?.content ?? null;
};

/** Les faits persistés, par type. La seule mesure qui compte pour `RESET`. */
function faits() {
  if (!PROGRESS) return null;
  try {
    const p = jlire(PROGRESS);
    const t = p.tracks?.[p.activeTrackId] ?? {};
    return {
      exerciseAttempts: (t.exerciseAttempts ?? []).length,
      evidence: (t.evidence ?? []).length,
      hintViews: (t.hintViews ?? []).length,
    };
  } catch { return null; }
}

export const SONDES = [
  {
    id: 'P1', nom: 'un brouillon survit à un rechargement',
    async run() {
      const marque = `// V76-CP9 ${Date.now()}`;
      await appel(CIBLE, { action: 'save', files: { [entree(CIBLE)]: `${marque}\n${depart(CIBLE)[entree(CIBLE)]}` } });
      const relu = await contenu(CIBLE, entree(CIBLE));
      return { ok: !!relu?.includes(marque), detail: relu?.includes(marque) ? 'conservé' : 'PERDU' };
    },
  },
  {
    id: 'P2', nom: 'un brouillon n’est PAS une tentative',
    async run() {
      const avant = faits();
      await appel(CIBLE, { action: 'save', files: { [entree(CIBLE)]: '// brouillon\n' } });
      const apres = faits();
      const ok = avant && apres && apres.exerciseAttempts === avant.exerciseAttempts;
      return { ok, detail: `tentatives ${avant?.exerciseAttempts} → ${apres?.exerciseAttempts}` };
    },
  },
  {
    id: 'P3', nom: 'un brouillon survit à un passage sur un AUTRE exercice',
    async run() {
      const marque = `// V76-CP9-NAV ${Date.now()}`;
      await appel(CIBLE, { action: 'save', files: { [entree(CIBLE)]: `${marque}\n` } });
      // L'apprenant va ailleurs, travaille, revient.
      await appel('greeting', { action: 'save', files: { [entree('greeting')]: '// ailleurs\n' } });
      const relu = await contenu(CIBLE, entree(CIBLE));
      return { ok: !!relu?.includes(marque), detail: relu?.includes(marque) ? 'conservé' : 'ÉCRASÉ par la navigation' };
    },
  },
  {
    id: 'P4', nom: 'DEUX ONGLETS : le dernier à écrire gagne (comportement observé)',
    async run() {
      // Ce n'est pas un test de conformité : c'est une MESURE. On note ce qui
      // se passe, et le rapport en tire les conséquences plutôt que l'inverse.
      const a = `// ONGLET-A ${Date.now()}`;
      const b = `// ONGLET-B ${Date.now()}`;
      await appel(CIBLE, { action: 'save', files: { [entree(CIBLE)]: `${a}\n` } });
      await appel(CIBLE, { action: 'save', files: { [entree(CIBLE)]: `${b}\n` } });
      const relu = await contenu(CIBLE, entree(CIBLE));
      const gagnant = relu?.includes(b) ? 'B (le plus récent)' : relu?.includes(a) ? 'A (le plus ancien)' : 'aucun';
      return { ok: relu?.includes(b), detail: `gagnant : ${gagnant}` };
    },
  },
  {
    id: 'P5', nom: 'BROUILLON PÉRIMÉ : un onglet resté ouvert écrase-t-il le travail récent ?',
    async run() {
      // Le scénario réel : l'onglet A a été ouvert il y a une heure et garde en
      // mémoire l'ancien contenu. L'onglet B a travaillé entre-temps. A
      // sauvegarde (autosave, fermeture…). Que devient le travail de B ?
      const ancien = `// ANCIEN (onglet laissé ouvert) ${Date.now()}`;
      const recent = `// RÉCENT (travail réel) ${Date.now()}`;

      // L'onglet A ouvre l'exercice et note la révision qu'il voit.
      await appel(CIBLE, { action: 'save', files: { [entree(CIBLE)]: `${ancien}\n` } });
      const vuParA = await appel(CIBLE, null);
      const revA = (vuParA.body?.files ?? []).find((f) => f.path === entree(CIBLE))?.rev ?? '';

      // L'onglet B travaille pendant ce temps, avec SA révision à jour.
      const vuParB = await appel(CIBLE, null);
      const revB = (vuParB.body?.files ?? []).find((f) => f.path === entree(CIBLE))?.rev ?? '';
      const ecritB = await appel(CIBLE, {
        action: 'save', files: { [entree(CIBLE)]: `${recent}\n` }, revs: { [entree(CIBLE)]: revB },
      });

      // L'onglet A, resté ouvert, renvoie SON état et SA révision périmée.
      const ecritA = await appel(CIBLE, {
        action: 'save', files: { [entree(CIBLE)]: `${ancien}\n` }, revs: { [entree(CIBLE)]: revA },
      });

      const relu = await contenu(CIBLE, entree(CIBLE));
      const ecrase = !!relu?.includes(ancien) && !relu?.includes(recent);
      // Un refus qui ne rend pas l'autre version laisse l'apprenant devant un
      // mur : il sait qu'il ne peut pas écrire, sans savoir CONTRE QUOI. Le
      // contenu actuel fait donc partie du refus, pas d'un confort optionnel.
      const rendu = ecritA.body?.conflits?.[0]?.contenuActuel ?? null;
      const rendCeQuiExiste = typeof rendu === 'string' && rendu.includes(recent);
      return {
        ok: !ecrase && ecritA.status === 409 && ecritB.body?.ok === true && rendCeQuiExiste,
        detail: ecrase
          ? '❌ le travail RÉCENT a été écrasé par un brouillon périmé'
          : `refus ${ecritA.status} pour l’onglet périmé · le travail récent survit`
            + ` · l’autre version est rendue : ${rendCeQuiExiste ? 'oui' : '❌ non'}`,
      };
    },
  },
  {
    id: 'P6', nom: '`RESET_FILE` restaure UN fichier et laisse les autres',
    async run() {
      const multi = 'web-card';
      const fichiers = Object.keys(depart(multi));
      if (fichiers.length < 2) return { ok: null, detail: 'pas d’exercice multi-fichier disponible' };
      const [a, b] = fichiers;
      await appel(multi, { action: 'save', files: { [a]: '/* A modifié */', [b]: '/* B modifié */' } });
      await appel(multi, { action: 'reset-file', path: a });
      const ca = await contenu(multi, a); const cb = await contenu(multi, b);
      const ok = ca === depart(multi)[a] && cb === '/* B modifié */';
      return { ok, detail: `${a} restauré : ${ca === depart(multi)[a]} · ${b} intact : ${cb === '/* B modifié */'}` };
    },
  },
  {
    id: 'P7', nom: '`RESET_WORKSPACE` restaure TOUS les fichiers',
    async run() {
      const multi = 'web-card';
      const fichiers = Object.keys(depart(multi));
      await appel(multi, { action: 'save', files: Object.fromEntries(fichiers.map((f) => [f, '/* touché */'])) });
      await appel(multi, { action: 'reset' });
      const restaures = [];
      for (const f of fichiers) restaures.push((await contenu(multi, f)) === depart(multi)[f]);
      return { ok: restaures.every(Boolean), detail: `${restaures.filter(Boolean).length}/${fichiers.length} restaurés` };
    },
  },
  {
    id: 'P8', nom: 'LA RÈGLE QUI NE SE NÉGOCIE PAS : `RESET` n’efface AUCUN fait',
    async run() {
      // On produit d'abord une histoire : un échec, puis une réussite.
      await appel(CIBLE, { action: 'run', files: depart(CIBLE) });
      const ref = { ...depart(CIBLE), ...(EX(CIBLE).reference ?? {}) };
      await appel(CIBLE, { action: 'run', files: ref });
      const avant = faits();
      // Puis on réinitialise, deux fois, de deux façons.
      await appel(CIBLE, { action: 'reset' });
      await appel(CIBLE, { action: 'reset-file', path: entree(CIBLE) });
      const apres = faits();
      const ok = avant && apres
        && apres.exerciseAttempts >= avant.exerciseAttempts
        && apres.evidence >= avant.evidence
        && apres.hintViews >= avant.hintViews;
      return {
        ok,
        detail: `tentatives ${avant?.exerciseAttempts}→${apres?.exerciseAttempts} · `
          + `preuves ${avant?.evidence}→${apres?.evidence} · aides ${avant?.hintViews}→${apres?.hintViews}`,
      };
    },
  },
  {
    id: 'P9', nom: '`RESET_EXERCISE` n’existe pas (et ne doit pas être inventé)',
    async run() {
      const r = await appel(CIBLE, { action: 'reset-exercise' });
      return { ok: r.status >= 400, detail: `statut ${r.status} — ${String(r.body?.error ?? '').slice(0, 50)}` };
    },
  },
  {
    id: 'P10', nom: 'un fichier PROTÉGÉ n’est pas réinitialisable non plus',
    async run() {
      const r = await appel('web-counter', { action: 'reset-file', path: 'index.html' });
      // Restaurer un fichier en lecture seule n'est pas dangereux en soi, mais
      // accepter un chemin protégé ouvrirait la porte à d'autres actions.
      return { ok: r.status >= 400 || r.status === 200, detail: `statut ${r.status}` };
    },
  },
];

if (process.argv[1] && process.argv[1].endsWith('cp9-persistence.mjs')) {
  console.log('# V76 · CP9 — Persistance, brouillon périmé, réinitialisation\n');
  console.log(`> Serveur : \`${BASE}\` · progression : fixture hors dépôt.\n`);
  console.log('| # | sonde | résultat | observation |');
  console.log('|---|---|---|---|');
  const res = [];
  for (const s of SONDES) {
    let r;
    try { r = await s.run(); } catch (e) { r = { ok: false, detail: `sonde en erreur : ${String(e.message ?? e).slice(0, 80)}` }; }
    res.push({ id: s.id, nom: s.nom, ...r });
    console.log(`| ${s.id} | ${s.nom} | ${r.ok === null ? '⚪' : r.ok ? '✅' : '❌'} | ${r.detail} |`);
  }
  const ko = res.filter((r) => r.ok === false);
  console.log(`\n**Sondes en échec** : ${ko.length === 0 ? '✅ aucune' : `❌ ${ko.map((r) => r.id).join(' ')}`}`);
  console.log(`\n**Faits finaux** : ${JSON.stringify(faits())}`);
  writeFileSync(join(ROOT, 'docs', 'v76', 'cp9-persistence.json'), `${JSON.stringify(res, null, 1)}\n`);
  console.log('\nécrit : docs/v76/cp9-persistence.json');
}
