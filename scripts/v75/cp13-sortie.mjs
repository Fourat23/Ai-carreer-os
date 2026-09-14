// V75 · CP13 — CONTRE-MESURE : LA SORTIE DE RÉCUPÉRATION EST-ELLE ATTEIGNABLE ?
//
// ── LE PROBLÈME QUE CE SCRIPT EXISTE POUR TRANCHER ──────────────────────
//
// La simulation principale trouve SEPT profils qui entrent en récupération et
// n'en ressortent jamais sur 365 jours : B · C · D · L · M · N · P.
//
// Deux lectures sont possibles, et elles n'ont pas du tout les mêmes
// conséquences :
//
//   1. **le moteur est un piège** — une fois entré, on ne peut plus sortir,
//      quoi qu'on fasse. C'est la pathologie n° 1 du brief, et elle serait
//      disqualifiante ;
//   2. **la dette est réelle** — ces profils sont des automates qui échouent à
//      55 % (C), à 70 % (L) ou n'ouvrent qu'un jour sur dix (D) **pendant un
//      an sans jamais changer de comportement**. Rester en récupération est
//      alors la description honnête de leur situation, et en sortir serait
//      précisément le « faire disparaître un échec » interdit par la §3.
//
// **On ne peut pas trancher en regardant les sept trajectoires**, parce
// qu'aucune ne contient de reprise. Il faut en fabriquer une.
//
// ── LA CONTRE-MESURE ────────────────────────────────────────────────────
//
// On greffe sur chaque profil bloqué une **reprise réelle** au jour 200 : à
// partir de ce jour, l'apprenant ouvre toutes ses journées, réussit à 97 %,
// produit des preuves et cesse de sauter la pratique. **Rien d'autre n'est
// modifié** — ni les seuils, ni le moteur, ni les 199 premiers jours, qui
// restent exactement ceux de la simulation principale.
//
// Puis on évalue le mode JOUR PAR JOUR après la reprise, et on mesure la seule
// chose qui compte : **au bout de combien de jours le mode redevient-il
// `NORMAL` ?**
//
//   · si la réponse est « jamais » pour tous → le moteur est un piège ;
//   · si la réponse est un nombre → la sortie existe, et son coût est mesuré.
//
// Une sortie IMMÉDIATE serait un défaut symétrique et tout aussi grave — elle
// voudrait dire qu'un seul bon jour efface une année de dette. Le CP6 l'interdit
// déjà par `E4` (deux jours actifs), et `tests/v75-recovery-mode.test.mjs` le
// vérifie ; ce script mesure ici le **coût réel** de la sortie, pas seulement
// sa possibilité.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PROFILS, simuler, DEBUT, DAY_MS } from './cp0-backlog.mjs';
import { etatAuJour, modeAuJour } from './cp13-adversarial.mjs';

const ROOT = process.cwd();
const BLOQUES = ['B', 'C', 'D', 'L', 'M', 'N', 'P'];
const REPRISE = 200;
const FIN = 365;

/**
 * Un profil identique au sien jusqu'au jour `reprise`, puis **réellement
 * repris**. Les drapeaux `preuve` / `sautePratique` / `corrigeAvant` sont lus
 * par le simulateur au moment de chaque tentative : on les expose en accesseurs
 * fermant sur le jour courant, que `ouvre` et `reussit` viennent de fixer. Le
 * simulateur n'est pas modifié.
 */
function repare(base, reprise) {
  let j = 0;
  return {
    id: `${base.id}→`,
    nom: `${base.nom} — reprise réelle au jour ${reprise}`,
    ouvre(d) { j = d; return d >= reprise ? true : base.ouvre(d); },
    reussit(c, d, a) { j = d; return d >= reprise ? a() < 0.97 : base.reussit(c, d, a); },
    get preuve() { return j >= reprise ? true : !!base.preuve; },
    get sautePratique() { return j >= reprise ? false : !!base.sautePratique; },
    get corrigeAvant() { return j >= reprise ? false : !!base.corrigeAvant; },
  };
}

const enRecup = (m) => m === 'RECOVERY' || m === 'CRITICAL';

