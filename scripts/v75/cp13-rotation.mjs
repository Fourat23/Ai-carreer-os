// V75 · CP13 — CONTRE-MESURE : « JAMAIS PLACÉE EN ACTIF » EST-IL DE LA FAMINE ?
//
// ── L'ARTEFACT QU'IL FAUT ÉCARTER AVANT DE CONCLURE ─────────────────────
//
// La mesure principale échantillonne **un jour sur quinze**. Elle trouve, pour
// les profils les plus endettés, jusqu'à 63 notions « jamais placées en actif ».
//
// C'est un chiffre qu'il serait malhonnête de publier tel quel. La session
// active tient **8 notions** (`PLAFOND_UNITES`) ; en 24 instantanés on n'observe
// que 24 × 8 = 192 places, prises un jour sur quinze. Une notion travaillée le
// jour 97 et jamais aux jours 90 / 105 est comptée « jamais active » alors
// qu'elle a été proposée.
//
// **`jamaisActive` est donc une BORNE SUPÉRIEURE de la famine, pas la famine.**
//
// ── LA MESURE QUI TRANCHE ───────────────────────────────────────────────
//
// On rejoue la chaîne complète **jour par jour** sur une fenêtre de 30 jours,
// pour les trois profils les plus endettés, et on compte combien de notions
// DISTINCTES passent en actif. Deux réponses possibles :
//
//   · le moteur propose toujours les huit mêmes → **famine réelle** ;
//   · la sélection tourne → la capacité explique le chiffre, pas un oubli.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PROFILS, simuler } from './cp0-backlog.mjs';
import { etatAuJour } from './cp13-adversarial.mjs';

const ROOT = process.cwd();
const OBSERVES = ['C', 'L', 'M'];
const DEBUT_FENETRE = 200;
const JOURS = 30;

export function rotation(profil, { debut = DEBUT_FENETRE, jours = JOURS } = {}) {
  const faits = simuler(profil, { avecFaits: true }).faits;
  const distinctes = new Set();
  const enRetard = new Set();
  let places = 0;
  const parJour = [];
  for (let j = debut; j < debut + jours; j += 1) {
    const e = etatAuJour(faits, j);
    const actifs = e.triage.notions.filter((n) => n.placement === 'actif').map((n) => n.id);
    for (const id of actifs) distinctes.add(id);
    for (const n of e.triage.notions) enRetard.add(n.id);
    places += actifs.length;
    parJour.push({ j, actifs: actifs.length, total: e.triage.total });
  }
  return {
    id: profil.id, nom: profil.nom, debut, jours,
    placesOffertes: places,
    notionsDistinctesTravaillees: distinctes.size,
    notionsEnRetardSurLaFenetre: enRetard.size,
    /** 1 = la sélection tourne à chaque place ; proche de 0 = toujours les mêmes. */
    tauxDeRotation: places ? Number((distinctes.size / places).toFixed(2)) : 0,
    parJour,
  };
}

if (process.argv[1] && process.argv[1].endsWith('cp13-rotation.mjs')) {
  console.log('# V75 · CP13 — « jamais placée en actif » est-il de la famine ?\n');
  console.log(`> Chaîne complète rejouée **jour par jour** sur ${JOURS} jours (à partir du jour`);
  console.log(`> ${DEBUT_FENETRE}), pour les trois profils les plus endettés. La question : le moteur`);
  console.log('> propose-t-il toujours les huit mêmes notions, ou la sélection tourne-t-elle ?\n');

  const res = OBSERVES.map((id) => rotation(PROFILS.find((p) => p.id === id)));
  console.log('| # | profil | notions en retard sur la fenêtre | places offertes (8 × 30) | notions DISTINCTES travaillées | rotation |');
  console.log('|---|---|---|---|---|---|');
  for (const r of res) {
    console.log(`| ${r.id} | ${r.nom} | ${r.notionsEnRetardSurLaFenetre} | ${r.placesOffertes} | **${r.notionsDistinctesTravaillees}** | ${r.tauxDeRotation} |`);
  }
  const figes = res.filter((r) => r.notionsDistinctesTravaillees <= 12);
  console.log(`\n**Sélection figée** (≤ 12 notions distinctes en 30 jours) : ${figes.length === 0 ? '✅ aucun profil — la sélection tourne' : `❌ ${figes.map((r) => r.id).join(' ')}`}`);

  writeFileSync(join(ROOT, 'docs', 'v75', 'cp13-rotation.json'), `${JSON.stringify(res, null, 1)}\n`);
  console.log('\nécrit : docs/v75/cp13-rotation.json');
  if (figes.length) process.exitCode = 1;
}
