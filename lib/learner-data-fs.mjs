// V77.1 · CP2 — SUPPRESSION ET ARCHIVAGE DES DONNÉES DE L'APPRENANT. I/O seule.
//
// Paramétré par racines, comme `workspace-fs.mjs` : le liant applicatif
// `learner-data-server.ts` fixe les racines réelles, les tests en passent des
// temporaires. La même fonction est donc exercée en test et en production —
// c'est la seule façon qu'un test de suppression prouve quelque chose.
//
// La DÉCISION (quoi supprimer, quoi épargner) vit dans `learner-data.mjs`.

import { existsSync, rmSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { planDeSuppression, violationsDuPlan } from './learner-data.mjs';

/** Compte les fichiers d'un répertoire, récursivement. 0 s'il n'existe pas. */
export function compterFichiers(chemin) {
  if (!existsSync(chemin)) return 0;
  let n = 0;
  const pile = [chemin];
  while (pile.length) {
    const p = pile.pop();
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) {
      let entrees = [];
      try { entrees = readdirSync(p); } catch { continue; }
      for (const e of entrees) pile.push(join(p, e));
    } else n += 1;
  }
  return n;
}

/**
 * L'état AVANT suppression, mesuré sur le disque. Sert au rapport rendu à
 * l'apprenant : on lui dit ce qui a été supprimé, pas « c'est fait ».
 */
export function inventaireDesDonnees(racines) {
  return planDeSuppression(racines).map((etape) => ({
    id: etape.id,
    chemin: etape.chemin,
    forme: etape.forme,
    present: existsSync(etape.chemin),
    fichiers: etape.forme === 'répertoire' ? compterFichiers(etape.chemin) : (existsSync(etape.chemin) ? 1 : 0),
  }));
}

/**
 * SUPPRESSION TOTALE. Aucun instantané de secours n'est créé : c'est la
 * différence de fond avec `RESET`, et elle est irréversible pour de vrai.
 *
 * Refuse plutôt que de deviner : si le garde-fou trouve la moindre violation,
 * RIEN n'est supprimé et les raisons sont rendues.
 *
 * @returns {{ok:boolean, violations:string[], supprime:object[]}}
 */
export function supprimerToutesLesDonnees(racines, racineProjet) {
  const plan = planDeSuppression(racines);
  const violations = violationsDuPlan(plan, racineProjet);
  if (violations.length) return { ok: false, violations, supprime: [] };

  const avant = inventaireDesDonnees(racines);
  const supprime = [];
  for (const etape of plan) {
    const etat = avant.find((a) => a.id === etape.id);
    let erreur = null;
    try {
      if (existsSync(etape.chemin)) rmSync(etape.chemin, { recursive: true, force: true });
    } catch (e) {
      erreur = e instanceof Error ? e.message : String(e);
    }
    supprime.push({
      id: etape.id,
      chemin: etape.chemin,
      etaitPresent: etat.present,
      fichiersSupprimes: erreur ? 0 : etat.fichiers,
      resteSurLeDisque: existsSync(etape.chemin),
      erreur,
    });
  }
  return { ok: supprime.every((s) => !s.resteSurLeDisque && !s.erreur), violations: [], supprime };
}

/** Tous les journaux de tentatives, par identifiant d'exercice. */
export function exporterTousLesJournaux(racineJournaux) {
  const out = {};
  if (!existsSync(racineJournaux)) return out;
  let entrees = [];
  try { entrees = readdirSync(racineJournaux); } catch { return out; }
  for (const e of entrees.sort()) {
    if (!e.endsWith('.json')) continue;
    try {
      const j = JSON.parse(readFileSync(join(racineJournaux, e), 'utf8'));
      if (Array.isArray(j)) out[e.replace(/\.json$/, '')] = j;
    } catch { /* un journal illisible n'empêche pas d'exporter les autres */ }
  }
  return out;
}

/** L'instantané de secours, s'il existe. `null` sinon. */
export function lireInstantane(chemin) {
  if (!existsSync(chemin)) return null;
  try { return JSON.parse(readFileSync(chemin, 'utf8')); } catch { return null; }
}