/** Le mode, jour par jour, de la reprise à la fin du parcours. */
function apresLaReprise(profil, { reprise = REPRISE, fin = FIN, pas = 5 } = {}) {
  const faits = simuler(repare(profil, reprise), { avecFaits: true }).faits;
  const cache = new Map();
  const suite = [];
  for (let j = reprise; j <= fin; j += pas) {
    const e = etatAuJour(faits, j);
    cache.set(j, e);
    const m = modeAuJour(faits, j, cache);
    suite.push({
      j, mode: m.mode,
      total: e.triage.total,
      actif: e.triage.placement.actif,
      gare: e.triage.placement.gare,
      bloquantes: e.triage.pression.bloquantes,
      echecsNonRepris: e.triage.pression.echecsNonRepris,
      minutesRequises: e.triage.pression.minutesRequises,
      E1: m.sortie.E1, E2: m.sortie.E2, E3: m.sortie.E3, E4: m.sortie.E4,
      tenuParE4: m.tenuParE4,
    });
  }
  // ── LE GARAGE SE VIDE-T-IL ? ──
  //
  // La mesure principale trouve des séjours au garage de 210 à 315 jours. Elle
  // ne peut pas dire si c'est le moteur qui retient ou l'apprenant qui ne
  // revient pas. Ici, l'apprenant revient : on compare donc nominativement les
  // notions garées au jour de la reprise et celles encore garées à la fin.
  const gareesAuDepart = new Set(
    etatAuJour(faits, reprise).triage.notions.filter((n) => n.placement === 'gare').map((n) => n.id),
  );
  const etatFin = etatAuJour(faits, fin);
  const gareesALaFin = new Set(
    etatFin.triage.notions.filter((n) => n.placement === 'gare').map((n) => n.id),
  );
  const encoreGarees = [...gareesAuDepart].filter((id) => gareesALaFin.has(id));

  const depart = suite[0];
  const premierNormal = suite.find((p) => p.mode === 'NORMAL') ?? null;
  const premierHorsRecup = suite.find((p) => !enRecup(p.mode)) ?? null;
  return {
    id: profil.id, nom: profil.nom,
    modeAuDepart: depart?.mode ?? null,
    totalAuDepart: depart?.total ?? 0,
    bloquantesAuDepart: depart?.bloquantes ?? 0,
    /** Jours ACTIFS de reprise nécessaires pour quitter RECOVERY/CRITICAL. */
    joursPourQuitterRecup: premierHorsRecup ? premierHorsRecup.j - reprise : null,
    /** Jours nécessaires pour revenir tout à fait à `NORMAL`. */
    joursPourNormal: premierNormal ? premierNormal.j - reprise : null,
    modeFinal: suite.at(-1)?.mode ?? null,
    totalFinal: suite.at(-1)?.total ?? 0,
    /** La sortie n'a JAMAIS été immédiate : c'est ce que `E4` doit garantir. */
    sortieImmediate: premierHorsRecup ? premierHorsRecup.j === reprise : false,
    gareesAuDepart: gareesAuDepart.size,
    gareesALaFin: gareesALaFin.size,
    /** Garées au jour de la reprise ET encore garées à la fin : le garage bloqué. */
    encoreGarees: encoreGarees.length,
    suite,
  };
}

