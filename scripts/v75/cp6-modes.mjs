// V75 · CP6 — LE MODE, MESURÉ SUR LES 20 PROFILS.
//
// ── LES DEUX QUESTIONS ───────────────────────────────────────────────────
//
//   1. **Le mode se déclenche-t-il quand il devrait ?** Un moteur de
//      récupération qui reste `NORMAL` pour l'apprenant à 30 % de réussite ne
//      sert à rien. C'est le sort qu'avait connu le facteur `besoinProche` du
//      CP0 (défaut P1) : présent, correct, jamais allumé.
//   2. **La récupération crée-t-elle des minutes ?** `propose.total` doit
//      rester ≤ `actuel.total` partout — critère BLOQUANT `V12`. Une
//      récupération qui rallonge la journée est le « rattrapage impossible »
//      que `R12` interdit.
//
// ── CE QUE CETTE MESURE NE FAIT PAS ─────────────────────────────────────
//
// Elle ne recalibre rien. Les seuils viennent du §3 du contrat, gelé au CP1,
// **avant** ces chiffres. S'ils s'avéraient mal placés, le §4 le dit : *« c'est
// le moteur qu'il faudra corriger, pas le seuil. »*
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PROFILS } from './cp0-backlog.mjs';
import { trierProfil } from './cp5-triage.mjs';
import { modeDe, arbitrerLaJournee, MODES } from '../../lib/recovery-mode.mjs';
import { CIBLE_REACTIVATION, BUDGET_JOURNEE } from '../../lib/daily-plan.mjs';

const ROOT = process.cwd();

/**
 * @param auJour instantané
 * @param charge charge de curriculum supposée de la journée, en minutes.
 *        **Déclarée ici, pas mesurée** : la charge réelle varie de 180 à 341
 *        min selon la journée (V74 · CP10) ; on prend une journée ordinaire
 *        pour que la comparaison entre profils porte sur le profil, pas sur le
 *        hasard du calendrier.
 */
export function modeProfil(profil, { auJour = 180, charge = 240 } = {}) {
  const t = trierProfil(profil, { auJour });
  // `pressionJourActifPrecedent` : on rejoue la veille du même parcours. C'est
  // exactement ce que fait le read-model serveur, et c'est ce qui rend `E4`
  // vérifiable sans rien persister.
  const hier = trierProfil(profil, { auJour: auJour - 1 });

  const m = modeDe(t.pression, {
    budget: CIBLE_REACTIVATION,
    pressionJourActifPrecedent: hier.pression,
  });
  const a = arbitrerLaJournee({
    mode: m.mode,
    chargeHaut: charge,
    minutesReactivation: CIBLE_REACTIVATION,
    pression: t.pression,
    budgetJournee: BUDGET_JOURNEE.haut,
  });

  return {
    id: profil.id,
    nom: profil.nom,
    mode: m.mode,
    regle: m.regle,
    phrase: m.phrase,
    sortieConfirmee: m.sortie.confirmee,
    pression: t.pression,
    total: t.total,
    actuel: a.actuel,
    propose: a.propose,
    ecart: a.ecart,
    transfert: a.transfert,
    projet: a.projet,
    choix: a.recommandation.choix.map((c) => c.id),
    impose: a.recommandation.impose,
    applique: a.propose.applique,
  };
}

if (process.argv[1] && process.argv[1].endsWith('cp6-modes.mjs')) {
  console.log('# V75 · CP6 — MODE DE RÉCUPÉRATION, 20 PROFILS (instantané jour 180)\n');
  console.log('> Les seuils viennent du §3 du contrat, **gelé avant ces chiffres**. Rien n’est');
  console.log('> recalibré ici : si un seuil est mal placé, le §4 dit que c’est le moteur qu’il');
  console.log('> faut corriger, pas le seuil.\n');

  const tous = PROFILS.map((p) => modeProfil(p));

  console.log('| # | profil | mode | règle | bloq. | échecs | minutes |');
  console.log('|---|---|---|---|---|---|---|');
  for (const r of tous) {
    console.log(`| ${r.id} | ${r.nom} | **${r.mode}** | ${r.regle} | ${r.pression.bloquantes} | ${r.pression.echecsNonRepris} | ${r.pression.minutesRequises} |`);
  }

  console.log('\n| # | mode | nouveau (actuel → proposé) | révision (actuel → proposé) | total | transfert | projet |');
  console.log('|---|---|---|---|---|---|---|');
  for (const r of tous) {
    console.log(`| ${r.id} | ${r.mode} | ${r.actuel.nouveau} → ${r.propose.nouveau} | ${r.actuel.revision} → ${r.propose.revision} | ${r.actuel.total} → ${r.propose.total} | ${r.transfert} | ${r.projet} |`);
  }

  const parMode = Object.fromEntries(MODES.map((m) => [m, tous.filter((r) => r.mode === m).map((r) => r.id)]));
  const creeDuTemps = tous.filter((r) => r.propose.total > r.actuel.total);
  const applique = tous.filter((r) => r.applique || r.impose);
  const sansChoix = tous.filter((r) => r.mode !== 'NORMAL' && !r.choix.includes('garder'));
  const muets = tous.filter((r) => !r.phrase);

  console.log('\n## Répartition\n');
  for (const m of MODES) {
    const ids = parMode[m];
    console.log(`**${m}** — ${ids.length}/20${ids.length ? ` : ${ids.join(' ')}` : ''}`);
  }

  console.log('\n## Invariants\n');
  console.log(`**V12 · la récupération ne crée JAMAIS de minutes** : ${creeDuTemps.length === 0 ? '✅ 20/20' : `❌ ${creeDuTemps.map((r) => r.id).join(' ')}`}`);
  console.log(`**Rien n’est appliqué ni imposé** : ${applique.length === 0 ? '✅ 20/20' : `❌ ${applique.map((r) => r.id).join(' ')}`}`);
  console.log(`**« Ne rien changer » toujours offert** : ${sansChoix.length === 0 ? '✅' : `❌ ${sansChoix.map((r) => r.id).join(' ')}`}`);
  console.log(`**Une phrase pour chaque décision** : ${muets.length === 0 ? '✅' : `❌ ${muets.map((r) => r.id).join(' ')}`}`);

  console.log('\n## Ce que l’apprenant lit\n');
  for (const r of tous.filter((x) => x.mode !== 'NORMAL').slice(0, 6)) {
    console.log(`· **${r.id}** — ${r.phrase}`);
  }

  writeFileSync(join(ROOT, 'docs', 'v75', 'cp6-modes.json'), `${JSON.stringify(tous, null, 1)}\n`);
  console.log('\nécrit : docs/v75/cp6-modes.json');
  if (creeDuTemps.length || applique.length || sansChoix.length || muets.length) process.exitCode = 1;
}
