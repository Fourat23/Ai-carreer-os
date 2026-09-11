// V75 · CP7 — LE PLAN DE RATTRAPAGE, MESURÉ SUR LES 20 PROFILS.
//
// ── LA QUESTION HONNÊTE ──────────────────────────────────────────────────
//
// Pas « le plan est-il joli », mais : **que voit réellement l'apprenant qui a
// 91 notions en retard ?** Le CP0 a mesuré ces profils-là ; c'est sur eux que
// la forme du plan se juge.
//
// Trois chiffres décident, et le troisième est le plus important :
//
//   1. **combien de journées** le plan propose (borné à `HORIZON_PLAN`) ;
//   2. **combien de notions** il couvre, et combien il laisse — les deux, sans
//      quoi c'est soit un mur, soit une dette cachée ;
//   3. **combien de journées de travail pour que TOUT repasse une fois.** Si ce
//      nombre est absurde (des mois), le plan est un rattrapage impossible
//      (`R12`) et il faut le dire plutôt que l'afficher joliment.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PROFILS } from './cp0-backlog.mjs';
import { modeProfil } from './cp6-modes.mjs';
import { trierProfil } from './cp5-triage.mjs';
import { planDeRattrapage, HORIZON_PLAN } from '../../lib/catchup-plan.mjs';
import { PLAFOND_UNITES } from '../../lib/retention-scheduler.mjs';

const ROOT = process.cwd();

export function rattrapageProfil(profil, { auJour = 180 } = {}) {
  const t = trierProfil(profil, { auJour });
  const m = modeProfil(profil, { auJour });

  const plan = planDeRattrapage({
    notions: t.notions,
    // Les minutes PROPOSÉES par le mode du CP6 — c'est ce que la page affiche.
    minutesParJour: m.propose.revision,
    unitesParJour: PLAFOND_UNITES,
    horizon: HORIZON_PLAN,
    now: '2026-01-05T08:00:00.000Z',
  });

  return {
    id: profil.id, nom: profil.nom, mode: m.mode,
    total: plan.total, garees: plan.garees,
    minutesParJour: m.propose.revision,
    journeesProposees: plan.jours.length,
    couvertes: plan.couvertes, restantes: plan.restantes,
    rythme: plan.rythme,
    couvertureJours: plan.couverture.jours,
    phrase: plan.couverture.phrase,
    minutesMax: plan.jours.length ? Math.max(...plan.jours.map((j) => j.minutes)) : 0,
    somme: plan.couvertes + plan.restantes + plan.garees,
  };
}

if (process.argv[1] && process.argv[1].endsWith('cp7-rattrapage.mjs')) {
  console.log('# V75 · CP7 — PLAN DE RATTRAPAGE, 20 PROFILS (instantané jour 180)\n');
  console.log('> **Le plan ne fait pas baisser l’arriéré.** `total` est celui du CP5. Ce qu’il');
  console.log('> change, c’est qu’une semaine de travail est proposée au lieu d’une liste de');
  console.log('> 91 lignes — et que ce qu’elle ne couvre pas est dit dans la même phrase.\n');

  const tous = PROFILS.map((p) => rattrapageProfil(p));

  console.log('| # | profil | mode | total | journées | couvertes | restantes | garées | min/jour | I2 |');
  console.log('|---|---|---|---|---|---|---|---|---|---|');
  for (const r of tous) {
    console.log(`| ${r.id} | ${r.nom} | ${r.mode} | **${r.total}** | ${r.journeesProposees} | ${r.couvertes} | ${r.restantes} | ${r.garees} | ${r.minutesParJour} | ${r.somme === r.total ? '✅' : '❌'} |`);
  }

  console.log('\n## Combien de journées pour que TOUT repasse une fois\n');
  console.log('> Un **débit**, jamais une promesse de maîtrise (`R10`).\n');
  console.log('| # | notions planifiables | rythme/jour | journées de travail |');
  console.log('|---|---|---|---|');
  for (const r of tous.filter((x) => x.total > 0)) {
    console.log(`| ${r.id} | ${r.total - r.garees} | ${r.rythme} | ${r.couvertureJours == null ? '—' : `**${r.couvertureJours}**`} |`);
  }

  // ── LA GARDE CONTRE UNE MESURE VIDE ──
  //
  // La première version de ce script a rendu **zéro pour les vingt profils** —
  // `trierProfil` ne renvoyait pas les notions — et a affiché « invariants
  // ✅ 20/20 ». Une mesure faite sur rien valide tout. On refuse donc
  // explicitement de conclure quand il n'y a rien à mesurer.
  const matiere = tous.filter((r) => r.total > 0).length;
  if (matiere === 0) {
    console.error('\n❌ MESURE VIDE : aucun profil n’a de notion en retard. Le CP5 en compte.');
    console.error('   Un invariant vérifié sur zéro élément ne prouve rien. Sonde à corriger.');
    process.exitCode = 1;
  }

  const viole = tous.filter((r) => r.somme !== r.total);
  const trop = tous.filter((r) => r.journeesProposees > HORIZON_PLAN);
  const muets = tous.filter((r) => r.total > 0 && !r.phrase);
  const longs = tous.filter((r) => (r.couvertureJours ?? 0) > 30);
  const avecReste = tous.filter((r) => r.restantes > 0);

  console.log('\n## Invariants\n');
  console.log(`**Rien ne disparaît (couvertes + restantes + garées = total)** : ${tous.length - viole.length}/${tous.length}${viole.length ? ` — ÉCHECS ${viole.map((r) => r.id).join(' ')}` : ''}`);
  console.log(`**Plan borné à ${HORIZON_PLAN} journées** : ${trop.length === 0 ? '✅' : `❌ ${trop.map((r) => r.id).join(' ')}`}`);
  console.log(`**Une phrase de couverture partout** : ${muets.length === 0 ? '✅' : `❌ ${muets.map((r) => r.id).join(' ')}`}`);
  console.log(`**Profils dont le plan laisse un reste** : ${avecReste.length}/${tous.length} — et pour chacun le reste est AFFICHÉ, pas tu.`);
  console.log(`\n**Profils à qui il faudrait plus de 30 journées de travail** : ${longs.length === 0 ? 'aucun' : longs.map((r) => `${r.id} (${r.couvertureJours} j)`).join(' · ')}`);
  if (longs.length) {
    console.log('> C’est une mesure, pas un objectif atteint. Ces apprenants ne reviennent pas');
    console.log('> sous contrôle en une semaine, et le produit ne prétend pas le contraire :');
    console.log('> il montre la semaine qu’il peut organiser, et dit ce qui reste derrière.');
  }

  writeFileSync(join(ROOT, 'docs', 'v75', 'cp7-rattrapage.json'), `${JSON.stringify(tous, null, 1)}\n`);
  console.log('\nécrit : docs/v75/cp7-rattrapage.json');
  if (viole.length || trop.length || muets.length) process.exitCode = 1;
}