if (process.argv[1] && process.argv[1].endsWith('cp13-sortie.mjs')) {
  console.log('# V75 · CP13 — La sortie de récupération est-elle atteignable ?\n');
  console.log(`> Sept profils entrent en récupération et n’en sortent jamais sur 365 jours.`);
  console.log(`> Ce script leur greffe une **reprise réelle au jour ${REPRISE}** — 97 % de réussite,`);
  console.log('> toutes les journées ouvertes, preuves produites — et mesure au bout de combien');
  console.log('> de jours le mode redevient `NORMAL`. **Aucun seuil n’est modifié.**\n');

  const res = [];
  for (const id of BLOQUES) {
    const p = PROFILS.find((x) => x.id === id);
    res.push(apresLaReprise(p, { reprise: REPRISE, fin: FIN, pas: 5 }));
  }

  console.log('| # | profil | mode au jour 200 | arriéré au jour 200 | quitte RECOVERY après | redevient NORMAL après | mode au jour 365 | arriéré final |');
  console.log('|---|---|---|---|---|---|---|---|');
  for (const r of res) {
    console.log(`| ${r.id} | ${r.nom} | \`${r.modeAuDepart}\` | ${r.totalAuDepart} | ${r.joursPourQuitterRecup == null ? '**jamais**' : `**${r.joursPourQuitterRecup} j**`} | ${r.joursPourNormal == null ? '**jamais**' : `**${r.joursPourNormal} j**`} | \`${r.modeFinal}\` | ${r.totalFinal} |`);
  }

  const jamais = res.filter((r) => r.joursPourQuitterRecup == null);
  const immediates = res.filter((r) => r.sortieImmediate);

  console.log('\n## Verdict\n');
  console.log(`**Sortie impossible** : ${jamais.length === 0 ? '✅ aucun profil — la récupération n’est pas un piège' : `❌ ${jamais.map((r) => r.id).join(' ')}`}`);
  console.log(`**Sortie immédiate** (un seul bon jour suffirait) : ${immediates.length === 0 ? '✅ aucun profil — `E4` tient' : `❌ ${immediates.map((r) => r.id).join(' ')}`}`);

  const chiffres = res.map((r) => r.joursPourQuitterRecup).filter((x) => x != null);
  if (chiffres.length) {
    console.log(`\n**Coût de la sortie** : de ${Math.min(...chiffres)} à ${Math.max(...chiffres)} jours de reprise réelle.`);
  }

  console.log('\n## Le garage se vide-t-il ?\n');
  console.log('> La mesure principale trouve des séjours au garage de 210 à 315 jours. Elle ne');
  console.log('> peut pas dire si c’est le moteur qui retient ou l’apprenant qui ne revient pas.');
  console.log('> Ici l’apprenant revient — et on compare **nominativement** les notions.\n');
  console.log('| # | garées au jour 200 | garées au jour 365 | **encore les mêmes** | part libérée |');
  console.log('|---|---|---|---|---|');
  for (const r of res) {
    const part = r.gareesAuDepart ? Math.round((1 - r.encoreGarees / r.gareesAuDepart) * 100) : 100;
    console.log(`| ${r.id} | ${r.gareesAuDepart} | ${r.gareesALaFin} | **${r.encoreGarees}** | ${part} % |`);
  }
  const bloque = res.filter((r) => r.gareesAuDepart > 0 && r.encoreGarees === r.gareesAuDepart);
  console.log(`\n**Garage bloqué** (aucune notion libérée malgré la reprise) : ${bloque.length === 0 ? '✅ aucun profil' : `❌ ${bloque.map((r) => r.id).join(' ')}`}`);

  console.log('\n## Le détail, profil par profil\n');
  for (const r of res) {
    console.log(`### ${r.id} — ${r.nom}\n`);
    console.log('| jour | mode | total | actif | garé | bloq. | échecs | E1 | E2 | E3 | E4 |');
    console.log('|---|---|---|---|---|---|---|---|---|---|---|');
    for (const p of r.suite.filter((_, i) => i % 2 === 0 || _.mode === 'NORMAL')) {
      const t = (b) => (b ? '✅' : '·');
      console.log(`| ${p.j} | \`${p.mode}\` | ${p.total} | ${p.actif} | ${p.gare} | ${p.bloquantes} | ${p.echecsNonRepris} | ${t(p.E1)} | ${t(p.E2)} | ${t(p.E3)} | ${t(p.E4)} |`);
    }
    console.log('');
  }

  writeFileSync(join(ROOT, 'docs', 'v75', 'cp13-sortie.json'), `${JSON.stringify(res, null, 1)}\n`);
  console.log('écrit : docs/v75/cp13-sortie.json');

  if (jamais.length || immediates.length) process.exitCode = 1;
}

export { repare, apresLaReprise, DEBUT, DAY_MS };
